/**
 * AdminDashboard — DropKast operator oversight console.
 *
 * NOT a user-facing label-tier feature. This is the back office for
 * DropKast operators (Moses + LVRN team) to see everything happening
 * across the platform: every user, every submission, every campaign,
 * every payout, every creator deliverable.
 *
 * Auth: role === 'admin' only. Other roles see an access-denied card.
 *
 * Pulls from the existing platform APIs (/api/releases, /api/users if
 * present, /api/campaigns, /api/earnings). When an API isn't wired yet
 * the section shows an empty state rather than mock data.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Users,
  Music,
  Megaphone,
  Wallet,
  Calendar as CalendarIcon,
  Bell,
  Search,
  Filter,
  Shield,
  TrendingUp,
  Clock,
  Inbox,
  Database,
  Building2,
  ArrowRight,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import type { Release } from '../types';

/* ─────────────────────────────────────────────────────────────────────────
 * Types + tabs
 * ───────────────────────────────────────────────────────────────────────── */

type TabId =
  | 'overview'
  | 'users'
  | 'submissions'
  | 'campaigns'
  | 'payouts'
  | 'creators'
  | 'calendar'
  | 'notifications';

const TABS: { id: TabId; label: string; icon: typeof Activity; description: string }[] = [
  { id: 'overview',      label: 'Overview',      icon: Activity,    description: 'Platform pulse — every metric DropKast tracks, live.' },
  { id: 'users',         label: 'Users',         icon: Users,       description: 'Every account on DropKast — artist / label / influencer / DJ.' },
  { id: 'submissions',   label: 'Submissions',   icon: Inbox,       description: 'All release submissions across the platform.' },
  { id: 'campaigns',     label: 'Campaigns',     icon: Megaphone,   description: 'Every campaign sent through DropKast.' },
  { id: 'payouts',       label: 'Payouts',       icon: Wallet,      description: 'Earnings, withdrawals, escrow.' },
  { id: 'creators',      label: 'Featured creators', icon: Database, description: 'Pre-vetted influencers + DJs database for fast submissions.' },
  { id: 'calendar',      label: 'Content calendar', icon: CalendarIcon, description: 'Releases, posts, deliverables — all in one grid.' },
  { id: 'notifications', label: 'Notifications', icon: Bell,        description: 'Notification rules + history across all users.' },
];

interface PlatformUser {
  id: string;
  email: string;
  artistName?: string;
  role: string;
  createdAt?: string;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>('overview');

  // role gate
  const isAdmin = user?.role === 'admin' || user?.email?.endsWith('@lvrn.com');

  // platform data
  const [releases, setReleases] = useState<Release[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      fetch('/api/releases').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()).catch(() => []),
    ]).then((results) => {
      if (cancelled) return;
      const r = results[0].status === 'fulfilled' ? results[0].value : [];
      const u = results[1].status === 'fulfilled' ? results[1].value : [];
      setReleases(Array.isArray(r) ? r : []);
      setUsers(Array.isArray(u) ? u : []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshTick]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6">
        <div className="manifest-card p-10 bg-dark border border-red-500/20 text-center">
          <Lock className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black italic text-white mb-2">Operator console</h1>
          <p className="text-sm text-white/50 italic mb-6">
            This dashboard is reserved for DropKast operators. If you think you should have
            access, ping the team.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 h-11 px-5 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Back to your dashboard <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.4em] italic mb-4">
          <Shield className="w-3 h-3" /> Operator console
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              DropKast <span className="text-primary">control</span>
            </h1>
            <p className="text-white/40 text-sm italic mt-3 max-w-2xl">
              Every user, every submission, every campaign, every payout. The single screen
              from which DropKast is run. Logged in as <span className="text-primary">{user?.email}</span>.
            </p>
          </div>
          <button
            onClick={() => setRefreshTick((t) => t + 1)}
            className="h-11 px-5 border border-white/10 hover:border-primary text-white/60 hover:text-primary text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 self-start md:self-end"
          >
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <OverviewStats releases={releases} users={users} loading={loading} />

      {/* Tab bar */}
      <div className="mt-10 mb-6 border-b border-white/10 overflow-x-auto">
        <div className="flex items-end gap-1 min-w-max">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'group flex items-center gap-2 px-5 h-12 text-[10px] font-black uppercase italic tracking-widest transition-all border-b-2 -mb-px whitespace-nowrap',
                  active ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] font-mono text-white/30 italic mb-6">
        {TABS.find((t) => t.id === tab)?.description}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview'      && <OverviewTab releases={releases} users={users} />}
          {tab === 'users'         && <UsersTab users={users} loading={loading} />}
          {tab === 'submissions'   && <SubmissionsTab releases={releases} loading={loading} />}
          {tab === 'campaigns'     && <Placeholder title="Campaigns" />}
          {tab === 'payouts'       && <Placeholder title="Payouts" />}
          {tab === 'creators'      && <CreatorsTab />}
          {tab === 'calendar'      && <CalendarTab releases={releases} />}
          {tab === 'notifications' && <Placeholder title="Notifications" />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Overview stats — top of page
 * ───────────────────────────────────────────────────────────────────────── */

function OverviewStats({
  releases,
  users,
  loading,
}: {
  releases: Release[];
  users: PlatformUser[];
  loading: boolean;
}) {
  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const r of releases) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const now = new Date();
    const thisMonth = releases.filter((r) => {
      const d = new Date(r.releaseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return {
      releases: releases.length,
      users: users.length,
      live: byStatus.Released || 0,
      drafts: byStatus.Draft || 0,
      thisMonth,
    };
  }, [releases, users]);

  const cards = [
    { label: 'Total accounts',  value: stats.users,     accent: '#fff'                     },
    { label: 'Catalogue',       value: stats.releases,  accent: 'var(--color-primary)'     },
    { label: 'Live releases',   value: stats.live,      accent: '#22C55E'                  },
    { label: 'Drafts in flight',value: stats.drafts,    accent: '#9CA3AF'                  },
    { label: 'Drops this month',value: stats.thisMonth, accent: 'var(--color-primary)'     },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="manifest-card p-4 bg-dark border border-white/10 hover:border-white/20 transition-all">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] italic mb-2" style={{ color: c.accent }}>
            {c.label}
          </div>
          <div className="text-3xl font-black italic text-white tabular-nums">
            {loading ? <span className="text-white/20">·</span> : c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Overview tab — live feed
 * ───────────────────────────────────────────────────────────────────────── */

function OverviewTab({ releases, users }: { releases: Release[]; users: PlatformUser[] }) {
  const recent = releases.slice(0, 8);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="manifest-card p-5 bg-dark border border-white/10 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black italic text-white uppercase tracking-widest">Recent submissions</h3>
          <Link to="#submissions" className="text-[10px] font-black text-primary uppercase tracking-widest italic hover:text-white">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyFeed label="No releases on the platform yet." />
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-2 border border-white/[0.04] hover:border-white/10 transition-all">
                <Music className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black italic text-white truncate">{r.title}</div>
                  <div className="text-[10px] text-white/40 italic truncate">{r.artist}</div>
                </div>
                <span className="text-[9px] font-mono text-white/30">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="manifest-card p-5 bg-dark border border-white/10">
        <h3 className="text-sm font-black italic text-white uppercase tracking-widest mb-4">Newest accounts</h3>
        {users.length === 0 ? (
          <EmptyFeed label="No accounts wired yet." />
        ) : (
          <ul className="space-y-2">
            {users.slice(0, 8).map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-2 border border-white/[0.04]">
                <Users className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black italic text-white truncate">{u.artistName || u.email}</div>
                  <div className="text-[10px] text-white/40 italic truncate">{u.role}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Users tab
 * ───────────────────────────────────────────────────────────────────────── */

function UsersTab({ users, loading }: { users: PlatformUser[]; loading: boolean }) {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!needle) return true;
      return (
        u.email.toLowerCase().includes(needle) ||
        (u.artistName || '').toLowerCase().includes(needle)
      );
    });
  }, [users, q, roleFilter]);

  const roles = Array.from(new Set(users.map((u) => u.role)));

  return (
    <div className="space-y-4">
      <div className="manifest-card p-4 bg-dark border border-white/10 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or artist name…"
            className="w-full h-10 pl-9 pr-3 bg-black/40 border border-white/10 text-white text-sm italic focus:border-primary outline-none"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={cn(
              'h-9 px-3 text-[10px] font-black uppercase italic tracking-widest border transition-all',
              roleFilter === 'all'
                ? 'bg-primary border-primary text-white'
                : 'border-white/10 text-white/40 hover:text-white',
            )}
          >
            All
          </button>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'h-9 px-3 text-[10px] font-black uppercase italic tracking-widest border transition-all',
                roleFilter === r
                  ? 'bg-primary border-primary text-white'
                  : 'border-white/10 text-white/40 hover:text-white',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <EmptyFeed label="Loading accounts…" />
      ) : filtered.length === 0 ? (
        <EmptyFeed label="No accounts match your filter. (Once /api/users ships, the directory will populate here.)" />
      ) : (
        <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Artist / Display</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm font-black italic text-white">{u.email}</td>
                  <td className="px-5 py-3 text-[11px] text-white/60 italic">{u.artistName || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="text-[9px] font-black uppercase tracking-widest italic px-2 py-1 border border-white/10 text-white/60">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[10px] font-mono text-white/40 tabular-nums">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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

/* ─────────────────────────────────────────────────────────────────────────
 * Submissions tab
 * ───────────────────────────────────────────────────────────────────────── */

function SubmissionsTab({ releases, loading }: { releases: Release[]; loading: boolean }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | Release['status']>('all');

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return releases
      .filter((r) => status === 'all' || r.status === status)
      .filter((r) => {
        if (!needle) return true;
        return r.title.toLowerCase().includes(needle) || r.artist.toLowerCase().includes(needle);
      })
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }, [releases, q, status]);

  return (
    <div className="space-y-4">
      <div className="manifest-card p-4 bg-dark border border-white/10 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or artist…"
            className="w-full h-10 pl-9 pr-3 bg-black/40 border border-white/10 text-white text-sm italic focus:border-primary outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'Draft', 'Scheduled', 'Released', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'h-9 px-3 text-[10px] font-black uppercase italic tracking-widest border transition-all',
                status === s
                  ? 'bg-primary border-primary text-white'
                  : 'border-white/10 text-white/40 hover:text-white',
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <EmptyFeed label="Loading submissions…" />
      ) : filtered.length === 0 ? (
        <EmptyFeed label="No submissions match your filter." />
      ) : (
        <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Artist</th>
                <th className="px-5 py-3">Format</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Drop date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm font-black italic text-white">{r.title}</td>
                  <td className="px-5 py-3 text-[11px] text-white/60 italic">{r.artist}</td>
                  <td className="px-5 py-3 text-[10px] font-mono text-white/40 uppercase">{r.format}</td>
                  <td className="px-5 py-3">
                    <span className="text-[9px] font-black uppercase tracking-widest italic px-2 py-1 border border-white/10 text-white/60">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[10px] font-mono text-white/40 tabular-nums">
                    {new Date(r.releaseDate).toLocaleDateString()}
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

/* ─────────────────────────────────────────────────────────────────────────
 * Featured creators DB (fast-submission roster)
 * ───────────────────────────────────────────────────────────────────────── */

const CREATORS_KEY = 'dropkast.admin.featuredCreators';

interface FeaturedCreator {
  id: string;
  name: string;
  handle: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitch' | 'dj' | 'reactor';
  tier: 'starter' | 'mid' | 'high';
  category?: string;
  notes?: string;
  addedAt: number;
}

function CreatorsTab() {
  const [creators, setCreators] = useState<FeaturedCreator[]>(() => {
    try { return JSON.parse(localStorage.getItem(CREATORS_KEY) || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Partial<FeaturedCreator>>({});

  const save = (next: FeaturedCreator[]) => {
    setCreators(next);
    try { localStorage.setItem(CREATORS_KEY, JSON.stringify(next)); } catch {/* ignore */}
  };

  const add = () => {
    if (!draft.name || !draft.handle || !draft.platform || !draft.tier) return;
    const next: FeaturedCreator = {
      id: crypto.randomUUID?.() || String(Date.now()),
      name: draft.name,
      handle: draft.handle,
      platform: draft.platform as FeaturedCreator['platform'],
      tier: draft.tier as FeaturedCreator['tier'],
      category: draft.category,
      notes: draft.notes,
      addedAt: Date.now(),
    };
    save([next, ...creators]);
    setDraft({});
    setShowForm(false);
  };

  const remove = (id: string) => save(creators.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/40 italic">
          {creators.length === 0
            ? 'Pre-vetted creators you can drop into any campaign in one click.'
            : `${creators.length} creator${creators.length !== 1 ? 's' : ''} in your fast-submission roster.`}
        </p>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="h-9 px-4 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all"
        >
          {showForm ? 'Cancel' : '+ Add creator'}
        </button>
      </div>

      {showForm && (
        <div className="manifest-card p-5 bg-dark border border-primary/30 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Display name" value={draft.name || ''} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="@handle"      value={draft.handle || ''} onChange={(v) => setDraft({ ...draft, handle: v })} />
          <Select label="Platform" value={draft.platform || ''} onChange={(v) => setDraft({ ...draft, platform: v as any })}
            options={[
              ['instagram', 'Instagram'],
              ['tiktok', 'TikTok'],
              ['youtube', 'YouTube'],
              ['twitch', 'Twitch'],
              ['dj', 'DJ'],
              ['reactor', 'Reactor'],
            ]}
          />
          <Select label="Tier" value={draft.tier || ''} onChange={(v) => setDraft({ ...draft, tier: v as any })}
            options={[
              ['starter', 'Starter — 10K-100K'],
              ['mid',     'Mid — 100K-1M'],
              ['high',    'High — 1M+'],
            ]}
          />
          <Field label="Category (e.g. Amapiano)" value={draft.category || ''} onChange={(v) => setDraft({ ...draft, category: v })} />
          <Field label="Notes" value={draft.notes || ''} onChange={(v) => setDraft({ ...draft, notes: v })} />
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={add}
              disabled={!draft.name || !draft.handle || !draft.platform || !draft.tier}
              className="h-10 px-5 bg-white text-black text-[10px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Add to roster
            </button>
          </div>
        </div>
      )}

      {creators.length === 0 ? (
        <EmptyFeed label="Empty roster. Build it as you book — every creator who delivers well goes here." />
      ) : (
        <div className="manifest-card p-0 bg-dark border border-white/10 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Handle</th>
                <th className="px-5 py-3">Platform</th>
                <th className="px-5 py-3">Tier</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm font-black italic text-white">{c.name}</td>
                  <td className="px-5 py-3 text-[11px] font-mono text-white/60">@{c.handle}</td>
                  <td className="px-5 py-3 text-[10px] uppercase font-black text-white/60">{c.platform}</td>
                  <td className="px-5 py-3 text-[10px] uppercase font-black text-primary">{c.tier}</td>
                  <td className="px-5 py-3 text-[11px] text-white/50 italic">{c.category || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => remove(c.id)}
                      className="text-[9px] font-black uppercase italic tracking-widest text-white/30 hover:text-red-400 transition-colors"
                    >
                      remove
                    </button>
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

/* ─────────────────────────────────────────────────────────────────────────
 * Content calendar
 * ───────────────────────────────────────────────────────────────────────── */

function CalendarTab({ releases }: { releases: Release[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
  const byDay: Record<number, Release[]> = {};
  for (const r of releases) {
    const d = new Date(r.releaseDate);
    if (d.getFullYear() === cursor.year && d.getMonth() === cursor.month) {
      const day = d.getDate();
      (byDay[day] ||= []).push(r);
    }
  }
  const nav = (dir: -1 | 1) => setCursor((c) => {
    const m = c.month + dir;
    if (m < 0)  return { year: c.year - 1, month: 11 };
    if (m > 11) return { year: c.year + 1, month: 0 };
    return { year: c.year, month: m };
  });
  return (
    <div className="manifest-card p-6 bg-dark border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{monthName}</h3>
        <div className="flex gap-1">
          <button onClick={() => nav(-1)} className="h-9 px-3 border border-white/10 hover:border-primary text-white/60 hover:text-primary text-[10px] font-black uppercase italic tracking-widest transition-all">
            Prev
          </button>
          <button onClick={() => nav(1)} className="h-9 px-3 border border-white/10 hover:border-primary text-white/60 hover:text-primary text-[10px] font-black uppercase italic tracking-widest transition-all">
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[9px] font-black uppercase italic tracking-widest text-white/30 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square border border-white/[0.04]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const drops = byDay[day] || [];
          return (
            <div
              key={day}
              className={cn(
                'aspect-square border p-2 flex flex-col text-[10px]',
                drops.length > 0 ? 'border-primary/40 bg-primary/[0.04]' : 'border-white/[0.06]',
              )}
            >
              <span className="font-mono tabular-nums text-white/40">{day}</span>
              <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                {drops.slice(0, 2).map((r) => (
                  <div key={r.id} className="text-[8px] font-black italic text-white truncate">
                    {r.title}
                  </div>
                ))}
                {drops.length > 2 && (
                  <span className="text-[8px] text-white/40 italic">+{drops.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Shared bits
 * ───────────────────────────────────────────────────────────────────────── */

function Placeholder({ title }: { title: string }) {
  return (
    <div className="manifest-card p-10 bg-dark border border-white/10 text-center">
      <Clock className="w-8 h-8 text-white/15 mx-auto mb-3" />
      <h3 className="text-lg font-black italic text-white mb-2">{title}</h3>
      <p className="text-[11px] text-white/40 italic max-w-md mx-auto">
        Wiring this section to the live platform feed. Will populate once the backend endpoint is connected.
      </p>
    </div>
  );
}

function EmptyFeed({ label }: { label: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-[11px] text-white/30 italic">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-[9px] font-black uppercase tracking-widest italic text-white/40 mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-black/40 border border-white/10 text-white text-sm italic focus:border-primary outline-none"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="block text-[9px] font-black uppercase tracking-widest italic text-white/40 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-black/40 border border-white/10 text-white text-sm italic focus:border-primary outline-none"
      >
        <option value="">Pick…</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
