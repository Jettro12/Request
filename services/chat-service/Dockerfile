FROM node:18-bullseye-slim
WORKDIR /usr/src/app

RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install --legacy-peer-deps

# Si tu chat-service NO usa Prisma, puedes omitir las líneas de prisma aquí
# Si SÍ usa Prisma, añade las 2 líneas de COPY prisma y RUN npx prisma generate

COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 4010
CMD ["node", "dist/main.js"]