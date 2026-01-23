# ⭐ Ratings Service

**Servicio de valoraciones y reseñas. Maneja ratings, reviews y feedback entre usuarios.**

---

## 📋 Descripción

El **Ratings Service** es responsable de:

- ✅ Crear valoraciones (1-5 estrellas)
- ✅ Escribir reseñas detalladas
- ✅ Calcular promedios de ratings
- ✅ Obtener ratings de usuario
- ✅ Eliminar valoraciones propias

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

Accesible en: `http://localhost:4006`

---

## 📚 Endpoints API

### POST /ratings

Crear valoración

**Request:**

```json
{
  "fromUserId": "cmk56lt4f0007qj55so4afsyi",
  "toUserId": "cmk56lt4f0008qj55so4afsy0",
  "requestId": "request_id_aqui",
  "rating": 5,
  "review": "Excelente experiencia colaborando, muy profesional"
}
```

**Response (201):**

```json
{
  "success": true,
  "rating": {
    "id": "rating1",
    "fromUserId": "cmk56lt4f0007qj55so4afsyi",
    "toUserId": "cmk56lt4f0008qj55so4afsy0",
    "rating": 5,
    "review": "Excelente experiencia...",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### GET /ratings/user/:userId

Obtener ratings de usuario

**Response (200):**

```json
{
  "success": true,
  "ratings": [
    {
      "id": "rating1",
      "fromUser": {
        "id": "cmk56lt4f0007qj55so4afsyi",
        "name": "Juan Pérez"
      },
      "rating": 5,
      "review": "Excelente experiencia...",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "averageRating": 4.8,
  "totalRatings": 10
}
```

### GET /ratings/user/:userId/stats

Obtener estadísticas de ratings

**Response (200):**

```json
{
  "success": true,
  "stats": {
    "userId": "cmk56lt4f0008qj55so4afsy0",
    "averageRating": 4.8,
    "totalRatings": 10,
    "distribution": {
      "5": 8,
      "4": 2,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

---

## 📊 Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@localhost:5432/request_app
PORT=4006
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Users Service](../users-service/README.md)

---

**Última actualización:** Enero 2026
