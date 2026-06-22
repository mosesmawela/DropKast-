/**
 * LabelView — unified operating shell for Label-tier accounts.
 *
 * Ports the LVRN submission-system pattern (Inbox / Board / Calendar /
 * Roster / Splits / Submit) onto DropKast's release model. One dashboard
 * a label manager opens at the start of the day, drives every artist on
 * the roster from a single shell.
 *
 * Tier-gated to LABEL.  Pulls from ReleaseContext (all releases across
 * roster) + the roster localStorage + the splits page.
 *
 * Heavy ported patterns:
 *  - Status pipeline (Draft → Scheduled → Released, with Rejected as side-channel)
 *  - Drag-to-advance Kanban
 *  - Release-date calendar with month nav
 *  - Inline search + reviewer assignment + tag editing
 *  - Analytics strip (LED counters)
 *  - A&R submit-on-behalf-of-artist
 *
 * Skipped from LVRN for v1 (out of scope here):
 *  - 5-dimension scoring rubric
 *  - Audio comments / timestamped notes
 *  - 21-field drivers form
 *  - AI personas (ar-critic etc.)
 *  - Real-time Supabase subscription
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Inbox,
  LayoutGrid,
  Calendar as CalendarIcon,
  Users,
  Receipt,
  Send,
  Search,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
  Plus,
  Music,
  Disc,
  TrendingUp,
  Filter,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useReleases } from '../context/ReleaseContext';
import { useAuth } from '../context/AuthContext';
import { useTierGate, UpgradeBanner } from '../components/UpgradePrompt';
import type { Release } from '../types';

/* ─────────────────────────────────────────────────────────────────────────
 * Constants
 * ───────────────────────────────────────────────────────────────────────── */

type TabId = 'inbox' | 'board' | 'calendar' | 'roster' | 'splits' | 'submit';

const TABS: { id: TabId; label: string; icon: typeof Inbox; description: string }[] = [
  { id: 'inbox',    label: 'Inbox',    icon: Inbox,        description: 'Every release across the roster, newest first' },
  { id: 'board',    label: 'Board',    icon: LayoutGrid,   description: 'Pipeline view — drag to advance status' },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon, description: 'Releases by drop date' },
  { id: 'roster',   label: 'Roster',   icon: Users,        description: 'Artists signed to your label' },
  { id: 'splits',   label: 'Splits',   icon: Receipt,      description: 'Credits + publishing percentages per song' },
  { id: 'submit',   label: 'Submit',   icon: Send,         description: 'Drop a release on behalf of an artist' },
];

const STATUS_FLOW: Release['status'][] = ['Draft', 'Scheduled', 'Released'];

const STATUS_META: Record<Release['status'], { color: string; label: string; icon: typeof Clock }> = {
  Draft:     { color: '#9CA3AF', label: 'Draft',     icon: Clock },
  Scheduled: { color: '#3B82F6', label: 'Scheduled', icon: CalendarIcon },
  Released:  { color: '#22C55E', label: 'Released',  icon: CheckCircle2 },
  Rejected:  { color: '#EF4444', label: 'Rejected',  icon: XCircle },
};

/* ─────────────────────────────────────────────────────────────────────────
 * LabelMeta — local A&R metadata layer (mirrors LVRN analysis.JSONB pattern)
 * ───────────────────────────────────────────────────────────────────────── */

interface LabelMeta {
  starred?: boolean;
  tags?: string[];
  reviewer?: string;
  arNotes?: string;
  history?: { ts: number; actor: string; event: string }[];
}

const META_KEY = 'dropkast.label.meta';

function loadAllMeta(): Record<string, LabelMeta> {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; }
}
function saveAllMeta(m: Record<string, LabelMeta>) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {/* ignore */}
}

/* ─────────────────────────────────────────────────────────────────────────
 * Roster (local storage shape, lifted from existing Roster page)
 * ───────────────────────────────────────────────────────────────────────── */

const ROSTER_KEY = 'dropkast.label.roster';

interface RosterArtist {
  id: string;
  name: string;
  email?: string;
  genre?: string;
  status: 'active' | 'paused' | 'invited';
  releases: number;
}

function loadRoster(): RosterArtist[] {
  try { return JSON.parse(localStorage.getItem(ROSTER_KEY) || '[]'); } catch { return []; }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────────────────── */

export default function LabelView() {
  const gate = useTierGate();
  const { user } = useAuth();
  const { allReleases } = useReleases();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabId>('inbox');
  const [meta, setMeta] = useState<Record<string, LabelMeta>>(loadAllMeta);
  const [roster, setRoster] = useState<RosterArtist[]>(loadRoster);

  useEffect(() => {
    const handler = () => setRoster(loadRoster());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateMeta = (releaseId: string, patch: Partial<LabelMeta>) => {
    setMeta((prev) => {
      const cur = prev[releaseId] || {};
      const next = { ...prev, [releaseId]: { ...cur, ...patch } };
      saveAllMeta(next);
      return next;
    });
  };

  // tier check
  const isLabelTier = gate.tier.id === 'label';

  /* ── Stats ──────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const byStatus: Record<Release['status'], number> = { Draft: 0, Scheduled: 0, Released: 0, Rejected: 0 };
    let starred = 0;
    let thisMonth = 0;
    const now = new Date();
    for (const r of allReleases) {
      byStatus[r.status]++;
      if (meta[r.id]?.starred) starred++;
      const d = new Date(r.releaseDate);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) thisMonth++;
    }
    return { total: allReleases.length, byStatus, starred, thisMonth };
  }, [allReleases, meta]);

  return (
    <div className="max-w-[1400px] mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic mb-4">
          <Building2 className="w-3 h-3" /> Label Operating System
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              {user?.label || user?.artistName || 'Your Label'}
            </h1>
            <p className="text-white/40 text-sm italic mt-3 max-w-2xl">
              The single shell every label manager opens at the start of the day. Inbox, pipeline,
              release calendar, roster, splits — all your artists, one screen.
            </p>
          </div>
          <button
            onClick={() => navigate('/release/new')}
            className="h-12 px-6 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 self-start md:self-end"
          >
            <Plus className="w-4 h-4" /> New release
          </button>
        </div>
      </div>

      {!isLabelTier && (
        <div className="mb-6">
          <UpgradeBanner
            feature="Label Operating System"
            requiredTier="label"
            description="The unified inbox + kanban + release calendar + roster manager ships on the Label tier. Upgrade to unlock multi-artist context switching, drag-to-advance pipeline, and on-behalf-of submissions."
          />
        </div>
      )}

      {/* Stats strip */}
      <StatsStrip stats={stats} rosterSize={roster.length} />

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
                  'group flex items-center gap-2 px-5 h-12 text-[10px] font-black uppercase italic tracking-widest transition-all border-b-2 -mb-px',
                  active
                    ? 'text-primary border-primary'
                    : 'text-white/40 border-transparent hover:text-white',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span
                  className={cn(
                    'ml-1 text-[9px] tabular-nums px-1.5 py-0.5 border transition-all',
                    active ? 'border-primary/40 text-primary' : 'border-white/10 text-white/30',
                  )}
                >
                  {t.id === 'inbox'    && allReleases.length}
                  {t.id === 'board'    && allReleases.length}
                  {t.id === 'calendar' && stats.thisMonth}
                  {t.id === 'roster'   && roster.length}
                  {t.id === 'splits'   && '·'}
                  {t.id === 'submit'   && '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] font-mono text-white/30 italic mb-6">
        {TABS.find((t) => t.id === tab)?.description}
      </p>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'inbox'    && <InboxTab releases={allReleases} meta={meta} updateMeta={updateMeta} />}
          {tab === 'board'    && <BoardTab releases={allReleases} meta={meta} updateMeta={updateMeta} />}
          {tab === 'calendar' && <CalendarTab releases={allReleases} />}
          {tab === 'roster'   && <RosterTab roster={roster} releases={allReleases} />}
          {tab === 'splits'   && <SplitsTab />}
          {tab === 'submit'   && <SubmitTab roster={roster} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * StatsStrip — LED-style aggregate counters across the roster
 * ───────────────────────────────────────────────────────────────────────── */

function StatsStrip({ stats, rosterSize }: { stats: ReturnType<typeof Object>; rosterSize: number }) {
  const items = [
    { label: 'Total catalogue',   value: stats.total,             accent: '#fff' },
    { label: 'Drafts in flight',  value: stats.byStatus.Draft,     accent: '#9CA3AF' },
    { label: 'Scheduled',         value: stats.byStatus.Scheduled, accent: '#3B82F6' },
    { label: 'Live',              value: stats.byStatus.Released,  accent: '#22C55E' },
    { label: 'Drops this month',  value: stats.thisMonth,          accent: 'var(--color-primary)' },
    { label: 'Roster',            value: rosterSize,               accent: 'var(--color-primary)' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => (
        <div key={it.label} className="manifest-card p-4 bg-dark border border-white/10 hover:border-white/20 transition-all">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] italic mb-2" style={{ color: it.accent }}>
            {it.label}
          </div>
          <div className="text-3xl font-black italic text-white tabular-nums">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Inbox — searchable + filterable, with star/tag/reviewer inline
 * ───────────────────────────────────────────────────────────────────────── */

function InboxTab({
  releases,
  meta,
  updateMeta,
}: {
  releases: Release[];
  meta: Record<string, LabelMeta>;
  updateMeta: (id: string, p: Partial<LabelMeta>) => void;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Release['status']>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return releases
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => !showStarredOnly || meta[r.id]?.starred)
      .filter((r) =>
        !q || r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }, [releases, query, statusFilter, showStarredOnly, meta]);

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="manifest-card p-4 bg-dark border border-white/10 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or artist…"
            className="w-full h-10 pl-9 pr-3 bg-black/40 border border-white/10 text-white text-sm italic focus:border-primary outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'Draft', 'Scheduled', 'Released', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'h-9 px-3 text-[10px] font-black uppercase italic tracking-widest border transition-all',
                statusFilter === s
                  ? 'bg-primary border-primary text-white'
                  : 'border-white/10 text-white/40 hover:text-white hover:border-white/30',
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
          <button
            onClick={() => setShowStarredOnly((s) => !s)}
            className={cn(
              'h-9 px-3 text-[10px] font-black uppercase italic tracking-widest border transition-all flex items-center gap-1',
              showStarredOnly
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'border-white/10 text-white/40 hover:text-white hover:border-white/30',
            )}
          >
            <Star className={cn('w-3 h-3', showStarredOnly && 'fill-yellow-400')} /> Starred
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyHint label="No releases match your filter." />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <InboxRow key={r.id} release={r} meta={meta[r.id] || {}} updateMeta={updateMeta} />
          ))}
        </div>
      )}
    </div>
  );
}

function InboxRow({
  release,
  meta,
  updateMeta,
}: {
  release: Release;
  meta: LabelMeta;
  updateMeta: (id: string, p: Partial<LabelMeta>) => void;
}) {
  const [editingTag, setEditingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const statusMeta = STATUS_META[release.status];
  const StatusIcon = statusMeta.icon;

  const toggleStar = () => {
    updateMeta(release.id, { starred: !meta.starred });
    toast(meta.starred ? 'Unstarred' : 'Starred', { duration: 1200 });
  };
  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return setEditingTag(false);
    const nextTags = Array.from(new Set([...(meta.tags || []), t]));
    updateMeta(release.id, { tags: nextTags });
    setTagDraft('');
    setEditingTag(false);
  };
  const removeTag = (t: string) => {
    updateMeta(release.id, { tags: (meta.tags || []).filter((x) => x !== t) });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'manifest-card p-4 bg-dark border transition-all flex items-center gap-4',
        meta.starred ? 'border-yellow-500/30 bg-yellow-500/[0.02]' : 'border-white/10 hover:border-white/20',
      )}
    >
      {/* Star */}
      <button onClick={toggleStar} className="shrink-0 group">
        <Star
          className={cn(
            'w-4 h-4 transition-all',
            meta.starred ? 'fill-yellow-400 text-yellow-400' : 'text-white/20 group-hover:text-white/60',
          )}
        />
      </button>

      {/* Artwork */}
      {release.artwork ? (
        <img src={release.artwork} alt="" className="w-12 h-12 object-cover rounded-sm shrink-0" />
      ) : (
        <div className="w-12 h-12 border border-white/10 bg-black/40 shrink-0 flex items-center justify-center">
          <Disc className="w-5 h-5 text-white/20" />
        </div>
      )}

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-black italic text-white truncate">{release.title}</h4>
          <span className="text-[10px] font-black italic text-white/40 uppercase tracking-widest">
            {release.format}
          </span>
        </div>
        <div className="text-[11px] text-white/50 italic">{release.artist}</div>
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
          {(meta.tags || []).map((t) => (
            <button
              key={t}
              onClick={() => removeTag(t)}
              className="text-[9px] font-black uppercase tracking-widest italic px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
              title="Click to remove"
            >
              {t} ×
            </button>
          ))}
          {editingTag ? (
            <input
              autoFocus
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onBlur={addTag}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="tag…"
              className="text-[9px] font-mono px-2 py-0.5 bg-black border border-primary text-white outline-none w-20"
            />
          ) : (
            <button
              onClick={() => setEditingTag(true)}
              className="text-[9px] font-black uppercase tracking-widest italic text-white/30 hover:text-white inline-flex items-center gap-0.5"
            >
              <Tag className="w-2.5 h-2.5" /> add tag
            </button>
          )}
        </div>
      </div>

      {/* Release date */}
      <div className="hidden md:flex flex-col items-end text-right shrink-0">
        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Drop</div>
        <div className="text-[11px] text-white font-mono tabular-nums">
          {new Date(release.releaseDate).toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
          })}
        </div>
      </div>

      {/* Status pill */}
      <div
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-black uppercase italic tracking-widest shrink-0"
        style={{ color: statusMeta.color, borderColor: `${statusMeta.color}40`, background: `${statusMeta.color}10` }}
      >
        <StatusIcon className="w-3 h-3" />
        {statusMeta.label}
      </div>

      {/* Open */}
      <Link
        to={`/releases/${release.id}`}
        className="hidden md:inline-flex items-center gap-1 text-[10px] font-black uppercase italic tracking-widest text-white/50 hover:text-primary transition-all shrink-0"
      >
        Open <ArrowRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Board — kanban: Draft → Scheduled → Released (Rejected = side pile)
 * ───────────────────────────────────────────────────────────────────────── */

function BoardTab({
  releases,
  updateMeta,
}: {
  releases: Release[];
  meta: Record<string, LabelMeta>;
  updateMeta: (id: string, p: Partial<LabelMeta>) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const { updateRelease } = useReleases();

  const columns = STATUS_FLOW.map((s) => ({
    status: s,
    items: releases.filter((r) => r.status === s),
  }));
  const rejected = releases.filter((r) => r.status === 'Rejected');

  const moveTo = (id: string, next: Release['status']) => {
    const r = releases.find((x) => x.id === id);
    if (!r || r.status === next) return;
    updateRelease(id, { status: next });
    toast.success(`Moved to ${next}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const meta = STATUS_META[col.status];
          return (
            <div
              key={col.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) moveTo(dragId, col.status);
                setDragId(null);
              }}
              className="manifest-card p-4 bg-dark border border-white/10 min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div
                  className="text-[10px] font-black uppercase italic tracking-[0.3em]"
                  style={{ color: meta.color }}
                >
                  {col.status}
                </div>
                <span className="text-[10px] font-mono text-white/40 tabular-nums">
                  {col.items.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.items.length === 0 && (
                  <div className="text-[10px] text-white/20 italic py-6 text-center font-mono">
                    drop here
                  </div>
                )}
                {col.items.map((r) => (
                  <div
                    key={r.id}
                    draggable
                    onDragStart={() => setDragId(r.id)}
                    onDragEnd={() => setDragId(null)}
                    className="border border-white/10 bg-black/40 p-3 hover:border-primary cursor-grab active:cursor-grabbing transition-all"
                  >
                    <div className="text-xs font-black italic text-white truncate">{r.title}</div>
                    <div className="text-[10px] text-white/50 italic truncate">{r.artist}</div>
                    <div className="text-[9px] text-white/30 font-mono mt-1">
                      {new Date(r.releaseDate).toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit',
                      })} · {r.format}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {rejected.length > 0 && (
        <div className="manifest-card p-4 bg-dark border border-red-500/20">
          <div className="text-[10px] font-black text-red-400 uppercase italic tracking-[0.3em] mb-3">
            Rejected · {rejected.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {rejected.map((r) => (
              <div key={r.id} className="border border-red-500/20 p-2 bg-red-500/[0.03]">
                <div className="text-xs font-black italic text-white/80">{r.title}</div>
                <div className="text-[10px] text-white/40 italic">{r.artist}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Calendar — month grid with drop dots
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

  const nav = (dir: -1 | 1) =>
    setCursor((c) => {
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
          <button onClick={() => nav(-1)} className="h-9 w-9 border border-white/10 hover:border-primary text-white/60 hover:text-primary flex items-center justify-center transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => nav(1)} className="h-9 w-9 border border-white/10 hover:border-primary text-white/60 hover:text-primary flex items-center justify-center transition-all">
            <ChevronRight className="w-4 h-4" />
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
          const today =
            new Date().getDate() === day &&
            new Date().getMonth() === cursor.month &&
            new Date().getFullYear() === cursor.year;
          return (
            <div
              key={day}
              className={cn(
                'aspect-square border p-2 flex flex-col text-[10px]',
                today ? 'border-primary' : 'border-white/[0.08]',
                drops.length > 0 && 'bg-primary/[0.04]',
              )}
            >
              <span className={cn('font-mono tabular-nums', today ? 'text-primary' : 'text-white/40')}>
                {day}
              </span>
              <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                {drops.slice(0, 2).map((r) => (
                  <Link
                    key={r.id}
                    to={`/releases/${r.id}`}
                    className="text-[8px] font-black italic text-white truncate hover:text-primary"
                  >
                    {r.title}
                  </Link>
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
 * Roster — summary table + link to full /roster page
 * ───────────────────────────────────────────────────────────────────────── */

function RosterTab({ roster, releases }: { roster: RosterArtist[]; releases: Release[] }) {
  const liveCountByArtist = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of releases) {
      if (r.status === 'Released') m[r.artist] = (m[r.artist] || 0) + 1;
    }
    return m;
  }, [releases]);

  if (roster.length === 0) {
    return (
      <div className="manifest-card p-10 bg-dark border border-white/10 text-center">
        <Users className="w-10 h-10 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-black italic text-white mb-2">No artists on roster yet</h3>
        <p className="text-sm text-white/40 italic mb-6">
          Add artists from the dedicated Roster page to scope releases, earnings, and analytics per artist.
        </p>
        <Link
          to="/roster"
          className="inline-flex items-center gap-2 h-11 px-5 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all"
        >
          <Plus className="w-4 h-4" /> Open Roster
        </Link>
      </div>
    );
  }

  return (
    <div className="manifest-card p-0 bg-dark border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">
          {roster.length} artist{roster.length !== 1 && 's'}
        </span>
        <Link
          to="/roster"
          className="text-[10px] font-black text-primary uppercase tracking-widest italic hover:text-white inline-flex items-center gap-1"
        >
          Manage roster <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <table className="w-full text-left">
        <thead className="border-b border-white/10">
          <tr className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
            <th className="px-5 py-3">Artist</th>
            <th className="px-5 py-3">Genre</th>
            <th className="px-5 py-3 text-right">Live releases</th>
            <th className="px-5 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((a) => (
            <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="px-5 py-3 text-sm font-black italic text-white">{a.name}</td>
              <td className="px-5 py-3 text-[11px] text-white/50 italic">{a.genre || '—'}</td>
              <td className="px-5 py-3 text-right text-[11px] font-mono tabular-nums text-white/60">
                {liveCountByArtist[a.name] || 0}
              </td>
              <td className="px-5 py-3 text-right">
                <span
                  className={cn(
                    'text-[9px] font-black uppercase italic tracking-widest px-2 py-1 border',
                    a.status === 'active' && 'border-green-500/30 text-green-400 bg-green-500/5',
                    a.status === 'paused' && 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5',
                    a.status === 'invited' && 'border-blue-500/30 text-blue-400 bg-blue-500/5',
                  )}
                >
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Splits — embed the existing splits page as a tab via iframe-less link
 * ───────────────────────────────────────────────────────────────────────── */

function SplitsTab() {
  return (
    <div className="manifest-card p-8 bg-dark border border-white/10">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 border border-primary/40 bg-primary/5 flex items-center justify-center shrink-0">
          <Receipt className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black italic text-white mb-1">Splits catalogue</h3>
          <p className="text-sm text-white/50 italic max-w-xl leading-relaxed">
            Master + publishing percentages per song. Contributor agreements, status pipeline
            (draft → in-progress → cleared → released), CSV export, bulk email.
          </p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Link
          to="/splits"
          className="h-11 px-5 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
        >
          Open Splits Catalogue <ArrowRight className="w-3 h-3" />
        </Link>
        <Link
          to="/release/new"
          className="h-11 px-5 border border-white/20 text-white text-[10px] font-black uppercase italic tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2"
        >
          <Plus className="w-3 h-3" /> Add release w/ splits
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Submit — A&R submit-on-behalf-of artist (port of AdminSubmitPanel)
 * ───────────────────────────────────────────────────────────────────────── */

function SubmitTab({ roster }: { roster: RosterArtist[] }) {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<string>('');

  const submit = () => {
    if (!chosen) {
      toast.error('Pick an artist first');
      return;
    }
    const artist = roster.find((a) => a.id === chosen);
    if (!artist) return;
    try {
      localStorage.setItem('dropkast.label.activeArtistId', chosen);
    } catch {/* ignore */}
    toast.success(`Submitting on behalf of ${artist.name}`);
    navigate('/release/new');
  };

  return (
    <div className="manifest-card p-8 bg-dark border border-white/10 max-w-2xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 border border-primary/40 bg-primary/5 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-black italic text-white mb-1">Submit on behalf of artist</h3>
          <p className="text-sm text-white/50 italic max-w-xl leading-relaxed">
            Drop a release into the system as the label, attributed to the artist of your choice.
            The artist will see it in their inbox once delivery starts.
          </p>
        </div>
      </div>

      {roster.length === 0 ? (
        <EmptyHint label="No roster yet — add artists first." />
      ) : (
        <>
          <label className="block text-[10px] font-black uppercase tracking-widest italic text-white/40 mb-2">
            Artist
          </label>
          <select
            value={chosen}
            onChange={(e) => setChosen(e.target.value)}
            className="w-full h-11 px-3 bg-black/40 border border-white/10 text-white text-sm italic focus:border-primary outline-none mb-6"
          >
            <option value="">Pick an artist…</option>
            {roster.map((a) => (
              <option key={a.id} value={a.id}>{a.name}{a.genre ? ` · ${a.genre}` : ''}</option>
            ))}
          </select>
          <button
            onClick={submit}
            className="h-11 px-6 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Open new-release form
          </button>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Empty hint
 * ───────────────────────────────────────────────────────────────────────── */

function EmptyHint({ label }: { label: string }) {
  return (
    <div className="manifest-card p-8 bg-dark border border-white/10 text-center">
      <Music className="w-8 h-8 text-white/15 mx-auto mb-3" />
      <p className="text-[11px] text-white/40 italic">{label}</p>
    </div>
  );
}
