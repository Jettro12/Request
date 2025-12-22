Requests Service

Microservice for managing collaboration requests extracted from the monolith.

## Features

- Express HTTP API for CRUD operations on requests
- State management (PENDING, ACCEPTED, REJECTED, COMPLETED)
- Message handling within requests
- Rating and review support
- Kafka producer for request lifecycle events
- Notification service integration

## API Endpoints

### List Requests

```
GET /requests?userId=user-123&type=received|sent
```

### Create Request

```
POST /requests
Content-Type: application/json

{
  "fromUserId": "user-123",
  "toUserId": "user-456",
  "message": "Want to collaborate on project?",
  "type": "COLLABORATION"
}
```

### Get Request

```
GET /requests/:id?userId=user-123
```

### Update Request

```
PUT /requests/:id
Content-Type: application/json

{
  "userId": "user-123",
  "status": "ACCEPTED|REJECTED|COMPLETED",
  "rating": 5,
  "review": "Great work!"
}
```

### Delete Request

```
DELETE /requests/:id
Content-Type: application/json

{
  "userId": "user-123"
}
```

## Environment Variables

- `PORT` - Service port (default: 4003)
- `DATABASE_URL` - PostgreSQL connection string
- `KAFKA_BROKER` - Kafka broker URL
- `REQUESTS_TOPIC` - Kafka topic for request events
- `NOTIFICATIONS_SERVICE_URL` - URL to notification service

## Kafka Events

- `request.created` - New request created
- `request.status_changed` - Request status changed (accepted/rejected/completed)
