/**
 * Label Roster — manage multiple artists from a single label account.
 *
 * Each row is one artist signed to the label. Click an artist to "switch
 * context" — every page (Releases, Earnings, Analytics) then shows that
 * artist's data. The active artist is stored in localStorage.
 *
 * For now, the roster is stored in localStorage too. When the real
 * label-accounts backend ships (`label_artists` table), this swaps to a
 * real GET /api/label/roster fetch.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Music,
  ArrowRight,
  Trash2,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const ROSTER_KEY = 'dropkast.label.roster';
const ACTIVE_KEY = 'dropkast.label.activeArtistId';

interface RosterArtist {
  id: string;
  name: string;
  email?: string;
  genre?: string;
  status: 'active' | 'paused' | 'invited';
  releases: number;
  monthlyStreams: number;
  monthlyEarningsCents: number;
  joinedAt: string;
  avatarUrl?: string;
}

const SEED_ROSTER: RosterArtist[] = [
  {
    id: 'art-aqua',
    name: 'Aqua Pearl',
    genre: 'Hyperpop',
    status: 'active',
    releases: 8,
    monthlyStreams: 1_240_000,
    monthlyEarningsCents: 410_000,
    joinedAt: '2025-08-12',
  },
  {
    id: 'art-buddy',
    name: 'Buddy Kay',
    genre: 'Amapiano',
    status: 'active',
    releases: 14,
    monthlyStreams: 3_800_000,
    monthlyEarningsCents: 1_270_000,
    joinedAt: '2025-03-04',
  },
  {
    id: 'art-night',
    name: 'Night Pulse',
    genre: 'R&B',
    status: 'paused',
    releases: 4,
    monthlyStreams: 92_000,
    monthlyEarningsCents: 31_000,
    joinedAt: '2026-01-19',
  },
];

function loadRoster(): RosterArtist[] {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  // Seed and persist on first visit
  localStorage.setItem(ROSTER_KEY, JSON.stringify(SEED_ROSTER));
  return SEED_ROSTER;
}

function saveRoster(roster: RosterArtist[]) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
}

export default function Roster() {
  const navigate = useNavigate();
  const [roster, setRoster] = useState<RosterArtist[]>(() => loadRoster());
  const [activeId, setActiveId] = useState<string>(() => localStorage.getItem(ACTIVE_KEY) ?? '');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newArtist, setNewArtist] = useState({ name: '', email: '', genre: '' });

  useEffect(() => {
    saveRoster(roster);
  }, [roster]);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((a) => a.name.toLowerCase().includes(q) || (a.genre ?? '').toLowerCase().includes(q));
  }, [roster, search]);

  const totals = useMemo(() => {
    return roster.reduce(
      (acc, a) => ({
        artists: acc.artists + 1,
        releases: acc.releases + a.releases,
        streams: acc.streams + a.monthlyStreams,
        earnings: acc.earnings + a.monthlyEarningsCents,
      }),
      { artists: 0, releases: 0, streams: 0, earnings: 0 },
    );
  }, [roster]);

  const switchTo = (artist: RosterArtist) => {
    setActiveId(artist.id);
    toast.success(`Now managing ${artist.name}`, { description: 'All pages will show this artist\'s data.' });
    navigate('/dashboard');
  };

  const addArtist = () => {
    if (!newArtist.name.trim()) {
      toast.error('Artist name is required');
      return;
    }
    const a: RosterArtist = {
      id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newArtist.name.trim(),
      email: newArtist.email.trim() || undefined,
      genre: newArtist.genre.trim() || undefined,
      status: newArtist.email ? 'invited' : 'active',
      releases: 0,
      monthlyStreams: 0,
      monthlyEarningsCents: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setRoster((prev) => [a, ...prev]);
    setNewArtist({ name: '', email: '', genre: '' });
    setShowAdd(false);
    toast.success(`${a.name} added to your roster`);
  };

  const removeArtist = (id: string) => {
    const a = roster.find((x) => x.id === id);
    if (!a) return;
    if (!confirm(`Remove ${a.name} from your roster?`)) return;
    setRoster((prev) => prev.filter((x) => x.id !== id));
    if (activeId === id) {
      setActiveId('');
      localStorage.removeItem(ACTIVE_KEY);
    }
    toast.message(`${a.name} removed`);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <Building2 className="w-3 h-3" /> Label Roster
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
            Your <span className="text-primary">artists</span>
          </h1>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Every artist on your label, in one place. Click one to switch into their context — all pages
            (Releases, Earnings, Campaigns) will then show that artist's data. Switch back any time.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="h-14 px-8 bg-white text-black hover:bg-primary hover:text-white transition-all flex items-center gap-3 text-[11px] font-black uppercase italic tracking-widest"
        >
          <Plus className="w-4 h-4" /> Add artist
        </button>
      </div>

      {/* Roster KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="manifest-card p-6 bg-dark border-white/5">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">Artists</div>
          <div className="text-4xl font-black italic text-white">{totals.artists}</div>
        </div>
        <div className="manifest-card p-6 bg-dark border-white/5">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">Releases</div>
          <div className="text-4xl font-black italic text-white">{totals.releases}</div>
        </div>
        <div className="manifest-card p-6 bg-dark border-white/5">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">Monthly streams</div>
          <div className="text-4xl font-black italic text-white">{(totals.streams / 1_000_000).toFixed(1)}M</div>
        </div>
        <div className="manifest-card p-6 bg-dark border-white/5">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">Monthly earnings</div>
          <div className="text-4xl font-black italic text-white">${(totals.earnings / 100).toLocaleString()}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group mb-6 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists or genres..."
          className="w-full bg-dark border border-white/10 py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary text-sm placeholder:text-white/20"
        />
      </div>

      {/* Roster grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((a, idx) => {
          const isActive = activeId === a.id;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                'manifest-card p-6 bg-dark border transition-all flex flex-col gap-4',
                isActive ? 'border-primary' : 'border-white/5 hover:border-white/20',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 border border-white/10 flex items-center justify-center bg-white/5 text-2xl font-black italic">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest italic">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </div>
                  )}
                  <div
                    className={cn(
                      'text-[8px] font-black uppercase tracking-widest italic px-2 py-1',
                      a.status === 'active' && 'bg-green-500/10 text-green-400',
                      a.status === 'paused' && 'bg-yellow-500/10 text-yellow-400',
                      a.status === 'invited' && 'bg-blue-500/10 text-blue-400',
                    )}
                  >
                    {a.status}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white italic tracking-tight">{a.name}</h3>
                {a.genre && <div className="text-[11px] text-white/40 italic">{a.genre}</div>}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                <div>
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1 flex items-center gap-1">
                    <Music className="w-3 h-3" /> Drops
                  </div>
                  <div className="text-base font-black italic text-white">{a.releases}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Streams
                  </div>
                  <div className="text-base font-black italic text-white">
                    {a.monthlyStreams >= 1_000_000
                      ? `${(a.monthlyStreams / 1_000_000).toFixed(1)}M`
                      : `${Math.round(a.monthlyStreams / 1000)}K`}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> /mo
                  </div>
                  <div className="text-base font-black italic text-white">
                    ${(a.monthlyEarningsCents / 100).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => switchTo(a)}
                  className={cn(
                    'flex-1 h-11 text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-white text-black hover:bg-primary hover:text-white',
                  )}
                >
                  {isActive ? 'Currently active' : 'Switch to'} <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeArtist(a.id)}
                  className="h-11 px-3 border border-white/10 text-white/40 hover:border-red-500 hover:text-red-500 transition-all"
                  title="Remove from roster"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10">
          <div className="text-white/30 italic mb-4">No artists in your roster yet.</div>
          <button onClick={() => setShowAdd(true)} className="text-primary hover:underline italic text-sm">
            Add your first artist
          </button>
        </div>
      )}

      {/* Hint card */}
      <div className="mt-12 p-8 border border-primary/20 bg-primary/5 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Sparkles className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-black italic text-white mb-1">Label-wide reporting coming soon</h3>
          <p className="text-sm text-white/60 italic">
            Catalogue earnings rollups, label-wide A&R critique, multi-artist campaign budgets, and
            shared collaborator pools across your roster — wiring up alongside the Stripe Connect
            mass-payout system.
          </p>
        </div>
      </div>

      {/* Add artist modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowAdd(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="manifest-card p-8 bg-dark border-white/10 max-w-md w-full space-y-6"
          >
            <h2 className="text-3xl font-black italic text-white tracking-tight">Add an artist</h2>
            <p className="text-sm text-white/50 italic">
              Add an artist you already manage, or invite a new one by email — they'll get a link to
              accept your label representation.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Artist name *
                </label>
                <input
                  type="text"
                  value={newArtist.name}
                  onChange={(e) => setNewArtist((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Aqua Pearl"
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  value={newArtist.genre}
                  onChange={(e) => setNewArtist((p) => ({ ...p, genre: e.target.value }))}
                  placeholder="e.g. Amapiano"
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Email (optional — sends invite)
                </label>
                <input
                  type="email"
                  value={newArtist.email}
                  onChange={(e) => setNewArtist((p) => ({ ...p, email: e.target.value }))}
                  placeholder="artist@email.com"
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="h-12 px-6 border border-white/10 text-white/60 text-[10px] font-black uppercase italic tracking-widest hover:border-white hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addArtist}
                className="flex-1 h-12 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all"
              >
                Add to roster
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
