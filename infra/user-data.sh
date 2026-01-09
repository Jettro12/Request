#!/bin/bash
set -e

# Actualizar sistema
yum update -y

# Instalar Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

# Instalar Git
yum install -y git

# Clonar repositorio
cd /home/ec2-user
git clone https://github.com/Jettro12/Request.git
cd request-app

# Variables de entorno (ejemplo)
cat <<EOF > .env
NODE_ENV=production
PORT=3000
EOF

# Levantar servicios
/usr/local/bin/docker-compose up -d --build
