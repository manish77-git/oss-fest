FROM node:20-alpine
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npm run prisma:generate

COPY src ./src/
RUN npm run build

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
