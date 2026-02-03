import { useState, useEffect } from 'react';
import Login from './components/Login';
import RiskPanel from './components/RiskPanel';
import SignalCard from './components/SignalCard';
import { api } from './api';
import { Search, BarChart3, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('tm_key'));
  const [pair, setPair] = useState('EUR/USD');
  const [pairList, setPairList] = useState([]); 
  const [currentSignal, setCurrentSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(10000); 

  // Load Pairs on Start
  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getPairs();
        setPairList(data.pairs);
        if (data.pairs?.length > 0) setPair(data.pairs[0]);
      } catch (e) {
        setPairList(["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD"]); 
      }
    }
    loadConfig();
  }, []);

  if (!apiKey) {
    return <Login onLogin={(k) => { localStorage.setItem('tm_key', k); setApiKey(k); }} />;
  }

  const scan = async () => {
    setLoading(true);
    setCurrentSignal(null); // Reset previous signal
    try {
      const data = await api.scan(pair, '5min', apiKey);
      
      // LOGIC: Backend now returns 'WAIT' for forming signals or 'SIGNAL' for confirmed
      if (data.status === 'SIGNAL') {
        setCurrentSignal(data);
      } else {
        // Show the "FORMING" state as a temporary alert or small card
        alert(`⚠️ SIGNAL FORMING (${data.confidence}%)\nReason: ${data.strategy_breakdown?.filter || 'Wait for confirmation'}`);
      }
    } catch (e) {
      alert("❌ Scan Failed. Check connection.");
    }
    setLoading(false);
  };

  const handleTradeComplete = (result, payout) => {
    // Only update balance if trade was actually taken (WIN/LOSS)
    // SKIPPED trades do not affect balance
    if (result === 'WIN') {
      const invested = currentSignal.amount;
      setBalance(prev => prev - invested + payout);
    } else if (result === 'LOSS') {
      const invested = currentSignal.amount;
      setBalance(prev => prev - invested);
    }
    setCurrentSignal(null); // Clear card to get ready for next scan
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter">
            TRADEMIND <span className="text-primary">V1</span>
          </h1>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            Decision Cockpit
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-2 py-1 bg-surface rounded text-[10px] font-mono text-gray-400 border border-border">
             M5
           </div>
           {pairList.length > 0 ? <Wifi size={14} className="text-bull" /> : <WifiOff size={14} className="text-bear" />}
        </div>
      </header>

      {/* --- RISK ENGINE --- */}
      <RiskPanel balance={balance} nextTrade={Math.round(balance * 0.02)} />

      {/* --- SCANNER (LIVE OPPORTUNITIES ENTRY) --- */}
      {!currentSignal && (
        <div className="bg-surface p-5 rounded-2xl border border-border mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-3 block tracking-wider flex items-center gap-2">
             <BarChart3 size={12} /> Market Scanner
          </label>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select 
                value={pair} 
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-black text-white font-mono text-lg p-4 rounded-xl border border-border outline-none focus:border-primary appearance-none transition-all"
              >
                {pairList.length > 0 ? (
                  pairList.map(p => <option key={p} value={p}>{p}</option>)
                ) : (
                  <option>Loading...</option>
                )}
              </select>
            </div>
            
            <button 
              onClick={scan}
              disabled={loading}
              className="bg-primary text-black px-6 rounded-xl font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              {loading ? <span className="animate-spin block text-xl">↻</span> : <Search size={24} />}
            </button>
          </div>
        </div>
      )}

      {/* --- ACTIVE SIGNAL COCKPIT --- */}
      {currentSignal ? (
        <SignalCard 
          data={currentSignal} 
          apiKey={apiKey}
          onTradeComplete={handleTradeComplete}
        />
      ) : (
        !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-700 space-y-4 opacity-40">
            <Search size={48} strokeWidth={1} />
            <p className="text-xs font-mono tracking-widest">SCAN TO FIND OPPORTUNITIES</p>
          </div>
        )
      )}
    </div>
  );
}