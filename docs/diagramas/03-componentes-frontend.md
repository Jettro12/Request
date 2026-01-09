# Diagrama de Componentes del Frontend

## Descripción
Este diagrama muestra la estructura de componentes del frontend Next.js, incluyendo páginas, componentes reutilizables y servicios.

## Diagrama Mermaid

```mermaid
graph TB
    subgraph "Páginas (App Router)"
        Home[🏠 Home Page<br/>/]
        Login[🔐 Login Page<br/>/login]
        Register[📝 Register Page<br/>/register]
        Dashboard[📊 Dashboard<br/>/dashboard]
        Profile[👤 Profile Page<br/>/profile]
        ProfileId[👤 Profile by ID<br/>/profile/[id]]
        ProfileEdit[✏️ Edit Profile<br/>/profile/edit]
        Requests[📋 Requests Page<br/>/requests]
        PostsNew[➕ New Post<br/>/posts/new]
        Chat[💬 Chat Page<br/>/chat]
        ChatUser[💭 Chat with User<br/>/chat/[userId]]
        Search[🔍 Search Page<br/>/search]
    end

    subgraph "Componentes Reutilizables"
        Header[📱 Header Component]
        RequestModal[📝 Request Modal]
        CompleteRequestModal[✅ Complete Request Modal]
        AgreementMessage[🤝 Agreement Message]
        AuthProvider[🔒 Auth Provider]
        Providers[⚙️ Providers Wrapper]
    end

    subgraph "Servicios y Librerías"
        ApiClient[🌐 API Client<br/>lib/api/client.ts]
        AuthService[🔐 Auth Service<br/>lib/services/auth.service.ts]
        UsersService[👤 Users Service<br/>lib/services/users.service.ts]
        AuthLib[🔑 Auth Library<br/>lib/auth.ts]
        Config[⚙️ API Config<br/>lib/api/config.ts]
    end

    subgraph "Middleware y Configuración"
        Middleware[🛡️ Middleware<br/>middleware.ts]
        NextAuth[🔐 NextAuth Route<br/>api/auth/[...nextauth]]
    end

    subgraph "Microservicios (Backend)"
        AuthSvc[🔐 Auth Service :4004]
        UsersSvc[👤 Users Service :4007]
        PostsSvc[📝 Posts Service :4002]
        RequestsSvc[📋 Requests Service :4003]
        MessagesSvc[💬 Messages Service :4008]
        ChatSvc[💭 Chat Service :4010]
        NotificationsSvc[🔔 Notifications Service :4001]
    end

    Home --> Header
    Login --> AuthProvider
    Register --> AuthProvider
    Dashboard --> Header
    Dashboard --> ApiClient
    Profile --> Header
    Profile --> RequestModal
    Profile --> ApiClient
    ProfileId --> Header
    ProfileId --> RequestModal
    ProfileId --> ApiClient
    ProfileEdit --> Header
    ProfileEdit --> ApiClient
    Requests --> Header
    Requests --> CompleteRequestModal
    Requests --> AgreementMessage
    Requests --> ApiClient
    PostsNew --> Header
    PostsNew --> ApiClient
    Chat --> Header
    Chat --> ApiClient
    ChatUser --> Header
    ChatUser --> ApiClient
    Search --> Header
    Search --> ApiClient

    RequestModal --> ApiClient
    CompleteRequestModal --> ApiClient
    AgreementMessage --> ApiClient

    ApiClient --> AuthService
    ApiClient --> UsersService
    ApiClient --> Config
    AuthService --> AuthLib
    UsersService --> Config

    Login --> NextAuth
    Register --> NextAuth
    NextAuth --> AuthSvc
    ApiClient --> UsersSvc
    ApiClient --> PostsSvc
    ApiClient --> RequestsSvc
    ApiClient --> MessagesSvc
    ApiClient --> ChatSvc
    ApiClient --> NotificationsSvc

    Middleware --> NextAuth

    style Home fill:#0070f3,color:#fff
    style Login fill:#4caf50,color:#fff
    style Register fill:#4caf50,color:#fff
    style Dashboard fill:#ff9800,color:#fff
    style Profile fill:#9c27b0,color:#fff
    style Requests fill:#f44336,color:#fff
    style Chat fill:#00bcd4,color:#fff
    style ApiClient fill:#2196f3,color:#fff
    style NextAuth fill:#4caf50,color:#fff
```

## Diagrama PlantUML

```plantuml
@startuml ComponentesFrontend
!theme plain
skinparam backgroundColor #FFFFFF

package "Páginas (App Router)" {
  [Home Page /] as Home
  [Login Page /login] as Login
  [Register Page /register] as Register
  [Dashboard /dashboard] as Dashboard
  [Profile Page /profile] as Profile
  [Profile by ID /profile/[id]] as ProfileId
  [Edit Profile /profile/edit] as ProfileEdit
  [Requests Page /requests] as Requests
  [New Post /posts/new] as PostsNew
  [Chat Page /chat] as Chat
  [Chat with User /chat/[userId]] as ChatUser
  [Search Page /search] as Search
}

package "Componentes Reutilizables" {
  [Header Component] as Header
  [Request Modal] as RequestModal
  [Complete Request Modal] as CompleteRequestModal
  [Agreement Message] as AgreementMessage
  [Auth Provider] as AuthProvider
  [Providers Wrapper] as Providers
}

package "Servicios y Librerías" {
  [API Client] as ApiClient
  [Auth Service] as AuthService
  [Users Service] as UsersService
  [Auth Library] as AuthLib
  [API Config] as Config
}

package "Middleware" {
  [Middleware] as Middleware
  [NextAuth Route] as NextAuth
}

package "Microservicios Backend" {
  [Auth Service :4004] as AuthSvc
  [Users Service :4007] as UsersSvc
  [Posts Service :4002] as PostsSvc
  [Requests Service :4003] as RequestsSvc
  [Messages Service :4008] as MessagesSvc
  [Chat Service :4010] as ChatSvc
  [Notifications Service :4001] as NotificationsSvc
}

Home --> Header
Login --> AuthProvider
Register --> AuthProvider
Dashboard --> Header
Dashboard --> ApiClient
Profile --> Header
Profile --> RequestModal
Profile --> ApiClient
ProfileId --> Header
ProfileId --> RequestModal
ProfileId --> ApiClient
ProfileEdit --> ApiClient
Requests --> Header
Requests --> CompleteRequestModal
Requests --> AgreementMessage
Requests --> ApiClient
PostsNew --> Header
PostsNew --> ApiClient
Chat --> Header
Chat --> ApiClient
ChatUser --> Header
ChatUser --> ApiClient
Search --> Header
Search --> ApiClient

RequestModal --> ApiClient
CompleteRequestModal --> ApiClient
AgreementMessage --> ApiClient

ApiClient --> AuthService
ApiClient --> UsersService
ApiClient --> Config
AuthService --> AuthLib
UsersService --> Config

Login --> NextAuth
Register --> NextAuth
NextAuth --> AuthSvc
ApiClient --> UsersSvc
ApiClient --> PostsSvc
ApiClient --> RequestsSvc
ApiClient --> MessagesSvc
ApiClient --> ChatSvc
ApiClient --> NotificationsSvc

Middleware --> NextAuth

@enduml
```

## Estructura de Componentes

### Páginas Principales
1. **Home** (`/`): Página de inicio con información general
2. **Login/Register**: Autenticación de usuarios
3. **Dashboard** (`/dashboard`): Feed principal con publicaciones y usuarios
4. **Profile**: Gestión de perfil propio y visualización de otros perfiles
5. **Requests** (`/requests`): Gestión de solicitudes (enviadas/recibidas)
6. **Posts** (`/posts/new`): Creación de nuevas publicaciones
7. **Chat**: Sistema de mensajería y conversaciones
8. **Search**: Búsqueda de usuarios y contenido

### Componentes Reutilizables
- **Header**: Navegación principal de la aplicación
- **RequestModal**: Modal para crear/enviar solicitudes
- **CompleteRequestModal**: Modal para completar solicitudes y calificar
- **AgreementMessage**: Componente para manejar acuerdos
- **AuthProvider**: Proveedor de contexto de autenticación
- **Providers**: Wrapper de proveedores (NextAuth, etc.)

### Capa de Servicios
- **API Client**: Cliente centralizado para comunicación con microservicios
- **Auth Service**: Servicio de autenticación
- **Users Service**: Servicio de gestión de usuarios
- **Config**: Configuración de endpoints y URLs

### Flujo de Datos
1. Páginas usan componentes reutilizables
2. Componentes y páginas consumen API Client
3. API Client se comunica con microservicios backend
4. NextAuth maneja la autenticación
5. Middleware protege rutas que requieren autenticación










