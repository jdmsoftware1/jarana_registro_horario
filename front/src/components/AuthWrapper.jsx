import React from 'react';
import { useCloudflareAuth } from '../utils/cloudflare-auth';
import { Loader2, Shield, User, LogOut } from 'lucide-react';

export function AuthWrapper({ children }) {
  const { user, authenticated, loading, logout } = useCloudflareAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            JARANA - Sistema de Registro Horario
          </h1>
          <p className="text-gray-600 mb-6">
            Autenticación requerida. Serás redirigido automáticamente al sistema de login.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              🔒 Protegido por Cloudflare Access
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con info del usuario */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                JARANA - Sistema de Registro Horario
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name || user?.email}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main>
        {children}
      </main>
    </div>
  );
}
