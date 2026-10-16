import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Shield, ArrowRight, CheckCircle2, UserCheck, Radio, AlertCircle } from 'lucide-react';
import { sessionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

export const SessionLobby: React.FC = () => {
  const { user } = useAuth();
  const { session, loadSession, setAssignedRoleId, assignedRoleId } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sessionCode, setSessionCode] = useState(searchParams.get('code') || 'SITU-1001');
  const [selectedRole, setSelectedRole] = useState<string>('land_lead');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available scenario roles
  const roles = [
    {
      id: 'land_lead',
      name: 'Land Domain Lead',
      domain: 'LAND',
      desc: 'Ground observation posts, mechanized armor staging, terrain obstacles.',
      color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
    },
    {
      id: 'air_controller',
      name: 'Joint Air Defense Controller',
      domain: 'AIR',
      desc: 'Early warning surveillance radar, airspace sectors, Mode-5 IFF.',
      color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300',
    },
    {
      id: 'cyber_officer',
      name: 'Tactical Cyber Specialist',
      domain: 'CYBER',
      desc: 'WAN telemetry, router health, intrusion detection, packet spoof alerts.',
      color: 'border-purple-500 bg-purple-950/40 text-purple-300',
    },
    {
      id: 'ew_officer',
      name: 'Electronic Warfare Officer',
      domain: 'EW',
      desc: 'VHF noise barrage detection, jammer triangulation, frequency hopping.',
      color: 'border-amber-500 bg-amber-950/40 text-amber-300',
    },
  ];

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sessionApi.join({
        sessionCode: sessionCode.trim().toUpperCase(),
        roleId: selectedRole,
      });

      const joinedSession = res.data.session;
      setAssignedRoleId(selectedRole);
      await loadSession(joinedSession._id, selectedRole);

      if (user?.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/live');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to join session with provided code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1 border-b border-situ-800 pb-4">
        <div className="inline-flex items-center gap-2 bg-cyan-950 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-full text-xs font-mono mb-2">
          <Users className="w-3.5 h-3.5" />
          MULTIPLAYER EXERCISE LOBBY
        </div>
        <h1 className="text-2xl font-bold text-slate-100 font-mono">
          JOIN OPERATIONAL SESSION
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Enter your authorized session invitation code and select your operational role.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Main Join Card */}
      <form onSubmit={handleJoin} className="bg-situ-900 border border-situ-800 rounded-xl p-6 shadow-2xl space-y-6">
        {/* Session Code Input */}
        <div>
          <label className="block text-slate-300 text-xs font-mono font-bold mb-1.5 uppercase">
            1. Enter 4-Digit Session Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="e.g. SITU-1001"
              className="w-full bg-situ-950 border border-situ-700 rounded-lg px-4 py-2.5 text-base font-mono font-bold text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 uppercase tracking-widest"
            />
            <button
              type="button"
              onClick={() => setSessionCode('SITU-1001')}
              className="px-3 py-2 rounded bg-situ-800 hover:bg-situ-700 text-slate-300 text-xs font-mono whitespace-nowrap border border-slate-700"
            >
              Fill SITU-1001
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Ready demo code: <span className="text-cyan-400 font-bold">SITU-1001</span> (or SITU-8800 for completed session)
          </p>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-slate-300 text-xs font-mono font-bold mb-2 uppercase">
            2. Assign Your Tactical Role
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? `${r.color} shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-500`
                      : 'bg-situ-950 border-situ-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-xs font-mono">
                      {r.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold">
                      {r.domain}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/40 transition-all cursor-pointer"
        >
          {loading ? 'JOINING SESSION ROOM...' : 'CONFIRM ROLE & ENTER EXERCISE ROOM'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
