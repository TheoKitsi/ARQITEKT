import { spawn, type ChildProcess } from 'child_process';
import { join } from 'path';
import { stat } from 'fs/promises';
import { config } from '../config.js';
import { resolveProjectById } from './projects.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RunningApp {
  pid: number;
  port: number;
  projectId: string;
  process: ChildProcess;
  startedAt: number;
}

interface StartResult {
  success: boolean;
  pid?: number;
  port?: number;
  message?: string;
}

interface StopResult {
  success: boolean;
  message?: string;
}

interface StatusResult {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
  uptime?: number;
}

type Framework = 'nextjs' | 'vite' | 'node';

// ---------------------------------------------------------------------------
// In-memory process tracking
// ---------------------------------------------------------------------------

const runningApps = new Map<string, RunningApp>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect the framework used by an app directory by checking for
 * well-known config files.
 */
async function detectFramework(appDir: string): Promise<Framework> {
  const checks: Array<{ glob: string; framework: Framework }> = [
    { glob: 'next.config.js', framework: 'nextjs' },
    { glob: 'next.config.ts', framework: 'nextjs' },
    { glob: 'next.config.mjs', framework: 'nextjs' },
    { glob: 'vite.config.ts', framework: 'vite' },
    { glob: 'vite.config.js', framework: 'vite' },
    { glob: 'vite.config.mjs', framework: 'vite' },
  ];

  for (const { glob, framework } of checks) {
    try {
      await stat(join(appDir, glob));
      return framework;
    } catch {
      // file does not exist — try next
    }
  }

  return 'node';
}

/**
 * Find the next available port starting from 4000 that is not
 * already occupied by a running app we manage.
 */
function allocatePort(): number {
  const usedPorts = new Set<number>();
  for (const app of runningApps.values()) {
    usedPorts.add(app.port);
  }
  let port = 4000;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start the dev server for the given project.
 */
export async function startApp(projectId: string): Promise<StartResult> {
  // Validate projectId to prevent path traversal / command injection
  if (!/^[\w-]+$/.test(projectId)) {
    return { success: false, message: 'Invalid project ID format' };
  }

  // Already running?
  if (runningApps.has(projectId)) {
    return { success: false, message: 'App is already running' };
  }

  // Enforce max running apps limit
  if (runningApps.size >= config.maxRunningApps) {
    return {
      success: false,
      message: `Maximum number of running apps (${config.maxRunningApps}) reached. Stop another app first.`,
    };
  }

  // Resolve app directory
  const appDir = join(await resolveProjectById(projectId), 'app');
  try {
    const s = await stat(appDir);
    if (!s.isDirectory()) {
      return { success: false, message: `App directory is not a directory: ${appDir}` };
    }
  } catch {
    return { success: false, message: `App directory does not exist: ${appDir}` };
  }

  // Detect framework & choose command
  const framework = await detectFramework(appDir);
  const port = allocatePort();

  let command: string;
  let args: string[];

  switch (framework) {
    case 'nextjs':
      command = 'npx';
      args = ['next', 'dev', '-p', port.toString()];
      break;
    case 'vite':
      command = 'npm';
      args = ['run', 'dev', '--', '--port', port.toString()];
      break;
    default:
      command = 'npm';
      args = ['run', 'dev', '--', '--port', port.toString()];
      break;
  }

  // Spawn the dev server
  const child = spawn(command, args, {
    cwd: appDir,
    shell: process.platform === 'win32',
    stdio: 'pipe',
  });

  if (child.pid == null) {
    return { success: false, message: 'Failed to spawn process (no PID returned)' };
  }

  const entry: RunningApp = {
    pid: child.pid,
    port,
    projectId,
    process: child,
    startedAt: Date.now(),
  };

  runningApps.set(projectId, entry);

  // Auto-cleanup on exit / error
  child.on('exit', (_code, _signal) => {
    runningApps.delete(projectId);
  });

  child.on('error', (_err) => {
    runningApps.delete(projectId);
  });

  return { success: true, pid: child.pid, port };
}

/**
 * Stop a running app for the given project.
 */
export async function stopApp(projectId: string): Promise<StopResult> {
  const entry = runningApps.get(projectId);
  if (!entry) {
    return { success: false, message: 'App is not running' };
  }

  const { pid } = entry;

  try {
    if (process.platform === 'win32') {
      // On Windows we must kill the entire process tree
      spawn('taskkill', ['/pid', pid.toString(), '/T', '/F'], {
        shell: true,
        stdio: 'ignore',
      });
    } else {
      process.kill(pid, 'SIGTERM');
    }
  } catch {
    // Process may have already exited — that is fine
  }

  runningApps.delete(projectId);

  return { success: true };
}

/**
 * Return the current status of a project's app process.
 */
export function getAppStatus(projectId: string): StatusResult {
  const entry = runningApps.get(projectId);
  if (!entry) {
    return { running: false };
  }

  return {
    running: true,
    pid: entry.pid,
    port: entry.port,
    url: `http://localhost:${entry.port}`,
    uptime: Math.round((Date.now() - entry.startedAt) / 1000),
  };
}

/**
 * Kill every tracked child process. Called during graceful shutdown.
 */
export function stopAllApps(): void {
  for (const [projectId, entry] of runningApps) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', entry.pid.toString(), '/T', '/F'], {
          shell: true,
          stdio: 'ignore',
        });
      } else {
        process.kill(entry.pid, 'SIGTERM');
      }
    } catch {
      // Process may have already exited
    }
    runningApps.delete(projectId);
  }
}
