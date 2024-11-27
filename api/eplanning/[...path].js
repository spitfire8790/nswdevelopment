export default async function handler(req, res) {
  const { path } = req.query;
  const apiUrl = 'https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA';
  const MAX_RETRIES = 3;
  const TIMEOUT = 120000; // 2 minutes

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'PageSize, PageNumber, filters, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('API Request received:', {
      method: req.method,
      headers: req.headers,
      filters: req.headers.filters
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    let filters = {};
    try {
      filters = JSON.parse(req.headers.filters);
    } catch (e) {
      console.error('Failed to parse filters:', e);
    }

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'PageSize': '10000',
      'PageNumber': '1',
      'filters': JSON.stringify(filters)
    };

    console.log('Making request to NSW Planning Portal:', {
      url: apiUrl,
      headers: headers
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      signal: controller.signal
    }).catch(error => {
      console.error('Fetch error:', error);
      throw new Error(`Failed to connect to NSW Planning Portal: ${error.message}`);
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NSW Planning Portal API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`NSW Planning Portal API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Handler error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
}
