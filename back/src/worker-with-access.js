// Worker con Cloudflare Access
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Obtener información del usuario desde Cloudflare Access
      const userEmail = request.headers.get('CF-Access-Authenticated-User-Email');
      const userName = request.headers.get('CF-Access-Authenticated-User-Name');
      const userId = request.headers.get('CF-Access-Authenticated-User-ID');
      
      // Health check (público)
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          platform: 'Cloudflare Workers + Access',
          environment: env.NODE_ENV || 'production',
          database: env.DATABASE_URL ? 'configured' : 'missing',
          auth: 'Cloudflare Access'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Debug endpoint (público)
      if (url.pathname === '/api/debug') {
        return new Response(JSON.stringify({
          status: 'DEBUG',
          platform: 'Cloudflare Workers + Access',
          environment: env.NODE_ENV || 'production',
          database_url: env.DATABASE_URL ? 'configured' : 'missing',
          auth_method: 'Cloudflare Access',
          user_info: {
            email: userEmail || 'not authenticated',
            name: userName || 'not authenticated',
            id: userId || 'not authenticated'
          },
          timestamp: new Date().toISOString(),
          url: url.pathname
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Endpoints protegidos - verificar autenticación
      if (url.pathname.startsWith('/api/')) {
        if (!userEmail) {
          return new Response(JSON.stringify({
            error: 'Authentication required',
            message: 'Please authenticate through Cloudflare Access'
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        // Ejemplo de endpoint protegido
        if (url.pathname === '/api/user/profile') {
          return new Response(JSON.stringify({
            user: {
              email: userEmail,
              name: userName,
              id: userId,
              authenticated: true,
              auth_method: 'Cloudflare Access'
            },
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        // Otros endpoints protegidos
        return new Response(JSON.stringify({
          message: 'Protected endpoint',
          user: userEmail,
          endpoint: url.pathname,
          status: 'authenticated'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
      
      // Default response
      return new Response(JSON.stringify({
        message: 'JARANA Backend API - Cloudflare Workers + Access',
        status: 'OK',
        auth: 'Cloudflare Access',
        endpoints: ['/api/health', '/api/debug', '/api/user/profile']
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
