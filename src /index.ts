export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/services' && request.method === 'GET') {
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
    return new Response('Not Found', { status: 404 });
  },
};

