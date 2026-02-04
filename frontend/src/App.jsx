import { useState } from 'react'; import Login from './components/Login'; import RiskPanel from './components/RiskPanel'; import SignalCard from './components/SignalCard'; import CalendarWidget from './components/CalendarWidget'; import Radar from './components/Radar'; import { api } from './api'; import { LayoutGrid } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('tm_key'));
  const [opportunities, setOpportunities] = useState([]);
  const [activeSignal, setActiveSignal] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [riskMode, setRiskMode] = useState('FIXED');
  const [strictMode, setStrictMode] = useState(true);
  
  const SWEEP_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD"];

  if (!apiKey) return <Login onLogin={(k) => { localStorage.setItem('tm_key', k); setApiKey(k); }} />;

  const runSweep = async () => {
    setScanning(true); setOpportunities([]);
    for (const p of SWEEP_PAIRS) {
      try {
        const data = await api.scan(p, '5min', apiKey);
        if (data.status !== 'WAIT') {
          if (strictMode && data.confidence < 70 && data.status !== 'FORMING') continue;
          setOpportunities(prev => [...prev, data].sort((a,b) => b.confidence - a.confidence));
        }
      } catch {}
    } setScanning(false);
  };

  const handleTradeComplete = (result, payout) => {
    if (result === 'WIN') setBalance(prev => prev - activeSignal.amount + payout);
    else if (result === 'LOSS') setBalance(prev => prev - activeSignal.amount);
    setActiveSignal(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex flex-col font-sans">
      <header className="flex justify-between items-center mb-6 mt-2"><div><h1 className="text-xl font-black text-white tracking-tighter">TRADEMIND <span className="text-primary">AI</span></h1><div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1"><LayoutGrid size={10} /> Binary Cockpit</div></div></header>
      <RiskPanel balance={balance} setBalance={setBalance} riskMode={riskMode} setRiskMode={setRiskMode} strictMode={strictMode} setStrictMode={setStrictMode} />
      {activeSignal ? <SignalCard data={activeSignal} apiKey={apiKey} onBack={() => setActiveSignal(null)} onTradeComplete={handleTradeComplete} /> : <><Radar opportunities={opportunities} scanning={scanning} onScan={runSweep} onSelect={setActiveSignal} />{!scanning && <CalendarWidget apiKey={apiKey} />}</>}
    </div>
  );
}
