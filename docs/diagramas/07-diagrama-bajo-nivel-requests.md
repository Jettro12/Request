# Diagrama de Bajo Nivel - Requests Service

## Descripción
Este diagrama muestra la arquitectura interna detallada del Requests Service, incluyendo controladores, lógica de negocio, acceso a datos y comunicación con otros servicios.

## Diagrama Mermaid

```mermaid
graph TB
    subgraph "Requests Service (:4003)"
        subgraph "API Layer"
            Express[Express Server<br/>app.listen :4003]
            Routes[Routes Handler<br/>GET/POST/PUT/DELETE /requests]
            Middleware[CORS + JSON Parser]
        end

        subgraph "Controller Layer"
            GetRequests[getRequests<br/>GET /requests]
            CreateRequest[createRequest<br/>POST /requests]
            GetRequestById[getRequestById<br/>GET /requests/:id]
            UpdateRequest[updateRequest<br/>PUT /requests/:id]
            DeleteRequest[deleteRequest<br/>DELETE /requests/:id]
        end

        subgraph "Business Logic"
            ValidateRequest[Validar Datos<br/>- Tipo válido<br/>- Usuarios existen<br/>- Estado válido]
            StateMachine[Máquina de Estados<br/>PENDING → ACCEPTED<br/>ACCEPTED → COMPLETED]
            AgreementLogic[Lógica de Acuerdos<br/>- Proponer acuerdo<br/>- Aceptar acuerdo<br/>- Validar participantes]
        end

        subgraph "Data Access Layer"
            PrismaClient[Prisma Client]
            RequestModel[Request Model<br/>- CRUD operations<br/>- Queries con relaciones]
        end

        subgraph "Event Publishing"
            KafkaProducer[Kafka Producer]
            EventTypes[Tipos de Eventos<br/>- RequestCreated<br/>- RequestAccepted<br/>- RequestRejected<br/>- RequestCompleted]
        end

        subgraph "External Services"
            NotificationSvc[HTTP Client<br/>Notifications Service<br/>:4001]
        end
    end

    subgraph "External Dependencies"
        PostgreSQL[(PostgreSQL<br/>requests table)]
        Kafka[Kafka Broker<br/>:9092]
        NotificationsSvc[Notifications Service<br/>:4001]
    end

    Express --> Middleware
    Middleware --> Routes
    Routes --> GetRequests
    Routes --> CreateRequest
    Routes --> GetRequestById
    Routes --> UpdateRequest
    Routes --> DeleteRequest

    GetRequests --> PrismaClient
    CreateRequest --> ValidateRequest
    CreateRequest --> PrismaClient
    CreateRequest --> KafkaProducer
    GetRequestById --> PrismaClient
    UpdateRequest --> ValidateRequest
    UpdateRequest --> StateMachine
    UpdateRequest --> PrismaClient
    UpdateRequest --> KafkaProducer
    DeleteRequest --> PrismaClient

    ValidateRequest --> PrismaClient
    StateMachine --> AgreementLogic
    AgreementLogic --> PrismaClient

    PrismaClient --> RequestModel
    RequestModel --> PostgreSQL

    KafkaProducer --> EventTypes
    EventTypes --> Kafka

    CreateRequest --> NotificationSvc
    UpdateRequest --> NotificationSvc

    NotificationSvc --> NotificationsSvc

    style Express fill:#4caf50,color:#fff
    style Routes fill:#2196f3,color:#fff
    style GetRequests fill:#ff9800,color:#fff
    style CreateRequest fill:#ff9800,color:#fff
    style UpdateRequest fill:#ff9800,color:#fff
    style ValidateRequest fill:#9c27b0,color:#fff
    style StateMachine fill:#9c27b0,color:#fff
    style PrismaClient fill:#00bcd4,color:#fff
    style KafkaProducer fill:#f44336,color:#fff
    style NotificationSvc fill:#795548,color:#fff
```

## Diagrama PlantUML

```plantuml
@startuml BajoNivelRequests
!theme plain
skinparam backgroundColor #FFFFFF

package "Requests Service (:4003)" {
  package "API Layer" {
    [Express Server] as Express
    [Routes Handler] as Routes
    [CORS + JSON Parser] as Middleware
  }

  package "Controller Layer" {
    [getRequests] as GetRequests
    [createRequest] as CreateRequest
    [getRequestById] as GetRequestById
    [updateRequest] as UpdateRequest
    [deleteRequest] as DeleteRequest
  }

  package "Business Logic" {
    [Validar Datos] as ValidateRequest
    [Máquina de Estados] as StateMachine
    [Lógica de Acuerdos] as AgreementLogic
  }

  package "Data Access Layer" {
    [Prisma Client] as PrismaClient
    [Request Model] as RequestModel
  }

  package "Event Publishing" {
    [Kafka Producer] as KafkaProducer
    [Tipos de Eventos] as EventTypes
  }

  package "External Services" {
    [HTTP Client\nNotifications Service] as NotificationClient
  }
}

database "PostgreSQL" as PostgreSQL
queue "Kafka Broker" as Kafka
node "Notifications Service" as NotificationsSvc

Express --> Middleware
Middleware --> Routes
Routes --> GetRequests
Routes --> CreateRequest
Routes --> GetRequestById
Routes --> UpdateRequest
Routes --> DeleteRequest

GetRequests --> PrismaClient
CreateRequest --> ValidateRequest
CreateRequest --> PrismaClient
CreateRequest --> KafkaProducer
GetRequestById --> PrismaClient
UpdateRequest --> ValidateRequest
UpdateRequest --> StateMachine
UpdateRequest --> PrismaClient
UpdateRequest --> KafkaProducer
DeleteRequest --> PrismaClient

ValidateRequest --> PrismaClient
StateMachine --> AgreementLogic
AgreementLogic --> PrismaClient

PrismaClient --> RequestModel
RequestModel --> PostgreSQL

KafkaProducer --> EventTypes
EventTypes --> Kafka

CreateRequest --> NotificationClient
UpdateRequest --> NotificationClient
NotificationClient --> NotificationsSvc

@enduml
```

## Flujo Detallado de Operaciones

### 1. Crear Solicitud (POST /requests)

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Controller
    participant Validator
    participant Prisma
    participant Kafka
    participant Notifications

    Client->>Express: POST /requests {type, message, fromUserId, toUserId}
    Express->>Controller: createRequest(req, res)
    Controller->>Validator: Validar datos
    Validator->>Prisma: Verificar usuarios existen
    Prisma-->>Validator: Usuarios válidos
    Validator-->>Controller: Validación OK
    Controller->>Prisma: create({type, message, fromUserId, toUserId, status: PENDING})
    Prisma-->>Controller: Request creado
    Controller->>Kafka: Publicar RequestCreated
    Controller->>Notifications: POST /notifications (opcional)
    Notifications-->>Controller: Notificación creada
    Controller-->>Express: {request: {...}}
    Express-->>Client: 201 Created
```

### 2. Actualizar Estado de Solicitud (PUT /requests/:id)

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant StateMachine
    participant Prisma
    participant Kafka
    participant Notifications

    Client->>Controller: PUT /requests/:id {status: ACCEPTED}
    Controller->>Prisma: findUnique({id})
    Prisma-->>Controller: Request actual
    Controller->>StateMachine: Validar transición de estado
    StateMachine->>StateMachine: PENDING → ACCEPTED válido?
    StateMachine-->>Controller: Transición válida
    Controller->>Prisma: update({status: ACCEPTED})
    Prisma-->>Controller: Request actualizado
    Controller->>Kafka: Publicar RequestAccepted
    Controller->>Notifications: POST /notifications
    Controller-->>Client: {request: {...}}
```

### 3. Completar Solicitud con Calificación

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Prisma
    participant Kafka
    participant Ratings

    Client->>Controller: POST /requests/:id/complete {rating, review}
    Controller->>Prisma: findUnique({id})
    Prisma-->>Controller: Request (status: ACCEPTED)
    Controller->>Prisma: update({completedAt, fromUserRating, fromUserReview, status: COMPLETED})
    Prisma-->>Controller: Request actualizado
    Controller->>Ratings: POST /ratings {fromUserId, toUserId, rating, review}
    Ratings-->>Controller: Rating creado
    Controller->>Kafka: Publicar RequestCompleted
    Controller-->>Client: {request: {...}}
```

## Estructura de Código

```
requests-service/
├── src/
│   ├── index.ts                 # Express server setup
│   ├── controllers/
│   │   └── requestsController.ts # Controladores
│   ├── prisma.ts                 # Prisma client
│   ├── kafka.ts                  # Kafka producer setup
│   └── types/
│       └── request.types.ts      # TypeScript types
├── prisma/
│   └── schema.prisma            # Schema de Request
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Modelo de Datos

```typescript
model Request {
  id                  String        @id @default(cuid())
  type                RequestType
  message             String
  status              RequestStatus @default(PENDING)
  fromUserId          String
  toUserId            String
  agreementProposedAt DateTime?
  agreementAcceptedBy String[]
  completedAt         DateTime?
  fromUserRating      Int?
  toUserRating        Int?
  fromUserReview      String?
  toUserReview        String?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  messages            Message[]
  fromUser            User          @relation("SentRequests")
  toUser              User          @relation("ReceivedRequests")
}
```

## Eventos Kafka

### RequestCreated
```json
{
  "eventType": "RequestCreated",
  "requestId": "clx...",
  "fromUserId": "user1",
  "toUserId": "user2",
  "type": "COLLABORATION",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### RequestAccepted
```json
{
  "eventType": "RequestAccepted",
  "requestId": "clx...",
  "acceptedBy": "user2",
  "timestamp": "2025-01-15T10:05:00Z"
}
```

### RequestCompleted
```json
{
  "eventType": "RequestCompleted",
  "requestId": "clx...",
  "fromUserRating": 5,
  "toUserRating": 4,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Validaciones de Negocio

1. **Crear Solicitud**:
   - `fromUserId` y `toUserId` deben existir
   - `fromUserId` ≠ `toUserId`
   - `type` debe ser válido (enum)
   - `message` no puede estar vacío

2. **Actualizar Estado**:
   - Solo transiciones válidas:
     - PENDING → ACCEPTED
     - PENDING → REJECTED
     - ACCEPTED → COMPLETED
   - Solo el `toUser` puede aceptar/rechazar
   - Solo participantes pueden completar

3. **Acuerdos**:
   - Solo se puede proponer si status = ACCEPTED
   - Ambos usuarios deben aceptar para que sea válido
   - Se almacena en `agreementAcceptedBy[]`

## Integraciones

### Con Notifications Service
- Llamada HTTP directa para notificaciones críticas
- También se publican eventos a Kafka para eventual consistency

### Con Kafka
- Producer para eventos de dominio
- Topics: `requests.created`, `requests.accepted`, `requests.completed`

### Con PostgreSQL
- Prisma ORM para acceso a datos
- Transacciones para operaciones atómicas
- Índices en `fromUserId`, `toUserId`, `status`










