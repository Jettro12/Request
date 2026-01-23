# 🖥️ Frontend - Next.js Web App

**Aplicación web principal construida con Next.js 14 con App Router. Interfaz moderna con Tailwind CSS.**

---

## 📋 Descripción

La **Frontend App** es la interfaz web principal de Request App con:

- ✅ Autenticación con NextAuth.js
- ✅ Dashboard de usuario
- ✅ Gestión de perfiles
- ✅ Creación y filtrado de posts
- ✅ Sistema de solicitudes
- ✅ Chat en tiempo real
- ✅ Notificaciones
- ✅ Responsive design

---

## 🛠️ Stack Tecnológico

- **Next.js 14.2** - Framework React fullstack
- **React 18.3** - Librería UI
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Estilos
- **NextAuth.js 4.24** - Autenticación
- **Axios** - HTTP client
- **Framer Motion** - Animaciones
- **Socket.IO** - WebSocket

---

## 📁 Estructura

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/page.tsx       # Login
│   │   ├── register/page.tsx    # Registro
│   │   ├── dashboard/page.tsx   # Dashboard
│   │   ├── profile/page.tsx     # Perfil usuario
│   │   ├── posts/page.tsx       # Posts listing
│   │   ├── requests/page.tsx    # Solicitudes
│   │   ├── chat/page.tsx        # Chat
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/             # React components
│   │   ├── ProfileAvatarUpload.tsx
│   │   ├── RequestModal.tsx
│   │   ├── PostCard.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── api.ts              # API utilities
│   │   └── utils.ts
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useNotifications.ts
│   │   └── ...
│   ├── types/                  # TypeScript types
│   ├── middleware.ts           # NextAuth middleware
│   └── globals.css             # Tailwind CSS
├── public/                     # Static assets
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🚀 Instalación

```bash
cd frontend

npm install

# Variables de entorno
cp .env.example .env.local

# Editar .env.local con tus valores
```

---

## 📝 Variables de Entorno

```env
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-seguro-aleatorio

# Proveedores OAuth (opcional)
NEXT_PUBLIC_SUPABASE_URL=tu-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Debug
DEBUG=false
```

---

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev
```

Accesible en: `http://localhost:3000`

### Compilar

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
npm run type-check
```

---

## 🔐 Autenticación (NextAuth.js)

### Archivos Clave

- [src/lib/auth.ts](./src/lib/auth.ts) - Configuración NextAuth
- [src/middleware.ts](./src/middleware.ts) - Middleware de sesión
- [src/app/api/auth/[...nextauth]/route.ts](./src/app/api/auth/[...nextauth]/route.ts) - Endpoints Auth

### Flujo de Login

```typescript
import { signIn } from 'next-auth/react';

// Login
await signIn('credentials', {
  email: 'usuario@example.com',
  password: 'password',
  redirect: true,
  callbackUrl: '/dashboard',
});

// Logout
import { signOut } from 'next-auth/react';
await signOut({ redirect: true, callbackUrl: '/' });
```

### Obtener Sesión

```typescript
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Cargando...</div>;
  if (status === "unauthenticated") return <div>No autenticado</div>;

  return <div>Bienvenido, {session.user.name}</div>;
}
```

---

## 🎨 Componentes Principales

### Home Page

```typescript
// Página de inicio
// Muestra landing page con CTA para login
```

### Dashboard

```typescript
// Panel principal del usuario
// Estadísticas, posts recientes, solicitudes pendientes
```

### Posts

```typescript
// Listado de posts
// Filtros por carrera, skills, tipo
// Crear nuevo post
```

### Requests

```typescript
// Gestión de solicitudes
// Solicitudes recibidas y enviadas
// Chat integrado
```

### Profile

```typescript
// Perfil de usuario
// Editar información
// Upload de avatar
// Mostrar skills e intereses
```

### Chat

```typescript
// Chat en tiempo real
// Conexión WebSocket
// Historial de mensajes
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📦 Build y Deploy

### Build para Producción

```bash
npm run build
```

Genera:

- `.next/standalone` - Aplicación optimizada
- `.next/static` - Assets estáticos
- Próxima versión lista para deployment

### Docker

```bash
# Build imagen
docker build -t request-app-frontend:latest .

# Run container
docker run -p 3000:3000 request-app-frontend:latest
```

---

## 🔄 API Calls

### Ejemplo con Axios

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
const getPosts = async () => {
  const response = await apiClient.get('/posts');
  return response.data;
};
```

---

## 🎥 Animaciones

Usando **Framer Motion** para animaciones suaves:

```typescript
import { motion } from 'framer-motion';

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Contenido animado
    </motion.div>
  );
}
```

---

## 📱 Responsive Design

Diseño totalmente responsivo con Tailwind CSS breakpoints:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Columna en mobile, 2 en tablet, 3 en desktop */}
</div>
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Auth Service](../../services/auth-service/README.md)
- [Deployment Guide](../../DEPLOYMENT.md)
- [NextAuth Docs](https://next-auth.js.org/)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

## 💡 Consejos de Desarrollo

1. **Hot Reload**: Los cambios se aplican instantáneamente en dev
2. **Type Safety**: TypeScript en modo strict
3. **API Routes**: Usa `src/app/api` para endpoints locales
4. **Environment Variables**: Prefija con `NEXT_PUBLIC_` para client-side
5. **Sessions**: NextAuth maneja sesiones automáticamente

---

**Última actualización:** Enero 2026
