/**
 * Generic tier-gating UI used by Studios, NewRelease, Advances, Roster.
 *
 * Renders a) an inline banner when a feature is locked and b) a modal
 * when the user actively tries to use a gated feature. Both link to
 * /subscription with `?upgrade=<targetTier>` so the upgrade flow
 * pre-selects the right tier.
 */
import { Sparkles, Lock, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSubscription } from '../context/SubscriptionContext';
import type { TierId } from '../lib/pricing';
import { TIER_BY_ID } from '../lib/pricing';
import { cn } from '../lib/utils';

interface InlineProps {
  feature: string;
  /** Tier that unlocks this feature */
  requiredTier: TierId;
  /** Optional override copy */
  description?: string;
  /** Compact = icon row, full = full card. Default full. */
  variant?: 'compact' | 'full';
  className?: string;
}

/** Inline upgrade banner — drop above any gated section. */
export function UpgradeBanner({ feature, requiredTier, description, variant = 'full', className }: InlineProps) {
  const required = TIER_BY_ID[requiredTier];
  if (variant === 'compact') {
    return (
      <Link
        to={`/subscription?upgrade=${requiredTier}`}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-white transition-all',
          className,
        )}
      >
        <Lock className="w-3 h-3" />
        Locked · upgrade to {required.name}
        <ArrowRight className="w-3 h-3" />
      </Link>
    );
  }
  return (
    <div className={cn('manifest-card p-6 bg-gradient-to-br from-primary/10 via-dark to-dark border border-primary/30 flex items-start gap-4', className)}>
      <div className="w-10 h-10 border border-primary/40 flex items-center justify-center shrink-0">
        <Lock className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">
          {required.name} tier feature
        </div>
        <h3 className="text-xl font-black italic text-white mb-2">{feature}</h3>
        <p className="text-[12px] text-white/60 italic leading-relaxed mb-4">
          {description || `${feature} unlocks on the ${required.name} tier. ${required.tagline}`}
        </p>
        <Link
          to={`/subscription?upgrade=${requiredTier}`}
          className="inline-flex items-center gap-2 h-10 px-5 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all"
        >
          Upgrade to {required.name}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

/** Modal that fires when user clicks a gated action. */
export function UpgradeModal({
  open,
  feature,
  requiredTier,
  reason,
  onClose,
}: {
  open: boolean;
  feature: string;
  requiredTier: TierId;
  reason?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  const required = TIER_BY_ID[requiredTier];
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade required"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="manifest-card p-8 bg-dark border-primary/40 max-w-md w-full"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 border border-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">
          Upgrade required
        </div>
        <h2 className="text-3xl font-black italic text-white tracking-tight mb-3">{feature}</h2>
        {reason && (
          <p className="text-sm text-white/60 italic mb-5 leading-relaxed">{reason}</p>
        )}
        <div className="border-t border-white/10 pt-5 space-y-2 mb-6">
          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-2">
            {required.name} tier includes
          </div>
          <ul className="text-[12px] text-white/70 italic space-y-1.5 list-none">
            {(() => {
              const f = required.features;
              const bullets: string[] = [];
              if (required.uncappedAi) bullets.push('Uncapped AI studios');
              else if (required.aiRunsPerMonth > 5) bullets.push(`${required.aiRunsPerMonth} AI runs/month`);
              if (required.maxReleasesPerYear === null) bullets.push('Unlimited releases');
              if (required.royaltyCutPct === 0) bullets.push('0% royalty cut');
              if (f.advances) bullets.push('Royalty advances');
              if (f.customLabel) bullets.push('Custom label name');
              if (f.hiResAudio) bullets.push('Hi-res / Dolby Atmos');
              if (f.syncPitching) bullets.push('Sync licensing pitch queue');
              if (f.multiUser) bullets.push('Multi-user + roles');
              return bullets.slice(0, 6).map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span> {b}
                </li>
              ));
            })()}
          </ul>
        </div>
        <Link
          to={`/subscription?upgrade=${requiredTier}`}
          onClick={onClose}
          className="block w-full h-12 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2"
        >
          Upgrade to {required.name}
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={onClose}
          className="w-full mt-2 h-10 text-[10px] font-black text-white/40 hover:text-white uppercase italic tracking-widest"
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}

/** Hook that returns a guard fn + modal state for use anywhere. */
export function useTierGate() {
  const sub = useSubscription();
  return {
    /** Check if user can perform an action with this cap kind. Returns { allowed, reason }. */
    check(kind: 'release' | 'ai-run' | 'artist', current = 0) {
      const reason = sub.checkCap(kind, current);
      return { allowed: !reason, reason };
    },
    /** Check feature flag */
    has(key: Parameters<typeof sub.hasFeature>[0]) {
      return sub.hasFeature(key);
    },
    /** Current tier */
    tier: sub.tier,
    /** Recommended target tier when blocked (next paid tier up) */
    suggestUpgrade(currentBlock?: 'free' | 'indie' | 'pro'): TierId {
      const t = sub.tier.id;
      if (currentBlock) {
        if (currentBlock === 'free') return 'indie';
        if (currentBlock === 'indie') return 'pro';
        return 'label';
      }
      if (t === 'free') return 'indie';
      if (t === 'indie') return 'pro';
      return 'label';
    },
  };
}
