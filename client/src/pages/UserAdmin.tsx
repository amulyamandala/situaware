import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, UserPlus, Shield, CheckCircle, X, Search } from 'lucide-react';
import { userApi } from '../services/api';
import { User, UserRole } from '../types';

export const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('defence123');
  const [role, setRole] = useState<UserRole>('trainee');
  const [org, setOrg] = useState('IN-MOD-HQ');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    userApi
      .list()
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.create({
        name,
        email,
        password,
        role,
        organizationId: org,
      });
      setModalOpen(false);
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await userApi.update(user._id, { status: newStatus });
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-situ-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            USER ADMINISTRATION & ROSTER
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Manage authorized defence personnel accounts, assign platform roles, and control active status.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-900/30"
        >
          <UserPlus className="w-4 h-4" /> ADD NEW USER
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter personnel by name, email, or role..."
          className="w-full bg-situ-900 border border-situ-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-situ-900 border border-situ-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-situ-950 text-slate-400 border-b border-situ-800">
            <tr>
              <th className="py-3 px-4">NAME</th>
              <th className="py-3 px-4">EMAIL</th>
              <th className="py-3 px-4">ROLE</th>
              <th className="py-3 px-4">ORGANIZATION</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-situ-850">
            {filteredUsers.map((u) => {
              const roleColors: any = {
                admin: 'border-purple-600 bg-purple-950/60 text-purple-300',
                instructor: 'border-blue-600 bg-blue-950/60 text-blue-300',
                trainee: 'border-emerald-600 bg-emerald-950/60 text-emerald-300',
              };

              return (
                <tr key={u._id} className="hover:bg-situ-850/40">
                  <td className="py-3 px-4 font-bold text-slate-200">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        roleColors[u.role]
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{u.organizationId || 'IN-MOD-HQ'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className="px-2.5 py-1 rounded bg-situ-800 hover:bg-situ-700 text-slate-300 text-[11px] border border-slate-700"
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-situ-900 border border-situ-700 rounded-xl max-w-md w-full p-5 shadow-2xl relative text-xs">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-100 text-sm mb-4 border-b border-situ-800 pb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              CREATE DEFENCE USER ACCOUNT
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Full Name & Rank</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Major R. K. Singh"
                  className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mod.gov.in"
                  className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="trainee">Trainee</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit / Branch</label>
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded bg-situ-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
