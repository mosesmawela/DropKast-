/**
 * useStudioJobs — the queue + polling engine that powers every studio.
 *
 * Responsibilities:
 *   - Submit a job to a studio's endpoint (via apiClient)
 *   - Track status (queued / running / done / failed)
 *   - Poll async jobs until they finish or fail
 *   - Persist jobs to localStorage so the queue survives page reloads
 *   - Emit completed outputs into the per-studio gallery
 *
 * No global state library — just localStorage + a custom event so the
 * UI re-renders. Conservative by design.
 */
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { STUDIO_BY_ID } from './registry';
import type { StudioId, StudioJob, StudioOutput, JobStatus } from './types';
import { saveOutput } from './useStudioOutputs';
import { submitJob } from './apiClient';

const JOBS_KEY = 'dropkast.studios.jobs';
const JOB_EVENT = 'dropkast.studios.jobs.updated';

function loadJobs(): StudioJob[] {
  try {
    return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveJobs(jobs: StudioJob[]) {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    window.dispatchEvent(new Event(JOB_EVENT));
  } catch {
    const trimmed = jobs.slice(0, 50);
    localStorage.setItem(JOBS_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event(JOB_EVENT));
  }
}

function updateJob(id: string, patch: Partial<StudioJob>) {
  const all = loadJobs();
  const next = all.map((j) => (j.id === id ? { ...j, ...patch } : j));
  saveJobs(next);
}

export interface RunStudioInput {
  studioId: StudioId;
  brain: string;
  persona?: string;
  input: Record<string, any>;
}

export function useStudioJobs(filterStudio?: StudioId) {
  const [jobs, setJobs] = useState<StudioJob[]>(() => loadJobs());

  useEffect(() => {
    const refresh = () => setJobs(loadJobs());
    window.addEventListener(JOB_EVENT, refresh);
    window.addEventListener('storage', (e) => {
      if (e.key === JOBS_KEY) refresh();
    });
    return () => {
      window.removeEventListener(JOB_EVENT, refresh);
    };
  }, []);

  const visible = filterStudio ? jobs.filter((j) => j.studioId === filterStudio) : jobs;
  const runningCount = visible.filter((j) => j.status === 'running' || j.status === 'queued').length;

  const runStudio = useCallback(async ({ studioId, brain, persona, input }: RunStudioInput) => {
    const def = STUDIO_BY_ID[studioId];
    if (!def) throw new Error(`Unknown studio: ${studioId}`);

    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const job: StudioJob = {
      id,
      studioId,
      brain,
      persona,
      input,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    saveJobs([job, ...loadJobs()]);

    try {
      updateJob(id, { status: 'running', startedAt: new Date().toISOString() });

      const result = await submitJob(def.endpoint, {
        ...input,
        brain,
        persona: persona || def.defaultPersona,
      }, def.outputKind, {
        async: def.async,
        pollEndpoint: def.pollEndpoint,
      });

      updateJob(id, {
        status: 'done',
        finishedAt: new Date().toISOString(),
        output: result.output,
        remoteJobId: result.id,
      });

      // Persist to gallery — split multi-image responses into multiple outputs
      const { output } = result;
      if (Array.isArray(output?.urls)) {
        output.urls.forEach((url: string, i: number) => {
          saveOutput({
            id: `out-${id}-${i}`,
            studioId,
            jobId: id,
            kind: def.outputKind,
            url,
            thumbnailUrl: url,
            inputSnapshot: input,
            brain,
            persona,
            createdAt: new Date().toISOString(),
          });
        });
      } else {
        saveOutput({
          id: `out-${id}`,
          studioId,
          jobId: id,
          kind: def.outputKind,
          url: output?.url,
          text: output?.text,
          data: output?.data,
          thumbnailUrl: output?.thumbnailUrl || output?.url,
          inputSnapshot: input,
          brain,
          persona,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success(`${def.name} done`, {
        description: 'Saved to your gallery — find it in the studio or in /studios.',
      });
    } catch (err: any) {
      updateJob(id, {
        status: 'failed',
        error: err?.message || 'Unknown error',
        finishedAt: new Date().toISOString(),
      });
      toast.error(`${def.name} failed`, { description: err?.message?.slice(0, 100) || 'Unknown error' });
    }

    return id;
  }, []);

  const cancelJob = useCallback((id: string) => {
    updateJob(id, { status: 'failed', error: 'Cancelled', finishedAt: new Date().toISOString() });
  }, []);

  const clearCompleted = useCallback(() => {
    const all = loadJobs();
    saveJobs(all.filter((j) => j.status !== 'done' && j.status !== 'failed'));
  }, []);

  return { jobs: visible, runningCount, runStudio, cancelJob, clearCompleted };
}
