/**
 * PipelinePanel — multi-step workflow builder for the StudioShell.
 *
 * Lets the user pick a pre-built workflow recipe, fill in initial inputs,
 * then run the entire pipeline. Each step is executed sequentially and
 * progress is shown in real time.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  GitBranch,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { BUILTIN_WORKFLOWS } from '../../lib/studios/workflow';
import type { StudioDef, WorkflowRun, WorkflowDef } from '../../lib/studios/types';
import { cn } from '../../lib/utils';

interface Props {
  studio: StudioDef;
  wfRun: WorkflowRun | null;
  wfRunning: boolean;
  selectedWorkflow: WorkflowDef | null;
  wfInitialInput: Record<string, any>;
  onSelectWorkflow: (wf: WorkflowDef) => void;
  onUpdateInitial: (key: string, val: any) => void;
  onRun: () => void;
}

export default function PipelinePanel({
  studio,
  wfRun,
  wfRunning,
  selectedWorkflow,
  wfInitialInput,
  onSelectWorkflow,
  onUpdateInitial,
  onRun,
}: Props) {
  // Find workflows that include this studio
  const relevant = BUILTIN_WORKFLOWS.filter((wf) =>
    wf.steps.some((s) => s.studioId === studio.id),
  );

  if (relevant.length === 0) {
    return (
      <div className="lg:col-span-5">
        <div className="manifest-card p-6 bg-dark border border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-4">
            <GitBranch className="w-3 h-3" /> Pipeline
          </div>
          <p className="text-white/40 italic text-sm">
            No pipelines include this studio yet. New pipelines coming soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-5 space-y-4">
      {/* Workflow selector */}
      <div className="manifest-card p-6 bg-dark border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
          <GitBranch className="w-3 h-3" /> Pipeline
        </div>

        {!selectedWorkflow && (
          <div className="space-y-2">
            {relevant.map((wf) => (
              <button
                key={wf.id}
                onClick={() => onSelectWorkflow(wf)}
                className="w-full text-left p-4 border border-white/10 hover:border-primary/40 bg-black/40 transition-all group"
              >
                <div className="text-sm font-black italic text-white group-hover:text-primary transition-colors mb-1">
                  {wf.name}
                </div>
                <div className="text-[11px] text-white/50 italic leading-relaxed">{wf.description}</div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {wf.steps.map((s, i) => (
                    <span
                      key={i}
                      className={cn(
                        'text-[9px] font-black uppercase tracking-widest italic px-2 py-0.5 border',
                        s.studioId === studio.id
                          ? 'text-primary border-primary/40 bg-primary/10'
                          : 'text-white/40 border-white/10',
                      )}
                    >
                      {s.label || s.studioId}
                      {i < wf.steps.length - 1 && <ArrowRight className="w-2.5 h-2.5 inline ml-1" />}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected workflow — initial inputs */}
        {selectedWorkflow && !wfRun && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black italic text-white">{selectedWorkflow.name}</div>
                <div className="text-[11px] text-white/50 italic">{selectedWorkflow.description}</div>
              </div>
              <button
                onClick={() => onSelectWorkflow(null as any)}
                className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest italic"
              >
                Change
              </button>
            </div>

            {/* Steps overview */}
            <div className="border border-white/5 bg-black/40 p-4 space-y-2">
              <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic mb-2">
                <ListChecks className="w-3 h-3 inline mr-1" /> {selectedWorkflow.steps.length} steps
              </div>
              {selectedWorkflow.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-white/60 italic">
                  <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                  <span className={cn(s.studioId === studio.id ? 'text-primary' : '')}>
                    {s.label || s.studioId}
                  </span>
                </div>
              ))}
            </div>

            {/* Extract known initial inputs from step definitions */}
            <InitialInputs
              workflow={selectedWorkflow}
              values={wfInitialInput}
              onChange={onUpdateInitial}
            />

            <button
              onClick={onRun}
              disabled={wfRunning}
              className="w-full h-14 flex items-center justify-center gap-3 bg-white text-black text-[11px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-white transition-all"
            >
              {wfRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Pipeline ({selectedWorkflow.steps.length} steps)
                </>
              )}
            </button>
          </div>
        )}

        {/* Workflow run progress */}
        {wfRun && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] italic">
              {wfRun.status === 'done' ? (
                <span className="text-green-400">Pipeline complete</span>
              ) : wfRun.status === 'failed' ? (
                <span className="text-red-400">Pipeline failed</span>
              ) : (
                <span className="text-primary">Running...</span>
              )}
            </div>

            <div className="space-y-2">
              {wfRun.steps.map((step, i) => {
                const cfg = {
                  running: { icon: Loader2, cls: 'text-primary animate-spin' },
                  done: { icon: CheckCircle2, cls: 'text-green-400' },
                  failed: { icon: XCircle, cls: 'text-red-400' },
                }[step.status];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-[11px] py-1.5 px-3 bg-black/40 border border-white/5">
                    <Icon className={cn('w-3.5 h-3.5 shrink-0', cfg.cls)} />
                    <span className="text-white/70 italic flex-1">{step.label || step.studioId}</span>
                    {step.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                    {step.status === 'failed' && step.error && (
                      <span className="text-red-400/70 text-[9px] truncate max-w-[120px]">{step.error}</span>
                    )}
                    {step.status === 'running' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => { onSelectWorkflow(null as any); }}
              className="w-full h-10 border border-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest italic transition-all"
            >
              Run another pipeline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dynamic initial input fields extracted from workflow step definitions.
 * Collects all `{initial.X}` references across steps.
 */
function InitialInputs({
  workflow,
  values,
  onChange,
}: {
  workflow: WorkflowDef;
  values: Record<string, any>;
  onChange: (key: string, val: any) => void;
}) {
  // Collect unique {initial.X} references
  const refs = new Set<string>();
  const walk = (obj: any) => {
    if (typeof obj === 'string') {
      const matches = obj.match(/\{initial\.([a-zA-Z_][\w]*)\}/g);
      if (matches) {
        matches.forEach((m: string) => {
          const key = m.slice(9, -1);
          refs.add(key);
        });
      }
    } else if (obj && typeof obj === 'object') {
      for (const v of Object.values(obj)) walk(v);
    }
  };
  workflow.steps.forEach((s) => walk(s.input));

  if (refs.size === 0) {
    return <p className="text-[10px] text-white/30 italic">No initial inputs needed.</p>;
  }

  const labels: Record<string, string> = {
    prompt: 'Cover prompt',
    title: 'Track title',
    mood: 'Track mood',
    aspect: 'Aspect ratio',
    releaseId: 'Release ID',
    budget: 'Budget (USD)',
    goal: 'Primary goal',
    audioUrl: 'Audio URL',
  };

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">
        <Sparkles className="w-3 h-3 inline mr-1" /> Initial inputs
      </div>
      {Array.from(refs).map((key) => (
        <div key={key}>
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-1.5">
            {labels[key] || key}
          </label>
          <input
            type="text"
            value={values[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={key}
            className="w-full bg-black border border-white/10 py-2 px-3 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
      ))}
    </div>
  );
}
