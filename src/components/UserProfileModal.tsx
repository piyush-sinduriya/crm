import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/crm';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  LogOut,
  Edit3,
  Save,
  Check,
  Building,
  Sparkles,
  Crown,
  UserCheck,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  currentRole?: UserRole;
  onToggleRole?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
  currentRole = 'admin',
  onToggleRole,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [role, setRole] = useState(profile.role);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const statusColors = {
    online: 'bg-emerald-500 text-emerald-400 border-emerald-500/30',
    in_call: 'bg-amber-500 text-amber-400 border-amber-500/30',
    away: 'bg-yellow-500 text-yellow-400 border-yellow-500/30',
    offline: 'bg-slate-500 text-slate-400 border-slate-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Account Settings & Profile Details
              </h3>
              <p className="text-[11px] text-slate-400">
                Logged-in sales representative session & preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info & Edit Area */}
        <div className="p-5 overflow-y-auto space-y-5 max-h-[80vh]">
          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Top Banner with Avatar and Name */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="relative shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-500/40"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  profile.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Status: ${profile.status}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white truncate">{profile.name}</h4>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded capitalize">
                  ● {profile.status}
                </span>
              </div>
              <div className="text-xs text-indigo-400 font-medium mt-0.5">{profile.role}</div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          {/* RBAC Role & View Mode Switcher */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/30 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  currentRole === 'admin'
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                }`}
              >
                {currentRole === 'admin' ? (
                  <Crown className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Current RBAC Role:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      currentRole === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {currentRole === 'admin' ? 'Administrator (Full Access)' : 'Sales Representative (Standard)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentRole === 'admin'
                    ? 'Full permissions: Team configuration, CRM settings, bulk CSV export, and template building.'
                    : 'Standard user: View and manage leads, replies, notes, and reassignment. Admin settings restricted.'}
                </p>
              </div>
            </div>

            {onToggleRole && (
              <button
                type="button"
                onClick={onToggleRole}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white transition-all shrink-0 cursor-pointer active:scale-95"
              >
                Switch Role ⇄
              </button>
            )}
          </div>

          {/* Performance Stats Cards */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Representative Performance Stats</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Leads Handled</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums mt-1">
                  {profile.leadsHandled}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Closed Deals</div>
                <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums mt-1">
                  {profile.closedDeals}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Response Rate</div>
                <div className="text-lg font-bold font-mono text-indigo-400 tabular-nums mt-1">
                  {profile.responseRate}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Pipeline Won</div>
                <div className="text-lg font-bold font-mono text-amber-400 tabular-nums mt-1">
                  {profile.pipelineWonValue}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form or Read-only Details */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3.5 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Profile Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Role & Assigned Permissions</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile Details</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{perm}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Logout confirmation section */}
          {showLogoutConfirm ? (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-2">
              <div className="text-xs font-bold text-rose-300">Are you sure you want to log out?</div>
              <p className="text-[11px] text-slate-300">
                You will be signed out of this session. You can switch or re-authenticate anytime.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md"
                >
                  Confirm Log Out
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
