/**
 * Workflow pipeline engine — chain multiple studios into a pipeline.
 *
 * Inspired by Open-Generative-AI's WorkflowStudio: a workflow is a
 * sequence of studio steps where each step can reference the output
 * of a previous step via {step0.output}, {step0.output.url}, etc.
 *
 * The engine:
 *   1. Resolves input references (e.g. {step0.output.url})
 *   2. Executes each step sequentially via submitJob
 *   3. Collects results into a WorkflowRun
 *   4. Persists per-step outputs to the gallery
 */
import { submitJob } from './apiClient';
import { STUDIO_BY_ID } from './registry';
import { saveOutput } from './useStudioOutputs';
import type { WorkflowDef, WorkflowRun, WorkflowStepResult } from './types';

export interface RunWorkflowOptions {
  /** Called after each step completes or fails */
  onStepComplete?: (step: WorkflowStepResult, index: number, total: number) => void;
  /** AbortSignal to cancel the entire workflow */
  signal?: AbortSignal;
}

/**
 * Execute a workflow pipeline.
 * Each step runs sequentially. A step's input can reference prior step
 * outputs with {stepN.output} or {stepN.output.url} syntax.
 */
export async function runWorkflow(
  workflow: WorkflowDef,
  initialInput: Record<string, any>,
  opts?: RunWorkflowOptions,
): Promise<WorkflowRun> {
  const runId = `wf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const startedAt = new Date().toISOString();
  const stepResults: WorkflowStepResult[] = [];
  const stepOutputs: Record<string, any> = {};

  for (let i = 0; i < workflow.steps.length; i++) {
    if (opts?.signal?.aborted) {
      markFailed(runId, stepResults, startedAt, 'Cancelled');
      break;
    }

    const step = workflow.steps[i];
    const def = STUDIO_BY_ID[step.studioId];
    if (!def) {
      stepResults.push({
        stepIndex: i,
        studioId: step.studioId,
        label: step.label,
        jobId: '',
        status: 'failed',
        error: `Unknown studio: ${step.studioId}`,
      });
      continue;
    }

    // Resolve template references in input
    const resolvedInput = resolveReferences(step.input, stepOutputs, initialInput);

    stepResults.push({
      stepIndex: i,
      studioId: step.studioId,
      label: step.label,
      jobId: '',
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    try {
      const result = await submitJob(
        def.endpoint,
        { ...resolvedInput, brain: 'workflow', persona: def.defaultPersona },
        def.outputKind,
        {
          async: def.async,
          pollEndpoint: def.pollEndpoint,
        },
      );

      // Persist to gallery
      const { output } = result;
      if (Array.isArray(output?.urls)) {
        output.urls.forEach((url: string, j: number) => {
          saveOutput({
            id: `wf-${runId}-step${i}-${j}`,
            studioId: step.studioId,
            jobId: result.id,
            kind: def.outputKind,
            url,
            thumbnailUrl: url,
            inputSnapshot: resolvedInput,
            brain: 'workflow',
            persona: def.defaultPersona,
            createdAt: new Date().toISOString(),
          });
        });
      } else {
        saveOutput({
          id: `wf-${runId}-step${i}`,
          studioId: step.studioId,
          jobId: result.id,
          kind: def.outputKind,
          url: output?.url,
          text: output?.text,
          data: output?.data,
          thumbnailUrl: output?.thumbnailUrl || output?.url,
          inputSnapshot: resolvedInput,
          brain: 'workflow',
          persona: def.defaultPersona,
          createdAt: new Date().toISOString(),
        });
      }

      stepResults[i] = {
        ...stepResults[i],
        status: 'done',
        jobId: result.id,
        output: output,
        finishedAt: new Date().toISOString(),
      };

      stepOutputs[`step${i}`] = output;
      stepOutputs[`step${i}.output`] = output;

      opts?.onStepComplete?.(stepResults[i], i + 1, workflow.steps.length);
    } catch (err: any) {
      stepResults[i] = {
        ...stepResults[i],
        status: 'failed',
        error: err?.message || 'Unknown error',
        finishedAt: new Date().toISOString(),
      };

      opts?.onStepComplete?.(stepResults[i], i + 1, workflow.steps.length);

      // — continue to next step unless the workflow should stop on error
    }
  }

  const allDone = stepResults.every((s) => s.status === 'done');
  return {
    id: runId,
    workflowId: workflow.id,
    status: allDone ? 'done' : 'failed',
    steps: stepResults,
    createdAt: startedAt,
    finishedAt: new Date().toISOString(),
  };
}

/**
 * Resolve template references in input values.
 *
 * Supported patterns:
 *   {stepN.output}          → entire output object
 *   {stepN.output.url}      → output URL
 *   {stepN.output.text}     → output text
 *   {initial.X}             → value from initial input
 */
function resolveReferences(
  input: Record<string, any>,
  stepOutputs: Record<string, any>,
  initialInput: Record<string, any>,
): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      resolved[key] = value.replace(
        /\{(step\d+(?:\.output)?(?:\.[a-zA-Z_$][\w$]*)*|initial\.[a-zA-Z_$][\w$]*)\}/g,
        (_, ref) => {
          if (ref.startsWith('initial.')) {
            const path = ref.slice(8);
            return resolvePath(initialInput, path) ?? ref;
          }
          return resolvePath(stepOutputs, ref) ?? ref;
        },
      );
    } else if (typeof value === 'object' && value !== null) {
      // Support nested objects with references (e.g., input for image gen)
      resolved[key] = resolveReferences(value, stepOutputs, initialInput);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

function resolvePath(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

function markFailed(
  runId: string,
  steps: WorkflowStepResult[],
  startedAt: string,
  reason: string,
): WorkflowRun {
  return {
    id: runId,
    workflowId: '',
    status: 'failed',
    steps,
    createdAt: startedAt,
    finishedAt: new Date().toISOString(),
  };
}

/* =========================================================================
 * Pre-built workflow recipes
 * ========================================================================= */

export const BUILTIN_WORKFLOWS: WorkflowDef[] = [
  {
    id: 'single-cover-drop',
    name: 'Single / Cover Drop',
    description: 'Generate cover art → detect hook → write captions',
    steps: [
      {
        studioId: 'cover',
        label: 'Generate cover art',
        input: {
          prompt: '{initial.prompt}',
          aspect: '{initial.aspect}',
          count: 4,
        },
      },
      {
        studioId: 'hook',
        label: 'Find the hook',
        input: {
          audio: '{initial.audioUrl}',
          platform: 'tiktok',
        },
      },
      {
        studioId: 'caption',
        label: 'Write captions',
        input: {
          platform: 'tiktok',
          song_title: '{initial.title}',
          mood: '{initial.mood}',
          count: 6,
        },
      },
    ],
  },
  {
    id: 'press-campaign',
    name: 'Press + Strategy Push',
    description: 'Build EPK → generate rollout plan',
    steps: [
      {
        studioId: 'press',
        label: 'Build press pack',
        input: {
          releaseId: '{initial.releaseId}',
          type: 'epk',
        },
      },
      {
        studioId: 'strategy',
        label: 'Plan rollout',
        input: {
          releaseId: '{initial.releaseId}',
          budget: '{initial.budget}',
          goal: '{initial.goal}',
        },
      },
    ],
  },
  {
    id: 'full-release-wave',
    name: 'Full Release Wave',
    description: 'Cover → UGC concepts → captions → strategy in one pipeline',
    steps: [
      {
        studioId: 'cover',
        label: 'Generate cover variations',
        input: {
          prompt: '{initial.prompt}',
          aspect: '1:1',
          count: 4,
        },
      },
      {
        studioId: 'ugc',
        label: 'Generate UGC concepts',
        input: {
          type: 'lipsync',
          title: '{initial.title}',
          count: 3,
        },
      },
      {
        studioId: 'caption',
        label: 'Platform captions',
        input: {
          platform: 'tiktok',
          song_title: '{initial.title}',
          mood: '{initial.mood}',
          count: 6,
        },
      },
      {
        studioId: 'strategy',
        label: '30-day rollout',
        input: {
          releaseId: '{initial.releaseId}',
          budget: '{initial.budget}',
          goal: '{initial.goal}',
        },
      },
    ],
  },
];
