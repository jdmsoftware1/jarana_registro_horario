// Worker con Cloudflare Access integrado
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Obtener información del usuario desde Cloudflare Access
      const userEmail = request.headers.get('CF-Access-Authenticated-User-Email');
      const userName = request.headers.get('CF-Access-Authenticated-User-Name');
      const userId = request.headers.get('CF-Access-Authenticated-User-ID');
      
      // Verificar Service Token para autenticación de servicio
      const clientId = request.headers.get('CF-Access-Client-Id');
      const clientSecret = request.headers.get('CF-Access-Client-Secret');
      const isServiceAuth = clientId && clientSecret;
      
      // Validar Service Token
      const validServiceToken = clientId === 'f8be2fa610a6a7e18c57581097319bc7.access' && 
                               clientSecret === 'f5ad25eccd4cc76870a546357171296a3caf8a261ba6e2c87a8cee66bcac65d8';
      
      // Health check (público)
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          platform: 'Cloudflare Workers + Access',
          environment: env.NODE_ENV || 'production',
          database: env.DATABASE_URL ? 'configured' : 'missing',
          auth: 'Cloudflare Access',
          user_authenticated: !!userEmail
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
          auth_method: 'Cloudflare Access + Service Token',
          user_info: {
            email: userEmail || 'not authenticated',
            name: userName || 'not authenticated',
            id: userId || 'not authenticated',
            authenticated: !!userEmail
          },
          service_auth: {
            client_id: clientId || 'missing',
            client_secret: clientSecret ? 'configured' : 'missing',
            is_service_auth: isServiceAuth,
            valid_service_token: validServiceToken
          },
          access_headers: {
            'CF-Access-Authenticated-User-Email': userEmail || 'missing',
            'CF-Access-Authenticated-User-Name': userName || 'missing',
            'CF-Access-Authenticated-User-ID': userId || 'missing',
            'CF-Access-Client-Id': clientId || 'missing',
            'CF-Access-Client-Secret': clientSecret ? 'present' : 'missing'
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
      
      // Perfil del usuario (protegido)
      if (url.pathname === '/api/user/profile') {
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
        
        return new Response(JSON.stringify({
          user: {
            email: userEmail,
            name: userName || userEmail.split('@')[0],
            id: userId || 'cf-' + userEmail.replace('@', '-'),
            authenticated: true,
            auth_method: 'Cloudflare Access',
            role: userEmail.includes('@admin.') ? 'admin' : 'employee' // Ejemplo de lógica de roles
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
      
      // Endpoints protegidos - verificar autenticación
      if (url.pathname.startsWith('/api/')) {
        // Verificar si está autenticado (usuario o service token)
        const isAuthenticated = userEmail || validServiceToken;
        
        if (!isAuthenticated) {
          return new Response(JSON.stringify({
            error: 'Authentication required',
            message: 'Please authenticate through Cloudflare Access or provide valid Service Token',
            redirect: '/cdn-cgi/access/login',
            service_auth: 'Use CF-Access-Client-Id and CF-Access-Client-Secret headers'
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        // Ejemplo de endpoints protegidos
        if (url.pathname === '/api/employees') {
          return new Response(JSON.stringify({
            message: 'Employees endpoint',
            auth_type: validServiceToken ? 'service_token' : 'user_auth',
            user: userEmail || 'service_account',
            service_auth: validServiceToken,
            data: [
              { id: 1, name: 'Juan Pérez', email: 'juan@empresa.com' },
              { id: 2, name: 'María García', email: 'maria@empresa.com' }
            ],
            authenticated: true
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        if (url.pathname === '/api/records') {
          return new Response(JSON.stringify({
            message: 'Records endpoint',
            user: userEmail,
            data: [
              { id: 1, employee: userEmail, type: 'checkin', timestamp: new Date().toISOString() }
            ],
            authenticated: true
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        // Endpoint genérico protegido
        return new Response(JSON.stringify({
          message: 'Protected endpoint',
          user: userEmail,
          endpoint: url.pathname,
          status: 'authenticated',
          note: 'This endpoint is protected by Cloudflare Access'
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
        user: userEmail || 'not authenticated',
        endpoints: ['/api/health', '/api/debug', '/api/user/profile', '/api/employees', '/api/records']
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
