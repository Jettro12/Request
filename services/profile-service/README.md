# 👤 Profile Service

**Servicio de perfiles de usuario. Maneja información extendida de perfiles y datos públicos.**

---

## 📋 Descripción

El **Profile Service** es responsable de:

- ✅ Obtener perfil público de usuario
- ✅ Datos de carrera y semestre
- ✅ Skills e intereses del usuario
- ✅ Historial de actividades
- ✅ Estadísticas de usuario

---

## 🛠️ Stack Tecnológico

- **Express.js 4.22** - Framework HTTP
- **TypeScript 5.5** - Type safety
- **Prisma 5.20** - ORM
- **PostgreSQL 11+** - Base de datos

---

## 🏃 Ejecución

### Desarrollo
```bash
npm install
npm run dev
```

Accesible en: `http://localhost:4005`

### Producción
```bash
npm run build
npm start
```

---

## 📚 Endpoints API

### GET /profile/:userId
Obtener perfil público de usuario

**Response (200):**
```json
{
  "success": true,
  "profile": {
    "id": "cmk56lt4f0007qj55so4afsyi",
    "name": "Juan Pérez",
    "bio": "Apasionado por web development",
    "career": "Ingeniería en Sistemas",
    "semester": 6,
    "image": "https://cdn.example.com/avatar.jpg",
    "skills": ["JavaScript", "React", "Node.js"],
    "interests": ["IA", "Web Development"],
    "rating": 4.5,
    "reviewCount": 12,
    "totalProjects": 5,
    "totalCollaborations": 8,
    "joinedAt": "2023-01-15T10:30:00Z"
  }
}
```

### GET /profile/:userId/stats
Obtener estadísticas de usuario

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "userId": "cmk56lt4f0007qj55so4afsyi",
    "totalPosts": 15,
    "totalRequests": 10,
    "acceptedRequests": 8,
    "completedRequests": 6,
    "averageRating": 4.5,
    "totalReviews": 12,
    "activeCollaborations": 2,
    "followers": 25,
    "following": 18
  }
}
```

### GET /profile/:userId/recommendations
Obtener recomendaciones de colaboradores

**Query Parameters:**
```
?limit=10
&skill=React
```

**Response (200):**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "cmk56lt4f0008qj55so4afsy0",
      "name": "María García",
      "career": "Ingeniería en Sistemas",
      "skills": ["React", "TypeScript"],
      "rating": 4.7,
      "matchScore": 0.95
    }
  ],
  "count": 1
}
```

---

## 📊 Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/request_app

# Servidor
PORT=4005
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🧪 Testing

```bash
npm run test
npm run test:integration
npm run test:coverage
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Users Service](../users-service/README.md)

---

**Última actualización:** Enero 2026
