/**
 * Music Charts — daily chart positions per DSP / territory.
 *
 * Mock data today (Spotify For Artists + Apple Music For Artists API
 * integrations are scaffold-only). Structure is real; swap the data
 * source when OAuth lands.
 */
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

type DSP = 'spotify' | 'apple' | 'audiomack' | 'boomplay' | 'tiktok';
type Territory = 'global' | 'us' | 'uk' | 'za' | 'ng' | 'ke';

interface ChartEntry {
  trackTitle: string;
  artist: string;
  position: number;
  change: number; // positive = climbed, negative = dropped, 0 = new/stayed
  peakPosition: number;
  daysOnChart: number;
}

const DSPS: { id: DSP; label: string; brand: string }[] = [
  { id: 'spotify',   label: 'Spotify Viral 50', brand: '#1DB954' },
  { id: 'apple',     label: 'Apple Music Top 100', brand: '#FA2D48' },
  { id: 'audiomack', label: 'Audiomack Trending', brand: '#FFA200' },
  { id: 'boomplay',  label: 'Boomplay Top 50', brand: '#F09E2D' },
  { id: 'tiktok',    label: 'TikTok Sound Trends', brand: '#FF0050' },
];

const TERRITORIES: { id: Territory; label: string }[] = [
  { id: 'global', label: 'Global' },
  { id: 'us',     label: 'United States' },
  { id: 'uk',     label: 'United Kingdom' },
  { id: 'za',     label: 'South Africa' },
  { id: 'ng',     label: 'Nigeria' },
  { id: 'ke',     label: 'Kenya' },
];

function chartFor(_dsp: DSP, _territory: Territory): ChartEntry[] {
  // Once Spotify/Apple For-Artists OAuth lands, replace this with a real fetch.
  return [];
}

export default function MusicCharts() {
  const [dsp, setDsp] = useState<DSP>('spotify');
  const [territory, setTerritory] = useState<Territory>('za');

  const entries = useMemo(() => chartFor(dsp, territory), [dsp, territory]);
  const dspMeta = DSPS.find((d) => d.id === dsp)!;
  const myEntries = entries.filter((e) => /buddy kay|aqua pearl|ciza|night pulse|lyric storm|al xapo|solomon cyan/i.test(e.artist));

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-10">
        <Link to="/analytics" className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 uppercase italic tracking-widest mb-6">
          <ChevronLeft className="w-3 h-3" /> Back to analytics
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3 min-w-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
              <Trophy className="w-3 h-3" /> Music Charts
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Where your <span className="text-primary">tracks rank</span>
            </h1>
            <p className="text-white/40 text-sm italic max-w-2xl">
              Live chart positions per DSP and country. Updates daily from Spotify For Artists, Apple
              Music For Artists, Audiomack, Boomplay, and TikTok sound trends.
            </p>
          </div>

          <div className="manifest-card p-5 bg-dark border-primary/20 w-full md:w-auto md:min-w-[200px] shrink-0">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">
              Your tracks on this chart
            </div>
            <div className="text-4xl font-black italic text-white tabular-nums">
              {myEntries.length}
            </div>
            {myEntries.length > 0 && (
              <div className="text-[10px] text-white/40 italic mt-1">
                Best: #{Math.min(...myEntries.map((e) => e.position))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic mb-2">
            Chart source
          </div>
          <div className="flex flex-wrap gap-2">
            {DSPS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDsp(d.id)}
                className={cn(
                  'beam h-10 px-4 text-[10px] font-black uppercase italic tracking-widest border transition-all',
                  dsp === d.id
                    ? 'text-white'
                    : 'text-white/50 border-white/10',
                )}
                style={{
                  borderColor: dsp === d.id ? d.brand : undefined,
                  background: dsp === d.id ? `${d.brand}22` : undefined,
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic mb-2">
            Territory
          </div>
          <div className="flex flex-wrap gap-2">
            {TERRITORIES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTerritory(t.id)}
                className={cn(
                  'beam h-10 px-4 text-[10px] font-black uppercase italic tracking-widest border transition-all',
                  territory === t.id
                    ? 'bg-primary border-primary text-white'
                    : 'text-white/50 border-white/10',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart table */}
      <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <div className="w-2 h-2 rounded-full" style={{ background: dspMeta.brand }} />
            <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: dspMeta.brand }}>
              {dspMeta.label}
            </span>
            <span className="text-white/30 text-[10px] italic">·</span>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">
              {TERRITORIES.find((t) => t.id === territory)?.label}
            </span>
          </div>
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest italic shrink-0">
            Updated daily
          </span>
        </div>
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-white/10">
            <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
              <th className="px-5 py-3 w-16">Pos</th>
              <th className="px-5 py-3">Track</th>
              <th className="px-5 py-3">Artist</th>
              <th className="px-5 py-3 text-right">Move</th>
              <th className="px-5 py-3 text-right">Peak</th>
              <th className="px-5 py-3 text-right">Days on</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-[11px] text-white/30 italic">
                    No chart data yet. Connect Spotify For Artists or Apple Music For Artists from your dashboard to start tracking positions here.
                  </p>
                </td>
              </tr>
            )}
            {entries.map((e, idx) => {
              const isYours = false;
              return (
                <motion.tr
                  key={`${e.trackTitle}-${idx}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                  className={cn('border-b border-white/5', isYours && 'bg-primary/[0.04]')}
                >
                  <td className="px-5 py-3">
                    <span className={cn('text-2xl font-black italic tabular-nums', e.position <= 3 ? 'text-primary' : 'text-white/80')}>
                      {String(e.position).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-black italic text-white">
                    {e.trackTitle}
                    {isYours && <span className="ml-2 text-[8px] font-black tracking-widest text-primary">★ YOURS</span>}
                  </td>
                  <td className="px-5 py-3 text-[11px] text-white/60 italic">{e.artist}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-black italic tabular-nums',
                      e.change > 0 ? 'text-green-400' : e.change < 0 ? 'text-red-400' : 'text-white/40',
                    )}>
                      {e.change > 0 && <TrendingUp className="w-3 h-3" />}
                      {e.change < 0 && <TrendingDown className="w-3 h-3" />}
                      {e.change === 0 && <Minus className="w-3 h-3" />}
                      {e.change === 0 ? '—' : Math.abs(e.change)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[11px] text-white/60 font-mono tabular-nums">
                    #{e.peakPosition}
                  </td>
                  <td className="px-5 py-3 text-right text-[11px] text-white/40 font-mono tabular-nums">
                    {e.daysOnChart}d
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-[10px] font-black text-white/30 uppercase tracking-widest italic">
        Data sources: Spotify For Artists · Apple Music For Artists · Audiomack · Boomplay · TikTok Sound API.
        Connect each via /dashboard's claim card to enable per-territory drill-down.
      </div>
    </div>
  );
}
