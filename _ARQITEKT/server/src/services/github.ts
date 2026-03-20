import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { hostname } from 'os';
import { spawn } from 'child_process';
import { config } from '../config.js';
import { createLogger } from './logger.js';

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
      token,
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

/* ------------------------------------------------------------------ */
/*  Git push — commit and push changes in a project directory          */
/* ------------------------------------------------------------------ */

const log = createLogger('github');

function runGit(args: string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn('git', args, { cwd, shell: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    proc.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }));
    proc.on('error', (err) => resolve({ code: 1, stdout: '', stderr: err.message }));
  });
}

export interface GitPushResult {
  success: boolean;
  message: string;
  branch?: string;
  commitSha?: string;
}

/**
 * Stage all changes, commit, and push to the configured remote.
 * Requires git to be installed and the project directory to be a git repo.
 */
export async function gitPush(
  projectPath: string,
  commitMessage = 'Update from ARQITEKT',
  branch?: string,
): Promise<GitPushResult> {
  // Check if git repo
  const statusResult = await runGit(['status', '--porcelain'], projectPath);
  if (statusResult.code !== 0) {
    return { success: false, message: 'Not a git repository or git not available' };
  }

  // Detect current branch
  const branchResult = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], projectPath);
  const currentBranch = branchResult.stdout.trim() || 'main';
  const targetBranch = branch ?? currentBranch;

  // If no changes, nothing to push
  if (!statusResult.stdout.trim()) {
    return { success: true, message: 'No changes to commit', branch: targetBranch };
  }

  // Stage all
  const addResult = await runGit(['add', '-A'], projectPath);
  if (addResult.code !== 0) {
    log.error({ stderr: addResult.stderr }, 'git add failed');
    return { success: false, message: `git add failed: ${addResult.stderr}` };
  }

  // Commit
  const commitResult = await runGit(['commit', '-m', commitMessage], projectPath);
  if (commitResult.code !== 0) {
    log.error({ stderr: commitResult.stderr }, 'git commit failed');
    return { success: false, message: `git commit failed: ${commitResult.stderr}` };
  }

  // Extract commit SHA
  const shaResult = await runGit(['rev-parse', '--short', 'HEAD'], projectPath);
  const commitSha = shaResult.stdout.trim();

  // Push
  const pushResult = await runGit(['push', 'origin', targetBranch], projectPath);
  if (pushResult.code !== 0) {
    log.error({ stderr: pushResult.stderr }, 'git push failed');
    return { success: false, message: `git push failed: ${pushResult.stderr}`, branch: targetBranch, commitSha };
  }

  log.info({ branch: targetBranch, commitSha }, 'pushed to remote');
  return { success: true, message: `Pushed to ${targetBranch}`, branch: targetBranch, commitSha };
}

/* ------------------------------------------------------------------ */
/*  Git status — get modified/staged/untracked files for a project     */
/* ------------------------------------------------------------------ */

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
}

export interface GitStatusResult {
  isRepo: boolean;
  branch?: string;
  files: GitFileStatus[];
}

export async function gitStatus(projectPath: string): Promise<GitStatusResult> {
  const branchResult = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], projectPath);
  if (branchResult.code !== 0) {
    return { isRepo: false, files: [] };
  }

  const branch = branchResult.stdout.trim();
  const statusResult = await runGit(['status', '--porcelain'], projectPath);
  if (statusResult.code !== 0) {
    return { isRepo: true, branch, files: [] };
  }

  const files: GitFileStatus[] = [];
  for (const line of statusResult.stdout.split('\n')) {
    if (!line.trim()) continue;
    const xy = line.slice(0, 2);
    const filePath = line.slice(3).trim();
    if (xy === '??' ) {
      files.push({ path: filePath, status: 'untracked' });
    } else if (xy.includes('D')) {
      files.push({ path: filePath, status: 'deleted' });
    } else if (xy.includes('R')) {
      files.push({ path: filePath, status: 'renamed' });
    } else if (xy.includes('A')) {
      files.push({ path: filePath, status: 'added' });
    } else {
      files.push({ path: filePath, status: 'modified' });
    }
  }

  return { isRepo: true, branch, files };
}
