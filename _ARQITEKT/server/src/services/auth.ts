import jwt, { type SignOptions } from 'jsonwebtoken';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { config } from '../config.js';
import { parseYaml, dumpYaml } from './yaml.js';
import type { UserProfile, JwtPayload, StoredUser, UsersStore } from '../types/auth.js';

const usersPath = join(config.hubRoot, 'config', 'users.yaml');

/* ------------------------------------------------------------------ */
/*  GitHub OAuth                                                       */
/* ------------------------------------------------------------------ */

/**
 * Exchange a GitHub OAuth authorization code for an access token.
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await response.json() as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) {
    const err = new Error(data.error_description || data.error || 'OAuth token exchange failed') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return data.access_token;
}

/**
 * Fetch the GitHub user profile using an access token.
 */
export async function fetchGithubUser(accessToken: string): Promise<UserProfile> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch GitHub user profile') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const user = await response.json() as {
    id: number; login: string; name: string | null; avatar_url: string; email: string | null;
  };

  return {
    id: String(user.id),
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    email: user.email || undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  JWT                                                                */
/* ------------------------------------------------------------------ */

/**
 * Sign JWT access + refresh token pair for a user.
 */
export function signTokens(user: UserProfile): { token: string; refreshToken: string } {
  const payload: Pick<JwtPayload, 'sub' | 'username'> = {
    sub: user.id,
    username: user.username,
  };

  const secret = config.jwtSecret as string;
  const signOpts: SignOptions = { expiresIn: config.jwtExpiresIn as unknown as SignOptions['expiresIn'] };
  const refreshOpts: SignOptions = { expiresIn: config.jwtRefreshExpiresIn as unknown as SignOptions['expiresIn'] };

  const token = jwt.sign(payload, secret, signOpts);
  const refreshToken = jwt.sign(payload, secret, refreshOpts);

  return { token, refreshToken };
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret as string) as JwtPayload;
}

/* ------------------------------------------------------------------ */
/*  File-based user store                                              */
/* ------------------------------------------------------------------ */

/**
 * Load the user store from disk.
 */
async function loadUsers(): Promise<StoredUser[]> {
  try {
    const content = await readFile(usersPath, 'utf-8');
    const data = parseYaml(content) as unknown as UsersStore;
    return data.users ?? [];
  } catch {
    return [];
  }
}

/**
 * Save the user store to disk.
 */
async function saveUsers(users: StoredUser[]): Promise<void> {
  await mkdir(dirname(usersPath), { recursive: true });
  const data: UsersStore = { users };
  const content = dumpYaml(data as unknown as Record<string, unknown>);
  await writeFile(usersPath, content, 'utf-8');
}

/**
 * Create or update a user in the file-based store.
 */
export async function upsertUser(profile: UserProfile, githubAccessToken: string): Promise<void> {
  const users = await loadUsers();
  const index = users.findIndex((u) => u.profile.id === profile.id);
  const now = new Date().toISOString();

  if (index >= 0) {
    users[index] = {
      profile,
      githubAccessToken,
      createdAt: users[index]!.createdAt,
      lastLoginAt: now,
    };
  } else {
    users.push({
      profile,
      githubAccessToken,
      createdAt: now,
      lastLoginAt: now,
    });
  }

  await saveUsers(users);
}

/**
 * Get a user by their ID from the file-based store.
 */
export async function getUser(userId: string): Promise<StoredUser | null> {
  const users = await loadUsers();
  return users.find((u) => u.profile.id === userId) ?? null;
}
