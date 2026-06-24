import Anthropic from '@anthropic-ai/sdk';
import { PERSONAS } from '../lib/ai-personas.js';

const SONNET = 'claude-sonnet-4-6';
const HAIKU = 'claude-haiku-4-5-20251001';

let _client: Anthropic | null = null;
function client() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export interface CampaignPlan {
  objective: string;
  steps: { day: number; action: string; type: string }[];
  suggestedInfluencers?: unknown[];
}

export async function generateStrategy(releaseTitle: string, genre: string): Promise<CampaignPlan> {
  const c = client();
  if (!c) return fallbackStrategy();

  try {
    const res = await c.messages.create({
      model: SONNET,
      max_tokens: PERSONAS['campaign-director'].maxTokens ?? 1024,
      system: PERSONAS['campaign-director'].systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a 30-day rollout strategy for a ${genre} release titled "${releaseTitle}".

Return JSON: {"objective": string, "steps": [{"day": number, "action": string, "type": "social"|"platform"|"growth"|"analytics"}]}

Constraints: 6-8 steps. First step on day -7 (pre-release teaser). Final step on day 30 (post-mortem). Each action <= 90 chars.`,
        },
      ],
    });

    const text = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    return JSON.parse(text);
  } catch (err) {
    console.error('[AI] generateStrategy error:', err);
    return fallbackStrategy();
  }
}

export async function generateViralIdeas(releaseTitle: string) {
  const c = client();
  if (!c) return fallbackViralIdeas();

  try {
    const res = await c.messages.create({
      model: HAIKU,
      max_tokens: PERSONAS['viral-strategist'].maxTokens ?? 768,
      system: PERSONAS['viral-strategist'].systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate 3 short-form video concepts for a music release titled "${releaseTitle}".

Return JSON array of: {"type": "POV"|"Trend"|"Dance"|"Behind-the-scenes", "title": string, "script": string (max 200 chars), "caption": string (with hashtags), "visual": string}`,
        },
      ],
    });

    const text = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    return JSON.parse(text);
  } catch (err) {
    console.error('[AI] generateViralIdeas error:', err);
    return fallbackViralIdeas();
  }
}

export async function generateImage(prompt: string): Promise<string[]> {
  // Real image generation goes through the server route, which calls the
  // configured provider (Higgsfield / OpenAI Images / Stability). No fake
  // stock images — if the route isn't configured the caller surfaces that.
  const res = await fetch('/api/assets/cover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Image generation unavailable (${res.status})`);
  const data = await res.json();
  return data.images || data.urls || (data.url ? [data.url] : []);
}

export async function generateVideo(prompt: string): Promise<{ url: string }> {
  const res = await fetch('/api/assets/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Video generation unavailable (${res.status})`);
  return res.json();
}

export async function generateCampaign(title: string, _artist: string, _goals: string): Promise<CampaignPlan> {
  return generateStrategy(title, 'Pop');
}

/**
 * A&R critique. Deep analysis of a track submission for the /anr page.
 * Returns markdown-formatted critique.
 */
export async function critiqueSubmission(input: {
  trackTitle: string;
  notes?: string;
  lyrics?: string;
  bio?: string;
  genre?: string;
}): Promise<{ markdown: string; score: number; tags: string[] }> {
  const c = client();
  if (!c) {
    return {
      markdown: '_AI critique unavailable — `ANTHROPIC_API_KEY` not configured._',
      score: 0,
      tags: [],
    };
  }

  try {
    const res = await c.messages.create({
      model: SONNET,
      max_tokens: PERSONAS['ar-critic'].maxTokens ?? 2048,
      system: PERSONAS['ar-critic'].systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Track title: ${input.trackTitle}
Genre: ${input.genre ?? 'unspecified'}
Artist bio: ${input.bio ?? 'not provided'}

Lyrics:
${input.lyrics ?? 'not provided'}

Artist notes:
${input.notes ?? 'none'}

Critique this submission.`,
        },
      ],
    });

    const text = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    const [metaLine, ...rest] = text.split('---');
    let score = 5;
    let tags: string[] = [];
    try {
      const meta = JSON.parse(metaLine.trim());
      score = Number(meta.score) || 5;
      tags = Array.isArray(meta.tags) ? meta.tags.map(String) : [];
    } catch {
      // ignore — use defaults
    }
    const markdown = rest.join('---').trim() || text;
    return { markdown, score, tags };
  } catch (err) {
    console.error('[AI] critiqueSubmission error:', err);
    return {
      markdown: '_AI critique failed. Try again in a moment._',
      score: 0,
      tags: [],
    };
  }
}

/* ----- Fallbacks (used when no API key configured) ----- */

function fallbackStrategy(): CampaignPlan {
  return {
    objective: 'Standard Distribution Protocol',
    steps: [
      { day: -7, action: 'Teaser snippet on TikTok + Reels', type: 'social' },
      { day: 0, action: 'Release day platform deployment', type: 'platform' },
      { day: 3, action: 'Influencer relay sequence', type: 'growth' },
      { day: 14, action: 'Mid-cycle analytics review', type: 'analytics' },
    ],
  };
}

function fallbackViralIdeas() {
  return [
    {
      type: 'POV',
      title: 'Main Hook',
      script: 'POV moment when the beat drops, slow-mo reveal',
      caption: 'when the beat hits different 🔥 #newmusic',
      visual: 'Neon studio',
    },
  ];
}

export const aiService = {
  generateStrategy,
  generateViralIdeas,
  generateImage,
  generateVideo,
  generateCampaign,
  critiqueSubmission,
};
