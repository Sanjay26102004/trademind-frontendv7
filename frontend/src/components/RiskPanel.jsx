import { Wallet, Target } from 'lucide-react';

export default function RiskPanel({ balance, nextTrade }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Capital Card */}
      <div className="bg-surface border border-border p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
            <Wallet size={48} />
        </div>
        <div className="flex items-center gap-2 mb-1 text-gray-400">
          <Wallet size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Total Capital</span>
        </div>
        <div className="text-xl font-mono text-white font-bold tracking-tight">
          ₹{balance.toLocaleString()}
        </div>
      </div>

      {/* Risk Card */}
      <div className="bg-surface border border-primary/30 p-4 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
            <Target size={48} />
        </div>
        <div className="flex items-center gap-2 mb-1 text-primary">
          <Target size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Next Trade Risk</span>
        </div>
        <div className="text-xl font-mono text-primary font-bold tracking-tight">
          ₹{nextTrade}
        </div>
      </div>
    </div>
  );
}