import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, ChannelType, InternalNote, MessageTemplate, UserRole } from '../types/crm';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';
import { GstQuotationModal } from './GstQuotationModal';
import { SlaCountdownBadge } from './SlaCountdownBadge';
import { SendAutomatedModal } from './SendAutomatedModal';
import {
  Flame,
  Sun,
  Snowflake,
  Sparkles,
  Send,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  FileText,
  Tag,
  Copy,
  Check,
  FileSpreadsheet,
  ExternalLink,
  Zap,
  Trash2,
  Lock,
} from 'lucide-react';
import { generateQuickReply, analyzeInquiryWithGemini, ReplyTone } from '../services/aiEngine';
import { getStoredGeminiApiKey } from '../utils/storage';

interface LeadDetailProps {
  lead: Lead;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onUpdateAgent: (leadId: string, agentName: string) => void;
  onSendReply: (leadId: string, replyText: string) => void;
  onAddNote: (leadId: string, noteText: string) => void;
  availableAgents: Array<{ name: string; avatar: string; email: string }>;
  currencySymbol?: string;
  templates?: MessageTemplate[];
  onDispatchAutomatedMessage?: (
    leadId: string,
    template: MessageTemplate,
    channel: ChannelType,
    renderedBody: string,
    renderedSubject?: string
  ) => void;
  onTriggerSlaEscalation?: (leadId: string) => void;
  currentRole?: UserRole;
  onDeleteLead?: (leadId: string) => void;
  onRestrictedAction?: (feature: string) => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  onUpdateStatus,
  onUpdateAgent,
  onSendReply,
  onAddNote,
  availableAgents,
  currencySymbol = '₹',
  templates = [],
  onDispatchAutomatedMessage,
  onTriggerSlaEscalation,
  currentRole,
  onDeleteLead,
  onRestrictedAction,
}) => {
  const [draftReply, setDraftReply] = useState(lead.suggestedReply);
  const [selectedTone, setSelectedTone] = useState<ReplyTone>('professional');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'notes'>('conversation');
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [isAutomatedModalOpen, setIsAutomatedModalOpen] = useState(false);

  // Sync draft reply whenever selected lead changes
  useEffect(() => {
    setDraftReply(lead.suggestedReply);
    setCopiedDraft(false);
  }, [lead.id, lead.suggestedReply]);

  const channelCfg = getChannelConfig(lead.channel);

  // Clean phone number for WhatsApp link
  const rawDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
  const cleanPhone = rawDigits.startsWith('91') ? rawDigits : rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
  const hasPhone = rawDigits.length >= 10;
  const hasEmail = Boolean(lead.email && lead.email.includes('@'));
  const hasGeminiKey = Boolean(getStoredGeminiApiKey());

  // Handle regenerating AI reply with chosen tone
  const handleRegenerateReply = async (tone?: ReplyTone) => {
    const toneToUse = tone || selectedTone;
    setIsRegenerating(true);
    try {
      const result = await analyzeInquiryWithGemini(
        lead.contactName,
        lead.company,
        lead.channel,
        lead.message,
        toneToUse
      );
      setDraftReply(result.suggestedReply);
    } catch (err) {
      const generated = generateQuickReply(
        lead.contactName,
        lead.company,
        lead.channel,
        lead.message,
        toneToUse
      );
      setDraftReply(generated);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToneChange = (tone: ReplyTone) => {
    setSelectedTone(tone);
    handleRegenerateReply(tone);
  };

  const handleSend = () => {
    if (!draftReply.trim()) return;
    onSendReply(lead.id, draftReply.trim());
    setDraftReply('');
  };

  const handleSendViaWhatsApp = () => {
    if (!draftReply.trim()) return;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(draftReply.trim())}`;
    window.open(url, '_blank');
    onSendReply(lead.id, draftReply.trim());
    setDraftReply('');
  };

  const handleSendViaEmail = () => {
    if (!draftReply.trim()) return;
    const subject = encodeURIComponent(`Regarding your inquiry - ${lead.company || lead.contactName}`);
    const body = encodeURIComponent(draftReply.trim());
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_blank');
    onSendReply(lead.id, draftReply.trim());
    setDraftReply('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(lead.id, newNoteText.trim());
    setNewNoteText('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftReply);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleInsertQuotation = (quotationText: string) => {
    setDraftReply((prev) => (prev ? `${prev}\n\n${quotationText}` : quotationText));
  };

  // Sentiment badge rendering
  const renderSentiment = () => {
    switch (lead.sentiment) {
      case 'positive':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
            <Smile className="w-3.5 h-3.5" />
            <span>Positive Sentiment</span>
          </div>
        );
      case 'urgent_frustrated':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent / Action Required</span>
          </div>
        );
      case 'neutral':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            <Meh className="w-3.5 h-3.5" />
            <span>Neutral Intent</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl overflow-hidden flex flex-col h-full max-h-[calc(100vh-230px)]">
      {/* 1. Header: Contact Info, Source Badge, Real-time Status Dropdown, Assigned Agent */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Contact Details */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0 relative">
              {lead.contactName.charAt(0)}
              <div
                className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-700 ${channelCfg.colorClass}`}
                title={`Channel: ${channelCfg.label}`}
              >
                <ChannelIcon channel={lead.channel} className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">{lead.contactName}</h2>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${channelCfg.colorClass}`}
                >
                  <ChannelIcon channel={lead.channel} className="w-3 h-3" />
                  <span>{channelCfg.label}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {lead.receivedAt}
                </span>
              </div>

              {/* Contact info row with Quick WhatsApp Button */}
              <div className="mt-1.5 flex items-center gap-3.5 text-xs text-slate-400 flex-wrap">
                {lead.company && (
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {lead.company}
                  </span>
                )}
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {lead.email}
                </a>

                {/* Direct Phone & Click to Chat on WhatsApp */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {lead.phone}
                  </a>

                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(
                        lead.contactName
                      )},%20thank%20you%20for%20contacting%20us%20regarding%20your%20inquiry.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Direct Chat on WhatsApp (+91)"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all active:scale-95"
                    >
                      <ChannelIcon channel="whatsapp" className="w-3 h-3" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {lead.channelDetail && (
                <div className="mt-1.5 text-[11px] text-slate-400 truncate max-w-xl">
                  <span className="text-slate-400">Context:</span> {lead.channelDetail}
                </div>
              )}
            </div>
          </div>

          {/* Action Selectors: Status & Agent */}
          <div className="flex items-center gap-2.5 sm:self-center shrink-0">
            {/* Status Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Status
              </label>
              <select
                value={lead.status}
                onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                className={`text-xs font-semibold rounded-lg px-3 py-1.5 border focus:outline-none transition-colors cursor-pointer capitalize ${
                  lead.status === 'new'
                    ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                    : lead.status === 'in_progress'
                    ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                    : lead.status === 'converted'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Assigned Agent Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Assigned Rep
              </label>
              <select
                value={lead.assignedAgent.name}
                onChange={(e) => onUpdateAgent(lead.id, e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {availableAgents.map((ag) => (
                  <option key={ag.name} value={ag.name}>
                    {ag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Delete / Archive Inquiry Button (Admin Only, Restricted for Sales Reps) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Action
              </label>
              <button
                type="button"
                onClick={() => {
                  if (currentRole === 'sales_rep') {
                    if (onRestrictedAction) {
                      onRestrictedAction('Delete Lead Inquiry');
                    }
                    return;
                  }
                  if (onDeleteLead) {
                    onDeleteLead(lead.id);
                  }
                }}
                title={
                  currentRole === 'sales_rep'
                    ? 'Delete Inquiry (Admin Permission Required)'
                    : 'Delete / Archive Lead Inquiry'
                }
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  currentRole === 'sales_rep'
                    ? 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                    : 'bg-rose-950/40 border-rose-900/60 text-rose-300 hover:bg-rose-900/60 hover:text-white'
                }`}
              >
                {currentRole === 'sales_rep' ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body: Scrollable area with AI Insights, Tabs, Chat, and Smart Reply Box */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* 2. AI Insights Section: Score, Sentiment, Executive Summary, SLA Timer */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-900/40 border border-indigo-900/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                AI Lead Intelligence
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Live Follow-up Reminder / SLA Countdown Timer */}
              <SlaCountdownBadge
                receivedTimestamp={lead.receivedTimestamp}
                status={lead.status}
                hasReplied={lead.conversation.some((m) => m.sender === 'agent')}
                variant="detailed"
              />

              {/* Score Badge */}
              {lead.leadScore === 'hot' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Hot Lead</span>
                </div>
              )}
              {lead.leadScore === 'warm' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Warm Lead</span>
                </div>
              )}
              {lead.leadScore === 'cold' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>Cold Lead</span>
                </div>
              )}

              {/* Sentiment */}
              {renderSentiment()}
            </div>
          </div>

          {/* AI Executive Summary Box */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              Executive Summary
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {lead.summary}
            </p>
            {lead.scoreReason && (
              <div className="mt-2 pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 flex items-start gap-1.5">
                <span className="text-indigo-400 font-medium">Score Rationale:</span>
                <span>{lead.scoreReason}</span>
              </div>
            )}
          </div>

          {/* Extracted Tags & Value (Indian Rupee standards) */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-slate-400" />
              {lead.tags?.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700/60"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="font-mono text-slate-300">
              Est. Deal Size: <span className="font-bold text-white">{lead.estimatedValue || '₹15,00,000'}</span>
            </div>
          </div>
        </div>

        {/* View Switcher: Conversation Timeline vs Internal Notes + Quick GST Action */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('conversation')}
              className={`pb-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'conversation'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Conversation Timeline ({lead.conversation.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'notes'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Internal Deal Notes ({lead.notes.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Trigger Controls: Send Automated WhatsApp / Email Button */}
            <button
              type="button"
              onClick={() => setIsAutomatedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Select a pre-written template and send an instant automated email or WhatsApp message"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Send Automated WhatsApp / Email</span>
            </button>

            {/* GST Quotation Trigger Button */}
            <button
              type="button"
              onClick={() => setIsGstModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Generate GST Quotation (18%)</span>
            </button>
          </div>
        </div>

        {/* SLA Expiry Auto-Follow Up & Escalation Banner (If >15m in New status) */}
        {lead.status === 'new' && Date.now() - lead.receivedTimestamp > 15 * 60 * 1000 && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>15 Min SLA Target Overdue:</strong> Lead requires priority response. Rep escalation alert active.
              </span>
            </div>
            {onTriggerSlaEscalation && (
              <button
                type="button"
                onClick={() => onTriggerSlaEscalation(lead.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Trigger SLA Auto-Follow Up Now</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Conversation Timeline */}
        {activeTab === 'conversation' && (
          <div className="space-y-3">
            {lead.conversation.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isSystem = msg.sender === 'system';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isSystem ? 'items-center my-1.5' : isCustomer ? 'items-start' : 'items-end'
                  }`}
                >
                  {/* Sender & Activity Log Timestamp Header */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 px-1 flex-wrap">
                    {msg.isAutomated && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25">
                        <Zap className="w-3 h-3" />
                        <span>Automated {msg.templateName || 'Workflow'}</span>
                      </span>
                    )}
                    <span className="font-medium text-slate-300">{msg.senderName}</span>
                    <span>·</span>
                    <span className="font-mono">{msg.timestamp}</span>
                    {msg.channel && (
                      <span className="text-[10px] text-slate-400">
                        via {getChannelConfig(msg.channel).shortLabel}
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-xl p-3.5 rounded-xl text-xs leading-relaxed ${
                      isSystem
                        ? 'w-full max-w-2xl bg-slate-950/90 border border-indigo-900/50 text-indigo-200 rounded-lg border-l-4 border-l-indigo-500 shadow-sm'
                        : isCustomer
                        ? 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30 rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Manual Notes Section */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Existing Notes List */}
            <div className="space-y-2.5">
              {lead.notes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/40 rounded-lg border border-slate-800/80">
                  No internal notes recorded yet. Add private notes for your team below.
                </div>
              ) : (
                lead.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-300">{note.author}</span>
                      <span className="font-mono text-slate-400">{note.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add New Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Leave an internal sales note</span>
              </label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log internal call notes, pricing negotiations, delivery commitments..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-slate-700"
                >
                  Save Internal Note
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Smart Action Box: AI Suggested Quick Reply & Dispatch */}
        <div className="pt-2">
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Smart Reply Assistant
                </span>
                <span className="text-[11px] text-slate-400">
                  (Pre-filled for {channelCfg.shortLabel})
                </span>
              </div>

              {/* Tone Presets Selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
                {(
                  [
                    { id: 'professional', label: 'Formal' },
                    { id: 'direct', label: 'Direct' },
                    { id: 'friendly', label: 'Friendly' },
                    { id: 'detailed', label: 'Detailed' },
                    { id: 'closer', label: 'Closer' },
                  ] as { id: ReplyTone; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToneChange(t.id)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                      selectedTone === t.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Textarea for Reply */}
            <div className="relative">
              <textarea
                rows={4}
                value={draftReply}
                onChange={(e) => setDraftReply(e.target.value)}
                placeholder="Compose your reply, edit AI suggested draft, or insert GST Quotation..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors leading-relaxed font-sans"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                title="Copy reply text"
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 rounded border border-slate-700/60 transition-colors"
              >
                {copiedDraft ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Action Buttons: Regenerate AI Reply + Real Dispatch Actions */}
            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRegenerateReply()}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`}
                  />
                  <span>
                    {isRegenerating
                      ? 'Analyzing with AI...'
                      : hasGeminiKey
                      ? 'Gemini 2.5 Re-Analyze'
                      : 'Regenerate AI Reply'}
                  </span>
                </button>
                {hasGeminiKey && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {hasPhone && (
                  <button
                    type="button"
                    onClick={handleSendViaWhatsApp}
                    disabled={!draftReply.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                    title="Send message directly to customer's WhatsApp Web and log in CRM"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send on WhatsApp</span>
                  </button>
                )}

                {hasEmail && (
                  <button
                    type="button"
                    onClick={handleSendViaEmail}
                    disabled={!draftReply.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-sky-600/20 transition-all active:scale-95 cursor-pointer"
                    title="Open in email client and log in CRM"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send via Email</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draftReply.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                  title="Log and record message as dispatched inside CRM"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log in CRM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GST Quotation Modal */}
      <GstQuotationModal
        isOpen={isGstModalOpen}
        onClose={() => setIsGstModalOpen(false)}
        lead={lead}
        onInsertToReply={handleInsertQuotation}
        currencySymbol={currencySymbol}
      />

      {/* Send Automated WhatsApp / Email Modal */}
      <SendAutomatedModal
        isOpen={isAutomatedModalOpen}
        onClose={() => setIsAutomatedModalOpen(false)}
        lead={lead}
        templates={templates}
        onDispatchAutomatedMessage={(template, channel, renderedBody, renderedSubject) => {
          if (onDispatchAutomatedMessage) {
            onDispatchAutomatedMessage(lead.id, template, channel, renderedBody, renderedSubject);
          }
        }}
        onInsertToComposer={(renderedBody) => {
          setDraftReply((prev) => (prev ? `${prev}\n\n${renderedBody}` : renderedBody));
        }}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
