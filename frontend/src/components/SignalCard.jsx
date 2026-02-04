import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, HelpCircle, X, Check, Info } from 'lucide-react';
import { api } from '../api';

export default function SignalCard({ data, apiKey, onBack, onTradeComplete }) {
  const [phase, setPhase] = useState('DECISION'); 
  const [showWhy, setShowWhy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const isCall = data.direction === 'CALL';
  const theme = isCall ? { bg: 'bg-bull', border: 'border-bull' } : { bg: 'bg-bear', border: 'border-bear' };

  useEffect(() => {
    if (!data.next_candle) return;
    const interval = setInterval(() => {
      const remaining = data.next_candle - Math.floor(Date.now() / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [data.next_candle]);

  const handleAction = async (type, payload) => {
    const payout = type === 'WIN' ? prompt("Enter Payout:") : 0;
    if (type === 'WIN' && !payout) return;
    await api.logResult(data.signal_id, type, Number(payout), apiKey, payload);
    onTradeComplete(type, Number(payout));
  };

  return (
    <div className={`rounded-2xl border ${theme.border}/20 bg-surface mb-4 overflow-hidden shadow-2xl relative animate-scale-in`}>
      <div className="bg-black/40 p-3 flex justify-between items-center border-b border-white/5">
        <button onClick={onBack} className="text-[10px] text-gray-400 hover:text-white uppercase font-bold">← Radar</button>
        <div className="text-[11px] font-mono font-bold text-white flex items-center gap-2 bg-gray-800 px-2 py-1 rounded"><Clock size={12} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div><h2 className="text-4xl font-black text-white tracking-tighter mb-1">{data.pair}</h2><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md font-bold text-sm text-black ${theme.bg}`}>{isCall ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />} {data.direction}</div></div>
          <div className="text-right"><div className="text-3xl font-mono text-white font-bold">{data.confidence}%</div><button onClick={() => setShowWhy(!showWhy)} className="text-[10px] text-primary mt-2 flex items-center justify-end gap-1"><HelpCircle size={10} /> Logic</button></div>
        </div>
        {showWhy && <div className="mb-6 bg-black/50 p-4 rounded-xl border border-white/10 text-xs">{Object.entries(data.details || {}).map(([k, v]) => (<div key={k} className="flex justify-between mb-2"><span className="text-gray-300 capitalize">{k.replace(/_/g, ' ')}</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v !== 0 ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-600'}`}>{v !== 0 ? 'PASS' : 'FAIL'}</span></div>))}</div>}
        {data.status === 'FORMING' ? <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center mb-4"><div className="text-yellow-500 font-bold animate-pulse flex items-center justify-center gap-2"><Info size={16} /> FORMING</div><div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Wait for Candle Close</div></div> : <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            {phase === 'DECISION' && <div className="grid grid-cols-2 gap-4"><button onClick={() => setPhase('ACTIVE')} className="py-4 bg-bull/10 border border-bull/30 text-bull font-bold rounded-xl flex flex-col items-center gap-1"><Check size={20} /> YES</button><button onClick={() => setPhase('REASON')} className="py-4 bg-gray-800 border border-gray-600 text-gray-400 font-bold rounded-xl flex flex-col items-center gap-1"><X size={20} /> NO</button></div>}
            {phase === 'REASON' && <div className="grid grid-cols-2 gap-2">{['Late Entry', 'Bad Spread', 'News', 'Gut'].map(r => <button key={r} onClick={() => handleAction('SKIPPED', r)} className="py-3 border border-gray-700 bg-gray-900 rounded-lg text-xs text-gray-300">{r}</button>)}<button onClick={() => setPhase('DECISION')} className="w-full mt-3 text-[10px] text-gray-600">Cancel</button></div>}
            {phase === 'ACTIVE' && <div className="grid grid-cols-2 gap-4"><button onClick={() => handleAction('LOSS')} className="py-4 bg-bear/10 border border-bear/30 text-bear font-bold rounded-xl">LOSS</button><button onClick={() => handleAction('WIN')} className="py-4 bg-bull/10 border border-bull/30 text-bull font-bold rounded-xl">WIN</button></div>}
          </div>}
      </div>
    </div>
  );
}
