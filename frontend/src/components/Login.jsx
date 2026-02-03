import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [key, setKey] = useState('');

  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm p-8 bg-surface border border-border rounded-2xl text-center shadow-2xl">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">TRADEMIND OS</h1>
        <p className="text-gray-500 text-xs font-mono mb-6 uppercase tracking-widest">Restricted Access Terminal</p>
        
        <input 
          type="password" 
          placeholder="ENTER API KEY"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full bg-black border border-border p-4 rounded-xl text-center font-mono text-white focus:border-primary outline-none transition-all placeholder:text-gray-700"
        />
        
        <button 
          onClick={() => onLogin(key)}
          className="w-full mt-4 bg-primary text-black font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          AUTHENTICATE
        </button>
      </div>
    </div>
  );
}