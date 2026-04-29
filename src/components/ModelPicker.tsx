import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
 * The dropdown panel is rendered via a React Portal to `document.body`,
 * so it can't be clipped by `overflow-hidden` ancestors (e.g. the AI
 * Assistant chat panel). Position is recomputed on resize/scroll.
 */
export default function ModelPicker({ recommendation, value, onChange, variant = 'compact', className }: Props) {
  const items = providersByKind(recommendation.kind);
  const recommended = items.find((m) => m.id === recommendation.recommendedId) ?? items[0];

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);

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

  // Position the portal panel relative to the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const PANEL_W = 320;
      const margin = 8;
      // Prefer right-aligned, but flip left if it would overflow viewport.
      let left = r.right - PANEL_W;
      if (left < margin) left = margin;
      if (left + PANEL_W > window.innerWidth - margin) {
        left = window.innerWidth - PANEL_W - margin;
      }
      const top = r.bottom + 4;
      setPanelPos({ top, left, width: PANEL_W });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  // Click-outside / Escape to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const current = items.find((m) => m.id === internal) ?? recommended;
  const isRecommended = current.id === recommended.id;

  const free = items.filter((m) => m.tier === 'free' && m.id !== recommended.id);
  const freemium = items.filter((m) => m.tier === 'freemium' && m.id !== recommended.id);
  const paid = items.filter((m) => m.tier === 'paid' && m.id !== recommended.id);

  const panel = open && panelPos && (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{ position: 'fixed', top: panelPos.top, left: panelPos.left, width: panelPos.width, zIndex: 1000 }}
      className="bg-black border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-white/60 italic truncate">
          {recommendation.task} · {recommendation.kind}
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-white/40 hover:text-white shrink-0"
          aria-label="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
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
  );

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
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

      <AnimatePresence>{panel ? createPortal(panel, document.body) : null}</AnimatePresence>
    </div>
  );
}

function Group({ label, tone, children }: { label: string; tone?: 'primary'; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <div
        className={cn(
          'px-3 py-1.5 text-[8px] font-mono font-black uppercase tracking-[0.4em] italic',
          tone === 'primary' ? 'text-primary bg-primary/5' : 'text-white/40 bg-white/[0.02]',
        )}
      >
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
