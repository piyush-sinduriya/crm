import React from 'react';
import { Lead } from '../types/crm';
import { Users, Flame, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';

interface AnalyticsCardsProps {
  leads: Lead[];
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.leadScore === 'hot').length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Compute top channel by volume and conversion
  const channelCounts: Record<string, number> = {};
  leads.forEach((l) => {
    channelCounts[l.channel] = (channelCounts[l.channel] || 0) + 1;
  });

  let topChannel = 'whatsapp';
  let topCount = 0;
  Object.entries(channelCounts).forEach(([chan, count]) => {
    if (count > topCount) {
      topCount = count;
      topChannel = chan;
    }
  });

  const topChannelConfig = getChannelConfig(topChannel as any);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {/* Total Leads */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Leads</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {totalLeads}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18% wk</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">Unified across 6 channels</div>
      </div>

      {/* Hot Leads Count */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Hot Leads</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums tracking-tight">
            {hotLeads}
          </div>
          <span className="text-[11px] text-amber-300/80 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            Priority SLA
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0}% of active pipeline
        </div>
      </div>

      {/* Conversion Rate % */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Conversion Rate</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight">
            {conversionRate}%
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Target: 22%</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {convertedLeads} won deals this cycle
        </div>
      </div>

      {/* Top Performing Lead Source */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Top Lead Channel</span>
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
            <ChannelIcon channel={topChannel as any} className="w-3.5 h-3.5 text-slate-200" />
          </div>
          <div className="text-sm font-semibold text-white truncate">
            {topChannelConfig.shortLabel}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>{topCount} inquiries</span>
          <span className="text-indigo-400 font-medium">Highest volume</span>
        </div>
      </div>
    </div>
  );
};
