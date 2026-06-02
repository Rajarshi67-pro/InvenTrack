FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y curl tzdata && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Kolkata
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN mkdir -p logs
EXPOSE 5000
ENV NODE_ENV=production
USER node
CMD ["node", "dist/server.js"]
