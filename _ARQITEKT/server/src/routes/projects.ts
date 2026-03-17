import { Router } from 'express';
import { listProjects, createProject, deleteProject, importProject, updateProjectMeta, renameProject, getLifecycle, setLifecycle, getRegistry, updateRegistryEntry } from '../services/projects.js';
import { validate, createProjectSchema, importProjectSchema, updateMetaSchema, renameProjectSchema, lifecycleSchema, updateRegistryEntrySchema } from '../middleware/validation.js';

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
    const { name, description } = req.body;
    const project = await createProject(name, description);
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

/* ------------------------------------------------------------------ */
/*  Parameterized routes (/:id)                                         */
/* ------------------------------------------------------------------ */

// DELETE /api/projects/:id
projectsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteProject(req.params.id as string);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/meta
projectsRouter.put('/:id/meta', validate(updateMetaSchema), async (req, res, next) => {
  try {
    const updated = await updateProjectMeta(req.params.id as string, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/rename
projectsRouter.put('/:id/rename', validate(renameProjectSchema), async (req, res, next) => {
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
projectsRouter.post('/:id/lifecycle', validate(lifecycleSchema), async (req, res, next) => {
  try {
    const { stage } = req.body;
    await setLifecycle(req.params.id as string, stage);
    res.json({ success: true, lifecycle: stage });
  } catch (err) {
    next(err);
  }
});
