'use client';

import { useState, useEffect } from 'react';

// Pixel Art Baby SVG Component (inline for demo)
function PixelBaby({ state = 'happy' }: { state?: 'happy' | 'sleeping' | 'mining' | 'evolving' }) {
  const stateClasses = {
    happy: 'animate-pixel-float',
    sleeping: 'baby-sleeping',
    mining: 'animate-pixel-glow',
    evolving: 'baby-evolving',
  };

  return (
    <div className={`relative ${stateClasses[state]}`}>
      {/* 64x64 Pixel Baby - Simple cute design */}
      <svg
        width="192"
        height="192"
        viewBox="0 0 16 16"
        className="baby-avatar-xl"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Body (yellow/gold) */}
        <rect x="5" y="8" width="6" height="5" fill="#f7931a" />
        <rect x="4" y="9" width="1" height="3" fill="#f7931a" />
        <rect x="11" y="9" width="1" height="3" fill="#f7931a" />

        {/* Head */}
        <rect x="4" y="3" width="8" height="6" fill="#ffc107" />
        <rect x="3" y="4" width="1" height="4" fill="#ffc107" />
        <rect x="12" y="4" width="1" height="4" fill="#ffc107" />

        {/* Eyes */}
        <rect x="5" y="5" width="2" height="2" fill="#1f2937" />
        <rect x="9" y="5" width="2" height="2" fill="#1f2937" />
        {/* Eye shine */}
        <rect x="5" y="5" width="1" height="1" fill="#ffffff" />
        <rect x="9" y="5" width="1" height="1" fill="#ffffff" />

        {/* Mouth (happy) */}
        <rect x="6" y="7" width="1" height="1" fill="#1f2937" />
        <rect x="9" y="7" width="1" height="1" fill="#1f2937" />
        <rect x="7" y="8" width="2" height="1" fill="#1f2937" />

        {/* Cheeks (blush) */}
        <rect x="3" y="6" width="1" height="1" fill="#ff9999" />
        <rect x="12" y="6" width="1" height="1" fill="#ff9999" />

        {/* Feet */}
        <rect x="5" y="13" width="2" height="1" fill="#e67e00" />
        <rect x="9" y="13" width="2" height="1" fill="#e67e00" />

        {/* Bitcoin symbol on body */}
        <rect x="7" y="9" width="2" height="3" fill="#1f2937" />
        <rect x="6" y="10" width="1" height="1" fill="#1f2937" />
        <rect x="9" y="10" width="1" height="1" fill="#1f2937" />

        {/* Antenna/Horn */}
        <rect x="7" y="1" width="2" height="2" fill="#4fc3f7" />
        <rect x="8" y="0" width="1" height="1" fill="#81d4fa" />
      </svg>

      {/* Mining sparkles when mining */}
      {state === 'mining' && (
        <>
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-pixel-primary animate-ping" />
          <div className="absolute -top-1 -right-3 w-2 h-2 bg-pixel-secondary animate-ping delay-100" />
          <div className="absolute -bottom-2 left-4 w-2 h-2 bg-pixel-success animate-ping delay-200" />
        </>
      )}

      {/* Z's when sleeping */}
      {state === 'sleeping' && (
        <div className="absolute -top-4 right-0 font-pixel text-pixel-secondary text-xs animate-pixel-float">
          Zzz
        </div>
      )}
    </div>
  );
}

// Stats Bar Component
function StatsBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-pixel text-[10px]">
        <span className="text-pixel-text-muted">{label}</span>
        <span className="text-pixel-text">{value}/{max}</span>
      </div>
      <div className="h-4 bg-pixel-bg-dark border-2 border-pixel-border overflow-hidden">
        <div
          className={`h-full ${color} transition-[width] duration-300`}
          style={{ width: `${percentage}%`, transitionTimingFunction: 'steps(10)' }}
        />
      </div>
    </div>
  );
}

// Mining Stats Component
function MiningStats({ hashrate, isActive }: { hashrate: number; isActive: boolean }) {
  return (
    <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4 shadow-[8px_8px_0_0_#000]">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-4 h-4 ${isActive ? 'bg-pixel-success animate-pulse' : 'bg-pixel-border'}`} />
        <span className="font-pixel text-xs text-pixel-text-muted">
          {isActive ? 'MINING' : 'IDLE'}
        </span>
      </div>
      <div className="font-pixel-mono text-4xl text-pixel-success">
        {hashrate.toLocaleString()} <span className="text-lg text-pixel-text-muted">H/s</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [babyState, setBabyState] = useState<'happy' | 'sleeping' | 'mining' | 'evolving'>('happy');
  const [isMining, setIsMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [stats, setStats] = useState({
    level: 1,
    xp: 45,
    xpMax: 100,
    energy: 80,
    happiness: 90,
  });

  // Simulate mining
  useEffect(() => {
    if (isMining) {
      setBabyState('mining');
      const interval = setInterval(() => {
        setHashrate(prev => {
          const variation = Math.floor(Math.random() * 200) - 100;
          return Math.max(0, prev + variation);
        });
        setStats(prev => ({
          ...prev,
          xp: Math.min(prev.xpMax, prev.xp + 1),
          energy: Math.max(0, prev.energy - 0.5),
        }));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setHashrate(0);
      setBabyState('happy');
    }
  }, [isMining]);

  const toggleMining = () => {
    setIsMining(prev => !prev);
    if (!isMining) {
      setHashrate(1250 + Math.floor(Math.random() * 500));
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pixel-primary border-2 border-black flex items-center justify-center">
              <span className="font-pixel text-pixel-text-dark text-xs">B</span>
            </div>
            <h1 className="font-pixel text-lg md:text-xl text-pixel-primary">
              BITCOIN<span className="text-pixel-secondary">BABY</span>
            </h1>
          </div>

          <nav className="flex gap-2">
            <a href="/wallet" className="px-3 py-2 font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary transition-colors">
              WALLET
            </a>
            <a href="/characters" className="px-3 py-2 font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary transition-colors">
              CHARS
            </a>
            <a href="/wallet" className="px-3 py-2 font-pixel text-[8px] bg-pixel-primary text-pixel-text-dark border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] transition-all">
              CONNECT
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left: Baby Display */}
        <div className="flex flex-col items-center">
          {/* Baby Card */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-8 shadow-[8px_8px_0_0_#000] w-full max-w-sm">
            {/* Level Badge */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-pixel text-[10px] px-2 py-1 bg-pixel-secondary text-pixel-text-dark border-2 border-black">
                LVL {stats.level}
              </span>
              <span className="font-pixel text-[10px] text-pixel-text-muted">
                {babyState.toUpperCase()}
              </span>
            </div>

            {/* Baby */}
            <div className="flex justify-center mb-6">
              <PixelBaby state={babyState} />
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <StatsBar label="XP" value={stats.xp} max={stats.xpMax} color="bg-pixel-secondary" />
              <StatsBar label="ENERGY" value={stats.energy} max={100} color="bg-pixel-success" />
              <StatsBar label="HAPPY" value={stats.happiness} max={100} color="bg-baby-happy" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setBabyState(prev => prev === 'sleeping' ? 'happy' : 'sleeping')}
              className="px-4 py-2 font-pixel text-[8px] bg-baby-sleeping text-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] transition-all"
            >
              SLEEP
            </button>
            <button
              onClick={() => setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10) }))}
              className="px-4 py-2 font-pixel text-[8px] bg-baby-happy text-pixel-text-dark border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] transition-all"
            >
              PLAY
            </button>
            <button
              onClick={() => setStats(prev => ({ ...prev, energy: Math.min(100, prev.energy + 20) }))}
              className="px-4 py-2 font-pixel text-[8px] bg-baby-hungry text-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] transition-all"
            >
              FEED
            </button>
          </div>
        </div>

        {/* Right: Mining Panel */}
        <div className="space-y-6">
          {/* Mining Stats */}
          <MiningStats hashrate={hashrate} isActive={isMining} />

          {/* Mining Control */}
          <button
            onClick={toggleMining}
            className={`w-full py-4 font-pixel text-sm border-4 border-black shadow-[4px_4px_0_0_#000] transition-all
              ${isMining
                ? 'bg-pixel-error text-white hover:bg-pixel-error-dark'
                : 'bg-pixel-success text-pixel-text-dark hover:bg-pixel-success-dark'
              }
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]
            `}
          >
            {isMining ? 'STOP MINING' : 'START MINING'}
          </button>

          {/* Mining Info Card */}
          <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4 shadow-[8px_8px_0_0_#000]">
            <h3 className="font-pixel text-xs text-pixel-primary mb-4">MINING INFO</h3>

            <div className="space-y-3 font-pixel-body text-sm">
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">Pool</span>
                <span className="text-pixel-text">BitcoinOS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">Worker</span>
                <span className="text-pixel-text font-pixel-mono">CPU-1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">Shares</span>
                <span className="text-pixel-success font-pixel-mono">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pixel-text-muted">$BABY Balance</span>
                <span className="text-pixel-primary font-pixel-mono">0.00</span>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="bg-pixel-bg-light border-4 border-dashed border-pixel-border p-4">
            <p className="font-pixel text-[8px] text-pixel-text-muted text-center">
              COMING SOON: AI LEARNING & EVOLUTION
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-12 pt-6 border-t-2 border-pixel-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            Built on Bitcoin with Charms Protocol
          </p>
          <div className="flex gap-4">
            <a href="#" className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary">
              DOCS
            </a>
            <a href="#" className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary">
              GITHUB
            </a>
            <a href="#" className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary">
              DISCORD
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
