import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Play, 
  Pause, 
  Video, 
  Users, 
  TrendingUp, 
  Globe2,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Share2,
  Calendar,
  Clock,
  Music,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotify } from '../context/NotificationContext';

export default function PreReleaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [tiktokPlan, setTiktokPlan] = useState<any[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch('/api/pre-releases');
        const list = await response.json();
        const item = list.find((r: any) => r.id === id);
        if (item) {
          setData(item);
        }
      } catch (err) {
        console.error('Failed to sync activation node.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const generateTikTokPlan = async () => {
    setIsActivating(true);
    try {
      const response = await fetch(`/api/pre-release/${id}/tiktok`, { method: 'POST' });
      const result = await response.json();
      setTiktokPlan(result.ideas);
      notify('success', 'Ideas ready', 'Your TikTok content ideas are ready.');
    } catch (err) {
      notify('error', 'Something went wrong', 'Couldn\'t generate your TikTok plan. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const launchInvasion = async () => {
    setIsActivating(true);
    try {
      const response = await fetch(`/api/pre-release/${id}/invasion`, { method: 'POST' });
      if (response.ok) {
        notify('success', 'Campaign live', 'Your track has been sent out to creators.');
        setData((prev: any) => ({ ...prev, status: 'invading' }));
      }
    } catch (err) {
      notify('error', 'Something went wrong', 'Couldn\'t launch your campaign. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-black text-primary uppercase font-mono italic animate-pulse">Loading...</span>
    </div>
  );

  if (!data) return (
    <div className="h-96 flex flex-col items-center justify-center gap-6">
      <Zap className="w-12 h-12 text-white/10" />
      <span className="text-xl font-black text-white italic">Pre-release not found</span>
      <button onClick={() => navigate('/pre-release')} className="text-primary font-mono text-[10px] font-black uppercase tracking-widest hover:underline">Back to pre-releases</button>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
       <button 
        onClick={() => navigate('/pre-release')}
        className="flex items-center gap-3 text-white/40 transition-all group font-mono text-[10px] font-black tracking-widest"
      >
        <ChevronLeft className="w-4 h-4 transition-transform" />
        <span>Back to pre-releases</span>
      </button>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Pre-release</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8] break-words">{data.title}</h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
           <button 
            onClick={launchInvasion}
            disabled={isActivating || data.status === 'invading'}
            className={cn(
              "beam h-16 px-10 flex items-center justify-center gap-4 group transition-all font-mono font-black italic text-[11px] tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
              data.status === 'invading'
                ? "bg-emerald-500 text-white pointer-events-none"
                : "bg-red-600 text-white"
            )}
          >
            <Zap className={cn("w-5 h-5", data.status === 'invading' && "animate-pulse")} />
            <span>{data.status === 'invading' ? "Campaign live" : "Launch campaign"}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Signal Profile */}
        <div className="lg:col-span-2 space-y-12">
          <div className="manifest-card p-12 bg-black/60 border-white/5 space-y-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 min-w-0">
                <div className="w-20 h-20 bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <Music className="w-8 h-8 text-white/10" />
                </div>
                <div className="space-y-2 min-w-0">
                  <div className="text-[10px] font-black text-primary font-mono italic">Your snippet</div>
                  <div className="text-2xl font-black text-white italic font-mono lowercase tracking-tight truncate">{data.title}.wav</div>
                </div>
              </div>
              <button className="beam w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary transition-all group active:scale-95">
                <Play className="w-6 h-6 fill-current" />
              </button>
            </div>

            <div className="h-32 bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center px-4">
               {/* Waveform Visualization */}
               <div className="flex items-end gap-[2px] w-full h-full p-4 grayscale opacity-20">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-white" style={{ height: `${Math.random() * 80 + 10}%` }} />
                  ))}
               </div>
               {/* Hook Overlay */}
               <div 
                className="absolute inset-y-0 bg-primary/20 border-x-2 border-primary z-10 flex items-center justify-center"
                style={{ left: '25%', right: '50%' }}
               >
                 <span className="text-[8px] font-black text-primary font-mono uppercase tracking-[0.4em] rotate-90">Hook</span>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'Videos made', value: '—', color: 'text-white' },
                 { label: 'Trending', value: '—', color: 'text-emerald-400' },
                 { label: 'Release date', value: data.releaseDate, color: 'text-white/40' },
                 { label: 'Hook length', value: '—', color: 'text-primary' },
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono italic">{stat.label}</div>
                   <div className={cn("text-lg font-black font-mono italic tracking-tight", stat.color)}>{stat.value}</div>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter min-w-0 break-words">Content ideas</h2>
              <button
                onClick={generateTikTokPlan}
                disabled={isActivating}
                className="flex items-center gap-3 text-primary transition-all font-mono text-[10px] font-black tracking-widest shrink-0"
              >
                <Sparkles className={cn("w-4 h-4", isActivating && "animate-spin")} />
                <span>{tiktokPlan.length > 0 ? "Regenerate ideas" : "Generate ideas"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {tiktokPlan.length === 0 ? (
                  <div className="col-span-2 py-20 text-center space-y-6 manifest-card border-dashed border-white/10 bg-black/20">
                     <div className="w-16 h-16 border border-white/5 flex items-center justify-center mx-auto text-white/10">
                        <Video className="w-6 h-6" />
                     </div>
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-mono italic">No ideas yet. Generate ideas to get started.</p>
                  </div>
                ) : (
                  tiktokPlan.map((idea, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i}
                      className="manifest-card p-10 bg-white/[0.02] border-white/5 space-y-8 group transition-all"
                    >
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                             <TrendingUp className="w-4 h-4" />
                           </div>
                           <span className="text-[10px] font-black text-white/40 font-mono tracking-widest">{idea.type}</span>
                         </div>
                         <CheckCircle2 className="w-4 h-4 text-primary opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xl font-black italic text-white lowercase tracking-tight">{idea.idea || idea.title}</h4>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic font-sans leading-relaxed">
                          {idea.caption}
                        </p>
                      </div>
                      <button className="beam h-12 w-full border border-white/5 transition-all font-mono text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 text-white/30">
                        <span>Get the assets</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           <div className="manifest-card p-8 bg-primary/10 border-primary/20 space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Globe2 className="w-5 h-5 animate-spin-slow" />
                <h3 className="text-lg font-black italic uppercase tracking-tight">Auto-switch on release</h3>
              </div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest italic font-sans leading-relaxed">
                DropKast watches for your track going live. When your full release drops, all the buzz automatically moves over to your official audio.
              </p>
           </div>

           <div className="manifest-card p-8 bg-white/[0.02] border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest font-mono italic">Timeline</h3>
              <div className="space-y-4">
                {[
                  { label: 'Upload', status: 'Done', date: '4h ago' },
                  { label: 'TikTok plan', status: tiktokPlan.length > 0 ? 'Done' : 'Pending', date: tiktokPlan.length > 0 ? 'Just now' : '-' },
                  { label: 'Campaign', status: data.status === 'invading' ? 'Live' : 'Ready', date: '-' },
                  { label: 'Release day', status: 'Waiting', date: data.releaseDate },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 h-12">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 mt-1",
                      step.status === 'Done' ? "bg-primary border-primary" : "border-white/10"
                    )} />
                    <div className="flex-1 border-b border-white/5 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-white italic tracking-tight">{step.label}</span>
                        <span className="text-[8px] font-black text-white/20 font-mono">{step.date}</span>
                      </div>
                      <span className={cn(
                        "text-[8px] font-black font-mono tracking-widest",
                        step.status === 'Done' ? "text-primary" : "text-white/20"
                      )}>{step.status}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
