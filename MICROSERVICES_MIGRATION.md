# Plan de Migración a Microservicios

## Estado Actual

Se han completado los siguientes componentes de la arquitectura de microservicios:

### 1. Servicios Completados ✅

- **notification-service** (Puerto 4001)

  - GET/POST `/notifications`
  - PATCH `/notifications` y `/notifications/:id`
  - Kafka producer/consumer
  - Socket.io para notificaciones en tiempo real

- **posts-service** (Puerto 4002)

  - GET/POST `/posts`
  - GET/DELETE `/posts/:id`
  - Kafka producer para eventos de posts

- **requests-service** (Puerto 4003)
  - GET/POST `/requests`
  - GET/PUT/DELETE `/requests/:id`
  - Integración con notification-service
  - Kafka producer para eventos de requests

### 2. Infraestructura ✅

- **docker-compose.dev.yml** en la raíz con:

  - Postgres (requestdb)
  - Kafka + Zookeeper
  - Todos los microservicios
  - Next.js monolito como BFF/Gateway

- **Dockerfile.dev** para desarrollo

### 3. Proxy en Monolito ✅

- `/api/notifications-proxy/*` → Redirecciona a `notification-service`
- Sistema de proxy helper en `src/lib/proxy.ts`

---

## Próximos Pasos

### Fase 1: Validación y Testeo (Hoy)

1. ✅ Scaffolds creados
2. ✅ Docker compose centralizado
3. ⏳ Probar levantando con `docker compose -f docker-compose.dev.yml up --build`
4. ⏳ Verificar endpoints de cada servicio
5. ⏳ Validar comunicación Kafka

### Fase 2: Migración Completa (Próxima)

1. Reemplazar llamadas a endpoints originales en el monolito:

   - `/api/notifications/*` → Mantener proxy en monolito
   - `/api/posts/*` → Crear proxy hacia posts-service
   - `/api/requests/*` → Crear proxy hacia requests-service

2. Servicios adicionales (optional pero recomendado):

   - `auth-service` - Centralizar autenticación y registro
   - `user-service` - Búsqueda y perfil de usuarios
   - `messages-service` - Mensajería (opcional si está en requests)

3. Separar bases de datos por servicio (eventual consistency via Kafka)

4. Añadir observabilidad:

   - Prometheus + Grafana para métricas
   - ELK/Loki para logging centralizado
   - OpenTelemetry para tracing distribuido

5. Despliegue a Kubernetes (si escalas a producción)

---

## Arquitectura Actual (Diagrama)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│            Next.js Monolito (BFF/Gateway)                    │
│  - Gestiona sesiones (NextAuth)                              │
│  - Proxy HTTP a microservicios                               │
│  - Composición de datos para UI                              │
└──┬──────────┬──────────────┬──────────────────────────────────┘
   │          │              │
   ▼          ▼              ▼
┌──────────────┐ ┌─────────────────┐ ┌──────────────────┐
│Notification  │ │  Posts Service  │ │ Requests Service │
│  Service     │ │      :4002      │ │      :4003       │
│    :4001     │ └─────────────────┘ └──────────────────┘
└──────┬───────┘
       │ Socket.io
       │
   ┌───┴────────────────────┐
   │   Shared Resources      │
   ├────────────────────────┤
   │ Postgres (requestdb)   │
   │ Kafka (Broker)         │
   │ Zookeeper              │
   └────────────────────────┘
```

---

## Cómo Ejecutar Localmente

### Con Docker Compose (Recomendado)

```powershell
cd C:\Users\jettr\Documents\proyectosprogramacion\test\request-app

# Levantar todos los servicios
docker compose -f docker-compose.dev.yml up --build

# Esperar logs: "notification service listening on 4001", etc.
```

### Sin Docker (Manual)

```powershell
# Terminal 1: Kafka (requiere instalación previa)
kafka-server-start.bat config\server.properties

# Terminal 2: Postgres
# (o usa el contenedor de Postgres solo)

# Terminal 3: Notification Service
cd services\notification-service
npm run dev

# Terminal 4: Posts Service
cd services\posts-service
npm run dev

# Terminal 5: Requests Service
cd services\requests-service
npm run dev

# Terminal 6: Monolito Next.js
npm run dev
```

---

## Variables de Entorno

Cada servicio tiene un `.env.example`. Copia a `.env` y ajusta según sea necesario.

Claves importantes:

- `DATABASE_URL` - Postgres connection string
- `KAFKA_BROKER` - Kafka broker (kafka:29092 en dev, kafka:29092 en Docker)
- `PORT` - Puerto del servicio
- `NOTIFICATIONS_SERVICE_URL` - URL del servicio de notificaciones

---

## Testing

### Health Checks

```bash
curl http://localhost:4001/health  # Notification Service
curl http://localhost:4002/health  # Posts Service
curl http://localhost:4003/health  # Requests Service
```

### Test Notification

```bash
curl -X POST http://localhost:4001/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TEST",
    "title": "Test Notification",
    "message": "This is a test",
    "senderId": "system",
    "targetUsers": ["user-123"]
  }'
```

---

## Notas importantes

1. **Base de datos compartida**: Actualmente todos los servicios apuntan a la misma DB. Esto está bien para desarrollo. En producción, cada servicio debería tener su propia DB.

2. **Kafka**: Configurable vía `KAFKA_BROKER`. En Docker, los servicios usan `kafka:29092` (dirección interna). Localmente desde el host, usa `kafka:29092`.

3. **Autenticación**: Actualmente, el monolito maneja NextAuth. Los microservicios confían en los headers/parámetros enviados por el gateway. En producción, implementar mTLS o tokens JWT compartidos.

4. **Consistencia**: Usar Kafka para eventual consistency entre servicios. Evitar transacciones distribuidas.

5. **Escalabilidad**: Si un servicio crece, puede ser escalado independientemente.

---

## Siguientes Pasos Recomendados

1. ⏳ Probar con Docker Compose y validar logs
2. ⏳ Crear proxies para `/api/posts` y `/api/requests` en el monolito
3. ⏳ Crear `auth-service` y `user-service`
4. ⏳ Añadir OpenAPI specs a cada servicio
5. ⏳ Implementar contract testing (Pact)
6. ⏳ Separar bases de datos por servicio
7. ⏳ Agregar observabilidad (Prometheus, Loki, Jaeger)
