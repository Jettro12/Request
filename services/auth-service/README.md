# 🔐 Auth Service

**Servicio de autenticación y autorización. Gestiona JWT, login, registro y sesiones de usuario.**

---

## 📋 Descripción

El **Auth Service** es responsable de:

- ✅ Autenticación de usuarios (login)
- ✅ Registro de nuevos usuarios
- ✅ Generación y validación de JWT tokens
- ✅ Gestión de contraseñas (hash con bcryptjs)
- ✅ Sesiones de usuario
- ✅ Integración con NextAuth.js (frontend)

---

## 🛠️ Stack Tecnológico

- **Express.js 4.22** - Framework HTTP
- **TypeScript 5.5** - Type safety
- **Prisma 5.20** - ORM para PostgreSQL
- **bcryptjs 3.0** - Password hashing
- **jsonwebtoken** - JWT generation & validation
- **CORS** - Cross-Origin Resource Sharing
- **PostgreSQL 11+** - Base de datos

---

## 🏃 Ejecución

### Desarrollo
```bash
npm install
npm run dev
```

Accesible en: `http://localhost:4004`

### Producción
```bash
npm run build
npm start
```

---

## 📚 Endpoints API

### POST /auth/register
Registrar nuevo usuario

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña_segura",
  "name": "Juan Pérez"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "cmk56lt4f0007qj55so4afsyi",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña_segura"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "cmk56lt4f0007qj55so4afsyi",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
Obtener usuario actual (requiere JWT)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "cmk56lt4f0007qj55so4afsyi",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "career": "Ingeniería en Sistemas",
    "semester": 6,
    "bio": "Estudiante de ingeniería",
    "role": "user",
    "rating": 4.5,
    "reviewCount": 12
  }
}
```

### POST /auth/refresh
Refrescar JWT token

**Request:**
```json
{
  "token": "token_anterior"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "nuevo_jwt_token_aqui"
}
```

### POST /auth/logout
Cerrar sesión

**Response (200):**
```json
{
  "success": true,
  "message": "Session closed"
}
```

---

## 🗄️ Modelo de Base de Datos

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  image         String?
  
  career        String?
  semester      Int?
  bio           String?
  role          String    @default("user")
  
  skills        String[]  @default([])
  interests     String[]  @default([])
  
  rating        Float     @default(0)
  reviewCount   Int       @default(0)
  
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

---

## 🔒 Seguridad

- ✅ Passwords hasheadas con bcryptjs (salt rounds: 10)
- ✅ JWT tokens con expiración (1 hora por defecto)
- ✅ Validación de email único
- ✅ CORS configurado
- ✅ Rate limiting recomendado (implementar en Nginx)

---

## 📊 Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

# JWT
JWT_SECRET=tu-secret-seguro-aqui
JWT_EXPIRATION=3600

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Servidor
PORT=4004
NODE_ENV=development
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

## 🔄 Integración con Otros Servicios

Este servicio se comunica con:
- **Frontend**: Devuelve JWT tokens para autenticación
- **NextAuth.js**: Compatible con callbacks de sesión

---

## 📝 Notas Importantes

- Los passwords nunca se devuelven en las respuestas
- Los JWT tokens deben incluirse en el header `Authorization: Bearer {token}`
- El email debe ser único en el sistema
- Se recomienda usar HTTPS en producción

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Users Service](../users-service/README.md)
- [Auth Middleware](../../frontend/src/middleware.ts)

---

**Última actualización:** Enero 2026
