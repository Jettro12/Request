# 🚀 Request App - Red Universitaria de Colaboración

**Una plataforma moderna para conectar estudiantes, compartir proyectos, colaboraciones y oportunidades académicas.**

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Microservicios](#microservicios)
- [Ejecución](#ejecución)
- [Deployment](#deployment)
- [Documentación Adicional](#documentación-adicional)

---

## 📱 Descripción General

**Request App** es una plataforma completa para la comunidad universitaria que permite:

- ✅ **Colaboraciones**: Conectar con otros estudiantes para proyectos académicos
- ✅ **Solicitudes**: Crear y responder a solicitudes de tutoría, mentorías y ayuda
- ✅ **Posts**: Compartir contenido, experiencias y oportunidades
- ✅ **Chat**: Comunicación en tiempo real entre usuarios
- ✅ **Perfiles**: Gestión completa de perfiles con calificaciones y reviews
- ✅ **Notificaciones**: Sistema de notificaciones en tiempo real
- ✅ **Archivos**: Almacenamiento y gestión de archivos multimedia
- ✅ **Valoraciones**: Sistema de ratings y comentarios

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14.2.35** - Framework React fullstack
- **React 18.3** - Librería UI
- **Tailwind CSS 3.4** - Estilos utility-first
- **NextAuth.js 4.24** - Autenticación y sesiones
- **Axios** - Cliente HTTP
- **Framer Motion** - Animaciones
- **TypeScript 5.3** - Type-safe development

### Backend
- **Node.js 20+** - Runtime JavaScript
- **Express.js 4.22** - Framework HTTP
- **TypeScript 5.5+** - Type-safe backend
- **Prisma 5.20+** - ORM moderno

### Bases de Datos
- **PostgreSQL 11+** - Base de datos principal (relacional)
- **MongoDB 6+** - NoSQL para files-service

### Event Streaming & Messaging
- **Apache Kafka 7.5** - Event streaming entre servicios
- **RabbitMQ 3-management** - Message broker (backup/alternativa)

### Infraestructura
- **Docker & Docker Compose** - Containerización
- **Nginx** - Reverse proxy y API Gateway
- **AWS (Terraform)** - Infrastructure as Code
- **GitHub Actions** - CI/CD automation

### Monorepo & Build Tools
- **Nx 22.3.3** - Monorepo management
- **Turbo** - Build optimization
- **ESLint 9** - Linting
- **Prettier 3.6** - Code formatting

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                       Clientes                               │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Frontend   │  Mobile App  │  Desktop Admin App      │ │
│  │ (Next.js)    │  (React Native) │ (Electron)           │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Nginx (API Gateway)                      │
│              ↓ Reverse Proxy + Load Balancer ↓            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Microservicios (11 servicios)            │
├─────────────┬────────┬────────┬──────┬──────┬────────┬──────┤
│ Auth        │ Users  │ Posts  │Requests│Files│Chat   │Others│
│ Service     │Service │Service │Service │Svc  │Service│      │
│ (4004)      │(4007)  │(4002)  │(4003)  │4011 │(4010) │      │
└─────────────┴────────┴────────┴──────┴──────┴────────┴──────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│           Event Streaming (Apache Kafka)                     │
│  Topics: posts, requests, users, notifications, etc         │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│            Databases & Storage                               │
├──────────────┬──────────────┬────────────┬──────────────────┤
│ PostgreSQL   │  PostgreSQL  │ MongoDB    │ File Storage     │
│ (Auth DB)    │ (Main DB)    │ (Files DB) │ (S3/Local)       │
└──────────────┴──────────────┴────────────┴──────────────────┘
```

---

## 📁 Estructura del Proyecto

```
request-app/
├── frontend/                       # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                    # Pages (App Router)
│   │   ├── components/             # React components
│   │   ├── lib/                    # Utilities & helpers
│   │   ├── hooks/                  # Custom React hooks
│   │   └── middleware.ts           # NextAuth middleware
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── package.json
│
├── services/                        # 11 Microservicios
│   ├── auth-service/               # Autenticación & JWT (4004)
│   ├── users-service/              # Gestión de usuarios (4007)
│   ├── posts-service/              # Posts y contenido (4002)
│   ├── requests-service/           # Solicitudes (4003)
│   ├── profile-service/            # Perfiles de usuario (4005)
│   ├── notification-service/       # Notificaciones (4001)
│   ├── messages-service/           # Mensajería (4008)
│   ├── conversations-service/      # Conversaciones (4009)
│   ├── chat-service/               # Chat WebSocket (4010)
│   ├── files-service/              # Almacenamiento files (4011)
│   ├── ratings-service/            # Valoraciones (4006)
│   └── shared/                     # Código compartido
│
├── mobile-app/                     # React Native + Expo
│   ├── App.js
│   ├── app.json
│   └── assets/
│
├── desktop-app/                    # Electron Admin
│   ├── main.js
│   ├── index.html
│   └── forge.config.js
│
├── infra/                          # Infrastructure & Terraform
│   ├── main.tf                     # AWS resources
│   ├── docker-compose.prod.yml
│   └── terraform.tfvars
│
├── nginx/                          # Reverse Proxy config
│   └── nginx.conf
│
├── prisma/                         # Schema compartido
│   └── schema.prisma
│
├── docs/                           # Documentación
├── scripts/                        # Utilidades
├── package.json                    # Root dependencies
├── nx.json                         # Nx configuration
└── docker-compose.yaml             # Local development
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js 20+**
- **npm 9+** o **yarn 3+**
- **Docker & Docker Compose** (para desarrollo local con servicios)
- **PostgreSQL 11+** (si se ejecuta localmente)
- **MongoDB 6+** (para files-service)

### Pasos de Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/request-app.git
cd request-app
```

2. **Instalar dependencias del root**
```bash
npm install
```

3. **Instalar dependencias de servicios**
```bash
# Instala dependencias en todos los servicios
npm run install:all
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

5. **Iniciar stack de desarrollo (Docker)**
```bash
docker-compose up -d
```

6. **Ejecutar migraciones de Prisma**
```bash
npm run prisma:migrate
```

7. **Iniciar servicios**
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Microservicios (requiere Node.js)
cd services/auth-service && npm run dev
# Repetir para otros servicios en otras terminales
```

---

## 🔐 Variables de Entorno

### `.env.local` (Frontend)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/api
NEXTAUTH_SECRET=tu-secret-seguro-aleatorio
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=tu-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### `.env` (Root - Servicios)
```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/request_app
MONGODB_URI=mongodb://admin:password@localhost:27017/files_db?authSource=admin

# Kafka
KAFKA_BROKER=localhost:9092

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu-secret-jwt-seguro

# Microservicios URLs
AUTH_SERVICE_URL=http://auth-service:4004
USERS_SERVICE_URL=http://users-service:4007
POSTS_SERVICE_URL=http://posts-service:4002
REQUESTS_SERVICE_URL=http://requests-service:4003
NOTIFICATIONS_SERVICE_URL=http://notification-service:4001
FILES_SERVICE_URL=http://files-service:4011
CHAT_SERVICE_URL=http://chat-service:4010
```

---

## 🔧 Microservicios

| Servicio | Puerto | BD | Descripción |
|----------|--------|----|----|
| **Auth Service** | 4004 | PostgreSQL | Autenticación, JWT, login/register |
| **Users Service** | 4007 | PostgreSQL | Gestión de usuarios, perfiles |
| **Posts Service** | 4002 | PostgreSQL | Crear, editar, eliminar posts |
| **Requests Service** | 4003 | PostgreSQL | Solicitudes entre usuarios |
| **Profile Service** | 4005 | PostgreSQL | Información extendida de perfiles |
| **Notification Service** | 4001 | PostgreSQL | Notificaciones en tiempo real |
| **Messages Service** | 4008 | PostgreSQL | Mensajería privada |
| **Conversations Service** | 4009 | PostgreSQL | Gestión de conversaciones |
| **Chat Service** | 4010 | En memoria | WebSocket chat en tiempo real |
| **Files Service** | 4011 | MongoDB | Upload/download archivos |
| **Ratings Service** | 4006 | PostgreSQL | Valoraciones y reviews |

Cada servicio tiene su propio README detallado. Ver carpeta `services/*/README.md`

---

## ▶️ Ejecución

### Desarrollo Local (con Docker)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Desarrollo Local (Manual - sin Docker)

**Terminal 1 - Frontend**
```bash
cd frontend
npm install
npm run dev
# Accesible en http://localhost:3000
```

**Terminal 2 - Auth Service**
```bash
cd services/auth-service
npm install
npm run dev
```

**Terminal 3 - Otros servicios** (repetir para cada uno)
```bash
cd services/posts-service
npm install
npm run dev
```

### Build para Producción

**Frontend**
```bash
cd frontend
npm run build
npm start
```

**Servicios**
```bash
cd services/auth-service
npm run build
npm start
```

---

## 🚀 Deployment

### AWS + Terraform

```bash
cd infra

# Inicializar Terraform
terraform init

# Ver cambios planeados
terraform plan

# Aplicar configuración
terraform apply

# Destruir recursos (⚠️ cuidado)
terraform destroy
```

### Docker Registry (GHCR)

```bash
# Login en GitHub Container Registry
docker login ghcr.io -u TU_USUARIO -p TU_TOKEN

# Build imagen frontend
docker build -t ghcr.io/tu-usuario/frontend:latest ./frontend

# Push a registro
docker push ghcr.io/tu-usuario/frontend:latest
```

### CI/CD con GitHub Actions

El workflow `deploy-nx.yml` automáticamente:
- ✅ Construye imágenes Docker
- ✅ Hace push a GHCR
- ✅ Despliega en AWS
- ✅ Ejecuta tests

Solo haz `git push` y verifica en **Actions** tab.

---

## 📚 Documentación Adicional

- [Frontend Setup](./frontend/README.md)
- [Auth Service](./services/auth-service/README.md)
- [Users Service](./services/users-service/README.md)
- [Posts Service](./services/posts-service/README.md)
- [Requests Service](./services/requests-service/README.md)
- [Profile Service](./services/profile-service/README.md)
- [Notification Service](./services/notification-service/README.md)
- [Messages Service](./services/messages-service/README.md)
- [Chat Service](./services/chat-service/README.md)
- [Files Service](./services/files-service/README.md)
- [Ratings Service](./services/ratings-service/README.md)
- [Mobile App](./mobile-app/README.md)
- [Desktop Admin](./desktop-app/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Kafka & Event Topics](./docs/KAFKA.md)

---

## 🤝 Contribución

1. Crea una rama: `git checkout -b feature/nueva-feature`
2. Haz commits: `git commit -am 'Agregar nueva feature'`
3. Push: `git push origin feature/nueva-feature`
4. Abre Pull Request

---

## 📄 Licencia

MIT © 2024 Request App

---

## 👤 Autor

**Jettro** - Desarrollador Full Stack

---

## 📞 Soporte

- 📧 Email: jettro@example.com
- 💬 Discord/Slack: [Link a workspace]
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/request-app/issues)

---

**Última actualización:** Enero 2026
