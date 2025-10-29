# 🔐 Configuración Rápida con Clerk

## ✅ **Ya Tienes Clerk Integrado**

He actualizado tu código para usar Clerk. Ahora necesitas completar la configuración:

## 📋 **Pasos Siguientes**

### **1. Configurar Variables de Entorno**

Crea el archivo `.env` en `app/front/`:
```bash
# Copia tu clave de Clerk aquí
VITE_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
VITE_API_URL=http://localhost:3000/api
```

### **2. Configurar Roles en Clerk Dashboard**

En tu dashboard de Clerk (clerk.com):

#### **Crear Usuario Admin:**
1. Ve a **Users** → **Create User**
2. Email: `admin@tuempresa.com`
3. Nombre: `Administrador`
4. En **Metadata** → **Private metadata**:
```json
{
  "role": "admin",
  "employeeCode": "ADM001"
}
```

#### **Crear Empleado:**
1. **Users** → **Create User**
2. Email: `empleado@tuempresa.com`
3. Nombre: `Juan Pérez`
4. En **Metadata** → **Private metadata**:
```json
{
  "role": "employee", 
  "employeeCode": "EMP001"
}
```

### **3. Configurar Restricciones de Acceso**

En Clerk Dashboard:
1. **User & Authentication** → **Restrictions**
2. **Sign-up mode**: `Restricted` (solo invitaciones)
3. **Allowlist**: Añadir emails autorizados

### **4. Probar la Aplicación**

```bash
# Instalar dependencias
cd app/front
npm install

# Ejecutar
npm run dev
```

## 🎯 **Flujo de Usuario**

### **Admin (admin@tuempresa.com)**
1. Va a `http://localhost:5173`
2. Clerk muestra login
3. Después del login → acceso completo
4. Puede ver `/admin` panel

### **Empleado (empleado@tuempresa.com)**
1. Va a `http://localhost:5173`
2. Clerk muestra login
3. Después del login → solo `/checkin`
4. NO puede acceder a `/admin`

## 🔧 **Configuración Avanzada**

### **Personalizar Login**
En Clerk Dashboard → **Customization**:
- Logo: Subir logo de Jarana
- Colores: Usar paleta brand (marrón/terracota)
- Texto: Personalizar mensajes

### **Configurar Dominios**
En Clerk Dashboard → **Domains**:
- Añadir tu dominio de producción
- Configurar redirects

### **Webhooks (Opcional)**
Para sincronizar usuarios con tu base de datos:
1. **Webhooks** → **Add Endpoint**
2. URL: `https://tu-api.com/webhooks/clerk`
3. Events: `user.created`, `user.updated`

## 🚀 **Para Producción**

### **Variables de Entorno Vercel**
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_tu_clave_produccion
VITE_API_URL=https://tu-app.vercel.app/api
```

### **Configurar Dominio en Clerk**
1. **Domains** → **Add domain**
2. Dominio: `tu-app.vercel.app`
3. Verificar DNS

## ✨ **Ventajas de Esta Configuración**

- ✅ **Login automático**: Clerk maneja todo
- ✅ **Roles seguros**: Metadata protegida
- ✅ **Sin JWT manual**: Clerk maneja tokens
- ✅ **UI personalizable**: Logo y colores propios
- ✅ **Escalable**: Hasta 5000 usuarios gratis

## 🆘 **Problemas Comunes**

### **Error: "Missing Publishable Key"**
- Verificar que `.env` existe en `app/front/`
- Verificar que la clave empieza con `pk_test_`

### **Error: "Unauthorized"**
- Verificar que el usuario tiene `role` en metadata
- Verificar que `employeeCode` está configurado

### **No aparece el panel admin**
- Verificar que el usuario tiene `"role": "admin"`
- Verificar en Clerk Dashboard → Users → tu usuario → Metadata

¡Ya tienes Clerk integrado! Solo necesitas configurar las variables de entorno y crear los usuarios.
