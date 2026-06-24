import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Rocket, X, Send, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import ModelPicker from "../../components/ModelPicker";
import { RECOMMENDATIONS } from "../../lib/ai-recommendations";
import { useCampaigns } from "../../context/CampaignContext";
import { useReleases } from "../../context/ReleaseContext";

interface ViralIdeaGeneratorProps {
  onClose: () => void;
}

interface ViralIdea {
  type: string;
  title: string;
  script: string;
  caption: string;
  visual: string;
}

export default function ViralIdeaGenerator({ onClose }: ViralIdeaGeneratorProps) {
  const { campaigns } = useCampaigns();
  const { releases } = useReleases();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ViralIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState("VIRALITY");
  // Default the context to the first real campaign, else the first release title.
  const contextOptions = campaigns.length > 0
    ? campaigns.map((c) => c.title)
    : releases.map((r) => r.title);
  const [campaign, setCampaign] = useState<string>(contextOptions[0] || "");
  const [notif, setNotif] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const generateIdeas = async () => {
    setLoading(true);
    setIdeas([]);
    setError(null);

    const subject = campaign || "my upcoming release";
    const prompt = `You are a viral music-marketing strategist. Generate exactly 3 social content ideas for "${subject}" optimized for ${focus.toLowerCase()}. Return ONLY a JSON array, no prose, where each object has keys: "type" (platform/format like "TikTok Challenge"), "title" (short punchy name), "script" (the concept in 1-2 sentences), "caption" (ready-to-post caption with hashtags), "visual" (visual direction in one line). Output strictly the JSON array.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      if (res.status === 503) {
        setError('AI is not configured yet. Add an API key in AI Models to enable idea generation.');
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      // Accumulate the SSE text stream into one buffer, then parse JSON.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const payload = trimmed.slice(5).trim();
            if (payload && payload !== '[DONE]') {
              try {
                const parsed = JSON.parse(payload);
                raw += parsed.text ?? parsed.delta ?? parsed.content ?? '';
              } catch {
                raw += payload;
              }
            }
          }
        }
      }

      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Could not parse ideas from response.');
      const parsed: ViralIdea[] = JSON.parse(match[0]);
      setIdeas(parsed);
    } catch (err) {
      console.error(err);
      setError('Idea generation failed. Check your AI model connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-[300] bg-primary text-white px-6 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {notif}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="manifest-card w-full max-w-5xl bg-dark border-primary/20 p-0 relative overflow-hidden shadow-[0_0_100px_rgba(255,77,0,0.2)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 h-[750px]">
          {/* Sidebar */}
          <div className="md:col-span-4 border-r border-white/5 p-10 space-y-10 bg-black/40">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 border border-primary flex items-center justify-center bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h2 className="text-2xl font-black italic uppercase font-mono tracking-tighter text-white">Viral_Engine</h2>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-[0.3em] font-mono">Growth Protocol Alpha</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Context_Source</label>
                  {contextOptions.length > 0 ? (
                    <select
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      className="w-full h-12 bg-white/5 border border-white/10 px-4 text-[10px] font-mono uppercase italic text-white outline-none focus:border-primary transition-colors"
                    >
                      {contextOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      placeholder="Release or campaign name"
                      className="w-full h-12 bg-white/5 border border-white/10 px-4 text-[10px] font-mono uppercase italic text-white outline-none focus:border-primary transition-colors placeholder:text-white/20"
                    />
                  )}
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Growth_Focus</label>
                  <div className="grid grid-cols-2 gap-3">
                     {["AWARENESS", "ENGAGEMENT", "CONVERSION", "VIRALITY"].map(f => (
                       <button 
                        key={f} 
                        onClick={() => setFocus(f)}
                        className={cn(
                          "h-10 border text-[9px] font-black uppercase tracking-widest transition-all",
                          focus === f 
                            ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(255,77,0,0.3)]" 
                            : "bg-black border-white/10 text-white/40 hover:border-white/30"
                        )}
                       >
                          {f}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40 italic">AI model</span>
              <ModelPicker recommendation={RECOMMENDATIONS['viral-ideas']} variant="full" />
            </div>

            <button
              onClick={generateIdeas}
              disabled={loading}
              className="w-full h-16 bg-primary text-white text-[11px] font-black uppercase italic tracking-widest flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(255,77,0,0.2)]"
            >
              {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
              {loading ? "Analyzing_Market_Trends..." : "Generate_Viral_Payload"}
            </button>

            <div className="pt-8 border-t border-white/5 italic">
               <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                 Neural engine processing current chart velocity and meme-cycle harmonics. <br/><br/>
                 Relay: <span className="text-white/40">Secure_Inference</span>
               </p>
            </div>
          </div>

          {/* Results Area */}
          <div className="md:col-span-8 flex flex-col">
             <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] font-mono italic">Script_Nodes_Synthesized</span>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center space-y-8 opacity-40 italic"
                    >
                       <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] font-mono animate-pulse">Computing_Probabilities...</p>
                    </motion.div>
                  ) : ideas.length > 0 ? (
                    ideas.map((idea, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="manifest-card p-8 border-white/5 bg-black/40 hover:border-primary/40 transition-all group relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-4 h-4 text-primary" />
                         </div>

                         <div className="flex justify-between items-start mb-8">
                            <div>
                               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-mono mb-2 block">{idea.type}</span>
                               <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter font-mono">{idea.title}</h3>
                            </div>
                            <button 
                              onClick={() => showNotif("Directive_Assigned_To_Nodes")}
                              className="h-12 w-12 border border-white/10 flex items-center justify-center text-white/20 hover:text-primary hover:border-primary transition-all rounded-full"
                            >
                               <Rocket className="w-5 h-5" />
                            </button>
                         </div>

                         <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                               <div className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono border-b border-white/5 pb-2">Directive_Script</div>
                               <p className="text-xs text-white/60 leading-relaxed font-sans italic">{idea.script}</p>
                            </div>
                            <div className="space-y-4">
                               <div className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono border-b border-white/5 pb-2">Visual_Direction</div>
                               <p className="text-xs text-white/60 leading-relaxed font-sans italic">{idea.visual}</p>
                            </div>
                         </div>

                         <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/5 group-hover:border-primary/20 transition-all">
                               <MessageSquare className="w-3 h-3 text-white/20" />
                               <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest group-hover:text-white/60 transition-colors">{idea.caption}</span>
                            </div>
                            <button 
                              onClick={() => showNotif("Directive_Payload_Copied")}
                              className="text-[9px] text-primary font-black uppercase italic tracking-widest hover:text-white transition-colors border-b border-primary/20"
                            >
                              Copy_Directive
                            </button>
                         </div>
                      </motion.div>
                    ))
                  ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-center italic space-y-6">
                       <X className="w-16 h-16 text-red-400/40" />
                       <div className="max-w-xs">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] font-mono text-red-400 mb-2">Generation_Failed</p>
                          <p className="text-[10px] uppercase font-mono tracking-widest text-white/40">{error}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic space-y-6">
                       <Send className="w-16 h-16 text-white" />
                       <div className="max-w-xs">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] font-mono text-white mb-2">Engines_Idling</p>
                          <p className="text-[10px] uppercase font-mono tracking-widest">Pick a release or campaign and generate a viral payload to initiate growth protocols.</p>
                       </div>
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
