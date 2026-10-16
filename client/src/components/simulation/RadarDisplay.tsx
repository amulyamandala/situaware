import React, { useState } from 'react';
import { Radio, Plane, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RadarDisplayProps {
  hasAirDisruption?: boolean;
}

export const RadarDisplay: React.FC<RadarDisplayProps> = ({ hasAirDisruption = false }) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>('TRK-9041');
  const [iffMode, setIffMode] = useState<'INTERROGATING' | 'UNKNOWN' | 'FRIENDLY'>('INTERROGATING');

  return (
    <div className="relative w-full h-[360px] bg-black rounded-lg border border-cyan-900/60 overflow-hidden flex items-center justify-center select-none">
      {/* Radar Status Bar */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-black/80 backdrop-blur px-3 py-1.5 rounded border border-cyan-900 text-xs">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-mono text-cyan-400 font-bold">AIR DOMAIN • 2D PRIMARY SURVEILLANCE RADAR</span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-300 font-mono text-[11px]">RANGE: 300 KM</span>
        {hasAirDisruption && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400 animate-spin" /> DELAYED FEED (+25s)
          </span>
        )}
      </div>

      {/* Radar Mode Buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setIffMode('INTERROGATING')}
          className={`px-2 py-1 rounded text-[11px] font-mono border ${
            iffMode === 'INTERROGATING'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
              : 'bg-black/60 text-slate-400 border-slate-800'
          }`}
        >
          IFF INT
        </button>
        <button
          onClick={() => setIffMode(iffMode === 'FRIENDLY' ? 'UNKNOWN' : 'FRIENDLY')}
          className={`px-2 py-1 rounded text-[11px] font-mono border ${
            iffMode === 'FRIENDLY'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
              : 'bg-amber-950 text-amber-300 border-amber-500'
          }`}
        >
          {iffMode}
        </button>
      </div>

      {/* Radar SVG PPI Display */}
      <svg className="w-[340px] h-[340px]" viewBox="-200 -200 400 400">
        <defs>
          {/* Radar Sweep Gradient */}
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Ring & Compass */}
        <circle cx="0" cy="0" r="180" fill="#041219" stroke="#164e63" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="120" fill="none" stroke="#0e7490" strokeWidth="1" strokeDasharray="3,3" />
        <circle cx="0" cy="0" r="60" fill="none" stroke="#0e7490" strokeWidth="1" strokeDasharray="3,3" />

        {/* Range Labels */}
        <text x="5" y="-62" fill="#06b6d4" fontSize="8" fontFamily="monospace">100 KM</text>
        <text x="5" y="-122" fill="#06b6d4" fontSize="8" fontFamily="monospace">200 KM</text>
        <text x="5" y="-182" fill="#06b6d4" fontSize="8" fontFamily="monospace">300 KM</text>

        {/* Crosshair Axes */}
        <line x1="-180" y1="0" x2="180" y2="0" stroke="#164e63" strokeWidth="1" />
        <line x1="0" y1="-180" x2="0" y2="180" stroke="#164e63" strokeWidth="1" />

        {/* Bearing Degree Marks */}
        <text x="-10" y="-185" fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="monospace">360°</text>
        <text x="185" y="4" fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="monospace">090°</text>
        <text x="-10" y="195" fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="monospace">180°</text>
        <text x="-198" y="4" fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="monospace">270°</text>

        {/* Rotating Radar Sweep Beam */}
        <g className="origin-center animate-[spin_4s_linear_infinite]">
          <line x1="0" y1="0" x2="0" y2="-180" stroke="#22d3ee" strokeWidth="1.8" />
          <path d="M 0 0 L -60 -170 A 180 180 0 0 1 0 -180 Z" fill="url(#sweepGrad)" />
        </g>

        {/* Center Radar Site */}
        <circle cx="0" cy="0" r="3" fill="#22d3ee" />
        <circle cx="0" cy="0" r="7" fill="none" stroke="#22d3ee" strokeWidth="1" />

        {/* Airway Corridor Lines */}
        <line x1="-140" y1="-140" x2="140" y2="140" stroke="#155e75" strokeWidth="1" strokeDasharray="4,4" />

        {/* Checkpoints (Orange Triangles) */}
        <g transform="translate(-100, 110)">
          <polygon points="0,-7 6,5 -6,5" fill="#f59e0b" />
          <text x="-9" y="16" fill="#fbbf24" fontSize="8" fontFamily="monospace">CP1</text>
        </g>
        <g transform="translate(90, -40)">
          <polygon points="0,-7 6,5 -6,5" fill="#f59e0b" />
          <text x="-9" y="16" fill="#fbbf24" fontSize="8" fontFamily="monospace">CP4</text>
        </g>

        {/* Target Track: TRK-9041 (Inbound Low-RCS Contact) */}
        <g
          transform="translate(45, -85)"
          onClick={() => setSelectedTrack('TRK-9041')}
          className="cursor-pointer"
        >
          <circle r="6" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
          <polygon points="0,-6 6,0 0,6 -6,0" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
          {/* Flight Data Block */}
          <line x1="6" y1="-6" x2="25" y2="-20" stroke="#f87171" strokeWidth="1" />
          <rect x="25" y="-35" width="75" height="28" fill="#000000" stroke="#ef4444" strokeWidth="1" rx="2" />
          <text x="28" y="-24" fill="#fca5a5" fontSize="8" fontWeight="bold" fontFamily="monospace">
            TRK-9041
          </text>
          <text x="28" y="-12" fill="#fca5a5" fontSize="7.5" fontFamily="monospace">
            2200m • 510kt
          </text>
        </g>

        {/* Friendly CAP Pair: VIPER-01 */}
        <g
          transform="translate(-60, -40)"
          onClick={() => setSelectedTrack('VIPER FLIGHT (CAP)')}
          className="cursor-pointer"
        >
          <circle cx="0" cy="0" r="4" fill="#10b981" />
          <line x1="0" y1="0" x2="-20" y2="-15" stroke="#34d399" strokeWidth="1.5" />
          <text x="-70" y="-18" fill="#6ee7b7" fontSize="8" fontWeight="bold" fontFamily="monospace">
            VIPER-CAP [4.5k]
          </text>
        </g>

        {/* Surveillance Drone: ZB-988 */}
        <g
          transform="translate(-80, 50)"
          onClick={() => setSelectedTrack('ZB-988 (Surveillance UAV)')}
          className="cursor-pointer"
        >
          <polygon points="-4,-4 4,-4 0,4" fill="#06b6d4" />
          <text x="-45" y="16" fill="#67e8f9" fontSize="7.5" fontFamily="monospace">
            ZB-988 • MODE-5
          </text>
        </g>
      </svg>

      {/* Track Telemetry Inspector Panel */}
      {selectedTrack && (
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 backdrop-blur px-3 py-2 rounded border border-cyan-800 text-xs flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Plane className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="font-semibold text-slate-100">{selectedTrack}</span>
              <span className="text-slate-400 ml-2 font-mono">HDG: 210° | ALT: 2,200m | SPD: 510 kts</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                selectedTrack.includes('TRK')
                  ? 'bg-red-950 text-red-300 border-red-500'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500'
              }`}
            >
              {selectedTrack.includes('TRK') ? 'HOSTILE SUSPECT' : 'FRIENDLY BLUFOR'}
            </span>
          </div>
          <button
            onClick={() => setSelectedTrack(null)}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
