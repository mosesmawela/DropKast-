import { Eye, Rocket, MoreHorizontal, Share2, Download, Trash2, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface AssetGridProps {
  category: string;
  searchQuery?: string;
}

export default function AssetGrid({ category, searchQuery = "" }: AssetGridProps) {
  const [assets, setAssets] = useState([
    { id: 1, type: "cover", url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800", title: "NIGHT_DRIVE_EXT", tag: "Cover Art", format: "HQ 4K" },
    { id: 2, type: "cover", url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", title: "NEBULA_SYNC_04", tag: "Cover Art", format: "HQ 4K" },
    { id: 3, type: "video", url: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800", title: "LIQUID_GRID_MOTION", tag: "TikTok Ready", format: "9:16" },
    { id: 4, type: "ugc", url: "https://images.unsplash.com/photo-1514525253361-bee8718a3ec0?auto=format&fit=crop&q=80&w=800", title: "FESTIVAL_REACTION", tag: "UGC Viral", format: "9:16" },
    { id: 5, type: "video", url: "https://images.unsplash.com/photo-1623512351684-183422032482?auto=format&fit=crop&q=80&w=800", title: "CHROME_WAVE_VIS", tag: "Visualizer", format: "16:9" },
    { id: 6, type: "ugc", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800", title: "LIP_SYNC_BURN", tag: "Lip Sync", format: "9:16" },
  ]);

  const [previewId, setPreviewId] = useState<number | null>(null);
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [notif, setNotif] = useState<string | null>(null);

  const handleDelete = (id: number) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    showNotif("Asset_Deleted_From_Relay");
  };

  const handleDeploy = (id: number) => {
    setDeployingId(id);
    setTimeout(() => {
      setDeployingId(null);
      showNotif("Successfully_Deployed_To_Nodes");
    }, 2000);
  };

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const filteredAssets = assets
    .filter(a => category === "All" || a.type.toLowerCase() === category.toLowerCase().slice(0, -1) || (category === "Templates" && ["video", "ugc"].includes(a.type)))
    .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.tag.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative">
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-[300] bg-primary text-white px-6 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4" />
            {notif}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewId && assets.find(a => a.id === previewId) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-12 backdrop-blur-3xl"
            onClick={() => setPreviewId(null)}
          >
             <button className="absolute top-12 right-12 text-white/40 hover:text-white transition-colors">
                <X className="w-10 h-10" />
             </button>
             <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-8">
                <img 
                  src={assets.find(a => a.id === previewId)?.url} 
                  className="max-h-[80vh] rounded-2xl shadow-[0_0_100px_rgba(255,77,0,0.1)] border border-white/10"
                />
                <div className="text-center space-y-4">
                   <h2 className="text-4xl font-black italic uppercase italic font-mono text-white tracking-tighter">
                     {assets.find(a => a.id === previewId)?.title}
                   </h2>
                   <div className="flex gap-4 justify-center">
                      <button onClick={(e) => { e.stopPropagation(); showNotif("Download_Initiated"); }} className="px-8 h-12 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl">Download_HQ</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeploy(previewId!); }} className="px-8 h-12 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:border-primary hover:text-primary transition-all">Deploy_To_Campaign</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAssets.length > 0 ? filteredAssets.map((a) => (
          <div
            key={a.id}
            className="manifest-card p-0 overflow-hidden group relative aspect-[3/4] border-white/5 hover:border-primary/20 transition-all shadow-2xl"
          >
            <img src={a.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            
            {deployingId === a.id && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center space-y-4">
                 <Rocket className="w-12 h-12 text-white animate-bounce" />
                 <div className="text-[10px] font-black italic text-white uppercase tracking-[0.4em] font-mono animate-pulse">DEPLOYING_PAYLOAD...</div>
              </div>
            )}

            {/* Tags */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
               <div className="bg-primary px-3 py-1 text-[8px] font-black italic uppercase tracking-widest text-white shadow-xl">
                 {a.tag}
               </div>
               <div className="bg-black/60 backdrop-blur-md px-3 py-1 text-[8px] font-black italic uppercase tracking-widest text-white/60 border border-white/10">
                 {a.format}
               </div>
            </div>

            <button 
              onClick={() => handleDelete(a.id)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-8 backdrop-blur-md translate-y-4 group-hover:translate-y-0 duration-500">
              <div className="flex justify-between items-start">
                 <span className="text-[10px] font-black italic uppercase tracking-widest text-primary border-b border-primary/20 pb-1">{a.type}</span>
                 <div className="flex gap-2">
                    <button onClick={() => showNotif("Link_Copied_To_Clipboard")} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all">
                      <Share2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => showNotif("Download_Starting...")} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all">
                      <Download className="w-3 h-3" />
                    </button>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                   <h3 className="text-xl font-black italic uppercase leading-tight font-mono text-white">{a.title}</h3>
                   <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-mono">Sync_Node: Active_Campaign_04</div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPreviewId(a.id)} className="h-10 bg-white text-black text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xl">
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button onClick={() => handleDeploy(a.id)} className="h-10 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all shadow-xl">
                      <Rocket className="w-3 h-3" />
                      Deploy
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20 italic">
             <Rocket className="w-16 h-16 mb-4" />
             <p className="text-[10px] uppercase font-mono tracking-[0.4em] font-black">Empty_Grid_Relay</p>
          </div>
        )}
      </div>
    </div>
  );
}
