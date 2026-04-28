import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Video, 
  CheckCircle2, 
  Zap, 
  Upload,
  ArrowRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useNotify } from '../../../context/NotificationContext';

export default function InfluencerCampaigns() {
  const { notify } = useNotify();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  const campaigns = [
    { 
      id: 1, 
      title: "Afrobeats Drop: 'Midnight Rush'", 
      artist: "LVRN Elite", 
      reward: "$250 - $450", 
      status: "available",
      goal: "POV dance challenge",
      platforms: ["TikTok", "IG Reels"],
      deadline: "D-2"
    },
    { 
      id: 2, 
      title: "Summer Jam: 'Sonic Wave'", 
      artist: "WaveMaker", 
      reward: "$120 + Royalties", 
      status: "available",
      goal: "Lip-sync transition",
      platforms: ["TikTok"],
      deadline: "D-5"
    }
  ];

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Creator_Command</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">CAMPAIGN_RELAY</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Select mission-critical tasks to amplify global sonic signals.</p>
        </div>

        <div className="flex bg-white/[0.02] border border-white/5 p-1">
          {['available', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-6 h-12 text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              {tab}_MISSIONS
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {campaigns.map((c) => (
          <motion.div
            layout
            key={c.id}
            className="manifest-card p-10 bg-black/40 border-white/5 hover:border-primary/30 transition-all group"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-primary uppercase tracking-widest font-mono italic">{c.artist}</div>
                  <h3 className="text-3xl font-black text-white italic lowercase tracking-tight group-hover:text-primary transition-colors">{c.title}</h3>
                </div>
                <div className="px-4 h-10 border border-primary/20 flex items-center justify-center text-primary font-mono text-[10px] font-black italic">
                   {c.reward}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 p-6">
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">MISSION_GOAL</span>
                  <div className="text-[10px] font-bold text-white uppercase italic tracking-widest">{c.goal}</div>
                </div>
                <div className="space-y-2 text-right">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">DEADLINE</span>
                  <div className="text-[10px] font-black text-red-500 font-mono italic">{c.deadline}_HOURS</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {c.platforms.map(p => (
                    <div key={p} className="px-3 h-6 bg-white/5 border border-white/5 rounded-full flex items-center gap-2">
                      <div className="w-1 h-1 bg-white/40 rounded-full" />
                      <span className="text-[8px] font-black text-white/40 uppercase font-mono">{p}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => notify('success', 'MISSION_ACCEPTED', 'Synchronization complete. Deploy when ready.')}
                  className="h-16 w-full bg-white text-black hover:bg-primary hover:text-white transition-all font-mono font-black italic text-[11px] tracking-widest flex items-center justify-center gap-4"
                >
                  <span>ACCEPT_MISSION</span>
                  <Zap className="w-4 h-4" />
                </button>
                
                <button className="h-12 w-full border border-white/5 hover:border-white transition-all font-mono text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3">
                  <span>VIEW_ASSET_PACK</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        <div className="manifest-card p-10 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 text-center bg-black/20 group hover:border-primary/30 transition-all opacity-40 hover:opacity-100">
           <div className="w-16 h-16 border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary transition-colors">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div className="space-y-2">
              <h4 className="text-xl font-black italic text-white uppercase tracking-tight">Expand_Reach</h4>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono italic max-w-[200px]">
                Connect more accounts to unlock higher-tier sonic missions.
              </p>
           </div>
           <button className="h-12 border border-white/5 px-8 hover:border-white transition-all font-mono text-[10px] font-black italic tracking-widest uppercase text-white/40 hover:text-white">
              REFRESH_SIGNALS
           </button>
        </div>
      </div>
    </div>
  );
}
