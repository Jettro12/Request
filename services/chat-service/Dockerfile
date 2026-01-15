FROM node:18-bullseye-slim
WORKDIR /usr/src/app

RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000

COPY package*.json ./
COPY tsconfig.json ./

# Instalamos dependencias
RUN npm install --legacy-peer-deps

COPY . .

# Generamos el build
RUN npm run build

# Limpiamos dependencias de desarrollo para que la imagen sea ligera
RUN npm prune --production

# EXPLICACIÓN: 
# Si el error persiste, es probable que tu punto de entrada sea dist/index.js 
# o que NestJS esté usando dist/src/main.js.
# Ajustamos el CMD para que sea el estándar de NestJS:
EXPOSE 4010
CMD ["node", "dist/index.js"]