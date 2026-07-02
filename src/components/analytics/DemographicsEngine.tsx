import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import {
  Users,
  Plus,
  Filter,
  PieChart,
  BarChart3,
  Globe,
  CreditCard,
} from 'lucide-react';

const genderData: { label: string; pct: number }[] = [];
const ageData: { label: string; pct: number }[] = [];
const sourceData: { label: string; pct: number }[] = [];
const subData: { label: string; pct: number }[] = [];

export default function DemographicsEngine() {
  const [artistFilter, setArtistFilter] = useState('');

  return (
    <div className="space-y-8">
      {/* Filter Hub */}
      <div className="flex flex-wrap items-center gap-4 bg-black/20 border border-[#26262e] p-4">
        <select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          className="border border-[#26262e] px-4 py-3 text-[9px] font-bold text-[#9A9AA6] uppercase tracking-widest font-mono bg-[#15151b]"
        >
          <option value="">Select an artist to filter</option>
        </select>
        <button className="flex items-center gap-1 px-4 py-3 border border-dashed border-[#33333d] text-[#6A6A75] hover:border-[#F05A28] hover:text-[#F05A28] transition-all text-[9px] font-bold uppercase tracking-widest font-mono">
          <Plus className="w-3 h-3" />
          ADD FILTER
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Filter className="w-3 h-3 text-[#55555f]" />
          <span className="text-[8px] font-bold text-[#6A6A75] uppercase tracking-widest font-mono">
            Demographics Analytics
          </span>
        </div>
      </div>

      {/* Four-Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GENDER */}
        <div className="bg-[#15151b] border border-[#26262e] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-[#8A8A93] uppercase tracking-widest font-mono">Gender Distribution</span>
          </div>
          {genderData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-[#26262e] bg-black/20">
              <span className="text-[9px] font-bold text-[#55555f] uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            genderData.map((g) => (
              <div key={g.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-[#9A9AA6]">{g.label}</span>
                  <span className="text-[#C9C9CF]">{g.pct}%</span>
                </div>
                <div className="h-2 bg-black/30">
                  <div className="h-full bg-[#F05A28]" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* AGE */}
        <div className="bg-[#15151b] border border-[#26262e] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-[#8A8A93] uppercase tracking-widest font-mono">Age Brackets</span>
          </div>
          {ageData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-[#26262e] bg-black/20">
              <span className="text-[9px] font-bold text-[#55555f] uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            ageData.map((a) => (
              <div key={a.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-[#9A9AA6]">{a.label}</span>
                  <span className="text-[#C9C9CF]">{a.pct}%</span>
                </div>
                <div className="h-2 bg-black/30">
                  <div className="h-full bg-emerald-500/100" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* SOURCE TYPE */}
        <div className="bg-[#15151b] border border-[#26262e] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-[#8A8A93] uppercase tracking-widest font-mono">Source Type</span>
          </div>
          {sourceData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-[#26262e] bg-black/20">
              <span className="text-[9px] font-bold text-[#55555f] uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            sourceData.map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-[#9A9AA6]">{s.label}</span>
                  <span className="text-[#C9C9CF]">{s.pct}%</span>
                </div>
                <div className="h-2 bg-black/30">
                  <div className="h-full bg-purple-500/100" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* SUBSCRIPTION TYPE */}
        <div className="bg-[#15151b] border border-[#26262e] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-[#8A8A93] uppercase tracking-widest font-mono">Listener Subscription Type</span>
          </div>
          {subData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-[#26262e] bg-black/20">
              <span className="text-[9px] font-bold text-[#55555f] uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            subData.map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-[#9A9AA6]">{s.label}</span>
                  <span className="text-[#C9C9CF]">{s.pct}%</span>
                </div>
                <div className="h-2 bg-black/30">
                  <div className="h-full bg-blue-500/100" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Source Validation */}
      <div className="text-[8px] text-[#6A6A75] font-mono italic text-right border-t border-[#26262e] pt-4">
        Data provided by Apple Music
      </div>
    </div>
  );
}
