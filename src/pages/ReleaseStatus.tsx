import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe2, 
  ExternalLink, 
  Share2, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Video,
  Sparkles,
  Package,
  Cpu
} from "lucide-react";
import { cn } from "../lib/utils";
import { useReleases } from "../context/ReleaseContext";

const platforms = [
  { id: 'spotify', name: "Spotify Music", status: "live", url: "https://spotify.com" },
  { id: 'apple', name: "Apple Music", status: "pending", url: "#" },
  { id: 'tiktok', name: "TikTok Social", status: "failed", url: "#" },
  { id: 'youtube', name: "YouTube Music", status: "live", url: "https://youtube.com" },
  { id: 'instagram', name: "Instagram Audio", status: "live", url: "#" },
  { id: 'amazon', name: "Amazon Music", status: "pending", url: "#" },
];

export default function ReleaseStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [automation, setAutomation] = useState<any>({ autoUGC: false, autoInfluencers: false, autoAds: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/releases/${id}`);
        const data = await res.json();
        setRelease(data);
        setLastUpdate(new Date().toLocaleTimeString());

        const autoRes = await fetch(`/api/automation/${id}`);
        const autoData = await autoRes.json();
        setAutomation(autoData);
      } catch (err) {
        console.error('Failed to fetch node status:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const getStatusNode = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return { color: 'text-green-500', icon: CheckCircle2, label: 'LIVE' };
      case 'pending':
      case 'processing':
      case 'distributed':
        return { color: 'text-yellow-500', icon: Clock, label: 'SYNCING' };
      case 'failed':
        return { color: 'text-red-500', icon: AlertCircle, label: 'FAILED' };
      default:
        return { color: 'text-white/20', icon: Clock, label: 'OFFLINE' };
    }
  };

  if (!release) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
       <Loader2 className="w-8 h-8 text-primary animate-spin" />
       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] font-mono italic">Locating Master Node...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-mono">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-[0.3em] font-mono italic">Node_Status: ACTIVE</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Transmission_Confirmed</span>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Last_Sync: {lastUpdate}</span>
           </div>
           <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-none">{release?.title || 'Release'} <span className="text-primary italic">Status</span></h1>
           <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] font-mono italic">Monitoring deployment clusters in real-time.</p>
        </div>

        <div className="flex gap-4">
           <button className="h-14 px-8 border border-white/10 hover:border-white text-white font-black uppercase italic tracking-widest text-[10px] transition-all flex items-center gap-3">
              <Share2 className="w-4 h-4" />
              SmartLink
           </button>
           <button 
             onClick={() => navigate(`/analytics/${id}`)}
             className="h-14 px-8 bg-white text-black hover:bg-primary hover:text-white font-black uppercase italic tracking-widest text-[10px] transition-all flex items-center gap-3"
           >
              <BarChart3 className="w-4 h-4" />
              Deep Stats
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Platform Matrix */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Platform Relay Monitoring</h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase font-mono">
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> LIVE</span>
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> SYNCING</span>
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> ERROR</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {release.platforms.map((p: any, idx: number) => {
                const node = getStatusNode(p.status);
                const platformUrl = p.id === 'spotify' ? 'https://spotify.com' : p.id === 'youtube' ? 'https://youtube.com' : '#';
                return (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="manifest-card p-6 bg-dark/50 border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                  >
                     <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 border flex items-center justify-center transition-all",
                          p.status === 'live' ? "border-green-500/20 bg-green-500/5" : 
                          p.status === 'pending' || p.status === 'syncing' ? "border-yellow-500/20 bg-yellow-500/5" : "border-red-500/20 bg-red-500/5"
                        )}>
                           <Globe2 className={cn("w-5 h-5 opacity-40", node.color)} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-white uppercase italic tracking-tight font-mono">{p.name}</h4>
                           <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase italic tracking-widest font-mono mt-1", node.color)}>
                              <node.icon className="w-2.5 h-2.5" />
                              {node.label}
                           </div>
                        </div>
                     </div>
                     {p.status === 'live' && (
                       <a href={platformUrl} target="_blank" rel="noreferrer" className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:border-white transition-all">
                          <ExternalLink className="w-3 h-3" />
                       </a>
                     )}
                  </motion.div>
                );
              })}
           </div>

            <div 
              onClick={() => navigate('/studio/ugc')}
              className="p-8 bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.07] hover:border-primary/30 transition-all font-mono"
            >
              <div className="flex items-center gap-6">
                 <Video className="w-6 h-6 text-primary" />
                 <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-widest italic font-mono">UGC_Studio_Optimization</h5>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest font-mono">AI detects high algorithmic resonance on TikTok. Initialize UGC Studio?</p>
                 </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
           </div>

           {/* Technical Manifest Disclosure */}
           <div className="manifest-card p-10 bg-dark/30 border-white/5 space-y-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Technical_Manifest_Relay</h3>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 {[
                   { label: "UPC_Index", value: release.upc },
                   { label: "Spotify_Relay", value: release.spotify_artist_link, type: 'link' },
                   { label: "Apple_Relay", value: release.apple_artist_link, type: 'link' },
                   { label: "TikTok_Stamp", value: release.tiktok_stamp },
                   { label: "Lyric_Language", value: release.lyric_language },
                   { label: "Master_Payload", value: release.final_master_link, type: 'link' },
                   { label: "Artwork_Payload", value: release.artwork_link, type: 'link' },
                   { label: "Atmos_Payload", value: release.atmos_link, type: 'link' },
                   { label: "Explicit_Flag", value: release.explicit ? "YES" : "NO" },
                   { label: "Producers", value: release.producers },
                   { label: "Writers", value: release.writers },
                   { label: "Splits_Ratio", value: release.publishing_splits },
                   { label: "Mixing_Node", value: release.mixing_engineer },
                   { label: "Mastering_Node", value: release.mastering_engineer },
                   { label: "Recording_Node", value: release.recording_engineer },
                   { label: "Origin_Node", value: release.artist_origin },
                   { label: "Publishing_Line", value: release.publishing_line },
                   { label: "Copyright_Line", value: release.copyright_line },
                 ].map((item, idx) => (
                   item.value && (
                     <div key={idx} className={cn("space-y-1", (item as any).full && "md:col-span-2")}>
                        <label className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] font-mono block italic">{item.label}</label>
                        {item.type === 'link' ? (
                          <a href={item.value} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary italic uppercase hover:text-white transition-all flex items-center gap-2 truncate">
                            {item.value}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <div className={cn("text-[10px] font-black text-white uppercase italic font-mono tracking-tight", (item as any).full && "normal-case font-sans italic text-white/60 leading-relaxed")}>
                            {item.value}
                          </div>
                        )}
                     </div>
                   )
                 ))}
              </div>
           </div>
        </div>

        {/* Intelligence Layer */}
        <div className="space-y-8">
           <div className="manifest-card p-10 bg-primary border-primary space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                 <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic font-mono">Viral Growth Node</h3>
              <p className="text-xs text-white font-black italic tracking-tight leading-relaxed uppercase">
                Phase 1 complete. High-probability viral clusters detected. Execute viral marketing protocol?
              </p>
              <div className="grid grid-cols-1 gap-3">
                 <button 
                  onClick={() => navigate('/promo')}
                  className="h-12 w-full bg-black text-white font-mono font-black italic uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                 >
                    <Package className="w-3.5 h-3.5" />
                    Deploy Promo Packs
                 </button>
                 <button 
                  onClick={() => navigate('/studio/ugc')}
                  className="h-12 w-full bg-white/10 border border-white/20 text-white font-mono font-black italic uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                 >
                    <Video className="w-3.5 h-3.5" />
                    Launch UGC Studio
                 </button>
              </div>
           </div>

           <div className="manifest-card p-10 bg-dark border-white/5 space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Autopilot_Automation</h3>
                 <Cpu className="w-4 h-4 text-primary" />
              </div>
              
              <div className="space-y-6">
                {[
                  { key: 'autoUGC', label: 'Auto_UGC_Generation', desc: 'Sync-cycle content generation' },
                  { key: 'autoInfluencers', label: 'Influencer_Auto_Relay', desc: 'Auto-dispatch to matched nodes' },
                  { key: 'autoAds', label: 'Strategic_Ad_Buy', desc: 'Budget allocation optimization' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between group">
                    <div>
                       <div className="text-[10px] font-black text-white uppercase italic tracking-widest font-mono group-hover:text-primary transition-colors">{item.label}</div>
                       <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest font-mono">{item.desc}</div>
                    </div>
                    <div 
                      onClick={async () => {
                        const nextSettings = { ...automation, [item.key]: !automation[item.key] };
                        setAutomation(nextSettings);
                        await fetch('/api/automation', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ releaseId: id, ...nextSettings })
                        });
                      }}
                      className={cn(
                        "w-12 h-6 rounded-full border p-1 transition-all cursor-pointer",
                        automation[item.key] ? "bg-primary border-primary" : "bg-white/5 border-white/10"
                      )}
                    >
                       <div className={cn(
                         "w-4 h-4 rounded-full bg-white transition-all shadow-lg",
                         automation[item.key] ? "translate-x-6" : "translate-x-0"
                       )} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
