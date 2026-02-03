import { useState, useEffect } from 'react';
import Login from './components/Login';
import RiskPanel from './components/RiskPanel';
import SignalCard from './components/SignalCard';
import { api } from './api';
import { Search, BarChart3, Wifi, WifiOff, LayoutGrid } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('tm_key'));
  const [pair, setPair] = useState('EUR/USD');
  const [pairList, setPairList] = useState([]); 
  const [currentSignal, setCurrentSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(10000); 

  // Categorize Pairs Logic
  const categories = {
    "Forex Majors": ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD"],
    "Crypto Assets": ["BTC/USD", "ETH/USD", "LTC/USD", "XRP/USD"],
    "Commodities": ["XAU/USD", "XAG/USD"],
    "Forex Minors": [] // Will hold the rest
  };

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getPairs();
        const allPairs = data.pairs || [];
        setPairList(allPairs);
        
        // Ensure default is valid
        if (allPairs.length > 0) setPair(allPairs[0]);
      } catch (e) {
        // Fallback if API fails
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
    setCurrentSignal(null);
    try {
      const data = await api.scan(pair, '5min', apiKey);
      
      if (data.status === 'SIGNAL') {
        setCurrentSignal(data);
      } else {
        // More professional alert
        const reason = data.reason || data.strategy_breakdown?.filter || 'Market Structure Weak';
        alert(`⚠️ NO TRADE (${data.confidence}%)\nStatus: ${data.status}\nReason: ${reason}`);
      }
    } catch (e) {
      alert("❌ Connection Error. Is Backend awake?");
    }
    setLoading(false);
  };

  const handleTradeComplete = (result, payout) => {
    if (result === 'WIN') {
      const invested = currentSignal.amount;
      setBalance(prev => prev - invested + payout);
    } else if (result === 'LOSS') {
      const invested = currentSignal.amount;
      setBalance(prev => prev - invested);
    }
    setCurrentSignal(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter">
            TRADEMIND <span className="text-primary">OS</span>
          </h1>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1">
            <LayoutGrid size={10} /> Institutional Terminal
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

      {/* --- CATEGORIZED SCANNER --- */}
      {!currentSignal && (
        <div className="bg-surface p-5 rounded-2xl border border-border mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-3 block tracking-wider flex items-center gap-2">
             <BarChart3 size={12} /> Asset Selector
          </label>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select 
                value={pair} 
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-black text-white font-mono text-lg p-4 rounded-xl border border-border outline-none focus:border-primary appearance-none transition-all"
              >
                {/* Dynamically Categorized Options */}
                {Object.entries(categories).map(([category, items]) => (
                  <optgroup key={category} label={category} className="bg-zinc-900 text-gray-400 font-sans font-bold">
                    {pairList
                      .filter(p => {
                        if (category === "Forex Minors") {
                          // If not in other lists, it's a minor
                          return !categories["Forex Majors"].includes(p) && 
                                 !categories["Crypto Assets"].includes(p) && 
                                 !categories["Commodities"].includes(p);
                        }
                        return items.includes(p);
                      })
                      .map(p => (
                        <option key={p} value={p} className="text-white font-mono">{p}</option>
                      ))
                    }
                  </optgroup>
                ))}
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
          
          <div className="mt-3 flex justify-center">
            <span className="text-[10px] text-gray-600 font-mono">
              MODE: SNIPER (Safe for Free Server)
            </span>
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
            <div className="w-16 h-16 border border-gray-800 rounded-full flex items-center justify-center">
                <Search size={32} strokeWidth={1} />
            </div>
            <p className="text-xs font-mono tracking-widest uppercase">Select Asset & Scan</p>
          </div>
        )
      )}
    </div>
  );
}
