import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { 
  Rocket, 
  Sparkles, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Globe2, 
  TrendingUp, 
  Camera,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme, VisualStyle } from '../../context/ThemeContext';
import { motion } from 'motion/react';

export const WelcomeScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { visualStyle, setVisualStyle, setVibe, vibe: currentVibe, role, setRole } = useTheme();

  const visualStyles: { id: VisualStyle; name: string; desc: string }[] = [
    { id: 'default', name: 'MANIFEST_OS', desc: 'THE STANDARD BUREAUCRATIC INTERFACE.' },
    { id: 'glassmorphism', name: 'PRISM_LINK', desc: 'HIGH-TRANSPARENCY REFRACTION NODES.' },
    { id: 'brutalism', name: 'RAW_SIGNAL', desc: 'UNFILTERED STRUCTURAL INTEGRITY.' },
    { id: 'minimalist', name: 'VOID_SYNC', desc: 'REDACTED ESSENTIAL CALIBRATION.' },
    { id: 'neumorphism', name: 'SOFT_NODE', desc: 'TACTILE TENSION PARAMETERS.' },
    { id: 'skeuomorphism', name: 'ANALOG_LINK', desc: 'SENSORY NOSTALGIA PROTOCOLS.' }
  ];

  const vibes = [
    { id: 'TECHNICAL_ORANGE', name: 'TECH_ORANGE', color: '#FF4D00', desc: 'THE ORIGINAL MANIFEST ENERGY' },
    { id: 'LVRN_GREEN', name: 'LVRN_GREEN', color: '#acec00', desc: 'DIRECT EXECUTIVE CLEARANCE' },
    { id: 'NEON_PINK', name: 'NEON_PINK', color: '#ff00ff', desc: 'HYPER-POP SONIC FREQUENCY' },
    { id: 'CYBER_BLUE', name: 'CYBER_BLUE', color: '#00f2ff', desc: 'COLD DIGITAL LOGIC' },
    { id: 'MONO_WHITE', name: 'MONO_ARCHIVE', color: '#ffffff', desc: 'MINIMAL REDACTED AESTHETIC' }
  ];

  const features = [
    {
      title: "SONIC_VISION",
      desc: "THE NEXT-GEN DISTRIBUTION PROTOCOL. A CAMPAIGN-FIRST ENGINE DESIGNED TO ACCELERATE ARTISTS INTO THE GLOBAL SONIC GRID.",
      icon: Rocket,
      color: "text-primary",
      tag: "THE_VISION"
    },
    {
      title: "NEURAL_AUTOMATION",
      desc: "ASSETS STUDIO AI SYNTHESIZES HIGH-FIDELITY COVERS, VIRAL MOTION CLIPS, AND UGC FUEL. AUTOMATED DISPATCH ACROSS ALL NODES IN MILLISECONDS.",
      icon: Sparkles,
      color: "text-blue-500",
      tag: "AI_ENGINE"
    },
    {
      title: "REAL_CONNECTIONS",
      desc: "EXCLUSIVE ACCESS TO A VERIFIED CONTACT LIST. REAL INFLUENCERS, GLOBAL PROMO NETWORKS, AND DIRECT DJ PROMO RELAYS.",
      icon: Globe2,
      color: "text-purple-500",
      tag: "ELITE_NETWORK"
    },
    {
      title: "LVRN_DIRECT_ACCESS",
      desc: "NO MIDDLEMEN. GET DIRECT FEEDBACK FROM THE LVRN EXECUTIVE INNER CIRCLE. STRATEGIC GUIDANCE AT EVERY STAGE OF YOUR ORBIT.",
      icon: TrendingUp,
      color: "text-green-500",
      tag: "STRATEGIC_DIRECTIVE"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Intro animations
      gsap.from(".bg-layer", { opacity: 0, duration: 1.5, ease: "power2.out" });
      gsap.from(".title-word", { y: 60, opacity: 0, stagger: 0.1, duration: 0.8, ease: "expo.out", delay: 0.2 });
      gsap.from(".sub-line", { width: 0, duration: 1, ease: "power4.inOut", delay: 0.8 });
      gsap.from(".desc-line", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.8 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const nextStep = () => {
    if (step === 0) {
      const tl = gsap.timeline({ onComplete: () => setStep(1) });
      tl.to(".intro-content", { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" });
    } else if (step === 1) {
      if (featureIndex < features.length - 1) {
        const tl = gsap.timeline({
          onComplete: () => {
            setFeatureIndex(prev => prev + 1);
          }
        });
        tl.to(".feature-active", { opacity: 0, x: -50, duration: 0.3, ease: "power2.in" });
      } else {
        const tl = gsap.timeline({ onComplete: () => setStep(2) });
        tl.to(".step-1-content", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });
      }
    } else if (step === 2) {
      const tl = gsap.timeline({ onComplete: () => setStep(3) });
      tl.to(".step-2-content", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });
    } else if (step === 3) {
      const tl = gsap.timeline({ onComplete: () => setStep(4) });
      tl.to(".step-3-content", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });
    } else if (step === 4) {
      const tl = gsap.timeline({ onComplete: onComplete });
      tl.to(".welcome-container", { opacity: 0, scale: 1.05, duration: 0.8, ease: "expo.inOut" });
    }
  };

  const prevStep = () => {
    if (step === 1) {
      if (featureIndex > 0) {
        const tl = gsap.timeline({
          onComplete: () => {
            setFeatureIndex(prev => prev - 1);
          }
        });
        tl.to(".feature-active", { opacity: 0, x: 50, duration: 0.3, ease: "power2.in" });
      } else {
        const tl = gsap.timeline({ onComplete: () => setStep(0) });
        tl.to(".step-1-content", { opacity: 0, y: 30, duration: 0.4, ease: "power2.in" });
      }
    } else if (step === 2) {
      const tl = gsap.timeline({ onComplete: () => setStep(1) });
      tl.to(".step-2-content", { opacity: 0, y: 20, duration: 0.4, ease: "power2.in" });
    } else if (step === 3) {
      const tl = gsap.timeline({ onComplete: () => setStep(2) });
      tl.to(".step-3-content", { opacity: 0, y: 20, duration: 0.4, ease: "power2.in" });
    } else if (step === 4) {
      const tl = gsap.timeline({ onComplete: () => setStep(3) });
      tl.to(".step-4-content", { opacity: 0, y: 20, duration: 0.4, ease: "power2.in" });
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (step === 0) {
      gsap.fromTo(".cta-container",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 1, ease: "expo.out", clearProps: "all" }
      );
    }
    if (step === 1) {
      gsap.fromTo(".feature-active", 
        { opacity: 0, x: 50, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "expo.out" }
      );
      gsap.fromTo(".feature-header", 
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
      );
    }
    if (step === 2) {
      gsap.fromTo(".step-2-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
      );
      gsap.fromTo(".vibe-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
    if (step === 3) {
      gsap.fromTo(".step-3-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
      );
      gsap.fromTo(".style-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
    if (step === 4) {
      gsap.fromTo(".step-4-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
      );
      gsap.fromTo(".role-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [step, featureIndex]);

  const currentFeature = features[featureIndex];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "welcome-container fixed inset-0 z-[200] flex flex-col items-center justify-start overflow-x-hidden overflow-y-auto py-24 transition-colors duration-1000",
        visualStyle === 'glassmorphism' ? "bg-black/95 backdrop-blur-3xl" : "bg-black"
      )}
    >
      {/* Step Progress */}
      {step > 0 && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-8">
          {[
            { id: 1, label: 'MISSION' },
            { id: 2, label: 'VIBE' },
            { id: 3, label: 'OS' },
            { id: 4, label: 'ID' }
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn(
                "h-1 w-12 transition-all duration-500",
                step >= s.id ? "bg-primary" : "bg-white/10"
              )} />
              <span className={cn(
                "text-[8px] font-black font-mono tracking-widest uppercase italic",
                step === s.id ? "text-primary" : "text-white/20"
              )}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="fixed top-8 right-8 z-[210] flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-primary transition-colors font-mono tracking-[0.2em] uppercase italic group"
      >
        <span>Skip_Intro</span>
        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none bg-layer">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 technical-grid opacity-5" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-8 my-auto pb-32">
        {step === 0 ? (
          <div className="intro-content space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="h-[1px] w-12 bg-primary/40 sub-line" />
                <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase italic font-mono">System_Initiated</span>
              </div>
              
              <h1 ref={titleRef} className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85] font-mono">
                <span className="inline-block title-word">DROP</span>
                <span className="inline-block title-word text-primary">KAST</span>
              </h1>
            </div>

            <div className="max-w-xl space-y-6 desc-line mx-auto md:mx-0">
              <p className="text-base md:text-lg font-medium text-white/40 leading-relaxed italic font-sans uppercase tracking-tight">
                THE AI-POWERED PLATFORM TO LAUNCH, PROMOTE, AND SCALE YOUR MUSIC. DISTRIBUTE. GROW. GO VIRAL.
              </p>
              
              <div className="cta-container flex flex-col md:flex-row gap-4 pt-4">
                <button 
                  onClick={nextStep}
                  className="entry-btn h-24 px-16 bg-white text-black text-sm font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-8 hover:bg-primary hover:text-white transition-all group shadow-[0_30px_90px_rgba(255,77,0,0.3)] hover:scale-105 active:scale-95 border-b-8 border-primary/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                  <span className="relative z-10">INITIALIZE_SYSTEM [NEXT]</span>
                  <ArrowRight className="relative z-10 w-8 h-8 group-hover:translate-x-4 transition-transform text-primary" />
                </button>

                <button 
                  onClick={onComplete}
                  className="h-24 px-12 border border-white/10 text-white/40 hover:text-white hover:border-white text-[10px] font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-4 group transition-all"
                >
                  <span>RESUME_EXISTING_SESSION [LOGIN]</span>
                </button>
              </div>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="step-1-content space-y-12 w-full max-w-4xl mx-auto">
            <header className="feature-header space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Strategic_Protocol</span>
                <div className="h-[1px] flex-1 bg-white/5" />
                <div className="flex gap-2">
                  {features.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 transition-all duration-300",
                        i === featureIndex ? "w-8 bg-primary" : "w-2 bg-white/10"
                      )} 
                    />
                  ))}
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter font-mono leading-none">
                {currentFeature.title.replace('_', ' ')}
              </h2>
            </header>

            <div className="feature-active min-h-[450px] flex items-center">
              <div 
                className={cn(
                  "manifest-card p-12 md:p-16 border-white/5 bg-white/[0.02] hover:border-primary/20 transition-all group relative overflow-hidden w-full",
                  visualStyle === 'glassmorphism' && "backdrop-blur-xl"
                )}
              >
                <div className="absolute -top-12 -right-12 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                  <currentFeature.icon className="w-96 h-96" />
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                  <div className="md:col-span-4 flex justify-center">
                    <div className={cn("w-32 h-32 md:w-48 md:h-48 border-2 flex items-center justify-center shadow-[0_30px_90px_rgba(0,0,0,0.5)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-700", currentFeature.color.replace('text-', 'border-'))}>
                      <currentFeature.icon className={cn("w-16 h-16 md:w-24 md:h-24", currentFeature.color)} />
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-8">
                    <div>
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] font-mono mb-2">{currentFeature.tag}</div>
                      <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tight font-mono leading-tight">{currentFeature.title}</h3>
                    </div>
                    
                    <p className="text-lg md:text-xl text-white/50 leading-relaxed font-sans italic uppercase tracking-wider">
                      {currentFeature.desc}
                    </p>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase italic tracking-[0.4em] font-mono">
                        <Zap className="w-4 h-4 animate-pulse" />
                        <span>Ready_To_Deploy</span>
                      </div>
                      <div className="h-[1px] w-12 bg-white/10" />
                      <div className="flex gap-1.5">
                        {features.map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-300",
                              i === featureIndex ? "bg-primary scale-125" : "bg-white/10"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={prevStep}
                className="h-20 flex-1 border border-white/10 text-white/40 hover:text-white hover:border-white text-[12px] font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-6 group transition-all"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                <span>PREVIOUS_NODE</span>
              </button>
              
              <button 
                onClick={nextStep}
                className="h-20 flex-[2] bg-white text-black hover:bg-primary hover:text-white text-[12px] font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-6 group transition-all shadow-[0_30px_90px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 border-b-4 border-primary/20"
              >
                <span>{featureIndex < features.length - 1 ? 'DEPLOY_NEXT_NODE [NEXT]' : 'PROCEED_TO_CALIBRATION [NEXT]'}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-4 transition-transform text-primary" />
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="step-2-content space-y-12 w-full max-w-5xl mx-auto">
            <header className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Aesthetic_Calibration</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter font-mono leading-none">Initialize_Vibe</h2>
              <p className="text-lg md:text-xl font-medium text-white/40 leading-relaxed italic font-sans uppercase tracking-tight max-w-2xl">
                PERSONALIZING THE INTERFACE FREQUENCY. SELECT THE SPECTRUM THAT MATCHES YOUR OPERATION.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vibes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVibe(v.id as any)}
                  className={cn(
                    "vibe-card manifest-card p-8 border-white/5 bg-white/[0.02] transition-all group relative text-left",
                    currentVibe === v.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-12 h-12 border-2 border-white/10 flex items-center justify-center"
                      style={{ borderColor: currentVibe === v.id ? v.color : undefined }}
                    >
                      <div className="w-6 h-6" style={{ backgroundColor: v.color }} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest font-mono italic",
                      currentVibe === v.id ? "text-primary" : "text-white/40"
                    )}>{v.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider font-sans italic leading-relaxed">
                    {v.desc}
                  </p>
                  {currentVibe === v.id && (
                    <motion.div 
                      layoutId="active-vibe"
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={prevStep}
                className="h-24 flex-1 border border-white/10 text-white/40 hover:text-white hover:border-white text-[12px] font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-6 group transition-all"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                <span>BACK_TO_NODES</span>
              </button>
              
              <button 
                onClick={nextStep}
                className="h-24 flex-[2] bg-white text-black hover:bg-primary hover:text-white text-sm font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-8 group transition-all shadow-[0_30px_90px_rgba(255,77,0,0.2)] hover:scale-[1.02] active:scale-95 border-b-8 border-primary/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <span className="relative z-10">CALIBRATE_INTERFACE [NEXT]</span>
                <ArrowRight className="relative z-10 w-8 h-8 group-hover:translate-x-4 transition-transform text-primary" />
              </button>
            </div>
          </div>
        ) : step === 3 ? (
          <div className="step-3-content space-y-12 w-full max-w-5xl mx-auto">
            <header className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Core_Modality</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter font-mono leading-none">Deploy_Interface</h2>
              <p className="text-lg md:text-xl font-medium text-white/40 leading-relaxed italic font-sans uppercase tracking-tight max-w-2xl">
                CHOOSE THE STRUCTURAL FOUNDATION OF YOUR WORKSPACE. HIGH-FIDELITY OR RAW DATA.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visualStyles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setVisualStyle(s.id as any)}
                  className={cn(
                    "style-card manifest-card p-10 border-white/5 bg-white/[0.02] transition-all group relative text-left h-full flex flex-col justify-between",
                    visualStyle === s.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:border-white/20"
                  )}
                >
                  <div className="space-y-6">
                    <div className={cn(
                      "w-12 h-12 border-2 flex items-center justify-center transition-all",
                      visualStyle === s.id ? "border-primary text-primary" : "border-white/10 text-white/20"
                    )}>
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                       <span className={cn(
                        "text-xl font-black uppercase tracking-tighter italic font-mono",
                        visualStyle === s.id ? "text-white" : "text-white/40"
                      )}>{s.name}</span>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-sans italic leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  {visualStyle === s.id && (
                    <motion.div 
                      layoutId="active-style"
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={prevStep}
                className="h-24 flex-1 border border-white/10 text-white/40 hover:text-white hover:border-white text-[12px] font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-6 group transition-all"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                <span>RECALIBRATE_VIBE</span>
              </button>
              
              <button 
                onClick={nextStep}
                className="h-24 flex-[2] bg-white text-black hover:bg-primary hover:text-white text-sm font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-8 group transition-all shadow-[0_30px_90px_rgba(255,77,0,0.2)] hover:scale-[1.02] active:scale-95 border-b-8 border-primary/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <span className="relative z-10">CALIBRATE_IDENTITY [NEXT]</span>
                <ArrowRight className="relative z-10 w-8 h-8 group-hover:translate-x-4 transition-transform text-primary" />
              </button>
            </div>
          </div>
        ) : (
          <div className="step-4-content space-y-12 w-full max-w-4xl mx-auto">
            <header className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Identity_Protocol</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter font-mono leading-none">Select_Access_Level</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono italic">Define your role within the global sonic ecosystem.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'ARTIST', name: 'ARTIST_CORE', icon: Cpu, desc: 'FULL ACCESS TO DISTRIBUTION, CAMPAIGN OS, AND AI ASSETS STOREFRONT.' },
                { id: 'INFLUENCER', name: 'CREATOR_RELAY', icon: Camera, desc: 'ACCESS TO CAMPAIGNS, PERFORMANCE TRACKING, AND INSTANT EARNING NODES.' },
                { id: 'DJ', name: 'VIBE_SELECTA', icon: Radio, desc: 'EXCLUSIVE ACCESS TO DJ PACKS, FEEDBACK LOOPS, AND CHART SIGNAL TELEMETRY.' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as any)}
                  className={cn(
                    "role-card manifest-card p-12 border-white/5 bg-white/[0.02] transition-all group relative text-left h-full flex flex-col justify-between min-h-[400px]",
                    role === r.id ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.02]" : "hover:border-white/20"
                  )}
                >
                  <div className="space-y-8">
                    <div className={cn(
                      "w-24 h-24 border-2 flex items-center justify-center transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                      role === r.id ? "border-primary text-primary" : "border-white/10 text-white/20"
                    )}>
                      <r.icon className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                       <span className={cn(
                        "text-2xl md:text-3xl font-black uppercase tracking-tighter italic font-mono block",
                        role === r.id ? "text-white" : "text-white/40"
                      )}>{r.name}</span>
                      <p className="text-sm font-medium text-white/40 lg:text-white/60 uppercase tracking-widest font-sans italic leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                  {role === r.id && (
                    <motion.div 
                      layoutId="active-role"
                      className="absolute top-4 right-4"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={prevStep}
                className="h-24 flex-1 border border-white/10 text-white/40 hover:text-white hover:border-white text-[12px] font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-6 group transition-all"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                <span>RECALIBRATE_THEME</span>
              </button>
              
              <button 
                onClick={nextStep}
                className="h-24 flex-[2] bg-white text-black hover:bg-primary hover:text-white text-sm font-black uppercase italic tracking-[0.4em] font-mono flex items-center justify-center gap-8 group transition-all shadow-[0_30px_90px_rgba(255,77,0,0.3)] hover:scale-[1.02] active:scale-95 border-b-8 border-primary/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <span className="relative z-10">ENTER_PORTAL_COMMAND [SYNC]</span>
                <ArrowRight className="relative z-10 w-8 h-8 group-hover:translate-x-4 transition-transform text-primary" />
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-8 w-full px-8 flex justify-between items-center text-[8px] font-black text-white/10 uppercase tracking-[0.4em] font-mono italic">
        <div className="flex items-center gap-4">
          <Zap className="w-3 h-3" />
          <span>DROPKAST_v3.0.1_STABLE</span>
        </div>
        <div className="barcode-sim h-4 w-24" />
        <span>COPYRIGHT_2026_NEURAL_RECORDS</span>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
