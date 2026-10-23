import React, { useState, useRef } from 'react';
import { Lead, ChannelType } from '../types/crm';
import { X, Upload, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { analyzeInquiryContent, analyzeInquiryWithGemini } from '../services/aiEngine';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (leads: Lead[]) => void;
  assignedAgentName: string;
}

interface ParsedLeadRow {
  contactName: string;
  phone: string;
  email: string;
  company: string;
  channel: ChannelType;
  message: string;
  estimatedValue?: string;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
  assignedAgentName,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Simple CSV parser supporting quotes
  const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map((col) => col.replace(/^"(.*)"$/, '$1').trim());
    };

    const headerCols = parseLine(lines[0]);
    const dataRows = lines.slice(1).map(parseLine);
    return { headers: headerCols, rows: dataRows };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
      setError('Please upload a valid .CSV file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { headers: detectedHeaders, rows } = parseCSV(content);

        if (rows.length === 0) {
          setError('CSV file is empty or contains only headers.');
          return;
        }

        setHeaders(detectedHeaders);

        // Find column indices by common name matching
        const findColIndex = (keywords: string[]) => {
          return detectedHeaders.findIndex((h) =>
            keywords.some((kw) => h.toLowerCase().includes(kw))
          );
        };

        const nameIdx = findColIndex(['name', 'contact', 'customer', 'person']);
        const phoneIdx = findColIndex(['phone', 'mobile', 'cell', 'whatsapp', 'contact_no']);
        const emailIdx = findColIndex(['email', 'mail']);
        const companyIdx = findColIndex(['company', 'business', 'org', 'firm']);
        const channelIdx = findColIndex(['channel', 'source', 'platform']);
        const messageIdx = findColIndex(['inquiry', 'message', 'note', 'requirement', 'query', 'details']);
        const valueIdx = findColIndex(['value', 'amount', 'budget', 'price', 'deal']);

        const parsed: ParsedLeadRow[] = rows.map((cols, idx) => {
          const rawChannel = channelIdx >= 0 ? cols[channelIdx]?.toLowerCase() : 'manual';
          let channel: ChannelType = 'manual';
          if (rawChannel.includes('what') || rawChannel.includes('wa')) channel = 'whatsapp';
          else if (rawChannel.includes('india')) channel = 'indiamart';
          else if (rawChannel.includes('insta')) channel = 'instagram';
          else if (rawChannel.includes('face') || rawChannel.includes('fb')) channel = 'facebook';
          else if (rawChannel.includes('you') || rawChannel.includes('yt')) channel = 'youtube';
          else if (rawChannel.includes('mail')) channel = 'email';

          return {
            contactName: (nameIdx >= 0 ? cols[nameIdx] : cols[0]) || `Lead #${idx + 1}`,
            phone: phoneIdx >= 0 ? cols[phoneIdx] : '+91 98000 00000',
            email: emailIdx >= 0 ? cols[emailIdx] : 'inquiry@example.com',
            company: companyIdx >= 0 ? cols[companyIdx] : 'Commercial Account',
            channel,
            message: messageIdx >= 0 ? cols[messageIdx] : 'Commercial inquiry received via bulk import.',
            estimatedValue: valueIdx >= 0 ? cols[valueIdx] : undefined,
          };
        });

        setParsedRows(parsed);
      } catch (err) {
        setError('Failed to parse CSV file. Please verify format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDownloadSampleCSV = () => {
    const sampleContent =
      `Contact Name,Company,Phone,Email,Channel,Inquiry Details,Estimated Value\n` +
      `Vikram Malhotra,Malhotra Logistics,+91 98111 22334,vikram@malhotra.com,whatsapp,"Need urgent quotation for 30 GPS fleet tracking units with installation support ASAP.",₹450000\n` +
      `Sunita Sharma,Apex Health Solutions,+91 98222 33445,sunita@apexhealth.in,indiamart,"Inquiry for bulk supply of medical grade PPE kits (5000 pcs). Please dispatch catalog.",₹850000\n` +
      `Anil Deshmukh,TechSphere Labs,+91 98333 44556,anil@techsphere.io,email,"Looking for enterprise API integration credentials and multi-tenant SLA parameters.",₹1200000\n`;

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_omnisync_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const importedLeads: Lead[] = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];

      // Analyze inquiry with AI engine
      const aiResult = analyzeInquiryContent(
        row.contactName,
        row.company,
        row.channel,
        row.message
      );

      const newLead: Lead = {
        id: `lead-import-${Date.now()}-${i}`,
        contactName: row.contactName,
        email: row.email || `${row.contactName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: row.phone || '+91 98000 00000',
        company: row.company || 'Commercial Lead',
        channel: row.channel,
        channelDetail: `Bulk CSV Import · ${row.channel.toUpperCase()}`,
        receivedAt: 'Just now',
        receivedTimestamp: Date.now() - i * 60 * 1000,
        message: row.message,
        status: 'new',
        leadScore: aiResult.leadScore,
        scoreReason: aiResult.scoreReason,
        sentiment: aiResult.sentiment,
        summary: aiResult.summary,
        suggestedReply: aiResult.suggestedReply,
        assignedAgent: {
          name: assignedAgentName || 'Marcus Vance',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: 'm.vance@omnisync.io',
          role: 'Enterprise Sales Lead',
        },
        conversation: [
          {
            id: `msg-import-${Date.now()}-${i}`,
            sender: 'customer',
            senderName: row.contactName,
            text: row.message,
            timestamp: 'Just now',
            channel: row.channel,
          },
        ],
        notes: [
          {
            id: `note-import-${Date.now()}-${i}`,
            author: 'CSV Bulk Ingestion',
            text: `Imported via bulk CSV upload with automated AI score '${aiResult.leadScore.toUpperCase()}'.`,
            timestamp: 'Just now',
          },
        ],
        estimatedValue: row.estimatedValue || aiResult.estimatedValue,
        tags: aiResult.tags,
        unread: true,
      };

      importedLeads.push(newLead);
      setProgress(Math.round(((i + 1) / parsedRows.length) * 100));
    }

    onImportLeads(importedLeads);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Import Leads via CSV</h3>
              <p className="text-xs text-slate-400">
                Bulk upload inquiries from IndiaMART, Meta Ads, Excel, or Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 bg-slate-950/50 hover:bg-indigo-950/20 rounded-xl p-8 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-3.5 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click to select or drag & drop CSV file'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supports comma-separated files (.csv) up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Download Sample & Tip */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Need a template to test?</span>
            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV Template</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Detected {parsedRows.length} Leads (Preview first 3 rows):
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Triage
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                      <th className="p-2.5 px-3">Contact</th>
                      <th className="p-2.5 px-3">Company</th>
                      <th className="p-2.5 px-3">Channel</th>
                      <th className="p-2.5 px-3">Inquiry Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedRows.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-2.5 px-3 font-medium text-white">{row.contactName}</td>
                        <td className="p-2.5 px-3 text-slate-400">{row.company}</td>
                        <td className="p-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-300">
                            {row.channel}
                          </span>
                        </td>
                        <td className="p-2.5 px-3 max-w-[200px] truncate text-slate-400">
                          {row.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2 p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-xs">
              <div className="flex justify-between text-indigo-300">
                <span>Running AI intent scoring & indexing leads...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {parsedRows.length > 0 ? `${parsedRows.length} leads ready to import` : 'No file selected'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parsedRows.length === 0 || isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Importing Leads...' : `Import ${parsedRows.length} Leads`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
