import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  Hash, 
  ListMusic, 
  Target,
  ArrowUpRight,
  Globe,
  Sparkles,
  Search
} from 'lucide-react';

export default function Growth() {
  const [query, setQuery] = useState('');

  const targetInsights = [
    { label: 'Primary Node', value: 'Berlin, DE', growth: '+12%', sub: 'Techno-Pop Hub' },
    { label: 'Secondary Node', value: 'London, UK', growth: '+8.4%', sub: 'Urban Contemporary' },
    { label: 'Emerging Node', value: 'Lagos, NG', growth: '+25%', sub: 'Afro-Fusion Cluster' },
  ];

  const suggestedPlaylists = [
    { name: 'Techno bunker', listeners: '1.2M', match: 98 },
    { name: 'Industrial minimal', listeners: '450K', match: 92 },
    { name: 'Future sounds', listeners: '2.1M', match: 85 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AUDIENCE_ACCELERATOR</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">GROWTH ENGINE</h1>
        </div>
        <div className="barcode-sim" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Insight Tracker */}
        <div className="lg:col-span-3 space-y-8">
          <div className="manifest-card technical-grid flex items-center gap-6 p-10">
            <div className="flex-1 space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight">AI Audience Targeting</h2>
              <p className="text-sm text-white/40 leading-relaxed font-mono">
                Input your sound inspiration or paste a link. Our engine identifies 
                clusters, hashtags, and playlist nodes.
              </p>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Analyze: 'Dark cinematic techno with ethereal vocals'..."
                  className="w-full bg-black border border-white/10 pl-14 pr-6 py-5 text-sm font-mono focus:border-primary outline-none"
                />
              </div>
            </div>
            <button className="primary-button h-full min-w-[200px]">SEARCH_NODES</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {targetInsights.map((insight, idx) => (
              <div key={idx} className="manifest-card corner-marker space-y-4 group">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{insight.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-black">{insight.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">{insight.sub}</span>
                    <span className="text-[10px] font-black text-green-500 font-mono">{insight.growth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="manifest-card technical-grid overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest">Global Heatmap Distribution</h3>
              </div>
              <span className="text-[8px] font-black text-white/20">REAL_TIME_NODE_FEEDS</span>
            </div>
            <div className="h-[300px] flex items-center justify-center bg-white/[0.01]">
              <div className="text-center space-y-4">
                <Target className="w-8 h-8 text-primary/40 mx-auto" />
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Geo-spatial projection not available in localized node</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <h3 className="text-lg font-black tracking-widest uppercase italic">Accelerator Hub</h3>

          <div className="manifest-card corner-marker space-y-6">
            <div className="flex items-center gap-3">
              <ListMusic className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Playlist Targets</span>
            </div>
            <div className="space-y-2">
              {suggestedPlaylists.map((playlist, idx) => (
                <div key={idx} className="p-4 bg-white/5 flex items-center justify-between border-l-2 border-primary/20">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold">{playlist.name}</div>
                    <div className="text-[8px] text-white/30 font-mono uppercase">{playlist.listeners} listeners</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-primary italic">{playlist.match}%</div>
                    <div className="text-[7px] text-white/20 uppercase font-mono">MATCH</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="secondary-button w-full py-3">PITCH_ALL_CURATORS</button>
          </div>

          <div className="manifest-card corner-marker space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Semantic Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['#techno', '#industrial', '#underground', '#warehouse', '#synthwave'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-white/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-primary space-y-4 shadow-[0_0_30px_rgba(255,77,0,0.2)]">
            <div className="flex items-center gap-2 text-black">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Growth Advice</span>
            </div>
            <p className="text-[11px] font-black leading-tight text-white uppercase italic">
              "You sound like: Anyma meet industrial darkroom. Shift focus to influencers in the 'Futurism' niche for 3x reach."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
