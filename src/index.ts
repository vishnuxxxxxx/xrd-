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

      // 2. POST Request: പുതിയ സർവീസ് ചേർക്കാനും എഡിറ്റ് ചെയ്തത് സേവ് ചെയ്യാനും
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
