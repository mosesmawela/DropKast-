import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import Marquee from '../components/animations/Marquee';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import UnicornBackground from '../components/animations/UnicornBackground';
import PerspectiveScroll from '../components/animations/PerspectiveScroll';
import ThemeToggle from '../components/ThemeToggle';
import LiquidBackground from '../components/layout/LiquidBackground';
import RandomSentence from '../components/landing/RandomSentence';
import ArtistCarousel3D from '../components/landing/ArtistCarousel3D';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen selection:bg-primary selection:text-white technical-grid font-sans uppercase tracking-[0.05em] relative bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-1000"
    >
      <UnicornBackground />
      <LiquidBackground />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-[100] border-b border-[var(--border-main)] bg-[var(--bg-main)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-primary flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-primary" />
            </div>
            <span className="text-lg font-mono font-black tracking-tighter italic text-[var(--text-main)]">DROPKAST</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[9px] font-mono font-black text-[var(--text-main)]/30 tracking-[0.3em] italic uppercase">
            <a href="#roster" className="hover:text-primary transition-colors">Roster</a>
            <a href="#streaming" className="hover:text-primary transition-colors">Streaming Grid</a>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-[9px] font-bold text-[var(--text-main)]/40 hover:text-[var(--text-main)] transition-all tracking-widest italic font-mono uppercase"
            >
              Login
            </Link>
            <Link to="/signup" className="primary-button h-9 flex items-center px-5 text-[9px] uppercase font-mono">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <section className="min-h-[90vh] flex items-center justify-center pt-24 px-8 overflow-hidden">
        <PerspectiveScroll className="max-w-7xl mx-auto text-center relative w-full">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
            <div className="barcode-sim h-8 w-48 mb-2 mx-auto" />
            <div className="text-[7px] font-black tracking-[0.8em] text-center">DROPKAST · CREATOR FIRST</div>
          </div>

          <div className="inline-flex items-center gap-3 mb-8 font-mono justify-center">
            <div className="h-px w-10 bg-primary/40" />
            <span className="text-primary text-[9px] font-bold tracking-[0.4em] italic uppercase">
              Music distribution that actually pays you back
            </span>
            <div className="h-px w-10 bg-primary/40" />
          </div>

          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-[calc(-0.04em)] mb-8 leading-[0.85] italic uppercase font-mono">
            Drop. Distribute.<br />
            <span className="text-primary relative">
              Get paid.
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 1, ease: 'circOut' }}
                className="absolute -bottom-2 left-0 h-1 bg-primary/20 blur-sm"
              />
            </span>
          </h1>

          {/* Slot-machine random sentence — re-rolls every ~4s */}
          <div className="min-h-[120px] md:min-h-[100px] flex items-start justify-center px-4">
            <RandomSentence
              intervalMs={3800}
              className="text-base md:text-2xl text-white/85 max-w-3xl text-center leading-snug font-bold italic font-sans normal-case tracking-normal"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center mt-10">
            <AnimatedBeam containerClassName="w-full sm:w-auto">
              <Link
                to="/signup"
                className="primary-button h-16 flex items-center justify-between px-10 text-lg group transition-transform hover:scale-105 active:scale-95"
              >
                <span className="font-mono">Start free</span>
                <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </AnimatedBeam>
            <Link
              to="/pricing"
              className="flex items-center gap-3 text-white/40 group hover:text-white transition-colors"
            >
              <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-white/5 rounded-full group-hover:border-primary transition-all">
                <Play className="w-3 h-3 fill-current ml-1" />
              </div>
              <span className="text-[9px] font-black tracking-[0.2em] font-mono">SEE PRICING</span>
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[9px] font-black tracking-[0.3em] uppercase italic text-white/30">
            <span>165+ DSPs</span>
            <span className="text-white/10">·</span>
            <span>10 AI Studios bundled</span>
            <span className="text-white/10">·</span>
            <span>0% royalty cut on paid tier</span>
            <span className="text-white/10">·</span>
            <span>Royalty advances</span>
          </div>
        </PerspectiveScroll>
      </section>

      {/* Artist 3D Carousel — replaces Protocol/Lifestyle/Network */}
      <section id="roster" className="relative bg-black/40">
        <ArtistCarousel3D />
      </section>

      {/* Streaming Grid Marquee */}
      <section id="streaming" className="py-12 px-8 relative overflow-hidden bg-[var(--bg-main)]/40">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <ScrollReveal direction="up" variant="blur">
            <div className="text-xl md:text-3xl font-black italic font-mono uppercase tracking-tighter text-white/70 mb-2">
              Connected to <span className="text-primary italic">every store on Earth.</span>
            </div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">
              165+ destinations · auto-deliver to new ones as they launch
            </div>
          </ScrollReveal>
          <Marquee speed={25} className="py-6 border-y border-white/10 bg-white/[0.02]">
            {[
              'SPOTIFY',
              'APPLE MUSIC',
              'TIKTOK',
              'AMAZON MUSIC',
              'YOUTUBE MUSIC',
              'TIDAL',
              'DEEZER',
              'AUDIOMACK',
              'SOUNDCLOUD',
              'PANDORA',
              'BEATPORT',
              'ANGHAMI',
              'BOOMPLAY',
              'JIOSAAVN',
              'GAANA',
              'NETEASE',
              'QQ MUSIC',
              'KKBOX',
              'YANDEX',
              'LINE MUSIC',
              'PELOTON',
              'MUSIXMATCH',
              'SHAZAM',
              'IHEARTRADIO',
              'SIRIUSXM',
            ].map((platform) => (
              <div
                key={platform}
                className="text-lg md:text-xl font-black italic tracking-[0.4rem] font-mono mx-10 text-white/15 hover:text-primary transition-all whitespace-nowrap"
              >
                {platform}
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/5 technical-grid" />
        <ScrollReveal variant="blur" direction="up" className="text-center relative z-10">
          <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center mx-auto mb-6">
            <div className="-rotate-45">
              <Zap className="w-4 h-4 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic font-mono uppercase tracking-tighter text-white mb-4">
            Make music. <span className="text-primary">We'll handle the rest.</span>
          </h2>
          <p className="text-[9px] md:text-xs text-white/50 max-w-lg mx-auto leading-relaxed font-bold italic mb-8 font-sans uppercase tracking-[0.2em]">
            Free tier forever. $19.99/yr unlocks every studio. No card to start.
          </p>
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <AnimatedBeam containerClassName="w-fit">
              <Link
                to="/signup"
                className="primary-button h-12 flex items-center px-10 text-sm group relative overflow-hidden uppercase font-mono"
              >
                Start free
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedBeam>
            <Link
              to="/pricing"
              className="text-[9px] font-black text-white/50 hover:text-white tracking-[0.3em] uppercase italic font-mono"
            >
              See pricing →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-[var(--border-main)] bg-[var(--bg-main)] relative z-10 font-mono italic">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] font-black tracking-[0.3em] text-[var(--text-main)]/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary" />
            <span>DROPKAST · CREATOR FIRST</span>
          </div>
          <div className="barcode-sim h-4 w-20 opacity-10" />
          <div className="flex gap-8 uppercase">
            <Link to="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <a href="mailto:moses@lvrn.com" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
