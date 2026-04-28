import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Disc
} from 'lucide-react';
import { cn } from '../lib/utils';

const allPlatforms = [
  { id: 'spotify', name: 'Spotify', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'apple', name: 'Apple Music', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'tiktok', name: 'TikTok', category: 'Social', regions: 'Global', active: true, fee: 'Included' },
  { id: 'ytm', name: 'YouTube Music', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'amazon', name: 'Amazon Music', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'instagram', name: 'Instagram', category: 'Social', regions: 'Global', active: true, fee: 'Included' },
  { id: 'facebook', name: 'Facebook', category: 'Social', regions: 'Global', active: true, fee: 'Included' },
  { id: 'deezer', name: 'Deezer', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'tidal', name: 'Tidal', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'audiomack', name: 'Audiomack', category: 'Streaming', regions: 'Global', active: true, fee: 'Included' },
  { id: 'boomplay', name: 'Boomplay', category: 'Streaming', regions: 'Africa', active: true, fee: 'Included' },
  { id: 'anghami', name: 'Anghami', category: 'Streaming', regions: 'MENA', active: true, fee: 'Included' },
];

export default function Platforms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = allPlatforms.filter(p => 
    (selectedCategory === 'ALL' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-mono">
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            Global_Distribution_Relay
          </div>
          <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            Store <span className="text-primary">Management</span>
          </h1>
          <p className="text-white/30 text-base font-bold italic tracking-widest uppercase">Select the delivery nodes for your master audio data.</p>
        </div>

        <div className="flex-1 max-w-md w-full space-y-6">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="SEARCH_PLATFORMS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark border border-white/5 py-6 pl-16 pr-6 text-white focus:outline-none focus:border-primary transition-all font-mono font-black placeholder:text-white/10 uppercase italic"
              />
           </div>
           <div className="flex items-center gap-4">
              {['ALL', 'Streaming', 'Social'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 h-12 text-[10px] font-black uppercase tracking-widest italic border transition-all",
                    selectedCategory === cat ? "bg-white text-black border-white" : "text-white/40 border-white/10 hover:border-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map((p, idx) => (
           <motion.div 
             key={p.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: idx * 0.05 }}
             className="manifest-card p-10 bg-dark border-white/5 group hover:border-primary/40 transition-all flex flex-col justify-between"
           >
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="w-16 h-16 border border-white/10 flex items-center justify-center p-3 grayscale group-hover:grayscale-0 transition-all">
                       <img src={`https://cdn.simpleicons.org/${p.id}/white`} alt={p.name} className="w-full h-full object-contain opacity-40 group-hover:opacity-100" />
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-black text-primary italic uppercase tracking-widest">{p.category}</div>
                       <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{p.regions}</div>
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">{p.name}</h3>
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="w-3.5 h-3.5 text-green-500 font-black" />
                       <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Validated Node</span>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/20 uppercase font-mono mb-1">Fee Model</span>
                    <span className="text-xs font-black text-white italic font-mono uppercase">{p.fee}</span>
                 </div>
                 <button className="h-12 px-6 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/40 hover:text-white hover:border-white transition-all">
                    Release Data
                 </button>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="mt-20 p-12 border border-primary/20 bg-primary/5 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5">
           <Globe2 className="w-40 h-40 text-primary" />
         </div>
         <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
               <AlertTriangle className="w-8 h-8 text-primary" />
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Global Network Compliance</h2>
            </div>
            <p className="text-sm font-sans italic text-white/50 leading-relaxed font-medium uppercase tracking-[0.05em] max-w-2xl">
              Distribution to mainland China nodes requires secondary manual review. Our system automatically attempts synchronization with Tencent Music and NetEase Cloud Music once your release is verified.
            </p>
         </div>
         <button className="h-16 px-12 bg-white text-black font-black uppercase italic tracking-widest text-[11px] hover:bg-primary hover:text-white transition-all flex items-center gap-3 shrink-0">
            View Compliance Layer
            <ExternalLink className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
