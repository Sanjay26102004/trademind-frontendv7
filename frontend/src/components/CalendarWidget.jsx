import { useEffect, useState } from 'react'; import { Calendar } from 'lucide-react';
export default function CalendarWidget({ apiKey }) {
  const [data, setData] = useState({}); const [stats, setStats] = useState({ winRate: 0, totalPnL: 0 });
  useEffect(() => {
    async function loadData() {
      try { const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/calendar`, { headers: { "x-api-key": apiKey } }); const json = await res.json(); setData(json.calendar || {}); const vals = Object.values(json.calendar || {}); const wins = vals.filter(v => v > 0).length; setStats({ winRate: vals.length ? Math.round((wins/vals.length)*100) : 0, totalPnL: vals.reduce((a,b)=>a+b,0) }); } catch {}
    } loadData();
  }, [apiKey]);
  const days = Array.from({length: 14}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split('T')[0]; });
  return (
    <div className="bg-surface border border-border p-4 rounded-xl mb-6 shadow-lg">
      <div className="flex justify-between items-center mb-4"><label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2"><Calendar size={12} /> Performance (14 Days)</label><div className={`text-xs font-mono font-bold ${stats.totalPnL >= 0 ? 'text-bull' : 'text-bear'}`}>{stats.totalPnL >= 0 ? '+' : ''}₹{stats.totalPnL}</div></div>
      <div className="grid grid-cols-7 gap-2">{days.map(d => { const p = data[d] || 0; return (<div key={d} className={`h-10 rounded border flex flex-col items-center justify-center relative ${p>0?'bg-bull/20 border-bull/50':p<0?'bg-bear/20 border-bear/50':'bg-zinc-900 border-zinc-800'}`}><span className="text-[8px] text-gray-500 font-mono absolute top-0.5">{d.slice(8)}</span>{p!==0&&<span className="text-[9px] font-bold mt-2">{p>0?'↑':'↓'}</span>}</div>);})}</div>
    </div>
  );
}
