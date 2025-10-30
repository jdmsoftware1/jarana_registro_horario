// Worker simplificado para primer deploy
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Health check básico
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          platform: 'Cloudflare Workers',
          environment: env.NODE_ENV || 'production',
          database: env.DATABASE_URL ? 'configured' : 'missing',
          jwt_secret: env.JWT_SECRET ? 'configured' : 'missing'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Debug endpoint
      if (url.pathname === '/api/debug') {
        return new Response(JSON.stringify({
          status: 'DEBUG',
          platform: 'Cloudflare Workers',
          environment: env.NODE_ENV || 'production',
          database_url: env.DATABASE_URL ? 'configured' : 'missing',
          jwt_secret: env.JWT_SECRET ? 'configured' : 'missing',
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
        message: 'JARANA Backend API - Cloudflare Workers',
        status: 'OK',
        endpoints: ['/api/health', '/api/debug']
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
