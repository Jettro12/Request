FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* npm-shrinkwrap.json* ./

RUN npm ci || npm install

COPY . .

EXPOSE 4005

CMD ["npm", "start"]
