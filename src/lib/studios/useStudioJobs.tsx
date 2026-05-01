/**
 * useStudioJobs — the queue + polling engine that powers every studio.
 *
 * Responsibilities:
 *   - Submit a job to a studio's endpoint
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

const JOBS_KEY = 'dropkast.studios.jobs';
const JOB_EVENT = 'dropkast.studios.jobs.updated';
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 120; // 5 minutes worst case

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
    /* quota — drop oldest done/failed jobs and retry */
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

  // Subscribe to job changes (from this tab AND other tabs)
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

      const res = await fetch(def.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          brain,
          persona: persona || def.defaultPersona,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200) || res.statusText}`);
      }

      const data = await res.json();

      // Async studios return a remote job id — start polling
      if (def.async && data.id && def.pollEndpoint) {
        updateJob(id, { remoteJobId: data.id });
        await pollUntilDone(id, def.pollEndpoint.replace('{id}', data.id));
      } else {
        // Sync studio — output is in the response body
        finishJob(id, data, studioId, brain, persona, input);
      }
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

/* =========================================================================
 * Polling
 * ========================================================================= */
async function pollUntilDone(jobId: string, pollUrl: string): Promise<void> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const current = loadJobs().find((j) => j.id === jobId);
    if (!current || current.status === 'failed') return; // cancelled

    try {
      const res = await fetch(pollUrl);
      if (!res.ok) continue;
      const data = await res.json();

      if (data.status === 'done') {
        finishJob(jobId, data, current.studioId, current.brain, current.persona, current.input);
        return;
      }
      if (data.status === 'failed' || data.status === 'error') {
        updateJob(jobId, {
          status: 'failed',
          error: data.error || 'Generation failed',
          finishedAt: new Date().toISOString(),
        });
        return;
      }
      // still processing — keep polling
    } catch {
      // network blip — keep going up to MAX_POLL_ATTEMPTS
    }
  }
  updateJob(jobId, {
    status: 'failed',
    error: 'Timed out after 5 minutes',
    finishedAt: new Date().toISOString(),
  });
}

function finishJob(
  jobId: string,
  data: any,
  studioId: StudioId,
  brain: string,
  persona: string | undefined,
  input: Record<string, any>,
) {
  const def = STUDIO_BY_ID[studioId];

  // Normalize output shape — endpoints return {url}, {images: []}, {text}, {ideas}, etc
  const output = normalizeOutput(data, def.outputKind);

  updateJob(jobId, {
    status: 'done',
    finishedAt: new Date().toISOString(),
    output,
  });

  // Persist to gallery — split multi-image responses into multiple outputs
  if (Array.isArray(output?.urls)) {
    output.urls.forEach((url: string, i: number) => {
      saveOutput({
        id: `out-${jobId}-${i}`,
        studioId,
        jobId,
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
      id: `out-${jobId}`,
      studioId,
      jobId,
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
}

function normalizeOutput(data: any, kind: string): any {
  // Cover gen returns { images: [{ url }, ...] }
  if (data?.images && Array.isArray(data.images)) {
    return { urls: data.images.map((i: any) => i.url || i) };
  }
  // Video gen returns { url, status }
  if (data?.url && (kind === 'video' || kind === 'image')) {
    return { url: data.url, thumbnailUrl: data.thumbnailUrl || data.url };
  }
  // ANR critique returns { score, critique, summary }
  if (data?.score !== undefined && data?.critique) {
    return { data, text: data.critique };
  }
  // UGC returns { ideas: [{title, script, caption}] }
  if (data?.ideas) {
    return { data: data.ideas, text: JSON.stringify(data.ideas, null, 2) };
  }
  // Promo / press returns { assets: [...] }
  if (data?.assets) {
    return { data: data.assets };
  }
  // Chat-style returns { text } or { message }
  if (data?.text) return { text: data.text };
  if (data?.message) return { text: data.message };
  // Fallback
  return { data };
}
