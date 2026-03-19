import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3334', 10),
  hubRoot: process.env.HUB_ROOT
    ? resolve(process.env.HUB_ROOT)
    : resolve(__dirname, '..', '..'),
  workspaceRoot: process.env.WORKSPACE_ROOT
    ? resolve(process.env.WORKSPACE_ROOT)
    : resolve(__dirname, '..', '..', '..'),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3333')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  bodyLimit: process.env.BODY_LIMIT || '1mb',
  llmTimeout: parseInt(process.env.LLM_TIMEOUT || '60000', 10),
  maxRunningApps: parseInt(process.env.MAX_RUNNING_APPS || '5', 10),

  // Auth — optional (disabled by default for local dev)
  authEnabled: process.env.AUTH_ENABLED === 'true',
  jwtSecret: process.env.JWT_SECRET || 'arqitekt-local-dev-secret-not-for-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // GitHub OAuth (only needed when authEnabled=true)
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3334/api/auth/github/callback',

  // Public URL (for redirects after OAuth)
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:5173',
} as const;
