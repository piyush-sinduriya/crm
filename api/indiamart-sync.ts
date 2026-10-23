export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const crmKey = req.query.crmKey || req.body?.crmKey;
  if (!crmKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing IndiaMART CRM Key (GLUSR_CRM_KEY). Please provide your key.',
    });
  }

  // Format dates: IndiaMART expects dd-MMM-yyyy (e.g. 01-Jan-2026)
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Default to last 30 days if not specified
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const mon = months[d.getMonth()];
    const yr = d.getFullYear();
    return `${day}-${mon}-${yr}`;
  };

  const startTime = req.query.startTime || formatDate(thirtyDaysAgo);
  const endTime = req.query.endTime || formatDate(now);

  const indiamartUrl = `https://mapi.indiamart.com/wservce/crm/crmListing/v2/?glusr_crm_key=${encodeURIComponent(
    crmKey.trim()
  )}&start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`;

  try {
    const response = await fetch(indiamartUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OmniSync-CRM-Connector/2.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `IndiaMART API responded with HTTP status ${response.status}`,
      });
    }

    const data = await response.json();

    // Transform IndiaMART response to standard OmniSync lead format
    const rawList = Array.isArray(data?.RESPONSE) ? data.RESPONSE : [];
    
    const leads = rawList.map((item: any, idx: number) => {
      const contactName = item.SENDER_NAME || 'IndiaMART Inquirer';
      const company = item.GLUSR_USR_COMPANYNAME || item.ENQ_ADDRESS || 'Business Client';
      const phone = item.SENDER_MOBILE || item.SENDER_MOBILE_ALT || '';
      const email = item.SENDER_EMAIL || `${contactName.toLowerCase().replace(/[^a-z0-9]/g, '')}@indiamart-lead.com`;
      const productName = item.QUERY_PRODUCT_NAME || item.SUBJECT || 'Product Requirement';
      const message = item.ENQ_MESSAGE || item.SUBJECT || `Inquiry regarding ${productName}`;
      const location = [item.GLUSR_USR_CITY, item.GLUSR_USR_STATE].filter(Boolean).join(', ');

      const queryTime = item.QUERY_TIME ? new Date(item.QUERY_TIME).getTime() : Date.now();
      const validTimestamp = isNaN(queryTime) ? Date.now() : queryTime;

      return {
        id: `lead-im-${item.UNIQUE_QUERY_ID || Date.now() + idx}`,
        contactName,
        email,
        phone,
        company: location ? `${company} (${location})` : company,
        channel: 'indiamart',
        channelDetail: `IndiaMART RFQ #${item.UNIQUE_QUERY_ID || idx + 1}: ${productName}`,
        receivedAt: 'Just now',
        receivedTimestamp: validTimestamp,
        message,
        status: 'new',
        leadScore: 'hot',
        scoreReason: `Verified IndiaMART B2B buyer inquiry for "${productName}".`,
        sentiment: 'positive',
        summary: `${contactName} from ${company} requested quotation for ${productName}.`,
        suggestedReply: `Hello ${contactName.split(' ')[0]}, thank you for reaching out via IndiaMART regarding ${productName}! We have ready inventory and customized manufacturing solutions. Could we arrange a quick 5-minute phone briefing to understand your timeline and quantity?`,
        conversation: [
          {
            id: `msg-im-${Date.now()}-${idx}`,
            sender: 'customer',
            senderName: contactName,
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: 'indiamart',
          },
        ],
        notes: [
          {
            id: `note-im-${Date.now()}-${idx}`,
            author: 'IndiaMART Sync Engine',
            text: `Imported via official IndiaMART MAPI. Query Type: ${item.QUERY_TYPE || 'RFQ'}. City: ${location || 'India'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        estimatedValue: '₹5,00,000',
        tags: ['IndiaMART B2B', productName.slice(0, 25), location || 'Direct RFQ'],
        unread: true,
        slaMinutesRemaining: 15,
        slaStatus: 'urgent',
      };
    });

    return res.status(200).json({
      success: true,
      message: data.MESSAGE || `${leads.length} inquiries found from IndiaMART`,
      totalRecords: data.TOTAL_RECORDS || leads.length,
      leads,
    });
  } catch (error: any) {
    console.error('Error fetching from IndiaMART:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to connect to IndiaMART MAPI service',
    });
  }
}
