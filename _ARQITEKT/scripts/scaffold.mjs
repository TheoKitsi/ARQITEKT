// ============================================================================
// ARQITEKT — Scaffold Generator
// ============================================================================
// Generates a deterministic Next.js 15 + React 19 + TypeScript project
// from the requirement tree. Maps: SOL→routes, US→pages, CMP→components, FN→functions.
//
// Usage: node scripts/scaffold.mjs <projectDir>
//   e.g.  node scripts/scaffold.mjs ../005_WEALTHPILOT
//
// Output: <projectDir>/app/  (complete Next.js project)
// ============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, cpSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HUB_ROOT = join(__dirname, '..');
const UI_CATALOGUE = join(HUB_ROOT, 'ui-catalogue');

// ============================================================================
// Frontmatter parser (same logic as dashboard.mjs)
// ============================================================================
function parseFrontmatter(md) {
  const clean = md.replace(/^\uFEFF/, '');
  const m = clean.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return fm;
}

// ============================================================================
// Requirement Tree Builder (duplicated for standalone usage)
// ============================================================================
function buildTree(projectDir) {
  const reqDir = join(projectDir, 'requirements');
  const dirs = {
    solutions: join(reqDir, 'solutions'),
    'user-stories': join(reqDir, 'user-stories'),
    components: join(reqDir, 'components'),
    functions: join(reqDir, 'functions'),
  };
  function getFiles(dir) {
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  }
  const bcPath = join(reqDir, '00_BUSINESS_CASE.md');
  let bcNode = null;
  if (existsSync(bcPath)) {
    const bcContent = readFileSync(bcPath, 'utf-8');
    const bcFm = parseFrontmatter(bcContent);
    const bcTitle = bcContent.match(/^#\s+(.+)$/m)?.[1] || '00_BUSINESS_CASE';
    bcNode = {
      id: bcFm.id || 'BC-1', title: bcTitle.replace(/^BC-\d+:\s*/, ''),
      status: bcFm.status || 'approved', type: 'business-case',
      file: relative(projectDir, bcPath).replace(/\\/g, '/'),
      content: bcContent, children: [],
    };
  }
  const sols = getFiles(dirs.solutions);
  const uss = getFiles(dirs['user-stories']);
  const cmps = getFiles(dirs.components);
  const fns = getFiles(dirs.functions);

  const solNodes = [];
  for (const solFile of sols) {
    const solNum = solFile.match(/SOL-(\d+)/)?.[1];
    const solPath = join(dirs.solutions, solFile);
    const solContent = readFileSync(solPath, 'utf-8');
    const solFm = parseFrontmatter(solContent);
    const solTitle = solContent.match(/^#\s+(.+)$/m)?.[1] || solFile;
    const solNode = {
      id: 'SOL-' + solNum, title: solTitle.replace(/^SOL-\d+:\s*/, ''),
      status: solFm.status || '?', type: 'solution',
      file: relative(projectDir, solPath).replace(/\\/g, '/'),
      content: solContent, children: [],
    };
    const solUS = uss.filter(u => u.match(new RegExp('^US-' + solNum + '\\.')));
    for (const usFile of solUS) {
      const usId = usFile.match(/US-(\d+\.\d+)/)?.[1];
      const usPath = join(dirs['user-stories'], usFile);
      const usContent = readFileSync(usPath, 'utf-8');
      const usFm = parseFrontmatter(usContent);
      const usTitle = usContent.match(/^#\s+(.+)$/m)?.[1] || usFile;
      const usNode = {
        id: 'US-' + usId, title: usTitle.replace(/^US-[\d.]+:\s*/, ''),
        status: usFm.status || '?', type: 'user-story',
        file: relative(projectDir, usPath).replace(/\\/g, '/'),
        content: usContent, children: [],
      };
      const usCMP = cmps.filter(c => c.match(new RegExp('^CMP-' + usId?.replace('.', '\\.') + '\\.')));
      for (const cmpFile of usCMP) {
        const cmpId = cmpFile.match(/CMP-(\d+\.\d+\.\d+)/)?.[1];
        const cmpPath = join(dirs.components, cmpFile);
        const cmpContent = readFileSync(cmpPath, 'utf-8');
        const cmpFm = parseFrontmatter(cmpContent);
        const cmpTitle = cmpContent.match(/^#\s+(.+)$/m)?.[1] || cmpFile;
        const cmpNode = {
          id: 'CMP-' + cmpId, title: cmpTitle.replace(/^CMP-[\d.]+:\s*/, ''),
          status: cmpFm.status || '?', type: 'component',
          file: relative(projectDir, cmpPath).replace(/\\/g, '/'),
          content: cmpContent, children: [],
        };
        const cmpFN = fns.filter(f => f.match(new RegExp('^FN-' + cmpId?.replace(/\./g, '\\.') + '\\.')));
        for (const fnFile of cmpFN) {
          const fnId = fnFile.match(/FN-(\d+\.\d+\.\d+\.\d+)/)?.[1];
          const fnPath = join(dirs.functions, fnFile);
          const fnContent = readFileSync(fnPath, 'utf-8');
          const fnFm = parseFrontmatter(fnContent);
          const fnTitle = fnContent.match(/^#\s+(.+)$/m)?.[1] || fnFile;
          cmpNode.children.push({
            id: 'FN-' + fnId, title: fnTitle.replace(/^FN-[\d.]+:\s*/, ''),
            status: fnFm.status || '?', type: 'function',
            file: relative(projectDir, fnPath).replace(/\\/g, '/'),
            content: fnContent,
          });
        }
        usNode.children.push(cmpNode);
      }
      solNode.children.push(usNode);
    }
    solNodes.push(solNode);
  }
  if (bcNode) { bcNode.children = solNodes; return [bcNode]; }
  return solNodes;
}

// ============================================================================
// ID → Safe slug converter
// ============================================================================
function slugify(id) {
  return id.toLowerCase().replace(/\./g, '-');
}

// ============================================================================
// Extract sections from markdown content
// ============================================================================
function extractSection(md, heading) {
  const re = new RegExp('^##\\s+' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'mi');
  const m = re.exec(md);
  if (!m) return '';
  const rest = md.slice(m.index + m[0].length);
  const nextH = rest.match(/^##\s/m);
  return (nextH ? rest.slice(0, nextH.index) : rest).trim();
}

// ============================================================================
// Smart component type detection from description
// ============================================================================
function detectComponentType(content) {
  const lower = (content || '').toLowerCase();
  if (/formular|form|eingabe|input|erfassung/.test(lower)) return 'form';
  if (/dashboard|übersicht|uebersicht|overview|statistik/.test(lower)) return 'dashboard';
  if (/dialog|modal|popup|overlay/.test(lower)) return 'modal';
  if (/chart|diagramm|visualisierung|graph|sankey|waterfall/.test(lower)) return 'chart';
  if (/tabelle|table|liste|list/.test(lower)) return 'table';
  if (/chat|conversation|nachricht|message/.test(lower)) return 'chat';
  if (/karte|map|standort|location/.test(lower)) return 'map';
  if (/profil|profile|benachrichtigung|notification/.test(lower)) return 'notification';
  return 'generic';
}

// ============================================================================
// Build Tokens CSS from ui-catalogue
// ============================================================================
function buildTokensCSS() {
  const tokensDir = join(UI_CATALOGUE, 'tokens');
  if (!existsSync(tokensDir)) return '/* No UI catalogue tokens found */\n:root {}\n';
  const files = ['colors.json', 'typography.json', 'spacing.json', 'radii.json', 'shadows.json'];
  let cssVars = [];
  function flatten(obj, prefix = '') {
    for (const [key, val] of Object.entries(obj)) {
      const name = prefix ? `${prefix}-${key}` : key;
      if (val && typeof val === 'object' && !val.value) {
        flatten(val, name);
      } else if (val && val.value) {
        cssVars.push(`  --${name}: ${val.value};`);
      }
    }
  }
  for (const f of files) {
    const fp = join(tokensDir, f);
    if (!existsSync(fp)) continue;
    try { flatten(JSON.parse(readFileSync(fp, 'utf-8'))); } catch {}
  }
  return `:root {\n${cssVars.join('\n')}\n}\n`;
}

// ============================================================================
// File Generation Templates
// ============================================================================

function genPackageJson(projectName) {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      next: '^15.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      typescript: '^5.6.0',
      '@types/node': '^22.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
    },
  }, null, 2) + '\n';
}

function genTsConfig() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2) + '\n';
}

function genNextConfig() {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
`;
}

function genGitignore() {
  return `node_modules/
.next/
out/
dist/
.env*.local
*.tsbuildinfo
next-env.d.ts
`;
}

function genGlobalsCSS() {
  return `@import './tokens.css';

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--typography-fontFamily-sans, 'Inter', -apple-system, sans-serif);
  background: var(--colors-surface-bg, #0d1117);
  color: var(--colors-text-primary, #e6edf3);
  line-height: var(--typography-lineHeight-normal, 1.6);
  -webkit-font-smoothing: antialiased;
}

a { color: var(--colors-brand-gold, #FFD700); text-decoration: none; }
a:hover { text-decoration: underline; }

code, pre {
  font-family: var(--typography-fontFamily-mono, 'JetBrains Mono', monospace);
  font-size: var(--typography-fontSize-sm, 13px);
}
`;
}

function genRootLayout(projectName, solNodes) {
  const navLinks = solNodes.map(sol => {
    const slug = slugify(sol.id);
    const title = sol.title.length > 30 ? sol.title.slice(0, 30) + '...' : sol.title;
    return `          <a href="/${slug}" className={styles.navLink}>${sol.id}: ${title.replace(/'/g, "\\'")}</a>`;
  }).join('\n');

  return `// @generated — ARQITEKT Scaffold
// Root Layout — ${projectName}
import type { Metadata } from 'next';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: '${projectName.replace(/'/g, "\\'")}',
  description: 'Generated by ARQITEKT Product Factory',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className={styles.header}>
          <h1 className={styles.logo}>${projectName.replace(/'/g, "\\'")}</h1>
          <nav className={styles.nav}>
${navLinks}
          </nav>
        </header>
        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}
`;
}

function genRootLayoutCSS() {
  return `.header {
  background: var(--colors-surface-bg2, #161b22);
  border-bottom: 1px solid var(--colors-border-default, #30363d);
  padding: 0 var(--spacing-6, 24px);
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--spacing-6, 24px);
}

.logo {
  font-size: var(--typography-fontSize-lg, 18px);
  font-weight: 700;
  color: var(--colors-brand-gold, #FFD700);
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: var(--spacing-4, 16px);
  overflow-x: auto;
}

.navLink {
  font-size: var(--typography-fontSize-sm, 13px);
  color: var(--colors-text-secondary, #8b949e);
  white-space: nowrap;
  transition: color 0.15s;
}

.navLink:hover {
  color: var(--colors-text-primary, #e6edf3);
  text-decoration: none;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6, 24px);
}
`;
}

function genLandingPage(bcNode) {
  const description = bcNode
    ? extractSection(bcNode.content, 'Vision') || extractSection(bcNode.content, '1. Vision') || bcNode.title
    : 'Willkommen';

  // Escape backticks and braces for JSX
  const safeDesc = description.replace(/`/g, "'").replace(/{/g, '(').replace(/}/g, ')').slice(0, 500);

  return `// @generated — ARQITEKT Scaffold
// Landing Page — from Business Case
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Willkommen</h1>
      <p className={styles.description}>
        ${safeDesc.split('\n').join('\n        ')}
      </p>
    </div>
  );
}
`;
}

function genLandingPageCSS() {
  return `.container {
  padding: var(--spacing-8, 32px) 0;
}

.title {
  font-size: var(--typography-fontSize-2xl, 28px);
  font-weight: 700;
  color: var(--colors-brand-gold, #FFD700);
  margin-bottom: var(--spacing-4, 16px);
}

.description {
  font-size: var(--typography-fontSize-base, 15px);
  color: var(--colors-text-secondary, #8b949e);
  max-width: 720px;
  line-height: var(--typography-lineHeight-relaxed, 1.8);
}
`;
}

function genSolLayout(sol) {
  const usLinks = (sol.children || []).map(us => {
    const slug = slugify(us.id);
    const title = us.title.length > 40 ? us.title.slice(0, 40) + '...' : us.title;
    return `          <a href="/${slugify(sol.id)}/${slug}" className={styles.link}>${us.id}: ${title.replace(/'/g, "\\'")}</a>`;
  }).join('\n');

  return `// @generated — ARQITEKT Scaffold
// Solution Layout: ${sol.id} — ${sol.title.replace(/'/g, "\\'")}
import styles from './layout.module.css';

export default function Sol${sol.id.replace(/\D/g, '')}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>${sol.id}: ${sol.title.replace(/'/g, "\\'").slice(0, 60)}</h2>
        <nav className={styles.nav}>
${usLinks}
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
`;
}

function genSolLayoutCSS() {
  return `.container {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--spacing-6, 24px);
  min-height: calc(100vh - 100px);
}

.sidebar {
  border-right: 1px solid var(--colors-border-default, #30363d);
  padding-right: var(--spacing-4, 16px);
}

.solTitle {
  font-size: var(--typography-fontSize-base, 15px);
  font-weight: 600;
  color: var(--colors-brand-gold, #FFD700);
  margin-bottom: var(--spacing-4, 16px);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2, 8px);
}

.link {
  font-size: var(--typography-fontSize-sm, 13px);
  color: var(--colors-text-secondary, #8b949e);
  transition: color 0.15s;
}

.link:hover {
  color: var(--colors-text-primary, #e6edf3);
  text-decoration: none;
}

.content {
  min-width: 0;
}
`;
}

function genSolIndexPage(sol) {
  return `// @generated — ARQITEKT Scaffold
// Solution Index: ${sol.id}
import styles from './page.module.css';

export default function Sol${sol.id.replace(/\D/g, '')}Page() {
  return (
    <div>
      <h1 className={styles.title}>${sol.id}: ${sol.title.replace(/'/g, "\\'").slice(0, 80)}</h1>
      <p className={styles.desc}>Waehle eine User Story aus dem Seitenmenü.</p>
    </div>
  );
}
`;
}

function genSolPageCSS() {
  return `.title {
  font-size: var(--typography-fontSize-xl, 22px);
  font-weight: 600;
  color: var(--colors-text-primary, #e6edf3);
  margin-bottom: var(--spacing-3, 12px);
}

.desc {
  color: var(--colors-text-secondary, #8b949e);
}
`;
}

function genUSPage(us, sol) {
  const cmpImports = (us.children || []).map(cmp => {
    const slug = slugify(cmp.id);
    const name = 'Cmp' + cmp.id.replace(/[.\-]/g, '_');
    return `import ${name} from '@/components/${slug}';`;
  }).join('\n');

  const cmpRenders = (us.children || []).map(cmp => {
    const name = 'Cmp' + cmp.id.replace(/[.\-]/g, '_');
    return `        <${name} />`;
  }).join('\n');

  // Extract acceptance criteria
  const ac = extractSection(us.content || '', 'Acceptance Criteria');
  const acLines = ac ? ac.split('\n').filter(l => l.trim().startsWith('- [')).map(l => '// ' + l.trim()).join('\n') : '';

  return `// @generated — ARQITEKT Scaffold
// Page: ${us.id} — ${us.title.replace(/'/g, "\\'")}
// Parent: ${sol.id}
${acLines ? '//\n// Acceptance Criteria:\n' + acLines + '\n' : ''}${cmpImports}
import styles from './page.module.css';

export default function US${us.id.replace(/[.\-]/g, '_')}Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>${us.id}: ${us.title.replace(/'/g, "\\'").slice(0, 80)}</h1>
      <div className={styles.components}>
${cmpRenders || '        <p>Keine Komponenten definiert.</p>'}
      </div>
    </div>
  );
}
`;
}

function genUSPageCSS() {
  return `.container {
  padding: var(--spacing-4, 16px) 0;
}

.title {
  font-size: var(--typography-fontSize-xl, 22px);
  font-weight: 600;
  color: var(--colors-text-primary, #e6edf3);
  margin-bottom: var(--spacing-6, 24px);
}

.components {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6, 24px);
}
`;
}

function genComponent(cmp, parentUS) {
  const type = detectComponentType(cmp.content);
  const name = 'Cmp' + cmp.id.replace(/[.\-]/g, '_');
  const fnImports = (cmp.children || []).map(fn => {
    const fnSlug = slugify(fn.id);
    const fnName = 'fn' + fn.id.replace(/[.\-]/g, '_');
    return `import { ${fnName} } from '@/lib/${fnSlug}';`;
  }).join('\n');

  // Extract description
  const desc = extractSection(cmp.content || '', 'Beschreibung') || extractSection(cmp.content || '', 'Description') || cmp.title;

  let body = '';
  switch (type) {
    case 'form':
      body = `      <form className={styles.form}>
        <p className={styles.todo}>TODO: Formularfelder implementieren</p>
        <button type="submit" className={styles.submitBtn}>Absenden</button>
      </form>`;
      break;
    case 'dashboard':
      body = `      <div className={styles.grid}>
        <p className={styles.todo}>TODO: Dashboard-Karten implementieren</p>
      </div>`;
      break;
    case 'table':
      body = `      <table className={styles.table}>
        <thead><tr><th>TODO</th></tr></thead>
        <tbody><tr><td>Tabellendaten implementieren</td></tr></tbody>
      </table>`;
      break;
    case 'chart':
      body = `      <div className={styles.chart}>
        <p className={styles.todo}>TODO: Diagramm implementieren</p>
      </div>`;
      break;
    case 'modal':
      body = `      <div className={styles.modal}>
        <p className={styles.todo}>TODO: Dialog-Inhalt implementieren</p>
      </div>`;
      break;
    case 'chat':
      body = `      <div className={styles.chat}>
        <p className={styles.todo}>TODO: Chat-Interface implementieren</p>
      </div>`;
      break;
    default:
      body = `      <div>
        <p className={styles.todo}>TODO: Komponente implementieren</p>
      </div>`;
  }

  return `// @generated — ARQITEKT Scaffold
// Component: ${cmp.id} — ${cmp.title.replace(/'/g, "\\'")}
// Type detected: ${type}
// Description: ${desc.replace(/\n/g, ' ').slice(0, 120).replace(/'/g, "\\'")}
${fnImports ? fnImports + '\n' : ''}'use client';

import styles from './${slugify(cmp.id)}.module.css';

export default function ${name}() {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>${cmp.title.replace(/'/g, "\\'").slice(0, 80)}</h3>
${body}
    </div>
  );
}
`;
}

function genComponentCSS(cmp) {
  const type = detectComponentType(cmp.content);
  let extra = '';
  switch (type) {
    case 'form':
      extra = `\n.form { display: flex; flex-direction: column; gap: var(--spacing-4, 16px); }
.submitBtn {
  background: var(--colors-brand-gold, #FFD700);
  color: var(--colors-brand-anthracite, #1F1F1F);
  border: none; border-radius: var(--radii-md, 8px);
  padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
  font-weight: 600; cursor: pointer;
}`;
      break;
    case 'dashboard':
      extra = '\n.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--spacing-4, 16px); }';
      break;
    case 'table':
      extra = '\n.table { width: 100%; border-collapse: collapse; }\n.table th, .table td { padding: var(--spacing-2, 8px); border-bottom: 1px solid var(--colors-border-default, #30363d); text-align: left; }';
      break;
    case 'chart':
      extra = '\n.chart { min-height: 300px; border: 1px dashed var(--colors-border-default, #30363d); border-radius: var(--radii-lg, 12px); display: flex; align-items: center; justify-content: center; }';
      break;
  }

  return `.container {
  background: var(--colors-surface-bg2, #161b22);
  border: 1px solid var(--colors-border-default, #30363d);
  border-radius: var(--radii-lg, 12px);
  padding: var(--spacing-5, 20px);
}

.heading {
  font-size: var(--typography-fontSize-base, 15px);
  font-weight: 600;
  color: var(--colors-text-primary, #e6edf3);
  margin-bottom: var(--spacing-4, 16px);
}

.todo {
  color: var(--colors-text-tertiary, #6e7681);
  font-style: italic;
}${extra}
`;
}

function genFunction(fn, parentCMP) {
  const name = 'fn' + fn.id.replace(/[.\-]/g, '_');
  // Extract functional requirement text
  const funcReq = extractSection(fn.content || '', 'Funktionale Anforderung') ||
                  extractSection(fn.content || '', 'Functional Requirement') ||
                  fn.title;
  const safeReq = funcReq.replace(/\n/g, '\n * ').slice(0, 400);

  return `// @generated — ARQITEKT Scaffold
// Function: ${fn.id} — ${fn.title.replace(/'/g, "\\'")}
// Parent: ${parentCMP.id}

/**
 * ${fn.title}
 *
 * ${safeReq}
 */
export function ${name}(...args: unknown[]): unknown {
  // TODO: Implement ${fn.id} — ${fn.title.replace(/'/g, "\\'")}
  throw new Error('Not implemented: ${fn.id}');
}
`;
}

// ============================================================================
// Main Scaffold Function
// ============================================================================
export function scaffold(projectDir) {
  const tree = buildTree(projectDir);
  const appDir = join(projectDir, 'app');
  const srcDir = join(appDir, 'src');
  let filesCreated = 0;

  function write(filePath, content) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
    filesCreated++;
  }

  // --- Read project config ---
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  let projectName = 'App';
  let branding = null;
  if (existsSync(cfgPath)) {
    const cfgRaw = readFileSync(cfgPath, 'utf-8');
    const lines = cfgRaw.split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*name:\s*"?([^"]+)"?\s*$/);
      if (m) { projectName = m[1].trim(); break; }
    }
    // Parse branding block
    try {
      const brandMatch = cfgRaw.match(/\nbranding:\n((?:  .+\n)*)/);
      if (brandMatch) {
        branding = {};
        for (const bLine of brandMatch[1].split('\n')) {
          const kv = bLine.match(/^\s+(\w+):\s*"?([^"]+)"?\s*$/);
          if (kv) branding[kv[1]] = kv[2].trim();
        }
      }
    } catch {}
  }

  // --- Determine BC and SOL nodes ---
  const bc = tree[0]?.type === 'business-case' ? tree[0] : null;
  const solNodes = bc ? (bc.children || []) : tree.filter(n => n.type === 'solution');

  // --- Root files ---
  write(join(appDir, 'package.json'), genPackageJson(projectName));
  write(join(appDir, 'tsconfig.json'), genTsConfig());
  write(join(appDir, 'next.config.mjs'), genNextConfig());
  write(join(appDir, '.gitignore'), genGitignore());

  // --- Styles ---
  let tokensCSS = buildTokensCSS();
  // Override tokens with project branding if set
  if (branding) {
    let overrides = '\n/* Project Branding Overrides */\n:root {\n';
    if (branding.primary) overrides += '  --color-brand-gold: ' + branding.primary + ';\n';
    if (branding.secondary) overrides += '  --color-brand-anthracite: ' + branding.secondary + ';\n';
    if (branding.font_heading) overrides += '  --font-sans: "' + branding.font_heading + '", -apple-system, sans-serif;\n';
    if (branding.font_mono) overrides += '  --font-mono: "' + branding.font_mono + '", monospace;\n';
    overrides += '}\n';
    tokensCSS += overrides;
  }
  write(join(srcDir, 'app', 'globals.css'), genGlobalsCSS());
  write(join(srcDir, 'styles', 'tokens.css'), tokensCSS);

  // --- Copy logo if specified ---
  if (branding?.logo) {
    const logoSrc = join(projectDir, branding.logo);
    if (existsSync(logoSrc)) {
      const logoDest = join(appDir, 'public', 'logo' + branding.logo.slice(branding.logo.lastIndexOf('.')));
      mkdirSync(dirname(logoDest), { recursive: true });
      cpSync(logoSrc, logoDest);
    }
  }

  // --- Copy UI catalogue templates (shared primitives) ---
  const templatesDir = join(UI_CATALOGUE, 'templates');
  if (existsSync(templatesDir)) {
    const uiDir = join(srcDir, 'components', 'ui');
    const tplFiles = readdirSync(templatesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.css'));
    for (const f of tplFiles) {
      write(join(uiDir, f), readFileSync(join(templatesDir, f), 'utf-8'));
    }
  }

  // --- Root layout + landing page ---
  write(join(srcDir, 'app', 'layout.tsx'), genRootLayout(projectName, solNodes));
  write(join(srcDir, 'app', 'layout.module.css'), genRootLayoutCSS());
  write(join(srcDir, 'app', 'page.tsx'), genLandingPage(bc));
  write(join(srcDir, 'app', 'page.module.css'), genLandingPageCSS());

  // --- Per-Solution route groups ---
  for (const sol of solNodes) {
    const solSlug = slugify(sol.id);
    const solDir = join(srcDir, 'app', solSlug);

    write(join(solDir, 'layout.tsx'), genSolLayout(sol));
    write(join(solDir, 'layout.module.css'), genSolLayoutCSS());
    write(join(solDir, 'page.tsx'), genSolIndexPage(sol));
    write(join(solDir, 'page.module.css'), genSolPageCSS());

    // --- Per-US pages ---
    for (const us of sol.children || []) {
      const usSlug = slugify(us.id);
      const usDir = join(solDir, usSlug);

      write(join(usDir, 'page.tsx'), genUSPage(us, sol));
      write(join(usDir, 'page.module.css'), genUSPageCSS());

      // --- Per-CMP components ---
      for (const cmp of us.children || []) {
        const cmpSlug = slugify(cmp.id);
        write(join(srcDir, 'components', cmpSlug + '.tsx'), genComponent(cmp, us));
        write(join(srcDir, 'components', cmpSlug + '.module.css'), genComponentCSS(cmp));

        // --- Per-FN functions ---
        for (const fn of cmp.children || []) {
          const fnSlug = slugify(fn.id);
          write(join(srcDir, 'lib', fnSlug + '.ts'), genFunction(fn, cmp));
        }
      }
    }
  }

  return { success: true, filesCreated, appDir };
}

// ============================================================================
// CLI entry point
// ============================================================================
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const projectDir = process.argv[2] ? resolve(process.argv[2]) : null;
  if (!projectDir || !existsSync(projectDir)) {
    console.error('Usage: node scripts/scaffold.mjs <projectDir>');
    process.exit(1);
  }
  console.log('Scaffolding Next.js app from requirements...');
  const result = scaffold(projectDir);
  console.log(`Done: ${result.filesCreated} files created in ${result.appDir}`);
}
