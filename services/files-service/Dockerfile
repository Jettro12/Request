FROM node:18-alpine
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json ./
RUN npm install --only=production

# Copiar código
COPY index.js ./

# Exponer puerto
EXPOSE 4011

# Usuario no-root
USER node

# Comando de inicio
CMD ["node", "index.js"]