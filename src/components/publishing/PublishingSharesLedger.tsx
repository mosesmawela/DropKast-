import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import {
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

type ShareStatus = 'pending_confirmation' | 'countered' | 'reconciled' | 'conflict_dispute';

interface ShareRequest {
  id: string;
  compositionTitle: string;
  share: number;
  originalWriter: string;
  counterparty: string;
  newWriter: string;
  status: ShareStatus;
}

const mockReceived: ShareRequest[] = [];
const mockSent: ShareRequest[] = [];

const statusConfig: Record<ShareStatus, { label: string; color: string; icon: any }> = {
  pending_confirmation: { label: 'Pending Confirmation', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
  countered: { label: 'Countered', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertCircle },
  reconciled: { label: 'Reconciled', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  conflict_dispute: { label: 'Conflict Dispute', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

const columns = [
  'COMPOSITION TITLE',
  'SHARE',
  'ORIGINAL WRITER NAME',
  'REQUESTING PARTY',
  'NEW WRITER',
  'STATUS',
] as const;

export default function PublishingSharesLedger() {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const requests = tab === 'received' ? mockReceived : mockSent;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <span className="w-1.5 h-1.5 bg-[#F05A28]" />
          <span className="text-[10px] font-bold tracking-widest uppercase font-mono">PUBLISHING SHARES LEDGER</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase font-mono">Share Requests</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('received')}
          className={cn(
            'px-8 py-4 text-[10px] font-black uppercase tracking-widest font-mono transition-all flex items-center gap-2',
            tab === 'received' ? 'text-[#F05A28] border-b-2 border-[#F05A28]' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Received Share Requests
        </button>
        <button
          onClick={() => setTab('sent')}
          className={cn(
            'px-8 py-4 text-[10px] font-black uppercase tracking-widest font-mono transition-all flex items-center gap-2',
            tab === 'sent' ? 'text-[#F05A28] border-b-2 border-[#F05A28]' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
          Sent Share Requests
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {columns.map((col) => (
                <th key={col} className="px-6 py-4 text-[9px] font-bold text-gray-500 tracking-widest uppercase font-mono">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="w-10 h-10 text-gray-200" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                      No data is currently available to view.
                    </span>
                  </div>
                </td>
              </tr>
            )}
            {requests.map((req) => {
              const status = statusConfig[req.status];
              const StatusIcon = status.icon;
              return (
                <motion.tr
                  key={req.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-gray-800 font-mono">{req.compositionTitle}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-600 font-mono">{req.share}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-600 font-mono">{req.originalWriter}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-600 font-mono">{req.counterparty}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-600 font-mono">{req.newWriter}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest font-mono border', status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
