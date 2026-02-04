import { useState, useEffect } from 'react';
import Login from './components/Login';
import RiskPanel from './components/RiskPanel';
import SignalCard from './components/SignalCard';
import CalendarWidget from './components/CalendarWidget';
import Radar from './components/Radar'; 
import { api } from './api';
import { LayoutGrid, Power } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('tm_key'));
  const [opportunities, setOpportunities] = useState([]); 
  const [activeSignal, setActiveSignal] = useState(null); 
  const [scanning, setScanning] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [riskMode, setRiskMode] = useState('FIXED');
  const [strictMode, setStrictMode] = useState(true);
  const [autoScan, setAutoScan] = useState(false); // ✅ NEW: Auto-Scan State

  const SWEEP_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD"];

  // ✅ NEW: Auto-Scan Timer (Triggers every 5 minutes)
  useEffect(() => {
    let interval;
    if (autoScan) {
      // Run immediately when turned on
      runSweep();
      // Then run every 5 minutes (300,000 ms)
      interval = setInterval(() => {
        runSweep();
      }, 300000);
    }
    return () => clearInterval(interval);
  }, [autoScan]);

  if (!apiKey) return <Login onLogin={(k) => { localStorage.setItem('tm_key', k); setApiKey(k); }} />;

  const runSweep = async () => {
    if (scanning) return; // Prevent double scanning
    setScanning(true);
    setOpportunities([]); 
    
    for (const p of SWEEP_PAIRS) {
      try {
        const data = await api.scan(p, '5min', apiKey);
        if (data.status !== 'WAIT') {
          if (strictMode && data.confidence < 70 && data.status !== 'FORMING') continue;
          setOpportunities(prev => [...prev, data].sort((a,b) => b.confidence - a.confidence));
        }
      } catch (e) { console.log("Skip", p); }
    }
    setScanning(false);
  };

  const handleTradeComplete = (result, payout) => {
    if (result === 'WIN') {
      setBalance(prev => prev - activeSignal.amount + payout);
    } else if (result === 'LOSS') {
      setBalance(prev => prev - activeSignal.amount);
    }
    setActiveSignal(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex flex-col font-sans">
      <header className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter">TRADEMIND <span className="text-primary">AI</span></h1>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1"><LayoutGrid size={10} /> Binary Cockpit</div>
        </div>
        
        {/* ✅ NEW: Auto-Pilot Toggle Button */}
        <button 
          onClick={() => setAutoScan(!autoScan)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${autoScan ? 'bg-primary text-black border-primary' : 'bg-gray-900 text-gray-500 border-gray-700'}`}
        >
          <Power size={12} /> {autoScan ? 'AUTO ON' : 'AUTO OFF'}
        </button>
      </header>

      <RiskPanel 
        balance={balance} 
        setBalance={setBalance}
        riskMode={riskMode}
        setRiskMode={setRiskMode}
        strictMode={strictMode}
        setStrictMode={setStrictMode}
      />

      {activeSignal ? (
        <SignalCard 
          data={activeSignal} 
          apiKey={apiKey} 
          onBack={() => setActiveSignal(null)}
          onTradeComplete={handleTradeComplete}
        />
      ) : (
        <>
          <Radar 
            opportunities={opportunities} 
            scanning={scanning} 
            onScan={runSweep}
            onSelect={setActiveSignal}
          />
          {!scanning && <CalendarWidget apiKey={apiKey} />}
        </>
      )}
    </div>
  );
}
