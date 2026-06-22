/**
 * Audience Insights — demographics + store comparison.
 *
 * Mirrors ONErpm's Demographics + Store Comparison views. Pulls from
 * Spotify For Artists + Apple Music For Artists once OAuth lands; mock
 * data shape today.
 */
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Users, BarChart3, Globe2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Pulls from /api/analytics/demographics once OAuth lands. Empty until then.
const DEMOGRAPHICS = {
  gender: [] as { label: string; pct: number; color: string }[],
  age: [] as { label: string; pct: number }[],
  source: [] as { label: string; pct: number }[],
  subscription: [] as { label: string; pct: number; color: string }[],
  territories: [] as { country: string; code: string; streams: number; share: number }[],
};

const STORE_COMPARISON: { id: string; label: string; brand: string; streams: number; revenueCents: number; share: number }[] = [];

export default function AudienceInsights() {
  const [view, setView] = useState<'demographics' | 'stores' | 'territories'>('demographics');

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-10">
        <Link to="/analytics" className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white uppercase italic tracking-widest mb-6">
          <ChevronLeft className="w-3 h-3" /> Back to analytics
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
              <Users className="w-3 h-3" /> Audience Insights
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Who's <span className="text-primary">listening</span>
            </h1>
            <p className="text-white/40 text-sm italic max-w-2xl">
              Demographics, store-by-store breakdown, and top countries. Updates daily from Spotify
              For Artists + Apple Music For Artists once you claim your profiles on the dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-1">
        {[
          { id: 'demographics' as const, label: 'Demographics', icon: Users },
          { id: 'stores'       as const, label: 'Store Comparison', icon: BarChart3 },
          { id: 'territories'  as const, label: 'Top Territories', icon: Globe2 },
        ].map((t) => {
          const Icon = t.icon;
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase italic tracking-widest transition-all border-b-2',
                active ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white',
              )}
            >
              <Icon className="w-3 h-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Demographics view */}
      {view === 'demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PieCard title="Gender" data={DEMOGRAPHICS.gender} />
          <BarCard title="Age" data={DEMOGRAPHICS.age} />
          <BarCard title="Source" data={DEMOGRAPHICS.source} />
          <PieCard title="Subscription type" data={DEMOGRAPHICS.subscription} />
        </div>
      )}

      {/* Store comparison */}
      {view === 'stores' && (
        <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-white/10">
              <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3 text-right">Streams (30d)</th>
                <th className="px-5 py-3">Share</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">$ / 1K plays</th>
              </tr>
            </thead>
            <tbody>
              {STORE_COMPARISON.map((s, idx) => {
                const rpm = (s.revenueCents / 100) / (s.streams / 1000);
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: s.brand }} />
                        <span className="text-sm font-black italic text-white">{s.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-[12px] text-white font-mono tabular-nums">
                      {s.streams.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 relative overflow-hidden max-w-[140px]">
                          <div className="absolute top-0 left-0 h-full" style={{ width: `${s.share * 2}%`, background: s.brand }} />
                        </div>
                        <span className="text-[10px] text-white/50 tabular-nums w-12">{s.share}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-[12px] text-primary font-black italic tabular-nums">
                      ${(s.revenueCents / 100).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-[10px] text-white/40 font-mono tabular-nums">
                      ${rpm.toFixed(2)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Territories */}
      {view === 'territories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 text-[10px] font-black text-primary uppercase tracking-widest italic">
              Top 8 countries · last 30 days
            </div>
            {DEMOGRAPHICS.territories.map((t, idx) => (
              <motion.div
                key={t.code}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="px-5 py-3 border-b border-white/5 last:border-b-0 flex items-center gap-4"
              >
                <span className="text-[10px] font-mono text-white/30 tabular-nums w-6">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 w-8">{t.code}</span>
                <span className="text-sm font-black italic text-white flex-1">{t.country}</span>
                <span className="text-[11px] text-white font-mono tabular-nums w-24 text-right">
                  {t.streams.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/40 tabular-nums w-12 text-right">{t.share}%</span>
              </motion.div>
            ))}
          </div>
          <div className="manifest-card p-6 bg-dark border border-primary/20">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
              Reach map
            </div>
            <p className="text-sm text-white/60 italic leading-relaxed mb-4">
              South Africa + Nigeria are your top markets and account for nearly half of your
              streams. Consider running pre-release seeding in those two regions first — your
              algorithmic reach there is 3.4× higher per dollar than US/UK.
            </p>
            <Link to="/studio/strategy" className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:underline italic uppercase tracking-widest">
              Generate a region-weighted campaign →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PieCard({ title, data }: { title: string; data: Array<{ label: string; pct: number; color?: string }> }) {
  return (
    <div className="manifest-card p-6 bg-dark border border-white/10">
      <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">{title}</div>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          {/* Simple stacked-bar circle visualisation */}
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {(() => {
              let cum = 0;
              return data.map((d, i) => {
                const dash = `${d.pct} ${100 - d.pct}`;
                const off = -cum;
                cum += d.pct;
                return (
                  <circle
                    key={i}
                    cx="18" cy="18" r="15.91549430918954"
                    fill="transparent"
                    stroke={d.color || '#FF4D00'}
                    strokeWidth="3.5"
                    strokeDasharray={dash}
                    strokeDashoffset={off}
                  />
                );
              });
            })()}
          </svg>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-[11px]">
              <div className="w-2 h-2 shrink-0" style={{ background: d.color || '#FF4D00' }} />
              <span className="text-white/70 flex-1 truncate">{d.label}</span>
              <span className="text-white font-black tabular-nums">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarCard({ title, data }: { title: string; data: Array<{ label: string; pct: number }> }) {
  return (
    <div className="manifest-card p-6 bg-dark border border-white/10">
      <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">{title}</div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-white/70">{d.label}</span>
              <span className="text-white font-black tabular-nums">{d.pct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: `${d.pct * 2.5}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
