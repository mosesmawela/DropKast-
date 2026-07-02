import { useState } from "react";
import { User, Music, Zap, Loader2, Sparkles, Upload, Video as VideoIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/utils";

export default function UGCGenerator() {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("lipsync");

  const templates = [
    { id: "lipsync", label: "Lip_Sync_Synth", icon: User, desc: "AI facial mapping to lyrics" },
    { id: "dance", label: "Choreo_Flow", icon: Zap, desc: "AI dance suggestions & beat sync" },
    { id: "meme", label: "Reaction_Meme_Node", desc: "Green screen reaction generator", icon: Sparkles },
  ];

  const generate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 4000));
    setLoading(false);
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={cn(
              "beam p-6 border text-left transition-all relative group",
              template === t.id ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(255,77,0,0.1)]" : "border-white/5 bg-black"
            )}
          >
            <t.icon className={cn("w-5 h-5 mb-4", template === t.id ? "text-primary" : "text-white/20")} />
            <div className="text-[10px] font-black uppercase italic tracking-widest text-white mb-2">{t.label}</div>
            <div className="text-[8px] text-white/30 uppercase tracking-widest leading-relaxed">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Source_Portrait</label>
                 <div className="beam aspect-[4/5] border border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all">
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center transition-transform">
                       <Upload className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] font-black text-white/20 uppercase tracking-widest transition-colors">Upload_Media_Node</div>
                       <div className="text-[8px] text-white/10 uppercase tracking-widest mt-1">MP4 / MOV / JPG</div>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Target_Audio_Segment</label>
                    <div className="manifest-card p-4 flex items-center justify-between border-white/5 bg-black/40">
                       <div className="flex items-center gap-3">
                          <Music className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-bold text-white uppercase font-mono italic">Main_Hook_01 [0:15-0:30]</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Synthesizer_Options</label>
                    <div className="space-y-3">
                       {template === "lipsync" && (
                         <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                            <span className="text-[9px] font-black text-white/40 uppercase italic tracking-widest">Enhanced_Facial_Detail</span>
                            <div className="w-10 h-5 bg-primary/20 border border-primary/50 rounded-full" />
                         </div>
                       )}
                       {template === "dance" && (
                         <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                            <span className="text-[9px] font-black text-white/40 uppercase italic tracking-widest">Style_Matching</span>
                            <select className="bg-transparent text-white text-[9px] font-mono uppercase italic outline-none">
                               <option>AGGRESSIVE</option>
                               <option>FLUID</option>
                               <option>MINIMAL</option>
                            </select>
                         </div>
                       )}
                       <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                          <span className="text-[9px] font-black text-white/40 uppercase italic tracking-widest">Resolution_Upscale</span>
                          <div className="w-10 h-5 bg-white/5 border border-white/10 rounded-full" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <button
             onClick={generate}
             disabled={loading}
             className="beam w-full h-16 bg-primary text-white text-[11px] font-black uppercase italic tracking-widest flex items-center justify-center gap-4 transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(255,77,0,0.2)]"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <VideoIcon className="w-5 h-5" />}
             {loading ? "Synthesizing_Synthetic_Influencer..." : "Initiate_Viral_UGC_Engine"}
           </button>
        </div>

        <div className="w-full lg:w-72 bg-black border border-white/10 p-12 flex flex-col items-center justify-center text-center italic relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
           <User className="w-12 h-12 text-white/5 mb-6 animate-pulse" />
           <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] leading-relaxed">Neural Renderer idling. Input source media and target audio node to visualize UGC generation.</p>

           <div className="absolute inset-0 bg-primary/5 transition-opacity pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
