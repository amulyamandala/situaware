import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Clock,
  Radio,
  Sliders,
  FileText,
  UserCheck,
  Users,
  Compass,
  PlayCircle,
  BarChart3,
  LogOut,
  ChevronDown,
  Layers,
  Terminal,
  HelpCircle,
  User,
  Crosshair,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchUser } = useAuth();
  const { session, simTime, sessionStatus } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const [gameMasterOpen, setGameMasterOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Quick switch demo military personas
  const demoAccounts = [
    { name: 'Col. Rajiv Sharma', role: 'Instructor', email: 'instructor@mod.gov.in', color: 'border-blue-500 text-blue-400' },
    { name: 'Major A. Verma', role: 'Land Lead', email: 'land.trainee@mod.gov.in', color: 'border-emerald-500 text-emerald-400' },
    { name: 'Sqn Ldr R. Sen', role: 'Air Controller', email: 'air.trainee@mod.gov.in', color: 'border-cyan-500 text-cyan-400' },
    { name: 'Capt. K. Roy', role: 'Cyber Ops', email: 'cyber.trainee@mod.gov.in', color: 'border-purple-500 text-purple-400' },
    { name: 'Lt Cdr V. Rao', role: 'EW Officer', email: 'ew.trainee@mod.gov.in', color: 'border-amber-500 text-amber-400' },
    { name: 'HQ Administrator', role: 'Admin', email: 'admin@mod.gov.in', color: 'border-slate-500 text-slate-300' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#163f72] border-b border-[#0f2c52] shadow-lg select-none text-white font-sans">
      {/* Top Main Navigation Bar (Steel Blue Banner from Image 1) */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs font-medium">
        {/* Left Side: Red Crest Logo & Main Navigation Tabs */}
        <div className="flex items-center gap-4">
          {/* Professional Military Defence Crest Emblem */}
          <Link to="/aar" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md border border-cyan-400/40 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-cyan-200 fill-cyan-400/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-white text-sm leading-tight font-mono">
                SITU<span className="text-cyan-400">AWARE</span>
              </span>
              <span className="text-[9px] text-cyan-200/70 font-mono tracking-tighter hidden sm:inline">
                MINISTRY OF DEFENCE
              </span>
            </div>
          </Link>

          {/* Primary Navigation Items (Matching Image 1: Take a Course, Learner Profile, Course Creator...) */}
          <nav className="flex items-center space-x-1 sm:space-x-3 text-xs">
            {/* Take a Course (Tactical Simulation / AAR Cockpit from Image 1) */}
            <Link
              to="/aar"
              className={`px-2.5 py-1 rounded transition-colors ${
                location.pathname === '/aar' || location.pathname === '/live'
                  ? 'bg-[#0f2d52] text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Take a Course
            </Link>

            {/* Learner Profile (Scores & Analytics from Image 2) */}
            <Link
              to="/performance"
              className={`px-2.5 py-1 rounded transition-colors ${
                location.pathname === '/performance'
                  ? 'bg-[#0f2d52] text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Learner Profile
            </Link>

            {/* Course Creator (Scenario Studio) */}
            <Link
              to="/studio"
              className={`px-2.5 py-1 rounded transition-colors ${
                location.pathname === '/studio'
                  ? 'bg-[#0f2d52] text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Course Creator
            </Link>

            {/* Publish Courses (Scenario Library) */}
            <Link
              to="/scenarios"
              className={`px-2.5 py-1 rounded transition-colors ${
                location.pathname === '/scenarios'
                  ? 'bg-[#0f2d52] text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Publish Courses
            </Link>

            {/* Game Master Dropdown (Instructor & Exercise Controller) */}
            <div className="relative">
              <button
                onClick={() => setGameMasterOpen(!gameMasterOpen)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  location.pathname === '/instructor'
                    ? 'bg-[#0f2d52] text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Game Master</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {gameMasterOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-[#1a2b44] border border-slate-600 rounded-lg shadow-2xl py-1 z-50 text-xs">
                  <Link
                    to="/instructor"
                    onClick={() => setGameMasterOpen(false)}
                    className="block px-3 py-1.5 hover:bg-blue-600/30 text-slate-200"
                  >
                    Instructor Cockpit & Injects
                  </Link>
                  <Link
                    to="/lobby"
                    onClick={() => setGameMasterOpen(false)}
                    className="block px-3 py-1.5 hover:bg-blue-600/30 text-slate-200"
                  >
                    Multiplayer Session Lobby
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setGameMasterOpen(false)}
                    className="block px-3 py-1.5 hover:bg-blue-600/30 text-slate-200"
                  >
                    Export Official PDF & CSV
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setGameMasterOpen(false)}
                      className="block px-3 py-1.5 hover:bg-blue-600/30 text-slate-200 border-t border-slate-700"
                    >
                      User & System Admin
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side: Quick Persona Switcher, Help, User Avatar, Window Controls */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher Pill: [Tactical Cockpit (Image 1)] | [Scores (Image 2)] */}
          <div className="hidden lg:flex items-center bg-[#0d2647] rounded border border-blue-400/30 p-0.5 text-[11px]">
            <Link
              to="/aar"
              className={`px-2 py-0.5 rounded transition-all ${
                location.pathname === '/aar'
                  ? 'bg-blue-500 text-white font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tactical Cockpit (Image 1)
            </Link>
            <Link
              to="/performance"
              className={`px-2 py-0.5 rounded transition-all ${
                location.pathname === '/performance'
                  ? 'bg-blue-500 text-white font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Scores & Analytics (Image 2)
            </Link>
          </div>

          {/* Quick Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="flex items-center gap-1.5 bg-[#0f2d52] hover:bg-[#163c6c] px-2 py-1 rounded text-slate-200 text-[11px] border border-blue-500/40 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="font-semibold max-w-[120px] truncate">
                {user ? user.name : 'Switch Role'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {personaOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-[#142338] border border-slate-600 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-700 text-[10px] text-slate-400 uppercase font-mono">
                  Quick Switch Military Persona
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      switchUser(acc.email);
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-blue-600/30 flex items-center justify-between transition-colors ${
                      user?.email === acc.email ? 'bg-blue-600/40 font-bold' : ''
                    }`}
                  >
                    <div>
                      <div className="text-slate-200 text-xs">{acc.name}</div>
                      <div className="text-[10px] text-slate-400">{acc.email}</div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border font-mono ${acc.color}`}>
                      {acc.role}
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-700 mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setPersonaOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-950/40 flex items-center gap-1.5 text-xs"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Dropdown */}
          <div className="relative">
            <button
              onClick={() => setHelpOpen(!helpOpen)}
              className="flex items-center gap-1 text-slate-200 hover:text-white"
            >
              <span>Help</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </button>
            {helpOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-[#1a2b44] border border-slate-600 rounded-lg shadow-xl py-1 z-50 text-xs">
                <a
                  href="#guide"
                  onClick={() => setHelpOpen(false)}
                  className="block px-3 py-1.5 hover:bg-blue-600/30 text-slate-200"
                >
                  Quick User Guide
                </a>
                <a
                  href="#shortcuts"
                  onClick={() => setHelpOpen(false)}
                  className="block px-3 py-1.5 hover:bg-blue-600/30 text-slate-200"
                >
                  Tactical Keybindings
                </a>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-1.5 text-slate-200">
            <User className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-medium text-xs">
              {user ? (user.name.includes(' ') ? user.name.split(' ')[0] : user.name) : 'mhuffman'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
