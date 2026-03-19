import { Router } from 'express';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';
import { getUsageSummary } from '../services/telemetry.js';
import { reportError } from '../services/errorReporter.js';
import { createLogger } from '../services/logger.js';
import { listStarterTemplates } from '../services/projects.js';

export const hubRouter = Router();

/** Resolve the path to server/package.json relative to hubRoot. */
const packageJsonPath = join(config.hubRoot, 'server', 'package.json');

/**
 * Read the current version from package.json.
 */
async function getCurrentVersion(): Promise<string> {
  const raw = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(raw) as { version: string };
  return pkg.version;
}

// GET /api/hub/version
hubRouter.get('/version', async (_req, res, next) => {
  try {
    const version = await getCurrentVersion();
    res.json({
      version,
      hubRoot: config.hubRoot,
      uptime: process.uptime(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hub/update/check
hubRouter.get('/update/check', async (_req, res, next) => {
  try {
    const currentVersion = await getCurrentVersion();

    let available = false;
    let latestVersion: string | undefined;
    let releaseUrl: string | undefined;

    try {
      const response = await fetch(
        'https://api.github.com/repos/TheoKitsi/ARQITEKT/releases/latest',
        {
          headers: { Accept: 'application/vnd.github.v3+json' },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          tag_name: string;
          html_url: string;
        };

        // Strip leading "v" from tag if present (e.g. "v2.1.0" -> "2.1.0")
        latestVersion = data.tag_name.replace(/^v/, '');
        releaseUrl = data.html_url;
        available = latestVersion !== currentVersion;
      }
    } catch {
      // GitHub unreachable — fall through with available: false
    }

    res.json({
      available,
      currentVersion,
      ...(latestVersion !== undefined && { latestVersion }),
      ...(releaseUrl !== undefined && { releaseUrl }),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/hub/update/install
hubRouter.post('/update/install', async (_req, res, next) => {
  try {
    res.json({
      success: false,
      message:
        'Auto-update is not yet available (planned for Phase 7). ' +
        'Please update manually by running: git pull origin master',
      remoteUrl: 'https://github.com/TheoKitsi/ARQITEKT.git',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hub/health — comprehensive health check
hubRouter.get('/health', async (_req, res) => {
  const checks: Record<string, { status: string; detail?: string }> = {};

  // 1. File system: can we read the workspace?
  try {
    await access(config.workspaceRoot);
    checks.filesystem = { status: 'ok' };
  } catch {
    checks.filesystem = { status: 'degraded', detail: 'Workspace root not accessible' };
  }

  // 2. Config: can we read projects.yaml?
  try {
    await readFile(join(config.hubRoot, 'config', 'projects.yaml'), 'utf-8');
    checks.config = { status: 'ok' };
  } catch {
    checks.config = { status: 'degraded', detail: 'projects.yaml not found' };
  }

  // 3. LLM: is the primary LLM configured?
  const llmKey = process.env.ARQITEKT_LLM_KEY || process.env.GITHUB_TOKEN;
  checks.llm = llmKey
    ? { status: 'ok' }
    : { status: 'degraded', detail: 'No LLM API key configured (ARQITEKT_LLM_KEY or GITHUB_TOKEN)' };

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const statusCode = allOk ? 200 : 207; // 207 Multi-Status for partial health

  res.status(statusCode).json({
    status: allOk ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    checks,
  });
});

// GET /api/hub/llm/usage — LLM token usage summary
hubRouter.get('/llm/usage', (_req, res) => {
  const since = _req.query.since ? Number(_req.query.since) : undefined;
  const summary = getUsageSummary(since);
  res.json(summary);
});

// GET /api/hub/templates — list available starter templates
hubRouter.get('/templates', async (_req, res, next) => {
  try {
    const templates = await listStarterTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// POST /api/hub/error-report — receive client-side error reports
const errorLog = createLogger('hub:errors');
hubRouter.post('/error-report', (req, res) => {
  const { message, source, line, column, stack, type } = req.body ?? {};
  errorLog.warn({ message, source, line, column, type }, 'Client error report');
  reportError(new Error(String(message ?? 'Unknown client error')), { source, line, column, stack, type });
  res.status(204).end();
});
