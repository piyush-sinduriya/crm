import React, { useState, useMemo, useEffect } from 'react';
import { Lead, ChannelType, LeadStatus } from '../types/crm';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  CsvExportOptions,
  DateRangePreset,
  DateRangeFilter,
  filterLeadsForExport,
  generateLeadsCsv,
  downloadCsv,
  copyTsvToClipboard,
  getPresetDates,
  getExportFilename,
  getTodayDateString,
} from '../utils/csvExport';
import { ChannelIcon } from './ChannelIcon';

interface ExportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLeads: Lead[];
  currentFilteredLeads: Lead[];
  initialChannelFilter?: string;
  initialDateRange?: DateRangeFilter;
}

export const ExportLeadsModal: React.FC<ExportLeadsModalProps> = ({
  isOpen,
  onClose,
  allLeads,
  currentFilteredLeads,
  initialChannelFilter = 'all',
  initialDateRange = {
    preset: 'fy_2026_27',
    startDate: '2026-04-01',
    endDate: getTodayDateString(),
  },
}) => {
  const [scope, setScope] = useState<'all' | 'current_filtered' | 'channel'>(
    initialChannelFilter !== 'all' ? 'channel' : 'all'
  );
  const [selectedChannel, setSelectedChannel] = useState<string>(
    initialChannelFilter !== 'all' ? initialChannelFilter : 'indiamart'
  );
  const [dateRange, setDateRange] = useState<DateRangePreset>(initialDateRange.preset);
  const [customStart, setCustomStart] = useState<string>(initialDateRange.startDate || '2026-04-01');
  const [customEnd, setCustomEnd] = useState<string>(initialDateRange.endDate || getTodayDateString());
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialDateRange) {
        setDateRange(initialDateRange.preset);
        if (initialDateRange.startDate) setCustomStart(initialDateRange.startDate);
        if (initialDateRange.endDate) setCustomEnd(initialDateRange.endDate);
      }
      if (initialChannelFilter && initialChannelFilter !== 'all') {
        setScope('channel');
        setSelectedChannel(initialChannelFilter);
      }
    }
  }, [isOpen, initialDateRange, initialChannelFilter]);

  // When preset changes, automatically populate start & end dates
  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDateRange(preset);
    const dates = getPresetDates(preset);
    if (dates.startDate) setCustomStart(dates.startDate);
    if (dates.endDate) setCustomEnd(dates.endDate);
  };

  // Compute matching leads
  const matchingLeads = useMemo(() => {
    const opts: CsvExportOptions = {
      scope,
      selectedChannel,
      dateRange,
      customStartDate: customStart,
      customEndDate: customEnd,
      statusFilter,
    };
    return filterLeadsForExport(allLeads, currentFilteredLeads, opts);
  }, [allLeads, currentFilteredLeads, scope, selectedChannel, dateRange, customStart, customEnd, statusFilter]);

  if (!isOpen) return null;

  const currentFilename = getExportFilename(dateRange, customStart, customEnd);

  const handleDownload = () => {
    setIsDownloading(true);
    const csvData = generateLeadsCsv(matchingLeads);

    setTimeout(() => {
      downloadCsv(currentFilename, csvData);
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }, 200);
  };

  const handleCopyClipboard = async () => {
    await copyTsvToClipboard(matchingLeads);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const channelOptions: { id: ChannelType; label: string }[] = [
    { id: 'indiamart', label: 'IndiaMART' },
    { id: 'whatsapp', label: 'WhatsApp Business' },
    { id: 'email', label: 'Gmail / Email' },
    { id: 'facebook', label: 'Meta Facebook' },
    { id: 'instagram', label: 'Meta Instagram' },
    { id: 'youtube', label: 'YouTube Comments' },
    { id: 'manual', label: 'Manual Entries' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Export Leads to Excel / CSV
              </h3>
              <p className="text-[11px] text-slate-400">
                Filtered export with verified contacts, INR deal values, SLA status, and notes log
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>
                Report downloaded as <strong>{currentFilename}</strong>! Ready for Microsoft Excel & Google Sheets.
              </span>
            </div>
          )}

          {/* 1. Scope Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              1. Select Leads Source Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scope === 'all'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>All Inbound Leads</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {allLeads.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Full active database
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('current_filtered')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scope === 'current_filtered'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Current Filter View</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {currentFilteredLeads.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Active search & filter results
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('channel')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scope === 'channel'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Specific Channel</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Target
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Filter by WhatsApp, IndiaMART, etc.
                </div>
              </button>
            </div>

            {/* Channel dropdown if channel scope is active */}
            {scope === 'channel' && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <span className="text-xs font-medium text-slate-300">Pick Channel:</span>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 flex-1 max-w-xs cursor-pointer"
                >
                  {channelOptions.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Date Range & Lead Status Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Date Range Preset</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {dateRange === 'fy_2026_27' ? 'FY 2026-27 Active' : ''}
                </span>
              </label>
              <select
                value={dateRange}
                onChange={(e) => handleDatePresetChange(e.target.value as DateRangePreset)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="fy_2026_27">This Financial Year (1 April 2026 – Till Date)</option>
                <option value="this_month">This Month</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
                <option value="all">All Time (Full History)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lead Stage / Status</span>
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Stages (New, In Progress, Converted, Closed)</option>
                <option value="new">New Inquiries Only</option>
                <option value="in_progress">In Progress / Qualified Only</option>
                <option value="converted">Converted / Won Deals Only</option>
                <option value="closed">Closed / Archived Only</option>
              </select>
            </div>
          </div>

          {/* Interactive Start/End Date Pickers for Custom or verifying active dates */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Effective Date Filter:</span>
              <span className="font-mono text-indigo-300">
                {customStart || '2026-04-01'} to {customEnd || getTodayDateString()}
              </span>
            </div>
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    max={getTodayDateString()}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Export Summary & Columns Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Ready to Export:{' '}
                  <strong className="text-emerald-400 font-mono text-sm">
                    {matchingLeads.length} Leads
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                UTF-8 CSV (Excel / Sheets compatible)
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-slate-300 font-mono">
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400">Filename:</span>
              <span className="text-emerald-300 font-semibold truncate">{currentFilename}</span>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed">
              <strong>12 Standardized Columns:</strong> Lead Received Date & Time, Customer Name, Company, Phone (+91), Email, Source Channel, Current Work Status, Deal Value (INR ₹), Assigned Sales Representative, AI Lead Score & Sentiment, SLA Response Status, Internal Rep Notes / Work Progress Log.
            </div>

            {/* Quick Preview of matching rows */}
            {matchingLeads.length > 0 ? (
              <div className="border border-slate-800/80 rounded-lg overflow-hidden mt-2 bg-slate-900/60 max-h-36 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="px-2.5 py-1.5">Contact</th>
                      <th className="px-2.5 py-1.5">Channel</th>
                      <th className="px-2.5 py-1.5">Status</th>
                      <th className="px-2.5 py-1.5">Value (INR)</th>
                      <th className="px-2.5 py-1.5">Rep</th>
                      <th className="px-2.5 py-1.5">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {matchingLeads.slice(0, 3).map((l) => (
                      <tr key={l.id} className="hover:bg-slate-850">
                        <td className="px-2.5 py-1.5 font-sans font-medium text-white truncate max-w-[120px]">
                          {l.contactName}
                        </td>
                        <td className="px-2.5 py-1.5 capitalize text-slate-400">
                          {l.channel}
                        </td>
                        <td className="px-2.5 py-1.5 capitalize text-slate-400">
                          {l.status.replace('_', ' ')}
                        </td>
                        <td className="px-2.5 py-1.5 text-emerald-400">
                          {l.estimatedValue || '₹0'}
                        </td>
                        <td className="px-2.5 py-1.5 text-slate-300 truncate max-w-[100px]">
                          {l.assignedAgent.name}
                        </td>
                        <td className="px-2.5 py-1.5">
                          <span
                            className={
                              l.status !== 'new'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }
                          >
                            {l.status !== 'new' ? 'Met' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {matchingLeads.length > 3 && (
                  <div className="px-2.5 py-1 bg-slate-900/90 text-[10px] text-slate-400 text-center font-mono border-t border-slate-800/80">
                    + {matchingLeads.length - 3} more records matching date filter
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 text-center text-slate-400 text-xs">
                No leads found within the selected date range and filters.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/95">
          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={matchingLeads.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Copy as TSV to paste directly into Google Sheets or Excel"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy for Excel / Sheets</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={matchingLeads.length === 0 || isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating CSV...' : `Download CSV (${matchingLeads.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
