import { Link } from 'react-router-dom';
import { Music, Play, ArrowRight, Disc, BarChart3, Globe2, Zap, ShieldCheck, MessageSquare, Radio, Server, TrendingUp, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import Marquee from '../components/animations/Marquee';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import UnicornBackground from '../components/animations/UnicornBackground';
import NoodleLine from '../components/animations/NoodleLine';
import TextMask from '../components/animations/TextMask';
import PerspectiveScroll from '../components/animations/PerspectiveScroll';
import HorizontalScroll from '../components/animations/HorizontalScroll';
import ThemeToggle from '../components/ThemeToggle';
import LiquidBackground from '../components/layout/LiquidBackground';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="min-h-screen selection:bg-primary selection:text-white technical-grid font-sans uppercase tracking-[0.05em] relative bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-1000">
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
            <a href="#protocol" className="hover:text-primary transition-colors">Protocol</a>
            <a href="#lifestyle" className="hover:text-primary transition-colors">Lifestyle</a>
            <a href="#network" className="hover:text-primary transition-colors">Network</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-[9px] font-bold text-[var(--text-main)]/40 hover:text-[var(--text-main)] transition-all tracking-widest italic font-mono uppercase">Login</Link>
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
             <div className="text-[7px] font-black tracking-[0.8em] text-center">SYSTEM_INGEST_v.1.0</div>
          </div>
          
          <div className="inline-flex items-center gap-3 mb-8 font-mono justify-center">
             <div className="h-px w-10 bg-primary/40" />
             <span className="text-primary text-[9px] font-bold tracking-[0.4em] italic uppercase">Advanced Music Distribution Protocol</span>
             <div className="h-px w-10 bg-primary/40" />
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-[calc(-0.04em)] mb-8 leading-[0.85] italic uppercase font-mono">
            Direct to<br />
            <span className="text-primary relative">
              Market.
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 1, ease: "circOut" }}
                className="absolute -bottom-2 left-0 h-1 bg-primary/20 blur-sm" 
              />
            </span>
          </h1>
          
          <div className="flex flex-col items-center gap-10 mt-12">
             <TextMask className="text-base md:text-xl text-white/60 max-w-xl text-center leading-relaxed font-bold italic font-sans mx-auto" mode="word">
               Scale your art from zero to viral with autonomous marketing pipelines and global distribution nodes.
             </TextMask>
             
             <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <AnimatedBeam containerClassName="w-full sm:w-auto">
                  <Link to="/signup" className="primary-button h-16 flex items-center justify-between px-10 text-lg group transition-transform hover:scale-105 active:scale-95">
                    <span className="font-mono">Launch Dashboard</span>
                    <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </AnimatedBeam>
                <div className="flex items-center gap-3 text-white/20 group cursor-pointer hover:text-white transition-colors">
                   <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-white/5 rounded-full group-hover:border-primary transition-all">
                      <Play className="w-3 h-3 fill-current ml-1" />
                   </div>
                   <span className="text-[9px] font-black tracking-[0.2em] font-mono">WATCH_PROTOCOLS</span>
                </div>
             </div>
          </div>
        </PerspectiveScroll>
      </section>

      {/* Narrative Reveal */}
      <section id="protocol" className="py-24 px-8 border-y border-[var(--border-main)] bg-[var(--bg-main)]/40 relative">
        <div className="max-w-5xl mx-auto">
           <ScrollReveal variant="blur" direction="up">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-8 h-px bg-primary" />
                 <span className="text-primary font-mono font-black italic text-xs tracking-[0.3em] uppercase">Protocol: THE_NEW_STANDARD</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic font-mono uppercase tracking-tighter text-white mb-10 leading-tight">
                Distribution is <span className="text-white/20 underline decoration-primary/40 underline-offset-4">broken.</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <p className="text-base text-white/40 leading-relaxed font-medium font-sans italic">
                      Traditional platforms just upload and wait. DROPKAST builds an active deployment lifestyle for every release.
                    </p>
                    <div className="flex items-center gap-3 text-primary font-mono text-[10px] font-black italic tracking-widest">
                       <ShieldCheck className="w-4 h-4" />
                       VERIFIED_NETWORK_CONTROL
                    </div>
                 </div>
                 <div className="space-y-6">
                    {[
                      { l: 'AUTONOMOUS OUTREACH', d: 'AI handles creator communications and DJ packet logistics.' },
                      { l: 'EDITIORAL PIPELINE', d: 'Direct routes to core editorial platforms.' },
                      { l: 'DYNAMIC SCALING', d: 'Budget rebalancing across global marketing nodes.' }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="text-2xl font-black italic text-white/5 font-mono group-hover:text-primary/20 transition-colors">0{i+1}</div>
                         <div>
                            <h4 className="text-[9px] font-black text-white italic tracking-widest font-mono mb-1 uppercase">{step.l}</h4>
                            <p className="text-[10px] text-white/30 leading-relaxed font-sans">{step.d}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </ScrollReveal>
        </div>
      </section>

      {/* Horizontal Storytelling Moment */}
      <section id="lifestyle" className="relative">
        <HorizontalScroll 
          title="CAMPAIGN_LIFESTYLE"
          className="bg-[var(--bg-main)]/20"
        >
          {/* Item 1 */}
          <div className="max-w-4xl grid md:grid-cols-2 gap-12 items-center">
             <div className="relative group">
                <div className="aspect-square bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                   <Zap className="w-20 h-20 text-primary opacity-20 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                   <div className="absolute inset-0 technical-grid opacity-20" />
                </div>
             </div>
             <div className="space-y-4">
                <div className="text-primary font-mono font-black italic text-[9px] tracking-[0.3em] uppercase">PHASE_01: INGESTION</div>
                <h3 className="text-3xl md:text-4xl font-black italic font-mono uppercase tracking-tighter text-white">Archetype Scan</h3>
                <p className="text-sm text-white/40 leading-relaxed italic font-medium font-sans">
                  Our system audits your profile, matching it against global listener benchmarks for precise targeting.
                </p>
             </div>
          </div>

          {/* Item 2 */}
          <div className="max-w-4xl grid md:grid-cols-2 gap-12 items-center">
             <div className="space-y-4 text-right">
                <div className="text-primary font-mono font-black italic text-[9px] tracking-[0.3em] uppercase">PHASE_02: DEPLOY</div>
                <h3 className="text-3xl md:text-4xl font-black italic font-mono uppercase tracking-tighter text-white">Swarm Protocols</h3>
                <p className="text-sm text-white/40 leading-relaxed italic font-medium font-sans">
                  Automated pitching to influencer nodes and broadcast hubs with real-time packet tracking.
                </p>
             </div>
             <div className="relative group">
                <div className="aspect-square bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                   <MessageSquare className="w-20 h-20 text-white/20 group-hover:text-primary transition-all duration-700" />
                </div>
             </div>
          </div>

          {/* Item 3 */}
          <div className="max-w-4xl grid md:grid-cols-2 gap-12 items-center">
             <div className="relative group">
                <div className="aspect-square bg-primary border border-primary/20 flex items-center justify-center overflow-hidden">
                   <Sparkles className="w-20 h-20 text-black" />
                </div>
             </div>
             <div className="space-y-4">
                <div className="text-primary font-mono font-black italic text-[9px] tracking-[0.3em] uppercase">PHASE_03: AMPLIFY</div>
                <h3 className="text-3xl md:text-4xl font-black italic font-mono uppercase tracking-tighter text-white">Velocity Engine</h3>
                <p className="text-sm text-white/40 leading-relaxed italic font-medium font-sans">
                   Rebalances your performance budget autonomously, doubling down on the channels that convert.
                </p>
             </div>
          </div>
        </HorizontalScroll>
      </section>

      {/* Network Logos */}
      <section id="network" className="py-12 px-8 relative overflow-hidden bg-[var(--bg-main)]/40">
        <div className="max-w-7xl mx-auto text-center space-y-10">
           <div className="text-xl md:text-2xl font-black italic font-mono uppercase tracking-tighter text-white/40 mb-6 max-w-2xl mx-auto">
             Connected to the <span className="text-primary italic">Streaming Grid.</span>
           </div>
           <Marquee speed={25} className="py-6 border-y border-white/10 bg-white/[0.02]">
             {['SPOTIFY', 'APPLE', 'TIKTOK', 'AMAZON', 'YOUTUBE', 'TIDAL', 'DEEZER', 'AUDIOMACK', 'SOUNDCLOUD'].map(platform => (
               <div key={platform} className="text-lg md:text-xl font-black italic tracking-[0.4rem] font-mono mx-10 text-white/10 hover:text-primary transition-all">
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
             Join the <span className="text-primary">Network.</span>
           </h2>
           <p className="text-[9px] md:text-xs text-white/40 max-w-lg mx-auto leading-relaxed font-bold italic mb-8 font-sans uppercase tracking-[0.2em]">
             Scale your music career with DROPKAST technology.
           </p>
           <AnimatedBeam containerClassName="w-fit mx-auto">
             <Link 
               to="/signup" 
               className="primary-button h-12 flex items-center px-10 text-sm group relative overflow-hidden uppercase font-mono"
             >
                Initialize Account
             </Link>
           </AnimatedBeam>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-[var(--border-main)] bg-[var(--bg-main)] relative z-10 font-mono italic">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] font-black tracking-[0.3em] text-[var(--text-main)]/10">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary" />
              <span>DROPKAST_CORE</span>
           </div>
           <div className="barcode-sim h-4 w-20 opacity-5" />
           <div className="flex gap-8 uppercase">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
