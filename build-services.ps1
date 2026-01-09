# Script para construir servicios en grupos para evitar timeouts
Write-Host "=== Construyendo servicios en grupos ===" -ForegroundColor Green

# Grupo 1: Infraestructura y servicios base
Write-Host "`n[1/4] Construyendo infraestructura y servicios base..." -ForegroundColor Yellow
docker-compose build --no-cache zookeeper kafka postgres redis
if ($LASTEXITCODE -ne 0) { Write-Host "Error en grupo 1" -ForegroundColor Red; exit 1 }

# Grupo 2: Servicios de autenticación y usuarios
Write-Host "`n[2/4] Construyendo servicios de autenticación..." -ForegroundColor Yellow
docker-compose build --no-cache auth-service users-service profile-service
if ($LASTEXITCODE -ne 0) { Write-Host "Error en grupo 2" -ForegroundColor Red; exit 1 }

# Grupo 3: Servicios de contenido
Write-Host "`n[3/4] Construyendo servicios de contenido..." -ForegroundColor Yellow
docker-compose build --no-cache posts-service requests-service ratings-service
if ($LASTEXITCODE -ne 0) { Write-Host "Error en grupo 3" -ForegroundColor Red; exit 1 }

# Grupo 4: Servicios de comunicación
Write-Host "`n[4/4] Construyendo servicios de comunicación..." -ForegroundColor Yellow
docker-compose build --no-cache notification-service messages-service conversations-service chat-service
if ($LASTEXITCODE -ne 0) { Write-Host "Error en grupo 4" -ForegroundColor Red; exit 1 }

# Grupo 5: Frontend (último, ya que depende de otros servicios)
Write-Host "`n[5/5] Construyendo frontend..." -ForegroundColor Yellow
docker-compose build --no-cache frontend
if ($LASTEXITCODE -ne 0) { Write-Host "Error en frontend" -ForegroundColor Red; exit 1 }

Write-Host "`n=== ¡Construcción completada exitosamente! ===" -ForegroundColor Green
Write-Host "Puedes iniciar los servicios con: docker-compose up" -ForegroundColor Cyan






