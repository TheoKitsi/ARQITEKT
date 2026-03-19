# ARQITEKT — Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Variables](#environment-variables)
6. [GitHub OAuth Setup](#github-oauth-setup)
7. [LLM Provider Configuration](#llm-provider-configuration)
8. [TLS / HTTPS](#tls--https)
9. [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool       | Version | Required for      |
|------------|---------|-------------------|
| Node.js    | >= 20   | Server + Hub dev  |
| npm        | >= 10   | Package management|
| Docker     | >= 24   | Container deploy  |
| Git        | >= 2.30 | Version control   |
| Flutter    | >= 3.22 | Mobile companion  |

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/TheoKitsi/ARQITEKT.git
cd ARQITEKT
```

### 2. Start the server (Express API on port 3334)

```bash
cd _ARQITEKT/server
npm install
npm run dev
```

### 3. Start the Hub (Vite dev server on port 5173)

```bash
cd _ARQITEKT/hub
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The Vite dev server proxies `/api` and `/ws` requests to the server.

### 4. (Optional) Start the mobile companion

```bash
cd mobile
flutter pub get
flutter run
```

---

## Docker Deployment

### Quick start

```bash
# Copy and configure environment
cp .env.compose.example .env
# Edit .env — at minimum set JWT_SECRET

docker compose up -d --build
```

The Hub is served at `http://localhost:80` (or the port defined by `HUB_PORT`).

### Architecture

```
Browser ──> Nginx (hub:80) ──> static React build
                     └──────── /api, /ws ──> Express server:3334
```

- **hub** container: Nginx serving the pre-built React frontend + proxying API calls
- **server** container: Express.js API with WebSocket support
- Both containers share a `bridge` network (`arqitekt`)
- Workspace is volume-mounted at `/workspace` so the server can access project files

### Health checks

Both containers have built-in health checks:

```bash
docker compose ps   # Shows health status
docker inspect --format='{{.State.Health.Status}}' arqitekt-server-1
```

### Update

```bash
git pull
docker compose up -d --build
```

---

## Cloud Deployment

### DigitalOcean (Droplet)

```bash
# 1. Create a Droplet (Ubuntu 24.04, 2GB+ RAM)
# 2. SSH in and install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone the repo
git clone https://github.com/TheoKitsi/ARQITEKT.git
cd ARQITEKT

# 4. Configure
cp .env.compose.example .env
nano .env  # Set JWT_SECRET, LLM keys, OAuth credentials

# 5. Launch
docker compose up -d --build

# 6. (Optional) Set up a domain + Certbot for HTTPS
```

### Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and link
railway login
railway init

# 3. Deploy
railway up
```

Set environment variables in the Railway dashboard (see Environment Variables section below).

### Fly.io

```bash
# 1. Install flyctl
curl -L https://fly.io/install.sh | sh

# 2. Launch
cd _ARQITEKT/server
fly launch

# 3. Set secrets
fly secrets set JWT_SECRET=your-secret ARQITEKT_LLM_KEY=your-key
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3334` | Server listen port |
| `NODE_ENV` | `development` | `production` for Docker builds |
| `HUB_PORT` | `80` | Exposed port for the Hub container |
| `BODY_LIMIT` | `1mb` | Max POST body size |
| `LLM_TIMEOUT` | `60000` | LLM request timeout (ms) |
| `MAX_RUNNING_APPS` | `5` | Max concurrent child processes |
| `ARQITEKT_LLM_KEY` | — | Primary LLM API key |
| `GITHUB_TOKEN` | — | GitHub token for Models + OAuth fallback |
| `AUTH_ENABLED` | `false` | Enable authentication |
| `JWT_SECRET` | `change-me-in-production` | **Must change in production** |
| `JWT_EXPIRES_IN` | `7d` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `GITHUB_CLIENT_ID` | — | OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | — | OAuth app client secret |
| `GITHUB_CALLBACK_URL` | `http://localhost:3334/api/auth/github/callback` | OAuth callback |
| `CORS_ORIGINS` | `http://localhost,http://localhost:5173` | Allowed CORS origins |

---

## GitHub OAuth Setup

1. Go to **GitHub Settings > Developer Settings > OAuth Apps > New OAuth App**
2. Set:
   - **Homepage URL**: `http://your-domain`
   - **Authorization callback URL**: `http://your-domain/api/auth/github/callback`
3. Copy Client ID and Client Secret into `.env`:

```env
AUTH_ENABLED=true
GITHUB_CLIENT_ID=Iv1.abc123
GITHUB_CLIENT_SECRET=secret_abc123
GITHUB_CALLBACK_URL=http://your-domain/api/auth/github/callback
```

---

## LLM Provider Configuration

LLM providers are configured in `_ARQITEKT/config/llm.yaml`:

```yaml
providers:
  - name: github-models
    type: openai-compatible
    base_url: https://models.inference.ai.azure.com
    api_key_env: GITHUB_TOKEN
    models:
      - gpt-4o-mini
      - gpt-4o

  - name: openai
    type: openai
    api_key_env: ARQITEKT_LLM_KEY
    models:
      - gpt-4o-mini
      - gpt-4o

  - name: ollama
    type: ollama
    base_url: http://localhost:11434
    models:
      - llama3
      - codellama
```

Providers are tried in order (fallback chain). If the first fails (429/500/timeout), the next provider is attempted.

---

## TLS / HTTPS

For production, use a reverse proxy with TLS termination.

### Option A: Certbot (Let's Encrypt) on the host

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

### Option B: Add a Certbot sidecar to docker-compose

Add to `docker-compose.yml`:

```yaml
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

Update Nginx config to serve HTTPS on 443 and redirect 80.

---

## Reverse Proxy (Nginx)

The included `_ARQITEKT/nginx/nginx.conf` is mounted into the hub container:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api {
        proxy_pass http://server:3334;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://server:3334;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

For a custom domain with HTTPS, update `listen`, add `ssl_certificate` directives, and update `CORS_ORIGINS` + `GITHUB_CALLBACK_URL`.

---

## Troubleshooting

### Server won't start

```bash
# Check logs
docker compose logs server

# Common: Missing JWT_SECRET
# Fix: Set a proper value in .env
```

### Hub shows blank page

```bash
# Check Nginx logs
docker compose logs hub

# Common: Vite build failed
docker compose exec hub ls /usr/share/nginx/html
# Should contain index.html, assets/
```

### LLM calls fail

```bash
# Verify API key is set
docker compose exec server printenv ARQITEKT_LLM_KEY

# Check llm.yaml config
cat _ARQITEKT/config/llm.yaml

# Test connectivity
curl -s http://localhost:3334/api/chat/config
```

### WebSocket disconnects

Check that your reverse proxy supports WebSocket upgrades:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### CORS errors

Update `CORS_ORIGINS` in `.env` to include your frontend origin:

```env
CORS_ORIGINS=https://yourdomain.com,http://localhost:5173
```
