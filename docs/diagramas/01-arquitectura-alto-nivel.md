# Diagrama de Arquitectura de Alto Nivel

## Descripción
Este diagrama muestra la arquitectura general del sistema Request App, incluyendo todos los microservicios, el frontend, y la infraestructura de soporte.

## Diagrama Mermaid

```mermaid
graph TB
    subgraph "Cliente"
        Browser[🌐 Navegador Web]
    end

    subgraph "Frontend Layer"
        NextJS[⚛️ Next.js Frontend<br/>Puerto: 3000<br/>BFF/Gateway]
    end

    subgraph "Microservicios - Capa de Aplicación"
        AuthSvc[🔐 Auth Service<br/>:4004<br/>Login/Register/JWT]
        UsersSvc[👤 Users Service<br/>:4007<br/>Perfiles/Búsqueda]
        PostsSvc[📝 Posts Service<br/>:4002<br/>Publicaciones/Feeds]
        RequestsSvc[📋 Requests Service<br/>:4003<br/>Solicitudes/Estados]
        MessagesSvc[💬 Messages Service<br/>:4008<br/>Mensajes]
        ConversationsSvc[🗨️ Conversations Service<br/>:4009<br/>Conversaciones]
        ChatSvc[💭 Chat Service<br/>:4010<br/>WebSocket/Real-time]
        NotificationsSvc[🔔 Notifications Service<br/>:4001<br/>Notificaciones]
        ProfileSvc[👔 Profile Service<br/>:4005<br/>Perfiles]
        RatingsSvc[⭐ Ratings Service<br/>:4006<br/>Calificaciones/Reviews]
    end

    subgraph "Infraestructura de Mensajería"
        Kafka[📨 Apache Kafka<br/>:9092<br/>Event Streaming]
        Zookeeper[🗄️ Zookeeper<br/>:2181<br/>Coordinación]
    end

    subgraph "Almacenamiento"
        PostgreSQL[(🗄️ PostgreSQL<br/>:5432<br/>Base de Datos Principal)]
        Redis[(⚡ Redis<br/>:6379<br/>Cache/Sessions)]
    end

    Browser -->|HTTP/HTTPS| NextJS
    NextJS -->|REST API| AuthSvc
    NextJS -->|REST API| UsersSvc
    NextJS -->|REST API| PostsSvc
    NextJS -->|REST API| RequestsSvc
    NextJS -->|REST API| MessagesSvc
    NextJS -->|REST API| ConversationsSvc
    NextJS -->|WebSocket| ChatSvc
    NextJS -->|REST API| NotificationsSvc
    NextJS -->|REST API| ProfileSvc
    NextJS -->|REST API| RatingsSvc

    RequestsSvc -->|HTTP| NotificationsSvc
    RequestsSvc -.->|Eventos| Kafka
    PostsSvc -.->|Eventos| Kafka
    MessagesSvc -.->|Eventos| Kafka
    NotificationsSvc -.->|Consume| Kafka
    ChatSvc -.->|Eventos| Kafka

    Kafka --> Zookeeper

    AuthSvc --> PostgreSQL
    UsersSvc --> PostgreSQL
    PostsSvc --> PostgreSQL
    RequestsSvc --> PostgreSQL
    MessagesSvc --> PostgreSQL
    ConversationsSvc --> PostgreSQL
    NotificationsSvc --> PostgreSQL
    ProfileSvc --> PostgreSQL
    RatingsSvc --> PostgreSQL
    ChatSvc --> Redis

    style Browser fill:#e1f5ff
    style NextJS fill:#0070f3,color:#fff
    style AuthSvc fill:#4caf50,color:#fff
    style UsersSvc fill:#2196f3,color:#fff
    style PostsSvc fill:#ff9800,color:#fff
    style RequestsSvc fill:#9c27b0,color:#fff
    style MessagesSvc fill:#00bcd4,color:#fff
    style ConversationsSvc fill:#009688,color:#fff
    style ChatSvc fill:#e91e63,color:#fff
    style NotificationsSvc fill:#f44336,color:#fff
    style ProfileSvc fill:#795548,color:#fff
    style RatingsSvc fill:#ffc107,color:#000
    style Kafka fill:#ff6f00,color:#fff
    style Zookeeper fill:#424242,color:#fff
    style PostgreSQL fill:#336791,color:#fff
    style Redis fill:#dc382d,color:#fff
```

## Diagrama PlantUML

```plantuml
@startuml ArquitecturaAltoNivel
!theme plain
skinparam backgroundColor #FFFFFF
skinparam componentStyle rectangle

package "Cliente" {
  [Navegador Web] as Browser
}

package "Frontend Layer" {
  [Next.js Frontend\nBFF/Gateway\n:3000] as NextJS
}

package "Microservicios" {
  [Auth Service\n:4004] as AuthSvc
  [Users Service\n:4007] as UsersSvc
  [Posts Service\n:4002] as PostsSvc
  [Requests Service\n:4003] as RequestsSvc
  [Messages Service\n:4008] as MessagesSvc
  [Conversations Service\n:4009] as ConversationsSvc
  [Chat Service\n:4010] as ChatSvc
  [Notifications Service\n:4001] as NotificationsSvc
  [Profile Service\n:4005] as ProfileSvc
  [Ratings Service\n:4006] as RatingsSvc
}

package "Infraestructura" {
  database "PostgreSQL\n:5432" as PostgreSQL
  database "Redis\n:6379" as Redis
  queue "Kafka\n:9092" as Kafka
  [Zookeeper\n:2181] as Zookeeper
}

Browser --> NextJS : HTTP/HTTPS
NextJS --> AuthSvc : REST API
NextJS --> UsersSvc : REST API
NextJS --> PostsSvc : REST API
NextJS --> RequestsSvc : REST API
NextJS --> MessagesSvc : REST API
NextJS --> ConversationsSvc : REST API
NextJS --> ChatSvc : WebSocket
NextJS --> NotificationsSvc : REST API
NextJS --> ProfileSvc : REST API
NextJS --> RatingsSvc : REST API

RequestsSvc --> NotificationsSvc : HTTP
RequestsSvc ..> Kafka : Eventos
PostsSvc ..> Kafka : Eventos
MessagesSvc ..> Kafka : Eventos
Kafka ..> NotificationsSvc : Consume

Kafka --> Zookeeper

AuthSvc --> PostgreSQL
UsersSvc --> PostgreSQL
PostsSvc --> PostgreSQL
RequestsSvc --> PostgreSQL
MessagesSvc --> PostgreSQL
ConversationsSvc --> PostgreSQL
NotificationsSvc --> PostgreSQL
ProfileSvc --> PostgreSQL
RatingsSvc --> PostgreSQL
ChatSvc --> Redis

@enduml
```

## Leyenda

- **Líneas sólidas**: Comunicación síncrona (HTTP/REST)
- **Líneas punteadas**: Comunicación asíncrona (Eventos Kafka)
- **Puertos**: Cada servicio expone un puerto específico
- **Colores**: Diferentes colores para identificar tipos de servicios

## Notas Técnicas

1. **Next.js como BFF**: El frontend Next.js actúa como Backend for Frontend, manejando la composición de datos y el enrutamiento a microservicios.

2. **Comunicación Síncrona vs Asíncrona**:
   - Síncrona: Para operaciones que requieren respuesta inmediata (CRUD básico)
   - Asíncrona: Para eventos que no requieren respuesta inmediata (notificaciones, actualizaciones de estado)

3. **Base de Datos Compartida**: Actualmente todos los servicios comparten PostgreSQL. En producción, cada servicio debería tener su propia base de datos.

4. **Kafka para Eventos**: Se usa para desacoplar servicios y permitir escalabilidad horizontal.

