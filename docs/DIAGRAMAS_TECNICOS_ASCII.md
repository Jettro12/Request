# DIAGRAMAS TÉCNICOS - REQUEST APP

## 1. ARQUITECTURA DE ALTO NIVEL

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                           REQUEST APP - FULL ARCHITECTURE                      ║
╚════════════════════════════════════════════════════════════════════════════════╝

                            PRESENTATION LAYER
    ┌──────────────────┬──────────────────┬──────────────────┐
    │   WEB BROWSER    │   MOBILE APP     │   DESKTOP ADMIN  │
    │  (Next.js 14)    │  (Expo SDK 50)   │  (Electron 27)   │
    │  React 18.3      │  React Native    │  React + MUI     │
    │  Tailwind 3.4    │  TypeScript      │  TypeScript      │
    └────────┬─────────┴────────┬─────────┴────────┬─────────┘
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   NGINX GATEWAY       │
                    │  (API Gateway)        │
                    │  - Load Balancing     │
                    │  - CORS               │
                    │  - SSL/TLS Term.      │
                    │  - Rate Limiting      │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
   ┌─────────┐         ┌─────────────┐         ┌──────────┐
   │  Auth   │         │   Posts     │    ... │   Chat   │
   │Service  │         │   Service   │         │  Service │
   │ (4004)  │         │   (4002)    │         │  (4010)  │
   └─────────┘         └─────────────┘         └──────────┘
        │                   │                       │
        │          ┌────────┴───────────┐          │
        │          │                    │          │
        └──────┬───┴──┬──────────┬──────┴──────┬──┘
               │      │          │             │
            ┌──▼──────▼──────────▼─────────────▼──┐
            │   APACHE KAFKA (Event Streaming)    │
            │   - Topic Partitioning              │
            │   - Replication Factor: 3           │
            │   - Retention: Configurable         │
            │   Topics:                           │
            │   ├─ posts.created                  │
            │   ├─ requests.status_changed        │
            │   ├─ notifications.sent             │
            │   ├─ ratings.created               │
            │   └─ ... 11+ topics                │
            └──┬──────────────────────────────────┘
               │
        ┌──────┴──────────┬─────────────┬──────────────┐
        │                 │             │              │
        ▼                 ▼             ▼              ▼
   ┌──────────┐   ┌───────────┐  ┌──────────┐  ┌────────────┐
   │PostgreSQL│   │PostgreSQL │  │PostgreSQL│  │  MongoDB   │
   │ auth_db  │   │ posts_db  │  │notify_db │  │ files_db   │
   │          │   │           │  │          │  │ (GridFS)   │
   │- Users   │   │- Posts    │  │- Notif.  │  │- Attachm.  │
   │- Sessions│   │- Engage.  │  │- History │  │- Media     │
   │- Accounts│   │- Filters  │  │- Read    │  │- Chunks    │
   └──────────┘   └───────────┘  └──────────┘  └────────────┘

   ┌──────────────────┐  ┌──────────────────┐
   │  REDIS CACHE     │  │ ELASTICSEARCH    │
   │  - Sessions      │  │ (Optional)       │
   │  - Profile cache │  │ - Full-text      │
   │  - Rate limit    │  │   search         │
   └──────────────────┘  └──────────────────┘
```

---

## 2. FLOW DE SOLICITUD (REQUEST LIFECYCLE)

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                        REQUEST CREATION & COMPLETION FLOW                      ║
╚════════════════════════════════════════════════════════════════════════════════╝

STEP 1: USER A CREA SOLICITUD
─────────────────────────────────────────────────────────────────────────────────
  Usuario A                    Frontend                  Requests Service
     │                            │                              │
     │ 1. Completa formulario      │                              │
     ├──────────────────────────────▶                             │
     │                            │ 2. POST /api/requests         │
     │                            ├─────────────────────────────▶ │
     │                            │                    3. Valida  │
     │                            │                       Crea DB │
     │                            │◀────────────────────────────┤
     │                            │   Response: 201 Created      │
     │◀────────────────────────────┤                              │
     │   Solicitud creada          │                              │
     │                            │                    4. Evento  │
     │                            │                   Kafka pub   │
     │                            │                              │
     │                    Notification Service consume evento     │
     │                            │          │                   │
     │                    Crea notificación  │                   │
     │                    Usuario B recibe  │                   │
     │                                      │                   │

STEP 2: USER B ACEPTA
─────────────────────────────────────────────────────────────────────────────────
  Usuario B                   Frontend                  Requests Service
     │                            │                              │
     │ Recibe notificación         │                              │
     │ 1. Abre solicitud           │                              │
     │ 2. Click "Aceptar"          │                              │
     ├──────────────────────────────▶                             │
     │                            │ PATCH /api/requests/{id}      │
     │                            ├─────────────────────────────▶ │
     │                            │                  3. Actualiza │
     │                            │                     Status→   │
     │                            │                   ACCEPTED    │
     │                            │◀────────────────────────────┤
     │                            │   Response: 200 OK           │
     │◀────────────────────────────┤                              │
     │   Solicitud aceptada        │                              │
     │                            │                    4. Evento  │
     │                            │                  requests.    │
     │                            │                  status_...   │
     │                            │                              │
     │                    Notification & Chat Service consume    │
     │                    Usuario A recibe notificación         │
     │                    Chat room se activa                   │

STEP 3: CHAT EN TIEMPO REAL
─────────────────────────────────────────────────────────────────────────────────
  Usuario A                   Chat Service                 Usuario B
     │                            │                              │
     │ 1. Socket.io connect       │                              │
     ├──────────────────────────────▶                             │
     │                            │ 2. Join room                │
     │                            │ 3. Broadcast                │
     │                            │ user-joined                 │
     │                            │                             ├─────────────────┐
     │                            │                             │ socket.io        │
     │                            │◀────────────────────────────┤ evento          │
     │                            │                              │ user-joined     │
     │  Msg: "Qué tal?"           │                              │                 │
     ├──────────────────────────────▶ emit('send-message')       │                 │
     │                            │                              │                 │
     │                            │ to.room.broadcast            │                 │
     │                            │ message-received             │                 │
     │                            │◀────────────────────────────┤                 │
     │                            │                              │                 │
     │                            │    Msg: "Bien, ¿y tú?"      │
     │◀────────────────────────────▼───────────────────────────┤
     │  Recibe mensaje            │                              │
     │                            │                              │

STEP 4: COMPLETAR SOLICITUD
─────────────────────────────────────────────────────────────────────────────────
  Usuario A                   Frontend                  Requests/Ratings Svc
     │                            │                              │
     │ 1. Finaliza colaboración    │                              │
     │ 2. Abre modal "Completar"   │                              │
     ├──────────────────────────────▶                             │
     │    - Rating: 5 estrellas    │ PATCH /api/requests/{id}     │
     │    - Review: "Excelente"    ├─────────────────────────────▶ │
     │                            │       {status: COMPLETED,    │
     │                            │        rating: 5,            │
     │                            │        review: "..."}        │
     │                            │                  3. Actualiza│
     │                            │                     Status →  │
     │                            │                   COMPLETED  │
     │                            │◀────────────────────────────┤
     │                            │   Response: 200 OK           │
     │◀────────────────────────────┤                              │
     │  Solicitud completada       │                              │
     │                            │                    4. Evento  │
     │                            │                  requests.    │
     │                            │                  completed    │
     │                            │                              │
     │                    Ratings Service consume evento         │
     │                    - Almacena rating                     │
     │                    - Recalcula promedio                  │
     │                    Notification Service                  │
     │                    - Envía confirmación                  │
     │                    Users Service                         │
     │                    - Actualiza estadísticas              │

STATE MACHINE FINAL
─────────────────────────────────────────────────────────────────────────────────
  ┌────────┐
  │PENDING │ (Esperando respuesta)
  └───┬────┘
      │
      ├──ACCEPT──▶ ┌─────────┐
      │            │ACCEPTED │ (En progreso)
      │            └────┬────┘
      │                 │
      │           ┌─────┴─────┐
      │           │COMPLETE   │ (Finalizada)
      │           └───────────┘
      │                   ▲
      │                   │ + Rating bilateral
      │
      ├──REJECT──▶ ┌─────────┐
      │            │REJECTED │ (Rechazada)
      │            └─────────┘
      │
      └──CANCEL──▶ ┌─────────┐
                   │CANCELLED│ (Cancelada)
                   └─────────┘
```

---

## 3. PATRÓN DE EVENTOS KAFKA

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                        KAFKA EVENT-DRIVEN ARCHITECTURE                         ║
╚════════════════════════════════════════════════════════════════════════════════╝

                           PRODUCERS (Servicios)
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌─────────┐    ┌──────────┐   ┌─────────┐
              │ Posts   │    │Requests  │   │ Users   │
              │Service  │    │Service   │   │Service  │
              └────┬────┘    └────┬─────┘   └────┬────┘
                   │             │              │
        Publica:   │             │              │
   posts.created   │             │              │
   posts.updated   │             │              │
   posts.deleted   │             │        users.created
                   │             │        users.updated
                   │      Publica:
                   │   requests.created
                   │   requests.status_changed
                   │   requests.completed
                   │
                   └─────────────┬──────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  APACHE KAFKA BROKER    │
                    │  (Topics & Partitions)  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      CONSUMERS         │
                    │  (Servicios que       │
                    │   reaccionan)         │
                    │                       │
        ┌───────────┼───────────┬───────────┼──────────┐
        │           │           │           │          │
        ▼           ▼           ▼           ▼          ▼
    ┌────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
    │Notif.  │ │Analytics│ │Logging  │ │Ratings │ │Cache   │
    │Service │ │Service  │ │Service  │ │Service │ │Invald. │
    │        │ │         │ │         │ │        │ │        │
    │-Send   │ │-Contar  │ │-Audit   │ │-Calc   │ │-Purge  │
    │-Push   │ │-Analizar│ │-Trace   │ │-Avg    │ │Redis   │
    │-Email  │ │-Report  │ │-Monitor │ │-Store  │ │        │
    └────────┘ └─────────┘ └─────────┘ └────────┘ └────────┘

EVENT MESSAGE STRUCTURE
──────────────────────────────────────────────────────────────
{
  "eventId": "evt_550e8400e29b41d4a716446655440000",
  "eventType": "requests.created",
  "aggregate": {
    "aggregateId": "req_123456",
    "aggregateType": "Request",
    "version": 1
  },
  "data": {
    "requestId": "req_123456",
    "type": "COLLABORATION",
    "fromUserId": "user_aaa",
    "toUserId": "user_bbb",
    "title": "Busco dev React",
    "message": "...",
    "status": "PENDING"
  },
  "metadata": {
    "timestamp": "2024-01-20T10:30:00Z",
    "source": "requests-service",
    "traceId": "trace_xyz789",
    "userId": "user_aaa",
    "version": "1.0",
    "contentType": "application/json"
  }
}

PARTITION & SCALING
──────────────────────────────────────────────────────────────
  Topic: requests.created
  Replication Factor: 3
  Partitions: 9 (para escalado)

  Partición 0 ──▶ requests [0-999]      ─▶ Consumer 1
  Partición 1 ──▶ requests [1000-1999]  ─▶ Consumer 2
  Partición 2 ──▶ requests [2000-2999]  ─▶ Consumer 3
  ...
  Partición 8 ──▶ requests [8000-8999]  ─▶ Consumer 9

  ✅ Garantías:
     - Ordering dentro de partición
     - Paralelización entre particiones
     - Rebalancing automático si falla consumer
```

---

## 4. ARQUITECTURA DE MICROSERVICIO (Internal)

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    HEXAGONAL ARCHITECTURE (Per Service)                        ║
║                         Posts Service Example                                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

                            EXTERNAL INTERFACES

    ┌────────────────────────────────────────────────────────────┐
    │                   HTTP/REST API CLIENTS                    │
    │          (Web, Mobile, Desktop Applications)                │
    └──────────────────────────┬─────────────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  HTTP Port  │
                        │(Express App)│
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
         │GET /     │    │POST /    │    │DELETE /  │
         │(List)    │    │(Create)  │    │(Delete)  │
         └────┬─────┘    └────┬─────┘    └────┬─────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │     INPUT VALIDATION & SANITIZATION     │
         │  - Schema validation (Zod/Joi)         │
         │  - Type checking (TypeScript)           │
         │  - XSS prevention                       │
         │  - SQL injection prevention             │
         └────────────────────┬────────────────────┘
                              │
    ┌─────────────────────────▼──────────────────────────┐
    │            CORE BUSINESS LOGIC LAYER               │
    │                                                    │
    │  ┌─────────────────────────────────────────────┐  │
    │  │         PostService (Use Cases)             │  │
    │  │                                             │  │
    │  │ - createPost(title, content, skills, ...)  │  │
    │  │ - getPost(postId)                          │  │
    │  │ - listPosts(filters)                       │  │
    │  │ - updatePost(postId, data)                 │  │
    │  │ - deletePost(postId)                       │  │
    │  │ - searchPosts(query, filters)              │  │
    │  │                                             │  │
    │  └─────────────────────────────────────────────┘  │
    │                      │                            │
    │              ┌───────▼────────┐                   │
    │              │    Business    │                   │
    │              │    Rules       │                   │
    │              │                │                   │
    │              │ - Validation   │                   │
    │              │ - Authorization│                   │
    │              │ - Constraints  │                   │
    │              └───────┬────────┘                   │
    │                      │                            │
    └──────────────────────┼────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌─────▼──────┐ ┌────▼─────┐ ┌────▼──────┐
      │ Database   │ │  Event   │ │  Cache    │
      │ Port       │ │  Port    │ │  Port     │
      │(Persistence)│ │(Publish) │ │(Caching) │
      └─────┬──────┘ └────┬─────┘ └────┬─────┘
            │             │            │
      ┌─────▼──────────────┴────────────┴─────┐
      │          ADAPTER LAYER               │
      ├──────────────────────────────────────┤
      │                                      │
      │ ┌──────────────────────────────────┐ │
      │ │  Database Adapter (Prisma ORM)   │ │
      │ │  - Query builder                 │ │
      │ │  - Connection pooling            │ │
      │ │  - Transaction management        │ │
      │ └──────────────────────────────────┘ │
      │                                      │
      │ ┌──────────────────────────────────┐ │
      │ │  Event Publisher (Kafka)         │ │
      │ │  - Serialize event               │ │
      │ │  - Publish to topic              │ │
      │ │  - Error handling                │ │
      │ └──────────────────────────────────┘ │
      │                                      │
      │ ┌──────────────────────────────────┐ │
      │ │  Cache Client (Redis)            │ │
      │ │  - Set/Get cache                 │ │
      │ │  - TTL management                │ │
      │ │  - Invalidation                  │ │
      │ └──────────────────────────────────┘ │
      │                                      │
      │ ┌──────────────────────────────────┐ │
      │ │  Logger (Winston/Pino)           │ │
      │ │  - Structured logging            │ │
      │ │  - Error tracking                │ │
      │ │  - Performance metrics           │ │
      │ └──────────────────────────────────┘ │
      │                                      │
      └──────────────────────────────────────┘
            │             │            │
      ┌─────▼─────────────┴────────────┴──────┐
      │     EXTERNAL SYSTEMS                 │
      │                                      │
      │  PostgreSQL Database                │
      │  Apache Kafka Broker                │
      │  Redis Cache                        │
      │  External APIs (opcional)           │
      └──────────────────────────────────────┘

BENEFICIOS
─────────────────────────────────────────────────────────────
✅ Domain-driven: Lógica independiente de frameworks
✅ Testeable: Puedo testear sin DB, Kafka, Redis
✅ Flexible: Cambiar adapter sin cambiar dominio
✅ Mantenible: Responsabilidades claras
✅ Escalable: Cada capa puede escalar independiente
```

---

## 5. COMUNICACIÓN SÍNCRONA vs ASÍNCRONA

```
╔════════════════════════════════════════════════════════════════════════════════╗
║              SYNCHRONOUS vs ASYNCHRONOUS COMMUNICATION PATTERNS                ║
╚════════════════════════════════════════════════════════════════════════════════╝

PATRÓN 1: SÍNCRONO (REST API)
─────────────────────────────────────────────────────────────────────────────────

  Timeline: REQUEST → RESPONSE (Inmediato)

  Cliente                  Nginx Gateway              Posts Service
     │                            │                          │
     │ 1. GET /api/posts         │                          │
     ├──────────────────────────▶ │                          │
     │                            │ 2. Forward request       │
     │                            ├─────────────────────────▶ │
     │                            │                   3. Query
     │                            │                      DB
     │                            │                     (20ms)
     │                            │                    Serialize
     │                            │                   (5ms)
     │◀──────────────────────────┤◀─ 4. Response JSON        │
     │   200 OK                   │                          │
     │   [post1, post2, ...]      │                          │
     │   (25ms latencia total)    │                          │

  PROS:
  ✅ Simple & directo
  ✅ Respuesta inmediata
  ✅ Fácil de debuggear
  ✅ Confirmación de entrega

  CONTRAS:
  ❌ Acoplamiento temporal (ambos deben estar up)
  ❌ Cascada de fallos
  ❌ Throughput limitado
  ❌ No es escalable para alto volumen

  CASOS DE USO:
  📖 GET queries
  📝 Crear recurso (necesita confirmar)
  🔍 Búsquedas en tiempo real
  🔐 Validaciones inmediatas


PATRÓN 2: ASÍNCRONO (Event-Driven con Kafka)
─────────────────────────────────────────────────────────────────────────────────

  Timeline: EVENT → PUBLISH → EVENTUAL CONSISTENCY

  Posts Service          Kafka Topic         Notification Service
     │                      │                        │
     │ 1. post.create()     │                        │
     │ validate & save      │                        │
     │ to DB (15ms)         │                        │
     │                      │                        │
     │ 2. Publish event     │                        │
     │ "posts.created"      │                        │
     ├─────────────────────▶ │                        │
     │ (2ms latencia)       │ Broker stores event    │
     │                      │ Replicas: 3x           │
     │                      │ Partition log: durable │
     │                      │                        │
     │ 3. Immediate return  │                        │
     │ (No espera)          │                        │
     │                      │  4. Consumer consume  │
     │                      │     event (50-200ms)  │
     │                      ├───────────────────────▶ │
     │                      │                   5. Process
     │                      │                      (30ms)
     │                      │                   6. Notify user
     │                      │                      (10ms)
     │                      │                        │

  Timeline Total para Posts Service: ~17ms
  Timeline Total para Notification: ~290ms (eventual)
  Decoupling: ✅ 100% (podem fallar independiente)

  PROS:
  ✅ Desacoplado: servicios independientes
  ✅ Resiliente: fallos no cascadan
  ✅ Escalable: alto throughput
  ✅ Flexible: múltiples consumidores
  ✅ Auditable: historial de eventos
  ✅ Reproducible: replay eventos

  CONTRAS:
  ❌ Complejidad operacional
  ❌ Eventual consistency (puede haber lag)
  ❌ Debugging más complicado
  ❌ Requerimientos de orden (particiones)

  GARANTÍAS KAFKA:
  ✅ At-Least-Once delivery
  ✅ Ordering por partición
  ✅ Durabilidad (replicación)
  ✅ Retención configurable

  CASOS DE USO:
  📨 Notificaciones
  📊 Auditoría / Logging
  🔔 Alertas
  💾 Sincronización cross-service
  📈 Analytics / Reporting
  🏷️ Cache invalidation


PATRÓN 3: HYBRID (Mejor de ambos)
─────────────────────────────────────────────────────────────────────────────────

  Operación: createPost() en Posts Service

  PASO 1: SÍNCRONO (REST)
  ┌────────────────────┐
  │ Cliente POST /api/ │
  │ posts (sync)       │
  │                    │
  │ 1. Validate        │
  │ 2. Store en DB     │
  │ 3. Return postId   │
  │ (50ms)             │
  └────┬───────────────┘
       │ ✅ 201 Created
       │    {postId: "..."}
       │
  PASO 2: ASÍNCRONO (Kafka)
  ┌─────────────────────────────────────┐
  │ Posts Service publish evento        │
  │ "posts.created" a Kafka             │
  │ (No bloquea al cliente)             │
  │                                     │
  │ Consumers:                          │
  │ ├─ Notification Service → Notifica │
  │ ├─ Analytics Service → Registra    │
  │ ├─ Search Service → Indexa         │
  │ └─ Cache Service → Cachea          │
  │ (Todos paralelo, asíncrono)        │
  └──────────────────────────────────────┘

  VENTAJAS:
  ✅ Confirmación inmediata al usuario (REST)
  ✅ Actualizaciones gradualmente (Kafka)
  ✅ Mejor UX + resilencia + escalabilidad
  ✅ Sin cascadas de fallos


TABLA COMPARATIVA
─────────────────────────────────────────────────────────────
┌─────────────────────┬────────────┬──────────┬────────────┐
│ Característica      │ Síncrono   │Asíncrono │ Hybrid     │
├─────────────────────┼────────────┼──────────┼────────────┤
│ Latencia            │ ~20ms      │ ~50-200ms│ ~20ms + bg │
│ Acoplamiento        │ Fuerte     │ Débil    │ Débil      │
│ Resiliencia         │ Baja       │ Alta     │ Muy alta   │
│ Throughput          │ Limitado   │ Alto     │ Alto       │
│ Ordering            │ N/A        │ Por part │ N/A        │
│ Replayabilidad      │ No         │ Sí       │ Sí         │
│ Consistencia        │ Strong     │ Eventual │ Strong+E   │
│ Debugging           │ Fácil      │ Complejo │ Medio      │
│ Operacional Compl   │ Baja       │ Alta     │ Media      │
└─────────────────────┴────────────┴──────────┴────────────┘
```

---

## 6. DEPLOYMENT ARCHITECTURE

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                        AWS PRODUCTION INFRASTRUCTURE                           ║
╚════════════════════════════════════════════════════════════════════════════════╝

INTERNET ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                              AWS REGION (us-east-1)

  ┌──────────────────────────────────────────────────────────────────────────┐
  │                          ROUTE 53 (DNS)                                   │
  │                request-app.example.com → ALB IP                          │
  └──────────────────────┬───────────────────────────────────────────────────┘
                         │
  ┌──────────────────────▼───────────────────────────────────────────────────┐
  │                     CloudFront (CDN)                                      │
  │           - Cache frontend estático                                       │
  │           - Compresión gzip                                              │
  │           - HTTPS                                                         │
  └──────────────────────┬───────────────────────────────────────────────────┘
                         │
  ┌──────────────────────▼───────────────────────────────────────────────────┐
  │                  ALB (Application Load Balancer)                          │
  │           - Listen 443 (HTTPS), 80 (HTTP→HTTPS redirect)                │
  │           - SSL/TLS certificates (AWS Certificate Manager)               │
  │           - Health checks en servicios                                    │
  │           - Routing rules por path y host                                │
  └──────────────────────┬───────────────────────────────────────────────────┘
                         │
  ┌──────────────────────▼───────────────────────────────────────────────────┐
  │          EC2 Auto Scaling Group (ASG)                                     │
  │     Mínimo: 2 instancias | Máximo: 10 | Deseado: 3                     │
  │                                                                            │
  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
  │   │   EC2 t3.large  │  │   EC2 t3.large  │  │   EC2 t3.large  │         │
  │   │  AZ: us-east-1a │  │  AZ: us-east-1b │  │  AZ: us-east-1c │         │
  │   │                 │  │                 │  │                 │         │
  │   │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │         │
  │   │ │Docker Engine│ │  │ │Docker Engine│ │  │ │Docker Engine│ │         │
  │   │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │         │
  │   │                 │  │                 │  │                 │         │
  │   │ Containers:     │  │ Containers:     │  │ Containers:     │         │
  │   │ ├─ Nginx        │  │ ├─ Nginx        │  │ ├─ Nginx        │         │
  │   │ ├─ Frontend     │  │ ├─ Frontend     │  │ ├─ Frontend     │         │
  │   │ ├─ Auth Svc     │  │ ├─ Auth Svc     │  │ ├─ Auth Svc     │         │
  │   │ ├─ Posts Svc    │  │ ├─ Posts Svc    │  │ ├─ Posts Svc    │         │
  │   │ ├─ Users Svc    │  │ ├─ Users Svc    │  │ ├─ Users Svc    │         │
  │   │ ├─ Chat Svc     │  │ ├─ Chat Svc     │  │ ├─ Chat Svc     │         │
  │   │ └─ ...11 total  │  │ └─ ...11 total  │  │ └─ ...11 total  │         │
  │   │                 │  │                 │  │                 │         │
  │   └─────────────────┘  └─────────────────┘  └─────────────────┘         │
  │                                                                            │
  └────────┬─────────────────────────────────────────────────────────┬───────┘
           │                                                          │
           ├─────────────────────────────────────────────────────────┤
           │                                                          │
    ┌──────▼──────────┐                                   ┌──────────▼────┐
    │   RDS Aurora    │                                   │  DocumentDB   │
    │  (PostgreSQL)   │                                   │   (MongoDB)   │
    │                 │                                   │               │
    │ Multi-AZ setup  │                                   │ Cluster:      │
    │ - Primary       │                                   │ ├─ Primary    │
    │ - Read replica  │                                   │ ├─ Secondary1 │
    │ - Read replica  │                                   │ └─ Secondary2 │
    │                 │                                   │               │
    │ Backups:        │                                   │ Replicación:  │
    │ - Automated     │                                   │ - Automática  │
    │ - 7 días retn.  │                                   │ - 3 replicas  │
    │ - PITR enabled  │                                   │               │
    │                 │                                   │               │
    │ Encrypted       │                                   │ Encrypted     │
    │ at rest + transit│                                  │ at rest       │
    └─────────────────┘                                   └───────────────┘

           ├─────────────────────────────────────────────────────────┤
           │                                                          │
    ┌──────▼──────────┐                                   ┌──────────▼────┐
    │  ElastiCache    │                                   │  MSK (Kafka)  │
    │    (Redis)      │                                   │               │
    │                 │                                   │ 3 Brokers     │
    │ Cluster:        │                                   │ 3 AZs         │
    │ - 3 nodes       │                                   │               │
    │ - Multi-AZ      │                                   │ Replication:  │
    │ - Auto-failover │                                   │ Factor: 3     │
    │                 │                                   │               │
    │ TTL: Configurable                                   │ Retention:    │
    │ Encryption: ✅  │                                   │ 7 días        │
    │ Auth: ✅        │                                   │               │
    └─────────────────┘                                   │ Encryption:   │
                                                           │ - In transit  │
                                                           │ - At rest     │
                                                           └───────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                     OBSERVABILITY & BACKUP                              │
  ├─────────────────────────────────────────────────────────────────────────┤
  │                                                                          │
  │  CloudWatch               S3                   Systems Manager          │
  │  ├─ Logs                  ├─ Backups           ├─ Parameter Store       │
  │  ├─ Metrics               ├─ Database dumps    ├─ Secrets Manager       │
  │  ├─ Alarms                ├─ Daily snapshots   └─ Session Manager       │
  │  ├─ Dashboards            │                                            │
  │  └─ Events                └─ Lifecycle policy  X-Ray                   │
  │                              (30 días)        ├─ Distributed tracing   │
  │                                               └─ Service map          │
  │                                                                          │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                          SECURITY                                       │
  ├─────────────────────────────────────────────────────────────────────────┤
  │                                                                          │
  │  VPC                      Security Groups      IAM                      │
  │  ├─ Private subnets       ├─ ALB-EC2: 3000    ├─ Roles per instance    │
  │  ├─ NAT Gateway           ├─ EC2-RDS: 5432   ├─ Policies least priv    │
  │  ├─ Internet Gateway      ├─ EC2-Kafka: 9092 └─ Auditando             │
  │  └─ Flow logs             └─ RDS-EC2: inbound                         │
  │                                                                          │
  │  ACM Certificates         KMS Encryption                                │
  │  ├─ Certificate manager   ├─ RDS encryption                            │
  │  ├─ Auto-renewal          ├─ S3 encryption                             │
  │  └─ Wild-card support     └─ DynamoDB encryption                       │
  │                                                                          │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. ESCALABILIDAD TIMELINE

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                         SCALABILITY ROADMAP                                    ║
╚════════════════════════════════════════════════════════════════════════════════╝

PHASE 1: MVP (Actual)
───────────────────────────────────────────────────────────────────────────────
Usuarios: 200 ▁▁▁▁▁
Instancias: 1 por servicio
Bases: Single instance
Kafka: 1 broker

┌────────────────────────────────────────┐
│  Single Node Architecture              │
│  Docker Compose en 1-2 EC2 instances   │
│  PostgreSQL RDS single-AZ              │
│  Kafka simple broker                   │
└────────────────────────────────────────┘

Limitations:
❌ Sin auto-scaling
❌ Sin redundancia
❌ Punto único de fallo
✅ Bajo costo


PHASE 2: Growth (6-12 meses)
───────────────────────────────────────────────────────────────────────────────
Usuarios: 1,000 ▁▁▁▁▁████
Instancias: 2-3 por servicio
Bases: Multi-AZ + read replicas
Kafka: 3+ brokers

┌────────────────────────────────────────┐
│  Distributed Architecture              │
│  Kubernetes cluster (3-5 nodes)        │
│  RDS Aurora Multi-AZ                   │
│  Kafka 3-node cluster                  │
│  ElastiCache Redis cluster             │
│  CloudFront CDN                        │
└────────────────────────────────────────┘

Improvements:
✅ Auto-scaling horizontal
✅ Multi-AZ redundancy
✅ Read replicas para queries
✅ Circuit breaker patterns
✅ Caching distribuido
❌ Operacional más complejo
❌ Costo aumenta 3x


PHASE 3: Scale (1-2 años)
───────────────────────────────────────────────────────────────────────────────
Usuarios: 5,000+ ▁▁▁▁▁████████████
Instancias: 5-10 por servicio
Bases: Sharding preparado
Kafka: 7+ brokers, Topics con 20+ partitions
Cache: Redis cluster con TLS

┌────────────────────────────────────────┐
│  Enterprise Architecture               │
│  Kubernetes con Istio service mesh     │
│  Database sharding (por userId prefix) │
│  Kafka partitioning strategy           │
│  GraphQL gateway (optional)            │
│  Event sourcing + CQRS (optional)      │
│  Distributed tracing (Jaeger/Tempo)    │
│  Multi-region replication              │
└────────────────────────────────────────┘

Advanced:
✅ Service mesh con Istio
✅ Database sharding
✅ Geographical distribution
✅ Advanced caching strategies
✅ CQRS + Event sourcing
✅ ML recommendations
✅ GraphQL federation


SCALING CHECKLIST
───────────────────────────────────────────────────────────────────────────────

BEFORE SCALING (X usuarios expected):

Database:
  □ Índices optimizados
  □ Query plans analizados
  □ Conexión pooling configurado
  □ Backups probados
  □ Read replicas setup
  □ Replicación lag monitorizado

Cache:
  □ Redis cluster operacional
  □ TTL policies definidas
  □ Invalidation strategy
  □ Memory limits configurados
  □ Persistence activada

Kafka:
  □ Topic partitioning (≥ CPU cores)
  □ Replication factor ≥ 3
  □ Retention policies
  □ Consumer group setup
  □ Dead letter queue handling

Application:
  □ Circuit breakers en place
  □ Timeout configurados
  □ Rate limiting por usuario
  □ Connection pooling
  □ Graceful degradation
  □ Health checks

Infrastructure:
  □ Load balancer health checks
  □ Auto-scaling policies
  □ Monitoring alertas
  □ Log aggregation
  □ Disaster recovery plan
  □ Rollback procedures


PERFORMANCE TARGETS BY PHASE
───────────────────────────────────────────────────────────────────────────────
Métrica                  Phase 1    Phase 2    Phase 3
─────────────────────────────────────────────────────────
P50 Latency              50ms       100ms      200ms
P95 Latency              200ms      500ms      1000ms
P99 Latency              500ms      1000ms     2000ms
Throughput (req/s)       100        500        2000+
Error rate               <0.1%      <0.05%     <0.01%
Uptime                   99%        99.5%      99.9%+
CPU utilization          50-70%     60-80%     70-85%
Memory utilization       60-75%     70-85%     80-90%
Database response        <50ms      <100ms     <200ms
Cache hit ratio          N/A        70%+       80%+
```

---

## 8. DISASTER RECOVERY

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                       DISASTER RECOVERY STRATEGY                               ║
╚════════════════════════════════════════════════════════════════════════════════╝

SCENARIOS & RECOVERY TIME OBJECTIVES (RTO)
───────────────────────────────────────────────────────────────────────────────

Scenario 1: Instance EC2 falla
  Impact: 1/3 traffic dropped temporarily
  RTO: <5 minutos (auto-scaling)
  RPO: 0 minutos (stateless containers)
  
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  EC2-1   │    │  EC2-2   │    │  EC2-3   │
  └────┬─────┘    └─────┬────┘    └────┬─────┘
       │ ❌ FALLA        │              │
       │                │              │
       └────────────────┼──────────────┘
                        │ ALB redirige
                        │ ASG lanza nueva
                  ┌─────▼─────┐
                  │  EC2-NEW   │
                  └────────────┘
       Recovery: ~30-60 segundos


Scenario 2: Región AWS entera cae
  Impact: Downtime total
  RTO: <1 hora (failover to secondary region)
  RPO: <15 minutos
  
  Primary Region (us-east-1) ────────── Secondary Region (eu-west-1)
  ├─ RDS Primary                        ├─ RDS Read Replica
  ├─ Kafka Master                       ├─ Kafka Follower
  ├─ DocumentDB Primary                 ├─ DocumentDB Replica
  └─ ❌ REGION DOWN                     └─ Route53 redirige → Active


Scenario 3: Database corruption/Hack
  Impact: Data loss risk
  RTO: <30 minutos
  RPO: <1 hora
  
  Recovery steps:
  1. Detectar issue (monitoring alert) ─────┐
  2. Pausar aplicación (failover segundo)   │
  3. Restore desde backup (PITR)            │ ~30 min
  4. Verificar integridad                   │
  5. Reactivar aplicación                   │
                                             │
  Backups:                                  ▼
  ├─ Automated daily (7 days)
  ├─ Point-in-time recovery (35 days)
  ├─ Manual snapshots (for major releases)
  └─ Cross-region replicas (for DR)


Scenario 4: Kafka broker failure
  Impact: <5 min delay en mensajes
  RTO: <5 minutos
  RPO: 0 (replicación)
  
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Broker 1 │ │ Broker 2 │ │ Broker 3 │
  │ LEADER   │ │ REPLICA  │ │ REPLICA  │
  └────┬─────┘ └─────┬────┘ └────┬─────┘
       │ ❌ FALLA     │ ISR Updated │
       │              └─────┬──────┘
       │                    │
       └────────┬───────────┘
                │ Broker 2 promoted
                │ to LEADER
          ┌─────▼─────┐
          │ Broker 2   │
          │ LEADER     │
          └────────────┘
  
  Result: Datos preservados, continuidad mantenida


BACKUP STRATEGY
───────────────────────────────────────────────────────────────────────────────

Daily Backup Window: 02:00 UTC (4am local)

PostgreSQL:
  ├─ Continuous replication (Multi-AZ)
  ├─ Automated backups (7 días)
  ├─ Manual snapshots (Semanal, 30 días)
  ├─ Binary logs (1 hora retn.)
  └─ PITR enabled (35 días máx)

MongoDB:
  ├─ 3-node replica set
  ├─ Continuous sync
  ├─ Snapshots diarios → S3 (30 días)
  └─ Oplog preserved (14 días)

S3 Backups:
  ├─ Database dumps
  ├─ File attachments
  ├─ Configuration files
  ├─ Application code
  └─ Lifecycle policy: 60 días para older, 180 días archived


TESTING & VALIDATION
───────────────────────────────────────────────────────────────────────────────

Monthly DR Drills:
  □ Teste restore de database
  □ Teste failover a secondary region
  □ Teste Kafka replication
  □ Teste cache recovery
  □ Validate data consistency
  □ Document issues found
  □ Update runbooks

Quarterly:
  □ Full infrastructure failover test
  □ End-to-end transaction validation
  □ Performance baseline check
  □ Cost analysis review

Annually:
  □ Complete audit de DR strategy
  □ Update RTO/RPO based on actual
  □ Team training & certification
  □ Third-party audit (si aplica)
```

---

**Documentación de Diagramas Técnicos Completada**  
**Versión:** 1.0  
**Última actualización:** Enero 2026
