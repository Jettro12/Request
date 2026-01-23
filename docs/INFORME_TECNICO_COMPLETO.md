# INFORME TÉCNICO COMPLETO
## REQUEST APP - RED UNIVERSITARIA DE COLABORACIÓN

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Autor:** Jettro  
**Clasificación:** Documentación Técnica Profesional

---

## TABLA DE CONTENIDOS

1. [Ejecutivo](#ejecutivo)
2. [Introducción](#introducción)
3. [Arquitectura General](#arquitectura-general)
4. [Infraestructura](#infraestructura)
5. [Microservicios](#microservicios)
6. [Patrones de Comunicación](#patrones-de-comunicación)
7. [Modelos de Arquitectura](#modelos-de-arquitectura)
8. [Almacenamiento de Datos](#almacenamiento-de-datos)
9. [Seguridad](#seguridad)
10. [Deployment](#deployment)
11. [Conclusiones](#conclusiones)

---

## RESUMEN EJECUTIVO

**REQUEST APP** es una plataforma completa de red universitaria que conecta estudiantes para colaboraciones, proyectos, mentoría y oportunidades académicas. El sistema fue diseñado siguiendo principios modernos de **arquitectura de microservicios**, implementando **event-driven architecture** con Kafka, garantizando escalabilidad, resiliencia y mantenibilidad.

### Objetivos Alcanzados

- ✅ **11 microservicios independientes** con responsabilidad única (SRP)
- ✅ **Event streaming** con Apache Kafka para comunicación asíncrona
- ✅ **3 aplicaciones cliente** (Web, Mobile, Desktop Admin)
- ✅ **Infraestructura moderna** con Docker, Kubernetes-ready y AWS Terraform
- ✅ **CI/CD automatizado** con GitHub Actions
- ✅ **Type-safety** en 100% del código backend

### Métricas Clave

| Métrica | Valor |
|---------|-------|
| Microservicios | 11 |
| Endpoints API | 100+ |
| Bases de Datos | 2 (PostgreSQL + MongoDB) |
| Topics Kafka | 15+ |
| Líneas de Código | ~50,000+ |
| Cobertura de Testing | En desarrollo |

---

## INTRODUCCIÓN

### Contexto del Proyecto

Request App surge de la necesidad de crear una plataforma unificada para la comunidad universitaria que facilite:

1. **Colaboraciones académicas** - Conexión entre estudiantes con intereses similares
2. **Mentoría y tutoría** - Transferencia de conocimiento
3. **Oportunidades** - Internados, trabajos, proyectos
4. **Red de contactos** - Networking profesional

### Población Objetivo

- Estudiantes de pregrado (primario)
- Profesionales en formación
- Mentores y tutores
- Coordinadores académicos

### Requisitos Funcionales Principales

- Autenticación segura y sesiones
- Perfiles de usuario detallados
- Sistema de solicitudes (collaboration requests)
- Mensajería privada y chat en tiempo real
- Notificaciones en tiempo real
- Gestión de archivos multimedia
- Sistema de valoraciones y reviews

---

## ARQUITECTURA GENERAL

### Visión General del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTES (Presentation Layer)                │
├──────────────────┬──────────────────┬──────────────────────────────┤
│  Web (Next.js)   │ Mobile (Expo)    │  Desktop Admin (Electron)   │
│  http://app      │  iOS/Android     │  Windows/Mac/Linux          │
└────────┬──────────┴────────┬─────────┴──────────────────┬──────────┘
         │                   │                            │
         └───────────────────┼────────────────────────────┘
                             │
         ┌───────────────────▼────────────────────┐
         │   API GATEWAY (Nginx Reverse Proxy)    │
         │  - Load Balancing                      │
         │  - Request Routing                     │
         │  - CORS & Security Headers             │
         │  - SSL/TLS Termination                 │
         └───────────────────┬────────────────────┘
                             │
    ┌────────────────────────┴────────────────────────┐
    │    MICROSERVICIOS (Business Logic Layer)        │
    │                                                  │
    │  ┌──────────────┐  ┌──────────────┐            │
    │  │ Auth Service │  │ Users Service│            │
    │  │   (4004)     │  │   (4007)     │            │
    │  └──────────────┘  └──────────────┘            │
    │                                                  │
    │  ┌──────────────┐  ┌──────────────┐            │
    │  │ Posts Service│  │Requests Svc  │            │
    │  │   (4002)     │  │   (4003)     │            │
    │  └──────────────┘  └──────────────┘            │
    │                                                  │
    │  ┌──────────────┐  ┌──────────────┐            │
    │  │ Files Service│  │  Chat Service│            │
    │  │   (4011)     │  │   (4010)     │            │
    │  └──────────────┘  └──────────────┘            │
    │                                                  │
    │  + Notification, Messages, Profile,            │
    │    Conversations, Ratings, etc.                │
    └────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼───┐  ┌──────▼──────┐  ┌──────▼─────┐
    │Kafka  │  │ PostgreSQL  │  │  MongoDB   │
    │Event  │  │  Primary DB │  │  Files DB  │
    │Stream │  │             │  │            │
    └───────┘  └─────────────┘  └────────────┘
```

### Principios Arquitectónicos

1. **Single Responsibility Principle (SRP)**
   - Cada microservicio tiene una única razón para cambiar
   - Responsabilidades claramente delimitadas

2. **Loose Coupling, High Cohesion**
   - Comunicación asíncrona vía Kafka (event-driven)
   - APIs REST para consultas síncronas
   - Mínima dependencia directa entre servicios

3. **Domain-Driven Design (DDD)**
   - Cada servicio representa un dominio de negocio
   - Ubiquitous Language bien definido

4. **API Gateway Pattern**
   - Nginx como punto único de entrada
   - Abstracción de topología interna
   - Centralización de cross-cutting concerns

---

## INFRAESTRUCTURA

### Componentes de Infraestructura

#### 1. API Gateway (Nginx)

**Responsabilidades:**
- Enrutamiento inteligente de requests
- Load balancing entre instancias
- CORS y headers de seguridad
- SSL/TLS termination
- Rate limiting y throttling

**Configuración:**
```nginx
# Frontend
location / { proxy_pass http://frontend:3000; }

# Microservicios
location /api/posts { proxy_pass http://posts-service:4002; }
location /api/requests { proxy_pass http://requests-service:4003; }
location /api/auth { proxy_pass http://auth-service:4004; }
# ... más servicios

# WebSocket (Chat)
location /api/chat {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://chat-service:4010;
}
```

#### 2. Almacenamiento de Datos

**PostgreSQL (Principal)**
- **Rol:** Base de datos relacional principal
- **Instancias:** 1 por servicio (microservicio isolation)
- **Versión:** PostgreSQL 11+
- **Replicación:** En producción (read replicas)
- **Backup:** Diario + PITR (Point-in-Time Recovery)

**Bases de datos por servicio:**
```
auth_service_db          → Usuarios, cuentas, sesiones
main_db (compartida)     → Posts, requests, usuarios base
users_service_db         → Perfil extendido, skills
notifications_db         → Notificaciones
messages_db              → Mensajes privados
```

**MongoDB (Files)**
- **Rol:** Almacenamiento de archivos con GridFS
- **Versión:** MongoDB 6+
- **Sharding:** Preparado para horizontal scaling
- **Índices:** Optimizados para búsquedas de archivos

#### 3. Event Streaming (Kafka)

**Arquitectura:**
```
┌─────────────────────────────────────┐
│   Apache Kafka Cluster               │
│  - Zookeeper (coordinación)          │
│  - 1+ Brokers (producción: 3+)       │
│  - Topic Replication Factor: 3       │
└─────────────────────────────────────┘
        ▲                    ▲
        │                    │
    Producers          Consumers
    (Services)         (Services)
```

**Topics Principales:**

| Topic | Productores | Consumidores | Propósito |
|-------|------------|-------------|----------|
| `posts.created` | Posts Service | Notification Svc | Notificar nuevos posts |
| `posts.updated` | Posts Service | Logging, Analytics | Auditar cambios |
| `requests.created` | Requests Svc | Notification Svc | Solicitud recibida |
| `requests.status_changed` | Requests Svc | Notifications, Ratings | Cambio de estado |
| `users.created` | Users Service | Notifications, Auth | Nuevo usuario |
| `users.updated` | Users Service | Indexing, Cache | Actualización perfil |
| `notifications.sent` | Notification Svc | Analytics, Logging | Auditar notificaciones |
| `messages.sent` | Messages Svc | Conversations Svc | Tracking de mensajes |

#### 4. Caching (Opcional - Redis)

Implementación recomendada:
- **Sesiones:** Redis para NextAuth sessions
- **Cache:** Datos frecuentes (perfiles, posts)
- **Rate Limiting:** Por IP/usuario
- **Real-time Sync:** Con Kafka

#### 5. Orquestación

**Docker:**
- Cada servicio en contenedor
- Image registry: GitHub Container Registry (GHCR)
- Compose para desarrollo local

**Kubernetes (Recomendado para producción):**
```yaml
# Ejemplo de deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posts-service
spec:
  replicas: 3  # Auto-scaling
  selector:
    matchLabels:
      app: posts-service
  template:
    metadata:
      labels:
        app: posts-service
    spec:
      containers:
      - name: posts-service
        image: ghcr.io/jettro12/posts-service:latest
        ports:
        - containerPort: 4002
        env:
        - name: KAFKA_BROKER
          value: kafka:9092
        livenessProbe:
          httpGet:
            path: /health
            port: 4002
          initialDelaySeconds: 30
```

---

## MICROSERVICIOS

### Catálogo Completo

#### 1. **Auth Service** (Puerto 4004)

**Responsabilidades:**
- Autenticación de usuarios
- Generación y validación de JWT
- Gestión de sesiones
- Recuperación de contraseña
- OAuth2 integration (opcional)

**Modelo de Datos:**
```prisma
User {
  id: String @id
  email: String @unique
  password: String (hashed)
  name: String
  image: URL
  role: enum(user, admin, moderator)
  createdAt: DateTime
  updatedAt: DateTime
}

Session {
  sessionToken: String @unique
  userId: String
  expires: DateTime
}

Account {
  provider: String
  providerAccountId: String
  userId: String
}
```

**Patrones Implementados:**
- **JWT Bearer Token Pattern:** Stateless authentication
- **Password Hashing:** bcryptjs con salt rounds: 10
- **Token Refresh:** Rotating refresh tokens

**Flujo de Autenticación:**
```
1. Cliente envía credentials (email, password)
2. Auth Service valida contra DB
3. Genera JWT token (válido 1 hora)
4. Devuelve token + refresh token
5. Cliente almacena en localStorage/httpOnly cookie
6. Siguientes requests incluyen: Authorization: Bearer {token}
7. Middleware valida token en cada request
```

---

#### 2. **Users Service** (Puerto 4007)

**Responsabilidades:**
- CRUD de usuarios
- Búsqueda y filtrado
- Gestión de skills e intereses
- Cálculo de ratings
- Sincronización con Auth Service

**Modelo de Datos:**
```prisma
User {
  id: String @id
  name: String
  email: String @unique
  career: String
  semester: Int
  bio: String
  skills: String[] (array)
  interests: String[] (array)
  rating: Float (0-5)
  reviewCount: Int
}

UserStatistics {
  userId: String @unique
  totalPosts: Int
  totalRequests: Int
  acceptedRequests: Int
  followers: Int
  following: Int
}
```

**Patrones Implementados:**
- **CQRS Pattern:** Separación read/write (optional)
- **Event Sourcing:** Cambios registrados en Kafka
- **Aggregation:** Estadísticas agregadas

**Flujo de Búsqueda:**
```
GET /users?career=Ingeniería&skills=React,Node.js&minRating=4.0

1. Validar parámetros
2. Construir query dinámica
3. Ejecutar con índices optimizados
4. Enriquecer resultados con stats
5. Paginar resultados (limit, offset)
6. Cachear en Redis (TTL: 5 minutos)
```

---

#### 3. **Posts Service** (Puerto 4002)

**Responsabilidades:**
- CRUD de posts/artículos
- Filtrado por carrera, skills, tipo
- Búsqueda full-text
- Publicación de eventos

**Modelo de Datos:**
```prisma
Post {
  id: String @id
  title: String
  content: String @db.Text
  type: enum(PROJECT, COLLABORATION, OPPORTUNITY, EXPERIENCE, TIP, QUESTION, RESOURCE)
  careerSpace: String
  skills: String[]
  authorId: String
  views: Int
  createdAt: DateTime
  updatedAt: DateTime
}

PostEngagement {
  id: String @id
  postId: String
  userId: String
  type: enum(like, comment, share)
  createdAt: DateTime
}
```

**Patrones Implementados:**
- **Time-Series Data:** Posts ordenados por fecha
- **Full-Text Search:** Búsqueda en título y contenido
- **Event Publishing:** Evento al crear/actualizar post

**Eventos Publicados:**
```json
{
  "action": "post.created",
  "post": {
    "id": "post_123",
    "title": "Buscamos desarrolladores",
    "type": "PROJECT",
    "authorId": "user_456",
    "skills": ["React", "Node.js"]
  },
  "timestamp": "2024-01-20T10:30:00Z",
  "service": "posts-service"
}
```

---

#### 4. **Requests Service** (Puerto 4003)

**Responsabilidades:**
- Gestión de solicitudes entre usuarios
- State machine (PENDING → ACCEPTED/REJECTED → COMPLETED)
- Mensajes integrados en solicitud
- Ratings y reviews al completar

**Modelo de Datos y State Machine:**
```
PENDING ──accept──> ACCEPTED ──complete──> COMPLETED
   │
   └──reject────────> REJECTED
   
   └──cancel────────> CANCELLED
```

**Estados Detallados:**

| Estado | Transiciones Válidas | Quién Puede | Acciones |
|--------|---------------------|-----------|----------|
| PENDING | ACCEPTED, REJECTED, CANCELLED | Receptor, Remitente | Esperar respuesta |
| ACCEPTED | COMPLETED, CANCELLED | Cualquiera | Comunicarse |
| REJECTED | - | - | Terminal |
| COMPLETED | - | - | Terminal (con rating) |
| CANCELLED | - | - | Terminal |

**Modelo de Datos:**
```prisma
Request {
  id: String @id
  type: enum(COLLABORATION, TUTORING, MENTORSHIP, JOB_OFFER, HELP, etc.)
  message: String @db.Text
  status: enum(PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED)
  fromUserId: String
  toUserId: String
  createdAt: DateTime
  completedAt: DateTime?
  fromUserRating: Int? (1-5)
  fromUserReview: String?
  toUserRating: Int? (1-5)
  toUserReview: String?
}

RequestMessage {
  id: String @id
  content: String @db.Text
  senderId: String
  receiverId: String
  requestId: String (FK)
  createdAt: DateTime
}
```

**Flujo de Solicitud:**
```
1. Usuario A crea solicitud a Usuario B
   - Validar que A ≠ B
   - Validar que no haya PENDING previa
   - Crear Request en DB
   - Publicar evento: requests.created
   - Notificar a Usuario B

2. Usuario B recibe notificación
   - Puede ACEPTAR o RECHAZAR
   - Publica evento: requests.status_changed
   - Notifica a Usuario A

3. Si ACEPTADA:
   - Ambos pueden enviar mensajes
   - Publica evento: requests.accepted

4. Al COMPLETAR:
   - Agregar rating y review
   - Publica evento: requests.completed
   - Actualiza estadísticas en Users Service
   - Envía notificación con resumen
```

---

#### 5. **Chat Service** (Puerto 4010)

**Responsabilidades:**
- WebSocket conexiones
- Mensajes en tiempo real
- Broadcast a usuarios
- Notificación de typing indicator

**Arquitectura WebSocket:**
```
┌─────────────────────────────────────┐
│  Socket.IO Server (Node.js)         │
│  - Adapter: Redis (para clustering) │
│  - Namespace: /chat                 │
│  - Rooms: request_id                │
└─────────────────────────────────────┘
        ▲                  ▲
        │                  │
    Client 1            Client 2
    (Web/Mobile)        (Web/Mobile)
```

**Eventos WebSocket:**

```typescript
// Cliente → Servidor
socket.emit('join-room', { roomId, userId, userName });
socket.emit('send-message', { roomId, userId, message, timestamp });
socket.emit('typing', { roomId, userId, userName });
socket.emit('stop-typing', { roomId, userId });
socket.emit('leave-room', { roomId, userId });

// Servidor → Cliente
socket.on('message-received', { ...message });
socket.on('user-joined', { usersInRoom: [...] });
socket.on('user-typing', { userName });
socket.on('user-left', { usersInRoom: [...] });
```

**Patrones Implementados:**
- **Pub/Sub Pattern:** Redis para multi-server
- **Room-based Broadcasting:** Aislamiento por solicitud
- **Graceful Reconnection:** Auto-rejoin en desconexión

---

#### 6. **Notification Service** (Puerto 4001)

**Responsabilidades:**
- Creación de notificaciones
- Broadcast a múltiples usuarios
- Marcar como leída
- Almacenamiento de historial

**Tipos de Notificaciones:**

| Tipo | Trigger | Datos Incluidos |
|------|---------|-----------------|
| REQUEST_RECEIVED | requests.created | requestId, fromUser |
| REQUEST_ACCEPTED | requests.status_changed | requestId, status |
| MESSAGE_RECEIVED | messages.sent | fromUser, preview |
| POST_LIKED | engagement.like | postId, likerUser |
| RATING_RECEIVED | ratings.created | rating, reviewText |

**Modelo de Datos:**
```prisma
Notification {
  id: String @id
  type: String
  title: String
  message: String
  targetUserId: String
  senderId: String?
  relatedId: String? (postId, requestId, etc.)
  read: Boolean @default(false)
  readAt: DateTime?
  createdAt: DateTime
}
```

**Patrón de Consumo:**
```
1. Servicio X publica evento en Kafka
   eventos: posts.created, requests.created, etc.

2. Notification Service consume eventos
   - Parse evento
   - Crear Notification en DB
   - Almacenar en memoria (caché)
   - Push a usuario (WebSocket, si conectado)

3. Cliente recibe en tiempo real
   - Mostrar toast/banner
   - Marcar como leída
   - Guardar en DB
```

---

#### 7. **Files Service** (Puerto 4011)

**Responsabilidades:**
- Upload de archivos
- Almacenamiento en MongoDB GridFS
- Download y streaming
- Validación de tipos MIME

**Configuración:**
```env
MAX_FILE_SIZE=104857600        # 100MB
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp,\
                   video/mp4,video/webm,application/pdf
```

**Flujo de Upload:**
```
1. Cliente envía multipart FormData
2. Middleware valida:
   - Tipo MIME
   - Tamaño máximo
   - Extensión permitida
3. GridFS almacena en chunks
4. Retorna fileId y metadata
5. Cliente almacena referencia
```

**MongoDB GridFS Schema:**
```javascript
// fs.files collection
{
  _id: ObjectId,
  length: 102400,          // Bytes
  chunkSize: 261120,
  uploadDate: ISODate,
  filename: "avatar.jpg",
  contentType: "image/jpeg",
  metadata: {
    uploadedBy: "user_123",
    uploadedAt: ISODate
  }
}

// fs.chunks collection - stored en chunks de 256KB
{
  _id: ObjectId,
  files_id: ObjectId,  // Referencia a fs.files
  n: 0,                // Número de chunk
  data: BinData        // Datos binarios del chunk
}
```

---

#### 8. **Messages & Conversations Services**

**Messages Service (4008):**
- Mensajería privada asíncrona
- Historial persistente
- Marcar como leídas

**Conversations Service (4009):**
- Agrupación lógica de mensajes
- Metadata de conversación
- Archivado y búsqueda

**Flujo Integrado:**
```
Cliente A ──send message──> Messages Service
                              │
                              ├─> Almacenar en DB
                              ├─> Publicar evento (messages.sent)
                              └─> Conversations Service
                                   ├─> Update last_message
                                   ├─> Update timestamp
                                   └─> Si Cliente B conectado:
                                       Push a través WebSocket
```

---

#### 9. **Profile & Ratings Services**

**Profile Service (4005):**
- Perfil público enriquecido
- Estadísticas agregadas
- Recomendaciones de colaboradores

**Ratings Service (4006):**
- Valoraciones 1-5 estrellas
- Reviews de texto
- Distribución de ratings
- Cálculo de promedio

**Agregación de Ratings:**
```
┌─────────────────────────────────────┐
│ Cuando se completa una solicitud:    │
├─────────────────────────────────────┤
│ 1. Ambos usuarios pueden valorar    │
│ 2. Ratings guardados en DB          │
│ 3. Publica evento: ratings.created  │
│ 4. Users Service consume evento     │
│ 5. Recalcula promedio y reviewCount │
│ 6. Cachea en Redis (TTL: 1 hora)    │
└─────────────────────────────────────┘
```

---

## PATRONES DE COMUNICACIÓN

### 1. Comunicación Síncrona (REST)

**Casos de uso:**
- Lecturas de datos (GET)
- Operaciones inmediatas (POST/PUT)
- Validaciones

**Flujo Típico:**
```
Cliente
  │
  ├─> GET /api/users/123
  │
  └─> Nginx Gateway
       │
       └─> Users Service
            │
            ├─> Query DB
            ├─> Cachear en Redis
            └─> Response JSON
```

**Ejemplo:**
```bash
curl -H "Authorization: Bearer {token}" \
     http://localhost/api/posts?type=PROJECT&limit=10
```

---

### 2. Comunicación Asíncrona (Kafka)

**Casos de uso:**
- Eventos de cambio de estado
- Notificaciones
- Actualizaciones cross-service
- Auditoría y logging

**Flujo Típico:**
```
Service A (Producer)
  │
  ├─> Cambio de datos
  │
  └─> Publica evento a Kafka topic
       │
       ├─> Service B (Consumer) → Procesa
       ├─> Service C (Consumer) → Notifica
       └─> Service D (Consumer) → Registra auditoría
```

**Garantías:**
- **At-Least-Once Delivery:** Procesado mínimo 1 vez
- **Ordering:** Garantizado por partición
- **Durability:** Replicado en 3 brokers

**Ejemplo Event:**
```json
{
  "eventId": "evt_123456",
  "action": "request.created",
  "aggregate": "Request",
  "data": {
    "requestId": "req_789",
    "fromUserId": "user_111",
    "toUserId": "user_222",
    "type": "COLLABORATION",
    "status": "PENDING"
  },
  "metadata": {
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0",
    "source": "requests-service",
    "traceId": "trace_xyz"
  }
}
```

---

### 3. Comunicación en Tiempo Real (WebSocket)

**Socket.IO:**
```
Cliente (Browser/Mobile)
  │
  └─> Socket.IO Connection
       │
       ├─> Server establece conexión
       ├─> Cliente se une a room/namespace
       └─> Bidirectional communication
           ├─> Cliente → Servidor (emit)
           └─> Servidor → Cliente (on)
```

**Implementación:**
```typescript
// Cliente
const socket = io('http://localhost:4010');

socket.on('connect', () => {
  socket.emit('join-room', { roomId, userId });
});

socket.on('message-received', (data) => {
  updateUI(data);
});

// Servidor
io.on('connection', (socket) => {
  socket.on('join-room', (data) => {
    socket.join(data.roomId);
    socket.broadcast.to(data.roomId).emit('user-joined', data);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('message-received', data);
  });
});
```

---

### 4. Circuit Breaker Pattern

Implementación para resiliencia:

```typescript
const axiosInstance = axios.create();

// Implementar circuit breaker
let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const TIMEOUT = 60000; // 1 minuto

axiosInstance.interceptors.response.use(
  (response) => {
    failureCount = 0;
    return response;
  },
  (error) => {
    failureCount++;
    if (failureCount >= FAILURE_THRESHOLD) {
      throw new Error('Circuit breaker abierto');
    }
    return Promise.reject(error);
  }
);
```

---

## MODELOS DE ARQUITECTURA

### 1. Cada Servicio: Arquitectura Hexagonal (Ports & Adapters)

```
┌──────────────────────────────────────────┐
│         Posts Service                    │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────┐       │
│  │     Core Business Logic      │       │
│  │  (Controllers/Handlers)      │       │
│  └──────────────────────────────┘       │
│           ▲                   ▲          │
│           │                   │          │
│  ┌────────┴─┐          ┌──────┴────┐   │
│  │HTTP Port │          │ Event Port│   │
│  └────┬────┘          └──────┬─────┘   │
├───────┼──────────────────────┼────────┤
│  REST Routes          Kafka Events    │
│  (Express)            (Consumer)      │
├──────────────────────────────────────┤
│  Adapters (Database, Cache, etc.)    │
│  ├─ Prisma ORM                       │
│  ├─ PostgreSQL Driver                │
│  └─ Redis Client                     │
└──────────────────────────────────────┘
```

**Ventajas:**
- Independencia de frameworks
- Testeable en aislamiento
- Fácil de refactorizar

---

### 2. Event-Driven Architecture

```
┌─ Posts Service ─────────────────┐
│  Cambio de estado               │
│  (post created/updated/deleted) │
│  │                              │
│  └──> Kafka Topic: posts.*      │
│         │                       │
│         ├─> Notification Service
│         │   (enviar notificación)
│         │
│         ├─> Logging Service
│         │   (auditar cambios)
│         │
│         └─> Analytics Service
│             (recopilar datos)
└────────────────────────────────┘
```

**Ventajas:**
- Loosely coupled
- Escalable
- Resiliente a fallos
- Auditabilidad completa

**Desventajas:**
- Complejidad operacional
- Eventual consistency
- Debugging más complicado

---

### 3. CQRS (Command Query Responsibility Segregation)

Implementación opcional para lectura intensiva:

```
┌─ Write Model (Command) ──────────┐
│  - Database principal            │
│  - Validación completa           │
│  - Transacciones                 │
│  - Publican eventos              │
└────────────────────────────────┬─┘
                                  │
                        Eventual Consistency
                                  │
                         ┌────────▼─────────┐
                         │ Read Model      │
                         │ - Cache (Redis) │
                         │ - Denormalized  │
                         │ - Optimizado    │
                         └─────────────────┘
```

**Ejemplo:**
```typescript
// WRITE - Crear post
POST /posts
{
  title: "...",
  content: "..."
}
// → Validar, guardar en DB, publicar evento

// READ - Obtener posts
GET /posts?career=Ingeniería
// → Cachear desde Redis, actualizar si evento llega
```

---

### 4. Database per Service Pattern

```
Auth Service
  └─ auth_service_db (PostgreSQL)
     - users
     - sessions
     - accounts

Users Service
  └─ users_service_db (PostgreSQL)
     - user_profiles
     - user_statistics
     - skills_interests

Posts Service
  └─ posts_service_db (PostgreSQL)
     - posts
     - post_engagement

Files Service
  └─ files_db (MongoDB)
     - fs.files
     - fs.chunks

Notifications Service
  └─ notifications_db (PostgreSQL)
     - notifications
```

**Ventajas:**
- Escalado independiente
- No hay cuello de botella

**Desventajas:**
- Transacciones distribuidas complejas
- Eventual consistency
- Duplicación de datos en algunos casos

---

## ALMACENAMIENTO DE DATOS

### Estrategia de Datos

#### PostgreSQL (Relacional)

```sql
-- Índices para performance
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_users ON requests(fromUserId, toUserId);
CREATE INDEX idx_posts_author ON posts(authorId);
CREATE INDEX idx_posts_career ON posts(careerSpace);
CREATE INDEX idx_notifications_user_read ON notifications(targetUserId, read);

-- Full-text search en posts
CREATE INDEX idx_posts_content_fts ON posts USING GIN(
  to_tsvector('spanish', title || ' ' || content)
);
```

#### MongoDB (Documental)

```javascript
// Índices en MongoDB
db.fs.files.createIndex({ uploadDate: -1 });
db.fs.files.createIndex({ "metadata.uploadedBy": 1 });

// Query ejemplo
db.fs.files.find({
  uploadDate: { $gte: new Date("2024-01-01") },
  contentType: { $in: ["image/jpeg", "image/png"] }
});
```

#### Caching (Redis)

```
Patrones de caché:
├─ Session cache
│  Key: session:{sessionId}
│  TTL: 24 horas
│
├─ User profile cache
│  Key: user:profile:{userId}
│  TTL: 1 hora
│
├─ Posts listing cache
│  Key: posts:list:{filters_hash}
│  TTL: 5 minutos
│
└─ Rate limiting
   Key: ratelimit:{userId}:{endpoint}
   TTL: 1 minuto
```

---

## SEGURIDAD

### 1. Autenticación y Autorización

```
┌─────────────────────────────────────┐
│  Authentication Flow                │
├─────────────────────────────────────┤
│  1. Usuario registra/login          │
│  2. Auth Service valida credenciales│
│  3. Genera JWT token                │
│  4. Cliente almacena token          │
│  5. Cada request incluye token      │
│  6. Middleware valida JWT           │
│  7. Autoriza basado en claims       │
└─────────────────────────────────────┘
```

**JWT Structure:**
```
Header.Payload.Signature

Header: { alg: "HS256", typ: "JWT" }
Payload: {
  sub: "user_123",          // Subject
  email: "user@example.com",
  role: "user",
  iat: 1706779800,          // Issued at
  exp: 1706783400           // Expires
}
Signature: HMACSHA256(Header.Payload, secret)
```

### 2. CORS & HTTPS

```nginx
# Nginx CORS headers
add_header 'Access-Control-Allow-Origin' '$http_origin' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

# HTTPS redirect
server {
  listen 80;
  return 301 https://$host$request_uri;
}
```

### 3. Input Validation & Sanitization

```typescript
// Validación con Joi/Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  title: z.string().max(200).min(5),
  content: z.string().min(10).max(5000)
});

// Sanitización de inputs
const sanitize = (input: string): string => {
  return xss(input).trim();
};
```

### 4. Rate Limiting

```typescript
// Express rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // 100 requests por IP
  message: 'Demasiadas peticiones',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
```

---

## DEPLOYMENT

### Entorno de Desarrollo

```bash
# Docker Compose local
docker-compose up -d

# Servicios disponibles:
# - Frontend: http://localhost:3000
# - PostgreSQL: localhost:5432
# - MongoDB: localhost:27017
# - Kafka: localhost:9092
# - Nginx: http://localhost
```

### Entorno de Producción

```
┌──────────────────────────────────────────┐
│  AWS Infrastructure (Terraform)          │
├──────────────────────────────────────────┤
│  - ALB (Application Load Balancer)       │
│  - EC2 instances (Auto Scaling Group)    │
│  - RDS PostgreSQL (Multi-AZ)             │
│  - DocumentDB (MongoDB compatible)       │
│  - ElastiCache (Redis)                   │
│  - MSK (Managed Streaming for Kafka)     │
│  - S3 (Backup y almacenamiento)          │
│  - CloudFront (CDN)                      │
│  - Route53 (DNS)                         │
│  - CloudWatch (Monitoring)               │
│  - IAM (Access control)                  │
└──────────────────────────────────────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy-nx.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t ghcr.io/jettro12/frontend:latest ./frontend
          docker build -t ghcr.io/jettro12/auth-service:latest ./services/auth-service
          # ... más servicios
      - name: Push to GHCR
        run: docker push ghcr.io/jettro12/frontend:latest
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          # kubectl apply -f deployment.yaml (si usa Kubernetes)
          # O docker-compose pull && docker-compose up (si usa EC2 directo)
```

---

## MONITOREO Y OBSERVABILIDAD

### Logs Centralizados

```
┌────────────────────────────────────┐
│     Servicios Microservicios       │
│     (Generan logs)                 │
└────────────────┬───────────────────┘
                 │
         ┌───────▼─────────┐
         │  ELK Stack      │
         ├─────────────────┤
         │ - Elasticsearch │
         │ - Logstash      │
         │ - Kibana        │
         └─────────────────┘
```

### Métricas

```
Prometheus → Recolecta métricas
  ├─ Latencia (p50, p95, p99)
  ├─ Error rates
  ├─ Throughput
  └─ JVM/Node.js metrics

Grafana → Visualiza dashboards
  ├─ Health checks
  ├─ Performance
  └─ Alertas
```

### Health Checks

```typescript
// Cada servicio expone endpoint /health
app.get('/health', (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    checks: {
      database: checkDatabase(),
      kafka: checkKafka(),
      memory: checkMemory()
    }
  };
  res.json(health);
});
```

---

## CONCLUSIONES Y RECOMENDACIONES

### Fortalezas del Diseño

1. **Escalabilidad:** Cada servicio escala independientemente
2. **Resiliencia:** Fallos aislados, sin cascada
3. **Mantenibilidad:** Código organizado por dominio
4. **Flexibilidad:** Tecnologías adaptables por servicio
5. **DevOps-Ready:** Containerizado y automatizado

### Áreas de Mejora

1. **Testing:** Ampliar cobertura de integration tests
2. **Documentación API:** Implementar OpenAPI/Swagger
3. **Kubernetes:** Migrar de Docker Compose a K8s
4. **Service Mesh:** Considerar Istio/Linkerd
5. **GraphQL:** Opcional, para mejor eficiencia de queries

### Recomendaciones Futuras

| Prioridad | Item | Beneficio |
|-----------|------|-----------|
| Alta | Implementar Kubernetes | Escalado automático |
| Alta | Añadir tests E2E | Confiabilidad |
| Media | Service Mesh (Istio) | Observabilidad mejorada |
| Media | GraphQL Gateway | Queries más eficientes |
| Baja | Multi-region deployment | HA global |

---

## REFERENCIAS

- [Microservices Patterns - Chris Richardson](https://microservices.io/)
- [Domain-Driven Design - Eric Evans](https://domainlanguage.com/ddd/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Twelve Factor App](https://12factor.net/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Documento preparado por:** Jettro  
**Versión:** 1.0  
**Fecha de actualización:** Enero 2026  
**Clasificación:** Documentación Técnica

---

*Este documento contiene información técnica confidencial. Solo para uso interno del equipo de desarrollo.*
