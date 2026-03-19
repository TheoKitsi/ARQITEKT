import { Router } from 'express';
import { listProjects, createProject, deleteProject, importProject, updateProjectMeta, renameProject, getLifecycle, setLifecycle, getRegistry, updateRegistryEntry, getProjectById } from '../services/projects.js';
import { createInvite, acceptInvite, listInvites, revokeInvite } from '../services/invites.js';
import { validate, createProjectSchema, importProjectSchema, updateMetaSchema, renameProjectSchema, lifecycleSchema, updateRegistryEntrySchema, addMemberSchema, updateMemberRoleSchema, createInviteSchema } from '../middleware/validation.js';
import { requireRole } from '../middleware/rbac.js';
import type { ProjectMember, ProjectRole } from '../types/project.js';

export const projectsRouter = Router();

/* ------------------------------------------------------------------ */
/*  Static routes (must come before /:id to avoid param matching)       */
/* ------------------------------------------------------------------ */

// GET /api/projects
projectsRouter.get('/', async (_req, res, next) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
projectsRouter.post('/', validate(createProjectSchema), async (req, res, next) => {
  try {
    const { name, description, template } = req.body;
    const project = await createProject(name, description, template);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/import
projectsRouter.post('/import', validate(importProjectSchema), async (req, res, next) => {
  try {
    const { sourcePath, name, description } = req.body;
    const project = await importProject(sourcePath, name, description);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/registry
projectsRouter.get('/registry', async (_req, res, next) => {
  try {
    const entries = await getRegistry();
    res.json({ projects: entries });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/registry/:id
projectsRouter.put('/registry/:id', validate(updateRegistryEntrySchema), async (req, res, next) => {
  try {
    const updated = await updateRegistryEntry(req.params.id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Registry entry not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/invite/accept  — accept an invite (any authenticated user)
projectsRouter.post('/invite/accept', async (req, res, next) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      res.status(400).json({ error: 'token is required' });
      return;
    }
    const userId = req.user?.sub ?? 'anonymous';
    const username = req.user?.username ?? 'anonymous';
    const result = await acceptInvite(token, userId, username);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Invalid') || err.message.includes('expired'))) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Parameterized routes (/:id)                                         */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id
projectsRouter.get('/:id', async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id as string);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', requireRole('owner'), async (req, res, next) => {
  try {
    await deleteProject(req.params.id as string);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/meta
projectsRouter.put('/:id/meta', requireRole('editor'), validate(updateMetaSchema), async (req, res, next) => {
  try {
    const updated = await updateProjectMeta(req.params.id as string, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/rename
projectsRouter.put('/:id/rename', requireRole('owner'), validate(renameProjectSchema), async (req, res, next) => {
  try {
    const { name } = req.body;
    const updated = await renameProject(req.params.id as string, name);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/lifecycle
projectsRouter.get('/:id/lifecycle', async (req, res, next) => {
  try {
    const lifecycle = await getLifecycle(req.params.id as string);
    res.json({ lifecycle });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/lifecycle
projectsRouter.post('/:id/lifecycle', requireRole('editor'), validate(lifecycleSchema), async (req, res, next) => {
  try {
    const { stage } = req.body;
    await setLifecycle(req.params.id as string, stage);
    res.json({ success: true, lifecycle: stage });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Member management                                                   */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id/members
projectsRouter.get('/:id/members', async (req, res, next) => {
  try {
    const registry = await getRegistry();
    const project = registry.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ members: project.members ?? [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/members  — add a member (owner only)
projectsRouter.post('/:id/members', requireRole('owner'), validate(addMemberSchema), async (req, res, next) => {
  try {
    const { userId, username, role } = req.body as { userId: string; username: string; role: ProjectRole };

    const registry = await getRegistry();
    const project = registry.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const members: ProjectMember[] = project.members ?? [];
    if (members.some((m) => m.userId === userId)) {
      res.status(409).json({ error: 'User is already a member' });
      return;
    }

    const newMember: ProjectMember = { userId, username, role, addedAt: new Date().toISOString() };
    members.push(newMember);
    await updateRegistryEntry(req.params.id as string, { members });
    res.status(201).json(newMember);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/members/:userId  — update member role (owner only)
projectsRouter.put('/:id/members/:userId', requireRole('owner'), validate(updateMemberRoleSchema), async (req, res, next) => {
  try {
    const { role } = req.body as { role: ProjectRole };

    const registry = await getRegistry();
    const project = registry.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const members: ProjectMember[] = project.members ?? [];
    const member = members.find((m) => m.userId === req.params.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    member.role = role;
    await updateRegistryEntry(req.params.id as string, { members });
    res.json(member);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/members/:userId  — remove a member (owner only)
projectsRouter.delete('/:id/members/:userId', requireRole('owner'), async (req, res, next) => {
  try {
    const registry = await getRegistry();
    const project = registry.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const members: ProjectMember[] = project.members ?? [];
    const index = members.findIndex((m) => m.userId === req.params.userId);
    if (index === -1) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    members.splice(index, 1);
    await updateRegistryEntry(req.params.id as string, { members });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Invitations                                                        */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/invites  — create an invite (owner only)
projectsRouter.post('/:id/invites', requireRole('owner'), validate(createInviteSchema), async (req, res, next) => {
  try {
    const { role } = req.body as { role: ProjectRole };
    const createdBy = req.user?.username ?? 'unknown';
    const invite = await createInvite(req.params.id as string, role, createdBy);
    res.status(201).json(invite);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/invites  — list pending invites (owner only)
projectsRouter.get('/:id/invites', requireRole('owner'), async (req, res, next) => {
  try {
    const invites = await listInvites(req.params.id as string);
    res.json({ invites });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/invites/:token  — revoke an invite (owner only)
projectsRouter.delete('/:id/invites/:token', requireRole('owner'), async (req, res, next) => {
  try {
    const revoked = await revokeInvite(req.params.token as string);
    if (!revoked) {
      res.status(404).json({ error: 'Invite not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
