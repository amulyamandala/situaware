import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchUser } = useAuth();
  const { session, simTime, sessionStatus, assignedRoleId, setAssignedRoleId } = useSession();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Quick switch demo accounts
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

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Scenario Library', path: '/scenarios', icon: Compass },
    { name: 'Studio', path: '/studio', icon: Sliders, role: ['instructor', 'admin'] },
    { name: 'Session Lobby', path: '/lobby', icon: Users },
    { name: 'Live Room', path: '/live', icon: Radio },
    { name: 'Instructor Console', path: '/instructor', icon: Terminal, role: ['instructor', 'admin'] },
    { name: 'Performance', path: '/performance', icon: BarChart3 },
    { name: 'AAR Replay', path: '/aar', icon: PlayCircle },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: UserCheck });
  }

  return (
    <header className="sticky top-0 z-50 bg-situ-950/95 backdrop-blur-md border-b border-situ-800 shadow-md">
      {/* Top Banner with Platform ID & Quick Demo Role Switcher */}
      <div className="bg-situ-900 border-b border-situ-850 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-semibold text-slate-200">SITU-AWARE</span>
            <span className="text-[10px] bg-situ-800 px-2 py-0.5 rounded text-slate-400 font-mono border border-situ-700">
              SIH26248 • MoD
            </span>
          </div>
          <span className="hidden md:inline text-slate-500 text-[11px]">
            Multi-Domain Decision-Making Trainer for Degraded Communication Environments
          </span>
        </div>

        {/* Live Session Clock Ticker */}
        <div className="flex items-center gap-3">
          {session && (
            <div className="flex items-center gap-2 bg-situ-950 px-2.5 py-0.5 rounded border border-situ-700 font-mono text-[11px]">
              <span className="text-slate-400">SESSION:</span>
              <span className="text-cyan-400 font-bold">{session.sessionCode}</span>
              <span className="text-slate-600">|</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-bold">{formatTime(simTime)}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                  sessionStatus === 'active'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : sessionStatus === 'paused'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {sessionStatus}
              </span>
            </div>
          )}

          {/* Quick Switch Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 bg-situ-800 hover:bg-situ-700 px-2.5 py-1 rounded text-slate-200 text-[11px] border border-situ-600 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="font-medium">
                {user ? `${user.name} (${user.role.toUpperCase()})` : 'Select Persona'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-situ-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                  Quick Switch Evaluation Accounts
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      switchUser(acc.email);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-situ-800 flex items-center justify-between transition-colors ${
                      user?.email === acc.email ? 'bg-situ-800/80 font-bold' : ''
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
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-950/40 flex items-center gap-1.5 text-xs"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 py-2">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-600 via-situ-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-900/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-slate-100 text-base flex items-center gap-1 font-mono">
                SITU<span className="text-cyan-400">AWARE</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono tracking-tight -mt-1">
                DECISION RESILIENCE TRAINER
              </div>
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {navLinks.map((link) => {
              // Role check
              if (link.role && (!user || !link.role.includes(user.role))) {
                return null;
              }

              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-situ-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
