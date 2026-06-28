import { useState } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Zap,
  BarChart2,
  ArrowUpRight,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { useCampaigns } from '../context/CampaignContext';
import { useNotify } from '../context/NotificationContext';

export default function Campaigns() {
  const { campaigns, deleteCampaign } = useCampaigns();
  const { notify } = useNotify();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = campaigns.filter(camp => {
    const matchesFilter = filter === 'ALL' || camp.status === filter;
    const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase()) || camp.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to terminate campaign "${title}"?`)) {
      deleteCampaign(id);
      notify('error', 'Campaign deleted', `Campaign ${id} has been removed.`);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Target className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Campaigns</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Campaigns</h1>
          </div>
          <div className="flex items-center gap-4">
            <AnimatedBeam containerClassName="w-fit">
              <Link 
                to="/campaigns/new"
                className="primary-button h-14 flex items-center gap-3 px-10"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'ACTIVE').length.toString().padStart(2, '0'), icon: Zap, color: 'text-primary' },
          { label: 'Total Reach', value: '—', icon: Users, color: 'text-white' },
          { label: 'Avg Engagement', value: '—', icon: TrendingUp, color: 'text-white' },
          { label: 'Market ROI', value: '—', icon: BarChart2, color: 'text-primary' },
        ].map((stat, i) => (
          <ScrollReveal key={i} delay={i * 0.1} direction="up">
            <div className="manifest-card p-8 space-y-4 group">
              <div className="flex items-center gap-3 font-mono opacity-40">
                <stat.icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest italic">{stat.label}</span>
              </div>
              <div className={cn("text-4xl font-black italic font-mono tracking-tighter", stat.color)}>{stat.value}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="manifest-card !p-0 !bg-white/5 border border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black border border-white/10 pl-12 pr-6 py-3 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all w-64 uppercase"
            />
          </div>
          <div className="flex items-center bg-black border border-white/10 p-1">
            {['ALL', 'ACTIVE', 'SCHEDULED', 'COMPLETED'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold tracking-widest font-mono transition-all",
                  filter === f ? "bg-primary text-white" : "text-white/30 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-white/40 hover:text-primary transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Create campaign
        </button>
      </div>
    </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
            <Target className="w-12 h-12 text-white/5 mx-auto mb-6" />
            <h3 className="text-xl font-bold font-mono uppercase italic text-white/20">No matching campaigns</h3>
            <p className="text-xs text-white/10 mt-2 font-mono uppercase tracking-widest">Adjust filters or create a new campaign</p>
          </div>
        ) : (
          filteredCampaigns.map((camp, i) => (
            <ScrollReveal key={camp.id} delay={i * 0.1} direction="up">
              <div className="manifest-card p-8 group relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-primary transition-colors" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-white/20 font-mono tracking-widest">{camp.id}</span>
                        <div className={cn(
                          "px-3 py-1 text-[9px] font-black tracking-widest font-mono uppercase border",
                          camp.status === 'ACTIVE' ? 'border-primary text-primary bg-primary/5' : 'border-white/10 text-white/30'
                        )}>
                          {camp.status}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(camp.id, camp.title)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-2xl font-black text-white italic font-mono uppercase tracking-tight group-hover:text-primary transition-colors">
                      {camp.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {camp.channels.map(ch => (
                        <span key={ch} className="px-3 py-1 bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 font-mono uppercase italic tracking-widest">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-4">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono italic">AI Progress Report</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold font-mono italic">
                        <span className="text-white/40 tracking-widest">PROGRESS</span>
                        <span className="text-white">{camp.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/5">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${camp.progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 grid grid-cols-2 gap-8 border-l border-white/5 pl-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">
                        <Users className="w-3 h-3" />
                        Reach
                      </div>
                      <div className="text-xl font-bold text-white font-mono italic">{camp.metrics.reach}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">
                        <TrendingUp className="w-3 h-3" />
                        Engagement
                      </div>
                      <div className="text-xl font-bold text-primary font-mono italic">{camp.metrics.engagement}</div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end">
                     <Link 
                       to={`/campaigns/${camp.id}`}
                       className="secondary-button w-14 h-14 !p-0 flex items-center justify-center group/btn"
                     >
                       <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                     </Link>
                  </div>
                </div>

                {/* Goal Highlight */}
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Campaign Goal</span>
                      <span className="text-[11px] font-bold text-white uppercase italic tracking-[0.2em]">{camp.goal.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">AI Strategy</span>
                      <div className="flex items-center gap-2">
                         <Sparkles className="w-3 h-3 text-primary" />
                         <span className="text-[11px] font-bold text-primary uppercase italic tracking-[0.2em]">Aggressive Growth</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-white/20 font-mono tracking-widest uppercase">
                    Started {new Date(camp.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )
        ))}
      </div>
    </div>
  );
}
