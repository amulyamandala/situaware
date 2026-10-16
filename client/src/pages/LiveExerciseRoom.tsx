import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Clock,
  Layers,
  Shield,
  Activity,
  AlertTriangle,
  Zap,
  Filter,
  CheckCircle,
  Eye,
  Crosshair,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { TacticalMap } from '../components/simulation/TacticalMap';
import { RadarDisplay } from '../components/simulation/RadarDisplay';
import { CyberMatrix } from '../components/simulation/CyberMatrix';
import { EWStatus } from '../components/simulation/EWStatus';
import { TeamComms } from '../components/comms/TeamComms';
import { DecisionForm } from '../components/decisions/DecisionForm';
import { DomainType } from '../types';

export const LiveExerciseRoom: React.FC = () => {
  const { session, feed, simTime, sessionStatus, assignedRoleId, loadSession } = useSession();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeVisualizer, setActiveVisualizer] = useState<'land' | 'air' | 'cyber' | 'ew'>('land');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  useEffect(() => {
    // If no active session, auto-load SITU-1001 for seamless hackathon testing
    if (!session) {
      loadSession('6ad207ff0158f74c2e049264', assignedRoleId).catch(() => {});
    }
  }, [session, assignedRoleId, loadSession]);

  // Set visualizer default based on role
  useEffect(() => {
    if (assignedRoleId.includes('land')) setActiveVisualizer('land');
    else if (assignedRoleId.includes('air')) setActiveVisualizer('air');
    else if (assignedRoleId.includes('cyber')) setActiveVisualizer('cyber');
    else if (assignedRoleId.includes('ew')) setActiveVisualizer('ew');
  }, [assignedRoleId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredFeed = feed.filter(
    (item) => domainFilter === 'all' || item.domain === domainFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Exercise Status Header */}
      <div className="bg-situ-900 border border-situ-800 rounded-xl p-3.5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-100">
              {(session?.scenarioId as any)?.title || 'Operation Trishul Guard — Contested Border Defense'}
            </h2>
            <span className="text-[10px] bg-situ-950 px-2 py-0.5 rounded text-cyan-400 border border-situ-800">
              SYNTHETIC TRAINING FEED
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
            <span>SESSION: <b className="text-slate-200">{session?.sessionCode || 'SITU-1001'}</b></span>
            <span>•</span>
            <span>ASSIGNED ROLE: <b className="text-cyan-400">{assignedRoleId.toUpperCase()}</b></span>
            <span>•</span>
            <span>OPERATOR: <b className="text-slate-200">{user?.name}</b></span>
          </div>
        </div>

        {/* Autoritative Clock & State */}
        <div className="flex items-center gap-3">
          <div className="bg-situ-950 px-3 py-1.5 rounded border border-situ-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 text-xs">EXERCISE TIME:</span>
            <span className="text-amber-300 font-bold text-sm tracking-wider">
              {formatTime(simTime)}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              sessionStatus === 'active'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : sessionStatus === 'paused'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {sessionStatus}
          </span>
        </div>
      </div>

      {/* Top Split Layout: Situation Visualizer (Left) & Role Information Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Interactive Multi-Domain Situation Overview */}
        <div className="space-y-2">
          {/* Visualizer Domain Tabs */}
          <div className="flex items-center justify-between bg-situ-900 border border-situ-800 rounded-lg p-1.5 font-mono text-xs">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveVisualizer('land')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  activeVisualizer === 'land'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                LAND MAP
              </button>
              <button
                onClick={() => setActiveVisualizer('air')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  activeVisualizer === 'air'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AIR RADAR
              </button>
              <button
                onClick={() => setActiveVisualizer('cyber')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  activeVisualizer === 'cyber'
                    ? 'bg-purple-950 text-purple-300 border border-purple-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CYBER NODES
              </button>
              <button
                onClick={() => setActiveVisualizer('ew')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  activeVisualizer === 'ew'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EW SPECTRUM
              </button>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              INTERACTIVE SYNTHETIC SENSORS
            </span>
          </div>

          {/* Active Domain Simulator Canvas */}
          {activeVisualizer === 'land' && (
            <TacticalMap hasLandDisruption={session?.activeDisruptions?.some((d) => d.domain === 'land')} />
          )}
          {activeVisualizer === 'air' && (
            <RadarDisplay hasAirDisruption={session?.activeDisruptions?.some((d) => d.domain === 'air')} />
          )}
          {activeVisualizer === 'cyber' && (
            <CyberMatrix hasCyberDisruption={session?.activeDisruptions?.some((d) => d.domain === 'cyber')} />
          )}
          {activeVisualizer === 'ew' && (
            <EWStatus hasEWDisruption={session?.activeDisruptions?.some((d) => d.domain === 'ew')} />
          )}
        </div>

        {/* Right: Role-Specific Information Feed */}
        <div className="bg-situ-900 border border-situ-800 rounded-lg p-3 h-[410px] flex flex-col justify-between shadow-xl">
          {/* Feed Header & Domain Filter */}
          <div className="flex items-center justify-between border-b border-situ-800 pb-2 mb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="font-bold text-slate-100">
                ROLE INFORMATION FEED ({filteredFeed.length} DELIVERED)
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 text-[10px]">
              {['all', 'land', 'air', 'cyber', 'ew'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDomainFilter(d)}
                  className={`px-2 py-0.5 rounded uppercase font-bold border transition-colors ${
                    domainFilter === d
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                      : 'bg-situ-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Scrollable Stream */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No reports delivered to your role yet. Reports will populate as the exercise progresses.
              </div>
            ) : (
              filteredFeed.map((report) => {
                const domainColors: any = {
                  land: 'border-emerald-800/80 bg-emerald-950/20 text-emerald-400',
                  air: 'border-cyan-800/80 bg-cyan-950/20 text-cyan-400',
                  cyber: 'border-purple-800/80 bg-purple-950/20 text-purple-400',
                  ew: 'border-amber-800/80 bg-amber-950/20 text-amber-400',
                };

                return (
                  <div
                    key={report.deliveryId || report.eventId}
                    className="p-3 rounded-lg bg-situ-950 border border-situ-800 hover:border-slate-700 transition-colors space-y-1.5 shadow"
                  >
                    {/* Top Row: Meta & Disruption alerts */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${
                            domainColors[report.domain]
                          }`}
                        >
                          {report.domain}
                        </span>
                        <span className="font-bold text-slate-200">{report.eventId}</span>
                        <span className="text-slate-400 truncate max-w-[200px] font-semibold">
                          {report.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {report.isConflicting && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-500 font-bold animate-pulse">
                            CONFLICTING INTEL
                          </span>
                        )}
                        {report.wasDelayed && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500">
                            +{report.delaySec}s DELAY
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          T+{report.simulatedTimeSec}s
                        </span>
                      </div>
                    </div>

                    {/* Report Text */}
                    <p className="text-slate-300 text-xs leading-relaxed font-sans">
                      {report.payload?.text}
                    </p>

                    {/* Confidence bar & Source */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                      <span>Source: <b className="text-slate-300">{report.payload?.source || 'Synthetic Sensor'}</b></span>
                      <div className="flex items-center gap-1">
                        <span>Confidence:</span>
                        <span className="text-cyan-400 font-bold">{report.payload?.confidence || 80}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-situ-800 flex justify-between">
            <span>Cryptographic delivery enforced by server</span>
            <span>Restricted to assigned role: {assignedRoleId}</span>
          </div>
        </div>
      </div>

      {/* Bottom Split Layout: Team Communications (Left) & Tactical Decision Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Team Comms */}
        <TeamComms />

        {/* Right: Decision Commitment Form */}
        <DecisionForm />
      </div>
    </div>
  );
};
