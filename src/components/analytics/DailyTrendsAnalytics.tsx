import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Download,
  Calendar,
  ChevronDown,
  BarChart3,
  Activity,
  AlertTriangle,
  Music,
  Globe,
  Store,
  Plus,
  SwitchCamera,
  BarChart,
  AreaChart,
  LineChart,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { BarChart as RechartBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart as ReArea, Area, LineChart as ReLine, Line } from 'recharts';
import ScrollReveal from '../animations/ScrollReveal';

type ChartMode = 'bar' | 'area' | 'line';
type FilterDimension = 'track' | 'country' | 'store';
type ViewMode = 'detailed' | 'aggregated';

const streamData: { name: string; value: number }[] = [];

export default function DailyTrendsAnalytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('Jun 12, 2026 - Jun 18, 2026');
  const [tab, setTab] = useState<'streams' | 'downloads'>('streams');
  const [filterDim, setFilterDim] = useState<FilterDimension>('track');
  const [chartMode, setChartMode] = useState<ChartMode>('bar');
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');

  const stats = [
    { label: 'TOTAL STREAMS', value: '0', icon: TrendingUp },
    { label: 'AVERAGE PER DAY', value: '0', icon: Activity },
    { label: 'FULL PLAYS', value: '0', icon: BarChart3 },
    { label: 'SKIPPED', value: '0', icon: AlertTriangle, alert: true },
  ];

  const topTracks: { track: string; streams: string; change: string; skips: string }[] = [];

  const ChartIcon = chartMode === 'bar' ? BarChart : chartMode === 'area' ? AreaChart : LineChart;

  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto py-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--border-main)] pb-8">
        <div>
          <div className="flex items-center gap-2 text-[#6A6A75] mb-2">
            <TrendingUp className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono">DAILY TRENDS CONSUMPTION INTERFACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-main)] uppercase font-mono">Daily Trends</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 px-4 py-3 border border-[var(--border-main)] text-[#9A9AA6] text-[10px] font-bold font-mono">
            <Calendar className="w-4 h-4" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <button className="beam flex items-center gap-2 px-6 py-3 bg-[#F05A28] text-white text-[10px] font-black uppercase tracking-widest font-mono italic transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-main)]">
        {(['streams', 'downloads'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest font-mono transition-all',
              tab === t ? 'text-[#F05A28] border-b-2 border-[#F05A28]' : 'text-[#6A6A75]',
            )}
          >
            {t === 'streams' ? 'MUSIC STREAMS' : 'MUSIC DOWNLOADS'}
          </button>
        ))}
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-main)] p-6 flex items-start justify-between">
            <div>
              <div className="text-[9px] font-bold text-[#6A6A75] uppercase tracking-widest font-mono mb-2">{s.label}</div>
              <div className="text-2xl font-black text-[var(--text-main)] font-mono">{s.value}</div>
            </div>
            <div className="flex items-center gap-2">
              <s.icon className={cn('w-5 h-5', s.alert ? 'text-amber-500' : 'text-[#55555f]')} />
              {s.alert && <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Strip */}
      <div className="bg-black/20 border border-[var(--border-main)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex border border-[var(--border-main)] bg-[var(--card-bg)]">
            {(['track', 'country', 'store'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDim(d)}
                className={cn(
                  'px-5 py-3 text-[9px] font-black uppercase tracking-widest font-mono transition-all flex items-center gap-2',
                  filterDim === d ? 'bg-[#F05A28] text-white' : 'text-[#8A8A93]',
                )}
              >
                {d === 'track' && <Music className="w-3 h-3" />}
                {d === 'country' && <Globe className="w-3 h-3" />}
                {d === 'store' && <Store className="w-3 h-3" />}
                {d.toUpperCase()}
              </button>
            ))}
          </div>

          <select className="border border-[var(--border-main)] px-4 py-3 text-[9px] font-bold text-[#9A9AA6] uppercase tracking-widest font-mono bg-[var(--card-bg)]">
            <option>Tracks: All Tracks</option>
          </select>

          <button className="beam flex items-center gap-1 px-4 py-3 border border-dashed border-[var(--border-main)] text-[#6A6A75] transition-all text-[9px] font-bold uppercase tracking-widest font-mono">
            <Plus className="w-3 h-3" />
            ADD FILTER
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[8px] font-bold text-[#6A6A75] uppercase tracking-widest font-mono">View:</span>
            <div className="flex border border-[var(--border-main)] bg-[var(--card-bg)]">
              {(['detailed', 'aggregated'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={cn(
                    'px-4 py-2 text-[8px] font-black uppercase tracking-widest font-mono transition-all',
                    viewMode === v ? 'bg-white/10 text-white' : 'text-[#8A8A93]',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-[#6A6A75] uppercase tracking-widest font-mono">Charts:</span>
            <div className="flex border border-[var(--border-main)] bg-[var(--card-bg)]">
              {(['bar', 'area', 'line'] as const).map((c) => {
                const IconComponent = c === 'bar' ? BarChart : c === 'area' ? AreaChart : LineChart;
                return (
                  <button
                    key={c}
                    onClick={() => setChartMode(c)}
                    className={cn(
                      'px-4 py-2 transition-all',
                      chartMode === c ? 'bg-[#F05A28] text-white' : 'text-[#6A6A75]',
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-main)] p-4 sm:p-8 min-h-[350px]">
        {streamData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-[var(--border-main)] bg-black/20">
            <BarChart3 className="w-12 h-12 text-white/30 mb-4" />
            <p className="text-[10px] font-bold text-[#6A6A75] uppercase tracking-widest font-mono">
              No data is currently available to view.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartMode === 'bar' ? (
              <RechartBar data={streamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b7280' }} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="value" fill="#F05A28" radius={[0, 0, 0, 0]} />
              </RechartBar>
            ) : chartMode === 'area' ? (
              <ReArea data={streamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b7280' }} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Area type="monotone" dataKey="value" stroke="#F05A28" fill="#F05A28" fillOpacity={0.1} />
              </ReArea>
            ) : (
              <ReLine data={streamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b7280' }} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <ReLine type="monotone" dataKey="value" stroke="#F05A28" strokeWidth={2} dot={false} />
              </ReLine>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Tracks Table */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-[#C9C9CF] uppercase font-mono tracking-tight">Top Tracks Acquisition Lifecycle</h2>
        <div className="bg-[var(--card-bg)] border border-[var(--border-main)] overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-main)] bg-black/20/50">
                {['TRACK', 'STREAMS', 'CHANGE', 'SKIPS', 'ACTIONS'].map((h) => (
                  <th key={h} className="px-6 py-4 text-[9px] font-bold text-[#8A8A93] tracking-widest uppercase font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topTracks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <span className="text-[10px] font-bold text-[#55555f] uppercase tracking-widest font-mono">
                      No data available
                    </span>
                  </td>
                </tr>
              )}
              {topTracks.map((t, i) => (
                <tr key={i} className="border-b border-[var(--border-main)] transition-colors">
                  <td className="px-6 py-5 text-xs font-bold text-[#C9C9CF] font-mono">{t.track}</td>
                  <td className="px-6 py-5 text-[10px] font-bold text-[#9A9AA6] font-mono">{t.streams}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-[#6A6A75] font-mono">{t.change}</span>
                  </td>
                  <td className="px-6 py-5 text-[10px] font-bold text-[#6A6A75] font-mono">{t.skips}</td>
                  <td className="px-6 py-5">
                    <button className="text-[9px] font-bold text-[#F05A28] uppercase tracking-widest font-mono hover:underline flex items-center gap-1">
                      View <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
