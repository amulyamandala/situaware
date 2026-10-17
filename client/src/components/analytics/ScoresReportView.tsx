import React, { useState } from 'react';
import {
  Grid,
  Plus,
  Search,
  Map,
  Menu,
  Zap,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  FileText,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ScoresReportViewProps {
  onSwitchToTactical?: () => void;
  sessionCode?: string;
}

export const ScoresReportView: React.FC<ScoresReportViewProps> = ({
  onSwitchToTactical,
  sessionCode = 'SITU-8800',
}) => {
  const [activeTab, setActiveTab] = useState<'scores' | 'lobby' | 'info'>('scores');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Radar Chart Data for Scoring Categories (Pentagon from Image 2)
  const radarData = [
    { subject: 'Customer Success', score: 85, fullMark: 100 },
    { subject: 'Public Relations', score: 72, fullMark: 100 },
    { subject: 'Legal / Compliance', score: 92, fullMark: 100 },
    { subject: 'Internal Communications', score: 80, fullMark: 100 },
    { subject: 'Incident Response', score: 88, fullMark: 100 },
  ];

  // Right-hand trend charts (Final Indicators from Image 2)
  const customerSuccessTrend = [
    { day: 0, val: 96 },
    { day: 1, val: 72 },
    { day: 2, val: 73 },
    { day: 3, val: 86 },
    { day: 4, val: 92 },
  ];

  const dailyRevenueTrend = [
    { day: 0, val: 50 },
    { day: 1, val: 46 },
    { day: 2, val: 41 },
    { day: 3, val: 32 },
    { day: 4, val: 42 },
  ];

  const eoyRevenueTrend = [
    { day: 0, val: 13.1 },
    { day: 1, val: 13.15 },
    { day: 2, val: 13.08 },
    { day: 3, val: 12.85 },
    { day: 4, val: 12.6 },
  ];

  // Day breakdown table
  const daysData = [
    { day: 'Day 1', score: '4/10', pct: '40%', status: 'Initial breach & perimeter detection' },
    { day: 'Day 2', score: '8/10', pct: '80%', status: 'Comms jamming isolation & counter-EW' },
    { day: 'Day 3', score: '9/10', pct: '90%', status: 'Joint air defense tracking & intercept' },
    { day: 'Day 4', score: '7/10', pct: '70%', status: 'Cyber spoofing filtering & recovery' },
    { day: 'Day 5', score: '9/10', pct: '90%', status: 'Final objective completion & breach' },
  ];

  // Category breakdown table
  const categoryScores = [
    { name: 'Customer Success', score: '85/100 (85%)' },
    { name: 'Public Relations', score: '72/100 (72%)' },
    { name: 'Legal / Compliance', score: '92/100 (92%)' },
    { name: 'Internal Communications', score: '80/100 (80%)' },
    { name: 'Incident Response', score: '88/100 (88%)' },
  ];

  return (
    <div className="flex h-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans select-none">
      {/* 1. NARROW DARK NAVY ICON RAIL (Far Left from Image 2) */}
      <div className="w-14 bg-[#0a1122] flex flex-col items-center py-4 justify-between border-r border-[#152039] shrink-0 z-20">
        <div className="flex flex-col items-center gap-6">
          {/* Top Logo Badge (Blue circle with geometric swirl / star) */}
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 cursor-pointer hover:bg-blue-500 transition-all">
            <Shield className="w-5 h-5 fill-white" />
          </div>

          {/* Grid Icon */}
          <button
            onClick={onSwitchToTactical}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Switch to Tactical Cockpit (Image 1)"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Blue Plus Button */}
          <button
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-md transition-all"
            title="New Scenario / Inject"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Search Icon */}
          <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors" title="Search Intelligence">
            <Search className="w-5 h-5" />
          </button>

          {/* Map / Dossier Icon */}
          <button
            onClick={onSwitchToTactical}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Tactical Map & Simulation"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Menu / Settings */}
        <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors" title="Settings">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SECONDARY SIDEBAR: Event Phase & Subnav (from Image 2) */}
      <div className="w-60 bg-white border-r border-slate-200 flex flex-col p-4 shrink-0 shadow-sm overflow-y-auto">
        {/* Events Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#eefcf2] text-[#16a34a] border border-[#bbf7d0] px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-[#16a34a]" />
            Events
          </span>
        </div>

        {/* Scenario Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Cloud Compromise Scenario
          </div>
          <div className="text-[11px] text-slate-500 pl-3.5 mt-0.5">
            Strategic Simulation • {sessionCode}
          </div>
        </div>

        {/* Phase Navigation List */}
        <div className="space-y-2 text-xs">
          {/* Post Event Phase Card */}
          <div className="bg-slate-100/90 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-slate-600 rounded-sm"></span>
              <div>
                <div>Post Event</div>
                <div className="text-[10px] text-slate-500 font-normal">Event Phase</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Event Lobby */}
          <button
            onClick={() => setActiveTab('lobby')}
            className="w-full text-left px-3 py-2 rounded text-slate-600 hover:bg-slate-100 flex items-center gap-2 font-medium"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Event Lobby</span>
          </button>

          {/* Event Info */}
          <button
            onClick={() => setActiveTab('info')}
            className="w-full text-left px-3 py-2 rounded text-slate-600 hover:bg-slate-100 flex items-center gap-2 font-medium"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Event Info</span>
          </button>

          {/* Scores (Active with solid blue left accent line | ) */}
          <button
            onClick={() => setActiveTab('scores')}
            className="w-full text-left px-3 py-2 rounded bg-blue-50/80 text-blue-700 font-bold flex items-center gap-2 border-l-4 border-blue-600"
          >
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Scores</span>
          </button>
        </div>

        {/* Quick link to Tactical Operations */}
        {onSwitchToTactical && (
          <div className="mt-auto pt-4 border-t border-slate-200">
            <button
              onClick={onSwitchToTactical}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <span>Tactical Replay View (Image 1)</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN EVALUATION & REPORT CONTENT (Center & Right Columns from Image 2) */}
      <div className="flex-1 flex overflow-y-auto">
        {/* Main Content Area */}
        <div className="flex-1 p-6 space-y-6 max-w-4xl">
          {/* Header */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Final Report
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Cloud Compromise Scenario
            </h1>
          </div>

          {/* Summary Info Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Summary Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Circular Donut Progress Chart (86% with green arc) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background light track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                    />
                    {/* Neon green score arc (86%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#84cc16"
                      strokeWidth="10"
                      strokeDasharray={`${86 * 2.513} 251.3`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center Text (86%) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900">86%</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Completed On: <b className="text-slate-700">May 12th, 2026</b>
                </div>
              </div>

              {/* Middle Metrics & Tags */}
              <div className="md:col-span-4 space-y-2 text-xs">
                <div className="text-xl font-bold text-slate-900">12/50 PTs</div>

                {/* Difficulty Indicator: red dots ▪▪▪ ADVANCED */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Difficulty</span>
                  <div className="flex items-center gap-0.5">
                    <span className="w-2.5 h-1.5 bg-red-600 rounded-sm"></span>
                    <span className="w-2.5 h-1.5 bg-red-600 rounded-sm"></span>
                    <span className="w-2.5 h-1.5 bg-red-600 rounded-sm"></span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 tracking-wider">ADVANCED</span>
                </div>

                <div>
                  <span className="text-slate-500">Sector: </span>
                  <span className="font-semibold text-slate-800">Financial / Defence</span>
                </div>

                {/* Topics / Tags Badges */}
                <div>
                  <div className="text-slate-500 text-[11px] mb-1">Topics</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      incident response
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      ransomware
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      cyber spoofing
                    </span>
                  </div>
                </div>
              </div>

              {/* Day / Phase Score Table (Right column of summary) */}
              <div className="md:col-span-4 border-l border-slate-100 pl-4 space-y-1.5 text-xs">
                {daysData.map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedDay(idx + 1)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                      selectedDay === idx + 1 ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{d.day}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span>{d.score} ({d.pct})</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scoring Categories Section (Radar Spider Chart + Category Table) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Scoring Categories</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Spider Radar Chart with Pentagon Axes */}
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3,3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#cbd5e1" />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#ea580c"
                      fill="#f97316"
                      fillOpacity={0.35}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between pb-1 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                  <span>Category</span>
                  <span>Score</span>
                </div>
                {categoryScores.map((cat, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">{cat.name}</span>
                    <span className="font-mono text-slate-900 font-semibold">{cat.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Responses and Scoring Reasoning Section */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Responses and Scoring Reasoning</h2>
            <div className="text-xs font-semibold text-slate-500 mb-3">Day {selectedDay}</div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phase {selectedDay} Action: Route Recon & Target Perimeter Verification</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Operative identified initial compromised telemetry at T+45s. Verified physical ground observer intel
                  against conflicting radar returns before committing breach decision.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                  <span>Confidence: <b className="text-slate-800">80%</b></span>
                  <span>Evidence Citations: <b className="text-emerald-700">Verified (3/3)</b></span>
                  <span>DRI Penalty: <b className="text-emerald-700">0.0 (Optimal)</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RIGHT COLUMN: Final Indicators Trend Charts (from Image 2) */}
        <div className="w-80 bg-white border-l border-slate-200 p-5 space-y-6 shrink-0 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Final Indicators</h2>

          {/* Chart 1: Customer Success (Orange line) */}
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
            <div className="text-xs font-bold text-slate-800 mb-2 text-center">
              Customer Success
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerSuccessTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3,3" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} ticks={[0, 25, 50, 75, 100]} />
                  <Line type="monotone" dataKey="val" stroke="#f97316" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Daily Revenue (Pink/Magenta line) */}
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
            <div className="text-xs font-bold text-slate-800 mb-2 text-center">
              Daily Revenue
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenueTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3,3" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis domain={[20, 50]} tick={{ fill: '#94a3b8', fontSize: 9 }} ticks={[20, 30, 40, 50]} tickFormatter={(v) => `${v}k`} />
                  <Line type="monotone" dataKey="val" stroke="#d946ef" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: EOY Revenue (Purple line) */}
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
            <div className="text-xs font-bold text-slate-800 mb-2 text-center">
              EOY Revenue
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eoyRevenueTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3,3" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis domain={[12, 15]} tick={{ fill: '#94a3b8', fontSize: 9 }} ticks={[12, 13, 14, 15]} tickFormatter={(v) => `${v}m`} />
                  <Line type="monotone" dataKey="val" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
