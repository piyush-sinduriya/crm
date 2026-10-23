import React from 'react';
import { Lead, LeadStatus } from '../types/crm';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';
import { Flame, Sun, Snowflake, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PipelineViewProps {
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  currencySymbol?: string;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onSelectLead,
  onUpdateStatus,
  currencySymbol = '₹',
}) => {
  const stages: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'new', label: 'New Inquiries', color: 'border-sky-500/40 text-sky-400' },
    { id: 'in_progress', label: 'In Progress / Qualified', color: 'border-indigo-500/40 text-indigo-400' },
    { id: 'converted', label: 'Converted / Closed Won', color: 'border-emerald-500/40 text-emerald-400' },
    { id: 'closed', label: 'Closed / Archived', color: 'border-slate-700 text-slate-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-170px)] overflow-y-auto pb-4">
      {stages.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.id);
        const totalValue = stageLeads.reduce((acc, curr) => {
          const valNum = parseInt(curr.estimatedValue?.replace(/[^0-9]/g, '') || '0', 10);
          return acc + (isNaN(valNum) ? 0 : valNum);
        }, 0);

        return (
          <div
            key={stage.id}
            className="bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-slate-800 bg-slate-900/80 ${stage.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {stageLeads.length}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Value: {currencySymbol}{totalValue.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Column Cards */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {stageLeads.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                  No inquiries in this stage
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const channelCfg = getChannelConfig(lead.channel);
                  return (
                    <div
                      key={lead.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-indigo-500/60 transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${channelCfg.colorClass}`}
                        >
                          <ChannelIcon channel={lead.channel} className="w-3 h-3" />
                          <span>{channelCfg.shortLabel}</span>
                        </span>

                        {lead.leadScore === 'hot' && (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            Hot
                          </span>
                        )}
                        {lead.leadScore === 'warm' && (
                          <span className="text-[10px] text-yellow-400 font-semibold flex items-center gap-0.5">
                            <Sun className="w-3 h-3" />
                            Warm
                          </span>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => onSelectLead(lead.id)}
                          className="text-xs font-bold text-white hover:text-indigo-300 text-left transition-colors"
                        >
                          {lead.contactName}
                        </button>
                        {lead.company && (
                          <div className="text-[11px] text-slate-400 truncate">{lead.company}</div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {lead.message}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono text-slate-200 font-medium">
                          {lead.estimatedValue || '₹15 Lakhs'}
                        </span>

                        {/* Stage transition quick buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {stage.id !== 'converted' && (
                            <button
                              onClick={() => onUpdateStatus(lead.id, 'converted')}
                              title="Mark as Converted"
                              className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectLead(lead.id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
