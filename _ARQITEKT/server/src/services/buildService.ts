import { spawn } from 'child_process';
import { join } from 'path';
import { stat, readFile } from 'fs/promises';
import { platform } from 'os';
import { resolveProjectById } from './projects.js';
import { createLogger } from './logger.js';

const log = createLogger('buildService');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Framework = 'nextjs' | 'vite' | 'node' | 'flutter';

export interface BuildResult {
  success: boolean;
  framework: Framework;
  output: string;
  durationMs: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Framework detection
// ---------------------------------------------------------------------------

async function detectFramework(appDir: string): Promise<Framework> {
  const checks: Array<{ file: string; framework: Framework }> = [
    { file: 'pubspec.yaml', framework: 'flutter' },
    { file: 'next.config.js', framework: 'nextjs' },
    { file: 'next.config.ts', framework: 'nextjs' },
    { file: 'next.config.mjs', framework: 'nextjs' },
    { file: 'vite.config.ts', framework: 'vite' },
    { file: 'vite.config.js', framework: 'vite' },
    { file: 'vite.config.mjs', framework: 'vite' },
  ];

  for (const { file, framework } of checks) {
    try {
      await stat(join(appDir, file));
      return framework;
    } catch { /* not found */ }
  }
  return 'node';
}

function getBuildCommand(framework: Framework): { cmd: string; args: string[] } {
  const npm = platform() === 'win32' ? 'npm.cmd' : 'npm';
  switch (framework) {
    case 'nextjs': return { cmd: npm, args: ['run', 'build'] };
    case 'vite':   return { cmd: npm, args: ['run', 'build'] };
    case 'flutter': return { cmd: 'flutter', args: ['build', 'apk', '--release'] };
    case 'node':
    default:       return { cmd: npm, args: ['run', 'build'] };
  }
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

/**
 * Run the build command for a project. Captures stdout/stderr and returns
 * a structured result.
 */
export async function buildProject(projectId: string): Promise<BuildResult> {
  const projectPath = await resolveProjectById(projectId);
  const appDir = join(projectPath, 'app');

  // Confirm app directory exists
  try {
    await stat(appDir);
  } catch {
    return { success: false, framework: 'node', output: '', durationMs: 0, message: 'No app directory found. Run scaffold first.' };
  }

  // Check package.json for build script (non-flutter)
  const framework = await detectFramework(appDir);
  if (framework !== 'flutter') {
    try {
      const pkg = JSON.parse(await readFile(join(appDir, 'package.json'), 'utf-8'));
      if (!pkg.scripts?.build) {
        return { success: false, framework, output: '', durationMs: 0, message: 'No "build" script found in package.json' };
      }
    } catch {
      return { success: false, framework, output: '', durationMs: 0, message: 'Cannot read package.json in app directory' };
    }
  }

  const { cmd, args } = getBuildCommand(framework);
  log.info({ projectId, framework, cmd, args }, 'Starting build');

  const start = Date.now();

  return new Promise<BuildResult>((resolve) => {
    const chunks: string[] = [];
    const child = spawn(cmd, args, {
      cwd: appDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production' },
      shell: platform() === 'win32',
    });

    child.stdout?.on('data', (d: Buffer) => chunks.push(d.toString()));
    child.stderr?.on('data', (d: Buffer) => chunks.push(d.toString()));

    child.on('error', (err) => {
      resolve({
        success: false,
        framework,
        output: chunks.join(''),
        durationMs: Date.now() - start,
        message: `Build process error: ${err.message}`,
      });
    });

    child.on('close', (code) => {
      const output = chunks.join('');
      const success = code === 0;
      log.info({ projectId, success, code, durationMs: Date.now() - start }, 'Build finished');
      resolve({
        success,
        framework,
        output,
        durationMs: Date.now() - start,
        message: success ? 'Build completed successfully' : `Build failed with exit code ${code}`,
      });
    });
  });
}
