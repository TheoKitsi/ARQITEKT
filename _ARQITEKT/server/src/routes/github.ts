import { Router } from 'express';
import { getGithubStatus, connectGithub, disconnectGithub, getRepoStatus } from '../services/github.js';
import { validate, connectGithubSchema } from '../middleware/validation.js';

export const githubRouter = Router();

// GET /api/github/status
githubRouter.get('/status', async (_req, res, next) => {
  try {
    const status = await getGithubStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/github/connect
githubRouter.post('/connect', validate(connectGithubSchema), async (req, res, next) => {
  try {
    const { token } = req.body;
    const status = await connectGithub(token);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/github/disconnect
githubRouter.post('/disconnect', async (_req, res, next) => {
  try {
    await disconnectGithub();
    res.json({ connected: false });
  } catch (err) {
    next(err);
  }
});

// GET /api/github/repo/:owner/:repo
githubRouter.get('/repo/:owner/:repo', async (req, res, next) => {
  try {
    const status = await getRepoStatus(req.params.owner as string, req.params.repo as string);
    res.json(status);
  } catch (err) {
    next(err);
  }
});
