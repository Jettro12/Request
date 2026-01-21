# services/files-service/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias para compilación si es necesario
RUN apk add --no-cache python3 make g++

# Copiar package.json e instalar
COPY package*.json ./
RUN npm install --only=production

# Copiar código fuente
COPY . .

# Cambiar a usuario no-root (node usuario existe en esta imagen)
USER node

# Exponer puerto (usa el que tu app realmente usa)
EXPOSE 4011

# Comando de inicio
CMD ["node", "src/index.js"]