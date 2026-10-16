import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal,
  Play,
  Pause,
  StopCircle,
  Zap,
  Users,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Check,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { decisionApi } from '../services/api';
import { DisruptionModal } from '../components/instructor/DisruptionModal';

export const InstructorConsole: React.FC = () => {
  const {
    session,
    simTime,
    sessionStatus,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    instructorAudit,
  } = useSession();

  const navigate = useNavigate();

  const [disruptionModalOpen, setDisruptionModalOpen] = useState(false);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [computingAssessments, setComputingAssessments] = useState(false);
  const [assessmentSuccess, setAssessmentSuccess] = useState<string | null>(null);

  // Poll decisions periodically
  useEffect(() => {
    if (session) {
      decisionApi
        .list(session._id)
        .then((res) => setDecisions(res.data.decisions || []))
        .catch((err) => console.error(err));

      const interval = setInterval(() => {
        decisionApi
          .list(session._id)
          .then((res) => setDecisions(res.data.decisions || []))
          .catch(() => {});
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComputeAssessments = async () => {
    if (!session) return;
    setComputingAssessments(true);
    setAssessmentSuccess(null);
    try {
      const res = await decisionApi.computeAssessments(session._id);
      setAssessmentSuccess(`Calculated ${res.data.assessments?.length || 0} Decision Resilience assessments!`);
      setTimeout(() => {
        navigate(`/aar?sessionId=${session._id}`);
      }, 1500);
    } catch (err: any) {
      alert(`Failed to compute assessments: ${err.message}`);
    } finally {
      setComputingAssessments(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">
      {/* Top Cockpit Header */}
      <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">
              INSTRUCTOR CONTROL CONSOLE
            </span>
            <span className="text-slate-400 text-xs">
              CODE: <b className="text-slate-200">{session?.sessionCode || 'SITU-1001'}</b>
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-100">
            {(session?.scenarioId as any)?.title || 'Operation Trishul Guard — Contested Border Defense'}
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Central simulation controller: inject live disruptions, oversee global audit telemetry, and review trainee rationale.
          </p>
        </div>

        {/* Master Lifecycle Controls */}
        <div className="flex items-center gap-2.5">
          {sessionStatus === 'created' || sessionStatus === 'paused' ? (
            <button
              onClick={() => (sessionStatus === 'created' ? startSession() : resumeSession())}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {sessionStatus === 'created' ? 'START EXERCISE' : 'RESUME EXERCISE'}
            </button>
          ) : sessionStatus === 'active' ? (
            <button
              onClick={() => pauseSession()}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/40 cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              PAUSE EXERCISE
            </button>
          ) : null}

          {sessionStatus !== 'completed' && (
            <button
              onClick={() => completeSession()}
              className="px-3.5 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-900/40 cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              END EXERCISE
            </button>
          )}

          {/* Trigger Disruption Modal */}
          <button
            onClick={() => setDisruptionModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/40 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            INJECT DISRUPTION
          </button>
        </div>
      </div>

      {assessmentSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {assessmentSuccess} Redirecting to After-Action Review...
        </div>
      )}

      {/* Grid: Trainee Roster & Active Disruptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Participant Readiness & Connection Roster */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-situ-800 pb-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              TRAINEE PARTICIPANTS (4 ROLES)
            </h3>
            <span className="text-[10px] text-slate-400">ROSTER</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { roleId: 'land_lead', name: 'Major A. Verma', role: 'Land Lead', color: 'border-emerald-600 text-emerald-400' },
              { roleId: 'air_controller', name: 'Sqn Ldr R. Sen', role: 'Air Controller', color: 'border-cyan-600 text-cyan-400' },
              { roleId: 'cyber_officer', name: 'Capt. K. Roy', role: 'Cyber Ops', color: 'border-purple-600 text-purple-400' },
              { roleId: 'ew_officer', name: 'Lt Cdr V. Rao', role: 'EW Officer', color: 'border-amber-600 text-amber-400' },
            ].map((trainee) => (
              <div
                key={trainee.roleId}
                className="p-2.5 rounded bg-situ-950 border border-situ-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-200 block text-xs">{trainee.name}</span>
                  <span className={`text-[10px] font-bold ${trainee.color}`}>
                    {trainee.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ONLINE
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Disruptions List */}
        <div className="md:col-span-2 bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-situ-800 pb-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              INJECTED COMMUNICATION DISRUPTIONS ({session?.activeDisruptions?.length || 0})
            </h3>
            <button
              onClick={() => setDisruptionModalOpen(true)}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
            >
              + Add Disruption
            </button>
          </div>

          <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
            {(!session?.activeDisruptions || session.activeDisruptions.length === 0) ? (
              <div className="text-slate-500 py-6 text-center text-xs">
                No active communication disruptions. Use the "INJECT DISRUPTION" button to degrade feeds in real time.
              </div>
            ) : (
              session.activeDisruptions.map((dis, idx) => (
                <div
                  key={dis.id || idx}
                  className="p-2.5 rounded bg-situ-950 border border-amber-900/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-500 font-bold uppercase">
                        {dis.type}
                      </span>
                      <span className="text-slate-200 font-bold">
                        Target Domain: {(dis.domain || 'ALL').toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Target Role: {(dis.targetRoleId || 'ALL').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Parameters: {JSON.stringify(dis.parameters)}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500">ACTIVE</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid: Global Audit Stream & Live Decisions Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Global Unvarnished Intelligence Audit Stream */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-situ-800 pb-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              GLOBAL DISPATCH & DELIVERY AUDIT LOG (UNFILTERED)
            </h3>
            <span className="text-[10px] text-slate-500">SERVER-AUTHORITATIVE</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
            {instructorAudit.length === 0 ? (
              <div className="text-slate-500 py-10 text-center text-xs">
                Waiting for simulation ticks. Dispatched reports and delivery mutations will appear here.
              </div>
            ) : (
              instructorAudit.map((item, idx) => {
                const isDropped = item.deliveryStatus === 'dropped';
                const isDelayed = item.deliveryStatus === 'delayed';

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-xs ${
                      isDropped
                        ? 'bg-red-950/30 border-red-900/60 text-red-300'
                        : isDelayed
                        ? 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                        : 'bg-situ-950 border-situ-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{item.eventId}</span>
                        <span className="text-[10px] text-slate-400">({item.domain?.toUpperCase()})</span>
                        <span className="text-[10px] text-slate-400 font-sans truncate max-w-[180px]">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">T+{item.simulatedTimeSec}s</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span>Recipient: <b className="text-slate-200">{item.recipientRoleId}</b></span>
                      <span
                        className={`font-bold uppercase ${
                          isDropped
                            ? 'text-red-400'
                            : isDelayed
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {isDropped ? 'DROPPED (DEGRADED)' : isDelayed ? `DELAYED (+${item.delaySec}s)` : 'DELIVERED'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Submitted Decisions with Verified Evidence Audit */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-situ-800 pb-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              LIVE TRAINEE DECISIONS COMMITTED ({decisions.length})
            </h3>
            <button
              onClick={handleComputeAssessments}
              disabled={computingAssessments}
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold"
            >
              {computingAssessments ? 'Computing...' : 'Compute DRI Scores'}
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
            {decisions.length === 0 ? (
              <div className="text-slate-500 py-10 text-center text-xs">
                No trainee decisions submitted yet. Once trainees commit decisions, they will appear here with instant verification tags.
              </div>
            ) : (
              decisions.map((dec) => (
                <div
                  key={dec._id}
                  className="p-3 rounded-lg bg-situ-950 border border-situ-800 space-y-1.5 shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                        {dec.traineeRoleId}
                      </span>
                      <span className="text-slate-200 font-bold">
                        {dec.traineeId?.name || 'Trainee Operator'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sim T+{dec.exerciseTimeSec}s • Conf: <b className="text-cyan-400">{dec.confidence}%</b>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Directive Action:</span>
                    <p className="text-slate-200 text-xs font-sans font-semibold">{dec.action}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Submitted Rationale:</span>
                    <p className="text-slate-300 text-xs font-sans leading-relaxed">{dec.rationale}</p>
                  </div>

                  {/* Verification Tags */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900 text-[10px]">
                    <div>
                      <span className="text-slate-500">Verified Evidence: </span>
                      <span className="text-emerald-400 font-bold">
                        [{dec.verifiedEvidenceIds?.join(', ') || 'None'}]
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Unverified Intel: </span>
                      <span className="text-red-400 font-bold">
                        [{dec.unverifiedEvidenceIds?.join(', ') || '0 unverified'}]
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Disruption Modal */}
      <DisruptionModal
        isOpen={disruptionModalOpen}
        onClose={() => setDisruptionModalOpen(false)}
      />
    </div>
  );
};
