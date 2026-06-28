/**
 * Muapi.ai gateway client (server-side).
 *
 * Faithful port of open-generative-ai's muapi.js two-step pattern:
 *   1. POST  https://api.muapi.ai/api/v1/{endpoint}   (x-api-key header)  → { request_id }
 *   2. GET   https://api.muapi.ai/api/v1/predictions/{request_id}/result  → poll until
 *      status ∈ {completed, succeeded, success}; output at outputs[0] | url | output.url
 *
 * BYOK: the key is passed per-request from the caller (the user's key from the
 * Connectors page, forwarded in the `x-muapi-key` header). It is NEVER stored
 * server-side or merged into process.env — same isolation rule the audit set
 * for _ai-chat.ts.
 */

const MUAPI_BASE = 'https://api.muapi.ai';

export interface MuapiParams {
  prompt: string;
  aspect_ratio?: string;
  resolution?: string;
  quality?: string;
  duration?: number;
  image_url?: string;
  images_list?: string[];
  audio_url?: string;
  seed?: number;
  [k: string]: unknown;
}

export class MuapiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'MuapiError';
    this.status = status;
  }
}

function extractOutputs(result: any): string[] {
  if (!result) return [];
  if (Array.isArray(result.outputs) && result.outputs.length) {
    return result.outputs.map((o: any) => (typeof o === 'string' ? o : o?.url)).filter(Boolean);
  }
  if (result.url) return [result.url];
  if (result.output?.url) return [result.output.url];
  if (Array.isArray(result.images)) return result.images.map((i: any) => i?.url || i).filter(Boolean);
  return [];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Run one Muapi generation end-to-end (submit + poll) and return output URLs.
 * @param endpoint  the Muapi model endpoint slug (e.g. "flux-pro", "kling-video")
 * @param params    generation params (prompt + model-specific knobs)
 * @param apiKey    the user's Muapi key (BYOK), forwarded per-request
 */
export async function runMuapi(
  endpoint: string,
  params: MuapiParams,
  apiKey: string,
  opts?: { intervalMs?: number; maxAttempts?: number; signal?: AbortSignal },
): Promise<{ outputs: string[]; raw: any }> {
  if (!apiKey) throw new MuapiError('No Muapi key. Add your key in Connectors to enable generation.', 401);
  if (!endpoint) throw new MuapiError('No model endpoint specified for this generation.', 400);

  const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };

  // 1) submit
  const submit = await fetch(`${MUAPI_BASE}/api/v1/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
    signal: opts?.signal,
  });
  if (!submit.ok) {
    const body = await submit.text().catch(() => '');
    throw new MuapiError(`Muapi submit failed (${submit.status}): ${body.slice(0, 200)}`, submit.status === 401 ? 401 : 502);
  }
  const submitData: any = await submit.json();
  const requestId = submitData.request_id || submitData.id;

  // Some endpoints are synchronous and return outputs immediately.
  const immediate = extractOutputs(submitData);
  if (immediate.length) return { outputs: immediate, raw: submitData };
  if (!requestId) throw new MuapiError('Muapi did not return a request_id', 502);

  // 2) poll
  const intervalMs = opts?.intervalMs ?? 2500;
  const maxAttempts = opts?.maxAttempts ?? 120; // ~5 min
  for (let i = 0; i < maxAttempts; i++) {
    if (opts?.signal?.aborted) throw new MuapiError('Generation aborted', 499);
    await sleep(intervalMs);
    const poll = await fetch(`${MUAPI_BASE}/api/v1/predictions/${requestId}/result`, { headers, signal: opts?.signal });
    if (!poll.ok) continue; // transient — keep polling
    const data: any = await poll.json();
    const status = String(data.status || '').toLowerCase();
    if (status === 'completed' || status === 'succeeded' || status === 'success') {
      return { outputs: extractOutputs(data), raw: data };
    }
    if (status === 'failed' || status === 'error') {
      throw new MuapiError(data.error || 'Muapi generation failed', 502);
    }
    // still processing
  }
  throw new MuapiError('Muapi generation timed out', 504);
}

/**
 * Resolve the Muapi key for a request.
 * Priority: the user's BYOK key (x-muapi-key header) → the platform key
 * (process.env.MUAPI_API_KEY). The user key is per-request only and never
 * persisted; the platform key lets generation work out-of-the-box.
 */
export function muapiKeyFromReq(req: { header: (n: string) => string | undefined }): string {
  const userKey = (req.header('x-muapi-key') || '').trim();
  return userKey || (process.env.MUAPI_API_KEY || '').trim();
}
