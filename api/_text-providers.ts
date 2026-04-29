/**
 * Multi-provider text/chat adapter.
 *
 * Anthropic Claude is the primary path (rich features: streaming + tool use
 * + prompt caching). The other providers are OpenAI-compatible and exposed
 * for free-tier fallback / cost optimization.
 *
 * The adapter exposes:
 *   - listAvailableTextProviders() → which providers have keys configured
 *   - streamOpenAICompatible(provider, body) → SSE stream of token chunks
 *
 * Tool use is NOT supported on the OpenAI-compatible providers (they require
 * separate function-calling protocols). Use Claude (Anthropic) for tool use.
 */

export type TextProviderId = 'anthropic' | 'nvidia' | 'groq' | 'cerebras' | 'openrouter' | 'moonshot' | 'openai' | 'google';

interface ProviderConfig {
  id: TextProviderId;
  name: string;
  envVar: string;
  baseUrl: string;
  defaultModel: string;
}

const CONFIG: Record<TextProviderId, ProviderConfig> = {
  anthropic: {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    envVar: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-6',
  },
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    envVar: 'NVIDIA_API_KEY',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'meta/llama-3.3-70b-instruct',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    envVar: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    envVar: 'CEREBRAS_API_KEY',
    baseUrl: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    envVar: 'OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
  },
  moonshot: {
    id: 'moonshot',
    name: 'Moonshot Kimi K2.6',
    envVar: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.ai/v1',
    defaultModel: 'moonshot-v1-128k',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT-5',
    envVar: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-5',
  },
  google: {
    id: 'google',
    name: 'Google Gemini 2.5 Pro',
    envVar: 'GOOGLE_API_KEY',
    // Gemini's OpenAI-compatible endpoint (drop-in for OpenAI SDK)
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-2.5-pro',
  },
};

export function listAvailableTextProviders(): { id: TextProviderId; name: string; configured: boolean; defaultModel: string }[] {
  return Object.values(CONFIG).map((c) => ({
    id: c.id,
    name: c.name,
    configured: Boolean(process.env[c.envVar]),
    defaultModel: c.defaultModel,
  }));
}

/**
 * Streams an OpenAI-compatible chat completion as Server-Sent Events from
 * the provider, yielding `{ token: string }` for each text delta and
 * `{ done: true }` at end of stream.
 *
 * Anthropic is NOT handled here — use the Anthropic SDK directly. For
 * `provider === 'anthropic'`, this throws.
 */
export async function* streamOpenAICompatible(
  provider: TextProviderId,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  opts?: { model?: string; max_tokens?: number; temperature?: number },
): AsyncGenerator<{ token?: string; done?: boolean; error?: string }> {
  if (provider === 'anthropic') {
    throw new Error('Use the Anthropic SDK directly for the anthropic provider.');
  }
  const cfg = CONFIG[provider];
  const apiKey = process.env[cfg.envVar];
  if (!apiKey) {
    yield { error: `${cfg.name} not configured. Set ${cfg.envVar} in your env.` };
    return;
  }

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts?.model || cfg.defaultModel,
      messages,
      stream: true,
      max_tokens: opts?.max_tokens ?? 1024,
      temperature: opts?.temperature ?? 0.7,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => 'unknown');
    yield { error: `${cfg.name} request failed (${res.status}): ${errText.slice(0, 200)}` };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        yield { done: true };
        return;
      }
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          yield { token: delta };
        }
      } catch {
        // ignore malformed chunks
      }
    }
  }
  yield { done: true };
}
