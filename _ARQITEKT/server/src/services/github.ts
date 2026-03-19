import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { hostname } from 'os';
import { config } from '../config.js';

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  token?: string;
}

const ENV_PATH = join(config.hubRoot, '.env');
const TOKEN_FILE = join(config.hubRoot, '.github-token');

/** Derive an encryption key from the machine hostname + a fixed salt. */
function deriveKey(): Buffer {
  return createHash('sha256')
    .update(`arqitekt-${hostname()}-github-token`)
    .digest();
}

function encryptToken(token: string): string {
  const key = deriveKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptToken(data: string): string {
  const key = deriveKey();
  const [ivHex, encHex] = data.split(':');
  if (!ivHex || !encHex) throw new Error('Invalid token file format');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

async function loadStoredToken(): Promise<string | undefined> {
  // Try encrypted file first, then fall back to env var
  try {
    const data = await readFile(TOKEN_FILE, 'utf-8');
    return decryptToken(data.trim());
  } catch {
    // Fall back to env var / .env
    return process.env.GITHUB_TOKEN;
  }
}

/**
 * Get GitHub connection status.
 */
export async function getGithubStatus(): Promise<GitHubStatus> {
  const token = await loadStoredToken();
  if (!token) {
    return { connected: false };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { connected: false };
    }

    const user = (await response.json()) as { login: string; avatar_url: string };
    return {
      connected: true,
      username: user.login,
      avatarUrl: user.avatar_url,
    };
  } catch {
    return { connected: false };
  }
}

/**
 * Connect GitHub by storing the token.
 */
export async function connectGithub(token: string): Promise<GitHubStatus> {
  // Verify the token first
  const response = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Invalid token: ${response.status}`);
  }

  const user = (await response.json()) as { login: string; avatar_url: string };

  // Store token encrypted
  await writeFile(TOKEN_FILE, encryptToken(token), 'utf-8');

  // Also set in current process for immediate use
  process.env.GITHUB_TOKEN = token;

  return {
    connected: true,
    username: user.login,
    avatarUrl: user.avatar_url,
  };
}

/**
 * Disconnect GitHub.
 */
export async function disconnectGithub(): Promise<void> {
  // Remove encrypted token file
  try {
    const { unlink } = await import('fs/promises');
    await unlink(TOKEN_FILE);
  } catch { /* file may not exist */ }

  // Also clean up legacy .env entry if present
  try {
    const envContent = await readFile(ENV_PATH, 'utf-8');
    const updated = envContent.replace(/GITHUB_TOKEN=.*/g, '').trim();
    await writeFile(ENV_PATH, updated + '\n', 'utf-8');
  } catch { /* no .env file */ }

  delete process.env.GITHUB_TOKEN;
}

/**
 * Get repository status for a project.
 */
export async function getRepoStatus(
  owner: string,
  repo: string
): Promise<{
  exists: boolean;
  description?: string;
  defaultBranch?: string;
  lastPush?: string;
}> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { exists: false };
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { exists: false };
    }

    const data = (await response.json()) as {
      description: string;
      default_branch: string;
      pushed_at: string;
    };

    return {
      exists: true,
      description: data.description,
      defaultBranch: data.default_branch,
      lastPush: data.pushed_at,
    };
  } catch {
    return { exists: false };
  }
}
