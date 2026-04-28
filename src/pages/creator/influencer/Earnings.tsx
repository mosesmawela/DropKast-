import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  CreditCard,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';

export default function InfluencerEarnings() {
  const transactions = [
    { id: 1, type: 'Payout', amount: '$1,200', date: '2026-04-15', status: 'Completed', mission: "Afrobeats_Signal_Burst" },
    { id: 2, type: 'Pending', amount: '$450', date: '2026-04-20', status: 'Verifying', mission: "Sonic_Wave_UGC" },
    { id: 3, type: 'Payout', amount: '$850', date: '2026-04-02', status: 'Completed', mission: "Midnight_Rush_Invasion" },
  ];

  return (
    <div className="space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Financial_Grid</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">TREASURY_OS</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Monitor resource accumulation and global payout statuses.</p>
        </div>

        <button className="h-16 bg-white text-black hover:bg-primary hover:text-white px-10 flex items-center gap-4 group transition-all font-mono font-black italic text-[11px] tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span>REQUEST_WITHDRAWAL</span>
          <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'TOTAL_ACCUMULATED', value: '$2,500', icon: Wallet, color: 'text-primary' },
          { label: 'PENDING_SIGNAL_SYNC', value: '$450', icon: Clock, color: 'text-white/40' },
          { label: 'AVG_MISSION_VAL', value: '$312.5', icon: TrendingUp, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="manifest-card p-10 bg-black/40 border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/20">
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono italic">{stat.label}</span>
            </div>
            <div className={cn("text-5xl font-black italic font-mono leading-none tracking-tight", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <span>TRANSACTION_LOG</span>
          </h2>
          <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">Real-time settlement sync active</div>
        </div>

        <div className="space-y-4">
          {transactions.map((t) => (
            <div key={t.id} className="manifest-card p-8 bg-white/[0.02] border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 border flex items-center justify-center italic text-[10px] font-mono font-black",
                  t.status === 'Completed' ? "border-primary text-primary" : "border-white/10 text-white/20"
                )}>
                  {t.type[0]}
                </div>
                <div className="space-y-1">
                   <div className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono italic">{t.date} // {t.status}</div>
                   <h4 className="text-xl font-black italic text-white lowercase tracking-tight group-hover:text-primary transition-colors">{t.mission}</h4>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="text-right">
                   <div className="text-2xl font-black text-white font-mono lowercase tracking-tighter">{t.amount}</div>
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono italic">SETTLED_VALUE</div>
                </div>
                <div className="w-12 h-12 border border-white/5 flex items-center justify-center text-white/10 group-hover:text-white transition-all">
                   <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
