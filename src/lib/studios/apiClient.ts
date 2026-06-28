/**
 * Unified API client — standalone submit-and-poll for studio jobs.
 *
 * Inspired by Open-Generative-AI's muapi.js: every AI generation follows
 * the same two-step pattern:
 *   1. POST to an endpoint → get a job ID
 *   2. Poll a status endpoint until done or failed
 *
 * This module decouples the network logic from React so it can be tested,
 * called from workflows, or used outside the Shell component.
 */
import type { OutputKind } from './types';

/**
 * Attach the user's BYOK keys (from the Connectors page) as per-request headers.
 * The Muapi gateway key powers image/video/lip-sync generation. Keys live only
 * in the browser and are forwarded per-request — never persisted server-side.
 */
function byokHeaders(): Record<string, string> {
  try {
    const keys = JSON.parse(localStorage.getItem('dropkast_byok_keys') || '{}');
    const h: Record<string, string> = {};
    if (keys.MUAPI_API_KEY) h['x-muapi-key'] = keys.MUAPI_API_KEY;
    return h;
  } catch {
    return {};
  }
}

export interface SubmitResult {
  /** The job identifier returned by the endpoint */
  id: string;
  /** Raw response data — normalized by normalizeOutput() */
  data: any;
  /** Already-normalized output suitable for StudioOutput */
  output: NormalizedOutput;
}

export interface NormalizedOutput {
  url?: string;
  urls?: string[];
  text?: string;
  data?: any;
  thumbnailUrl?: string;
}

export interface PollOptions {
  /** Milliseconds between polls (default: 2500) */
  intervalMs?: number;
  /** Max poll attempts (default: 120 = 5 min at 2.5s) */
  maxAttempts?: number;
  /** AbortSignal to cancel polling externally */
  signal?: AbortSignal;
}

export interface SubmitOptions {
  /** AbortSignal to cancel the initial POST */
  signal?: AbortSignal;
}

/**
 * Submit a job to a studio endpoint and, if async, poll until completion.
 *
 * Sync endpoints: returns the response body immediately.
 * Async endpoints: POST returns { id }, then polls pollEndpoint until done.
 */
export async function submitJob(
  endpoint: string,
  body: Record<string, any>,
  outputKind: OutputKind,
  opts?: {
    async?: boolean;
    pollEndpoint?: string;
    poll?: PollOptions;
    submit?: SubmitOptions;
  },
): Promise<SubmitResult> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...byokHeaders() },
    body: JSON.stringify(body),
    signal: opts?.submit?.signal,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200) || res.statusText}`);
  }

  const data = await res.json();

  // Sync studio — response is the final output
  if (!opts?.async) {
    return {
      id: data.id || `sync-${Date.now()}`,
      data,
      output: normalizeOutput(data, outputKind),
    };
  }

  // Async studio — data.id is the remote job id
  const remoteId = data.id || data.request_id;
  if (!remoteId) {
    throw new Error('Async endpoint did not return a job id');
  }

  const pollUrl = opts.pollEndpoint?.replace('{id}', remoteId);
  if (!pollUrl) {
    throw new Error('Async studio requires pollEndpoint');
  }

  const pollResult = await pollJob(pollUrl, opts.poll);
  return {
    id: remoteId,
    data: pollResult,
    output: normalizeOutput(pollResult, outputKind),
  };
}

/**
 * Poll a status endpoint until the job completes or fails.
 * Throws on failure or timeout.
 */
export async function pollJob(
  pollUrl: string,
  opts?: PollOptions,
): Promise<any> {
  const intervalMs = opts?.intervalMs ?? 2500;
  const maxAttempts = opts?.maxAttempts ?? 120;
  const signal = opts?.signal;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError');

    await sleep(intervalMs);

    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError');

    try {
      const res = await fetch(pollUrl, { signal });
      if (!res.ok) continue;

      const data = await res.json();

      if (data.status === 'done' || data.status === 'completed' || data.status === 'succeeded') {
        return data;
      }
      if (data.status === 'failed' || data.status === 'error') {
        throw new Error(data.error || 'Generation failed');
      }
      // still processing — keep polling
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      // network blip — retry
    }
  }

  throw new Error('Polling timed out');
}

/**
 * Normalize endpoint responses into a consistent output shape.
 * Handles the various response formats from DROPKAST endpoints.
 */
export function normalizeOutput(data: any, kind: OutputKind): NormalizedOutput {
  if (!data) return {};

  // Multi-image: { images: [{ url }, ...] }
  if (data.images && Array.isArray(data.images)) {
    return { urls: data.images.map((i: any) => i.url || i) };
  }

  // Single image/video: { url, thumbnailUrl, status }
  if (data.url && (kind === 'video' || kind === 'image')) {
    return { url: data.url, thumbnailUrl: data.thumbnailUrl || data.url };
  }

  // ANR critique: { score, critique, summary }
  if (data.score !== undefined && data.critique) {
    return { data, text: data.critique };
  }

  // UGC: { ideas: [{title, script, caption}] }
  if (data.ideas) {
    return { data: data.ideas, text: JSON.stringify(data.ideas, null, 2) };
  }

  // Promo/press: { assets: [...] }
  if (data.assets) {
    return { data: data.assets };
  }

  // Chat-style: { text } or { message }
  if (data.text) return { text: data.text };
  if (data.message) return { text: data.message };

  // Fallback — store raw data
  return { data };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
