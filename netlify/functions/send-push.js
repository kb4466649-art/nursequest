// Server-side proxy for OneSignal's "create notification" REST endpoint.
//
// WHY THIS EXISTS: browsers get "Failed to fetch" / a CORS error when
// calling https://onesignal.com/api/v1/notifications directly from
// client-side JavaScript — that endpoint isn't designed to be called from
// a webpage. This tiny Netlify Function forwards the request from
// Netlify's own servers instead, where CORS doesn't apply, and hands the
// result straight back to the app. Still 100% free — Netlify Functions
// are included on Netlify's free tier (125k requests/month).
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) }; }

  const { restKey, payload } = body;
  if (!restKey || !payload) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing restKey or payload' }) };
  }

  try {
    const resp = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Basic ' + restKey
      },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    return { statusCode: resp.status, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream request to OneSignal failed: ' + e.message }) };
  }
};
