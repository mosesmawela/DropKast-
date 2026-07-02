import React, { useState } from 'react';
import {
  MessageSquare,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      notify('error', 'Rating required', 'Pick a 1–5 rating before submitting.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/dj/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djId: 'dj-self', // real impl: pull from auth context
          releaseId: 'rel-current',
          rating,
          comment,
          willPlayInSet: rating >= 4,
        }),
      });
      if (!res.ok) throw new Error('Submit failed');
      notify('success', 'Feedback sent', 'The artist will see your rating and notes.');
      setRating(0);
      setComment('');
    } catch (err: any) {
      notify('error', 'Submit failed', err?.message || 'Try again in a moment.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">DJ feedback</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">Track feedback</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Tell artists how the track is performing on the floor. Will you play it in your set?</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="manifest-card p-12 bg-black/40 border-white/5 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-6 min-w-0">
                 <div className="w-20 h-20 bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-white/10">
                    <Music className="w-8 h-8" />
                 </div>
                 <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black text-primary font-mono italic">Now reviewing</span>
                    <h3 className="text-3xl font-black italic text-white uppercase tracking-tight truncate">Current track</h3>
                 </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono italic block">Your rating</label>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className={cn(
                        "beam w-14 h-14 sm:w-16 sm:h-16 border flex items-center justify-center transition-all",
                        rating >= i ? "border-primary bg-primary/10 text-primary" : "border-white/5 text-white/10"
                      )}
                    >
                      <Star className={cn("w-6 h-6", rating >= i && "fill-current")} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono italic block">Your notes</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How does it play on the floor?"
                  className="w-full h-40 bg-white/[0.02] border border-white/5 p-8 text-[11px] font-mono font-black text-white placeholder:text-white/10 focus:border-primary/50 outline-none transition-all uppercase tracking-widest leading-relaxed"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSending}
              className="beam h-20 w-full bg-white text-black transition-all font-mono font-black italic text-[12px] tracking-widest flex items-center justify-center gap-4 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <span>{isSending ? 'Sending...' : 'Send feedback'}</span>
              {!isSending && <Send className="w-5 h-5 transition-transform" />}
            </button>
          </form>
        </div>

        <div className="space-y-8">
           <div className="manifest-card p-8 bg-primary/10 border-primary/20 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <MessageSquare className="w-5 h-5" />
                <h4 className="text-[10px] font-black uppercase tracking-widest italic font-mono">Why feedback matters</h4>
              </div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-sans leading-relaxed italic">
                Your ratings and notes go straight to the artist, and help shape how the track gets promoted.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
