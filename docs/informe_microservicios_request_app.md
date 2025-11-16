# Informe técnico: Propuesta de Microservicios para Request App

Fecha: 13 de noviembre de 2025
Autor: Equipo técnico (borrador generado)

## Resumen ejecutivo

Este documento presenta un análisis del proyecto "Request App" (repositorio: Request) y una propuesta técnica para evolucionar su arquitectura monolítica actual (Next.js + API routes + Prisma/PostgreSQL) hacia una arquitectura basada en microservicios. Se incluyen: diagnóstico actual, criterios para la decisión, una propuesta de descomposición por servicios, estrategias de datos, comunicación entre servicios, plan de migración incremental, requisitos de infraestructura, pipeline de CI/CD, seguridad, observabilidad y un plan de trabajo con hitos.

Objetivo: entregar un documento mínimo viable (borrador) con suficiente detalle técnico para servir como base de implementación y para estimación de esfuerzo.

---

## 1. Alcance del informe

- Analizar la arquitectura actual del proyecto y su disposición a migrar a microservicios.
- Proponer una descomposición por bounded contexts y servicios.
- Definir patrones de comunicación, estrategia de datos y manejo de la autenticación.
- Proponer un plan de migración incremental y checklist técnico para extraer el primer servicio.
- Incluir requisitos de infra, observabilidad y pruebas.

Notas: Este documento es un borrador técnico; tras tu feedback puedo ajustar el detalle, añadir diagramas (UML/Arquitectura) y generar una versión PDF elegante.

---

## 2. Descripción del proyecto y diagnóstico actual

Resumen funcional del sistema:

- Frontend y backend integrados en Next.js (v16). El frontend usa React 19.
- API internas definidas en `src/app/api/**` con rutas para: `auth`, `users`, `register`, `requests` (y subroutes), `messages`, `notifications`, `posts`, `profile`, `ratings`, `conversations`, etc.
- Persistencia: Prisma como ORM y PostgreSQL (dato en `prisma/schema.prisma`). Hay modelos para User, Post, Request, Message, Notification, Review, Account, Session.
- `src/lib/db.ts` exporta un único `PrismaClient` central.

Evidencia de arquitectura monolítica:

- Todas las APIs están dentro del mismo repositorio Next.js.
- Un único cliente de BD (`PrismaClient`) usado por las API routes.
- Deployment presumiblemente como una sola aplicación Next.js.

Implicaciones:

- Bajo coste inicial y desarrollo más rápido para MVP.
- Acoplamiento entre UI, lógica de negocio y persistencia.
- Limitaciones para escalar independientemente partes con distinto perfil de carga (ej. chat vs posts).

---

## 3. ¿Por qué considerar microservicios? Beneficios vs Costes

Beneficios esperados:

- Despliegue independiente y ciclos de release separados.
- Escalado por servicio (por ejemplo, escalar chat sin tocar la API de posts).
- Encapsulamiento de dominios: equipos independientes pueden trabajar sin tocar monolito.
- Posibilidad de elegir tecnologías por servicio (Node.js para la mayoría, Go/Elixir para alta concurrencia, etc.).

Costes y complejidad añadida:

- Infraestructura: orquestador (Kubernetes / ECS), API Gateway, broker de mensajes.
- Operaciones: monitorización, trazas distribuidas, recuperación y despliegues canary/blue-green.
- Desarrollo: gestión de contratos, versionado de APIs, testing distribuido.
- Datos: transacciones distribuidas y patrones de consistencia.

Recomendación práctica:

- Si el proyecto es un MVP mantenido por una o pocas personas, no migrar todo inmediatamente.
- Migración incremental: extraer primero servicios que más se benefician (Requests, Messages/Chat, Notifications).

---

## 4. Propuesta de descomposición por microservicios

Lista sugerida de servicios (priorizados):

1. Auth Service
2. Requests Service (core)
3. Messages / Chat Service
4. Notifications Service
5. Users Service
6. Posts Service
7. Ratings / Reviews Service
8. Gateway (API Gateway) + Frontend Next.js (solo UI)

Descripción de responsabilidades breves:

- Auth Service: gestión de login, registro (si no se delega a un proveedor), emisión/validación de tokens JWT, gestión de sesiones.
- Requests Service: CRUD de solicitudes entre usuarios, lógica de negocio de aceptación/rechazo, acuerdos y estados (PENDING/ACCEPTED/REJECTED/COMPLETED).
- Messages/Chat Service: persistencia y flujo en tiempo real de mensajes; puede usar WebSocket y Redis pub/sub.
- Notifications Service: creación y entrega de notificaciones (consume eventos desde otros servicios).
- Users Service: información de perfil, búsqueda, edición, cálculo de rating agregado.
- Posts Service: CRUD de posts y feeds.
- Ratings Service: reviews y agregación de ratings de usuarios/proyectos.
- Gateway: ruteo, throttling, autenticación inicial y centralizada.

Comentarios sobre límites: Los modelos en `prisma/schema.prisma` (User, Request, Message, Notification) sugieren límites naturales: Requests ↔ Messages ↔ Notifications forman un subdominio, pero para escalabilidad conviene separar Messages (alto I/O) y Notifications (event-driven).

---

## 5. Comunicación entre servicios

Patrones recomendados:

- Frontend -> Gateway: REST/HTTP(S) / GraphQL (gateway opcional)
- Síncrono entre servicios: REST o gRPC (si se busca alto rendimiento y contratos estrictos)
- Asíncrono (event-driven): Message Broker (RabbitMQ, Kafka, NATS). Recomendado para notificaciones, procesos largos y decoupling.

Eventos propuestos (ejemplos):

- RequestCreated { requestId, fromUserId, toUserId, ... }
- RequestStatusChanged { requestId, status }
- MessageSent { messageId, requestId, senderId, receiverId }
- RequestCompleted { requestId, ratings }

Consumo de eventos:

- Notifications Service subscribe a RequestCreated y MessageSent para generar notificaciones.
- Ratings Service subscribe a RequestCompleted para recalcular agregados.

Transacciones distribuidas:

- Evitar ACID entre servicios; usar Sagas para coordinar pasos distribuidos.
- Mantener idempotencia en handlers de eventos.

---

## 6. Estrategia de datos

Opciones:

- Database-per-service (recomendado a largo plazo): cada servicio controla su propio almacenamiento y modelo.
- Shared database (transicional): todos los servicios acceden a la misma BD (misma instancia) mientras se realiza la separación.

Recomendación de transición:

1. Durante la extracción del primer servicio, permitir acceso a la tabla específica en la DB compartida o crear una réplica para lecturas.
2. Migrar escrituras al nuevo servicio y mantener sincronización (outbox pattern / CDC) para el resto del sistema.
3. Eventualmente migrar a DB por servicio y sincronizar con eventos.

Ejemplos técnicos:

- Outbox pattern: el Requests Service escribe en su tabla `requests` y en una tabla `outbox_events`, un proceso lee la outbox y publica al broker.
- Change Data Capture (CDC): usar Debezium + Kafka para propagar cambios desde la DB compartida.

---

## 7. Autenticación y autorización

Opciones:

- Centralizar en Auth Service: emite JWT (con claims), services validan JWT y obtienen userId.
- Delegar a proveedor: Auth0 / Clerk / Firebase Auth para reducir carga de mantenimiento.

Recomendación:

- Implementar Auth Service minimal que emita JWT con expiración corta y refresh tokens, o migrar a proveedor si se requiere rapidez.
- Para endpoints críticos, usar Authorization middleware que verifique scopes/roles.

Cookies vs JWT:

- Si frontend y servicios están en dominios separados, JWT en Authorization header es práctico.
- Si prefieres cookies, usar SameSite y HTTPS. Para microservicios es más sencillo usar JWT.

---

## 8. Infraestructura y deployment

Elementos mínimos recomendados:

- Contenerización: Docker images por servicio.
- Orquestador: Kubernetes (k8s) o Cloud Run / ECS si quieres menos ops.
- API Gateway: NGINX/Kong/Traefik o AWS API Gateway.
- Broker de mensajes: RabbitMQ / Kafka / NATS según necesidad (Kafka si necesitas persistencia de eventos y alto throughput).
- DB: inicialmente PostgreSQL (puede permanecer) con migraciones controladas (Prisma Migrate).
- Almacenamiento estático: S3 para assets si fuera necesario.

Infra como código:

- Usar Terraform o Pulumi para provisionar infra.

---

## 9. Observabilidad y operación

- Logs estructurados (JSON), enviados a un collector (ELK/EFK o Loki).
- Tracing distribuido: OpenTelemetry → Jaeger.
- Métricas: Prometheus + Grafana.
- Health checks y readiness probes en k8s.
- Alerts: SLO/SLI básicos y alertas en Prometheus Alertmanager.

---

## 10. CI/CD y pipelines

- Pipeline por servicio: tests unitarios → build → container image → security scan → push a registry → deploy a staging → integration tests → deploy a production.
- Herramientas: GitHub Actions (ejemplo), GitLab CI, or CircleCI.
- Canary / Blue-Green deploys para cambios críticos.

---

## 11. Seguridad

- Secret management: use HashiCorp Vault / AWS Secrets Manager.
- TLS everywhere.
- Rate limiting y WAF en gateway.
- Escaneo de imágenes (Trivy) y dependabot para dependencias.
- Hardening de base de datos (migrations, least privilege user accounts).

---

## 12. Plan de migración incremental (paso a paso)

Fase 0 — Preparación

- Mapear todos los endpoints actuales y contratos (OpenAPI).
- Instrumentar logging y tracing en el monolito.
- Introducir un API Gateway para empezar a centralizar autenticación y ruteo (puede ser un proxy simple).

Fase 1 — Extraer Requests Service (primer servicio)

- Diseñar API pública para requests (OpenAPI). Definir DTOs y contratos.
- Crear nuevo repo y servicio con Express/Fastify + Prisma (solo modelos necesarios) y Dockerfile.
- Determinar estrategia DB: opción 1 (transición) usar la misma BD con un esquema propio; opción 2 (preferida a largo plazo) crear DB independiente.
- Implementar auth middleware para JWT.
- Implementar Outbox para emitir eventos RequestCreated.
- Cambiar frontend (Next.js) para llamar al nuevo endpoint (feature flag / env variable).
- Deploy a staging y monitorizar.

Fase 2 — Notifications (event-driven)

- Implementar Notifications Service que consuma RequestCreated y MessageSent.
- Cambiar monolito para publicar eventos si todavía publica, o implementar publisher desde Requests Service.

Fase 3 — Messages/Chat

- Extraer mensajería; evaluar real-time (WebSocket) y persistencia.
- Considerar usar Redis + socket server y pub/sub para scaling.

Fase 4 — Users, Posts, Ratings

- Extraer servicios según prioridad y uso.

Fase final — separación completa de DBs

- Migrar datos que correspondan a cada servicio.
- Implementar sagas para procesos distribuidos que requieren consistencia.

---

## 13. Checklist técnico para extraer el primer servicio (Requests)

- [ ] Definir OpenAPI y contratos.
- [ ] Crear repo y scaffold (Express/Fastify + Prisma).
- [ ] Dockerfile y .dockerignore.
- [ ] Middleware de auth (JWT) y tests básicos.
- [ ] Implementar endpoints: create, list, get, update status, agreement endpoints.
- [ ] Implementar outbox o publisher a broker.
- [ ] Tests unitarios e integrados.
- [ ] CI pipeline (build/test/image publish) y deploy to staging.
- [ ] Actualizar Next.js para apuntar a la nueva API y test end-to-end.

---

## 14. Ejemplo de scaffold (resumen)

- Stack recomendado: Node 20, Fastify o Express, Prisma, PostgreSQL.
- Dockerfile básico:

```
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .
CMD ["node", "dist/index.js"]
```

- Uso de Prisma: incluir sólo modelos necesarios (Request y relaciones básicas) en `schema.prisma` del servicio.

---

## 15. Estimación de esfuerzo (baja fidelidad)

Extraer Requests Service (equipo 1-2 desarrolladores): 2-3 semanas (incluye tests, CI, deploy a staging y cambios frontend en feature flag).
Extraer Notifications: 1-2 semanas.
Extraer Messages/Chat (si requiere real-time): 3-6 semanas (depende si se usa una solución externa o se desarrolla en casa).
Completa separación y estabilización de infra: 2-3 meses (varía con tamaño del equipo y requisitos).

---

## 16. Riesgos y mitigaciones

- Complejidad operativa: mitigar mediante fases y uso de plataformas managed (Cloud Run, AWS SNS/SQS).
- Consistencia de datos: usar outbox / sagas y diseño idempotente.
- Latencia de red: definir SLAs y optimizar endpoints críticos.

---

## 17. Recomendaciones finales

1. No migrar todo a la vez. Empezar extrayendo 1 servicio (Requests) y mejorar infra de observabilidad.
2. Automatizar CI/CD desde el primer servicio.
3. Considerar proveedores gestionados para auth y realtime si no hay equipo de infra.
4. Documentar APIs con OpenAPI y versionarlas.

---

## 18. Siguientes pasos propuestos (acciones concretas)

- Confirmar prioridad de primer servicio a extraer (requests o messages).
- Si confirmas, crear scaffold del servicio en un directorio nuevo o repo separado con: Dockerfile, package.json, Prisma schema, endpoints, tests y pipeline de GitHub Actions.
- Entregar el PoC desplegado en staging y migrar frontend al nuevo endpoint bajo feature flag.

---

## Anexos

### A. Fragmentos de archivos clave (extraídos del repo)

- `package.json` contiene Next.js 16, Prisma y NextAuth.
- `prisma/schema.prisma` contiene modelos User, Post, Request, Message, Notification, Review.
- `src/lib/db.ts` exporta un único `PrismaClient`.

### B. Endpoints identificados en `src/app/api` (resumen)

- `/api/auth/...`
- `/api/register`
- `/api/users` and `/api/users/[id]`
- `/api/requests` and subroutes (`[id]`, `agreement`, `complete`, `chat/[userId]`)
- `/api/messages`
- `/api/notifications` and `/api/notifications/[id]`
- `/api/posts`
- `/api/profile`
- `/api/ratings`
- `/api/conversations`

(Ver listado completo en el repo para documentar cada endpoint y cuerpo de request/response.)

---

## Contacto / nota final

Este borrador aborda la propuesta técnica y el plan para transformar la aplicación hacia microservicios. Puedo:

- Ajustar el contenido para alcanzar exactamente 15 páginas impresas/formato PDF con diagramas y formato profesional.
- Generar scaffold del primer servicio y pipelines CI/CD.
- Preparar un cronograma detallado y estimaciones por tareas.

Dime qué prefieres: 1) generar versión PDF con diagramas y 15 páginas impresas, 2) crear scaffold del primer servicio (Requests), o 3) personalizar el informe con más detalles técnicos (diagramas, OpenAPI, etc.).
