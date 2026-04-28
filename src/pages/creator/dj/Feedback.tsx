import React, { useState } from 'react';
import { 
  MessageSquare, 
  Disc, 
  TrendingUp, 
  Zap, 
  Send, 
  CheckCircle2, 
  Star,
  Music
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { useNotify } from '../../../context/NotificationContext';

export default function DJFeedback() {
  const { notify } = useNotify();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      notify('error', 'INPUT_ERROR', 'Rating signal required for transmission.');
      return;
    }
    
    setIsSending(true);
    setTimeout(() => {
      notify('success', 'FEEDBACK_LOGGED', 'A&R loop complete. Data anchored to track ID.');
      setRating(0);
      setComment('');
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">A&R_Relay</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">SONIC_FEEDBACK</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Submit high-priority intel to artists and labels regarding track performance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="manifest-card p-12 bg-black/40 border-white/5 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-white/5 border border-white/5 flex items-center justify-center italic text-[10px] font-black text-white/10 font-mono">
                    SONIC_NODE_01
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary font-mono italic">Active_Vibe_Analysis</span>
                    <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">Afrobeats_Signal_Burst</h3>
                 </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono italic block">Vibe_Strength_Rating</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className={cn(
                        "w-16 h-16 border flex items-center justify-center transition-all",
                        rating >= i ? "border-primary bg-primary/10 text-primary" : "border-white/5 text-white/10 hover:border-white/20"
                      )}
                    >
                      <Star className={cn("w-6 h-6", rating >= i && "fill-current")} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono italic block">Intel_Commentary</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="LOG_TACTICAL_FEEDBACK..."
                  className="w-full h-40 bg-white/[0.02] border border-white/5 p-8 text-[11px] font-mono font-black text-white placeholder:text-white/10 focus:border-primary/50 outline-none transition-all uppercase tracking-widest leading-relaxed"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSending}
              className="h-20 w-full bg-white text-black hover:bg-primary hover:text-white transition-all font-mono font-black italic text-[12px] tracking-widest flex items-center justify-center gap-4 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <span>{isSending ? 'BUFFERING...' : 'TRANSMIT_INTEL'}</span>
              {!isSending && <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />}
            </button>
          </form>
        </div>

        <div className="space-y-8">
           <div className="manifest-card p-10 bg-black/60 border-white/5 space-y-8">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tight border-b border-white/5 pb-6">Global_Intel_Summary</h3>
              
              <div className="space-y-8">
                 {[
                   { label: 'DANCE_FLOOR_HEAT', value: '84%', icon: TrendingUp, color: 'text-primary' },
                   { label: 'PEAK_HOUR_POTENTIAL', value: 'HIGH', icon: Disc, color: 'text-white' },
                   { label: 'SONIC_CLARITY', value: '4.8/5', icon: Zap, color: 'text-emerald-400' },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary transition-all">
                            <stat.icon className="w-4 h-4" />
                         </div>
                         <span className="text-[9px] font-black text-white/20 font-mono tracking-widest group-hover:text-white transition-colors uppercase italic">{stat.label}</span>
                      </div>
                      <div className={cn("text-xl font-black font-mono italic", stat.color)}>{stat.value}</div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="manifest-card p-8 bg-primary/10 border-primary/20 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <MessageSquare className="w-5 h-5" />
                <h4 className="text-[10px] font-black uppercase tracking-widest italic font-mono">Why_Intel_Matters</h4>
              </div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-sans leading-relaxed italic">
                Your feedback directly influences artist distribution metrics and visual asset calibration.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
