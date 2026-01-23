# REQUEST APP - PRESENTATION
## Resumen Ejecutivo para Stakeholders

---

## SLIDE 1: PORTADA

# REQUEST APP
## Red Universitaria de Colaboración

**Plataforma de conexión, colaboración y oportunidades académicas**

```
🎓 Estudiantes | 📱 Plataforma Omnichannel | 🚀 Escalable
```

**Presentado por:** Jettro  
**Fecha:** Enero 2026

---

## SLIDE 2: EL PROBLEMA

### Desafíos en la Comunidad Universitaria

```
┌─────────────────────┐
│ Estudiante A        │
│ Busca colaborador   │
│ en React + Node.js  │
└──────────┬──────────┘
           │
      ❌ No sabe dónde buscar
      ❌ Conexión manual y caótica
      ❌ Sin validación de skills
      ❌ Comunicación fragmentada
           │
┌──────────▼──────────┐
│ Estudiante B        │
│ Tiene skills pero   │
│ no es visible       │
└─────────────────────┘
```

**Problemas Identificados:**
- ❌ Falta de plataforma centralizada
- ❌ Búsqueda manual y poco eficiente
- ❌ Sin sistema de reputación
- ❌ Comunicación dispersa
- ❌ Oportunidades perdidas

---

## SLIDE 3: LA SOLUCIÓN

### REQUEST APP: Plataforma Integral

```
┌─────────────────────────────────────────────────────┐
│           REQUEST APP ECOSYSTEM                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌐 WEB              📱 MOBILE         💻 DESKTOP   │
│  (Next.js)          (React Native)    (Electron)   │
│                                                     │
│         ↓              ↓                  ↓         │
│                                                     │
│  ──────────── API GATEWAY (Nginx) ─────────────    │
│                                                     │
│  ├─ Autenticación      ├─ Búsqueda       │         │
│  ├─ Solicitudes        ├─ Chat tiempo    │         │
│  ├─ Posts              │  real           │         │
│  ├─ Perfiles           ├─ Notificaciones │         │
│  ├─ Mensajería         ├─ Archivos       │         │
│  └─ Ratings            └─ Estadísticas   │         │
│                                                     │
│  INFRAESTRUCTURA: PostgreSQL + MongoDB + Kafka     │
└─────────────────────────────────────────────────────┘
```

---

## SLIDE 4: CARACTERÍSTICAS CLAVE

### Lo que REQUEST APP Ofrece

#### 1️⃣ Búsqueda Inteligente
```
Filtrar por:
- Carrera profesional
- Skills específicas
- Tipo de colaboración
- Rating y reputación
```

#### 2️⃣ Solicitudes Estructuradas
```
PENDING ──accept──> ACCEPTED ──complete──> COMPLETED
                        │
                    CHAT EN VIVO
                    MENSAJERÍA
                        │
                   RATING BILATERAL
```

#### 3️⃣ Comunicación Integrada
```
- Chat en tiempo real (WebSocket)
- Mensajería privada
- Notificaciones push
- Historial completo
```

#### 4️⃣ Sistema de Reputación
```
5.0 ⭐⭐⭐⭐⭐
├─ Basado en interacciones reales
├─ Reviews anónimas (opcional)
└─ Estadísticas públicas
```

---

## SLIDE 5: ARQUITECTURA DE MICROSERVICIOS

### 11 Servicios Independientes

```
┌──────────────────────────────────────────────────┐
│           MICROSERVICIOS REQUEST APP             │
├──────────────────────────────────────────────────┤
│                                                  │
│  🔐 Auth (4004)          📝 Posts (4002)        │
│  Autenticación           Publicaciones          │
│                                                  │
│  👥 Users (4007)         🤝 Requests (4003)     │
│  Perfiles                Solicitudes            │
│                                                  │
│  💬 Chat (4010)          📧 Messages (4008)     │
│  WebSocket RT            Mensajería             │
│                                                  │
│  🔔 Notifications (4001) 📁 Files (4011)        │
│  Notificaciones          Almacenamiento         │
│                                                  │
│  👤 Profile (4005)       ⭐ Ratings (4006)     │
│  Perfiles enriquecidos   Sistema de votos      │
│                                                  │
│  💬 Conversations (4009)                        │
│  Agrupación de chats                            │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Escalado independiente
- ✅ Deployment flexible
- ✅ Fallos aislados
- ✅ Equipos autónomos

---

## SLIDE 6: COMUNICACIÓN ENTRE SERVICIOS

### Dos Patrones Complementarios

#### 📡 SÍNCRONA (REST API)
```
Cliente ──HTTP──> Nginx ──> Posts Service
                              │
                        Query Database
                              │
                          Response JSON
```
**Casos de uso:** Lecturas, consultas inmediatas

#### 🔄 ASÍNCRONA (Kafka Event Streaming)
```
Posts Service
    │
    └──> Publica evento
         "post.created"
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
  Notif Users Analytics
  Svc   Svc  Svc
```
**Casos de uso:** Notificaciones, auditoría, reacciones en cadena

**Ventaja clave:** Servicios no se llaman directamente entre ellos ✅

---

## SLIDE 7: FLUJO DE UNA SOLICITUD (REQUEST)

### Caso Real: Usuario A solicita colaboración a Usuario B

```
PASO 1: CREACIÓN
┌──────────────────────────────────────┐
│ Usuario A                            │
│ POST /api/requests                   │
│ {                                    │
│   type: "COLLABORATION",             │
│   message: "Necesito React dev",     │
│   toUserId: "user_B"                 │
│ }                                    │
└────────┬─────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ Requests Service      │
    │ - Valida datos        │
    │ - Crea en DB          │
    │ - Publica evento      │
    └────┬─────────────────┘
         │ evento: "requests.created"
    ┌────▼──────────────────┐
    │ Notification Service  │
    │ - Crea notificación   │
    │ - Push a Usuario B    │
    └──────────────────────┘
```

```
PASO 2: RESPUESTA
┌──────────────────────────────────────┐
│ Usuario B                            │
│ PATCH /api/requests/{id}             │
│ { status: "ACCEPTED" }               │
└────────┬─────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ Requests Service      │
    │ - Actualiza estado    │
    │ - Publica evento      │
    └────┬─────────────────┘
         │
    ┌────▼──────────────────┐
    │ Notification Service  │
    │ - Notifica a Usuario A│
    │ - Chat ahora activo   │
    └──────────────────────┘
```

```
PASO 3: COMUNICACIÓN
┌──────────────────────────────────────┐
│ WebSocket Chat Room (Socket.IO)      │
│ Ambos usuarios conectados            │
│ Mensajes en tiempo real              │
│ Typing indicators                    │
└────────────────────────────────────┘
```

```
PASO 4: FINALIZACIÓN
┌──────────────────────────────────────┐
│ Usuario A completa                   │
│ PATCH /api/requests/{id}             │
│ {                                    │
│   status: "COMPLETED",               │
│   rating: 5,                         │
│   review: "Excelente colaborador"   │
│ }                                    │
└────────┬─────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ Ratings Service       │
    │ - Almacena rating     │
    │ - Actualiza promedio  │
    └────┬─────────────────┘
         │
    ┌────▼──────────────────┐
    │ Users Service         │
    │ - Actualiza reputación│
    │ - Estadísticas        │
    └──────────────────────┘
```

---

## SLIDE 8: STACK TECNOLÓGICO

### Frontend

```
┌─────────────────────────────────────┐
│      WEB BROWSER CLIENT             │
├─────────────────────────────────────┤
│ Framework    │ Next.js 14.2.35      │
│ UI Library   │ React 18.3           │
│ Styling      │ Tailwind CSS 3.4     │
│ State Mgmt   │ TanStack Query       │
│ Auth         │ NextAuth.js 4.24     │
│ Realtime     │ Socket.IO Client     │
│ Language     │ TypeScript 5.3       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    MOBILE (React Native)            │
├─────────────────────────────────────┤
│ Framework    │ Expo SDK 50          │
│ UI Library   │ React Native         │
│ Styling      │ NativeWind           │
│ State        │ Redux Toolkit        │
│ API          │ Axios                │
│ Language     │ TypeScript 5.3       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    DESKTOP (Electron Admin)         │
├─────────────────────────────────────┤
│ Framework    │ Electron 27          │
│ UI           │ React + Material-UI  │
│ IPC          │ Electron IPC         │
│ Database     │ SQLite (local)       │
│ Language     │ TypeScript 5.3       │
└─────────────────────────────────────┘
```

---

## SLIDE 9: BACKEND & BASES DE DATOS

### Servicios

```
┌─────────────────────────────────────┐
│    CADA MICROSERVICIO               │
├─────────────────────────────────────┤
│ Runtime      │ Node.js 20+          │
│ Framework    │ Express.js 4.18      │
│ ORM          │ Prisma 5.20          │
│ Validation   │ Zod / Joi            │
│ Testing      │ Jest 29              │
│ Language     │ TypeScript 5.5       │
└─────────────────────────────────────┘
```

### Bases de Datos

```
┌──────────────────────────────────┐
│    PostgreSQL 11+                │
├──────────────────────────────────┤
│ • Relacional                     │
│ • ACID transactions              │
│ • Full-text search               │
│ • 1 instancia por servicio       │
│ • Backups automáticos            │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    MongoDB 6+ (Files)            │
├──────────────────────────────────┤
│ • Documental                     │
│ • GridFS para binarios           │
│ • Flexible schema                │
│ • Chunks de 256KB                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    Redis (Cache/Sessions)        │
├──────────────────────────────────┤
│ • In-memory key-value            │
│ • Sessions NextAuth              │
│ • Caché temporal                 │
│ • Rate limiting                  │
└──────────────────────────────────┘
```

---

## SLIDE 10: MENSAJE & EVENTOS

### Apache Kafka - Event Streaming

```
15+ Topics de Eventos

posts.created ─────────────> Notification Service
              \─────────────> Users Service
               \────────────> Analytics

requests.created ──────────> Notifications
                 \─────────> Chat Activation

users.updated ─────────────> Cache Invalidation
              \─────────────> Indexing Service

messages.sent ─────────────> Conversations
              \─────────────> Notification

ratings.created ───────────> Users Service
                \──────────> Leaderboards
```

**Garantías:**
- ✅ At-Least-Once Delivery
- ✅ Ordering por partición
- ✅ Durabilidad (3x replicación)
- ✅ Retención configurable

---

## SLIDE 11: SEGURIDAD

### Múltiples Capas

```
┌────────────────────────────────────────┐
│  CLIENTE (Navegador/Mobile)            │
│  - HTTPOnly Cookies                    │
│  - CSRF tokens                         │
│  - Content Security Policy             │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────────┐
│  TRANSPORT (HTTPS/TLS)                 │
│  - TLS 1.3+                            │
│  - Certificados validados              │
│  - Perfect Forward Secrecy             │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────────┐
│  API GATEWAY (Nginx)                   │
│  - CORS restrictivo                    │
│  - Rate limiting                       │
│  - IP whitelist (admin)                │
│  - WAF rules                           │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────────┐
│  AUTENTICACIÓN (JWT)                   │
│  - Bearer tokens en header             │
│  - Expiración 1 hora                   │
│  - Refresh tokens seguros              │
│  - Revocación posible                  │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────────┐
│  AUTORIZACIÓN (Role-based)             │
│  - User roles: user, admin, moderator  │
│  - Scope-based permissions             │
│  - Row-level security (RLS)            │
│  - Resource ownership validation       │
└───────────┬────────────────────────────┘
            │
┌───────────▼────────────────────────────┐
│  BASE DE DATOS                         │
│  - Encrypted passwords (bcryptjs)      │
│  - Sensitive data encrypted            │
│  - Database user permissions            │
│  - Connection pooling                  │
└────────────────────────────────────────┘
```

---

## SLIDE 12: DEPLOYMENT & INFRAESTRUCTURA

### Entorno Local (Desarrollo)

```
docker-compose up -d

Servicios disponibles:
✅ Frontend: http://localhost:3000
✅ 11 Microservicios: 4001-4011
✅ PostgreSQL: localhost:5432
✅ MongoDB: localhost:27017
✅ Kafka: localhost:9092
✅ Nginx: http://localhost
```

### Entorno Producción (AWS)

```
┌─────────────────────────────────────┐
│         AWS INFRASTRUCTURE          │
├─────────────────────────────────────┤
│                                     │
│  Route53 (DNS)                      │
│      ↓                              │
│  CloudFront (CDN)                   │
│      ↓                              │
│  ALB (Application Load Balancer)    │
│      ↓                              │
│  ASG (Auto Scaling Group)           │
│      ├─ EC2 Instances               │
│      └─ Docker Containers           │
│                                     │
│  Backend Services:                  │
│  ├─ RDS PostgreSQL (Multi-AZ)       │
│  ├─ DocumentDB (MongoDB)            │
│  ├─ ElastiCache (Redis)             │
│  ├─ MSK (Managed Kafka)             │
│  └─ S3 (Backups/Storage)            │
│                                     │
│  Observability:                     │
│  ├─ CloudWatch (Logs/Metrics)       │
│  └─ X-Ray (Tracing)                 │
│                                     │
└─────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌──────────┐
│  Código  │ (GitHub)
│  Push    │
└────┬─────┘
     │
┌────▼──────────────────┐
│ GitHub Actions        │
│ - Build images        │
│ - Test               │
│ - Lint               │
└────┬──────────────────┘
     │
┌────▼──────────────────┐
│ Docker Build          │
│ - Frontend            │
│ - 11 Servicios        │
└────┬──────────────────┘
     │
┌────▼──────────────────┐
│ GHCR Push             │
│ (GitHub Container    │
│  Registry)            │
└────┬──────────────────┘
     │
┌────▼──────────────────┐
│ EC2 Pull & Deploy     │
│ docker-compose pull   │
│ docker-compose up     │
└──────────────────────┘
```

---

## SLIDE 13: PATRONES DE ARQUITECTURA

### 1. Hexagonal Architecture

```
        🎯 DOMAIN
            ↑
      ┌─────┴─────┐
      │           │
   HTTP Port   Event Port
   (REST)      (Kafka)
      │           │
      └─────┬─────┘
            ↓
     Database Adapter
     Cache Adapter
     External APIs
```

### 2. Event-Driven Architecture

```
Service A  Service B  Service C  Service D
    │         │          │          │
    └────────────────────┴──────────┘
               │
          Kafka Topic
               │
    ┌─────────┴──────────┐
    │                    │
Consumer 1          Consumer 2
(Notify)            (Audit)
```

### 3. Database per Service

```
Auth Svc      Users Svc      Posts Svc      Files Svc
    │             │              │              │
    ↓             ↓              ↓              ↓
PostgreSQL    PostgreSQL    PostgreSQL     MongoDB
(auth_db)     (users_db)    (posts_db)     (files_db)

✅ Escalado independiente
✅ Durabilidad de datos
⚠️ Eventual consistency
```

---

## SLIDE 14: ESCALABILIDAD

### Crecimiento Proyectado

```
FASE 1 (Actual: ~200 usuarios)
├─ 1 instancia por servicio
├─ PostgreSQL single instance
└─ Kafka 1 broker

        │
        ▼ (6 meses)

FASE 2 (1,000 usuarios)
├─ 2-3 instancias por servicio (Kubernetes)
├─ PostgreSQL read replicas
└─ Kafka 3+ brokers, sharding

        │
        ▼ (1 año)

FASE 3 (5,000+ usuarios)
├─ Auto-scaling automático
├─ PostgreSQL con ElastiCache
├─ GraphQL Gateway (opcional)
└─ Kubernetes con Istio Service Mesh
```

### Métricas de Performance

```
Latencia promedio API: < 100ms
Latencia p99: < 500ms
Uptime: 99.5%+
Throughput: 1000+ req/sec (por servicio)
```

---

## SLIDE 15: VENTAJAS COMPETITIVAS

### ¿Por Qué REQUEST APP?

```
┌────────────────────────────────────┐
│ 🎯 PARA ESTUDIANTES                │
├────────────────────────────────────┤
│ ✅ Búsqueda inteligente            │
│ ✅ Validación de skills            │
│ ✅ Chat integrado                  │
│ ✅ Sistema de reputación           │
│ ✅ Disponible en 3 plataformas     │
│ ✅ Notificaciones en tiempo real   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🏛️ PARA LA UNIVERSIDAD             │
├────────────────────────────────────┤
│ ✅ Panel de admin (Desktop)        │
│ ✅ Estadísticas agregadas          │
│ ✅ Moderación integrada            │
│ ✅ Auditoría completa              │
│ ✅ Seguridad multi-layer           │
│ ✅ Cumplimiento de regulaciones    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 👨‍💻 PARA EL EQUIPO TÉCNICO         │
├────────────────────────────────────┤
│ ✅ Microservicios (SRP)            │
│ ✅ TypeScript (Type safety)        │
│ ✅ Testeable y mantenible          │
│ ✅ CI/CD automatizado              │
│ ✅ Escalable horizontalmente       │
│ ✅ Fácil onboarding                │
└────────────────────────────────────┘
```

---

## SLIDE 16: ROADMAP 2026

### Mejoras Planeadas

```
Q1 2026 (Enero - Marzo)
├─ ✅ Completar documentación
├─ ⚙️ Kubernetes deployment
├─ ⚙️ Ampliar test coverage
└─ 🎯 Beta con 50 usuarios

Q2 2026 (Abril - Junio)
├─ 📊 Analytics dashboard
├─ 🔍 Full-text search mejorada
├─ 🎮 Gamification (badges, achievements)
└─ 🎯 Piloto oficial

Q3 2026 (Julio - Septiembre)
├─ 🌐 Integración con LinkedIn
├─ 📧 Email digest
├─ 🤖 Recomendaciones IA
└─ 🎯 Lanzamiento universidad

Q4 2026 (Octubre - Diciembre)
├─ 📱 App nativa iOS (Swift)
├─ 📱 App nativa Android (Kotlin)
├─ 🌍 Multi-idioma
└─ 🎯 Expansión otras universidades
```

---

## SLIDE 17: MÉTRICAS DE ÉXITO

### KPIs Clave

```
ADOPCIÓN
├─ Usuarios activos mensuales (MAU)
├─ % de carrera que participa
├─ Posts por usuario/mes
└─ Solicitudes exitosas/mes

ENGAGEMENT
├─ Chat response time
├─ Rating promedio
├─ Tasa de aceptación de solicitudes
└─ Repeat collaborators %

TÉCNICO
├─ Uptime (target: 99.5%)
├─ API latency p95 (target: <500ms)
├─ Error rate (target: <0.1%)
└─ Deployment frequency (target: diario)

NEGOCIO
├─ Costo por usuario activo
├─ Mantenimiento costo
└─ Time-to-value
```

---

## SLIDE 18: CONCLUSIONES

### Resumen Ejecutivo

```
REQUEST APP es una solución MODERNA, ESCALABLE
y SEGURA para conectar la comunidad universitaria

✅ Arquitectura sólida (Microservicios + Event-driven)
✅ Tecnología probada y moderna
✅ Equipo técnico calificado
✅ Plan de crecimiento claro
✅ Roadmap ambicioso pero realista
```

### Próximos Pasos

```
INMEDIATO (Esta semana)
├─ ✅ Documentación completada
├─ ⏳ Review de seguridad
└─ ⏳ Testing en ambiente

CORTO PLAZO (Próximo mes)
├─ Kubernetes setup
├─ Beta testing (50 usuarios)
└─ Feedback recolección

MEDIANO PLAZO (Q2 2026)
├─ Lanzamiento oficial
├─ Marketing campaign
└─ Soporte usuarios
```

### Contacto & Preguntas

```
Jettro (Producto & Tech Lead)
📧 jettro@request-app.com
💬 Disponible para preguntas técnicas
📱 Slack: @jettro
```

---

## SLIDE 19: APÉNDICE - ARQUITECTURA DETALLADA

### Diagrama Completo del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Web (Next)  │  │Mobile (Expo) │  │Desktop (Electron)  │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
└────────────────────┬──────────────────────────────────────┘
                     │ HTTPS
         ┌───────────▼───────────┐
         │    REVERSE PROXY      │
         │  (Nginx API Gateway)  │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    │         Routing & Load          │
    │          Balancing              │
    │                │                │
    ▼                ▼                ▼
┌──────────┐  ┌──────────┐      ┌──────────┐
│  Auth    │  │  Posts   │ ...  │ Chat     │
│ (4004)   │  │ (4002)   │      │ (4010)   │
└──────────┘  └──────────┘      └──────────┘
    │             │                  │
    ▼             ▼                  ▼
  ┌─────────────────────────────────────┐
  │      EVENT STREAMING (Kafka)        │
  │  - posts.created                    │
  │  - requests.status_changed          │
  │  - notifications.sent               │
  │  - ratings.created                  │
  └─────────────────────────────────────┘
    │             │                  │
    ▼             ▼                  ▼
┌──────────┐  ┌──────────┐      ┌──────────┐
│PostgreSQL│  │PostgreSQL│      │PostgreSQL│
│ auth_db  │  │ posts_db │      │notify_db │
└──────────┘  └──────────┘      └──────────┘

┌──────────────────────────────────────┐
│  DISTRIBUTED CACHE                   │
│  Redis (Sessions, Rate Limiting)     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  FILE STORAGE                        │
│  MongoDB GridFS (Images, Documents) │
└──────────────────────────────────────┘
```

---

## SLIDE 20: PREGUNTAS & CONTACTO

### ¿Dudas?

```
Arquitectura       → Diagrama completo arriba
Seguridad          → Multi-layer en SLIDE 11
Escalabilidad      → Timeline en SLIDE 14
Costo              → AWS Cost Calculator + documento separado
Timeline           → Roadmap en SLIDE 16
Integración        → NextAuth, OAuth, SSO support
```

### Documentación Completa

```
📄 Informe Técnico Detallado
   → /docs/INFORME_TECNICO_COMPLETO.md
   
📋 README por Servicio
   → /services/[servicio]/README.md
   
🏗️ Arquitectura y Diagramas
   → /docs/diagramas/
   
💻 Código Fuente
   → GitHub: github.com/jettro12/Request
```

### Contacto

```
📧 Email: info@request-app.com
💬 Slack: jettro
📞 Tel: +XX XXX XXXX
🌐 Website: request-app.example.com
```

---

**REQUEST APP - Presentación Ejecutiva**  
**Versión:** 1.0  
**Fecha:** Enero 2026  

*Esta presentación es de confidencialidad interna para stakeholders autorizados*
