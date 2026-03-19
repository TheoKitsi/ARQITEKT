import { Router } from 'express';
import { scaffoldProject } from '../services/scaffold.js';
import { generateCode } from '../services/codegen.js';
import { startApp, stopApp, getAppStatus } from '../services/appManager.js';
import { validate, scaffoldSchema, codegenSchema, githubPushSchema } from '../middleware/validation.js';

export const deployRouter = Router();

// POST /api/projects/:id/scaffold
deployRouter.post('/:id/scaffold', validate(scaffoldSchema), async (req, res, next) => {
  try {
    const force = req.body.force === true;
    const result = await scaffoldProject(req.params.id as string, force);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/codegen
deployRouter.post('/:id/codegen', validate(codegenSchema), async (req, res, next) => {
  try {
    const { model } = req.body;
    const result = await generateCode(req.params.id as string, model);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/app/start
deployRouter.post('/:id/app/start', async (req, res, next) => {
  try {
    const result = await startApp(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/app/stop
deployRouter.post('/:id/app/stop', async (req, res, next) => {
  try {
    const result = await stopApp(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/app/status
deployRouter.get('/:id/app/status', (req, res, next) => {
  try {
    const status = getAppStatus(req.params.id as string);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/github-push
deployRouter.post('/:id/github-push', validate(githubPushSchema), async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Git push not yet implemented in v2' });
});

// POST /api/projects/:id/github-export
deployRouter.post('/:id/github-export', async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Issues export not yet implemented in v2' });
});

// POST /api/projects/:id/store/configure
deployRouter.post('/:id/store/configure', async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Store configuration not yet implemented in v2' });
});

// POST /api/projects/:id/store/build
deployRouter.post('/:id/store/build', async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Store build not yet implemented in v2' });
});

// POST /api/projects/:id/build-deploy
deployRouter.post('/:id/build-deploy', async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Build + deploy not yet implemented in v2' });
});

// POST /api/projects/:id/github-actions
deployRouter.post('/:id/github-actions', async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'GitHub Actions not yet implemented in v2' });
});
