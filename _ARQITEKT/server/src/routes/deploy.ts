import { Router } from 'express';
import { scaffoldProject } from '../services/scaffold.js';
import { generateCode } from '../services/codegen.js';
import { startApp, stopApp, getAppStatus, getAppLogs } from '../services/appManager.js';
import { exportRequirements } from '../services/export.js';
import { gitPush, gitStatus } from '../services/github.js';
import { resolveProjectById } from '../services/projects.js';
import { buildProject } from '../services/buildService.js';
import { generateGithubActions } from '../services/cicd.js';
import { recordAudit } from '../services/audit.js';
import { validate, scaffoldSchema, codegenSchema, githubPushSchema } from '../middleware/validation.js';
import { requireRole } from '../middleware/rbac.js';

export const deployRouter = Router();

// POST /api/projects/:id/scaffold
deployRouter.post('/:id/scaffold', requireRole('editor'), validate(scaffoldSchema), async (req, res, next) => {
  try {
    const force = req.body.force === true;
    const result = await scaffoldProject(req.params.id as string, force);
    recordAudit(req.params.id as string, 'project.scaffolded', req.ip ?? 'unknown', undefined, { force }).catch(() => {});
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/codegen
deployRouter.post('/:id/codegen', requireRole('editor'), validate(codegenSchema), async (req, res, next) => {
  try {
    const { model } = req.body;
    const result = await generateCode(req.params.id as string, model);
    recordAudit(req.params.id as string, 'project.codegen', req.ip ?? 'unknown', undefined, { model }).catch(() => {});
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

// GET /api/projects/:id/app/logs
deployRouter.get('/:id/app/logs', (req, res, next) => {
  try {
    const since = req.query.since ? Number(req.query.since) : undefined;
    const logs = getAppLogs(req.params.id as string, since);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/github-push
deployRouter.post('/:id/github-push', requireRole('editor'), validate(githubPushSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const projectPath = await resolveProjectById(projectId);
    const commitMessage = req.body?.commitMessage ?? 'Update from ARQITEKT';
    const branch = req.body?.branch;
    const result = await gitPush(projectPath, commitMessage, branch);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    recordAudit(projectId, 'project.pushed', req.ip ?? 'unknown', result.branch).catch(() => {});
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/git/status
deployRouter.get('/:id/git/status', async (req, res, next) => {
  try {
    const projectPath = await resolveProjectById(req.params.id as string);
    const result = await gitStatus(projectPath);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/github-export
deployRouter.post('/:id/github-export', requireRole('editor'), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const format = (req.body?.format === 'csv' ? 'csv' : req.body?.format === 'json' ? 'json' : 'github') as 'github' | 'json' | 'csv';
    const result = await exportRequirements(projectId, format);

    if (format === 'csv' && typeof result === 'string') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="requirements-${projectId}.csv"`);
      res.send(result);
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/store/configure
deployRouter.post('/:id/store/configure', requireRole('editor'), async (req, res) => {
  const { platform, credentials } = req.body ?? {};
  if (!platform || !['android', 'ios', 'web'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform', message: 'Platform must be android, ios, or web' });
  }
  // Ready for integration: validate credentials, store encrypted config
  return res.status(501).json({
    error: 'Not implemented',
    message: `Store configuration for ${platform} requires API credentials (Play Store / App Store Connect). Planned for future release.`,
    platform,
    hasCredentials: !!credentials,
  });
});

// POST /api/projects/:id/store/build
deployRouter.post('/:id/store/build', requireRole('editor'), async (req, res) => {
  const { platform, variant } = req.body ?? {};
  if (!platform || !['android', 'ios', 'web'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform', message: 'Platform must be android, ios, or web' });
  }
  // Ready for integration: trigger platform-specific build + upload
  return res.status(501).json({
    error: 'Not implemented',
    message: `Store build for ${platform} requires configured credentials and build toolchain. Planned for future release.`,
    platform,
    variant: variant ?? 'release',
  });
});

// POST /api/projects/:id/build-deploy — build the project app
deployRouter.post('/:id/build-deploy', requireRole('editor'), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const result = await buildProject(projectId);
    recordAudit(projectId, 'project.deployed', req.ip ?? 'unknown', undefined, {
      framework: result.framework,
      success: result.success,
      durationMs: result.durationMs,
    }).catch(() => {});
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/github-actions — generate CI workflow
deployRouter.post('/:id/github-actions', requireRole('editor'), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const result = await generateGithubActions(projectId);
    recordAudit(projectId, 'project.scaffolded', req.ip ?? 'unknown', undefined, { action: 'github-actions' }).catch(() => {});
    res.json(result);
  } catch (err) {
    next(err);
  }
});
