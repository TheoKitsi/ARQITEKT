# ---- Build stage ----
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ src/
COPY public/ public/
RUN npm run build

# ---- Runtime stage (nginx serves static files) ----
FROM nginx:alpine

COPY --from=builder /app/dist/ /usr/share/nginx/html/

# nginx config is mounted via docker-compose
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
