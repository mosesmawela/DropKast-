import { useState } from "react";
import { X, ImageIcon, Video, User, Cpu, Sparkles, ChevronDown, Wand2, Search, Sliders, Camera, Settings2, Maximize2, Minimize2, Plus, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CoverGenerator from "./generators/CoverGenerator";
import VideoGenerator from "./generators/VideoGenerator";
import UGCGenerator from "./generators/UGCGenerator";
import StudioGenreSelector from "./StudioGenreSelector";
import StudioCameraSelector from "./StudioCameraSelector";
import StudioStyleSelector from "./StudioStyleSelector";
import { cn } from "../../lib/utils";
import ModelPicker from "../../components/ModelPicker";
import { RECOMMENDATIONS } from "../../lib/ai-recommendations";
import { ALL_PROVIDERS } from "../../lib/ai-providers";

interface CreateAssetModalProps {
  onClose: () => void;
}

export default function CreateAssetModal({ onClose }: CreateAssetModalProps) {
  const [type, setType] = useState("video");
  const [prompt, setPrompt] = useState("");
  const [activeSelector, setActiveSelector] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<any>({
    model: "cinema-3.5",
    genre: "epic",
    style: {
      palette: "Auto",
      lighting: "Auto",
      moveset: "Auto"
    },
    camera: {
      camera: "Clean Digital",
      lens: "Clinical Sharp",
      focalLength: "50",
      aperture: "f/11 Deep Focus"
    },
    duration: "8s",
    resolution: "1080p",
    quantity: 1,
    optimization: "Auto"
  });

  const types = [
    { id: "cover", label: "Image", icon: ImageIcon, color: "text-orange-500" },
    { id: "video", label: "Video", icon: Video, color: "text-blue-500" },
    { id: "ugc", label: "UGC", icon: User, color: "text-purple-500" },
  ];

  const durations = ["4s", "8s", "15s"];
  const resolutions = ["720p", "1080p", "4K"];
  const optimizations = ["Speed", "Auto", "Quality"];

  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const handleEnhance = () => {
    if (!prompt) return;
    setPrompt(prev => prev + " --cinematic lighting, ultra-sharp 8k, highly detailed, professional color grade");
  };

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGenProgress(0);
    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            onClose();
          }, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 40);
  };

  const getPlaceholder = () => {
    if (type === 'cover') return "Describe your visual sonic node...";
    if (type === 'ugc') return "What is the script for your virtual brand ambassador?";
    return "What would you shoot with infinite budget?";
  };

  const getModelLabel = () => {
    const rec = type === 'cover'
      ? RECOMMENDATIONS['cover-art']
      : type === 'ugc'
        ? RECOMMENDATIONS['short-form']
        : RECOMMENDATIONS['music-video'];
    let saved: string | null = null;
    try { saved = localStorage.getItem(rec.storageKey); } catch { /* ignore */ }
    const m = ALL_PROVIDERS.find((p) => p.id === (saved || rec.recommendedId));
    return m?.name || 'AI Model';
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#050505]">
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-t-2 border-primary rounded-full shadow-[0_0_50px_rgba(255,77,0,0.5)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-center space-y-2">
                <div className="text-4xl font-black italic text-white font-mono">{genProgress}%</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono animate-pulse">SYNTHESIZING</div>
              </div>
            </div>
            
            <div className="mt-12 text-center space-y-4 max-w-sm">
               <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] font-mono leading-relaxed">
                 Injecting neural metadata into active campaign relay... <br/>
                 Handshaking with global distribution nodes...
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-layer overflow-hidden pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute inset-0 technical-grid opacity-5" />
      </motion.div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 px-4 sm:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white/40" />
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
             <span className="text-[11px] font-bold text-white/60">Type: <span className="text-white">All</span></span>
             <ChevronDown className="w-3 h-3 text-white/30" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center opacity-40">
             <Check className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
             <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 transition-colors bg-white/5"><Maximize2 className="w-3.5 h-3.5" /></button>
             <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 transition-colors"><Minimize2 className="w-3.5 h-3.5" /></button>
             <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /></button>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="relative z-10 w-full h-full flex pt-20">
        
        {/* Left Toolbar */}
        <div className="w-14 sm:w-20 shrink-0 border-r border-white/5 flex flex-col items-center py-6 sm:py-8 gap-4 sm:gap-6">
           <button className="w-10 h-10 border border-white/10 flex items-center justify-center text-white bg-white/5 rounded-lg">
              <Sparkles className="w-5 h-5" />
           </button>
           <button className="hidden sm:flex w-10 h-10 border border-white/5 items-center justify-center text-white/20 transition-all">
              <Search className="w-5 h-5" />
           </button>
           <button className="hidden sm:flex w-10 h-10 border border-white/5 items-center justify-center text-white/20 transition-all">
              <Plus className="w-5 h-5" />
           </button>
           <div className="mt-auto flex flex-col gap-3 sm:gap-4 py-4 border-t border-white/5">
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                    type === t.id ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(255,77,0,0.1)]" : "text-white/20"
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-tight">{t.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center relative p-4 sm:p-12 lg:p-20">

           <div className="max-w-4xl w-full text-center space-y-8 sm:space-y-12 mb-56 sm:mb-40">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] font-mono mb-4">{getModelLabel()}</div>
              
              <div className="relative group">
                {/* Corner markers */}
                <div className="absolute -top-4 -left-4 w-6 h-6 border-t-2 border-l-2 border-white/5" />
                <div className="absolute -top-4 -right-4 w-6 h-6 border-t-2 border-r-2 border-white/5" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 border-b-2 border-l-2 border-white/5" />
                <div className="absolute -bottom-4 -right-4 w-6 h-6 border-b-2 border-r-2 border-white/5" />

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full bg-transparent text-2xl sm:text-4xl md:text-6xl font-black text-white text-center italic uppercase tracking-tighter placeholder:text-white/10 outline-none resize-none overflow-hidden h-32 sm:h-40 font-mono leading-tight"
                />

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleEnhance}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 transition-all rounded-full group border border-white/5"
                  >
                    <Wand2 className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono italic">Enhance_Prompt_Inference</span>
                  </button>
                </div>
              </div>
           </div>

           {/* Bottom Control Bar */}
           <div className="absolute bottom-4 sm:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-3 sm:px-8">

              {/* Settings Feedback Labels */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                 <button
                  onClick={() => setActiveSelector('genre')}
                  className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5 transition-all group"
                 >
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-gradient-to-br from-primary/40 to-zinc-800" />
                    <span className="text-[11px] font-bold text-white/40 transition-colors">Genre: <span className="text-white uppercase italic">{settings.genre}</span></span>
                 </button>

                 <button
                  onClick={() => setActiveSelector('style')}
                  className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5 transition-all group"
                 >
                    <Settings2 className="w-4 h-4 text-white/40" />
                    <span className="text-[11px] font-bold text-white/40 transition-colors">Style: <span className="text-white uppercase italic">{settings.style.palette}</span></span>
                 </button>

                 <button
                   onClick={() => setActiveSelector('camera')}
                   className="flex items-center gap-4 bg-white/5 rounded-full px-4 py-2 border border-white/5 transition-all group"
                 >
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-white/40" />
                      <span className="text-[11px] font-bold text-white/40 transition-colors">Camera: <span className="text-white uppercase italic">{settings.camera.camera}, {settings.camera.lens}, {settings.camera.focalLength}mm</span></span>
                    </div>
                 </button>
              </div>

              {/* Action Bar */}
              <div className="bg-[#121212]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">

                 <div className="flex flex-wrap items-center gap-2 px-1">
                    <div 
                      onClick={() => {
                        const idx = durations.indexOf(settings.duration);
                        setSettings((s: any) => ({ ...s, duration: durations[(idx + 1) % durations.length] }));
                      }}
                      className="flex items-center gap-2 px-4 h-14 bg-white/5 border border-white/5 rounded-2xl text-[12px] font-bold text-white transition-all cursor-pointer"
                    >
                       <Zap className="w-4 h-4 text-white/40" />
                       <span>{settings.duration}</span>
                    </div>
                    <div 
                      onClick={() => {
                        const idx = resolutions.indexOf(settings.resolution);
                        setSettings((s: any) => ({ ...s, resolution: resolutions[(idx + 1) % resolutions.length] }));
                      }}
                      className="flex items-center gap-2 px-4 h-14 bg-white/5 border border-white/5 rounded-2xl text-[12px] font-bold text-white transition-all cursor-pointer"
                    >
                       <Maximize2 className="w-4 h-4 text-white/40" />
                       <span>{settings.resolution}</span>
                    </div>
                    <div 
                      onClick={() => {
                        const idx = optimizations.indexOf(settings.optimization);
                        setSettings((s: any) => ({ ...s, optimization: optimizations[(idx + 1) % optimizations.length] }));
                      }}
                      className="flex items-center gap-2 px-4 h-14 bg-white/5 border border-white/5 rounded-2xl text-[12px] font-bold text-white transition-all cursor-pointer"
                    >
                       <div className={cn("w-1.5 h-1.5 rounded-full", settings.optimization === 'Auto' ? "bg-white/40" : "bg-primary")} />
                       <span>{settings.optimization}</span>
                    </div>
                    <div className="flex items-center gap-4 h-14 bg-white/5 border border-white/5 rounded-2xl px-6">
                       <button onClick={() => setSettings((s: any) => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))} className="text-white/20 text-sm font-mono transition-colors">–</button>
                       <span className="text-white text-[12px] font-bold">{settings.quantity} / 4</span>
                       <button onClick={() => setSettings((s: any) => ({ ...s, quantity: Math.min(4, s.quantity + 1) }))} className="text-white/20 text-sm font-mono transition-colors">+</button>
                    </div>
                    <button className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-white/40 transition-all">
                       <span className="text-lg font-bold">@</span>
                    </button>
                 </div>

                 <ModelPicker recommendation={type === 'video' ? RECOMMENDATIONS['music-video'] : RECOMMENDATIONS['cover-art']} variant="full" />

                 <button
                  onClick={handleGenerate}
                  disabled={!prompt}
                  className={cn(
                    "flex-1 w-full h-14 bg-gradient-to-r from-cyan-400 to-blue-500 active:scale-95 text-black font-black uppercase text-[12px] tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all group",
                    !prompt && "opacity-50 grayscale cursor-not-allowed"
                  )}
                 >
                    <span>GENERATE</span>
                    <Sparkles className="w-4 h-4 fill-black" />
                    <span className="opacity-40">{45 * settings.quantity}</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Global Selectors */}
        <AnimatePresence>
          {activeSelector === 'genre' && (
            <StudioGenreSelector 
              activeId={settings.genre} 
              onSelect={(id) => { setSettings((s: any) => ({ ...s, genre: id })); setActiveSelector(null); }} 
              onClose={() => setActiveSelector(null)}
            />
          )}
          {activeSelector === 'camera' && (
            <StudioCameraSelector 
              settings={settings.camera}
              onUpdate={(cam) => setSettings((s: any) => ({ ...s, camera: cam }))}
              onClose={() => setActiveSelector(null)}
            />
          )}
          {activeSelector === 'style' && (
            <StudioStyleSelector 
              currentSettings={settings.style}
              onUpdate={(style) => setSettings((s: any) => ({ ...s, style }))}
              onClose={() => setActiveSelector(null)} 
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

