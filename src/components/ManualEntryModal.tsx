import React, { useState } from 'react';
import { ChannelType, Lead } from '../types/crm';
import { X, Sparkles, Building2, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { ChannelIcon } from './ChannelIcon';
import { analyzeInquiryWithGemini } from '../services/aiEngine';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLead: (newLead: Lead) => void;
  assignedAgentName: string;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmitLead,
  assignedAgentName,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [channel, setChannel] = useState<ChannelType>('manual');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !inquiryNotes.trim()) return;

    setIsSubmitting(true);

    try {
      // Run AI analysis (Gemini or heuristic fallback)
      const aiResult = await analyzeInquiryWithGemini(
        customerName.trim(),
        company.trim(),
        channel,
        inquiryNotes.trim()
      );

      const newLead: Lead = {
        id: `lead-manual-${Date.now()}`,
        contactName: customerName.trim(),
        email: email.trim() || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: phone.trim() || '+91 98000 00000',
        company: company.trim() || 'Private Account',
        channel,
        channelDetail:
          channel === 'manual'
            ? 'Manual Phone Inbound / Direct Office Entry'
            : `Manual entry logged under ${channel.toUpperCase()}`,
        receivedAt: 'Just now',
        receivedTimestamp: Date.now(),
        message: inquiryNotes.trim(),
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
          role: 'Sales Rep',
        },
        conversation: [
          {
            id: `msg-${Date.now()}`,
            sender: 'customer',
            senderName: customerName.trim(),
            text: inquiryNotes.trim(),
            timestamp: 'Just now',
            channel,
          },
        ],
        notes: [
          {
            id: `note-${Date.now()}`,
            author: assignedAgentName || 'Marcus Vance',
            text: `Lead manually registered into OmniSync CRM with automated AI scoring triage (${aiResult.leadScore.toUpperCase()}).`,
            timestamp: 'Just now',
          },
        ],
        estimatedValue: estimatedValue.trim() || aiResult.estimatedValue,
        tags: aiResult.tags,
        unread: true,
      };

      onSubmitLead(newLead);
      onClose();
    } catch (err) {
      console.error('Error in manual entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill preset templates for user convenience
  const fillPreset = (type: 'bulk' | 'urgent' | 'consult') => {
    if (type === 'bulk') {
      setCustomerName('Aditya Singhania');
      setPhone('+91 98300 78210');
      setEmail('aditya@singhaniasteel.com');
      setCompany('Singhania Structural Steel');
      setChannel('indiamart');
      setInquiryNotes(
        'Urgent requirement for 300 metric tons of galvanized steel grating with test certificates for port expansion project in Gujarat. Delivery required by 15th next month. Ready with 20% advance.'
      );
      setEstimatedValue('₹65,00,000');
    } else if (type === 'urgent') {
      setCustomerName('Laura Martinez');
      setPhone('+1 (312) 555-8911');
      setEmail('laura@urbanflowlogistic.com');
      setCompany('UrbanFlow Logistics');
      setChannel('whatsapp');
      setInquiryNotes(
        'Our existing dispatch dispatch gateway failed during peak hours. We have 45 drivers stalled and need an immediate cloud failover trial this afternoon. Can an engineer call me ASAP?'
      );
      setEstimatedValue('₹28,00,000');
    } else {
      setCustomerName('Dr. Kiran Pillai');
      setPhone('+91 94470 12093');
      setEmail('dr.pillai@amritabiotech.res.in');
      setCompany('Amrita Biotech Labs');
      setChannel('manual');
      setInquiryNotes(
        'Walk-in inquiry during Bengaluru Tech Summit. Seeking consultation on cryogenic cold-chain monitoring sensors for university research lab. Budget approval pending grant review in Q1.'
      );
      setEstimatedValue('₹14,50,000');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Add Manual Inbound Inquiry
              </h3>
              <p className="text-[11px] text-slate-400">
                Automatically scored and triaged with AI Lead Intelligence
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

        {/* Quick Demo Pre-fills */}
        <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 shrink-0">Quick presets:</span>
          <button
            type="button"
            onClick={() => fillPreset('bulk')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
          >
            🔥 Bulk Steel RFQ
          </button>
          <button
            type="button"
            onClick={() => fillPreset('urgent')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
          >
            ⚡ Urgent Tech Crisis
          </button>
          <button
            type="button"
            onClick={() => fillPreset('consult')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
          >
            🤝 Expo Walk-in
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
          {/* Customer Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Industrial Ltd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Channel Source & Estimated Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Channel Source (Default: Walk-in)
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="manual">Manual Phone / Walk-in</option>
                <option value="whatsapp">WhatsApp Business</option>
                <option value="email">Email (Gmail)</option>
                <option value="indiamart">IndiaMART B2B</option>
                <option value="facebook">Meta Facebook</option>
                <option value="instagram">Meta Instagram</option>
                <option value="youtube">YouTube Comments</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estimated Deal Value
              </label>
              <input
                type="text"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="e.g. ₹25,00,000 or ₹45,00,000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Inquiry Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Inquiry Notes / Message Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={inquiryNotes}
              onChange={(e) => setInquiryNotes(e.target.value)}
              placeholder="Paste or write customer inquiry details, quantities, deadlines, requirements..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* AI Notice */}
          <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              On submission, the AI engine evaluates purchase intent, assigns Hot/Warm/Cold score, tags sentiment, and drafts an initial reply.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim() || !inquiryNotes.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Analyzing with AI...' : 'Create & AI Triage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
