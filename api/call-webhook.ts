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
    if (list.length > 100) list = list.slice(0, 100);
    fs.writeFileSync(BUFFER_FILE, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to append to leads buffer:', err);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check / GET instructions
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'OmniSync Telephony & Smart Call Gateway',
      compatibleWith: ['Exotel', 'Knowlarity', 'MCube', 'Twilio', 'Tata Tele', 'Android Call Tracker App'],
      usage: 'Configure this webhook URL in your IVR provider as the Call Ended / Inbound Call Notification URL',
    });
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || req.query || {};

      // Standard fields from Exotel, Knowlarity, Twilio, or Call Tracker
      const callerNumber = data.From || data.Caller || data.CallFrom || data.callerNumber || data.phone || data.mobile || '+91 98000 00000';
      const callDuration = data.DialCallDuration || data.CallDuration || data.duration || '0';
      const callStatus = (data.CallStatus || data.Status || data.DialCallStatus || 'completed').toLowerCase();
      const recordingUrl = data.RecordingUrl || data.AudioUrl || '';
      const virtualNumber = data.To || data.CalledNumber || 'Main Business Line';
      const callerName = data.callerName || data.name || `Caller ${callerNumber.slice(-4)}`;
      const noteText = data.notes || data.summary || `Inbound call on ${virtualNumber}. Duration: ${callDuration}s. Status: ${callStatus.toUpperCase()}`;

      const isMissed = callStatus === 'busy' || callStatus === 'no-answer' || callStatus === 'failed' || parseInt(callDuration, 10) === 0;

      const lead = {
        id: `lead-call-${Date.now()}`,
        contactName: callerName,
        email: `${callerNumber.replace(/[^0-9]/g, '')}@phone-inquiry.com`,
        phone: callerNumber,
        company: 'Direct Phone Caller',
        channel: 'manual', // will show as Phone Call
        channelDetail: `Inbound Call via IVR (${virtualNumber}) • Duration: ${callDuration}s`,
        receivedAt: 'Just now',
        receivedTimestamp: Date.now(),
        message: isMissed
          ? `MISSED CALL ALERT: Customer called from ${callerNumber} on ${virtualNumber}. Immediate callback required!`
          : `Phone Conversation Completed (${callDuration}s). Caller discussed commercial requirements. ${recordingUrl ? `[Recording Available]` : ''}`,
        status: isMissed ? 'new' : 'in_progress',
        leadScore: isMissed ? 'hot' : 'warm',
        scoreReason: isMissed ? 'Unanswered phone inquiry requiring urgent 5-minute callback.' : 'Connected direct voice conversation via IVR.',
        sentiment: isMissed ? 'urgent_frustrated' : 'positive',
        summary: `Voice call from ${callerNumber}. Status: ${callStatus.toUpperCase()}, Duration: ${callDuration}s.`,
        suggestedReply: `Hello! We noticed a call from your number regarding your product requirements. Our team is ready to assist you. When can we connect for 2 minutes?`,
        conversation: [
          {
            id: `msg-call-${Date.now()}`,
            sender: 'customer',
            senderName: callerName,
            text: `[Voice Call ${callStatus.toUpperCase()}] Duration: ${callDuration}s`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: 'manual',
          },
        ],
        notes: [
          {
            id: `note-call-${Date.now()}`,
            author: 'Smart Telephony Gateway',
            text: `${noteText} ${recordingUrl ? `| Audio: ${recordingUrl}` : ''}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        estimatedValue: '₹5,00,000',
        tags: [isMissed ? 'MISSED CALL' : 'Voice Call', 'IVR Inbound', virtualNumber],
        unread: true,
        slaMinutesRemaining: isMissed ? 5 : 30,
        slaStatus: isMissed ? 'urgent' : 'pending',
      };

      appendToBuffer(lead);
      return res.status(200).json({ success: true, message: 'Call lead recorded', leadId: lead.id, lead });
    } catch (err: any) {
      console.error('Call webhook error:', err);
      return res.status(500).json({ error: err.message || 'Call webhook error' });
    }
  }
}
