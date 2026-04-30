/**
 * Self-Service Fixes — drops on a release detail page so artists can
 * resolve typos / wrong artwork / takedown requests without filing a
 * support ticket.
 *
 * Mirrors Amuse Self-Service Fixes + DistroKid "Edit credits/lyrics".
 *
 * Wired to existing endpoints:
 *   - PATCH /api/releases/:id/metadata
 *   - POST  /api/releases/:id/takedown
 *   - POST  /api/assets/cover (for new artwork)
 *
 * The release lifecycle state machine ensures only delivered/live
 * releases hit redelivery — the API rejects edits to drafts.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Edit3,
  Image as ImageIcon,
  XCircle,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface Release {
  id: string;
  title: string;
  artist: string;
  status: string;
  artwork?: string;
  isrc?: string;
  upc?: string;
  genre?: string;
  releaseDate?: string;
}

const FIX_OPTIONS: Array<{ id: 'metadata' | 'artwork' | 'takedown'; label: string; desc: string; icon: any }> = [
  {
    id: 'metadata',
    label: 'Fix metadata',
    desc: 'Title typo, wrong genre, missing credits, ISRC fix.',
    icon: Edit3,
  },
  {
    id: 'artwork',
    label: 'Replace artwork',
    desc: 'Upload a new cover. Replaces on every DSP within 48h.',
    icon: ImageIcon,
  },
  {
    id: 'takedown',
    label: 'Take it down',
    desc: 'Pull the release from every store. Instant, but reversible.',
    icon: XCircle,
  },
];

export default function SelfServiceFixes({ release, onUpdated }: { release: Release; onUpdated?: () => void }) {
  const [open, setOpen] = useState<null | 'metadata' | 'artwork' | 'takedown'>(null);
  const [submitting, setSubmitting] = useState(false);

  const eligible = ['Live', 'Released', 'Delivered', 'In Review'].includes(release.status);

  // Metadata form state
  const [title, setTitle] = useState(release.title || '');
  const [genre, setGenre] = useState(release.genre || '');
  const [reason, setReason] = useState('');

  // Artwork
  const [newArtworkUrl, setNewArtworkUrl] = useState('');

  // Takedown
  const [takedownReason, setTakedownReason] = useState('');

  const submitMetadata = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/releases/${release.id}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, reason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Metadata fix submitted', {
        description: 'DDEX update going to every DSP. Live within 48h.',
      });
      setOpen(null);
      onUpdated?.();
    } catch {
      toast.error('Couldn\'t submit fix — try again');
    } finally {
      setSubmitting(false);
    }
  };

  const submitArtwork = async () => {
    if (!newArtworkUrl.trim()) {
      toast.error('Paste a URL or upload first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/releases/${release.id}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork: newArtworkUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success('New artwork queued', {
        description: 'Validating dimensions + content. Live on stores within 48h if approved.',
      });
      setOpen(null);
      onUpdated?.();
    } catch {
      toast.error('Couldn\'t replace artwork — try again');
    } finally {
      setSubmitting(false);
    }
  };

  const submitTakedown = async () => {
    if (!takedownReason.trim()) {
      toast.error('Tell us why so we can flag any duplicates');
      return;
    }
    if (!confirm(`Pull "${release.title}" from every store? This stops all earnings going forward.`)) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/releases/${release.id}/takedown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: takedownReason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Takedown filed', {
        description: 'Removed from queues immediately. Stores reflect within 24-72h.',
      });
      setOpen(null);
      onUpdated?.();
    } catch {
      toast.error('Couldn\'t file takedown — try again');
    } finally {
      setSubmitting(false);
    }
  };

  if (!eligible) {
    return (
      <div className="manifest-card p-6 bg-dark border border-white/5 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-white/30 shrink-0" />
        <div>
          <div className="text-sm font-black italic text-white">Self-service fixes not available yet</div>
          <div className="text-[11px] text-white/40 italic">
            Available once the release status hits "In Review" or "Live".
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manifest-card p-6 bg-dark border border-primary/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 border border-primary/40 flex items-center justify-center">
          <Wrench className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black italic text-white">Need to fix something?</h3>
          <p className="text-[11px] text-white/40 italic">
            No support ticket. Edit it yourself — we'll redeliver to every DSP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FIX_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setOpen(opt.id)}
              className={cn(
                'border p-4 text-left transition-all group',
                opt.id === 'takedown'
                  ? 'border-white/10 bg-black/40 hover:border-red-500/40 hover:bg-red-500/5'
                  : 'border-white/10 bg-black/40 hover:border-primary hover:bg-primary/5',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 mb-3',
                  opt.id === 'takedown' ? 'text-red-400 group-hover:text-red-500' : 'text-white/60 group-hover:text-primary',
                )}
              />
              <div className="text-sm font-black italic text-white mb-1">{opt.label}</div>
              <div className="text-[11px] text-white/50 italic leading-relaxed">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 mt-6 pt-6 space-y-4">
              {open === 'metadata' && (
                <>
                  <h4 className="text-sm font-black italic text-white">Fix metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black border border-white/10 py-3 px-3 text-white text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                        Genre
                      </label>
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-black border border-white/10 py-3 px-3 text-white text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                        Reason (optional)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Typo in original title — corrected to match the released version."
                        rows={2}
                        className="w-full bg-black border border-white/10 py-3 px-3 text-white text-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setOpen(null)}
                      className="h-11 px-5 border border-white/10 text-white/60 text-[10px] font-black uppercase italic tracking-widest hover:border-white hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitMetadata}
                      disabled={submitting}
                      className="h-11 px-5 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Submit fix
                    </button>
                  </div>
                </>
              )}

              {open === 'artwork' && (
                <>
                  <h4 className="text-sm font-black italic text-white">Replace artwork</h4>
                  <p className="text-[11px] text-white/40 italic">
                    Must be 3000×3000+, square, JPG/PNG/WebP. No URLs/social handles in the image.
                  </p>
                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                      New artwork URL
                    </label>
                    <input
                      type="url"
                      value={newArtworkUrl}
                      onChange={(e) => setNewArtworkUrl(e.target.value)}
                      placeholder="https://... or upload to /assets first"
                      className="w-full bg-black border border-white/10 py-3 px-3 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setOpen(null)}
                      className="h-11 px-5 border border-white/10 text-white/60 text-[10px] font-black uppercase italic tracking-widest hover:border-white hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitArtwork}
                      disabled={submitting}
                      className="h-11 px-5 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                      Replace + redeliver
                    </button>
                  </div>
                </>
              )}

              {open === 'takedown' && (
                <>
                  <h4 className="text-sm font-black italic text-red-400">Take it down</h4>
                  <p className="text-[11px] text-white/40 italic">
                    Removes from every store within 24-72h. You can put it back up later, but pending
                    royalties for the takedown period are forfeit.
                  </p>
                  <div>
                    <label className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] italic block mb-2">
                      Why are you taking this down?
                    </label>
                    <textarea
                      value={takedownReason}
                      onChange={(e) => setTakedownReason(e.target.value)}
                      placeholder="e.g. Re-mastering and re-releasing under new ISRC. Or: Wrong audio file uploaded."
                      rows={3}
                      className="w-full bg-black border border-red-500/30 py-3 px-3 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setOpen(null)}
                      className="h-11 px-5 border border-white/10 text-white/60 text-[10px] font-black uppercase italic tracking-widest hover:border-white hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitTakedown}
                      disabled={submitting}
                      className="h-11 px-5 bg-red-500 text-white hover:bg-red-600 text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Take down everywhere
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
