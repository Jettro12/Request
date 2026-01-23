# 💬 Messages Service

**Servicio de mensajería privada. Gestiona mensajes directos entre usuarios.**

---

## 📋 Descripción

El **Messages Service** es responsable de:

- ✅ Envío de mensajes privados
- ✅ Historial de conversaciones
- ✅ Marcar mensajes como leídos
- ✅ Eliminación de mensajes
- ✅ Búsqueda de mensajes

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

Accesible en: `http://localhost:4008`

### Producción

```bash
npm run build
npm start
```

---

## 📚 Endpoints API

### POST /messages

Enviar mensaje

**Request:**

```json
{
  "senderId": "cmk56lt4f0007qj55so4afsyi",
  "receiverId": "cmk56lt4f0008qj55so4afsy0",
  "content": "Hola, cómo estás?"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": {
    "id": "msg1",
    "senderId": "cmk56lt4f0007qj55so4afsyi",
    "receiverId": "cmk56lt4f0008qj55so4afsy0",
    "content": "Hola, cómo estás?",
    "read": false,
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### GET /messages/user/:userId/conversation/:otherUserId

Obtener conversación entre dos usuarios

**Query Parameters:**

```
?limit=50
&offset=0
```

**Response (200):**

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg1",
      "senderId": "cmk56lt4f0007qj55so4afsyi",
      "receiverId": "cmk56lt4f0008qj55so4afsy0",
      "content": "Hola, cómo estás?",
      "read": true,
      "createdAt": "2024-01-20T10:30:00Z"
    },
    {
      "id": "msg2",
      "senderId": "cmk56lt4f0008qj55so4afsy0",
      "receiverId": "cmk56lt4f0007qj55so4afsyi",
      "content": "Bien, gracias por preguntar",
      "read": true,
      "createdAt": "2024-01-20T10:35:00Z"
    }
  ],
  "total": 2
}
```

### PUT /messages/:id/read

Marcar mensaje como leído

**Response (200):**

```json
{
  "success": true,
  "message": {
    "id": "msg1",
    "read": true,
    "readAt": "2024-01-20T10:40:00Z"
  }
}
```

### DELETE /messages/:id

Eliminar mensaje

**Response (200):**

```json
{
  "success": true,
  "message": "Message deleted"
}
```

---

## 🗄️ Modelo de Base de Datos

```prisma
model DirectMessage {
  id         String   @id @default(cuid())
  content    String   @db.Text

  senderId   String
  receiverId String

  read       Boolean  @default(false)
  readAt     DateTime?

  createdAt  DateTime @default(now())
  deletedAt  DateTime?

  @@index([senderId])
  @@index([receiverId])
  @@index([createdAt])
  @@map("direct_messages")
}
```

---

## 🔄 Eventos (Kafka)

**Topics que publica:**

- `messages.sent` - Cuando se envía un mensaje
- `messages.read` - Cuando se marca como leído

---

## 📊 Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/request_app

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_GROUP_ID=messages-service

# Servidor
PORT=4008
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
- [Chat Service](../chat-service/README.md)
- [Conversations Service](../conversations-service/README.md)

---

**Última actualización:** Enero 2026
