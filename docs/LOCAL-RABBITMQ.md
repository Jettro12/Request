Local RabbitMQ & Event Bus (Development)

Follow these steps when running the microservices stack locally to ensure RabbitMQ and the event bus work correctly.

1. Install new dependencies added to services

```bash
cd services/users-service && npm install
cd ../auth-service && npm install
cd ../posts-service && npm install
```

2. Recreate RabbitMQ (we set `RABBITMQ_ERLANG_COOKIE` in `docker-compose.yaml`)

```bash
docker compose down
docker compose up --build -d rabbitmq
docker compose logs -f rabbitmq
```

3. Start full stack (after verifying rabbitmq is healthy)

```bash
docker compose up --build
```

4. Logs to watch for event flow

```bash
docker compose logs -f users-service posts-service auth-service
```

Notes

- The TypeScript consumer is `services/users-service/src/events/consumer.ts`.
- There's a JS stub `services/users-service/src/events/consumer.js` that warns and exports `null` to avoid double-processing while developing with `ts-node-dev`. You can safely remove that file to force using only the TS implementation.
- If RabbitMQ fails with permission errors reading `.erlang.cookie`, either fix host volume permissions or rely on the `RABBITMQ_ERLANG_COOKIE` env var set in `docker-compose.yaml`.

If you want, I can search for other compiled `.js` duplicates across `services/*/src` and remove them or convert imports to point to TS sources.
