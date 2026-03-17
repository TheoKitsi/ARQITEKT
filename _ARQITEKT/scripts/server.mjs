// ============================================================================
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
  '.webmanifest': 'application/manifest+json',
};

function serveStatic(res, urlPath) {
  // Map / to /index.html
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  // Map /mobile to /mobile/index.html
  if (urlPath === '/mobile' || urlPath === '/mobile/') urlPath = '/mobile/index.html';

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
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname.startsWith('/api/')) return handleAPI(req, url, res);
  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log('');
  console.log(`  ARQITEKT Hub  ->  http://localhost:${PORT}`);
  console.log(`  Workspace: ${WORKSPACE_ROOT}`);
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
