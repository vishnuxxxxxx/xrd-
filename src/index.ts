export interface Env {
  KV: KVNamespace;
  ADMIN_PASSWORD?: string;
  ADMIN_2FA?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Standard JSON Response Helper with CORS
    const jsonResponse = (data: object, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    };

    // Handle Preflight OPTIONS Request for CORS
    if (request.method === 'OPTIONS') {
      return jsonResponse({ ok: true }, 200);
    }

    // 1. Admin Login Verification Endpoint
    if (url.pathname === '/api/login' && request.method === 'POST') {
      try {
        const body = await request.json() as { password?: string; code?: string };
        const rawPassword = body.password?.trim() || '';
        const rawCode = body.code?.trim() || '';

        // Retrieve Secrets safely
        const expectedPassword = env.ADMIN_PASSWORD ? env.ADMIN_PASSWORD.trim() : '';
        const expected2FA = env.ADMIN_2FA ? env.ADMIN_2FA.trim() : '';

        // Basic sanity check to ensure secrets exist on worker
        if (!expectedPassword || !expected2FA) {
          return jsonResponse({ error: 'Server environment secrets not configured properly' }, 500);
        }

        // Compare credentials
        const isPasswordValid = rawPassword === expectedPassword;
        const is2FAValid = rawCode === expected2FA;

        if (isPasswordValid && is2FAValid) {
          return jsonResponse({ success: true, message: 'Authentication successful' }, 200);
        }

        return jsonResponse({ error: 'Invalid credentials' }, 401);
      } catch (error) {
        return jsonResponse({ error: 'Invalid JSON payload or request error' }, 400);
      }
    }

    // 2. Services Management API
    if (url.pathname === '/api/services') {
      // GET Request: Fetch services
      if (request.method === 'GET') {
        try {
          const servicesData = await env.KV.get('services');
          const services = servicesData ? JSON.parse(servicesData) : [];
          return jsonResponse(services, 200);
        } catch (error) {
          return jsonResponse({ error: 'Failed to fetch services' }, 500);
        }
      }

      // POST Request: Save services
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          await env.KV.put('services', JSON.stringify(body));
          return jsonResponse({ success: true }, 200);
        } catch (error) {
          return jsonResponse({ error: 'Failed to save services' }, 500);
        }
      }
    }

    // Default Not Found Response
    return new Response('Not Found', { status: 404 });
  },
};

