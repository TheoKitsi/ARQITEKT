import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3334', 10),
  hubRoot: resolve(__dirname, '..', '..'),
  workspaceRoot: resolve(__dirname, '..', '..', '..'),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3333')
    .split(',')
    .map((s) => s.trim()),
  bodyLimit: process.env.BODY_LIMIT || '1mb',
  llmTimeout: parseInt(process.env.LLM_TIMEOUT || '60000', 10),
  maxRunningApps: parseInt(process.env.MAX_RUNNING_APPS || '5', 10),
} as const;
