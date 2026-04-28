import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Package, Zap, ExternalLink, Share2, Download, Rocket, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import ScrollReveal from "../components/animations/ScrollReveal";

export default function PromoPacks() {
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const fetchPacks = async () => {
    try {
      const res = await fetch("/api/promo");
      const data = await res.json();
      setPacks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "viral" }),
      });
      const data = await res.json();
      setPacks(prev => [data, ...prev]);
      showNotif("Viral_Pack_Initialized");
    } catch (err) {
      showNotif("Generation_Failure");
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (packId: string) => {
    try {
      const res = await fetch("/api/campaign/from-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      if (res.ok) {
        showNotif("Campaign_Draft_Initialized");
      }
    } catch (err) {
      showNotif("Relay_Failure");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 space-y-12 min-h-screen">
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-[500] bg-primary text-white px-6 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl"
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
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Marketing_Protocol</span>
              <div className="w-8 h-[1px] bg-white/5" />
            </div>
            <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">Promo <span className="text-primary">Packs</span></h1>
            <p className="max-w-xl text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic leading-relaxed">
              Algorithmic asset bundles prepared for viral distribution. Deploy to campaign nodes for maximum market impact.
            </p>
          </div>

          <button 
            onClick={generate}
            disabled={loading}
            className={cn(
              "h-16 px-10 bg-primary text-white font-black uppercase tracking-widest text-[11px] italic flex items-center gap-4 hover:bg-white hover:text-black transition-all active:scale-95 shadow-[0_10px_40px_rgba(255,77,0,0.3)]",
              loading && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Initializing_Payload..." : "Generate_Viral_Pack"}
          </button>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-12">
        {packs.length > 0 ? (
          packs.map((p, idx) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="manifest-card bg-white/[0.02] border-white/5 p-10 relative overflow-hidden group"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] font-mono mb-1">Pack_ID: {p.id}</div>
                      <h2 className="text-xl font-black text-white uppercase italic font-mono tracking-widest">{p.type} Payload Bundle</h2>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest italic">{p.status}</span>
                   <span className="text-[9px] font-mono text-white/20">{new Date(p.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {p.assets.map((a: any, i: number) => (
                  <div key={i} className="manifest-card p-8 border-white/5 bg-black/40 hover:border-primary/40 transition-all flex flex-col justify-between min-h-[220px]">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] font-mono">Asset_Node_{i+1}</span>
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono italic">Type: {a.type}</span>
                        </div>
                        
                        <div className="space-y-4">
                           <p className="text-lg font-black text-white uppercase font-mono italic leading-tight">{a.content.text || a.content.idea}</p>
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-[10px] text-white/30 uppercase tracking-widest italic font-mono">Visual: {a.content.visual}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4 mt-8 border-t border-white/5 pt-6">
                        <button 
                          onClick={() => showNotif("Directive_Copied")}
                          className="flex-1 h-10 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest hover:border-primary hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                           <Share2 className="w-3.5 h-3.5" />
                           Copy_Node
                        </button>
                        <button 
                          onClick={() => showNotif("Syncing_With_Cloud")}
                          className="h-10 w-12 border border-white/10 text-white/20 hover:text-white hover:border-white transition-all flex items-center justify-center rounded-lg"
                        >
                           <Download className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-green-500" />
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Integrity_Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Zap className="w-4 h-4 text-primary" />
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Optimized_For_Viral_Node_Relay</span>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => createCampaign(p.id)}
                   className="h-12 px-8 bg-white text-black font-black uppercase italic tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                 >
                    Launch_Viral_Campaign
                    <Rocket className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="manifest-card h-96 flex flex-col items-center justify-center opacity-20 italic">
             <Package className="w-20 h-20 mb-6" />
             <p className="text-[12px] font-black uppercase tracking-[0.5em] font-mono italic">Relay_Empty: Initialize_Pack_Generation</p>
          </div>
        )}
      </div>
    </div>
  );
}
