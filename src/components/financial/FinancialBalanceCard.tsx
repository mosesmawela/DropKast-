import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function FinancialBalanceCard() {
  const [data, setData] = useState<{ balanceCents: number; lifetimeCents: number; nextPayoutDate?: string } | null>(null);

  useEffect(() => {
    fetch('/api/earnings')
      .then((r) => r.json())
      .then((d) => {
        const totalCents = d?.summary?.totalCents ?? 0;
        setData({ balanceCents: totalCents, lifetimeCents: totalCents });
      })
      .catch(() => setData({ balanceCents: 0, lifetimeCents: 0 }));
  }, []);

  const balance = (data?.balanceCents || 0) / 100;
  const lifetime = (data?.lifetimeCents || 0) / 100;

  const handleWithdraw = async () => {
    try {
      const res = await fetch('/api/earnings/payout-request', { method: 'POST' });
      if (res.ok) toast.success('Withdrawal initiated', 'Your funds are being processed.');
      else toast.error('Withdrawal failed');
    } catch {
      toast.error('Withdrawal failed');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#F05A28]/10 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-[#F05A28]" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-1">
            Available Balance
          </div>
          <div className="text-3xl font-black text-gray-900 tabular-nums font-mono">
            ${balance.toFixed(2)}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[9px] text-gray-400 font-mono">
              Lifetime: ${lifetime.toLocaleString()} USD
            </span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono">
              <TrendingUp className="w-3 h-3" />
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Next payout</div>
          <div className="text-xs font-bold text-gray-700 font-mono">
            {data?.nextPayoutDate || 'On demand'}
          </div>
        </div>
        <button
          onClick={handleWithdraw}
          className="h-12 px-8 bg-[#F05A28] text-white hover:bg-[#d94d20] text-[10px] font-black uppercase tracking-widest font-mono italic transition-all flex items-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdraw
        </button>
      </div>
    </div>
  );
}
