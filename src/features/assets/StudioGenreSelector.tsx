import { useState } from "react";
import { X, ChevronUp, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

const genres = [
  { id: "comedy", name: "Comedy", video: "https://v1.bg.gg/c1.mp4" },
  { id: "noir", name: "Noir", video: "https://v1.bg.gg/c2.mp4" },
  { id: "drama", name: "Drama", video: "https://v1.bg.gg/c3.mp4" },
  { id: "epic", name: "Epic", video: "https://v1.bg.gg/c4.mp4" },
  { id: "general", name: "General", video: "https://v1.bg.gg/c5.mp4" },
  { id: "action", name: "Action", video: "https://v1.bg.gg/c6.mp4" },
  { id: "horror", name: "Horror", video: "https://v1.bg.gg/c7.mp4" },
];

export default function StudioGenreSelector({ activeId, onSelect, onClose }: { activeId: string, onSelect: (id: string) => void, onClose: () => void }) {
  const activeGenre = genres.find(g => g.id === activeId) || genres[4];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-8 left-8 z-10">
          <h2 className="text-xl font-bold text-white">Genre</h2>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-10 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5 text-white/50" />
        </button>

        <div className="flex h-[500px]">
          {/* Visual Preview Left */}
          <div className="flex-[1.5] relative flex items-center justify-center bg-zinc-900/50">
             <div className="w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-white/5 shadow-2xl relative">
                <img 
                  src={`https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800&genre=${activeId}`} 
                  alt={activeGenre.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             </div>
             {/* Decorative lines */}
             <div className="absolute inset-0 technical-grid opacity-10" />
          </div>

          {/* List Right */}
          <div className="flex-1 border-l border-white/10 p-12 flex flex-col justify-center gap-2 overflow-y-auto custom-scrollbar">
             {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelect(g.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all group",
                    activeId === g.id ? "bg-white/5 scale-105" : "hover:bg-white/[0.02] opacity-40 hover:opacity-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full overflow-hidden border transition-all", activeId === g.id ? "border-primary" : "border-white/10")}>
                      <img src={`https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=100&genre=${g.id}`} className="w-full h-full object-cover" />
                    </div>
                    <span className={cn("text-lg font-bold transition-all", activeId === g.id ? "text-white" : "text-white/60")}>
                      {g.name}
                    </span>
                  </div>
                  {activeId === g.id && <Check className="w-5 h-5 text-primary" />}
                </button>
             ))}
             
             {/* Arrows indicator */}
             <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
