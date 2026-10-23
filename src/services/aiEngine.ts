import { ChannelType, LeadScore, SentimentType } from '../types/crm';
import { getStoredGeminiApiKey } from '../utils/storage';

export interface AIAnalysisResult {
  leadScore: LeadScore;
  scoreReason: string;
  sentiment: SentimentType;
  summary: string;
  suggestedReply: string;
  tags: string[];
  estimatedValue: string;
  isRealAI?: boolean;
}

export type ReplyTone = 'professional' | 'direct' | 'friendly' | 'detailed' | 'closer';

/**
 * Heuristic and pattern analysis engine for immediate client-side AI processing (Fallback & Offline)
 */
export function analyzeInquiryContent(
  contactName: string,
  company: string,
  channel: ChannelType,
  messageText: string,
  tone: ReplyTone = 'professional'
): AIAnalysisResult {
  const text = messageText.toLowerCase();

  // Keyword intent detection
  const hasUrgency =
    text.includes('urgent') ||
    text.includes('asap') ||
    text.includes('immediately') ||
    text.includes('deadline') ||
    text.includes('today') ||
    text.includes('this week') ||
    text.includes('packet loss') ||
    text.includes('breakdown') ||
    text.includes('failure');

  const hasHighVolume =
    text.includes('bulk') ||
    text.includes('units') ||
    text.includes('pieces') ||
    text.includes('pcs') ||
    text.includes('seats') ||
    text.includes('rfp') ||
    text.includes('tender') ||
    text.includes('quotation') ||
    text.includes('quote') ||
    text.includes('contract') ||
    text.includes('container') ||
    /\b\d{2,6}\b/.test(text);

  const hasFrustration =
    text.includes('issue') ||
    text.includes('problem') ||
    text.includes('failing') ||
    text.includes('loss') ||
    text.includes('disappointed') ||
    text.includes('terrible') ||
    text.includes('fix');

  const hasPositiveVibe =
    text.includes('love') ||
    text.includes('obsessed') ||
    text.includes('great') ||
    text.includes('impressive') ||
    text.includes('demo') ||
    text.includes('interested') ||
    text.includes('looking forward');

  const isCasualOrVague =
    text.includes('just wondering') ||
    text.includes('browsing') ||
    text.includes('no immediate purchase') ||
    text.includes('curious') ||
    text.includes('free tier') ||
    text.length < 30;

  // Determine Lead Score
  let leadScore: LeadScore = 'warm';
  let scoreReason = '';

  if (hasHighVolume && (hasUrgency || text.includes('rfp') || text.includes('budget') || text.includes('pilot'))) {
    leadScore = 'hot';
    scoreReason = 'High commercial volume indicated with time-sensitive procurement timeline and explicit purchasing criteria.';
  } else if (isCasualOrVague && !hasHighVolume) {
    leadScore = 'cold';
    scoreReason = 'Informational inquiry without defined budget, immediate timeline, or quantified demand requirements.';
  } else if (hasHighVolume || hasUrgency) {
    leadScore = 'hot';
    scoreReason = 'Immediate pain point or sizable project scope detected requiring prompt sales outreach.';
  } else {
    leadScore = 'warm';
    scoreReason = 'Qualified product exploration with interest in capabilities, pricing tiers, and vendor qualifications.';
  }

  // Determine Sentiment
  let sentiment: SentimentType = 'neutral';
  if (hasFrustration || (hasUrgency && text.includes('need urgent'))) {
    sentiment = 'urgent_frustrated';
  } else if (hasPositiveVibe) {
    sentiment = 'positive';
  } else {
    sentiment = 'neutral';
  }

  // Generate Executive Summary
  const companyStr = company ? ` at ${company}` : '';
  let summary = '';
  if (leadScore === 'hot') {
    summary = `${contactName}${companyStr} is requesting high-priority commercial details with an active deployment timeline and specified volume requirements.`;
  } else if (leadScore === 'warm') {
    summary = `${contactName}${companyStr} is exploring product specifications, regional availability, and commercial tier pricing for an upcoming project.`;
  } else {
    summary = `${contactName}${companyStr} initiated a baseline informational inquiry regarding documentation, feature availability, or standard tier parameters.`;
  }

  // Generate Suggested Reply
  const suggestedReply = generateQuickReply(contactName, company, channel, messageText, tone);

  // Extract Tags
  const tags: string[] = [];
  if (hasHighVolume) tags.push('Volume Request');
  if (hasUrgency) tags.push('Urgent SLA');
  if (text.includes('api') || text.includes('integration') || text.includes('sap')) tags.push('Tech Integration');
  if (text.includes('price') || text.includes('quote') || text.includes('rate')) tags.push('Price Quote');
  if (text.includes('demo') || text.includes('sample')) tags.push('Sample/Demo');
  if (tags.length === 0) tags.push('General Inquiry', 'Standard Lead');

  // Estimated Value heuristic in INR
  let estimatedValue = '₹12,50,000';
  if (leadScore === 'hot') estimatedValue = '₹35,00,000 - ₹65,00,000';
  else if (leadScore === 'warm') estimatedValue = '₹12,00,000 - ₹28,00,000';
  else estimatedValue = '₹2,50,000 - ₹6,00,000';

  return {
    leadScore,
    scoreReason,
    sentiment,
    summary,
    suggestedReply,
    tags,
    estimatedValue,
    isRealAI: false,
  };
}

/**
 * Generate AI reply with specific tone presets
 */
export function generateQuickReply(
  contactName: string,
  company: string,
  channel: ChannelType,
  messageText: string,
  tone: ReplyTone = 'professional'
): string {
  const firstName = contactName ? contactName.split(' ')[0] : 'there';
  const channelGreeting =
    channel === 'whatsapp'
      ? `Hi ${firstName}! Thanks for messaging us on WhatsApp.`
      : channel === 'indiamart'
      ? `Hello ${contactName}, thank you for your IndiaMART inquiry.`
      : channel === 'instagram'
      ? `Hi ${firstName}! So great to connect here on Instagram.`
      : channel === 'youtube'
      ? `Hi ${contactName}! Thanks for engaging with our YouTube channel.`
      : channel === 'facebook'
      ? `Hello ${contactName}, thanks for reaching out on Facebook.`
      : `Dear ${contactName}, thank you for contacting our enterprise team.`;

  switch (tone) {
    case 'direct':
      return `${channelGreeting} We reviewed your requirements regarding "${messageText.slice(0, 50)}...". We have immediate availability and can dispatch standard pricing and spec sheets today. Would a quick 10-minute briefing today at 3:00 PM work for your team?`;

    case 'friendly':
      return `${channelGreeting} It's wonderful to hear from you! We would love to collaborate on your upcoming project${company ? ` at ${company}` : ''}. I've pulled together our latest catalogue and case studies for similar rollouts. What is the most convenient time this week for a relaxed virtual walk-through?`;

    case 'detailed':
      return `${channelGreeting}\n\nThank you for outlining your project criteria. Based on your initial specifications, our enterprise engineering package covers turnkey configuration, dedicated onboarding SLAs, and full warranty coverage.\n\nKey next steps:\n1. Technical review of your required volume and timelines.\n2. Dispatch of engineering samples / test credentials.\n3. Custom volume quotation tailored to ${company || 'your organization'}.\n\nPlease let me know if tomorrow morning at 10:30 AM suits you for a comprehensive review.`;

    case 'closer':
      return `${channelGreeting} We can meet your exact timeline and volume criteria right away. For all orders confirmed before the end of this month, we are extending our 15% VIP commercial waiver plus priority freight delivery. Can we confirm your dispatch address to lock in this allotment today?`;

    case 'professional':
    default:
      return `${channelGreeting} We have reviewed your request in detail. Our enterprise tier includes dedicated account management, rapid delivery SLAs, and customized commercial pricing. I have attached our formal specification brief and would appreciate the opportunity to schedule a brief 15-minute alignment call with your technical lead tomorrow. Looking forward to assisting you.`;
  }
}

/**
 * Real Google Gemini AI Lead Triage Engine
 * If Gemini API Key is present, calls Gemini 2.5 Flash for genuine LLM intelligence.
 * Otherwise gracefully falls back to Heuristic analysis.
 */
export async function analyzeInquiryWithGemini(
  contactName: string,
  company: string,
  channel: ChannelType,
  messageText: string,
  tone: ReplyTone = 'professional'
): Promise<AIAnalysisResult> {
  const apiKey = getStoredGeminiApiKey();

  // If no Gemini API key configured, use built-in heuristic engine
  if (!apiKey) {
    return analyzeInquiryContent(contactName, company, channel, messageText, tone);
  }

  try {
    const prompt = `You are OmniSync CRM AI Lead Intelligence Engine.
Analyze this inbound commercial inquiry and return a strictly valid JSON object.

Contact Name: ${contactName || 'Valued Lead'}
Company: ${company || 'Unspecified Organization'}
Inbound Channel: ${channel}
Desired Response Tone: ${tone} (Options: professional, direct, friendly, detailed, closer)
Customer Inquiry Text:
"""
${messageText}
"""

Return JSON format with exactly these fields:
{
  "leadScore": "hot" | "warm" | "cold",
  "scoreReason": "A concise 1-2 sentence business explanation of why this score was assigned based on urgency, volume, timeline, or clarity",
  "sentiment": "positive" | "neutral" | "urgent_frustrated",
  "summary": "A concise 1-2 sentence executive briefing for the sales representative",
  "suggestedReply": "A polished, ready-to-send reply tailored to ${channel} and ${tone} tone addressing their specific request",
  "tags": ["tag1", "tag2", "tag3"],
  "estimatedValue": "Estimated deal value in INR (e.g. ₹5,00,000 or ₹25,00,000)"
}
Only output the JSON object, nothing else.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API call returned non-200, falling back to heuristic:', response.status);
      return analyzeInquiryContent(contactName, company, channel, messageText, tone);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return analyzeInquiryContent(contactName, company, channel, messageText, tone);
    }

    const parsed = JSON.parse(rawText);
    return {
      leadScore: parsed.leadScore === 'hot' || parsed.leadScore === 'cold' ? parsed.leadScore : 'warm',
      scoreReason: parsed.scoreReason || 'Automated AI intent evaluation.',
      sentiment: parsed.sentiment === 'positive' || parsed.sentiment === 'urgent_frustrated' ? parsed.sentiment : 'neutral',
      summary: parsed.summary || `${contactName} sent an inquiry via ${channel}.`,
      suggestedReply: parsed.suggestedReply || generateQuickReply(contactName, company, channel, messageText, tone),
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ['Qualified Lead'],
      estimatedValue: parsed.estimatedValue || '₹10,00,000',
      isRealAI: true,
    };
  } catch (error) {
    console.error('Gemini AI analysis error, falling back to heuristic:', error);
    return analyzeInquiryContent(contactName, company, channel, messageText, tone);
  }
}
