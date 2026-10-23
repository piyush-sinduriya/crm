import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Check, Clock } from 'lucide-react';
import {
  DateRangePreset,
  DateRangeFilter,
  getPresetDates,
  getTodayDateString,
  formatDateTag,
} from '../utils/csvExport';

interface DateRangeSelectorProps {
  value: DateRangeFilter;
  onChange: (newFilter: DateRangeFilter) => void;
  compact?: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate || '2026-04-01');
  const [customEnd, setCustomEnd] = useState(value.endDate || getTodayDateString());

  // Sync internal state when external value changes
  useEffect(() => {
    if (value.startDate) setCustomStart(value.startDate);
    if (value.endDate) setCustomEnd(value.endDate);
  }, [value.startDate, value.endDate]);

  const presets: { id: DateRangePreset; label: string; badge: string; desc: string }[] = [
    {
      id: 'fy_2026_27',
      label: 'This Financial Year (1 April 2026 – Till Date)',
      badge: 'FY 2026-27',
      desc: '1 Apr 2026 to Today',
    },
    {
      id: 'this_month',
      label: 'This Month',
      badge: 'This Month',
      desc: '1st of month to Today',
    },
    {
      id: 'last_30_days',
      label: 'Last 30 Days',
      badge: 'Last 30 Days',
      desc: 'Trailing 30-day window',
    },
    {
      id: 'custom',
      label: 'Custom Range',
      badge: 'Custom',
      desc: 'Specify start and end dates',
    },
  ];

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      const dates = getPresetDates('custom');
      const start = customStart || dates.startDate;
      const end = customEnd || dates.endDate;
      onChange({
        preset: 'custom',
        startDate: start,
        endDate: end,
      });
      // Keep open so user can pick the dates
    } else {
      const dates = getPresetDates(preset);
      onChange({
        preset,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
      setIsOpen(false);
    }
  };

  const handleCustomDateApply = () => {
    onChange({
      preset: 'custom',
      startDate: customStart,
      endDate: customEnd,
    });
    setIsOpen(false);
  };

  // Get current display label
  const getDisplayLabel = () => {
    if (value.preset === 'fy_2026_27') {
      return compact ? 'FY 2026-27' : 'FY 2026-27 (1 Apr – Till Date)';
    }
    if (value.preset === 'this_month') {
      return compact ? 'This Month' : 'This Month (Till Date)';
    }
    if (value.preset === 'last_30_days') {
      return compact ? 'Last 30D' : 'Last 30 Days';
    }
    if (value.preset === 'custom') {
      const startTag = value.startDate ? formatDateTag(value.startDate) : 'Start';
      const endTag = value.endDate ? formatDateTag(value.endDate) : 'End';
      return `${startTag} – ${endTag}`;
    }
    return 'All Dates';
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
        title="Filter by Date Range / Financial Year"
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-medium truncate max-w-[170px] sm:max-w-[210px]">
          {getDisplayLabel()}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <>
          {/* Backdrop click listener */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 z-50 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Date Range Filter</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                FY 2026-27 Active
              </span>
            </div>

            {/* Presets List */}
            <div className="space-y-1">
              {presets.map((p) => {
                const isSelected = value.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/60 border border-indigo-600/50 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs flex items-center gap-1.5">
                        <span>{p.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Picker Inputs */}
            {value.preset === 'custom' && (
              <div className="pt-2 border-t border-slate-800 space-y-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-300">
                  Custom Date Window:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      max={getTodayDateString()}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStart(getPresetDates('fy_2026_27').startDate);
                      setCustomEnd(getPresetDates('fy_2026_27').endDate);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Reset to FY
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomDateApply}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}

            {/* Active Range Summary text */}
            <div className="pt-1 text-[10px] text-slate-400 font-mono border-t border-slate-800 flex items-center justify-between">
              <span>Filter Bounds:</span>
              <span className="text-slate-300">
                {value.startDate || 'Beginning'} → {value.endDate || 'Now'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
