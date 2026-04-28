import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, X, ChevronRight, Loader2 } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { useGrowSong } from '../../context/GrowSongContext';
import { cn } from '../../lib/utils';

/**
 * Modal-only — no floating button. The trigger lives in Navbar
 * (`GrowSongTrigger`), state is shared via `GrowSongContext`. Mounted
 * globally inside `Layout` so the modal is available from anywhere.
 */
export default function GrowMySongModal() {
  const { isOpen, close } = useGrowSong();
  const [step, setStep] = useState(1);
  const [releaseTitle, setReleaseTitle] = useState('');
  const [goal, setGoal] = useState('Viral Growth');
  const { generateCampaign, isLoading, lastPlan, error } = useAI();
  const { user } = useAuth();

  const handleGenerate = async () => {
    const plan = await generateCampaign(releaseTitle, user?.artistName || 'Artist', goal);
    if (plan) {
      setStep(2);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close()}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-black border border-white/5 p-6 sm:p-10 md:p-12 overflow-y-auto max-h-[90vh] shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8">
                <button 
                  onClick={() => close()}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8 sm:mb-12">
                <div className="w-10 h-10 border border-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase font-mono tracking-tighter text-white">AI Strategy Generator</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">DROPKAST_CORE Engine</span>
                  </div>
                </div>
              </div>

              {step === 1 ? (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono italic">Release Title</label>
                    <input 
                      type="text" 
                      value={releaseTitle}
                      onChange={(e) => setReleaseTitle(e.target.value)}
                      placeholder="ENTER SONG TITLE..." 
                      className="w-full bg-transparent border-b border-white/10 py-5 text-white focus:outline-none focus:border-primary transition-all text-xl font-mono font-black italic placeholder:text-white/5" 
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono italic">Primary Goal</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Viral Growth', 'DJ Support', 'Algorithm Bias', 'Radio Ready'].map((g) => (
                        <button 
                          key={g}
                          onClick={() => setGoal(g)}
                          className={cn(
                            "py-4 px-6 border border-white/5 font-mono font-bold text-[10px] tracking-widest uppercase text-left transition-all",
                            goal === g ? "bg-primary text-white border-primary" : "bg-white/5 text-white/40 hover:bg-white/10"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Error: {error}
                    </div>
                  )}

                  <button 
                    onClick={handleGenerate}
                    disabled={!releaseTitle || isLoading}
                    className="w-full py-6 bg-white text-black font-mono font-black italic uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-4 text-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Market Signal...
                      </>
                    ) : (
                      <>
                        Generate Strategy
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                   <div className="space-y-6">
                      <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono italic">Rollout Plan</h3>
                      <div className="space-y-3">
                        {lastPlan?.rolloutPlan.map((step, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5">
                            <span className="text-primary font-mono font-black text-xs">{i + 1}</span>
                            <span className="text-white/60 text-[11px] font-bold font-sans uppercase italic">{step}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                      <div className="space-y-4">
                        <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono italic">Suggested Influencers</h3>
                        <div className="space-y-2">
                           {lastPlan?.influencers.map((inf, i) => (
                             <div key={i} className="text-[10px] font-mono text-white/80">
                               <div className="font-black italic uppercase text-primary">{inf.name}</div>
                               <div className="text-white/30">{inf.niche} • {inf.reach}</div>
                             </div>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono italic">Suggested DJs</h3>
                        <div className="space-y-2">
                           {lastPlan?.djs.map((dj, i) => (
                             <div key={i} className="text-[10px] font-mono text-white/80">
                               <div className="font-black italic uppercase text-primary">{dj.name}</div>
                               <div className="text-white/30">{dj.city} • {dj.genre}</div>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 border border-white/10 text-white/40 font-mono font-bold text-[10px] tracking-widest uppercase hover:text-white transition-colors"
                      >
                        Refine Parameters
                      </button>
                      <button 
                         onClick={() => close()}
                         className="flex-1 py-4 bg-primary text-white font-mono font-black italic uppercase tracking-[0.2em] text-[10px] hover:bg-primary/80 transition-all"
                      >
                         Launch Campaign
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
