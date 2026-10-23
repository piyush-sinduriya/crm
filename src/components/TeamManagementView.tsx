import React, { useState } from 'react';
import { TeamMember, Lead, UserRole } from '../types/crm';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Edit2,
  UserX,
  UserCheck,
  Award,
  TrendingUp,
  Clock,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
  Lock,
  ShieldAlert,
} from 'lucide-react';

interface TeamManagementViewProps {
  team: TeamMember[];
  leads: Lead[];
  onOpenAddModal: () => void;
  onUpdateMemberRole: (memberId: string, newRole: string, permissions?: string[]) => void;
  onToggleMemberActive: (memberId: string) => void;
  onReassignLeads: (fromRepName: string, toRepName: string) => void;
  currentRole?: UserRole;
  onRestrictedAction?: (feature: string) => void;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  team,
  leads,
  onOpenAddModal,
  onUpdateMemberRole,
  onToggleMemberActive,
  onReassignLeads,
  currentRole = 'admin',
  onRestrictedAction,
}) => {
  const isRep = currentRole === 'sales_rep';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Edit Role Modal State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newRoleInput, setNewRoleInput] = useState('');

  // Reassign Leads Modal State
  const [reassignFromMember, setReassignFromMember] = useState<TeamMember | null>(null);
  const [reassignToName, setReassignToName] = useState('');

  // Compute live assigned leads count per representative from actual leads array
  const repLeadCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const repName = l.assignedAgent.name;
      counts[repName] = (counts[repName] || 0) + 1;
    });
    return counts;
  }, [leads]);

  // Filtered members
  const filteredTeam = team.filter((member) => {
    if (statusFilter === 'active' && !member.active) return false;
    if (statusFilter === 'deactivated' && member.active) return false;
    if (statusFilter === 'online' && member.status !== 'online') return false;
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchEmail = member.email.toLowerCase().includes(q);
      const matchRole = member.role.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }
    return true;
  });

  const activeCount = team.filter((m) => m.active).length;
  const onlineCount = team.filter((m) => m.status === 'online' && m.active).length;
  const totalAssignedLeads = leads.length;

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !newRoleInput.trim()) return;
    onUpdateMemberRole(editingMember.id, newRoleInput.trim());
    setEditingMember(null);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignFromMember || !reassignToName || reassignFromMember.name === reassignToName) return;
    onReassignLeads(reassignFromMember.name, reassignToName);
    setReassignFromMember(null);
    setReassignToName('');
  };

  return (
    <div className="space-y-5 pb-8 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Sales Representatives & Team Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage sales reps, workload distribution, active statuses, and omnichannel lead assignments
          </p>
        </div>

        <button
          onClick={() => {
            if (isRep) {
              onRestrictedAction?.('Add New Team Member');
              return;
            }
            onOpenAddModal();
          }}
          title={isRep ? 'Add Team Member (Admin Only)' : 'Add New Representative'}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-md transition-all self-start sm:self-auto active:scale-95 cursor-pointer ${
            isRep
              ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-amber-300 hover:border-amber-500/50'
              : 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          }`}
        >
          {isRep ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>+ Add Team Member</span>
        </button>
      </div>

      {/* RBAC Info Banner when in Sales Rep mode */}
      {isRep && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Limited Access Mode (Sales Rep):</strong> You have permission to view team workload and reassign leads, but adding team members, changing roles, and account status modifications require Administrator privileges.
            </span>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Representatives</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {team.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{activeCount} active in system</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Active Online Now</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {onlineCount}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1">Available for live routing</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Assigned Leads</div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {totalAssignedLeads}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Distributed across 6 channels</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Avg Team Response SLA</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            97.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sub-5 min initial contact</div>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search representatives by name, email, or role..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'online', label: 'Online' },
              { id: 'deactivated', label: 'Deactivated' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map((member) => {
            const assignedCount = repLeadCounts[member.name] || 0;
            return (
              <div
                key={member.id}
                className={`p-4 rounded-xl border transition-all space-y-3.5 relative flex flex-col justify-between ${
                  member.active
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Header: Avatar, Name, Status */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        !member.active
                          ? 'bg-slate-600'
                          : member.status === 'online'
                          ? 'bg-emerald-500'
                          : member.status === 'in_call'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                      title={member.active ? `Status: ${member.status}` : 'Deactivated'}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${
                          !member.active
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : member.status === 'online'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : member.status === 'in_call'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {member.active ? member.status.replace('_', ' ') : 'Inactive'}
                      </span>
                    </div>

                    <div className="text-xs text-indigo-400 font-medium truncate mt-0.5">
                      {member.role}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics: Assigned Leads, Closed Deals, Response Rate */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Leads
                    </div>
                    <div className="text-sm font-bold font-mono text-white tabular-nums mt-0.5">
                      {assignedCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Closed
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                      {member.closedDeals ?? 12}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      SLA Rate
                    </div>
                    <div className="text-sm font-bold font-mono text-indigo-400 tabular-nums mt-0.5">
                      {member.responseRate ?? 98}%
                    </div>
                  </div>
                </div>

                {/* Permissions tags */}
                {member.permissions && member.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {member.permissions.slice(0, 2).map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/60 truncate max-w-[140px]"
                      >
                        {p}
                      </span>
                    ))}
                    {member.permissions.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/60">
                        +{member.permissions.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons: Edit Role, Reassign Leads, Deactivate */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRep) {
                        onRestrictedAction?.('Edit Team Member Role');
                        return;
                      }
                      setEditingMember(member);
                      setNewRoleInput(member.role);
                    }}
                    title={isRep ? 'Edit Role (Admin Restricted)' : 'Edit Role & Permissions'}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isRep
                        ? 'text-slate-500 bg-slate-850 hover:text-amber-300'
                        : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                    }`}
                  >
                    {isRep ? <Lock className="w-3 h-3 text-amber-400" /> : <Edit2 className="w-3 h-3 text-slate-400" />}
                    <span>Edit Role</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReassignFromMember(member);
                      // default target to first other active member
                      const other = team.find((m) => m.name !== member.name && m.active);
                      if (other) setReassignToName(other.name);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-900/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
                    <span>Reassign ({assignedCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isRep) {
                        onRestrictedAction?.('Change Member Account Status');
                        return;
                      }
                      onToggleMemberActive(member.id);
                    }}
                    title={
                      isRep
                        ? 'Change Status (Admin Restricted)'
                        : member.active
                        ? 'Deactivate Account'
                        : 'Reactivate Account'
                    }
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isRep
                        ? 'text-slate-500 border-slate-800 hover:text-amber-400'
                        : member.active
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border-slate-800'
                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 border-emerald-900/50'
                    }`}
                  >
                    {isRep ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : member.active ? (
                      <UserX className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Representative</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Assigned Leads</th>
                  <th className="py-3 px-4 text-center">Closed Deals</th>
                  <th className="py-3 px-4 text-center">Response SLA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTeam.map((member) => {
                  const assignedCount = repLeadCounts[member.name] || 0;
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white">{member.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-indigo-300">{member.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border capitalize ${
                            !member.active
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : member.status === 'online'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          }`}
                        >
                          {member.active ? member.status.replace('_', ' ') : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white tabular-nums">
                        {assignedCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-400 tabular-nums">
                        {member.closedDeals ?? 12}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-indigo-400 tabular-nums">
                        {member.responseRate ?? 98}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (isRep) {
                                onRestrictedAction?.('Edit Team Member Role');
                                return;
                              }
                              setEditingMember(member);
                              setNewRoleInput(member.role);
                            }}
                            className={`px-2 py-1 rounded transition-colors text-[11px] cursor-pointer ${
                              isRep
                                ? 'text-slate-500 bg-slate-850 hover:text-amber-300'
                                : 'text-slate-300 hover:text-white bg-slate-800'
                            }`}
                          >
                            {isRep ? 'Locked' : 'Edit'}
                          </button>
                          <button
                            onClick={() => {
                              setReassignFromMember(member);
                              const other = team.find((m) => m.name !== member.name && m.active);
                              if (other) setReassignToName(other.name);
                            }}
                            className="px-2 py-1 text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-800 rounded transition-colors text-[11px] cursor-pointer"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => {
                              if (isRep) {
                                onRestrictedAction?.('Change Member Account Status');
                                return;
                              }
                              onToggleMemberActive(member.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title={
                              isRep
                                ? 'Change Status (Admin Only)'
                                : member.active
                                ? 'Deactivate'
                                : 'Reactivate'
                            }
                          >
                            {isRep ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : member.active ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Representative Role</h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Representative Name
                </label>
                <input
                  type="text"
                  disabled
                  value={editingMember.name}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Role / Title
                </label>
                <select
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Enterprise Sales Lead">Enterprise Sales Lead</option>
                  <option value="Senior Account Executive">Senior Account Executive</option>
                  <option value="Inbound SDR & B2B Specialist">Inbound SDR & B2B Specialist</option>
                  <option value="Global Solutions Architect">Global Solutions Architect</option>
                  <option value="LATAM Regional Rep">LATAM Regional Rep</option>
                  <option value="Sales Development Rep">Sales Development Rep</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Leads Modal */}
      {reassignFromMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                <span>Reassign Omnichannel Leads</span>
              </h3>
              <button
                onClick={() => setReassignFromMember(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200">
                Transferring all leads currently assigned to{' '}
                <span className="font-bold text-white">{reassignFromMember.name}</span> (
                <span className="font-mono font-bold text-amber-400">
                  {repLeadCounts[reassignFromMember.name] || 0} leads
                </span>
                ).
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Target Representative
                </label>
                <select
                  value={reassignToName}
                  onChange={(e) => setReassignToName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Sales Representative --</option>
                  {team
                    .filter((m) => m.name !== reassignFromMember.name && m.active)
                    .map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role}) - {repLeadCounts[m.name] || 0} current leads
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReassignFromMember(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reassignToName || reassignToName === reassignFromMember.name}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
