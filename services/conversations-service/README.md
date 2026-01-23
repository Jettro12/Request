# 💬 Conversations Service

**Servicio de conversaciones. Gestiona agrupaciones de mensajes y conversaciones entre usuarios.**

---

## 📋 Descripción

El **Conversations Service** es responsable de:

- ✅ Crear conversaciones entre usuarios
- ✅ Obtener lista de conversaciones activas
- ✅ Archivar conversaciones
- ✅ Obtener historial de conversación
- ✅ Marcar conversación como leída

---

## 🛠️ Stack Tecnológico

- **Express.js 4.22** - Framework HTTP
- **TypeScript 5.5** - Type safety
- **Prisma 5.20** - ORM
- **PostgreSQL 11+** - Base de datos
- **Kafka** - Event streaming

---

## 🏃 Ejecución

### Desarrollo

```bash
npm install
npm run dev
```

Accesible en: `http://localhost:4009`

---

## 📚 Endpoints API

### POST /conversations

Crear conversación

**Request:**

```json
{
  "userId1": "cmk56lt4f0007qj55so4afsyi",
  "userId2": "cmk56lt4f0008qj55so4afsy0"
}
```

**Response (201):**

```json
{
  "success": true,
  "conversation": {
    "id": "conv1",
    "user1Id": "cmk56lt4f0007qj55so4afsyi",
    "user2Id": "cmk56lt4f0008qj55so4afsy0",
    "lastMessage": null,
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### GET /conversations/user/:userId

Obtener conversaciones del usuario

**Response (200):**

```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv1",
      "otherUser": {
        "id": "cmk56lt4f0008qj55so4afsy0",
        "name": "María García"
      },
      "lastMessage": {
        "content": "Hasta luego!",
        "createdAt": "2024-01-20T14:30:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

---

## 📊 Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@localhost:5432/request_app
KAFKA_BROKER=localhost:9092
PORT=4009
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Messages Service](../messages-service/README.md)

---

**Última actualización:** Enero 2026
