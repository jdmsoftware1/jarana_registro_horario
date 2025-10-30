// Utilidades para Cloudflare Access
export class CloudflareAuth {
  
  // Verificar si el usuario está autenticado
  static async checkAuth() {
    try {
      const response = await fetch('/api/user/profile');
      if (response.status === 401) {
        return { authenticated: false };
      }
      const data = await response.json();
      return { 
        authenticated: true, 
        user: data.user 
      };
    } catch (error) {
      return { authenticated: false, error: error.message };
    }
  }
  
  // Obtener información del usuario actual
  static async getCurrentUser() {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
  // Hacer logout (redirigir a Cloudflare logout)
  static logout() {
    // Cloudflare Access logout URL
    window.location.href = '/cdn-cgi/access/logout';
  }
  
  // Wrapper para fetch que maneja auth automáticamente
  static async authenticatedFetch(url, options = {}) {
    try {
      const response = await fetch(url, options);
      
      // Si es 401, Cloudflare redirigirá automáticamente al login
      if (response.status === 401) {
        console.log('Authentication required - Cloudflare will redirect');
        // Cloudflare maneja la redirección automáticamente
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}

// Hook de React para usar la autenticación
import { useState, useEffect } from 'react';

export function useCloudflareAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    setLoading(true);
    const authResult = await CloudflareAuth.checkAuth();
    setAuthenticated(authResult.authenticated);
    setUser(authResult.user || null);
    setLoading(false);
  };
  
  const logout = () => {
    CloudflareAuth.logout();
  };
  
  return {
    user,
    authenticated,
    loading,
    logout,
    checkAuth: checkAuthStatus
  };
}
