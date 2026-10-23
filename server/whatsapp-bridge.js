import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, '../.wa_auth');
const BUFFER_FILE = path.join(__dirname, '../leads-buffer.json');

// Ensure directories exist
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock = null;
let connectionStatus = 'initializing'; // 'initializing' | 'qr' | 'connecting' | 'connected' | 'disconnected'
let currentQrDataUrl = null;
let currentQrRaw = null;
let connectedPhone = null;
let pairingCode = null;
let inboundLeads = [];

// Load existing buffered leads if available
if (fs.existsSync(BUFFER_FILE)) {
  try {
    const raw = fs.readFileSync(BUFFER_FILE, 'utf-8');
    inboundLeads = JSON.parse(raw);
    if (!Array.isArray(inboundLeads)) inboundLeads = [];
  } catch (e) {
    inboundLeads = [];
  }
}

function persistLeads() {
  try {
    fs.writeFileSync(BUFFER_FILE, JSON.stringify(inboundLeads, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist leads buffer:', e.message);
  }
}

async function startWhatsAppSession() {
  console.log('🔄 Initializing Real WhatsApp Multi-Device Session...');
  connectionStatus = 'initializing';
  currentQrDataUrl = null;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true, // Also prints real QR directly in terminal for instant backup
      browser: ['OmniSync CRM', 'Chrome', '1.0.0'],
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQrRaw = qr;
        connectionStatus = 'qr';
        try {
          currentQrDataUrl = await QRCode.toDataURL(qr, {
            width: 320,
            margin: 2,
            color: {
              dark: '#020617',
              light: '#f8fafc',
            },
          });
          console.log('📱 Real WhatsApp QR Code generated! Ready to scan.');
        } catch (qrErr) {
          console.error('Failed to render QR Code:', qrErr);
        }
      }

      if (connection === 'connecting') {
        connectionStatus = 'connecting';
        console.log('⏳ Connecting to WhatsApp servers...');
      }

      if (connection === 'open') {
        connectionStatus = 'connected';
        currentQrDataUrl = null;
        currentQrRaw = null;
        pairingCode = null;

        const userJid = sock.user?.id || '';
        const rawNum = userJid.split(':')[0] || userJid.split('@')[0];
        connectedPhone = rawNum.startsWith('+') ? rawNum : `+${rawNum}`;
        console.log(`🎉 SUCCESS: Real WhatsApp Linked! Active Phone: ${connectedPhone}`);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.error || 'Unknown';
        console.log(`⚠️ Connection closed. Status: ${statusCode} Reason: ${reason}`);

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        connectionStatus = 'disconnected';

        if (shouldReconnect) {
          console.log('🔁 Reconnecting WhatsApp session in 3 seconds...');
          setTimeout(() => startWhatsAppSession(), 3000);
        } else {
          console.log('❌ Device was logged out. Resetting auth state.');
          cleanAuthState();
        }
      }
    });

    // Listen for Real Inbound Customer WhatsApp Messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid || '';
        if (remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') continue; // Skip groups & status stories

        const rawPhone = remoteJid.replace('@s.whatsapp.net', '');
        const senderPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
        const pushName = msg.pushName || `Customer (${senderPhone})`;

        // Extract message body text
        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          (msg.message.audioMessage ? '🎤 Voice message' : '📎 Shared media file');

        console.log(`📩 Real Inbound WhatsApp message received from ${pushName} (${senderPhone}): "${text}"`);

        // Check if deal is Hot based on keywords
        const lower = text.toLowerCase();
        const isHot =
          lower.includes('price') ||
          lower.includes('rate') ||
          lower.includes('cost') ||
          lower.includes('catalog') ||
          lower.includes('order') ||
          lower.includes('quotation') ||
          lower.includes('school') ||
          lower.includes('urgent') ||
          lower.includes('send') ||
          lower.includes('play');

        const now = Date.now();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Check if an existing inquiry from this phone already exists in buffer
        const existingIdx = inboundLeads.findIndex((l) => l.phone.replace(/[^0-9]/g, '') === rawPhone);

        if (existingIdx !== -1) {
          // Append message to existing lead
          const existing = inboundLeads[existingIdx];
          existing.message = text;
          existing.receivedAt = 'Just now';
          existing.receivedTimestamp = now;
          existing.unread = true;
          existing.conversation.push({
            id: `msg-${now}-${Math.random().toString(36).substring(2, 5)}`,
            sender: 'customer',
            senderName: pushName,
            text,
            timestamp: timeStr,
            channel: 'whatsapp',
          });
        } else {
          // Create new Lead object compatible with OmniSync CRM
          const newLead = {
            id: `lead-wa-real-${now}-${Math.random().toString(36).substring(2, 6)}`,
            contactName: pushName,
            email: `${rawPhone}@whatsapp.customer`,
            phone: senderPhone,
            company: 'WhatsApp Inbound Customer',
            channel: 'whatsapp',
            channelDetail: `Direct WhatsApp Chat • ${connectedPhone || 'Linked Phone'}`,
            receivedAt: 'Just now',
            receivedTimestamp: now,
            message: text,
            status: 'new',
            leadScore: isHot ? 'hot' : 'warm',
            scoreReason: isHot
              ? 'High purchase intent inquiry received directly via your linked WhatsApp.'
              : 'Direct customer message received via linked WhatsApp.',
            sentiment: 'positive',
            summary: `Inquiry from ${pushName}: "${text.length > 70 ? text.substring(0, 70) + '...' : text}"`,
            suggestedReply: `Hello ${pushName}! Thank you for messaging us. We have received your inquiry regarding our products and our team will assist you immediately.`,
            assignedAgent: {
              name: 'Piyush Sinduriya',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              email: 'piyush@schooldecor.in',
              role: 'Founder & Business Director',
            },
            conversation: [
              {
                id: `msg-${now}`,
                sender: 'customer',
                senderName: pushName,
                text,
                timestamp: timeStr,
                channel: 'whatsapp',
              },
            ],
            notes: [
              {
                id: `note-${now}`,
                author: 'Live WhatsApp Bridge',
                text: `Real inquiry ingested automatically from linked device ${connectedPhone || ''}.`,
                timestamp: 'Just now',
              },
            ],
            estimatedValue: isHot ? '₹4,50,000' : '₹1,50,000',
            tags: ['Live WhatsApp', 'Real Inquiry', isHot ? 'Hot Deal' : 'Warm'],
            unread: true,
            slaMinutesRemaining: 15,
            slaStatus: isHot ? 'urgent' : 'safe',
          };

          inboundLeads.unshift(newLead);
        }

        persistLeads();
      }
    });
  } catch (err) {
    console.error('Fatal Baileys error:', err);
    connectionStatus = 'disconnected';
  }
}

function cleanAuthState() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Failed to clean auth state:', e);
  }
  connectedPhone = null;
  currentQrDataUrl = null;
  currentQrRaw = null;
  pairingCode = null;
}

// Initialize Express REST API server
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Get Live WhatsApp Engine Status
app.get('/api/wa/status', (req, res) => {
  res.json({
    success: true,
    engine: 'Baileys Multi-Device Native Bridge',
    status: connectionStatus,
    connectedPhone,
    qrDataUrl: currentQrDataUrl,
    pairingCode,
    totalInboundLeads: inboundLeads.length,
    unreadLeadsCount: inboundLeads.filter((l) => l.unread).length,
  });
});

// 2. Fetch and sync latest incoming leads into CRM
app.get('/api/wa/leads', (req, res) => {
  const markAsRead = req.query.markRead === 'true';
  const leadsToReturn = [...inboundLeads];

  if (markAsRead) {
    inboundLeads.forEach((l) => {
      l.unread = false;
    });
    persistLeads();
  }

  res.json({
    success: true,
    leads: leadsToReturn,
  });
});

// 3. Request 8-Digit Pairing Code (Alternative to scanning QR)
app.post('/api/wa/pairing-code', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid phone number with country code' });
    }

    if (!sock) {
      return res.status(503).json({ success: false, error: 'WhatsApp socket not ready yet' });
    }

    console.log(`🔢 Requesting WhatsApp 8-digit Pairing Code for ${cleanPhone}...`);
    const code = await sock.requestPairingCode(cleanPhone);
    pairingCode = code;

    console.log(`✅ WhatsApp Pairing Code generated: ${code}`);
    res.json({
      success: true,
      pairingCode: code,
      formattedCode: `${code.substring(0, 4)}-${code.substring(4)}`,
    });
  } catch (err) {
    console.error('Failed to generate pairing code:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Send Real WhatsApp Message from the CRM
app.post('/api/wa/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Recipient phone number and message required' });
    }

    if (connectionStatus !== 'connected' || !sock) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp is not connected. Please scan the QR code first.',
      });
    }

    const cleanNumber = to.replace(/[^0-9]/g, '');
    const recipientJid = `${cleanNumber}@s.whatsapp.net`;

    console.log(`📤 Sending real WhatsApp message to ${recipientJid}: "${message}"`);
    const sent = await sock.sendMessage(recipientJid, { text: message });

    res.json({
      success: true,
      messageId: sent.key.id,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Restart / Refresh QR code
app.post('/api/wa/restart', async (req, res) => {
  console.log('🔄 Restarting WhatsApp socket to generate fresh QR...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {
      // ignore
    }
  }
  startWhatsAppSession();
  res.json({ success: true, message: 'WhatsApp session restarted' });
});

// 6. Unlink & Disconnect device
app.post('/api/wa/disconnect', async (req, res) => {
  console.log('🔌 Unlinking WhatsApp session...');
  if (sock) {
    try {
      await sock.logout();
    } catch (e) {
      // ignore
    }
  }
  cleanAuthState();
  startWhatsAppSession();
  res.json({ success: true, message: 'Device unlinked successfully' });
});

const PORT = process.env.WA_BRIDGE_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 OmniSync Real WhatsApp Bridge running on http://localhost:${PORT}`);
  console.log(`📡 Ready to scan authentic WhatsApp Web QR Code.`);
  console.log(`======================================================\n`);
  startWhatsAppSession();
});
