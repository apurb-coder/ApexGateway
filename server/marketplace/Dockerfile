FROM node:18-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev

COPY src ./src

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/index.js"]
