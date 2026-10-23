import React from 'react';
import { Lead, ChannelType } from '../types/crm';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Zap,
} from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads }) => {
  const total = leads.length;

  // Channel breakdown
  const channelData: Record<
    ChannelType,
    { total: number; converted: number; hot: number }
  > = {
    whatsapp: { total: 0, converted: 0, hot: 0 },
    email: { total: 0, converted: 0, hot: 0 },
    indiamart: { total: 0, converted: 0, hot: 0 },
    facebook: { total: 0, converted: 0, hot: 0 },
    instagram: { total: 0, converted: 0, hot: 0 },
    youtube: { total: 0, converted: 0, hot: 0 },
    manual: { total: 0, converted: 0, hot: 0 },
  };

  leads.forEach((l) => {
    if (channelData[l.channel]) {
      channelData[l.channel].total += 1;
      if (l.status === 'converted') channelData[l.channel].converted += 1;
      if (l.leadScore === 'hot') channelData[l.channel].hot += 1;
    }
  });

  // Sentiment breakdown
  const positiveCount = leads.filter((l) => l.sentiment === 'positive').length;
  const neutralCount = leads.filter((l) => l.sentiment === 'neutral').length;
  const urgentCount = leads.filter((l) => l.sentiment === 'urgent_frustrated').length;

  // Score breakdown
  const hotCount = leads.filter((l) => l.leadScore === 'hot').length;
  const warmCount = leads.filter((l) => l.leadScore === 'warm').length;
  const coldCount = leads.filter((l) => l.leadScore === 'cold').length;

  return (
    <div className="space-y-5 pb-6 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Avg Initial Response Time</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2 tabular-nums">
            4.2 mins
          </div>
          <div className="text-[11px] text-slate-400 mt-1">AI Copilot reduced SLA by 68%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">First-Touch Resolution</div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-2 tabular-nums">
            71.8%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Smart replies dispatched without edit</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Hot Lead Win Rate</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2 tabular-nums">
            41.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Based on priority SLA routing</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Pipeline Velocity</div>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            3.6 days
          </div>
          <div className="text-[11px] text-slate-400 mt-1">From inbound inquiry to PO</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Channel Volume & Conversion Table */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Channel Performance & Attribution</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {total} Leads</span>
          </div>

          <div className="space-y-3">
            {(Object.keys(channelData) as ChannelType[]).map((chanKey) => {
              const data = channelData[chanKey];
              const cfg = getChannelConfig(chanKey);
              const percentage = total > 0 ? Math.round((data.total / total) * 100) : 0;
              const convRate = data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0;

              return (
                <div key={chanKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel={chanKey} className="w-3.5 h-3.5" />
                      <span className="font-semibold text-slate-200">{cfg.shortLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">{data.total} leads ({percentage}%)</span>
                      <span className="text-emerald-400 font-medium">{convRate}% conv</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className={`h-full ${cfg.accentBg} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment & Lead Quality Matrices */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-violet-400" />
              <span>AI Lead Quality & Sentiment Analysis</span>
            </h3>

            {/* Score Distribution */}
            <div className="space-y-2 mb-5">
              <div className="text-xs text-slate-400 font-medium">Lead Score Distribution</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-center">
                  <div className="text-lg font-bold font-mono text-amber-400">{hotCount}</div>
                  <div className="text-[11px] text-amber-300/80 font-medium mt-0.5">Hot Leads</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-center">
                  <div className="text-lg font-bold font-mono text-yellow-400">{warmCount}</div>
                  <div className="text-[11px] text-yellow-300/80 font-medium mt-0.5">Warm Leads</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                  <div className="text-lg font-bold font-mono text-slate-300">{coldCount}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Cold Leads</div>
                </div>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-medium">Inbound Customer Sentiment</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5">
                  <Smile className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-base font-bold font-mono text-emerald-400">{positiveCount}</div>
                    <div className="text-[10px] text-emerald-300">Positive</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2.5">
                  <Meh className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-base font-bold font-mono text-slate-300">{neutralCount}</div>
                    <div className="text-[10px] text-slate-400">Neutral</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-base font-bold font-mono text-rose-400">{urgentCount}</div>
                    <div className="text-[10px] text-rose-300">Urgent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-200 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              IndiaMART and WhatsApp yield 73% of all Hot leads. Recommended to maintain under 5-minute SLAs on these channels.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
