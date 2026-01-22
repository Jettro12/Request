# Análisis de Redis, Kafka y RabbitMQ en Request-App

## 📊 Resumen General

La arquitectura del proyecto utiliza **3 tecnologías de mensajería/almacenamiento**:

| Tecnología | Propósito | Servicios | Estado |
|-----------|----------|----------|--------|
| **Kafka** | Event Streaming asíncrono | Posts, Requests, Messages, Conversations, Chat, Notifications | ✅ **ACTIVO** |
| **Redis** | Cache/Session storage y Pub/Sub | Chat-service | ✅ **ACTIVO** |
| **RabbitMQ** | Message Broker (legacy) | Users, Auth, Posts | ⚠️ **PARCIALMENTE** |

---

## 🎯 KAFKA - Event Streaming Principal

### Configuración Infrastructure

**Docker Compose** (`docker-compose.yaml`):
```yaml
kafka:
  image: confluentinc/cp-kafka:7.5.0
  container_name: kafka
  ports:
    - "9092:9092"
  depends_on:
    - zookeeper
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

zookeeper:
  image: confluentinc/cp-zookeeper:7.5.0
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
```

**Override Development** (`docker-compose.override.yml`):
```yaml
kafka:
  environment:
    KAFKA_LOG_RETENTION_HOURS: 24
    KAFKA_LOG_RETENTION_BYTES: -1
```

### Servicios que Usan Kafka

#### 1️⃣ **POSTS-SERVICE** (Puerto 4002)
- **Rol**: Producer de eventos
- **Archivo**: `services/posts-service/src/kafka.ts`
- **Topics Producidos**:
  - `posts` - Eventos de creación, actualización, eliminación de posts

**Eventos Enviados** (`postsController.ts`):
```typescript
// Al crear post
await producer.send({
  topic: POSTS_TOPIC,
  messages: [{
    key: post.id,
    value: JSON.stringify({ action: "create", post })
  }]
});

// Al actualizar post
await producer.send({
  topic: "posts",
  messages: [{
    key: post.id,
    value: JSON.stringify({ action: "update", post })
  }]
});

// Al eliminar post
await producer.send({
  topic: "posts",
  messages: [{
    key: postId,
    value: JSON.stringify({ action: "delete", postId })
  }]
});
```

**Configuración Kafka** (`kafka.ts`):
```typescript
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "posts-service";

export const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [KAFKA_BROKER],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export const POSTS_TOPIC = "posts";
```

---

#### 2️⃣ **REQUESTS-SERVICE** (Puerto 4003)
- **Rol**: Producer y Consumer de eventos
- **Archivo**: `services/requests-service/src/kafka.ts`
- **Topics**: `requests`

**Eventos Enviados** (`requestsController.ts`):
```typescript
// Al crear request (colaboración, mentoría, etc.)
await producer.send({
  topic: REQUESTS_TOPIC,
  messages: [{
    key: request.id,
    value: JSON.stringify({ action: "request.created", request })
  }]
});

// Al aceptar request
await producer.send({
  topic: REQUESTS_TOPIC,
  messages: [{
    key: request.id,
    value: JSON.stringify({ action: "request.accepted", request })
  }]
});
```

**Configuración**:
```typescript
export const REQUESTS_TOPIC = process.env.REQUESTS_TOPIC || "requests";

export async function initKafka() {
  const admin = kafka.admin();
  await admin.createTopics({
    topics: [{ topic: REQUESTS_TOPIC, numPartitions: 1 }],
    waitForLeaders: true,
  });
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: REQUESTS_TOPIC, fromBeginning: false });
}
```

---

#### 3️⃣ **MESSAGES-SERVICE** (Puerto 4008)
- **Rol**: Producer de eventos de mensajes
- **Temas Consumidos/Producidos**: `user-messages`

**En `index.ts`**:
```typescript
const kafka = new Kafka({
  clientId: "messages-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "messages-service-group" });

async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "user-messages", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Procesa mensajes consumidos
    }
  });
}

// Al enviar mensaje (POST /messages)
await producer.send({
  topic: "user-messages",
  messages: [{
    key: messageId,
    value: JSON.stringify({ action: "message.sent", message })
  }]
});
```

---

#### 4️⃣ **CONVERSATIONS-SERVICE** (Puerto 4009)
- **Rol**: Producer de eventos de conversaciones
- **Topic**: `conversations`

```typescript
const kafka = new Kafka({
  clientId: "conversations-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({
    topic: "conversation-created",
    fromBeginning: false,
  });
  // Procesa eventos...
}

// Al crear conversación
await producer.send({
  topic: "conversation-created",
  messages: [{
    key: conversationId,
    value: JSON.stringify({ action: "conversation.created", conversation })
  }]
});
```

---

#### 5️⃣ **NOTIFICATION-SERVICE** (Puerto 4001)
- **Rol**: Consumer de eventos de otros servicios ⭐
- **Archivo**: `services/notification-service/src/kafka.ts`
- **Topics Consumidos**: `notifications`, `requests`, `posts`, etc.

**Configuración**:
```typescript
export const NOTIFICATION_TOPIC = 
  process.env.NOTIFICATION_TOPIC || "notifications";

export async function initKafka() {
  const admin = kafka.admin();
  
  // Crea el topic si no existe
  await admin.createTopics({
    topics: [{ topic: NOTIFICATION_TOPIC, numPartitions: 1 }],
    waitForLeaders: true,
  });

  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({
    topic: NOTIFICATION_TOPIC,
    fromBeginning: false,
  });
}

// Inicia un loop resiliente
export async function startConsumerLoop(eachMessageHandler: any) {
  const restartDelay = 2000;
  while (true) {
    try {
      await consumer.run({ eachMessage: eachMessageHandler });
      console.warn("Kafka consumer.run exited — restarting...");
    } catch (err) {
      console.error("Kafka consumer failed, will restart:", err);
    }
    await sleep(restartDelay);
  }
}
```

**En `index.ts`**:
```typescript
async function start() {
  await initKafka();

  // Consumer loop tipado
  startConsumerLoop(
    async ({ topic, partition, message }) => {
      const { value } = message;
      if (!value) return;

      const event = JSON.parse(value.toString());
      console.log(`📨 Event received: ${topic}`, event);
      
      // Procesa eventos de:
      // - requests creadas
      // - posts creadas
      // - messages enviados
      // - Y genera notificaciones para los usuarios
    }
  );
}
```

**Flujo de Notificaciones**:
```
Posts Service    ──(post.created)──┐
                                   │
Requests Service ──(request.created)──┤──► Kafka Topic ──► Notification Service
                                   │    (notifications,    │
Messages Service ──(message.sent)──┘     requests,etc)    ├─► DB
                                                           └─► Socket.IO
Chat Service ────────────────────────────────────────────► Notifications
```

---

#### 6️⃣ **CHAT-SERVICE** (Puerto 4010)
- **Rol**: Producer y Consumer de eventos
- **Topics**: `message-sent`, `conversation-created`
- **También usa**: Redis (ver sección Redis)

```typescript
const kafka = new Kafka({
  clientId: "chat-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

async function connectKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: "message-sent", fromBeginning: false });
  await consumer.subscribe({
    topic: "conversation-created",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      
      // Emite a través de Socket.IO
      io.to(event.conversationId).emit("new-message", event);
      io.to(event.userId).emit("notification", event);
    }
  });
}
```

---

### Topics de Kafka

| Topic | Producer | Consumer | Propósito |
|-------|----------|----------|-----------|
| `posts` | Posts Service | Notification Service | Eventos de posts |
| `requests` | Requests Service | Notification Service | Eventos de requests/colaboraciones |
| `user-messages` | Messages Service | Chat Service, Notifications | Mensajes de usuarios |
| `message-sent` | Chat Service | Chat Service, Conversations | Mensajes enviados |
| `conversation-created` | Conversations Service | Chat Service | Conversaciones creadas |
| `notifications` | Notification Service | - | Notificaciones (topic principal) |

---

## 🔴 RABBITMQ - Legacy Message Broker

### Configuración Infrastructure

```yaml
rabbitmq:
  image: rabbitmq:3.13-management-alpine
  container_name: rabbitmq
  environment:
    RABBITMQ_DEFAULT_USER: admin
    RABBITMQ_DEFAULT_PASS: admin123
  ports:
    - "5672:5672"      # AMQP
    - "15672:15672"    # Management UI (http://localhost:15672)
  networks:
    - microservices-net
```

### Servicios que Usan RabbitMQ

#### 1️⃣ **USERS-SERVICE** (Puerto 4007)
- **Rol**: Consumer de eventos
- **Archivo**: `services/users-service/src/events/consumer.ts`
- **Propósito**: Recibe eventos de creación/actualización de usuarios

**Configuración**:
```typescript
export class EventConsumer {
  private rabbitmqUrl: string;
  private queueName = "users-service-queue";

  constructor() {
    this.rabbitmqUrl =
      process.env.RABBITMQ_URL || 
      "amqp://admin:admin123@rabbitmq:5672";
  }

  async connect() {
    this.connection = await amqp.connect(this.rabbitmqUrl);
    this.channel = await this.connection.createChannel();

    // Exchange: fanout (broadcast a todas las colas)
    await this.channel.assertExchange("user-events", "fanout", {
      durable: true,
    });

    // Cola específica del servicio
    const queue = await this.channel.assertQueue(
      this.queueName,
      { exclusive: false, durable: true }
    );

    // Bind: todas las rutas van a esta cola
    await this.channel.bindQueue(queue.queue, "user-events", "");
  }

  async startConsuming(userService: any) {
    this.channel.consume(
      this.queueName,
      async (message: any) => {
        const event = JSON.parse(message.content.toString());
        console.log(`📥 Received event: ${event.type}`, event.data);

        switch (event.type) {
          case "USER_CREATED":
            await this.handleUserCreated(event.data, userService);
            break;
          case "USER_UPDATED":
            await this.handleUserUpdated(event.data, userService);
            break;
        }

        this.channel.ack(message); // Confirma consumo
      },
      { noAck: false }
    );
  }

  async handleUserCreated(userData: any, userService: any) {
    // Crea perfil de usuario
    await userService.createUserProfile({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image || "",
      role: userData.role || "user",
    });
  }

  async handleUserUpdated(userData: any, userService: any) {
    // Actualiza perfil de usuario
    await userService.updateUserProfile(userData.id, userData);
  }
}
```

**En `index.ts`**:
```typescript
async function start() {
  const eventConsumer = new EventConsumer();
  await eventConsumer.connect();

  try {
    await eventConsumer.startConsuming(userService);
    console.log("✅ RabbitMQ consumer started");
  } catch (err) {
    console.warn("⚠️ RabbitMQ consumer not running:", err.message);
  }
}
```

#### 2️⃣ **AUTH-SERVICE** (Puerto 4004)
- **Rol**: Producer de eventos (en docker-compose)
- **Variables de entorno**: `RABBITMQ_URL: amqp://admin:admin123@rabbitmq:5672`
- **Propósito**: Publica eventos de autenticación

---

#### 3️⃣ **POSTS-SERVICE** (Puerto 4002)
- **Rol**: Producer de eventos (en docker-compose)
- **Variables de entorno**: `RABBITMQ_URL` configurada
- **Propósito**: Publica eventos de creación/actualización de posts

---

### Exchange & Queues RabbitMQ

| Recurso | Tipo | Durable | Descripción |
|---------|------|--------|-------------|
| `user-events` | Exchange Fanout | Sí | Broadcast de eventos de usuario |
| `users-service-queue` | Queue | Sí | Cola del servicio de usuarios |
| `auth-service-queue` | Queue | Sí | Cola del servicio de auth |
| `posts-service-queue` | Queue | Sí | Cola del servicio de posts |

### Flujo RabbitMQ

```
Auth Service  ──┐
                ├──► user-events (fanout exchange)
Users Service ──┤    │
                └────┤────► users-service-queue ──► Users Service consume
                     ├────► auth-service-queue ──► Auth Service consume
                     └────► posts-service-queue ──► Posts Service consume
```

---

## 🔵 REDIS - Cache & Session Storage

### Configuración Infrastructure

```yaml
redis:
  image: redis:7-alpine
  container_name: redis
  ports:
    - "6379:6379"
  networks:
    - microservices-net
```

### Servicio que Usa Redis

#### **CHAT-SERVICE** (Puerto 4010)
- **Librería**: `ioredis` (v5.3.2)
- **Propósito**: Cache de mensajes, salas de chat, sesiones

**Configuración**:
```typescript
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
```

**Usos en Chat Service**:

1. **Almacenar información de salas** (`/rooms/:roomId`):
```typescript
app.get("/rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const roomInfo = await redis.hgetall(`room:${roomId}`);
  res.json(roomInfo);
});
```

2. **Conexión de usuarios en tiempo real**:
```typescript
const userSockets = new Map<string, string>(); // Usuario -> Socket ID
const socketUsers = new Map<string, string>();  // Socket ID -> Usuario

io.on("connection", (socket) => {
  socket.on("join", (userId: string) => {
    socket.join(userId);
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    
    // Publica estado en Redis
    redis.hset(`user:${userId}:status`, "online", "true");
  });

  socket.on("disconnect", () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      redis.hdel(`user:${userId}:status`, "online");
    }
  });
});
```

3. **Pub/Sub para broadcast**:
```typescript
// Redis Pub/Sub para mensajes en tiempo real
redis.subscribe("chat:messages", (err) => {
  if (err) console.error("Failed to subscribe:", err);
  else console.log("Subscribed to chat:messages");
});

redis.on("message", (channel, message) => {
  const data = JSON.parse(message);
  io.to(data.conversationId).emit("new-message", data);
});
```

**Salud de Redis en Health Check**:
```typescript
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "chat-service",
    connections: io.engine.clientsCount,
    kafka: "connected",
    redis: redis.status === "ready" ? "connected" : "disconnected",
  });
});
```

---

## 🔄 Flujo Completo de Eventos

### Ejemplo 1: Crear un Post

```
1. Frontend POST /api/posts
   │
   ├─→ Posts Service (4002)
       ├─ Crea post en DB (Prisma)
       ├─ Envía a Kafka: {action: "create", post}
       │  └─→ Topic: "posts"
       │
       └─→ Kafka Topic "posts"
           └─→ Notification Service consume
               ├─ Crea notificación en DB
               └─ Emite por Socket.IO
                   └─→ Frontend recibe notificación
```

### Ejemplo 2: Crear una Solicitud de Colaboración

```
1. Frontend POST /api/requests
   │
   ├─→ Requests Service (4003)
       ├─ Crea request en DB
       ├─ Envía a Kafka: {action: "request.created", request}
       │  └─→ Topic: "requests"
       │
       └─→ Kafka Topic "requests"
           └─→ Notification Service consume
               ├─ Genera notificación para usuario receptor
               ├─ Emite por Socket.IO
               └─→ Frontend notifica al usuario
```

### Ejemplo 3: Chat en Tiempo Real

```
1. Frontend envía mensaje en chat
   │
   ├─→ Chat Service (4010)
       ├─ Crea mensaje en Memory/Redis
       ├─ Emite por Socket.IO a todos en la sala
       ├─ Envía a Kafka: {action: "message.sent", message}
       │  └─→ Topic: "message-sent"
       │
       ├─→ Redis Pub/Sub
       │   └─ Sincroniza estado entre instancias
       │
       └─→ Kafka Topic "message-sent"
           └─→ Notifications Service consume
               └─ Crea notificación de mensaje

2. Chat Service consume del Kafka
   ├─ Recibe evento de mensaje enviado
   └─ Emite por Socket.IO: "new-message"
```

### Ejemplo 4: Usuarios escuchando cambios

```
1. Auth Service crea usuario
   │
   ├─ Publica a RabbitMQ exchange: "user-events"
   │  └─→ Exchange Type: fanout (broadcast)
   │
   └─→ RabbitMQ Queues
       ├─ users-service-queue
       │  └─ Users Service consume
       │     └─ Crea perfil de usuario
       │
       ├─ auth-service-queue
       │  └─ Auth Service consume
       │
       └─ posts-service-queue
           └─ Posts Service consume
```

---

## 📊 Comparativa de Tecnologías

| Aspecto | Kafka | RabbitMQ | Redis |
|--------|-------|----------|-------|
| **Tipo** | Event Streaming | Message Broker | In-Memory Cache |
| **Propósito** | Events history, Topics | Queues, Exchanges | Sessions, Cache |
| **Persistencia** | ✅ Sí (24h en dev) | ✅ Sí | ❌ No (volatile) |
| **Garantía Entrega** | Al menos una vez | Ack-based | Best effort |
| **Escalabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Latencia** | Media (~100ms) | Baja (~10ms) | Muy baja (~1ms) |
| **Caso de Uso** | Eventos históricos | Tareas asíncronas | Real-time, caché |
| **Status** | ✅ Activo | ⚠️ Legacy | ✅ Activo |

---

## 🔧 Variables de Entorno

### Kafka
```bash
KAFKA_BROKER=kafka:9092
KAFKA_CLIENT_ID=<service-name>
KAFKA_GROUP_ID=<service-name>-group
```

### RabbitMQ
```bash
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
```

### Redis
```bash
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 📈 Observabilidad

### Health Checks

**Posts Service**: `GET http://localhost:4002/health`
```json
{ "status": "ok", "service": "posts-service" }
```

**Chat Service**: `GET http://localhost:4010/health`
```json
{
  "status": "OK",
  "service": "chat-service",
  "connections": 5,
  "kafka": "connected",
  "redis": "connected"
}
```

**Notification Service**: `GET http://localhost:4001/health`
```json
{
  "status": "ok",
  "service": "notification-service",
  "db": "ok"
}
```

### Management UIs

- **RabbitMQ Management**: `http://localhost:15672`
  - Usuario: `admin`
  - Contraseña: `admin123`
  - Ver exchanges, queues, conexiones

---

## 🚀 Comandos Útiles

### Ver logs de Kafka
```bash
docker compose logs -f kafka
docker compose logs -f notification-service
```

### Ver logs de RabbitMQ
```bash
docker compose logs -f rabbitmq
docker compose logs -f users-service
```

### Ver logs de Redis
```bash
docker compose logs -f chat-service
# O conectar directamente:
redis-cli -h localhost -p 6379
```

### Monitorear topics Kafka
```bash
# Dentro del contenedor kafka
kafka-topics --bootstrap-server localhost:9092 --list
kafka-console-consumer --bootstrap-server localhost:9092 --topic posts --from-beginning
```

---

## ⚠️ Problemas Comunes

### Kafka no se conecta
```bash
# Verificar que Zookeeper esté levantado
docker compose ps

# Reiniciar Kafka
docker compose restart kafka
```

### RabbitMQ conexión rechazada
```bash
# Verificar credenciales
docker compose logs rabbitmq

# Revisar Management UI: http://localhost:15672
```

### Redis no sincroniza
```bash
# Chat Service puede fallar si Redis no responde
docker compose restart redis
```

---

## 📝 Resumen por Servicio

| Servicio | Kafka | RabbitMQ | Redis | Responsabilidad |
|----------|-------|----------|-------|---|
| **Posts** | Producer | Producer | - | Crear/editar posts |
| **Requests** | Producer/Consumer | - | - | Solicitudes de colaboración |
| **Messages** | Producer/Consumer | - | - | Mensajes entre usuarios |
| **Conversations** | Producer/Consumer | - | - | Conversaciones |
| **Chat** | Producer/Consumer | - | Consumer | Chat real-time |
| **Notifications** | Consumer | - | - | Distribuye notificaciones |
| **Users** | - | Consumer | - | Sincroniza usuarios |
| **Auth** | - | Producer | - | Eventos de autenticación |

---

**Última actualización**: Enero 2026
