import React, { useState } from 'react';
import { TeamMember } from '../types/crm';
import { X, UserPlus, Mail, Phone, ShieldCheck, Key, User, Check, Sparkles } from 'lucide-react';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: TeamMember) => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Senior Account Executive');
  const [accessLevel, setAccessLevel] = useState<'invite' | 'password'>('invite');
  const [initialPassword, setInitialPassword] = useState('Welcome2026!');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'Omnichannel Inbound Inquiries',
    'Smart AI Replies',
    'Customer Notes',
  ]);

  if (!isOpen) return null;

  const availablePermissions = [
    'Omnichannel Inbound Inquiries',
    'Smart AI Replies',
    'Lead Reassignment',
    'Customer Notes',
    'IndiaMART RFQ Ingestion',
    'WhatsApp Business API',
    'Export CRM Data',
    'Full Administrator Access',
  ];

  const handleTogglePerm = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Default avatar pools
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    ];
    const pickedAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 012-3456',
      role,
      avatar: pickedAvatar,
      status: 'online',
      active: true,
      closedDeals: 0,
      conversionRate: 0,
      responseRate: 100,
      permissions: selectedPermissions,
      joinedDate: 'Just now',
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Add Team Member</h3>
              <p className="text-[11px] text-slate-400">
                Invite a sales representative or account executive
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Representative Role <span className="text-rose-400">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Enterprise Sales Lead">Enterprise Sales Lead</option>
                <option value="Senior Account Executive">Senior Account Executive</option>
                <option value="Inbound SDR & B2B Specialist">Inbound SDR & B2B Specialist</option>
                <option value="Global Solutions Architect">Global Solutions Architect</option>
                <option value="LATAM Regional Rep">LATAM Regional Rep</option>
                <option value="Sales Development Rep">Sales Development Rep</option>
              </select>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Corporate Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m.chen@omnisync.io"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 923-4100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Access / Initial Password */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-300">
              Access & Authentication
            </label>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="accessLevel"
                  checked={accessLevel === 'invite'}
                  onChange={() => setAccessLevel('invite')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Email Invitation Link</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="accessLevel"
                  checked={accessLevel === 'password'}
                  onChange={() => setAccessLevel('password')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Set Initial Password</span>
              </label>
            </div>

            {accessLevel === 'password' && (
              <div className="pt-1">
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Initial password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  The user will be prompted to change their password on first login.
                </div>
              </div>
            )}
          </div>

          {/* Permissions Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Assigned Feature Permissions</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {availablePermissions.map((perm) => {
                const checked = selectedPermissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => handleTogglePerm(perm)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                      checked
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                        checked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
                      }`}
                    >
                      {checked && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="text-[11px] truncate">{perm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
