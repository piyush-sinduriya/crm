import React, { useState, useMemo } from 'react';
import { Lead, ChannelType, MessageTemplate } from '../types/crm';
import {
  X,
  Zap,
  Mail,
  Send,
  Sparkles,
  Check,
  Copy,
  FileText,
  Clock,
  Layers,
  Info,
} from 'lucide-react';
import { ChannelIcon } from './ChannelIcon';
import { replaceDynamicTags, getChatTimestamp } from '../utils/automationEngine';

interface SendAutomatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  templates: MessageTemplate[];
  onDispatchAutomatedMessage: (
    template: MessageTemplate,
    channel: ChannelType,
    renderedBody: string,
    renderedSubject?: string
  ) => void;
  onInsertToComposer: (renderedBody: string) => void;
  currencySymbol?: string;
}

export const SendAutomatedModal: React.FC<SendAutomatedModalProps> = ({
  isOpen,
  onClose,
  lead,
  templates,
  onDispatchAutomatedMessage,
  onInsertToComposer,
  currencySymbol = '₹',
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || 'tpl-welcome'
  );
  const [targetChannel, setTargetChannel] = useState<ChannelType>(
    lead.channel === 'manual' ? 'whatsapp' : lead.channel
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Selected template object
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Dynamically rendered text with lead tags
  const renderedBody = useMemo(() => {
    if (!activeTemplate) return '';
    return replaceDynamicTags(activeTemplate.body, lead, {
      repName: lead.assignedAgent?.name,
      currencySymbol,
    });
  }, [activeTemplate, lead, currencySymbol]);

  const renderedSubject = useMemo(() => {
    if (!activeTemplate?.subject) return '';
    return replaceDynamicTags(activeTemplate.subject, lead, {
      repName: lead.assignedAgent?.name,
      currencySymbol,
    });
  }, [activeTemplate, lead, currencySymbol]);

  if (!isOpen || !activeTemplate) return null;

  const handleSendDirect = () => {
    setIsSending(true);
    setTimeout(() => {
      onDispatchAutomatedMessage(activeTemplate, targetChannel, renderedBody, renderedSubject);
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1200);
    }, 300);
  };

  const handleInsert = () => {
    onInsertToComposer(renderedBody);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Send Automated WhatsApp / Email</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Auto-Workflow
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Dispatch personalized pre-written templates to {lead.contactName} ({lead.company || 'Private'})
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

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {sentSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>
                Automated message successfully dispatched via {targetChannel.toUpperCase()} and logged to conversation!
              </span>
            </div>
          )}

          {/* 1. Pick Template & Target Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Message Template</span>
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Delivery Channel</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['whatsapp', 'email', lead.channel] as ChannelType[])
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((ch) => {
                    const isActive = targetChannel === ch;
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setTargetChannel(ch)}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <ChannelIcon channel={ch} className="w-3 h-3" />
                        <span>{ch}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 2. Live Dynamic Tag Substitutions Banner */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Resolved Dynamic Tags for this Client:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-300 font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80 truncate">
                <span className="text-slate-500 block text-[9px]">customer_name</span>
                <span className="text-slate-200 font-sans font-medium">{lead.contactName}</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80 truncate">
                <span className="text-slate-500 block text-[9px]">company_name</span>
                <span className="text-slate-200 font-sans font-medium">
                  {lead.company || 'Private'}
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80 truncate">
                <span className="text-slate-500 block text-[9px]">assigned_rep</span>
                <span className="text-slate-200 font-sans font-medium">
                  {lead.assignedAgent?.name || 'Marcus'}
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80 truncate">
                <span className="text-slate-500 block text-[9px]">deal_value_inr</span>
                <span className="text-emerald-400 font-mono font-medium">
                  {lead.estimatedValue || '₹10,00,000'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Rendered Content Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Rendered Message Preview:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {renderedSubject && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 font-mono text-[10px]">Email Subject:</span>{' '}
                <span className="font-semibold text-white">{renderedSubject}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans border-l-4 border-l-indigo-500">
              {renderedBody}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              Sending will append this message directly to the conversation timeline, record a CRM activity audit log, and advance status to <strong>In Progress</strong> (clearing the SLA timer).
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/95">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInsert}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Insert into Composer
            </button>

            <button
              type="button"
              onClick={handleSendDirect}
              disabled={isSending || sentSuccess}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : `Send Automated ${targetChannel.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
