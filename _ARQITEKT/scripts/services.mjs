// ============================================================================
//  ARQITEKT — Business Logic Services
// ============================================================================
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, rmSync, cpSync, renameSync, unlinkSync } from 'fs';
import { join, basename, relative, resolve, dirname } from 'path';
import { exec } from 'child_process';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

// --- Constants ---
export const PORT = 3333;
const __dirname = fileURLToPath(new URL('.', import.meta.url));
export const HUB_ROOT = join(__dirname, '..');
export const WORKSPACE_ROOT = join(HUB_ROOT, '..');
export const TEMPLATE_DIR = join(HUB_ROOT, 'template');

// --- In-Memory State ---
export const buildingProjects = new Set();
export const runningApps = new Map();



// --- Helpers ---

export function getMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'templates') {
      files.push(...getMarkdownFiles(join(dir, entry.name)));
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('TREE')) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

export function parseFrontmatter(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    fm[key] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

export function parseYaml(content) {
  const result = {};
  let currentSection = null;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sectionMatch = trimmed.match(/^(\w[\w_-]*):\s*$/);
    if (sectionMatch) { currentSection = sectionMatch[1]; result[currentSection] = {}; continue; }
    if (currentSection) {
      const kvMatch = trimmed.match(/^(\w[\w_-]*):\s*(.+)/);
      if (kvMatch) { let v = kvMatch[2].replace(/^["']|["']$/g, ''); result[currentSection][kvMatch[1]] = (v !== '' && !isNaN(v)) ? Number(v) : v; }
      const listMatch = trimmed.match(/^-\s+(.+)/);
      if (listMatch) {
        if (!Array.isArray(result[currentSection])) result[currentSection] = [];
        result[currentSection].push(listMatch[1]);
      }
    }
  }
  return result;
}

// --- YAML Update Helper ---

export function upsertYamlField(filePath, section, key, value) {
  if (!existsSync(filePath)) return;
  let content = readFileSync(filePath, 'utf-8');
  const safeVal = typeof value === 'string' ? '"' + value.replace(/"/g, '\\"') + '"' : String(value);
  const lineRegex = new RegExp('^(\\s*' + key + ':\\s*).+$', 'm');
  // Try to find the key within its section
  const sectionRegex = new RegExp('^' + section + ':\\s*$', 'm');
  const sectionMatch = sectionRegex.exec(content);
  if (sectionMatch) {
    // Find the key after the section header
    const afterSection = content.slice(sectionMatch.index + sectionMatch[0].length);
    const keyInSection = afterSection.match(new RegExp('^(\\s+' + key + ':\\s*).+$', 'm'));
    if (keyInSection) {
      // Replace existing value
      const fullIdx = sectionMatch.index + sectionMatch[0].length + keyInSection.index;
      content = content.slice(0, fullIdx) + keyInSection[1] + safeVal + content.slice(fullIdx + keyInSection[0].length);
    } else {
      // Append key after section header
      const insertPos = sectionMatch.index + sectionMatch[0].length;
      content = content.slice(0, insertPos) + '\n  ' + key + ': ' + safeVal + content.slice(insertPos);
    }
  } else {
    // Append new section + key at end
    content = content.trimEnd() + '\n\n' + section + ':\n  ' + key + ': ' + safeVal + '\n';
  }
  writeFileSync(filePath, content, 'utf-8');
}

export function getLifecycle(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return 'planning';
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    return cfg.lifecycle?.state || 'planning';
  } catch { return 'planning'; }
}

export function setLifecycle(projectDir, state) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return;
  upsertYamlField(cfgPath, 'lifecycle', 'state', state);
}

// --- Readiness Computation ---

export function computeReadiness(projectDir) {
  const tree = buildTree(projectDir);
  let total = 0, approved = 0;
  function walk(node) {
    total++;
    const s = (node.status || '').toLowerCase();
    if (s === 'approved' || s === 'implemented') approved++;
    for (const ch of node.children || []) walk(ch);
  }
  for (const n of tree) walk(n);

  // Include cross-cutting entities (INF, ADR, NTF)
  const reqDir = join(projectDir, 'requirements');
  for (const sub of ['infrastructure', 'adrs', 'notifications']) {
    const d = join(reqDir, sub);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d).filter(f => f.endsWith('.md'))) {
      total++;
      const fm = parseFrontmatter(readFileSync(join(d, f), 'utf8'));
      const s = (fm.status || '').toLowerCase();
      if (s === 'approved' || s === 'implemented') approved++;
    }
  }

  const approvedPct = total === 0 ? 0 : Math.round((approved / total) * 100);
  const validation = runValidate(projectDir);
  const validationOk = validation.success && !validation.output.includes('Error');
  // Configurable threshold (default 100)
  const threshold = getReadinessThreshold(projectDir);
  return { approvedPct, total, approved, validationOk, threshold, isReady: approvedPct >= threshold && validationOk };
}

export function getReadinessThreshold(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return 100;
  try {
    const raw = readFileSync(cfgPath, 'utf-8');
    const m = raw.match(/readiness_threshold:\s*(\d+)/);
    return m ? Math.min(100, Math.max(0, parseInt(m[1]))) : 100;
  } catch { return 100; }
}

// --- Authored Computation (content completeness by metamodel depth) ---

export function computeAuthored(projectDir) {
  const reqDir = join(projectDir, 'requirements');
  const bcPath = join(reqDir, '00_BUSINESS_CASE.md');
  const solDir = join(reqDir, 'solutions');
  const usDir = join(reqDir, 'user-stories');
  const cmpDir = join(reqDir, 'components');
  const fnDir = join(reqDir, 'functions');

  const hasBc = existsSync(bcPath);
  const sols = existsSync(solDir) ? readdirSync(solDir).filter(f => f.endsWith('.md')) : [];
  const uss = existsSync(usDir) ? readdirSync(usDir).filter(f => f.endsWith('.md')) : [];
  const cmps = existsSync(cmpDir) ? readdirSync(cmpDir).filter(f => f.endsWith('.md')) : [];
  const fns = existsSync(fnDir) ? readdirSync(fnDir).filter(f => f.endsWith('.md')) : [];

  // Level 1: BC exists → 20%
  const bcScore = hasBc ? 1 : 0;

  // Level 2: At least 1 SOL → 20%
  const solScore = sols.length > 0 ? 1 : 0;

  // Level 3: Each SOL has ≥1 US → proportion of SOLs covered
  let usScore = 0;
  if (sols.length > 0) {
    let covered = 0;
    for (const sf of sols) {
      const solNum = sf.match(/SOL-(\d+)/)?.[1];
      if (solNum && uss.some(u => u.startsWith('US-' + solNum + '.'))) covered++;
    }
    usScore = covered / sols.length;
  }

  // Level 4: Each US has ≥1 CMP → proportion of USs covered
  let cmpScore = 0;
  if (uss.length > 0) {
    let covered = 0;
    for (const uf of uss) {
      const usId = uf.match(/US-(\d+\.\d+)/)?.[1];
      if (usId && cmps.some(c => c.startsWith('CMP-' + usId + '.'))) covered++;
    }
    cmpScore = covered / uss.length;
  }

  // Level 5: Each CMP has ≥1 FN → proportion of CMPs covered
  let fnScore = 0;
  if (cmps.length > 0) {
    let covered = 0;
    for (const cf of cmps) {
      const cmpId = cf.match(/CMP-(\d+\.\d+\.\d+)/)?.[1];
      if (cmpId && fns.some(f => f.startsWith('FN-' + cmpId + '.'))) covered++;
    }
    fnScore = covered / cmps.length;
  }

  const authoredPct = Math.round(((bcScore + solScore + usScore + cmpScore + fnScore) / 5) * 100);
  return { authoredPct, levels: { bc: bcScore, sol: solScore, us: usScore, cmp: cmpScore, fn: fnScore } };
}

export function getProjectTags(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return [];
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    if (Array.isArray(cfg.tags)) return cfg.tags.map(t => String(t).trim()).filter(Boolean);
  } catch {}
  return [];
}

export function writeTagsToYaml(projectDir, tags) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return;
  let raw = readFileSync(cfgPath, 'utf-8');
  // Remove existing tags block
  raw = raw.replace(/\ntags:\n(?:  - .+\n)*/g, '');
  raw = raw.replace(/\ntags: \[.*\]\n?/g, '');
  // Append new tags block
  if (tags.length > 0) {
    let block = '\ntags:\n';
    for (const t of tags) block += '  - ' + t + '\n';
    raw = raw.trimEnd() + '\n' + block;
  }
  writeFileSync(cfgPath, raw, 'utf-8');
}

export function getProjectBranding(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return null;
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    return cfg.branding || null;
  } catch { return null; }
}

export function getProjectGithub(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return null;
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    const gh = cfg.github;
    if (!gh) return null;
    const result = { repo: gh.repo || '', url: gh.url || '', path: gh.path || '' };
    // Build monorepo-aware URL
    if (result.repo && result.path && !result.url) {
      result.url = 'https://github.com/' + result.repo + '/tree/main/' + result.path;
    } else if (result.repo && !result.url) {
      result.url = 'https://github.com/' + result.repo;
    }
    return (result.repo || result.url) ? result : null;
  } catch { return null; }
}

export function autoTagFromBC(projectDir) {
  const bcPath = join(projectDir, 'requirements', '00_BUSINESS_CASE.md');
  if (!existsSync(bcPath)) return [];
  const content = readFileSync(bcPath, 'utf-8').toLowerCase();
  const tagRules = [
    { patterns: [/\bgaming\b/, /\bmultiplayer\b/, /\bgame\b/], tag: 'game' },
    { patterns: [/\bapi\b/, /\bendpoint\b/, /\brest api\b/, /\bgraphql\b/, /\bwebhook\b/], tag: 'api' },
    { patterns: [/\btool\b/, /\butility\b/, /\bwerkzeug\b/, /\bautomatisierung\b/], tag: 'tool' },
    { patterns: [/\bsaas\b/, /\bb2b\b/, /\bsubscription\b/], tag: 'saas' },
    { patterns: [/\bmobile app\b/, /\bios\b/, /\bandroid\b/, /\breact native\b/], tag: 'mobile' },
    { patterns: [/\bki\b/, /\bartificial intelligence\b/, /\bmachine learning\b/, /\bllm\b/, /\bneural\b/, /\bgemini\b/, /\bgpt\b/], tag: 'ai' },
    { patterns: [/\bdating\b/, /\bsocial\b/, /\bcommunity\b/, /\bchat\b/, /\bmatching\b/], tag: 'social' },
    { patterns: [/\bfinanz\b/, /\bfinance\b/, /\bbank\b/, /\binvestment\b/, /\bportfolio\b/, /\bwealth\b/], tag: 'finance' },
    { patterns: [/\bimmobilie\b/, /\breal estate\b/, /\bmiete\b/, /\bwohnung\b/, /\btenant\b/, /\bvermieter\b/], tag: 'real-estate' },
    { patterns: [/\bverification\b/, /\bidentity\b/, /\bverifizierung\b/, /\bkyc\b/], tag: 'verification' },
  ];
  const tags = [];
  for (const rule of tagRules) {
    if (rule.patterns.some(re => re.test(content))) tags.push(rule.tag);
  }
  return tags;
}

// In-memory mutex for build operations
// In-memory running app processes

// --- Project Discovery ---

export function listProjects() {
  if (!existsSync(WORKSPACE_ROOT)) return [];
  return readdirSync(WORKSPACE_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d{3}_/.test(d.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(d => {
      const dir = join(WORKSPACE_ROOT, d.name);
      const reqDir = join(dir, 'requirements');
      const cfgPath = join(dir, 'config', 'project.yaml');
      let name = d.name.replace(/^\d{3}_/, '');
      let codename = name;
      let description = '';
      if (existsSync(cfgPath)) {
        try {
          const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
          if (cfg.project?.name) name = cfg.project.name;
          if (cfg.project?.codename) codename = cfg.project.codename;
          if (cfg.project?.description) description = cfg.project.description;
        } catch {}
      }
      const stats = getStats(reqDir);
      const lifecycle = getLifecycle(dir);
      // Lightweight readiness: count statuses from tree + cross-cutting
      let readiness = null;
      try {
        const tree = buildTree(dir);
        let total = 0, approvedCount = 0;
        function walkR(node) { total++; const s = (node.status||'').toLowerCase(); if (s==='approved'||s==='implemented') approvedCount++; for (const ch of node.children||[]) walkR(ch); }
        for (const n of tree) walkR(n);
        for (const sub of ['infrastructure', 'adrs', 'notifications']) {
          const ccDir = join(reqDir, sub);
          if (!existsSync(ccDir)) continue;
          for (const f of readdirSync(ccDir).filter(f => f.endsWith('.md'))) {
            total++;
            const fm = parseFrontmatter(readFileSync(join(ccDir, f), 'utf8'));
            const s = (fm.status || '').toLowerCase();
            if (s === 'approved' || s === 'implemented') approvedCount++;
          }
        }
        readiness = { approvedPct: total === 0 ? 0 : Math.round((approvedCount / total) * 100), total, approved: approvedCount };
      } catch {}
      // Check for running app
      const appInfo = runningApps.get(d.name);
      const appRunning = !!appInfo;
      const appPort = appInfo?.port || null;
      // Tags + branding + github
      const tags = getProjectTags(dir);
      const branding = getProjectBranding(dir);
      const github = getProjectGithub(dir);
      // App existence
      const hasApp = existsSync(join(dir, 'app', 'package.json'));
      // App type detection
      let appType = '';
      try { const cfg = parseYaml(readFileSync(join(dir, 'config', 'project.yaml'), 'utf-8')); appType = cfg.app?.type || ''; } catch {}
      // Store config
      let store = {};
      try { const cfg = parseYaml(readFileSync(join(dir, 'config', 'project.yaml'), 'utf-8')); store = cfg.store || {}; } catch {}
      // Authored completeness (metamodel depth coverage)
      let authored = { authoredPct: 0 };
      try { authored = computeAuthored(dir); } catch {}
      // Review status detection
      let reviewStatus = 'none';
      try {
        const hasRemediation = existsSync(join(dir, 'REMEDIATION_LOG.md'));
        const hasReviewReport = existsSync(join(dir, 'requirements', 'REVIEW_REPORT.md'));
        if (hasRemediation) reviewStatus = 'remediation';
        else if (hasReviewReport) reviewStatus = 'reviewed';
      } catch {}
      return { id: d.name, name, codename, description, dir, stats, lifecycle, readiness, authored, appRunning, appPort, tags, branding, github, hasApp, appType, store, reviewStatus };
    });
}

export function getNextProjectNumber() {
  const projects = listProjects();
  if (!projects.length) return '001';
  const max = Math.max(...projects.map(p => parseInt(p.id.slice(0, 3))));
  return String(max + 1).padStart(3, '0');
}

// --- Per-Project Functions ---

export function getStats(reqDir) {
  const dirs = {
    solutions: join(reqDir, 'solutions'),
    'user-stories': join(reqDir, 'user-stories'),
    components: join(reqDir, 'components'),
    functions: join(reqDir, 'functions'),
    conversations: join(reqDir, 'conversations'),
    feedback: join(reqDir, 'feedback'),
    infrastructure: join(reqDir, 'infrastructure'),
    notifications: join(reqDir, 'notifications'),
    adrs: join(reqDir, 'adrs'),
  };
  const stats = {};
  for (const [key, dir] of Object.entries(dirs)) {
    stats[key] = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.md')).length : 0;
  }
  const bcPath = join(reqDir, '00_BUSINESS_CASE.md');
  stats['business-case'] = existsSync(bcPath) ? 1 : 0;
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  return stats;
}

export function buildTree(projectDir) {
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
      id: bcFm.id || 'BC-1',
      title: bcTitle.replace(/^BC-\d+:\s*/, ''),
      status: bcFm.status || 'approved',
      type: 'business-case',
      file: relative(projectDir, bcPath).replace(/\\/g, '/'),
      children: [],
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
      file: relative(projectDir, solPath).replace(/\\/g, '/'), children: [],
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
        file: relative(projectDir, usPath).replace(/\\/g, '/'), children: [],
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
          file: relative(projectDir, cmpPath).replace(/\\/g, '/'), children: [],
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

export function getSolutionList(projectDir) {
  const dir = join(projectDir, 'requirements', 'solutions');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const fm = parseFrontmatter(content);
    const title = content.match(/^#\s+(.+)$/m)?.[1] || f;
    return { id: fm.id || f.replace('.md', ''), title: title.replace(/^SOL-\d+:\s*/, '') };
  });
}

export function runValidate(projectDir) {
  try {
    const output = execSync('node scripts/validate.mjs', { cwd: projectDir, encoding: 'utf-8', timeout: 30000 });
    return { success: true, output };
  } catch (err) {
    return { success: false, output: err.stdout || err.message };
  }
}

export function readRequirement(projectDir, id) {
  const reqDir = join(projectDir, 'requirements');
  if (id.toUpperCase().startsWith('BC')) {
    const bcPath = join(reqDir, '00_BUSINESS_CASE.md');
    if (existsSync(bcPath)) {
      const content = readFileSync(bcPath, 'utf-8');
      return { file: relative(projectDir, bcPath).replace(/\\/g, '/'), content, frontmatter: parseFrontmatter(content) };
    }
  }
  const files = getMarkdownFiles(reqDir);
  const q = id.toUpperCase().trim();
  for (const f of files) {
    if (basename(f, '.md').toUpperCase().startsWith(q)) {
      const content = readFileSync(f, 'utf-8');
      return { file: relative(projectDir, f).replace(/\\/g, '/'), content, frontmatter: parseFrontmatter(content) };
    }
  }
  return null;
}

export function searchRequirements(projectDir, query) {
  const files = getMarkdownFiles(join(projectDir, 'requirements'));
  const q = query.toLowerCase();
  return files
    .filter(f => {
      const name = basename(f).toLowerCase();
      const content = readFileSync(f, 'utf-8').toLowerCase();
      return name.includes(q) || content.includes(q);
    })
    .slice(0, 30)
    .map(f => ({
      file: relative(projectDir, f).replace(/\\/g, '/'),
      name: basename(f, '.md'),
      ...parseFrontmatter(readFileSync(f, 'utf-8')),
    }));
}

export function createProject(name, description) {
  const codename = name.normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const num = getNextProjectNumber();
  const folderId = `${num}_${codename}`;
  const projectDir = join(WORKSPACE_ROOT, folderId);

  if (existsSync(projectDir)) return { error: 'Project already exists' };
  if (!existsSync(TEMPLATE_DIR)) return { error: 'Template folder not found' };

  cpSync(TEMPLATE_DIR, projectDir, { recursive: true });

  // Replace placeholders in project.yaml
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (existsSync(cfgPath)) {
    let cfg = readFileSync(cfgPath, 'utf-8');
    const today = new Date().toISOString().slice(0, 10);
    cfg = cfg.replace(/\{\{PROJECT_NAME\}\}/g, name);
    cfg = cfg.replace(/\{\{PROJECT_CODENAME\}\}/g, codename);
    cfg = cfg.replace(/\{\{PROJECT_DESCRIPTION\}\}/g, description || '');
    cfg = cfg.replace(/\{\{DATE\}\}/g, today);
    writeFileSync(cfgPath, cfg);
  }

  // Replace placeholders in package.json
  const pkgPath = join(projectDir, 'package.json');
  if (existsSync(pkgPath)) {
    let pkg = readFileSync(pkgPath, 'utf-8');
    pkg = pkg.replace(/\{\{PROJECT_NAME\}\}/g, name);
    pkg = pkg.replace(/\{\{PROJECT_CODENAME_LOWER\}\}/g, codename.toLowerCase());
    writeFileSync(pkgPath, pkg);
  }

  // Replace placeholders in README.md
  const rdmPath = join(projectDir, 'README.md');
  if (existsSync(rdmPath)) {
    let rdm = readFileSync(rdmPath, 'utf-8');
    rdm = rdm.replace(/\{\{PROJECT_NAME\}\}/g, name);
    writeFileSync(rdmPath, rdm);
  }

  return { id: folderId, name, codename, description: description || '' };
}

export function deleteProject(projectId) {
  if (!/^\d{3}_/.test(projectId)) return { error: 'Invalid project ID' };
  const projectDir = join(WORKSPACE_ROOT, projectId);
  if (!existsSync(projectDir)) return { error: 'Project not found' };
  rmSync(projectDir, { recursive: true, force: true });
  return { success: true };
}

export function renameProject(projectId, newName) {
  if (!/^\d{3}_/.test(projectId)) return { error: 'Invalid project ID' };
  const projectDir = join(WORKSPACE_ROOT, projectId);
  if (!existsSync(projectDir)) return { error: 'Project not found' };
  if (!newName || !newName.trim()) return { error: 'Name required' };

  const num = projectId.slice(0, 3);
  const newCodename = newName.trim().normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const newFolderId = `${num}_${newCodename}`;
  const newDir = join(WORKSPACE_ROOT, newFolderId);

  if (newFolderId !== projectId && existsSync(newDir)) return { error: 'A project with that name already exists' };

  // Update project.yaml
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (existsSync(cfgPath)) {
    let cfg = readFileSync(cfgPath, 'utf-8');
    cfg = cfg.replace(/^(\s*name:\s*)"[^"]*"/m, `$1"${newName.trim()}"`);
    cfg = cfg.replace(/^(\s*codename:\s*)"[^"]*"/m, `$1"${newCodename}"`);
    writeFileSync(cfgPath, cfg);
  }

  // Update README.md title if present
  const rdmPath = join(projectDir, 'README.md');
  if (existsSync(rdmPath)) {
    let rdm = readFileSync(rdmPath, 'utf-8');
    rdm = rdm.replace(/^# .+$/m, `# ${newName.trim()}`);
    writeFileSync(rdmPath, rdm);
  }

  // Rename folder
  if (newFolderId !== projectId) {
    renameSync(projectDir, newDir);
  }

  return { id: newFolderId, name: newName.trim(), codename: newCodename };
}

export function updateProjectMeta(projectId, fields) {
  if (!/^\d{3}_/.test(projectId)) return { error: 'Invalid project ID' };
  const projectDir = join(WORKSPACE_ROOT, projectId);
  if (!existsSync(projectDir)) return { error: 'Project not found' };

  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return { error: 'project.yaml not found' };

  let cfg = readFileSync(cfgPath, 'utf-8');

  if (fields.description !== undefined) {
    const safeDesc = fields.description.replace(/"/g, "'");
    cfg = cfg.replace(/^(\s*description:\s*)".*?"/m, `$1"${safeDesc}"`);
    if (!/^\s*description:/m.test(cfg)) {
      cfg = cfg.replace(/^(\s*name:.*$)/m, `$1\n  description: "${safeDesc}"`);
    }
  }

  writeFileSync(cfgPath, cfg);
  return { success: true };
}

export function openInVSCode(projectId) {
  const projectDir = join(WORKSPACE_ROOT, projectId);
  if (!existsSync(projectDir)) return { error: 'Projekt nicht gefunden' };
  exec(`code "${projectDir}"`);
  return { success: true };
}

// --- Per-SOL Analysis ---

export function analyzeSOL(sol) {
  const us = (sol.children || []).length;
  let cmp = 0, fn = 0;
  const statusCounts = { draft: 0, review: 0, approved: 0, implemented: 0, idea: 0, other: 0 };
  function countStatuses(n) {
    const s = (n.status || '').toLowerCase();
    if (statusCounts[s] !== undefined) statusCounts[s]++; else statusCounts.other++;
    for (const ch of n.children || []) countStatuses(ch);
  }
  countStatuses(sol);
  for (const u of sol.children || []) {
    cmp += (u.children || []).length;
    for (const c of u.children || []) fn += (c.children || []).length;
  }
  let status, nextAction, nextPrompt;
  if (us === 0) {
    status = 'needs-us';
    nextAction = 'Generate User Stories';
    nextPrompt = '@architect Generate all User Stories for ' + sol.id;
  } else if (cmp === 0) {
    status = 'needs-cmp';
    nextAction = 'Derive Components';
    nextPrompt = '@architect Derive Components from the User Stories of ' + sol.id;
  } else if (fn === 0) {
    status = 'needs-fn';
    nextAction = 'Generate Functions';
    nextPrompt = '@architect Generate all Functions for the Components of ' + sol.id;
  } else {
    // SOL is reviewed if it (and its user stories) are approved/implemented — CMP/FN may stay at draft
    const solApproved = sol.status === 'approved' || sol.status === 'implemented';
    const usAllApproved = (sol.children || []).every(u => u.status === 'approved' || u.status === 'implemented');
    if (solApproved && usAllApproved) {
      status = 'reviewed';
      nextAction = null;
      nextPrompt = null;
    } else {
      status = 'complete';
      nextAction = 'Start Review';
      nextPrompt = '@review Review all requirements of ' + sol.id + ' for consistency and completeness';
    }
  }
  const total = 1 + us + cmp + fn;
  const dots = [true, us > 0, cmp > 0, fn > 0, status === 'reviewed'];
  return { id: sol.id, title: sol.title, status, nextAction, nextPrompt, us, cmp, fn, dots, solStatus: sol.status, statusCounts, total };
}

export function checkAllApproved(node) {
  if (node.status && node.status !== 'approved' && node.status !== 'implemented') return false;
  for (const ch of node.children || []) { if (!checkAllApproved(ch)) return false; }
  return true;
}

export function getNextSolId(projectDir) {
  const dir = join(projectDir, 'requirements', 'solutions');
  if (!existsSync(dir)) return 1;
  const files = readdirSync(dir).filter(f => f.endsWith('.md'));
  let max = 0;
  for (const f of files) {
    const m = f.match(/SOL-(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1]));
  }
  return max + 1;
}

export function getNextUSId(projectDir, solNum) {
  const dir = join(projectDir, 'requirements', 'user-stories');
  if (!existsSync(dir)) return 1;
  const re = new RegExp('^US-' + solNum + '\\.(\\d+)');
  const files = readdirSync(dir).filter(f => f.endsWith('.md'));
  let max = 0;
  for (const f of files) {
    const m = f.match(re);
    if (m) max = Math.max(max, parseInt(m[1]));
  }
  return max + 1;
}

const STATUS_TRANSITIONS = {
  idea: ['draft'],
  draft: ['review', 'idea'],
  review: ['approved', 'draft'],
  approved: ['implemented', 'review'],
  implemented: ['approved'],
};

export function setRequirementStatus(projectDir, filePath, newStatus) {
  // Security: validate status is clean alphanumeric
  if (!/^[a-z]+$/.test(newStatus)) return { error: 'Invalid status format' };
  const absPath = join(projectDir, filePath);
  // Security: prevent path traversal
  if (!resolve(absPath).startsWith(resolve(projectDir))) return { error: 'Invalid path' };
  if (!existsSync(absPath)) return { error: 'File not found' };
  let content = readFileSync(absPath, 'utf-8');
  const fm = parseFrontmatter(content);
  const oldStatus = fm.status || 'draft';
  const allowed = STATUS_TRANSITIONS[oldStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    return { error: 'Invalid transition: ' + oldStatus + ' → ' + newStatus + '. Allowed: ' + (allowed || []).join(', ') };
  }
  content = content.replace(/^(status:\s*).+$/m, '$1' + newStatus);
  writeFileSync(absPath, content, 'utf-8');
  return { success: true, oldStatus, newStatus };
}

export function getBCSummary(projectDir) {
  const bcPath = join(projectDir, 'requirements', '00_BUSINESS_CASE.md');
  if (!existsSync(bcPath)) return null;
  const content = readFileSync(bcPath, 'utf-8');
  // Extract first ~500 chars after frontmatter as summary
  const body = content.replace(/^---[\s\S]*?---/, '').trim();
  const lines = body.split('\n').slice(0, 20);
  return lines.join('\n').slice(0, 800);
}

// --- LLM Config ---

export function loadLLMConfig() {
  // Check hub-level config first, then project-level
  const hubCfg = join(HUB_ROOT, 'config', 'llm.yaml');
  if (existsSync(hubCfg)) {
    try {
      const raw = readFileSync(hubCfg, 'utf-8');
      const cfg = parseYaml(raw);
      if (cfg.llm) {
        const apiKey = cfg.llm.api_key_env ? process.env[cfg.llm.api_key_env] : null;
        return { ...cfg.llm, api_key: apiKey, configured: !!apiKey };
      }
    } catch {}
  }
  return { configured: false };
}

export function proxyLLMRequest(messages, config) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.endpoint);
    const payload = JSON.stringify({
      model: config.model,
      messages,
      temperature: parseFloat(config.temperature) || 0.7,
      max_tokens: parseInt(config.max_tokens) || 4096,
      stream: false,
    });
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (config.api_key || ''),
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message || JSON.stringify(json.error)));
          const content = json.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) { reject(new Error('LLM response parse error: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('LLM request timeout')); });
    req.write(payload);
    req.end();
  });
}

// --- Conversation Persistence ---

export function listConversations(projectDir) {
  const dir = join(projectDir, 'requirements', 'conversations');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const fm = parseFrontmatter(content);
    return { file: f, ...fm };
  });
}

export function saveConversation(projectDir, conv) {
  const dir = join(projectDir, 'requirements', 'conversations');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const safeTitle = (conv.title || 'Discussion').replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_').slice(0, 60);
  const filename = conv.id + '_' + safeTitle + '.md';
  const filepath = join(dir, filename);

  let md = '---\n';
  md += 'type: discussion\n';
  md += 'id: "' + conv.id + '"\n';
  md += 'title: "' + (conv.title || '').replace(/"/g, "'") + '"\n';
  md += 'status: ' + (conv.status || 'open') + '\n';
  md += 'related_to: "' + (conv.related_to || 'new') + '"\n';
  md += 'created: "' + (conv.created || new Date().toISOString().slice(0, 10)) + '"\n';
  md += 'provider: "' + (conv.provider || 'unknown') + '"\n';
  md += 'model: "' + (conv.model || 'unknown') + '"\n';
  md += '---\n\n';
  md += '# ' + conv.id + ': ' + (conv.title || 'Discussion') + '\n\n';

  for (const msg of conv.messages || []) {
    if (msg.role === 'user') {
      md += '## User\n\n' + msg.content + '\n\n';
    } else if (msg.role === 'assistant') {
      md += '## Assistant\n\n' + msg.content + '\n\n';
    }
  }

  writeFileSync(filepath, md, 'utf-8');
  return { file: filename };
}

export function readConversation(projectDir, convId) {
  const dir = join(projectDir, 'requirements', 'conversations');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter(f => f.startsWith(convId) && f.endsWith('.md'));
  if (!files.length) return null;
  const content = readFileSync(join(dir, files[0]), 'utf-8');
  const fm = parseFrontmatter(content);
  // Parse messages back from markdown
  const messages = [];
  const blocks = content.split(/^## (User|Assistant)$/gm);
  for (let i = 1; i < blocks.length; i += 2) {
    const role = blocks[i].toLowerCase().trim();
    const text = (blocks[i + 1] || '').trim();
    if (role === 'user' || role === 'assistant') messages.push({ role, content: text });
  }
  return { ...fm, messages, file: files[0] };
}

// --- Feedback Persistence ---

export function listFeedback(projectDir) {
  const dir = join(projectDir, 'requirements', 'feedback');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const fm = parseFrontmatter(content);
    return { file: f, ...fm };
  });
}

export function getNextFeedbackId(projectDir) {
  const items = listFeedback(projectDir);
  if (!items.length) return 'FBK-1';
  const nums = items.map(i => {
    const m = (i.id || '').match(/FBK-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  return 'FBK-' + (Math.max(...nums) + 1);
}

export function saveFeedback(projectDir, fbk) {
  const dir = join(projectDir, 'requirements', 'feedback');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const id = fbk.id || getNextFeedbackId(projectDir);
  const safeTitle = (fbk.title || 'Feedback').replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_').slice(0, 60);
  const filename = id + '_' + safeTitle + '.md';
  const filepath = join(dir, filename);

  let md = '---\n';
  md += 'type: feedback\n';
  md += 'id: "' + id + '"\n';
  md += 'title: "' + (fbk.title || '').replace(/"/g, "'") + '"\n';
  md += 'status: ' + (fbk.status || 'collected') + '\n';
  md += 'source: ' + (fbk.source || 'manual') + '\n';
  md += 'severity: ' + (fbk.severity || 'wish') + '\n';
  if (fbk.rating) md += 'rating: ' + fbk.rating + '\n';
  if (fbk.platform) md += 'platform: "' + (fbk.platform || '').replace(/"/g, "'") + '"\n';
  if (fbk.app_version) md += 'app_version: "' + (fbk.app_version || '').replace(/"/g, "'") + '"\n';
  if (fbk.linked_requirements) md += 'linked_requirements: "' + (fbk.linked_requirements || '').replace(/"/g, "'") + '"\n';
  md += 'created: "' + (fbk.created || new Date().toISOString().slice(0, 10)) + '"\n';
  md += '---\n\n';
  md += '# ' + id + ': ' + (fbk.title || 'Feedback') + '\n\n';
  md += '## User Feedback\n\n' + (fbk.content || '_No content provided._') + '\n\n';
  if (fbk.action) md += '## Planned Action\n\n' + fbk.action + '\n';

  writeFileSync(filepath, md, 'utf-8');
  return { file: filename, id };
}

export function readFeedbackItem(projectDir, fbkId) {
  if (!/^FBK-\d+$/.test(fbkId)) return null;
  const dir = join(projectDir, 'requirements', 'feedback');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter(f => f.startsWith(fbkId) && f.endsWith('.md'));
  if (!files.length) return null;
  const content = readFileSync(join(dir, files[0]), 'utf-8');
  const fm = parseFrontmatter(content);
  const bodyMatch = content.match(/## User Feedback\s*\n([\s\S]*?)(?=\n## |$)/);
  const body = bodyMatch ? bodyMatch[1].trim() : '';
  return { ...fm, content: body, file: files[0] };
}

export function deleteFeedbackItem(projectDir, fbkId) {
  if (!/^FBK-\d+$/.test(fbkId)) return false;
  const dir = join(projectDir, 'requirements', 'feedback');
  if (!existsSync(dir)) return false;
  const files = readdirSync(dir).filter(f => f.startsWith(fbkId) && f.endsWith('.md'));
  if (!files.length) return false;
  unlinkSync(join(dir, files[0]));
  return true;
}

// --- API Routes ---

export function getProjectDir(projectId) {
  if (!/^\d{3}_/.test(projectId)) return null;
  const dir = join(WORKSPACE_ROOT, projectId);
  // Security: prevent path traversal
  const resolved = resolve(dir);
  if (!resolved.startsWith(resolve(WORKSPACE_ROOT))) return null;
  return existsSync(dir) ? dir : null;
}

// ============================================================================
//  GitHub Models API Integration
// ============================================================================

const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const GITHUB_API = 'https://api.github.com';

// Available models via GitHub Models API
export const GITHUB_MODELS = [
  { id: 'gpt-4o',              name: 'GPT-4o',            provider: 'OpenAI'    },
  { id: 'gpt-4o-mini',         name: 'GPT-4o Mini',       provider: 'OpenAI'    },
  { id: 'o3-mini',             name: 'o3-mini',           provider: 'OpenAI'    },
  { id: 'DeepSeek-R1',         name: 'DeepSeek R1',       provider: 'DeepSeek'  },
  { id: 'Llama-4-Scout-17B-16E-Instruct', name: 'Llama 4 Scout', provider: 'Meta' },
];

// In-memory cache for GitHub user info (survives during server lifetime)
let _githubUser = null;

export function loadGitHubToken() {
  // 1. Check environment variable
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.ARQITEKT_GITHUB_TOKEN) return process.env.ARQITEKT_GITHUB_TOKEN;
  // 2. Check config file
  const cfgPath = join(HUB_ROOT, 'config', 'github.yaml');
  if (existsSync(cfgPath)) {
    try {
      const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
      const envVar = cfg.github?.token_env;
      if (envVar && process.env[envVar]) return process.env[envVar];
    } catch {}
  }
  return null;
}

export function saveGitHubTokenEnv(envVarName) {
  const cfgPath = join(HUB_ROOT, 'config', 'github.yaml');
  let content = '';
  if (existsSync(cfgPath)) {
    content = readFileSync(cfgPath, 'utf-8');
    if (/^github:/m.test(content)) {
      upsertYamlField(cfgPath, 'github', 'token_env', envVarName);
      return;
    }
  }
  content = content.trimEnd() + '\n\ngithub:\n  token_env: "' + envVarName + '"\n';
  writeFileSync(cfgPath, content, 'utf-8');
}

export function validateGitHubToken(token) {
  return new Promise((resolveP, rejectP) => {
    const req = https.request(GITHUB_API + '/user', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ARQITEKT-Hub',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return rejectP(new Error('GitHub API returned ' + res.statusCode));
        }
        try {
          const user = JSON.parse(data);
          _githubUser = { login: user.login, avatar: user.avatar_url, name: user.name };
          resolveP(_githubUser);
        } catch (e) { rejectP(e); }
      });
    });
    req.on('error', rejectP);
    req.setTimeout(10000, () => { req.destroy(); rejectP(new Error('Timeout')); });
    req.end();
  });
}

export function getGitHubUser() {
  return _githubUser;
}

export function proxyGitHubModels(messages, model, token, options = {}) {
  return new Promise((resolveP, rejectP) => {
    const payload = JSON.stringify({
      model: model || 'gpt-4o',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      stream: false,
    });
    const req = https.request(GITHUB_MODELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return rejectP(new Error(json.error.message || JSON.stringify(json.error)));
          const content = json.choices?.[0]?.message?.content || '';
          resolveP({ content, model: json.model, usage: json.usage });
        } catch (e) { rejectP(new Error('GitHub Models parse error: ' + e.message)); }
      });
    });
    req.on('error', rejectP);
    req.setTimeout(120000, () => { req.destroy(); rejectP(new Error('GitHub Models request timeout')); });
    req.write(payload);
    req.end();
  });
}

// --- File System API (for the Develop tab) ---

export function listProjectFiles(projectDir, subPath) {
  const base = subPath ? join(projectDir, subPath) : projectDir;
  if (!existsSync(base)) return { files: [] };
  // Security: prevent traversal
  if (!resolve(base).startsWith(resolve(projectDir))) return { files: [] };

  const skipDirs = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.gradle', '__pycache__', '.dart_tool']);
  const result = [];

  function walk(dir, prefix) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (skipDirs.has(e.name)) continue;
      if (e.name.startsWith('.') && e.name !== '.github') continue;
      const rel = prefix ? prefix + '/' + e.name : e.name;
      if (e.isDirectory()) {
        walk(join(dir, e.name), rel);
      } else {
        result.push(rel);
      }
    }
  }

  walk(base, subPath || '');
  return { files: result };
}

export function readProjectFile(projectDir, filePath) {
  const abs = join(projectDir, filePath);
  if (!resolve(abs).startsWith(resolve(projectDir))) return null;
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf-8');
}

export function writeProjectFile(projectDir, filePath, content) {
  const abs = join(projectDir, filePath);
  if (!resolve(abs).startsWith(resolve(projectDir))) return { error: 'Invalid path' };
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf-8');
  return { success: true };
}

// --- GitHub Repo Status (for deploy/monitor) ---

function ghApiFetch(path, token) {
  return new Promise((resolveP, rejectP) => {
    const req = https.request(GITHUB_API + path, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ARQITEKT-Hub',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return rejectP(new Error('GitHub API ' + res.statusCode));
        try { resolveP(JSON.parse(data)); } catch (e) { rejectP(e); }
      });
    });
    req.on('error', rejectP);
    req.setTimeout(15000, () => { req.destroy(); rejectP(new Error('Timeout')); });
    req.end();
  });
}

export async function getGitHubRepoStatus(repoSlug, token) {
  const [commits, branches, actions] = await Promise.allSettled([
    ghApiFetch('/repos/' + repoSlug + '/commits?per_page=5', token),
    ghApiFetch('/repos/' + repoSlug + '/branches?per_page=20', token),
    ghApiFetch('/repos/' + repoSlug + '/actions/runs?per_page=3', token),
  ]);

  return {
    commits: commits.status === 'fulfilled' ? commits.value.map(c => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author?.name || c.author?.login || 'unknown',
      date: c.commit.author?.date,
    })) : [],
    branches: branches.status === 'fulfilled' ? branches.value.map(b => b.name) : [],
    actions: actions.status === 'fulfilled' ? (actions.value.workflow_runs || []).map(r => ({
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      branch: r.head_branch,
      date: r.updated_at,
    })) : [],
  };
}

// ============================================================================
//  AUTO-UPDATE — Check & install ARQITEKT Hub updates from GitHub Releases
// ============================================================================

function getUpdateConfig() {
  // Read repo slug from config/update.yaml or fall back to package.json repository field
  const updateYaml = join(HUB_ROOT, 'config', 'update.yaml');
  if (existsSync(updateYaml)) {
    const raw = readFileSync(updateYaml, 'utf-8');
    const repoMatch = raw.match(/repo:\s*["']?([^"'\s\r\n]+)/);
    if (repoMatch) return { repo: repoMatch[1] };
  }
  // Fallback: try package.json repository field
  const pkg = JSON.parse(readFileSync(join(HUB_ROOT, 'package.json'), 'utf-8'));
  if (pkg.repository) {
    const slug = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url || '';
    const m = slug.match(/github\.com[/:]([^/]+\/[^/.]+)/);
    if (m) return { repo: m[1] };
    if (/^[^/]+\/[^/]+$/.test(slug)) return { repo: slug };
  }
  return { repo: null };
}

function getCurrentVersion() {
  const pkg = JSON.parse(readFileSync(join(HUB_ROOT, 'package.json'), 'utf-8'));
  return pkg.version || '0.0.0';
}

function compareVersions(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const da = pa[i] || 0, db = pb[i] || 0;
    if (da < db) return -1;
    if (da > db) return 1;
  }
  return 0;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, { headers: { 'User-Agent': 'ARQITEKT-Hub/' + getCurrentVersion() } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error('HTTP ' + res.statusCode));
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    get(url);
  });
}

export async function checkHubUpdate() {
  const { repo } = getUpdateConfig();
  const currentVersion = getCurrentVersion();
  if (!repo) {
    return { currentVersion, updateAvailable: false, error: 'No update repository configured. Add repo to config/update.yaml' };
  }
  try {
    const data = await httpsGet('https://api.github.com/repos/' + repo + '/releases/latest');
    const release = JSON.parse(data.toString('utf-8'));
    const latestVersion = (release.tag_name || '').replace(/^v/, '');
    const updateAvailable = compareVersions(currentVersion, latestVersion) < 0;
    return {
      currentVersion,
      latestVersion,
      updateAvailable,
      releaseName: release.name || latestVersion,
      releaseNotes: (release.body || '').slice(0, 1000),
      releaseUrl: release.html_url || '',
      publishedAt: release.published_at || '',
      downloadUrl: release.zipball_url || '',
    };
  } catch (err) {
    return { currentVersion, updateAvailable: false, error: 'Update check failed: ' + err.message };
  }
}

export async function performHubUpdate() {
  const { repo } = getUpdateConfig();
  if (!repo) throw new Error('No update repository configured');

  const info = await checkHubUpdate();
  if (!info.updateAvailable) throw new Error('Already up to date (v' + info.currentVersion + ')');
  if (!info.downloadUrl) throw new Error('No download URL in release');

  const tmpDir = join(HUB_ROOT, '.update-tmp');
  const zipPath = join(tmpDir, 'release.zip');

  try {
    // Clean & create temp dir
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    mkdirSync(tmpDir, { recursive: true });

    // Download release zip
    const zipData = await httpsGet(info.downloadUrl);
    writeFileSync(zipPath, zipData);

    // Extract using tar (handles .zip from GitHub which is actually a zip)
    // GitHub zipball is a real zip file — use PowerShell or tar
    execSync('tar -xf "' + zipPath + '" -C "' + tmpDir + '"', { stdio: 'pipe' });

    // Find the extracted root folder (GitHub wraps in owner-repo-sha/)
    const extracted = readdirSync(tmpDir).filter(f => f !== 'release.zip');
    if (extracted.length === 0) throw new Error('Empty archive');
    const srcRoot = join(tmpDir, extracted[0]);

    // Check if the extracted folder has _ARQITEKT structure or is the hub directly
    let hubSrc = srcRoot;
    if (existsSync(join(srcRoot, '_ARQITEKT', 'package.json'))) {
      hubSrc = join(srcRoot, '_ARQITEKT');
    }

    // Backup current scripts
    const backupDir = join(HUB_ROOT, '.update-backup');
    if (existsSync(backupDir)) rmSync(backupDir, { recursive: true, force: true });
    mkdirSync(backupDir, { recursive: true });
    cpSync(join(HUB_ROOT, 'scripts'), join(backupDir, 'scripts'), { recursive: true });
    cpSync(join(HUB_ROOT, 'package.json'), join(backupDir, 'package.json'));

    // Overwrite hub files (scripts/, config/, package.json)
    const updateTargets = ['scripts', 'config'];
    for (const dir of updateTargets) {
      const src = join(hubSrc, dir);
      const dest = join(HUB_ROOT, dir);
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true, force: true });
      }
    }
    // Update package.json (preserve private fields)
    if (existsSync(join(hubSrc, 'package.json'))) {
      const newPkg = JSON.parse(readFileSync(join(hubSrc, 'package.json'), 'utf-8'));
      const oldPkg = JSON.parse(readFileSync(join(HUB_ROOT, 'package.json'), 'utf-8'));
      // Keep private flag
      newPkg.private = oldPkg.private;
      writeFileSync(join(HUB_ROOT, 'package.json'), JSON.stringify(newPkg, null, 2) + '\n');
    }

    // Cleanup
    rmSync(tmpDir, { recursive: true, force: true });

    return {
      success: true,
      previousVersion: info.currentVersion,
      newVersion: info.latestVersion,
      message: 'Update installed. Restart the server to apply changes.',
    };
  } catch (err) {
    // Attempt rollback on failure
    const backupDir = join(HUB_ROOT, '.update-backup');
    if (existsSync(backupDir)) {
      try {
        if (existsSync(join(backupDir, 'scripts'))) {
          cpSync(join(backupDir, 'scripts'), join(HUB_ROOT, 'scripts'), { recursive: true, force: true });
        }
        if (existsSync(join(backupDir, 'package.json'))) {
          cpSync(join(backupDir, 'package.json'), join(HUB_ROOT, 'package.json'));
        }
      } catch {}
    }
    // Cleanup temp
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    throw new Error('Update failed (rolled back): ' + err.message);
  }
}
