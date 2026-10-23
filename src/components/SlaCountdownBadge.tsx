import React, { useState, useEffect } from 'react';
import { LeadStatus } from '../types/crm';
import { Clock, AlertTriangle, CheckCircle2, Flame, AlertCircle } from 'lucide-react';

interface SlaCountdownBadgeProps {
  receivedTimestamp: number;
  status: LeadStatus;
  hasReplied?: boolean;
  targetMinutes?: number;
  variant?: 'compact' | 'detailed' | 'pill';
  className?: string;
}

export const SlaCountdownBadge: React.FC<SlaCountdownBadgeProps> = ({
  receivedTimestamp,
  status,
  hasReplied = false,
  targetMinutes = 15,
  variant = 'compact',
  className = '',
}) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Tick live every second
  useEffect(() => {
    // Only set interval if the lead is in 'new' status and not replied
    if (status !== 'new' || hasReplied) return;

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status, hasReplied]);

  const isResolved = status !== 'new' || hasReplied;
  const targetDeadline = receivedTimestamp + targetMinutes * 60 * 1000;
  const remainingMs = targetDeadline - currentTime;

  // Case 1: SLA Met (Rep updated status from New to In Progress/Converted/Closed or replied)
  if (isResolved) {
    if (variant === 'detailed') {
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold ${className}`}
          title="Inquiry responded to or qualified within target SLA"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>SLA Met (First-Touch Handled)</span>
        </div>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded ${className}`}
        title="Inquiry responded to or qualified within target SLA"
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>SLA Met</span>
      </span>
    );
  }

  // Case 2: SLA Overdue past 15 minutes!
  if (remainingMs <= 0) {
    const overdueMins = Math.floor(Math.abs(remainingMs) / 60000);

    if (variant === 'detailed') {
      return (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse ring-1 ring-rose-500/40 shadow-sm ${className}`}
          title="Lead has exceeded 15 minutes in New status without a response"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
          <span>
            SLA Overdue - Priority Follow-Up Required!
            {overdueMins > 0 ? ` (${overdueMins}m overdue)` : ''}
          </span>
        </div>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/50 px-2 py-0.5 rounded-md animate-pulse ring-1 ring-rose-500/40 ${className}`}
        title={`Exceeded 15 min SLA target by ${overdueMins} minutes! Immediate follow-up required.`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
        <span className="truncate max-w-[170px] sm:max-w-none">
          SLA Overdue - Priority Follow-Up Required!
        </span>
      </span>
    );
  }

  // Case 3: Live countdown ticking down towards 15 min deadline
  const totalSecs = Math.max(0, Math.floor(remainingMs / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const isUrgent = mins < 5;

  if (variant === 'detailed') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold ${
          isUrgent
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
            : 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
        } ${className}`}
        title="15-minute response target to maximize inquiry conversion"
      >
        {isUrgent ? (
          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        )}
        <span>
          15 Min SLA Target · Respond in <strong className="font-mono">{timeFormatted}</strong> mins
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
        isUrgent
          ? 'bg-amber-500/15 border border-amber-500/35 text-amber-300 ring-1 ring-amber-500/25 animate-pulse'
          : 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
      } ${className}`}
      title="15 Min SLA Target for inbound inquiry"
    >
      {isUrgent ? (
        <Flame className="w-2.5 h-2.5 text-amber-400 shrink-0" />
      ) : (
        <Clock className="w-2.5 h-2.5 text-sky-400 shrink-0" />
      )}
      <span>Respond in {timeFormatted}m</span>
    </span>
  );
};
