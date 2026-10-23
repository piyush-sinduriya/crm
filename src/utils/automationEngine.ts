import { Lead, Message, MessageTemplate, AutomationSettings, ChannelType } from '../types/crm';
import { getChannelConfig } from '../components/ChannelIcon';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-welcome',
    name: 'Instant Inbound Acknowledgment',
    type: 'omnichannel',
    category: 'welcome',
    subject: 'Thank you for reaching out to us! [Ref: {{company_name}}]',
    body: 'Hi {{customer_name}}, thank you for contacting us via {{channel}}! Our team has received your query regarding {{inquiry_summary}}. Representative {{assigned_rep}} will call you within 15 minutes.',
    isDefault: true,
  },
  {
    id: 'tpl-quotation',
    name: 'Quotation & GST Proposal Follow-up',
    type: 'email',
    category: 'quotation',
    subject: 'Official Commercial Quotation for {{company_name}} (Est. {{deal_value_inr}})',
    body: 'Dear {{customer_name}},\n\nFollowing up regarding your inquiry for {{company_name}}. We have prepared a customized commercial quotation with an estimated deal value of {{deal_value_inr}} (inclusive of 18% GST and priority dispatch).\n\nPlease let us know if you would like any itemized adjustments. Representative {{assigned_rep}} is available for an instant discussion.',
    isDefault: false,
  },
  {
    id: 'tpl-price-list',
    name: 'B2B Wholesale Price List & Catalog',
    type: 'whatsapp',
    category: 'catalog',
    body: 'Hello {{customer_name}}! Here is our latest 2026-27 B2B Wholesale Product Catalog and Spec Sheet for {{company_name}}.\n\nAll bulk orders are dispatched directly from our regional warehouse with GST invoices. Feel free to reply with your required quantities and representative {{assigned_rep}} will share volume tier pricing.',
    isDefault: false,
  },
  {
    id: 'tpl-thank-you',
    name: 'Order Confirmation & Thank You',
    type: 'omnichannel',
    category: 'followup',
    subject: 'Thank You for Choosing Us - {{company_name}}',
    body: 'Hello {{customer_name}},\n\nThank you for confirming your requirements with us! Our operations team has logged your commercial requirements and is preparing your order for {{company_name}}.\n\nYour dedicated account manager is {{assigned_rep}}. Reach out anytime for live order tracking.',
    isDefault: false,
  },
  {
    id: 'tpl-sla-escalation',
    name: 'SLA Expiry Priority Follow-Up',
    type: 'email',
    category: 'sla_escalation',
    subject: 'Priority Update Regarding Your Inquiry [Escalated]',
    body: 'Dear {{customer_name}},\n\nWe apologize for the brief delay. Your inquiry regarding {{inquiry_summary}} for {{company_name}} has been escalated directly to senior sales representative {{assigned_rep}} for immediate priority fulfillment.\n\nOur team is reviewing your requirements now and will connect with you right away.',
    isDefault: true,
  },
];

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  autoReplyEnabled: true,
  autoReplyTemplateId: 'tpl-welcome',
  enabledChannels: {
    whatsapp: true,
    email: true,
    indiamart: true,
    facebook: true,
    instagram: true,
    youtube: true,
    manual: false,
  },
  slaEscalationEnabled: true,
  slaEscalationTemplateId: 'tpl-sla-escalation',
  slaThresholdMinutes: 15,
  notifyRepOnBreach: true,
};

/**
 * Replace all dynamic tags inside template text with real lead data:
 * {{customer_name}}, {{company_name}}, {{assigned_rep}}, {{deal_value_inr}},
 * {{channel}}, {{inquiry_summary}}, {{phone}}, {{email}}
 */
export function replaceDynamicTags(
  templateText: string,
  lead: Lead,
  customValues?: { repName?: string; currencySymbol?: string }
): string {
  const repName = customValues?.repName || lead.assignedAgent?.name || 'Marcus Vance';
  const currencySymbol = customValues?.currencySymbol || '₹';
  const dealValue = lead.estimatedValue || `${currencySymbol}10,00,000`;
  const company = lead.company || 'Private Account';
  const channelDisplay = getChannelConfig(lead.channel)?.label || lead.channel.toUpperCase();
  const summary = lead.summary || lead.message.slice(0, 90) + '...';

  return templateText
    .replace(/\{\{customer_name\}\}/gi, lead.contactName)
    .replace(/\{\{company_name\}\}/gi, company)
    .replace(/\{\{assigned_rep\}\}/gi, repName)
    .replace(/\{\{deal_value_inr\}\}/gi, dealValue)
    .replace(/\{\{channel\}\}/gi, channelDisplay)
    .replace(/\{\{inquiry_summary\}\}/gi, summary)
    .replace(/\{\{inquiry_topic\}\}/gi, summary)
    .replace(/\{\{phone\}\}/gi, lead.phone || '')
    .replace(/\{\{email\}\}/gi, lead.email || '');
}

/**
 * Generate formatted timestamp string for live chat (e.g., "10:30 AM")
 */
export function getChatTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Create an auto-reply Message object
 */
export function createAutoReplyMessage(
  lead: Lead,
  template: MessageTemplate,
  repName?: string
): Message {
  const renderedText = replaceDynamicTags(template.body, lead, { repName });
  const time = getChatTimestamp();

  return {
    id: `msg-auto-${Date.now()}`,
    sender: 'system',
    senderName: `OmniSync Auto-Responder (${lead.channel.toUpperCase()})`,
    text: `⚡ [Automated Auto-Reply: ${template.name}]\n${renderedText}`,
    timestamp: time,
    channel: lead.channel,
    isAutomated: true,
    templateName: template.name,
  };
}

/**
 * Create an SLA Escalation Customer Follow-up Message
 */
export function createSlaEscalationCustomerMessage(
  lead: Lead,
  template: MessageTemplate,
  repName?: string
): Message {
  const renderedText = replaceDynamicTags(template.body, lead, { repName });
  const time = getChatTimestamp();

  return {
    id: `msg-sla-esc-${Date.now()}`,
    sender: 'system',
    senderName: 'SLA Escalation Engine',
    text: `🚨 [SLA Expiry Secondary Follow-Up via Email]\n${renderedText}`,
    timestamp: time,
    channel: 'email',
    isAutomated: true,
    templateName: template.name,
  };
}

/**
 * Create an internal Rep Alert notification in the conversation thread
 */
export function createRepAlertMessage(lead: Lead, repName?: string): Message {
  const rep = repName || lead.assignedAgent?.name || 'Marcus Vance';
  const time = getChatTimestamp();

  return {
    id: `msg-sla-alert-${Date.now()}`,
    sender: 'system',
    senderName: 'SLA Breach Monitor',
    text: `⚠️ SLA Alert Dispatched to Rep ${rep}: Lead stayed in "New" status past 15 minutes. High-priority escalation notification sent to rep's email & SMS. Secondary follow-up dispatched to client.`,
    timestamp: time,
    isAutomated: true,
    templateName: 'Internal Rep SLA Alert',
  };
}
