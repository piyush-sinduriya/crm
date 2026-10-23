import React, { useState, useRef } from 'react';
import {
  ChannelType,
  BrandConfig,
  MessageTemplate,
  AutomationSettings,
} from '../types/crm';
import { ChannelIcon, getChannelConfig } from './ChannelIcon';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { TemplateEditorModal } from './TemplateEditorModal';
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Sliders,
  Bell,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Building,
  GraduationCap,
  Zap,
  Coins,
  Globe,
  Check,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Send,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { replaceDynamicTags } from '../utils/automationEngine';
import { UserRole, ThemeMode, AccentColor } from '../types/crm';
import { ACCENT_COLORS } from '../utils/themeConfig';

interface SettingsViewProps {
  branding: BrandConfig;
  onUpdateBranding: (newBrand: BrandConfig) => void;
  templates: MessageTemplate[];
  onSaveTemplate: (template: MessageTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onResetTemplates: () => void;
  automationSettings: AutomationSettings;
  onUpdateAutomationSettings: (newSettings: AutomationSettings) => void;
  currentRole?: UserRole;
  onRestrictedAction?: (feature: string) => void;
  onSwitchToAdmin?: () => void;
  theme?: ThemeMode;
  onUpdateTheme?: (mode: ThemeMode) => void;
  accentColor?: AccentColor;
  onUpdateAccentColor?: (accent: AccentColor) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  branding,
  onUpdateBranding,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onResetTemplates,
  automationSettings,
  onUpdateAutomationSettings,
  currentRole = 'admin',
  onRestrictedAction,
  onSwitchToAdmin,
  theme = 'dark',
  onUpdateTheme,
  accentColor = 'indigo',
  onUpdateAccentColor,
}) => {
  const isRep = currentRole === 'sales_rep';
  const [activeTab, setActiveTab] = useState<'appearance' | 'branding' | 'automation' | 'templates' | 'webhooks'>('appearance');

  const [webhookStatuses, setWebhookStatuses] = useState<Record<ChannelType, boolean>>({
    whatsapp: true,
    email: true,
    indiamart: true,
    facebook: true,
    instagram: true,
    youtube: true,
    manual: true,
  });

  const [autoTriage, setAutoTriage] = useState(true);
  const [urgencyNotification, setUrgencyNotification] = useState(true);
  const [defaultTone, setDefaultTone] = useState('professional');

  // Branding local state
  const [brandName, setBrandName] = useState(branding.name);
  const [brandTag, setBrandTag] = useState(branding.tag);
  const [brandSubtitle, setBrandSubtitle] = useState(branding.subtitle);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | undefined>(branding.logoUrl);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(branding.currency || 'INR');
  const [brandSaved, setBrandSaved] = useState(false);
  const [currencySaved, setCurrencySaved] = useState(false);
  const [automationSaved, setAutomationSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Template Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleWebhook = (channel: ChannelType) => {
    setWebhookStatuses((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleCurrencySelect = (currCode: string) => {
    setSelectedCurrency(currCode);
    const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currCode) || SUPPORTED_CURRENCIES[0];
    onUpdateBranding({
      ...branding,
      currency: curr.code,
      currencySymbol: curr.symbol,
    });
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBrandLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRep) {
      onRestrictedAction?.('Logo & Branding Settings');
      return;
    }
    const curr = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];
    onUpdateBranding({
      name: brandName.trim() || 'OmniSync',
      tag: brandTag.trim() || 'CRM',
      subtitle: brandSubtitle.trim() || 'Omnichannel Intelligence',
      logoUrl: brandLogoUrl,
      currency: curr.code,
      currencySymbol: curr.symbol,
    });
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 3000);
  };

  const handleResetBrand = () => {
    if (isRep) {
      onRestrictedAction?.('Logo & Branding Settings');
      return;
    }
    setBrandName('OmniSync');
    setBrandTag('CRM');
    setBrandSubtitle('Omnichannel Intelligence');
    setBrandLogoUrl(undefined);
    setSelectedCurrency('INR');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onUpdateBranding({
      name: 'OmniSync',
      tag: 'CRM',
      subtitle: 'Omnichannel Intelligence',
      logoUrl: undefined,
      currency: 'INR',
      currencySymbol: '₹',
    });
  };

  // Automation handlers
  const handleToggleAutoReply = () => {
    if (isRep) {
      onRestrictedAction?.('Automated Message Workflows');
      return;
    }
    const next = !automationSettings.autoReplyEnabled;
    onUpdateAutomationSettings({
      ...automationSettings,
      autoReplyEnabled: next,
    });
    triggerAutomationSaved();
  };

  const handleToggleChannel = (channel: ChannelType) => {
    if (isRep) {
      onRestrictedAction?.('Channel Auto-Reply Settings');
      return;
    }
    const updated = {
      ...automationSettings.enabledChannels,
      [channel]: !automationSettings.enabledChannels[channel],
    };
    onUpdateAutomationSettings({
      ...automationSettings,
      enabledChannels: updated,
    });
    triggerAutomationSaved();
  };

  const handleToggleSlaEscalation = () => {
    if (isRep) {
      onRestrictedAction?.('SLA Escalation Workflow');
      return;
    }
    const next = !automationSettings.slaEscalationEnabled;
    onUpdateAutomationSettings({
      ...automationSettings,
      slaEscalationEnabled: next,
    });
    triggerAutomationSaved();
  };

  const triggerAutomationSaved = () => {
    setAutomationSaved(true);
    setTimeout(() => setAutomationSaved(false), 2500);
  };

  const channelList: { id: ChannelType; name: string; endpoint: string; latency: string }[] = [
    {
      id: 'indiamart',
      name: 'IndiaMART B2B Portal',
      endpoint: 'https://api.omnisync.io/v1/webhooks/indiamart-rfq',
      latency: '24ms',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business Cloud API',
      endpoint: 'https://api.omnisync.io/v1/webhooks/meta-whatsapp',
      latency: '18ms',
    },
    {
      id: 'email',
      name: 'Google Workspace Gmail Push',
      endpoint: 'https://api.omnisync.io/v1/webhooks/gmail-pubsub',
      latency: '45ms',
    },
    {
      id: 'facebook',
      name: 'Meta Facebook Pages / Messenger',
      endpoint: 'https://api.omnisync.io/v1/webhooks/meta-graph',
      latency: '32ms',
    },
    {
      id: 'instagram',
      name: 'Instagram Direct API',
      endpoint: 'https://api.omnisync.io/v1/webhooks/instagram-dms',
      latency: '29ms',
    },
    {
      id: 'youtube',
      name: 'YouTube Data API v3 Webhook',
      endpoint: 'https://api.omnisync.io/v1/webhooks/youtube-comments',
      latency: '82ms',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-8 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
      {/* RBAC Restricted Warning Banner */}
      {isRep && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-950/25 border border-amber-500/40 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>Access Restricted: Contact your Admin to make changes.</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                You are currently viewing settings with <strong>Sales Representative</strong> role. Configuring automated responses, SLA timers, message templates, branding, and webhooks are restricted to Administrators.
              </p>
            </div>
          </div>
          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition-all self-start sm:self-center shrink-0 cursor-pointer active:scale-95"
            >
              Switch to Admin View
            </button>
          )}
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>Theme & Accent Color</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'automation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-indigo-200" />
          <span>Automated Messaging & SLA Workflows</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-200" />
          <span>Message & Email Templates ({templates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-indigo-200" />
          <span>Logo, Branding & Currency (₹)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'webhooks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-200" />
          <span>Inbound Webhooks & AI Model</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION 0: THEME SWITCHER & CUSTOM ACCENT COLOR */}
      {/* ============================================================== */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                  <Sun className="w-4 h-4 text-amber-400" />
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Theme & Custom Accent Color
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Switch seamlessly between Dark Mode and Light Mode, and customize your CRM workspace brand accent color across action buttons, active navigation, and key conversion metrics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Active Theme:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-white capitalize flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span>{theme} Mode</span>
              </span>
            </div>
          </div>

          {/* 1. Theme Mode Selection (Dark vs Light) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>1. Select Interface Theme Mode</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose between high-contrast Dark Mode or clean crisp Light Mode.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => onUpdateTheme?.('dark')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-300">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Dark Mode</span>
                        {theme === 'dark' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">Deep slate & indigo palette</span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {theme === 'dark' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {/* Mini Preview Box */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">Dashboard Inquiry</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                      ₹3,20,000
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    High contrast on deep dark slate background. Reduced eye strain.
                  </div>
                </div>
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => onUpdateTheme?.('light')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  theme === 'light'
                    ? 'bg-slate-950 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Light Mode</span>
                        {theme === 'light' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">Clean white & soft grey palette</span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      theme === 'light'
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {theme === 'light' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {/* Mini Preview Box */}
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-900 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-900 font-bold">Dashboard Inquiry</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-mono font-semibold">
                      ₹3,20,000
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Clean white cards, soft borders, and dark high-contrast typography.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Custom Accent Color Picker */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. Select Custom Brand Accent Color</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize primary action buttons, active navigation, conversation reply highlights, and badges.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ACCENT_COLORS.map((color) => {
                const isSelected = accentColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onUpdateAccentColor?.(color.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-950 border-white/60 ring-2 ring-indigo-500/40 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full shadow-inner ring-2 ring-white/20 shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${color.primaryHex}, ${color.secondaryHex})`,
                          }}
                        />
                        <span className="text-xs font-bold text-white tracking-tight">
                          {color.name}
                        </span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      {color.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                      <span className="font-mono text-slate-400">{color.primaryHex}</span>
                      <span
                        className="px-2 py-0.5 rounded font-semibold text-white text-[10px]"
                        style={{ backgroundColor: color.primaryHex }}
                      >
                        Sample Button
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Live Simulated Component Preview */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Palette & Accent Preview
                </h4>
                <p className="text-xs text-slate-400">
                  Preview how inquiries, action buttons, and badges look in {theme} mode with {accentColor} accent.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onUpdateTheme?.(theme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Rajesh Varma</div>
                    <div className="text-[10px] text-slate-400">Varma Furnishings Pvt Ltd • Mumbai</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    ₹3,20,000
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    IndiaMART RFQ
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                "Looking for 450 units of high-back ergonomic mesh chairs with 3-year warranty for our corporate campus in Bandra-Kurla Complex."
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SLA Remaining: 11:45 mins</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Quick Reply
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 1: AUTOMATED MESSAGING & SLA WORKFLOWS */}
      {/* ============================================================== */}
      {activeTab === 'automation' && (
        <div className="space-y-5">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900 border border-indigo-900/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                  <Zap className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Automated Messaging Engine & Workflows
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Configure instant auto-replies on inbound inquiries from Email, WhatsApp, IndiaMART, and Meta channels, plus 15-minute SLA breach auto-escalations.
              </p>
            </div>
            {automationSaved && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg animate-in fade-in">
                Workflow Saved!
              </span>
            )}
          </div>

          {/* 1. Auto-Reply on New Inbound Leads Panel */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. Auto-Reply on New Inbound Leads</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically send an instant acknowledgment email or WhatsApp message whenever a new inquiry arrives.
                </p>
              </div>

              {/* Master Auto-reply Switch */}
              <button
                type="button"
                onClick={handleToggleAutoReply}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  automationSettings.autoReplyEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    automationSettings.autoReplyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Config Content */}
            <div className="space-y-4 text-xs">
              {/* Channel Selector Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Enabled Inbound Channels for Auto-Reply:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'indiamart', label: 'IndiaMART B2B RFQs' },
                      { id: 'whatsapp', label: 'WhatsApp Business' },
                      { id: 'email', label: 'Gmail / Work Email' },
                      { id: 'facebook', label: 'Meta Facebook' },
                      { id: 'instagram', label: 'Meta Instagram' },
                      { id: 'youtube', label: 'YouTube Comments' },
                    ] as { id: ChannelType; label: string }[]
                  ).map((ch) => {
                    const isChecked = !!automationSettings.enabledChannels[ch.id];
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleToggleChannel(ch.id)}
                        disabled={!automationSettings.autoReplyEnabled}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                          !automationSettings.autoReplyEnabled
                            ? 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-850'
                            : isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/70 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <ChannelIcon channel={ch.id} className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium truncate">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Selected for Auto-Reply */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Auto-Reply Template:
                </label>
                <select
                  value={automationSettings.autoReplyTemplateId}
                  disabled={!automationSettings.autoReplyEnabled}
                  onChange={(e) => {
                    onUpdateAutomationSettings({
                      ...automationSettings,
                      autoReplyTemplateId: e.target.value,
                    });
                    triggerAutomationSaved();
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Dispatch Copy Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-indigo-400 flex items-center justify-between">
                  <span>Sample Auto-Reply Generated on Inbound:</span>
                  <span className="text-[10px] font-mono text-slate-400">Preview with mock data</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 font-sans leading-relaxed text-xs border-l-2 border-l-indigo-500">
                  "Hi Rajesh Varma, thank you for contacting us via IndiaMART! Our team has received your query regarding bulk supply of 450 units of Ergonomic Mesh Task Chairs. Representative Marcus Vance will call you within 15 minutes."
                </div>
              </div>
            </div>
          </div>

          {/* 2. SLA Expiry Auto-Follow Up & Escalation Panel */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. SLA Expiry Auto-Follow Up & Rep Escalation</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  If an inquiry remains in "New" status past 15 minutes, automatically trigger an alert to the assigned sales rep and send a secondary follow-up to the client.
                </p>
              </div>

              {/* SLA Escalation Switch */}
              <button
                type="button"
                onClick={handleToggleSlaEscalation}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  automationSettings.slaEscalationEnabled ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    automationSettings.slaEscalationEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SLA Escalation Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-slate-400 font-medium">SLA Countdown Threshold</div>
                  <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span>15 Minutes</span>
                    <span className="text-[10px] text-amber-400 font-normal px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Standard Inbound Window
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-slate-400 font-medium">Internal Rep Escalation Notification</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant In-App & Email Alert</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Secondary Client Follow-Up Template:
                </label>
                <select
                  value={automationSettings.slaEscalationTemplateId}
                  disabled={!automationSettings.slaEscalationEnabled}
                  onChange={(e) => {
                    onUpdateAutomationSettings({
                      ...automationSettings,
                      slaEscalationTemplateId: e.target.value,
                    });
                    triggerAutomationSaved();
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample SLA Escalation message */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 block font-semibold">
                  🚨 Triggered Message on SLA Breach:
                </span>
                <p className="text-xs text-slate-200">
                  "Dear Rajesh Varma, we apologize for the brief delay. Your inquiry regarding bulk supply of 450 units of Ergonomic Mesh Task Chairs for Varma Furnishings Pvt Ltd has been escalated directly to senior sales representative Marcus Vance for immediate priority fulfillment."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: MESSAGE & EMAIL TEMPLATE BUILDER */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Message & Email Template Builder</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create and manage reusable templates with dynamic tags: <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">{'{{customer_name}}'}</code>, <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">{'{{company_name}}'}</code>, <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">{'{{assigned_rep}}'}</code>, <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">{'{{deal_value_inr}}'}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetTemplates}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 border border-slate-700/60"
                title="Reset to default templates"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isRep) {
                    onRestrictedAction?.('Create Automated Message Template');
                    return;
                  }
                  setEditingTemplate(null);
                  setIsEditorOpen(true);
                }}
                title={isRep ? 'Create Template (Admin Only)' : 'Create New Message Template'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
                  isRep
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-amber-300'
                    : 'text-white bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isRep ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Create Template</span>
              </button>
            </div>
          </div>

          {/* Templates Grid / Cards */}
          <div className="grid grid-cols-1 gap-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white tracking-tight">{tpl.name}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                        tpl.type === 'email'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : tpl.type === 'whatsapp'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {tpl.type}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                      {tpl.category.replace('_', ' ')}
                    </span>
                    {tpl.isDefault && (
                      <span className="text-[10px] text-slate-400 font-mono">(System Preset)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isRep) {
                          onRestrictedAction?.('Edit Message Template');
                          return;
                        }
                        setEditingTemplate(tpl);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                      title={isRep ? 'Edit template (Admin Only)' : 'Edit template'}
                    >
                      {isRep ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                    </button>
                    {!tpl.isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isRep) {
                            onRestrictedAction?.('Delete Message Template');
                            return;
                          }
                          onDeleteTemplate(tpl.id);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg transition-colors border border-rose-900/40 cursor-pointer"
                        title={isRep ? 'Delete template (Admin Only)' : 'Delete template'}
                      >
                        {isRep ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {tpl.subject && (
                  <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/80 truncate">
                    <span className="text-slate-500">Subject:</span> {tpl.subject}
                  </div>
                )}

                <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line line-clamp-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                  {tpl.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: CUSTOM LOGO, BRANDING & CURRENCY */}
      {/* ============================================================== */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Logo & Business Branding Panel */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>Custom Logo & Business Branding</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload your custom business logo, set your company name, and customize the CRM header
                </p>
              </div>
              {brandSaved && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                  Branding Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              {/* Live Preview */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {brandLogoUrl ? (
                    <img
                      src={brandLogoUrl}
                      alt="Custom Business Logo"
                      className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 border border-slate-700 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                      <Zap className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>{brandName || 'OmniSync'}</span>
                      <span className="text-[10px] font-semibold text-indigo-400 tracking-wider">
                        {brandTag || 'CRM'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {brandSubtitle || 'Omnichannel Intelligence'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 sm:text-right">
                  Live Preview of Sidebar & Top Header
                </div>
              </div>

              {/* Logo File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Logo File Upload
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    id="settings-logo-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="settings-logo-input"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>{brandLogoUrl ? 'Replace Custom Logo Image' : 'Choose Logo Image from Computer'}</span>
                  </label>

                  {brandLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setBrandLogoUrl(undefined);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Company & Tag Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Application / Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="OmniSync"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Brand Tag / Edition
                  </label>
                  <input
                    type="text"
                    value={brandTag}
                    onChange={(e) => setBrandTag(e.target.value)}
                    placeholder="CRM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetBrand}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Reset to Default
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-all active:scale-95"
                >
                  Save Branding Changes
                </button>
              </div>
            </form>
          </div>

          {/* Multi-Currency Selection Panel */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>Currency & Numbering Standards</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your primary currency. Default is Indian Rupee (INR ₹) with Lakhs & Crores formatting.
                </p>
              </div>
              {currencySaved && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                  Currency Updated!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SUPPORTED_CURRENCIES.map((curr) => {
                const isSelected = selectedCurrency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleCurrencySelect(curr.code)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span className="text-sm font-mono text-emerald-400">{curr.symbol}</span>
                        <span>{curr.code}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{curr.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: WEBHOOKS & AI TRIAGE CONFIGURATION */}
      {/* ============================================================== */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Active Inbound Channel Webhooks</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time listener endpoints configured for customer inquiries across business touchpoints
              </p>
            </div>

            <div className="space-y-2.5">
              {channelList.map((item) => {
                const isConnected = webhookStatuses[item.id];
                const cfg = getChannelConfig(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${cfg.colorClass}`}>
                        <ChannelIcon channel={item.id} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Latency: {item.latency}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm sm:max-w-md">
                          {item.endpoint}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] font-medium hidden sm:inline ${
                          isConnected ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {isConnected ? 'Active' : 'Paused'}
                      </span>
                      <button
                        onClick={() => toggleWebhook(item.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isConnected ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isConnected ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        templateToEdit={editingTemplate}
        onSave={onSaveTemplate}
      />
    </div>
  );
};
