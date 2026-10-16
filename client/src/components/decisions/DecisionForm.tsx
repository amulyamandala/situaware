import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, FileText } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export const DecisionForm: React.FC = () => {
  const { session, feed, submitDecision, assignedRoleId } = useSession();

  const [checkpointId, setCheckpointId] = useState<string>('CP-ALPHA');
  const [action, setAction] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(75);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionAudit, setSubmissionAudit] = useState<any | null>(null);

  const scenario = session?.scenarioId as any;
  const checkpoints = scenario?.scoringRubric?.checkpoints || [
    { id: 'CP-ALPHA', title: 'Perimeter Breach & Route Validation' },
    { id: 'CP-BRAVO', title: 'Unidentified Air Contact Response' },
    { id: 'CP-CHARLIE', title: 'Joint Resiliency Countermeasure Directive' },
  ];

  const toggleEvidence = (id: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim() || !rationale.trim()) return;

    setSubmitting(true);
    setSubmissionAudit(null);
    try {
      const res = await submitDecision({
        checkpointId,
        action: action.trim(),
        rationale: rationale.trim(),
        evidenceIds: selectedEvidence,
        confidence,
      });

      setSubmissionAudit(res.audit);
      setAction('');
      setRationale('');
      setSelectedEvidence([]);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-situ-900 border border-situ-800 rounded-lg p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-situ-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-sm font-bold text-slate-100">
            TACTICAL DECISION COMMITMENT
          </h3>
        </div>
        <span className="text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
          ROLE: {assignedRoleId.toUpperCase()}
        </span>
      </div>

      {/* Audit Feedback Banner upon submission */}
      {submissionAudit && (
        <div className="mb-4 p-3 rounded-lg bg-situ-950 border border-emerald-500/50 text-xs font-mono animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Decision Recorded and Evaluated by Resilience Engine
          </div>
          <div className="text-slate-300 grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500">Verified Evidence Received: </span>
              <span className="text-emerald-400 font-bold">
                {submissionAudit.verifiedEvidence?.length || 0} items
              </span>
              <span className="text-slate-400 block text-[10px]">
                [{submissionAudit.verifiedEvidence?.join(', ') || 'None'}]
              </span>
            </div>
            <div>
              <span className="text-slate-500">Unverified / Dropped Intel: </span>
              <span className="text-red-400 font-bold">
                {submissionAudit.unverifiedEvidence?.length || 0} items
              </span>
              <span className="text-slate-400 block text-[10px]">
                [{submissionAudit.unverifiedEvidence?.join(', ') || '0 unverified'}]
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* Checkpoint selector */}
        <div>
          <label className="block text-slate-400 font-mono mb-1">Operational Checkpoint</label>
          <select
            value={checkpointId}
            onChange={(e) => setCheckpointId(e.target.value)}
            className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {checkpoints.map((cp: any) => (
              <option key={cp.id} value={cp.id}>
                {cp.id}: {cp.title}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Action */}
        <div>
          <label className="block text-slate-400 font-mono mb-1">Directive / Selected Action</label>
          <input
            type="text"
            required
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. Halt armor convoy at staging area, re-route via Valley Route Charlie"
            className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Written Rationale */}
        <div>
          <label className="block text-slate-400 font-mono mb-1">
            Written Decision Rationale (Explain uncertainty handling & evidence verification)
          </label>
          <textarea
            required
            rows={3}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain why this decision is sound given the conflicting observations or delayed sensor updates currently received..."
            className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Evidence Picker (delivers verifiable IDs) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 font-mono">
              Supporting Evidence References ({selectedEvidence.length} cited)
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Only cite reports present in your feed
            </span>
          </div>

          <div className="max-h-28 overflow-y-auto bg-situ-950 border border-situ-700 rounded p-2 space-y-1.5">
            {feed.length === 0 ? (
              <div className="text-slate-500 text-[11px] font-mono py-1">
                No reports delivered to your feed yet.
              </div>
            ) : (
              feed.map((rep) => {
                const isSelected = selectedEvidence.includes(rep.eventId);
                return (
                  <div
                    key={rep.deliveryId || rep.eventId}
                    onClick={() => toggleEvidence(rep.eventId)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer border transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-situ-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                      />
                      <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                        {rep.eventId}
                      </span>
                      <span className="truncate text-[11px]">{rep.title}</span>
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 uppercase">
                      {rep.domain}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Confidence Rating Slider */}
        <div>
          <div className="flex items-center justify-between font-mono mb-1">
            <span className="text-slate-400">Decision Confidence Rating</span>
            <span className="text-cyan-400 font-bold text-sm">{confidence}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-cyan-500 bg-situ-950 cursor-pointer h-1.5 rounded"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
            <span>High Uncertainty (10%)</span>
            <span>Balanced (50-75%)</span>
            <span>Absolute Certainty (100%)</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !action.trim() || !rationale.trim()}
          className="w-full mt-2 py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'COMMITTING DECISION...' : 'COMMIT TACTICAL DECISION'}
        </button>
      </form>
    </div>
  );
};
