import React from 'react';
import { 
  Radio, 
  Download, 
  Disc, 
  Music, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useNotify } from '../../../context/NotificationContext';
import { toast } from 'sonner';

export default function DJPacks() {
  const { notify } = useNotify();

  const packs = [
    { 
      id: 1, 
      title: "Club_Burst_Vol_1", 
      genre: "Afrobeats / Amapiano", 
      tracks: 12, 
      size: "420MB",
      isNew: true 
    },
    { 
      id: 2, 
      title: "Midnight_Rush_Exclusive", 
      genre: "Hyper-Pop", 
      tracks: 4, 
      size: "124MB",
      isNew: false 
    },
    { 
      id: 3, 
      title: "Essential_Vibes_Pack", 
      genre: "Global Bass", 
      tracks: 24, 
      size: "1.2GB",
      isNew: false 
    },
  ];

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Distribution_Hub</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">SONIC_PROMO_PACKS</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">High-fidelity audio payloads for regional broadcast and club environments.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packs.map((p) => (
          <div key={p.id} className="manifest-card p-10 bg-black/40 border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
            {p.isNew && (
              <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-[8px] font-black italic text-white font-mono uppercase tracking-[0.3em]">
                NEW_PAYLOAD
              </div>
            )}
            
            <div className="space-y-10">
              <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <Disc className="w-10 h-10 text-white/10 group-hover:rotate-[360deg] transition-transform duration-[3000ms]" />
              </div>
              
              <div className="space-y-2">
                 <div className="text-[9px] font-black text-primary uppercase tracking-widest font-mono italic">{p.genre}</div>
                 <h3 className="text-3xl font-black italic text-white lowercase tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6">
                <div className="space-y-1">
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">TRACK_COUNT</div>
                   <div className="text-xl font-black text-white font-mono lowercase">{p.tracks} NODES</div>
                </div>
                <div className="space-y-1 text-right">
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">SIZE</div>
                   <div className="text-xl font-black text-white font-mono lowercase">{p.size}</div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                  <button 
                   onClick={async () => {
                     const res = await fetch(`/api/dj/packs/${String(p.id)}/deliver`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ djId: 'user-1' })
                     });
                     const data = await res.json();
                     if (data.ok) {
                       toast.success(data.url);
                       await navigator.clipboard.writeText(data.url);
                       notify('success', 'DOWNLOAD_READY', 'Signed URL generated.');
                     }
                   }}
                   className="h-16 w-full bg-white text-black hover:bg-primary hover:text-white transition-all font-mono font-black italic text-[11px] tracking-widest flex items-center justify-center gap-4 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  >
                   <span>DOWNLOAD_PACK</span>
                   <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                 </button>
                 
                 <button className="h-12 w-full border border-white/5 hover:border-white transition-all font-mono text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3">
                   <span>LEAVE_FEEDBACK</span>
                   <MessageSquare className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="manifest-card p-10 border-dashed border-white/10 flex flex-col items-center justify-center text-center bg-black/20 group hover:border-primary/30 transition-all cursor-pointer">
           <div className="w-16 h-16 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all text-white/10 group-hover:text-white">
              <Disc className="w-6 h-6 animate-spin-slow" />
           </div>
           <div className="mt-8 space-y-2">
              <h4 className="text-xl font-black italic text-white uppercase tracking-tight">Vibe_Protocol_Sync</h4>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono italic max-w-[200px]">
                Connect your DJ software (Serato, Rekordbox) to enable real-time chart injection.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
