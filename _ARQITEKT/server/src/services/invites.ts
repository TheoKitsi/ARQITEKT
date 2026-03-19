import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config.js';
import { getRegistry, updateRegistryEntry } from './projects.js';
import type { ProjectMember, ProjectRole } from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProjectInvite {
  token: string;
  projectId: string;
  role: ProjectRole;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

/* ------------------------------------------------------------------ */
/*  Storage                                                            */
/* ------------------------------------------------------------------ */

const INVITES_FILE = path.join(config.hubRoot, 'config', 'invites.json');

async function loadInvites(): Promise<ProjectInvite[]> {
  try {
    const raw = await fs.readFile(INVITES_FILE, 'utf-8');
    return JSON.parse(raw) as ProjectInvite[];
  } catch {
    return [];
  }
}

async function saveInvites(invites: ProjectInvite[]): Promise<void> {
  await fs.mkdir(path.dirname(INVITES_FILE), { recursive: true });
  await fs.writeFile(INVITES_FILE, JSON.stringify(invites, null, 2), 'utf-8');
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Create an invite token for a project. Valid for 7 days by default.
 */
export async function createInvite(
  projectId: string,
  role: ProjectRole,
  createdBy: string,
  expiresInMs = 7 * 24 * 60 * 60 * 1000,
): Promise<ProjectInvite> {
  const invites = await loadInvites();
  const token = randomBytes(24).toString('hex');
  const now = new Date();
  const invite: ProjectInvite = {
    token,
    projectId,
    role,
    createdBy,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + expiresInMs).toISOString(),
  };
  invites.push(invite);
  await saveInvites(invites);
  return invite;
}

/**
 * Accept an invite token. Adds the user as a member and removes the token.
 */
export async function acceptInvite(
  token: string,
  userId: string,
  username: string,
): Promise<{ projectId: string; role: ProjectRole }> {
  const invites = await loadInvites();
  const index = invites.findIndex((i) => i.token === token);
  if (index === -1) {
    throw new Error('Invalid invite token');
  }

  const invite = invites[index]!;
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    invites.splice(index, 1);
    await saveInvites(invites);
    throw new Error('Invite has expired');
  }

  // Add user to project members
  const registry = await getRegistry();
  const project = registry.find((p) => p.id === invite.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const members: ProjectMember[] = project.members ?? [];
  if (members.some((m) => m.userId === userId)) {
    // Already a member — consume the invite silently
    invites.splice(index, 1);
    await saveInvites(invites);
    return { projectId: invite.projectId, role: invite.role };
  }

  members.push({
    userId,
    username,
    role: invite.role,
    addedAt: new Date().toISOString(),
  });
  await updateRegistryEntry(invite.projectId, { members });

  // Consume the invite
  invites.splice(index, 1);
  await saveInvites(invites);
  return { projectId: invite.projectId, role: invite.role };
}

/**
 * List pending invites for a project.
 */
export async function listInvites(projectId: string): Promise<ProjectInvite[]> {
  const invites = await loadInvites();
  const now = Date.now();
  return invites.filter((i) => i.projectId === projectId && new Date(i.expiresAt).getTime() > now);
}

/**
 * Revoke a specific invite token.
 */
export async function revokeInvite(token: string): Promise<boolean> {
  const invites = await loadInvites();
  const index = invites.findIndex((i) => i.token === token);
  if (index === -1) return false;
  invites.splice(index, 1);
  await saveInvites(invites);
  return true;
}
