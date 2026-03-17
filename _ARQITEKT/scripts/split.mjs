// ============================================================================
//  ARQITEKT — Monolith Splitter
//  Extracts dashboard.mjs into modular server + static client files
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SRC = join(__dirname, 'dashboard.mjs');
const raw = readFileSync(SRC, 'utf-8');
const lines = raw.split('\n');

// ============================================================================
//  1. Extract HTML template (lines between `return \`<!DOCTYPE...` and closing `\`;}`)
// ============================================================================
let htmlStart = -1, htmlEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return `<!DOCTYPE html>')) { htmlStart = i; }
  if (htmlStart > 0 && lines[i].trimEnd() === '</html>`;') { htmlEnd = i; break; }
}

if (htmlStart === -1 || htmlEnd === -1) {
  console.error('Could not find HTML template boundaries. htmlStart=' + htmlStart + ' htmlEnd=' + htmlEnd);
  process.exit(1);
}

// The template content (remove the `return \`` prefix and closing backtick+semicolon)
let htmlContent = lines.slice(htmlStart, htmlEnd + 1).join('\n');
htmlContent = htmlContent.replace(/^\s*return `/, ''); // Remove `return \``
htmlContent = htmlContent.replace(/`;$/, ''); // Remove closing `\`;`
console.log(`HTML template: lines ${htmlStart+1} to ${htmlEnd+1} (${htmlEnd - htmlStart} lines)`);

// ============================================================================
//  2. Split HTML into CSS, HTML structure, and JS
// ============================================================================
const styleStart = htmlContent.indexOf('<style>');
const styleEnd = htmlContent.indexOf('</style>');
const scriptStart = htmlContent.indexOf('<script>');
const scriptEnd = htmlContent.lastIndexOf('</script>');

const cssContent = htmlContent.slice(styleStart + '<style>'.length, styleEnd).trim();
const jsContent = htmlContent.slice(scriptStart + '<script>'.length, scriptEnd).trim();

// HTML is everything between </style></head><body> and <script>
const bodyStart = htmlContent.indexOf('<body>');
const htmlBody = htmlContent.slice(bodyStart, scriptStart).trim();

// Reconstruct index.html with external CSS/JS references
const htmlHead = htmlContent.slice(0, styleStart);
let indexHtml = htmlHead;
indexHtml += '<link rel="stylesheet" href="/css/style.css">\n';
indexHtml += '</head>\n';
indexHtml += htmlBody + '\n';
indexHtml += '<script src="/js/app.js"></script>\n';
indexHtml += '</body>\n</html>';

// ============================================================================
//  3. Extract server-side code
// ============================================================================
// Server code = lines 1 to getDashboardHTML function start
// Plus server setup at the end
const getDashboardLine = lines.findIndex(l => l.startsWith('function getDashboardHTML()'));
const serverLine = lines.findIndex(l => l.startsWith('// --- Server ---'));

// Service functions: everything from imports to handleAPI
const handleAPILine = lines.findIndex(l => l.startsWith('function handleAPI('));
const getProjectDirLine = lines.findIndex(l => l.startsWith('function getProjectDir('));

// services = lines 1 to getProjectDir+end (includes all helper functions)
const serviceCode = lines.slice(0, getProjectDirLine).join('\n');
const getProjectDirFunc = [];
for (let i = getProjectDirLine; i < handleAPILine; i++) {
  getProjectDirFunc.push(lines[i]);
}

// API routes = handleAPI function to getDashboardHTML
const apiCode = lines.slice(handleAPILine, getDashboardLine).join('\n');

// Server setup = after the template function to end
const serverSetupCode = lines.slice(serverLine).join('\n');

console.log(`Services: lines 1-${getProjectDirLine} (${getProjectDirLine} lines)`);
console.log(`getProjectDir: lines ${getProjectDirLine+1}-${handleAPILine} (${handleAPILine - getProjectDirLine} lines)`);
console.log(`API routes: lines ${handleAPILine+1}-${getDashboardLine} (${getDashboardLine - handleAPILine} lines)`);
console.log(`Server setup: lines ${serverLine+1}-${lines.length} (${lines.length - serverLine} lines)`);
console.log(`CSS: ${cssContent.split('\n').length} lines`);
console.log(`JS: ${jsContent.split('\n').length} lines`);

// ============================================================================
//  4. Write output files
// ============================================================================
const publicDir = join(__dirname, 'public');
mkdirSync(join(publicDir, 'css'), { recursive: true });
mkdirSync(join(publicDir, 'js'), { recursive: true });

writeFileSync(join(publicDir, 'index.html'), indexHtml, 'utf-8');
writeFileSync(join(publicDir, 'css', 'style.css'), cssContent, 'utf-8');
writeFileSync(join(publicDir, 'js', 'app.js'), jsContent, 'utf-8');

console.log('\nWrote:');
console.log('  public/index.html');
console.log('  public/css/style.css');
console.log('  public/js/app.js');

// ============================================================================
//  5. Write services.mjs (all business logic)
// ============================================================================
// We need to convert the inline code to a proper ES module with exports
// The original file uses Node.js imports at the top, which we keep
// We export all functions that routes.mjs needs

const importsEnd = lines.findIndex(l => l.startsWith('const PORT'));
const imports = lines.slice(0, importsEnd).join('\n');

// Find all function declarations in the service section
const serviceFunctions = [];
const svcLines = lines.slice(importsEnd, handleAPILine);
for (let i = 0; i < svcLines.length; i++) {
  const m = svcLines[i].match(/^function (\w+)\(/);
  if (m) serviceFunctions.push(m[1]);
}

let servicesContent = `// ============================================================================
//  ARQITEKT — Business Logic Services
// ============================================================================
${imports}

// --- Constants ---
export const PORT = 3333;
export const HUB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const WORKSPACE_ROOT = resolve(HUB_ROOT, '..');
export const TEMPLATE_DIR = join(HUB_ROOT, 'template');

// --- In-Memory State ---
export const buildingProjects = new Set();
export const runningApps = new Map();

`;

// Add all functions from service section, making them exported
for (let i = importsEnd; i < handleAPILine; i++) {
  let line = lines[i];
  // Skip the original constants (PORT, HUB_ROOT, etc.) — we've already declared them
  if (/^const (PORT|HUB_ROOT|WORKSPACE_ROOT|TEMPLATE_DIR)\b/.test(line)) continue;
  // Skip original in-memory state declarations
  if (/^const (buildingProjects|runningApps)\b/.test(line)) continue;
  // Export function declarations
  if (/^function \w+\(/.test(line)) {
    line = 'export ' + line;
  }
  servicesContent += line + '\n';
}

writeFileSync(join(__dirname, 'services.mjs'), servicesContent, 'utf-8');
console.log('  services.mjs (' + serviceFunctions.length + ' functions)');

// ============================================================================
//  6. Write routes.mjs (API route dispatcher)
// ============================================================================
let routesContent = `// ============================================================================
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
} from './services.mjs';

`;

// Add the handleAPI function and getProjectDir
routesContent += getProjectDirFunc.join('\n') + '\n\n';
routesContent += apiCode + '\n';
// Export handleAPI
routesContent = routesContent.replace('function handleAPI(', 'export function handleAPI(');
// Replace getProjectDir to use imported version
routesContent = routesContent.replace(/function getProjectDir\(projectId\) \{[\s\S]*?\n\}\n/, '');

writeFileSync(join(__dirname, 'routes.mjs'), routesContent, 'utf-8');
console.log('  routes.mjs');

// ============================================================================
//  7. Write server.mjs (entry point)
// ============================================================================
const serverContent = `// ============================================================================
//  ARQITEKT Hub — Server Entry Point
// ============================================================================
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { PORT, WORKSPACE_ROOT, runningApps } from './services.mjs';
import { handleAPI } from './routes.mjs';
import { execSync } from 'child_process';

const PUBLIC_DIR = join(import.meta.dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
};

function serveStatic(res, urlPath) {
  // Map / to /index.html
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = join(PUBLIC_DIR, urlPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filePath)) {
    // SPA fallback: serve index.html for non-API/non-file routes
    const indexPath = join(PUBLIC_DIR, 'index.html');
    if (existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(readFileSync(indexPath));
      return;
    }
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const ext = extname(filePath);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.end(readFileSync(filePath));
}

// --- HTTP Server ---
const server = createServer((req, res) => {
  const url = new URL(req.url, \`http://localhost:\${PORT}\`);
  if (url.pathname.startsWith('/api/')) return handleAPI(req, url, res);
  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log('');
  console.log(\`  ARQITEKT Hub  ->  http://localhost:\${PORT}\`);
  console.log(\`  Workspace: \${WORKSPACE_ROOT}\`);
  console.log('');
});

// --- Graceful Shutdown ---
function shutdownApps() {
  for (const [id, info] of runningApps) {
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /T /F /PID ' + info.pid, { encoding: 'utf-8', timeout: 5000 });
      } else {
        process.kill(-info.pid, 'SIGTERM');
      }
    } catch {}
  }
  runningApps.clear();
}
process.on('exit', shutdownApps);
process.on('SIGINT', () => { shutdownApps(); process.exit(0); });
process.on('SIGTERM', () => { shutdownApps(); process.exit(0); });
`;

writeFileSync(join(__dirname, 'server.mjs'), serverContent, 'utf-8');
console.log('  server.mjs');

console.log('\nDone! Run with: node _ARQITEKT/scripts/server.mjs');
