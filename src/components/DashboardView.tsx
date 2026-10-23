import React from 'react';
import { Lead, ActivityItem, ChannelType } from '../types/crm';
import { AnalyticsCards } from './AnalyticsCards';
import { RecentActivityFeed } from './RecentActivityFeed';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  Upload,
  Radio,
  Trash2,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
  activities: ActivityItem[];
  onSelectLeadAndGoToInbox: (leadId: string) => void;
  onNavigateToTab: (tab: 'inbox' | 'leads' | 'analytics' | 'team') => void;
  onOpenManualModal: () => void;
  onOpenImportModal?: () => void;
  onOpenIndiaMartModal?: () => void;
  onClearAllLeads?: () => void;
  onSimulateInbound: () => void;
  currencySymbol?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  activities,
  onSelectLeadAndGoToInbox,
  onNavigateToTab,
  onOpenManualModal,
  onOpenImportModal,
  onOpenIndiaMartModal,
  onClearAllLeads,
  onSimulateInbound,
  currencySymbol = '₹',
}) => {
  const total = leads.length;

  // Compute Pipeline Stages
  const newLeads = leads.filter((l) => l.status === 'new');
  const inProgressLeads = leads.filter((l) => l.status === 'in_progress');
  const convertedLeads = leads.filter((l) => l.status === 'converted');
  const closedLeads = leads.filter((l) => l.status === 'closed');

  const calculateSum = (items: Lead[]) => {
    return items.reduce((acc, curr) => {
      const val = parseInt(curr.estimatedValue?.replace(/[^0-9]/g, '') || '0', 10);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  };

  // Channel breakdown
  const channelData: Record<ChannelType, { total: number; converted: number }> = {
    whatsapp: { total: 0, converted: 0 },
    email: { total: 0, converted: 0 },
    indiamart: { total: 0, converted: 0 },
    facebook: { total: 0, converted: 0 },
    instagram: { total: 0, converted: 0 },
    youtube: { total: 0, converted: 0 },
    manual: { total: 0, converted: 0 },
  };

  leads.forEach((l) => {
    if (channelData[l.channel]) {
      channelData[l.channel].total += 1;
      if (l.status === 'converted') channelData[l.channel].converted += 1;
    }
  });

  // Priority queue: hot or unread leads
  const priorityLeads = leads.filter((l) => l.leadScore === 'hot' || l.unread).slice(0, 4);

  return (
    <div className="space-y-6 pb-8">
      {/* 0. Real Business Lead Hub Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live Inbound Channels & Lead Ingestion Hub
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Connect your real business channels: Sync IndiaMART B2B inquiries via MAPI, receive live website/WhatsApp webhooks, or import your existing customer CSV.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenIndiaMartModal && (
            <button
              type="button"
              onClick={onOpenIndiaMartModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>⚡ Sync IndiaMART & Webhooks</span>
            </button>
          )}

          {onOpenImportModal && (
            <button
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import CSV Leads</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Lead</span>
          </button>

          {onClearAllLeads && leads.length > 0 && (
            <button
              type="button"
              onClick={onClearAllLeads}
              title="Remove sample demo leads to start clean with only your real business leads"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Clean Demo Data</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Top KPI Summary Cards */}
      <AnalyticsCards leads={leads} />

      {/* 2. Pipeline Stages Summary Strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Sales Pipeline Snapshot
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('leads')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Open Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateToTab('leads')}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-sky-900/40 hover:border-sky-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-sky-400">1. New Inbound</span>
              <span className="font-mono text-sky-300 font-bold">{newLeads.length}</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1.5 tabular-nums">
              {currencySymbol}{calculateSum(newLeads).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Uncontacted inquiries</div>
          </div>

          <div
            onClick={() => onNavigateToTab('leads')}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-indigo-900/40 hover:border-indigo-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-indigo-400">2. In Progress</span>
              <span className="font-mono text-indigo-300 font-bold">{inProgressLeads.length}</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1.5 tabular-nums">
              {currencySymbol}{calculateSum(inProgressLeads).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Discussions & proposals</div>
          </div>

          <div
            onClick={() => onNavigateToTab('leads')}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-emerald-900/40 hover:border-emerald-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">3. Converted Won</span>
              <span className="font-mono text-emerald-300 font-bold">{convertedLeads.length}</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1.5 tabular-nums">
              {currencySymbol}{calculateSum(convertedLeads).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Purchase orders locked</div>
          </div>

          <div
            onClick={() => onNavigateToTab('leads')}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-400">4. Closed / Archived</span>
              <span className="font-mono text-slate-400 font-bold">{closedLeads.length}</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-300 mt-1.5 tabular-nums">
              {currencySymbol}{calculateSum(closedLeads).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Informational / Completed</div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard 2-Column Split: Lead Source Analytics on Left, Priority Action Queue & Activity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Channel Attribution & AI Quality */}
        <div className="lg:col-span-6 space-y-6">
          {/* Channel Breakdown */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Lead Source & Channel Attribution</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">6 Omnichannel Streams</span>
            </div>

            <div className="space-y-3">
              {(Object.keys(channelData) as ChannelType[]).map((chanKey) => {
                const data = channelData[chanKey];
                const cfg = getChannelConfig(chanKey);
                const pct = total > 0 ? Math.round((data.total / total) * 100) : 0;
                const convRate =
                  data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0;

                return (
                  <div key={chanKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ChannelIcon channel={chanKey} className="w-3.5 h-3.5" />
                        <span className="font-semibold text-slate-200">{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-slate-400">
                          {data.total} leads ({pct}%)
                        </span>
                        <span className="text-emerald-400 font-medium">{convRate}% conv</span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className={`h-full ${cfg.accentBg} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Intelligence Insights Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-900/50 border border-indigo-900/50 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Lead Intelligence Insights</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              IndiaMART inquiries have the highest purchase intent this week (average quote size ₹31 Lakhs).
              WhatsApp inquiries require the fastest response time with a 4.2 minute initial SLA.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Avg Inbound-to-Quote</span>
              <span className="text-emerald-400 font-mono font-bold">18 mins</span>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Priority Action Queue & Activity Log */}
        <div className="lg:col-span-6 space-y-6">
          {/* Priority Inquiries Queue (Hot / Unread) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Priority Leads Requiring Action ({priorityLeads.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('inbox')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Go to Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {priorityLeads.map((lead) => {
                const channelCfg = getChannelConfig(lead.channel);
                return (
                  <div
                    key={lead.id}
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${channelCfg.colorClass}`}
                        >
                          <ChannelIcon channel={lead.channel} className="w-3 h-3" />
                          <span>{channelCfg.shortLabel}</span>
                        </span>
                        <span className="font-bold text-xs text-white truncate">
                          {lead.contactName}
                        </span>
                        {lead.company && (
                          <span className="text-xs text-slate-400 truncate hidden sm:inline">
                            · {lead.company}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 truncate">
                        "{lead.message}"
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectLeadAndGoToInbox(lead.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-500 rounded-lg shadow-sm transition-all shrink-0 active:scale-95"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Log */}
          <RecentActivityFeed
            activities={activities}
            onSelectLead={(id) => onSelectLeadAndGoToInbox(id)}
          />
        </div>
      </div>
    </div>
  );
};
