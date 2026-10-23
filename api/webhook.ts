export default async function handler(req: any, res: any) {
  // Set CORS headers so any website form or external server can POST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle health check / verification
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'OmniSync CRM Inbound Webhook Gateway',
      supportedChannels: ['indiamart', 'website', 'whatsapp', 'facebook', 'instagram', 'youtube', 'manual'],
      usage: 'Send a POST request with JSON payload: { name, phone, email, message, company, channel }',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    
    // Support common webhook payload formats (WordPress CF7, Elementor, Zapier, Webflow, WhatsApp)
    const contactName = body.name || body.contactName || body.fullName || body.sender_name || body.Name || 'New Web Lead';
    const phone = body.phone || body.mobile || body.telephone || body.sender_mobile || body.Phone || '';
    const email = body.email || body.emailAddress || body.sender_email || body.Email || '';
    const company = body.company || body.organization || body.school || body.Company || 'Direct Inquirer';
    const message = body.message || body.inquiry || body.requirement || body.query || body.Message || 'Inbound inquiry from website';
    const channel = (body.channel || body.source || 'website').toLowerCase();
    const estimatedValue = body.estimatedValue || body.budget || body.value || '₹5,00,000';

    const normalizedChannel =
      ['whatsapp', 'email', 'indiamart', 'facebook', 'instagram', 'youtube'].includes(channel)
        ? channel
        : 'website';

    const lead = {
      id: `lead-wh-${Date.now()}`,
      contactName,
      email: email || `${contactName.toLowerCase().replace(/[^a-z0-9]/g, '')}@lead.com`,
      phone,
      company,
      channel: normalizedChannel === 'website' ? 'manual' : normalizedChannel,
      channelDetail: body.sourceDetail || `Inbound Webhook via ${normalizedChannel.toUpperCase()}`,
      receivedAt: 'Just now',
      receivedTimestamp: Date.now(),
      message,
      status: 'new',
      leadScore: 'hot',
      scoreReason: 'Immediate inbound webhook submission from digital channel.',
      sentiment: 'positive',
      summary: `${contactName} submitted an inquiry for ${company}.`,
      suggestedReply: `Hello ${contactName.split(' ')[0]}, thank you for contacting us regarding your requirement! We received your message and can share standard pricing and spec sheets today. Would today at 4 PM work for a quick phone call?`,
      conversation: [
        {
          id: `msg-wh-${Date.now()}`,
          sender: 'customer',
          senderName: contactName,
          text: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: normalizedChannel === 'website' ? 'manual' : normalizedChannel,
        },
      ],
      notes: [
        {
          id: `note-wh-${Date.now()}`,
          author: 'Webhook Gateway',
          text: `Inbound lead captured via public API webhook endpoint. Source IP / Agent: ${req.headers['user-agent'] || 'External Form'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      estimatedValue,
      tags: ['Webhook Inbound', normalizedChannel.toUpperCase(), 'Real-time'],
      unread: true,
      slaMinutesRemaining: 15,
      slaStatus: 'urgent',
    };

    return res.status(200).json({
      success: true,
      message: 'Inbound lead received and processed successfully',
      leadId: lead.id,
      lead,
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process inbound webhook payload',
    });
  }
}
