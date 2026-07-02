import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  Disc,
  Video,
  Archive,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useReleases } from '@/src/context/ReleaseContext';

const statusIcons = {
  live: CheckCircle2,
  delivering: Clock,
  draft: Disc,
  rejected: AlertCircle,
  approved: CheckCircle2,
  in_review: Clock,
  submitted: Clock,
};

type CatalogTab = 'music' | 'video';

const filterOptions = ['All', 'Draft', 'In Review', 'Approved', 'Distributed', 'Rejected'];

export default function CatalogManager() {
  const navigate = useNavigate();
  const { releases } = useReleases();
  const [activeTab, setActiveTab] = useState<CatalogTab>('music');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statusMap: Record<string, string> = {
    'In Review': 'in_review',
    Approved: 'approved',
    Distributed: 'live',
    Draft: 'draft',
    Rejected: 'rejected',
  };

  const filteredReleases = releases.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const mappedStatus = statusMap[statusFilter];
    const matchesStatus = statusFilter === 'All' || r.status.toLowerCase() === mappedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusTag = (status: string) => {
    const statusStyles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600 border-gray-200',
      submitted: 'bg-blue-50 text-blue-600 border-blue-200',
      in_review: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      delivering: 'bg-purple-50 text-purple-600 border-purple-200',
      live: 'bg-green-50 text-green-600 border-green-200',
      rejected: 'bg-red-50 text-red-600 border-red-200',
    };
    return (
      <span
        className={cn(
          'px-3 py-1 text-[9px] font-bold uppercase tracking-widest font-mono border',
          statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-600'
        )}
        title={`Status: ${status}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <span className="w-1.5 h-1.5 bg-[#F05A28]" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono">MY CATALOG CONTROL RADAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 uppercase font-mono">Catalog</h1>
        </div>
        <button
          onClick={() => navigate('/releases/archived')}
          className="beam flex items-center gap-2 px-6 py-3 border border-[#F05A28] text-[#F05A28] transition-all text-[10px] font-black uppercase tracking-widest font-mono"
        >
          <Archive className="w-4 h-4" />
          View archived albums
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('music')}
          className={cn(
            'px-8 py-4 text-[10px] font-black uppercase tracking-widest font-mono transition-all flex items-center gap-2',
            activeTab === 'music'
              ? 'text-[#F05A28] border-b-2 border-[#F05A28]'
              : 'text-gray-400'
          )}
        >
          <Disc className="w-4 h-4" />
          MANAGE MUSIC
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={cn(
            'px-8 py-4 text-[10px] font-black uppercase tracking-widest font-mono transition-all flex items-center gap-2',
            activeTab === 'video'
              ? 'text-[#F05A28] border-b-2 border-[#F05A28]'
              : 'text-gray-400'
          )}
        >
          <Video className="w-4 h-4" />
          MANAGE VIDEOS
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="bg-white border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-mono">
            <option>Select an Album</option>
          </select>
          <select className="bg-white border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-mono">
            <option>Select a Track</option>
          </select>
          <select className="bg-white border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-mono">
            <option>Select Artist</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-mono"
          >
            {filterOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <p className="text-[9px] text-gray-400 italic font-mono">
          Hover over status tags to see descriptions for each status
        </p>
      </div>

      {/* Content */}
      {activeTab === 'music' && (
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 tracking-widest uppercase font-mono">Track</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 tracking-widest uppercase font-mono">Status</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 tracking-widest uppercase font-mono">Format</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 tracking-widest uppercase font-mono">Date</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 tracking-widest uppercase font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReleases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Disc className="w-10 h-10 text-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                        No releases found
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {filteredReleases.map((release) => (
                <motion.tr
                  key={release.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate(`/releases/${release.id}/status`)}
                  className="transition-colors cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-gray-200 overflow-hidden bg-gray-100">
                        {release.artwork ? (
                          <img src={release.artwork} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Disc className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 font-mono">{release.title}</p>
                        <p className="text-[9px] text-gray-400 font-mono">{release.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">{statusTag(release.status)}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-600 font-mono uppercase">{release.format}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-300" />
                      <span className="text-[9px] font-bold text-gray-400 font-mono">{release.releaseDate || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-gray-300 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="bg-white border border-gray-200 p-20 text-center">
          <Video className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
            No video assets yet
          </p>
          <button
            onClick={() => navigate('/video/distribute')}
            className="beam mt-6 px-8 py-3 bg-[#F05A28] text-white text-[10px] font-black uppercase tracking-widest font-mono italic transition-all"
          >
            Distribute a Video
          </button>
        </div>
      )}
    </div>
  );
}
