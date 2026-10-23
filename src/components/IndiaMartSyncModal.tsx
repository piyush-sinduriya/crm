import React, { useState, useEffect } from 'react';
import { Lead } from '../types/crm';
import {
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Globe,
  Radio,
  ExternalLink,
  Layers,
  ArrowRight,
  Database,
  Code2
} from 'lucide-react';

interface IndiaMartSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (leads: Lead[]) => void;
}

export const IndiaMartSyncModal: React.FC<IndiaMartSyncModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
}) => {
  const [activeTab, setActiveTab] = useState<'indiamart' | 'webhook'>('indiamart');

  // IndiaMART State
  const [crmKey, setCrmKey] = useState<string>(() => {
    return localStorage.getItem('omnisync_indiamart_crm_key') || '';
  });
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetchedLeads, setFetchedLeads] = useState<Lead[]>([]);

  // Webhook State
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testLeadName, setTestLeadName] = useState('Ramesh Sharma (Greenfield Play School)');
  const [testRequirement, setTestRequirement] = useState('Need quotation for 2 units of Multiplay station and indoor EVA foam flooring.');

  const liveWebhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook`
    : 'https://crm-iota-eight-55.vercel.app/api/webhook';

  useEffect(() => {
    if (crmKey) {
      try {
        localStorage.setItem('omnisync_indiamart_crm_key', crmKey.trim());
      } catch (e) {
        // ignore
      }
    }
  }, [crmKey]);

  if (!isOpen) return null;

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(liveWebhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // Sync leads from IndiaMART
  const handleFetchIndiaMart = async () => {
    if (!crmKey.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your IndiaMART GLUSR_CRM_KEY. (Find it in your IndiaMART Seller Panel under Settings > Lead Manager API)',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setFetchedLeads([]);

    try {
      const response = await fetch(`/api/indiamart-sync?crmKey=${encodeURIComponent(crmKey.trim())}&days=${dateRange}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch leads from IndiaMART');
      }

      const received = Array.isArray(data.leads) ? data.leads : [];
      setFetchedLeads(received);

      if (received.length === 0) {
        setStatusMessage({
          type: 'success',
          text: 'IndiaMART connected successfully, but no new inquiries were found for the selected time range.',
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Found ${received.length} live buyer inquiries from IndiaMART! Review them below or click "Import to CRM".`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Could not connect to IndiaMART. Please check your CRM key.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (fetchedLeads.length === 0) return;
    onImportLeads(fetchedLeads);
    onClose();
  };

  // Send test inbound webhook
  const handleSendTestWebhook = async () => {
    setIsSendingTest(true);
    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testLeadName,
          phone: '+91 98201 44590',
          email: 'ramesh.sharma@greenfieldschool.org',
          company: 'Greenfield International School',
          message: testRequirement,
          channel: 'website',
          budget: '₹4,50,000',
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.lead) {
        onImportLeads([resData.lead]);
        setStatusMessage({
          type: 'success',
          text: 'Test inquiry sent! Real webhook received and added directly to your CRM leads.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to dispatch test webhook: ' + err.message,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Live Lead Integration Gateway
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME API
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect official IndiaMART MAPI or point your Website / WhatsApp webhooks here
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800/80 shrink-0 px-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('indiamart');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'indiamart'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>IndiaMART Lead Manager MAPI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('webhook');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'webhook'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website / WhatsApp Webhook URL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: INDIAMART MAPI */}
          {activeTab === 'indiamart' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    IndiaMART GLUSR_CRM_KEY
                  </label>
                  <a
                    href="https://seller.indiamart.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Get Key from IndiaMART Seller Panel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="text"
                  value={crmKey}
                  onChange={(e) => setCrmKey(e.target.value)}
                  placeholder="e.g. mapi_crm_key_xxxxxxxxx..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Date Range:</span>
                    <select
                      value={dateRange}
                      onChange={(e: any) => setDateRange(e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 90 Days</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchIndiaMart}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Connecting to IndiaMART...' : 'Sync Inquiries Now'}</span>
                  </button>
                </div>
              </div>

              {/* Guide card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2 text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  How to get your IndiaMART Key:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                  <li>Log in to your <strong>IndiaMART Seller Portal</strong> (seller.indiamart.com).</li>
                  <li>Click on <strong>Settings &gt; Lead Manager API</strong>.</li>
                  <li>Copy your <strong>CRM Key (GLUSR_CRM_KEY)</strong> and paste it above.</li>
                  <li>All incoming RFQs and buyer phone numbers will be fetched and converted into scored leads!</li>
                </ol>
              </div>

              {/* Fetched Leads Preview */}
              {fetchedLeads.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Found {fetchedLeads.length} Inquiries Ready to Import:
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      Import All {fetchedLeads.length} into CRM
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {fetchedLeads.map((ld) => (
                      <div
                        key={ld.id}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{ld.contactName}</div>
                          <div className="text-slate-400 text-[11px]">{ld.company} • {ld.phone}</div>
                          <div className="text-slate-300 text-[11px] truncate max-w-md mt-0.5">{ld.message}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {ld.estimatedValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEBHOOK */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Your Live Public Webhook Endpoint
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    HTTP POST
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveWebhookUrl}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-emerald-400 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Put this URL into your <strong>WordPress Contact Form 7, Elementor Forms, Webflow, Shopify, or WhatsApp Gateway (Wati / Interakt)</strong>. Any inquiry submitted will instantly land in your CRM!
                </p>
              </div>

              {/* Test Lead Dispatcher */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    Test Real Webhook Lead Dispatch
                  </h4>
                  <span className="text-[11px] text-slate-400">Simulate incoming real customer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Customer / School Name</span>
                    <input
                      type="text"
                      value={testLeadName}
                      onChange={(e) => setTestLeadName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Inquiry Requirement</span>
                    <input
                      type="text"
                      value={testRequirement}
                      onChange={(e) => setTestRequirement(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestWebhook}
                  disabled={isSendingTest}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-bounce' : ''}`} />
                  <span>{isSendingTest ? 'Sending Webhook...' : 'Send Live Test Lead to Webhook'}</span>
                </button>
              </div>

              {/* Code snippet */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    Sample Website Form JSON Payload
                  </span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`// POST ${liveWebhookUrl}
{
  "name": "Sunil Verma",
  "phone": "+91 98200 12345",
  "email": "sunil@schooldecor.in",
  "company": "Little Angels Play Academy",
  "message": "Need pricing for Jungle theme classroom furniture & slides",
  "channel": "website"
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
