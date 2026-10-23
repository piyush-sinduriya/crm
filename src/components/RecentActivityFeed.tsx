import React from 'react';
import { ActivityItem } from '../types/crm';
import { ChannelIcon } from './ChannelIcon';
import { Clock, Send, MessageSquare, CheckCircle2, UserPlus, FileText, ArrowRight, Zap, AlertTriangle } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  onSelectLead?: (leadId: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  onSelectLead,
}) => {
  const getActionIcon = (action: ActivityItem['action']) => {
    switch (action) {
      case 'inquiry_received':
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
      case 'reply_sent':
        return <Send className="w-3.5 h-3.5 text-emerald-400" />;
      case 'auto_reply_sent':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'sla_escalation':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'template_sent':
        return <Send className="w-3.5 h-3.5 text-indigo-400" />;
      case 'status_changed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'manual_created':
        return <UserPlus className="w-3.5 h-3.5 text-violet-400" />;
      case 'note_added':
        return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Recent Activity & Audit Log
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {activities.length} recent events
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800/80">
        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3 pl-8 text-xs group">
            {/* Timeline node */}
            <div className="absolute left-1.5 top-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>

            <div className="flex-1 bg-slate-950/60 border border-slate-800/70 rounded-lg p-2.5 transition-colors hover:border-slate-700">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{act.leadName}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <ChannelIcon channel={act.channel} className="w-3 h-3" />
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{act.timestamp}</span>
              </div>

              <p className="text-xs text-slate-300 leading-snug">{act.description}</p>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                <span>By: {act.user || 'System'}</span>
                {onSelectLead && (
                  <button
                    onClick={() => onSelectLead(act.leadId)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <span>View Lead</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
