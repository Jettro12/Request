FROM node:20-bullseye-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4007
CMD ["npm", "run", "dev"]

