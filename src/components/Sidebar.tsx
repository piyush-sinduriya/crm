import React from 'react';
import { NavigationTab, ChannelType, UserProfile, BrandConfig, UserRole } from '../types/crm';
import {
  LayoutDashboard,
  Inbox,
  Users,
  BarChart3,
  Activity,
  Settings,
  Zap,
  Sparkles,
  Layers,
  CheckCircle2,
  Bell,
  ChevronRight,
  Edit2,
  Lock,
  Crown,
  UserCheck,
} from 'lucide-react';
import { ChannelIcon } from './ChannelIcon';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadCount: number;
  totalLeadsCount: number;
  hotLeadsCount: number;
  totalTeamCount: number;
  channelCounts: Record<ChannelType, number>;
  selectedChannelFilter: string;
  onSelectChannelFilter: (channel: string) => void;
  currentUserProfile: UserProfile;
  onOpenUserProfile: () => void;
  branding: BrandConfig;
  onOpenBrandingModal: () => void;
  onOpenChannelConnectModal?: () => void;
  currentRole: UserRole;
  onRestrictedTabClick: (feature: string) => void;
  onToggleRole?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreadCount,
  totalLeadsCount,
  hotLeadsCount,
  totalTeamCount,
  channelCounts,
  selectedChannelFilter,
  onSelectChannelFilter,
  currentUserProfile,
  onOpenUserProfile,
  branding,
  onOpenBrandingModal,
  onOpenChannelConnectModal,
  currentRole,
  onRestrictedTabClick,
  onToggleRole,
}) => {
  const isRep = currentRole === 'sales_rep';

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      id: 'inbox' as NavigationTab,
      label: 'Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      adminOnly: false,
    },
    {
      id: 'leads' as NavigationTab,
      label: 'Leads Pipeline',
      icon: Layers,
      badge: `${totalLeadsCount}`,
      badgeColor: 'bg-slate-800 text-slate-400',
      adminOnly: false,
    },
    {
      id: 'team' as NavigationTab,
      label: 'Team',
      icon: Users,
      badge: isRep ? 'Admin' : `${totalTeamCount}`,
      badgeColor: isRep
        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
        : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25',
      adminOnly: true,
      restrictedLabel: 'Team Management',
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Analytics',
      icon: BarChart3,
      adminOnly: false,
    },
    {
      id: 'activity' as NavigationTab,
      label: 'Activity Log',
      icon: Activity,
      adminOnly: false,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: isRep ? 'Admin' : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold',
      adminOnly: true,
      restrictedLabel: 'Settings & Workflows',
    },
  ];

  const handleBrandingClick = () => {
    if (isRep) {
      onRestrictedTabClick('Logo & Branding Customization');
      return;
    }
    onOpenBrandingModal();
  };

  const handleTabClick = (item: (typeof navItems)[0]) => {
    if (item.adminOnly && isRep) {
      onRestrictedTabClick(item.restrictedLabel || item.label);
      return;
    }
    onTabChange(item.id);
  };

  const channels: { id: ChannelType; name: string }[] = [
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'email', name: 'Gmail' },
    { id: 'indiamart', name: 'IndiaMART' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'manual', name: 'Manual' },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 select-none backdrop-blur-md">
      {/* Brand Header - Customizable & Clickable */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 group">
        <button
          type="button"
          onClick={handleBrandingClick}
          title={isRep ? 'Customize Brand (Admin Restricted)' : 'Click to customize Logo & Brand Name'}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity flex-1 p-1 -ml-1 rounded-lg hover:bg-slate-800/40"
        >
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.name}
              className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-1 border border-slate-700 shrink-0 shadow-md"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 text-white">
              <Zap className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
              <span className="truncate">{branding.name || 'OmniSync'}</span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-wider shrink-0">
                {branding.tag || 'CRM'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal truncate">
              {branding.subtitle || 'Omnichannel Intelligence'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleBrandingClick}
          title={isRep ? 'Customize Brand (Admin Only)' : 'Customize Brand'}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            isRep
              ? 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-950/40'
              : 'text-slate-500 hover:text-indigo-300 hover:bg-slate-800 opacity-60 group-hover:opacity-100'
          }`}
        >
          {isRep ? <Lock className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isLocked = item.adminOnly && isRep;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item)}
                  title={
                    isLocked
                      ? `${item.label} (Access Restricted: Admin Only)`
                      : item.label
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : isLocked
                      ? 'text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 opacity-80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    )}
                    <span className={isLocked ? 'text-slate-300' : ''}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-mono flex items-center gap-1 ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Channel Streams Quick Filter - Routes to Inbox with filtered channel */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Inbox Channels (6)
            </span>
            {selectedChannelFilter !== 'all' && (
              <button
                onClick={() => onSelectChannelFilter('all')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectChannelFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedChannelFilter === 'all' && currentTab === 'inbox'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>All Inbound Streams</span>
              </div>
              <span className="font-mono text-slate-400 tabular-nums">{totalLeadsCount}</span>
            </button>

            {channels.map((chan) => {
              const isSelected = selectedChannelFilter === chan.id && currentTab === 'inbox';
              const count = channelCounts[chan.id] || 0;
              return (
                <button
                  key={chan.id}
                  onClick={() => onSelectChannelFilter(chan.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-white border-l-2 border-indigo-500 pl-2.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ChannelIcon channel={chan.id} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{chan.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 tabular-nums text-[11px]">{count}</span>
                </button>
              );
            })}

            {onOpenChannelConnectModal && (
              <button
                type="button"
                onClick={onOpenChannelConnectModal}
                className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>⚡ Connect WhatsApp & Calls</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Copilot Status Card */}
        <div className="p-3 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-900/40 rounded-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Auto-scoring active across all 6 channels. {hotLeadsCount} Hot Leads need priority reply.
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Response SLA</span>
            <span className="text-emerald-400 font-mono font-medium">98.4%</span>
          </div>
        </div>
      </div>

      {/* User Footer Profile & Role Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/95 space-y-2">
        {/* Active Role Indicator with Quick Switch */}
        <div className="flex items-center justify-between px-1 text-[11px]">
          <span className="text-slate-400 font-medium">Session Role:</span>
          {onToggleRole ? (
            <button
              type="button"
              onClick={onToggleRole}
              title={`Click to switch to ${currentRole === 'admin' ? 'Sales Rep' : 'Admin'} view`}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold border transition-all cursor-pointer active:scale-95 ${
                currentRole === 'admin'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:border-amber-400'
                  : 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:border-sky-400'
              }`}
            >
              {currentRole === 'admin' ? (
                <>
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Admin View</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-sky-400" />
                  <span>Sales Rep View</span>
                </>
              )}
              <span className="text-[9px] text-slate-400">⇄</span>
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold border ${
                currentRole === 'admin'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
              }`}
            >
              {currentRole === 'admin' ? 'Admin' : 'Sales Rep'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenUserProfile}
          title="Open Account Settings & Profile Details"
          className="w-full text-left flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-150 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUserProfile.avatar}
                alt={currentUserProfile.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition-all"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                  currentUserProfile.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate group-hover:text-indigo-200 transition-colors">
                {currentUserProfile.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUserProfile.role}
              </div>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  );
};
