import React, { useState, useEffect } from 'react';
import { MessageTemplate, ChannelType } from '../types/crm';
import {
  X,
  Sparkles,
  Save,
  Tag,
  Mail,
  FileText,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { replaceDynamicTags } from '../utils/automationEngine';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit: MessageTemplate | null;
  onSave: (template: MessageTemplate) => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  templateToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'email' | 'whatsapp' | 'omnichannel'>('omnichannel');
  const [category, setCategory] = useState<'welcome' | 'quotation' | 'catalog' | 'followup' | 'sla_escalation'>('welcome');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setType(templateToEdit.type);
      setCategory(templateToEdit.category);
      setSubject(templateToEdit.subject || '');
      setBody(templateToEdit.body);
    } else {
      setName('');
      setType('omnichannel');
      setCategory('welcome');
      setSubject('');
      setBody('');
    }
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const insertTag = (tag: string) => {
    setBody((prev) => `${prev} {{${tag}}}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    const savedTemplate: MessageTemplate = {
      id: templateToEdit?.id || `tpl-${Date.now()}`,
      name: name.trim(),
      type,
      category,
      subject: type === 'whatsapp' ? undefined : subject.trim() || undefined,
      body: body.trim(),
      isDefault: templateToEdit?.isDefault || false,
    };

    onSave(savedTemplate);
    onClose();
  };

  // Mock lead for live preview
  const sampleLead = {
    id: 'sample',
    contactName: 'Rajesh Varma',
    email: 'rajesh.varma@varmafurnishings.com',
    phone: '+91 98201 44590',
    company: 'Varma Furnishings Pvt Ltd',
    channel: 'indiamart' as ChannelType,
    receivedAt: 'Just now',
    receivedTimestamp: Date.now(),
    message: 'Looking for bulk supply of 450 units of Ergonomic Mesh Task Chairs.',
    status: 'new' as const,
    leadScore: 'hot' as const,
    sentiment: 'positive' as const,
    summary: 'Client requires 450 ergonomic mesh chairs within 25 days with commercial GST invoicing.',
    suggestedReply: '',
    assignedAgent: {
      name: 'Marcus Vance',
      avatar: '',
      email: 'm.vance@omnisync.io',
    },
    conversation: [],
    notes: [],
    estimatedValue: '₹28,50,000',
  };

  const previewText = replaceDynamicTags(body || 'Start typing your template...', sampleLead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {templateToEdit ? 'Edit Message & Email Template' : 'Create New Message Template'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure auto-reply copy with dynamic personalization tags
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

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Row 1: Name, Type, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Template Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Welcome Email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Message Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer capitalize"
              >
                <option value="omnichannel">Omnichannel (All)</option>
                <option value="email">Email Only</option>
                <option value="whatsapp">WhatsApp Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer capitalize"
              >
                <option value="welcome">Welcome Inbound</option>
                <option value="quotation">Quotation Follow-up</option>
                <option value="catalog">Price List / Catalog</option>
                <option value="followup">Thank You / Follow-up</option>
                <option value="sla_escalation">SLA Expiry Escalation</option>
              </select>
            </div>
          </div>

          {/* Email Subject Line (if applicable) */}
          {type !== 'whatsapp' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Email Subject Line</span>
                <span className="text-[10px] text-slate-400 font-normal">Supports dynamic tags</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding {{inquiry_summary}} - {{company_name}}"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Dynamic Tags Helper Toolbar */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Insert Dynamic Tags (Click to append):</span>
              </span>
              <span className="text-slate-400 text-[10px]">Auto-substituted on send</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: 'customer_name', label: '{{customer_name}}' },
                { tag: 'company_name', label: '{{company_name}}' },
                { tag: 'assigned_rep', label: '{{assigned_rep}}' },
                { tag: 'deal_value_inr', label: '{{deal_value_inr}}' },
                { tag: 'channel', label: '{{channel}}' },
                { tag: 'inquiry_summary', label: '{{inquiry_summary}}' },
                { tag: 'phone', label: '{{phone}}' },
              ].map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => insertTag(t.tag)}
                  className="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-800/60 text-[10px] font-mono transition-colors"
                >
                  +{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Body Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Message Body Content</span>
              <span className="text-[10px] text-slate-400 font-mono">{body.length} chars</span>
            </label>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {{customer_name}}, thank you for contacting us via {{channel}}! Our team has received your query regarding {{inquiry_summary}}. Representative {{assigned_rep}} will call you within 15 minutes."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Live Preview with mock lead */}
          <div className="p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Sample Client Preview (Rajesh Varma / Varma Furnishings):</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans border-l-2 border-l-indigo-500">
              {previewText}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
