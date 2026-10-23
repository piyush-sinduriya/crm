export type ChannelType =
  | 'whatsapp'
  | 'email'
  | 'facebook'
  | 'instagram'
  | 'indiamart'
  | 'youtube'
  | 'manual';

export type LeadScore = 'hot' | 'warm' | 'cold';

export type SentimentType = 'positive' | 'neutral' | 'urgent_frustrated';

export type LeadStatus = 'new' | 'in_progress' | 'converted' | 'closed';

export interface Message {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  channel?: ChannelType;
  isAutomated?: boolean;
  templateName?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  company: string;
  channel: ChannelType;
  channelDetail?: string; // e.g. "Listing: Industrial Extruder Model X-400" or "Gmail Subject: Request for Quotation"
  receivedAt: string; // human readable relative time: e.g. "12m ago"
  receivedTimestamp: number; // unix epoch ms for accurate sorting
  message: string;
  status: LeadStatus;
  leadScore: LeadScore;
  scoreReason?: string;
  sentiment: SentimentType;
  summary: string;
  suggestedReply: string;
  assignedAgent: {
    name: string;
    avatar: string;
    email: string;
    role?: string;
  };
  conversation: Message[];
  notes: InternalNote[];
  estimatedValue?: string;
  tags?: string[];
  unread?: boolean;
  slaMinutesRemaining?: number;
  slaStatus?: 'pending' | 'urgent' | 'met' | 'breached';
  slaEscalated?: boolean;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'omnichannel';
  category: 'welcome' | 'quotation' | 'catalog' | 'followup' | 'sla_escalation';
  subject?: string;
  body: string;
  isDefault?: boolean;
}

export interface AutomationSettings {
  autoReplyEnabled: boolean;
  autoReplyTemplateId: string;
  enabledChannels: Record<ChannelType, boolean>;
  slaEscalationEnabled: boolean;
  slaEscalationTemplateId: string;
  slaThresholdMinutes: number;
  notifyRepOnBreach: boolean;
}

export interface ActivityItem {
  id: string;
  leadId: string;
  leadName: string;
  channel: ChannelType;
  action:
    | 'inquiry_received'
    | 'reply_sent'
    | 'status_changed'
    | 'note_added'
    | 'agent_assigned'
    | 'manual_created'
    | 'bulk_import'
    | 'auto_reply_sent'
    | 'sla_escalation'
    | 'template_sent';
  description: string;
  timestamp: string;
  timestampMs: number;
  user?: string;
}

export interface FilterState {
  searchQuery: string;
  channel: string; // 'all' or ChannelType
  leadScore: string; // 'all' or LeadScore
  status: string; // 'all' or LeadStatus
  sortBy: 'newest' | 'oldest' | 'score_high' | 'value_high';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'in_call' | 'away';
  active: boolean;
  leadsAssigned?: number;
  closedDeals?: number;
  conversionRate?: number;
  responseRate?: number;
  permissions: string[];
  joinedDate?: string;
}

export type UserRole = 'admin' | 'sales_rep';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  userRole?: UserRole;
  avatar: string;
  status: 'online' | 'offline' | 'in_call' | 'away';
  permissions: string[];
  leadsHandled: number;
  closedDeals: number;
  responseRate: string;
  pipelineWonValue: string;
}

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber';

export interface AccentColorOption {
  id: AccentColor;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  description: string;
}

export interface BrandConfig {
  name: string;
  tag: string;
  subtitle: string;
  logoUrl?: string;
  currency?: string;
  currencySymbol?: string;
  theme?: ThemeMode;
  accentColor?: AccentColor;
}

export type NavigationTab =
  | 'dashboard'
  | 'inbox'
  | 'leads'
  | 'analytics'
  | 'team'
  | 'activity'
  | 'settings';
