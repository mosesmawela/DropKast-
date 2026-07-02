import React, { useState } from 'react';
import {
  Users,
  Video,
  CheckCircle2, 
  Zap, 
  Upload,
  ArrowRight,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useNotify } from '../../../context/NotificationContext';

export default function InfluencerCampaigns() {
  const { notify } = useNotify();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [accepting, setAccepting] = useState<Set<number>>(new Set());

  const handleAccept = async (id: number) => {
    setAccepting(prev => new Set(prev).add(id));
    try {
      const res = await fetch('/api/influencer/missions/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, status: 'accepted' })
      });
      if (!res.ok) throw new Error('Failed');
      setAccepted(prev => new Set(prev).add(id));
      notify('success', 'Campaign accepted', 'You joined this campaign. Check your campaigns tab for details.');
    } catch {
      notify('error', 'Could not join', 'Something went wrong joining this campaign. Please try again.');
    } finally {
      setAccepting(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

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
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Creator campaigns</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">Campaigns</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Pick campaigns to promote and get paid for your posts.</p>
        </div>

        <div className="flex bg-white/[0.02] border border-white/5 p-1 shrink-0">
          {['available', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "flex-1 md:flex-none px-6 h-12 text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-white text-black" : "text-white/40"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {campaigns.map((c) => (
          <motion.div
            layout
            key={c.id}
            className="manifest-card p-10 bg-black/40 border-white/5 transition-all group"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-[9px] font-black text-primary uppercase tracking-widest font-mono italic truncate">{c.artist}</div>
                  <h3 className="text-3xl font-black text-white italic lowercase tracking-tight transition-colors break-words">{c.title}</h3>
                </div>
                <div className="px-4 h-10 border border-primary/20 flex items-center justify-center text-primary font-mono text-[10px] font-black italic shrink-0">
                   {c.reward}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 p-6">
                <div className="space-y-2 min-w-0">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">What to make</span>
                  <div className="text-[10px] font-bold text-white uppercase italic tracking-widest break-words">{c.goal}</div>
                </div>
                <div className="space-y-2 text-right min-w-0">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">Due in</span>
                  <div className="text-[10px] font-black text-red-500 font-mono italic">{c.deadline}</div>
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
                
                {accepted.has(c.id) ? (
                  <div className="h-16 w-full bg-green-600/20 text-green-400 border border-green-500/30 font-mono font-black italic text-[11px] tracking-widest flex items-center justify-center gap-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Campaign accepted</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAccept(c.id)}
                    disabled={accepting.has(c.id)}
                    className="beam h-16 w-full bg-white text-black transition-all font-mono font-black italic text-[11px] tracking-widest flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {accepting.has(c.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>{accepting.has(c.id) ? 'Joining...' : 'Join campaign'}</span>
                  </button>
                )}
                
                <button className="beam h-12 w-full border border-white/5 transition-all font-mono text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center justify-center gap-3">
                  <span>View asset pack</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
