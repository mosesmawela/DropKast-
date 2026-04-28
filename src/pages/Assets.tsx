import { useState } from "react";
import AssetGrid from "../features/assets/AssetGrid";
import CreateAssetModal from "../features/assets/CreateAssetModal";
import ViralIdeaGenerator from "../features/assets/ViralIdeaGenerator";
import { Plus, LayoutGrid, Image as ImageIcon, Video, User, Zap, Sparkles, TrendingUp, Search, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import ScrollReveal from "../components/animations/ScrollReveal";
import { AnimatePresence } from "motion/react";

export default function Assets() {
  const [open, setOpen] = useState(false);
  const [viralOpen, setViralOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "All", label: "Protocol_All", icon: LayoutGrid },
    { id: "Covers", label: "Visual_Covers", icon: ImageIcon },
    { id: "Videos", label: "Motion_Nodes", icon: Video },
    { id: "UGC", label: "Social_Fuel", icon: User },
    { id: "Templates", label: "Viral_Blueprints", icon: Sparkles },
  ];

  const stats = [
    { label: "Total Assets", value: "156" },
    { label: "Generation Run", value: "2.4k" },
    { label: "Used in Ads", value: "84%" }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 space-y-12">
      {/* Header */}
      <ScrollReveal direction="down" variant="blur">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[var(--border-main)] pb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4 font-mono italic">
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Storage_Terminal</span>
              <div className="w-8 h-[1px] bg-[var(--border-main)]" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Ready_To_Sync</span>
            </div>
            <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-8">Assets <span className="text-primary">Studio</span></h1>
            
            <div className="flex gap-12">
              {stats.map(s => (
                <div key={s.label}>
                   <div className="text-[9px] font-black italic uppercase tracking-widest text-white/20 mb-1">{s.label}</div>
                   <div className="text-xl font-black text-white font-mono">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button
               onClick={() => setViralOpen(true)}
               className="h-16 px-10 border border-primary/20 bg-primary/5 text-primary flex items-center gap-4 text-[11px] uppercase font-mono group hover:bg-primary/10 transition-all"
             >
               <TrendingUp className="w-4 h-4 group-hover:scale-125 transition-transform" />
               <span>Make_This_Go_Viral</span>
             </button>
             <button
               onClick={() => setOpen(true)}
               className="primary-button h-16 px-10 flex items-center gap-4 text-[11px] uppercase font-mono group"
             >
               <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
               <span>Init_Asset_Generation</span>
             </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="flex flex-wrap gap-4 scroll-hide overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={cn(
                "manifest-card py-4 px-8 flex items-center gap-4 transition-all active:scale-95 whitespace-nowrap",
                activeCategory === c.id 
                  ? "border-primary bg-primary/5 text-primary shadow-[0_0_30px_rgba(255,77,0,0.1)]" 
                  : "text-white/40 hover:text-white"
              )}
            >
              <c.icon className="w-4 h-4" />
              <span className="text-[10px] font-black italic uppercase tracking-widest">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96 group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
           <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search_Relay_Nodes..."
            className="w-full h-14 bg-white/5 border border-white/10 pl-16 pr-6 text-[11px] font-mono uppercase italic text-white outline-none focus:border-primary transition-all rounded-2xl"
           />
           <button className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors">
              <Filter className="w-3 h-3" />
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="pt-8">
        <AssetGrid category={activeCategory} searchQuery={searchQuery} />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {open && <CreateAssetModal onClose={() => setOpen(false)} />}
        {viralOpen && <ViralIdeaGenerator onClose={() => setViralOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
