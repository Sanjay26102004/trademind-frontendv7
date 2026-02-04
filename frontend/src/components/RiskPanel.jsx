import { Settings2, ShieldCheck } from 'lucide-react';

export default function RiskPanel({ balance, setBalance, riskMode, setRiskMode, strictMode, setStrictMode }) {
  const riskAmount = riskMode === 'FIXED' ? Math.round(balance * 0.02) : Math.round(balance * 0.04); 
  return (
    <div className="bg-surface border border-border p-5 rounded-2xl mb-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2"><Settings2 size={12} /> Risk Engine</label>
        <button onClick={() => setStrictMode(!strictMode)} className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border transition-all ${strictMode ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-800 border-gray-700 text-gray-500'}`}><ShieldCheck size={10} /> STRICT {strictMode ? 'ON' : 'OFF'}</button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div><div className="text-[9px] text-gray-500 mb-1 font-bold">CAPITAL</div><div className="relative"><span className="absolute left-0 top-1 text-gray-600 font-mono">₹</span><input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="w-full bg-transparent text-2xl font-mono font-bold text-white outline-none border-b border-gray-800 focus:border-primary pb-1 pl-4" /></div></div>
        <div onClick={() => setRiskMode(prev => prev === 'FIXED' ? 'ADAPTIVE' : 'FIXED')} className="cursor-pointer"><div className="text-[9px] text-gray-500 mb-1 font-bold">RISK</div><div className="text-2xl font-mono font-bold text-primary">₹{riskAmount}</div><div className="text-[9px] text-gray-600 font-mono mt-1">{riskMode === 'FIXED' ? '2% Fixed' : 'Adaptive (4%)'}</div></div>
      </div>
    </div>
  );
}
