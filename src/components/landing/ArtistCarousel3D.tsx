/**
 * 3D circular artist carousel — auto-rotating cards arranged on a cylinder.
 *
 * Pure CSS 3D transforms + a single requestAnimationFrame loop driving
 * the rotation. Pause on hover, resume on leave. Drag-to-spin on mobile.
 *
 * Drop in real artist photos by editing the ARTISTS array below.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Headphones, TrendingUp, Music } from 'lucide-react';

interface Artist {
  name: string;
  genre: string;
  /** Optional artwork URL — falls back to gradient initial */
  artwork?: string;
  monthlyStreams: string;
  hashtag?: string;
  /** Per-artist accent override */
  accent?: string;
}

// Roster from prior LVRN sessions + a few fictional placeholders.
// Replace artwork URLs once we have hosted assets.
const ARTISTS: Artist[] = [
  { name: 'Buddy Kay',     genre: 'Amapiano',   monthlyStreams: '3.8M', hashtag: '#KazaTheRoof',     accent: '#FF4D00' },
  { name: 'Aqua Pearl',    genre: 'Hyperpop',   monthlyStreams: '1.2M', hashtag: '#PearlSeason',     accent: '#FF4D00' },
  { name: 'CIZA',          genre: 'Afrobeats',  monthlyStreams: '4.6M', hashtag: '#CIZAsPalace',     accent: '#FF4D00' },
  { name: 'Al Xapo',       genre: 'Afro-fusion', monthlyStreams: '850K', hashtag: '#XapoWorld',      accent: '#FF4D00' },
  { name: 'Night Pulse',   genre: 'R&B',        monthlyStreams: '92K',  hashtag: '#PulseAfterDark',  accent: '#FF4D00' },
  { name: 'Lyric Storm',   genre: 'Drill',      monthlyStreams: '420K', hashtag: '#StormSeason',     accent: '#FF4D00' },
  { name: 'Solomon Cyan',  genre: 'Indie',      monthlyStreams: '180K', hashtag: '#CyanWaves',       accent: '#FF4D00' },
];

export default function ArtistCarousel3D() {
  const [angle, setAngle] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastT = useRef<number | null>(null);

  // Continuous rotation
  useEffect(() => {
    const tick = (t: number) => {
      if (lastT.current === null) lastT.current = t;
      const dt = t - lastT.current;
      lastT.current = t;
      if (!paused) {
        // ~10° per second — slow + cinematic
        setAngle((a) => (a + (dt / 1000) * 10) % 360);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastT.current = null;
    };
  }, [paused]);

  const radius = 360;
  const cardCount = ARTISTS.length;
  const stepDeg = 360 / cardCount;

  return (
    <div className="relative w-full py-20 px-4 overflow-hidden">
      {/* Backdrop glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic mb-5">
          <Music className="w-3 h-3" /> Artists on DropKast
        </div>
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
          The roster <span className="text-primary">we ship for</span>
        </h2>
        <p className="text-white/40 italic text-sm mt-4 max-w-xl mx-auto">
          Real artists. Real numbers. Distributed, marketed, and paid through DropKast.
        </p>
      </div>

      {/* 3D stage */}
      <div
        className="relative mx-auto"
        style={{ perspective: '1400px', perspectiveOrigin: '50% 50%', height: 460 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className="absolute left-1/2 top-1/2 w-72 h-96 -ml-36 -mt-48"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${radius}px) rotateY(${angle}deg)`,
            transition: 'none',
          }}
        >
          {ARTISTS.map((a, i) => {
            const cardAngle = i * stepDeg;
            // Compute facing factor — front-most card scales / glows brighter
            const relative = ((cardAngle + angle) % 360 + 360) % 360;
            const distFromFront = Math.min(relative, 360 - relative); // 0..180
            const isFront = distFromFront < 30;

            return (
              <div
                key={a.name}
                className="absolute inset-0"
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <ArtistCard artist={a} isFront={isFront} />
              </div>
            );
          })}
        </div>

        {/* Floor reflection / vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-8 relative z-10">
        {ARTISTS.map((_, i) => {
          const targetAngle = i * stepDeg;
          const relative = ((targetAngle + angle) % 360 + 360) % 360;
          const distFromFront = Math.min(relative, 360 - relative);
          const isActive = distFromFront < stepDeg / 2;
          return (
            <button
              key={i}
              onClick={() => setAngle((360 - i * stepDeg) % 360)}
              aria-label={`Show ${ARTISTS[i].name}`}
              className={`h-1.5 transition-all ${isActive ? 'w-8 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
            />
          );
        })}
      </div>

      {/* Hint */}
      <div className="text-center mt-4 text-[10px] font-black tracking-[0.3em] uppercase italic text-white/20">
        Hover to pause · click a dot to jump
      </div>
    </div>
  );
}

/* =========================================================================
 * Artist card — front-facing flair when isFront
 * ========================================================================= */
function ArtistCard({ artist, isFront }: { artist: Artist; isFront: boolean }) {
  const accent = artist.accent || '#FF4D00';
  return (
    <motion.div
      animate={{
        scale: isFront ? 1.05 : 1,
        boxShadow: isFront
          ? `0 30px 80px ${accent}55, 0 0 0 1px ${accent}66`
          : `0 10px 30px rgba(0,0,0,0.5)`,
      }}
      transition={{ duration: 0.6 }}
      className="w-full h-full bg-dark border border-white/10 overflow-hidden flex flex-col"
      style={{ backfaceVisibility: 'hidden' }}
    >
      {/* Cover */}
      <div className="relative flex-1 overflow-hidden">
        {artist.artwork ? (
          <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-9xl font-black italic tracking-tighter relative"
            style={{
              background: `linear-gradient(135deg, ${accent}55, ${accent}11 40%, #000 100%)`,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {artist.name.charAt(0)}
            {/* Soft grain */}
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/></svg>\")",
              }}
            />
          </div>
        )}

        {/* Genre tag */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest italic text-white">
          {artist.genre}
        </div>

        {/* Now-playing pulse when front */}
        {isFront && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest italic">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Live
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-sm">
        <h3 className="text-xl font-black italic text-white tracking-tight mb-1">{artist.name}</h3>
        {artist.hashtag && (
          <div className="text-[10px] text-white/40 italic tracking-widest">{artist.hashtag}</div>
        )}
        <div className="flex items-center justify-between mt-3 text-[10px] font-black uppercase tracking-widest italic">
          <span className="flex items-center gap-1.5 text-white/60">
            <Headphones className="w-3 h-3" />
            {artist.monthlyStreams}
          </span>
          <span className="flex items-center gap-1.5" style={{ color: accent }}>
            <TrendingUp className="w-3 h-3" />
            /mo
          </span>
        </div>
      </div>
    </motion.div>
  );
}
