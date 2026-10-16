import React, { useState } from 'react';
import { User, Shield, Sliders, Database, Radio, CheckCircle, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [rubricPreset, setRubricPreset] = useState('standard');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-situ-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          OPERATOR PROFILE & SYSTEM SETTINGS
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          View user credentials, training preferences, rubric calibration, and platform diagnostic telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-slate-200 text-sm border-b border-situ-800 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            PERSONNEL CREDENTIALS
          </h3>

          <div className="space-y-2">
            <div>
              <span className="text-slate-500 text-[10px] block">OPERATOR NAME & RANK</span>
              <span className="font-bold text-slate-200 text-sm">{user?.name}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">DEFENCE EMAIL</span>
              <span className="text-slate-300">{user?.email}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">AUTHORIZED ROLE</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase inline-block mt-0.5">
                {user?.role}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">ORGANIZATIONAL DIVISION</span>
              <span className="text-slate-300">{user?.organizationId || 'IN-MOD-HQ'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">ACCOUNT STATUS</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" /> ACTIVE & CLEARED
              </span>
            </div>
          </div>
        </div>

        {/* System Diagnostics & Backend Topology */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-slate-200 text-sm border-b border-situ-800 pb-2 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            SIMULATOR SYSTEM STATUS
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2 rounded bg-situ-950 border border-situ-850">
              <span className="text-slate-400">Simulation Clock</span>
              <span className="text-emerald-400 font-bold">Server Authoritative (UTC)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-situ-950 border border-situ-850">
              <span className="text-slate-400">Socket.IO State</span>
              <span className="text-emerald-400 font-bold">Connected • Role Isolated</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-situ-950 border border-situ-850">
              <span className="text-slate-400">Event Scheduler Engine</span>
              <span className="text-cyan-400 font-bold">1 Hz Deterministic Tick</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-situ-950 border border-situ-850">
              <span className="text-slate-400">PDFKit Generator</span>
              <span className="text-purple-400 font-bold">Operational (AAR v1.2)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-situ-950 border border-situ-850">
              <span className="text-slate-400">Database Storage</span>
              <span className="text-amber-400 font-bold">Mongoose / In-Memory Resilient</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Presets Box */}
      <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-slate-200 text-sm border-b border-situ-800 pb-2">
          OPERATIONAL RUBRIC CALIBRATION PRESETS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => setRubricPreset('standard')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              rubricPreset === 'standard'
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                : 'bg-situ-950 border-situ-800 text-slate-400'
            }`}
          >
            <div className="font-bold text-slate-200 mb-1">Standard SIH26248 Baseline</div>
            <p className="text-[11px] font-sans text-slate-400">
              Timeliness: 20% • Evidence: 25% • Calibration: 20% • Coordination: 20% • Objectives: 15%
            </p>
          </div>

          <div
            onClick={() => setRubricPreset('speed')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              rubricPreset === 'speed'
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                : 'bg-situ-950 border-situ-800 text-slate-400'
            }`}
          >
            <div className="font-bold text-slate-200 mb-1">High-Tempo Strike Baseline</div>
            <p className="text-[11px] font-sans text-slate-400">
              Timeliness: 35% • Evidence: 20% • Calibration: 15% • Coordination: 15% • Objectives: 15%
            </p>
          </div>

          <div
            onClick={() => setRubricPreset('ew_resilience')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              rubricPreset === 'ew_resilience'
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                : 'bg-situ-950 border-situ-800 text-slate-400'
            }`}
          >
            <div className="font-bold text-slate-200 mb-1">Heavy EW Jamming Baseline</div>
            <p className="text-[11px] font-sans text-slate-400">
              Timeliness: 15% • Evidence: 35% • Calibration: 20% • Coordination: 20% • Objectives: 10%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
