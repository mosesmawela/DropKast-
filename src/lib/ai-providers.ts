/**
 * AI provider catalog — text / image / video.
 *
 * Single source of truth for the tier list page, the model picker UI,
 * and (eventually) the server-side adapters. Pricing is in USD and was
 * accurate at the time of writing (April 2026); refresh from the linked
 * docs before pricing-sensitive decisions.
 */

export type ProviderKind = 'text' | 'image' | 'video';
export type Tier = 'free' | 'freemium' | 'paid';

export interface ProviderModel {
  id: string;
  name: string;
  kind: ProviderKind;
  vendor: string;
  tier: Tier;
  envVar: string; // env var name needed to enable this model
  /** Short summary for the picker UI */
  blurb: string;
  /** Pricing detail — line items render as bullets in the tier list */
  pricing: string[];
  /** Free tier specifics — daily/monthly caps, watermarks, etc. */
  freeTier?: string;
  /** External link for signup */
  signupUrl: string;
  /** What this is best at */
  bestFor: string[];
  /** Endpoint the server-side adapter will call (informational; not all wired yet) */
  endpoint?: string;
  /** Model ID inside the provider's API */
  modelId?: string;
  /** Whether DropKast has a server adapter wired today */
  implemented: boolean;
}

/* =========================================================================
 * TEXT — chat / generation
 * ========================================================================= */
export const TEXT_PROVIDERS: ProviderModel[] = [
  {
    id: 'anthropic-sonnet',
    name: 'Claude Sonnet 4.6',
    kind: 'text',
    vendor: 'Anthropic',
    tier: 'paid',
    envVar: 'ANTHROPIC_API_KEY',
    blurb: 'Best-in-class reasoning, tool use, and prompt caching. Powers DropKast assistant + A&R critique.',
    pricing: [
      'Input: $3 / Mtok',
      'Cached read: $0.30 / Mtok (10× discount)',
      'Output: $15 / Mtok',
    ],
    signupUrl: 'https://console.anthropic.com/settings/keys',
    bestFor: ['AI assistant', 'A&R critique', 'Strategy generation'],
    endpoint: 'https://api.anthropic.com',
    modelId: 'claude-sonnet-4-6',
    implemented: true,
  },
  {
    id: 'anthropic-haiku',
    name: 'Claude Haiku 4.5',
    kind: 'text',
    vendor: 'Anthropic',
    tier: 'paid',
    envVar: 'ANTHROPIC_API_KEY',
    blurb: 'Fast and cheap. Used internally for viral-idea generation and short captions.',
    pricing: [
      'Input: $0.25 / Mtok',
      'Cached read: $0.025 / Mtok',
      'Output: $1.25 / Mtok',
    ],
    signupUrl: 'https://console.anthropic.com/settings/keys',
    bestFor: ['Viral idea generation', 'Captions', 'Bulk classification'],
    modelId: 'claude-haiku-4-5-20251001',
    implemented: true,
  },
  {
    id: 'nvidia-nim',
    name: 'NVIDIA NIM (Llama 3.3 70B)',
    kind: 'text',
    vendor: 'NVIDIA',
    tier: 'free',
    envVar: 'NVIDIA_API_KEY',
    blurb: 'Free hosted Llama / Mistral / Qwen on NVIDIA inference cloud. OpenAI-compatible API. Indefinite free tier.',
    pricing: ['$0 — free tier'],
    freeTier: '40 requests / minute, no daily token cap (rate-limited only)',
    signupUrl: 'https://build.nvidia.com/',
    bestFor: ['Free chat fallback', 'Bulk metadata enrichment', 'Local prototyping'],
    endpoint: 'https://integrate.api.nvidia.com/v1',
    modelId: 'meta/llama-3.3-70b-instruct',
    implemented: true,
  },
  {
    id: 'groq',
    name: 'Groq (Llama 3.3 70B)',
    kind: 'text',
    vendor: 'Groq',
    tier: 'free',
    envVar: 'GROQ_API_KEY',
    blurb: 'Custom LPU hardware → fastest free inference available (>500 tok/s). OpenAI-compatible.',
    pricing: ['$0 — free tier'],
    freeTier: '30 RPM, 60K tokens/min, 1M tokens/day',
    signupUrl: 'https://console.groq.com/keys',
    bestFor: ['Real-time streaming chat', 'Low-latency tools'],
    endpoint: 'https://api.groq.com/openai/v1',
    modelId: 'llama-3.3-70b-versatile',
    implemented: true,
  },
  {
    id: 'cerebras',
    name: 'Cerebras (Llama 3.3 70B)',
    kind: 'text',
    vendor: 'Cerebras',
    tier: 'free',
    envVar: 'CEREBRAS_API_KEY',
    blurb: 'Wafer-scale chips, even faster than Groq on some models. Most generous free daily volume.',
    pricing: ['$0 — free tier'],
    freeTier: '30 RPM, 60–100K tokens/min, 1M tokens/day, 8K context cap',
    signupUrl: 'https://cloud.cerebras.ai/',
    bestFor: ['High-volume free inference', 'Background workflows'],
    endpoint: 'https://api.cerebras.ai/v1',
    modelId: 'llama-3.3-70b',
    implemented: true,
  },
  {
    id: 'openrouter-free',
    name: 'OpenRouter (free models)',
    kind: 'text',
    vendor: 'OpenRouter',
    tier: 'freemium',
    envVar: 'OPENROUTER_API_KEY',
    blurb: 'One API → dozens of models. Free tier covers DeepSeek R1/V3, Llama 4, Qwen3. Pay-as-you-go for premium.',
    pricing: ['Free models: $0', 'Premium: pass-through provider pricing'],
    freeTier: '20 RPM on free models, 50 req/day without balance (1000/day with $10+)',
    signupUrl: 'https://openrouter.ai/keys',
    bestFor: ['Model A/B comparison', 'Cheap experiments'],
    endpoint: 'https://openrouter.ai/api/v1',
    modelId: 'meta-llama/llama-3.3-70b-instruct:free',
    implemented: true,
  },
  {
    id: 'moonshot-kimi',
    name: 'Moonshot Kimi K2.6',
    kind: 'text',
    vendor: 'Moonshot',
    tier: 'paid',
    envVar: 'MOONSHOT_API_KEY',
    blurb: 'Top-tier open model (Intelligence Index 54). 256K context, OpenAI-compatible. Built for long-horizon agentic work — A&R critique on a full lyric sheet, deep marketing playbook generation.',
    pricing: ['Input: $0.74 / Mtok', 'Output: $4.65 / Mtok', '75% discount via context cache'],
    signupUrl: 'https://platform.moonshot.ai/',
    bestFor: ['Long context analysis', 'Agentic flows', 'Cheap alternative to Sonnet'],
    endpoint: 'https://api.moonshot.ai/v1',
    modelId: 'moonshot-v1-128k',
    implemented: true,
  },
  {
    id: 'openai-gpt5',
    name: 'OpenAI GPT-5',
    kind: 'text',
    vendor: 'OpenAI',
    tier: 'paid',
    envVar: 'OPENAI_API_KEY',
    blurb: 'OpenAI flagship. Excellent reasoning + coding. Cheaper than GPT-5.5 with similar A&R-grade output.',
    pricing: ['Input: $0.625 / Mtok', 'Output: $5 / Mtok'],
    signupUrl: 'https://platform.openai.com/api-keys',
    bestFor: ['Reasoning-heavy tasks', 'Critique', 'Strategic planning'],
    endpoint: 'https://api.openai.com/v1',
    modelId: 'gpt-5',
    implemented: true,
  },
  {
    id: 'gemini-25-pro',
    name: 'Google Gemini 2.5 Pro',
    kind: 'text',
    vendor: 'Google',
    tier: 'paid',
    envVar: 'GOOGLE_API_KEY',
    blurb: "Google's flagship. Cheap input + huge context. Great for processing large docs (full lyric catalogs, royalty statements).",
    pricing: ['Input: $1.25 / Mtok (≤200K context)', 'Output: $10 / Mtok'],
    freeTier: '2.5 Flash + 3.1 Flash-Lite remain free with rate limits',
    signupUrl: 'https://aistudio.google.com/',
    bestFor: ['Long context', 'Document analysis', 'Translation'],
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    modelId: 'gemini-2.5-pro',
    implemented: true,
  },
];

/* =========================================================================
 * IMAGE
 * ========================================================================= */
export const IMAGE_PROVIDERS: ProviderModel[] = [
  {
    id: 'muapi-gateway',
    name: 'Muapi Gateway (200+ models)',
    kind: 'image',
    vendor: 'Muapi.ai',
    tier: 'paid',
    envVar: 'MUAPI_API_KEY',
    blurb: 'One key, one gateway — powers Cover, Promo Art, Video and LipSync studios (Flux, Kling, Seedance, GPT-Image and 200+ more). This is the engine DropKast generation routes through.',
    pricing: ['Pay-per-generation via Muapi credits', 'Cost varies by model'],
    signupUrl: 'https://muapi.ai',
    bestFor: ['Cover art', 'Promo art', 'Video / b-roll', 'Lip-sync'],
    endpoint: 'https://api.muapi.ai',
    implemented: true,
  },
  {
    id: 'nano-banana-2',
    name: 'Nano Banana 2 (Gemini 3.1 Flash Image)',
    kind: 'image',
    vendor: 'Google',
    tier: 'freemium',
    envVar: 'GOOGLE_API_KEY',
    blurb: "Google's flagship image model. Photorealistic, prompt-faithful, fast.",
    pricing: ['$0.045–$0.151 / image (resolution-dependent)', '50% off via Batch API'],
    freeTier: '50 free images/day via AI Studio (no card)',
    signupUrl: 'https://aistudio.google.com/',
    bestFor: ['Album artwork', 'Social posters', 'Hero imagery'],
    endpoint: 'https://generativelanguage.googleapis.com',
    modelId: 'gemini-3.1-flash-image',
    implemented: false,
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    kind: 'image',
    vendor: 'Google',
    tier: 'paid',
    envVar: 'GOOGLE_API_KEY',
    blurb: 'Pro tier of Nano Banana. 4K-capable, slightly higher quality vs NB2.',
    pricing: ['$0.134 / image at 1K-2K', '$0.24 / image at 4K', '50% off via Batch'],
    freeTier: undefined,
    signupUrl: 'https://aistudio.google.com/',
    bestFor: ['Print-ready artwork', '4K cover art', 'Premium campaigns'],
    modelId: 'gemini-3.0-pro-image',
    implemented: false,
  },
  {
    id: 'flux-schnell',
    name: 'Flux 2 Schnell',
    kind: 'image',
    vendor: 'Black Forest Labs',
    tier: 'paid',
    envVar: 'FAL_API_KEY',
    blurb: 'Cheapest reliable image generation. Speed-optimized, 4-step diffusion.',
    pricing: ['$0.003 / image (Replicate)', '$0.015 / image (fal.ai)'],
    freeTier: 'Sign-up credit on fal.ai (~100 images)',
    signupUrl: 'https://fal.ai/dashboard/keys',
    bestFor: ['Bulk thumbnails', 'Real-time previews', 'High-volume UGC'],
    endpoint: 'https://queue.fal.run',
    modelId: 'fal-ai/flux/schnell',
    implemented: false,
  },
  {
    id: 'flux-dev',
    name: 'Flux 2 Dev',
    kind: 'image',
    vendor: 'Black Forest Labs',
    tier: 'paid',
    envVar: 'FAL_API_KEY',
    blurb: 'Dev tier of Flux. Better prompt adherence than Schnell, still fast.',
    pricing: ['$0.025 / image (fal.ai)'],
    signupUrl: 'https://fal.ai/dashboard/keys',
    bestFor: ['Standard cover art', 'Prompt-faithful generation'],
    modelId: 'fal-ai/flux/dev',
    implemented: false,
  },
  {
    id: 'flux-pro',
    name: 'Flux 2 Pro',
    kind: 'image',
    vendor: 'Black Forest Labs',
    tier: 'paid',
    envVar: 'FAL_API_KEY',
    blurb: 'Studio-grade output. The benchmark for prompt-faithful AI photography.',
    pricing: ['$0.055 / image (fal.ai)'],
    signupUrl: 'https://fal.ai/dashboard/keys',
    bestFor: ['Commercial-grade artwork', 'Brand assets'],
    modelId: 'fal-ai/flux-pro/v1.1',
    implemented: false,
  },
  {
    id: 'dalle3',
    name: 'DALL-E 3 / gpt-image-1',
    kind: 'image',
    vendor: 'OpenAI',
    tier: 'paid',
    envVar: 'OPENAI_API_KEY',
    blurb: 'OpenAI flagship. Strong on illustration, weaker on photoreal vs Flux/Nano Banana.',
    pricing: ['$0.04–$0.12 / image (size-dependent)'],
    signupUrl: 'https://platform.openai.com/api-keys',
    bestFor: ['Illustrative artwork', 'Stylized covers'],
    modelId: 'gpt-image-1',
    implemented: false,
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    kind: 'image',
    vendor: 'Ideogram',
    tier: 'freemium',
    envVar: 'IDEOGRAM_API_KEY',
    blurb: 'Industry leader for accurate in-image text. Use for posters, lyric cards, typography.',
    pricing: ['~$0.02–$0.05 / image'],
    freeTier: '10 generations/day on web',
    signupUrl: 'https://ideogram.ai/api',
    bestFor: ['Lyric cards', 'Posters with text', 'Logos'],
    implemented: false,
  },
];

/* =========================================================================
 * VIDEO
 * ========================================================================= */
export const VIDEO_PROVIDERS: ProviderModel[] = [
  {
    id: 'kling-3',
    name: 'Kling 3.0',
    kind: 'video',
    vendor: 'Kling AI',
    tier: 'freemium',
    envVar: 'KLING_API_KEY',
    blurb: 'Cheapest per-second AI video. 4K native output, generous free tier.',
    pricing: ['$0.029 / second', '~$1.68 for a 10s Pro clip with audio'],
    freeTier: '66 free credits/day (no credit card)',
    signupUrl: 'https://klingai.com/',
    bestFor: ['Music videos', 'Teaser clips', 'Vertical Reels/Shorts'],
    modelId: 'kling-v3.0-pro',
    implemented: false,
  },
  {
    id: 'seedance-2',
    name: 'Seedance 2.0 (Fast)',
    kind: 'video',
    vendor: 'ByteDance',
    tier: 'paid',
    envVar: 'SEEDANCE_API_KEY',
    blurb: 'ByteDance video model. No official API yet; access via fal/Replicate. ~7× cheaper than Sora.',
    pricing: ['$0.022 / second (Fast)', '~$3.03 for 10s standard'],
    signupUrl: 'https://fal.ai/models/bytedance/seedance-2-fast',
    bestFor: ['Multi-modal input', 'Stylized motion graphics'],
    implemented: false,
  },
  {
    id: 'veo-3',
    name: 'Veo 3.1',
    kind: 'video',
    vendor: 'Google',
    tier: 'paid',
    envVar: 'GOOGLE_API_KEY',
    blurb: "Google's flagship video model. Best overall output + native synced audio.",
    pricing: ['~$0.40–$0.50 / second on premium tier'],
    freeTier: 'Limited access via Gemini app',
    signupUrl: 'https://aistudio.google.com/',
    bestFor: ['Top-quality cinematic clips', 'Lip-synced narration'],
    modelId: 'veo-3.1',
    implemented: false,
  },
  {
    id: 'sora-2',
    name: 'Sora 2',
    kind: 'video',
    vendor: 'OpenAI',
    tier: 'paid',
    envVar: 'OPENAI_API_KEY',
    blurb: 'OpenAI video model. Strong on physics + camera motion. Costliest of the majors.',
    pricing: ['~$0.40–$0.48 / second'],
    signupUrl: 'https://platform.openai.com/api-keys',
    bestFor: ['Cinematic shots', 'Existing Sora workflows'],
    modelId: 'sora-2',
    implemented: false,
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    kind: 'video',
    vendor: 'Runway',
    tier: 'paid',
    envVar: 'RUNWAY_API_KEY',
    blurb: 'Industry pro tool. Best controls (camera, motion brush, references).',
    pricing: ['Standard tier from $12/mo, ~$0.40 / clip'],
    signupUrl: 'https://app.runwayml.com/',
    bestFor: ['Director-grade control', 'Reference images', 'Camera moves'],
    implemented: false,
  },
  {
    id: 'luma-dream',
    name: 'Luma Dream Machine',
    kind: 'video',
    vendor: 'Luma',
    tier: 'freemium',
    envVar: 'LUMA_API_KEY',
    blurb: 'Atmospheric, dreamy image-to-video. Free tier with watermark.',
    pricing: ['Lite $9.99/mo (3,200 credits)', 'Plus $29.99/mo'],
    freeTier: 'Free with watermark + daily cap',
    signupUrl: 'https://lumalabs.ai/dream-machine/api',
    bestFor: ['Image-to-video', 'Atmospheric/dreamy aesthetic'],
    implemented: false,
  },
  {
    id: 'pika-2',
    name: 'Pika 2.0',
    kind: 'video',
    vendor: 'Pika Labs',
    tier: 'freemium',
    envVar: 'PIKA_API_KEY',
    blurb: 'Stylized short-form video, quick iteration. Free credits on signup.',
    pricing: ['Standard $10/mo (700 credits)', 'Pro $35/mo', 'Fancy $95/mo'],
    freeTier: 'Free Basic plan: 80 credits/month',
    signupUrl: 'https://pika.art/',
    bestFor: ['Stylized short-form', 'Fast iteration'],
    implemented: false,
  },
  {
    id: 'hailuo',
    name: 'Hailuo / MiniMax',
    kind: 'video',
    vendor: 'MiniMax',
    tier: 'freemium',
    envVar: 'HAILUO_API_KEY',
    blurb: 'Free tier with watermark. Surprisingly good at realistic human motion.',
    pricing: ['$0.01–$0.08 / video at high volume'],
    freeTier: 'Free with watermark + daily cap',
    signupUrl: 'https://hailuoai.video/',
    bestFor: ['Cheap bulk video', 'Realistic human motion'],
    implemented: false,
  },
];

export const ALL_PROVIDERS = [...TEXT_PROVIDERS, ...IMAGE_PROVIDERS, ...VIDEO_PROVIDERS];

export function providersByKind(kind: ProviderKind): ProviderModel[] {
  return ALL_PROVIDERS.filter((p) => p.kind === kind);
}

export function providersByTier(kind: ProviderKind, tier: Tier): ProviderModel[] {
  return providersByKind(kind).filter((p) => p.tier === tier);
}
