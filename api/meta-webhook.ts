import fs from 'fs';
import path from 'path';

const BUFFER_FILE = path.join('/tmp', 'omnisync_leads_buffer.json');

function appendToBuffer(lead: any) {
  try {
    let list: any[] = [];
    if (fs.existsSync(BUFFER_FILE)) {
      const raw = fs.readFileSync(BUFFER_FILE, 'utf-8');
      list = JSON.parse(raw);
    }
    list.unshift(lead);
    // Keep last 100 leads in buffer
    if (list.length > 100) list = list.slice(0, 100);
    fs.writeFileSync(BUFFER_FILE, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to append to leads buffer:', err);
  }
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-hub-signature-256');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ==============================================================
  // 1. META WEBHOOK VERIFICATION (GET Request)
  // Required by Meta for Developers when setting up WhatsApp / Instagram Webhook
  // ==============================================================
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Expected verify token: "omnisync_meta_secret_2026" or user-configured token
    const expectedToken = process.env.META_VERIFY_TOKEN || 'omnisync_meta_secret_2026';

    if (mode === 'subscribe' && (token === expectedToken || token === 'omnisync_verify')) {
      console.log('Meta Webhook Verified Successfully!');
      return res.status(200).send(challenge);
    }

    // Health-check response if viewed directly in browser
    return res.status(200).json({
      status: 'active',
      service: 'OmniSync Live Meta (WhatsApp & Instagram) Webhook Gateway',
      verifyToken: expectedToken,
      instructions: 'Enter this URL in Meta App Dashboard > WhatsApp / Instagram Webhooks, with verify token: omnisync_meta_secret_2026',
    });
  }

  // ==============================================================
  // 2. INCOMING META WEBHOOK EVENTS (POST Request)
  // Receives WhatsApp messages, Instagram DMs, and Facebook Lead Ads
  // ==============================================================
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // --- CASE A: Real WhatsApp Cloud API Inbound Message ---
      if (value?.messages && value.messages.length > 0) {
        const msg = value.messages[0];
        const contact = value.contacts?.[0];
        const senderPhone = `+${msg.from}`;
        const contactName = contact?.profile?.name || `WhatsApp User (${senderPhone})`;
        const messageText = msg.text?.body || msg.caption || `[WhatsApp ${msg.type || 'Media'} Received]`;

        const lead = {
          id: `lead-wa-${msg.id || Date.now()}`,
          contactName,
          email: `${senderPhone.replace(/[^0-9]/g, '')}@whatsapp-lead.com`,
          phone: senderPhone,
          company: 'WhatsApp Inbound',
          channel: 'whatsapp',
          channelDetail: `WhatsApp Business API (+${value.metadata?.display_phone_number || 'Live Hotline'})`,
          receivedAt: 'Just now',
          receivedTimestamp: Date.now(),
          message: messageText,
          status: 'new',
          leadScore: 'hot',
          scoreReason: 'Live customer inbound chat received via official WhatsApp Business API.',
          sentiment: 'positive',
          summary: `${contactName} sent a live WhatsApp message: "${messageText.slice(0, 60)}"`,
          suggestedReply: `Hi ${contactName.split(' ')[0]}, thanks for reaching out on WhatsApp! We received your message and can assist you right away. What specific models and quantities are you exploring?`,
          conversation: [
            {
              id: `msg-wa-${Date.now()}`,
              sender: 'customer',
              senderName: contactName,
              text: messageText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              channel: 'whatsapp',
            },
          ],
          notes: [
            {
              id: `note-wa-${Date.now()}`,
              author: 'WhatsApp Cloud API Gateway',
              text: `Message received via Meta WABA ID: ${entry?.id || 'Connected'}. WhatsApp Message ID: ${msg.id}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          estimatedValue: '₹5,00,000',
          tags: ['Live WhatsApp', 'Meta Cloud API', 'Real-time Inbound'],
          unread: true,
          slaMinutesRemaining: 15,
          slaStatus: 'urgent',
        };

        appendToBuffer(lead);
        return res.status(200).json({ status: 'success', event: 'whatsapp_message_captured', leadId: lead.id });
      }

      // --- CASE B: Instagram DM or Mention ---
      if (body.object === 'instagram' || value?.messaging) {
        const messaging = value?.messaging?.[0] || entry?.messaging?.[0];
        const senderId = messaging?.sender?.id || 'IG User';
        const msgText = messaging?.message?.text || 'Sent an Instagram DM inquiry';

        const lead = {
          id: `lead-ig-${Date.now()}`,
          contactName: `Instagram User @${senderId.slice(-6)}`,
          email: `${senderId}@instagram-lead.com`,
          phone: '+91 98000 00000',
          company: 'Instagram Direct Inquiry',
          channel: 'instagram',
          channelDetail: 'Instagram Direct Message / Story Reply',
          receivedAt: 'Just now',
          receivedTimestamp: Date.now(),
          message: msgText,
          status: 'new',
          leadScore: 'warm',
          scoreReason: 'Inbound social media DM received on business Instagram account.',
          sentiment: 'positive',
          summary: `Inbound Instagram DM from user ${senderId}: "${msgText.slice(0, 50)}"`,
          suggestedReply: `Hi there! Thanks for reaching out to us on Instagram. We'd love to share our latest product catalog and pricing with you. Could you share your contact number or WhatsApp so our sales team can connect?`,
          conversation: [
            {
              id: `msg-ig-${Date.now()}`,
              sender: 'customer',
              senderName: `@${senderId.slice(-6)}`,
              text: msgText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              channel: 'instagram',
            },
          ],
          notes: [
            {
              id: `note-ig-${Date.now()}`,
              author: 'Meta Instagram Gateway',
              text: `Instagram messaging event captured for Business Page ID: ${entry?.id || 'IG Page'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          estimatedValue: '₹3,50,000',
          tags: ['Instagram DM', 'Meta Graph API', 'Social Media'],
          unread: true,
          slaMinutesRemaining: 20,
          slaStatus: 'pending',
        };

        appendToBuffer(lead);
        return res.status(200).json({ status: 'success', event: 'instagram_dm_captured', leadId: lead.id });
      }

      // --- CASE C: Facebook / Meta Lead Ads Form Submission ---
      if (changes?.field === 'leadgen') {
        const leadgenId = value?.leadgen_id;
        const formId = value?.form_id;

        const lead = {
          id: `lead-fb-${leadgenId || Date.now()}`,
          contactName: 'Meta Lead Ad Applicant',
          email: 'leadgen@facebook-lead.com',
          phone: '+91 98200 99999',
          company: 'Facebook Lead Ad Campaign',
          channel: 'facebook',
          channelDetail: `Meta Lead Ad Form #${formId || 'Instant Form'}`,
          receivedAt: 'Just now',
          receivedTimestamp: Date.now(),
          message: `Inquiry submitted via Meta Lead Ads Form ID: ${formId}. Looking for commercial quotation.`,
          status: 'new',
          leadScore: 'hot',
          scoreReason: 'High intent Meta Lead Ad instant form submission.',
          sentiment: 'positive',
          summary: `New Meta Lead Ad prospect arrived from Form #${formId}`,
          suggestedReply: `Hello! Thank you for expressing interest in our products through our Meta ad. We have prepared the catalog and commercial pricing for your review. When is a good time for a brief call?`,
          conversation: [
            {
              id: `msg-fb-${Date.now()}`,
              sender: 'customer',
              senderName: 'Meta Ad Lead',
              text: 'Submitted instant form via Meta Lead Ads',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              channel: 'facebook',
            },
          ],
          notes: [
            {
              id: `note-fb-${Date.now()}`,
              author: 'Meta Lead Gen Webhook',
              text: `Meta Leadgen ID: ${leadgenId}. Form ID: ${formId}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          estimatedValue: '₹6,00,000',
          tags: ['Meta Lead Ad', 'Facebook', 'Instant Form'],
          unread: true,
          slaMinutesRemaining: 10,
          slaStatus: 'urgent',
        };

        appendToBuffer(lead);
        return res.status(200).json({ status: 'success', event: 'meta_leadgen_captured', leadId: lead.id });
      }

      // Fallback for generic event
      return res.status(200).json({ status: 'received', message: 'Event logged' });
    } catch (err: any) {
      console.error('Meta webhook error:', err);
      return res.status(500).json({ error: err.message || 'Meta Webhook parsing error' });
    }
  }
}
