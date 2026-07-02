import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  PlusCircle, 
  Music, 
  TrendingUp, 
  Users, 
  Video,
  ArrowRight,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotify } from '../context/NotificationContext';

export default function PreReleaseList() {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - will connect to real API later
    const fetchActivations = async () => {
      try {
        const response = await fetch('/api/pre-releases');
        if (response.ok) {
          const data = await response.json();
          setActivations(data);
        }
      } catch (err) {
        console.error('Failed to sync activation nodes.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivations();
  }, []);

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Pre-release</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">Pre-releases</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Build buzz before your track drops.</p>
        </div>

        <Link
          to="/pre-release/new"
          className="beam h-16 bg-white text-black px-10 flex items-center justify-center gap-4 group transition-all font-mono font-black italic text-[11px] tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0"
        >
          <span>New pre-release</span>
          <PlusCircle className="w-5 h-5 transition-transform" />
        </Link>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active pre-releases', value: activations.length, icon: Zap, color: 'text-primary' },
          { label: 'Videos made', value: '—', icon: Video, color: 'text-blue-400' },
          { label: 'Creator reach', value: '—', icon: Users, color: 'text-purple-400' },
          { label: 'Buzz score', value: '—', icon: TrendingUp, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="manifest-card p-10 bg-black/40 border-white/5 group transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/20 transition-colors">
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest font-mono italic">{stat.label}</span>
            </div>
            <div className={cn("text-5xl font-black italic font-mono leading-none", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* List Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search pre-releases..."
            className="w-full h-16 bg-white/[0.02] border border-white/5 pl-16 pr-6 text-[11px] font-mono font-black text-white placeholder:text-white/10 focus:border-primary/50 outline-none transition-all uppercase tracking-widest"
          />
        </div>
        <button className="beam h-16 px-8 border border-white/5 text-white/40 transition-all flex items-center justify-center gap-3 font-mono text-[10px] font-black uppercase tracking-widest bg-white/[0.02]">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Activations List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="manifest-card p-12 bg-white/[0.02] border-white/5 animate-pulse h-32" />
          ))
        ) : activations.length === 0 ? (
          <div className="manifest-card p-24 border-dashed border-white/10 text-center space-y-8 bg-black/20">
            <div className="w-20 h-20 border border-white/5 flex items-center justify-center mx-auto text-white/10">
              <Zap className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white italic lowercase">No pre-releases yet</h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">Start a new pre-release to build buzz before your drop.</p>
            </div>
            <Link
              to="/pre-release/new"
              className="beam inline-flex h-14 bg-primary text-white px-8 items-center justify-center gap-4 transition-all font-mono font-black text-[10px] tracking-widest"
            >
              <span>Start a pre-release</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          activations.map((activation) => (
            <motion.div
              layout
              key={activation.id}
              className="manifest-card p-10 bg-black/40 border-white/5 transition-all group cursor-pointer"
              onClick={() => navigate(`/pre-release/${activation.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-8 min-w-0">
                  <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                    <Music className="w-8 h-8 text-white/10" />
                    <div className="absolute inset-0 bg-primary/20 scale-x-100 transition-transform origin-left" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-black text-primary font-mono italic uppercase tracking-widest shrink-0">{activation.status}</span>
                      <div className="w-1 h-1 bg-white/20 rounded-full shrink-0" />
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono truncate">Drops {activation.releaseDate}</span>
                    </div>
                    <h3 className="text-3xl font-black text-white italic lowercase tracking-tight transition-colors break-words">{activation.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <button className="beam w-12 h-12 border border-white/5 transition-all flex items-center justify-center text-white/20">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
