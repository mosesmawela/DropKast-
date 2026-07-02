import { ChevronLeft, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface StepReviewProps {
  data: any;
  back: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function StepReview({ data, back, onSubmit }: StepReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewArt, setPreviewArt] = useState<string | null>(null);

  useEffect(() => {
    if (data.artwork && data.artwork instanceof File) {
      const url = URL.createObjectURL(data.artwork);
      setPreviewArt(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof data.artwork === 'string') {
      setPreviewArt(data.artwork);
    }
  }, [data.artwork]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API latency
    setTimeout(async () => {
      await onSubmit(data);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter font-mono">Final Review</h2>
        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic">
          Audit the following parameters before cluster synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
           <div className="manifest-card p-10 bg-dark border-white/5 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck className="w-16 h-16 text-primary" />
              </div>
              
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] font-mono">Master_Identity</label>
                 <div className="text-3xl font-black text-white italic uppercase font-mono tracking-tighter">{data.title}</div>
              </div>

               <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] font-mono">Operator</label>
                    <div className="text-sm font-black text-white italic uppercase font-mono tracking-widest">{data.artist}</div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] font-mono">Signal_Type</label>
                    <div className="text-sm font-black text-primary italic uppercase font-mono tracking-widest">{data.genre}</div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] font-mono">UPC_Index</label>
                    <div className="text-sm font-black text-white/60 font-mono tracking-widest">{data.upc || 'NOT_ASSIGNED'}</div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] font-mono">TikTok_Stamp</label>
                    <div className="text-sm font-black text-white/60 font-mono tracking-widest">{data.tiktok_stamp || '00:00'}</div>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-mono italic">Sonic_Architects</label>
                       <div className="text-[10px] font-bold text-white/60 truncate">{data.producers || 'UNCREDITED'}</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-mono italic">Lyrical_Authors</label>
                       <div className="text-[10px] font-bold text-white/60 truncate">{data.writers || 'UNCREDITED'}</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-primary border border-primary space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                 <Zap className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic font-mono">AI Deployment Warrant</h4>
              <p className="text-xs text-white font-black italic tracking-tight leading-relaxed uppercase">
                By submitting, you authorize the encryption and delivery of these master nodes across the global decentralized relay network.
              </p>
           </div>
        </div>

        <div className="space-y-8">
           <div className="aspect-square border border-white/10 p-1.5 bg-surface-low relative group">
              {previewArt ? (
                <img src={previewArt} alt="Artwork Preview" className="w-full h-full object-cover grayscale" />
              ) : (
                <div className="w-full h-full bg-dark flex items-center justify-center text-white/10 font-mono italic font-black uppercase text-xl">NO_ART_NODE</div>
              )}
              <div className="absolute top-0 right-0 m-6 p-3 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-white italic uppercase tracking-[0.2em]">
                {data.releaseDate}
              </div>
           </div>
           
           <div className="p-8 border border-white/5 bg-dark space-y-2">
              <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.4em] font-mono italic">
                 <span>Audio_Stream_Check</span>
                 <CheckCircle2 className="w-3 h-3 text-green-500" />
              </div>
              <div className="text-xs font-black text-white italic uppercase tracking-widest truncate">{data.audio?.name || 'NO_AUDIO_MASTER'}</div>
           </div>
        </div>
      </div>

      <div className="flex justify-between pt-12 items-center">
        <button 
          onClick={back}
          className="flex items-center gap-3 text-white/20 transition-colors text-[10px] font-black uppercase tracking-[0.3em] font-mono italic"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous_Entry
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="beam h-20 px-16 bg-white text-black font-mono font-black italic tracking-widest uppercase text-xs transition-all active:scale-95 disabled:opacity-20 flex items-center gap-6 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
        >
          {isSubmitting ? 'ENCRYPTING_TRANSMISSION...' : 'SUBMIT_TO_RELAY_NODES'}
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
