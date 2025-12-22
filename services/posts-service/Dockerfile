FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* npm-shrinkwrap.json* ./

RUN npm ci || npm install

COPY . .

# Skip tsc during image build for development; runtime will use ts-node-dev.

EXPOSE 4002

CMD ["npm", "start"]
