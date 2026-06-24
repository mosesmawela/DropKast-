/**
 * Studios system — types.
 *
 * A "Studio" is a self-contained AI generation tool. Inspired by the
 * Open-Generative-AI architecture: every studio uses the same shell
 * (input → brain picker → run → queue → gallery), only the input
 * schema and output type vary.
 *
 * A "Job" is one run of a studio. It moves through:
 *   queued → running → done | failed
 *
 * An "Output" is the persisted result of a successful job — saved to
 * localStorage so the artist can revisit, copy, regenerate, or pipe
 * into another studio.
 */
import type { LucideIcon } from 'lucide-react';

export type StudioId =
  | 'cover'
  | 'video'
  | 'ugc'
  | 'anr'
  | 'press'
  | 'caption'
  | 'lyrics'
  | 'strategy'
  | 'hook'
  | 'lipsync'
  | 'promo-art';

/** Model provider types */
export type ModelProvider = 'anthropic' | 'openai' | 'internal' | 'external-api';

export type StudioCategory = 'visual' | 'video' | 'copy' | 'audio' | 'strategy';

export type OutputKind = 'image' | 'video' | 'text' | 'audio' | 'json';

export interface StudioInputField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'reference-images' | 'audio-file' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  /** Default value */
  defaultValue?: any;
  /** Help text shown under the input */
  hint?: string;
}

export interface StudioDef {
  id: StudioId;
  name: string;
  tagline: string;
  category: StudioCategory;
  icon: LucideIcon;
  /** Brand accent color for the studio header */
  accentColor: string;
  /** Output type from a successful run */
  outputKind: OutputKind;
  /** Default persona to load (matches src/lib/ai-personas.ts ids) */
  defaultPersona?: string;
  /** Backend endpoint that runs the generation. Receives {brain, persona, input}. */
  endpoint: string;
  /** Whether the endpoint is async (returns jobId, then poll status). */
  async?: boolean;
  /** Polling endpoint template — supports `{id}` substitution. Required if async=true. */
  pollEndpoint?: string;
  /** Estimated cost in cents per run (informational). */
  estimatedCostCents?: number;
  /** Estimated runtime in seconds (informational). */
  estimatedRuntimeSec?: number;
  /** Input fields the studio collects. */
  inputs: StudioInputField[];
  /** Description shown in the catalog. */
  description: string;
  /** Whether this studio supports piping its output as input to another studio. */
  pipeable?: boolean;
  /** References a model definition from models.ts. When set, input fields,
   *  endpoint, async config, and capabilities are inherited from the model. */
  modelId?: string;
  /** Operational status. 'coming-soon' tools render a badge and a disabled
   *  run button — used for studios whose real provider isn't wired yet, so we
   *  never ship a button that pretends to work. Defaults to 'live'. */
  status?: 'live' | 'coming-soon';
  /** One-line reason shown on the coming-soon badge tooltip. */
  comingSoonNote?: string;
  /** Honesty badge: how the output is produced.
   *  'ai-draft'  → AI generates, user edits (they're the author)
   *  'ai-insight'→ AI analysis/suggestion, shown with confidence, not a verdict
   *  'human'     → a real person (LVRN A&R) produces/approves the result */
  trust?: 'ai-draft' | 'ai-insight' | 'human';
}

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface StudioJob {
  id: string;
  studioId: StudioId;
  status: JobStatus;
  brain: string;
  persona?: string;
  input: Record<string, any>;
  output?: any;
  error?: string;
  remoteJobId?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  /** Workflow recipe id when this job is part of a chained pipeline. */
  workflowId?: string;
}

export interface StudioOutput {
  id: string;
  studioId: StudioId;
  jobId: string;
  kind: OutputKind;
  /** For images/video/audio — URL. For text/json — null + use `text` field. */
  url?: string;
  text?: string;
  data?: any;
  thumbnailUrl?: string;
  inputSnapshot: Record<string, any>;
  brain: string;
  persona?: string;
  createdAt: string;
  /** Stars / favorites — surfaces in gallery */
  starred?: boolean;
}

/* =========================================================================
 * Workflow pipeline types
 * ========================================================================= */

/** A single step in a workflow pipeline */
export interface WorkflowStep {
  /** Which studio to run */
  studioId: StudioId;
  /** Input overrides for this step. Supports {stepN.output} references. */
  input: Record<string, any>;
  /** Optional label (shown in pipeline UI) */
  label?: string;
}

/** A reusable workflow recipe */
export interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

/** Result of executing one step in a workflow */
export interface WorkflowStepResult {
  stepIndex: number;
  studioId: StudioId;
  label?: string;
  jobId: string;
  status: 'running' | 'done' | 'failed';
  output?: any;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

/** Full result of a workflow run */
export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'done' | 'failed';
  steps: WorkflowStepResult[];
  createdAt: string;
  finishedAt?: string;
}
