import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import ScrollReveal from './animations/ScrollReveal';

const chartData = [
  { name: '01', value: 4000 },
  { name: '02', value: 3000 },
  { name: '03', value: 5000 },
  { name: '04', value: 2780 },
  { name: '05', value: 1890 },
  { name: '06', value: 10390 },
  { name: '07', value: 8490 },
];

export default function DashboardChart({ label, unit }: { label: string; unit: string }) {
  return (
    <ScrollReveal direction="up" delay={0.4}>
      <div className="manifest-card p-12 relative overflow-hidden group">
        <div className="flex items-start justify-between mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-[11px] font-black tracking-[0.3em] font-mono uppercase italic">{label}</span>
            </div>
            <p className="text-xs text-white/40 italic font-medium leading-relaxed max-w-sm">
              Global ingestion analysis across DSP nodes. Data simulated until API integration is complete.
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-white italic font-mono tracking-tighter uppercase leading-none">+2.4kh</div>
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] font-mono mt-2 italic">{unit}</div>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff10', fontSize: 10, fontStyle: 'italic' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', fontSize: '11px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#FF4D00' }}
              />
              <Area type="monotone" dataKey="value" stroke="#FF4D00" strokeWidth={3} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScrollReveal>
  );
}
