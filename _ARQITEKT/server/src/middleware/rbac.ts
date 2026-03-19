import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { getRegistry } from '../services/projects.js';
import type { ProjectRole } from '../types/project.js';

/**
 * Role hierarchy: owner > editor > viewer
 * An owner can do everything an editor and viewer can.
 */
const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Middleware factory that checks if the authenticated user has at least
 * the required role on the project identified by `req.params.id`.
 *
 * When AUTH_ENABLED=false, all requests pass through (no enforcement).
 *
 * When a project has no `members` defined, all authenticated users are
 * treated as owners (backwards-compatible with pre-RBAC projects).
 */
export function requireRole(minimumRole: ProjectRole) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip RBAC when auth is disabled
    if (!config.authEnabled) {
      return next();
    }

    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const projectId = req.params.id;
    if (!projectId) {
      return next();
    }

    const registry = await getRegistry();
    const project = registry.find((p) => p.id === projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // No members defined = open access (backwards compatible)
    if (!project.members || project.members.length === 0) {
      return next();
    }

    const member = project.members.find((m) => m.userId === userId);
    if (!member) {
      res.status(403).json({ error: 'You are not a member of this project' });
      return;
    }

    if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minimumRole]) {
      res.status(403).json({ error: `Requires at least "${minimumRole}" role` });
      return;
    }

    next();
  };
}
