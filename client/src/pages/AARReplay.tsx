import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PlayCircle,
  PauseCircle,
  SkipBack,
  SkipForward,
  Clock,
  Layers,
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { sessionApi, decisionApi } from '../services/api';
import { useSession } from '../context/SessionContext';

export const AARReplay: React.FC = () => {
  const { session } = useSession();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || session?._id || '6ad207ff0158f74c2e04926a'; // default to completed session

  const [events, setEvents] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [sessionDetails, setSessionDetails] = useState<any | null>(null);

  // Timeline scrub state
  const [scrubSec, setScrubSec] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('land_lead');
  const [reconstructedState, setReconstructedState] = useState<any | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load session & timeline data
  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      Promise.all([
        sessionApi.get(sessionId),
        sessionApi.getTimeline(sessionId),
        decisionApi.list(sessionId),
      ])
        .then(([sessRes, timeRes, decRes]) => {
          setSessionDetails(sessRes.data.session);
          setEvents(timeRes.data.events || []);
          setDeliveries(timeRes.data.deliveries || []);
          const decs = decRes.data.decisions || [];
          setDecisions(decs);
          if (decs.length > 0) {
            setSelectedDecision(decs[0]);
            setScrubSec(decs[0].exerciseTimeSec || 55);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  // Reconstruct trainee state when scrubSec or selectedRole changes
  useEffect(() => {
    if (sessionId && sessionDetails) {
      // Calculate simulation timestamp
      const startTime = sessionDetails.startedAt ? new Date(sessionDetails.startedAt).getTime() : Date.now();
      const scrubDate = new Date(startTime + scrubSec * 1000);

      sessionApi
        .reconstruct(sessionId, selectedRole, scrubDate.toISOString())
        .then((res) => {
          setReconstructedState(res.data.reconstructed);
        })
        .catch((err) => console.error(err));
    }
  }, [sessionId, sessionDetails, scrubSec, selectedRole]);

  // Playback timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setScrubSec((s) => {
          if (s >= (sessionDetails?.currentSimulatedTimeSec || 300)) {
            setIsPlaying(false);
            return s;
          }
          return s + 2;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, sessionDetails]);

  const maxSec = sessionDetails?.currentSimulatedTimeSec || 300;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">
      {/* Top Header */}
      <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase">
              AFTER-ACTION REVIEW (AAR) REPLAY ENGINE
            </span>
            <span className="text-slate-400 text-xs">
              CODE: <b className="text-slate-200">{sessionDetails?.sessionCode || 'SITU-8800'}</b>
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-100">
            SYNCHRONIZED TIMELINE RECONSTRUCTION
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Reconstruct authoritative information available to each trainee at any second during the exercise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/performance?sessionId=${sessionId}`}
            className="px-3 py-1.5 rounded-lg bg-situ-800 hover:bg-situ-700 text-slate-200 text-xs border border-slate-700"
          >
            Trainee Scores
          </Link>
          <Link
            to={`/reports?sessionId=${sessionId}`}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Export AAR PDF
          </Link>
        </div>
      </div>

      {/* Synchronized Timeline Scrubber Control Bar */}
      <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow"
            >
              {isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setScrubSec(Math.max(0, scrubSec - 10))}
              className="p-1.5 rounded bg-situ-800 hover:bg-situ-700 text-slate-300"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScrubSec(Math.min(maxSec, scrubSec + 10))}
              className="p-1.5 rounded bg-situ-800 hover:bg-situ-700 text-slate-300"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="text-xs flex items-center gap-1.5">
              <span className="text-slate-400">REPLAY TIME:</span>
              <span className="text-cyan-300 font-bold text-base bg-situ-950 px-2 py-0.5 rounded border border-situ-800">
                T+{formatTime(scrubSec)}
              </span>
              <span className="text-slate-500">/ T+{formatTime(maxSec)}</span>
            </div>
          </div>

          {/* Decision Markers Quick Jump */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">DECISION POINTS:</span>
            {decisions.map((dec, i) => (
              <button
                key={dec._id}
                onClick={() => {
                  setScrubSec(dec.exerciseTimeSec);
                  setSelectedDecision(dec);
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                  scrubSec === dec.exerciseTimeSec
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : 'bg-situ-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Dec #{i + 1} (T+{dec.exerciseTimeSec}s)
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="relative pt-2">
          <input
            type="range"
            min={0}
            max={maxSec}
            value={scrubSec}
            onChange={(e) => setScrubSec(Number(e.target.value))}
            className="w-full accent-cyan-500 bg-situ-950 cursor-pointer h-2 rounded"
          />

          {/* Ticks for events along timeline */}
          <div className="relative w-full h-4 mt-1">
            {events.map((ev) => {
              const posPercent = (ev.simulatedTimeSec / maxSec) * 100;
              return (
                <div
                  key={ev.eventId}
                  style={{ left: `${posPercent}%` }}
                  className="absolute top-0 -translate-x-1/2 group cursor-pointer"
                  onClick={() => setScrubSec(ev.simulatedTimeSec)}
                >
                  <div className="w-1.5 h-3 bg-cyan-600 rounded-sm group-hover:bg-cyan-300"></div>
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black px-1.5 py-0.5 rounded text-[9px] text-white whitespace-nowrap z-20 border border-slate-700">
                    {ev.eventId} (T+{ev.simulatedTimeSec}s)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role State Selector */}
      <div className="flex items-center justify-between border-b border-situ-800 pb-2 text-xs">
        <span className="text-slate-400 uppercase font-semibold">
          Select Trainee Role to Reconstruct Feed:
        </span>
        <div className="flex gap-2">
          {[
            { id: 'land_lead', name: 'Land Domain Lead' },
            { id: 'air_controller', name: 'Air Controller' },
            { id: 'cyber_officer', name: 'Cyber Specialist' },
            { id: 'ew_officer', name: 'EW Officer' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                selectedRole === r.id
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                  : 'bg-situ-900 border-situ-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main AAR Inspection Grid: Reconstructed State (Left) & Decision Audit (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Reconstructed Trainee Information Feed at Timestamp */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-situ-800 pb-2">
            <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              RECONSTRUCTED INFORMATION STATE AT T+{scrubSec}s
            </h3>
            <span className="text-[10px] text-slate-400 uppercase">
              ROLE: {selectedRole}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {reconstructedState?.deliveredReports?.length === 0 &&
            reconstructedState?.droppedReports?.length === 0 ? (
              <div className="text-slate-500 py-16 text-center text-xs">
                No reports had reached {selectedRole} by T+{scrubSec}s.
              </div>
            ) : (
              <>
                {/* Delivered Reports */}
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Delivered & Visible to Trainee ({reconstructedState?.deliveredReports?.length || 0}):
                </div>
                {reconstructedState?.deliveredReports?.map((rep: any) => (
                  <div
                    key={rep.deliveryId || rep.eventId}
                    className="p-3 rounded-lg bg-situ-950 border border-emerald-900/40 space-y-1 shadow"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400">{rep.eventId}</span>
                        <span className="text-slate-300 font-bold font-sans">{rep.title}</span>
                      </div>
                      {rep.isConflicting && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-500 font-bold">
                          CONFLICTING
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{rep.payload?.text}</p>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      Delivered at: {new Date(rep.deliveredAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}

                {/* Dropped / Suppressed Reports */}
                {reconstructedState?.droppedReports?.length > 0 && (
                  <>
                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider pt-2">
                      Suppressed by Disruption (Hidden from Trainee) ({reconstructedState.droppedReports.length}):
                    </div>
                    {reconstructedState.droppedReports.map((rep: any) => (
                      <div
                        key={rep.deliveryId || rep.eventId}
                        className="p-3 rounded-lg bg-red-950/20 border border-red-900/60 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-red-400">{rep.eventId}</span>
                          <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-800">
                            DROPPED
                          </span>
                        </div>
                        <p className="text-slate-400 font-sans text-xs italic">{rep.title}</p>
                        <div className="text-[10px] text-red-400 font-mono">
                          Failure Reason: {rep.failureReason}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Decision Audit with Evidence Verification */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-situ-800 pb-2">
            <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              DECISION EVIDENCE AUDIT
            </h3>
            <span className="text-[10px] text-slate-400">
              {decisions.length} TOTAL DECISIONS
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {decisions.map((dec, idx) => {
              const isSelected = selectedDecision?._id === dec._id;

              return (
                <div
                  key={dec._id}
                  onClick={() => {
                    setSelectedDecision(dec);
                    setScrubSec(dec.exerciseTimeSec);
                    setSelectedRole(dec.traineeRoleId);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-situ-950 border-cyan-500 shadow-lg ring-1 ring-cyan-500'
                      : 'bg-situ-950/70 border-situ-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-200">
                        {dec.traineeRoleId.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Committed at Sim T+{dec.exerciseTimeSec}s
                    </span>
                  </div>

                  {/* Directive */}
                  <div className="mb-2">
                    <span className="text-[10px] text-slate-500 block uppercase">Action Taken:</span>
                    <p className="text-slate-200 text-xs font-sans font-bold">{dec.action}</p>
                  </div>

                  {/* Written Rationale */}
                  <div className="mb-2.5">
                    <span className="text-[10px] text-slate-500 block uppercase">Written Rationale:</span>
                    <p className="text-slate-300 text-xs font-sans leading-relaxed">{dec.rationale}</p>
                  </div>

                  {/* Evidence Verification Audit */}
                  <div className="p-2.5 rounded bg-situ-900 border border-situ-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Confidence Calibration:</span>
                      <span className="text-cyan-400 font-bold">{dec.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verified Evidence Delivered:</span>
                      <span className="text-emerald-400 font-bold">
                        [{dec.verifiedEvidenceIds?.join(', ') || 'None'}]
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Unverified Intel Cited:</span>
                      <span className="text-red-400 font-bold">
                        [{dec.unverifiedEvidenceIds?.join(', ') || '0 unverified'}]
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
