Posts Service

Microservice for managing posts/publications extracted from the monolith.

## Features

- Express HTTP API for CRUD operations on posts
- Kafka producer to publish post events
- Prisma for database access
- Docker-ready

## API Endpoints

### List Posts

```
GET /posts?careerSpace=...&type=...&page=1&limit=10
```

### Create Post

```
POST /posts
Content-Type: application/json

{
  "title": "Looking for teammate",
  "content": "I need help with my project",
  "type": "REQUESTING",
  "careerSpace": "Ingeniería en Sistemas",
  "skills": ["JavaScript", "React"],
  "authorId": "user-123"
}
```

### Get Post

```
GET /posts/:id
```

### Delete Post

```
DELETE /posts/:id
Content-Type: application/json

{
  "userId": "user-123"
}
```

## Environment Variables

- `PORT` - Service port (default: 4002)
- `DATABASE_URL` - PostgreSQL connection string
- `KAFKA_BROKER` - Kafka broker URL
- `POSTS_TOPIC` - Kafka topic for post events

## Quick Start

```powershell
cd services\posts-service
npm ci
npm run dev
```
