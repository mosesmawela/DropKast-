import { X, Palette, Sun, Move, Edit3, Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export default function StudioStyleSelector({ currentSettings, onUpdate, onClose }: { currentSettings: any, onUpdate: (settings: any) => void, onClose: () => void }) {
  const sections = [
    { 
      id: 'palette',
      label: "COLOR PALETTE", 
      icon: Palette,
      options: ["Auto", "Naturalistic Clean", "Bleak War", "Neon Noir"] 
    },
    { 
      id: 'lighting',
      label: "LIGHTING", 
      icon: Sun,
      options: ["Auto", "Soft Cross", "Hard Remix", "Golden Hour"] 
    },
    { 
      id: 'moveset',
      label: "CAMERA MOVESET STYLE", 
      icon: Move,
      options: ["Auto", "Classic Static", "Dynamic Pan", "Drone Sweep"] 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-10">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8 md:mb-12">
            <h2 className="text-xl font-bold text-white">Style Settings</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <button className="beam flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full transition-all group">
                <Edit3 className="w-4 h-4 text-white/50" />
                <span className="text-[11px] font-bold text-white/50">Manual Style · <span className="opacity-40">Off</span></span>
              </button>
              <button
                onClick={onClose}
                className="beam w-10 h-10 bg-white/5 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
             {sections.map((s, i) => (
                <div key={i} className="space-y-8">
                   <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] font-mono text-center mb-8">{s.label}</div>
                   
                   <div className="space-y-8">
                      {s.options.map((opt, idx) => {
                        const isActive = currentSettings[s.id] === opt || (opt === 'Auto' && !currentSettings[s.id]);
                        return (
                          <div
                            key={idx}
                            onClick={() => onUpdate({ ...currentSettings, [s.id]: opt })}
                            className="beam flex flex-col items-center gap-4 group cursor-pointer"
                          >
                             <div className={cn(
                               "w-36 max-w-full h-24 rounded-[32px] overflow-hidden border-2 transition-all relative",
                               isActive ? "border-primary shadow-[0_0_20px_rgba(255,77,0,0.2)]" : "border-white/5 opacity-40"
                             )}>
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/25 via-zinc-800 to-black">
                                  <span className="text-[10px] font-black italic uppercase tracking-widest text-white/70 font-mono px-2 text-center">{String(opt)}</span>
                                </div>
                                {isActive && (
                                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-white shadow-2xl" />
                                  </div>
                                )}
                             </div>
                             <span className={cn("text-[12px] font-bold transition-colors", isActive ? "text-white" : "text-white/40")}>{opt}</span>
                          </div>
                        );
                      })}
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div className="p-10 pt-0 flex justify-end">
           <button
            onClick={onClose}
            className="beam px-8 h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20"
           >
             Lock_Styles
           </button>
        </div>
      </div>
    </motion.div>
  );
}
