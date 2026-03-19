# ---- Build stage ----
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ src/
RUN npx tsc

# ---- Runtime stage ----
FROM node:20-slim
WORKDIR /app

# node-pty requires native build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/ dist/

EXPOSE 3334

CMD ["node", "dist/index.js"]
