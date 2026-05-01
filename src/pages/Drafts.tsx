/**
 * Drafts manager — every release the artist started but didn't submit.
 *
 * Auto-saved by NewRelease.tsx every 10s into localStorage. This page
 * surfaces them so artists can resume work without losing data.
 *
 * The current implementation supports a single in-progress draft (the
 * "active" one). When multi-draft support ships in the wizard, this page
 * iterates over the indexed list and shows last-edit timestamps.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileEdit, ArrowRight, Trash2, Plus, Clock, Music } from 'lucide-react';
import { toast } from 'sonner';

const DRAFT_KEY = 'dropkast_release_draft';

interface DraftPreview {
  title?: string;
  artist?: string;
  genre?: string;
  releaseDate?: string;
  format?: string;
  savedAt?: string;
}

function loadActiveDraft(): DraftPreview | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

export default function Drafts() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<DraftPreview | null>(() => loadActiveDraft());

  useEffect(() => {
    // Refresh when window regains focus — the wizard might have updated the draft
    const onFocus = () => setDraft(loadActiveDraft());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleResume = () => {
    navigate('/releases/new?resume=1');
  };

  const handleDiscard = () => {
    if (!confirm('Throw away this draft? Can\'t be recovered.')) return;
    localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
    toast.message('Draft discarded');
  };

  const drafts = draft ? [draft] : [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <FileEdit className="w-3 h-3" /> Drafts
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
            Pick up <span className="text-primary">where you left off</span>
          </h1>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Every release in progress. Drafts auto-save every 10 seconds — your work is safe even
            if you close the tab.
          </p>
        </div>

        <button
          onClick={() => navigate('/releases/new')}
          className="h-14 px-8 bg-white text-black hover:bg-primary hover:text-white transition-all flex items-center gap-3 text-[11px] font-black uppercase italic tracking-widest"
        >
          <Plus className="w-4 h-4" /> Start new release
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10">
          <FileEdit className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <div className="text-white/50 italic mb-2 text-lg">No drafts in progress.</div>
          <p className="text-white/30 italic text-sm mb-6 max-w-md mx-auto">
            When you start a release, your work auto-saves here. Close the tab and come back any time.
          </p>
          <Link to="/releases/new" className="text-primary hover:underline italic text-sm">
            Start your first release →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drafts.map((d, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="manifest-card p-6 bg-dark border border-primary/20 hover:border-primary transition-all flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest italic">
                  <Clock className="w-2.5 h-2.5" /> In progress
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black italic text-white truncate">
                  {d.title || 'Untitled draft'}
                </h3>
                <div className="text-[11px] text-white/40 italic mt-1">
                  {d.artist || 'No artist set'} · {d.format || 'Single'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div>
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1">
                    Genre
                  </div>
                  <div className="text-xs font-black italic text-white truncate">
                    {d.genre || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1">
                    Release date
                  </div>
                  <div className="text-xs font-black italic text-white">
                    {d.releaseDate || 'Not set'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResume}
                  className="flex-1 h-11 bg-white text-black text-[10px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Resume <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDiscard}
                  aria-label="Discard draft"
                  className="h-11 px-3 border border-white/10 text-white/40 hover:border-red-500 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {drafts.length > 0 && (
        <div className="mt-12 p-6 border border-white/10 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Clock className="w-6 h-6 text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-base font-black italic text-white mb-1">Auto-save is on</h3>
            <p className="text-sm text-white/50 italic">
              Drafts save every 10 seconds while you're in the wizard. We can't auto-save audio or
              artwork files (browsers block it for security), so you'll be asked to re-attach them
              when you resume.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
