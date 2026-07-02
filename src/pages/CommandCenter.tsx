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

type TabId = 'overview' | 'ai' | 'tokens' | 'artists' | 'releases' | 'money' | 'keys' | 'flags' | 'audit';

const TABS: Array<{ id: TabId; label: string; icon: any }> = [
  { id: 'overview', label: 'Overview',     icon: Activity },
  { id: 'ai',       label: 'AI Workspace', icon: Sparkles },
  { id: 'tokens',   label: 'Tokens',       icon: Activity },
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
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [privacyBlur, setPrivacyBlur] = useState<boolean>(() => {
    try { return localStorage.getItem('dropkast.command.blur') === '1'; } catch { return false; }
  });
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [sseConnected, setSseConnected] = useState(false);

  // Mark admin session active for the lifetime of this component
  useEffect(() => {
    if (adminAllowed) setAdminSession(true);
    return () => setAdminSession(false);
  }, [adminAllowed]);

  useEffect(() => {
    try { localStorage.setItem('dropkast.command.blur', privacyBlur ? '1' : '0'); } catch {/* ignore */}
  }, [privacyBlur]);

  // Server-Sent Events — pushes audit / health / job updates from backend
  useEffect(() => {
    if (!adminAllowed && !emergencyAttempted) return;
    const url = new URL('/api/admin/events', window.location.origin);
    if (user?.email) url.searchParams.set('email', user.email);
    // EventSource doesn't support custom headers — encode in query string for the demo
    const es = new EventSource(url.toString(), { withCredentials: false } as any);
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);
    es.onmessage = (msg) => {
      try {
        const e = JSON.parse(msg.data);
        if (e.type === 'hello') return;
        setLiveEvents((prev) => [{ ...e, _id: Math.random() }, ...prev].slice(0, 50));
      } catch {/* ignore */}
    };
    return () => es.close();
  }, [adminAllowed, emergencyAttempted, user?.email]);

  // System health — drives the always-on telemetry strip + the AI Workspace tab
  useEffect(() => {
    if (!adminAllowed && !emergencyAttempted) return;
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/admin/health', { headers: adminHeaders(user?.email) });
        if (res.ok) setSystemHealth(await res.json());
      } catch {/* ignore */}
    };
    void fetchHealth();
    const id = setInterval(fetchHealth, 60_000);
    return () => clearInterval(id);
  }, [adminAllowed, emergencyAttempted, user?.email]);

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
              className="beam block w-full h-12 bg-white text-black text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Sign in
            </Link>

            <details className="text-left">
              <summary className="text-[10px] font-black text-white/30 uppercase tracking-widest italic cursor-pointer">
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
                  className="beam w-full h-10 border border-primary/30 text-primary text-[10px] font-black uppercase italic tracking-widest transition-all"
                >
                  Use emergency password
                </button>
              </div>
            </details>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-8 text-[10px] font-black text-white/30 tracking-[0.3em] uppercase italic"
          >
            <ChevronLeft className="w-3 h-3" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-black text-white', privacyBlur && 'cmd-blur')}>
      {/* Top bar */}
      <header className="border-b border-white/10 bg-gradient-to-r from-primary/5 via-black to-black sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white/40" title="Back to app">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic">DropKast · Internal</div>
              <h1 className="text-2xl font-black italic tracking-tight">Command Center</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest italic">
            <span className="flex items-center gap-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', sseConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400')} />
              {sseConnected ? 'SSE LIVE' : 'POLLING'}
            </span>
            {liveEvents.length > 0 && (
              <span className="text-primary">{liveEvents.length} events</span>
            )}
            <span>·</span>
            <button
              onClick={() => setPrivacyBlur(!privacyBlur)}
              className={cn(
                'h-7 px-2 border text-[9px] font-black uppercase tracking-widest italic transition-colors',
                privacyBlur ? 'border-primary bg-primary/10 text-primary' : 'border-white/15 text-white/50',
              )}
              title="Toggle blur on financial values · for screen sharing"
            >
              {privacyBlur ? '🛡 Demo blur ON' : '🛡 Demo blur'}
            </button>
            <span>·</span>
            <span>{user?.email || 'emergency'}</span>
          </div>
        </div>

        {/* #5 — Mission-control telemetry strip */}
        <TelemetryStrip health={systemHealth} />

        {/* #7 — Channel-selector tabs */}
        <nav className="border-t border-white/5 overflow-x-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto flex">
            {TABS.map((t, idx) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-3 min-h-[40px] text-[10px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap',
                    isActive ? 'text-primary' : 'text-white/40',
                  )}
                >
                  {isActive && (
                    <>
                      <span
                        className="absolute top-0 left-0 right-0 h-px bg-primary"
                        style={{ boxShadow: '0 0 8px rgba(255,77,0,0.6)' }}
                      />
                      <span
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary"
                        style={{ boxShadow: '0 0 6px rgba(255,77,0,0.8)' }}
                      />
                    </>
                  )}
                  <span className="text-[7px] font-mono opacity-40 tracking-[0.3em] tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
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
            {activeTab === 'overview' && <OverviewTab liveEvents={liveEvents} />}
            {activeTab === 'ai'       && <AIWorkspaceTab health={systemHealth} setHealth={setSystemHealth} />}
            {activeTab === 'tokens'   && <TokensTab />}
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
function OverviewTab({ liveEvents = [] as any[] }: { liveEvents?: any[] }) {
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

  const royaltyDollars = (revenue.totalRoyaltyLineCents || 0) / 100;
  const secondaryKpis = [
    { label: 'Live releases',  value: counts.liveReleases ?? 0, icon: Disc },
    { label: 'Total releases', value: counts.releases ?? 0,     icon: Disc },
    { label: 'Influencers',    value: counts.influencers ?? 0,  icon: Users },
    { label: 'Payouts',        value: counts.payouts ?? 0,      icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter">Platform pulse</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="beam flex items-center gap-2 h-9 px-4 min-h-[40px] border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 transition-all"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Refresh
        </button>
      </div>

      {/* #1 — Telemetry slabs: hero (royalty volume, 6 cols, with sparkline)
          + 4 secondary slabs (3 cols each). Asymmetric grid + corner ticks. */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6 relative bg-gradient-to-br from-primary/[0.08] via-dark to-dark border border-primary/30 p-6 group overflow-hidden">
          <CornerTicks />
          <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.4em] italic mb-3">
            <Activity className="w-3 h-3" />
            Royalty volume · all-time
            <span className="ml-auto flex items-center gap-1.5 text-green-400">
              <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div className="text-5xl md:text-6xl font-black italic tracking-tighter text-white tabular-nums">
            ${royaltyDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-white/40 italic mt-1">
            {(data?.revenue?.ledgerLineCount || 0).toLocaleString()} ledger lines · {counts.creators || 0} payees
          </div>
          {/* deterministic faux sparkline so it doesn't jiggle on every render */}
          <div className="mt-5 h-8 flex items-end gap-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const h = 18 + Math.sin(i * 0.42) * 28 + Math.sin(i * 0.13) * 14 + (i % 7) * 2;
              return <div key={i} className="flex-1 bg-primary/40" style={{ height: `${Math.max(8, h)}%` }} />;
            })}
          </div>
        </div>

        {secondaryKpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="col-span-6 md:col-span-3 relative bg-dark border border-white/10 p-4 transition-colors"
            >
              <CornerTicks small />
              <div className="flex items-center gap-2 text-[8px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-2">
                <Icon className="w-3 h-3" />
                {k.label}
              </div>
              <div className="text-3xl font-black italic text-white tabular-nums">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Live SSE feed */}
      {liveEvents.length > 0 && (
        <div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Live event stream · {liveEvents.length}
          </div>
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-hidden">
            <div className="max-h-64 overflow-y-auto custom-scrollbar font-mono">
              {liveEvents.slice(0, 20).map((e: any) => (
                <div key={e._id} className="flex items-center gap-3 px-4 py-2 border-b border-white/5 text-[10px] last:border-b-0">
                  <span className="text-white/30 tabular-nums w-20">{new Date(e.ts).toLocaleTimeString()}</span>
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-widest w-16',
                    e.type === 'audit' ? 'text-primary' : e.type === 'health' ? 'text-green-400' : 'text-white/60',
                  )}>
                    {e.type}
                  </span>
                  <span className="text-white/60 truncate flex-1">
                    {(e.payload as any)?.action || (e.payload as any)?.event || JSON.stringify(e.payload).slice(0, 80)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RecentAuditCard events={data?.recentAudit || []} />
    </div>
  );
}

/* =========================================================================
 * TOKENS — AI spend rollup across all users + per-provider stats
 * ========================================================================= */
function TokensTab() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tokens', { headers: adminHeaders(user?.email) });
      if (res.ok) setData(await res.json());
    } catch {/* ignore */}
    setLoading(false);
  }, [user?.email]);

  useEffect(() => { void refresh(); }, [refresh]);

  const totalDollars = (data?.totalCostCents || 0) / 100;
  const totalIn = data?.totalInputTokens || 0;
  const totalOut = data?.totalOutputTokens || 0;
  const totalCached = data?.totalCachedTokens || 0;
  const totalTokens = totalIn + totalOut + totalCached;
  const cachedRatio = totalTokens > 0 ? Math.round((totalCached / totalTokens) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter">AI token spend</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="beam flex items-center gap-2 h-9 px-4 min-h-[40px] border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 transition-all"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Refresh
        </button>
      </div>

      {/* Hero spend card + secondary stats — same telemetry-slab pattern */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6 relative bg-gradient-to-br from-primary/[0.08] via-dark to-dark border border-primary/30 p-6">
          <CornerTicks />
          <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.4em] italic mb-3">
            <Activity className="w-3 h-3" /> Today's spend · all users
          </div>
          <div className="text-5xl md:text-6xl font-black italic tracking-tighter text-white tabular-nums sensitive-value">
            ${totalDollars.toFixed(2)}
          </div>
          <div className="text-[10px] text-white/40 italic mt-1">
            {(data?.byUser?.length || 0)} active users · resets daily at 00:00 UTC
          </div>
          {/* Token volume bar */}
          {totalTokens > 0 && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-white/40">Token mix</span>
                <span className="text-white/60 tabular-nums">{(totalTokens / 1000).toFixed(1)}K</span>
              </div>
              <div className="h-2 bg-white/5 flex overflow-hidden">
                <div className="bg-primary" style={{ width: `${(totalIn / totalTokens) * 100}%` }} title={`Input · ${totalIn.toLocaleString()}`} />
                <div className="bg-yellow-400/70" style={{ width: `${(totalOut / totalTokens) * 100}%` }} title={`Output · ${totalOut.toLocaleString()}`} />
                <div className="bg-green-400/70" style={{ width: `${(totalCached / totalTokens) * 100}%` }} title={`Cached · ${totalCached.toLocaleString()}`} />
              </div>
              <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest text-white/50">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary" /> Input</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-400/70" /> Output</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400/70" /> Cached ({cachedRatio}%)</span>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-6 md:col-span-3 relative bg-dark border border-white/10 p-4">
          <CornerTicks small />
          <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-2">Input tokens</div>
          <div className="text-3xl font-black italic text-white tabular-nums">{(totalIn / 1000).toFixed(1)}K</div>
        </div>
        <div className="col-span-6 md:col-span-3 relative bg-dark border border-white/10 p-4">
          <CornerTicks small />
          <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-2">Output tokens</div>
          <div className="text-3xl font-black italic text-white tabular-nums">{(totalOut / 1000).toFixed(1)}K</div>
        </div>
        <div className="col-span-6 md:col-span-3 relative bg-dark border border-white/10 p-4">
          <CornerTicks small />
          <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-2">Cache hits</div>
          <div className="text-3xl font-black italic text-white tabular-nums">{(totalCached / 1000).toFixed(1)}K</div>
        </div>
        <div className="col-span-6 md:col-span-3 relative bg-dark border border-white/10 p-4">
          <CornerTicks small />
          <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-2">Active users</div>
          <div className="text-3xl font-black italic text-white tabular-nums">{data?.byUser?.length || 0}</div>
        </div>
      </div>

      {/* Per-user breakdown */}
      <div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">
          Per-user spend (today)
        </div>
        {(!data?.byUser || data.byUser.length === 0) ? (
          <EmptyConsole
            icon={Activity}
            title="No spend recorded today"
            desc="When users hit the AI assistant or studios, their token usage shows up here. Resets at 00:00 UTC."
            hint="default budget · $1/day per user · override AI_DAILY_BUDGET_CENTS"
          />
        ) : (
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-white/10">
                <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-right">Input</th>
                  <th className="px-4 py-3 text-right">Output</th>
                  <th className="px-4 py-3 text-right">Cached</th>
                  <th className="px-4 py-3 text-right">Spend</th>
                  <th className="px-4 py-3">Resets</th>
                </tr>
              </thead>
              <tbody>
                {data.byUser
                  .slice()
                  .sort((a: any, b: any) => b.costCents - a.costCents)
                  .map((u: any) => (
                    <tr key={u.userId} className="border-b border-white/5">
                      <td className="px-4 py-3 text-[11px] text-white/70 font-mono truncate max-w-[200px]">{u.userId}</td>
                      <td className="px-4 py-3 text-[11px] text-white/60 text-right tabular-nums">{u.inputTokens.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[11px] text-white/60 text-right tabular-nums">{u.outputTokens.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[11px] text-green-400 text-right tabular-nums">{u.cachedTokens.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[11px] text-primary font-black italic text-right tabular-nums sensitive-value">
                        ${(u.costCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-white/30 italic">
                        {u.resetAt ? new Date(u.resetAt).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="manifest-card p-5 bg-primary/5 border border-primary/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-[12px] text-white/70 italic leading-relaxed">
          <strong className="text-white">Pricing reference (May 2026):</strong>{' '}
          Sonnet 4.6 = $3 input / $15 output per Mtok · Haiku 4.5 = $0.25 input / $1.25 output per Mtok · cache hits at 10% of input.
          Daily budget enforced at <code className="text-primary">AI_DAILY_BUDGET_CENTS</code> (default $1.00 per user).
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * AI WORKSPACE — live job feed + brain health pings (server-rack style)
 * ========================================================================= */
function AIWorkspaceTab({ health, setHealth }: { health: any; setHealth: (h: any) => void }) {
  const { user } = useAuth();
  const { jobs } = useStudioJobs();
  const { outputs } = useStudioOutputs();
  const [pinging, setPinging] = useState(false);

  const ping = useCallback(async () => {
    setPinging(true);
    try {
      const res = await fetch('/api/admin/health', { headers: adminHeaders(user?.email) });
      if (res.ok) setHealth(await res.json());
    } catch {/* ignore */}
    setPinging(false);
  }, [user?.email, setHealth]);

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
          className="beam flex items-center gap-2 h-9 px-4 min-h-[40px] border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 transition-all"
        >
          {pinging ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Ping providers
        </button>
      </div>

      {/* #2 — Server-rack readout for AI brain providers */}
      <div className="border border-white/10 bg-black relative overflow-hidden">
        <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] italic text-white/50">
          <span className="text-primary">RACK 01 ·</span> AI BRAIN PROVIDERS
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            Polling · 60s
          </span>
        </div>
        <div className="absolute inset-0 pointer-events-none scanline-sweep" />
        <div className="font-mono">
          {(health?.providers || []).map((p: any, i: number) => (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-4 px-4 py-2.5 border-b border-white/5 text-[11px] transition-colors last:border-b-0',
                !p.ok && 'bg-red-500/[0.03]',
              )}
            >
              <span className="text-white/30 tabular-nums w-8 text-[9px]">U{String(i + 1).padStart(2, '0')}</span>
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  p.ok
                    ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
                )}
              />
              <span className="text-white font-bold w-32 truncate">{p.label}</span>
              <span className="text-white/40 flex-1 truncate">{p.id}</span>
              <span className={cn('tabular-nums text-right w-20', p.ok ? 'text-green-400' : 'text-red-400')}>
                {p.ok ? `${String(p.latencyMs || 0).padStart(4, ' ')}ms` : (p.error || 'DOWN').toUpperCase().slice(0, 12)}
              </span>
              <span className={cn('text-[9px] font-black tracking-widest w-12 text-right', p.ok ? 'text-green-400' : 'text-red-400')}>
                {p.ok ? 'OK' : 'ERR'}
              </span>
            </div>
          ))}
          {(!health?.providers || health.providers.length === 0) && (
            <div className="px-4 py-8 text-center text-white/30 text-[11px] italic">
              Scanning racks…
            </div>
          )}
        </div>
      </div>

      {/* Live job queue with pulse rows */}
      <div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3 flex items-center gap-3">
          <span>Live job queue</span>
          <span className="text-white/30">·</span>
          <span className="tabular-nums text-white/60">{jobs.length}</span>
          {jobs.some((j) => j.status === 'running') && (
            <span className="ml-auto flex items-center gap-1.5 text-primary text-[9px] tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              ACTIVE
            </span>
          )}
        </div>
        {jobs.length === 0 ? (
          <EmptyConsole
            icon={Activity}
            title="Queue is idle"
            desc="No studio jobs running on this device. Jobs are client-persisted today — fire one from /studios and it'll appear here in real time."
            hint="cmd+shift+c to jump back · /studios to launch"
          />
        ) : (
          <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
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
                  const isLive = j.status === 'running' || j.status === 'queued';
                  return (
                    <tr
                      key={j.id}
                      className={cn(
                        'border-b border-white/5 relative',
                        isLive && 'job-row-live',
                      )}
                    >
                      {/* #3 — Pulsing left edge for live jobs */}
                      {isLive && (
                        <td
                          className="absolute left-0 top-0 bottom-0 w-[3px] p-0 animate-job-pulse"
                          style={{ background: '#FF4D00', boxShadow: '0 0 12px rgba(255,77,0,0.6)' }}
                        />
                      )}
                      <td className="px-4 py-3 text-sm font-black italic text-white">{def?.name || j.studioId}</td>
                      <td className="px-4 py-3 text-[11px] text-white/60 font-mono uppercase">{j.brain}</td>
                      <td className="px-4 py-3 text-[11px] text-white/60">{j.persona || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={j.status} />
                      </td>
                      <td className="px-4 py-3 text-[10px] text-white/40 italic tabular-nums">
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
          </div>
        )}
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
                className="manifest-card p-4 bg-dark border border-white/10 transition-all flex items-center gap-3"
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

      {roster.length === 0 ? (
        <EmptyConsole
          icon={Users}
          title="No artists yet"
          desc="The label roster is empty. Add an artist on the /roster page (label role) and they'll appear here with all their releases and earnings."
          hint="visit /roster · or sign in as a label"
        />
      ) : (
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
            {roster.map((a: any) => (
              <tr key={a.id} className="border-b border-white/5">
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
      )}
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
          <div className="md:col-span-3">
            <EmptyConsole
              icon={Disc}
              title="No releases on the platform yet"
              desc="When artists submit releases, they'll bucket here by lifecycle status: draft, in review, delivering, live, taken down, rejected."
              hint="lifecycle: draft → in_review → approved → delivering → live"
            />
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
          className="beam flex items-center gap-2 h-9 px-4 min-h-[40px] border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/60 transition-all"
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
 * MISSION CONTROL TELEMETRY STRIP — always-on system heartbeat
 * Borrowed from NASA / Bloomberg / aviation HUDs. Tabular nums + monospace
 * + UTC stamp = "this is a serious system."
 * ========================================================================= */
function TelemetryStrip({ health }: { health: any }) {
  const [now, setNow] = useState<string>(() => new Date().toUTCString().slice(17, 25));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toUTCString().slice(17, 25)), 1000);
    return () => clearInterval(id);
  }, []);
  const onlineCount = (health?.providers || []).filter((p: any) => p.ok).length;
  const totalCount = (health?.providers || []).length;
  const uptime = health?.uptimeSec
    ? `${Math.floor(health.uptimeSec / 3600)}h ${Math.floor((health.uptimeSec % 3600) / 60)}m`
    : '—';

  return (
    <div className="border-t border-white/5 bg-black/60 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center gap-6 text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 overflow-x-auto whitespace-nowrap">
        <span className="text-primary font-black">SYS</span>
        <span><span className="text-white/30">ENV</span> {(import.meta as any).env?.MODE || 'production'}</span>
        <span><span className="text-white/30">UPTIME</span> <span className="tabular-nums text-white/70">{uptime}</span></span>
        <span><span className="text-white/30">NODE</span> {health?.nodeVersion || 'n/a'}</span>
        <span>
          <span className="text-white/30">PROVIDERS</span>{' '}
          {totalCount > 0 ? (
            <span className={onlineCount === totalCount ? 'text-green-400' : 'text-yellow-400'}>
              {onlineCount}/{totalCount} ONLINE
            </span>
          ) : (
            <span className="text-white/40">SCANNING…</span>
          )}
        </span>
        <span>
          <span className="text-white/30">STRIPE</span>{' '}
          {health?.payoutAdapter === 'stripe' ? (
            <span className="text-green-400">LIVE</span>
          ) : (
            <span className="text-yellow-400">SIMULATOR</span>
          )}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="tabular-nums text-white/60">{now} UTC</span>
        </span>
      </div>
    </div>
  );
}

/* =========================================================================
 * CornerTicks — military-HUD chassis corners, used on KPI slabs + empty consoles
 * ========================================================================= */
function CornerTicks({ small }: { small?: boolean } = {}) {
  const s = small ? 6 : 10;
  return (
    <>
      <div className="absolute top-0 left-0 border-l border-t border-primary/60 pointer-events-none" style={{ width: s, height: s }} />
      <div className="absolute top-0 right-0 border-r border-t border-primary/60 pointer-events-none" style={{ width: s, height: s }} />
      <div className="absolute bottom-0 left-0 border-l border-b border-primary/60 pointer-events-none" style={{ width: s, height: s }} />
      <div className="absolute bottom-0 right-0 border-r border-b border-primary/60 pointer-events-none" style={{ width: s, height: s }} />
    </>
  );
}

/* =========================================================================
 * EmptyConsole — cinematic "no signal" placeholder for empty tabs
 * ========================================================================= */
function EmptyConsole({
  icon: Icon,
  title,
  desc,
  hint,
}: {
  icon: any;
  title: string;
  desc?: string;
  hint?: string;
}) {
  return (
    <div className="border border-white/10 bg-black relative overflow-hidden p-12 min-h-[280px] flex flex-col items-center justify-center">
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* concentric scanning rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 border border-primary/20 rounded-full animate-empty-ping" />
        <div
          className="absolute w-48 h-48 border border-primary/10 rounded-full animate-empty-ping"
          style={{ animationDelay: '0.6s' }}
        />
      </div>
      <CornerTicks />
      <Icon className="w-10 h-10 text-primary/40 mb-4 relative z-10" strokeWidth={1.5} />
      <div className="relative z-10 text-center max-w-sm">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic mb-2">
          NO SIGNAL
        </div>
        <h3 className="text-lg font-black italic text-white mb-2">{title}</h3>
        {desc && <p className="text-[11px] text-white/40 italic leading-relaxed">{desc}</p>}
        {hint && (
          <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-widest">
            <span className="w-1 h-1 bg-primary/60 rounded-full" />
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * SHARED COMPONENTS
 * ========================================================================= */
function RecentAuditCard({ events, fullList }: { events: any[]; fullList?: boolean }) {
  if (!events || events.length === 0) {
    return (
      <EmptyConsole
        icon={ScrollText}
        title="No audit events yet"
        desc="Every takedown, payout, metadata edit, GDPR export, and DMCA notice appears here as it happens. The log is tamper-resistant and exportable."
        hint="logged via logAudit() — see api/_security.ts"
      />
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
  // Squares (not circles) — squares read as "system state", circles read as "social"
  const tone = (() => {
    const s = (status || '').toLowerCase();
    if (s.includes('live') || s.includes('paid') || s.includes('done') || s.includes('active') || s.includes('released'))
      return { dot: 'bg-green-400', text: 'text-green-400', glow: 'rgba(74,222,128,0.5)' };
    if (s.includes('failed') || s.includes('error') || s.includes('rejected') || s.includes('cancelled') || s.includes('takedown'))
      return { dot: 'bg-red-400', text: 'text-red-400', glow: 'rgba(248,113,113,0.5)' };
    if (s.includes('queue') || s.includes('pending') || s.includes('draft') || s.includes('review') || s.includes('paused') || s.includes('invited'))
      return { dot: 'bg-yellow-400', text: 'text-yellow-300', glow: 'rgba(250,204,21,0.5)' };
    if (s.includes('running') || s.includes('processing') || s.includes('delivering') || s.includes('scheduled'))
      return { dot: 'bg-primary', text: 'text-primary', glow: 'rgba(255,77,0,0.5)' };
    return { dot: 'bg-white/40', text: 'text-white/60', glow: 'rgba(255,255,255,0.2)' };
  })();
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest italic', tone.text)}>
      <span
        className={cn('w-1.5 h-1.5 shrink-0', tone.dot)}
        style={{ boxShadow: `0 0 6px ${tone.glow}` }}
      />
      [{(status || 'UNKNOWN').toUpperCase()}]
    </span>
  );
}
