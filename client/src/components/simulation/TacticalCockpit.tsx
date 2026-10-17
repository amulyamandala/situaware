import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Sliders,
  Clock,
  Layers,
  Settings,
  HelpCircle,
  Video,
  MapPin,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
  Bookmark,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Crosshair,
  User,
  Users,
} from 'lucide-react';

interface TacticalCockpitProps {
  onSwitchToScores?: () => void;
  sessionCode?: string;
}

export const TacticalCockpit: React.FC<TacticalCockpitProps> = ({
  onSwitchToScores,
  sessionCode = 'SITU-8800',
}) => {
  // Playback & Timeline state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(25); // seconds from 12:46:00
  const [timescale, setTimescale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapType, setMapType] = useState<'hybrid' | 'map'>('hybrid');
  const [selectedRole, setSelectedRole] = useState('Squad_Leader');
  const [selectedObjective, setSelectedObjective] = useState('Enter and Clear 1st Room');
  const [activeCam, setActiveCam] = useState<string | null>(null);

  // Accordion section collapse state
  const [expandedSections, setExpandedSections] = useState({
    mission: true,
    teams: true,
    objectives: true,
    equipment: false,
    health: false,
    firstRoom: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Timeline timer tick
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((t) => {
          if (t >= 210) {
            setIsPlaying(false);
            return 210;
          }
          return t + 1;
        });
      }, 1000 / timescale);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timescale]);

  // Format absolute clock: Base is 12:46:00 Tuesday, Feb 09, 2021 (from screenshot)
  const formatTimecode = (sec: number) => {
    const baseHour = 12;
    const baseMin = 46;
    const totalSec = baseMin * 60 + sec;
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const timeStr = `${baseHour.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${timeStr} Tuesday, February 09, 2021`;
  };

  // Timeline markers (from 12:46:00 to 12:49:30)
  const timelineMarkers = [
    { sec: 0, label: '12:46:00' },
    { sec: 15, label: '12:46:15' },
    { sec: 30, label: '12:46:30' },
    { sec: 45, label: '12:46:45' },
    { sec: 60, label: '12:47:00' },
    { sec: 75, label: '12:47:15' },
    { sec: 90, label: '12:47:30' },
    { sec: 105, label: '12:47:45' },
    { sec: 120, label: '12:48:00' },
    { sec: 135, label: '12:48:15' },
    { sec: 150, label: '12:48:30' },
    { sec: 165, label: '12:48:45' },
    { sec: 180, label: '12:49:00' },
    { sec: 195, label: '12:49:15' },
    { sec: 210, label: '12:49:30' },
  ];

  // Percentage for the playhead cursor (0 to 210 seconds)
  const playheadPercent = Math.min(100, Math.max(0, (currentTimeSec / 210) * 100));

  // Operative video feeds definition
  const videoFeeds = [
    { id: 'kadams', name: 'KAdams', type: 'first_person', angle: 'breach_point' },
    { id: 'lmarshall', name: 'LMarshall', type: 'tactical_stack', angle: 'doorway_entry' },
    { id: 'mlawson', name: 'MLawson', type: 'perimeter_guard', angle: 'corner_cover' },
    { id: 'tgregory', name: 'TGREGORY', type: 'hallway_advance', angle: 'corridor' },
    { id: 'first_room', name: 'first room', type: 'cctv_interior', angle: 'overhead_cqb' },
    { id: 'outside', name: 'outside', type: 'surveillance', angle: 'compound_perimeter' },
    { id: 'second_room', name: 'second room', type: 'interior_secondary', angle: 'clearing' },
    { id: 'trainees_irl', name: 'trainees irl', type: 'command_room', angle: 'workstations', status: 'Ended' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#1e2633] text-slate-100 select-none overflow-hidden font-sans">
      {/* Sub-Toolbar (Silver/Slate Bar from Image 1) */}
      <div className="bg-[#cbd5e1] text-slate-800 border-b border-slate-400 px-3 py-1 flex items-center justify-between text-xs font-medium shadow-sm">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 hover:bg-slate-300 px-2 py-0.5 rounded text-slate-700">
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Settings</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
          <span className="text-slate-400">|</span>
          <button className="flex items-center gap-1 text-blue-700 font-semibold hover:bg-slate-300 px-2 py-0.5 rounded">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Timeline</span>
          </button>
          <span className="text-slate-400">|</span>
          <button className="flex items-center gap-1 hover:bg-slate-300 px-2 py-0.5 rounded text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-600" />
            <span>Map</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
          <span className="text-slate-400">|</span>
          <button className="flex items-center gap-1 hover:bg-slate-300 px-2 py-0.5 rounded text-slate-700">
            <Video className="w-3.5 h-3.5 text-slate-600" />
            <span>Video</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToScores && (
            <button
              onClick={onSwitchToScores}
              className="bg-[#1e40af] hover:bg-blue-700 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
            >
              <span>View Analytics & Scores (Image 2)</span>
            </button>
          )}
          <button className="text-blue-700 hover:text-blue-900 p-0.5" title="Help & Reference">
            <HelpCircle className="w-4 h-4 fill-blue-700 text-white" />
          </button>
        </div>
      </div>

      {/* Main Tactical Grid (Left Hierarchy | Center Satellite Map | Right Multi-Cam Feeds) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT SIDEBAR: Mission, Teams, Roles, Objectives */}
        <div className="w-64 bg-[#2b3544] border-r border-[#1a222d] flex flex-col overflow-y-auto text-xs shrink-0">
          {/* Mission Header */}
          <div className="p-2 border-b border-[#1f2835]">
            <button
              onClick={() => toggleSection('mission')}
              className="w-full bg-[#525f70] hover:bg-[#5e6c7e] text-white py-1.5 px-3 rounded-full text-center font-bold tracking-wide shadow-sm flex items-center justify-between"
            >
              <span className="mx-auto">Mission</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.mission ? '' : '-rotate-90'}`} />
            </button>
            {expandedSections.mission && (
              <div className="mt-2 p-2 bg-[#1f2733] rounded text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-cyan-400">Operation Trishul Guard</div>
                <div className="text-slate-400 text-[10px]">Compound CQB & Hostage Neutralization</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-700 text-slate-400">
                  <span>Phase: Clearing</span>
                  <span className="text-emerald-400 font-mono">CODE: {sessionCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* Teams and Roles Section */}
          <div className="p-2 border-b border-[#1f2835]">
            <button
              onClick={() => toggleSection('teams')}
              className="w-full bg-[#525f70] hover:bg-[#5e6c7e] text-white py-1.5 px-3 rounded-full text-center font-bold tracking-wide shadow-sm flex items-center justify-between"
            >
              <span className="mx-auto">Teams and Roles</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.teams ? '' : '-rotate-90'}`} />
            </button>

            {expandedSections.teams && (
              <div className="mt-2 space-y-1">
                {/* BLUFOR Header */}
                <div className="bg-[#cc2b2b] text-white font-bold px-2 py-1 text-[11px] uppercase tracking-wider rounded-t">
                  BLUFOR
                </div>
                {/* Infantry Platoon */}
                <button className="w-full text-left bg-[#b92b2b] hover:bg-[#cb3030] text-white px-3 py-1 font-medium text-[11px] border-t border-[#8e1f1f]">
                  Infantry Platoon
                </button>
                {/* Infantry Squad */}
                <button className="w-full text-left bg-[#b92b2b] hover:bg-[#cb3030] text-white px-4 py-1 font-medium text-[11px] border-t border-[#8e1f1f]">
                  Infantry Squad
                </button>
                {/* Squad Leader (Active Selected with Checkmark) */}
                <button
                  onClick={() => setSelectedRole('Squad_Leader')}
                  className={`w-full text-left px-5 py-1 text-[11px] font-semibold flex items-center justify-between transition-colors ${
                    selectedRole === 'Squad_Leader'
                      ? 'bg-white text-slate-900 shadow-inner'
                      : 'bg-[#b92b2b] hover:bg-[#cb3030] text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {selectedRole === 'Squad_Leader' && <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />}
                    Squad_Leader
                  </span>
                </button>
                {/* Fireteam Alpha */}
                <button className="w-full text-left bg-[#b92b2b] hover:bg-[#cb3030] text-white px-4 py-1 font-medium text-[11px] border-t border-[#8e1f1f]">
                  Fireteam Alpha
                </button>
                {/* Alpha_Leader */}
                <button
                  onClick={() => setSelectedRole('Alpha_Leader')}
                  className={`w-full text-left px-5 py-1 text-[11px] font-medium transition-colors ${
                    selectedRole === 'Alpha_Leader'
                      ? 'bg-white text-slate-900'
                      : 'bg-[#b92b2b] hover:bg-[#cb3030] text-white'
                  }`}
                >
                  Alpha_Leader
                </button>
                {/* Alpha_Rifleman */}
                <button
                  onClick={() => setSelectedRole('Alpha_Rifleman')}
                  className={`w-full text-left px-5 py-1 text-[11px] font-medium transition-colors ${
                    selectedRole === 'Alpha_Rifleman'
                      ? 'bg-white text-slate-900'
                      : 'bg-[#b92b2b] hover:bg-[#cb3030] text-white'
                  }`}
                >
                  Alpha_Rifleman
                </button>
                {/* Alpha Automatic Rifleman */}
                <button
                  onClick={() => setSelectedRole('Alpha_Automatic_Rifleman')}
                  className={`w-full text-left px-5 py-1 text-[11px] font-medium transition-colors ${
                    selectedRole === 'Alpha_Automatic_Rifleman'
                      ? 'bg-white text-slate-900'
                      : 'bg-[#b92b2b] hover:bg-[#cb3030] text-white'
                  }`}
                >
                  Alpha Automatic Rifleman
                </button>
                {/* Alpha_Grenadier */}
                <button
                  onClick={() => setSelectedRole('Alpha_Grenadier')}
                  className={`w-full text-left px-5 py-1 text-[11px] font-medium rounded-b transition-colors ${
                    selectedRole === 'Alpha_Grenadier'
                      ? 'bg-white text-slate-900'
                      : 'bg-[#b92b2b] hover:bg-[#cb3030] text-white'
                  }`}
                >
                  Alpha_Grenadier
                </button>
              </div>
            )}
          </div>

          {/* Objectives Section */}
          <div className="p-2 border-b border-[#1f2835]">
            <button
              onClick={() => toggleSection('objectives')}
              className="w-full bg-[#525f70] hover:bg-[#5e6c7e] text-white py-1.5 px-3 rounded-full text-center font-bold tracking-wide shadow-sm flex items-center justify-between"
            >
              <span className="mx-auto">Objectives</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.objectives ? '' : '-rotate-90'}`} />
            </button>

            {expandedSections.objectives && (
              <div className="mt-2 space-y-1">
                {/* Objective 1 */}
                <button
                  onClick={() => setSelectedObjective('Engage Targets with an M4')}
                  className={`w-full text-left p-2 rounded text-[11px] transition-colors ${
                    selectedObjective === 'Engage Targets with an M4'
                      ? 'bg-[#cc2b2b] text-white font-semibold'
                      : 'bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  Engage Targets with an M4
                </button>
                {/* Objective 2 (Active in Red with Checkmark) */}
                <button
                  onClick={() => setSelectedObjective('Enter and Clear 1st Room')}
                  className={`w-full text-left p-2 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                    selectedObjective === 'Enter and Clear 1st Room'
                      ? 'bg-[#cc2b2b] text-white shadow'
                      : 'bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                  <span>Enter and Clear 1st Room</span>
                </button>
                {/* Objective 3 */}
                <button
                  onClick={() => setSelectedObjective('Practicing Muzzle Awareness')}
                  className={`w-full text-left p-2 rounded text-[11px] transition-colors ${
                    selectedObjective === 'Practicing Muzzle Awareness'
                      ? 'bg-[#cc2b2b] text-white font-semibold'
                      : 'bg-[#b92b2b] hover:bg-[#cb3030] text-white'
                  }`}
                >
                  Practicing Muzzle Awareness
                </button>
              </div>
            )}
          </div>

          {/* Equipment Header */}
          <div className="p-2 border-b border-[#1f2835]">
            <button
              onClick={() => toggleSection('equipment')}
              className="w-full bg-[#525f70] hover:bg-[#5e6c7e] text-white py-1.5 px-3 rounded-full text-center font-bold tracking-wide shadow-sm flex items-center justify-between"
            >
              <span className="mx-auto">Equipment</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.equipment ? '' : '-rotate-90'}`} />
            </button>
            {expandedSections.equipment && (
              <div className="mt-2 p-2 bg-[#1f2733] rounded text-[10px] text-slate-300 space-y-1">
                <div className="flex justify-between"><span>M4A1 Carbine</span><span className="text-emerald-400">Ready</span></div>
                <div className="flex justify-between"><span>Night Vision Goggles</span><span className="text-emerald-400">Active</span></div>
                <div className="flex justify-between"><span>Flashbang x2</span><span className="text-amber-400">Available</span></div>
              </div>
            )}
          </div>

          {/* Health Header */}
          <div className="p-2">
            <button
              onClick={() => toggleSection('health')}
              className="w-full bg-[#525f70] hover:bg-[#5e6c7e] text-white py-1.5 px-3 rounded-full text-center font-bold tracking-wide shadow-sm flex items-center justify-between"
            >
              <span className="mx-auto">Health</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.health ? '' : '-rotate-90'}`} />
            </button>
            {expandedSections.health && (
              <div className="mt-2 p-2 bg-[#1f2733] rounded text-[10px] space-y-1">
                <div className="flex justify-between"><span>Squad Status</span><span className="text-emerald-400">100% Operational</span></div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Satellite Hybrid Map with NATO Military Symbology */}
        <div className="flex-1 relative bg-[#0e1622] flex flex-col overflow-hidden border-r border-[#1a222d]">
          {/* Satellite Map Canvas */}
          <div className="flex-1 relative overflow-hidden select-none">
            {/* Satellite Imagery SVG Canvas */}
            <svg
              className="w-full h-full object-cover transition-transform duration-200"
              viewBox="0 0 1000 700"
              preserveAspectRatio="xMidYMid slice"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Grass & Lawn Texture */}
                <pattern id="lawn" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="60" height="60" fill="#4a5d3f" />
                  <circle cx="15" cy="15" r="8" fill="#3e5033" opacity="0.6" />
                  <circle cx="45" cy="35" r="12" fill="#546b47" opacity="0.5" />
                  <circle cx="30" cy="50" r="6" fill="#38492e" opacity="0.7" />
                </pattern>

                {/* Road Asphalt Texture */}
                <pattern id="asphalt" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="40" fill="#717a84" />
                  <line x1="0" y1="20" x2="40" y2="20" stroke="#8a95a1" strokeWidth="1" strokeDasharray="4,6" opacity="0.4" />
                </pattern>

                {/* Roof Texture */}
                <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2c3035" />
                  <stop offset="50%" stopColor="#3c434c" />
                  <stop offset="100%" stopColor="#1e2227" />
                </linearGradient>

                {/* Hostile Threat Radial Pulse */}
                <radialGradient id="threatPulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Ground / Turf */}
              <rect width="1000" height="700" fill="url(#lawn)" />

              {/* Curving Driveway / Road (matching screenshot) */}
              <path
                d="M 50,0 C 180,60 220,180 200,320 C 180,440 240,620 420,700"
                fill="none"
                stroke="url(#asphalt)"
                strokeWidth="70"
                strokeLinecap="round"
              />
              <path
                d="M 50,0 C 180,60 220,180 200,320 C 180,440 240,620 420,700"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="3"
                strokeDasharray="10,12"
                opacity="0.6"
              />

              {/* Road curb & sidewalks */}
              <path
                d="M 15,0 C 145,60 185,180 165,320 C 145,440 205,620 385,700"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="4"
              />

              {/* Compound Driveway to Building */}
              <path
                d="M 210,260 L 370,300 L 400,420 L 320,400 Z"
                fill="#626b75"
                stroke="#8a95a1"
                strokeWidth="2"
              />

              {/* Primary Target Building (CQB Structure from screenshot) */}
              <g transform="translate(320, 240)">
                {/* Shadow */}
                <rect x="15" y="15" width="160" height="190" fill="#000" opacity="0.4" rx="4" />
                {/* Building Base & Roof */}
                <rect x="0" y="0" width="160" height="190" fill="url(#roofGrad)" stroke="#111827" strokeWidth="3" rx="2" />
                {/* Inner Room Partition Walls */}
                <line x1="0" y1="80" x2="160" y2="80" stroke="#525b68" strokeWidth="3" />
                <line x1="90" y1="0" x2="90" y2="190" stroke="#525b68" strokeWidth="3" />
                <line x1="0" y1="130" x2="90" y2="130" stroke="#525b68" strokeWidth="3" />

                {/* Room Labels (Overhead) */}
                <text x="25" y="45" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" opacity="0.7">Room 1</text>
                <text x="110" y="45" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" opacity="0.7">Room 2</text>
                <text x="25" y="110" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" opacity="0.7">Hallway</text>
                <text x="25" y="165" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" opacity="0.7">Entry</text>

                {/* Entryway breach door */}
                <rect x="80" y="185" width="20" height="8" fill="#e2e8f0" stroke="#000" strokeWidth="1" />
              </g>

              {/* Secondary Garage / Outbuilding */}
              <g transform="translate(680, 360)">
                <rect x="10" y="10" width="180" height="100" fill="#000" opacity="0.3" rx="2" />
                <rect x="0" y="0" width="180" height="100" fill="#47505d" stroke="#1f2937" strokeWidth="2" rx="2" />
                <rect x="20" y="70" width="45" height="30" fill="#991b1b" opacity="0.8" />
                <rect x="80" y="70" width="45" height="30" fill="#991b1b" opacity="0.8" />
              </g>

              {/* Trees & Shrubbery */}
              <circle cx="160" cy="120" r="28" fill="#2d3b24" opacity="0.8" />
              <circle cx="155" cy="115" r="22" fill="#3b4d30" opacity="0.9" />
              <circle cx="580" cy="180" r="35" fill="#2d3b24" opacity="0.8" />
              <circle cx="575" cy="175" r="28" fill="#3b4d30" opacity="0.9" />

              {/* Target Line / Bearing Vector from Squad to Breach Entrance */}
              <line
                x1="260"
                y1="190"
                x2="395"
                y2="425"
                stroke="#111827"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />

              {/* Hostile Threat Marker (Red Diamond / OPFOR inside building) */}
              <g transform="translate(365, 435)">
                <circle cx="0" cy="0" r="24" fill="url(#threatPulse)">
                  <animate attributeName="r" values="18;26;18" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
                </circle>
                {/* Red diamond symbol */}
                <polygon points="0,-12 12,0 0,12 -12,0" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                <polygon points="0,-5 5,0 0,5 -5,0" fill="#ffffff" />
                {/* Arrow direction pointing down */}
                <path d="M 0,12 L 0,22 M -4,18 L 0,22 L 4,18" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* NATO Friendly BLUFOR Unit Markers (Blue rectangles with diagonal slash & squad labels) */}
              {/* Unit 1: aburtsealer */}
              <g transform="translate(360, 315)">
                {/* NATO Blue Rectangle with Diagonal Slash (Infantry) */}
                <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-14" y1="10" x2="14" y2="-10" stroke="#ffffff" strokeWidth="1.5" />
                {/* Friendly label */}
                <text x="-26" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                  aburtsealer
                </text>
              </g>

              {/* Unit 2: whuembull */}
              <g transform="translate(362, 350)">
                <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-14" y1="10" x2="14" y2="-10" stroke="#ffffff" strokeWidth="1.5" />
                <text x="-24" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                  whuembull
                </text>
              </g>

              {/* Unit 3: spengsey */}
              <g transform="translate(362, 385)">
                <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-14" y1="10" x2="14" y2="-10" stroke="#ffffff" strokeWidth="1.5" />
                <text x="-22" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                  spengsey
                </text>
              </g>

              {/* Unit 4: Support / Breacher at entrance */}
              <g transform="translate(385, 335)">
                <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-14" y1="10" x2="14" y2="-10" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            </svg>

            {/* Inset Mini-Map at Bottom Right (with red alert count ! 4) */}
            <div className="absolute bottom-3 right-3 w-48 h-32 bg-[#1e293b]/95 border-2 border-white rounded shadow-2xl overflow-hidden pointer-events-auto">
              {/* Mini tactical preview */}
              <div className="w-full h-full relative bg-[#0f172a]">
                <svg className="w-full h-full" viewBox="0 0 200 130">
                  <rect width="200" height="130" fill="#334155" opacity="0.6" />
                  <rect x="70" y="40" width="50" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  {/* Radar sweep line in mini-map */}
                  <line x1="95" y1="60" x2="140" y2="85" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
                  <circle cx="95" cy="60" r="3" fill="#38bdf8" />
                  <circle cx="120" cy="55" r="4" fill="#0284c7" />
                  <circle cx="85" cy="75" r="4" fill="#ef4444" />
                </svg>

                {/* Red Alert Inset Badge (! 4 from screenshot) */}
                <div className="absolute top-1 right-1 bg-[#cc2b2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                  <AlertTriangle className="w-3 h-3 text-amber-300" />
                  <span>4</span>
                </div>
              </div>
            </div>

            {/* Layer Switcher Buttons: Hybrid | Map */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex bg-white/95 text-slate-800 rounded shadow-md border border-slate-300 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setMapType('hybrid')}
                className={`px-3 py-1 transition-colors ${
                  mapType === 'hybrid' ? 'bg-slate-200 text-blue-700 shadow-inner' : 'hover:bg-slate-100'
                }`}
              >
                Hybrid
              </button>
              <button
                onClick={() => setMapType('map')}
                className={`px-3 py-1 transition-colors border-l border-slate-300 ${
                  mapType === 'map' ? 'bg-slate-200 text-blue-700 shadow-inner' : 'hover:bg-slate-100'
                }`}
              >
                Map
              </button>
            </div>

            {/* Google Watermark Branding (from screenshot) */}
            <div className="absolute bottom-1 left-2 text-[11px] font-bold text-white/80 drop-shadow">
              Google
            </div>

            {/* Zoom / Fullscreen Controls on Top Right */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                className="w-7 h-7 bg-white/90 hover:bg-white text-slate-800 rounded flex items-center justify-center shadow"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                className="w-7 h-7 bg-white/90 hover:bg-white text-slate-800 rounded flex items-center justify-center shadow"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="w-7 h-7 bg-white/90 hover:bg-white text-slate-800 rounded flex items-center justify-center shadow"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Multi-Cam Tactical Video Feeds Grid (2 columns x 4 rows) */}
        <div className="w-80 bg-[#141b25] flex flex-col overflow-y-auto shrink-0 border-l border-[#0c1219]">
          <div className="grid grid-cols-2 gap-1 p-1 bg-black">
            {videoFeeds.map((feed) => (
              <div
                key={feed.id}
                onClick={() => setActiveCam(feed.id === activeCam ? null : feed.id)}
                className={`relative aspect-[4/3] bg-[#1a2330] border border-slate-800 overflow-hidden cursor-pointer group hover:border-cyan-400 transition-colors ${
                  activeCam === feed.id ? 'ring-2 ring-cyan-400' : ''
                }`}
              >
                {/* Synthetic 3D Video Feed Simulation (Wireframe CQB / CCTV rendering) */}
                <svg className="w-full h-full bg-[#1e2631]" viewBox="0 0 160 120">
                  {/* Background Room Walls */}
                  <rect width="160" height="120" fill="#252f3d" />
                  {/* Floor Grid Lines */}
                  <line x1="0" y1="85" x2="160" y2="85" stroke="#374454" strokeWidth="1" />
                  <line x1="20" y1="85" x2="0" y2="120" stroke="#374454" strokeWidth="1" />
                  <line x1="60" y1="85" x2="40" y2="120" stroke="#374454" strokeWidth="1" />
                  <line x1="100" y1="85" x2="120" y2="120" stroke="#374454" strokeWidth="1" />
                  <line x1="140" y1="85" x2="160" y2="120" stroke="#374454" strokeWidth="1" />

                  {/* Corner / Doorway geometry */}
                  {feed.id === 'kadams' && (
                    <g>
                      {/* Door frame */}
                      <rect x="70" y="20" width="50" height="65" fill="#151b22" stroke="#485669" strokeWidth="1" />
                      {/* Gun muzzle in foreground */}
                      <polygon points="120,120 160,85 160,120" fill="#111827" />
                      <line x1="120" y1="120" x2="85" y2="50" stroke="#00f0ff" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />
                    </g>
                  )}

                  {feed.id === 'lmarshall' && (
                    <g>
                      {/* Soldier Stack in corridor */}
                      <rect x="50" y="30" width="40" height="55" fill="#151b22" stroke="#485669" />
                      {/* Operative silhouette */}
                      <circle cx="95" cy="55" r="8" fill="#4a5568" />
                      <rect x="88" y="63" width="14" height="22" fill="#2d3748" rx="2" />
                    </g>
                  )}

                  {feed.id === 'mlawson' && (
                    <g>
                      {/* Crouched soldier */}
                      <circle cx="85" cy="65" r="7" fill="#4a5568" />
                      <rect x="75" y="72" width="20" height="15" fill="#2d3748" rx="2" />
                      {/* Weapon */}
                      <line x1="72" y1="76" x2="50" y2="76" stroke="#111" strokeWidth="3" />
                    </g>
                  )}

                  {feed.id === 'tgregory' && (
                    <g>
                      {/* Hallway walls */}
                      <polygon points="0,0 45,30 45,90 0,120" fill="#1b222c" />
                      <polygon points="160,0 115,30 115,90 160,120" fill="#1b222c" />
                      <rect x="65" y="35" width="30" height="50" fill="#0d1117" />
                    </g>
                  )}

                  {feed.id === 'first_room' && (
                    <g>
                      {/* Overhead room view */}
                      <circle cx="50" cy="50" r="6" fill="#38bdf8" />
                      <circle cx="70" cy="60" r="6" fill="#38bdf8" />
                      <circle cx="110" cy="70" r="6" fill="#ef4444" />
                    </g>
                  )}

                  {feed.id === 'outside' && (
                    <g>
                      {/* Compound Garage view */}
                      <rect x="30" y="40" width="100" height="45" fill="#64748b" stroke="#334155" />
                      <rect x="45" y="55" width="30" height="30" fill="#7f1d1d" />
                      <rect x="85" y="55" width="30" height="30" fill="#7f1d1d" />
                    </g>
                  )}

                  {feed.id === 'second_room' && (
                    <g>
                      <rect x="20" y="20" width="120" height="65" fill="#1a2330" stroke="#374454" />
                      <circle cx="90" cy="60" r="6" fill="#4a5568" />
                    </g>
                  )}

                  {feed.id === 'trainees_irl' && (
                    <g>
                      {/* Workstations with trainees */}
                      <rect x="20" y="60" width="45" height="25" fill="#334155" rx="2" />
                      <rect x="80" y="60" width="45" height="25" fill="#334155" rx="2" />
                      <circle cx="42" cy="50" r="8" fill="#64748b" />
                      <circle cx="102" cy="50" r="8" fill="#64748b" />
                    </g>
                  )}

                  {/* Scanline overlay */}
                  <line x1="0" y1="30" x2="160" y2="30" stroke="#000" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="60" x2="160" y2="60" stroke="#000" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="90" x2="160" y2="90" stroke="#000" strokeWidth="0.5" opacity="0.3" />
                </svg>

                {/* Cyan Operative Name Label (matching screenshot) */}
                <div className="absolute top-1 left-1.5 text-[#00f0ff] font-bold text-[11px] drop-shadow-md tracking-wide">
                  {feed.name}
                </div>

                {/* Status Badge (e.g. Ended) */}
                {feed.status && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-slate-200 text-xs font-semibold backdrop-blur-[1px]">
                    {feed.status}
                  </div>
                )}

                {/* Live indicator pip */}
                {!feed.status && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL: Synchronized Multi-Track Timeline & Status Bars */}
      <div className="bg-[#f1f5f9] text-slate-800 border-t-2 border-slate-400 flex flex-col shrink-0">
        {/* Timeline Top Controls Bar */}
        <div className="px-3 py-1 bg-[#e2e8f0] border-b border-slate-300 flex items-center justify-between text-xs">
          {/* Play/Pause & Timestamp */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-6 h-6 rounded bg-slate-100 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm border border-slate-300"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => setCurrentTimeSec(0)}
              className="w-6 h-6 rounded bg-slate-100 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm border border-slate-300"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Absolute Timestamp (from screenshot: 12:46:25 Tuesday, February 09, 2021) */}
            <div className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-inner">
              {formatTimecode(currentTimeSec)}
            </div>
          </div>

          {/* Volume, Timescale, Zoom Sliders */}
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700">
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-blue-700" />
              <input type="range" min="0" max="100" defaultValue="75" className="w-16 h-1 accent-blue-600 cursor-pointer" />
            </div>

            <div className="flex items-center gap-1.5">
              <span>Timescale:</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={timescale}
                onChange={(e) => setTimescale(parseFloat(e.target.value))}
                className="w-16 h-1 accent-blue-600 cursor-pointer"
              />
              <span className="font-mono text-[10px] w-6">{timescale}x</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                defaultValue="1"
                className="w-16 h-1 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Multi-Track Timeline Matrix with Header Markers & Blue Playhead Cursor */}
        <div className="flex overflow-x-auto text-[11px] relative max-h-48">
          {/* Left Track Names Column */}
          <div className="w-64 bg-[#f8fafc] border-r border-slate-300 shrink-0 font-medium select-none z-10">
            {/* Blank header row */}
            <div className="h-6 border-b border-slate-300 px-3 py-1 font-semibold text-slate-600 bg-slate-200">
              Tracks
            </div>
            {/* Row 1: Notes */}
            <div className="h-6 border-b border-slate-300 px-3 py-1 text-slate-700 flex items-center justify-between">
              <span>Notes</span>
            </div>
            {/* Row 2: Scenario Injects Acted Upon */}
            <div className="h-6 border-b border-slate-300 px-3 py-1 text-slate-700 flex items-center gap-1">
              <span>Scenario Injects Acted Upon</span>
            </div>
            {/* Row 3: Objective 1 Dropdown Header */}
            <div
              onClick={() => toggleSection('firstRoom')}
              className="h-6 border-b border-slate-300 px-2 py-1 font-bold text-slate-800 bg-slate-100 flex items-center gap-1 cursor-pointer hover:bg-slate-200"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.firstRoom ? '' : '-rotate-90'}`} />
              <span>Enter and Clear 1st Room</span>
            </div>
            {/* Sub-rows */}
            {expandedSections.firstRoom && (
              <>
                <div className="h-6 border-b border-slate-200 px-4 py-1 text-[10px] text-slate-700">Neutralize OPFOR</div>
                <div className="h-6 border-b border-slate-200 px-4 py-1 text-[10px] text-slate-700">Minimize BLUFOR casualties</div>
                <div className="h-6 border-b border-slate-200 px-4 py-1 text-[10px] text-slate-700">Minimize non-combatant casualties</div>
                <div className="h-6 border-b border-slate-200 px-4 py-1 text-[10px] text-slate-700">Minimize collateral damage</div>
                <div className="h-6 border-b border-slate-200 px-4 py-1 text-[10px] text-slate-700">Establish Security between Engagements</div>
              </>
            )}
          </div>

          {/* Right Synchronized Timeline Tracks with Playhead */}
          <div
            className="flex-1 min-w-[700px] relative bg-white cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              setCurrentTimeSec(Math.round(ratio * 210));
            }}
          >
            {/* Vertical Blue Playhead Cursor across all tracks */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-20 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            >
              {/* Blue flag scrubber head at the top */}
              <div className="w-2.5 h-3.5 bg-blue-600 rounded-b -translate-x-[4px] shadow-sm flex items-center justify-center">
                <div className="w-0.5 h-2 bg-white"></div>
              </div>
            </div>

            {/* Row 0: Timestamp Header Markers (12:46:00, 12:46:15...) */}
            <div className="h-6 border-b border-slate-300 bg-slate-200 flex relative font-mono text-[10px] text-slate-600">
              {timelineMarkers.map((m, idx) => (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 border-l border-slate-300 pl-1 py-1"
                  style={{ left: `${(m.sec / 210) * 100}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Row 1: Notes (with blue bookmark pins) */}
            <div className="h-6 border-b border-slate-200 relative bg-white">
              {/* Note pin 1 at 12:46:20 */}
              <div
                className="absolute top-1 -translate-x-1/2 text-blue-600"
                style={{ left: `${(20 / 210) * 100}%` }}
                title="Trainee Observation Note"
              >
                <Bookmark className="w-3.5 h-3.5 fill-blue-600" />
              </div>
            </div>

            {/* Row 2: Scenario Injects Acted Upon (with lightning bolt inject pins) */}
            <div className="h-6 border-b border-slate-200 relative bg-white">
              {/* Inject 1 at 12:46:03 */}
              <div
                className="absolute top-1 -translate-x-1/2 text-amber-500"
                style={{ left: `${(3 / 210) * 100}%` }}
                title="Inject: Hostile Movement Detected"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
              </div>
              {/* Inject 2 at 12:47:10 */}
              <div
                className="absolute top-1 -translate-x-1/2 text-red-500"
                style={{ left: `${(70 / 210) * 100}%` }}
                title="Inject: Comms Jamming Initiated"
              >
                <Zap className="w-3.5 h-3.5 fill-red-500" />
              </div>
            </div>

            {/* Row 3: Objective 1 Header background */}
            <div className="h-6 border-b border-slate-200 bg-slate-50"></div>

            {/* Sub-Rows: Red & Green Status Bars (from Image 1) */}
            {expandedSections.firstRoom && (
              <>
                {/* Neutralize OPFOR: Long Red bar, transitioning to Green */}
                <div className="h-6 border-b border-slate-200 relative flex items-center">
                  {/* Red bar segment (0 to 45s) */}
                  <div
                    className="absolute h-4 bg-[#e11d48] border border-red-700"
                    style={{ left: '0%', width: `${(45 / 210) * 100}%` }}
                    title="Engaging Threat (Pending/Disrupted)"
                  ></div>
                  {/* Green bar segment (45s to end) */}
                  <div
                    className="absolute h-4 bg-[#16a34a] border border-green-700"
                    style={{ left: `${(45 / 210) * 100}%`, width: `${((210 - 45) / 210) * 100}%` }}
                    title="Threat Neutralized (Success)"
                  ></div>
                </div>

                {/* Minimize BLUFOR casualties: Green -> Red -> Green */}
                <div className="h-6 border-b border-slate-200 relative flex items-center">
                  <div
                    className="absolute h-4 bg-[#16a34a] border border-green-700"
                    style={{ left: '0%', width: `${(35 / 210) * 100}%` }}
                    title="Cover Maintained"
                  ></div>
                  <div
                    className="absolute h-4 bg-[#e11d48] border border-red-700"
                    style={{ left: `${(35 / 210) * 100}%`, width: `${(75 / 210) * 100}%` }}
                    title="Operative Under Fire"
                  ></div>
                  <div
                    className="absolute h-4 bg-[#16a34a] border border-green-700"
                    style={{ left: `${(110 / 210) * 100}%`, width: `${((210 - 110) / 210) * 100}%` }}
                    title="Breach Secured"
                  ></div>
                </div>

                {/* Minimize non-combatant casualties: Clean track */}
                <div className="h-6 border-b border-slate-200 relative flex items-center">
                  <div className="absolute inset-x-0 h-4 border-b border-dashed border-slate-300"></div>
                </div>

                {/* Minimize collateral damage: Clean track */}
                <div className="h-6 border-b border-slate-200 relative flex items-center">
                  <div className="absolute inset-x-0 h-4 border-b border-dashed border-slate-300"></div>
                </div>

                {/* Establish Security between Engagements: Clean track */}
                <div className="h-6 border-b border-slate-200 relative flex items-center">
                  <div className="absolute inset-x-0 h-4 border-b border-dashed border-slate-300"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
