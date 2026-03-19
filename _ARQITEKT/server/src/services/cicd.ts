import { join } from 'path';
import { mkdir, writeFile, stat, readFile } from 'fs/promises';
import { resolveProjectById } from './projects.js';
import { createLogger } from './logger.js';

const log = createLogger('cicd');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Framework = 'nextjs' | 'vite' | 'node' | 'flutter';

export interface CiCdResult {
  success: boolean;
  filePath: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Framework detection (duplicated for independence from appManager)
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

// ---------------------------------------------------------------------------
// Workflow templates
// ---------------------------------------------------------------------------

function nodeWorkflow(name: string): string {
  return `name: CI — ${name}

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        working-directory: app
        run: npm ci

      - name: Lint
        working-directory: app
        run: npm run lint --if-present

      - name: Test
        working-directory: app
        run: npm test --if-present

      - name: Build
        working-directory: app
        run: npm run build
`;
}

function flutterWorkflow(name: string): string {
  return `name: CI — ${name}

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosaurus/flutter-action@v2
        with:
          flutter-version: '3.x'
          channel: stable

      - name: Install dependencies
        working-directory: app
        run: flutter pub get

      - name: Analyze
        working-directory: app
        run: flutter analyze

      - name: Test
        working-directory: app
        run: flutter test

      - name: Build APK
        working-directory: app
        run: flutter build apk --release
`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a GitHub Actions CI workflow YAML for a project.
 * Detects framework and writes .github/workflows/ci.yml inside the project.
 */
export async function generateGithubActions(projectId: string): Promise<CiCdResult> {
  const projectPath = await resolveProjectById(projectId);
  const appDir = join(projectPath, 'app');

  // Read project name from package.json or pubspec.yaml
  let projectName = projectId;
  try {
    const pkg = JSON.parse(await readFile(join(appDir, 'package.json'), 'utf-8'));
    if (pkg.name) projectName = pkg.name;
  } catch {
    try {
      const pubspec = await readFile(join(appDir, 'pubspec.yaml'), 'utf-8');
      const match = pubspec.match(/^name:\s*(.+)/m);
      if (match?.[1]) projectName = match[1].trim();
    } catch { /* use projectId */ }
  }

  const framework = await detectFramework(appDir);
  const yaml = framework === 'flutter'
    ? flutterWorkflow(projectName)
    : nodeWorkflow(projectName);

  const workflowDir = join(projectPath, '.github', 'workflows');
  const filePath = join(workflowDir, 'ci.yml');

  await mkdir(workflowDir, { recursive: true });
  await writeFile(filePath, yaml, 'utf-8');

  log.info({ projectId, framework, filePath }, 'Generated GitHub Actions workflow');

  return {
    success: true,
    filePath: '.github/workflows/ci.yml',
    message: `Generated ${framework} CI workflow`,
  };
}
