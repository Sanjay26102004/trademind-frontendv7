import { ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, Lock } from 'lucide-react';

export default function Radar({ opportunities, scanning, onScan, onSelect }) {
  const groupA = opportunities.filter(o => o.status === 'CONFIRMED_ELITE' || o.confidence >= 80);
  const groupB = opportunities.filter(o => o.status === 'CONFIRMED_GOOD' || (o.confidence >= 70 && o.confidence < 80));
  const groupC = opportunities.filter(o => o.status === 'FORMING' || (o.confidence >= 60 && o.confidence < 70));

  const SignalRow = ({ item, type }) => (
    <div onClick={() => onSelect(item)} className={`flex justify-between items-center p-3 mb-1 rounded cursor-pointer border-l-2 ${type === 'ELITE' ? 'bg-bull/10 border-bull' : type === 'GOOD' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-800 border-gray-600'}`}>
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-white text-sm">{item.pair}</span>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${item.direction === 'CALL' ? 'bg-bull text-black' : 'bg-bear text-white'}`}>
          {item.direction === 'CALL' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {item.direction}
        </div>
      </div>
      <div className="flex items-center gap-2">{item.is_blocked && <Lock size={12} className="text-bear" />}<span className="text-xs font-mono font-bold text-white">{item.confidence}%</span></div>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${scanning ? 'bg-primary animate-pulse' : 'bg-gray-600'}`}></div><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Market Radar (1m)</span></div>
        <button onClick={onScan} disabled={scanning} className="p-2 bg-primary/10 text-primary rounded-lg disabled:opacity-50">{scanning ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}</button>
      </div>
      {groupA.length > 0 && <div className="mb-4"><div className="text-[10px] text-bull font-bold uppercase tracking-wider mb-2">🟢 Group A • Elite</div><div className="space-y-1">{groupA.map(item => <SignalRow key={item.pair} item={item} type="ELITE" />)}</div></div>}
      {groupB.length > 0 && <div className="mb-4"><div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-2">🟡 Group B • Good</div><div className="space-y-1">{groupB.map(item => <SignalRow key={item.pair} item={item} type="GOOD" />)}</div></div>}
      {groupC.length > 0 && <div className="mb-2"><div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">⚪ Group C • Forming</div><div className="space-y-1 opacity-70">{groupC.map(item => <SignalRow key={item.pair} item={item} type="FORMING" />)}</div></div>}
      {opportunities.length === 0 && !scanning && <div className="text-center py-8 opacity-40"><div className="text-[10px] font-mono">SYSTEM READY • TAP SCAN</div></div>}
    </div>
  );
}
