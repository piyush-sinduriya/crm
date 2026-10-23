import React from 'react';
import { ChannelType, LeadScore, LeadStatus } from '../types/crm';
import { Search, Filter, RotateCcw, Flame, Sun, Snowflake, FileSpreadsheet, Settings2 } from 'lucide-react';
import { ChannelIcon } from './ChannelIcon';
import { DateRangeSelector } from './DateRangeSelector';
import { DateRangeFilter } from '../utils/csvExport';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedChannel: string;
  onChannelChange: (c: string) => void;
  selectedScore: string;
  onScoreChange: (s: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  onOpenExportModal?: () => void;
  onQuickExport?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedChannel,
  onChannelChange,
  selectedScore,
  onScoreChange,
  selectedStatus,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onResetFilters,
  totalFilteredCount,
  onOpenExportModal,
  onQuickExport,
}) => {
  const channels: { id: string; label: string; icon?: ChannelType }[] = [
    { id: 'all', label: 'All Channels' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
    { id: 'email', label: 'Gmail', icon: 'email' },
    { id: 'indiamart', label: 'IndiaMART', icon: 'indiamart' },
    { id: 'facebook', label: 'Facebook', icon: 'facebook' },
    { id: 'instagram', label: 'Instagram', icon: 'instagram' },
    { id: 'youtube', label: 'YouTube', icon: 'youtube' },
    { id: 'manual', label: 'Manual', icon: 'manual' },
  ];

  const scores: { id: string; label: string; icon?: React.ReactNode; color?: string }[] = [
    { id: 'all', label: 'All Scores' },
    { id: 'hot', label: 'Hot', icon: <Flame className="w-3 h-3 text-amber-400" /> },
    { id: 'warm', label: 'Warm', icon: <Sun className="w-3 h-3 text-yellow-400" /> },
    { id: 'cold', label: 'Cold', icon: <Snowflake className="w-3 h-3 text-sky-400" /> },
  ];

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Status' },
    { id: 'new', label: 'New' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'converted', label: 'Converted' },
    { id: 'closed', label: 'Closed' },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedChannel !== 'all' ||
    selectedScore !== 'all' ||
    selectedStatus !== 'all' ||
    dateRange.preset !== 'fy_2026_27';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-3">
      {/* Top Controls Row: Search + Date Range + Status + Export Button */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by lead name, company, keyword, or note..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Lead Score Segmented Buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950/60 border border-slate-800 rounded-lg shrink-0 overflow-x-auto">
          <span className="px-2 text-[11px] font-medium text-slate-400 hidden xl:inline">Score:</span>
          {scores.map((sc) => {
            const isActive = selectedScore === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onScoreChange(sc.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sc.icon}
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions Cluster: Status + Date Range Selector + Export CSV */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter leads by stage status"
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {statuses.map((st) => (
              <option key={st.id} value={st.id} className="bg-slate-900 text-slate-200">
                {st.label}
              </option>
            ))}
          </select>

          {/* DATE RANGE FILTER CONTROLS (Next to Export CSV button) */}
          <DateRangeSelector
            value={dateRange}
            onChange={onDateRangeChange}
          />

          {/* EXPORT CSV BUTTON */}
          <div className="flex items-center rounded-lg border border-emerald-800/70 bg-emerald-950/40 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={onQuickExport || onOpenExportModal}
              title={`Export leads to CSV within selected date range (${dateRange.startDate || '2026-04-01'} to ${dateRange.endDate || 'Today'})`}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            {onOpenExportModal && (
              <button
                type="button"
                onClick={onOpenExportModal}
                title="Open Export Settings & Channel Filter Modal"
                className="px-1.5 py-1.5 border-l border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-200 transition-colors cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all filters to default"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Channel Source Interactive Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-800/60">
        <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Channels:</span>
        </span>

        {channels.map((chan) => {
          const isSelected = selectedChannel === chan.id;
          return (
            <button
              key={chan.id}
              onClick={() => onChannelChange(chan.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/70'
              }`}
            >
              {chan.icon && <ChannelIcon channel={chan.icon} className="w-3 h-3" />}
              <span>{chan.label}</span>
            </button>
          );
        })}

        <div className="ml-auto pl-2 text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
          Showing {totalFilteredCount} inquiries
        </div>
      </div>
    </div>
  );
};
