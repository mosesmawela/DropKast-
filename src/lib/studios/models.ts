/**
 * Schema-driven model definitions.
 *
 * Inspired by Open-Generative-AI's models.js: every model is a typed
 * declaration with input schema, capabilities, and endpoint. Studios
 * reference a modelId instead of inlining endpoint/input config.
 *
 * Adding a new model here makes it available to any studio that sets
 * modelId in its StudioDef. The shell picks up input fields,
 * validation rules, and capabilities from the model definition.
 */
import type { OutputKind } from './types';

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'file' | 'audio-file' | 'reference-images';

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface InputFieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  hint?: string;
  validation?: FieldValidation;
}

export interface ModelCapabilities {
  aspectRatios?: string[];
  resolutions?: string[];
  maxImages?: number;
  maxDurationSec?: number;
  supportsI2i?: boolean;
  supportsReference?: boolean;
  /** Whether output can be piped as input to another studio */
  pipeable?: boolean;
}

export interface ModelDef {
  id: string;
  name: string;
  description: string;
  provider: 'anthropic' | 'openai' | 'internal' | 'external-api';
  endpoint: string;
  outputKind: OutputKind;
  capabilities: ModelCapabilities;
  inputs: InputFieldDef[];
  estimatedCostCents?: number;
  estimatedRuntimeSec?: number;
  /** If the endpoint is async (returns jobId to poll) */
  async?: boolean;
  pollEndpoint?: string;
}

const MODELS: ModelDef[] = [
  /* ------------------------------------------------------------------
   * IMAGE
   * ------------------------------------------------------------------ */
  {
    id: 'cover-gen',
    name: 'Cover Generation',
    description: 'AI cover art from prompt + reference images. 3000×3000 square, DSP-compliant.',
    provider: 'internal',
    endpoint: '/api/assets/cover',
    outputKind: 'image',
    capabilities: {
      aspectRatios: ['1:1', '16:9', '9:16'],
      maxImages: 8,
      supportsReference: true,
      pipeable: true,
    },
    inputs: [
      {
        key: 'prompt',
        label: 'Describe the cover',
        type: 'textarea',
        required: true,
        placeholder: 'A solitary figure on a desert horizon at golden hour, washed in deep amber. Editorial. No text on cover.',
        hint: 'Specific beats vague. Mention mood, color palette, subject, style references.',
      },
      {
        key: 'references',
        label: 'Reference images',
        type: 'reference-images',
        hint: 'Drop up to 5 images we should pull mood/palette from.',
      },
      {
        key: 'aspect',
        label: 'Aspect',
        type: 'select',
        defaultValue: '1:1',
        options: [
          { value: '1:1', label: '1:1 (square — DSP standard)' },
          { value: '16:9', label: '16:9 (banner)' },
          { value: '9:16', label: '9:16 (story / Reel)' },
        ],
      },
      {
        key: 'count',
        label: 'How many variations',
        type: 'number',
        defaultValue: 4,
        validation: { min: 1, max: 8 },
      },
    ],
    estimatedCostCents: 8,
    estimatedRuntimeSec: 18,
  },
  {
    id: 'video-teaser',
    name: 'Video Teaser',
    description: '15-30s animated teasers from a prompt. Lyric video, abstract visual, animated cover.',
    provider: 'internal',
    endpoint: '/api/assets/video',
    outputKind: 'video',
    async: true,
    pollEndpoint: '/api/assets/video/{id}',
    capabilities: {
      aspectRatios: ['9:16', '16:9', '1:1'],
      maxDurationSec: 30,
      pipeable: true,
    },
    inputs: [
      {
        key: 'prompt',
        label: 'What should we generate?',
        type: 'textarea',
        required: true,
        placeholder: 'Slow-motion neon liquid splash with audio waveform overlay in deep teal. 15 seconds. Loops.',
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '15',
        options: [
          { value: '7',  label: '7 seconds (Reel-friendly)' },
          { value: '15', label: '15 seconds (TikTok sweet spot)' },
          { value: '30', label: '30 seconds (full hook)' },
        ],
      },
    ],
    estimatedCostCents: 50,
    estimatedRuntimeSec: 60,
  },
  {
    id: 'lipsync',
    name: 'LipSync',
    description: 'Photo + audio → singing video. 15-30s lip-sync.',
    provider: 'internal',
    endpoint: '/api/assets/lipsync',
    outputKind: 'video',
    async: true,
    pollEndpoint: '/api/assets/lipsync/{id}',
    capabilities: {
      maxDurationSec: 30,
    },
    inputs: [
      {
        key: 'photo',
        label: 'Artist photo',
        type: 'file',
        required: true,
        hint: '1024×1024+ portrait, face clearly visible',
      },
      {
        key: 'audio',
        label: 'Audio segment',
        type: 'audio-file',
        required: true,
        hint: '15-30 second hook from your track',
      },
    ],
    estimatedCostCents: 30,
    estimatedRuntimeSec: 45,
  },

  /* ------------------------------------------------------------------
   * TEXT / COPY
   * ------------------------------------------------------------------ */
  {
    id: 'chat-llm',
    name: 'Chat LLM',
    description: 'General-purpose text generation via the configured AI provider.',
    provider: 'anthropic',
    endpoint: '/api/ai/chat',
    outputKind: 'text',
    capabilities: {
      pipeable: true,
    },
    inputs: [
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Write your prompt here...',
      },
    ],
    estimatedRuntimeSec: 4,
  },
  {
    id: 'ugc-gen',
    name: 'UGC Concept Generator',
    description: 'AI-generated short-form video concepts with hooks, captions, and scene-by-scene scripts.',
    provider: 'internal',
    endpoint: '/api/ugc/generate',
    outputKind: 'json',
    async: true,
    pollEndpoint: '/api/ugc/{id}',
    capabilities: {
      pipeable: true,
    },
    inputs: [
      {
        key: 'type',
        label: 'Concept type',
        type: 'select',
        defaultValue: 'lipsync',
        options: [
          { value: 'lipsync', label: 'Lip-sync (artist or fan)' },
          { value: 'dance',   label: 'Dance / movement' },
          { value: 'funny',   label: 'POV / comedy' },
          { value: 'story',   label: 'Story-driven' },
        ],
      },
      {
        key: 'title',
        label: 'Track name',
        type: 'text',
        placeholder: 'Skyline',
      },
      {
        key: 'count',
        label: 'How many concepts',
        type: 'number',
        defaultValue: 3,
        validation: { min: 1, max: 10 },
      },
    ],
    estimatedRuntimeSec: 8,
  },
  {
    id: 'press-pack',
    name: 'Press Pack Generator',
    description: 'Bio, one-sheet, pitch variants, and sync angles from release info.',
    provider: 'internal',
    endpoint: '/api/promo/generate',
    outputKind: 'json',
    capabilities: {
      pipeable: true,
    },
    inputs: [
      {
        key: 'releaseId',
        label: 'Release',
        type: 'text',
        placeholder: 'Pick a release',
        required: true,
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        defaultValue: 'epk',
        options: [
          { value: 'epk',       label: 'Full EPK (one-sheet + bio + photo + links)' },
          { value: 'bio',       label: 'Bio only (short + long)' },
          { value: 'pitch',     label: 'Pitch emails (3 variants)' },
          { value: 'one-sheet', label: 'One-sheet (sync supervisors)' },
        ],
      },
    ],
    estimatedRuntimeSec: 12,
  },

  /* ------------------------------------------------------------------
   * AUDIO
   * ------------------------------------------------------------------ */
  {
    id: 'hook-detection',
    name: 'Hook Detection',
    description: 'Auto-detect the highest-conversion 15-30s window in a track.',
    provider: 'internal',
    endpoint: '/api/assets/hook',
    outputKind: 'json',
    capabilities: {
      pipeable: true,
    },
    inputs: [
      {
        key: 'audio',
        label: 'Audio file',
        type: 'audio-file',
        required: true,
      },
      {
        key: 'platform',
        label: 'Optimize for',
        type: 'select',
        defaultValue: 'tiktok',
        options: [
          { value: 'tiktok',    label: 'TikTok (15-22s)' },
          { value: 'instagram', label: 'Instagram Reels (30s)' },
          { value: 'shorts',    label: 'YouTube Shorts (30-60s)' },
        ],
      },
    ],
    estimatedRuntimeSec: 10,
  },

  /* ------------------------------------------------------------------
   * STRATEGY
   * ------------------------------------------------------------------ */
  {
    id: 'ar-critique',
    name: 'A&R Critique',
    description: 'Label-grade track critique with scoring, lane clarity, and actionable feedback.',
    provider: 'internal',
    endpoint: '/api/anr',
    outputKind: 'json',
    capabilities: {
      pipeable: true,
    },
    inputs: [
      {
        key: 'releaseId',
        label: 'Release',
        type: 'text',
        placeholder: 'Pick a release to critique',
      },
      {
        key: 'audioUrl',
        label: 'Or paste an audio URL',
        type: 'text',
        placeholder: 'https://... (optional, if release is not in the system yet)',
      },
      {
        key: 'context',
        label: 'Anything we should know?',
        type: 'textarea',
        placeholder: 'Genre, intended audience, ref tracks...',
      },
    ],
    estimatedRuntimeSec: 15,
  },
  {
    id: 'rollout-strategy',
    name: 'Rollout Strategy',
    description: '30-day day-by-day rollout plan from D-21 to D+7 with editorial timing and budget rules.',
    provider: 'internal',
    endpoint: '/api/promo/generate',
    outputKind: 'json',
    capabilities: {
      pipeable: true,
    },
    inputs: [
      {
        key: 'releaseId',
        label: 'Release',
        type: 'text',
        placeholder: 'Pick a release',
        required: true,
      },
      {
        key: 'budget',
        label: 'Budget (USD)',
        type: 'number',
        defaultValue: 500,
        validation: { min: 0, max: 100000 },
      },
      {
        key: 'goal',
        label: 'Primary goal',
        type: 'select',
        defaultValue: 'streams',
        options: [
          { value: 'streams',   label: 'Streams + saves' },
          { value: 'editorial', label: 'Editorial playlists' },
          { value: 'viral',     label: 'Viral / TikTok push' },
          { value: 'sync',      label: 'Sync placements' },
        ],
      },
    ],
    estimatedRuntimeSec: 18,
  },
];

export const MODEL_BY_ID: Record<string, ModelDef> = {};
for (const m of MODELS) MODEL_BY_ID[m.id] = m;

export function getModel(id: string): ModelDef | undefined {
  return MODEL_BY_ID[id];
}

export function listModels(): ModelDef[] {
  return MODELS;
}

export function modelsByProvider(provider: string): ModelDef[] {
  return MODELS.filter((m) => m.provider === provider);
}
