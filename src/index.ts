export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/services') {
      // 1. GET Request: സർവീസുകൾ ഫെച്ച് ചെയ്യാൻ
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

      // 2. POST Request: അഡ്മിൻ ഓതന്റിക്കേഷനോട് കൂടി സർവീസ് സേവ് ചെയ്യാൻ
      if (request.method === 'POST') {
        try {
          const body = await request.json();

          // Header വഴിയോ Body വഴിയോ ലഭിക്കുന്ന Password / 2FA പരിശോധിക്കുന്നു
          const adminPassword = request.headers.get('X-Admin-Password') || body.adminPassword;
          const admin2FA = request.headers.get('X-Admin-2FA') || body.admin2FA;

          // Cloudflare Secrets ലുള്ള വേരിയബിളുകളുമായി ഒത്തുനോക്കുന്നു
          if (adminPassword !== env.ADMIN_PASSWORD || admin2FA !== env.ADMIN_2FA) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Credentials' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // ഓതന്റിക്കേഷൻ ശരിയാണെങ്കിൽ ഡാറ്റ സേവ് ചെയ്യുന്നു
          const servicesToSave = body.services || body;
          await env.KV.put('services', JSON.stringify(servicesToSave));

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
