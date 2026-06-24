import { useState } from "react";
import { Play, Music, Video, Loader2, Sparkles, Wand2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/utils";

export default function VideoGenerator() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("visualizer");
  const [song, setSong] = useState("");

  const modes = [
    { id: "visualizer", label: "Beat_Sync_Visualizer", desc: "Waveform mapped to audio frequencies" },
    { id: "tiktok", label: "Looping_TikTok_Node", desc: "Infinite 9:16 background loop" },
    { id: "story", label: "Story_Canvas", desc: "15s narrative snippet" },
  ];

  const generate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 3000));
    setLoading(false);
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="grid grid-cols-3 gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "p-6 border text-left transition-all relative group",
              mode === m.id ? "border-primary bg-primary/5" : "border-white/5 bg-black"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full mb-4", mode === m.id ? "bg-primary animate-pulse" : "bg-white/10")} />
            <div className="text-[10px] font-black uppercase italic tracking-widest text-white mb-2">{m.label}</div>
            <div className="text-[8px] text-white/30 uppercase tracking-widest leading-relaxed">{m.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-8">
        <div className="flex-1 space-y-6">
           <div className="space-y-4">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Source_Audio_Node</label>
              <div className="manifest-card p-6 flex items-center justify-between border-white/5 bg-black/40">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-primary/20 flex items-center justify-center">
                       <Music className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                       <div className="text-[11px] font-black text-white uppercase italic">{song}</div>
                       <div className="text-[8px] text-white/20 uppercase tracking-widest">WAV // 44.1kHz // STEREO</div>
                    </div>
                 </div>
                 <button className="text-[9px] font-black text-primary hover:text-white transition-colors uppercase italic font-mono tracking-widest">Change_Source</button>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Generation_Parameters</label>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-black border border-white/10 space-y-2">
                    <div className="text-[8px] text-white/20 uppercase tracking-widest">Visual_Vibe</div>
                    <select className="w-full bg-transparent text-white text-[10px] font-mono uppercase italic outline-none">
                       <option>LIQUID_CHROME</option>
                       <option>NEON_GRID</option>
                       <option>ABSTRACT_VOID</option>
                       <option>GLITCH_CORE</option>
                    </select>
                 </div>
                 <div className="p-4 bg-black border border-white/10 space-y-2">
                    <div className="text-[8px] text-white/20 uppercase tracking-widest">Intensity_Gain</div>
                    <input type="range" className="w-full accent-primary" />
                 </div>
              </div>
           </div>

           <button
             onClick={generate}
             disabled={loading}
             className="w-full h-16 bg-primary text-white text-[11px] font-black uppercase italic tracking-widest flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all disabled:opacity-50"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
             {loading ? "Rendering_Motion_Nodes..." : "Synthesize_Video_Asset"}
           </button>
        </div>

        {/* Preview Panel */}
        <div className="w-72 border border-white/10 bg-black relative overflow-hidden flex flex-col">
           <div className="aspect-[9/16] bg-zinc-900 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                 <Play className="w-12 h-12 text-white/10 group-hover:text-primary transition-colors cursor-pointer" />
              </div>
              <div className="absolute bottom-12 left-0 right-0 px-6 space-y-4">
                 <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={loading ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full bg-primary" 
                    />
                 </div>
                 <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-white/20">
                    <span>0:00</span>
                    <span>1:24</span>
                 </div>
              </div>
           </div>
           <div className="p-6 border-t border-white/10 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                 <Wand2 className="w-3 h-3 text-primary" />
                 <span className="text-[9px] font-black text-white italic uppercase tracking-widest">AI_Preview_Node</span>
              </div>
              <div className="text-[8px] text-white/20 uppercase leading-relaxed font-mono">Real-time inference rendering is currently limited to 1080p preview nodes. Final render will be 4K Pro-Res.</div>
           </div>
        </div>
      </div>
    </div>
  );
}
