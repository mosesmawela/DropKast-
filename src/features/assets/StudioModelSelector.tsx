import { useState } from "react";
import { X, Search, Check, Sparkles, Zap, Video, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface Model {
  id: string;
  name: string;
  version: string;
  desc: string;
  isNew?: boolean;
  isExclusive?: boolean;
  type: 'cinematic' | 'featured';
  specs: {
    res?: string;
    duration?: string;
    audio?: boolean;
  }
}

const models: Model[] = [
  {
    id: "cinema-3.5",
    name: "Cinema Studio",
    version: "3.5",
    desc: "Camera selection, style presets, and AI director",
    isNew: true,
    type: 'cinematic',
    specs: {}
  },
  {
    id: "cinema-3.0",
    name: "Cinema Studio",
    version: "3.0",
    desc: "Enhanced camera and speed ramp control",
    type: 'cinematic',
    specs: {}
  },
  {
    id: "seedance-2.0",
    name: "Seedance",
    version: "2.0",
    desc: "720p · 4s-15s",
    isNew: true,
    type: 'featured',
    specs: { res: "720p", duration: "4s-15s" }
  },
  {
    id: "kling-3.0",
    name: "Kling",
    version: "3.0",
    desc: "4K · 3s-15s",
    isExclusive: true,
    type: 'featured',
    specs: { res: "4K", duration: "3s-15s", audio: true }
  }
];

export default function StudioModelSelector({ activeId, onSelect, onClose }: { activeId: string, onSelect: (id: string) => void, onClose: () => void }) {
  const [search, setSearch] = useState("");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full left-0 mb-4 w-80 bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50"
    >
      <div className="p-4 border-b border-white/10 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input 
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full bg-white/5 rounded-lg py-2 pl-12 pr-4 text-[13px] text-white outline-none focus:ring-1 ring-primary/50 transition-all font-sans"
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
        <Section title="Cinematic models" items={models.filter(m => m.type === 'cinematic')} activeId={activeId} onSelect={onSelect} />
        <Section title="Featured models" items={models.filter(m => m.type === 'featured')} activeId={activeId} onSelect={onSelect} />
      </div>
    </motion.div>
  );
}

function Section({ title, items, activeId, onSelect }: { title: string, items: Model[], activeId: string, onSelect: (id: string) => void }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="px-4 py-2 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-white/20" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">{title}</span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full p-4 flex items-start gap-4 rounded-xl transition-all group relative",
              activeId === item.id ? "bg-white/5" : "hover:bg-white/[0.02]"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
              activeId === item.id ? "bg-primary border-primary" : "bg-black border-white/10 group-hover:border-white/20"
            )}>
              <Video className={cn("w-5 h-5", activeId === item.id ? "text-white" : "text-white/40")} />
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-bold text-white leading-none">{item.name} {item.version}</span>
                {item.isNew && <span className="bg-primary text-[8px] font-black italic px-1.5 py-0.5 rounded-sm">NEW</span>}
                {item.isExclusive && <span className="text-primary text-[8px] font-black italic border border-primary px-1.5 py-0.5 rounded-sm">EXCLUSIVE</span>}
              </div>
              <p className="text-[11px] text-white/30 leading-tight">{item.desc}</p>
            </div>

            {activeId === item.id && <Check className="w-4 h-4 text-primary absolute right-4 top-1/2 -translate-y-1/2" />}
          </button>
        ))}
      </div>
    </div>
  );
}
