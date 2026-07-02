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
        return { color: 'text-green-500', icon: CheckCircle2, label: 'Live' };
      case 'pending':
      case 'processing':
      case 'distributed':
        return { color: 'text-yellow-500', icon: Clock, label: 'On the way' };
      case 'failed':
        return { color: 'text-red-500', icon: AlertCircle, label: 'Needs attention' };
      default:
        return { color: 'text-white/20', icon: Clock, label: 'Not started' };
    }
  };

  if (!release) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
       <Loader2 className="w-8 h-8 text-primary animate-spin" />
       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] font-mono italic">Loading your release...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-mono">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="space-y-4">
           <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-[0.3em] font-mono italic">Live</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Release confirmed</span>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Updated {lastUpdate}</span>
           </div>
           <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-none break-words">{release?.title || 'Release'} <span className="text-primary italic">Status</span></h1>
           <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] font-mono italic">Tracking your release across every store in real time.</p>
        </div>

        <div className="flex flex-wrap gap-4">
           <button className="beam h-14 px-8 border border-white/10 text-white font-black uppercase italic tracking-widest text-[10px] transition-all flex items-center gap-3">
              <Share2 className="w-4 h-4" />
              SmartLink
           </button>
           <button
             onClick={() => navigate(`/analytics/${id}`)}
             className="beam h-14 px-8 bg-white text-black font-black uppercase italic tracking-widest text-[10px] transition-all flex items-center gap-3"
           >
              <BarChart3 className="w-4 h-4" />
              View Stats
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Platform Matrix */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Where Your Music Is Live</h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase font-mono">
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Live</span>
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> On the way</span>
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Needs attention</span>
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
                    className="manifest-card p-6 bg-dark/50 border-white/5 transition-all flex items-center justify-between gap-4 group"
                  >
                     <div className="flex items-center gap-6 min-w-0">
                        <div className={cn(
                          "w-12 h-12 border flex items-center justify-center shrink-0 transition-all",
                          p.status === 'live' ? "border-green-500/20 bg-green-500/5" :
                          p.status === 'pending' || p.status === 'syncing' ? "border-yellow-500/20 bg-yellow-500/5" : "border-red-500/20 bg-red-500/5"
                        )}>
                           <Globe2 className={cn("w-5 h-5 opacity-40", node.color)} />
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-sm font-black text-white uppercase italic tracking-tight font-mono truncate">{p.name}</h4>
                           <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase italic tracking-widest font-mono mt-1", node.color)}>
                              <node.icon className="w-2.5 h-2.5" />
                              {node.label}
                           </div>
                        </div>
                     </div>
                     {p.status === 'live' && (
                       <a href={platformUrl} target="_blank" rel="noreferrer" className="w-10 h-10 shrink-0 border border-white/5 flex items-center justify-center text-white/20 transition-all">
                          <ExternalLink className="w-3 h-3" />
                       </a>
                     )}
                  </motion.div>
                );
              })}
           </div>

            <div 
              onClick={() => navigate('/studio/ugc')}
              className="beam p-8 bg-white/5 border border-white/5 flex items-center justify-between gap-4 group cursor-pointer transition-all font-mono"
            >
              <div className="flex items-center gap-6 min-w-0">
                 <Video className="w-6 h-6 text-primary shrink-0" />
                 <div className="min-w-0">
                    <h5 className="text-[11px] font-black text-white uppercase tracking-widest italic font-mono">Make Videos for TikTok</h5>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest font-mono">Your track is trending on TikTok. Create clips in the Video Studio?</p>
                 </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 transition-all shrink-0" />
           </div>

           {/* Technical Manifest Disclosure */}
           <div className="manifest-card p-10 bg-dark/30 border-white/5 space-y-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Release Details</h3>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 {[
                   { label: "UPC", value: release.upc },
                   { label: "Spotify Profile", value: release.spotify_artist_link, type: 'link' },
                   { label: "Apple Music Profile", value: release.apple_artist_link, type: 'link' },
                   { label: "TikTok ID", value: release.tiktok_stamp },
                   { label: "Lyric Language", value: release.lyric_language },
                   { label: "Master Audio", value: release.final_master_link, type: 'link' },
                   { label: "Artwork", value: release.artwork_link, type: 'link' },
                   { label: "Dolby Atmos", value: release.atmos_link, type: 'link' },
                   { label: "Explicit", value: release.explicit ? "Yes" : "No" },
                   { label: "Producers", value: release.producers },
                   { label: "Writers", value: release.writers },
                   { label: "Publishing Splits", value: release.publishing_splits },
                   { label: "Mixing Engineer", value: release.mixing_engineer },
                   { label: "Mastering Engineer", value: release.mastering_engineer },
                   { label: "Recording Engineer", value: release.recording_engineer },
                   { label: "Artist Origin", value: release.artist_origin },
                   { label: "Publishing Line", value: release.publishing_line },
                   { label: "Copyright Line", value: release.copyright_line },
                 ].map((item, idx) => (
                   item.value && (
                     <div key={idx} className={cn("space-y-1", (item as any).full && "md:col-span-2")}>
                        <label className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] font-mono block italic">{item.label}</label>
                        {item.type === 'link' ? (
                          <a href={item.value} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary italic uppercase transition-all flex items-center gap-2 truncate">
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
              <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform duration-700">
                 <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic font-mono">Grow Your Release</h3>
              <p className="text-xs text-white font-black italic tracking-tight leading-relaxed uppercase">
                Your music is live. Now let's get it heard. Kick off your marketing?
              </p>
              <div className="grid grid-cols-1 gap-3">
                 <button 
                  onClick={() => navigate('/promo')}
                  className="beam h-12 w-full bg-black text-white font-mono font-black italic uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2"
                 >
                    <Package className="w-3.5 h-3.5" />
                    Get Promo Packs
                 </button>
                 <button 
                  onClick={() => navigate('/studio/ugc')}
                  className="beam h-12 w-full bg-white/10 border border-white/20 text-white font-mono font-black italic uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2"
                 >
                    <Video className="w-3.5 h-3.5" />
                    Open Video Studio
                 </button>
              </div>
           </div>

           <div className="manifest-card p-10 bg-dark border-white/5 space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Autopilot</h3>
                 <Cpu className="w-4 h-4 text-primary" />
              </div>
              
              <div className="space-y-6">
                {[
                  { key: 'autoUGC', label: 'Auto-Create Videos', desc: 'Fresh clips made for you on a schedule' },
                  { key: 'autoInfluencers', label: 'Auto-Reach Creators', desc: 'Send to matched creators automatically' },
                  { key: 'autoAds', label: 'Smart Ad Spend', desc: 'Budget placed where it works best' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 group">
                    <div className="min-w-0">
                       <div className="text-[10px] font-black text-white uppercase italic tracking-widest font-mono transition-colors">{item.label}</div>
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
                        "w-12 h-6 rounded-full border p-1 shrink-0 transition-all cursor-pointer",
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
