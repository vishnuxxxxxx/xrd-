export interface Env {
  KV: KVNamespace;
  ADMIN_PASSWORD?: string;
  ADMIN_2FA?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Admin Login Verification Endpoint
    if (url.pathname === '/api/login' && request.method === 'POST') {
      try {
        const { password, code } = await request.json();

        // Cloudflare Secrets-ൽ നിന്നുള്ള വാല്യൂസുമായി ഒത്തുനോക്കുന്നു
        const isPasswordValid = password === env.ADMIN_PASSWORD;
        const is2FAValid = code === env.ADMIN_2FA;

        if (isPasswordValid && is2FAValid) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Login request failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Services Management API
    if (url.pathname === '/api/services') {
      // GET Request: സർവീസുകൾ ഫെച്ച് ചെയ്യാൻ
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

      // POST Request: സർവീസുകൾ സേവ് ചെയ്യാൻ
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
