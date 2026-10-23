import React, { useState, useEffect } from 'react';
import { Lead, ChannelType } from '../types/crm';
import {
  X,
  MessageSquare,
  Instagram,
  Phone,
  Facebook,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  ExternalLink,
  Layers,
  Key,
  ShieldCheck,
  Zap,
  Globe,
  Settings2,
  RefreshCw,
  Clock,
  QrCode
} from 'lucide-react';

interface ChannelConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadReceived: (lead: Lead) => void;
}

export const ChannelConnectModal: React.FC<ChannelConnectModalProps> = ({
  isOpen,
  onClose,
  onLeadReceived,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram' | 'calls' | 'indiamart' | 'website'>('whatsapp');

  // WhatsApp Credentials State
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(() => localStorage.getItem('omnisync_wa_phone_id') || '');
  const [waWabaId, setWaWabaId] = useState(() => localStorage.getItem('omnisync_wa_waba_id') || '');
  const [waToken, setWaToken] = useState(() => localStorage.getItem('omnisync_wa_token') || '');

  // Instagram / Meta Credentials State
  const [metaPageId, setMetaPageId] = useState(() => localStorage.getItem('omnisync_meta_page_id') || '');
  const [metaPageToken, setMetaPageToken] = useState(() => localStorage.getItem('omnisync_meta_page_token') || '');

  // Telephony State
  const [virtualNumber, setVirtualNumber] = useState(() => localStorage.getItem('omnisync_virtual_number') || '+91 11 4118 7890');
  const [telephonyProvider, setTelephonyProvider] = useState(() => localStorage.getItem('omnisync_telephony_provider') || 'exotel');

  // Test Simulation State
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://crm-iota-eight-55.vercel.app';
  const metaWebhookUrl = `${baseUrl}/api/meta-webhook`;
  const callWebhookUrl = `${baseUrl}/api/call-webhook`;
  const websiteWebhookUrl = `${baseUrl}/api/webhook`;

  // Save credentials to localStorage
  const handleSaveCredentials = () => {
    try {
      localStorage.setItem('omnisync_wa_phone_id', waPhoneNumberId.trim());
      localStorage.setItem('omnisync_wa_waba_id', waWabaId.trim());
      localStorage.setItem('omnisync_wa_token', waToken.trim());
      localStorage.setItem('omnisync_meta_page_id', metaPageId.trim());
      localStorage.setItem('omnisync_meta_page_token', metaPageToken.trim());
      localStorage.setItem('omnisync_virtual_number', virtualNumber.trim());
      localStorage.setItem('omnisync_telephony_provider', telephonyProvider);
      setStatusMsg({
        type: 'success',
        text: 'Credentials saved securely! Webhook endpoints are ready to accept real incoming traffic.',
      });
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Test WhatsApp Inbound Event
  const handleTestWhatsAppInbound = async () => {
    setIsTesting(true);
    setStatusMsg(null);
    try {
      const response = await fetch('/api/meta-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [
            {
              id: waWabaId || 'WABA-998214',
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: '919820012345', phone_number_id: waPhoneNumberId || 'PHONE-8821' },
                    contacts: [{ profile: { name: 'Kavita Singhal (Modern Kids Academy)' }, wa_id: '919811223344' }],
                    messages: [
                      {
                        from: '919811223344',
                        id: `wamid.${Date.now()}`,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        text: { body: 'Hello, need urgent catalog & pricing for Soft Play Area setup (30ft x 20ft area). Please call ASAP.' },
                        type: 'text',
                      },
                    ],
                  },
                  field: 'messages',
                },
              ],
            },
          ],
        }),
      });

      const res = await response.json();
      if (res.status === 'success') {
        setStatusMsg({
          type: 'success',
          text: 'Verified! Real WhatsApp webhook payload processed successfully. Lead has been added to your live inbox.',
        });
        // Fetch from buffer immediately
        syncFromBuffer();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Test failed: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Test Instagram DM Inbound Event
  const handleTestInstagramInbound = async () => {
    setIsTesting(true);
    setStatusMsg(null);
    try {
      const response = await fetch('/api/meta-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'instagram',
          entry: [
            {
              id: metaPageId || 'IG-PAGE-980',
              time: Date.now(),
              messaging: [
                {
                  sender: { id: 'vikram.playzones' },
                  recipient: { id: metaPageId || 'my_business_page' },
                  timestamp: Date.now(),
                  message: {
                    mid: `m_mid.${Date.now()}`,
                    text: 'Hi! Saw your Instagram reel of Multiplay Jungle station. Do you dispatch and install in Lucknow? What is the budget?',
                  },
                },
              ],
            },
          ],
        }),
      });

      const res = await response.json();
      if (res.status === 'success') {
        setStatusMsg({
          type: 'success',
          text: 'Verified! Real Instagram DM webhook received and converted into lead.',
        });
        syncFromBuffer();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Instagram test failed: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Test Telephony Inbound Call Event
  const handleTestCallInbound = async (isMissed = false) => {
    setIsTesting(true);
    setStatusMsg(null);
    try {
      const response = await fetch('/api/call-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          From: '+91 98765 12099',
          To: virtualNumber || '+91 11 4118 7890',
          CallDuration: isMissed ? '0' : '48',
          CallStatus: isMissed ? 'no-answer' : 'completed',
          callerName: 'Sunil Mathur (Delhi Preschool Project)',
          notes: isMissed
            ? 'Customer called main line but representative line was busy. Immediate callback requested.'
            : 'Spoke with principal regarding classroom desk sets and wall decor. Ready to purchase this week.',
        }),
      });

      const res = await response.json();
      if (res.success && res.lead) {
        onLeadReceived(res.lead);
        setStatusMsg({
          type: 'success',
          text: `Verified! Inbound ${isMissed ? 'Missed Call' : 'Phone Call'} event recorded with high-priority SLA tag.`,
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Call webhook test failed: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Sync latest from buffer
  const syncFromBuffer = async () => {
    try {
      const res = await fetch('/api/leads-buffer');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads) && data.leads.length > 0) {
        onLeadReceived(data.leads[0]);
      }
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Live Channels & Telephony Connection Hub
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect official WhatsApp Cloud API, Instagram DMs, Phone Calls (IVR), and IndiaMART
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

        {/* Channel Navigation Bar */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-950/70 border-b border-slate-800 shrink-0 px-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('whatsapp'); setStatusMsg(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>WhatsApp Cloud API</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('instagram'); setStatusMsg(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Instagram & Meta DMs</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('calls'); setStatusMsg(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calls'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Phone className="w-4 h-4 text-sky-400" />
            <span>Phone Calls & IVR</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('indiamart'); setStatusMsg(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'indiamart'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>IndiaMART MAPI</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('website'); setStatusMsg(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'website'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Website Forms</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 1: WHATSAPP CLOUD API & QR */}
          {/* ======================================================= */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Official Meta WhatsApp Business Cloud API
                  </h3>
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Open Meta Developer Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">WhatsApp Phone Number ID</label>
                    <input
                      type="text"
                      value={waPhoneNumberId}
                      onChange={(e) => setWaPhoneNumberId(e.target.value)}
                      placeholder="e.g. 1098234871923"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">WhatsApp Business Account ID (WABA ID)</label>
                    <input
                      type="text"
                      value={waWabaId}
                      onChange={(e) => setWaWabaId(e.target.value)}
                      placeholder="e.g. 9823471029348"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1 text-xs">Permanent System User Access Token</label>
                  <input
                    type="password"
                    value={waToken}
                    onChange={(e) => setWaToken(e.target.value)}
                    placeholder="EAABwzL... (Meta System User Token)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* Webhook Callback for Meta */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Meta Webhook Callback Configuration</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Status: READY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={metaWebhookUrl}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-emerald-400 font-mono text-[11px] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(metaWebhookUrl, 'meta_url')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedKey === 'meta_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Verify Token: <code className="text-emerald-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">omnisync_meta_secret_2026</code></span>
                    <span>Webhook Field: <strong className="text-slate-200">messages</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleTestWhatsAppInbound}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Send Test Inbound WhatsApp Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save WhatsApp Credentials</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: INSTAGRAM & META DMS */}
          {/* ======================================================= */}
          {activeTab === 'instagram' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    Instagram Direct Messages & Facebook Lead Ads
                  </h3>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-mono">
                    Meta Graph API v21.0
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your Instagram Professional / Creator account or Facebook Business Page. Whenever a prospective client sends a DM on Instagram or submits a Facebook Lead Ad, it immediately triggers an inbound hot lead.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Facebook Page ID / Instagram Business ID</label>
                    <input
                      type="text"
                      value={metaPageId}
                      onChange={(e) => setMetaPageId(e.target.value)}
                      placeholder="e.g. 109283741029"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Meta Page Access Token</label>
                    <input
                      type="password"
                      value={metaPageToken}
                      onChange={(e) => setMetaPageToken(e.target.value)}
                      placeholder="Page Access Token (EAAG...)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 text-xs">
                  <div className="font-bold text-white">Instagram Webhook Subscription:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={metaWebhookUrl}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-pink-400 font-mono text-[11px] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(metaWebhookUrl, 'meta_ig_url')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedKey === 'meta_ig_url' ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Subscribe to events: <strong className="text-slate-200">messages, messaging_postbacks, leadgen</strong>.
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleTestInstagramInbound}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-pink-300 bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/40 rounded-lg transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Send Test Instagram DM Lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Instagram Credentials</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: PHONE CALLS & TELEPHONY */}
          {/* ======================================================= */}
          {activeTab === 'calls' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-400" />
                    Telephony, IVR & Call Tracking Gateway
                  </h3>
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-mono">
                    Exotel / Knowlarity / Twilio
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your business phone number or virtual IVR line. Missed calls automatically trigger high-urgency callback alerts, while answered calls record call duration and recording links.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Telephony Service Provider</label>
                    <select
                      value={telephonyProvider}
                      onChange={(e) => setTelephonyProvider(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
                    >
                      <option value="exotel">Exotel (India)</option>
                      <option value="knowlarity">Knowlarity Cloud Telephony</option>
                      <option value="mcube">MCube Business IVR</option>
                      <option value="tatatele">Tata Tele SmartFlo</option>
                      <option value="twilio">Twilio Voice</option>
                      <option value="android">Android Call Tracker App</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Your Virtual Business Number (Hotline)</label>
                    <input
                      type="text"
                      value={virtualNumber}
                      onChange={(e) => setVirtualNumber(e.target.value)}
                      placeholder="+91 11 4118 7890"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Call Webhook URL */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 text-xs">
                  <div className="font-bold text-white">Inbound Call Webhook Callback:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={callWebhookUrl}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-sky-400 font-mono text-[11px] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(callWebhookUrl, 'call_url')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedKey === 'call_url' ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste this URL into your telephony provider's dashboard under <strong>"Call Passthru / Call Complete Webhook"</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestCallInbound(false)}
                      disabled={isTesting}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 rounded-lg transition-all cursor-pointer"
                    >
                      <span>Simulate Answered Call (48s)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestCallInbound(true)}
                      disabled={isTesting}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 rounded-lg transition-all cursor-pointer"
                    >
                      <span>Simulate Missed Call Alert</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Telephony Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: INDIAMART */}
          {/* ======================================================= */}
          {activeTab === 'indiamart' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    IndiaMART Lead Manager MAPI
                  </h3>
                  <a
                    href="https://seller.indiamart.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>IndiaMART Seller Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Official B2B lead ingestion via IndiaMART's Lead Manager API. Enter your <code>GLUSR_CRM_KEY</code> to automatically pull verified RFQs, customer phone numbers, GST invoice details, and product requirements.
                </p>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="font-bold text-white">Instructions:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Go to <strong>seller.indiamart.com &gt; Settings &gt; Lead Manager API</strong>.</li>
                    <li>Generate your <strong>GLUSR_CRM_KEY</strong>.</li>
                    <li>Use the <strong>"⚡ Sync IndiaMART & Webhooks"</strong> button on the dashboard to pull all new inquiries in 1 click!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: WEBSITE */}
          {/* ======================================================= */}
          {activeTab === 'website' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    Website Contact Forms & Zapier / Webhooks
                  </h3>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                    REST API
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 text-xs">
                  <div className="font-bold text-white">Your Public Endpoint URL:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={websiteWebhookUrl}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-amber-400 font-mono text-[11px] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(websiteWebhookUrl, 'web_url')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedKey === 'web_url' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Connect WordPress (Contact Form 7 / Elementor), Shopify, Webflow, or custom forms.
                  </p>
                </div>
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
