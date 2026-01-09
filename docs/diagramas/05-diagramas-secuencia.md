# Diagramas de Secuencia

## Descripción
Este documento contiene los diagramas de secuencia para los flujos principales del sistema Request App.

## 1. Flujo de Autenticación y Registro

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (Next.js)
    participant A as Auth Service
    participant DB as PostgreSQL
    participant N as NextAuth

    Note over U,N: Registro de Nuevo Usuario
    U->>F: Accede a /register
    F->>F: Renderiza formulario
    U->>F: Completa formulario (email, password, name)
    F->>A: POST /register {email, password, name}
    A->>DB: INSERT INTO users
    DB-->>A: User creado
    A-->>F: {user: {...}}
    F->>N: Crea sesión
    N-->>F: Sesión establecida
    F-->>U: Redirige a /dashboard

    Note over U,N: Inicio de Sesión
    U->>F: Accede a /login
    F->>F: Renderiza formulario
    U->>F: Ingresa credenciales
    F->>A: POST /login {email, password}
    A->>DB: SELECT * FROM users WHERE email
    DB-->>A: User encontrado
    A->>A: Valida password
    A-->>F: {user: {...}}
    F->>N: Crea sesión
    N-->>F: Sesión establecida
    F-->>U: Redirige a /dashboard
```

## 2. Flujo de Creación y Gestión de Solicitudes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant R as Requests Service
    participant DB as PostgreSQL
    participant K as Kafka
    participant N as Notifications Service

    Note over U,N: Crear Solicitud
    U->>F: Ver perfil de otro usuario
    U->>F: Click "Enviar Solicitud"
    F->>F: Abre RequestModal
    U->>F: Completa formulario (tipo, mensaje)
    F->>R: POST /requests {type, message, fromUserId, toUserId}
    R->>DB: INSERT INTO requests
    DB-->>R: Request creado
    R->>K: Publica evento RequestCreated
    K->>N: Consume RequestCreated
    N->>DB: INSERT INTO notifications
    N->>N: Emite notificación WebSocket
    R-->>F: {request: {...}}
    F-->>U: Muestra confirmación

    Note over U,N: Aceptar Solicitud
    U->>F: Ve solicitud recibida
    U->>F: Click "Aceptar"
    F->>R: PUT /requests/:id {status: "ACCEPTED"}
    R->>DB: UPDATE requests SET status
    DB-->>R: Request actualizado
    R->>K: Publica evento RequestAccepted
    K->>N: Consume RequestAccepted
    N->>DB: INSERT INTO notifications
    N->>N: Emite notificación WebSocket
    R-->>F: {request: {...}}
    F-->>U: Redirige a chat
```

## 3. Flujo de Mensajería y Chat

```mermaid
sequenceDiagram
    participant U1 as Usuario 1
    participant U2 as Usuario 2
    participant F as Frontend
    participant C as Chat Service
    participant M as Messages Service
    participant DB as PostgreSQL
    participant K as Kafka
    participant R as Redis

    Note over U1,R: Enviar Mensaje en Tiempo Real
    U1->>F: Abre chat con Usuario 2
    F->>C: WebSocket connect
    C->>R: Subscribe canal usuario2
    U1->>F: Escribe mensaje
    F->>C: WebSocket send {content, senderId, receiverId}
    C->>M: POST /messages {content, senderId, receiverId}
    M->>DB: INSERT INTO messages
    DB-->>M: Message creado
    M->>K: Publica evento MessageSent
    M-->>C: {message: {...}}
    C->>R: Publish a canal usuario2
    C->>F: WebSocket broadcast (Usuario 2)
    F-->>U2: Muestra mensaje en tiempo real

    Note over U1,R: Cargar Historial
    U1->>F: Abre conversación
    F->>M: GET /messages?userId=...
    M->>DB: SELECT * FROM messages WHERE...
    DB-->>M: Lista de mensajes
    M-->>F: {messages: [...]}
    F-->>U1: Muestra historial
```

## 4. Flujo de Publicaciones y Feed

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant P as Posts Service
    participant DB as PostgreSQL
    participant K as Kafka

    Note over U,K: Crear Publicación
    U->>F: Accede a /posts/new
    F->>F: Renderiza formulario
    U->>F: Completa datos (título, contenido, tipo, carrera)
    F->>P: POST /posts {title, content, type, careerSpace, authorId}
    P->>DB: INSERT INTO posts
    DB-->>P: Post creado
    P->>K: Publica evento PostCreated
    P-->>F: {post: {...}}
    F-->>U: Redirige a /dashboard

    Note over U,K: Ver Feed
    U->>F: Accede a /dashboard
    F->>P: GET /posts?careerSpace=...&type=...
    P->>DB: SELECT * FROM posts WHERE... ORDER BY createdAt
    DB-->>P: Lista de posts
    P-->>F: {posts: [...]}
    F-->>U: Muestra feed
```

## 5. Flujo de Completar Solicitud y Calificación

```mermaid
sequenceDiagram
    participant U1 as Usuario 1
    participant U2 as Usuario 2
    participant F as Frontend
    participant R as Requests Service
    participant RT as Ratings Service
    participant DB as PostgreSQL
    participant K as Kafka
    participant N as Notifications Service

    Note over U1,N: Completar Solicitud
    U1->>F: Ve solicitud aceptada
    U1->>F: Click "Completar"
    F->>F: Abre CompleteRequestModal
    U1->>F: Ingresa calificación y reseña
    F->>R: POST /requests/:id/complete {rating, review}
    R->>DB: UPDATE requests SET completedAt, fromUserRating, fromUserReview
    DB-->>R: Request actualizado
    R->>RT: POST /ratings {fromUserId, toUserId, rating, review}
    RT->>DB: INSERT INTO reviews
    RT->>DB: UPDATE users SET rating, reviewCount
    DB-->>RT: Rating creado y usuario actualizado
    RT-->>R: Rating procesado
    R->>K: Publica evento RequestCompleted
    K->>N: Consume RequestCompleted
    N->>DB: INSERT INTO notifications
    N->>N: Emite notificación WebSocket
    R-->>F: {request: {...}}
    F-->>U1: Muestra confirmación

    Note over U1,N: U2 también completa y califica
    U2->>F: Recibe notificación de completado
    U2->>F: Completa su parte (calificación)
    F->>R: POST /requests/:id/complete {rating, review}
    R->>DB: UPDATE requests SET toUserRating, toUserReview
    R->>RT: POST /ratings
    RT->>DB: INSERT INTO reviews + UPDATE users
    R-->>F: Confirmación
    F-->>U2: Solicitud completamente finalizada
```

## 6. Flujo de Notificaciones en Tiempo Real

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant N as Notifications Service
    participant DB as PostgreSQL
    participant K as Kafka
    participant WS as WebSocket Server

    Note over U,WS: Sistema de Notificaciones
    K->>N: Evento RequestCreated/MessageSent/etc.
    N->>DB: INSERT INTO notifications
    DB-->>N: Notification creada
    N->>WS: Emite evento via Socket.io
    WS->>F: WebSocket message {notification}
    F->>F: Actualiza contador de notificaciones
    F-->>U: Muestra badge de notificación

    Note over U,WS: Usuario ve notificaciones
    U->>F: Click en icono de notificaciones
    F->>N: GET /notifications?userId=...
    N->>DB: SELECT * FROM notifications WHERE userId
    DB-->>N: Lista de notificaciones
    N-->>F: {notifications: [...]}
    F-->>U: Muestra lista

    Note over U,WS: Marcar como leída
    U->>F: Click en notificación
    F->>N: PATCH /notifications/:id {read: true}
    N->>DB: UPDATE notifications SET read=true
    DB-->>N: Notification actualizada
    N-->>F: {notification: {...}}
    F-->>U: Actualiza UI
```

## Diagramas PlantUML

### Flujo de Autenticación

```plantuml
@startuml SecuenciaAutenticacion
!theme plain
skinparam backgroundColor #FFFFFF

actor Usuario
participant "Frontend\n(Next.js)" as Frontend
participant "Auth Service" as Auth
database PostgreSQL
participant NextAuth

== Registro ==
Usuario -> Frontend: Accede a /register
Frontend -> Frontend: Renderiza formulario
Usuario -> Frontend: Completa formulario
Frontend -> Auth: POST /register
Auth -> PostgreSQL: INSERT INTO users
PostgreSQL -> Auth: User creado
Auth -> Frontend: {user}
Frontend -> NextAuth: Crea sesión
NextAuth -> Frontend: Sesión establecida
Frontend -> Usuario: Redirige a /dashboard

== Login ==
Usuario -> Frontend: Accede a /login
Frontend -> Frontend: Renderiza formulario
Usuario -> Frontend: Ingresa credenciales
Frontend -> Auth: POST /login
Auth -> PostgreSQL: SELECT * FROM users
PostgreSQL -> Auth: User encontrado
Auth -> Auth: Valida password
Auth -> Frontend: {user}
Frontend -> NextAuth: Crea sesión
NextAuth -> Frontend: Sesión establecida
Frontend -> Usuario: Redirige a /dashboard

@enduml
```

### Flujo de Solicitudes

```plantuml
@startuml SecuenciaSolicitudes
!theme plain
skinparam backgroundColor #FFFFFF

actor Usuario
participant "Frontend" as Frontend
participant "Requests Service" as Requests
database PostgreSQL
queue Kafka
participant "Notifications Service" as Notifications

== Crear Solicitud ==
Usuario -> Frontend: Ver perfil + Click "Enviar Solicitud"
Frontend -> Frontend: Abre RequestModal
Usuario -> Frontend: Completa formulario
Frontend -> Requests: POST /requests
Requests -> PostgreSQL: INSERT INTO requests
PostgreSQL -> Requests: Request creado
Requests -> Kafka: Publica RequestCreated
Kafka -> Notifications: Consume RequestCreated
Notifications -> PostgreSQL: INSERT INTO notifications
Notifications -> Notifications: Emite WebSocket
Requests -> Frontend: {request}
Frontend -> Usuario: Muestra confirmación

== Aceptar Solicitud ==
Usuario -> Frontend: Click "Aceptar"
Frontend -> Requests: PUT /requests/:id {status: ACCEPTED}
Requests -> PostgreSQL: UPDATE requests
PostgreSQL -> Requests: Request actualizado
Requests -> Kafka: Publica RequestAccepted
Kafka -> Notifications: Consume RequestAccepted
Notifications -> PostgreSQL: INSERT INTO notifications
Requests -> Frontend: {request}
Frontend -> Usuario: Redirige a chat

@enduml
```










