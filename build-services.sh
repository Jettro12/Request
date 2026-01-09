#!/bin/bash
# Script para construir servicios en grupos para evitar timeouts

echo "=== Construyendo servicios en grupos ==="

# Grupo 1: Infraestructura y servicios base
echo -e "\n[1/5] Construyendo infraestructura y servicios base..."
docker-compose build --no-cache zookeeper kafka postgres redis || exit 1

# Grupo 2: Servicios de autenticación y usuarios
echo -e "\n[2/5] Construyendo servicios de autenticación..."
docker-compose build --no-cache auth-service users-service profile-service || exit 1

# Grupo 3: Servicios de contenido
echo -e "\n[3/5] Construyendo servicios de contenido..."
docker-compose build --no-cache posts-service requests-service ratings-service || exit 1

# Grupo 4: Servicios de comunicación
echo -e "\n[4/5] Construyendo servicios de comunicación..."
docker-compose build --no-cache notification-service messages-service conversations-service chat-service || exit 1

# Grupo 5: Frontend (último, ya que depende de otros servicios)
echo -e "\n[5/5] Construyendo frontend..."
docker-compose build --no-cache frontend || exit 1

echo -e "\n=== ¡Construcción completada exitosamente! ==="
echo "Puedes iniciar los servicios con: docker-compose up"






