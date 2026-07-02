/**
 * Smart Links manager — the artist's view of every smart-link they've
 * generated. List + KPIs + create / edit modal.
 *
 * Like DistroKid Hyperfollow, but with email subscriber tracking and
 * per-DSP click counters that aggregate locally for now and POST to
 * /api/links/:slug/click + /api/links/:slug/subscribe when the backend
 * persists.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Link2,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Trash2,
  Sparkles,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  buildPublicUrl,
  listSmartLinks,
  makeSlug,
  readClicks,
  readSubscribers,
  saveSmartLink,
  type SmartLinkPayload,
} from '../lib/smartlink';

const DSP_INPUT_FIELDS: Array<{ key: string; label: string; placeholder: string }> = [
  { key: 'spotify',         label: 'Spotify',       placeholder: 'https://open.spotify.com/track/...' },
  { key: 'apple',           label: 'Apple Music',   placeholder: 'https://music.apple.com/...' },
  { key: 'amazon',          label: 'Amazon Music',  placeholder: 'https://music.amazon.com/...' },
  { key: 'youtube-music',   label: 'YouTube Music', placeholder: 'https://music.youtube.com/...' },
  { key: 'deezer',          label: 'Deezer',        placeholder: 'https://www.deezer.com/...' },
  { key: 'tidal',           label: 'Tidal',         placeholder: 'https://tidal.com/...' },
  { key: 'soundcloud',      label: 'SoundCloud',    placeholder: 'https://soundcloud.com/...' },
  { key: 'audiomack',       label: 'Audiomack',     placeholder: 'https://audiomack.com/...' },
  { key: 'tiktok',          label: 'TikTok',        placeholder: 'https://www.tiktok.com/music/...' },
];

export default function SmartLinks() {
  const [items, setItems] = useState(() => listSmartLinks());
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    artist: '',
    releaseDate: '',
    tagline: '',
    artwork: '',
    primaryColor: '#FF4D00',
    links: {} as Record<string, string>,
    socials: { instagram: '', tiktok: '', twitter: '', youtube: '' },
  });

  const refresh = () => setItems(listSmartLinks());

  const enrichedItems = useMemo(() => {
    return items.map((it) => {
      const subs = readSubscribers(it.slug);
      const clicks = readClicks(it.slug);
      const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);
      return { ...it, subs: subs.length, clicks: totalClicks };
    });
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrichedItems;
    return enrichedItems.filter((i) => i.title.toLowerCase().includes(q));
  }, [enrichedItems, search]);

  const handleCreate = () => {
    if (!draft.title.trim() || !draft.artist.trim()) {
      toast.error('Title and artist name are required');
      return;
    }
    if (Object.values(draft.links).filter(Boolean).length === 0) {
      toast.error('Add at least one DSP link');
      return;
    }

    const releaseId = `rel-${Date.now()}`;
    const slug = makeSlug(releaseId, draft.title);
    const payload: SmartLinkPayload = {
      id: slug,
      releaseId,
      title: draft.title.trim(),
      artist: draft.artist.trim(),
      releaseDate: draft.releaseDate || undefined,
      tagline: draft.tagline.trim() || undefined,
      artwork: draft.artwork.trim() || undefined,
      primaryColor: draft.primaryColor,
      links: Object.fromEntries(Object.entries(draft.links).filter(([, v]) => !!v)),
      socials: Object.fromEntries(
        Object.entries(draft.socials).filter(([, v]) => !!v),
      ) as SmartLinkPayload['socials'],
      createdAt: new Date().toISOString(),
    };
    saveSmartLink(payload);
    toast.success('Smart link created', {
      description: `Public URL: ${buildPublicUrl(slug)}`,
    });
    setShowCreate(false);
    setDraft({
      title: '',
      artist: '',
      releaseDate: '',
      tagline: '',
      artwork: '',
      primaryColor: '#FF4D00',
      links: {},
      socials: { instagram: '', tiktok: '', twitter: '', youtube: '' },
    });
    refresh();
  };

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(buildPublicUrl(slug));
    toast.success('Link copied');
  };

  const handleDelete = (slug: string, title: string) => {
    if (!confirm(`Delete the smart link for "${title}"?`)) return;
    try {
      localStorage.removeItem(`dropkast.smartlink.${slug}`);
      const idxRaw = localStorage.getItem('dropkast.smartlinks.index') || '[]';
      const idx = JSON.parse(idxRaw) as Array<{ slug: string }>;
      const next = idx.filter((x) => x.slug !== slug);
      localStorage.setItem('dropkast.smartlinks.index', JSON.stringify(next));
    } catch {/* ignore */}
    toast.message('Link deleted');
    refresh();
  };

  // Keep totals fresh
  useEffect(() => {
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 min-w-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <Link2 className="w-3 h-3 shrink-0" /> Smart Links
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none break-words">
            One link.<br />
            <span className="text-primary">Every</span> platform.
          </h1>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Generate a public landing page per release. Fans pick their DSP. Pre-saves before
            release date, listen-now after. Captures emails. Tracks clicks per-platform. Like
            DistroKid Hyperfollow — built in, no add-on fee.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="beam h-14 px-8 shrink-0 bg-white text-black transition-all flex items-center gap-3 text-[11px] font-black uppercase italic tracking-widest"
        >
          <Plus className="w-4 h-4 shrink-0" /> Create smart link
        </button>
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
          placeholder="Search your links..."
          className="w-full bg-dark border border-white/10 py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary text-sm placeholder:text-white/20"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10">
          <Link2 className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <div className="text-white/50 italic mb-2 text-lg">No smart links yet.</div>
          <p className="text-white/30 italic text-sm mb-6 max-w-md mx-auto">
            Generate one per release. Share a single URL — fans pick their service.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-primary hover:underline italic text-sm"
          >
            Create your first smart link →
          </button>
        </div>
      )}

      {/* Links grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((it, idx) => (
          <motion.div
            key={it.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="manifest-card p-6 bg-dark border border-white/5 transition-all flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black italic text-white truncate mb-1">{it.title}</h3>
                <div className="text-[10px] font-mono text-white/40 truncate">/link/{it.slug}</div>
              </div>
              <button
                onClick={() => handleDelete(it.slug, it.title)}
                className="beam p-2 text-white/30 transition-colors shrink-0"
                aria-label="Delete smart link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <div>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Clicks
                </div>
                <div className="text-2xl font-black italic text-white">{it.clicks}</div>
              </div>
              <div>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Emails
                </div>
                <div className="text-2xl font-black italic text-white">{it.subs}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopy(it.slug)}
                className="beam flex-1 h-10 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/70 transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <a
                href={`/link/${it.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="beam flex-1 h-10 bg-white text-black text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Open <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hint */}
      {filtered.length > 0 && (
        <div className="mt-12 p-6 border border-primary/20 bg-primary/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Sparkles className="w-6 h-6 text-primary shrink-0" />
          <div className="flex-1">
            <h3 className="text-base font-black italic text-white mb-1">Auto-generate at release submit</h3>
            <p className="text-sm text-white/60 italic">
              Coming next: every approved release auto-creates its smart link with the DSP URLs
              your delivery adapter returns. You won't need to paste links manually.
            </p>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="manifest-card p-8 bg-dark border-white/10 max-w-2xl w-full space-y-6 my-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black italic text-white tracking-tight mb-2">
                  Create smart link
                </h2>
                <p className="text-sm text-white/50 italic">
                  Paste your DSP URLs once, share one link. Fans pick where to listen.
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/40 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Release title *
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Skyline"
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Artist name *
                </label>
                <input
                  type="text"
                  value={draft.artist}
                  onChange={(e) => setDraft({ ...draft, artist: e.target.value })}
                  placeholder="e.g. Aqua Pearl"
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Release date
                </label>
                <input
                  type="date"
                  value={draft.releaseDate}
                  onChange={(e) => setDraft({ ...draft, releaseDate: e.target.value })}
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Tagline (optional)
                </label>
                <input
                  type="text"
                  value={draft.tagline}
                  onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  placeholder="e.g. Out everywhere May 22."
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Cover artwork URL
                </label>
                <input
                  type="url"
                  value={draft.artwork}
                  onChange={(e) => setDraft({ ...draft, artwork: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                  Accent color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.primaryColor}
                    onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })}
                    className="h-12 w-12 bg-transparent border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.primaryColor}
                    onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })}
                    className="flex-1 bg-black border border-white/10 py-3 px-4 text-white focus:outline-none focus:border-primary text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] italic mb-3">
                Streaming links (paste at least one)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {DSP_INPUT_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-3">
                    <span className="w-32 text-[10px] font-black text-white/60 uppercase tracking-widest italic shrink-0">
                      {f.label}
                    </span>
                    <input
                      type="url"
                      value={draft.links[f.key] || ''}
                      onChange={(e) =>
                        setDraft({ ...draft, links: { ...draft.links, [f.key]: e.target.value } })
                      }
                      placeholder={f.placeholder}
                      className="flex-1 bg-black border border-white/10 py-2 px-3 text-white focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="beam h-12 px-6 border border-white/10 text-white/60 text-[10px] font-black uppercase italic tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="beam flex-1 h-12 bg-white text-black text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3"
              >
                Generate smart link <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
