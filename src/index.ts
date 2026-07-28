export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. റിക്വസ്റ്റ് അയക്കുന്നയാളുടെ IP എടുക്കുന്നു
    const clientIP = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip');
    
    // ⚠️ നിങ്ങളുടെ അനുവദിക്കപ്പെട്ട IP അഡ്രസ്സ്
    const ALLOWED_IP = '27.63.237.118'; 

    // 2. അഡ്മിൻ റൂട്ടുകളും API തടയേണ്ട റൂട്ടുകളും കൃത്യമായി പരിശോധിക്കുന്നു
    const isAdminPath = url.pathname.startsWith('/admin') || url.pathname.includes('/admin');
    const isProtectedApi = (url.pathname === '/api/services' && request.method === 'POST');

    // 3. IP പരിശോധന
    if (isAdminPath || isProtectedApi) {
      if (clientIP !== ALLOWED_IP) {
        return new Response(
          JSON.stringify({ 
            error: 'Access Denied: Unauthorized IP',
            yourIP: clientIP, // ചെക്കിംഗിനായി നിങ്ങളുടെ ഇപ്പോഴത്തെ IP കാണിച്ച് തരും
            status: 'Blocked'
          }), 
          {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
          }
        );
      }
    }

    // 4. API: GET Request (എല്ലാവർക്കും ആക്സസ് ചെയ്യാം)
    if (url.pathname === '/api/services' && request.method === 'GET') {
      try {
        const servicesData = await env.KV.get('services');
        const services = servicesData ? JSON.parse(servicesData) : [];
        return new Response(JSON.stringify(services), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch services' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 5. API: POST Request (അനുവദിച്ച IP മാത്രമേ ഇവിടെ വരെ എത്തൂ)
    if (url.pathname === '/api/services' && request.method === 'POST') {
      try {
        const body = await request.json();
        await env.KV.put('services', JSON.stringify(body));
        return new Response(JSON.stringify({ success: true }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to save services' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 6. മെയിൻ വെബ്‌സൈറ്റിലെ സാധാരണ ഫയലുകൾ (HTML/JS/Assets) ലോഡ് ആകാൻ
    return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
  },
};

