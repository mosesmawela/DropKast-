import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Video, Music, Smile, Zap, Rocket, ChevronRight, Copy, CheckCircle2, Terminal } from "lucide-react";
import { cn } from "../lib/utils";
import ScrollReveal from "../components/animations/ScrollReveal";

export default function UGCStudio() {
  const [type, setType] = useState("lipsync");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notif, setNotif] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const types = [
    { id: "lipsync", label: "Lip Sync", icon: Music, directive: "Vocal_Frequency_Match" },
    { id: "dance", label: "Dance Hub", icon: Video, directive: "Kinetic_Sync_Protocol" },
    { id: "funny", label: "Comedy / POV", icon: Smile, directive: "Narrative_Node_Inversion" },
  ];

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ugc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setResult(data);
      showNotif("Generation_Job_Initialized");
      
      // Start polling
      pollStatus(data.id);
    } catch (err) {
      showNotif("Relay_Failure");
      setLoading(false);
    }
  };

  const pollStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ugc/${id}`);
        const data = await res.json();
        setResult(data);
        if (data.status === 'done') {
          clearInterval(interval);
          setLoading(false);
          showNotif("Viral_Payload_Ready");
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 space-y-12 min-h-screen">
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-12 right-12 z-[500] bg-primary text-white px-6 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4" />
            {notif}
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollReveal>
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4 font-mono italic">
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Content_Factory</span>
              <div className="w-8 h-[1px] bg-white/5" />
            </div>
            <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">UGC <span className="text-primary">Studio</span></h1>
            <p className="max-w-xl text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic leading-relaxed">
              Neural scripting engine for authentic user-generated content directives. Bridge the gap between tracks and community trends.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Control Panel */}
        <div className="lg:col-span-5 space-y-8">
           <div className="manifest-card p-10 bg-white/[0.02] border-white/5 space-y-10">
              <div className="space-y-6">
                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] font-mono italic">Directive_Type</label>
                 <div className="space-y-4">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={cn(
                          "w-full p-6 flex items-center justify-between border transition-all group",
                          type === t.id 
                            ? "bg-primary border-primary text-white shadow-[0_0_30px_rgba(255,77,0,0.2)]" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
                        )}
                      >
                         <div className="flex items-center gap-4">
                            <t.icon className={cn("w-6 h-6", type === t.id ? "text-white" : "text-white/20 group-hover:text-primary transition-colors")} />
                            <div className="text-left">
                               <div className="text-[11px] font-black uppercase tracking-widest">{t.label}</div>
                               <div className={cn("text-[8px] font-mono uppercase tracking-widest mt-1", type === t.id ? "text-white/60" : "text-white/10")}>{t.directive}</div>
                            </div>
                         </div>
                         <ChevronRight className={cn("w-4 h-4 transition-transform", type === t.id && "translate-x-1")} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <button 
                  onClick={generate}
                  disabled={loading}
                  className={cn(
                    "w-full h-20 bg-white text-black font-black uppercase tracking-[0.2em] text-[12px] italic flex items-center justify-center gap-4 hover:bg-primary hover:text-white transition-all active:scale-95 shadow-[0_10px_50px_rgba(255,77,0,0.1)]",
                    loading && "opacity-50 grayscale cursor-not-allowed"
                  )}
                 >
                    {loading ? <Zap className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                    {loading ? "Computing_Nodes..." : "Synthesize_Viral_Directive"}
                 </button>
              </div>
           </div>

           <div className="bg-primary/5 border border-primary/20 p-8 rounded-[30px] italic">
              <div className="flex items-center gap-3 mb-3 text-primary">
                 <Sparkles className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Optimized_For_TikTok</span>
              </div>
              <p className="text-[10px] text-primary/60 leading-relaxed font-mono uppercase tracking-widest">
                Our neural engine analyzes top-charting sync formats and current meme-cycle harmonics to produce high-conversion directives.
              </p>
           </div>
        </div>

        {/* Output Console */}
        <div className="lg:col-span-7 h-full">
           <div className="manifest-card h-full min-h-[600px] bg-dark/30 border-white/5 relative overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">UGC_Inference_Relay</span>
                 </div>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/40" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                    <div className="w-2 h-2 rounded-full bg-green-500/40" />
                 </div>
              </div>

              <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                 <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                      >
                         <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto shadow-[0_0_40px_rgba(255,77,0,0.2)]" />
                         <div className="text-[11px] font-black uppercase tracking-[0.5em] font-mono text-primary animate-pulse italic">
                           {result?.status === 'processing' ? 'Synthesizing_Pixels...' : 'Awaiting_Neural_Compute...'}
                         </div>
                      </motion.div>
                    ) : result?.status === 'done' ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-8"
                      >
                         <div className="aspect-video w-full max-w-2xl mx-auto bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <video 
                              src={result.url} 
                              controls 
                              autoPlay 
                              loop 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20 mix-blend-overlay" />
                         </div>

                         <div className="space-y-4">
                            <span className="px-6 py-2 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest italic rounded-full inline-block">Asset_Verified</span>
                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                               <button 
                                onClick={() => showNotif("Protocol_Stored")}
                                className="h-12 bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest hover:border-primary hover:text-white transition-all flex items-center justify-center gap-2"
                               >
                                  <Copy className="w-4 h-4" />
                                  Copy_Asset_URI
                               </button>
                               <button 
                                className="h-12 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                               >
                                  <Rocket className="w-4 h-4" />
                                  Deploy_to_Social
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        className="space-y-8 italic"
                      >
                         <Terminal className="w-20 h-20 text-white/20 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] font-mono text-white/40">Relay_Idle: Awaiting_Data_Input</p>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              {/* Console Background Accents */}
              <div className="absolute bottom-0 right-0 p-8 opacity-5">
                 <Terminal className="w-64 h-64 text-white" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
