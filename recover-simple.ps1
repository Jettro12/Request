# Script simple de recuperación
docker compose -f docker-compose.dev.yml down
docker system prune -f
docker compose -f docker-compose.dev.yml up -d --build
Start-Sleep -Seconds 60
docker compose -f docker-compose.dev.yml ps
