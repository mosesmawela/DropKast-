/**
 * Spotify For Artists + Apple Music For Artists claim card.
 *
 * The pattern every pro distro uses (DistroKid, TuneCore, Amuse, RouteNote,
 * Symphonic, CD Baby): once a release is delivered, surface a one-click
 * deep-link that opens the DSP's claim flow with the artist URI pre-filled.
 *
 * Spotify accepts pre-claim BEFORE first release goes live as long as you
 * have the artist URI from the delivery receipt. Apple's flow requires the
 * release to be live but ingests the catalogue automatically once claimed.
 *
 * Usage: drop <ClaimArtistProfile artistName="Aqua Pearl" /> on the
 * release detail / release status page.
 */
import { useState } from 'react';
import { Sparkles, ExternalLink, Check, Music, Apple, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'dropkast.s4a.claimed';

interface Props {
  artistName: string;
  /** Optional Spotify artist URI (e.g. "spotify:artist:6eUKZXaKkcviH0Ku9w2n3V"). When not provided, sends to S4A signup landing. */
  spotifyArtistId?: string;
  /** Optional Apple Music artist ID. */
  appleArtistId?: string;
  /** Compact variant for sidebars / smaller cards */
  compact?: boolean;
}

function loadClaimed(): { spotify: boolean; apple: boolean } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"spotify":false,"apple":false}');
  } catch {
    return { spotify: false, apple: false };
  }
}

function saveClaimed(c: { spotify: boolean; apple: boolean }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {/* ignore */}
}

export default function ClaimArtistProfile({ artistName, spotifyArtistId, appleArtistId, compact }: Props) {
  const [claimed, setClaimed] = useState(loadClaimed);

  const spotifyUrl = spotifyArtistId
    ? `https://artists.spotify.com/c/artist/${spotifyArtistId.replace('spotify:artist:', '')}/home`
    : 'https://artists.spotify.com/claim';

  const appleUrl = appleArtistId
    ? `https://artists.apple.com/ui/artist/${appleArtistId}`
    : 'https://artists.apple.com/';

  const markClaimed = (which: 'spotify' | 'apple') => {
    const next = { ...claimed, [which]: true };
    setClaimed(next);
    saveClaimed(next);
    toast.success(`Marked ${which === 'spotify' ? 'Spotify' : 'Apple Music'} For Artists as claimed`, {
      description: 'You can change this later if needed.',
    });
  };

  if (compact) {
    return (
      <div className="border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black italic text-white truncate">Claim your artist profile</div>
          <div className="text-[10px] text-white/40 italic truncate">Spotify + Apple. 2 minutes.</div>
        </div>
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black text-primary uppercase tracking-widest italic hover:text-white transition-colors"
        >
          Claim →
        </a>
      </div>
    );
  }

  const allClaimed = claimed.spotify && claimed.apple;

  return (
    <div
      className={cn(
        'manifest-card p-6 transition-all',
        allClaimed ? 'bg-green-500/5 border-green-500/20' : 'bg-primary/5 border-primary/20',
      )}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className={cn(
            'w-10 h-10 border flex items-center justify-center shrink-0',
            allClaimed ? 'border-green-500/40' : 'border-primary/40',
          )}
        >
          {allClaimed ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black italic text-white mb-1">
            {allClaimed ? 'Artist profiles claimed' : 'Claim your artist profile'}
          </h3>
          <p className="text-sm text-white/50 italic leading-relaxed">
            {allClaimed
              ? 'You\'re verified on Spotify and Apple Music. Stats, playlist tools, and Canvas are unlocked.'
              : `Once your release is delivered, claim ${artistName} on Spotify For Artists and Apple Music For Artists. Unlocks stats, playlist pitching, profile editing — and the verified badge.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Spotify card */}
        <div
          className={cn(
            'border p-4 transition-all',
            claimed.spotify ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-black/40',
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <Music className="w-5 h-5" style={{ color: '#1DB954' }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black italic text-white">Spotify For Artists</div>
              <div className="text-[10px] text-white/40 italic">Pre-claim allowed before first drop</div>
            </div>
            {claimed.spotify && <Check className="w-4 h-4 text-green-400" />}
          </div>
          {claimed.spotify ? (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase italic tracking-widest hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2"
            >
              Open dashboard <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <div className="flex gap-2">
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(() => markClaimed('spotify'), 1000)}
                className="flex-1 h-10 bg-white text-black text-[10px] font-black uppercase italic tracking-widest hover:bg-[#1DB954] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Claim now <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => markClaimed('spotify')}
                className="h-10 px-3 border border-white/10 text-white/50 text-[10px] font-black uppercase italic tracking-widest hover:border-white hover:text-white transition-all"
                title="Already claimed elsewhere"
              >
                Already done
              </button>
            </div>
          )}
        </div>

        {/* Apple Music card */}
        <div
          className={cn(
            'border p-4 transition-all',
            claimed.apple ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-black/40',
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <Apple className="w-5 h-5 text-white" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black italic text-white">Apple Music For Artists</div>
              <div className="text-[10px] text-white/40 italic">Available after delivery</div>
            </div>
            {claimed.apple && <Check className="w-4 h-4 text-green-400" />}
          </div>
          {claimed.apple ? (
            <a
              href={appleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase italic tracking-widest hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2"
            >
              Open dashboard <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <div className="flex gap-2">
              <a
                href={appleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(() => markClaimed('apple'), 1000)}
                className="flex-1 h-10 bg-white text-black text-[10px] font-black uppercase italic tracking-widest hover:bg-[#FA2D48] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Claim now <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => markClaimed('apple')}
                className="h-10 px-3 border border-white/10 text-white/50 text-[10px] font-black uppercase italic tracking-widest hover:border-white hover:text-white transition-all"
                title="Already claimed elsewhere"
              >
                Already done
              </button>
            </div>
          )}
        </div>
      </div>

      {!allClaimed && (
        <div className="mt-4 flex items-start gap-2 text-[11px] text-white/40 italic leading-relaxed">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          <p>
            Pro tip: Spotify For Artists takes 1–3 days to verify. Apple Music For Artists is
            usually instant. Claim both early — playlist pitching unlocks at 7+ days before release.
          </p>
        </div>
      )}
    </div>
  );
}
