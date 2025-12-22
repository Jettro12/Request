FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* npm-shrinkwrap.json* ./

RUN npm ci || npm install

COPY . .

# Skip TypeScript build at image build time for development.
# Use `npm run dev` (ts-node-dev --transpile-only) at runtime instead.

EXPOSE 4001

CMD ["npm", "start"]
