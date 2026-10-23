import fs from 'fs';
import path from 'path';

const BUFFER_FILE = path.join('/tmp', 'omnisync_leads_buffer.json');

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return all leads currently buffered from live webhooks
  if (req.method === 'GET') {
    try {
      let list: any[] = [];
      if (fs.existsSync(BUFFER_FILE)) {
        const raw = fs.readFileSync(BUFFER_FILE, 'utf-8');
        list = JSON.parse(raw);
      }
      return res.status(200).json({
        success: true,
        count: list.length,
        leads: list,
      });
    } catch (err: any) {
      return res.status(200).json({ success: true, count: 0, leads: [] });
    }
  }

  // POST: Add a lead directly to the live stream
  if (req.method === 'POST') {
    try {
      const lead = req.body;
      if (!lead || !lead.id) {
        return res.status(400).json({ success: false, error: 'Invalid lead object' });
      }

      let list: any[] = [];
      if (fs.existsSync(BUFFER_FILE)) {
        const raw = fs.readFileSync(BUFFER_FILE, 'utf-8');
        list = JSON.parse(raw);
      }
      list.unshift(lead);
      if (list.length > 100) list = list.slice(0, 100);
      fs.writeFileSync(BUFFER_FILE, JSON.stringify(list));

      return res.status(200).json({ success: true, leadId: lead.id });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // DELETE: Clear buffer after client syncs
  if (req.method === 'DELETE') {
    try {
      if (fs.existsSync(BUFFER_FILE)) {
        fs.unlinkSync(BUFFER_FILE);
      }
      return res.status(200).json({ success: true, message: 'Buffer cleared' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
