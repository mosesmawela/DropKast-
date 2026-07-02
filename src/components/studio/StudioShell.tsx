/**
 * StudioShell — the unified chrome every gen studio wraps in.
 *
 * Layout (responsive):
 *   ┌─────────────────────────────────────────┐
 *   │  HEADER (icon, name, tagline, brain)    │
 *   ├──────────────┬──────────────────────────┤
 *   │  INPUT       │  OUTPUT GALLERY          │
 *   │  PANEL       │  (with run queue ribbon) │
 *   │              │                          │
 *   │  [RUN ▶]     │                          │
 *   └──────────────┴──────────────────────────┘
 *
 * No studio implements its own layout. They register input fields in
 * registry.ts and the shell renders them.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Loader2,
  Play,
  Star,
  Copy,
  Download,
  Trash2,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ImageIcon,
  Eye,
  Upload,
  GitBranch,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useStudioJobs } from '../../lib/studios/useStudioJobs';
import { useStudioOutputs } from '../../lib/studios/useStudioOutputs';
import { useAI } from '../../context/AIContext';
import { useTierGate, UpgradeModal } from '../UpgradePrompt';
import { uploadWithProgress, type UploadProgress } from '../../lib/studios/uploadWithProgress';
import { runWorkflow, BUILTIN_WORKFLOWS } from '../../lib/studios/workflow';
import PipelinePanel from './PipelinePanel';
import type {
  StudioDef,
  StudioJob,
  StudioOutput,
  StudioInputField,
  WorkflowRun,
  WorkflowDef,
} from '../../lib/studios/types';
import { cn } from '../../lib/utils';

interface Props {
  studio: StudioDef;
}

export default function StudioShell({ studio }: Props) {
  const { jobs, runningCount, runStudio, cancelJob, clearCompleted } = useStudioJobs(studio.id);
  const { outputs, star, remove } = useStudioOutputs(studio.id);
  const { provider } = useAI();

  // Initialise input from defaults
  const initialInput = useMemo(() => {
    const init: Record<string, any> = {};
    for (const f of studio.inputs) {
      if (f.defaultValue !== undefined) init[f.key] = f.defaultValue;
    }
    return init;
  }, [studio.id]);

  const [input, setInput] = useState<Record<string, any>>(initialInput);
  const [previewOutput, setPreviewOutput] = useState<StudioOutput | null>(null);
  const gate = useTierGate();
  const [upgradeBlocked, setUpgradeBlocked] = useState<string | null>(null);

  // Count this month's completed studio jobs across all studios (tier cap)
  const monthRunCount = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('dropkast.studios.jobs') || '[]');
      const startOfMonth = new Date();
      startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      return raw.filter((j: any) => j.status === 'done' && new Date(j.createdAt) >= startOfMonth).length;
    } catch { return 0; }
  }, [jobs.length]);

  // Pipeline mode
  const [pipelineMode, setPipelineMode] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDef | null>(null);
  const [wfInitialInput, setWfInitialInput] = useState<Record<string, any>>({});
  const [wfRun, setWfRun] = useState<WorkflowRun | null>(null);
  const [wfRunning, setWfRunning] = useState(false);

  const updateInput = (key: string, value: any) => setInput((prev) => ({ ...prev, [key]: value }));

  const canRun = useMemo(() => {
    return studio.inputs
      .filter((f) => f.required)
      .every((f) => {
        const v = input[f.key];
        return v !== undefined && v !== null && v !== '';
      });
  }, [input, studio.inputs]);

  const comingSoon = studio.status === 'coming-soon';

  const handleRun = async () => {
    if (comingSoon) {
      toast('This studio is coming soon — the provider isn\'t wired yet.', { icon: '🔧' });
      return;
    }
    if (!canRun) {
      toast.error('Fill in the required fields first');
      return;
    }
    // Tier cap check — Free=3 runs/mo, Indie=50/mo, Pro/Label=uncapped
    const capCheck = gate.check('ai-run', monthRunCount);
    if (!capCheck.allowed) {
      setUpgradeBlocked(capCheck.reason || 'You\'ve hit your monthly AI run cap.');
      return;
    }
    await runStudio({
      studioId: studio.id,
      brain: provider || 'anthropic',
      persona: studio.defaultPersona,
      input,
    });
    toast.success(`${studio.name} job queued`);
  };

  const reuseOutput = (output: StudioOutput) => {
    setInput(output.inputSnapshot || {});
    toast.message('Inputs restored from this output. Tweak and re-run.');
  };

  const Icon = studio.icon;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-white/5">
        <div className="flex items-start gap-5">
          <Link
            to="/studios"
            className="text-white/30 transition-colors mt-2"
            title="Back to studios"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div
            className="w-14 h-14 border flex items-center justify-center shrink-0"
            style={{ borderColor: `${studio.accentColor}55`, color: studio.accentColor }}
          >
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase italic mb-2" style={{ color: studio.accentColor }}>
              {studio.category} · Studio
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white leading-none mb-2">
              {studio.name}
            </h1>
            <p className="text-white/50 italic text-sm">{studio.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setPipelineMode(!pipelineMode); setWfRun(null); setSelectedWorkflow(null); }}
            className={cn(
              'beam flex items-center gap-2 px-4 py-2 min-h-[40px] text-[9px] font-black uppercase tracking-widest italic transition-all border',
              pipelineMode
                ? 'bg-primary text-black border-primary'
                : 'bg-transparent text-white/50 border-white/10',
            )}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Pipeline
          </button>
          {studio.estimatedCostCents !== undefined && (
            <div className="hidden md:block text-right">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Est cost</div>
              <div className="text-sm font-black italic text-white">
                ~${(studio.estimatedCostCents / 100).toFixed(2)} / run
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT PANEL — single studio mode */}
        {!pipelineMode && (
          <div className="lg:col-span-5 space-y-4">
            <div className="manifest-card p-6 bg-dark border border-white/10 space-y-5">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                <Sparkles className="w-3 h-3" /> Inputs
              </div>

              {comingSoon && (
                <div className="border border-yellow-500/30 bg-yellow-500/5 p-4">
                  <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest italic mb-1">
                    Coming soon
                  </div>
                  <p className="text-[11px] text-white/50 italic leading-relaxed">
                    {studio.comingSoonNote || 'This studio isn\'t wired to a live provider yet.'} You can preview the inputs, but Generate is disabled until it\'s live.
                  </p>
                </div>
              )}

              {studio.inputs.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={input[field.key]}
                  onChange={(v) => updateInput(field.key, v)}
                />
              ))}

              <div className="flex items-center gap-2 pt-2 text-[10px] text-white/40 italic">
                <span>Brain:</span>
                <span className="font-black text-white uppercase tracking-widest">{provider || 'anthropic'}</span>
                <span>·</span>
                <Link to="/ai-providers" className="text-primary hover:underline">change</Link>
                {studio.defaultPersona && (
                  <>
                    <span>·</span>
                    <span className="font-black text-white uppercase tracking-widest">{studio.defaultPersona}</span>
                  </>
                )}
              </div>

              <button
                onClick={handleRun}
                disabled={comingSoon || !canRun || runningCount > 0}
                className={cn(
                  'beam w-full h-14 flex items-center justify-center gap-3 text-[11px] font-black uppercase italic tracking-widest transition-all',
                  !comingSoon && canRun && runningCount === 0
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/30 cursor-not-allowed',
                )}
              >
                {comingSoon ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Coming soon
                  </>
                ) : runningCount > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running ({runningCount})...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>

              {studio.estimatedRuntimeSec && (
                <div className="text-center text-[10px] text-white/30 italic">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Typically ~{studio.estimatedRuntimeSec}s
                </div>
              )}
            </div>

            {/* Job Queue */}
            {jobs.length > 0 && (
              <div className="manifest-card p-4 bg-black border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] italic">
                    Queue ({jobs.length})
                  </div>
                  <button
                    onClick={clearCompleted}
                    className="text-[9px] font-black text-white/30 uppercase tracking-widest italic"
                  >
                    Clear done
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {jobs.slice(0, 8).map((j) => (
                    <JobRow key={j.id} job={j} onCancel={() => cancelJob(j.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PIPELINE PANEL */}
        {pipelineMode && (
          <PipelinePanel
            studio={studio}
            wfRun={wfRun}
            wfRunning={wfRunning}
            selectedWorkflow={selectedWorkflow}
            wfInitialInput={wfInitialInput}
            onSelectWorkflow={(wf) => { setSelectedWorkflow(wf); setWfRun(null); }}
            onUpdateInitial={(key, val) => setWfInitialInput((prev) => ({ ...prev, [key]: val }))}
            onRun={async () => {
              if (!selectedWorkflow) return;
              setWfRunning(true);
              setWfRun(null);
              try {
                const run = await runWorkflow(selectedWorkflow, wfInitialInput, {
                  onStepComplete: (step, idx, total) => {
                    toast.message(`${step.label || step.studioId}: ${step.status}`);
                  },
                });
                setWfRun(run);
                if (run.status === 'done') {
                  toast.success('Pipeline complete');
                }
              } catch (err: any) {
                toast.error('Pipeline failed', { description: err.message });
              } finally {
                setWfRunning(false);
              }
            }}
          />
        )}

        {/* OUTPUT GALLERY */}
        <div className="lg:col-span-7">
          <div className="manifest-card p-6 bg-dark border border-white/5 min-h-[60vh]">
            <div className="flex items-center justify-between mb-5">
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                Gallery ({outputs.length})
              </div>
              <div className="text-[10px] text-white/30 italic">
                Outputs persist locally — they survive refreshes
              </div>
            </div>

            {outputs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10">
                <Icon className="w-10 h-10 text-white/20 mx-auto mb-4" />
                <div className="text-white/40 italic mb-2">No outputs yet</div>
                <p className="text-[11px] text-white/30 italic max-w-xs mx-auto">
                  Fill in the inputs and hit Generate. Results appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {outputs.map((o) => (
                  <OutputCard
                    key={o.id}
                    output={o}
                    onPreview={() => setPreviewOutput(o)}
                    onStar={() => star(o.id)}
                    onRemove={() => remove(o.id)}
                    onReuse={() => reuseOutput(o)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewOutput && <PreviewModal output={previewOutput} onClose={() => setPreviewOutput(null)} />}
      </AnimatePresence>

      {/* Tier-cap modal */}
      <UpgradeModal
        open={!!upgradeBlocked}
        feature="AI Studios"
        requiredTier={gate.tier.id === 'free' ? 'indie' : 'pro'}
        reason={upgradeBlocked || undefined}
        onClose={() => setUpgradeBlocked(null)}
      />
    </div>
  );
}

/* =========================================================================
 * Field renderer — handles every input type
 * ========================================================================= */
function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: StudioInputField;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full bg-black border border-white/10 py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="w-full bg-black border border-white/10 py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary resize-none"
        />
      )}

      {field.type === 'select' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black border border-white/10 py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.placeholder}
          className="w-full bg-black border border-white/10 py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
        />
      )}

      {field.type === 'reference-images' && (
        <ReferenceImagesField value={value} onChange={onChange} />
      )}

      {(field.type === 'file' || field.type === 'audio-file') && (
        <FileField field={field} value={value} onChange={onChange} />
      )}

      {field.hint && <p className="text-[10px] text-white/30 italic mt-1.5 leading-relaxed">{field.hint}</p>}
    </div>
  );
}

function ReferenceImagesField({ value, onChange }: { value: string[] | undefined; onChange: (v: string[]) => void }) {
  const items = value || [];
  const [draftUrl, setDraftUrl] = useState('');
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {items.map((u, i) => (
          <div key={i} className="relative group aspect-square border border-white/10 overflow-hidden">
            <img src={u} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity"
              aria-label="Remove reference"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        ))}
        {items.length < 5 && (
          <div className="aspect-square border border-dashed border-white/20 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white/30" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          placeholder="Paste image URL..."
          className="flex-1 bg-black border border-white/10 py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            if (!draftUrl.trim()) return;
            onChange([...items, draftUrl.trim()]);
            setDraftUrl('');
          }}
          className="beam h-10 px-4 bg-white text-black text-[10px] font-black uppercase italic tracking-widest"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function FileField({ field, value, onChange }: { field: StudioInputField; value: any; onChange: (v: any) => void }) {
  const accept = field.type === 'audio-file' ? 'audio/*' : 'image/*,video/*';
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const handleFile = async (file: File) => {
    // Store local metadata immediately
    const local = { name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file), uploaded: false };
    onChange(local);

    // Auto-upload to the server
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setProgress(null);
    try {
      const result = await uploadWithProgress('/api/assets/upload', formData, {
        onProgress: setProgress,
      });
      onChange({ ...local, url: result.data.url || result.data.path || result.data, uploaded: true });
      toast.success(`${file.name} uploaded`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Upload failed', { description: err.message });
      }
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          handleFile(file);
        }}
        className="block w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-white file:text-black file:font-black file:uppercase file:text-[10px] file:tracking-widest file:italic file:cursor-pointer disabled:opacity-40"
      />
      {uploading && progress && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-primary italic">
            <Upload className="w-3 h-3 animate-pulse" />
            Uploading... {progress.percent}%
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200 rounded-full"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}
      {value?.name && !uploading && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/60 italic truncate">
          {value.uploaded ? (
            <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
          ) : (
            <Upload className="w-3 h-3 text-yellow-400 shrink-0" />
          )}
          <span>{value.name} ({Math.round((value.size || 0) / 1024)} KB)</span>
          {value.uploaded && <span className="text-green-400/60">· uploaded</span>}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
 * Output card — polymorphic by kind
 * ========================================================================= */
function OutputCard({
  output,
  onPreview,
  onStar,
  onRemove,
  onReuse,
}: {
  output: StudioOutput;
  onPreview: () => void;
  onStar: () => void;
  onRemove: () => void;
  onReuse: () => void;
}) {
  const isMedia = output.kind === 'image' || output.kind === 'video';

  return (
    <div className="beam border border-white/5 transition-all bg-black/40 group">
      {isMedia && output.url ? (
        <button
          onClick={onPreview}
          className="block w-full aspect-square overflow-hidden bg-black"
          aria-label="Open output"
        >
          {output.kind === 'video' ? (
            <video src={output.url} className="w-full h-full object-cover" muted loop playsInline />
          ) : (
            <img src={output.url} alt="" className="w-full h-full object-cover" />
          )}
        </button>
      ) : (
        <div className="p-4 max-h-48 overflow-y-auto custom-scrollbar text-[11px] text-white/70 italic leading-relaxed whitespace-pre-wrap">
          {output.text || JSON.stringify(output.data, null, 2).slice(0, 300)}
        </div>
      )}

      <div className="p-2 flex items-center justify-between text-[9px] text-white/40 italic font-mono uppercase tracking-widest">
        <span>{new Date(output.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-1">
          <button onClick={onPreview} aria-label="Preview" className="p-1.5">
            <Eye className="w-3 h-3" />
          </button>
          <button onClick={onStar} aria-label="Star" className={cn('p-1.5', output.starred && 'text-primary')}>
            <Star className={cn('w-3 h-3', output.starred && 'fill-primary')} />
          </button>
          <button onClick={onReuse} aria-label="Reuse inputs" className="p-1.5">
            <RefreshCw className="w-3 h-3" />
          </button>
          {output.url && (
            <a
              href={output.url}
              download
              aria-label="Download"
              className="p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3 h-3" />
            </a>
          )}
          <button onClick={onRemove} aria-label="Delete" className="p-1.5">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function JobRow({ job, onCancel }: { job: StudioJob; onCancel: () => void }) {
  const cfg = {
    queued:  { icon: Clock,        cls: 'text-yellow-400' },
    running: { icon: Loader2,      cls: 'text-primary animate-spin' },
    done:    { icon: CheckCircle2, cls: 'text-green-400' },
    failed:  { icon: XCircle,      cls: 'text-red-400' },
  }[job.status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2 text-[10px] py-1">
      <Icon className={cn('w-3 h-3 shrink-0', cfg.cls)} />
      <span className="text-white/60 truncate flex-1">
        {job.input?.title || job.input?.prompt?.slice(0, 40) || 'Job'}
      </span>
      <span className="text-white/30 italic">{job.status}</span>
      {(job.status === 'queued' || job.status === 'running') && (
        <button onClick={onCancel} aria-label="Cancel" className="text-white/30">
          <XCircle className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* =========================================================================
 * Preview modal
 * ========================================================================= */
function PreviewModal({ output, onClose }: { output: StudioOutput; onClose: () => void }) {
  const copy = () => {
    navigator.clipboard.writeText(output.url || output.text || JSON.stringify(output.data));
    toast.success('Copied');
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="manifest-card max-w-3xl w-full max-h-[90vh] bg-dark border-white/10 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
            {output.studioId} · output
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="text-[10px] font-black text-white/60 uppercase italic tracking-widest flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button onClick={onClose} aria-label="Close" className="text-white/60">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {output.kind === 'image' && output.url && <img src={output.url} alt="" className="w-full" />}
          {output.kind === 'video' && output.url && <video src={output.url} controls autoPlay className="w-full" />}
          {output.kind === 'audio' && output.url && <audio src={output.url} controls className="w-full" />}
          {(output.kind === 'text' || output.kind === 'json') && (
            <pre className="text-sm text-white/80 italic whitespace-pre-wrap font-mono leading-relaxed">
              {output.text || JSON.stringify(output.data, null, 2)}
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
