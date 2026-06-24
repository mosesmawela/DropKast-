/**
 * Studios catalog — every gen studio in DropKast, in one place.
 *
 * Cards link to /studio/:id where StudioShell takes over.
 * Grouped by category. Shows recent activity per studio.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Play, ArrowRight, Layers, Activity } from 'lucide-react';
import { STUDIOS, CATEGORY_LABEL } from '../lib/studios/registry';
import { useStudioOutputs } from '../lib/studios/useStudioOutputs';
import type { StudioCategory } from '../lib/studios/types';
import { cn } from '../lib/utils';

const CATEGORY_ORDER: StudioCategory[] = ['visual', 'video', 'copy', 'audio', 'strategy'];

/** Honesty badges — how each studio's output is produced. */
export const TRUST_BADGE: Record<string, { label: string; color: string; tip: string }> = {
  'ai-draft':   { label: 'AI draft · you edit', color: '#FF8A4C', tip: 'AI generates a starting point. You review and edit — you are the author.' },
  'ai-insight': { label: 'AI insight',           color: '#3B82F6', tip: 'AI analysis and suggestions shown with confidence — not a final verdict.' },
  'human':      { label: 'Human-reviewed',       color: '#22C55E', tip: 'A real LVRN A&R reviews this — not an algorithm.' },
};

export default function Studios() {
  const { outputs } = useStudioOutputs();

  // Per-studio output count
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of outputs) map.set(o.studioId, (map.get(o.studioId) || 0) + 1);
    return map;
  }, [outputs]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <Layers className="w-3 h-3" /> Studios
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
            Generate <span className="text-primary">anything</span>
          </h1>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Every AI tool DropKast offers, in one place. Cover art. Video teasers. Captions.
            EPKs. A&R critique. Each studio runs on whichever AI brain you've picked, persists
            outputs to a gallery you can revisit, and pipes into other studios.
          </p>
        </div>

        <div className="manifest-card p-6 bg-dark border-primary/20 min-w-[220px]">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">
            <Activity className="w-3 h-3" /> Total outputs
          </div>
          <div className="text-4xl font-black italic text-white">{outputs.length}</div>
          <div className="text-[10px] text-white/40 italic mt-1">across all studios</div>
        </div>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const inCat = STUDIOS.filter((s) => s.category === cat);
        if (!inCat.length) return null;
        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">
                {CATEGORY_LABEL[cat]}
              </span>
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                {inCat.length} studio{inCat.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inCat.map((s, idx) => {
                const Icon = s.icon;
                const count = counts.get(s.id) || 0;
                const comingSoon = s.status === 'coming-soon';
                const trust = TRUST_BADGE[s.trust || 'ai-draft'];
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      to={`/studio/${s.id}`}
                      className={cn(
                        'manifest-card p-6 bg-dark border border-white/5 transition-all flex flex-col gap-4 h-full group relative',
                        comingSoon ? 'opacity-70 hover:border-white/20' : 'hover:border-primary/40',
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="w-11 h-11 border flex items-center justify-center transition-all"
                          style={{ borderColor: `${s.accentColor}55`, color: s.accentColor }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {comingSoon ? (
                          <span className="text-[8px] font-black uppercase tracking-widest italic px-2 py-1 border border-yellow-500/40 text-yellow-400 bg-yellow-500/5">
                            Coming soon
                          </span>
                        ) : count > 0 ? (
                          <div className="text-right">
                            <div className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">
                              In gallery
                            </div>
                            <div className="text-base font-black italic text-white">{count}</div>
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black italic text-white tracking-tight group-hover:text-primary transition-colors">
                            {s.name}
                          </h3>
                        </div>
                        <p className="text-[12px] text-white/50 italic leading-relaxed">{s.tagline}</p>
                      </div>

                      <div className="text-[11px] text-white/40 italic leading-relaxed flex-1">
                        {s.description}
                      </div>

                      {/* Honesty badge — how the output is produced */}
                      <span
                        className="self-start text-[8px] font-black uppercase tracking-widest italic px-2 py-1 border"
                        style={{ borderColor: `${trust.color}40`, color: trust.color, background: `${trust.color}10` }}
                        title={trust.tip}
                      >
                        {trust.label}
                      </span>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] text-white/30 italic">
                          {s.estimatedRuntimeSec && <span>~{s.estimatedRuntimeSec}s</span>}
                          {s.estimatedCostCents !== undefined && (
                            <>
                              <span>·</span>
                              <span>${(s.estimatedCostCents / 100).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                        {comingSoon ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                            Preview
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest italic">
                            <Play className="w-3 h-3" /> Open
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="mt-12 p-8 border border-primary/20 bg-primary/5 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Sparkles className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-xl font-black italic text-white mb-2">Workflows coming next</h3>
          <p className="text-sm text-white/60 italic leading-relaxed">
            Chain studios into pre-built recipes — "Singles release", "Sync placement", "Viral push".
            One click runs the whole pipeline: hook extraction → cover variations → captions →
            video teasers → smart link.
          </p>
        </div>
      </div>
    </div>
  );
}
