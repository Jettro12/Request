
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de compilación si es necesario
RUN apk add --no-cache python3 make g++

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar código fuente
COPY src/ src/

# Exponer puerto
EXPOSE 4011

# Usuario no-root
USER node

# Comando de inicio
CMD ["node", "src/index.js"]
 