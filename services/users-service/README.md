# 👥 Users Service

**Servicio de gestión de usuarios. Maneja perfiles, información de usuario y operaciones CRUD.**

---

## 📋 Descripción

El **Users Service** es responsable de:

- ✅ Gestión completa de usuarios
- ✅ Actualización de perfiles
- ✅ Búsqueda y filtrado de usuarios
- ✅ Gestión de skills e intereses
- ✅ Cálculo de ratings agregados
- ✅ Sincronización con Auth Service

---

## 🛠️ Stack Tecnológico

- **Express.js 4.22** - Framework HTTP
- **TypeScript 5.5** - Type safety
- **Prisma 5.22** - ORM
- **PostgreSQL 11+** - Base de datos
- **RabbitMQ** - Message broker para eventos
- **CORS** - Cross-Origin Resource Sharing

---

## 🏃 Ejecución

### Desarrollo

```bash
npm install
npm run dev
```

Accesible en: `http://localhost:4007`

### Producción

```bash
npm run build
npm start
```

---

## 📚 Endpoints API

### GET /users

Obtener lista de usuarios con filtros

**Query Parameters:**

```
?search=juan
?career=Ingeniería
?semester=6
?skills=JavaScript,TypeScript
?limit=10
&offset=0
```

**Response (200):**

```json
{
  "success": true,
  "users": [
    {
      "id": "cmk56lt4f0007qj55so4afsyi",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "career": "Ingeniería en Sistemas",
      "semester": 6,
      "bio": "Apasionado por web",
      "skills": ["JavaScript", "React", "Node.js"],
      "interests": ["IA", "Web Development"],
      "rating": 4.5,
      "reviewCount": 12,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

### GET /users/:id

Obtener usuario específico

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "cmk56lt4f0007qj55so4afsyi",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "career": "Ingeniería en Sistemas",
    "semester": 6,
    "bio": "Apasionado por web",
    "skills": ["JavaScript", "React", "Node.js"],
    "interests": ["IA", "Web Development"],
    "image": "https://cdn.example.com/avatar.jpg",
    "rating": 4.5,
    "reviewCount": 12,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

### PUT /users/:id

Actualizar perfil de usuario

**Request:**

```json
{
  "name": "Juan Pérez",
  "bio": "Nuevo bio aquí",
  "career": "Ingeniería en Sistemas",
  "semester": 7,
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "interests": ["IA", "Web Development", "Cloud"],
  "image": "https://cdn.example.com/new-avatar.jpg"
}
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "cmk56lt4f0007qj55so4afsyi",
    "name": "Juan Pérez",
    "bio": "Nuevo bio aquí",
    "career": "Ingeniería en Sistemas",
    "semester": 7,
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "interests": ["IA", "Web Development", "Cloud"],
    "image": "https://cdn.example.com/new-avatar.jpg",
    "rating": 4.5,
    "reviewCount": 12,
    "updatedAt": "2024-01-20T15:00:00Z"
  }
}
```

### POST /users/search

Búsqueda avanzada de usuarios

**Request:**

```json
{
  "query": "javascript",
  "filters": {
    "career": "Ingeniería",
    "minRating": 4.0,
    "semester": [5, 6, 7]
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "results": [
    {
      "id": "cmk56lt4f0007qj55so4afsyi",
      "name": "Juan Pérez",
      "career": "Ingeniería en Sistemas",
      "rating": 4.5,
      "matchScore": 0.95
    }
  ],
  "count": 1
}
```

### DELETE /users/:id

Eliminar usuario (soft delete)

**Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
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
  bio           String    @db.Text @default("")
  role          String    @default("user")

  skills        String[]  @default([])
  interests     String[]  @default([])

  rating        Float     @default(0)
  reviewCount   Int       @default(0)

  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@index([career])
  @@index([rating])
  @@map("users")
}
```

---

## 🔄 Eventos (RabbitMQ)

**Topics que publica:**

- `users.created` - Cuando se crea un usuario
- `users.updated` - Cuando se actualiza un usuario
- `users.deleted` - Cuando se elimina un usuario

**Topics que consume:**

- `auth.user_created` - Sincroniza con Auth Service

---

## 📊 Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/request_app

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672

# Servidor
PORT=4007
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
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

## 🔐 Validaciones

- Email debe ser válido
- Nombre no puede estar vacío
- Skills e intereses son arrays de strings
- Rating está entre 0 y 5
- Semester está entre 0 y 12

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Auth Service](../auth-service/README.md)
- [Profile Service](../profile-service/README.md)

---

**Última actualización:** Enero 2026
