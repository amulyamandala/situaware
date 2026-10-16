import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, UserCheck, ArrowRight, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('instructor@mod.gov.in');
  const [password, setPassword] = useState('defence123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('defence123');
    setLoading(true);
    setError(null);
    try {
      await login(targetEmail, 'defence123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-situ-950 flex flex-col justify-center items-center p-4">
      {/* Background Grid Accent */}
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-700 shadow-xl shadow-cyan-900/40 mb-3 border border-cyan-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-wider">
            SITU<span className="text-cyan-400">AWARE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Smart India Hackathon • SIH26248 • Ministry of Defence
          </p>
          <p className="text-[11px] text-cyan-400/90 font-mono mt-0.5">
            Immersive Multi-Domain Decision-Making Trainer for Degraded Environments
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-situ-900 border border-situ-800 rounded-xl p-6 shadow-2xl">
          <h2 className="text-sm font-bold text-slate-200 font-mono mb-4 flex items-center gap-2 border-b border-situ-800 pb-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            AUTHORIZED PERSONNEL AUTHENTICATION
          </h2>

          {error && (
            <div className="mb-4 p-2.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Defense Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mod.gov.in"
                  className="w-full bg-situ-950 border border-situ-700 rounded pl-9 pr-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Access Credential / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-situ-950 border border-situ-700 rounded pl-9 pr-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS TRAINING TERMINAL'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant 1-Click Evaluation Accounts */}
          <div className="mt-6 pt-4 border-t border-situ-800">
            <span className="text-[10px] text-slate-400 font-mono block mb-2 uppercase text-center">
              Quick 1-Click Persona Sign-In for Hackathon Demo:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <button
                onClick={() => quickLogin('instructor@mod.gov.in')}
                className="p-2 rounded bg-situ-950 border border-blue-900/80 hover:border-blue-400 text-blue-300 text-left transition-colors"
              >
                <span className="font-bold block">Col. Rajiv Sharma</span>
                <span className="text-[9px] text-slate-400">Role: Instructor</span>
              </button>

              <button
                onClick={() => quickLogin('land.trainee@mod.gov.in')}
                className="p-2 rounded bg-situ-950 border border-emerald-900/80 hover:border-emerald-400 text-emerald-300 text-left transition-colors"
              >
                <span className="font-bold block">Major A. Verma</span>
                <span className="text-[9px] text-slate-400">Role: Land Lead</span>
              </button>

              <button
                onClick={() => quickLogin('air.trainee@mod.gov.in')}
                className="p-2 rounded bg-situ-950 border border-cyan-900/80 hover:border-cyan-400 text-cyan-300 text-left transition-colors"
              >
                <span className="font-bold block">Sqn Ldr R. Sen</span>
                <span className="text-[9px] text-slate-400">Role: Air Controller</span>
              </button>

              <button
                onClick={() => quickLogin('cyber.trainee@mod.gov.in')}
                className="p-2 rounded bg-situ-950 border border-purple-900/80 hover:border-purple-400 text-purple-300 text-left transition-colors"
              >
                <span className="font-bold block">Capt. K. Roy</span>
                <span className="text-[9px] text-slate-400">Role: Cyber Ops</span>
              </button>

              <button
                onClick={() => quickLogin('ew.trainee@mod.gov.in')}
                className="p-2 rounded bg-situ-950 border border-amber-900/80 hover:border-amber-400 text-amber-300 text-left transition-colors"
              >
                <span className="font-bold block">Lt Cdr V. Rao</span>
                <span className="text-[9px] text-slate-400">Role: EW Officer</span>
              </button>

              <button
                onClick={() => quickLogin('admin@mod.gov.in')}
                className="p-2 rounded bg-situ-950 border border-slate-700 hover:border-slate-400 text-slate-300 text-left transition-colors"
              >
                <span className="font-bold block">HQ Administrator</span>
                <span className="text-[9px] text-slate-400">Role: Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center text-[10px] text-slate-500 font-mono">
          OFFICIAL USE ONLY • SYNTHETIC OPERATIONAL TRAINING DATASET
        </div>
      </div>
    </div>
  );
};
