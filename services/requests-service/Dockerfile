FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* npm-shrinkwrap.json* ./

RUN npm ci || npm install

COPY . .

# Don't run `npm run build` during image build in dev environment.
# We'll run the dev server (`npm run dev`) at container start which uses
# ts-node-dev with --transpile-only to avoid tsc type errors blocking startup.

EXPOSE 4003

CMD ["npm", "start"]
