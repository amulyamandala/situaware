import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  User,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { decisionApi } from '../services/api';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';

export const TraineePerformance: React.FC = () => {
  const { session } = useSession();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || session?._id || '6ad207ff0158f74c2e04926a';

  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      decisionApi
        .getAssessments(sessionId)
        .then((res) => {
          const list = res.data.assessments || [];
          setAssessments(list);
          if (list.length > 0) {
            setSelectedTraineeId(list[0].traineeId?._id || list[0].traineeId);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  const activeAssessment = assessments.find(
    (a) => (a.traineeId?._id || a.traineeId) === selectedTraineeId
  ) || assessments[0];

  const radarData = activeAssessment
    ? [
        { metric: 'Timeliness', score: activeAssessment.metricScores.timeliness, fullMark: 100 },
        { metric: 'Evidence', score: activeAssessment.metricScores.evidenceUse, fullMark: 100 },
        { metric: 'Calibration', score: activeAssessment.metricScores.confidenceCalibration, fullMark: 100 },
        { metric: 'Coordination', score: activeAssessment.metricScores.teamCoordination, fullMark: 100 },
        { metric: 'Objectives', score: activeAssessment.metricScores.objectiveCompletion, fullMark: 100 },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-situ-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            TRAINEE PERFORMANCE & DECISION RESILIENCE
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Transparent, explainable evaluation separating reasonable decisions from incomplete information.
          </p>
        </div>

        <Link
          to={`/reports?sessionId=${sessionId}`}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-900/30"
        >
          <FileText className="w-4 h-4" /> EXPORT OFFICIAL REPORT
        </Link>
      </div>

      {/* Trainee Tab Selector */}
      {assessments.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {assessments.map((ass) => {
            const isSelected = (ass.traineeId?._id || ass.traineeId) === selectedTraineeId;
            return (
              <button
                key={ass._id}
                onClick={() => setSelectedTraineeId(ass.traineeId?._id || ass.traineeId)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow'
                    : 'bg-situ-900 border-situ-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {ass.traineeId?.name || ass.traineeRoleId.toUpperCase()} (DRI: {ass.totalScore})
              </button>
            );
          })}
        </div>
      )}

      {/* Main Breakdown Layout */}
      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Overall DRI Score & Radar Chart */}
          <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="border-b border-situ-800 pb-3">
              <span className="text-[10px] text-slate-400 block uppercase">
                {activeAssessment.traineeRoleId.toUpperCase()} EVALUATION
              </span>
              <h2 className="text-base font-bold text-slate-100">
                {activeAssessment.traineeId?.name || 'Trainee Operator'}
              </h2>
            </div>

            {/* Big DRI Gauge */}
            <div className="p-4 rounded-xl bg-situ-950 border border-situ-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">
                DECISION RESILIENCE INDEX (DRI)
              </span>
              <div
                className={`text-5xl font-extrabold tracking-tight ${
                  activeAssessment.totalScore >= 75
                    ? 'text-emerald-400'
                    : activeAssessment.totalScore >= 50
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {activeAssessment.totalScore}
                <span className="text-xl text-slate-500 font-normal"> / 100</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1">
                Rubric Version: {activeAssessment.rubricVersion}
              </span>
            </div>

            {/* Radar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                  <Radar
                    name="Trainee DRI"
                    dataKey="score"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: 5 Metric Explanations & Recommendations (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Metric Scorecards with Explanations */}
            <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-slate-100 text-xs border-b border-situ-800 pb-2">
                EXPLAINABLE DECISION RESILIENCE BREAKDOWN
              </h3>

              <div className="space-y-3 text-xs">
                {/* 1. Timeliness */}
                <div className="p-3 rounded-lg bg-situ-950 border border-situ-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">1. Decision Timeliness (Weight: 20%)</span>
                    <span className="font-bold text-cyan-400">{activeAssessment.metricScores.timeliness}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {activeAssessment.explanations?.timelinessReason || 'Decisions committed within operational checkpoint parameters.'}
                  </p>
                </div>

                {/* 2. Evidence Use */}
                <div className="p-3 rounded-lg bg-situ-950 border border-situ-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">2. Evidence Verification & Grounding (Weight: 25%)</span>
                    <span className="font-bold text-emerald-400">{activeAssessment.metricScores.evidenceUse}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {activeAssessment.explanations?.evidenceReason || 'Cross-referenced received intelligence reports before acting.'}
                  </p>
                </div>

                {/* 3. Calibration */}
                <div className="p-3 rounded-lg bg-situ-950 border border-situ-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">3. Confidence Calibration (Weight: 20%)</span>
                    <span className="font-bold text-purple-400">{activeAssessment.metricScores.confidenceCalibration}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {activeAssessment.explanations?.confidenceReason || 'Subjective certainty reflected information completeness.'}
                  </p>
                </div>

                {/* 4. Coordination */}
                <div className="p-3 rounded-lg bg-situ-950 border border-situ-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">4. Cross-Domain Team Coordination (Weight: 20%)</span>
                    <span className="font-bold text-amber-400">{activeAssessment.metricScores.teamCoordination}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {activeAssessment.explanations?.coordinationReason || 'Corroborated reports with joint domain officers over tactical net.'}
                  </p>
                </div>

                {/* 5. Objectives */}
                <div className="p-3 rounded-lg bg-situ-950 border border-situ-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">5. Operational Objective Completion (Weight: 15%)</span>
                    <span className="font-bold text-cyan-400">{activeAssessment.metricScores.objectiveCompletion}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {activeAssessment.explanations?.objectiveReason || 'Structured tactical action plans addressed mission objectives.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations & Feedback */}
            <div className="bg-situ-900 border border-situ-800 rounded-xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2 border-b border-situ-800 pb-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                ACTIONABLE TRAINING RECOMMENDATIONS
              </h3>

              <div className="space-y-2 text-xs">
                {activeAssessment.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-situ-950 border border-situ-850">
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="text-slate-300 font-sans">{rec}</span>
                  </div>
                ))}

                {activeAssessment.instructorFeedback && (
                  <div className="mt-3 p-3 rounded bg-situ-950 border border-cyan-900/50">
                    <span className="text-[10px] text-cyan-400 font-bold block mb-1">
                      INSTRUCTOR OBSERVATION:
                    </span>
                    <p className="text-slate-300 font-sans text-xs">
                      {activeAssessment.instructorFeedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-12 text-center text-slate-400 text-xs">
          {loading ? 'Loading assessments...' : 'No assessments computed yet for this session.'}
        </div>
      )}
    </div>
  );
};
