import { Lead, ChannelType, LeadStatus } from '../types/crm';

export type DateRangePreset = 'fy_2026_27' | 'this_month' | 'last_30_days' | 'custom' | 'all';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface CsvExportOptions {
  scope: 'all' | 'current_filtered' | 'channel';
  selectedChannel?: string;
  dateRange: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  statusFilter: 'all' | LeadStatus;
}

/**
 * Format Date as YYYY-MM-DD in local time
 */
export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return formatDateYMD(new Date());
}

/**
 * Compute start and end dates for a preset
 */
export function getPresetDates(preset: DateRangePreset): { startDate: string; endDate: string } {
  const todayStr = getTodayDateString();
  const now = new Date();

  switch (preset) {
    case 'fy_2026_27':
      // Indian Financial Year 2026-27: 1 April 2026 to Till Date
      return {
        startDate: '2026-04-01',
        endDate: todayStr,
      };
    case 'this_month': {
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: formatDateYMD(firstOfMonth),
        endDate: todayStr,
      };
    }
    case 'last_30_days': {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        startDate: formatDateYMD(thirtyDaysAgo),
        endDate: todayStr,
      };
    }
    case 'all':
      return {
        startDate: '',
        endDate: '',
      };
    case 'custom':
    default:
      return {
        startDate: '2026-04-01',
        endDate: todayStr,
      };
  }
}

/**
 * Format date for dynamic filename (e.g., 01Apr2026)
 */
export function formatDateTag(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[monthIdx] || 'M';
  return `${day}${month}${year}`;
}

/**
 * Generate clear dynamic filename reflecting range
 * (e.g., "CRM_Leads_Report_01Apr2026_TillDate.csv")
 */
export function getExportFilename(
  preset: DateRangePreset,
  startDate?: string,
  endDate?: string
): string {
  if (preset === 'fy_2026_27') {
    return 'CRM_Leads_Report_01Apr2026_TillDate.csv';
  }
  if (preset === 'this_month') {
    const startTag = startDate ? formatDateTag(startDate) : 'MonthStart';
    return `CRM_Leads_Report_${startTag}_TillDate.csv`;
  }
  if (preset === 'last_30_days') {
    const startTag = startDate ? formatDateTag(startDate) : '30DaysAgo';
    const endTag = endDate ? formatDateTag(endDate) : 'Today';
    return `CRM_Leads_Report_Last30Days_${startTag}_to_${endTag}.csv`;
  }
  if (preset === 'custom' && startDate && endDate) {
    const startTag = formatDateTag(startDate);
    const endTag = formatDateTag(endDate);
    return `CRM_Leads_Report_${startTag}_to_${endTag}.csv`;
  }
  return `CRM_Leads_Report_AllTime_${formatDateTag(getTodayDateString())}.csv`;
}

/**
 * Filter leads based on Date Range
 */
export function filterLeadsByDateRange(
  leads: Lead[],
  dateRange: { preset: DateRangePreset; startDate?: string; endDate?: string }
): Lead[] {
  if (dateRange.preset === 'all' && !dateRange.startDate && !dateRange.endDate) {
    return leads;
  }

  let startBoundMs: number | null = null;
  let endBoundMs: number | null = null;

  if (dateRange.startDate) {
    const s = new Date(`${dateRange.startDate}T00:00:00`);
    if (!isNaN(s.getTime())) startBoundMs = s.getTime();
  }

  if (dateRange.endDate) {
    const e = new Date(`${dateRange.endDate}T23:59:59.999`);
    if (!isNaN(e.getTime())) endBoundMs = e.getTime();
  }

  return leads.filter((lead) => {
    const ts = lead.receivedTimestamp;
    if (startBoundMs !== null && ts < startBoundMs) return false;
    if (endBoundMs !== null && ts > endBoundMs) return false;
    return true;
  });
}

/**
 * Filter leads based on selected export options
 */
export function filterLeadsForExport(
  allLeads: Lead[],
  currentFilteredLeads: Lead[],
  options: CsvExportOptions
): Lead[] {
  let list = options.scope === 'current_filtered' ? [...currentFilteredLeads] : [...allLeads];

  // Specific channel filter if scope is 'channel'
  if (options.scope === 'channel' && options.selectedChannel && options.selectedChannel !== 'all') {
    list = list.filter((l) => l.channel === options.selectedChannel);
  }

  // Status filter
  if (options.statusFilter !== 'all') {
    list = list.filter((l) => l.status === options.statusFilter);
  }

  // Determine dates for filter
  const dates =
    options.dateRange === 'custom'
      ? { startDate: options.customStartDate, endDate: options.customEndDate }
      : getPresetDates(options.dateRange);

  return filterLeadsByDateRange(list, {
    preset: options.dateRange,
    startDate: dates.startDate,
    endDate: dates.endDate,
  });
}

/**
 * Helper to escape CSV cells
 */
function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/\r\n/g, ' ').replace(/[\n\r]/g, ' ').replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Format channel name cleanly for reports
 */
function formatChannelName(channel: ChannelType): string {
  switch (channel) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'indiamart':
      return 'IndiaMART';
    case 'email':
      return 'Email';
    case 'facebook':
      return 'Meta Facebook';
    case 'instagram':
      return 'Meta Instagram';
    case 'youtube':
      return 'YouTube';
    case 'manual':
      return 'Manual';
    default:
      return channel;
  }
}

/**
 * Format status cleanly for reports
 */
function formatStatusName(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'converted':
      return 'Converted';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}

/**
 * Generate CSV string from leads array with exact columns specified:
 * - Lead Received Date & Time
 * - Customer Name, Company, Phone (+91), Email
 * - Source Channel (WhatsApp, IndiaMART, Email, Meta, YouTube, Manual)
 * - Current Work Status (New, In Progress, Converted, Closed)
 * - Deal Value (formatted in INR ₹)
 * - Assigned Sales Representative
 * - AI Lead Score & Sentiment
 * - SLA Response Status (Met / Overdue)
 * - Internal Rep Notes / Work Progress Log
 */
export function generateLeadsCsv(leads: Lead[]): string {
  const headers = [
    'Lead Received Date & Time',
    'Customer Name',
    'Company',
    'Phone (+91)',
    'Email',
    'Source Channel',
    'Current Work Status',
    'Deal Value (INR)',
    'Assigned Sales Representative',
    'AI Lead Score & Sentiment',
    'SLA Response Status',
    'Internal Rep Notes / Work Progress Log',
  ];

  const now = Date.now();

  const rows = leads.map((lead) => {
    // 1. Lead Received Date & Time: YYYY-MM-DD HH:mm:ss
    const d = new Date(lead.receivedTimestamp);
    const receivedFormatted = !isNaN(d.getTime())
      ? `${formatDateYMD(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      : lead.receivedAt;

    // 2. Customer Name
    const customerName = lead.contactName || 'N/A';

    // 3. Company
    const company = lead.company || 'Individual / Retail';

    // 4. Phone (+91)
    const phone = lead.phone || 'N/A';

    // 5. Email
    const email = lead.email || 'N/A';

    // 6. Source Channel
    const channelFormatted = formatChannelName(lead.channel);

    // 7. Current Work Status
    const statusFormatted = formatStatusName(lead.status);

    // 8. Deal Value (INR ₹)
    const dealValue = lead.estimatedValue || '₹0';

    // 9. Assigned Sales Representative
    const assignedRep = lead.assignedAgent?.name || 'Unassigned';

    // 10. AI Lead Score & Sentiment
    const scoreAndSentiment = `${lead.leadScore.toUpperCase()} (${lead.sentiment.replace(/_/g, ' ').toUpperCase()})`;

    // 11. SLA Response Status (Met / Overdue)
    const hasReplied = lead.conversation?.some((m) => m.sender === 'agent');
    const elapsedMinutes = (now - lead.receivedTimestamp) / (60 * 1000);
    let slaStatus = 'Met';
    if (lead.status === 'new' && !hasReplied) {
      if (elapsedMinutes > 15) {
        slaStatus = 'Overdue';
      } else {
        const remaining = Math.max(1, Math.round(15 - elapsedMinutes));
        slaStatus = `Pending (${remaining}m left)`;
      }
    } else {
      slaStatus = 'Met';
    }

    // 12. Internal Rep Notes / Work Progress Log
    const notesLog =
      lead.notes && lead.notes.length > 0
        ? lead.notes
            .map((n) => `[${n.author || 'Rep'} | ${n.timestamp || 'Logged'}]: ${n.text}`)
            .join(' | ')
        : 'No notes logged';

    return [
      escapeCsvCell(receivedFormatted),
      escapeCsvCell(customerName),
      escapeCsvCell(company),
      escapeCsvCell(phone),
      escapeCsvCell(email),
      escapeCsvCell(channelFormatted),
      escapeCsvCell(statusFormatted),
      escapeCsvCell(dealValue),
      escapeCsvCell(assignedRep),
      escapeCsvCell(scoreAndSentiment),
      escapeCsvCell(slaStatus),
      escapeCsvCell(notesLog),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Trigger download of CSV in browser with UTF-8 BOM
 */
export function downloadCsv(filename: string, csvContent: string): void {
  // UTF-8 BOM (\uFEFF) ensures Excel and Sheets open Hindi / INR Rupee (₹) without garbling
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate TSV (Tab-separated values) for instant copy-paste into Excel/Google Sheets
 */
export function copyTsvToClipboard(leads: Lead[]): Promise<void> {
  const headers = [
    'Received Date & Time',
    'Customer Name',
    'Company',
    'Phone',
    'Email',
    'Channel',
    'Status',
    'Deal Value',
    'Assigned Rep',
    'AI Score & Sentiment',
    'SLA Status',
    'Notes / Progress Log',
  ];

  const now = Date.now();

  const rows = leads.map((l) => {
    const d = new Date(l.receivedTimestamp);
    const dateStr = !isNaN(d.getTime()) ? formatDateYMD(d) : l.receivedAt;
    const hasReplied = l.conversation?.some((m) => m.sender === 'agent');
    const elapsedMinutes = (now - l.receivedTimestamp) / (60 * 1000);
    const sla =
      l.status !== 'new' || hasReplied
        ? 'Met'
        : elapsedMinutes > 15
        ? 'Overdue'
        : 'Pending';

    const notes =
      l.notes && l.notes.length > 0
        ? l.notes.map((n) => `[${n.author}]: ${n.text}`).join('; ')
        : 'None';

    return [
      dateStr,
      l.contactName,
      l.company || '',
      l.phone,
      l.email,
      formatChannelName(l.channel),
      formatStatusName(l.status),
      l.estimatedValue || '',
      l.assignedAgent?.name || '',
      `${l.leadScore.toUpperCase()} (${l.sentiment.toUpperCase()})`,
      sla,
      notes.replace(/[\t\n\r]/g, ' '),
    ];
  });

  const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  return navigator.clipboard.writeText(tsv);
}
