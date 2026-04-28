import { ChevronLeft, ChevronRight, Globe2, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

const platformsList = [
  { id: 'spotify', name: 'Spotify Music', logo: 'https://cdn.simpleicons.org/spotify/white' },
  { id: 'apple', name: 'Apple Music', logo: 'https://cdn.simpleicons.org/apple/white' },
  { id: 'tiktok', name: 'TikTok Social', logo: 'https://cdn.simpleicons.org/tiktok/white' },
  { id: 'ytm', name: 'YouTube Music', logo: 'https://cdn.simpleicons.org/youtubemusic/white' },
];

interface StepDistributionProps {
  data: any;
  update: (fields: any) => void;
  next: () => void;
  back: () => void;
}

export default function StepDistribution({ data, update, next, back }: StepDistributionProps) {
  const togglePlatform = (p: string) => {
    const exists = data.platforms.includes(p);
    update({
      platforms: exists
        ? data.platforms.filter((x: string) => x !== p)
        : [...data.platforms, p],
    });
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-mono">Distribution Relay</h2>
        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic">
          Select target deployment nodes and timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
           <div className="space-y-4">
              <label className="text-[11px] font-black text-primary uppercase tracking-[0.4em] font-mono italic flex items-center gap-3">
                 <Calendar className="w-4 h-4" />
                 Release Timeline
              </label>
              <input 
                type="date"
                value={data.releaseDate}
                onChange={(e) => update({ releaseDate: e.target.value })}
                className="w-full bg-dark border border-white/5 p-6 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-primary transition-all text-xs uppercase appearance-none"
              />
           </div>

           <div className="manifest-card p-10 bg-dark border-white/5 space-y-6">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono flex items-center gap-3">
                 <Globe2 className="w-4 h-4" />
                 Global Relay
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed font-sans italic font-medium uppercase tracking-widest leading-relaxed">
                Your release will be delivered to over 150+ countries. High-traffic nodes (US, NG, UK, GH) prioritized for 00:00 local time deployment.
              </p>
           </div>
        </div>

        <div className="space-y-4">
           <label className="text-[11px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Platform Selection</label>
           <div className="grid grid-cols-1 gap-3">
              {platformsList.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                   className={cn(
                    "flex items-center justify-between p-6 border transition-all duration-300 font-mono italic",
                    data.platforms.includes(p.id) 
                      ? "bg-primary/5 border-primary text-white" 
                      : "bg-white/[0.02] border-white/5 text-white/20 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-6">
                     <img src={p.logo} alt="" className={cn("w-6 h-6 object-contain grayscale", data.platforms.includes(p.id) ? "grayscale-0" : "opacity-20")} />
                     <span className="text-sm font-black uppercase tracking-tight">{p.name}</span>
                  </div>
                  <div className={cn(
                    "w-5 h-5 border-2 flex items-center justify-center p-0.5",
                    data.platforms.includes(p.id) ? "border-primary bg-primary" : "border-white/10"
                  )}>
                    {data.platforms.includes(p.id) && <div className="w-full h-full bg-white" />}
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex justify-between pt-12 items-center">
        <button 
          onClick={back}
          className="flex items-center gap-3 text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] font-mono italic"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous_Entry
        </button>
        <button 
          onClick={next}
          disabled={!data.releaseDate || data.platforms.length === 0}
          className="h-16 px-14 bg-white text-black hover:bg-primary hover:text-white font-mono font-black italic tracking-widest uppercase text-xs transition-all active:scale-95 disabled:opacity-20 flex items-center gap-4"
        >
          Final Integrity Check
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
