/**
 * Public-facing smart-link / pre-save landing page.
 *
 * Equivalent to DistroKid's Hyperfollow or Amuse's pre-save link. One URL
 * (/link/:slug) covers:
 *   - Pre-save (before release date) on Spotify / Apple / Amazon / Deezer / Tidal / YT Music
 *   - Listen-now (after release date) on the same platforms
 *   - Email capture for the artist's mailing list
 *   - Cover art, title, primary artist, optional tagline
 *
 * Backend persistence is intentionally lightweight — the slug encodes the
 * releaseId; the artist's smart-link record is fetched from the existing
 * /api/releases/:id endpoint with public-safe fields. When a real "links"
 * table ships, swap useReleaseSmartLink() to hit /api/links/:slug.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Music,
  ExternalLink,
  Mail,
  Share2,
  Check,
  Sparkles,
  Bell,
  Calendar,
  Headphones,
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartLinkRecord {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  releaseDate?: string;
  tagline?: string;
  /** Per-DSP destination URLs. Missing entries omit the row. */
  links: Partial<{
    spotify: string;
    apple: string;
    amazon: string;
    deezer: string;
    tidal: string;
    'youtube-music': string;
    soundcloud: string;
    audiomack: string;
    tiktok: string;
    bandcamp: string;
  }>;
  primaryColor?: string;
  socials?: { instagram?: string; tiktok?: string; twitter?: string; youtube?: string };
}

const DSP_META: Record<keyof SmartLinkRecord['links'], { label: string; iconSlug: string; brandColor: string }> = {
  spotify:         { label: 'Spotify',        iconSlug: 'spotify',        brandColor: '#1DB954' },
  apple:           { label: 'Apple Music',    iconSlug: 'applemusic',     brandColor: '#FA2D48' },
  amazon:          { label: 'Amazon Music',   iconSlug: 'amazonmusic',    brandColor: '#00A8E1' },
  deezer:          { label: 'Deezer',         iconSlug: 'deezer',         brandColor: '#FEAA2D' },
  tidal:           { label: 'Tidal',          iconSlug: 'tidal',          brandColor: '#FFFFFF' },
  'youtube-music': { label: 'YouTube Music',  iconSlug: 'youtubemusic',   brandColor: '#FF0000' },
  soundcloud:     { label: 'SoundCloud',     iconSlug: 'soundcloud',     brandColor: '#FF5500' },
  audiomack:      { label: 'Audiomack',      iconSlug: 'audiomack',      brandColor: '#FFA500' },
  tiktok:         { label: 'TikTok',         iconSlug: 'tiktok',         brandColor: '#FFFFFF' },
  bandcamp:       { label: 'Bandcamp',       iconSlug: 'bandcamp',       brandColor: '#629AA9' },
};

function loadSmartLink(slug: string): SmartLinkRecord | null {
  try {
    const raw = localStorage.getItem(`dropkast.smartlink.${slug}`);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return null;
}

export default function SmartLink() {
  const { slug = '' } = useParams<{ slug: string }>();
  const record = useMemo(() => loadSmartLink(slug), [slug]);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Apply primary color to the document for this page only
  useEffect(() => {
    if (!record?.primaryColor) return;
    const el = document.documentElement;
    const prev = el.style.getPropertyValue('--smartlink-color');
    el.style.setProperty('--smartlink-color', record.primaryColor);
    return () => { el.style.setProperty('--smartlink-color', prev); };
  }, [record?.primaryColor]);

  if (!record) {
    const isDemo = slug === 'demo' || slug === 'sample';
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Music className="w-12 h-12 text-white/20 mx-auto mb-6" />
          <h1 className="text-3xl font-black italic mb-3">{isDemo ? 'Demo link not found' : 'Link not found'}</h1>
          <p className="text-white/40 italic mb-6">
            {isDemo ? 'No demo smart link has been created yet.' : 'This release link has expired or doesn\'t exist.'}
          </p>
          <Link to="/" className="text-primary hover:underline italic text-sm">
            Visit DropKast →
          </Link>
        </div>
      </div>
    );
  }

  const color = record.primaryColor || '#FF4D00';
  const isFuture = record.releaseDate ? new Date(record.releaseDate) > new Date() : false;
  const dspEntries = Object.entries(record.links).filter(([, v]) => !!v) as Array<
    [keyof SmartLinkRecord['links'], string]
  >;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Drop a valid email');
      return;
    }
    // Real impl would POST /api/links/:slug/subscribe
    try {
      const key = `dropkast.smartlink.${slug}.subs`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({ email, at: Date.now() });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {/* ignore */}
    setSubmitted(true);
    toast.success('You\'re on the list. Heads up incoming.');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDspClick = (dsp: string) => {
    // Track click — real impl would POST /api/links/:slug/click
    try {
      const key = `dropkast.smartlink.${slug}.clicks`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      existing[dsp] = (existing[dsp] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {/* ignore */}
  };

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at top, ${color}22, #000 60%)` }}
    >
      {/* Soft grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-6 py-12 md:py-16">
        {/* Top bar */}
        <div className="w-full max-w-lg flex items-center justify-between mb-12">
          <Link to="/" className="text-[10px] font-black tracking-[0.4em] uppercase italic text-white/40 transition-colors">
            DropKast
          </Link>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase italic text-white/40 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Share2 className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>

        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="relative aspect-square w-full mb-8 overflow-hidden border border-white/10 shadow-2xl">
            {record.artwork ? (
              <img src={record.artwork} alt={record.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-[80px] font-black italic tracking-tighter"
                style={{ background: `linear-gradient(135deg, ${color}55, #000)` }}
              >
                {record.artist.charAt(0).toUpperCase()}
              </div>
            )}
            {isFuture && (
              <div
                className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2"
                style={{ background: color, color: '#000' }}
              >
                <Calendar className="w-3 h-3" />
                Pre-save
              </div>
            )}
          </div>

          {/* Title block */}
          <div className="text-center mb-10">
            <div className="text-[11px] font-black tracking-[0.4em] uppercase italic text-white/50 mb-3">
              {record.artist}
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none mb-4">
              {record.title}
            </h1>
            {record.tagline && (
              <p className="text-white/60 italic text-sm">{record.tagline}</p>
            )}
            {record.releaseDate && (
              <div className="mt-3 text-[10px] font-black tracking-[0.3em] uppercase italic" style={{ color }}>
                {isFuture ? 'Out' : 'Released'}{' '}
                {new Date(record.releaseDate).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>

          {/* DSP buttons */}
          <div className="space-y-2.5 mb-10">
            {dspEntries.map(([dsp, url]) => {
              const meta = DSP_META[dsp];
              if (!meta) return null;
              return (
                <a
                  key={dsp}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleDspClick(dsp)}
                  className="beam flex items-center justify-between gap-4 w-full px-5 py-4 bg-white/5 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://cdn.simpleicons.org/${meta.iconSlug}/ffffff`}
                      alt=""
                      className="w-6 h-6"
                    />
                    <span className="text-sm font-black italic tracking-tight">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                    {isFuture ? (
                      <>
                        <Bell className="w-3 h-3" /> Pre-save
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3 h-3" /> Play
                      </>
                    )}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* Email capture */}
          {!submitted ? (
            <form onSubmit={handleEmailSubmit} className="border border-white/10 p-6 bg-white/[0.02] mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5" style={{ color }} />
                <h3 className="text-xs font-black tracking-[0.3em] uppercase italic">
                  First listens, first
                </h3>
              </div>
              <p className="text-[12px] text-white/50 italic leading-relaxed mb-4">
                Drop your email — every new release lands in your inbox the day it drops.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="beam h-12 px-6 text-[10px] font-black uppercase italic tracking-widest transition-all"
                  style={{ background: color, color: '#000' }}
                >
                  Notify me
                </button>
              </div>
            </form>
          ) : (
            <div className="border border-green-500/30 bg-green-500/5 p-6 mb-10 text-center">
              <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm italic text-green-300">You're on the list.</p>
            </div>
          )}

          {/* Socials */}
          {record.socials && Object.keys(record.socials).length > 0 && (
            <div className="flex items-center justify-center gap-6 text-[10px] font-black tracking-[0.3em] uppercase italic text-white/40">
              {record.socials.instagram && (
                <a href={record.socials.instagram} target="_blank" rel="noopener noreferrer" className="">Instagram</a>
              )}
              {record.socials.tiktok && (
                <a href={record.socials.tiktok} target="_blank" rel="noopener noreferrer" className="">TikTok</a>
              )}
              {record.socials.twitter && (
                <a href={record.socials.twitter} target="_blank" rel="noopener noreferrer" className="">X</a>
              )}
              {record.socials.youtube && (
                <a href={record.socials.youtube} target="_blank" rel="noopener noreferrer" className="">YouTube</a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 text-center text-[9px] font-black tracking-[0.3em] uppercase italic text-white/20">
            Powered by <Link to="/" className="">DropKast</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
