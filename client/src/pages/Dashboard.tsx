import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  Radio,
  FileText,
  Clock,
  ArrowRight,
  Play,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Compass,
  Sliders,
} from 'lucide-react';
import { sessionApi, scenarioApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { loadSession } = useSession();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sessionApi.list(), scenarioApi.list()])
      .then(([sessRes, scenRes]) => {
        setSessions(sessRes.data.sessions || []);
        setScenarios(scenRes.data.scenarios || []);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLaunchSession = async (sessionId: string) => {
    await loadSession(sessionId);
    if (user?.role === 'instructor') {
      navigate('/instructor');
    } else {
      navigate('/live');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome & Command Header */}
      <div className="bg-gradient-to-r from-situ-900 via-situ-850 to-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
              {user?.role} PORTAL
            </span>
            <span className="text-slate-400 text-xs font-mono">ORG: {user?.organizationId || 'IN-MOD-HQ'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">
            WELCOME, {user?.name.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational status: Contested multi-domain communications simulation engine active.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              const readySess = sessions.find((s) => s.status === 'created' || s.status === 'active');
              if (readySess) {
                handleLaunchSession(readySess._id);
              } else {
                navigate('/lobby');
              }
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            ENTER LIVE EXERCISE
          </button>

          <Link
            to="/aar"
            className="px-3 py-2 rounded-lg bg-situ-800 hover:bg-situ-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 border border-situ-700"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            INSPECT AAR REPLAY
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-situ-900 border border-situ-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE SESSIONS</span>
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">
            {sessions.filter((s) => s.status === 'active' || s.status === 'created').length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Multiplayer ready</div>
        </div>

        <div className="bg-situ-900 border border-situ-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SCENARIO CATALOG</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">
            {scenarios.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Land, Air, Cyber, EW</div>
        </div>

        <div className="bg-situ-900 border border-situ-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>COMPLETED AARS</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">
            {sessions.filter((s) => s.status === 'completed').length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Exportable PDF & CSV</div>
        </div>

        <div className="bg-situ-900 border border-situ-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVERAGE TEAM DRI</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-2">
            85 / 100
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            +4.2% Resilience Index
          </div>
        </div>
      </div>

      {/* Main Grid: Active Sessions & Quick Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List (2 cols) */}
        <div className="lg:col-span-2 bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-situ-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-sm font-bold text-slate-100">
                ACTIVE & RECENT EXERCISE SESSIONS
              </h3>
            </div>
            <Link
              to="/lobby"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              Join with Code <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-situ-950 text-slate-400 border-b border-situ-800">
                <tr>
                  <th className="py-2.5 px-3">SESSION CODE</th>
                  <th className="py-2.5 px-3">SCENARIO</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">PARTICIPANTS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-situ-850">
                {sessions.map((sess) => (
                  <tr key={sess._id} className="hover:bg-situ-850/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-300">{sess.sessionCode}</td>
                    <td className="py-3 px-3 text-slate-200">
                      {sess.scenarioId?.title || 'Tactical Scenario'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          sess.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : sess.status === 'completed'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {sess.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {sess.participantIds?.length || 4} Assigned
                    </td>
                    <td className="py-3 px-3 text-right">
                      {sess.status === 'completed' ? (
                        <Link
                          to={`/aar?sessionId=${sess._id}`}
                          className="px-2.5 py-1 rounded bg-situ-800 hover:bg-situ-700 text-slate-200 text-[11px] border border-slate-700 inline-block"
                        >
                          View AAR
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleLaunchSession(sess._id)}
                          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold"
                        >
                          {user?.role === 'instructor' ? 'Open Console' : 'Join Room'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Four-Domain Readiness Panel (1 col) */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-4">
          <div className="border-b border-situ-800 pb-2.5">
            <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              MULTI-DOMAIN READINESS
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live synthetic information feeds operational
            </p>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {/* Land */}
            <div className="p-2.5 rounded bg-situ-950 border border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold block">LAND DOMAIN</span>
                <span className="text-[10px] text-slate-400">Ground Recon & Obstacle Barrier Feeds</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                SYNTHETIC ACTIVE
              </span>
            </div>

            {/* Air */}
            <div className="p-2.5 rounded bg-situ-950 border border-cyan-900/40 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold block">AIR DOMAIN</span>
                <span className="text-[10px] text-slate-400">Early Warning Radar & CAP Intercept</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                SYNTHETIC ACTIVE
              </span>
            </div>

            {/* Cyber */}
            <div className="p-2.5 rounded bg-situ-950 border border-purple-900/40 flex items-center justify-between">
              <div>
                <span className="text-purple-400 font-bold block">CYBER DOMAIN</span>
                <span className="text-[10px] text-slate-400">WAN Telemetry & IDS Spoof Alerts</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-800">
                SYNTHETIC ACTIVE
              </span>
            </div>

            {/* Electronic Warfare */}
            <div className="p-2.5 rounded bg-situ-950 border border-amber-900/40 flex items-center justify-between">
              <div>
                <span className="text-amber-400 font-bold block">ELECTRONIC WARFARE</span>
                <span className="text-[10px] text-slate-400">ESM Noise Barrage & Direction Finding</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800">
                SYNTHETIC ACTIVE
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-situ-800">
            <Link
              to="/scenarios"
              className="w-full py-2 rounded bg-situ-800 hover:bg-situ-700 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors block text-center"
            >
              Browse Scenario Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
