/**
 * What's Trending — emerging sub-genres + community signals.
 *
 * For artists deciding what to make next: surfaces the micro-genres our
 * community + the wider scene is creating. Each card shows the vibe, who's
 * already working in it, where the heat is coming from, and a "pulse" bar
 * that visualises how loud the signal is right now.
 */
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  TrendingUp,
  Hash,
  Sparkles,
  Filter,
  ChevronRight,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { momentumColor, momentumLabel, type SubGenre, type TrendMomentum } from '../lib/trending';

const MOMENTUM_FILTERS: Array<TrendMomentum | 'all'> = ['all', 'spiking', 'rising', 'steady', 'cooling'];

export default function Trending() {
  const [momentum, setMomentum] = useState<TrendMomentum | 'all'>('all');
  const [trends] = useState<SubGenre[]>([]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trends
      .filter((t) => (momentum === 'all' ? true : t.momentum === momentum))
      .filter((t) => {
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.parentGenre.toLowerCase().includes(q) ||
          t.vibe.some((v) => v.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.pulse - a.pulse);
  }, [momentum, search]);

  const counts = useMemo(() => {
    const c = { spiking: 0, rising: 0, steady: 0, cooling: 0 };
    for (const t of trends) c[t.momentum]++;
    return c;
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <Flame className="w-3 h-3" /> What's Trending
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
            New <span className="text-primary">sub-genres</span> moving now
          </h1>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Emerging micro-genres being created by our community + the wider scene. Track the
            pulse, see who's leading, pick a lane before it gets crowded. Refreshes weekly.
          </p>
        </div>

        <div className="manifest-card p-5 bg-dark border-primary/20 min-w-[240px]">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
            <TrendingUp className="w-3 h-3" /> Heat right now
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-red-300">🔥 Spiking</span>
              <span className="text-white font-black tabular-nums">{counts.spiking}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-300">↗ Rising</span>
              <span className="text-white font-black tabular-nums">{counts.rising}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">— Steady</span>
              <span className="text-white font-black tabular-nums">{counts.steady}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-indigo-300">↘ Cooling</span>
              <span className="text-white font-black tabular-nums">{counts.cooling}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex items-center gap-1 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic mr-2">
          <Filter className="w-3 h-3" /> Momentum
        </div>
        {MOMENTUM_FILTERS.map((m) => (
          <button
            key={m}
            onClick={() => setMomentum(m)}
            className={cn(
              'h-9 px-4 text-[10px] font-black uppercase italic tracking-widest border transition-all',
              momentum === m
                ? 'bg-primary text-white border-primary'
                : 'text-white/50 border-white/10 hover:border-white/30 hover:text-white',
            )}
          >
            {m === 'all' ? 'All' : momentumLabel(m as TrendMomentum)}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search genre, vibe, or hashtag..."
          className="ml-auto bg-dark border border-white/10 py-2 px-4 text-sm text-white focus:outline-none focus:border-primary w-72"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((trend, idx) => (
          <TrendCard key={trend.id} trend={trend} idx={idx} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10">
          <div className="text-white/40 italic mb-2">No trending sub-genres yet. Check back when the community starts building.</div>
        </div>
      )}

      {/* Bottom info */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="manifest-card p-6 bg-dark border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-base font-black italic text-white">How we pick these</h3>
          </div>
          <p className="text-sm text-white/60 italic leading-relaxed">
            Curated by the LVRN A&R desk + our AI scouts that scan TikTok sound velocity, Spotify
            algorithmic surfaces, and SoundCloud upload patterns. New entries weekly.
          </p>
        </div>
        <div className="manifest-card p-6 bg-dark border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-white/70" />
            <h3 className="text-base font-black italic text-white">Created something we should add?</h3>
          </div>
          <p className="text-sm text-white/60 italic leading-relaxed mb-4">
            If your community is building a sub-genre that's not here yet, send it to A&R.
          </p>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:underline uppercase italic tracking-widest"
          >
            Submit to A&R <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TrendCard({ trend, idx }: { trend: SubGenre; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
      className="manifest-card bg-dark border border-white/5 hover:border-white/20 transition-all overflow-hidden group"
      style={{ borderTop: `3px solid ${trend.accent}` }}
    >
      {/* Header */}
      <div className="p-6 pb-4 relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div
              className="text-[9px] font-black uppercase tracking-[0.3em] italic mb-2"
              style={{ color: trend.accent }}
            >
              {trend.parentGenre}
            </div>
            <h3 className="text-2xl font-black italic text-white tracking-tight">{trend.name}</h3>
          </div>
          <div
            className="text-[9px] font-black tracking-widest italic px-2 py-1 border whitespace-nowrap"
            style={{ color: momentumColor(trend.momentum), borderColor: `${momentumColor(trend.momentum)}55` }}
          >
            {momentumLabel(trend.momentum)}
          </div>
        </div>

        <p className="text-[12px] text-white/60 italic leading-relaxed mb-4">{trend.description}</p>

        {/* Vibe pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trend.vibe.map((v) => (
            <span
              key={v}
              className="text-[9px] font-black uppercase tracking-widest italic px-2 py-0.5 border"
              style={{ borderColor: `${trend.accent}55`, color: trend.accent }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Pulse meter */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1.5">
          <span>Pulse</span>
          <span className="tabular-nums text-white">{trend.pulse}/100</span>
        </div>
        <div className="h-1.5 bg-white/5 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full transition-all"
            style={{ width: `${trend.pulse}%`, background: trend.accent }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/40 space-y-2.5">
        <div>
          <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1">
            Who's in this lane
          </div>
          <div className="text-[11px] text-white/70 italic truncate">{trend.exampleArtists.join(' · ')}</div>
        </div>

        <div>
          <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1">
            Origin
          </div>
          <div className="text-[11px] text-white/70 italic">{trend.origin}</div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {trend.tags.map((t) => (
            <span key={t} className="text-[9px] font-mono text-white/50 flex items-center gap-0.5">
              <Hash className="w-2.5 h-2.5" />
              {t.replace('#', '')}
            </span>
          ))}
        </div>

        {trend.creatorCredit && (
          <div className="text-[9px] font-black uppercase tracking-widest italic pt-2 border-t border-white/5" style={{ color: trend.accent }}>
            ★ Surfaced by {trend.creatorCredit}
          </div>
        )}
      </div>
    </motion.div>
  );
}
