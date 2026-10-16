import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sliders,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Compass,
  ArrowLeft,
  Layers,
  Clock,
} from 'lucide-react';
import { scenarioApi } from '../services/api';

export const ScenarioStudio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scenarioId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('Operation Trident Strike — Tactical Defense');
  const [description, setDescription] = useState(
    'Combined multi-domain defense scenario testing joint decision resilience under contested EW noise, conflicting radar contacts, and cyber telemetry dropouts.'
  );
  const [version, setVersion] = useState('1.0.0');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [domains, setDomains] = useState<string[]>(['land', 'air', 'cyber', 'ew']);

  // Rubric weights
  const [weights, setWeights] = useState({
    timeliness: 0.20,
    evidenceUse: 0.25,
    confidenceCalibration: 0.20,
    teamCoordination: 0.20,
    objectiveCompletion: 0.15,
  });

  // Checkpoints
  const [checkpoints, setCheckpoints] = useState([
    {
      id: 'CP-ALPHA',
      title: 'Route Clearance & Recon Assessment',
      dueTimeSec: 60,
      expectedAction: 'Halt main convoy, verify scout reports against drone telemetry, and redirect via bypass route.',
    },
    {
      id: 'CP-BRAVO',
      title: 'Air Defense Threat Interrogation',
      dueTimeSec: 150,
      expectedAction: 'Interrogate radar contact with Mode-5 IFF, scramble CAP escort, hold surface fire.',
    },
  ]);

  // Event definitions
  const [events, setEvents] = useState([
    {
      eventId: 'EV-LAND-01',
      sequence: 1,
      title: 'Forward Scout Ridge Obstacle',
      domain: 'land',
      eventType: 'observation',
      scheduledTimeOffsetSec: 10,
      intendedRecipients: ['land_lead', 'ALL'],
      payloadText: 'Pass road blocked by anti-tank mine barrier at Grid Ref 4492-8112.',
      confidence: 85,
    },
    {
      eventId: 'EV-AIR-01',
      sequence: 2,
      title: 'Fast-Moving Inbound Radar Bogey',
      domain: 'air',
      eventType: 'radar_contact',
      scheduledTimeOffsetSec: 20,
      intendedRecipients: ['air_controller', 'ALL'],
      payloadText: 'Low-RCS contact detected 480 kts, heading 175, transponder silent.',
      confidence: 78,
    },
    {
      eventId: 'EV-CYBER-01',
      sequence: 3,
      title: 'WAN Edge Gateway Degradation',
      domain: 'cyber',
      eventType: 'cyber_alert',
      scheduledTimeOffsetSec: 30,
      intendedRecipients: ['cyber_officer', 'ALL'],
      payloadText: 'Node Gamma experiencing 42% packet loss and elevated crypto re-handshake latency.',
      confidence: 94,
    },
    {
      eventId: 'EV-EW-01',
      sequence: 4,
      title: 'Broadband Barrage Jamming Signal',
      domain: 'ew',
      eventType: 'ew_intercept',
      scheduledTimeOffsetSec: 40,
      intendedRecipients: ['ew_officer', 'ALL'],
      payloadText: 'ESM Mast 7 detected high-power directional noise jamming on 284.5 MHz.',
      confidence: 89,
    },
  ]);

  useEffect(() => {
    if (scenarioId) {
      setLoading(true);
      scenarioApi
        .get(scenarioId)
        .then((res) => {
          const s = res.data.scenario;
          setTitle(s.title);
          setDescription(s.description);
          setVersion(s.version || '1.0.0');
          setDurationMinutes(s.durationMinutes || 15);
          setDomains(s.domains || ['land', 'air', 'cyber', 'ew']);
          if (s.scoringRubric?.weights) setWeights(s.scoringRubric.weights);
          if (s.scoringRubric?.checkpoints) setCheckpoints(s.scoringRubric.checkpoints);
          if (s.eventDefinitions) {
            setEvents(
              s.eventDefinitions.map((e: any) => ({
                eventId: e.eventId,
                sequence: e.sequence,
                title: e.title,
                domain: e.domain,
                eventType: e.eventType,
                scheduledTimeOffsetSec: e.scheduledTimeOffsetSec,
                intendedRecipients: e.intendedRecipients || ['ALL'],
                payloadText: e.payload?.text || '',
                confidence: e.payload?.confidence || 80,
              }))
            );
          }
        })
        .finally(() => setLoading(false));
    }
  }, [scenarioId]);

  // Weight sum calculation
  const totalWeight =
    weights.timeliness +
    weights.evidenceUse +
    weights.confidenceCalibration +
    weights.teamCoordination +
    weights.objectiveCompletion;
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001;

  const toggleDomain = (d: string) => {
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleAddEvent = () => {
    const nextSeq = events.length + 1;
    const newEvent = {
      eventId: `EV-${domains[0]?.toUpperCase() || 'GEN'}-0${nextSeq}`,
      sequence: nextSeq,
      title: 'New Tactical Event',
      domain: domains[0] || 'land',
      eventType: 'observation',
      scheduledTimeOffsetSec: nextSeq * 30,
      intendedRecipients: ['ALL'],
      payloadText: 'Field observation report details...',
      confidence: 80,
    };
    setEvents([...events, newEvent]);
  };

  const handleRemoveEvent = (idx: number) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      alert(`Scoring rubric weights must sum to 1.0 (current sum: ${totalWeight.toFixed(2)})`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        version,
        durationMinutes,
        domains,
        scoringRubric: {
          version,
          weights,
          checkpoints,
        },
        eventDefinitions: events.map((ev) => ({
          eventId: ev.eventId,
          sequence: ev.sequence,
          title: ev.title,
          domain: ev.domain,
          eventType: ev.eventType,
          scheduledTimeOffsetSec: ev.scheduledTimeOffsetSec,
          intendedRecipients: ev.intendedRecipients,
          payload: {
            text: ev.payloadText,
            confidence: ev.confidence,
            source: 'Scenario Studio Engine',
          },
        })),
        roleDefinitions: [
          { roleId: 'land_lead', name: 'Land Domain Lead', domain: 'land' },
          { roleId: 'air_controller', name: 'Joint Air Defense Controller', domain: 'air' },
          { roleId: 'cyber_officer', name: 'Tactical Cyber Specialist', domain: 'cyber' },
          { roleId: 'ew_officer', name: 'Electronic Warfare Officer', domain: 'ew' },
        ],
      };

      if (scenarioId) {
        await scenarioApi.update(scenarioId, payload);
      } else {
        await scenarioApi.create(payload);
      }

      setSavedMsg('Scenario configuration saved and validated successfully!');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err: any) {
      alert(`Error saving scenario: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-situ-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/scenarios')}
            className="p-1.5 rounded bg-situ-900 hover:bg-situ-800 text-slate-400 hover:text-white border border-situ-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              SCENARIO STUDIO • AUTHORING ENGINE
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Build and calibrate multi-domain training scenarios, event timing, disruptions, and rubrics
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !isWeightValid}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/40 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {loading ? 'SAVING...' : 'VALIDATE & SAVE SCENARIO'}
        </button>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {savedMsg}
        </div>
      )}

      {/* Main Grid: Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Rubric Weights (1 col) */}
        <div className="space-y-6">
          {/* General Metadata Box */}
          <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3 text-xs font-mono">
            <h3 className="font-bold text-slate-200 text-sm border-b border-situ-800 pb-2">
              SCENARIO PARAMETERS
            </h3>

            <div>
              <label className="block text-slate-400 mb-1">Scenario Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Operational Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Domain Inclusions */}
            <div>
              <label className="block text-slate-400 mb-1.5">Included Information Domains</label>
              <div className="grid grid-cols-2 gap-2">
                {['land', 'air', 'cyber', 'ew'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDomain(d)}
                    className={`p-2 rounded border text-left flex items-center justify-between ${
                      domains.includes(d)
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                        : 'bg-situ-950 border-situ-800 text-slate-500'
                    }`}
                  >
                    <span className="uppercase">{d}</span>
                    {domains.includes(d) && <span className="text-[10px] text-cyan-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Resilience Scoring Rubric Weights */}
          <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-situ-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm">
                DECISION RESILIENCE RUBRIC
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isWeightValid
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                Sum: {(totalWeight * 100).toFixed(0)}% / 100%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Timeliness (20%):</span>
                <input
                  type="number"
                  step="0.05"
                  value={weights.timeliness}
                  onChange={(e) => setWeights({ ...weights, timeliness: Number(e.target.value) })}
                  className="w-16 bg-situ-950 border border-situ-700 rounded px-1.5 py-0.5 text-right text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Evidence Use & Verification (25%):</span>
                <input
                  type="number"
                  step="0.05"
                  value={weights.evidenceUse}
                  onChange={(e) => setWeights({ ...weights, evidenceUse: Number(e.target.value) })}
                  className="w-16 bg-situ-950 border border-situ-700 rounded px-1.5 py-0.5 text-right text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confidence Calibration (20%):</span>
                <input
                  type="number"
                  step="0.05"
                  value={weights.confidenceCalibration}
                  onChange={(e) => setWeights({ ...weights, confidenceCalibration: Number(e.target.value) })}
                  className="w-16 bg-situ-950 border border-situ-700 rounded px-1.5 py-0.5 text-right text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Team Coordination (20%):</span>
                <input
                  type="number"
                  step="0.05"
                  value={weights.teamCoordination}
                  onChange={(e) => setWeights({ ...weights, teamCoordination: Number(e.target.value) })}
                  className="w-16 bg-situ-950 border border-situ-700 rounded px-1.5 py-0.5 text-right text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Objective Completion (15%):</span>
                <input
                  type="number"
                  step="0.05"
                  value={weights.objectiveCompletion}
                  onChange={(e) => setWeights({ ...weights, objectiveCompletion: Number(e.target.value) })}
                  className="w-16 bg-situ-950 border border-situ-700 rounded px-1.5 py-0.5 text-right text-slate-200"
                />
              </div>
            </div>

            {!isWeightValid && (
              <p className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Rubric weights must sum to exactly 1.0 (100%).
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Events & Timeline Definitions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-situ-900 border border-situ-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-situ-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-100 font-mono text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  SYNTHETIC REPORT & EVENT TIMELINE ({events.length} EVENTS)
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Configure server-authoritative schedule offsets and recipient permissions
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEvent}
                className="px-3 py-1.5 rounded bg-situ-800 hover:bg-situ-700 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 border border-cyan-800"
              >
                <Plus className="w-3.5 h-3.5" /> ADD EVENT
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {events.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-situ-950 border border-situ-800 hover:border-slate-700 transition-colors text-xs font-mono space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-situ-800 flex items-center justify-center font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ev.eventId}
                        onChange={(e) => {
                          const updated = [...events];
                          updated[idx].eventId = e.target.value;
                          setEvents(updated);
                        }}
                        className="w-24 bg-situ-900 border border-situ-700 rounded px-1.5 py-0.5 text-cyan-300 font-bold"
                      />
                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) => {
                          const updated = [...events];
                          updated[idx].title = e.target.value;
                          setEvents(updated);
                        }}
                        className="w-60 bg-situ-900 border border-situ-700 rounded px-2 py-0.5 text-slate-200"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">T+</span>
                      <input
                        type="number"
                        value={ev.scheduledTimeOffsetSec}
                        onChange={(e) => {
                          const updated = [...events];
                          updated[idx].scheduledTimeOffsetSec = Number(e.target.value);
                          setEvents(updated);
                        }}
                        className="w-16 bg-situ-900 border border-situ-700 rounded px-1.5 py-0.5 text-amber-300 font-bold"
                      />
                      <span className="text-slate-500">s</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Domain & Recipients row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block mb-0.5">Domain</span>
                      <select
                        value={ev.domain}
                        onChange={(e) => {
                          const updated = [...events];
                          updated[idx].domain = e.target.value;
                          setEvents(updated);
                        }}
                        className="w-full bg-situ-900 border border-situ-700 rounded px-2 py-1 text-slate-200 text-xs"
                      >
                        <option value="land">Land Domain</option>
                        <option value="air">Air Domain</option>
                        <option value="cyber">Cyber Domain</option>
                        <option value="ew">Electronic Warfare</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block mb-0.5">Recipients</span>
                      <select
                        value={ev.intendedRecipients[0] || 'ALL'}
                        onChange={(e) => {
                          const updated = [...events];
                          updated[idx].intendedRecipients = [e.target.value];
                          setEvents(updated);
                        }}
                        className="w-full bg-situ-900 border border-situ-700 rounded px-2 py-1 text-slate-200 text-xs"
                      >
                        <option value="ALL">ALL (Broadcast)</option>
                        <option value="land_lead">Land Domain Lead</option>
                        <option value="air_controller">Air Defense Controller</option>
                        <option value="cyber_officer">Cyber Specialist</option>
                        <option value="ew_officer">EW Officer</option>
                      </select>
                    </div>
                  </div>

                  {/* Payload Text */}
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-0.5">Synthetic Report Text</span>
                    <input
                      type="text"
                      value={ev.payloadText}
                      onChange={(e) => {
                        const updated = [...events];
                        updated[idx].payloadText = e.target.value;
                        setEvents(updated);
                      }}
                      className="w-full bg-situ-900 border border-situ-700 rounded px-2 py-1 text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
