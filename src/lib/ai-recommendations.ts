/**
 * Recommended model per generation task.
 *
 * "Recommended" is the sticky default that DropKast picks for the artist
 * if they don't open the model picker. We optimize for the cheapest model
 * that's good enough for the task — not the flashiest.
 *
 * Each task has:
 *   - kind: text | image | video
 *   - recommendedId: id from ai-providers.ts catalog
 *   - storageKey: localStorage key for the user's override
 */
export type AIKind = 'text' | 'image' | 'video';

export interface TaskRecommendation {
  task: string;
  kind: AIKind;
  recommendedId: string;
  storageKey: string;
  blurb: string;
}

export const RECOMMENDATIONS: Record<string, TaskRecommendation> = {
  // ---- TEXT
  'chat': {
    task: 'AI Assistant chat',
    kind: 'text',
    recommendedId: 'anthropic-sonnet',
    storageKey: 'dropkast_model_chat',
    blurb: 'Claude Sonnet — the only one with tool use over your real catalog.',
  },
  'campaign-strategy': {
    task: 'Campaign strategy plan',
    kind: 'text',
    recommendedId: 'anthropic-sonnet',
    storageKey: 'dropkast_model_strategy',
    blurb: 'Sonnet for reasoning depth. Free providers work but produce shallower plans.',
  },
  'viral-ideas': {
    task: 'Viral video / TikTok ideas',
    kind: 'text',
    recommendedId: 'anthropic-haiku',
    storageKey: 'dropkast_model_viral',
    blurb: 'Haiku is plenty for short ideas, ~$0.001 per call. Free options also fine.',
  },
  'anr-critique': {
    task: 'A&R track critique',
    kind: 'text',
    recommendedId: 'anthropic-sonnet',
    storageKey: 'dropkast_model_anr',
    blurb: 'Reasoning-heavy task. Sonnet gives you the best feedback per dollar.',
  },
  'caption-blurb': {
    task: 'Captions, blurbs, short copy',
    kind: 'text',
    recommendedId: 'groq',
    storageKey: 'dropkast_model_caption',
    blurb: 'Groq is fast + free for short generations. Switch to Claude for nuance.',
  },

  // ---- IMAGE
  'cover-art': {
    task: 'Album / single cover art',
    kind: 'image',
    recommendedId: 'flux-schnell',
    storageKey: 'dropkast_model_cover',
    blurb: 'Flux Schnell at $0.003/image is the value pick. Upgrade to Flux Pro for finals.',
  },
  'lyric-card': {
    task: 'Lyric card / typography poster',
    kind: 'image',
    recommendedId: 'ideogram',
    storageKey: 'dropkast_model_lyric',
    blurb: 'Ideogram is the only model that gets in-image text right.',
  },
  'social-post': {
    task: 'Social post graphic',
    kind: 'image',
    recommendedId: 'flux-schnell',
    storageKey: 'dropkast_model_social',
    blurb: 'Cheap and fast. Iterate 10 versions, pick the best one.',
  },

  // ---- VIDEO
  'music-video': {
    task: 'Music video / cinematic clip',
    kind: 'video',
    recommendedId: 'kling-3',
    storageKey: 'dropkast_model_mv',
    blurb: 'Kling 3.0 is cheapest per second + free tier. Upgrade to Veo for premium.',
  },
  'short-form': {
    task: 'TikTok / Reel teaser',
    kind: 'video',
    recommendedId: 'pika-2',
    storageKey: 'dropkast_model_short',
    blurb: 'Pika is built for stylized short-form with free credits.',
  },
};

export function getRecommendation(task: keyof typeof RECOMMENDATIONS): TaskRecommendation {
  return RECOMMENDATIONS[task];
}
