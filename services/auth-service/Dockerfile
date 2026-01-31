FROM node:20-bullseye-slim
WORKDIR /usr/src/app

# Optimizaciones de red
RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000

COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps
RUN npm install jsonwebtoken
RUN npm install -D @types/jsonwebtoken

# Prisma: Generar cliente ANTES del build
COPY prisma ./prisma
RUN npx prisma generate

# Copiar código y compilar
COPY . .
RUN npm run build

# Limpiar para producción
RUN npm prune --production

# EXPOSE: Ajustar según el servicio (4004, 4007, etc.)
EXPOSE 4004

# COMANDO FINAL: Ejecutamos el JS directamente
# Esto evita que corra "npx prisma db push" en producción
CMD ["node", "dist/index.js"]