import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Play,
  Copy,
  CheckCircle,
  Clock,
  Layers,
  Plus,
  Shield,
  Search,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { scenarioApi, sessionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

export const ScenarioLibrary: React.FC = () => {
  const { user } = useAuth();
  const { loadSession } = useSession();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationResult, setValidationResult] = useState<any | null>(null);

  const fetchScenarios = () => {
    scenarioApi
      .list()
      .then((res) => setScenarios(res.data.scenarios || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleLaunchSession = async (scenarioId: string) => {
    try {
      const res = await sessionApi.createFromScenario(scenarioId);
      const newSession = res.data.session;
      await loadSession(newSession._id);
      navigate('/lobby');
    } catch (err: any) {
      alert(`Failed to launch session: ${err.message}`);
    }
  };

  const handleDuplicate = async (scenarioId: string) => {
    try {
      await scenarioApi.duplicate(scenarioId);
      fetchScenarios();
    } catch (err: any) {
      alert(`Failed to duplicate: ${err.message}`);
    }
  };

  const handleValidate = async (scenarioId: string) => {
    try {
      const res = await scenarioApi.validate(scenarioId);
      setValidationResult(res.data);
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    }
  };

  const filtered = scenarios.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-situ-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            SYNTHETIC SCENARIO LIBRARY
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Operational scenarios with deterministic event feeds across Land, Air, Cyber, and EW
          </p>
        </div>

        {user?.role !== 'trainee' && (
          <Link
            to="/studio"
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all"
          >
            <Plus className="w-4 h-4" /> CREATE NEW SCENARIO
          </Link>
        )}
      </div>

      {/* Validation Result Modal / Banner */}
      {validationResult && (
        <div className="p-4 rounded-xl bg-situ-900 border border-cyan-700/80 text-xs font-mono shadow-2xl relative">
          <button
            onClick={() => setValidationResult(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 font-bold mb-2 text-cyan-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            SCENARIO SCHEMA VALIDATION REPORT
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 mb-2">
            <div>
              <span className="text-slate-500">Status: </span>
              <span className={validationResult.isValid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {validationResult.isValid ? 'VALID' : 'INVALID'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Total Events: </span>
              {validationResult.summary?.totalEvents}
            </div>
            <div>
              <span className="text-slate-500">Roles Defined: </span>
              {validationResult.summary?.totalRoles}
            </div>
            <div>
              <span className="text-slate-500">Checkpoints: </span>
              {validationResult.summary?.totalCheckpoints}
            </div>
          </div>
          {validationResult.issues && validationResult.issues.length > 0 && (
            <div className="mt-2 text-red-400 space-y-1">
              {validationResult.issues.map((iss: string, idx: number) => (
                <div key={idx}>• {iss}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter scenarios by name, domain, or operational keywords..."
          className="w-full bg-situ-900 border border-situ-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((scen) => (
          <div
            key={scen._id}
            className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-situ-700 transition-all"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-situ-950 text-cyan-300 border border-situ-800">
                  VERSION {scen.version}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {scen.durationMinutes} Minutes
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 font-mono mb-2">
                {scen.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {scen.description}
              </p>

              {/* Four Domains Coverage */}
              <div className="mb-4">
                <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase">
                  Multi-Domain Event Feeds Included:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {scen.domains.map((d: string) => {
                    const colors: any = {
                      land: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                      air: 'bg-cyan-950 text-cyan-300 border-cyan-800',
                      cyber: 'bg-purple-950 text-purple-300 border-purple-800',
                      ew: 'bg-amber-950 text-amber-300 border-amber-800',
                    };
                    return (
                      <span key={d} className={`px-2 py-0.5 rounded border ${colors[d] || 'bg-slate-800'}`}>
                        {d.toUpperCase()}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Roles & Events stats */}
              <div className="grid grid-cols-3 gap-2 bg-situ-950 p-2.5 rounded border border-situ-850 font-mono text-[11px] text-slate-300 mb-4">
                <div>
                  <span className="text-slate-500 block text-[9px]">PARTICIPANT ROLES</span>
                  <span className="font-bold">{scen.roleDefinitions?.length || 4} Roles</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">SYNTHETIC EVENTS</span>
                  <span className="font-bold">{scen.eventDefinitions?.length || 12} Events</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">CHECKPOINTS</span>
                  <span className="font-bold">{scen.scoringRubric?.checkpoints?.length || 3} Goals</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-situ-800 gap-2">
              <div className="flex gap-1">
                <button
                  onClick={() => handleValidate(scen._id)}
                  className="px-2.5 py-1.5 rounded bg-situ-800 hover:bg-situ-700 text-slate-300 text-xs font-mono border border-slate-700"
                  title="Validate Rubric and Events"
                >
                  Validate
                </button>
                {user?.role !== 'trainee' && (
                  <button
                    onClick={() => handleDuplicate(scen._id)}
                    className="p-1.5 rounded bg-situ-800 hover:bg-situ-700 text-slate-300 border border-slate-700"
                    title="Duplicate Scenario"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {user?.role !== 'trainee' && (
                  <Link
                    to={`/studio?id=${scen._id}`}
                    className="px-3 py-1.5 rounded bg-situ-800 hover:bg-situ-700 text-slate-200 text-xs font-mono border border-slate-700"
                  >
                    Edit Studio
                  </Link>
                )}
                <button
                  onClick={() => handleLaunchSession(scen._id)}
                  className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-900/30"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Launch Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
