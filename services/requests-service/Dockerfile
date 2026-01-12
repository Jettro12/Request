FROM node:18-bullseye-slim
WORKDIR /usr/src/app

# Configurar npm para mejor manejo de red
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000

# Copiar archivos de configuración y dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias con retry automático
RUN npm install --legacy-peer-deps || npm install --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar esquema de Prisma antes de generar el cliente
COPY prisma ./prisma

# Generar cliente de Prisma
RUN npx prisma generate
 
# Copiar el resto del código
COPY . .

RUN npm run build
EXPOSE 4003
CMD ["npm", "start"]
