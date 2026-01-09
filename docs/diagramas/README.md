# Diagramas del Proyecto Request App

Este directorio contiene todos los diagramas de arquitectura, diseño y flujos del proyecto Request App.

## Índice de Diagramas

### 1. [Arquitectura de Alto Nivel](./01-arquitectura-alto-nivel.md)
- **Descripción**: Vista general del sistema con todos los microservicios, frontend e infraestructura
- **Incluye**: Microservicios, comunicación, bases de datos, Kafka
- **Formato**: Mermaid y PlantUML

### 2. [Diagrama de Casos de Uso](./02-casos-de-uso.md)
- **Descripción**: Casos de uso principales desde la perspectiva del usuario
- **Incluye**: Autenticación, gestión de perfil, publicaciones, solicitudes, mensajería, calificaciones, notificaciones
- **Formato**: Mermaid y PlantUML

### 3. [Componentes del Frontend](./03-componentes-frontend.md)
- **Descripción**: Estructura de componentes, páginas y servicios del frontend Next.js
- **Incluye**: Páginas, componentes reutilizables, servicios, middleware
- **Formato**: Mermaid y PlantUML

### 4. [Diagrama de Base de Datos](./04-diagrama-base-datos.md)
- **Descripción**: Modelo Entidad-Relación completo del sistema
- **Incluye**: Todas las entidades, relaciones, atributos y enums
- **Formato**: Mermaid ER y PlantUML

### 5. [Diagramas de Secuencia](./05-diagramas-secuencia.md)
- **Descripción**: Flujos de interacción detallados para operaciones principales
- **Incluye**: 
  - Autenticación y registro
  - Creación y gestión de solicitudes
  - Mensajería y chat
  - Publicaciones y feed
  - Completar solicitud y calificación
  - Notificaciones en tiempo real
- **Formato**: Mermaid y PlantUML

### 6. [Diagrama de Despliegue](./06-diagrama-despliegue.md)
- **Descripción**: Arquitectura de despliegue con Docker, redes y volúmenes
- **Incluye**: Contenedores, puertos, volúmenes, configuración Docker Compose
- **Formato**: Mermaid y PlantUML

### 7. [Diagrama de Bajo Nivel - Requests Service](./07-diagrama-bajo-nivel-requests.md)
- **Descripción**: Arquitectura interna detallada del Requests Service
- **Incluye**: Controladores, lógica de negocio, acceso a datos, eventos
- **Formato**: Mermaid y PlantUML

## Cómo Visualizar los Diagramas

### Mermaid
Los diagramas Mermaid se pueden visualizar en:
- **GitHub**: Se renderizan automáticamente en archivos `.md`
- **VS Code**: Con la extensión "Markdown Preview Mermaid Support"
- **Online**: [Mermaid Live Editor](https://mermaid.live/)
- **Documentación**: Muchos editores de markdown modernos

### PlantUML
Los diagramas PlantUML se pueden visualizar en:
- **VS Code**: Con la extensión "PlantUML"
- **Online**: [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
- **Local**: Instalar PlantUML y usar con Java

## Estructura del Proyecto

```
request-app/
├── frontend/              # Next.js Frontend
├── services/              # Microservicios
│   ├── auth-service/
│   ├── users-service/
│   ├── posts-service/
│   ├── requests-service/
│   ├── messages-service/
│   ├── conversations-service/
│   ├── chat-service/
│   ├── notification-service/
│   ├── profile-service/
│   └── ratings-service/
├── docs/
│   ├── diagramas/         # Este directorio
│   └── informe_microservicios_request_app.md
└── docker-compose.yaml    # Configuración de despliegue
```

## Microservicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Auth Service | 4004 | Autenticación y registro |
| Users Service | 4007 | Gestión de usuarios |
| Posts Service | 4002 | Publicaciones y feed |
| Requests Service | 4003 | Solicitudes entre usuarios |
| Messages Service | 4008 | Mensajes |
| Conversations Service | 4009 | Conversaciones |
| Chat Service | 4010 | Chat en tiempo real (WebSocket) |
| Notifications Service | 4001 | Notificaciones |
| Profile Service | 4005 | Perfiles de usuario |
| Ratings Service | 4006 | Calificaciones y reseñas |

## Infraestructura

- **PostgreSQL**: Base de datos principal (puerto 5432)
- **Redis**: Cache y sesiones (puerto 6379)
- **Kafka**: Message broker para eventos (puerto 9092 interno, 29092 host)
- **Zookeeper**: Coordinación de Kafka (puerto 2181)

## Tecnologías Principales

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL, Prisma ORM
- **Mensajería**: Apache Kafka
- **Cache**: Redis
- **Autenticación**: NextAuth.js
- **Despliegue**: Docker, Docker Compose

## Notas

1. **Base de Datos Compartida**: Actualmente todos los servicios comparten PostgreSQL. En producción, cada servicio debería tener su propia base de datos.

2. **Comunicación**:
   - **Síncrona**: HTTP/REST para operaciones que requieren respuesta inmediata
   - **Asíncrona**: Kafka para eventos y desacoplamiento

3. **Escalabilidad**: Cada microservicio puede escalarse independientemente.

4. **Observabilidad**: Se recomienda agregar Prometheus, Grafana y Jaeger para monitoreo en producción.

## Actualización de Diagramas

Cuando se realicen cambios significativos en la arquitectura:
1. Actualizar el diagrama correspondiente
2. Actualizar este README si es necesario
3. Documentar los cambios en el commit

## Contacto

Para preguntas sobre la arquitectura o los diagramas, consultar el equipo de desarrollo.










