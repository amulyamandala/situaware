import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldX, RefreshCw, X, Zap } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { DisruptionType } from '../../types';

interface DisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisruptionModal: React.FC<DisruptionModalProps> = ({ isOpen, onClose }) => {
  const { session, injectDisruption } = useSession();

  const [type, setType] = useState<DisruptionType>('delay');
  const [domain, setDomain] = useState<string>('land');
  const [targetRoleId, setTargetRoleId] = useState<string>('land_lead');
  const [delaySec, setDelaySec] = useState<number>(25);
  const [conflictText, setConflictText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await injectDisruption({
        type,
        domain: domain === 'all' ? undefined : domain,
        targetRoleId: targetRoleId === 'all' ? undefined : targetRoleId,
        parameters: {
          delaySec: type === 'delay' ? delaySec : undefined,
          conflictDescription: type === 'conflicting' ? conflictText || 'Contradictory sensor report injected' : undefined,
          overridePayload: type === 'conflicting' && conflictText ? { text: conflictText } : undefined,
        },
      });

      setSuccessMsg(`Successfully injected live ${type.toUpperCase()} disruption!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`Failed to inject disruption: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-situ-900 border border-situ-700 rounded-xl max-w-lg w-full p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-situ-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-situ-800 pb-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-mono text-base font-bold text-slate-100">
              INJECT COMMUNICATION DEGRADATION
            </h3>
            <p className="text-[11px] text-slate-400">
              Degrade information feed to test trainee decision resilience in real time
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-2.5 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleInject} className="space-y-4 text-xs font-mono">
          {/* Disruption Type Selector */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">1. SELECT DISRUPTION TYPE</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('delay')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  type === 'delay'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-situ-950 border-situ-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-4 h-4 text-cyan-400" /> DELAY
                </div>
                <span className="text-[10px] text-slate-400">Hold report for N seconds</span>
              </button>

              <button
                type="button"
                onClick={() => setType('dropout')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  type === 'dropout'
                    ? 'bg-red-950 border-red-500 text-red-200'
                    : 'bg-situ-950 border-situ-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldX className="w-4 h-4 text-red-400" /> DROPOUT
                </div>
                <span className="text-[10px] text-slate-400">Drop report from recipient</span>
              </button>

              <button
                type="button"
                onClick={() => setType('conflicting')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  type === 'conflicting'
                    ? 'bg-amber-950 border-amber-400 text-amber-200'
                    : 'bg-situ-950 border-situ-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <RefreshCw className="w-4 h-4 text-amber-400" /> CONFLICT
                </div>
                <span className="text-[10px] text-slate-400">Mutate into contradictory intel</span>
              </button>
            </div>
          </div>

          {/* Domain & Target Role Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Target Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">ALL DOMAINS</option>
                <option value="land">Land Domain</option>
                <option value="air">Air Domain</option>
                <option value="cyber">Cyber Domain</option>
                <option value="ew">Electronic Warfare</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Participant Role</label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">ALL PARTICIPANTS</option>
                <option value="land_lead">Land Domain Lead</option>
                <option value="air_controller">Air Defense Controller</option>
                <option value="cyber_officer">Cyber Specialist</option>
                <option value="ew_officer">EW Officer</option>
              </select>
            </div>
          </div>

          {/* Dynamic Parameters depending on type */}
          {type === 'delay' && (
            <div className="bg-situ-950 p-3 rounded border border-situ-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300">Delivery Latency Delay</span>
                <span className="text-cyan-400 font-bold">{delaySec} seconds</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={delaySec}
                onChange={(e) => setDelaySec(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Targeted events will be held on the server and delivered {delaySec}s later.
              </span>
            </div>
          )}

          {type === 'conflicting' && (
            <div className="bg-situ-950 p-3 rounded border border-situ-800">
              <label className="block text-slate-300 mb-1">Custom Contradictory Intelligence Payload</label>
              <textarea
                rows={2}
                value={conflictText}
                onChange={(e) => setConflictText(e.target.value)}
                placeholder="Leave blank for automatic domain-tailored contradiction (e.g. Route blocked vs open)..."
                className="w-full bg-situ-900 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          )}

          {type === 'dropout' && (
            <div className="bg-red-950/20 border border-red-900/50 p-3 rounded text-[11px] text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 inline mr-1.5 -mt-0.5" />
              Dropout disruption will silently prevent targeted reports from reaching the specified recipient while persisting an audit dropout record in the backend for AAR review.
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded bg-situ-800 hover:bg-situ-750 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-2 py-2 px-4 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-900/40"
            >
              <Zap className="w-4 h-4" />
              {submitting ? 'INJECTING DISRUPTION...' : 'EXECUTE LIVE DISRUPTION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
