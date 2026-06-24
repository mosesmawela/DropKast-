import { useState } from "react";
import { Sparkles, Loader2, Send, Download, Check } from "lucide-react";
import { motion } from "motion/react";

export default function CoverGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSelected(null);
    setError(null);
    setImages([]);

    try {
      const res = await fetch("/api/assets/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.status === 503) {
        setError("Image generation isn't configured yet. Add an image provider key to enable cover synthesis.");
        return;
      }
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      // Accept a few response shapes defensively.
      const urls: string[] =
        data.images || data.urls || (data.url ? [data.url] : []) || [];
      if (urls.length === 0) throw new Error("No images returned.");
      setImages(urls);
    } catch (err) {
      console.error(err);
      setError("Cover generation failed. Check your image-model connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Promp_Script_Matrix</label>
        <div className="relative">
          <textarea
            placeholder="High-fidelity 3D render of a liquid chrome sculpture in deep space, hyper-maximalist, neon orange highlights, 8k resolution..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-black border border-white/10 p-6 text-[11px] font-mono tracking-widest text-white outline-none focus:border-primary transition-all uppercase placeholder:opacity-20 resize-none"
          />
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="absolute bottom-4 right-4 h-12 px-8 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest flex items-center gap-3 hover:bg-white hover:text-black transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Synthesizing..." : "Run_Inference"}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] font-mono italic">Output_Results</h3>
           {images.length > 0 && <span className="text-[9px] text-primary font-mono font-bold uppercase">{images.length} Nodes Found</span>}
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {images.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(i)}
                className={`relative aspect-square border overflow-hidden cursor-pointer group transition-all duration-500 ${selected === i ? 'border-primary' : 'border-white/5 hover:border-white/20'}`}
              >
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {selected === i && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary text-white flex items-center justify-center shadow-2xl">
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <div className="flex-1 border border-dashed border-red-500/20 bg-red-500/[0.02] flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-full bg-red-500/[0.05] flex items-center justify-center mb-6">
               <Send className="w-6 h-6 text-red-400/40" />
            </div>
            <p className="text-[10px] font-black text-red-400/70 uppercase tracking-[0.3em] font-mono leading-relaxed italic max-w-sm">{error}</p>
          </div>
        ) : (
          <div className="flex-1 border border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
               <Send className="w-6 h-6 text-white/10" />
            </div>
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] font-mono leading-relaxed italic">Awaiting prompt parameters to initiate visual synthesis...</p>
          </div>
        )}

        {selected !== null && (
          <div className="flex gap-4 pt-6">
            <button className="flex-1 h-12 bg-white text-black text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all shadow-2xl">
              <Download className="w-4 h-4" />
              Store_Local
            </button>
            <button className="flex-1 h-12 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all shadow-2xl">
              <Check className="w-4 h-4" />
              Use_Primary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
