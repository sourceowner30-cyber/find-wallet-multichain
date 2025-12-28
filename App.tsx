import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SUPPORTED_CHAINS, BIP39_WORDS } from './constants';
import { Chain, WalletScanResult, ScanLog } from './types';

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedChains, setSelectedChains] = useState<string[]>(['btc', 'usdt', 'eth', 'ltc', 'bnb', 'sol', 'trx']);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [hits, setHits] = useState<WalletScanResult[]>([]);
  const [stats, setStats] = useState({
    checked: 0,
    found: 0,
    startTime: 0
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const generateMnemonic = useCallback(() => {
    const words: string[] = [];
    for (let i = 0; i < 12; i++) {
      words.push(BIP39_WORDS[Math.floor(Math.random() * BIP39_WORDS.length)]);
    }
    return words.join(' ');
  }, []);

  const handleStart = () => {
    setIsScanning(true);
    setIsPaused(false);
    if (stats.startTime === 0) {
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleStop = () => {
    setIsScanning(false);
    setIsPaused(false);
    setStats({ checked: 0, found: 0, startTime: 0 });
    setLogs([]);
    setHits([]);
  };

  useEffect(() => {
    let interval: number;
    if (isScanning && !isPaused) {
      interval = window.setInterval(() => {
        const mnemonic = generateMnemonic();
        const isHit = Math.random() < 0.0001; // Simulation odds
        
        const newLog: ScanLog = {
          id: Math.random().toString(36).substr(2, 9),
          text: `Wallet check: ${mnemonic}`,
          type: isHit ? 'success' : 'info'
        };

        if (isHit) {
          const chain = SUPPORTED_CHAINS[Math.floor(Math.random() * SUPPORTED_CHAINS.length)];
          const amount = (Math.random() * 5000).toFixed(2);
          const hit: WalletScanResult = {
            id: newLog.id,
            mnemonic,
            address: '0x' + Math.random().toString(16).substr(2, 40),
            balance: parseFloat(amount),
            chain: chain.symbol,
            timestamp: Date.now()
          };
          setHits(prev => [hit, ...prev]);
          setStats(prev => ({ ...prev, found: prev.found + 1 }));
        }

        setLogs(prev => [...prev.slice(-30), newLog]);
        setStats(prev => ({ ...prev, checked: prev.checked + 1 }));
      }, 30); // High speed scanning simulation
    }
    return () => clearInterval(interval);
  }, [isScanning, isPaused, generateMnemonic]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#E0E0E0] p-4 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Header Section */}
      <header className="flex justify-between items-center mb-8 px-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">
            ● FULL SEED FINDER <span className="text-gray-500 font-mono text-sm ml-1">V.2.0</span>
          </h1>
        </div>
        <div className="text-lg font-mono font-bold">
          Checked: <span className="text-gray-300 ml-2">{stats.checked.toLocaleString()}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">
        
        {/* Left Control & Icons Column */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          
          {/* Icons Grid */}
          <div className="grid grid-cols-3 gap-6 p-4">
            {SUPPORTED_CHAINS.map((chain) => (
              <div 
                key={chain.id}
                className="group relative flex flex-col items-center justify-center p-4 rounded-full border-2 border-gray-800 bg-[#1A1A1A] w-20 h-20 mx-auto transition-all hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <span className="text-2xl font-bold" style={{ color: chain.color }}>{chain.icon}</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111111]"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-4 px-2 mt-4">
            <button 
              onClick={handleStart}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 px-2 rounded uppercase text-xs tracking-widest shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-[10px]">🔍</span> START
            </button>
            <button 
              onClick={handlePause}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-bold py-3 px-2 rounded uppercase text-xs tracking-widest shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-[10px]">Ⅱ</span> {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <button 
              onClick={handleStop}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 px-2 rounded uppercase text-xs tracking-widest shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              STOP
            </button>
          </div>

          <div className="px-2">
            <button className="w-full bg-[#333] hover:bg-[#444] text-white font-bold py-3 rounded uppercase text-xs tracking-widest border border-white/10 flex items-center justify-center gap-2">
              <span className="text-sm">🔑</span> CONNECT WALLET
            </button>
          </div>

          {/* Found List Box */}
          <div className="flex-1 bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-[#222] p-3 border-b border-gray-800">
              <h3 className="text-green-500 font-bold uppercase text-sm tracking-widest">
                Found: {stats.found}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {hits.map(hit => (
                <div key={hit.id} className="border border-green-500/30 bg-green-500/5 p-3 rounded-lg animate-in fade-in slide-in-from-left duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-green-400">{hit.chain} - {hit.balance}$</span>
                    <span className="text-[10px] text-gray-500">obey correctly</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 break-words line-clamp-2 italic">
                    {hit.mnemonic}
                  </div>
                </div>
              ))}
              {hits.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <div className="text-4xl mb-2">💎</div>
                  <p className="text-[10px] uppercase font-bold">Scanning for assets...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Console Output Column */}
        <div className="lg:col-span-8 bg-[#1A1A1A] border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-[#222] p-4 border-b border-gray-800 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
              Live Network Feed
            </span>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#333]"></div>
              <div className="w-3 h-3 rounded-full bg-[#333]"></div>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 p-6 font-mono text-[11px] leading-relaxed overflow-y-auto scrollbar-hide space-y-1 bg-black/40"
          >
            {logs.length === 0 && (
              <div className="text-gray-700 italic">SYSTEM IDLE. Awaiting instruction...</div>
            )}
            {logs.map(log => (
              <div key={log.id} className={`${log.type === 'success' ? 'text-green-400 font-bold bg-green-500/10' : 'text-gray-400'} py-0.5 border-b border-white/5`}>
                <span className="text-gray-600 mr-2">>>></span> {log.text}
              </div>
            ))}
          </div>

          <div className="p-2 bg-black/60 border-t border-gray-800 flex justify-between items-center px-4 text-[9px] font-mono text-gray-500">
            <div className="flex gap-4">
              <span>STATUS: {isScanning ? 'ACTIVE' : 'IDLE'}</span>
              <span>NETWORK: STABLE</span>
            </div>
            <span>V2.0.4 - SENTINEL_CORE</span>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
};

export default App;