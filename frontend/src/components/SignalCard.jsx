import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Clock, Check, X, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function SignalCard({ data, apiKey, onTradeComplete }) {
  const [phase, setPhase] = useState('DECISION'); // Phases: DECISION -> REASON -> ACTIVE -> RESULT
  const [timeLeft, setTimeLeft] = useState(0);

  // 1. Candle Countdown Timer
  useEffect(() => {
    if (!data.next_candle) return;
    
    const interval = setInterval(() => {
      const secondsRemaining = data.next_candle - Math.floor(Date.now() / 1000);
      setTimeLeft(secondsRemaining > 0 ? secondsRemaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [data.next_candle]);

  // Format seconds to MM:SS
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const isCall = data.direction === 'CALL';
  const colorClass = isCall ? 'text-bull' : 'text-bear';
  const bgClass = isCall ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20';

  // 2. Handling User Actions
  const handleSkip = async (reason) => {
    await api.logResult(data.signal_id, 'SKIPPED', 0, apiKey, reason);
    onTradeComplete('SKIPPED', 0);
  };

  const handleWin = async () => {
    const payout = prompt("💰 Enter Total Payout (e.g. 182):");
    if (!payout) return;
    await api.logResult(data.signal_id, 'WIN', Number(payout), apiKey);
    onTradeComplete('WIN', Number(payout));
  };

  const handleLoss = async () => {
    await api.logResult(data.signal_id, 'LOSS', 0, apiKey);
    onTradeComplete('LOSS', 0);
  };

  return (
    <div className={`rounded-2xl border ${bgClass} mb-6 overflow-hidden shadow-2xl animate-fade-in-up`}>
      
      {/* HEADER: Signal Info */}
      <div className="p-5 relative">
        <div className="absolute top-4 right-4 text-xs font-mono text-gray-500 flex items-center gap-1">
          <Clock size={12} /> {formatTime(timeLeft)}
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              {data.pair}
              <span className="text-[10px] font-mono text-black bg-primary px-2 py-1 rounded font-bold">
                {data.confidence}%
              </span>
            </h2>
            <div className={`text-sm font-bold mt-1 ${colorClass} flex items-center gap-1`}>
              {isCall ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
              {data.display_strength}
            </div>
          </div>
        </div>

        {/* STRATEGY BREAKDOWN */}
        <div className="space-y-1 mb-6 bg-black/30 p-3 rounded-lg border border-white/5">
          {Object.entries(data.details || {}).map(([k, v]) => (
            v !== 0 && (
              <div key={k} className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="text-gray-400">{k.replace(/_/g, ' ')}</span>
                <span className={`font-bold ${v > 0 ? 'text-bull' : 'text-bear'}`}>
                  {v > 0 ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            )
          ))}
        </div>

        {/* --- INTERACTION PANEL (The Cockpit) --- */}
        
        {/* PHASE 1: DID YOU TAKE THE TRADE? */}
        {phase === 'DECISION' && (
          <div>
            <div className="text-center text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
              Execution Confirmation
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPhase('ACTIVE')}
                className="py-3 bg-bull/10 hover:bg-bull/20 border border-bull/30 text-bull font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} /> EXECUTED
              </button>
              <button 
                onClick={() => setPhase('REASON')}
                className="py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> SKIPPED
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: WHY DID YOU SKIP? */}
        {phase === 'REASON' && (
          <div className="animate-fade-in">
            <div className="text-center text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
              Reason for Skipping
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Late Entry', 'Bad Spread', 'News Event', 'Gut Feeling'].map((r) => (
                <button 
                  key={r}
                  onClick={() => handleSkip(r)}
                  className="py-2 bg-surface border border-border hover:border-primary text-xs text-gray-300 rounded-lg transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPhase('DECISION')}
              className="w-full mt-2 text-[10px] text-gray-500 hover:text-white"
            >
              ← BACK
            </button>
          </div>
        )}

        {/* PHASE 3: ACTIVE TRADE MANAGEMENT */}
        {phase === 'ACTIVE' && (
          <div className="animate-fade-in">
             <div className="text-center mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-xs text-primary font-bold animate-pulse">TRADE ACTIVE</div>
                <div className="text-[10px] text-gray-400 mt-1">Wait for candle close</div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleLoss}
                className="py-4 bg-bear/10 hover:bg-bear/20 border border-bear/30 text-bear font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                LOSS
              </button>
              <button 
                onClick={handleWin}
                className="py-4 bg-bull/10 hover:bg-bull/20 border border-bull/30 text-bull font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                WIN
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}