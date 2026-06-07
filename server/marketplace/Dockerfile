FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev

COPY src ./src

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/index.js"]
