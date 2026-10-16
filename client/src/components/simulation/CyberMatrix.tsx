import React, { useState } from 'react';
import { Server, Activity, ShieldAlert, Wifi, Cpu, Terminal, AlertCircle } from 'lucide-react';

interface CyberMatrixProps {
  hasCyberDisruption?: boolean;
}

export const CyberMatrix: React.FC<CyberMatrixProps> = ({ hasCyberDisruption = false }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('WAN-Gateway-Gamma');

  const nodes = [
    {
      id: 'WAN-Gateway-Gamma',
      name: 'WAN Gateway Gamma',
      type: 'Core Tactical Router',
      status: 'Degraded',
      latency: 380,
      packetLoss: 42,
      encryption: 'AES-256-GCM (Re-Handshaking)',
      threatLevel: 'Elevated (ICMP Flood)',
    },
    {
      id: 'Ground-Relay-S2',
      name: 'Ground Sensor Relay S2',
      type: 'Acoustic / Seismic Mesh Node',
      status: 'Offline',
      latency: 9999,
      packetLoss: 100,
      encryption: 'Desynchronized',
      threatLevel: 'Spoofing Flagged (EV-CYBER-02)',
    },
    {
      id: 'Aux-Mesh-Net',
      name: 'Auxiliary Troposcatter Mesh',
      type: 'Optical Burst / Microwave Backup',
      status: 'Nominal',
      latency: 45,
      packetLoss: 0.2,
      encryption: 'Quantum-Resistant Key Exchange',
      threatLevel: 'Clean',
    },
    {
      id: 'Air-Link-TACP',
      name: 'TACP Air-Ground Data Link',
      type: 'Link-16 Gateway',
      status: 'Nominal',
      latency: 85,
      packetLoss: 3.1,
      encryption: 'Frequency-Agile Crypto',
      threatLevel: 'Intermittent Noise',
    },
  ];

  return (
    <div className="relative w-full h-[360px] bg-slate-950 rounded-lg border border-purple-900/60 p-3 overflow-hidden flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="font-mono text-purple-400 font-bold text-xs">CYBER DOMAIN • DEFENSIVE NETWORK TOPOLOGY</span>
        </div>
        {hasCyberDisruption && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-500/50 animate-pulse font-mono flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" /> ACTIVE TELEMETRY DROPOUT
          </span>
        )}
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {nodes.map((node) => {
          const isSelected = selectedNode === node.id;
          const isDegraded = node.status === 'Degraded';
          const isOffline = node.status === 'Offline';

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-purple-950/60 border-purple-400 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Server className={`w-4 h-4 ${isOffline ? 'text-red-400' : isDegraded ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{node.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{node.type}</p>
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isOffline
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : isDegraded
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {node.status.toUpperCase()}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500">Latency: </span>
                  <span className={node.latency > 300 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {node.latency === 9999 ? 'TIMEOUT' : `${node.latency} ms`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Pkt Loss: </span>
                  <span className={node.packetLoss > 20 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {node.packetLoss}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Audit Box */}
      {selectedNode && (
        <div className="bg-slate-900/90 rounded border border-purple-900/80 p-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-purple-300 font-bold">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              INTEGRITY AUDIT: {selectedNode}
            </span>
            <span className="text-[10px] text-slate-400">IDS SENSOR POLLING 1000ms</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500">Crypto Status: </span>
              {nodes.find((n) => n.id === selectedNode)?.encryption}
            </div>
            <div>
              <span className="text-slate-500">Threat Flags: </span>
              <span className="text-amber-400 font-semibold">
                {nodes.find((n) => n.id === selectedNode)?.threatLevel}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
