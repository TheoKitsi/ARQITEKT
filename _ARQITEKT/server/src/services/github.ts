import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  token?: string;
}

const ENV_PATH = join(config.hubRoot, '.env');

/**
 * Get GitHub connection status.
 */
export async function getGithubStatus(): Promise<GitHubStatus> {
  const token = process.env.GITHUB_TOKEN;
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

  // Store token in .env
  let envContent = '';
  try {
    envContent = await readFile(ENV_PATH, 'utf-8');
  } catch { /* file doesn't exist */ }

  if (envContent.includes('GITHUB_TOKEN=')) {
    envContent = envContent.replace(/GITHUB_TOKEN=.*/g, `GITHUB_TOKEN=${token}`);
  } else {
    envContent += `\nGITHUB_TOKEN=${token}\n`;
  }
  await writeFile(ENV_PATH, envContent.trim() + '\n', 'utf-8');

  // Set in current process
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
