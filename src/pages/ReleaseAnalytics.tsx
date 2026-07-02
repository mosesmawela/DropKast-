import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  TrendingUp,
  Users,
  MapPin,
  Play,
  ChevronLeft,
  Monitor,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { cn } from '../lib/utils';
import { useReleases } from '../context/ReleaseContext';

const streamData: { date: string; total: number; spotify: number; apple: number; tidal: number }[] = [];

const countryData: { name: string; value: number }[] = [];

const COLORS = ['#FF4D00', '#FFFFFF', '#333333', '#111111', '#222222'];

export default function ReleaseAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { releases } = useReleases();
  const release = releases.find(r => r.id === id);

  if (!release) return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-mono">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6 min-w-0">
          <button
            onClick={() => navigate(`/releases/${id}/status`)}
            className="beam flex items-center gap-2 min-h-[40px] text-white/20 transition-colors text-[10px] font-black uppercase tracking-[0.3em] italic"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to status
          </button>
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] italic">Deep Analysis</span>
              <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">Release ID: {id}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 break-words">{release.title}</h1>
            <p className="text-white/40 uppercase font-bold italic tracking-[0.2em]">Your streaming dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Streams', val: '—', icon: Play, trend: '' },
             { label: 'Unique Listeners', val: '—', icon: Users, trend: '' },
             { label: 'Playlist Adds', val: '—', icon: BarChart3, trend: '' },
             { label: 'Save Rate', val: '—', icon: TrendingUp, trend: '' },
           ].map((stat, i) => (
             <div key={i} className="p-6 border border-white/5 bg-dark space-y-4">
                <div className="flex items-center justify-between">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-primary italic uppercase tracking-widest">{stat.trend}</span>
                </div>
                <div>
                   <div className="text-2xl font-black text-white italic uppercase tracking-tighter">{stat.val}</div>
                   <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 manifest-card p-6 md:p-10 bg-dark border-white/5">
           <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Streams Over Time</h3>
              <div className="flex items-center gap-6">
                 {['Spotify', 'Apple', 'Tidal'].map((n) => (
                   <div key={n} className="flex items-center gap-2">
                     <div className={cn("w-2 h-2 rounded-full", n === 'Spotify' ? 'bg-primary' : n === 'Apple' ? 'bg-white' : 'bg-white/20')} />
                     <span className="text-[9px] font-black text-white/40 uppercase font-mono">{n}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           {streamData.length === 0 ? (
             <div className="h-[400px] w-full flex items-center justify-center text-[11px] font-black text-white/20 uppercase tracking-widest italic">No stream data yet</div>
           ) : (
           <div className="h-[400px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={streamData}>
                 <defs>
                   <linearGradient id="colorSpotify" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                 <XAxis 
                    dataKey="date" 
                    stroke="#444" 
                    fontSize={10} 
                    fontFamily="JetBrains Mono" 
                    tickFormatter={(val) => val.split('-')[2]}
                    dy={10}
                 />
                 <YAxis stroke="#444" fontSize={10} fontFamily="JetBrains Mono" dx={-10} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #111', fontSize: '10px' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono' }}
                 />
                 <Area type="monotone" dataKey="spotify" stroke="#FF4D00" fillOpacity={1} fill="url(#colorSpotify)" strokeWidth={3} />
                 <Area type="monotone" dataKey="apple" stroke="#FFFFFF" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
           )}
        </div>

        <div className="manifest-card p-6 md:p-10 bg-dark border-white/5 flex flex-col">
           <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono mb-10">Where People Are Listening</h3>
           {countryData.length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-[11px] font-black text-white/20 uppercase tracking-widest italic">No regional data yet</div>
           ) : (
           <>
           <div className="flex-1 h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={countryData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={10}
                   dataKey="value"
                   stroke="none"
                 >
                   {countryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #111', fontSize: '10px' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="space-y-4 mt-8">
              {countryData.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[10px] font-black text-white/60 uppercase italic">{c.name}</span>
                   </div>
                   <span className="text-[10px] font-black text-white uppercase italic">{c.value}%</span>
                </div>
              ))}
           </div>
           </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="manifest-card p-6 md:p-10 bg-dark border-white/5 space-y-8">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Top Cities</h3>
            <div className="space-y-6">
               {([] as { city: string; country: string; listeners: string; growth: string }[]).length === 0 && (
                 <div className="text-[11px] font-black text-white/20 uppercase tracking-widest italic text-center py-8">No location data yet</div>
               )}
               {([] as { city: string; country: string; listeners: string; growth: string }[]).map((loc, i) => (
                 <div key={i} className="flex items-center justify-between gap-3 border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4 min-w-0">
                       <MapPin className="w-4 h-4 text-primary shrink-0" />
                       <div className="min-w-0">
                          <div className="text-xs font-black text-white uppercase italic truncate">{loc.city}</div>
                          <div className="text-[8px] font-black text-white/20 uppercase tracking-widest truncate">{loc.country}</div>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <div className="text-xs font-black text-white font-mono">{loc.listeners}</div>
                       <div className="text-[8px] font-black text-green-500 uppercase italic">{loc.growth}</div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="manifest-card p-6 md:p-10 bg-dark border-white/5 space-y-8">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Devices</h3>
            <div className="space-y-10">
               <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest italic">
                     <div className="flex items-center gap-3 text-white min-w-0"><Smartphone className="w-4 h-4 shrink-0" /> Mobile</div>
                     <div className="text-white shrink-0">—</div>
                  </div>
                  <div className="h-1 bg-white/5 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: '0%' }} className="h-full bg-primary" /></div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest italic">
                     <div className="flex items-center gap-3 text-white/40 min-w-0"><Monitor className="w-4 h-4 shrink-0" /> Desktop</div>
                     <div className="text-white/40 shrink-0">—</div>
                  </div>
                  <div className="h-1 bg-white/5 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: '0%' }} className="h-full bg-white/10" /></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
