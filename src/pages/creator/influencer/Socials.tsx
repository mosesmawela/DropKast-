import React from 'react';
import { 
  Share2, 
  CheckCircle2, 
  Hexagon, 
  Plus, 
  Video, 
  Instagram, 
  Linkedin,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useNotify } from '../../../context/NotificationContext';

export default function InfluencerSocials() {
  const { notify } = useNotify();

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: Video, connected: true, stats: '2.4M reach', color: 'text-primary' },
    { id: 'ig', name: 'Instagram', icon: Instagram, connected: true, stats: '840K reach', color: 'text-pink-500' },
    { id: 'tw', name: 'Twitter / X', icon: Hexagon, connected: false, stats: 'disconnected', color: 'text-sky-400' },
    { id: 'li', name: 'LinkedIn', icon: Linkedin, connected: false, stats: 'disconnected', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Connected accounts</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">Your socials</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Connect your platforms so we can verify your posts and pay you faster.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((p) => (
          <div key={p.id} className={cn(
            "manifest-card p-10 bg-black/40 border transition-all group",
            p.connected ? "border-primary/20" : "border-white/5 opacity-60 hover:opacity-100"
          )}>
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 border-2 flex items-center justify-center transition-all",
                  p.connected ? "border-primary text-primary" : "border-white/10 text-white/20"
                )}>
                  <p.icon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic text-white lowercase tracking-tight">{p.name}</h3>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest font-mono italic",
                    p.connected ? "text-primary" : "text-white/20"
                  )}>{p.stats}</span>
                </div>
              </div>
              
              {p.connected ? (
                <div className="flex items-center gap-2 text-primary">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[8px] font-black uppercase font-mono italic">ACTIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/20">
                   <Hexagon className="w-4 h-4" />
                   <span className="text-[8px] font-black uppercase font-mono italic">OFFLINE</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
               {p.connected ? (
                 <button 
                  onClick={() => notify('success', 'NODE_RECALIBRATED', 'Connection parameters refreshed.')}
                  className="h-14 w-full bg-white/5 border border-white/5 hover:border-white transition-all text-[10px] font-black text-white/40 hover:text-white font-mono uppercase italic tracking-widest flex items-center justify-center gap-4"
                 >
                   <span>REFRESH_CONNECTION</span>
                   <Zap className="w-3 h-3" />
                 </button>
               ) : (
                 <button 
                  onClick={() => notify('success', 'SYNC_REQUESTED', `Connecting to ${p.name} API mesh...`)}
                  className="h-14 w-full bg-white text-black hover:bg-primary hover:text-white transition-all text-[10px] font-black font-mono uppercase italic tracking-widest flex items-center justify-center gap-4"
                 >
                   <span>INITIALIZE_AUTH_FLOW</span>
                   <Plus className="w-4 h-4" />
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="manifest-card p-12 bg-primary/10 border-primary/20 space-y-6">
        <div className="flex items-center gap-4 text-primary">
          <Zap className="w-6 h-6 animate-pulse" />
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Auto-verify your posts</h2>
        </div>
        <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest italic font-sans leading-relaxed max-w-2xl">
          Connect TikTok, Instagram, YouTube. We auto-detect your campaign posts, mark missions complete, and pay out instantly.
        </p>
      </div>
    </div>
  );
}
