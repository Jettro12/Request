Notification Service

This is a minimal scaffold for `notification-service` extracted from the monolith.

## Features

- Express HTTP API: `POST /notifications`, `GET /notifications`, `PATCH /notifications`, `PATCH /notifications/:id`
- Kafka producer + consumer to publish/consume notification events
- Socket.io to push real-time notifications to clients (users join room with their userId)
- Uses Prisma to access PostgreSQL database
- Docker Compose for local development with Kafka + Postgres

## Quick Start (Docker Compose)

```powershell
cd services\notification-service

# Copy environment file
copy .env.example .env

# Start with docker compose
docker compose -f .\docker-compose.dev.yml up --build
```

This will start:

- PostgreSQL on `localhost:5432`
- Kafka on `kafka:29092`
- Notification Service on `localhost:4001`

## Quick Start (Local Development)

```powershell
cd services\notification-service

# Copy environment
copy .env.example .env

# Install dependencies
npm ci

# Install Prisma
npm install -D @prisma/cli

# Run migrations (if needed)
npx prisma migrate dev --name init

# Start in dev mode
npm run dev
```

## API Endpoints

### Create notification

```
POST /notifications
Content-Type: application/json

{
  "type": "NEW_MESSAGE",
  "title": "New Message",
  "message": "You have a new message",
  "relatedId": "msg-123",
  "senderId": "user-sender",
  "targetUsers": ["user-id-1", "user-id-2"]
}
```

### Get user notifications

```
GET /notifications?userId=user-id-1&limit=50&unreadOnly=false
```

### Mark all as read

```
PATCH /notifications
Content-Type: application/json

{
  "userId": "user-id-1"
}
```

### Mark single as read

```
PATCH /notifications/notif-id
```

## Environment Variables

- `PORT` - Service port (default: 4001)
- `DATABASE_URL` - PostgreSQL connection string
- `KAFKA_BROKER` - Kafka broker URL (default: kafka:29092)
- `NOTIFICATION_TOPIC` - Kafka topic (default: notifications)
- `NODE_ENV` - Environment (development/production)

## Docker

Build image:

```powershell
docker build -t notification-service:dev .
```

## Notes

- Prisma schema is defined in `prisma/schema.prisma` with a minimal `Notification` and lightweight `User` model.
- During migration from monolith, either:
  1. Share the same PostgreSQL database and use the same Prisma schema
  2. Create separate databases per service and sync via Kafka events
- Socket.io clients should join a room with their userId to receive notifications in real-time
