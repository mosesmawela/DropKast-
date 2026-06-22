/**
 * Studio registry — single source of truth for every gen studio.
 *
 * Add a new studio: append to STUDIOS, the catalog page picks it up
 * automatically, the shell component renders it without a single line
 * of new layout code.
 */
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  ShieldCheck,
  Mic2,
  MessageSquare,
  Layers,
  Target,
  Scissors,
  Smile,
} from 'lucide-react';
import type { StudioDef, StudioId } from './types';
import { getModel } from './models';

export const STUDIOS: StudioDef[] = [
  /* =====================================================================
   * VISUAL
   * ===================================================================== */
  {
    id: 'cover',
    name: 'Cover Studio',
    tagline: 'AI cover art that hits',
    category: 'visual',
    icon: ImageIcon,
    accentColor: '#FF4D00',
    outputKind: 'image',
    modelId: 'cover-gen',
    endpoint: '/api/assets/cover',
    estimatedCostCents: 8,
    estimatedRuntimeSec: 18,
    pipeable: true,
    description:
      'Generate cover art from a vibe prompt + reference images. Square 3000×3000, DSP-compliant out of the box.',
    inputs: [
      {
        key: 'prompt',
        label: 'Describe the cover',
        type: 'textarea',
        placeholder:
          'A solitary figure on a desert horizon at golden hour, washed in deep amber. Editorial. No text on cover.',
        required: true,
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
      },
    ],
  },
  {
    id: 'video',
    name: 'Video Studio',
    tagline: 'Animated teasers + lyric videos',
    category: 'video',
    icon: Video,
    accentColor: '#FF4D00',
    outputKind: 'video',
    modelId: 'video-teaser',
    endpoint: '/api/assets/video',
    async: true,
    pollEndpoint: '/api/assets/video/{id}',
    estimatedCostCents: 50,
    estimatedRuntimeSec: 60,
    pipeable: true,
    description:
      '15-30s video teasers from a prompt. Lyric video, abstract visual, animated cover. Use for pre-release seeding.',
    inputs: [
      {
        key: 'prompt',
        label: 'What should we generate?',
        type: 'textarea',
        placeholder:
          'Slow-motion neon liquid splash with audio waveform overlay in deep teal. 15 seconds. Loops.',
        required: true,
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
  },
  {
    id: 'ugc',
    name: 'UGC Studio',
    tagline: 'Short-form video concepts',
    category: 'video',
    icon: Smile,
    accentColor: '#FF4D00',
    outputKind: 'json',
    modelId: 'ugc-gen',
    endpoint: '/api/ugc/generate',
    async: true,
    pollEndpoint: '/api/ugc/{id}',
    estimatedRuntimeSec: 8,
    pipeable: true,
    description:
      'AI-generated short-form video concepts. Hooks, captions, scene-by-scene scripts ready for creators or your own filming.',
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
      },
    ],
  },
  {
    id: 'lipsync',
    name: 'LipSync Studio',
    tagline: 'Photo + audio → singing video',
    category: 'video',
    icon: Mic2,
    accentColor: '#FF4D00',
    outputKind: 'video',
    modelId: 'lipsync',
    endpoint: '/api/assets/lipsync',
    async: true,
    pollEndpoint: '/api/assets/lipsync/{id}',
    estimatedCostCents: 30,
    estimatedRuntimeSec: 45,
    description:
      'Drop a photo + audio clip, get back a 15-30s lip-sync video. Perfect for "the artist sings it" content for fans who can\'t film.',
    inputs: [
      { key: 'photo', label: 'Artist photo', type: 'file', required: true, hint: '1024×1024+ portrait, face clearly visible' },
      { key: 'audio', label: 'Audio segment', type: 'audio-file', required: true, hint: '15-30 second hook from your track' },
    ],
  },

  /* =====================================================================
   * COPY
   * ===================================================================== */
  {
    id: 'caption',
    name: 'Caption Studio',
    tagline: 'Social copy in your voice',
    category: 'copy',
    icon: MessageSquare,
    accentColor: '#FF4D00',
    outputKind: 'text',
    modelId: 'chat-llm',
    defaultPersona: 'caption-writer',
    endpoint: '/api/ai/chat',
    estimatedRuntimeSec: 4,
    pipeable: true,
    description:
      'Captions, hashtags, and hook lines that match your artist voice. Per-platform format (TikTok / Reels / X / Threads).',
    inputs: [
      {
        key: 'platform',
        label: 'Platform',
        type: 'select',
        defaultValue: 'tiktok',
        options: [
          { value: 'tiktok',    label: 'TikTok' },
          { value: 'instagram', label: 'Instagram Reels' },
          { value: 'twitter',   label: 'X / Twitter' },
          { value: 'threads',   label: 'Threads' },
        ],
      },
      { key: 'song_title', label: 'Track title', type: 'text', placeholder: 'Skyline', required: true },
      { key: 'mood', label: 'Track mood', type: 'text', placeholder: 'late-night drive, cinematic, longing' },
      { key: 'count', label: 'How many', type: 'number', defaultValue: 6 },
    ],
  },
  {
    id: 'press',
    name: 'Press Studio',
    tagline: 'EPK + one-sheet + bio',
    category: 'copy',
    icon: Layers,
    accentColor: '#FF4D00',
    outputKind: 'json',
    modelId: 'press-pack',
    defaultPersona: 'press-pitcher',
    endpoint: '/api/promo/generate',
    estimatedRuntimeSec: 12,
    pipeable: true,
    description:
      'Build a complete press pack from your release info. Bio (short + long), one-sheet, three pitch variants, sync angles.',
    inputs: [
      { key: 'releaseId', label: 'Release', type: 'text', placeholder: 'Pick a release', required: true },
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
  },
  {
    id: 'lyrics',
    name: 'Lyric Coach',
    tagline: 'Topline feedback + revisions',
    category: 'copy',
    icon: Mic2,
    accentColor: '#FF4D00',
    outputKind: 'text',
    modelId: 'chat-llm',
    defaultPersona: 'lyric-coach',
    endpoint: '/api/ai/chat',
    estimatedRuntimeSec: 6,
    description:
      'Specific, line-level feedback on your lyrics. No "be more vulnerable" platitudes — actual rewrite suggestions per line.',
    inputs: [
      {
        key: 'lyrics',
        label: 'Paste your lyrics',
        type: 'textarea',
        placeholder: '[Verse 1]\n...',
        required: true,
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        defaultValue: 'critique',
        options: [
          { value: 'critique', label: 'Critique (line by line)' },
          { value: 'rewrite',  label: 'Rewrite suggestions' },
          { value: 'finish',   label: 'Finish what I started' },
        ],
      },
    ],
  },

  {
    id: 'promo-art',
    name: 'Promo Art Studio',
    tagline: 'One prompt → 5 platform sizes',
    category: 'visual',
    icon: Layers,
    accentColor: '#FF4D00',
    outputKind: 'image',
    modelId: 'cover-gen',
    endpoint: '/api/assets/cover',
    estimatedCostCents: 40,
    estimatedRuntimeSec: 45,
    pipeable: true,
    description:
      'Generate the full social pack from one prompt: 1:1 (feed), 9:16 (IG story + TikTok cover), 16:9 (YouTube banner), and 16:9 thumb. DSP-compliant out of the box, no text in the wrong spots.',
    inputs: [
      {
        key: 'prompt',
        label: 'Describe the campaign visual',
        type: 'textarea',
        placeholder: 'Late-night neon city palette, single figure silhouette, deep teal + magenta, editorial.',
        required: true,
        hint: 'One direction — the studio generates all 5 sizes consistent with this prompt.',
      },
      {
        key: 'references',
        label: 'Reference images',
        type: 'reference-images',
        hint: 'Drop up to 5 references to lock the visual language across all 5 outputs.',
      },
      {
        key: 'sizes',
        label: 'Sizes to generate',
        type: 'select',
        defaultValue: 'all',
        options: [
          { value: 'all', label: 'All 5 (square + 2× 9:16 + 2× 16:9)' },
          { value: 'square', label: '1:1 only (DSP cover)' },
          { value: 'vertical', label: 'Vertical only (9:16 — Stories/TikTok)' },
          { value: 'horizontal', label: 'Horizontal only (16:9 — YouTube banner)' },
        ],
      },
      {
        key: 'title',
        label: 'Track title to overlay (optional)',
        type: 'text',
        placeholder: 'Skyline',
      },
    ],
  },

  /* =====================================================================
   * STRATEGY
   * ===================================================================== */
  {
    id: 'anr',
    name: 'A&R Studio',
    tagline: 'Label-grade track critique',
    category: 'strategy',
    icon: ShieldCheck,
    accentColor: '#FF4D00',
    outputKind: 'json',
    modelId: 'ar-critique',
    defaultPersona: 'ar-critic',
    endpoint: '/api/anr',
    estimatedRuntimeSec: 15,
    pipeable: true,
    description:
      'Same critique a senior A&R gives in a label meeting — without the meeting. 1-10 score, lane clarity, hook density, replay floor, the one thing to fix first.',
    inputs: [
      { key: 'releaseId', label: 'Release', type: 'text', placeholder: 'Pick a release to critique' },
      {
        key: 'audioUrl',
        label: 'Or paste an audio URL',
        type: 'text',
        placeholder: 'https://... (optional, if release isn\'t in the system yet)',
      },
      { key: 'context', label: 'Anything we should know?', type: 'textarea', placeholder: 'Genre, intended audience, ref tracks...' },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy Studio',
    tagline: '30-day rollout plan',
    category: 'strategy',
    icon: Target,
    accentColor: '#FF4D00',
    outputKind: 'json',
    modelId: 'rollout-strategy',
    defaultPersona: 'campaign-director',
    endpoint: '/api/promo/generate',
    estimatedRuntimeSec: 18,
    pipeable: true,
    description:
      'Day-by-day rollout from D-21 to D+7. Editorial pitch windows, TikTok seeding moments, paid-ad timing, the 60/30/10 budget rule baked in.',
    inputs: [
      { key: 'releaseId', label: 'Release', type: 'text', placeholder: 'Pick a release', required: true },
      { key: 'budget', label: 'Budget (USD)', type: 'number', defaultValue: 500 },
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
  },
  {
    id: 'hook',
    name: 'Hook Studio',
    tagline: 'Find your TikTok moment',
    category: 'audio',
    icon: Scissors,
    accentColor: '#FF4D00',
    outputKind: 'json',
    modelId: 'hook-detection',
    endpoint: '/api/assets/hook',
    estimatedRuntimeSec: 10,
    pipeable: true,
    description:
      'Auto-detect the highest-conversion 15-30s window in your track. Returns timestamps + caption + per-platform export.',
    inputs: [
      { key: 'audio', label: 'Audio file', type: 'audio-file', required: true },
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
  },
];

export const STUDIO_BY_ID: Record<StudioId, StudioDef> = STUDIOS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StudioId, StudioDef>,
);

export const CATEGORY_LABEL: Record<string, string> = {
  visual:   'Visual',
  video:    'Video',
  copy:     'Copy & messaging',
  audio:    'Audio',
  strategy: 'Strategy',
};
