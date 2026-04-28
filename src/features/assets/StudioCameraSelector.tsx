import { useState } from "react";
import { X, Aperture, Video, Focus, Scan, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface CameraSettings {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
}

export default function StudioCameraSelector({ settings, onUpdate, onClose }: { settings: CameraSettings, onUpdate: (settings: CameraSettings) => void, onClose: () => void }) {
  
  const sections = [
    { id: 'camera', label: 'CAMERA', icon: Video, values: ["Auto", "Clean Digital", "IMAX Digital", "Arri Alexa", "Handheld"] },
    { id: 'lens', label: 'LENS', icon: RotateCw, values: ["Auto", "Clinical Sharp", "Vintage Dream", "Anamorphic", "Soft Glow"] },
    { id: 'focalLength', label: 'FOCAL LENGTH', icon: Scan, values: ["Auto", "35", "50", "85", "135"] },
    { id: 'aperture', label: 'APERTURE', icon: Aperture, values: ["Auto", "f/1.8 Shallow", "f/2.8 Portrait", "f/5.6 Balanced", "f/11 Deep Focus"] },
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
        <div className="p-10 pb-0">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-bold text-white">Camera Settings</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-10">
             {sections.map((s) => (
                <div key={s.id} className="space-y-4">
                   <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] font-mono border-b border-white/5 pb-4 text-center">{s.label}</div>
                   <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                      {s.values.map(val => (
                        <button
                          key={val}
                          onClick={() => onUpdate({ ...settings, [s.id]: val })}
                          className={cn(
                            "w-full p-4 rounded-xl text-left transition-all border",
                            settings[s.id as keyof CameraSettings] === val 
                              ? "bg-primary/10 border-primary/40 text-white" 
                              : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <div className="text-[12px] font-bold">{val}</div>
                        </button>
                      ))}
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div className="p-10 pt-0 flex justify-end">
           <button 
            onClick={onClose}
            className="px-8 h-12 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl"
           >
             Save_Configuration
           </button>
        </div>
      </div>
    </motion.div>
  );
}
