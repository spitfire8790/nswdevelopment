export default async function handler(req, res) {
  const { path } = req.query;
  const apiUrl = 'https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA';

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds

    // Parse and validate the filters
    let filters = {};
    try {
      filters = JSON.parse(req.headers.filters);
    } catch (e) {
      console.error('Failed to parse filters:', e);
    }

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'PageSize': req.headers.pagesize || '10000',
      'PageNumber': req.headers.pagenumber || '1',
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
    console.error('Handler error:', error);
    
    if (error.name === 'AbortError') {
      res.status(504).json({ 
        error: {
          message: 'Request timeout',
          details: 'The request to the NSW Planning Portal API timed out after 60 seconds'
        }
      });
    } else {
      res.status(500).json({ 
        error: {
          message: error.message,
          details: error.stack
        }
      });
    }
  }
}
