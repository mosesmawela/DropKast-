/**
 * Playlists — for curators / influencers to build and share playlists that
 * feature artists' tracks. localStorage-backed MVP (schema-ready for a real
 * /api/playlists table). Theme-aware (works in light + dark).
 */
import { useState, useEffect } from 'react';
import { ListMusic, Plus, Trash2, Music, X } from 'lucide-react';
import { useReleases } from '../context/ReleaseContext';
import { useNotify } from '../context/NotificationContext';
import { cn } from '../lib/utils';

interface Track { id: string; title: string; artist: string; }
interface Playlist { id: string; name: string; description: string; tracks: Track[]; createdAt: number; }

const KEY = 'dropkast_playlists';
const load = (): Playlist[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const save = (p: Playlist[]) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {/* ignore */} };

export default function Playlists() {
  const { allReleases } = useReleases();
  const { notify } = useNotify();
  const [playlists, setPlaylists] = useState<Playlist[]>(load);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => { save(playlists); }, [playlists]);

  const create = () => {
    if (!draft.name.trim()) return;
    const pl: Playlist = { id: crypto.randomUUID?.() || String(Date.now()), name: draft.name.trim(), description: draft.description.trim(), tracks: [], createdAt: Date.now() };
    setPlaylists((p) => [pl, ...p]);
    setDraft({ name: '', description: '' });
    setCreating(false);
    setOpenId(pl.id);
    notify('success', 'Playlist created', `"${pl.name}" is ready — add some tracks.`);
  };

  const remove = (id: string) => setPlaylists((p) => p.filter((x) => x.id !== id));

  const addTrack = (id: string, t: Track) => setPlaylists((p) => p.map((pl) =>
    pl.id === id && !pl.tracks.some((x) => x.id === t.id) ? { ...pl, tracks: [...pl.tracks, t] } : pl));

  const removeTrack = (id: string, tid: string) => setPlaylists((p) => p.map((pl) =>
    pl.id === id ? { ...pl, tracks: pl.tracks.filter((t) => t.id !== tid) } : pl));

  const catalogue: Track[] = allReleases.map((r) => ({ id: r.id, title: r.title, artist: r.artist }));

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-10 px-4 sm:px-2 font-sans">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[var(--border-main)] pb-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ListMusic className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] italic font-mono">Playlists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-[var(--text-main)]">Build a playlist</h1>
          <p className="text-[var(--text-main)]/50 text-sm italic mt-2 max-w-xl">Curate tracks into playlists you can share and pitch. Feature the artists you love.</p>
        </div>
        <button onClick={() => setCreating((c) => !c)} className="beam h-12 px-6 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> New playlist
        </button>
      </header>

      {creating && (
        <div className="border border-primary/30 bg-primary/5 p-6 mb-8 space-y-4">
          <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Playlist name — e.g. Late Night Amapiano"
            className="w-full h-11 px-3 bg-[var(--card-bg)] border border-[var(--border-main)] text-[var(--text-main)] text-sm italic outline-none focus:border-primary" />
          <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description — what's the vibe? (optional)"
            className="w-full h-11 px-3 bg-[var(--card-bg)] border border-[var(--border-main)] text-[var(--text-main)] text-sm italic outline-none focus:border-primary" />
          <div className="flex gap-2">
            <button onClick={create} disabled={!draft.name.trim()} className="h-10 px-5 bg-white text-black text-[10px] font-black uppercase italic tracking-widest disabled:opacity-30 transition-all">Create</button>
            <button onClick={() => setCreating(false)} className="h-10 px-5 border border-[var(--border-main)] text-[var(--text-main)]/60 text-[10px] font-black uppercase italic tracking-widest transition-all">Cancel</button>
          </div>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-[var(--border-main)]">
          <ListMusic className="w-10 h-10 text-[var(--text-main)]/15 mx-auto mb-4" />
          <p className="text-[var(--text-main)]/40 italic">No playlists yet. Create your first one to start curating.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {playlists.map((pl) => (
            <div key={pl.id} className="border border-[var(--border-main)] bg-[var(--card-bg)]">
              <button onClick={() => setOpenId(openId === pl.id ? null : pl.id)} className="w-full flex items-center gap-4 p-5 text-left">
                <div className="w-11 h-11 border border-primary/40 flex items-center justify-center text-primary shrink-0"><ListMusic className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black italic uppercase text-[var(--text-main)] truncate">{pl.name}</div>
                  <div className="text-[11px] text-[var(--text-main)]/50 italic">{pl.tracks.length} track{pl.tracks.length !== 1 ? 's' : ''}{pl.description ? ` · ${pl.description}` : ''}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(pl.id); }} className="text-[var(--text-main)]/30 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
              </button>

              {openId === pl.id && (
                <div className="border-t border-[var(--border-main)] p-5 space-y-4">
                  {pl.tracks.length > 0 && (
                    <div className="space-y-1.5">
                      {pl.tracks.map((t, i) => (
                        <div key={t.id} className="flex items-center gap-3 text-sm">
                          <span className="text-[var(--text-main)]/30 font-mono text-xs w-5">{String(i + 1).padStart(2, '0')}</span>
                          <Music className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-[var(--text-main)] italic font-black truncate">{t.title}</span>
                          <span className="text-[var(--text-main)]/40 italic truncate">· {t.artist}</span>
                          <button onClick={() => removeTrack(pl.id, t.id)} className="ml-auto text-[var(--text-main)]/30"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest italic text-[var(--text-main)]/40 mb-2">Add from catalogue</div>
                    {catalogue.length === 0 ? (
                      <p className="text-[11px] text-[var(--text-main)]/30 italic">No releases available to add yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {catalogue.filter((t) => !pl.tracks.some((x) => x.id === t.id)).map((t) => (
                          <button key={t.id} onClick={() => addTrack(pl.id, t)} className={cn('text-[10px] font-black uppercase italic tracking-widest px-3 py-1.5 border border-[var(--border-main)] text-[var(--text-main)]/60 transition-all')}>
                            + {t.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
