// ============================================================================
//  ARQITEKT — API Route Handlers
// ============================================================================
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { execSync, spawn } from 'child_process';
import {
  PORT, HUB_ROOT, WORKSPACE_ROOT, TEMPLATE_DIR,
  buildingProjects, runningApps,
  parseYaml, parseFrontmatter, upsertYamlField, getMarkdownFiles,
  getLifecycle, setLifecycle, computeReadiness,
  getProjectTags, writeTagsToYaml, getProjectBranding, getProjectGithub, autoTagFromBC,
  getStats, buildTree, getSolutionList, getProjectDir,
  listProjects, getNextProjectNumber, createProject, deleteProject, renameProject,
  updateProjectMeta, openInVSCode,
  runValidate, readRequirement, searchRequirements,
  analyzeSOL, getNextSolId, getNextUSId, setRequirementStatus, getBCSummary,
  loadLLMConfig, proxyLLMRequest,
  listConversations, saveConversation, readConversation,
  listFeedback, saveFeedback, readFeedbackItem, deleteFeedbackItem,
  computeAuthored,
  // GitHub Models
  GITHUB_MODELS, loadGitHubToken, saveGitHubTokenEnv, validateGitHubToken,
  getGitHubUser, proxyGitHubModels,
  // File System API
  listProjectFiles, readProjectFile, writeProjectFile,
  // GitHub Repo Status
  getGitHubRepoStatus,
  // Auto-Update
  checkHubUpdate, performHubUpdate,
} from './services.mjs';


export function handleAPI(req, url, res) {
  const path = url.pathname;
  const params = url.searchParams;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  // Hub-level routes
  if (path === '/api/projects' && req.method === 'GET') {
    return res.end(JSON.stringify(listProjects()));
  }

  if (path === '/api/projects/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { name, description } = JSON.parse(body);
        if (!name || !name.trim()) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Name required' }));
        }
        const result = createProject(name.trim(), description);
        if (result.error) { res.statusCode = 400; return res.end(JSON.stringify(result)); }
        return res.end(JSON.stringify(result));
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (path === '/api/projects/import' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { sourcePath, name, description, githubRepo } = JSON.parse(body);
        if (!sourcePath || !name) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'sourcePath and name required' }));
        }
        // Validate source path exists
        if (!existsSync(sourcePath)) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Source path does not exist: ' + sourcePath }));
        }
        // Create ARQITEKT project structure
        const nextNum = getNextProjectNumber();
        const code = name.normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        const projectId = nextNum + '_' + code;
        const projectDir = join(WORKSPACE_ROOT, projectId);

        // Copy template structure
        const templateDir = join(HUB_ROOT, 'template');
        cpSync(templateDir, projectDir, { recursive: true });

        // Copy source code to app/ directory
        const appDir = join(projectDir, 'app');
        mkdirSync(appDir, { recursive: true });
        let filesCopied = 0;
        function copyDir(src, dest) {
          const entries = readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            // Skip node_modules, .git, and build artifacts
            if (['node_modules', '.git', 'dist', 'build', '.next', '.cache', 'android', 'ios'].includes(entry.name)) continue;
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);
            if (entry.isDirectory()) {
              mkdirSync(destPath, { recursive: true });
              copyDir(srcPath, destPath);
            } else {
              cpSync(srcPath, destPath);
              filesCopied++;
            }
          }
        }
        copyDir(sourcePath, appDir);

        // Update project.yaml
        const cfgPath = join(projectDir, 'config', 'project.yaml');
        let yaml = readFileSync(cfgPath, 'utf-8');
        yaml = yaml.replace('{{PROJECT_NAME}}', name);
        yaml = yaml.replace('{{PROJECT_CODENAME}}', code);
        yaml = yaml.replace('{{PROJECT_DESCRIPTION}}', description || '');
        yaml = yaml.replace('{{DATE}}', new Date().toISOString().slice(0, 10));
        if (githubRepo) {
          yaml = yaml.replace(/repo: ""/, 'repo: "' + githubRepo + '"');
          yaml = yaml.replace(/url: ""/, 'url: "https://github.com/' + githubRepo + '"');
        }
        writeFileSync(cfgPath, yaml, 'utf-8');

        // Detect app type and set lifecycle to built
        let appType = 'custom';
        const appPkg = join(appDir, 'package.json');
        if (existsSync(appPkg)) {
          try {
            const pkg = JSON.parse(readFileSync(appPkg, 'utf-8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps['next']) appType = 'nextjs';
            else if (deps['@capacitor/core']) appType = 'capacitor';
            else if (deps['react']) appType = 'react';
            else if (deps['vue']) appType = 'vue';
            else appType = 'vanilla';
          } catch {}
        }
        upsertYamlField(cfgPath, 'app', 'type', appType);
        setLifecycle(projectDir, 'built');

        // Auto-detect tags
        const tags = autoTagFromBC(projectDir);
        if (tags.length) writeTagsToYaml(projectDir, tags);

        return res.end(JSON.stringify({ success: true, projectId, filesCopied, appType }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Project-level routes: /api/projects/:id/...
  const projectMatch = path.match(/^\/api\/projects\/(\d{3}_[^/]+)(\/.*)?$/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    const subPath = projectMatch[2] || '';
    const projectDir = getProjectDir(projectId);

    if (subPath === '/delete' && req.method === 'POST') {
      const result = deleteProject(projectId);
      if (result.error) { res.statusCode = 404; }
      return res.end(JSON.stringify(result));
    }

    if (subPath === '/rename' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { name } = JSON.parse(body);
          if (!name || !name.trim()) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Name required' }));
          }
          const result = renameProject(projectId, name.trim());
          if (result.error) { res.statusCode = 400; return res.end(JSON.stringify(result)); }
          return res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (subPath === '/update-meta' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const fields = JSON.parse(body);
          const result = updateProjectMeta(projectId, fields);
          if (result.error) { res.statusCode = 400; return res.end(JSON.stringify(result)); }
          return res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (subPath === '/open' && req.method === 'GET') {
      return res.end(JSON.stringify(openInVSCode(projectId)));
    }

    if (!projectDir) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Project not found' }));
    }

    const reqDir = join(projectDir, 'requirements');

    if (subPath === '/stats') {
      const stats = getStats(reqDir);
      stats.github = getProjectGithub(projectDir);
      stats.lifecycle = getLifecycle(projectDir);
      stats.hasApp = existsSync(join(projectDir, 'app', 'package.json'));
      return res.end(JSON.stringify(stats));
    }
    if (subPath === '/tree') return res.end(JSON.stringify(buildTree(projectDir)));
    if (subPath === '/validate') return res.end(JSON.stringify(runValidate(projectDir)));
    if (subPath === '/solutions') return res.end(JSON.stringify(getSolutionList(projectDir)));

    if (subPath === '/readiness') {
      return res.end(JSON.stringify(computeReadiness(projectDir)));
    }

    if (subPath === '/tags' && req.method === 'GET') {
      return res.end(JSON.stringify({ tags: getProjectTags(projectDir) }));
    }

    if (subPath === '/tags' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { tags } = JSON.parse(body);
          if (!Array.isArray(tags)) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'tags must be array' })); }
          const clean = tags.map(t => String(t).trim().toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean);
          writeTagsToYaml(projectDir, clean);
          return res.end(JSON.stringify({ success: true, tags: clean }));
        } catch { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid JSON' })); }
      });
      return;
    }

    if (subPath === '/auto-tag' && req.method === 'POST') {
      const suggested = autoTagFromBC(projectDir);
      const existing = getProjectTags(projectDir);
      const merged = [...new Set([...existing, ...suggested])];
      writeTagsToYaml(projectDir, merged);
      return res.end(JSON.stringify({ success: true, tags: merged, suggested }));
    }

    if (subPath === '/branding' && req.method === 'GET') {
      return res.end(JSON.stringify({ branding: getProjectBranding(projectDir) }));
    }

    if (subPath === '/branding' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { branding } = JSON.parse(body);
          if (!branding || typeof branding !== 'object') { res.statusCode = 400; return res.end(JSON.stringify({ error: 'branding object required' })); }
          // Validate color format
          const colorRe = /^#[0-9a-fA-F]{6}$/;
          if (branding.primary && !colorRe.test(branding.primary)) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid primary color' })); }
          if (branding.secondary && !colorRe.test(branding.secondary)) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid secondary color' })); }
          // Write branding block
          const cfgPath = join(projectDir, 'config', 'project.yaml');
          let raw = existsSync(cfgPath) ? readFileSync(cfgPath, 'utf-8') : '';
          // Remove old branding block
          raw = raw.replace(/\nbranding:\n(?:  .+\n)*/g, '');
          // Append new branding block
          let block = '\nbranding:\n';
          if (branding.logo) block += '  logo: "' + branding.logo + '"\n';
          if (branding.primary) block += '  primary: "' + branding.primary + '"\n';
          if (branding.secondary) block += '  secondary: "' + branding.secondary + '"\n';
          if (branding.fontHeading) block += '  font_heading: "' + branding.fontHeading + '"\n';
          if (branding.fontBody) block += '  font_body: "' + branding.fontBody + '"\n';
          if (branding.fontMono) block += '  font_mono: "' + branding.fontMono + '"\n';
          if (branding.mode) block += '  mode: "' + (branding.mode === 'light' ? 'light' : 'dark') + '"\n';
          raw = raw.trimEnd() + '\n' + block;
          writeFileSync(cfgPath, raw, 'utf-8');
          return res.end(JSON.stringify({ success: true, branding }));
        } catch { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid JSON' })); }
      });
      return;
    }

    if (subPath === '/lifecycle' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { state } = JSON.parse(body);
          const valid = ['planning','ready','building','built','running','deployed'];
          if (!valid.includes(state)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Invalid lifecycle state. Allowed: ' + valid.join(', ') }));
          }
          setLifecycle(projectDir, state);
          return res.end(JSON.stringify({ success: true, lifecycle: state }));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (subPath === '/scaffold' && req.method === 'POST') {
      if (buildingProjects.has(projectId)) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'Build laeuft bereits fuer dieses Projekt.' }));
      }
      buildingProjects.add(projectId);
      try {
        setLifecycle(projectDir, 'building');
        const result = execSync('node "' + join(HUB_ROOT, 'scripts', 'scaffold.mjs').replace(/\\/g, '/') + '" "' + projectDir.replace(/\\/g, '/') + '"', {
          cwd: HUB_ROOT, encoding: 'utf-8', timeout: 60000,
        });
        const filesMatch = result.match(/(\d+)\s*files created/);
        const filesCreated = filesMatch ? parseInt(filesMatch[1]) : 0;
        setLifecycle(projectDir, 'built');
        return res.end(JSON.stringify({ success: true, filesCreated }));
      } catch (err) {
        setLifecycle(projectDir, 'planning');
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Scaffold fehlgeschlagen: ' + (err.stdout || err.message).slice(0, 500) }));
      } finally {
        buildingProjects.delete(projectId);
      }
    }

    if (subPath === '/codegen' && req.method === 'POST') {
      if (buildingProjects.has(projectId)) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'Build laeuft bereits fuer dieses Projekt.' }));
      }
      buildingProjects.add(projectId);
      try {
        const result = execSync('node "' + join(HUB_ROOT, 'scripts', 'codegen.mjs').replace(/\\/g, '/') + '" "' + projectDir.replace(/\\/g, '/') + '"', {
          cwd: HUB_ROOT, encoding: 'utf-8', timeout: 300000,
        });
        const genMatch = result.match(/(\d+)\s*files generated/);
        const filesGenerated = genMatch ? parseInt(genMatch[1]) : 0;
        setLifecycle(projectDir, 'built');
        return res.end(JSON.stringify({ success: true, filesGenerated }));
      } catch (err) {
        // Codegen failure is non-fatal — stubs remain
        setLifecycle(projectDir, 'built');
        return res.end(JSON.stringify({ success: false, error: 'Codegen teilweise fehlgeschlagen', details: (err.stdout || err.message).slice(0, 1000) }));
      } finally {
        buildingProjects.delete(projectId);
      }
    }

    // --- GitHub Export ---
    if (subPath === '/github-export' && req.method === 'POST') {
      const exportScript = join(projectDir, 'scripts', 'export-github.mjs');
      if (!existsSync(exportScript)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'export-github.mjs nicht vorhanden in diesem Projekt.' }));
      }
      try {
        const output = execSync('node "' + exportScript.replace(/\\/g, '/') + '"', {
          cwd: projectDir, encoding: 'utf-8', timeout: 30000,
        });
        const exportsDir = join(projectDir, 'exports');
        const outputFile = existsSync(join(exportsDir, 'github-issues.json')) ? 'exports/github-issues.json' : 'exports/';
        let issueCount = 0;
        try {
          const json = JSON.parse(readFileSync(join(exportsDir, 'github-issues.json'), 'utf8'));
          issueCount = Array.isArray(json) ? json.length : 0;
        } catch {}
        return res.end(JSON.stringify({ success: true, issueCount, outputFile }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Export fehlgeschlagen', details: (err.stdout || err.message).slice(0, 1000) }));
      }
    }

    // --- Playwright Testing Endpoints ---
    if (subPath === '/test/setup' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Kein app/ Verzeichnis. Zuerst Implementieren oder Importieren.' }));
      }
      let filesCreated = 0;
      try {
        // Install playwright
        execSync('npm install -D @playwright/test', { cwd: appDir, encoding: 'utf-8', timeout: 120000 });
        // Create playwright.config.ts
        const configContent = `import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  reporter: [['html', { open: 'never' }]],
});
`;
        writeFileSync(join(appDir, 'playwright.config.ts'), configContent, 'utf-8');
        filesCreated++;
        // Create tests directory with a sample test
        const testsDir = join(appDir, 'tests');
        mkdirSync(testsDir, { recursive: true });
        const sampleTest = `import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

test('no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/');
  expect(errors).toHaveLength(0);
});
`;
        writeFileSync(join(testsDir, 'smoke.spec.ts'), sampleTest, 'utf-8');
        filesCreated++;
        return res.end(JSON.stringify({ success: true, filesCreated }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Playwright Setup fehlgeschlagen', details: (err.stdout || err.message).slice(0, 1000) }));
      }
    }

    if (subPath === '/test/run' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(join(appDir, 'playwright.config.ts')) && !existsSync(join(appDir, 'playwright.config.js'))) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Kein Playwright-Config gefunden. Zuerst "Setup Playwright" ausfuehren.' }));
      }
      try {
        const output = execSync('npx playwright test --reporter=json', {
          cwd: appDir, encoding: 'utf-8', timeout: 120000,
        });
        let result = { passed: 0, failed: 0, skipped: 0 };
        try {
          const json = JSON.parse(output);
          if (json.stats) result = { passed: json.stats.expected || 0, failed: json.stats.unexpected || 0, skipped: json.stats.skipped || 0 };
        } catch { /* parse output for pass/fail counts */ }
        result.reportPath = 'app/playwright-report/index.html';
        return res.end(JSON.stringify(result));
      } catch (err) {
        // Playwright exits with non-zero on test failures, which is normal
        let result = { passed: 0, failed: 0, skipped: 0, error: null };
        try {
          const json = JSON.parse(err.stdout || '');
          if (json.stats) result = { passed: json.stats.expected || 0, failed: json.stats.unexpected || 0, skipped: json.stats.skipped || 0 };
        } catch {
          result.error = 'Tests fehlgeschlagen: ' + (err.stdout || err.message).slice(0, 500);
        }
        result.reportPath = 'app/playwright-report/index.html';
        return res.end(JSON.stringify(result));
      }
    }

    // --- App Runner Endpoints ---
    if (subPath === '/app/install' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Kein app/ Verzeichnis. Zuerst Implementieren.' }));
      }
      try {
        const output = execSync('npm install', { cwd: appDir, encoding: 'utf-8', timeout: 120000 });
        return res.end(JSON.stringify({ success: true, output: output.slice(-500) }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'npm install fehlgeschlagen', details: (err.stdout || err.message).slice(0, 1000) }));
      }
    }

    if (subPath === '/app/start' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Kein app/ Verzeichnis.' }));
      }
      if (runningApps.has(projectId)) {
        const info = runningApps.get(projectId);
        return res.end(JSON.stringify({ success: true, port: info.port, message: 'App laeuft bereits.' }));
      }
      // Limit running apps
      if (runningApps.size >= 3) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Maximum 3 gleichzeitig laufende Apps. Stoppe eine andere App zuerst.' }));
      }
      // Auto-install if no node_modules
      if (!existsSync(join(appDir, 'node_modules'))) {
        try {
          execSync('npm install', { cwd: appDir, encoding: 'utf-8', timeout: 120000 });
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'npm install fehlgeschlagen', details: (err.stdout || err.message).slice(0, 500) }));
        }
      }
      // Find free port
      const projectIndex = parseInt(projectId.slice(0, 3)) || 1;
      let port = 3334 + projectIndex - 1;

      // Detect app type for appropriate start command
      let startCmd = 'npm';
      let startArgs = ['run', 'dev', '--', '-p', String(port)];
      const cfgPath = join(projectDir, 'config', 'project.yaml');
      let appType = '';
      if (existsSync(cfgPath)) {
        try {
          const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
          appType = cfg.app?.type || '';
          if (cfg.app?.start_command) {
            const parts = cfg.app.start_command.replace(/\{PORT\}/g, String(port)).split(/\s+/);
            startCmd = parts[0];
            startArgs = parts.slice(1);
          } else if (cfg.app?.port) {
            port = Number(cfg.app.port) || port;
            startArgs = ['run', 'dev', '--', '-p', String(port)];
          }
        } catch {}
      }
      // Auto-detect from package.json if no custom command
      if (!appType) {
        try {
          const pkg = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf-8'));
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          if (deps['next']) appType = 'nextjs';
          else if (deps['@capacitor/core']) appType = 'capacitor';
          else if (deps['react']) appType = 'react';
          else if (deps['vue']) appType = 'vue';
          else appType = 'vanilla';
        } catch {}
      }
      // If no custom start command, use type-specific defaults
      if (!startArgs.includes('run') || startArgs[1] === 'dev') {
        if (appType === 'vanilla') {
          startCmd = 'npx';
          startArgs = ['serve', '-l', String(port), '.'];
        } else if (appType === 'capacitor') {
          startCmd = 'npx';
          startArgs = ['serve', '-l', String(port), '.'];
        } else if (appType === 'react' || appType === 'vue') {
          startArgs = ['run', 'dev', '--', '--port', String(port)];
        }
        // nextjs/custom: keep default npm run dev -- -p PORT
      }

      // Spawn dev server
      const child = spawn(startCmd, startArgs, {
        cwd: appDir,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        detached: false,
      });
      const appInfo = { port, pid: child.pid, process: child, startedAt: Date.now() };
      runningApps.set(projectId, appInfo);
      // Write PID file
      writeFileSync(join(appDir, '.arqitekt-pid'), JSON.stringify({ pid: child.pid, port }), 'utf-8');
      setLifecycle(projectDir, 'running');
      child.on('exit', () => {
        runningApps.delete(projectId);
        const pidFile = join(appDir, '.arqitekt-pid');
        if (existsSync(pidFile)) { try { rmSync(pidFile); } catch {} }
        setLifecycle(projectDir, 'built');
      });
      // Short delay to let the server start, then respond
      setTimeout(() => {
        res.end(JSON.stringify({ success: true, port, pid: child.pid }));
      }, 2000);
      return;
    }

    if (subPath === '/app/stop' && req.method === 'POST') {
      const info = runningApps.get(projectId);
      if (!info) {
        return res.end(JSON.stringify({ success: true, message: 'App laeuft nicht.' }));
      }
      try {
        // Windows: kill process tree
        if (process.platform === 'win32') {
          execSync('taskkill /T /F /PID ' + info.pid, { encoding: 'utf-8', timeout: 10000 });
        } else {
          process.kill(-info.pid, 'SIGTERM');
        }
      } catch {}
      runningApps.delete(projectId);
      const pidFile = join(projectDir, 'app', '.arqitekt-pid');
      if (existsSync(pidFile)) { try { rmSync(pidFile); } catch {} }
      setLifecycle(projectDir, 'built');
      return res.end(JSON.stringify({ success: true }));
    }

    if (subPath === '/app/status' && req.method === 'GET') {
      const info = runningApps.get(projectId);
      if (!info) return res.end(JSON.stringify({ running: false }));
      return res.end(JSON.stringify({
        running: true,
        port: info.port,
        pid: info.pid,
        uptime: Math.round((Date.now() - info.startedAt) / 1000),
      }));
    }

    // --- Store: Configure Fastlane ---
    if (subPath === '/store/configure' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'No app/ directory.' }));
      }
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { platform, bundleId, appName } = JSON.parse(body);
          const cfg = parseYaml(readFileSync(join(projectDir, 'config', 'project.yaml'), 'utf-8'));
          const appType = cfg.app?.type || 'unknown';
          const flDir = join(appDir, 'fastlane');
          mkdirSync(flDir, { recursive: true });

          // Appfile
          let appfile = '';
          if (platform === 'android' || platform === 'both') {
            appfile += 'json_key_file(ENV["GOOGLE_PLAY_JSON_KEY"])\n';
            appfile += 'package_name("' + (bundleId || 'com.messkraft.app') + '")\n';
          }
          if (platform === 'ios' || platform === 'both') {
            appfile += 'apple_id(ENV["APPLE_ID"])\n';
            appfile += 'itc_team_id(ENV["ITC_TEAM_ID"])\n';
            appfile += 'team_id(ENV["TEAM_ID"])\n';
            appfile += 'app_identifier("' + (bundleId || 'com.messkraft.app') + '")\n';
          }
          writeFileSync(join(flDir, 'Appfile'), appfile, 'utf-8');

          // Fastfile
          let fastfile = 'default_platform(';
          fastfile += platform === 'ios' ? ':ios' : ':android';
          fastfile += ')\n\n';
          if (platform === 'android' || platform === 'both') {
            fastfile += 'platform :android do\n';
            fastfile += '  desc "Build and upload to Google Play"\n';
            fastfile += '  lane :deploy do\n';
            if (appType === 'capacitor') {
              fastfile += '    sh("cd .. && npx cap sync android")\n';
              fastfile += '    gradle(task: "bundle", build_type: "Release", project_dir: "android/")\n';
            } else {
              fastfile += '    sh("cd .. && npm run build")\n';
            }
            fastfile += '    upload_to_play_store(track: "internal")\n';
            fastfile += '  end\n';
            fastfile += 'end\n\n';
          }
          if (platform === 'ios' || platform === 'both') {
            fastfile += 'platform :ios do\n';
            fastfile += '  desc "Build and upload to App Store"\n';
            fastfile += '  lane :deploy do\n';
            fastfile += '    match(type: "appstore")\n';
            fastfile += '    build_app(scheme: "' + (appName || 'App') + '")\n';
            fastfile += '    upload_to_app_store(skip_metadata: true, skip_screenshots: true)\n';
            fastfile += '  end\n';
            fastfile += 'end\n';
          }
          writeFileSync(join(flDir, 'Fastfile'), fastfile, 'utf-8');

          // Update project.yaml with store config
          upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'platform', platform);
          upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'bundle_id', bundleId || 'com.messkraft.app');
          upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'status', 'configured');

          return res.end(JSON.stringify({ success: true, files: ['fastlane/Appfile', 'fastlane/Fastfile'] }));
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // --- Store: Build Release ---
    if (subPath === '/store/build' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'No app/ directory.' }));
      }
      if (buildingProjects.has(projectId + ':store-build')) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'Store build already in progress.' }));
      }
      buildingProjects.add(projectId + ':store-build');
      try {
        const cfg = parseYaml(readFileSync(join(projectDir, 'config', 'project.yaml'), 'utf-8'));
        const appType = cfg.app?.type || 'unknown';
        let output = '';
        if (appType === 'capacitor') {
          output = execSync('npx cap sync android 2>&1 && cd android && gradlew.bat assembleRelease 2>&1', { cwd: appDir, encoding: 'utf-8', timeout: 300000, shell: true });
        } else {
          output = execSync('npm run build 2>&1', { cwd: appDir, encoding: 'utf-8', timeout: 120000 });
        }
        upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'status', 'built');
        upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'last_build', new Date().toISOString());
        return res.end(JSON.stringify({ success: true, output: output.slice(-2000) }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Build failed', details: (err.stdout || err.message || '').slice(0, 2000) }));
      } finally {
        buildingProjects.delete(projectId + ':store-build');
      }
    }

    // --- Store: Generate GitHub Actions Workflow ---
    if (subPath === '/store/github-actions' && req.method === 'POST') {
      try {
        const cfg = parseYaml(readFileSync(join(projectDir, 'config', 'project.yaml'), 'utf-8'));
        const appType = cfg.app?.type || 'unknown';
        const gh = cfg.github || {};
        const bundleId = cfg.store?.bundle_id || 'com.messkraft.app';
        const appName = cfg.project?.name || projectId;

        let workflow = 'name: Deploy ' + appName + '\n';
        workflow += 'on:\n';
        workflow += '  push:\n';
        workflow += '    branches: [release/' + (gh.path || projectId.toLowerCase()) + ']\n';
        workflow += '    paths:\n';
        workflow += '      - "' + (gh.path || '.') + '/**"\n';
        workflow += '  workflow_dispatch:\n\n';
        workflow += 'jobs:\n';

        if (appType === 'capacitor') {
          // Android build job
          workflow += '  build-android:\n';
          workflow += '    runs-on: ubuntu-latest\n';
          workflow += '    steps:\n';
          workflow += '      - uses: actions/checkout@v4\n';
          workflow += '      - uses: actions/setup-node@v4\n';
          workflow += '        with:\n          node-version: 20\n';
          workflow += '      - uses: actions/setup-java@v4\n';
          workflow += '        with:\n          distribution: temurin\n          java-version: 17\n';
          workflow += '      - name: Install & Build\n';
          workflow += '        working-directory: ' + (gh.path || '.') + '\n';
          workflow += '        run: |\n';
          workflow += '          npm ci\n';
          workflow += '          npm run build\n';
          workflow += '          npx cap sync android\n';
          workflow += '      - name: Build APK\n';
          workflow += '        working-directory: ' + (gh.path || '.') + '/android\n';
          workflow += '        run: ./gradlew assembleRelease\n';
          workflow += '      - name: Sign APK\n';
          workflow += '        uses: r0adkll/sign-android-release@v1\n';
          workflow += '        with:\n';
          workflow += '          releaseDirectory: ' + (gh.path || '.') + '/android/app/build/outputs/apk/release\n';
          workflow += '          signingKeyBase64: ${{ secrets.ANDROID_SIGNING_KEY }}\n';
          workflow += '          alias: ${{ secrets.ANDROID_KEY_ALIAS }}\n';
          workflow += '          keyStorePassword: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}\n';
          workflow += '      - name: Upload to Play Store\n';
          workflow += '        uses: r0adkll/upload-google-play@v1\n';
          workflow += '        with:\n';
          workflow += '          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}\n';
          workflow += '          packageName: ' + bundleId + '\n';
          workflow += '          releaseFiles: ' + (gh.path || '.') + '/android/app/build/outputs/apk/release/*.apk\n';
          workflow += '          track: internal\n\n';

          // iOS build job (macOS runner)
          workflow += '  build-ios:\n';
          workflow += '    runs-on: macos-latest\n';
          workflow += '    steps:\n';
          workflow += '      - uses: actions/checkout@v4\n';
          workflow += '      - uses: actions/setup-node@v4\n';
          workflow += '        with:\n          node-version: 20\n';
          workflow += '      - name: Install & Build\n';
          workflow += '        working-directory: ' + (gh.path || '.') + '\n';
          workflow += '        run: |\n';
          workflow += '          npm ci\n';
          workflow += '          npm run build\n';
          workflow += '          npx cap sync ios\n';
          workflow += '      - name: Build & Upload iOS\n';
          workflow += '        uses: yukiarrr/ios-build-action@v1.11.2\n';
          workflow += '        with:\n';
          workflow += '          project-path: ' + (gh.path || '.') + '/ios/App/App.xcodeproj\n';
          workflow += '          p12-base64: ${{ secrets.IOS_P12_BASE64 }}\n';
          workflow += '          mobileprovision-base64: ${{ secrets.IOS_MOBILEPROVISION_BASE64 }}\n';
          workflow += '          code-signing-identity: ${{ secrets.IOS_CODE_SIGNING_IDENTITY }}\n';
          workflow += '          team-id: ${{ secrets.IOS_TEAM_ID }}\n';
          workflow += '          export-method: app-store\n';
        } else {
          // Next.js / web app — Vercel deploy
          workflow += '  deploy:\n';
          workflow += '    runs-on: ubuntu-latest\n';
          workflow += '    steps:\n';
          workflow += '      - uses: actions/checkout@v4\n';
          workflow += '      - uses: actions/setup-node@v4\n';
          workflow += '        with:\n          node-version: 20\n';
          workflow += '      - name: Install & Build\n';
          workflow += '        working-directory: ' + (gh.path || '.') + '\n';
          workflow += '        run: |\n';
          workflow += '          npm ci\n';
          workflow += '          npm run build\n';
          workflow += '      - name: Deploy to Vercel\n';
          workflow += '        uses: amondnet/vercel-action@v25\n';
          workflow += '        with:\n';
          workflow += '          vercel-token: ${{ secrets.VERCEL_TOKEN }}\n';
          workflow += '          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}\n';
          workflow += '          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}\n';
          workflow += '          vercel-args: --prod\n';
          workflow += '          working-directory: ' + (gh.path || '.') + '\n';
        }

        // Write workflow file
        const ghDir = join(projectDir, '.github', 'workflows');
        mkdirSync(ghDir, { recursive: true });
        const wfFile = join(ghDir, 'deploy.yml');
        writeFileSync(wfFile, workflow, 'utf-8');

        upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'status', 'ci-configured');

        return res.end(JSON.stringify({ success: true, file: '.github/workflows/deploy.yml' }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // --- Store: Upload / Publish to Store ---
    if (subPath === '/store/upload' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'No app/ directory. Build the app first.' }));
      }
      try {
        const cfg = parseYaml(readFileSync(join(projectDir, 'config', 'project.yaml'), 'utf-8'));
        const appType = cfg.app?.type || 'unknown';
        const platform = cfg.store?.platform || 'android';
        let result = {};

        if (appType === 'capacitor') {
          // Use Fastlane to upload to the store
          const fastlaneDir = join(appDir, platform, 'fastlane');
          if (!existsSync(fastlaneDir)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Fastlane not configured. Run Store Configure first.' }));
          }
          const lane = platform === 'ios' ? 'release' : 'deploy';
          const cwd = join(appDir, platform);
          const output = execSync('fastlane ' + lane, { cwd, timeout: 600000, encoding: 'utf-8' });
          result = { success: true, output: output.substring(0, 500) };
        } else {
          // For web apps, trigger the CI/CD workflow or indicate manual upload needed
          const wfFile = join(projectDir, '.github', 'workflows', 'deploy.yml');
          if (existsSync(wfFile)) {
            result = { success: true, message: 'CI/CD pipeline configured. Push to the release branch to trigger deployment.' };
          } else {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'No CI/CD pipeline configured. Set up GitHub Actions first.' }));
          }
        }

        upsertYamlField(join(projectDir, 'config', 'project.yaml'), 'store', 'status', 'uploaded');
        return res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // --- GitHub: Push app code to monorepo ---
    if (subPath === '/github/push' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'No app/ directory to push.' }));
      }
      try {
        const cfg = parseYaml(readFileSync(join(projectDir, 'config', 'project.yaml'), 'utf-8'));
        const gh = cfg.github || {};
        if (!gh.repo || !gh.path) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'GitHub repo and path not configured.' }));
        }
        // Find the monorepo local clone
        const monoDir = join(dirname(dirname(projectDir)), 'TK.Apps');
        const targetDir = join(monoDir, gh.path);
        if (!existsSync(monoDir) || !existsSync(join(monoDir, '.git'))) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'TK.Apps monorepo not found at ' + monoDir + '. Clone it first.' }));
        }
        // Sync app/ to monorepo/<path>/
        mkdirSync(targetDir, { recursive: true });
        cpSync(appDir, targetDir, { recursive: true, force: true });
        // Also copy .github/workflows if they exist
        const wfDir = join(projectDir, '.github', 'workflows');
        if (existsSync(wfDir)) {
          const monoWfDir = join(monoDir, '.github', 'workflows');
          mkdirSync(monoWfDir, { recursive: true });
          for (const f of readdirSync(wfDir)) {
            cpSync(join(wfDir, f), join(monoWfDir, gh.path + '-' + f), { force: true });
          }
        }
        // Git add, commit, push
        const commitMsg = 'Update ' + (cfg.project?.name || projectId) + ' from ARQITEKT';
        execSync('git add -A', { cwd: monoDir, encoding: 'utf-8' });
        const status = execSync('git status --porcelain', { cwd: monoDir, encoding: 'utf-8' }).trim();
        if (!status) {
          return res.end(JSON.stringify({ success: true, message: 'No changes to push.' }));
        }
        execSync('git commit -m "' + commitMsg.replace(/"/g, '\\"') + '"', { cwd: monoDir, encoding: 'utf-8' });
        execSync('git push origin main 2>&1', { cwd: monoDir, encoding: 'utf-8', timeout: 30000 });

        return res.end(JSON.stringify({ success: true, message: 'Pushed to ' + gh.repo + '/' + gh.path }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Push failed: ' + (err.message || '').slice(0, 500) }));
      }
    }

    // --- Deploy: Production Build ---
    if (subPath === '/app/build' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      if (!existsSync(appDir)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Kein app/ Verzeichnis.' }));
      }
      if (buildingProjects.has(projectId + ':build')) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'Build laeuft bereits.' }));
      }
      buildingProjects.add(projectId + ':build');
      try {
        execSync('npm run build', { cwd: appDir, encoding: 'utf-8', timeout: 120000 });
        return res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Build fehlgeschlagen', details: (err.stdout || err.message).slice(0, 1000) }));
      } finally {
        buildingProjects.delete(projectId + ':build');
      }
    }

    // --- Deploy: Production Start ---
    if (subPath === '/app/deploy' && req.method === 'POST') {
      const appDir = join(projectDir, 'app');
      // Detect build output for different frameworks
      const hasNext = existsSync(join(appDir, '.next'));
      const hasDist = existsSync(join(appDir, 'dist'));
      const hasBuild = existsSync(join(appDir, 'build'));
      if (!hasNext && !hasDist && !hasBuild) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'No build output found. Run Production Build first.' }));
      }
      if (runningApps.has(projectId)) {
        const info = runningApps.get(projectId);
        return res.end(JSON.stringify({ success: true, port: info.port, message: 'Already running.' }));
      }
      const projectIndex = parseInt(projectId.slice(0, 3)) || 1;
      let port = 4000 + projectIndex - 1;
      // Choose start command based on framework
      let startArgs;
      if (hasNext) {
        startArgs = ['run', 'start', '--', '-p', String(port)];
      } else if (hasDist || hasBuild) {
        // Use serve or npx serve for static builds
        const servDir = hasDist ? 'dist' : 'build';
        startArgs = ['exec', 'serve', servDir, '--', '-l', String(port), '-s'];
      }
      const child = spawn('npm', startArgs, {
        cwd: appDir, shell: true, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, detached: false,
      });
      const appInfo = { port, pid: child.pid, process: child, startedAt: Date.now(), mode: 'production' };
      runningApps.set(projectId, appInfo);
      writeFileSync(join(appDir, '.arqitekt-pid'), JSON.stringify({ pid: child.pid, port, mode: 'production' }), 'utf-8');
      setLifecycle(projectDir, 'deployed');
      child.on('exit', () => {
        runningApps.delete(projectId);
        const pidFile = join(appDir, '.arqitekt-pid');
        if (existsSync(pidFile)) { try { rmSync(pidFile); } catch {} }
        setLifecycle(projectDir, 'built');
      });
      setTimeout(() => {
        res.end(JSON.stringify({ success: true, port, pid: child.pid }));
      }, 2000);
      return;
    }

    // --- Force Scaffold (ignore readiness) ---
    if (subPath === '/force-scaffold' && req.method === 'POST') {
      if (buildingProjects.has(projectId)) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'Build laeuft bereits.' }));
      }
      buildingProjects.add(projectId);
      try {
        setLifecycle(projectDir, 'building');
        const result = execSync('node "' + join(HUB_ROOT, 'scripts', 'scaffold.mjs').replace(/\\/g, '/') + '" "' + projectDir.replace(/\\/g, '/') + '"', {
          cwd: HUB_ROOT, encoding: 'utf-8', timeout: 60000,
        });
        const filesMatch = result.match(/(\d+)\s*files created/);
        setLifecycle(projectDir, 'built');
        return res.end(JSON.stringify({ success: true, filesCreated: filesMatch ? parseInt(filesMatch[1]) : 0, forced: true }));
      } catch (err) {
        setLifecycle(projectDir, 'planning');
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Scaffold fehlgeschlagen: ' + (err.stdout || err.message).slice(0, 500) }));
      } finally {
        buildingProjects.delete(projectId);
      }
    }

    if (subPath === '/read') {
      const id = params.get('id');
      if (!id) return res.end(JSON.stringify({ error: 'id parameter required' }));
      return res.end(JSON.stringify(readRequirement(projectDir, id) || { error: 'not found' }));
    }
    if (subPath === '/search') {
      const q = params.get('q');
      if (!q) return res.end(JSON.stringify({ error: 'q parameter required' }));
      return res.end(JSON.stringify(searchRequirements(projectDir, q)));
    }

    if (subPath === '/sol-status') {
      const tree = buildTree(projectDir);
      const bc = tree[0] && tree[0].type === 'business-case' ? tree[0] : null;
      const solutions = bc ? (bc.children || []) : tree.filter(n => n.type === 'solution');
      const solAnalysis = solutions.map(analyzeSOL);
      const hasBC = !!bc;
      const bcTitle = bc ? bc.title : null;
      return res.end(JSON.stringify({ hasBC, bcTitle, solutions: solAnalysis }));
    }

    if (subPath === '/cross-cutting') {
      const reqDir = join(projectDir, 'requirements');
      const ccTypes = [
        { dir: 'infrastructure', prefix: 'INF', type: 'infrastructure' },
        { dir: 'adrs', prefix: 'ADR', type: 'adr' },
        { dir: 'notifications', prefix: 'NTF', type: 'notification' },
      ];
      const result = [];
      for (const cc of ccTypes) {
        const d = join(reqDir, cc.dir);
        if (!existsSync(d)) continue;
        const files = readdirSync(d).filter(f => f.endsWith('.md')).sort();
        for (const f of files) {
          const content = readFileSync(join(d, f), 'utf8');
          const fm = parseFrontmatter(content);
          result.push({ id: fm.id || f.replace('.md',''), title: fm.title || f.replace('.md',''), type: cc.type, status: fm.status || 'idea', file: relative(projectDir, join(d, f)).replace(/\\\\/g, '/') });
        }
      }
      return res.end(JSON.stringify(result));
    }

    if (subPath === '/next-sol-id') {
      return res.end(JSON.stringify({ next: getNextSolId(projectDir) }));
    }

    if (subPath === '/next-us-id') {
      const sol = params.get('sol');
      if (!sol) return res.end(JSON.stringify({ error: 'sol parameter required' }));
      return res.end(JSON.stringify({ next: getNextUSId(projectDir, sol) }));
    }

    if (subPath === '/set-status' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { file, status } = JSON.parse(body);
          if (!file || !status) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'file and status required' }));
          }
          const result = setRequirementStatus(projectDir, file, status);
          if (result.error) { res.statusCode = 400; }
          return res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (subPath === '/bc-summary') {
      const summary = getBCSummary(projectDir);
      return res.end(JSON.stringify({ summary }));
    }

    if (subPath === '/conversations' && req.method === 'GET') {
      return res.end(JSON.stringify(listConversations(projectDir)));
    }

    if (subPath === '/conversations' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const conv = JSON.parse(body);
          const result = saveConversation(projectDir, conv);
          return res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    const convMatch = subPath.match(/^\/conversations\/([^/]+)$/);
    if (convMatch && req.method === 'GET') {
      const conv = readConversation(projectDir, convMatch[1]);
      return res.end(JSON.stringify(conv || { error: 'not found' }));
    }

    // --- Feedback routes ---
    if (subPath === '/feedback' && req.method === 'GET') {
      return res.end(JSON.stringify(listFeedback(projectDir)));
    }

    if (subPath === '/feedback' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const fbk = JSON.parse(body);
          const result = saveFeedback(projectDir, fbk);
          return res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    const fbkMatch = subPath.match(/^\/feedback\/([^/]+)$/);
    if (fbkMatch && req.method === 'GET') {
      const fbk = readFeedbackItem(projectDir, fbkMatch[1]);
      return res.end(JSON.stringify(fbk || { error: 'not found' }));
    }
    if (fbkMatch && req.method === 'DELETE') {
      const ok = deleteFeedbackItem(projectDir, fbkMatch[1]);
      return res.end(JSON.stringify({ deleted: ok }));
    }
  }

  // Chat route (hub-level — not project-scoped)
  if (path === '/api/chat/config' && req.method === 'GET') {
    const cfg = loadLLMConfig();
    // Don't expose the actual key, just whether it's configured
    return res.end(JSON.stringify({ configured: cfg.configured, provider: cfg.provider, model: cfg.model }));
  }

  if (path === '/api/chat/send' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        if (!messages || !Array.isArray(messages)) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'messages array required' }));
        }
        const cfg = loadLLMConfig();
        if (!cfg.configured) {
          res.statusCode = 503;
          return res.end(JSON.stringify({ error: 'LLM not configured. Set api_key_env in _ARQITEKT/config/llm.yaml and the corresponding environment variable.' }));
        }
        const reply = await proxyLLMRequest(messages, cfg);
        return res.end(JSON.stringify({ content: reply }));
      } catch (err) {
        res.statusCode = 502;
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ==========================================================================
  //  GitHub Auth + Models API Routes
  // ==========================================================================

  if (path === '/api/github/status' && req.method === 'GET') {
    const token = loadGitHubToken();
    const user = getGitHubUser();
    return res.end(JSON.stringify({
      connected: !!token && !!user,
      user: user || null,
      models: GITHUB_MODELS,
    }));
  }

  if (path === '/api/github/connect' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { token } = JSON.parse(body);
        if (!token || typeof token !== 'string' || token.length < 10) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Valid token required' }));
        }
        const user = await validateGitHubToken(token);
        // Store token in env for this session
        process.env.ARQITEKT_GITHUB_TOKEN = token;
        saveGitHubTokenEnv('ARQITEKT_GITHUB_TOKEN');
        return res.end(JSON.stringify({ success: true, user, models: GITHUB_MODELS }));
      } catch (err) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token validation failed: ' + err.message }));
      }
    });
    return;
  }

  if (path === '/api/github/disconnect' && req.method === 'POST') {
    delete process.env.ARQITEKT_GITHUB_TOKEN;
    return res.end(JSON.stringify({ success: true }));
  }

  if (path === '/api/ai/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages, model, projectId } = JSON.parse(body);
        if (!messages || !Array.isArray(messages)) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'messages array required' }));
        }

        // Try GitHub Models API first
        const ghToken = loadGitHubToken();
        if (ghToken) {
          try {
            // Inject ARQITEKT system context
            const systemMsg = buildSystemPrompt(projectId);
            const fullMessages = systemMsg
              ? [{ role: 'system', content: systemMsg }, ...messages]
              : messages;
            const result = await proxyGitHubModels(fullMessages, model || 'gpt-4o', ghToken);
            return res.end(JSON.stringify(result));
          } catch (err) {
            // Fall through to legacy LLM
            console.error('GitHub Models error, falling back:', err.message);
          }
        }

        // Fallback to legacy LLM config
        const cfg = loadLLMConfig();
        if (!cfg.configured) {
          res.statusCode = 503;
          return res.end(JSON.stringify({ error: 'No AI provider configured. Connect your GitHub account or set up llm.yaml.' }));
        }
        const reply = await proxyLLMRequest(messages, cfg);
        return res.end(JSON.stringify({ content: reply }));
      } catch (err) {
        res.statusCode = 502;
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (path === '/api/ai/models' && req.method === 'GET') {
    const ghToken = loadGitHubToken();
    const legacyCfg = loadLLMConfig();
    const models = ghToken ? GITHUB_MODELS : [];
    if (legacyCfg.configured) {
      models.push({ id: legacyCfg.model, name: legacyCfg.model + ' (legacy)', provider: legacyCfg.provider || 'custom' });
    }
    return res.end(JSON.stringify({ models, hasGitHub: !!ghToken, hasLegacy: legacyCfg.configured }));
  }

  // ==========================================================================
  //  File System API (for Develop tab)
  // ==========================================================================

  const fileMatch = path.match(/^\/api\/projects\/(\d{3}_[^/]+)\/files(.*)$/);
  if (fileMatch) {
    const projectDir = getProjectDir(fileMatch[1]);
    if (!projectDir) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Project not found' })); }
    const subPath = params.get('path') || '';

    if (req.method === 'GET') {
      if (params.get('content') === 'true') {
        const content = readProjectFile(projectDir, subPath);
        if (content === null) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'File not found' })); }
        return res.end(JSON.stringify({ path: subPath, content }));
      }
      return res.end(JSON.stringify(listProjectFiles(projectDir, subPath)));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { path: fp, content } = JSON.parse(body);
          if (!fp) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'path required' })); }
          const result = writeProjectFile(projectDir, fp, content || '');
          if (result.error) { res.statusCode = 400; }
          return res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
  }

  // ==========================================================================
  //  Terminal API (for Develop tab — sandboxed command execution)
  // ==========================================================================
  const termMatch = path.match(/^\/api\/projects\/(\d{3}_[^/]+)\/terminal$/);
  if (termMatch && req.method === 'POST') {
    const projectDir = getProjectDir(termMatch[1]);
    if (!projectDir) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Project not found' })); }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        if (!command || typeof command !== 'string') {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'command required' }));
        }

        // Security: only allow safe commands
        const allowed = /^(npm|npx|node|git|dir|ls|cat|type|echo|pwd|cd|mkdir|tsc|eslint|prettier|jest|vitest|playwright|gradle|flutter|dart|python|pip)\b/i;
        const cmdTrimmed = command.trim();
        if (!allowed.test(cmdTrimmed)) {
          res.statusCode = 403;
          return res.end(JSON.stringify({ error: 'Command not allowed. Permitted: npm, npx, node, git, dir, ls, cat, type, tsc, eslint, jest, vitest...' }));
        }

        try {
          const output = execSync(cmdTrimmed, {
            cwd: projectDir,
            timeout: 30000,
            maxBuffer: 1024 * 512,
            encoding: 'utf-8',
            shell: true,
            env: { ...process.env, FORCE_COLOR: '0' },
          });
          return res.end(JSON.stringify({ stdout: output, stderr: '', exitCode: 0 }));
        } catch (execErr) {
          return res.end(JSON.stringify({
            stdout: execErr.stdout || '',
            stderr: execErr.stderr || execErr.message,
            exitCode: execErr.status || 1,
          }));
        }
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // ==========================================================================
  //  GitHub Repo Status API
  // ==========================================================================
  const ghRepoMatch = path.match(/^\/api\/projects\/(\d{3}_[^/]+)\/github\/status$/);
  if (ghRepoMatch && req.method === 'GET') {
    const token = loadGitHubToken();
    if (!token) { return res.end(JSON.stringify({ error: 'GitHub not connected' })); }
    const projectDir = getProjectDir(ghRepoMatch[1]);
    if (!projectDir) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Project not found' })); }
    const gh = (() => { try { const cfg = parseYaml(readFileSync(join(projectDir, 'config', 'project.yaml'), 'utf-8')); return cfg.github || {}; } catch { return {}; } })();
    const repo = gh.repo;
    if (!repo) { return res.end(JSON.stringify({ error: 'No GitHub repo configured for this project' })); }
    getGitHubRepoStatus(repo, token).then(status => {
      res.end(JSON.stringify(status));
    }).catch(err => {
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // --- Auto-Update: Check for updates ---
  if (path === '/api/hub/version' && req.method === 'GET') {
    checkHubUpdate().then(info => {
      res.end(JSON.stringify(info));
    }).catch(err => {
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // --- Auto-Update: Install update ---
  if (path === '/api/hub/update' && req.method === 'POST') {
    performHubUpdate().then(result => {
      res.end(JSON.stringify(result));
    }).catch(err => {
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  res.statusCode = 404;
  return res.end(JSON.stringify({ error: 'not found' }));
}

// Build context-aware system prompt for AI
function buildSystemPrompt(projectId) {
  if (!projectId) return 'You are ARQITEKT AI, a software architecture assistant. Help users design, plan, and develop software projects. Be precise and structured.';
  const projectDir = getProjectDir(projectId);
  if (!projectDir) return null;
  let prompt = 'You are ARQITEKT AI, embedded in the ARQITEKT development hub. ';
  prompt += 'You are working on project: ' + projectId + '. ';
  try {
    const bcPath = join(projectDir, 'requirements', '00_BUSINESS_CASE.md');
    if (existsSync(bcPath)) {
      const bc = readFileSync(bcPath, 'utf-8').slice(0, 2000);
      prompt += 'Business Case summary:\n' + bc + '\n\n';
    }
  } catch {}
  prompt += 'Help the user with requirements, architecture, code, and deployment. Be precise and action-oriented.';
  return prompt;
}

// --- Dashboard HTML ---

