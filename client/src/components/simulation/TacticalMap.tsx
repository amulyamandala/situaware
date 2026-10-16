import React, { useState } from 'react';
import { Compass, ZoomIn, ZoomOut, Layers, ShieldAlert, Crosshair } from 'lucide-react';

interface TacticalMapProps {
  activeSector?: string;
  hasLandDisruption?: boolean;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ activeSector = 'Sector Bravo', hasLandDisruption = false }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[360px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden select-none">
      {/* Top Overlay Bar */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-situ-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/80 text-xs">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono text-emerald-400 font-semibold">LAND DOMAIN • TACTICAL SITUATION</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-300 font-mono">GRID: 34.15° N, 77.58° E</span>
        {hasLandDisruption && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-mono flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> INTEL CONFLICT
          </span>
        )}
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
          className="p-1.5 bg-situ-900/90 hover:bg-situ-800 text-slate-300 rounded border border-slate-700"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          className="p-1.5 bg-situ-900/90 hover:bg-situ-800 text-slate-300 rounded border border-slate-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Tactical Map Canvas */}
      <svg
        className="w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
        viewBox="0 0 800 450"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
          <marker id="hostile-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>

        {/* Background Grid */}
        <rect width="800" height="450" fill="#090e17" />
        <rect width="800" height="450" fill="url(#grid)" />

        {/* Topographic Contour Lines */}
        <path d="M 50,220 Q 200,180 350,240 T 650,200" fill="none" stroke="#1e3250" strokeWidth="1.5" strokeDasharray="4,4" />
        <path d="M 80,140 Q 220,100 400,160 T 700,120" fill="none" stroke="#1e3250" strokeWidth="1" />
        <path d="M 120,320 Q 280,260 480,330 T 750,280" fill="none" stroke="#1e3250" strokeWidth="1" />

        {/* Valley Pass Corridor (Primary Route) */}
        <path
          d="M 100,380 C 220,340 320,290 440,240 S 620,160 720,120"
          fill="none"
          stroke="#475569"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 100,380 C 220,340 320,290 440,240 S 620,160 720,120"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="6,4"
        />

        {/* Alternate Bypass Route Charlie */}
        <path
          d="M 100,380 C 180,410 320,420 450,380 S 600,320 680,260"
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeDasharray="8,4"
        />
        <text x="320" y="425" fill="#10b981" fontSize="10" fontFamily="monospace">
          VALLEY BYPASS ROUTE CHARLIE (OPEN)
        </text>

        {/* Ridge Pass Obstacle Barricade Marker */}
        <g
          transform="translate(440, 240)"
          onClick={() => setSelectedUnit('Ridge Pass Barricade')}
          className="cursor-pointer"
        >
          <circle r="16" fill="#ef4444" fillOpacity="0.15" />
          <polygon points="-8,8 0,-8 8,8" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
          <text x="14" y="4" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {hasLandDisruption ? '⚠️ PASS STATUS CONFLICT' : 'MINE BARRIER (EV-LAND-01)'}
          </text>
        </g>

        {/* Friendly Units (BLUFOR Blue Rectangles) */}
        {/* Unit 1: 14th Mech Recon Staging */}
        <g
          transform="translate(180, 340)"
          onClick={() => setSelectedUnit('14th Mech Battalion (Staging)')}
          className="cursor-pointer"
        >
          <rect x="-16" y="-12" width="32" height="24" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" rx="2" />
          <line x1="-16" y1="-12" x2="16" y2="12" stroke="#60a5fa" strokeWidth="1" />
          <line x1="-16" y1="12" x2="16" y2="-12" stroke="#60a5fa" strokeWidth="1" />
          <text x="-14" y="24" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
            14-MECH
          </text>
          {/* Movement Vector */}
          <line x1="18" y1="-2" x2="65" y2="-20" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrow)" />
        </g>

        {/* Unit 2: Forward Scout Squad Bravo */}
        <g
          transform="translate(320, 270)"
          onClick={() => setSelectedUnit('Scout Squad Bravo')}
          className="cursor-pointer"
        >
          <rect x="-14" y="-10" width="28" height="20" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" rx="2" />
          <circle cx="0" cy="0" r="3" fill="#60a5fa" />
          <text x="-18" y="-14" fill="#93c5fd" fontSize="9" fontFamily="monospace">
            SCOUT-BRAVO
          </text>
        </g>

        {/* Unit 3: 12th Combat Engineers */}
        <g
          transform="translate(240, 400)"
          onClick={() => setSelectedUnit('12th Engineer Regiment')}
          className="cursor-pointer"
        >
          <rect x="-14" y="-10" width="28" height="20" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" rx="2" />
          <text x="-7" y="4" fill="#93c5fd" fontSize="9" fontWeight="bold">E</text>
          <text x="-16" y="22" fill="#93c5fd" fontSize="9" fontFamily="monospace">
            12-ENGR
          </text>
        </g>

        {/* Hostile OPFOR Marker (Red Diamond) */}
        <g
          transform="translate(560, 160)"
          onClick={() => setSelectedUnit('OPFOR Forward Probe (OP-4)')}
          className="cursor-pointer"
        >
          <polygon points="0,-14 14,0 0,14 -14,0" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
          <text x="-4" y="3" fill="#fca5a5" fontSize="10" fontWeight="bold">!</text>
          <text x="18" y="4" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">
            ENY OP-4
          </text>
        </g>

        {/* Observation Post OP-4 (Friendly) */}
        <g transform="translate(480, 200)">
          <circle cx="0" cy="0" r="5" fill="#3b82f6" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,3" />
          <text x="-12" y="-12" fill="#93c5fd" fontSize="9" fontFamily="monospace">
            OP-4
          </text>
        </g>
      </svg>

      {/* Selected Unit Details Drawer */}
      {selectedUnit && (
        <div className="absolute bottom-2 left-2 right-2 bg-situ-900/95 backdrop-blur-md px-3 py-2 rounded border border-slate-700 text-xs flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-100">{selectedUnit}</span>
            <span className="text-slate-400 font-mono">Status: Active Observation</span>
          </div>
          <button
            onClick={() => setSelectedUnit(null)}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
