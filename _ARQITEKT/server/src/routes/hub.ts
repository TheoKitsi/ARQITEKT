import { Router } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';

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
