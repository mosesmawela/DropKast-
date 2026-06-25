/**
 * Streaming AI chat endpoint with tool use.
 *
 * The model can call tools to read the artist's actual data:
 *   - get_my_releases
 *   - get_release_analytics
 *   - get_active_campaigns
 *   - get_influencers
 *   - get_anr_submissions
 *
 * Output is streamed as Server-Sent Events with three event types:
 *   event: token      → text chunk
 *   event: tool_call  → name + input (UX: show "calling X...")
 *   event: tool_result → name + result preview (debug)
 *   event: done       → final
 *   event: error      → message
 */
import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { store } from './_store.js';
import { isOverBudget, recordUsage } from './_ai-budget.js';
import { streamOpenAICompatible, PROVIDER_TIMEOUT_MS, FALLBACK_ORDER, listAvailableTextProviders, CONFIG_FOR_PROVIDER, type TextProviderId } from './_text-providers.js';
import { getPersona, type PersonaId } from '../src/lib/ai-personas.js';
import { recordFailure, recordSuccess, isOnCooldown } from './_cooldown.js';

const SONNET = 'claude-sonnet-4-6';

// System prompt comes from the persona library so it can be swapped per
// section (chat assistant, A&R, viral, etc.) and updated from one place.
const DEFAULT_PERSONA: PersonaId = 'assistant';

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_my_releases',
    description: 'List all releases owned by the current artist. Returns id, title, artist, status, platforms.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_release_analytics',
    description: 'Get plays/clicks/influencer-posts/total-reach for a specific release.',
    input_schema: {
      type: 'object' as const,
      properties: { releaseId: { type: 'string', description: 'The release ID, e.g. REL-12345' } },
      required: ['releaseId'],
    },
  },
  {
    name: 'get_active_campaigns',
    description: 'List active marketing campaigns with their goals, budgets, and current plan steps.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_influencers',
    description: 'List the verified influencer roster with reach, platform, genre, match score.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_anr_submissions',
    description: 'List the user\'s recent A&R submissions and their critique status.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_my_releases': {
      const r = await store.listReleases();
      return r.map((rel: any) => ({
        id: rel.id,
        title: rel.title,
        artist: rel.artist,
        status: rel.status,
        platforms: (rel.platforms ?? []).map((p: any) => ({ name: p.name, status: p.status })),
        createdAt: rel.createdAt,
      }));
    }
    case 'get_release_analytics': {
      const releaseId = String(input.releaseId);
      const events = await store.listAnalyticsEvents(releaseId);
      return {
        releaseId,
        plays: events.filter((e: any) => e.type === 'play').length,
        clicks: events.filter((e: any) => e.type === 'click').length,
        influencerPosts: events.filter((e: any) => e.type === 'influencer_post').length,
        totalReach: events.reduce((acc: number, e: any) => acc + (e.value || 0), 0),
        sampleEvents: events.slice(-5),
      };
    }
    case 'get_active_campaigns': {
      const c = await store.listCampaigns();
      return c.filter((x: any) => x.status === 'active' || x.status === 'draft');
    }
    case 'get_influencers': {
      return store.listInfluencers();
    }
    case 'get_anr_submissions': {
      const subs = await store.listAnrSubmissions();
      return subs.map((s: any) => ({
        id: s.id,
        trackTitle: s.trackTitle,
        status: s.status,
        score: s.critique?.score ?? null,
      }));
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function handleAiChat(req: Request, res: Response): Promise<void> {
  const { message, provider, persona, apiKeys } = req.body as { message: string; provider?: TextProviderId; persona?: PersonaId; apiKeys?: Record<string, string> };
  const userId = req.userId; // From auth middleware
  const personaId: PersonaId = persona ?? DEFAULT_PERSONA;
  const personaObj = getPersona(personaId);
  const SYSTEM_PROMPT = personaObj.systemPrompt;

  // Merge user-provided keys into env for this request
  if (apiKeys) {
    for (const [key, value] of Object.entries(apiKeys)) {
      if (value) process.env[key] = value;
    }
  }

  // Determine provider: use explicit provider, or first available from fallback order
  const available = listAvailableTextProviders(apiKeys).filter(p => p.configured).map(p => p.id);
  const chosenProvider: TextProviderId = provider ?? available[0] ?? 'anthropic';

  // If no providers configured at all, return helpful error
  if (available.length === 0) {
    res.status(503).json({
      error: 'No AI providers configured',
      message: 'Add at least one API key: ANTHROPIC_API_KEY, GROQ_API_KEY, NVIDIA_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY, MOONSHOT_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY',
    });
    return;
  }
  if (!message) {
    res.status(400).json({ error: 'message required' });
    return;
  }

  // SSE setup is shared for both code paths.
  const initSSE = () => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
  };
  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Check if chosen provider is anthropic and configured
  const isAnthropic = chosenProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY;
  const availableProviders = listAvailableTextProviders(apiKeys).filter(p => p.configured).map(p => p.id);
  
  // Cost guardrail: refuse if user is over their daily AI budget (applies to all providers)
  const budget = await isOverBudget(userId);
  if (budget.over) {
    res.status(429).json({
      error: 'AI budget exceeded',
      message: `Daily AI budget of $${(budget.budgetCents / 100).toFixed(2)} reached. Resets at midnight UTC.`,
      spent_cents: budget.spentCents,
      budget_cents: budget.budgetCents,
    });
    return;
  }

  // ---- OpenAI-compatible providers (NVIDIA / Groq / Cerebras / OpenRouter / Moonshot / OpenAI / Google)
  // These don't support tool use through this adapter — plain chat only.
  // Automatic rotation: if the chosen provider fails, fall through FALLBACK_ORDER.
  if (!isAnthropic) {
    initSSE();
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ];

    // Build the probe order: chosen provider first, then remaining fallbacks.
    const probeOrder = [chosenProvider, ...FALLBACK_ORDER.filter((p) => p !== chosenProvider && p !== 'anthropic')];
    const errors: string[] = [];
    let servedBy: TextProviderId | null = null;

    for (const pid of probeOrder) {
      const cfg = listAvailableTextProviders(apiKeys).find((p: { id: TextProviderId }) => p.id === pid);
      if (!cfg?.configured) {
        errors.push(`${pid}: skipped (no key)`);
        continue;
      }
      const providerCfg = CONFIG_FOR_PROVIDER[pid];
      const host = providerCfg ? new URL(providerCfg.baseUrl).hostname : pid;
      if (isOnCooldown(host)) {
        errors.push(`${pid}: skipped (on cooldown)`);
        continue;
      }
      const providerKey = apiKeys?.[providerCfg?.envVar ?? ''];
      try {
        let hasContent = false;
        for await (const chunk of streamOpenAICompatible(pid, messages, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS), apiKey: providerKey })) {
          if (chunk.error) {
            errors.push(`${pid}: ${chunk.error}`);
            hasContent = false;
            break;
          }
          hasContent = true;
          if (chunk.token) send('token', { text: chunk.token });
          if (chunk.done) {
            servedBy = chunk.provider ?? pid;
            break;
          }
        }
        if (servedBy) {
          recordSuccess(host);
          send('done', { ok: true, provider: servedBy, fallbacks: errors });
          res.end();
          return;
        }
        recordFailure(host);
      } catch (err: any) {
        recordFailure(host);
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          errors.push(`${pid}: timed out after ${PROVIDER_TIMEOUT_MS}ms`);
        } else {
          errors.push(`${pid}: ${err.message ?? err}`);
        }
      }
    }

    // All OpenAI-compatible providers failed - try Anthropic as last resort if configured
    if (process.env.ANTHROPIC_API_KEY) {
      // Fall through to anthropic path
    } else {
      send('error', {
        message: 'All AI providers failed. Check your API keys.',
        details: errors,
      });
      send('done', { ok: false, errors });
      res.end();
      return;
    }
  }

  // ---- Anthropic path: streaming + tool use + prompt caching (only if anthropic key exists)
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({
      error: 'No AI providers available',
      message: 'All configured providers failed and Anthropic is not configured.',
    });
    return;
  }
  initSSE();

  const anthropicHost = 'api.anthropic.com';
  if (isOnCooldown(anthropicHost)) {
    send('error', { message: 'Anthropic is temporarily on cooldown after repeated failures. Try again shortly.' });
    send('done', { ok: false });
    res.end();
    return;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const conversation: Anthropic.MessageParam[] = [{ role: 'user', content: message }];

  try {
    // Agent loop: stream → if tool_use blocks emitted, run tools, continue.
    for (let turn = 0; turn < 6; turn++) {
      let assistantBlocks: Anthropic.ContentBlock[] = [];
      let stopReason: string | null = null;

      const stream = await client.messages.stream({
        model: SONNET,
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: TOOLS,
        messages: conversation,
      });

      for await (const evt of stream) {
        if (evt.type === 'content_block_delta' && evt.delta.type === 'text_delta') {
          send('token', { text: evt.delta.text });
        }
      }

      const finalMsg = await stream.finalMessage();
      assistantBlocks = finalMsg.content;
      stopReason = finalMsg.stop_reason;

      // Track token usage for the budget guardrail.
      const usage = finalMsg.usage;
      if (usage) {
        await recordUsage(userId, {
          model: 'sonnet',
          inputTokens: usage.input_tokens ?? 0,
          cachedReadTokens: (usage as any).cache_read_input_tokens ?? 0,
          outputTokens: usage.output_tokens ?? 0,
        });
      }

      conversation.push({ role: 'assistant', content: assistantBlocks });

      if (stopReason !== 'tool_use') break;

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of assistantBlocks) {
        if (block.type === 'tool_use') {
          send('tool_call', { name: block.name, input: block.input });
          let result: unknown;
          try {
            result = await Promise.race([
              runTool(block.name, block.input as Record<string, unknown>),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Tool execution timed out after 15s')), 15_000)
              ),
            ]);
          } catch (err) {
            result = { error: String(err).slice(0, 300) };
            logger.warn({ tool: block.name, error: String(err).slice(0, 200) }, 'ai-chat: tool execution failed');
          }
          send('tool_result', { name: block.name, preview: JSON.stringify(result).slice(0, 200) });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }
      conversation.push({ role: 'user', content: toolResults });
    }

    send('done', { ok: true });
    recordSuccess(anthropicHost);
  } catch (err) {
    recordFailure(anthropicHost);
    console.error('[AI chat] error:', err);
    send('error', { message: err instanceof Error ? err.message : 'unknown error' });
  } finally {
    res.end();
  }
}
