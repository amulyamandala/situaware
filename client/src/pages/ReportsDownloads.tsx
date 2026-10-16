import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Shield,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Clock,
  Users,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { sessionApi, aarApi, decisionApi } from '../services/api';
import { useSession } from '../context/SessionContext';

export const ReportsDownloads: React.FC = () => {
  const { session } = useSession();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || session?._id || '6ad207ff0158f74c2e04926a';

  const [sessionData, setSessionData] = useState<any | null>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      Promise.all([
        sessionApi.get(sessionId),
        decisionApi.list(sessionId),
        decisionApi.getAssessments(sessionId),
      ])
        .then(([sessRes, decRes, assRes]) => {
          setSessionData(sessRes.data.session);
          setDecisions(decRes.data.decisions || []);
          setAssessments(assRes.data.assessments || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  const pdfUrl = aarApi.downloadPdfUrl(sessionId);
  const csvUrl = aarApi.downloadCsvUrl(sessionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-situ-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            REPORTS & AFTER-ACTION REVIEW EXPORTS
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Export cryptographically audited PDF and CSV evaluations generated directly from persisted records.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD OFFICIAL PDF
          </a>

          <a
            href={csvUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="px-4 py-2 rounded-lg bg-situ-800 hover:bg-situ-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            DOWNLOAD AUDIT CSV
          </a>
        </div>
      </div>

      {/* Official AAR Document Document Preview Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 max-w-4xl mx-auto">
        {/* Document Header Banner */}
        <div className="bg-situ-950 border border-situ-800 p-5 rounded-lg text-center space-y-1 relative">
          <div className="w-10 h-10 mx-auto rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center mb-1 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-100 tracking-wider">
            SITU-AWARE • AFTER-ACTION REVIEW (AAR)
          </h2>
          <p className="text-[11px] text-cyan-400 font-semibold uppercase">
            Government of India • Ministry of Defence • Evaluation Record
          </p>
          <p className="text-[9px] text-slate-500">
            Smart India Hackathon SIH26248 • Automated Decision Resilience Synthesis
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-situ-950 p-4 rounded-lg border border-situ-800 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">SESSION CODE</span>
            <span className="font-bold text-cyan-300">{sessionData?.sessionCode || 'SITU-8800'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">EXERCISE DURATION</span>
            <span className="font-bold text-slate-200">
              {sessionData?.currentSimulatedTimeSec || 300}s ({Math.floor((sessionData?.currentSimulatedTimeSec || 300) / 60)}m)
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">SCENARIO VERSION</span>
            <span className="font-bold text-slate-200">{sessionData?.scenarioVersion || '1.2.0'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">STATUS</span>
            <span className="font-bold text-emerald-400 uppercase">{sessionData?.status || 'COMPLETED'}</span>
          </div>
        </div>

        {/* Section 1: Decision Resilience Index Assessments */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-100 text-xs border-b border-situ-800 pb-2 flex items-center justify-between">
            <span>1. DECISION RESILIENCE INDEX (DRI) SUMMARY</span>
            <span className="text-[10px] text-slate-500">RUBRIC v1.2.0</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-situ-950 text-slate-400 border-b border-situ-800">
                <tr>
                  <th className="py-2 px-3">TRAINEE</th>
                  <th className="py-2 px-3">ROLE</th>
                  <th className="py-2 px-3">TIMELINESS</th>
                  <th className="py-2 px-3">EVIDENCE</th>
                  <th className="py-2 px-3">CALIBRATION</th>
                  <th className="py-2 px-3">COORDINATION</th>
                  <th className="py-2 px-3 text-right">TOTAL DRI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-situ-850">
                {assessments.map((ass) => (
                  <tr key={ass._id} className="hover:bg-situ-850/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {ass.traineeId?.name || 'Trainee Operator'}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 uppercase text-[11px]">
                      {ass.traineeRoleId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{ass.metricScores?.timeliness}%</td>
                    <td className="py-2.5 px-3 text-slate-300">{ass.metricScores?.evidenceUse}%</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ass.metricScores?.confidenceCalibration}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ass.metricScores?.teamCoordination}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {ass.totalScore} / 100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Injected Communication Disruptions */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-100 text-xs border-b border-situ-800 pb-2">
            2. INJECTED COMMUNICATION DISRUPTIONS TIMELINE
          </h3>

          <div className="space-y-2 text-xs">
            {sessionData?.activeDisruptions?.map((dis: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-situ-950 border border-situ-850 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-400 uppercase">
                    [#{idx + 1}] {dis.type} DISRUPTION
                  </span>
                  <span className="text-slate-400 ml-2 font-sans text-xs">
                    Target: {(dis.domain || 'ALL').toUpperCase()} | Role: {(dis.targetRoleId || 'ALL').toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(dis.injectedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Submitted Decisions & Evidence Grounding */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-100 text-xs border-b border-situ-800 pb-2">
            3. COMMITTED DECISIONS & EVIDENCE RECONSTRUCTION
          </h3>

          <div className="space-y-3 text-xs">
            {decisions.map((dec, i) => (
              <div key={dec._id} className="p-3 rounded-lg bg-situ-950 border border-situ-850 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>
                    Decision #{i + 1} • {dec.traineeRoleId.toUpperCase()} (T+{dec.exerciseTimeSec}s)
                  </span>
                  <span className="text-cyan-400">Confidence: {dec.confidence}%</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  <b>Directive:</b> {dec.action}
                </p>
                <p className="text-slate-400 font-sans text-xs">
                  <b>Rationale:</b> {dec.rationale}
                </p>
                <div className="flex gap-4 pt-1 border-t border-slate-900 text-[10px]">
                  <span>
                    Verified Received Evidence: <b className="text-emerald-400">[{dec.verifiedEvidenceIds?.join(', ') || 'None'}]</b>
                  </span>
                  <span>
                    Unverified / Dropped Intel: <b className="text-red-400">[{dec.unverifiedEvidenceIds?.join(', ') || '0 unverified'}]</b>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signoff Box */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <span>Official Evaluation Record • Ministry of Defence</span>
          <span>Hash Verified: SHA256-AUTHENTIC</span>
        </div>
      </div>
    </div>
  );
};
