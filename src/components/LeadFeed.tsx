import React from 'react';
import { Lead } from '../types/crm';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';
import { SlaCountdownBadge } from './SlaCountdownBadge';
import { Flame, Sun, Snowflake, MessageSquare, AlertCircle } from 'lucide-react';

interface LeadFeedProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onClearFilters?: () => void;
  onOpenManualModal?: () => void;
}

export const LeadFeed: React.FC<LeadFeedProps> = ({
  leads,
  selectedLeadId,
  onSelectLead,
  onClearFilters,
  onOpenManualModal,
}) => {
  if (leads.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No matching inquiries</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4 leading-relaxed">
          No inquiries found with the selected channel, score, or search filters.
        </p>
        <div className="flex items-center gap-2">
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          )}
          {onOpenManualModal && (
            <button
              onClick={onOpenManualModal}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              + Add Lead
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 overflow-y-auto pr-1 h-full max-h-[calc(100vh-230px)]">
      {leads.map((lead) => {
        const isSelected = lead.id === selectedLeadId;
        const channelCfg = getChannelConfig(lead.channel);

        // Score badge helper
        const renderScoreBadge = () => {
          switch (lead.leadScore) {
            case 'hot':
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Hot</span>
                </span>
              );
            case 'warm':
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-1.5 py-0.5 rounded">
                  <Sun className="w-3 h-3 text-yellow-400" />
                  <span>Warm</span>
                </span>
              );
            case 'cold':
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                  <Snowflake className="w-3 h-3 text-slate-400" />
                  <span>Cold</span>
                </span>
              );
          }
        };

        // Status badge color
        const getStatusBadge = () => {
          switch (lead.status) {
            case 'new':
              return 'text-sky-400 bg-sky-500/10 border-sky-500/25';
            case 'in_progress':
              return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25';
            case 'converted':
              return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
            case 'closed':
              return 'text-slate-400 bg-slate-800 border-slate-700';
          }
        };

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectLead(lead.id);
              }
            }}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer relative group ${
              isSelected
                ? 'bg-slate-900 border-indigo-500/80 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            {/* Top row: Channel Badge & Timestamp & Score Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Channel Badge with distinct authentic brand colors */}
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${channelCfg.colorClass}`}
                >
                  <ChannelIcon channel={lead.channel} className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{channelCfg.shortLabel}</span>
                </span>

                {/* Score Badge */}
                {renderScoreBadge()}
              </div>

              {/* Timestamp & Unread */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums shrink-0">
                {lead.unread && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" title="Unread inquiry" />
                )}
                <span>{lead.receivedAt}</span>
              </div>
            </div>

            {/* Middle Row: Contact Name and Company */}
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-200 transition-colors">
                {lead.contactName}
              </h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${getStatusBadge()}`}>
                {lead.status.replace('_', ' ')}
              </span>
            </div>

            {lead.company && (
              <div className="text-xs text-slate-400 truncate mb-2">
                {lead.company}
              </div>
            )}

            {/* 1-Line Snippet of the Message */}
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
              "{lead.message}"
            </p>

            {/* Footer metadata: estimated value & sentiment & SLA */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300 font-medium">{lead.estimatedValue || '₹10,00,000'}</span>
                <span>·</span>
                <span className="text-slate-400 truncate max-w-[120px]">
                  {lead.assignedAgent.name.split(' ')[0]}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <SlaCountdownBadge
                  receivedTimestamp={lead.receivedTimestamp}
                  status={lead.status}
                  hasReplied={lead.conversation.some((m) => m.sender === 'agent')}
                  variant="compact"
                />

                {lead.sentiment === 'urgent_frustrated' && (
                  <span className="text-rose-400 text-[10px] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Urgent
                  </span>
                )}
                {lead.sentiment === 'positive' && (
                  <span className="text-emerald-400 text-[10px] font-medium">Positive</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
