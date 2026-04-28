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
  Sparkles,
  PieChart as PieChartIcon,
  ChevronRight,
  Target,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';

const payoutHistory = [
  { id: 1, date: '2024-04-15', amount: '$4,290.00', method: 'Direct Deposit', status: 'Completed' },
  { id: 2, date: '2024-03-15', amount: '$3,850.50', method: 'Direct Deposit', status: 'Completed' },
  { id: 3, date: '2024-02-15', amount: '$5,120.00', method: 'Paypal', status: 'Completed' },
  { id: 4, date: '2024-01-15', amount: '$2,450.00', method: 'Paypal', status: 'Failed' },
];

const platformProjections = [
  { name: 'Spotify', value: 8400, color: '#1DB954' },
  { name: 'Apple', value: 3100, color: '#FA243C' },
  { name: 'YouTube', value: 1200, color: '#FF0000' },
  { name: 'Tidal', value: 800, color: '#00FFFF' },
];

export default function Earnings() {
  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Earnings AI</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Earnings</h1>
          </div>
          <div className="flex items-center gap-4">
            <AnimatedBeam containerClassName="w-fit">
              <button className="primary-button h-14 flex items-center gap-3 px-10">
                <ArrowUpRight className="w-4 h-4" />
                Request Payout
              </button>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      {/* Primary Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 manifest-card p-12 flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="flex items-center gap-4 mb-20 font-mono">
              <div className="w-8 h-8 border border-primary flex items-center justify-center p-1">
                 <div className="w-full h-full bg-primary" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-primary italic uppercase">Available Balance</span>
            </div>
            <div className="text-7xl md:text-[110px] font-black leading-none tracking-tighter italic flex items-baseline gap-4 font-mono">
              <span className="text-white">$12,492.</span>
              <span className="text-white/20 text-5xl underline decoration-primary underline-offset-8">50</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/5 font-mono">
            {[
              { label: 'Last Payout', value: '$4,290.00' },
              { label: 'Next Cycle', value: 'MAY 15' },
              { label: 'Pending', value: '$842.10' },
            ].map((item) => (
              <div key={item.label}>
                <span className="text-[10px] font-bold text-white/30 block mb-2 tracking-widest uppercase italic">{item.label}</span>
                <span className="text-base font-bold text-white italic">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Projection Sidebar */}
        <div className="space-y-8">
          <div className="manifest-card p-10 space-y-8 font-mono">
             <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Proj. Earnings</h3>
                <span className="text-[10px] font-bold text-primary uppercase animate-pulse">High Potential</span>
             </div>
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
          </div>
          
          <div className="manifest-card !bg-white/5 p-8 space-y-5">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[11px] font-mono italic">
              <Target className="w-4 h-4" />
              Growth Tip
            </div>
            <p className="text-sm font-sans leading-relaxed text-white/60 italic font-medium">
              "We suggested moving your ad budget to YouTube discovery ads targeting 'Melodic House' fans. Your projected return is 4.2x higher than Instagram."
            </p>
            <button className="w-full primary-button py-4 text-[10px] uppercase font-mono tracking-widest">Update Ads</button>
          </div>
        </div>
      </div>

      {/* Revenue Optimization Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Sync Licensing', text: "Your track matches the vibe for a major automotive commercial. Our AI is pitching it now.", btn: 'View Pitch', icon: DollarSign },
          { label: 'Revenue Check', text: "4% of your songs found on YouTube shorts aren't claimed. You could earn an extra $240/week.", btn: 'Claim Revenue', icon: PieChartIcon },
          { label: 'Global Growth', text: "Your sound is trending in Japan. High ROI expected if we launch localized ads there.", btn: 'Launch Ads', icon: ArrowUpRight }
        ].map((block) => (
          <div key={block.label} className="manifest-card p-8 space-y-6 group cursor-pointer">
            <div className="flex items-center gap-3 font-mono">
              <block.icon className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic">{block.label}</span>
            </div>
            <p className="text-sm font-sans text-white/40 italic font-medium leading-relaxed">"{block.text}"</p>
            <div className="flex items-center justify-between pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
              <span className="text-[10px] font-bold uppercase text-primary tracking-widest italic">{block.btn}</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Financial Transparency Layer */}
      <div className="space-y-12 pt-16 border-t border-white/5 font-mono">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Distro Node Returns</h2>
            <div className="w-full ml-12 h-[1px] bg-white/5" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="manifest-card p-10 bg-dark border-white/5 space-y-8 shadow-2xl">
               <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Platform Royalty Density</h3>
               <div className="space-y-6">
                  {[
                    { node: 'Spotify', amount: '$6,492', streams: '8.4M', color: '#FF4D00' },
                    { node: 'Apple Music', amount: '$4,120', streams: '3.1M', color: '#FA243C' },
                    { node: 'TikTok Nodes', amount: '$1,240', streams: '12.8M', color: '#00FFFF' },
                    { node: 'Audiomack Africa', amount: '$640', streams: '2.1M', color: '#FFA500' },
                  ].map((p, i) => (
                    <div key={i} className="flex flex-col gap-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                          <span className="text-white/60">{p.node}</span>
                          <span className="text-white">{p.amount}</span>
                       </div>
                       <div className="h-1 bg-white/5 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: `${(parseInt(p.amount.replace('$', '')) / 10000) * 100}%` }} className="h-full" style={{ backgroundColor: p.color }} /></div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="manifest-card p-10 bg-dark border-white/5 space-y-8 shadow-2xl">
               <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Release Performance vs Costs</h3>
               <div className="space-y-6">
                  {[
                    { release: 'Neon Nights', revenue: '$8,420', cost: '$1,200', margin: '85%' },
                    { release: 'Subsonic Echo', revenue: '$3,100', cost: '$450', margin: '84%' },
                    { release: 'Velvet Sky', revenue: '$912', cost: '$120', margin: '86%' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-6 border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all">
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
               </div>
            </div>
         </div>
      </div>

      {/* Payout History Ledger */}
      <section className="space-y-8 pt-16 border-t border-white/5 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Payout History</h2>
          <div className="w-full ml-12 h-[1px] bg-white/5" />
        </div>
        <div className="manifest-card !p-0 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Date</th>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Amount</th>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic">Status</th>
                <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 italic">
              {payoutHistory.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
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
                    <button className="p-2 text-white/10 hover:text-white transition-colors bg-white/5">
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
