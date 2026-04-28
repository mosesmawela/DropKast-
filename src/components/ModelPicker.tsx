import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Check, ExternalLink, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { providersByKind, type ProviderModel } from '../lib/ai-providers';
import { type TaskRecommendation } from '../lib/ai-recommendations';

interface Props {
  /** What we're generating — drives kind + storage key + recommended model. */
  recommendation: TaskRecommendation;
  /** Selected model id; if undefined, picker is uncontrolled and reads localStorage. */
  value?: string;
  /** Fired when user picks. If you keep `value` undefined, this also writes localStorage. */
  onChange?: (modelId: string) => void;
  /** Display variant. `compact` = inline button. `full` = button with provider name visible. */
  variant?: 'compact' | 'full';
  className?: string;
}

const TIER_COLOR: Record<ProviderModel['tier'], string> = {
  free: 'text-green-500',
  freemium: 'text-blue-400',
  paid: 'text-primary',
};

/**
 * Reusable model picker.
 *
 * Shows the current model in a compact button. Click → dropdown grouped
 * by tier (Recommended / Free / Freemium / Paid). User pick is persisted
 * to localStorage under `recommendation.storageKey`.
 *
 * If a non-implemented model is picked, the dropdown shows a "soon" badge
 * — generation will fall back to the recommended model server-side.
 */
export default function ModelPicker({ recommendation, value, onChange, variant = 'compact', className }: Props) {
  const items = providersByKind(recommendation.kind);
  const recommended = items.find((m) => m.id === recommendation.recommendedId) ?? items[0];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Internal selection: prefer prop, then localStorage, else recommended.
  const [internal, setInternal] = useState<string>(() => {
    if (value) return value;
    try {
      const saved = localStorage.getItem(recommendation.storageKey);
      if (saved && items.find((m) => m.id === saved)) return saved;
    } catch {
      // ignore
    }
    return recommended.id;
  });

  // Sync external value
  useEffect(() => {
    if (value && value !== internal) setInternal(value);
  }, [value]);

  const select = (id: string) => {
    setInternal(id);
    if (!value) {
      try {
        localStorage.setItem(recommendation.storageKey, id);
      } catch {
        // ignore quota
      }
    }
    onChange?.(id);
    setOpen(false);
  };

  // Click-outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = items.find((m) => m.id === internal) ?? recommended;
  const isRecommended = current.id === recommended.id;

  const free = items.filter((m) => m.tier === 'free' && m.id !== recommended.id);
  const freemium = items.filter((m) => m.tier === 'freemium' && m.id !== recommended.id);
  const paid = items.filter((m) => m.tier === 'paid' && m.id !== recommended.id);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 border transition-all px-3 py-1.5',
          'border-[var(--border-main)] hover:border-primary bg-[var(--card-bg)] text-[var(--text-main)]',
          variant === 'compact' ? 'text-[10px]' : 'text-[11px]',
        )}
      >
        <Sparkles className={cn('w-3 h-3 shrink-0', isRecommended ? 'text-primary' : 'text-[var(--text-main)]/40')} />
        <span className="font-mono font-black uppercase italic tracking-widest truncate max-w-[140px] sm:max-w-[200px]">
          {isRecommended ? 'Recommended' : current.name}
        </span>
        {variant === 'full' && (
          <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-main)]/40 italic hidden sm:inline">
            · {current.vendor}
          </span>
        )}
        <ChevronDown className={cn('w-3 h-3 transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-[280px] sm:w-[340px] bg-black border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-white/60 italic">
                {recommendation.task} · {recommendation.kind}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {/* Recommended row pinned at top */}
              <Group label="Recommended" tone="primary">
                <Row m={recommended} active={current.id === recommended.id} recommended onPick={select} />
                {recommendation.blurb && (
                  <p className="px-3 pb-2 text-[10px] text-white/50 italic">{recommendation.blurb}</p>
                )}
              </Group>

              {free.length > 0 && (
                <Group label="Free">
                  {free.map((m) => (
                    <Row key={m.id} m={m} active={current.id === m.id} onPick={select} />
                  ))}
                </Group>
              )}
              {freemium.length > 0 && (
                <Group label="Freemium">
                  {freemium.map((m) => (
                    <Row key={m.id} m={m} active={current.id === m.id} onPick={select} />
                  ))}
                </Group>
              )}
              {paid.length > 0 && (
                <Group label="Paid">
                  {paid.map((m) => (
                    <Row key={m.id} m={m} active={current.id === m.id} onPick={select} />
                  ))}
                </Group>
              )}
            </div>

            <div className="px-3 py-2 border-t border-white/5 text-[9px] font-mono text-white/30 italic">
              See full tier list →{' '}
              <a href="/ai-providers" className="text-primary hover:underline">
                /ai-providers
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({ label, tone, children }: { label: string; tone?: 'primary'; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <div className={cn(
        'px-3 py-1.5 text-[8px] font-mono font-black uppercase tracking-[0.4em] italic',
        tone === 'primary' ? 'text-primary bg-primary/5' : 'text-white/40 bg-white/[0.02]',
      )}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ m, active, recommended, onPick }: { m: ProviderModel; active: boolean; recommended?: boolean; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(m.id)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
        active ? 'bg-primary/10' : 'hover:bg-white/[0.03]',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn('text-xs font-mono font-black italic uppercase tracking-tight truncate', active ? 'text-primary' : 'text-white')}>
            {m.name}
          </span>
          {recommended && (
            <span className="text-[8px] font-mono font-black uppercase tracking-widest italic px-1 py-0.5 bg-primary/20 text-primary border border-primary/40">
              Recommended
            </span>
          )}
          {!m.implemented && (
            <span className="text-[8px] font-mono font-black uppercase tracking-widest italic text-white/30 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              Soon
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-[9px] font-mono uppercase tracking-widest italic', TIER_COLOR[m.tier])}>
            {m.tier}
          </span>
          <span className="text-[9px] font-mono text-white/40">·</span>
          <span className="text-[9px] text-white/50 truncate">{m.pricing[0]}</span>
        </div>
      </div>
      {active && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
    </button>
  );
}
