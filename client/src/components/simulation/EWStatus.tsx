import React, { useState } from 'react';
import { Radio, Zap, Shield, Navigation, AlertOctagon } from 'lucide-react';

interface EWStatusProps {
  hasEWDisruption?: boolean;
}

export const EWStatus: React.FC<EWStatusProps> = ({ hasEWDisruption = false }) => {
  const [activeTab, setActiveTab] = useState<'SPECTRUM' | 'DF_BEARING'>('SPECTRUM');

  // Simulated frequency bins: 30MHz to 300MHz
  const bins = [
    { freq: '30 MHz', power: 25, noise: 15 },
    { freq: '65 MHz', power: 30, noise: 18 },
    { freq: '110 MHz', power: 35, noise: 22 },
    { freq: '150 MHz', power: 45, noise: 28 },
    { freq: '200 MHz', power: 40, noise: 25 },
    { freq: '240 MHz', power: 55, noise: 32 },
    { freq: '284 MHz', power: 92, noise: 90, jammed: true }, // Targeted VHF Barrage
    { freq: '300 MHz', power: 50, noise: 35 },
  ];

  return (
    <div className="relative w-full h-[360px] bg-slate-950 rounded-lg border border-amber-900/60 p-3 overflow-hidden flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-mono text-amber-400 font-bold text-xs">ELECTRONIC WARFARE • SPECTRUM SURVEILLANCE & ESM</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('SPECTRUM')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
              activeTab === 'SPECTRUM'
                ? 'bg-amber-950 text-amber-300 border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            FFT SPECTRUM
          </button>
          <button
            onClick={() => setActiveTab('DF_BEARING')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
              activeTab === 'DF_BEARING'
                ? 'bg-amber-950 text-amber-300 border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            DF BEARING (320°)
          </button>
        </div>
      </div>

      {activeTab === 'SPECTRUM' ? (
        <div className="my-2">
          {/* Signal to Noise Ratio Bar */}
          <div className="flex items-center justify-between text-xs font-mono mb-2 text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>BATTERY COMMS CHANNEL: 284.5 MHz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">SNR:</span>
              <span className="text-red-400 font-bold">12 dB (UNRELIABLE)</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-bold">ECCM HOPPING: ACTIVE (500 H/s)</span>
            </div>
          </div>

          {/* FFT Spectrum Bars */}
          <div className="bg-black/80 rounded border border-amber-900/40 p-3 h-44 flex items-end justify-between gap-3">
            {bins.map((bin, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                {bin.jammed && (
                  <span className="text-[9px] font-mono text-red-400 font-bold animate-bounce mb-1">
                    JAMMER
                  </span>
                )}
                <div
                  className={`w-full rounded-t transition-all ${
                    bin.jammed
                      ? 'bg-red-500 shadow-lg shadow-red-500/50'
                      : 'bg-amber-500/70 hover:bg-amber-400'
                  }`}
                  style={{ height: `${bin.power}%` }}
                />
                <span className="text-[9px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                  {bin.freq}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DF Bearing Triangulation View */
        <div className="my-2 bg-black/80 rounded border border-amber-900/40 p-3 h-52 flex items-center justify-around font-mono text-xs">
          <div className="relative w-36 h-36 rounded-full border border-amber-600 flex items-center justify-center">
            {/* Compass labels */}
            <span className="absolute top-1 text-[9px] text-amber-400">N 000°</span>
            <span className="absolute right-1 text-[9px] text-amber-400">E 090°</span>
            <span className="absolute bottom-1 text-[9px] text-amber-400">S 180°</span>
            <span className="absolute left-1 text-[9px] text-amber-400">W 270°</span>
            {/* Bearing Line 320 degrees */}
            <div
              className="absolute w-28 h-0.5 bg-red-500 origin-center"
              style={{ transform: 'rotate(-40deg)' }}
            />
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 z-10 animate-ping" />
          </div>

          <div className="flex flex-col gap-2 max-w-[260px] text-slate-300">
            <div className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-red-400 rotate-[-40deg]" />
              FIXED EMITTER: BEARING 320°
            </div>
            <div className="text-[11px] text-slate-400">
              Station Alpha & Charlie cross-bearing fixes vehicle-mounted hostile barrage jammer at:
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-amber-400 text-xs font-bold">
              GRID: 4108-8320 (ELEV 3,120M)
            </div>
            <div className="text-[10px] text-emerald-400">
              Confidence: 86% • Tactical Artillery vector recommended
            </div>
          </div>
        </div>
      )}

      {/* Footer Alert */}
      <div className="bg-amber-950/40 border border-amber-900/80 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-amber-300">
        <span className="flex items-center gap-1">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          ESM Intercept Advisory: Hostile jammer attempting VHF voice suppression.
        </span>
        <span className="text-slate-400">SIGINT REGISTRY EV-EW-02</span>
      </div>
    </div>
  );
};
