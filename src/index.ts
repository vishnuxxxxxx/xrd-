export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. അഡ്മിൻ പാത്തുകൾ അല്ലെങ്കിൽ എഡിറ്റ് ചെയ്യുന്ന റൂട്ടുകൾ സെക്യൂർ ചെയ്യാൻ IP പരിശോധിക്കുന്നു
    const clientIP = request.headers.get('cf-connecting-ip');
    
    // ⚠️ നിങ്ങളുടെ പബ്ലിക് IP അഡ്രസ്സ് ഇവിടെ നൽകുക
    const ALLOWED_IP = '27.63.237.118'; 

    // അഡ്മിൻ റൂട്ടുകളോ POST റിക്വസ്റ്റുകളോ തടയാൻ
    if (url.pathname.startsWith('/admin') || (url.pathname === '/api/services' && request.method === 'POST')) {
      if (clientIP !== ALLOWED_IP) {
        return new Response(JSON.stringify({ error: 'Access Denied: Unauthorized IP' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/services') {
      // 2. GET Request: സർവീസുകൾ ഫെച്ച് ചെയ്യാൻ (എല്ലാവർക്കും കാണാം)
      if (request.method === 'GET') {
        try {
          const servicesData = await env.KV.get('services');
          const services = servicesData ? JSON.parse(servicesData) : [];
          return new Response(JSON.stringify(services), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch services' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // 3. POST Request: പുതിയ സർവീസ് ചേർക്കാനും എഡിറ്റ് ചെയ്യാനും (അനുവദിച്ച IP-ക്ക് മാത്രം)
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          await env.KV.put('services', JSON.stringify(body));
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to save services' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
