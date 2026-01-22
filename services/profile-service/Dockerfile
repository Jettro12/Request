FROM node:20-bullseye-slim
WORKDIR /usr/src/app

RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000

COPY package*.json ./
# Instalamos TODO primero (incluyendo prisma cli)
RUN npm install --legacy-peer-deps

# Copiamos todo el código de una vez para asegurar que Prisma encuentre el esquema
COPY . .

# Generamos el cliente (Prisma buscará automáticamente en ./prisma/schema.prisma)
RUN npx prisma generate

RUN npm run build
RUN npm prune --production

EXPOSE 4005
CMD ["node", "dist/index.js"]