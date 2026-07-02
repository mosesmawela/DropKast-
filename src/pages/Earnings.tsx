import { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Download, 
  CreditCard, 
  Building2, 
  History,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { toast } from 'sonner';
import { StatSkeleton, CardSkeleton } from '../components/Skeleton';

const payoutHistory: { id: number; date: string; amount: string; method: string; status: string }[] = [];

const platformProjections: { name: string; value: number; color: string }[] = [];

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/earnings')
      .then(r => r.json())
      .then(data => {
        setEarningsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 manifest-card p-12 min-h-[450px]">
            <StatSkeleton />
          </div>
          <div className="space-y-8">
            <CardSkeleton rows={4} />
            <CardSkeleton rows={2} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} rows={3} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Earnings</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Earnings</h1>
          </div>
          <div className="flex items-center gap-4">
            <AnimatedBeam containerClassName="w-fit">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/earnings/payout-request', { method: 'POST' });
                    if (res.ok) toast.success('Payout requested', 'Your payout is being processed.');
                  } catch { toast.error('Failed to request payout'); }
                }}
                className="primary-button h-14 flex items-center gap-3 px-10"
              >
                <ArrowUpRight className="w-4 h-4" />
                Request payout
              </button>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      {/* Primary Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 manifest-card p-5 sm:p-12 flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="flex items-center gap-4 mb-20 font-mono">
              <div className="w-8 h-8 border border-primary flex items-center justify-center p-1">
                 <div className="w-full h-full bg-primary" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-primary italic uppercase">Available Balance</span>
            </div>
            <div className="text-5xl sm:text-7xl md:text-[110px] font-black leading-none tracking-tighter italic flex items-baseline gap-4 font-mono">
              <span className="text-white">{earningsData?.summary?.totalCents ? `$${(earningsData.summary.totalCents / 100).toLocaleString()}` : '$0.00'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/5 font-mono">
            {[
              { label: 'Last Payout', value: '—' },
              { label: 'Next Cycle', value: '—' },
              { label: 'Pending', value: '$0.00' },
            ].map((item) => (
              <div key={item.label}>
                <span className="text-[10px] font-bold text-white/30 block mb-2 tracking-widest uppercase italic">{item.label}</span>
                <span className="text-base font-bold text-white italic">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projected earnings sidebar */}
        <div className="space-y-8">
          <div className="manifest-card p-5 sm:p-10 space-y-8 font-mono">
             <div className="flex justify-between items-center gap-3">
                <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest italic min-w-0 truncate">Projected Earnings</h3>
             </div>
             {platformProjections.length === 0 ? (
               <div className="h-[200px] w-full flex items-center justify-center text-[10px] font-bold text-white/20 uppercase tracking-widest italic text-center">No projections yet</div>
             ) : (
             <>
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformProjections}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {platformProjections.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF4D00' : '#222'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF4D00', fontSize: '11px', fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-4">
               {platformProjections.map(p => (
                 <div key={p.name} className="flex justify-between items-center text-[11px] font-bold italic">
                   <span className="text-white/30 uppercase">{p.name}</span>
                   <span className="text-white font-mono">${p.value.toLocaleString()}</span>
                 </div>
               ))}
             </div>
             </>
             )}
          </div>
        </div>
      </div>

      {/* Earnings by store */}
      <div className="space-y-12 pt-16 border-t border-white/5 font-mono">
         <div className="flex items-center justify-between gap-6">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap shrink-0">Earnings by Store</h2>
            <div className="w-full h-[1px] bg-white/5" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="manifest-card p-5 sm:p-10 bg-dark border-white/5 space-y-8 shadow-2xl">
               <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Royalties by Store</h3>
               <div className="space-y-6">
                  {([] as { node: string; amount: string; streams: string; color: string }[]).map((p, i) => (
                    <div key={i} className="flex flex-col gap-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                          <span className="text-white/60">{p.node}</span>
                          <span className="text-white">{p.amount}</span>
                       </div>
                       <div className="h-1 bg-white/5 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: `${(parseInt(p.amount.replace('$', '')) / 10000) * 100}%` }} className="h-full" style={{ backgroundColor: p.color }} /></div>
                    </div>
                  ))}
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic text-center py-8">No earnings by store yet</div>
               </div>
            </div>

            <div className="manifest-card p-5 sm:p-10 bg-dark border-white/5 space-y-8 shadow-2xl">
               <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Release Performance</h3>
               <div className="space-y-6">
                  {([] as { release: string; revenue: string; cost: string; margin: string }[]).map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-6 border border-white/5 bg-white/[0.01] transition-all">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-white uppercase italic tracking-tight">{r.release}</span>
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Cost Pool: {r.cost}</span>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-black text-primary font-mono">{r.revenue}</div>
                          <div className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-1">Net ROI {r.margin}</div>
                       </div>
                    </div>
                  ))}
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic text-center py-8">No release revenue yet</div>
               </div>
            </div>
         </div>
      </div>

      {/* Payout History Ledger */}
      <section className="space-y-8 pt-16 border-t border-white/5 font-mono">
        <div className="flex items-center justify-between gap-6">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap shrink-0">Payout History</h2>
          <div className="w-full h-[1px] bg-white/5" />
        </div>
        <div className="manifest-card !p-0 overflow-x-auto shadow-2xl">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Date</th>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Amount</th>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Status</th>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic">
              {payoutHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-[11px] font-bold text-white/20 uppercase tracking-widest italic">No payouts yet</td>
                </tr>
              )}
              {payoutHistory.map((p) => (
                <tr key={p.id} className="transition-colors group">
                  <td className="px-8 py-6 text-[11px] text-white/20 tracking-widest uppercase font-mono">{p.date.replace(/-/g, '/')}</td>
                  <td className="px-8 py-6 text-base font-bold text-white font-mono">{p.amount}</td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 border text-[10px] font-bold tracking-widest uppercase",
                      p.status === 'Completed' ? 'border-primary/20 text-primary' : 'border-red-900/50 text-red-900'
                    )}>
                      {p.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-white/10 transition-colors bg-white/5">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
