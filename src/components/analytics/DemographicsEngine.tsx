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
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-200 p-4">
        <select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          className="border border-gray-200 px-4 py-3 text-[9px] font-bold text-gray-600 uppercase tracking-widest font-mono bg-white"
        >
          <option value="">Select an artist to filter</option>
        </select>
        <button className="flex items-center gap-1 px-4 py-3 border border-dashed border-gray-300 text-gray-400 hover:border-[#F05A28] hover:text-[#F05A28] transition-all text-[9px] font-bold uppercase tracking-widest font-mono">
          <Plus className="w-3 h-3" />
          ADD FILTER
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Filter className="w-3 h-3 text-gray-300" />
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest font-mono">
            Demographics Analytics
          </span>
        </div>
      </div>

      {/* Four-Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GENDER */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Gender Distribution</span>
          </div>
          {genderData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-gray-200 bg-gray-50">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            genderData.map((g) => (
              <div key={g.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-gray-600">{g.label}</span>
                  <span className="text-gray-800">{g.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100">
                  <div className="h-full bg-[#F05A28]" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* AGE */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Age Brackets</span>
          </div>
          {ageData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-gray-200 bg-gray-50">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            ageData.map((a) => (
              <div key={a.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-gray-600">{a.label}</span>
                  <span className="text-gray-800">{a.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* SOURCE TYPE */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Source Type</span>
          </div>
          {sourceData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-gray-200 bg-gray-50">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            sourceData.map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="text-gray-800">{s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100">
                  <div className="h-full bg-purple-500" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* SUBSCRIPTION TYPE */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#F05A28]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Listener Subscription Type</span>
          </div>
          {subData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-gray-200 bg-gray-50">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-mono">No data</span>
            </div>
          ) : (
            subData.map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="text-gray-800">{s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100">
                  <div className="h-full bg-blue-500" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Source Validation */}
      <div className="text-[8px] text-gray-400 font-mono italic text-right border-t border-gray-200 pt-4">
        Data provided by Apple Music
      </div>
    </div>
  );
}
