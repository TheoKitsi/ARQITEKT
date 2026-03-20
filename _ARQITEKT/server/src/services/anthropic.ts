import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { hostname } from 'os';
import { config } from '../config.js';
import { createLogger } from './logger.js';

const log = createLogger('anthropic');

export interface AnthropicStatus {
  connected: boolean;
  /** Internal only — never send to client. */
  apiKey?: string;
}

const TOKEN_FILE = join(config.hubRoot, '.anthropic-token');

/* ------------------------------------------------------------------ */
/*  Encryption helpers (same pattern as github.ts)                     */
/* ------------------------------------------------------------------ */

function deriveKey(): Buffer {
  return createHash('sha256')
    .update(`arqitekt-${hostname()}-anthropic-token`)
    .digest();
}

function encrypt(value: string): string {
  const key = deriveKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(data: string): string {
  const key = deriveKey();
  const [ivHex, encHex] = data.split(':');
  if (!ivHex || !encHex) throw new Error('Invalid token file format');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

/* ------------------------------------------------------------------ */
/*  Token persistence                                                  */
/* ------------------------------------------------------------------ */

async function loadStoredKey(): Promise<string | undefined> {
  try {
    const data = await readFile(TOKEN_FILE, 'utf-8');
    return decrypt(data.trim());
  } catch {
    return process.env.ANTHROPIC_API_KEY;
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Check Anthropic connection status by making a lightweight models call.
 */
export async function getAnthropicStatus(): Promise<AnthropicStatus> {
  const apiKey = await loadStoredKey();
  if (!apiKey) return { connected: false };

  try {
    // Verify the key with a lightweight /v1/models call
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      log.warn(`Anthropic key verification returned ${response.status}`);
      return { connected: false };
    }

    return { connected: true, apiKey };
  } catch {
    return { connected: false };
  }
}

/**
 * Connect Anthropic by storing the API key (encrypted).
 */
export async function connectAnthropic(apiKey: string): Promise<AnthropicStatus> {
  // Verify the key first
  const response = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Invalid Anthropic API key: ${response.status}`);
  }

  await writeFile(TOKEN_FILE, encrypt(apiKey), 'utf-8');
  process.env.ANTHROPIC_API_KEY = apiKey;

  return { connected: true };
}

/**
 * Disconnect Anthropic — remove stored key.
 */
export async function disconnectAnthropic(): Promise<void> {
  try {
    await unlink(TOKEN_FILE);
  } catch { /* file may not exist */ }
  delete process.env.ANTHROPIC_API_KEY;
}

/**
 * List available Anthropic models.
 * Returns empty array if not connected.
 */
export async function listAnthropicModels(): Promise<
  Array<{ id: string; name: string; provider: string; contextWindow: number; available: boolean }>
> {
  const status = await getAnthropicStatus();
  if (!status.connected || !status.apiKey) return [];

  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': status.apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as {
      data?: Array<{
        id: string;
        display_name?: string;
        type?: string;
      }>;
    };

    return (data.data ?? [])
      .filter((m) => m.type === 'model')
      .map((m) => ({
        id: m.id,
        name: m.display_name ?? m.id,
        provider: 'Anthropic',
        contextWindow: inferContextWindow(m.id),
        available: true,
      }));
  } catch (err) {
    log.warn({ err }, 'Failed to fetch Anthropic models');
    return [];
  }
}

/** Infer context window from model ID. */
function inferContextWindow(modelId: string): number {
  if (modelId.includes('claude-3-5') || modelId.includes('claude-4')) return 200_000;
  if (modelId.includes('claude-3')) return 200_000;
  return 200_000; // Anthropic models default to 200k
}
