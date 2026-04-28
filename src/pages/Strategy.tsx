import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Sparkles, 
  Calendar, 
  Instagram, 
  Mail, 
  Video,
  ChevronRight,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { generateMarketingCampaign, AICampaign } from '../services/geminiService';

export default function Strategy() {
  const [songDetails, setSongDetails] = useState('');
  const [campaign, setCampaign] = useState<AICampaign | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!songDetails) return;
    setLoading(true);
    try {
      const data = await generateMarketingCampaign(songDetails);
      setCampaign(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary font-mono">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Promotion_AI</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white uppercase italic font-mono">Campaign Builder</h1>
        </div>
        <div className="text-right font-mono">
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Growth Engine</div>
          <div className="text-xs font-bold text-primary uppercase">Optimized / Online</div>
        </div>
      </header>

      {!campaign ? (
        <div className="manifest-card p-12 flex flex-col items-center gap-8 bg-dark">
          <div className="w-20 h-20 bg-primary/5 border border-primary/20 flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-2xl font-bold uppercase tracking-tight font-mono italic">Start New Campaign</h2>
            <p className="text-sm text-white/40 leading-relaxed font-sans font-medium">
              Tell us about your upcoming song. Our AI team will build a 14-day rollout plan, 
              write your social posts, and find the best hooks to help you go viral.
            </p>
          </div>
          <div className="w-full max-w-lg space-y-6">
            <textarea 
              value={songDetails}
              onChange={(e) => setSongDetails(e.target.value)}
              placeholder="Tell us about the song style, themes, and who you want to reach..."
              className="w-full bg-surface-low border border-white/10 p-6 text-sm font-sans font-medium focus:border-primary outline-none min-h-[150px] custom-scrollbar text-white placeholder:text-white/20"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !songDetails}
              className="primary-button w-full flex items-center justify-center gap-3 disabled:opacity-50 h-14"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ANALYZING_MARKET...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  GENERATE_RELEASE_PLAN
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Rollout Feed */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="text-xl font-bold tracking-widest uppercase font-mono italic">Release Timeline</h3>
              <button 
                onClick={() => setCampaign(null)}
                className="secondary-button px-6 py-2 bg-white/5"
              >
                Start Over
              </button>
            </div>
            
            <div className="space-y-6">
              {campaign.tasks.map((task, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="manifest-card p-0 bg-dark overflow-hidden"
                >
                  <div className="flex min-h-[120px]">
                    <div className="w-20 bg-primary/5 flex flex-col items-center justify-center border-r border-white/5 shrink-0 px-4">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Day</span>
                      <span className="text-3xl font-black text-primary leading-none font-mono italic">{task.day}</span>
                    </div>
                    <div className="flex-1 p-8 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold uppercase text-base tracking-tight font-mono italic text-white">{task.title}</h4>
                        <CheckCircle2 className="w-5 h-5 text-white/10" />
                      </div>
                      <p className="text-sm text-white/40 leading-relaxed font-sans font-medium">
                        {task.description}
                      </p>
                      {task.content && (
                        <div className="mt-6 p-6 bg-surface-low border border-white/5 space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] font-mono">
                            <Sparkles className="w-3" />
                            Suggested Copy
                          </div>
                          <p className="text-sm font-sans font-medium leading-relaxed text-white/70">
                            {task.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Team Sidebar */}
          <div className="space-y-8">
            <h3 className="text-lg font-black tracking-widest uppercase">Asset Protocols</h3>
            
            <div className="manifest-card corner-marker space-y-6">
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Social Hooks</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 flex flex-col gap-2">
                  <span className="text-[8px] font-black text-primary uppercase">TikTok/Reels #1</span>
                  <p className="text-[10px] font-mono">"Wait for the drop at 0:15..."</p>
                </div>
                <div className="p-4 bg-white/5 flex flex-col gap-2">
                  <span className="text-[8px] font-black text-primary uppercase">TikTok/Reels #2</span>
                  <p className="text-[10px] font-mono">"If your summer felt like this track..."</p>
                </div>
              </div>
            </div>

            <div className="manifest-card corner-marker space-y-4">
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Spotify Pitch</span>
              </div>
              <div className="p-4 border border-white/10 font-mono text-[9px] text-white/40 leading-relaxed italic">
                AI generates optimized pitch descriptions for the Spotify for Artists portal.
              </div>
              <button className="primary-button w-full text-[10px]">Generate_Spotify_Pitch</button>
            </div>

            <div className="manifest-card corner-marker space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Curator Outreach</span>
              </div>
              <div className="p-4 border border-white/10 font-mono text-[9px] text-white/40 leading-relaxed italic">
                Professional email templates for playlisters and press.
              </div>
              <button className="primary-button w-full text-[10px]">Create_Curator_Email</button>
            </div>

            <div className="p-6 border border-primary/20 bg-primary/5 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Team Tip</span>
              </div>
              <p className="text-xs font-mono leading-relaxed text-white/70">
                Trending: Afrobeat/Amapiano fusion is peaking in Western Europe. Shift your TikTok target geo to London and Paris nodes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
