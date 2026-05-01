/**
 * COMMAND CENTER — internal-only oversight dashboard.
 *
 * Hidden from sidebar, no public link. Access:
 *   - Direct URL: /command
 *   - Keyboard shortcut: Cmd+Shift+C (mac) / Ctrl+Shift+C (win) anywhere in app
 *
 * Auth gate: must be logged in as an admin email (allowlisted in
 * src/lib/admin.ts and on the backend ADMIN_EMAILS env var).
 *
 * Tabs:
 *   1. OVERVIEW   — KPIs at a glance
 *   2. AI WORKSPACE — live job feed + brain health
 *   3. ARTISTS    — every account on the platform
 *   4. RELEASES   — pipeline by status
 *   5. MONEY      — subscriptions + advances + payouts + royalty rollups
 *   6. KEYS       — provider key inventory + test
 *   7. FLAGS      — runtime feature toggles + kill switches
 *   8. AUDIT      — every audit-logged event
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Sparkles,
  Users,
  Disc,
  CreditCard,
  KeyRound,
  ToggleRight,
  ScrollText,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Zap,
  AlertTriangle,
  ExternalLink,
  Server,
  Building2,
  Clock,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail, adminHeaders, setAdminSession } from '../lib/admin';
import { useStudioJobs } from '../lib/studios/useStudioJobs';
import { useStudioOutputs } from '../lib/studios/useStudioOutputs';
import { STUDIO_BY_ID } from '../lib/studios/registry';
import { useSubscription } from '../context/SubscriptionContext';
import { useReleases } from '../context/ReleaseContext';

type TabId = 'overview' | 'ai' | 'artists' | 'releases' | 'money' | 'keys' | 'flags' | 'audit';

const TABS: Array<{ id: TabId; label: string; icon: any }> = [
  { id: 'overview', label: 'Overview',     icon: Activity },
  { id: 'ai',       label: 'AI Workspace', icon: Sparkles },
  { id: 'artists',  label: 'Artists',      icon: Users },
  { id: 'releases', label: 'Releases',     icon: Disc },
  { id: 'money',    label: 'Money',        icon: CreditCard },
  { id: 'keys',     label: 'Keys',         icon: KeyRound },
  { id: 'flags',    label: 'Flags',        icon: ToggleRight },
  { id: 'audit',    label: 'Audit',        icon: ScrollText },
];

/* =========================================================================
 * MAIN
 * ========================================================================= */
export default function CommandCenter() {
  const { user } = useAuth();
  const adminAllowed = isAdminEmail(user?.email);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [emergencyPwd, setEmergencyPwd] = useState('');
  const [emergencyAttempted, setEmergencyAttempted] = useState(false);

  // Mark admin session active for the lifetime of this component
  useEffect(() => {
    if (adminAllowed) setAdminSession(true);
    return () => setAdminSession(false);
  }, [adminAllowed]);

  // If not allowed and no emergency override yet → show locked screen
  if (!adminAllowed && !emergencyAttempted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 technical-grid">
        <div className="max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
          <div className="text-[10px] font-black tracking-[0.4em] uppercase italic text-primary mb-3">
            Restricted area
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
            Command Center
          </h1>
          <p className="text-white/50 italic mb-8">
            Admin access required. Sign in with an authorised email or enter the emergency password.
          </p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full h-12 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Sign in
            </Link>

            <details className="text-left">
              <summary className="text-[10px] font-black text-white/30 uppercase tracking-widest italic cursor-pointer hover:text-white">
                Emergency password
              </summary>
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  value={emergencyPwd}
                  onChange={(e) => setEmergencyPwd(e.target.value)}
                  placeholder="Admin emergency password..."
                  className="w-full bg-black border border-white/10 py-3 px-3 text-white text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => {
                    if (!emergencyPwd) return;
                    localStorage.setItem('dropkast.admin.password', emergencyPwd);
                    setEmergencyAttempted(true);
                    toast.message('Emergency password set — backend will validate on each request.');
                  }}
                  className="w-full h-10 border border-primary/30 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all"
                >
                  Use emergency password
                </button>
              </div>
            </details>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-8 text-[10px] font-black text-white/30 hover:text-white tracking-[0.3em] uppercase italic"
          >
            <ChevronLeft className="w-3 h-3" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-gradient-to-r from-primary/5 via-black to-black sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white/40 hover:text-white" title="Back to app">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic">DropKast · Internal</div>
              <h1 className="text-2xl font-black italic tracking-tight">Command Center</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
            <span>·</span>
            <span>{user?.email || 'emergency'}</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="border-t border-white/5 overflow-x-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase italic tracking-widest transition-all border-b-2 whitespace-nowrap',
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-white/40 border-transparent hover:text-white hover:border-white/20',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Body */}
      <main className="max-w-[1600px] mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'ai'       && <AIWorkspaceTab />}
            {activeTab === 'artists'  && <ArtistsTab />}
            {activeTab === 'releases' && <ReleasesTab />}
            {activeTab === 'money'    && <MoneyTab />}
            {activeTab === 'keys'     && <KeysTab />}
            {activeTab === 'flags'    && <FlagsTab />}
            {activeTab === 'audit'    && <AuditTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* =========================================================================
 * OVERVIEW — top-level KPIs
 * ========================================================================= */
function OverviewTab() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', { headers: adminHeaders(user?.email) });
      if (res.ok) setData(await res.json());
    } catch {/* ignore */}
    setLoading(false);
  }, [user?.email]);

  useEffect(() => { void refresh(); }, [refresh]);

  const counts = data?.counts || {};
  const revenue = data?.revenue || {};

  const kpis = [
    { label: 'Live releases',  value: counts.liveReleases || 0,             icon: Disc },
    { label: 'Total releases', value: counts.releases || 0,                 icon: Disc },
    { label: 'Influencers',    value: counts.influencers || 0,              icon: Users },
    { label: 'Creators paid',  value: counts.creators || 0,                 icon: CreditCard },
    { label: 'Royalty volume', value: `$${((revenue.totalRoyaltyLineCents || 0) / 100).toLocaleString()}`, icon: Activity },
    { label: 'Payouts run',    value: counts.payouts || 0,                  icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter">Platform pulse</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-4 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 hover:bg-white hover:text-black transition-all"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="manifest-card p-5 bg-dark border border-white/10">
              <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-2">
                <Icon className="w-3 h-3" /> {k.label}
              </div>
              <div className="text-3xl font-black italic text-white">{k.value}</div>
            </div>
          );
        })}
      </div>

      <RecentAuditCard events={data?.recentAudit || []} />
    </div>
  );
}

/* =========================================================================
 * AI WORKSPACE — live job feed + brain health pings
 * ========================================================================= */
function AIWorkspaceTab() {
  const { user } = useAuth();
  const { jobs } = useStudioJobs();
  const { outputs } = useStudioOutputs();
  const [health, setHealth] = useState<any>(null);
  const [pinging, setPinging] = useState(false);

  const ping = useCallback(async () => {
    setPinging(true);
    try {
      const res = await fetch('/api/admin/health', { headers: adminHeaders(user?.email) });
      if (res.ok) setHealth(await res.json());
    } catch {/* ignore */}
    setPinging(false);
  }, [user?.email]);

  useEffect(() => { void ping(); }, [ping]);

  // Outputs grouped by studio for stats
  const studioStats = useMemo(() => {
    const map: Record<string, { count: number; lastAt?: string }> = {};
    for (const o of outputs) {
      if (!map[o.studioId]) map[o.studioId] = { count: 0 };
      map[o.studioId].count++;
      if (!map[o.studioId].lastAt || o.createdAt > (map[o.studioId].lastAt || '')) {
        map[o.studioId].lastAt = o.createdAt;
      }
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [outputs]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter">AI behind the scenes</h2>
        <button
          onClick={ping}
          disabled={pinging}
          className="flex items-center gap-2 h-9 px-4 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 hover:bg-white hover:text-black transition-all"
        >
          {pinging ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Ping providers
        </button>
      </div>

      {/* Provider health */}
      <div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
          Brain status
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {(health?.providers || []).map((p: any) => (
            <div
              key={p.id}
              className={cn(
                'p-3 border text-left',
                p.ok ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5',
              )}
            >
              <div className="text-xs font-black italic text-white">{p.label}</div>
              <div className={cn('text-[10px] font-black uppercase tracking-widest italic mt-1', p.ok ? 'text-green-400' : 'text-red-400')}>
                {p.ok ? `${p.latencyMs}ms` : p.error || 'down'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live job queue */}
      <div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
          Live job queue · {jobs.length}
        </div>
        <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
          {jobs.length === 0 ? (
            <div className="p-6 text-center text-white/30 italic text-sm">
              Nothing running. Studios run client-side — fire one from /studios to see it here.
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-white/10">
                <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  <th className="px-4 py-3">Studio</th>
                  <th className="px-4 py-3">Brain</th>
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Started</th>
                  <th className="px-4 py-3">Input snapshot</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 30).map((j) => {
                  const def = STUDIO_BY_ID[j.studioId];
                  return (
                    <tr key={j.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm font-black italic text-white">{def?.name || j.studioId}</td>
                      <td className="px-4 py-3 text-[11px] text-white/60 font-mono uppercase">{j.brain}</td>
                      <td className="px-4 py-3 text-[11px] text-white/60">{j.persona || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={j.status} />
                      </td>
                      <td className="px-4 py-3 text-[10px] text-white/40 italic">
                        {j.startedAt ? new Date(j.startedAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-white/40 italic max-w-md truncate">
                        {Object.entries(j.input).slice(0, 3).map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`).join(' · ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Per-studio output stats */}
      <div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
          Output volume by studio · {outputs.length} total
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {studioStats.map(([studioId, s]) => {
            const def = STUDIO_BY_ID[studioId as any];
            if (!def) return null;
            const Icon = def.icon;
            return (
              <Link
                key={studioId}
                to={`/studio/${studioId}`}
                className="manifest-card p-4 bg-dark border border-white/10 hover:border-primary transition-all flex items-center gap-3"
              >
                <Icon className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black italic text-white truncate">{def.name}</div>
                  <div className="text-[10px] text-white/40 italic">
                    {s.count} outputs · last {s.lastAt ? new Date(s.lastAt).toLocaleString() : '—'}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-white/30" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * ARTISTS — every artist on the platform (label roster + standalone)
 * ========================================================================= */
function ArtistsTab() {
  const { allReleases } = useReleases();

  // Pull label roster
  let roster: any[] = [];
  try {
    roster = JSON.parse(localStorage.getItem('dropkast.label.roster') || '[]');
  } catch {/* ignore */}

  // Releases-per-artist
  const releaseCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of allReleases) {
      const name = (r as any).artist || 'Unknown';
      map.set(name, (map.get(name) || 0) + 1);
    }
    return map;
  }, [allReleases]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black italic tracking-tighter">Artists</h2>

      <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-white/10">
            <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
              <th className="px-4 py-3">Artist</th>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Releases</th>
              <th className="px-4 py-3">Monthly streams</th>
              <th className="px-4 py-3">Monthly $</th>
            </tr>
          </thead>
          <tbody>
            {roster.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-white/30 italic">No artists in roster yet.</td></tr>
            )}
            {roster.map((a: any) => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-black italic text-white">{a.name}</td>
                <td className="px-4 py-3 text-[11px] text-white/60">{a.genre || '—'}</td>
                <td className="px-4 py-3"><StatusPill status={a.status} /></td>
                <td className="px-4 py-3 text-[11px] text-white/60">{a.releases ?? releaseCounts.get(a.name) ?? 0}</td>
                <td className="px-4 py-3 text-[11px] text-white/60">
                  {(a.monthlyStreams ?? 0).toLocaleString?.() || '—'}
                </td>
                <td className="px-4 py-3 text-[11px] text-primary font-black italic">
                  ${((a.monthlyEarningsCents || 0) / 100).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
 * RELEASES — pipeline by status
 * ========================================================================= */
function ReleasesTab() {
  const { allReleases } = useReleases();
  const buckets = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const r of allReleases) {
      const status = (r as any).status || 'Unknown';
      if (!map[status]) map[status] = [];
      map[status].push(r);
    }
    return map;
  }, [allReleases]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter">Release pipeline</h2>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
          {allReleases.length} total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(buckets).map(([status, list]) => (
          <div key={status} className="manifest-card p-5 bg-dark border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <StatusPill status={status} />
              <span className="text-2xl font-black italic text-white">{list.length}</span>
            </div>
            <ul className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
              {list.slice(0, 20).map((r: any) => (
                <li key={r.id} className="text-[11px] text-white/60 italic flex items-center justify-between">
                  <span className="truncate">{r.title || r.id}</span>
                  <span className="text-white/30 ml-2">{r.artist || ''}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {Object.keys(buckets).length === 0 && (
          <div className="manifest-card p-6 bg-dark border border-white/10 text-white/30 italic text-sm md:col-span-3 text-center">
            No releases on the platform yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * MONEY — subs / advances / payouts / royalties
 * ========================================================================= */
function MoneyTab() {
  const { user } = useAuth();
  const sub = useSubscription();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/finance', { headers: adminHeaders(user?.email) });
        if (res.ok) setData(await res.json());
      } catch {/* ignore */}
      setLoading(false);
    })();
  }, [user?.email]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black italic tracking-tighter">Money flow</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="manifest-card p-5 bg-dark border border-white/10">
          <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-2">Your tier</div>
          <div className="text-2xl font-black italic text-white">{sub.tier.name}</div>
          <Link to="/subscription" className="text-[10px] font-black text-primary hover:underline italic uppercase tracking-widest">
            Manage →
          </Link>
        </div>
        <div className="manifest-card p-5 bg-dark border border-white/10">
          <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-2">Total payouts</div>
          <div className="text-2xl font-black italic text-white">
            ${((data?.payouts?.totalCents || 0) / 100).toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40 italic">{data?.payouts?.count || 0} transfers</div>
        </div>
        <div className="manifest-card p-5 bg-dark border border-white/10">
          <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-2">Royalty volume</div>
          <div className="text-2xl font-black italic text-white">
            ${((data?.royalties?.totalCents || 0) / 100).toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40 italic">
            {data?.royalties?.totalQuantity || 0} streams logged
          </div>
        </div>
      </div>

      {/* Per-platform royalties */}
      {data?.royalties?.byPlatform && Object.keys(data.royalties.byPlatform).length > 0 && (
        <div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
            By platform
          </div>
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Streams</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.royalties.byPlatform).map(([k, v]: any) => (
                  <tr key={k} className="border-b border-white/5">
                    <td className="px-4 py-3 text-sm font-black italic text-white">{k}</td>
                    <td className="px-4 py-3 text-[11px] text-white/60">{v.quantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[11px] text-primary font-black">${((v.amountCents || 0) / 100).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent payouts */}
      {data?.payouts?.list?.length > 0 && (
        <div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
            Recent payouts
          </div>
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Payee</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payouts.list.slice(0, 30).map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-[10px] font-mono text-white/60">{p.id}</td>
                    <td className="px-4 py-3 text-[11px] text-white/60">{p.payeeEmail}</td>
                    <td className="px-4 py-3 text-[11px] text-primary">${((p.amountCents || 0) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && <div className="text-white/30 italic text-sm">Loading...</div>}
    </div>
  );
}

/* =========================================================================
 * KEYS — provider key inventory + test
 * ========================================================================= */
function KeysTab() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<any[]>([]);
  const [testing, setTesting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/keys', { headers: adminHeaders(user?.email) });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {/* ignore */}
  }, [user?.email]);

  useEffect(() => { void refresh(); }, [refresh]);

  const testKey = async (id: string) => {
    setTesting(id);
    try {
      const res = await fetch('/api/admin/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders(user?.email) },
        body: JSON.stringify({ providerId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`${data.label} OK`, { description: `${data.latencyMs}ms` });
      } else {
        toast.error(`${data.label || id} failed`, { description: data.error || 'unknown' });
      }
    } catch {
      toast.error('Test failed');
    }
    setTesting(null);
  };

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const k of keys) {
      if (!map[k.category]) map[k.category] = [];
      map[k.category].push(k);
    }
    return map;
  }, [keys]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter">API keys</h2>
        <button
          onClick={refresh}
          className="flex items-center gap-2 h-9 px-4 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 hover:bg-white hover:text-black transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="manifest-card p-5 bg-primary/5 border border-primary/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-[12px] text-white/70 italic leading-relaxed">
          Keys live in Vercel env vars — set new ones via{' '}
          <code className="text-primary">vercel env add</code> or the Vercel dashboard. This page
          never displays the actual key, only confirms whether one is configured. Test buttons run
          a free probe call to each provider.
        </div>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat}>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
            {cat}
          </div>
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Env var</th>
                  <th className="px-4 py-3">Configured</th>
                  <th className="px-4 py-3">Last 4</th>
                  <th className="px-4 py-3">Test</th>
                </tr>
              </thead>
              <tbody>
                {list.map((k) => (
                  <tr key={k.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-sm font-black italic text-white">{k.label}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-white/40">{k.envVar}</td>
                    <td className="px-4 py-3">
                      {k.configured ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-[10px] font-black uppercase italic tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                          {k.isPlaceholder && <span className="text-yellow-300 ml-2">(placeholder)</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-white/30 text-[10px] font-black uppercase italic tracking-widest">
                          <XCircle className="w-3 h-3" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono text-white/40">
                      {k.lastFour ? `••••${k.lastFour}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {cat === 'ai' && k.configured && (
                        <button
                          onClick={() => testKey(k.id)}
                          disabled={testing === k.id}
                          className="text-[10px] font-black text-primary hover:underline italic uppercase tracking-widest"
                        >
                          {testing === k.id ? 'Testing...' : 'Test now'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
 * FLAGS — runtime feature toggles
 * ========================================================================= */
function FlagsTab() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/feature-flags', { headers: adminHeaders(user?.email) });
      if (res.ok) {
        const data = await res.json();
        setFlags(data.flags || {});
      }
    } catch {/* ignore */}
  }, [user?.email]);

  useEffect(() => { void refresh(); }, [refresh]);

  const toggle = async (key: string) => {
    const newValue = !flags[key];
    try {
      const res = await fetch('/api/admin/feature-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders(user?.email) },
        body: JSON.stringify({ key, value: newValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setFlags(data.flags || {});
        toast.success(`${key} → ${newValue ? 'on' : 'off'}`);
      }
    } catch {
      toast.error('Couldn\'t update flag');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black italic tracking-tighter">Feature flags</h2>
      <p className="text-white/40 italic text-sm max-w-xl">
        Runtime kill switches. Effects apply immediately platform-wide.
      </p>

      <div className="manifest-card p-0 bg-dark border border-white/10">
        {Object.entries(flags).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0">
            <div>
              <div className="text-sm font-black italic text-white">{k}</div>
              <div className="text-[10px] text-white/40 italic">{describeFlag(k)}</div>
            </div>
            <button
              onClick={() => toggle(k)}
              className={cn(
                'h-8 w-14 border transition-all relative',
                v ? 'bg-primary border-primary' : 'bg-white/5 border-white/20',
              )}
              aria-label={`Toggle ${k}`}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white transition-all',
                  v ? 'right-0.5' : 'left-0.5',
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function describeFlag(k: string): string {
  switch (k) {
    case 'freeTierEnabled':         return 'Allow new free signups + render Free tier on /pricing';
    case 'newSignupsEnabled':       return 'Master kill switch for the entire signup flow';
    case 'aiBudgetEnforced':        return 'Enforce per-user daily AI cost cap (api/_ai-budget)';
    case 'advancesAvailable':       return 'Show /advances and surface advance offers';
    case 'showCommandCenterButton': return 'Render a Command Center link in admins\' sidebar';
    default:                        return 'Custom runtime toggle';
  }
}

/* =========================================================================
 * AUDIT — every audit-logged event
 * ========================================================================= */
function AuditTab() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/audit', { headers: adminHeaders(user?.email) });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || data || []);
        }
      } catch {/* ignore */}
    })();
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black italic tracking-tighter">Audit log</h2>
      <RecentAuditCard events={events} fullList />
    </div>
  );
}

/* =========================================================================
 * SHARED COMPONENTS
 * ========================================================================= */
function RecentAuditCard({ events, fullList }: { events: any[]; fullList?: boolean }) {
  if (!events || events.length === 0) {
    return (
      <div className="manifest-card p-6 bg-dark border border-white/10 text-white/30 italic text-sm text-center">
        No audit events yet.
      </div>
    );
  }
  return (
    <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead className="border-b border-white/10">
          <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Resource</th>
          </tr>
        </thead>
        <tbody>
          {events.slice(0, fullList ? 200 : 12).map((e: any, i: number) => (
            <tr key={e.id || i} className="border-b border-white/5">
              <td className="px-4 py-3 text-[10px] text-white/40 font-mono">
                {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}
              </td>
              <td className="px-4 py-3 text-[11px] text-white/70 italic">{e.actorId || '—'}</td>
              <td className="px-4 py-3 text-[11px] text-primary font-black italic">{e.action || e.event || '—'}</td>
              <td className="px-4 py-3 text-[11px] text-white/50 font-mono">{e.resource || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = (() => {
    const s = (status || '').toLowerCase();
    if (s.includes('live') || s.includes('paid') || s.includes('done') || s.includes('active'))   return 'border-green-500/40 text-green-300 bg-green-500/5';
    if (s.includes('failed') || s.includes('error') || s.includes('rejected') || s.includes('cancelled')) return 'border-red-500/40 text-red-300 bg-red-500/5';
    if (s.includes('queue') || s.includes('pending') || s.includes('draft') || s.includes('review')) return 'border-yellow-500/40 text-yellow-300 bg-yellow-500/5';
    if (s.includes('running') || s.includes('processing') || s.includes('delivering'))            return 'border-primary/40 text-primary bg-primary/5';
    return 'border-white/20 text-white/50 bg-white/5';
  })();
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 border text-[9px] font-black uppercase italic tracking-widest', cls)}>
      {status || '—'}
    </span>
  );
}
