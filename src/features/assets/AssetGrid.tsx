import { Eye, Rocket, Share2, Download, Trash2, X, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AssetGridProps {
  category: string;
  searchQuery?: string;
}

interface Asset {
  id: number | string;
  type: string;
  url: string;
  title: string;
  tag: string;
  format: string;
}

export default function AssetGrid({ category, searchQuery = "" }: AssetGridProps) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    fetch('/api/assets')
      .then((r) => r.json())
      .then((d) => setAssets(Array.isArray(d) ? d : []))
      .catch(() => setAssets([]));
  }, []);

  const [previewId, setPreviewId] = useState<number | string | null>(null);
  const [deployingId, setDeployingId] = useState<number | string | null>(null);
  const [notif, setNotif] = useState<string | null>(null);

  const handleDelete = (id: number | string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    showNotif("Asset_Deleted_From_Relay");
  };

  const handleDeploy = (id: number | string) => {
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
            className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[300] bg-primary text-white px-4 py-3 md:px-6 md:py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl max-w-[90vw]"
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
            className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-6 md:p-12 backdrop-blur-3xl"
            onClick={() => setPreviewId(null)}
          >
             <button className="beam absolute top-6 right-6 md:top-12 md:right-12 w-11 h-11 flex items-center justify-center text-white/40 transition-colors">
                <X className="w-10 h-10" />
             </button>
             <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-8">
                <img 
                  src={assets.find(a => a.id === previewId)?.url} 
                  className="max-h-[80vh] rounded-2xl shadow-[0_0_100px_rgba(255,77,0,0.1)] border border-white/10"
                />
                <div className="text-center space-y-4">
                   <h2 className="text-2xl md:text-4xl font-black italic uppercase italic font-mono text-white tracking-tighter">
                     {assets.find(a => a.id === previewId)?.title}
                   </h2>
                   <div className="flex flex-wrap gap-4 justify-center">
                      <button onClick={(e) => { e.stopPropagation(); showNotif("Download_Initiated"); }} className="beam px-8 h-12 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl">Download_HQ</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeploy(previewId!); }} className="beam px-8 h-12 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">Deploy_To_Campaign</button>
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
            className="manifest-card p-0 overflow-hidden group relative aspect-[3/4] border-white/5 transition-all shadow-2xl"
          >
            <img src={a.url} className="w-full h-full object-cover transition-transform duration-1000" />
            
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
              className="beam absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 transition-all flex flex-col justify-between p-6 md:p-8 backdrop-blur-md duration-500">
              <div className="flex justify-between items-start">
                 <span className="text-[10px] font-black italic uppercase tracking-widest text-primary border-b border-primary/20 pb-1">{a.type}</span>
                 <div className="flex gap-2">
                    <button onClick={() => showNotif("Link_Copied_To_Clipboard")} className="beam w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 transition-all">
                      <Share2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => showNotif("Download_Starting...")} className="beam w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 transition-all">
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
                    <button onClick={() => setPreviewId(a.id)} className="beam h-10 bg-white text-black text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl">
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button onClick={() => handleDeploy(a.id)} className="beam h-10 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl">
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
