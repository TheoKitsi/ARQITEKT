// ============================================================================
// ARQITEKT — Multi-Project Hub Dashboard v4
// ============================================================================
// Central dashboard managing all projects in the workspace.
// No external dependencies — pure Node.js.
//
// Features v4:
//   - Per-Solution Progress Model (non-linear workflow)
//   - "+" Branching: Add new Solutions at any point
//   - 2-Phase LLM: Cheap LLM for discussion → Claude for formalization
//   - Chat-UI embedded in dashboard
//   - Entry Points & Resume per Solution
//
// Usage: node scripts/dashboard.mjs
//        → opens http://localhost:3333
// ============================================================================

import { createServer } from 'http';
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, rmSync, cpSync, renameSync, unlinkSync } from 'fs';
import { join, basename, relative, resolve } from 'path';
import { exec } from 'child_process';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HUB_ROOT = join(__dirname, '..');           // _ARQITEKT/
const WORKSPACE_ROOT = join(HUB_ROOT, '..');      // ARQITEKT/
const TEMPLATE_DIR = join(HUB_ROOT, 'template');
const PORT = 3333;

// --- Helpers ---

function getMarkdownFiles(dir) {
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

function parseFrontmatter(content) {
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

function parseYaml(content) {
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

function upsertYamlField(filePath, section, key, value) {
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

function getLifecycle(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return 'planning';
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    return cfg.lifecycle?.state || 'planning';
  } catch { return 'planning'; }
}

function setLifecycle(projectDir, state) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return;
  upsertYamlField(cfgPath, 'lifecycle', 'state', state);
}

// --- Readiness Computation ---

function computeReadiness(projectDir) {
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

function getReadinessThreshold(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return 100;
  try {
    const raw = readFileSync(cfgPath, 'utf-8');
    const m = raw.match(/readiness_threshold:\s*(\d+)/);
    return m ? Math.min(100, Math.max(0, parseInt(m[1]))) : 100;
  } catch { return 100; }
}

// --- Authored Computation (content completeness by metamodel depth) ---

function computeAuthored(projectDir) {
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

function getProjectTags(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return [];
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    if (Array.isArray(cfg.tags)) return cfg.tags.map(t => String(t).trim()).filter(Boolean);
  } catch {}
  return [];
}

function writeTagsToYaml(projectDir, tags) {
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

function getProjectBranding(projectDir) {
  const cfgPath = join(projectDir, 'config', 'project.yaml');
  if (!existsSync(cfgPath)) return null;
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    return cfg.branding || null;
  } catch { return null; }
}

function getProjectGithub(projectDir) {
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

function autoTagFromBC(projectDir) {
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
const buildingProjects = new Set();
// In-memory running app processes
const runningApps = new Map();

// --- Project Discovery ---

function listProjects() {
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

function getNextProjectNumber() {
  const projects = listProjects();
  if (!projects.length) return '001';
  const max = Math.max(...projects.map(p => parseInt(p.id.slice(0, 3))));
  return String(max + 1).padStart(3, '0');
}

// --- Per-Project Functions ---

function getStats(reqDir) {
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

function getSolutionList(projectDir) {
  const dir = join(projectDir, 'requirements', 'solutions');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const fm = parseFrontmatter(content);
    const title = content.match(/^#\s+(.+)$/m)?.[1] || f;
    return { id: fm.id || f.replace('.md', ''), title: title.replace(/^SOL-\d+:\s*/, '') };
  });
}

function runValidate(projectDir) {
  try {
    const output = execSync('node scripts/validate.mjs', { cwd: projectDir, encoding: 'utf-8', timeout: 30000 });
    return { success: true, output };
  } catch (err) {
    return { success: false, output: err.stdout || err.message };
  }
}

function readRequirement(projectDir, id) {
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

function searchRequirements(projectDir, query) {
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

function createProject(name, description) {
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

function deleteProject(projectId) {
  if (!/^\d{3}_/.test(projectId)) return { error: 'Invalid project ID' };
  const projectDir = join(WORKSPACE_ROOT, projectId);
  if (!existsSync(projectDir)) return { error: 'Project not found' };
  rmSync(projectDir, { recursive: true, force: true });
  return { success: true };
}

function renameProject(projectId, newName) {
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

function updateProjectMeta(projectId, fields) {
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

function openInVSCode(projectId) {
  const projectDir = join(WORKSPACE_ROOT, projectId);
  if (!existsSync(projectDir)) return { error: 'Projekt nicht gefunden' };
  exec(`code "${projectDir}"`);
  return { success: true };
}

// --- Per-SOL Analysis ---

function analyzeSOL(sol) {
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

function checkAllApproved(node) {
  if (node.status && node.status !== 'approved' && node.status !== 'implemented') return false;
  for (const ch of node.children || []) { if (!checkAllApproved(ch)) return false; }
  return true;
}

function getNextSolId(projectDir) {
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

function getNextUSId(projectDir, solNum) {
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

function setRequirementStatus(projectDir, filePath, newStatus) {
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

function getBCSummary(projectDir) {
  const bcPath = join(projectDir, 'requirements', '00_BUSINESS_CASE.md');
  if (!existsSync(bcPath)) return null;
  const content = readFileSync(bcPath, 'utf-8');
  // Extract first ~500 chars after frontmatter as summary
  const body = content.replace(/^---[\s\S]*?---/, '').trim();
  const lines = body.split('\n').slice(0, 20);
  return lines.join('\n').slice(0, 800);
}

// --- LLM Config ---

function loadLLMConfig() {
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

function proxyLLMRequest(messages, config) {
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

function listConversations(projectDir) {
  const dir = join(projectDir, 'requirements', 'conversations');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const fm = parseFrontmatter(content);
    return { file: f, ...fm };
  });
}

function saveConversation(projectDir, conv) {
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

function readConversation(projectDir, convId) {
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

function listFeedback(projectDir) {
  const dir = join(projectDir, 'requirements', 'feedback');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const fm = parseFrontmatter(content);
    return { file: f, ...fm };
  });
}

function getNextFeedbackId(projectDir) {
  const items = listFeedback(projectDir);
  if (!items.length) return 'FBK-1';
  const nums = items.map(i => {
    const m = (i.id || '').match(/FBK-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  return 'FBK-' + (Math.max(...nums) + 1);
}

function saveFeedback(projectDir, fbk) {
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

function readFeedbackItem(projectDir, fbkId) {
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

function deleteFeedbackItem(projectDir, fbkId) {
  if (!/^FBK-\d+$/.test(fbkId)) return false;
  const dir = join(projectDir, 'requirements', 'feedback');
  if (!existsSync(dir)) return false;
  const files = readdirSync(dir).filter(f => f.startsWith(fbkId) && f.endsWith('.md'));
  if (!files.length) return false;
  unlinkSync(join(dir, files[0]));
  return true;
}

// --- API Routes ---

function getProjectDir(projectId) {
  if (!/^\d{3}_/.test(projectId)) return null;
  const dir = join(WORKSPACE_ROOT, projectId);
  // Security: prevent path traversal
  const resolved = resolve(dir);
  if (!resolved.startsWith(resolve(WORKSPACE_ROOT))) return null;
  return existsSync(dir) ? dir : null;
}

function handleAPI(req, url, res) {
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

  res.statusCode = 404;
  return res.end(JSON.stringify({ error: 'not found' }));
}

// --- Dashboard HTML ---

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARQITEKT Hub</title>
<style>
  /* ===== DESIGN TOKENS — Premium Tier ===== */
  :root {
    --bg:      #0a0e14;
    --bg2:     #12171f;
    --bg3:     #1a2030;
    --bg4:     #252d3d;
    --fg:      #e8edf5;
    --fg2:     #9aa4b8;
    --fg3:     #8b96a8;
    --accent:  #58a6ff;
    --accent2: #79c0ff;
    --gold:    #FFD700;
    --gold2:   #ffe680;
    --green:   #3fb950;
    --green2:  #2ea043;
    --yellow:  #d29922;
    --orange:  #db6d28;
    --red:     #f85149;
    --purple:  #bc8cff;
    --blue:    #58a6ff;
    --border:  rgba(255,255,255,.06);
    --border2: rgba(255,255,255,.1);
    --border3: rgba(255,255,255,.16);
    --radius:  12px;
    --radius-sm: 8px;
    --radius-xs: 6px;
    --shadow:  0 8px 32px rgba(0,0,0,.5);
    --shadow-lg: 0 16px 64px rgba(0,0,0,.6);
    --shadow-glow: 0 0 40px rgba(255,215,0,.06);
    --font:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --mono:    'JetBrains Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
    --ease:    cubic-bezier(.4, 0, .2, 1);
    --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);
    --glass:   saturate(180%) blur(20px);
  }

  /* ===== RESET ===== */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { font-size: 15px; }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--fg);
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  /* ===== HEADER — Glassmorphism ===== */
  .header {
    background: rgba(18, 23, 31, .82);
    -webkit-backdrop-filter: var(--glass);
    backdrop-filter: var(--glass);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 200;
  }
  .header::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,.15), transparent);
    pointer-events: none;
  }
  .hdr-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 1;
  }
  .hdr-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--fg);
    letter-spacing: -.3px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-title .hdr-count {
    font-size: 11px;
    font-weight: 600;
    color: var(--fg3);
    background: rgba(255,255,255,.06);
    padding: 1px 8px;
    border-radius: 10px;
    margin-left: 8px;
    vertical-align: middle;
  }
  .hdr-sub {
    font-size: 11px;
    color: var(--fg3);
    font-weight: 400;
    letter-spacing: .02em;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .logo {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -.5px;
    color: var(--fg);
    cursor: pointer;
    flex-shrink: 0;
    transition: all .25s var(--ease);
    position: relative;
  }
  .logo:hover { color: var(--gold); }
  .logo em { color: var(--gold); font-style: normal; }
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--fg2);
    min-width: 0;
  }
  .breadcrumb .sep { color: var(--fg3); font-size: 11px; }
  .breadcrumb .proj-name {
    color: var(--fg);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-actions { margin-left: auto; display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: var(--radius-xs);
    padding: 7px 16px;
    color: var(--fg);
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font);
    cursor: pointer;
    transition: all .2s var(--ease);
    white-space: nowrap;
    text-decoration: none;
    position: relative;
    overflow: hidden;
  }
  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.04), transparent);
    pointer-events: none;
  }
  .btn:hover { background: var(--bg4); border-color: var(--border3); color: #fff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.3); }
  .btn:active { transform: translateY(0); }
  .btn.pri { background: var(--green2); border-color: transparent; color: #fff; }
  .btn.pri:hover { background: var(--green); box-shadow: 0 4px 16px rgba(63,185,80,.3); }
  .btn.accent { background: var(--accent); border-color: transparent; color: #fff; }
  .btn.accent:hover { background: var(--accent2); box-shadow: 0 4px 16px rgba(88,166,255,.3); }
  .btn.danger { color: var(--red); }
  .btn.danger:hover { background: rgba(248,81,73,.12); border-color: var(--red); }
  .btn.sm { padding: 5px 12px; font-size: 12px; }
  .btn.gold { background: linear-gradient(135deg, #FFD700, #f5c400); border-color: transparent; color: #1a1a2e; font-weight: 700; letter-spacing: -.2px; }
  .btn.gold:hover { background: linear-gradient(135deg, #ffe34d, #FFD700); box-shadow: 0 4px 20px rgba(255,215,0,.3); }

  /* ===== HUB VIEW (Project Grid) ===== */
  .hub-view { padding: 24px 32px; max-width: 1200px; margin: 0 auto; }
  .hub-title {
    display: none;
  }
  .hub-sub {
    display: none;
  }
  .hub-controls {
    display: flex; gap: 8px; margin-bottom: 16px; align-items: center;
  }
  .hub-controls .btn { font-size: 10px; padding: 4px 12px; }
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 20px;
  }
  .project-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    transition: all .3s var(--ease);
    cursor: default;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    will-change: transform;
  }
  .project-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold), var(--accent));
    opacity: 0;
    transition: opacity .3s var(--ease);
  }
  .project-card:hover { border-color: var(--border2); box-shadow: var(--shadow), var(--shadow-glow); transform: translateY(-2px); }
  .project-card:active { transform: translateY(0); box-shadow: var(--shadow); transition-duration: .1s; }
  .project-card:hover::before { opacity: 1; }
  .project-card.ready-glow { border-color: rgba(255,215,0,.12); }
  .project-card.ready-glow:hover { border-color: rgba(255,215,0,.25); box-shadow: var(--shadow), 0 0 20px rgba(255,215,0,.06); }
  .project-card.ready-glow::before { background: linear-gradient(90deg, var(--gold), var(--gold2)); opacity: .6; }
  .project-card .pc-header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 8px;
  }
  .project-card .pc-num {
    font-size: 11px;
    font-weight: 700;
    color: var(--gold);
    font-family: var(--mono);
    flex-shrink: 0;
    background: rgba(255,215,0,.08);
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: .5px;
  }
  .project-card .pc-sep {
    color: var(--fg3);
    font-size: 12px;
    flex-shrink: 0;
    opacity: .4;
  }
  .project-card .pc-name {
    font-size: 17px;
    font-weight: 700;
    color: var(--fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: -.3px;
  }
  .project-card .pc-desc {
    font-size: 12.5px;
    color: var(--fg2);
    margin-bottom: 10px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-height: 1.55;
    min-height: 58px;
    max-height: 58px;
  }
  /* Collapsible card expand/collapse */
  .pc-expand-toggle {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; padding: 6px 0 2px; margin: 0 -20px; cursor: pointer;
    border-top: 1px solid var(--border); font-size: 10px; font-weight: 700;
    color: var(--fg3); text-transform: uppercase; letter-spacing: .6px;
    transition: all .2s var(--ease); user-select: none;
  }
  .pc-expand-toggle:hover { color: var(--gold); background: rgba(255,215,0,.03); }
  .pc-expand-toggle .chevron {
    display: inline-block; transition: transform .25s var(--ease); font-size: 8px;
  }
  .project-card.expanded .pc-expand-toggle .chevron { transform: rotate(180deg); }
  .pc-collapsible {
    display: none; flex-direction: column;
  }
  .project-card.expanded .pc-collapsible { display: flex; }
  .project-card.expanded .pc-quick-actions { display: none; }
  .project-card .pc-stats {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .pc-stat {
    flex: 1;
    text-align: center;
    padding: 8px 2px;
    background: var(--bg);
    border-right: 1px solid var(--border);
    transition: background .2s var(--ease);
  }
  .pc-stat:last-child { border-right: none; }
  .pc-stat:hover { background: var(--bg2); }
  .pc-stat .v { font-size: 16px; font-weight: 800; letter-spacing: -.3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pc-stat .l { font-size: 10px; color: var(--fg3); text-transform: uppercase; letter-spacing: .8px; font-weight: 600; margin-top: 1px; }
  .pc-stat.bc .v { color: var(--purple); }
  .pc-stat.sol .v { color: var(--blue); }
  .pc-stat.us .v { color: var(--green); }
  .pc-stat.cmp .v { color: var(--yellow); }
  .pc-stat.fn .v { color: var(--orange); }
  .pc-stat.zero { opacity: .35; }
  .pc-stat.zero:hover { opacity: .6; }
  .project-card .pc-actions {
    display: flex;
    gap: 6px;
    margin-top: auto;
    flex-wrap: wrap;
  }
  .pc-actions .btn { flex: 1 1 auto; justify-content: center; font-size: 11px; min-width: 0; }
  .pc-actions .btn.gh {
    background: rgba(255,215,0,.06);
    border-color: rgba(255,215,0,.2);
    color: var(--gold);
    gap: 5px;
  }
  .pc-actions .btn.gh:hover { background: rgba(255,215,0,.12); border-color: var(--gold); }
  .pc-actions .btn.gh svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }

  /* Dual progress bars */
  .pc-bars {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }
  .pc-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pc-bar-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
    min-width: 62px;
    color: var(--fg3);
  }
  .pc-bar-label.authored { color: var(--green); }
  .pc-bar-label.approved { color: var(--gold); }
  .pc-readiness-bar {
    flex: 1;
    height: 7px;
    background: var(--bg);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border);
    position: relative;
  }
  .pc-readiness-fill {
    height: 100%;
    border-radius: 4px;
    transition: width .6s var(--ease);
  }
  .pc-readiness-fill.authored {
    background: linear-gradient(90deg, var(--green2), var(--green));
    box-shadow: 0 0 8px rgba(63,185,80,.2);
  }
  .pc-readiness-fill.approved {
    background: linear-gradient(90deg, var(--gold), var(--gold2));
    box-shadow: 0 0 8px rgba(255,215,0,.25);
  }
  @keyframes barFillIn { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .pc-readiness-fill { animation: barFillIn .8s var(--ease) both; transform-origin: left; }
  .pc-readiness-pct {
    font-size: 11px;
    font-weight: 800;
    font-family: var(--mono);
    color: var(--fg3);
    min-width: 36px;
    text-align: right;
    letter-spacing: -.3px;
  }
  .pc-readiness-pct.authored-hi { color: var(--green); text-shadow: 0 0 8px rgba(63,185,80,.3); }
  .pc-readiness-pct.ready { color: var(--gold); text-shadow: 0 0 8px rgba(255,215,0,.3); }

  /* Lifecycle badge */
  .pc-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: .8px;
    flex-shrink: 0;
    border: 1px solid transparent;
  }
  .pc-badge.planning { background: rgba(139,148,158,.1); color: var(--fg3); border-color: rgba(139,148,158,.2); }
  .pc-badge.ready { background: rgba(255,215,0,.1); color: var(--gold); border-color: rgba(255,215,0,.2); }
  .pc-badge.building { background: rgba(88,166,255,.1); color: var(--accent); border-color: rgba(88,166,255,.2); animation: pulse-badge 2s var(--ease) infinite; }
  .pc-badge.built { background: rgba(63,185,80,.1); color: var(--green); border-color: rgba(63,185,80,.2); }
  .pc-badge.running { background: rgba(63,185,80,.1); color: var(--green); border-color: rgba(63,185,80,.2); animation: pulse-badge 2s var(--ease) infinite; }
  .pc-badge.deployed { background: rgba(255,215,0,.1); color: var(--gold); border-color: rgba(255,215,0,.2); }
  @keyframes pulse-badge { 0%,100% { opacity:1; } 50% { opacity:.55; } }

  /* Factory action buttons row */
  .pc-factory {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }
  .pc-factory .btn { flex: 1; justify-content: center; font-size: 11px; }

  /* Tag pills */
  .pc-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; min-height: 22px; max-height: 22px; overflow: hidden; position: relative; }
  .pc-tags-more { font-size: 9px; font-weight: 700; color: var(--fg3); padding: 2px 6px; border-radius: 6px; background: var(--bg3); flex-shrink: 0; }
  .pc-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
    padding: 3px 8px; border-radius: 6px;
    background: var(--bg4); color: var(--fg3);
    cursor: default; border: 1px solid transparent;
    transition: all .2s var(--ease);
  }
  .pc-tag:hover { transform: translateY(-1px); }
  .pc-tag.game { background: rgba(188,140,255,.1); color: var(--purple); border-color: rgba(188,140,255,.15); }
  .pc-tag.api { background: rgba(88,166,255,.1); color: var(--accent); border-color: rgba(88,166,255,.15); }
  .pc-tag.tool { background: rgba(210,153,34,.1); color: var(--yellow); border-color: rgba(210,153,34,.15); }
  .pc-tag.saas { background: rgba(63,185,80,.1); color: var(--green); border-color: rgba(63,185,80,.15); }
  .pc-tag.ai { background: rgba(188,140,255,.1); color: var(--purple); border-color: rgba(188,140,255,.15); }
  .pc-tag.social { background: rgba(248,81,73,.1); color: var(--red); border-color: rgba(248,81,73,.15); }
  .pc-tag.finance { background: rgba(255,215,0,.1); color: var(--gold); border-color: rgba(255,215,0,.15); }
  .pc-tag.real-estate { background: rgba(219,109,40,.1); color: var(--orange); border-color: rgba(219,109,40,.15); }
  .pc-tag.verification { background: rgba(88,166,255,.1); color: var(--accent); border-color: rgba(88,166,255,.15); }
  .pc-tag.mobile { background: rgba(63,185,80,.1); color: var(--green); border-color: rgba(63,185,80,.15); }

  /* Card Tabs */
  .pc-tabs {
    display: flex; gap: 0; margin: 10px -20px 0; border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--border); margin-top: 12px;
  }
  .pc-tab {
    flex: 1; text-align: center; padding: 8px 4px; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .3px; cursor: pointer;
    color: var(--fg3); background: transparent; border: none; border-bottom: 2px solid transparent;
    transition: all .2s var(--ease); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pc-tab:hover { color: var(--fg2); background: rgba(255,255,255,.02); }
  .pc-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .pc-tab-content { display: none; padding-top: 12px; flex: 1; min-height: 0; }
  .pc-tab-content.active { display: block; animation: tabFadeIn .2s var(--ease); }
  @keyframes tabFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  /* Tag filter bar */
  .tag-filter-bar {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center;
  }
  .tag-filter-bar .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--fg3); }
  .tag-filter-btn {
    font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 12px;
    border: 1px solid var(--border); background: transparent; color: var(--fg3);
    cursor: pointer; transition: all .2s var(--ease); text-transform: uppercase; letter-spacing: .6px;
  }
  .tag-filter-btn:hover { border-color: var(--gold); color: var(--gold); background: rgba(255,215,0,.04); }
  .tag-filter-btn.active { background: rgba(255,215,0,.1); border-color: var(--gold); color: var(--gold); }

  /* Branding modal */
  .branding-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .branding-field { display: flex; flex-direction: column; gap: 5px; }
  .branding-field label { font-size: 11px; font-weight: 700; color: var(--fg3); letter-spacing: .3px; }
  .branding-field input[type="color"] { width: 100%; height: 38px; border: 1px solid var(--border); border-radius: var(--radius-xs); background: var(--bg); cursor: pointer; padding: 2px; }
  .branding-field select, .branding-field input[type="text"] {
    padding: 7px 10px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-xs);
    color: var(--fg); font-size: 12px; font-family: var(--sans);
    transition: border-color .2s var(--ease);
  }
  .branding-field select:focus, .branding-field input[type="text"]:focus { border-color: var(--gold); outline: none; }
  .branding-preview {
    margin-top: 14px; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
    display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,.02);
  }
  .branding-preview .logo-preview { width: 42px; height: 42px; border-radius: var(--radius-sm); border: 1px solid var(--border); object-fit: contain; }
  .branding-preview .color-swatch { width: 26px; height: 26px; border-radius: var(--radius-xs); border: 1px solid var(--border); }

  /* Dev tab content */
  .dev-info { font-size: 11px; color: var(--fg2); margin-bottom: 10px; line-height: 1.5; }
  .dev-info .di-label { color: var(--fg3); font-weight: 700; margin-right: 8px; text-transform: uppercase; font-size: 10px; letter-spacing: .3px; }
  .dev-info .di-val { font-family: var(--mono); color: var(--fg); }

  /* New project card */
  .new-project-card {
    background: var(--bg2);
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    cursor: pointer;
    transition: all .3s var(--ease);
  }
  .new-project-card:hover { border-color: var(--gold); background: rgba(255,215,0,.03); transform: translateY(-2px); }
  .new-project-card .npc-icon { font-size: 32px; color: var(--fg3); margin-bottom: 10px; transition: color .3s var(--ease); }
  .new-project-card:hover .npc-icon { color: var(--gold); }
  .new-project-card .npc-text { font-size: 14px; color: var(--fg2); font-weight: 600; }

  /* ===== PROJECT VIEW (Layout) ===== */
  .project-view { display: none; }
  .project-view.active { display: grid; grid-template-columns: 270px 1fr; height: calc(100vh - 52px); }
  .sidebar {
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .content { overflow-y: auto; display: flex; flex-direction: column; }

  /* Cross-Cutting Tree */
  .cc-tree { border-top: 1px solid var(--border); padding: 6px 0; }
  .cc-tree:empty { display: none; }
  .cc-section-hdr { display:flex; align-items:center; gap:7px; padding:7px 12px; cursor:pointer; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.8px; color:var(--fg3); transition: background .15s var(--ease); }
  .cc-section-hdr:hover { background:rgba(255,255,255,.03); }
  .cc-section-hdr .cc-tog { transition:transform .2s var(--ease); }
  .cc-section-hdr.collapsed .cc-tog { transform:rotate(-90deg); }
  .cc-section-items { padding-left:12px; }
  .cc-section-items.hid { display:none; }
  .cc-item { display:flex; align-items:center; gap:7px; padding:5px 14px; font-size:12px; cursor:pointer; border-radius:var(--radius-xs); transition: all .15s var(--ease); }
  .cc-item:hover { background:rgba(255,255,255,.04); }
  .cc-item .cc-ico { width:20px; height:20px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:var(--bg); }
  .cc-ico.inf { background:var(--red,#e74c3c); }
  .cc-ico.adr { background:var(--fg2,#888); }
  .cc-ico.ntf { background:#9b59b6; }
  .cc-item .cc-id { color:var(--fg3); font-size:10px; min-width:52px; font-family:var(--mono); }
  .cc-item .cc-ttl { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cc-item .cc-st { font-size:9px; padding:2px 7px; border-radius:4px; border:1px solid var(--border); color:var(--fg3); font-weight:600; }

  /* Tracker Panel (hidden — replaced by card tabs) */
  .tracker-panel {
    display: none !important;
  }
  .tracker-panel.active { display: block; }
  .tracker-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: var(--fg3);
    margin-bottom: 8px;
  }
  .tracker-sol {
    margin-bottom: 8px;
  }
  .tracker-sol-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    margin-bottom: 3px;
  }
  .tracker-sol-head .ts-id { color: var(--accent); font-weight: 600; }
  .tracker-sol-head .ts-name { color: var(--fg2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .tracker-sol-head .ts-pct { color: var(--fg3); font-family: var(--mono); font-size: 10px; }
  .tracker-bar {
    height: 4px;
    background: var(--bg4);
    border-radius: 2px;
    overflow: hidden;
    display: flex;
  }
  .tracker-bar .tb-seg { height: 100%; transition: width .3s; }
  .tracker-bar .tb-seg.approved { background: var(--accent); }
  .tracker-bar .tb-seg.review { background: var(--green); }
  .tracker-bar .tb-seg.draft { background: var(--yellow); }
  .tracker-bar .tb-seg.implemented { background: var(--purple); }
  .tracker-bar .tb-seg[title] { cursor: help; }

  /* Quick Actions */
  .quick-actions {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
  .qa-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: var(--fg3);
    margin-bottom: 6px;
  }
  .qa-btn {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 11px;
    color: var(--fg2);
    cursor: pointer;
    font-family: var(--font);
    margin-bottom: 4px;
    transition: all .15s;
  }
  .qa-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(88,166,255,.06); }

  /* Search */
  .search-box { padding: 12px 14px; border-bottom: 1px solid var(--border); }
  .search-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    color: var(--fg);
    font-size: 13px;
    font-family: var(--font);
    outline: none;
    transition: all .25s var(--ease);
  }
  .search-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,215,0,.08); }
  .search-input::placeholder { color: var(--fg3); }

  /* Tree */
  .tree { flex: 1; overflow-y: auto; padding: 8px 0; }
  .tn { user-select: none; }
  .tr {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    cursor: pointer;
    font-size: 13px;
    transition: all .15s var(--ease);
    white-space: nowrap;
    border-radius: 0;
    margin: 0 4px;
    border-radius: var(--radius-xs);
  }
  .tr:hover { background: rgba(255,255,255,.04); }
  .tr.act { background: var(--gold); color: var(--bg); }
  .tr.act .ti, .tr.act .ts, .tr.act .tid { color: var(--bg); }
  .tt {
    width: 18px;
    text-align: center;
    color: var(--fg3);
    flex-shrink: 0;
    font-size: 10px;
    cursor: pointer;
    transition: transform .2s var(--ease);
  }
  .ti {
    width: 20px;
    text-align: center;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 800;
    border-radius: 4px;
    padding: 1px 0;
  }
  .ti.bc { color: var(--purple); } .ti.sol { color: var(--blue); } .ti.us { color: var(--green); } .ti.cmp { color: var(--yellow); } .ti.fn { color: var(--orange); }
  .tid { color: var(--fg3); font-size: 11px; margin-right: 4px; flex-shrink: 0; font-family: var(--mono); }
  .tl { overflow: hidden; text-overflow: ellipsis; flex: 1; }
  .ts {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: auto;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: .4px;
    font-weight: 700;
    border: 1px solid transparent;
  }
  .ts.draft { background: rgba(210,153,34,.1); color: var(--yellow); border-color: rgba(210,153,34,.15); }
  .ts.review { background: rgba(63,185,80,.1); color: var(--green); border-color: rgba(63,185,80,.15); }
  .ts.approved { background: rgba(88,166,255,.1); color: var(--accent); border-color: rgba(88,166,255,.15); }
  .ts.implemented { background: rgba(188,140,255,.1); color: var(--purple); border-color: rgba(188,140,255,.15); }
  .ts.idea { background: rgba(188,140,255,.1); color: var(--purple); border-color: rgba(188,140,255,.15); }
  .ts.clickable { cursor: pointer; transition: all .2s var(--ease); }
  .ts.clickable:hover { filter: brightness(1.3); transform: scale(1.08); }
  .ts.updating { opacity: .4; pointer-events: none; }
  .tc { padding-left: 16px; }
  .tc.hid { display: none; }
  .tree-count { font-size: 10px; color: var(--fg3); margin-left: 4px; font-family: var(--mono); }

  /* Status Popover */
  .status-popover {
    position: fixed;
    z-index: 500;
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 6px 0;
    min-width: 150px;
    box-shadow: 0 12px 40px rgba(0,0,0,.6);
    backdrop-filter: var(--glass);
  }
  .status-popover-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    font-size: 12px;
    color: var(--fg);
    cursor: pointer;
    transition: all .15s var(--ease);
    font-weight: 500;
  }
  .status-popover-item:hover { background: rgba(255,255,255,.04); }
  .status-popover-item .sp-dot {
    width: 9px; height: 9px; border-radius: 50%;
  }
  .status-popover-item .sp-dot.draft { background: var(--yellow); }
  .status-popover-item .sp-dot.review { background: var(--green); }
  .status-popover-item .sp-dot.approved { background: var(--accent); }
  .status-popover-item .sp-dot.implemented { background: var(--purple); }
  .status-popover-item .sp-dot.idea { background: var(--purple); }

  /* Stats bar */
  .stats-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
  }
  .sb-item {
    flex: 1;
    text-align: center;
    padding: 14px 6px;
    border-right: 1px solid var(--border);
    transition: background .2s var(--ease);
  }
  .sb-item:last-child { border-right: none; }
  .sb-item:hover { background: rgba(255,255,255,.02); }
  .sb-v { font-size: 24px; font-weight: 800; letter-spacing: -.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sb-l { font-size: 10px; color: var(--fg3); text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; font-weight: 600; }
  .sb-item.bc .sb-v { color: var(--purple); }
  .sb-item.sol .sb-v { color: var(--blue); }
  .sb-item.us .sb-v { color: var(--green); }
  .sb-item.cmp .sb-v { color: var(--yellow); }
  .sb-item.fn .sb-v { color: var(--orange); }
  .sb-item.inf .sb-v { color: var(--red); }
  .sb-item.adr .sb-v { color: var(--fg2); }
  .sb-item.ntf .sb-v { color: var(--purple); }
  .pc-stat.inf .v { color: var(--red); }
  .pc-stat.adr .v { color: var(--fg2); }
  .pc-stat.ntf .v { color: var(--purple); }

  /* Flow */
  .flow { flex: 1; padding: 28px 32px; max-width: 1200px; }

  /* Progress bar */
  .progress { display: flex; align-items: center; margin-bottom: 32px; }
  .p-dot {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--border2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    color: var(--fg3);
    flex-shrink: 0;
    position: relative;
    transition: all .4s var(--ease);
  }
  .p-dot.done { background: var(--green2); border-color: var(--green2); color: #fff; }
  .p-dot.active {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--bg);
    box-shadow: 0 0 0 4px rgba(255,215,0,.15), 0 0 20px rgba(255,215,0,.1);
    animation: pulse-gold 2.5s var(--ease) infinite;
  }
  @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 4px rgba(255,215,0,.15); } 50% { box-shadow: 0 0 0 10px rgba(255,215,0,.08); } }
  .p-line { flex: 1; height: 2px; background: var(--border); transition: background .4s var(--ease); }
  .p-line.done { background: var(--green2); }
  .p-label {
    position: absolute;
    top: 44px;
    font-size: 10px;
    white-space: nowrap;
    color: var(--fg3);
    font-weight: 600;
    letter-spacing: .2px;
  }
  .p-dot.active .p-label { color: var(--gold); font-weight: 700; }
  .p-dot.done .p-label { color: var(--green); }

  /* Step block */
  .step-block {
    background: var(--bg2);
    border: 1px solid var(--gold);
    border-radius: var(--radius);
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 0 24px rgba(255,215,0,.04), var(--shadow);
    position: relative;
    overflow: hidden;
  }
  .step-block::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--gold), transparent);
  }
  .step-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--fg);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -.3px;
  }
  .step-title .badge {
    font-size: 10px;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: var(--bg);
    padding: 3px 12px;
    border-radius: 12px;
    font-weight: 800;
    letter-spacing: .3px;
  }
  .step-sub { font-size: 13px; color: var(--fg2); margin-bottom: 20px; line-height: 1.5; }

  /* Action list */
  .action-list { display: flex; flex-direction: column; gap: 10px; }
  .action-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 18px;
    transition: all .25s var(--ease);
  }
  .action-row:hover { border-color: var(--gold); box-shadow: 0 0 16px rgba(255,215,0,.04); transform: translateX(2px); }
  .action-label { flex: 1; font-size: 13px; line-height: 1.55; }
  .action-label strong { color: var(--fg); font-weight: 700; }
  .action-btn {
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    border: none;
    border-radius: var(--radius-xs);
    padding: 8px 20px;
    color: var(--bg);
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font);
    cursor: pointer;
    white-space: nowrap;
    transition: all .25s var(--ease);
  }
  .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,215,0,.2); }
  .action-btn.copied { background: var(--green2); color: #fff; }

  /* Batch row */
  .batch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .batch-hint { font-size: 12px; color: var(--fg2); }

  /* Completed steps */
  .done-steps { margin-bottom: 20px; }
  .done-step {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 18px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 14px;
    opacity: .6;
    transition: all .2s var(--ease);
  }
  .done-step:hover { opacity: 1; transform: translateX(2px); }
  .done-icon {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--green2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    flex-shrink: 0;
  }
  .done-text { font-size: 13px; }
  .done-text strong { color: var(--fg); font-weight: 700; }

  /* ===== OVERLAYS ===== */
  .overlay-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(1,4,9,.7);
    z-index: 300;
    backdrop-filter: blur(4px);
  }
  .overlay-backdrop.open { display: block; }

  .detail-overlay {
    display: none;
    position: fixed;
    top: 52px;
    right: 0;
    bottom: 0;
    width: min(55vw, 700px);
    background: var(--bg2);
    border-left: 2px solid var(--gold);
    z-index: 310;
    flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,.5);
  }
  .detail-overlay.open { display: flex; }
  .do-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  .do-header h2 {
    font-size: 15px;
    font-weight: 700;
    color: var(--fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    letter-spacing: -.2px;
  }
  .do-status {
    font-size: 9px;
    padding: 3px 10px;
    border-radius: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
    cursor: pointer;
    flex-shrink: 0;
    transition: all .2s var(--ease);
    border: 1px solid transparent;
  }
  .do-status:hover { filter: brightness(1.3); transform: scale(1.05); }
  .do-status.draft { background: rgba(210,153,34,.1); color: var(--yellow); border-color: rgba(210,153,34,.15); }
  .do-status.review { background: rgba(63,185,80,.1); color: var(--green); border-color: rgba(63,185,80,.15); }
  .do-status.approved { background: rgba(88,166,255,.1); color: var(--accent); border-color: rgba(88,166,255,.15); }
  .do-status.implemented { background: rgba(188,140,255,.1); color: var(--purple); border-color: rgba(188,140,255,.15); }
  .do-status.idea { background: rgba(188,140,255,.1); color: var(--purple); border-color: rgba(188,140,255,.15); }
  .pc-desc.placeholder { opacity: .4; font-style: italic; }

  /* Edit icon (pencil) in card header */
  .pc-edit-icon {
    position: absolute; top: 14px; right: 14px; z-index: 2;
    width: 28px; height: 28px; border-radius: 6px;
    background: transparent; border: 1px solid transparent;
    color: var(--fg3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s var(--ease); opacity: 0;
  }
  .project-card:hover .pc-edit-icon { opacity: 1; }
  .pc-edit-icon:hover { background: rgba(255,215,0,.08); border-color: rgba(255,215,0,.2); color: var(--gold); }
  .pc-edit-icon svg { width: 14px; height: 14px; fill: currentColor; }

  /* Delete icon (trash) */
  .pc-delete-icon {
    width: 28px; height: 28px; min-width: 28px; border-radius: 6px;
    background: transparent; border: 1px solid transparent;
    color: var(--fg3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s var(--ease); padding: 0;
  }
  .pc-delete-icon:hover { background: rgba(248,81,73,.08); border-color: rgba(248,81,73,.2); color: var(--red); }
  .pc-delete-icon svg { width: 14px; height: 14px; fill: currentColor; }

  /* Filter popover */
  .filter-popover {
    position: absolute; z-index: 500;
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); padding: 8px 0;
    min-width: 200px; max-height: 320px; overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,.6);
    backdrop-filter: var(--glass);
  }
  .filter-popover-item {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 16px; font-size: 12px; color: var(--fg);
    cursor: pointer; transition: all .15s var(--ease); font-weight: 500;
  }
  .filter-popover-item:hover { background: rgba(255,255,255,.04); }
  .filter-popover-item.active { color: var(--gold); }
  .filter-popover-item .fp-check {
    width: 16px; height: 16px; border-radius: 4px;
    border: 1px solid var(--border2); display: flex;
    align-items: center; justify-content: center;
    font-size: 10px; transition: all .15s var(--ease);
  }
  .filter-popover-item.active .fp-check {
    background: rgba(255,215,0,.15); border-color: var(--gold); color: var(--gold);
  }
  .filter-popover-sep {
    height: 1px; background: var(--border); margin: 4px 0;
  }
  .filter-popover-clear {
    padding: 7px 16px; font-size: 11px; color: var(--fg3);
    cursor: pointer; transition: all .15s var(--ease); font-weight: 600;
  }
  .filter-popover-clear:hover { color: var(--red); background: rgba(248,81,73,.04); }

  /* Filter chips */
  .filter-chips {
    display: flex; gap: 4px; flex-wrap: wrap; align-items: center;
  }
  .filter-chip {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .5px; padding: 2px 8px; border-radius: 8px;
    background: rgba(255,215,0,.1); color: var(--gold);
    border: 1px solid rgba(255,215,0,.2);
    display: flex; align-items: center; gap: 4px;
    cursor: pointer; transition: all .15s var(--ease);
  }
  .filter-chip:hover { background: rgba(255,215,0,.18); }
  .filter-chip .fc-x { font-size: 9px; opacity: .7; }

  /* Dev progress bar (post-100% approval) */
  .pc-dev-bar-row {
    display: flex; align-items: center; gap: 8px;
  }
  .pc-dev-bar-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .5px; min-width: 62px; color: var(--accent);
  }
  .pc-dev-bar {
    flex: 1; height: 7px; background: var(--bg);
    border-radius: 4px; overflow: hidden;
    border: 1px solid var(--border); position: relative;
  }
  .pc-dev-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, var(--accent), var(--purple));
    box-shadow: 0 0 8px rgba(88,166,255,.2);
    transition: width .6s var(--ease);
  }
  .pc-dev-pct {
    font-size: 11px; font-weight: 800; font-family: var(--mono);
    color: var(--accent); min-width: 36px; text-align: right;
    letter-spacing: -.3px;
  }
  .do-body { flex: 1; overflow-y: auto; padding: 20px; }
  .do-body pre {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 18px;
    font-size: 13px;
    line-height: 1.75;
    font-family: var(--mono);
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--fg);
  }

  .val-overlay {
    display: none;
    position: fixed;
    top: 52px;
    right: 0;
    bottom: 0;
    width: min(50vw, 620px);
    background: var(--bg2);
    border-left: 2px solid var(--green);
    z-index: 310;
    flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,.5);
  }
  .val-overlay.open { display: flex; }
  .val-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .val-header h2 { font-size: 15px; font-weight: 700; color: var(--fg); letter-spacing: -.2px; }
  .val-body { flex: 1; overflow-y: auto; padding: 20px; }
  .val-output {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 18px;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .val-output.ok { border-color: var(--green); }
  .val-output.err { border-color: var(--red); }

  /* ===== MODAL ===== */
  .modal-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(1,4,9,.75);
    z-index: 400;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .2s var(--ease);
    backdrop-filter: blur(4px);
  }
  .modal-backdrop.open { display: flex; opacity: 1; }
  .modal-backdrop .modal {
    transform: translateY(12px) scale(.96);
    transition: transform .3s var(--ease);
  }
  .modal-backdrop.open .modal {
    transform: translateY(0) scale(1);
  }
  .modal {
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 30px;
    width: min(460px, 90vw);
    box-shadow: 0 24px 80px rgba(0,0,0,.5);
  }
  .modal h2 { font-size: 20px; font-weight: 800; margin-bottom: 18px; color: var(--fg); letter-spacing: -.4px; }
  .modal label { display: block; font-size: 13px; font-weight: 600; color: var(--fg2); margin-bottom: 6px; }
  .modal input[type=text] {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    color: var(--fg);
    font-size: 14px;
    font-family: var(--font);
    outline: none;
    transition: all .25s var(--ease);
  }
  .modal input[type=text]:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,215,0,.08); }
  .modal .preview {
    margin-top: 10px;
    font-size: 12px;
    color: var(--fg3);
    font-family: var(--mono);
    height: 18px;
  }
  .modal .modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }

  /* ===== ONBOARDING ===== */
  .onboard {
    background: linear-gradient(135deg, rgba(255,215,0,.06), rgba(188,140,255,.04));
    border: 1px solid rgba(255,215,0,.2);
    border-radius: var(--radius);
    padding: 18px 22px;
    margin-bottom: 28px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .onboard-icon { font-size: 24px; flex-shrink: 0; line-height: 1; }
  .onboard-text { font-size: 13px; line-height: 1.65; color: var(--fg2); }
  .onboard-text strong { color: var(--fg); font-weight: 700; }
  .onboard-text kbd {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 7px;
    font-size: 11px;
    font-family: var(--mono);
    color: var(--gold);
  }
  .onboard-dismiss { background: none; border: none; color: var(--fg3); cursor: pointer; font-size: 16px; margin-left: auto; padding: 0; line-height: 1; transition: color .15s; }
  .onboard-dismiss:hover { color: var(--fg); }

  /* ===== CONFIRM DIALOG ===== */
  .confirm-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(1,4,9,.75);
    z-index: 500;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .2s var(--ease);
    backdrop-filter: blur(4px);
  }
  .confirm-backdrop.open { display: flex; opacity: 1; }
  .confirm-backdrop .confirm-box {
    transform: translateY(12px) scale(.96);
    transition: transform .3s var(--ease);
  }
  .confirm-backdrop.open .confirm-box {
    transform: translateY(0) scale(1);
  }
  .confirm-box {
    background: var(--bg2);
    border: 1px solid var(--red);
    border-radius: var(--radius);
    padding: 26px;
    width: min(420px, 90vw);
    box-shadow: 0 24px 80px rgba(0,0,0,.5);
  }
  .confirm-box h3 { font-size: 17px; color: var(--red); margin-bottom: 10px; font-weight: 700; }
  .confirm-box p { font-size: 13px; color: var(--fg2); margin-bottom: 20px; line-height: 1.65; }
  .confirm-box .confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }

  /* ===== MISC ===== */
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid var(--fg3); border-top-color: var(--gold); border-radius: 50%; animation: spin .6s linear infinite; vertical-align: middle; }
  .spinner.lg { width: 24px; height: 24px; border-width: 2.5px; }
  .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; color: var(--fg3); font-size: 13px; font-weight: 500; }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .skeleton-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); height: 180px; position: relative; overflow: hidden; }
  .skeleton-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.03), transparent); background-size: 400px 100%; animation: shimmer 1.5s ease infinite; }
  .btn.loading { pointer-events: none; opacity: .6; }
  .btn.loading::after { content: ''; display: inline-block; width: 12px; height: 12px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin .6s linear infinite; margin-left: 6px; vertical-align: middle; }
  .pc-onboard { font-size: 11px; color: var(--fg3); background: rgba(255,215,0,.03); border: 1px dashed rgba(255,215,0,.15); border-radius: var(--radius-xs); padding: 8px 12px; margin-bottom: 10px; line-height: 1.5; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-state {
    text-align: center;
    padding: 72px 28px;
    color: var(--fg3);
  }
  .empty-state .es-icon { font-size: 44px; margin-bottom: 14px; opacity: .6; }
  .empty-state .es-text { font-size: 16px; margin-bottom: 22px; font-weight: 500; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 7px; height: 7px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,148,158,.2); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(139,148,158,.35); }

  /* Responsive */
  @media (max-width: 600px) {
    .project-view.active { grid-template-columns: 1fr; }
    .sidebar { max-height: 35vh; }
    .detail-overlay, .val-overlay { width: 100vw; }
    .hub-view { padding: 16px 12px; }
    .project-grid { grid-template-columns: 1fr; }
    .hub-title { font-size: 22px; }
    .stats-bar { flex-wrap: wrap; }
    .sb-item { flex: 0 0 25%; }
    .sb-v { font-size: 16px; }
    .sb-l { font-size: 8px; letter-spacing: .3px; }
    .pc-actions .btn { font-size: 10px; padding: 5px 8px; }
    .pc-tabs { margin: 10px -18px 0; }
  }
  @media (min-width: 601px) and (max-width: 900px) {
    .project-view.active { grid-template-columns: 210px 1fr; }
    .detail-overlay { width: min(65vw, 600px); }
    .flow { padding: 20px; }
    .hub-view { padding: 20px 16px; }
    .project-grid { grid-template-columns: 1fr; }
    .sb-v { font-size: 18px; }
    .sb-item { padding: 10px 4px; }
    .sb-l { font-size: 9px; letter-spacing: .5px; }
  }
  @media (min-width: 901px) and (max-width: 1100px) {
    .sb-v { font-size: 20px; }
    .sb-item { padding: 12px 4px; }
  }

  /* ===== SOL-BOARD ===== */
  .sol-board {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .sol-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all .3s var(--ease);
    position: relative;
    overflow: hidden;
  }
  .sol-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--blue), transparent);
    opacity: 0;
    transition: opacity .3s var(--ease);
  }
  .sol-card:hover { border-color: var(--border2); box-shadow: 0 4px 24px rgba(0,0,0,.3); transform: translateY(-1px); }
  .sol-card:hover::before { opacity: 1; }
  .sol-card.reviewed { border-color: var(--green2); opacity: .7; }
  .sol-card.reviewed:hover { opacity: 1; }
  .sol-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    padding: 2px 0;
  }
  .sol-card-head .sol-chevron {
    font-size: 10px;
    color: var(--fg3);
    transition: transform .25s var(--ease);
    flex-shrink: 0;
    width: 16px;
    text-align: center;
  }
  .sol-card.expanded .sol-chevron { transform: rotate(90deg); }
  .sol-card-head .sol-card-status-inline {
    margin-left: auto;
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
    border: 1px solid transparent;
    flex-shrink: 0;
  }
  .sol-card-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height .3s var(--ease), opacity .25s var(--ease);
    opacity: 0;
  }
  .sol-card.expanded .sol-card-body {
    max-height: 400px;
    opacity: 1;
  }
  .sol-card.expanded { gap: 12px; }
  .sol-card-id {
    font-size: 11px;
    font-weight: 800;
    color: var(--blue);
    flex-shrink: 0;
    padding: 3px 9px;
    background: rgba(88,166,255,.08);
    border-radius: var(--radius-xs);
    font-family: var(--mono);
    letter-spacing: .3px;
  }
  .sol-card-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--fg);
    line-height: 1.45;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .sol-card-dots {
    display: flex;
    gap: 7px;
    align-items: center;
  }
  .sol-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--bg4);
    transition: all .25s var(--ease);
    position: relative;
  }
  .sol-dot .sol-dot-lbl {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    font-size: 8px; color: var(--fg3); white-space: nowrap; letter-spacing: .4px; font-weight: 600;
  }
  .sol-dot.filled .sol-dot-lbl { color: var(--green); }
  .sol-dot.filled { background: var(--green); box-shadow: 0 0 6px rgba(63,185,80,.3); }
  .sol-dot-label {
    font-size: 9px;
    color: var(--fg3);
    margin-left: 8px;
    letter-spacing: .4px;
    font-weight: 600;
  }
  .sol-card-stats {
    font-size: 11px;
    color: var(--fg2);
  }
  .sol-card-stats span {
    margin-right: 12px;
  }
  .sol-card-status {
    font-size: 9px;
    padding: 3px 10px;
    border-radius: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
    display: inline-block;
    width: fit-content;
    border: 1px solid transparent;
  }
  .sol-card-status.needs-us { background: rgba(248,81,73,.08); color: var(--red); border-color: rgba(248,81,73,.12); }
  .sol-card-status.needs-cmp { background: rgba(210,153,34,.08); color: var(--yellow); border-color: rgba(210,153,34,.12); }
  .sol-card-status.needs-fn { background: rgba(219,109,40,.08); color: var(--orange); border-color: rgba(219,109,40,.12); }
  .sol-card-status.complete { background: rgba(63,185,80,.08); color: var(--green); border-color: rgba(63,185,80,.12); }
  .sol-card-status.reviewed { background: rgba(88,166,255,.08); color: var(--accent); border-color: rgba(88,166,255,.12); }
  .sol-card-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }
  .sol-card-actions .btn { flex: 1; justify-content: center; font-size: 11px; padding: 7px 10px; }

  /* SOL expand/collapse controls */
  .sol-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
  .sol-controls .btn { font-size: 10px; padding: 3px 10px; }

  /* ===== STORE BUTTONS ===== */
  .store-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .store-section .store-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: var(--fg3);
    margin-bottom: 8px;
  }
  .store-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .store-badge-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border2);
    background: var(--bg3);
    color: var(--fg);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s var(--ease);
  }
  .store-badge-btn:hover { border-color: var(--gold); background: rgba(255,215,0,.06); }
  .store-badge-btn svg { width: 16px; height: 16px; fill: currentColor; }
  .store-badge-btn.configured { border-color: var(--green); color: var(--green); }
  .store-badge-btn.building { border-color: var(--accent); color: var(--accent); animation: pulse-badge 2s var(--ease) infinite; }
  .store-badge-btn.live { border-color: var(--gold); color: var(--gold); background: rgba(255,215,0,.08); }
  .store-status { font-size: 10px; color: var(--fg3); margin-top: 6px; }

  /* Micro-interactions */
  .btn:active { transform: scale(0.97); }
  .btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .pc-tab:focus-visible, .pc-expand-toggle:focus-visible,
  .new-project-card:focus-visible, .tr:focus-visible,
  .qa-btn:focus-visible, .store-badge-btn:focus-visible,
  .filter-popover-item:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  /* Custom tooltips */
  [data-tip] { position: relative; }
  [data-tip]::after {
    content: attr(data-tip); position: absolute; bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%) translateY(4px); background: var(--bg4); color: var(--fg);
    font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: var(--radius-xs);
    white-space: nowrap; border: 1px solid var(--border2); box-shadow: 0 4px 12px rgba(0,0,0,.4);
    opacity: 0; pointer-events: none; transition: opacity .15s var(--ease), transform .15s var(--ease);
    z-index: 600; font-family: var(--font);
  }
  [data-tip]:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* Add-SOL card */
  .sol-add-card {
    background: var(--bg2);
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 140px;
    cursor: pointer;
    transition: all .3s var(--ease);
    gap: 10px;
  }
  .sol-add-card:hover { border-color: var(--gold); background: rgba(255,215,0,.03); transform: translateY(-1px); }
  .sol-add-card .plus-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--fg3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: var(--fg3);
    transition: all .3s var(--ease);
  }
  .sol-add-card:hover .plus-icon { border-color: var(--gold); color: var(--gold); }
  .sol-add-card .plus-label { font-size: 12px; color: var(--fg2); font-weight: 600; }

  /* SOL Summary bar */
  .sol-summary {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    padding: 14px 18px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    flex-wrap: wrap;
  }
  .sol-summary-item {
    font-size: 12px;
    color: var(--fg2);
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .sol-summary-item .val {
    font-weight: 800;
    font-size: 15px;
  }
  .sol-summary-item.complete .val { color: var(--green); }
  .sol-summary-item.wip .val { color: var(--yellow); }
  .sol-summary-item.todo .val { color: var(--fg3); }
  .sol-filter-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 4px 14px;
    font-size: 11px;
    color: var(--fg2);
    cursor: pointer;
    font-family: var(--font);
    transition: all .2s var(--ease);
    font-weight: 600;
  }
  .sol-filter-btn:hover, .sol-filter-btn.active { border-color: var(--gold); color: var(--gold); background: rgba(255,215,0,.06); }

  /* ===== ADD-SOL MODAL ===== */
  .addsol-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(1,4,9,.75);
    z-index: 400;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .2s var(--ease);
    backdrop-filter: blur(4px);
  }
  .addsol-backdrop.open { display: flex; opacity: 1; }
  .addsol-backdrop .addsol-modal {
    transform: translateY(12px) scale(.96);
    transition: transform .3s var(--ease);
  }
  .addsol-backdrop.open .addsol-modal {
    transform: translateY(0) scale(1);
  }
  .addsol-modal {
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 30px;
    width: min(500px, 92vw);
    box-shadow: 0 24px 80px rgba(0,0,0,.5);
  }
  .addsol-modal h2 { font-size: 20px; font-weight: 800; margin-bottom: 6px; color: var(--fg); letter-spacing: -.4px; }
  .addsol-modal .sub { font-size: 13px; color: var(--fg2); margin-bottom: 20px; }
  .addsol-modal label { display: block; font-size: 13px; font-weight: 600; color: var(--fg2); margin-bottom: 6px; }
  .addsol-modal input[type=text], .addsol-modal textarea {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    color: var(--fg);
    font-size: 14px;
    font-family: var(--font);
    outline: none;
    transition: all .25s var(--ease);
    resize: vertical;
  }
  .addsol-modal input:focus, .addsol-modal textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,215,0,.08); }
  .addsol-modal .addsol-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }
  .addsol-mode-row {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
  .addsol-mode-btn {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 16px 14px;
    cursor: pointer;
    text-align: center;
    transition: all .25s var(--ease);
    font-family: var(--font);
    color: var(--fg);
  }
  .addsol-mode-btn:hover { border-color: var(--gold); transform: translateY(-1px); }
  .addsol-mode-btn.selected { border-color: var(--gold); background: rgba(255,215,0,.05); box-shadow: 0 0 0 3px rgba(255,215,0,.06); }
  .addsol-mode-btn .mode-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .addsol-mode-btn .mode-desc { font-size: 11px; color: var(--fg2); }

  /* ===== CHAT PANEL ===== */
  .chat-panel {
    display: none;
    position: fixed;
    top: 52px;
    right: 0;
    bottom: 0;
    width: min(440px, 100vw);
    background: var(--bg2);
    border-left: 2px solid var(--gold);
    z-index: 310;
    flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,.5);
  }
  .chat-panel.open { display: flex; }
  .chat-header {
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }
  .chat-header h3 {
    font-size: 14px; font-weight: 700; color: var(--fg);
    flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    letter-spacing: -.2px;
  }
  .chat-header .badge { font-size: 9px; background: rgba(255,215,0,.1); color: var(--gold); padding: 3px 10px; border-radius: 10px; font-weight: 700; }
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .chat-msg {
    max-width: 88%;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    line-height: 1.65;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .chat-msg.user {
    align-self: flex-end;
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    color: var(--bg);
    border-bottom-right-radius: 4px;
    font-weight: 500;
  }
  .chat-msg.assistant {
    align-self: flex-start;
    background: var(--bg3);
    color: var(--fg);
    border-bottom-left-radius: 4px;
  }
  .chat-msg.system {
    align-self: center;
    background: none;
    color: var(--fg3);
    font-size: 11px;
    font-style: italic;
    padding: 4px;
  }
  .chat-input-row {
    padding: 14px 18px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }
  .chat-input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    color: var(--fg);
    font-size: 13px;
    font-family: var(--font);
    outline: none;
    resize: none;
    min-height: 42px;
    max-height: 120px;
    transition: border-color .25s var(--ease);
  }
  .chat-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,215,0,.08); }
  .chat-send-btn {
    background: linear-gradient(135deg, var(--gold), var(--gold2));
    border: none;
    border-radius: var(--radius-sm);
    padding: 0 18px;
    color: var(--bg);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: var(--font);
    transition: all .25s var(--ease);
    flex-shrink: 0;
  }
  .chat-send-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,215,0,.2); }
  .chat-send-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }
  .chat-actions {
    padding: 12px 18px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .chat-actions .btn { flex: 1; justify-content: center; }
  .chat-not-configured {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 36px;
    text-align: center;
    gap: 14px;
    color: var(--fg3);
  }
  .chat-not-configured .cfg-icon { font-size: 36px; opacity: .6; }
  .chat-not-configured .cfg-text { font-size: 13px; line-height: 1.65; }
  .chat-not-configured code {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px 12px;
    font-family: var(--mono);
    font-size: 11px;
    display: block;
    text-align: left;
    white-space: pre;
    color: var(--fg2);
    overflow-x: auto;
    max-width: 100%;
  }

  /* --- Feedback badge --- */
  .fbk-badge {
    display: inline-block;
    background: var(--gold);
    color: var(--bg);
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
    margin-left: 4px;
    vertical-align: middle;
  }
  .fbk-list { display: flex; flex-direction: column; gap: 6px; }
  .fbk-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; background: var(--bg3); border-radius: var(--radius-xs);
    font-size: 12px; color: var(--fg);
  }
  .fbk-item .fbk-sev {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .fbk-sev.wish { background: var(--blue); }
  .fbk-sev.improvement { background: var(--gold); }
  .fbk-sev.bug { background: var(--red); }
  .fbk-sev.critical { background: #ff4040; box-shadow: 0 0 6px rgba(255,64,64,.5); }
  .fbk-item .fbk-source { font-size: 10px; color: var(--fg3); margin-left: auto; white-space: nowrap; }
  .fbk-item .fbk-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fbk-item .fbk-status { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
  .fbk-status.collected { background: rgba(88,166,255,.15); color: var(--blue); }
  .fbk-status.analyzed { background: rgba(188,140,255,.15); color: var(--purple); }
  .fbk-status.planned { background: rgba(255,215,0,.15); color: var(--gold); }
  .fbk-status.implemented { background: rgba(63,185,80,.15); color: var(--green); }
  .fbk-status.verified { background: rgba(63,185,80,.3); color: var(--green); }

  /* --- Toast --- */
  .toast {
    pointer-events: auto;
    padding: 12px 20px;
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    color: var(--fg);
    font-family: var(--font);
    font-size: 13px;
    box-shadow: 0 8px 30px rgba(0,0,0,.4);
    animation: toastIn .3s var(--ease) forwards;
    max-width: 380px;
  }
  .toast.success { border-color: rgba(63,185,80,.4); }
  .toast.celebrate { border-color: rgba(255,215,0,.4); background: linear-gradient(135deg, var(--bg2), rgba(255,215,0,.06)); }
  .toast.error { border-color: rgba(248,81,73,.4); }
  @keyframes toastIn { from { opacity:0; transform: translateX(40px); } to { opacity:1; transform: translateX(0); } }
  @keyframes toastOut { from { opacity:1; transform: translateX(0); } to { opacity:0; transform: translateX(40px); } }

  /* --- Wizard --- */
  .wiz-progress {
    display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 24px;
  }
  .wiz-step-dot {
    width: 28px; height: 28px; border-radius: 50%; background: var(--bg3); color: var(--fg3);
    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;
    transition: all .3s var(--ease);
  }
  .wiz-step-dot.active { background: var(--gold); color: var(--bg); }
  .wiz-step-dot.done { background: var(--green); color: #fff; }
  .wiz-step-line { width: 40px; height: 2px; background: var(--bg4); }
  .wiz-page { display: none; }
  .wiz-page.active { display: block; }
  .wiz-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .wiz-chip {
    padding: 10px 18px; background: var(--bg3); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); color: var(--fg); cursor: pointer;
    font-family: var(--font); font-size: 13px; transition: all .2s;
  }
  .wiz-chip:hover { border-color: var(--gold); }
  .wiz-chip.selected { background: rgba(255,215,0,.12); border-color: var(--gold); color: var(--gold); }
  .wiz-summary {
    padding: 16px; background: var(--bg3); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--fg); line-height: 1.6;
  }

  /* --- Help tooltip --- */
  .help-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%; background: var(--bg4);
    color: var(--fg3); font-size: 11px; font-weight: 700; cursor: help;
    margin-left: 6px; vertical-align: middle; position: relative;
    transition: all .2s;
  }
  .help-icon:hover { background: var(--gold); color: var(--bg); }
  .help-bubble {
    display: none; position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
    width: 280px; padding: 12px 14px; background: var(--bg2); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); font-size: 12px; font-weight: 400; color: var(--fg);
    line-height: 1.5; box-shadow: 0 12px 40px rgba(0,0,0,.4); z-index: 100; pointer-events: none;
  }
  .help-icon:hover .help-bubble { display: block; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="logo" onclick="showHub()"><em>ARQI</em>TEKT</div>
  <div class="hdr-center" id="hdrCenter">
    <div class="hdr-title" id="hdrTitle">Projects</div>
    <div class="hdr-sub" id="hdrSub"></div>
  </div>
  <div class="breadcrumb" id="breadcrumb"></div>
  <div class="hdr-actions" id="hdrActions"></div>
  <button class="btn sm" id="langToggle" onclick="toggleLang()" style="margin-left:8px;min-width:32px;font-size:11px;padding:2px 8px">DE</button>
</div>

<!-- HUB VIEW -->
<div class="hub-view" id="hubView">
  <div class="hub-title">Projects</div>
  <div class="hub-sub"></div>
  <div class="tag-filter-bar" id="tagFilterBar" style="display:none"></div>
  <div class="hub-controls" id="hubControls" style="display:none">
    <button class="btn sm" onclick="toggleAllPcCards(true)" id="hubExpandAll">Expand All</button>
    <button class="btn sm" onclick="toggleAllPcCards(false)" id="hubCollapseAll">Collapse All</button>
  </div>
  <div class="project-grid" id="projectGrid">
    <div style="padding:40px;text-align:center"><span class="spinner"></span></div>
  </div>
</div>

<!-- PROJECT VIEW -->
<div class="project-view" id="projectView">
  <div class="sidebar">
    <div class="search-box">
      <input class="search-input" type="text" id="searchInput" placeholder="Search... (SOL-3, Matching, ...)" />
    </div>
    <div class="tree" id="tree"></div>
    <div id="crossCuttingTree" class="cc-tree"></div>
    <div class="tracker-panel" id="trackerPanel">
      <div class="tracker-title">Progress</div>
      <div id="trackerContent"></div>
      <div class="quick-actions" id="quickActions"></div>
    </div>
  </div>
  <div class="content">
    <div class="stats-bar">
      <div class="sb-item bc"><div class="sb-v" id="sBC">-</div><div class="sb-l">BC</div></div>
      <div class="sb-item sol"><div class="sb-v" id="sSOL">-</div><div class="sb-l">SOL</div></div>
      <div class="sb-item us"><div class="sb-v" id="sUS">-</div><div class="sb-l">US</div></div>
      <div class="sb-item cmp"><div class="sb-v" id="sCMP">-</div><div class="sb-l">CMP</div></div>
      <div class="sb-item fn"><div class="sb-v" id="sFN">-</div><div class="sb-l">FN</div></div>
      <div class="sb-item inf" style="border-left:2px solid var(--border)"><div class="sb-v" id="sINF">-</div><div class="sb-l">INF</div></div>
      <div class="sb-item adr"><div class="sb-v" id="sADR">-</div><div class="sb-l">ADR</div></div>
      <div class="sb-item ntf"><div class="sb-v" id="sNTF">-</div><div class="sb-l">NTF</div></div>
    </div>
    <div class="flow" id="flow"></div>
  </div>
</div>

<!-- Detail Overlay -->
<div class="overlay-backdrop" id="overlayBackdrop" onclick="closeDetail()"></div>
<div class="detail-overlay" id="detailOverlay">
  <div class="do-header">
    <h2 id="detailOverlayTitle">Detail</h2>
    <span class="do-status" id="doStatus" style="display:none"></span>
    <button class="btn sm" data-i18n="close" onclick="closeDetail()">Close</button>
  </div>
  <div class="do-body" id="doBody"></div>
</div>

<!-- Validation Overlay -->
<div class="val-overlay" id="valOverlay">
  <div class="val-header">
    <h2 id="validationOverlayTitle">Validation</h2>
    <button class="btn sm" data-i18n="close" onclick="closeVal()">Close</button>
  </div>
  <div class="val-body" id="valBody"></div>
</div>

<!-- Create Project Modal -->
<div class="modal-backdrop" id="createModal">
  <div class="modal">
    <h2 id="createModalTitle">Neues Projekt erstellen</h2>
    <label for="projectNameInput" data-i18n="projectName">Projektname</label>
    <input type="text" id="projectNameInput" placeholder="z.B. Fitness App, CRM System..." autocomplete="off" />
    <div class="preview" id="projectPreview"></div>
    <label for="projectDescInput" style="margin-top:12px" data-i18n="descOptional">Beschreibung (optional)</label>
    <input type="text" id="projectDescInput" placeholder="Kurze Projektbeschreibung..." autocomplete="off" />
    <div class="modal-actions">
      <button class="btn" data-i18n="cancel" onclick="closeCreateModal()">Abbrechen</button>
      <button class="btn pri" id="createBtn" data-i18n="create" onclick="doCreateProject()">Erstellen</button>
    </div>
  </div>
</div>

<!-- Import Project Modal -->
<div class="modal-backdrop" id="importModal">
  <div class="modal" style="max-width:520px">
    <h2 id="importModalTitle">Externes Projekt importieren</h2>
    <label for="importPathInput" data-i18n="sourcePath">Quell-Pfad</label>
    <input type="text" id="importPathInput" placeholder="C:\\Users\\...\\MeinProjekt" autocomplete="off" />
    <label for="importNameInput" style="margin-top:12px">Projektname</label>
    <input type="text" id="importNameInput" placeholder="z.B. SCS Play, My Game..." autocomplete="off" />
    <label for="importDescInput" style="margin-top:12px">Beschreibung <span style="opacity:.5">(optional)</span></label>
    <input type="text" id="importDescInput" placeholder="Kurze Projektbeschreibung..." autocomplete="off" />
    <label for="importGithubInput" style="margin-top:12px">GitHub Repo <span style="opacity:.5">(optional, z.B. User/repo)</span></label>
    <input type="text" id="importGithubInput" placeholder="TheoKitsi/my-project" autocomplete="off" />
    <div id="importPreview" style="margin-top:12px;font-size:12px;color:var(--fg3)"></div>
    <div class="modal-actions">
      <button class="btn" data-i18n="cancel" onclick="closeImportModal()">Abbrechen</button>
      <button class="btn pri" data-i18n="importBtn" onclick="doImportProject()">Importieren</button>
    </div>
  </div>
</div>

<!-- Branding Modal -->
<div class="modal-backdrop" id="brandingModal">
  <div class="modal" style="max-width:480px">
    <h2 id="brandingModalTitle">App Branding</h2>
    <div class="branding-grid">
      <div class="branding-field">
        <label>Prim\u00e4rfarbe</label>
        <input type="color" id="brandPrimary" value="#FFD700" />
      </div>
      <div class="branding-field">
        <label>Sekund\u00e4rfarbe</label>
        <input type="color" id="brandSecondary" value="#1F1F1F" />
      </div>
      <div class="branding-field">
        <label>Heading Font</label>
        <select id="brandFontHeading">
          <option value="Inter">Inter</option>
          <option value="Poppins">Poppins</option>
          <option value="Space Grotesk">Space Grotesk</option>
          <option value="DM Sans">DM Sans</option>
          <option value="Manrope">Manrope</option>
        </select>
      </div>
      <div class="branding-field">
        <label>Body Font</label>
        <select id="brandFontBody">
          <option value="Inter">Inter</option>
          <option value="Poppins">Poppins</option>
          <option value="Space Grotesk">Space Grotesk</option>
          <option value="DM Sans">DM Sans</option>
          <option value="Manrope">Manrope</option>
        </select>
      </div>
      <div class="branding-field">
        <label>Mono Font</label>
        <select id="brandFontMono">
          <option value="JetBrains Mono">JetBrains Mono</option>
          <option value="Fira Code">Fira Code</option>
          <option value="Source Code Pro">Source Code Pro</option>
        </select>
      </div>
      <div class="branding-field">
        <label>Modus</label>
        <select id="brandMode">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div class="branding-field" style="grid-column:1/-1">
        <label>Logo Pfad <span style="opacity:.5">(relativ zum Projekt, z.B. assets/logo.png)</span></label>
        <input type="text" id="brandLogo" placeholder="assets/logo.png" />
      </div>
    </div>
    <div class="branding-preview" id="brandingPreview">
      <div class="color-swatch" id="brandSwatchPrimary" style="background:#FFD700"></div>
      <div class="color-swatch" id="brandSwatchSecondary" style="background:#1F1F1F"></div>
      <span style="font-size:12px;color:var(--fg2)" id="brandPreviewText">Inter / JetBrains Mono / Dark</span>
    </div>
    <div class="modal-actions">
      <button class="btn" data-i18n="cancel" onclick="closeBrandingModal()">Abbrechen</button>
      <button class="btn pri" data-i18n="save" onclick="saveBranding()">Speichern</button>
    </div>
  </div>
</div>

<!-- Confirm Delete Dialog -->
<div class="confirm-backdrop" id="confirmDialog">
  <div class="confirm-box">
    <h3 id="confirmTitle">Projekt l\u00f6schen?</h3>
    <p id="confirmText">Alle Dateien werden unwiderruflich gel\u00f6scht.</p>
    <div id="confirmGithubHint" style="display:none;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);border-radius:6px;padding:8px 10px;margin:10px 0;font-size:12px;color:var(--gold)"></div>
    <div id="confirmArtifactCount" style="display:none;font-size:12px;color:var(--fg2);margin:6px 0"></div>
    <div style="margin:12px 0">
      <label for="confirmCodename" style="font-size:12px;color:var(--fg3);display:block;margin-bottom:4px" id="confirmCodenameLabel"></label>
      <input type="text" id="confirmCodename" autocomplete="off" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--fg);font-size:13px;font-family:var(--font);outline:none" />
    </div>
    <div class="confirm-actions">
      <button class="btn" data-i18n="cancel" onclick="closeConfirm()">Abbrechen</button>
      <button class="btn danger" id="confirmDeleteBtn" data-i18n="deleteBtn" onclick="confirmDelete()" disabled>L\u00f6schen</button>
    </div>
  </div>
</div>

<!-- Edit Project Modal -->
<div class="modal-backdrop" id="editModal">
  <div class="modal">
    <h2 id="editModalTitle">Edit Project</h2>
    <label for="editNameInput" data-i18n="projectName">Projektname</label>
    <input type="text" id="editNameInput" autocomplete="off" />
    <div class="preview" id="editPreview"></div>
    <label for="editDescInput" style="margin-top:12px" data-i18n="descLabel">Beschreibung</label>
    <textarea id="editDescInput" rows="3" placeholder="Kurze Projektbeschreibung..." style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--fg);font-size:14px;font-family:var(--font);outline:none;resize:vertical;transition:border-color .15s;"></textarea>
    <div class="modal-actions">
      <button class="btn" data-i18n="cancel" onclick="closeEditModal()">Abbrechen</button>
      <button class="btn pri" id="editBtn" data-i18n="save" onclick="doEditProject()">Speichern</button>
    </div>
  </div>
</div>

<!-- Add Solution Modal -->
<div class="addsol-backdrop" id="addSolModal">
  <div class="addsol-modal">
    <h2 id="addSolModalTitle">Add New Solution</h2>
    <div class="sub" id="addSolModalSub">Extend the Requirement-Tree with a new Solution.</div>
    <div class="addsol-mode-row">
      <div class="addsol-mode-btn selected" id="modeDiscuss" onclick="setAddSolMode('discuss')">
        <div class="mode-title">Discuss</div>
        <div class="mode-desc">Brainstorm with AI, then formalize</div>
      </div>
      <div class="addsol-mode-btn" id="modeDirect" onclick="setAddSolMode('direct')">
        <div class="mode-title">Create Directly</div>
        <div class="mode-desc">Generate prompt, Copilot creates</div>
      </div>
    </div>
    <label for="addSolTitle">Solution Title / Topic</label>
    <input type="text" id="addSolTitle" placeholder="e.g. Gamification System, Recommendation Engine..." autocomplete="off" />
    <div id="addSolExtra" style="margin-top:12px;display:none">
      <label for="addSolNotes">Notes / Keywords (optional)</label>
      <textarea id="addSolNotes" rows="3" placeholder="What should this solution cover? Keywords, ideas..."></textarea>
    </div>
    <div class="addsol-actions">
      <button class="btn" data-i18n="cancel" onclick="closeAddSolModal()">Cancel</button>
      <button class="btn pri" id="addSolBtn" onclick="doAddSol()">Start Discussion</button>
    </div>
  </div>
</div>

<!-- Add User Story Modal -->
<div class="addsol-backdrop" id="addUSModal">
  <div class="addsol-modal">
    <h2 id="addUSTitle">Add New User Story</h2>
    <div class="sub" id="addUSSub">Add a User Story to this Solution.</div>
    <div class="addsol-mode-row">
      <div class="addsol-mode-btn selected" id="usModeDiscuss" onclick="setAddUSMode('discuss')">
        <div class="mode-title">Discuss</div>
        <div class="mode-desc">Brainstorm with AI, then formalize</div>
      </div>
      <div class="addsol-mode-btn" id="usModeDirect" onclick="setAddUSMode('direct')">
        <div class="mode-title">Create Directly</div>
        <div class="mode-desc">Generate prompt, Copilot creates</div>
      </div>
    </div>
    <label for="addUSInputTitle">User Story Title / Topic</label>
    <input type="text" id="addUSInputTitle" placeholder="e.g. Profile Management, Search Filters..." autocomplete="off" />
    <div id="addUSExtra" style="margin-top:12px;display:none">
      <label for="addUSNotes">Notes / Keywords (optional)</label>
      <textarea id="addUSNotes" rows="3" placeholder="What should this user story cover?"></textarea>
    </div>
    <div class="addsol-actions">
      <button class="btn" data-i18n="cancel" onclick="closeAddUSModal()">Cancel</button>
      <button class="btn pri" id="addUSBtn" onclick="doAddUS()">Start Discussion</button>
    </div>
  </div>
</div>

<!-- Chat Panel -->
<div class="chat-panel" id="chatPanel">
  <div class="chat-header">
    <h3 id="chatTitle">Discussion</h3>
    <span class="badge" id="chatBadge"></span>
    <button class="btn sm" onclick="closeChat()">✕</button>
  </div>
  <div class="chat-messages" id="chatMessages"></div>
  <div class="chat-input-row">
    <textarea class="chat-input" id="chatInput" placeholder="Type a message..." rows="1"></textarea>
    <button class="chat-send-btn" id="chatSendBtn" data-i18n="chatSend" onclick="sendChatMessage()">Send</button>
  </div>
  <div class="chat-actions">
    <button class="btn sm" data-i18n="chatSave" onclick="saveChatConversation()">Save</button>
    <button class="btn sm pri" data-i18n="chatFormalize" onclick="formalizeChat()">Formalize → Copilot</button>
  </div>
</div>

<!-- Feedback Modal -->
<div class="modal-backdrop" id="feedbackModal" role="dialog" aria-modal="true" aria-labelledby="fbkModalTitle">
  <div class="modal" style="max-width:520px">
    <h2 id="fbkModalTitle">Feedback hinzufuegen</h2>
    <label for="fbkTitleInput" data-i18n="fbkTitleLabel">Titel</label>
    <input type="text" id="fbkTitleInput" placeholder="z.B. Login zu kompliziert, App stuerzt ab..." autocomplete="off" />
    <label for="fbkSourceSelect" style="margin-top:12px" data-i18n="fbkSource">Quelle</label>
    <select id="fbkSourceSelect" style="width:100%;padding:8px 12px;background:var(--bg3);color:var(--fg);border:1px solid var(--border2);border-radius:var(--radius-xs);font-family:var(--font)">
      <option value="manual">Manuell</option>
      <option value="google-play">Google Play</option>
      <option value="app-store">App Store</option>
      <option value="in-app">In-App</option>
      <option value="email">E-Mail</option>
    </select>
    <label for="fbkSeveritySelect" style="margin-top:12px" data-i18n="fbkSeverity">Dringlichkeit</label>
    <select id="fbkSeveritySelect" style="width:100%;padding:8px 12px;background:var(--bg3);color:var(--fg);border:1px solid var(--border2);border-radius:var(--radius-xs);font-family:var(--font)">
      <option value="wish">Wunsch</option>
      <option value="improvement">Verbesserung</option>
      <option value="bug">Fehler</option>
      <option value="critical">Kritisch</option>
    </select>
    <label for="fbkRatingInput" style="margin-top:12px" data-i18n="fbkRating">Bewertung</label>
    <input type="number" id="fbkRatingInput" min="1" max="5" placeholder="z.B. 3" style="width:80px" />
    <label for="fbkContentInput" style="margin-top:12px" data-i18n="fbkDesc">Beschreibung</label>
    <textarea id="fbkContentInput" rows="4" placeholder="Was hat der Nutzer gesagt? Was ist passiert?"></textarea>
    <div class="modal-actions">
      <button class="btn" data-i18n="cancel" onclick="closeFeedbackModal()">Abbrechen</button>
      <button class="btn pri" data-i18n="save" onclick="doSaveFeedback()">Speichern</button>
    </div>
  </div>
</div>

<!-- Onboarding Wizard Modal -->
<div class="modal-backdrop" id="wizardModal" role="dialog" aria-modal="true" aria-label="Projekt-Assistent">
  <div class="modal" style="max-width:560px">
    <div class="wiz-progress">
      <div class="wiz-step-dot active" data-step="1">1</div>
      <div class="wiz-step-line"></div>
      <div class="wiz-step-dot" data-step="2">2</div>
      <div class="wiz-step-line"></div>
      <div class="wiz-step-dot" data-step="3">3</div>
      <div class="wiz-step-line"></div>
      <div class="wiz-step-dot" data-step="4">4</div>
      <div class="wiz-step-line"></div>
      <div class="wiz-step-dot" data-step="5">5</div>
    </div>
    <div class="wiz-page active" data-wiz="1">
      <h2 id="wizTitle1"></h2>
      <p class="sub" id="wizSub1"></p>
      <textarea id="wizIdeaInput" rows="5" placeholder="z.B. Eine App fuer Fitness-Tracking mit Gamification..."></textarea>
    </div>
    <div class="wiz-page" data-wiz="2">
      <h2 id="wizTitle2"></h2>
      <p class="sub" id="wizSub2"></p>
      <div class="wiz-chips" id="wizAudienceChips">
        <button class="wiz-chip selected" data-val="b2c" onclick="wizSelect(this,'wizAudienceChips')">B2C</button>
        <button class="wiz-chip" data-val="b2b" onclick="wizSelect(this,'wizAudienceChips')">B2B</button>
        <button class="wiz-chip" data-val="both" onclick="wizSelect(this,'wizAudienceChips')">Beide</button>
      </div>
    </div>
    <div class="wiz-page" data-wiz="3">
      <h2 id="wizTitle3"></h2>
      <p class="sub" id="wizSub3"></p>
      <div class="wiz-chips" id="wizPlatformChips">
        <button class="wiz-chip selected" data-val="web" onclick="wizSelect(this,'wizPlatformChips')">Web App</button>
        <button class="wiz-chip" data-val="android" onclick="wizSelect(this,'wizPlatformChips')">Android</button>
        <button class="wiz-chip" data-val="ios" onclick="wizSelect(this,'wizPlatformChips')">iOS</button>
        <button class="wiz-chip" data-val="all" onclick="wizSelect(this,'wizPlatformChips')">Alle</button>
      </div>
    </div>
    <div class="wiz-page" data-wiz="4">
      <h2 id="wizTitle4"></h2>
      <p class="sub" id="wizSub4"></p>
      <input type="text" id="wizNameInput" placeholder="z.B. Fitness App, My CRM..." autocomplete="off" />
      <div class="preview" id="wizPreview"></div>
    </div>
    <div class="wiz-page" data-wiz="5">
      <h2 id="wizTitle5"></h2>
      <p class="sub" id="wizSub5"></p>
      <div class="wiz-summary" id="wizSummary"></div>
    </div>
    <div class="modal-actions">
      <button class="btn" id="wizBackBtn" onclick="wizPrev()" style="display:none"></button>
      <button class="btn pri" id="wizNextBtn" onclick="wizNext()"></button>
    </div>
  </div>
</div>

<!-- Toast Container -->
<div id="toastContainer" style="position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none"></div>

<script>
// ===== STATE =====
let currentProject = null;
let treeData = [];
let solData = [];        // per-SOL analysis from /sol-status
let prompts = [];
let onboardDismissed = localStorage.getItem('arq-onboard-dismissed') === '1';
let deleteTarget = null;
let deleteCodename = null;
let addSolMode = 'discuss';  // 'discuss' | 'direct'
let chatMessages = [];       // current chat conversation
let chatContext = null;      // { relatedTo: 'SOL-18' | 'new', title: '...' }
let chatLLMConfigured = false;
let solFilter = 'all';      // 'all' | 'todo' | 'complete' | 'reviewed'
let solExpandState = {};    // key: projectId:SOL-X, value: true/false
let pcExpandState = {};     // key: projectId, value: true/false (hub card expand)

// Load persisted SOL expand state
try { solExpandState = JSON.parse(localStorage.getItem('arq-sol-expand') || '{}'); } catch(e) {}
try { pcExpandState = JSON.parse(localStorage.getItem('arq-pc-expand') || '{}'); } catch(e) {}

// ===== TOAST SYSTEM =====
function showToast(message, type, duration) {
  type = type || 'success';
  duration = duration || 3500;
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  c.appendChild(el);
  setTimeout(function() {
    el.style.animation = 'toastOut .3s var(--ease) forwards';
    setTimeout(function() { el.remove(); }, 300);
  }, duration);
}

// ===== FEEDBACK UI =====
let feedbackProjectId = null;

function openFeedbackModal(pid) {
  feedbackProjectId = pid;
  document.getElementById('fbkTitleInput').value = '';
  document.getElementById('fbkSourceSelect').value = 'manual';
  document.getElementById('fbkSeveritySelect').value = 'wish';
  document.getElementById('fbkRatingInput').value = '';
  document.getElementById('fbkContentInput').value = '';
  document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').style.display = 'none';
  feedbackProjectId = null;
}

async function doSaveFeedback() {
  if (!feedbackProjectId) return;
  const title = document.getElementById('fbkTitleInput').value.trim();
  if (!title) { document.getElementById('fbkTitleInput').focus(); return; }
  const payload = {
    title: title,
    source: document.getElementById('fbkSourceSelect').value,
    severity: document.getElementById('fbkSeveritySelect').value,
    rating: document.getElementById('fbkRatingInput').value || undefined,
    content: document.getElementById('fbkContentInput').value.trim(),
  };
  try {
    const res = await fetch('/api/projects/' + feedbackProjectId + '/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.id) {
      showToast(t('fbkSaved').replace('{id}', data.id), 'success');
      closeFeedbackModal();
      loadFeedbackList(feedbackProjectId);
      showHub();
    }
  } catch (err) {
    showToast(t('errorPrefix') + err.message, 'error');
  }
}

async function loadFeedbackList(pid) {
  try {
    const res = await fetch('/api/projects/' + pid + '/feedback');
    const items = await res.json();
    const cardId = 'pc-' + pid;
    const el = document.getElementById('fbk-' + cardId);
    if (!el) return;
    if (!items.length) {
      el.innerHTML = '<div class="dev-info" style="text-align:center;padding:12px 0;color:var(--fg3)">' + t('feedbackEmpty') + '</div>';
      return;
    }
    let h = '';
    for (const f of items) {
      h += '<div class="fbk-item">';
      h += '<span class="fbk-sev ' + (f.severity || 'wish') + '"></span>';
      h += '<span class="fbk-title">' + esc(f.title || f.id || '') + '</span>';
      h += '<span class="fbk-status ' + (f.status || 'collected') + '">' + (f.status || 'collected') + '</span>';
      h += '<span class="fbk-source">' + esc(f.source || 'manual') + '</span>';
      h += '</div>';
    }
    el.innerHTML = h;
  } catch {}
}

// ===== WIZARD =====
let wizPage = 1;

function openWizardModal() {
  wizPage = 1;
  document.getElementById('wizIdeaInput').value = '';
  document.getElementById('wizNameInput').value = '';
  updateWizardPage();
  document.getElementById('wizardModal').style.display = 'flex';
}

function closeWizardModal() {
  document.getElementById('wizardModal').style.display = 'none';
}

function wizSelect(btn, containerId) {
  var container = document.getElementById(containerId);
  container.querySelectorAll('.wiz-chip').forEach(function(c) { c.classList.remove('selected'); });
  btn.classList.add('selected');
}

function updateWizardPage() {
  var pages = document.querySelectorAll('.wiz-page');
  pages.forEach(function(p) { p.classList.remove('active'); });
  var current = document.querySelector('.wiz-page[data-wiz="' + wizPage + '"]');
  if (current) current.classList.add('active');
  // Update dots
  document.querySelectorAll('.wiz-step-dot').forEach(function(d) {
    var step = parseInt(d.getAttribute('data-step'));
    d.classList.remove('active', 'done');
    if (step === wizPage) d.classList.add('active');
    else if (step < wizPage) d.classList.add('done');
  });
  // Update titles from i18n
  for (var i = 1; i <= 5; i++) {
    var tEl = document.getElementById('wizTitle' + i);
    var sEl = document.getElementById('wizSub' + i);
    if (tEl) tEl.textContent = t('wizStep' + i);
    if (sEl) sEl.textContent = t('wizStep' + i + 'Sub');
  }
  // Buttons
  document.getElementById('wizBackBtn').style.display = wizPage > 1 ? '' : 'none';
  document.getElementById('wizBackBtn').textContent = t('wizBack');
  if (wizPage < 5) {
    document.getElementById('wizNextBtn').textContent = t('wizNext');
    document.getElementById('wizNextBtn').onclick = wizNext;
  } else {
    document.getElementById('wizNextBtn').textContent = t('wizCreate');
    document.getElementById('wizNextBtn').onclick = doWizardCreate;
    // Build summary
    var idea = document.getElementById('wizIdeaInput').value.trim();
    var audience = (document.querySelector('#wizAudienceChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'b2c';
    var platform = (document.querySelector('#wizPlatformChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'web';
    var name = document.getElementById('wizNameInput').value.trim();
    var sum = '<strong>' + esc(name || 'Unnamed') + '</strong><br>';
    sum += t('wizSummaryIdea') + esc(idea.slice(0, 120)) + (idea.length > 120 ? '...' : '') + '<br>';
    sum += t('wizSummaryAudience') + audience.toUpperCase() + '<br>';
    sum += t('wizSummaryPlatform') + platform;
    document.getElementById('wizSummary').innerHTML = sum;
  }
  // Preview for step 4
  if (wizPage === 4) {
    var ni = document.getElementById('wizNameInput');
    ni.oninput = function() {
      var v = ni.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 30);
      document.getElementById('wizPreview').textContent = v ? t('wizSummaryFolder') + 'XXX_' + v : '';
    };
  }
}

function wizNext() { if (wizPage < 5) { wizPage++; updateWizardPage(); } }
function wizPrev() { if (wizPage > 1) { wizPage--; updateWizardPage(); } }

async function doWizardCreate() {
  var idea = document.getElementById('wizIdeaInput').value.trim();
  var name = document.getElementById('wizNameInput').value.trim();
  if (!name) { wizPage = 4; updateWizardPage(); document.getElementById('wizNameInput').focus(); return; }
  var audience = (document.querySelector('#wizAudienceChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'b2c';
  var platform = (document.querySelector('#wizPlatformChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'web';
  var desc = idea.slice(0, 200);
  try {
    var res = await fetch('/api/projects/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, description: desc, audience: audience, platform: platform, idea: idea })
    });
    var data = await res.json();
    if (data.id) {
      closeWizardModal();
      showToast(t('celebrateBC'), 'celebrate', 5000);
      showHub();
    } else {
      showToast(data.error || 'Error creating project', 'error');
    }
  } catch (err) {
    showToast(t('errorPrefix') + err.message, 'error');
  }
}

function statusBg(s) {
  const m = { 'needs-us':'rgba(255,215,0,0.1)', 'needs-cmp':'rgba(255,215,0,0.1)', 'needs-fn':'rgba(255,215,0,0.1)', 'complete':'rgba(63,185,80,0.12)', 'reviewed':'rgba(88,166,255,0.12)' };
  return m[s] || 'rgba(136,146,164,0.1)';
}
function statusColor(s) {
  const m = { 'needs-us':'var(--gold)', 'needs-cmp':'var(--gold)', 'needs-fn':'var(--gold)', 'complete':'var(--green)', 'reviewed':'var(--accent)' };
  return m[s] || 'var(--fg3)';
}
function statusBorder(s) {
  const m = { 'needs-us':'rgba(255,215,0,0.25)', 'needs-cmp':'rgba(255,215,0,0.25)', 'needs-fn':'rgba(255,215,0,0.25)', 'complete':'rgba(63,185,80,0.25)', 'reviewed':'rgba(88,166,255,0.25)' };
  return m[s] || 'rgba(136,146,164,0.15)';
}

function toggleSolCard(key) {
  solExpandState[key] = !solExpandState[key];
  localStorage.setItem('arq-sol-expand', JSON.stringify(solExpandState));
  const card = document.querySelector('[data-sol-key="' + key + '"]');
  if (card) card.classList.toggle('expanded', solExpandState[key]);
}

function toggleAllSolCards(expand) {
  document.querySelectorAll('.sol-card[data-sol-key]').forEach(card => {
    const key = card.getAttribute('data-sol-key');
    solExpandState[key] = expand;
    card.classList.toggle('expanded', expand);
  });
  localStorage.setItem('arq-sol-expand', JSON.stringify(solExpandState));
}

function togglePcCard(pid) {
  pcExpandState[pid] = !pcExpandState[pid];
  localStorage.setItem('arq-pc-expand', JSON.stringify(pcExpandState));
  const card = document.getElementById('card-' + pid);
  if (card) {
    card.classList.toggle('expanded', pcExpandState[pid]);
    const lbl = card.querySelector('.pc-expand-toggle span:last-child');
    if (lbl) lbl.textContent = pcExpandState[pid] ? t('collapseCard') : t('expandCard');
  }
}

function toggleAllPcCards(expand) {
  document.querySelectorAll('.project-card[id^="card-"]').forEach(card => {
    const pid = card.id.replace('card-', '');
    pcExpandState[pid] = expand;
    card.classList.toggle('expanded', expand);
    const lbl = card.querySelector('.pc-expand-toggle span:last-child');
    if (lbl) lbl.textContent = expand ? t('collapseCard') : t('expandCard');
  });
  localStorage.setItem('arq-pc-expand', JSON.stringify(pcExpandState));
}

// ===== i18n =====
let currentLang = localStorage.getItem('arq-lang') || 'de';
const i18n = {
  de: {
    projects: 'Projekte', hubSub: 'Deine Apps und Projekte',
    hubSubFull: 'Von der Idee bis zum App Store \u2014 Schritt fuer Schritt',
    storeConfig: 'Store konfigurieren', storeBuild: 'Release bauen', storeUpload: 'Hochladen',
    storeGHActions: 'CI/CD Pipeline', storePush: 'Push to GitHub',
    expandAll: 'Alle aufklappen', collapseAll: 'Alle zuklappen',
    newProject: 'Neues Projekt', import: 'Import', dashboard: 'Dashboard', edit: 'Bearbeiten',
    planning: 'Planung', ready: 'Bereit', building: 'Wird gebaut...', built: 'Gebaut', running: 'Aktiv', deployed: 'Veroeffentlicht',
    validate: 'Pruefen', refresh: 'Aktualisieren',
    authored: 'Fortschritt', approved: 'Freigabe',
    // Harald-friendly step names
    nsCreateBC: 'Geschaeftsidee beschreiben', nsDeriveSol: 'Loesungsansaetze ableiten',
    nsCreateUS: 'Nutzerszenarien erstellen', nsDefineCmp: 'Bausteine definieren',
    nsSpecifyFn: 'Features spezifizieren', nsReview: 'Qualitaetspruefung durchfuehren',
    nsStartDev: 'Entwicklung starten', nsScaffold: 'App generieren',
    nsStartApp: 'App starten / testen', nsDeploy: 'Veroeffentlichen',
    reviewComplete: 'Pruefung abgeschlossen', startDev: 'Entwicklung starten \u2192', moreIdeas: 'Weitere Ideen hinzufuegen',
    devSection: 'Entwicklung', opsSection: 'Betrieb', planSection: 'Planung',
    scaffold: 'App generieren', branding: 'Design', runTests: 'Tests starten', setupPlaywright: 'Tests einrichten',
    noApp: 'Noch keine App generiert. Nutze den Entwicklung-Tab um deine App zu erstellen.',
    appStart: 'App starten', appStop: 'App stoppen', openCode: 'Code oeffnen',
    appExists: 'Vorhanden', appNotGen: 'Nicht generiert', appProd: 'Produktiv starten', openBrowser: 'Im Browser oeffnen',
    onboardHint: 'Beschreibe deine Idee, um loszulegen. Der KI-Assistent hilft dir bei jedem Schritt.',
    exportIssues: 'Issues exportieren', generateTests: 'Tests generieren \u2192 Copilot',
    expandCard: 'Details', collapseCard: 'Weniger',
    expandAllCards: 'Alle aufklappen', collapseAllCards: 'Alle zuklappen',
    nsRemediation: 'Nachbesserung abschliessen', nsFixFindings: 'Pruefungsergebnisse beheben',
    devProgress: 'Entwicklungsfortschritt', filterBtn: 'Filter', clearAll: 'Alle entfernen',
    deleteConfirmTitle: 'Projekt loeschen?',
    deleteGithubHint: 'Dieses Projekt existiert auch auf GitHub. Nur die lokale Kopie wird geloescht.',
    deleteTypeConfirm: 'Tippe "{codename}" zur Bestaetigung:',
    deleteArtifactCount: '{n} Eintraege werden unwiderruflich geloescht.',
    // Feedback
    feedbackSection: 'Feedback', feedbackAdd: 'Feedback hinzufuegen',
    feedbackOpen: 'offen', feedbackPlanned: 'geplant', feedbackDone: 'erledigt',
    feedbackSourceManual: 'Manuell', feedbackSourceGPlay: 'Google Play', feedbackSourceAppStore: 'App Store',
    feedbackSourceInApp: 'In-App', feedbackSourceEmail: 'E-Mail',
    feedbackSevWish: 'Wunsch', feedbackSevImprovement: 'Verbesserung', feedbackSevBug: 'Fehler', feedbackSevCritical: 'Kritisch',
    feedbackTitle: 'Was hat der Nutzer gesagt?', feedbackConvert: 'In Anforderung umwandeln',
    feedbackEmpty: 'Noch kein Feedback. Erfasse Rueckmeldungen von Nutzern hier.',
    feedbackBadge: '{n} offen',
    // Help system
    helpBC: 'Beschreibe deine App-Idee in eigenen Worten. Was ist das Problem? Wer soll die App nutzen? Was macht sie besonders?',
    helpSOL: 'Loesungsansaetze sind die grossen Funktionsbereiche deiner App. Stell dir vor, du beschreibst einem Freund: "Meine App hat ein Matching-System, einen Chat und Profile."',
    helpUS: 'Nutzerszenarien beschreiben, was ein konkreter Nutzer mit deiner App machen kann. Zum Beispiel: "Als Nutzer moechte ich mein Profil bearbeiten."',
    helpCMP: 'Bausteine sind die Lego-Teile deiner App. Jedes Nutzerszenario besteht aus einem oder mehreren Bausteinen (z.B. Profilformular, Chat-Fenster, Benachrichtigungsleiste).',
    helpFN: 'Features sind die einzelnen Funktionen innerhalb eines Bausteins. Zum Beispiel: "Profilbild hochladen", "Nachricht senden", "Push-Benachrichtigung anzeigen".',
    helpREV: 'In der Qualitaetspruefung kontrolliert der KI-Assistent, ob alles vollstaendig und konsistent ist \u2014 bevor du mit der Entwicklung startest.',
    helpValidate: 'Prueft dein Projekt auf Vollstaendigkeit und Fehler. Gruene Haken = alles gut. Rote Punkte = hier fehlt noch etwas.',
    helpScaffold: 'Erzeugt automatisch die komplette App aus deinen Anforderungen: Seiten, Bausteine, Code-Geruest \u2014 bereit zum Weiterentwickeln.',
    // Wizard
    wizStep1: 'Was ist deine Idee?', wizStep1Sub: 'Beschreibe deine App, dein Spiel oder deine Plattform in eigenen Worten. Keine Fachbegriffe noetig.',
    wizStep2: 'Fuer wen ist es?', wizStep2Sub: 'Wer soll deine App nutzen?',
    wizStep3: 'Welche Plattform?', wizStep3Sub: 'Wo soll deine App laufen?',
    wizStep4: 'Gib deinem Projekt einen Namen', wizStep4Sub: 'Keine Sorge, du kannst ihn spaeter aendern.',
    wizStep5: 'Alles bereit!', wizStep5Sub: 'Dein Projekt wird erstellt und der KI-Assistent startet mit dir.',
    wizPlatformWeb: 'Web App', wizPlatformAndroid: 'Android', wizPlatformIOS: 'iOS', wizPlatformAll: 'Alle Plattformen',
    wizAudienceConsumer: 'Endnutzer (B2C)', wizAudienceBusiness: 'Unternehmen (B2B)', wizAudienceBoth: 'Beide',
    wizCreate: 'Projekt erstellen', wizNext: 'Weiter', wizBack: 'Zurueck',
    // Celebrations
    celebrateBC: 'Deine Geschaeftsidee steht! Der KI-Assistent hilft dir als naechstes, Loesungsansaetze abzuleiten.',
    celebrateSOL: 'Dein Projekt hat jetzt {n} Loesungsansaetze. Das ist eine solide Grundlage!',
    celebrateUS: 'Alle Nutzerszenarien sind definiert. Jetzt werden die Bausteine abgeleitet.',
    celebrateFN: 'Alle Features sind spezifiziert! Zeit fuer die Qualitaetspruefung.',
    celebrateReady: 'Glueckwunsch! Dein Projekt ist bereit fuer die Entwicklung.',
    celebrateDeployed: 'Deine App ist live! Ab jetzt kannst du Nutzerfeedback sammeln.',
    // UI labels (modals, buttons, static HTML)
    cancel: 'Abbrechen', save: 'Speichern', deleteBtn: 'Loeschen', close: 'Schliessen',
    modalCreateTitle: 'Neues Projekt erstellen', projectName: 'Projektname',
    descOptional: 'Beschreibung (optional)', descLabel: 'Beschreibung',
    modalImportTitle: 'Externes Projekt importieren', sourcePath: 'Quell-Pfad',
    importBtn: 'Importieren', modalBrandingTitle: 'App Branding',
    primaryColor: 'Primaerfarbe', secondaryColor: 'Sekundaerfarbe',
    logoPath: 'Logo Pfad', modeLabel: 'Modus',
    editProject: 'Projekt bearbeiten',
    addSolTitle: 'Neue Loesung hinzufuegen', addSolSub: 'Erweitere den Anforderungsbaum mit einer neuen Loesung.',
    modeDiscuss: 'Diskutieren', modeDiscussSub: 'Mit KI brainstormen, dann formalisieren',
    modeDirect: 'Direkt erstellen', modeDirectSub: 'Prompt generieren, Copilot erstellt',
    solTitleLabel: 'Titel / Thema der Loesung', notesLabel: 'Notizen / Stichworte (optional)',
    startDiscussion: 'Diskussion starten',
    addUSModalTitle: 'Neues Nutzerszenario', addUSSub: 'Fuege ein Nutzerszenario zu dieser Loesung hinzu.',
    usTitleLabel: 'Titel / Thema des Nutzerszenarios',
    chatDiscussion: 'Diskussion', chatSend: 'Senden', chatSave: 'Speichern',
    chatFormalize: 'Formalisieren \u2192 Copilot', chatPlaceholder: 'Nachricht eingeben...',
    fbkModalTitle: 'Feedback hinzufuegen', fbkTitleLabel: 'Titel',
    fbkSource: 'Quelle', fbkSeverity: 'Dringlichkeit', fbkRating: 'Bewertung',
    fbkDesc: 'Beschreibung',
    noDescription: 'Keine Beschreibung',
    statBC: 'Idee', statSOL: 'Loesungen', statUS: 'Szenarien', statCMP: 'Bausteine', statFN: 'Features',
    statINF: 'Infrastruktur', statADR: 'Entscheidungen', statNTF: 'Hinweise',
    vsCode: 'VS Code', backToProjects: '\u2190 Projekte',
    stepLabel: 'Schritt', done: 'fertig', open: 'offen', reviewed: 'geprueft',
    filterAll: 'Alle', filterOpen: 'Offen', filterDone: 'Fertig',
    needsUS: 'Nutzerszenarien fehlen', needsCMP: 'Bausteine fehlen', needsFN: 'Features fehlen',
    solComplete: 'Fertig', solReviewed: 'Geprueft',
    readyForReview: 'bereit zur Pruefung', batchCopilot: 'Batch \u2192 Copilot', reviewCopilot: 'Review \u2192 Copilot',
    exportTree: 'Anforderungsbaum exportieren', toCopilot: '\u2192 Copilot',
    devReady: 'Das Projekt ist bereit fuer die Implementierung.',
    devBuilding: 'Die Anwendung wird generiert...', devBuilt: 'Die Anwendung ist generiert und bereit zum Starten.',
    devRunning: 'Die Anwendung laeuft.', devDeployed: 'Die Anwendung ist deployed.',
    scaffoldCopilot: 'Scaffold App \u2192 Copilot', autoScaffold: 'Auto-Scaffold',
    buildProgress: 'Build in progress...', genTestsReq: 'E2E Tests aus Anforderungen generieren:',
    promptCopied: 'Prompt kopiert! Fuege ihn in Copilot Chat ein.', copied: 'Kopiert!',
    storeDeploy: 'Store Deploy', storeUploadBtn: 'In Store hochladen',
    noMatches: 'Keine Treffer', notFound: 'Nicht gefunden',
    howItWorks: 'So funktioniert es:', searchPlaceholder: 'Suchen... (SOL-3, Matching, ...)',
    progressTitle: 'Fortschritt', detailTitle: 'Detail', validationTitle: 'Validierung',
    runningValidation: 'Pruefung laeuft...',
    addUS: '+ US', chatBtn: 'Chat',
    solDotSolution: 'Loesung', solDotScenarios: 'Szenarien', solDotBlocks: 'Bausteine',
    solDotFeatures: 'Features', solDotReview: 'Pruefung', solDotPending: 'ausstehend',
    devHeading: 'Entwicklung',
    confirmScaffold: 'Anwendung aus Requirements generieren?',
    confirmForceScaffold: 'Force Scaffold: Implementierung erzwingen?',
    confirmExport: 'GitHub Issues aus Requirements exportieren?',
    confirmPush: 'App-Code zum TK.Apps Monorepo pushen?',
    confirmStoreBuild: 'Release-Build starten?',
    confirmBuildDeploy: 'Production Build + Start?',
    confirmPlaywright: 'Playwright E2E Testing im Projekt einrichten?',
    savedConv: 'Diskussion gespeichert.', discussFirst: 'Fuehre zuerst eine Diskussion.',
    formalized: 'Formalisierungs-Prompt in Zwischenablage kopiert.',
    requiredFields: 'Pflichtfelder fehlen.',
    noEmpty: 'Noch keine Projekte',
    batchNeedUS: '{n} Loesungsansaetze brauchen Nutzerszenarien',
    batchNeedCMP: '{n} Loesungsansaetze brauchen Bausteine',
    batchNeedFN: '{n} Loesungsansaetze brauchen Features',
    batchReadyReview: '{n} Loesungsansaetze bereit zur Pruefung',
    pressGold: 'Druecke auf die goldenen Buttons, um Copilot-Prompts zu kopieren.',
    genTestsCopilot: 'Tests generieren \u2192 Copilot',
    errorPrefix: 'Fehler: ',
    fbkSaved: 'Feedback {id} gespeichert',
    wizSummaryIdea: 'Idee: ', wizSummaryAudience: 'Zielgruppe: ', wizSummaryPlatform: 'Plattform: ', wizSummaryFolder: 'Ordner: ',
    importError: 'Import-Fehler: ', importSuccess: 'Projekt importiert: {id} mit {n} Dateien.',
  },
  en: {
    projects: 'Projects', hubSub: 'Your apps and projects',
    hubSubFull: 'From Idea to App Store \u2014 Step by Step',
    storeConfig: 'Configure Store', storeBuild: 'Build Release', storeUpload: 'Upload',
    storeGHActions: 'CI/CD Pipeline', storePush: 'Push to GitHub',
    expandAll: 'Expand All', collapseAll: 'Collapse All',
    newProject: 'New Project', import: 'Import', dashboard: 'Dashboard', edit: 'Edit',
    planning: 'Planning', ready: 'Ready', building: 'Building...', built: 'Built', running: 'Running', deployed: 'Published',
    validate: 'Check', refresh: 'Refresh',
    authored: 'Progress', approved: 'Approved',
    // Harald-friendly step names
    nsCreateBC: 'Describe your idea', nsDeriveSol: 'Derive solution approaches',
    nsCreateUS: 'Create user scenarios', nsDefineCmp: 'Define building blocks',
    nsSpecifyFn: 'Specify features', nsReview: 'Run quality check',
    nsStartDev: 'Start development', nsScaffold: 'Generate app',
    nsStartApp: 'Start / test app', nsDeploy: 'Publish',
    reviewComplete: 'Quality check complete', startDev: 'Start development \u2192', moreIdeas: 'Add more ideas',
    devSection: 'Development', opsSection: 'Operations', planSection: 'Planning',
    scaffold: 'Generate App', branding: 'Design', runTests: 'Run Tests', setupPlaywright: 'Setup Tests',
    noApp: 'No app generated yet. Use the Development tab to generate your app first.',
    appStart: 'Start App', appStop: 'Stop App', openCode: 'Open Code',
    appExists: 'Available', appNotGen: 'Not generated', appProd: 'Production Start', openBrowser: 'Open in Browser',
    onboardHint: 'Describe your idea to get started. The AI assistant will guide you at every step.',
    exportIssues: 'Export Issues', generateTests: 'Generate Tests \u2192 Copilot',
    expandCard: 'Details', collapseCard: 'Less',
    expandAllCards: 'Expand All', collapseAllCards: 'Collapse All',
    nsRemediation: 'Complete Remediation', nsFixFindings: 'Fix Review Findings',
    devProgress: 'Development Progress', filterBtn: 'Filter', clearAll: 'Clear all',
    deleteConfirmTitle: 'Delete project?',
    deleteGithubHint: 'This project also exists on GitHub. Only the local copy will be deleted.',
    deleteTypeConfirm: 'Type "{codename}" to confirm:',
    deleteArtifactCount: '{n} entries will be permanently deleted.',
    // Feedback
    feedbackSection: 'Feedback', feedbackAdd: 'Add Feedback',
    feedbackOpen: 'open', feedbackPlanned: 'planned', feedbackDone: 'done',
    feedbackSourceManual: 'Manual', feedbackSourceGPlay: 'Google Play', feedbackSourceAppStore: 'App Store',
    feedbackSourceInApp: 'In-App', feedbackSourceEmail: 'Email',
    feedbackSevWish: 'Wish', feedbackSevImprovement: 'Improvement', feedbackSevBug: 'Bug', feedbackSevCritical: 'Critical',
    feedbackTitle: 'What did the user say?', feedbackConvert: 'Convert to Requirement',
    feedbackEmpty: 'No feedback yet. Capture user feedback here.',
    feedbackBadge: '{n} open',
    // Help system
    helpBC: 'Describe your app idea in your own words. What problem does it solve? Who will use it? What makes it special?',
    helpSOL: 'Solution approaches are the major feature areas of your app. Imagine telling a friend: "My app has a matching system, a chat, and profiles."',
    helpUS: 'User scenarios describe what a real user can do with your app. For example: "As a user I want to edit my profile."',
    helpCMP: 'Building blocks are the Lego pieces of your app. Each user scenario consists of one or more blocks (e.g. profile form, chat window, notification bar).',
    helpFN: 'Features are the individual functions inside a building block. For example: "Upload profile picture", "Send message", "Show push notification".',
    helpREV: 'The quality check verifies that everything is complete and consistent \u2014 before you start development.',
    helpValidate: 'Checks your project for completeness and errors. Green checks = all good. Red dots = something is still missing.',
    helpScaffold: 'Automatically generates the complete app from your requirements: pages, building blocks, code skeleton \u2014 ready for further development.',
    // Wizard
    wizStep1: 'What is your idea?', wizStep1Sub: 'Describe your app, game, or platform in your own words. No technical terms needed.',
    wizStep2: 'Who is it for?', wizStep2Sub: 'Who should use your app?',
    wizStep3: 'What platform?', wizStep3Sub: 'Where should your app run?',
    wizStep4: 'Name your project', wizStep4Sub: 'Don\\'t worry, you can change it later.',
    wizStep5: 'All set!', wizStep5Sub: 'Your project will be created and the AI assistant starts with you.',
    wizPlatformWeb: 'Web App', wizPlatformAndroid: 'Android', wizPlatformIOS: 'iOS', wizPlatformAll: 'All Platforms',
    wizAudienceConsumer: 'Consumers (B2C)', wizAudienceBusiness: 'Businesses (B2B)', wizAudienceBoth: 'Both',
    wizCreate: 'Create Project', wizNext: 'Next', wizBack: 'Back',
    // Celebrations
    celebrateBC: 'Your business idea is defined! The AI assistant will help you derive solution approaches next.',
    celebrateSOL: 'Your project now has {n} solution approaches. That\\'s a solid foundation!',
    celebrateUS: 'All user scenarios are defined. Now the building blocks will be derived.',
    celebrateFN: 'All features are specified! Time for the quality check.',
    celebrateReady: 'Congratulations! Your project is ready for development.',
    celebrateDeployed: 'Your app is live! You can now start collecting user feedback.',
    // UI labels (modals, buttons, static HTML)
    cancel: 'Cancel', save: 'Save', deleteBtn: 'Delete', close: 'Close',
    modalCreateTitle: 'Create New Project', projectName: 'Project Name',
    descOptional: 'Description (optional)', descLabel: 'Description',
    modalImportTitle: 'Import External Project', sourcePath: 'Source Path',
    importBtn: 'Import', modalBrandingTitle: 'App Branding',
    primaryColor: 'Primary Color', secondaryColor: 'Secondary Color',
    logoPath: 'Logo Path', modeLabel: 'Mode',
    editProject: 'Edit Project',
    addSolTitle: 'Add New Solution', addSolSub: 'Extend the Requirement-Tree with a new Solution.',
    modeDiscuss: 'Discuss', modeDiscussSub: 'Brainstorm with AI, then formalize',
    modeDirect: 'Create Directly', modeDirectSub: 'Generate prompt, Copilot creates',
    solTitleLabel: 'Solution Title / Topic', notesLabel: 'Notes / Keywords (optional)',
    startDiscussion: 'Start Discussion',
    addUSModalTitle: 'Add New User Story', addUSSub: 'Add a User Story to this Solution.',
    usTitleLabel: 'User Story Title / Topic',
    chatDiscussion: 'Discussion', chatSend: 'Send', chatSave: 'Save',
    chatFormalize: 'Formalize \u2192 Copilot', chatPlaceholder: 'Type a message...',
    fbkModalTitle: 'Add Feedback', fbkTitleLabel: 'Title',
    fbkSource: 'Source', fbkSeverity: 'Severity', fbkRating: 'Rating',
    fbkDesc: 'Description',
    noDescription: 'No description',
    statBC: 'Idea', statSOL: 'Solutions', statUS: 'Scenarios', statCMP: 'Blocks', statFN: 'Features',
    statINF: 'Infrastructure', statADR: 'Decisions', statNTF: 'Notifications',
    vsCode: 'VS Code', backToProjects: '\u2190 Projects',
    stepLabel: 'Step', done: 'done', open: 'open', reviewed: 'reviewed',
    filterAll: 'All', filterOpen: 'Open', filterDone: 'Done',
    needsUS: 'User scenarios missing', needsCMP: 'Building blocks missing', needsFN: 'Features missing',
    solComplete: 'Complete', solReviewed: 'Reviewed',
    readyForReview: 'ready for review', batchCopilot: 'Batch \u2192 Copilot', reviewCopilot: 'Review \u2192 Copilot',
    exportTree: 'Export Requirement-Tree', toCopilot: '\u2192 Copilot',
    devReady: 'The project is ready for implementation.',
    devBuilding: 'The application is being generated...', devBuilt: 'The application is generated and ready to start.',
    devRunning: 'The application is running.', devDeployed: 'The application is deployed.',
    scaffoldCopilot: 'Scaffold App \u2192 Copilot', autoScaffold: 'Auto-Scaffold',
    buildProgress: 'Build in progress...', genTestsReq: 'Generate E2E tests from requirements:',
    promptCopied: 'Prompt copied! Paste it into Copilot Chat.', copied: 'Copied!',
    storeDeploy: 'Store Deploy', storeUploadBtn: 'Upload to Store',
    noMatches: 'No matches', notFound: 'Not found',
    howItWorks: 'How it works:', searchPlaceholder: 'Search... (SOL-3, Matching, ...)',
    progressTitle: 'Progress', detailTitle: 'Detail', validationTitle: 'Validation',
    runningValidation: 'Running validation...',
    addUS: '+ US', chatBtn: 'Chat',
    solDotSolution: 'Solution', solDotScenarios: 'Scenarios', solDotBlocks: 'Blocks',
    solDotFeatures: 'Features', solDotReview: 'Review', solDotPending: 'pending',
    devHeading: 'Development',
    confirmScaffold: 'Generate application from requirements?',
    confirmForceScaffold: 'Force Scaffold: Generate implementation anyway?',
    confirmExport: 'Export requirements as GitHub Issues?',
    confirmPush: 'Push app code to TK.Apps monorepo?',
    confirmStoreBuild: 'Start release build?',
    confirmBuildDeploy: 'Production Build + Start?',
    confirmPlaywright: 'Set up Playwright E2E Testing?',
    savedConv: 'Discussion saved.', discussFirst: 'Have a discussion first.',
    formalized: 'Formalization prompt copied to clipboard.',
    requiredFields: 'Required fields missing.',
    noEmpty: 'No projects yet',
    batchNeedUS: '{n} solutions need user scenarios',
    batchNeedCMP: '{n} solutions need building blocks',
    batchNeedFN: '{n} solutions need features',
    batchReadyReview: '{n} solutions ready for review',
    pressGold: 'Press the golden buttons to copy Copilot prompts.',
    genTestsCopilot: 'Generate Tests \u2192 Copilot',
    errorPrefix: 'Error: ',
    fbkSaved: 'Feedback {id} saved',
    wizSummaryIdea: 'Idea: ', wizSummaryAudience: 'Audience: ', wizSummaryPlatform: 'Platform: ', wizSummaryFolder: 'Folder: ',
    importError: 'Import error: ', importSuccess: 'Project imported: {id} with {n} files.',
  }
};
function t(key) { return (i18n[currentLang] || i18n.de)[key] || key; }

function localizeUI() {
  // Patch static HTML modals & overlays with i18n translations
  const map = {
    // Create modal
    'createModalTitle': 'modalCreateTitle',
    // Import modal
    'importModalTitle': 'modalImportTitle',
    // Branding modal
    'brandingModalTitle': 'modalBrandingTitle',
    // Edit modal
    'editModalTitle': 'editProject',
    // Delete confirm
    'confirmTitle': 'deleteConfirmTitle',
    // Add Solution modal
    'addSolModalTitle': 'addSolTitle',
    'addSolModalSub': 'addSolSub',
    // Add US modal  
    'addUSTitle': 'addUSModalTitle',
    'addUSSub': 'addUSSub',
    // Feedback modal
    'fbkModalTitle': 'fbkModalTitle',
    // Chat panel
    'chatTitle': 'chatDiscussion',
    // Overlays
    'detailOverlayTitle': 'detailTitle',
    'validationOverlayTitle': 'validationTitle',
    'trackerTitle': 'progressTitle',
  };
  for (const [elId, key] of Object.entries(map)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = t(key);
  }
  // Patch button labels
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  // Patch select options in feedback modal
  var srcSel = document.getElementById('fbkSourceSelect');
  if (srcSel) {
    var srcKeys = ['feedbackSourceManual','feedbackSourceGPlay','feedbackSourceAppStore','feedbackSourceInApp','feedbackSourceEmail'];
    srcSel.querySelectorAll('option').forEach(function(opt, i) { if (srcKeys[i]) opt.textContent = t(srcKeys[i]); });
  }
  var sevSel = document.getElementById('fbkSeveritySelect');
  if (sevSel) {
    var sevKeys = ['feedbackSevWish','feedbackSevImprovement','feedbackSevBug','feedbackSevCritical'];
    sevSel.querySelectorAll('option').forEach(function(opt, i) { if (sevKeys[i]) opt.textContent = t(sevKeys[i]); });
  }
  // Patch wizard audience/platform chips
  var audChips = document.querySelectorAll('#wizAudienceChips .wiz-chip');
  var audKeys = ['wizAudienceConsumer','wizAudienceBusiness','wizAudienceBoth'];
  audChips.forEach(function(c,i) { if (audKeys[i]) c.textContent = t(audKeys[i]); });
  var platChips = document.querySelectorAll('#wizPlatformChips .wiz-chip');
  var platKeys = ['wizPlatformWeb','wizPlatformAndroid','wizPlatformIOS','wizPlatformAll'];
  platChips.forEach(function(c,i) { if (platKeys[i]) c.textContent = t(platKeys[i]); });
  // Search placeholder
  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  // Chat input placeholder
  var chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = t('chatPlaceholder');
}

function toggleLang() {
  currentLang = currentLang === 'de' ? 'en' : 'de';
  localStorage.setItem('arq-lang', currentLang);
  document.getElementById('langToggle').textContent = currentLang.toUpperCase();
  localizeUI();
  // Refresh current view
  if (currentProject) openProject(currentProject.id);
  else showHub();
}

// ===== INIT =====
async function init() {
  document.getElementById('langToggle').textContent = currentLang.toUpperCase();
  localizeUI();
  const hash = location.hash.slice(1);
  if (hash && /^\\d{3}_/.test(hash)) {
    await openProject(hash);
  } else {
    showHub();
  }
  // Check LLM config
  try {
    const cfg = await (await fetch('/api/chat/config')).json();
    chatLLMConfigured = cfg.configured;
  } catch { chatLLMConfigured = false; }
}

// ===== HUB VIEW =====
async function showHub() {
  currentProject = null;
  location.hash = '';
  document.getElementById('hubView').style.display = '';
  document.getElementById('projectView').classList.remove('active');
  document.getElementById('breadcrumb').innerHTML = '';
  document.getElementById('hdrActions').innerHTML = '';
  document.getElementById('hdrCenter').style.display = '';
  document.getElementById('hdrTitle').innerHTML = t('projects');
  document.getElementById('hdrSub').textContent = '';
  closeChat();
  await loadProjects();
}

let activeTagFilters = [];
try { activeTagFilters = JSON.parse(localStorage.getItem('arq-tag-filters') || '[]'); } catch(e) { activeTagFilters = []; }

async function loadProjects() {
  const grid = document.getElementById('projectGrid');
  grid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';

  const projects = await (await fetch('/api/projects')).json();
  window.__projectsCache = projects;

  // Update header project count
  document.getElementById('hdrTitle').innerHTML = t('projects') + ' <span class=\"hdr-count\">' + projects.length + '</span>';

  if (!projects.length) {
    document.getElementById('tagFilterBar').style.display = 'none';
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">+</div><div class="es-text">' + t('noEmpty') + '</div><button class="btn pri" onclick="openCreateModal()">+ ' + t('newProject') + '</button></div>';
    grid.innerHTML += newProjectCardHTML();
    return;
  }

  // Build filter button + chips in header actions
  const allTags = [...new Set(projects.flatMap(p => p.tags || []))].sort();
  const filterBar = document.getElementById('tagFilterBar');
  filterBar.style.display = 'none'; // deprecated: old pill bar hidden
  // Render filter button + active chips into header
  let filterHtml = '';
  if (allTags.length > 0) {
    filterHtml += '<div style="display:flex;align-items:center;gap:8px;position:relative" id="filterWrap">';
    filterHtml += '<button class="btn sm" onclick="toggleFilterPopover(event)" style="gap:4px"><svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M.75 3h14.5a.75.75 0 010 1.5H.75a.75.75 0 010-1.5zm2 4h10.5a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5zm3 4h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 010-1.5z"/></svg>' + t('filterBtn');
    if (activeTagFilters.length) filterHtml += ' <span style="font-size:9px;background:var(--gold);color:var(--bg);border-radius:8px;padding:0 5px;font-weight:800">' + activeTagFilters.length + '</span>';
    filterHtml += '</button>';
    // Active filter chips
    if (activeTagFilters.length > 0) {
      filterHtml += '<div class="filter-chips">';
      const showChips = activeTagFilters.slice(0, 3);
      for (const tag of showChips) filterHtml += '<span class="filter-chip" onclick="removeTagFilter(\\'' + esc(tag) + '\\')">' + esc(tag) + ' <span class="fc-x">\\u2715</span></span>';
      if (activeTagFilters.length > 3) filterHtml += '<span class="filter-chip" onclick="clearAllTagFilters()">+' + (activeTagFilters.length - 3) + '</span>';
      filterHtml += '</div>';
    }
    filterHtml += '</div>';
  }
  const hdrAct = document.getElementById('hdrActions');
  const existingFilter = document.getElementById('filterWrap');
  if (existingFilter) existingFilter.remove();
  hdrAct.insertAdjacentHTML('afterbegin', filterHtml);

  let h = '';
  for (const p of projects) {
    // Tag filter
    if (activeTagFilters.length && !activeTagFilters.some(ft => (p.tags || []).includes(ft))) continue;

    const s = p.stats || {};
    const r = p.readiness || { approvedPct: 0, total: 0, approved: 0 };
    const a = p.authored || { authoredPct: 0 };
    const lc = p.lifecycle || 'planning';
    const pct = r.approvedPct || 0;
    const authPct = a.authoredPct || 0;
    const isReady = pct >= (r.threshold || 100) && r.total > 0;
    const pid = esc(p.id);
    const cardId = 'card-' + pid;
    const isExpanded = pcExpandState[pid];

    h += '<div class="project-card' + (isExpanded ? ' expanded' : '') + (isReady ? ' ready-glow' : '') + '" id="' + cardId + '">';

    // ── ALWAYS VISIBLE: Edit icon (pencil, top-right) ──
    h += '<button class="pc-edit-icon" onclick="event.stopPropagation();openEditModal(\\'' + pid + '\\',\\'' + esc(p.name) + '\\',\\'' + esc(p.description || '') + '\\')" data-tip="' + t('edit') + '"><svg viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L3.462 11.098a.25.25 0 00-.064.108l-.631 2.2 2.2-.631a.25.25 0 00.108-.064l8.61-8.61a.25.25 0 000-.354L12.427 2.487z"/></svg></button>';

    // ── ALWAYS VISIBLE: Header ──
    h += '<div class="pc-header"><span class="pc-num">' + esc(p.id.slice(0,3)) + '</span><span class="pc-sep">\u2014</span><span class="pc-name">' + esc(p.name) + '</span>';
    h += '<span class="pc-badge ' + lc + '">' + lifecycleLabel(lc) + '</span>';
    h += '</div>';

    // ── ALWAYS VISIBLE: Tags ──
    const uniqueTags = [...new Set(p.tags || [])];
    h += '<div class="pc-tags">';
    const maxVisibleTags = 4;
    for (let ti = 0; ti < Math.min(uniqueTags.length, maxVisibleTags); ti++) h += '<span class="pc-tag ' + esc(uniqueTags[ti]) + '">' + esc(uniqueTags[ti]) + '</span>';
    if (uniqueTags.length > maxVisibleTags) h += '<span class="pc-tags-more">+' + (uniqueTags.length - maxVisibleTags) + '</span>';
    if (!uniqueTags.length) h += '<span class="pc-tag" style="opacity:0">-</span>';
    h += '</div>';

    // ── ALWAYS VISIBLE: Description (3 lines, uniform height) ──
    h += '<div class="pc-desc' + (p.description ? '' : ' placeholder') + '">' + esc(p.description || t('noDescription')) + '</div>';

    // ── ALWAYS VISIBLE: Compact progress bars ──
    h += '<div class="pc-bars">';
    h += '<div class="pc-bar-row"><span class="pc-bar-label authored">' + t('authored') + '</span><div class="pc-readiness-bar"><div class="pc-readiness-fill authored" style="width:' + authPct + '%"></div></div><span class="pc-readiness-pct' + (authPct >= 80 ? ' authored-hi' : '') + '">' + authPct + '%</span></div>';
    h += '<div class="pc-bar-row"><span class="pc-bar-label approved">' + t('approved') + '</span><div class="pc-readiness-bar"><div class="pc-readiness-fill approved" style="width:' + pct + '%"></div></div><span class="pc-readiness-pct' + (isReady ? ' ready' : '') + '">' + pct + '%</span></div>';
    // Dev progress bar (only when requirements are ready)
    if (isReady) {
      const devMap = { planning: 0, ready: 20, building: 40, built: 60, running: 80, deployed: 100 };
      const devPct = devMap[lc] || 0;
      h += '<div class="pc-dev-bar-row"><span class="pc-dev-bar-label">' + t('devProgress') + '</span><div class="pc-dev-bar"><div class="pc-dev-fill" style="width:' + devPct + '%"></div></div><span class="pc-dev-pct">' + devPct + '%</span></div>';
    }
    h += '</div>';

    // ── ALWAYS VISIBLE: Next-step indicator (granular) ──
    const reviewStatus = p.reviewStatus || 'none';
    let nextStep = '';
    if (!s['business-case']) nextStep = t('nsCreateBC');
    else if (!s.solutions) nextStep = t('nsDeriveSol');
    else if (!(s['user-stories'])) nextStep = t('nsCreateUS');
    else if (!(s.components)) nextStep = t('nsDefineCmp');
    else if (!(s.functions)) nextStep = t('nsSpecifyFn');
    else if (!isReady && reviewStatus === 'remediation') nextStep = t('nsRemediation');
    else if (!isReady && reviewStatus === 'reviewed') nextStep = t('nsFixFindings');
    else if (!isReady) nextStep = t('nsReview');
    else if (lc === 'planning') nextStep = t('nsStartDev');
    else if (lc === 'ready') nextStep = t('nsScaffold');
    else if (lc === 'built') nextStep = t('nsStartApp');
    else if (lc === 'running') nextStep = t('nsDeploy');
    if (nextStep) {
      h += '<div style="font-size:12px;color:var(--fg2);margin:4px 0 2px;display:flex;align-items:center;gap:5px"><span style="color:var(--gold)">&#8594;</span> ' + nextStep + '</div>';
    }

    // ── ALWAYS VISIBLE: Quick action row (hidden when expanded via CSS) ──
    h += '<div class="pc-quick-actions" style="display:flex;gap:6px;margin:8px 0 0">';
    h += '<button class="btn sm" onclick="openProject(\\'' + pid + '\\')">Dashboard</button>';
    h += '</div>';
    const ghUrl = p.github && p.github.url ? p.github.url : (p.github && p.github.repo ? 'https://github.com/' + p.github.repo : '');

    // ── EXPAND TOGGLE ──
    h += '<div class="pc-expand-toggle" onclick="togglePcCard(\\'' + pid + '\\')">';
    h += '<span class="chevron">&#9660;</span> <span>' + (isExpanded ? t('collapseCard') : t('expandCard')) + '</span>';
    h += '</div>';

    // ╔══════════════════════════════════════╗
    // ║  COLLAPSIBLE SECTION                 ║
    // ╚══════════════════════════════════════╝
    h += '<div class="pc-collapsible">';

    // Onboarding hint when project is empty
    if (authPct === 0 && pct === 0) {
      h += '<div class="pc-onboard">' + t('onboardHint') + '</div>';
    }

    // Stats (always show all including cross-cutting)
    h += '<div class="pc-stats">';
    h += statCell('bc', s['business-case']||0, t('statBC'));
    h += statCell('sol', s.solutions||0, t('statSOL'));
    h += statCell('us', s['user-stories']||0, t('statUS'));
    h += statCell('cmp', s.components||0, t('statCMP'));
    h += statCell('fn', s.functions||0, t('statFN'));
    h += '</div>';
    h += '<div class="pc-stats" style="margin-top:4px">';
    h += statCell('inf', s.infrastructure||0, t('statINF'));
    h += statCell('adr', s.adrs||0, t('statADR'));
    h += statCell('ntf', s.notifications||0, t('statNTF'));
    h += statCell('fbk', s.feedback||0, t('feedbackSection'));
    h += '</div>';

    // Tabs
    h += '<div class="pc-tabs">';
    h += '<button class="pc-tab active" onclick="switchTab(\\'' + cardId + '\\',\\'plan\\',this)">' + t('planSection') + '</button>';
    h += '<button class="pc-tab" onclick="switchTab(\\'' + cardId + '\\',\\'dev\\',this)">' + t('devSection') + '</button>';
    h += '<button class="pc-tab" onclick="switchTab(\\'' + cardId + '\\',\\'ops\\',this)">' + t('opsSection') + '</button>';
    const fbkOpen = (s.feedback||0);
    h += '<button class="pc-tab" onclick="switchTab(\\'' + cardId + '\\',\\'fbk\\',this)">' + t('feedbackSection') + (fbkOpen > 0 ? ' <span class=\\'fbk-badge\\'>' + fbkOpen + '</span>' : '') + '</button>';
    h += '</div>';

    // === TAB: Planung ===
    h += '<div class="pc-tab-content active" data-tab="plan">';
    h += '<div class="pc-actions">';
    h += '<button class="btn sm" onclick="openProject(\\'' + pid + '\\')">Dashboard</button>';
    h += '<button class="btn sm accent" onclick="doOpenVSCode(\\'' + pid + '\\')">VS Code</button>';
    h += '<button class="pc-delete-icon" onclick="promptDelete(\\'' + pid + '\\',\\'' + esc(p.codename) + '\\',\\'' + esc(p.name) + '\\',' + (r.total||0) + ',' + (ghUrl ? 'true' : 'false') + ')" data-tip="Delete"><svg viewBox="0 0 16 16"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19a1.75 1.75 0 001.741-1.575l.66-6.6a.75.75 0 10-1.492-.15l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/></svg></button>';
    h += '</div>';
    h += '</div>';

    // === TAB: Entwicklung ===
    h += '<div class="pc-tab-content" data-tab="dev">';
    h += '<div class="dev-info"><span class="di-label">Status:</span><span class="di-val">' + lifecycleLabel(lc) + '</span></div>';
    h += '<div class="dev-info"><span class="di-label">App:</span><span class="di-val">' + (p.hasApp ? t('appExists') : t('appNotGen')) + '</span></div>';
    if (ghUrl) {
      h += '<div class="dev-info"><span class="di-label">GitHub:</span><span class="di-val"><a href="' + esc(ghUrl) + '" target="_blank" style="color:var(--gold)">' + esc(p.github.repo || ghUrl) + '</a></span>';
      h += ' <button class="btn sm" style="margin-left:8px;font-size:10px" onclick="doGitHubExport(\\'' + pid + '\\')">' + t('exportIssues') + '</button></div>';
    }
    if (p.branding) {
      h += '<div class="dev-info"><span class="di-label">Branding:</span>';
      h += '<span class="color-swatch" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + esc(p.branding.primary || '#FFD700') + ';vertical-align:middle;margin:0 4px"></span>';
      h += '<span class="color-swatch" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + esc(p.branding.secondary || '#1F1F1F') + ';vertical-align:middle;margin:0 4px"></span>';
      h += '<span class="di-val">' + esc(p.branding.font_heading || 'Inter') + ' / ' + esc(p.branding.mode || 'dark') + '</span>';
      h += '</div>';
    }
    h += '<div class="pc-factory">';
    // Force scaffold: always available (greyed out disabled when building)
    if (lc === 'building') {
      h += '<span class="pc-badge building" style="margin:auto">' + t('building') + '</span>';
    } else if ((isReady && lc === 'planning') || lc === 'ready') {
      h += '<button class="btn sm gold" onclick="doScaffold(\\'' + pid + '\\')">' + t('scaffold') + '</button>';
    } else if (lc === 'planning' && !isReady) {
      h += '<button class="btn sm gold" style="opacity:.4" onclick="doForceScaffold(\\'' + pid + '\\')">' + t('scaffold') + ' (Force)</button>';
    }
    h += '<button class="btn sm" onclick="openBrandingModal(\\'' + pid + '\\')">' + t('branding') + '</button>';
    h += '</div>';
    // Test section (visible if app exists)
    if (p.hasApp) {
      h += '<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px">';
      h += '<div class="dev-info"><span class="di-label">Testing:</span><span class="di-val">Playwright E2E</span></div>';
      h += '<div class="pc-factory">';
      h += '<button class="btn sm" onclick="doRunTests(\\'' + pid + '\\')">' + t('runTests') + '</button>';
      h += '<button class="btn sm" onclick="doSetupPlaywright(\\'' + pid + '\\')">' + t('setupPlaywright') + '</button>';
      h += '</div>';
      h += '</div>';
    }
    h += '</div>';

    // === TAB: Betrieb ===
    h += '<div class="pc-tab-content" data-tab="ops">';
    if (!p.hasApp) {
      h += '<div class="dev-info" style="text-align:center;padding:16px 0;color:var(--fg3)">' + t('noApp') + '</div>';
    } else {
      h += '<div class="dev-info"><span class="di-label">Lifecycle:</span><span class="di-val">' + lifecycleLabel(lc) + '</span></div>';
      if (p.appRunning) {
        h += '<div class="dev-info"><span class="di-label">Port:</span><span class="di-val">' + (p.appPort||'?') + '</span></div>';
      }
      h += '<div class="pc-factory">';
      if (lc === 'built' && !p.appRunning) {
        h += '<button class="btn sm pri" onclick="doAppStart(\\'' + pid + '\\')">' + t('appStart') + '</button>';
        h += '<button class="btn sm gold" onclick="doAppBuildDeploy(\\'' + pid + '\\')">' + t('appProd') + '</button>';
      }
      if (p.appRunning) {
        h += '<button class="btn sm danger" onclick="doAppStop(\\'' + pid + '\\')">' + t('appStop') + '</button>';
        h += '<button class="btn sm accent" onclick="window.open(\\'http://localhost:' + (p.appPort||3334) + '\\',\\'_blank\\')">' + t('openBrowser') + '</button>';
      }
      if (lc === 'deployed') {
        h += '<button class="btn sm danger" onclick="doAppStop(\\'' + pid + '\\')">' + t('appStop') + '</button>';
        h += '<button class="btn sm accent" onclick="window.open(\\'http://localhost:' + (p.appPort||4000) + '\\',\\'_blank\\')">' + t('openBrowser') + '</button>';
      }
      h += '</div>';
      // Store / Deploy section
      h += '<div class="store-section">';
      h += '<div class="dev-info"><span class="di-label">'+t('storeDeploy')+':</span></div>';
      h += '<div class="store-badges">';
      const storeStatus = p.store?.status || 'none';
      const isCapacitor = p.appType === 'capacitor';
      if (isCapacitor) {
        h += '<button class="store-badge-btn' + (storeStatus === 'configured' || storeStatus === 'built' || storeStatus === 'live' ? ' configured' : '') + '" onclick="doStoreConfigure(\\'' + pid + '\\',\\'android\\')" title="' + t('storeConfig') + '">';
        h += '<span class="store-icon">&#9654;</span> Google Play</button>';
        h += '<button class="store-badge-btn" onclick="doStoreConfigure(\\'' + pid + '\\',\\'ios\\')" title="' + t('storeConfig') + ' (iOS via CI/CD)">';
        h += '<span class="store-icon">&#63743;</span> App Store</button>';
      }
      h += '</div>';
      h += '<div class="pc-factory" style="margin-top:8px">';
      if (storeStatus !== 'none') {
        h += '<button class="btn sm" onclick="doStoreBuild(\\'' + pid + '\\')">' + t('storeBuild') + '</button>';
        h += '<button class="btn sm pri" onclick="doStoreUpload(\\'' + pid + '\\')">' + t('storeUploadBtn') + '</button>';
      }
      h += '<button class="btn sm" onclick="doStoreGHActions(\\'' + pid + '\\')">' + t('storeGHActions') + '</button>';
      h += '</div>';
      h += '</div>';
    }
    h += '</div>';

    // === TAB: Feedback ===
    h += '<div class="pc-tab-content" data-tab="fbk">';
    h += '<div class="fbk-list" id="fbk-' + cardId + '">';
    h += '<div class="dev-info" style="text-align:center;padding:12px 0;color:var(--fg3)">' + t('feedbackEmpty') + '</div>';
    h += '</div>';
    h += '<div class="pc-factory" style="margin-top:8px">';
    h += '<button class="btn sm gold" onclick="openFeedbackModal(\\'' + pid + '\\')">' + t('feedbackAdd') + '</button>';
    h += '</div>';
    h += '</div>';

    h += '</div>'; // close pc-collapsible
    h += '</div>'; // card end
  }
  h += newProjectCardHTML();
  grid.innerHTML = h;

  // Show hub controls when there are projects
  const hubCtrl = document.getElementById('hubControls');
  if (hubCtrl) {
    hubCtrl.style.display = projects.length > 0 ? 'flex' : 'none';
    const ea = document.getElementById('hubExpandAll');
    const ca = document.getElementById('hubCollapseAll');
    if (ea) ea.textContent = t('expandAllCards');
    if (ca) ca.textContent = t('collapseAllCards');
  }
}

function setTagFilter(tag) {
  const idx = activeTagFilters.indexOf(tag);
  if (idx >= 0) activeTagFilters.splice(idx, 1); else activeTagFilters.push(tag);
  localStorage.setItem('arq-tag-filters', JSON.stringify(activeTagFilters));
  loadProjects();
}
function removeTagFilter(tag) {
  activeTagFilters = activeTagFilters.filter(t => t !== tag);
  localStorage.setItem('arq-tag-filters', JSON.stringify(activeTagFilters));
  loadProjects();
}
function clearAllTagFilters() {
  activeTagFilters = [];
  localStorage.setItem('arq-tag-filters', '[]');
  loadProjects();
}
function toggleFilterPopover(ev) {
  ev.stopPropagation();
  let pop = document.getElementById('filterPopover');
  if (pop) { pop.remove(); return; }
  const wrap = document.getElementById('filterWrap');
  if (!wrap) return;
  const allTags = [...new Set((__projectsCache || []).flatMap(p => p.tags || []))].sort();
  let ph = '<div class="filter-popover" id="filterPopover">';
  ph += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-weight:600;font-size:12px">' + t('filterBtn') + '</span>';
  if (activeTagFilters.length) ph += '<button class="btn sm" style="font-size:10px;padding:2px 6px" onclick="clearAllTagFilters()">' + t('clearAll') + '</button>';
  ph += '</div>';
  for (const tag of allTags) {
    const checked = activeTagFilters.includes(tag);
    ph += '<label class="filter-popover-item' + (checked ? ' active' : '') + '" onclick="event.stopPropagation();setTagFilter(\\\'' + esc(tag) + '\\\')"><span style="width:14px;height:14px;border-radius:3px;border:1.5px solid var(--border);display:inline-flex;align-items:center;justify-content:center;background:' + (checked ? 'var(--gold)' : 'transparent') + '">' + (checked ? '<svg width="10" height="10" viewBox="0 0 16 16" fill="var(--bg)"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>' : '') + '</span>' + esc(tag) + '</label>';
  }
  ph += '</div>';
  wrap.insertAdjacentHTML('beforeend', ph);
  const closePop = (e) => { const fp = document.getElementById('filterPopover'); if (fp && !fp.contains(e.target) && !wrap.contains(e.target)) { fp.remove(); document.removeEventListener('click', closePop); } };
  setTimeout(() => document.addEventListener('click', closePop), 0);
}

function switchTab(cardId, tabName, btn) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.querySelectorAll('.pc-tab').forEach(t => t.classList.remove('active'));
  card.querySelectorAll('.pc-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const target = card.querySelector('[data-tab="' + tabName + '"]');
  if (target) target.classList.add('active');
  // Lazy-load feedback when tab is opened
  if (tabName === 'fbk') {
    const pid = cardId.replace('pc-', '');
    loadFeedbackList(pid);
  }
}

function lifecycleLabel(state) {
  const icons = { planning: '\u25CB', ready: '\u25C9', building: '\u25D4', built: '\u25CF', running: '\u25B6', deployed: '\u2605' };
  const icon = icons[state] || '';
  return (icon ? icon + ' ' : '') + (t(state) || state);
}

function statCell(cls, val, label) {
  const dimClass = (val === 0 || val === '0') ? ' zero' : '';
  return '<div class="pc-stat '+cls+dimClass+'"><div class="v">'+val+'</div><div class="l">'+label+'</div></div>';
}

function newProjectCardHTML() {
  return '<div class="new-project-card" onclick="openCreateModal()"><div class="npc-icon">+</div><div class="npc-text">'+t('newProject')+'</div></div>'
    + '<div class="new-project-card" onclick="openImportModal()" style="border-style:dashed"><div class="npc-icon" style="font-size:18px">&#8615;</div><div class="npc-text">'+t('import')+'</div></div>';
}

// ===== PROJECT VIEW =====
async function openProject(projectId) {
  closeChat();
  document.getElementById('hubView').style.display = 'none';
  document.getElementById('projectView').classList.add('active');
  location.hash = projectId;

  // Update header for project view
  const projName = projectId.replace(/^\d{3}_/, '').replace(/_/g, ' ');
  document.getElementById('hdrCenter').style.display = 'none';
  document.getElementById('breadcrumb').innerHTML = '<span class="sep">/</span><span class="proj-name">' + esc(projName) + '</span>';

  document.getElementById('hdrActions').innerHTML =
    '<button class="btn sm" onclick="doRefresh()">\u21BB ' + t('refresh') + '</button>' +
    '<button class="btn sm" onclick="doValidate()">\u2713 ' + t('validate') + '</button>' +
    '<button class="btn sm accent" onclick="doOpenVSCode(\\'' + esc(projectId) + '\\')">' + t('vsCode') + '</button>' +
    '<button class="btn sm" onclick="showHub()">' + t('backToProjects') + '</button>';

  currentProject = { id: projectId };

  document.getElementById('tree').innerHTML = '<div style="padding:16px"><span class="spinner"></span></div>';
  document.getElementById('flow').innerHTML = '<div style="padding:40px;text-align:center"><span class="spinner"></span></div>';
  document.getElementById('searchInput').value = '';

  const base = '/api/projects/' + encodeURIComponent(projectId);
  const [stats, tree, solStatus, ccItems] = await Promise.all([
    fetch(base + '/stats').then(r=>r.json()),
    fetch(base + '/tree').then(r=>r.json()),
    fetch(base + '/sol-status').then(r=>r.json()),
    fetch(base + '/cross-cutting').then(r=>r.json()),
  ]);

  document.getElementById('sBC').textContent = stats['business-case'] || 0;
  document.getElementById('sSOL').textContent = stats.solutions || 0;
  document.getElementById('sUS').textContent = stats['user-stories'] || 0;
  document.getElementById('sCMP').textContent = stats.components || 0;
  document.getElementById('sFN').textContent = stats.functions || 0;
  document.getElementById('sINF').textContent = stats.infrastructure || 0;
  document.getElementById('sADR').textContent = stats.adrs || 0;
  document.getElementById('sNTF').textContent = stats.notifications || 0;

  // Add GitHub + Push buttons to header if configured
  const gh = stats.github;
  if (gh && (gh.url || gh.repo)) {
    const ghLink = gh.url || ('https://github.com/' + gh.repo);
    let ghBtns = '<button class="btn sm" onclick="window.open(\\'' + ghLink.replace(/'/g, "\\\\'") + '\\',\\'_blank\\')">GitHub</button>';
    ghBtns += '<button class="btn sm" onclick="doGitHubExport(\\'' + projectId.replace(/'/g, "\\\\'") + '\\')">' + t('exportIssues') + '</button>';
    if (gh.path) {
      ghBtns += '<button class="btn sm gold" id="btnGhPush" onclick="doGitHubPush(\\'' + projectId.replace(/'/g, "\\\\'") + '\\')">' + t('storePush') + '</button>';
    }
    document.getElementById('hdrActions').insertAdjacentHTML('afterbegin', ghBtns);
  }

  treeData = tree;
  solData = solStatus.solutions || [];
  currentProject.hasBC = solStatus.hasBC;
  currentProject.bcTitle = solStatus.bcTitle;
  currentProject.lifecycle = stats.lifecycle || 'planning';
  currentProject.hasApp = !!stats.hasApp;

  renderTree(treeData);
  renderCrossCutting(ccItems);
  renderFlow();
  renderTracker();
  renderQuickActions(null);
}

// ===== TREE =====
function renderTree(data, filter='') {
  const c = document.getElementById('tree');
  c.innerHTML = '';
  const q = filter.toLowerCase();

  function match(n) {
    if (!q) return true;
    if ((n.id+' '+n.title).toLowerCase().includes(q)) return true;
    return n.children ? n.children.some(match) : false;
  }
  function countDesc(n) { return n.children ? n.children.reduce((a,ch) => a+1+countDesc(ch), 0) : 0; }

  function mk(n, depth) {
    if (q && !match(n)) return null;
    const el = document.createElement('div'); el.className='tn';
    const has = n.children && n.children.length > 0;
    const row = document.createElement('div'); row.className='tr';
    row.style.paddingLeft = (10+depth*14)+'px';

    const tog = document.createElement('span'); tog.className='tt';
    tog.textContent = has ? '▸' : ' ';

    const typeMap = {'business-case':'bc','solution':'sol','user-story':'us','component':'cmp','function':'fn'};
    const iconMap = {'business-case':'BC','solution':'S','user-story':'U','component':'C','function':'F'};
    const ico = document.createElement('span');
    ico.className = 'ti '+(typeMap[n.type]||'');
    ico.textContent = iconMap[n.type]||'?';

    const nid = document.createElement('span'); nid.className='tid'; nid.textContent=n.id;
    const lbl = document.createElement('span'); lbl.className='tl'; lbl.textContent=n.title;
    lbl.title = n.id+': '+n.title;
    const cnt = document.createElement('span'); cnt.className='tree-count';
    if (has) cnt.textContent = '('+countDesc(n)+')';
    const st = document.createElement('span'); st.className = 'ts clickable '+(n.status||''); st.textContent = n.status||'';
    if (n.file && n.status) {
      st.addEventListener('click', e => { e.stopPropagation(); showStatusPopover(st, n.file, n.status, n.id); });
    }

    row.append(tog, ico, nid, lbl, cnt, st);
    el.appendChild(row);

    let cc;
    if (has) {
      cc = document.createElement('div');
      cc.className = 'tc' + (depth >= 1 && !q ? ' hid' : '');
      for (const ch of n.children) { const e=mk(ch,depth+1); if(e) cc.appendChild(e); }
      el.appendChild(cc);
      tog.textContent = (!q && depth >= 1) ? '▸' : '▾';
    }

    tog.addEventListener('click', e => { e.stopPropagation(); if(!cc) return; const h=cc.classList.toggle('hid'); tog.textContent=h?'▸':'▾'; });
    row.addEventListener('click', () => {
      document.querySelectorAll('.tr.act').forEach(r=>r.classList.remove('act'));
      row.classList.add('act');
      openDetail(n.id, n.file);
      renderQuickActions(n);
    });
    return el;
  }

  for (const n of data) { const e=mk(n,0); if(e) c.appendChild(e); }
  if (!c.children.length) c.innerHTML='<div style="padding:16px;color:var(--fg3)">No matches</div>';
}

// ===== CROSS-CUTTING TREE =====
let ccData = [];
function renderCrossCutting(items) {
  ccData = items || [];
  const c = document.getElementById('crossCuttingTree');
  c.innerHTML = '';
  if (!ccData.length) return;

  const groups = { infrastructure: [], adr: [], notification: [] };
  const labels = { infrastructure: 'Infrastructure', adr: 'ADRs', notification: 'Notifications' };
  const prefixes = { infrastructure: 'INF', adr: 'ADR', notification: 'NTF' };
  for (const it of ccData) (groups[it.type] || []).push(it);

  for (const [type, items] of Object.entries(groups)) {
    if (!items.length) continue;
    const section = document.createElement('div');
    const cls = type === 'infrastructure' ? 'inf' : type === 'adr' ? 'adr' : 'ntf';
    const hdr = document.createElement('div');
    hdr.className = 'cc-section-hdr';
    hdr.innerHTML = '<span class="cc-tog">▾</span><span>' + esc(labels[type]) + ' (' + items.length + ')</span>';
    section.appendChild(hdr);

    const list = document.createElement('div');
    list.className = 'cc-section-items';
    for (const it of items) {
      const row = document.createElement('div');
      row.className = 'cc-item';
      row.innerHTML = '<span class="cc-ico ' + cls + '">' + esc(prefixes[type]) + '</span>'
        + '<span class="cc-id">' + esc(it.id) + '</span>'
        + '<span class="cc-ttl">' + esc(it.title) + '</span>'
        + '<span class="cc-st">' + esc(it.status) + '</span>';
      row.addEventListener('click', () => openDetail(it.id, it.file));
      list.appendChild(row);
    }
    section.appendChild(list);

    hdr.addEventListener('click', () => {
      const hidden = list.classList.toggle('hid');
      hdr.classList.toggle('collapsed', hidden);
      hdr.querySelector('.cc-tog').textContent = hidden ? '▸' : '▾';
    });
    c.appendChild(section);
  }
}

// Search
let sT;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(sT);
  sT = setTimeout(()=>renderTree(treeData, e.target.value.trim()), 200);
});

// ===== DETAIL OVERLAY =====
let detailFile = null;
let detailStatus = null;
async function openDetail(id, file) {
  detailFile = file;
  detailStatus = null;
  const ov = document.getElementById('detailOverlay');
  const bd = document.getElementById('overlayBackdrop');
  document.getElementById('detailOverlayTitle').textContent = id + ' ...';
  document.getElementById('doBody').innerHTML = '<div style="padding:20px"><span class="spinner"></span></div>';
  const statusEl = document.getElementById('doStatus');
  statusEl.style.display = 'none';
  ov.classList.add('open');
  bd.classList.add('open');

  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const d = await (await fetch(base + '/read?id=' + encodeURIComponent(id))).json();
  if (d.error) {
    document.getElementById('detailOverlayTitle').textContent = id;
    document.getElementById('doBody').innerHTML = '<p style="color:var(--red);padding:20px">' + t('notFound') + '</p>';
    return;
  }
  document.getElementById('detailOverlayTitle').textContent = id + (file ? ' \u2014 '+file : '');

  // Show status badge
  if (d.frontmatter && d.frontmatter.status) {
    detailStatus = d.frontmatter.status;
    statusEl.className = 'do-status ' + detailStatus;
    statusEl.textContent = detailStatus;
    statusEl.style.display = '';
    statusEl.onclick = (e) => { e.stopPropagation(); showStatusPopover(statusEl, file, detailStatus, id); };
  }

  document.getElementById('doBody').innerHTML = '<pre>'+esc(d.content)+'</pre>';
}
function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
  document.getElementById('overlayBackdrop').classList.remove('open');
}

// ===== VALIDATION =====
async function doValidate() {
  const ov = document.getElementById('valOverlay');
  ov.classList.add('open');
  document.getElementById('valBody').innerHTML = '<div style="padding:20px"><span class="spinner"></span> ' + t('runningValidation') + '</div>';
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const d = await (await fetch(base + '/validate')).json();
  document.getElementById('valBody').innerHTML = '<div class="val-output '+(d.success?'ok':'err')+'">'+esc(d.output)+'</div>';
}
function closeVal() { document.getElementById('valOverlay').classList.remove('open'); }

// ===== REFRESH =====
async function doRefresh() {
  if (!currentProject) return;
  await openProject(currentProject.id);
}

// ===== FLOW (Per-SOL Board) =====
function renderFlow() {
  prompts = [];
  const el = document.getElementById('flow');
  const hasBC = currentProject.hasBC;
  const sols = solData;

  // Aggregate stats
  const totalSols = sols.length;
  const completeSols = sols.filter(s => s.status === 'complete' || s.status === 'reviewed').length;
  const reviewedSols = sols.filter(s => s.status === 'reviewed').length;
  const wipSols = totalSols - completeSols;

  // Determine overall step (for progress dots)
  let overallStep = 1;
  if (hasBC) overallStep = 2;
  if (totalSols > 0) overallStep = 3;
  if (totalSols > 0 && sols.every(s => s.us > 0)) overallStep = 4;
  if (totalSols > 0 && sols.every(s => s.cmp > 0)) overallStep = 5;
  if (totalSols > 0 && sols.every(s => s.fn > 0)) overallStep = 6;

  const STEPS = [
    { n:1, lbl:'1',  t:t('nsCreateBC'),  done: hasBC },
    { n:2, lbl:'2', t:t('nsDeriveSol'),       done: totalSols > 0 },
    { n:3, lbl:'3',  t:t('nsCreateUS'),    done: totalSols > 0 && sols.every(s => s.us > 0), partial: totalSols > 0 ? sols.filter(s=>s.us>0).length+'/'+totalSols : null },
    { n:4, lbl:'4', t:t('nsDefineCmp'),     done: totalSols > 0 && sols.every(s => s.cmp > 0), partial: totalSols > 0 ? sols.filter(s=>s.cmp>0).length+'/'+totalSols : null },
    { n:5, lbl:'5',  t:t('nsSpecifyFn'),       done: totalSols > 0 && sols.every(s => s.fn > 0), partial: totalSols > 0 ? sols.filter(s=>s.fn>0).length+'/'+totalSols : null },
    { n:6, lbl:'6', t:t('nsReview'),          done: reviewedSols === totalSols && totalSols > 0, partial: totalSols > 0 ? reviewedSols+'/'+totalSols : null }
  ];

  let h = '';

  // Onboarding tip
  if (!onboardDismissed) {
    h += '<div class="onboard" id="onboard">';
    h += '<div class="onboard-icon">&#9672;</div>';
    h += '<div class="onboard-text"><strong>' + t('howItWorks') + '</strong> ' + t('onboardHint') + ' ' + t('pressGold') + '</div>';
    h += '<button class="onboard-dismiss" onclick="dismissOnboard()">✕</button>';
    h += '</div>';
  }

  // ===== Progress bar =====
  h += '<div class="progress">';
  for (let i = 0; i < STEPS.length; i++) {
    const s = STEPS[i];
    const st = s.done ? 'done' : (s.n === overallStep ? 'active' : '');
    if (i > 0) h += '<div class="p-line' + (STEPS[i-1].done ? ' done' : '') + '">&nbsp;</div>';
    h += '<div class="p-dot ' + st + '">' + s.lbl;
    if (s.partial && !s.done && s.n <= overallStep) {
      h += '<span class="p-label">' + s.t + ' <span style="color:var(--yellow)">' + s.partial + '</span></span>';
    } else {
      h += '<span class="p-label">' + s.t + '</span>';
    }
    h += '</div>';
  }
  h += '</div>';

  // ===== Step 1: No BC =====
  if (!hasBC) {
    prompts.push('@discover I want to develop an app. Start a discovery interview with me.');
    h += '<div class="step-block">';
    h += '<div class="step-title">' + t('nsCreateBC') + ' <span class="badge">' + t('stepLabel') + ' 1/6</span><span class="help-icon" title="Hilfe">?<span class="help-bubble">' + t('helpBC') + '</span></span></div>';
    h += '<div class="step-sub">' + t('helpBC') + '</div>';
    h += '<div class="action-list">';
    h += actionRow(t('nsCreateBC'), prompts.length - 1);
    h += '</div></div>';
    el.innerHTML = h;
    return;
  }

  // ===== Step 2: No SOLs =====
  if (totalSols === 0) {
    prompts.push('@architect Read the Business Case (00_BUSINESS_CASE.md) and propose suitable Solutions (SOL).');
    h += '<div class="step-block">';
    h += '<div class="step-title">' + t('nsDeriveSol') + ' <span class="badge">' + t('stepLabel') + ' 2/6</span><span class="help-icon" title="Hilfe">?<span class="help-bubble">' + t('helpSOL') + '</span></span></div>';
    h += '<div class="step-sub">Business Case: ' + esc(currentProject.bcTitle || 'BC-1') + '</div>';
    h += '<div class="action-list">';
    h += actionRow(t('nsDeriveSol'), prompts.length - 1);
    h += '</div></div>';
    el.innerHTML = h;
    return;
  }

  // ===== Summary bar =====
  h += '<div class="sol-summary">';
  h += '<div class="sol-summary-item"><strong style="margin-right:6px">' + totalSols + '</strong> ' + t('nsDeriveSol') + '</div>';
  h += '<div class="sol-summary-item complete"><span class="val">' + completeSols + '</span> ' + t('done') + '</div>';
  h += '<div class="sol-summary-item wip"><span class="val">' + wipSols + '</span> ' + t('open') + '</div>';
  if (reviewedSols > 0) h += '<div class="sol-summary-item" style="color:var(--accent)"><span class="val" style="color:var(--accent)">' + reviewedSols + '</span> ' + t('reviewed') + '</div>';
  h += '<div style="margin-left:auto;display:flex;gap:6px">';
  h += '<button class="sol-filter-btn' + (solFilter==='all'?' active':'') + '" onclick="setSolFilter(\\'all\\')">' + t('filterAll') + '</button>';
  h += '<button class="sol-filter-btn' + (solFilter==='todo'?' active':'') + '" onclick="setSolFilter(\\'todo\\')">' + t('filterOpen') + '</button>';
  h += '<button class="sol-filter-btn' + (solFilter==='complete'?' active':'') + '" onclick="setSolFilter(\\'complete\\')">' + t('filterDone') + '</button>';
  h += '</div></div>';

  // ===== SOL Controls (Expand/Collapse All) =====
  if (sols.length > 1) {
    h += '<div class="sol-controls">';
    h += '<button class="btn sm" onclick="toggleAllSolCards(true)">' + t('expandAll') + '</button>';
    h += '<button class="btn sm" onclick="toggleAllSolCards(false)">' + t('collapseAll') + '</button>';
    h += '</div>';
  }

  // ===== SOL Board =====
  h += '<div class="sol-board">';
  for (const sol of sols) {
    // Filter
    if (solFilter === 'todo' && (sol.status === 'complete' || sol.status === 'reviewed')) continue;
    if (solFilter === 'complete' && sol.status !== 'complete' && sol.status !== 'reviewed') continue;

    const isReviewed = sol.status === 'reviewed';
    const solKey = currentProject.id + ':' + sol.id;
    const isExpanded = solExpandState[solKey];
    h += '<div class="sol-card' + (isReviewed ? ' reviewed' : '') + (isExpanded ? ' expanded' : '') + '" data-sol-key="' + esc(solKey) + '">';

    // Status badge class for inline badge
    const statusLabels = { 'needs-us':t('needsUS'), 'needs-cmp':t('needsCMP'), 'needs-fn':t('needsFN'), 'complete':t('solComplete'), 'reviewed':t('solReviewed') };
    const statusClass = sol.status;

    h += '<div class="sol-card-head" onclick="toggleSolCard(\\'' + esc(solKey) + '\\')">';
    h += '<span class="sol-chevron">\\u25B6</span>';
    h += '<span class="sol-card-id">' + esc(sol.id) + '</span>';
    h += '<span class="sol-card-title">' + esc(sol.title.replace(/^SOL-\\d+:\\s*/, '')) + '</span>';
    h += '<span class="sol-card-status-inline ' + statusClass + '" style="background:' + statusBg(statusClass) + ';color:' + statusColor(statusClass) + ';border-color:' + statusBorder(statusClass) + '">' + (statusLabels[sol.status] || sol.status) + '</span>';
    h += '</div>';

    // Collapsible body
    h += '<div class="sol-card-body">';

    // Progress dots with labels
    const dotLabels = [t('solDotSolution'),t('solDotScenarios'),t('solDotBlocks'),t('solDotFeatures'),t('solDotReview')];
    h += '<div class="sol-card-dots">';
    for (let i = 0; i < 5; i++) {
      h += '<div class="sol-dot' + (sol.dots[i] ? ' filled' : '') + '" title="' + dotLabels[i] + '"><span class="sol-dot-lbl">' + dotLabels[i] + '</span></div>';
    }
    const filledCount = sol.dots.filter(Boolean).length;
    const missingLabel = filledCount < 5 ? dotLabels[sol.dots.indexOf(false)] : '';
    h += '<span class="sol-dot-label">' + filledCount + '/5' + (missingLabel ? ' \\u2014 ' + missingLabel + ' ' + t('solDotPending') : '') + '</span>';
    h += '</div>';

    // Stats
    h += '<div class="sol-card-stats">';
    h += '<span>' + sol.us + ' US</span>';
    h += '<span>' + sol.cmp + ' CMP</span>';
    h += '<span>' + sol.fn + ' FN</span>';
    h += '</div>';

    // Status badge (full)
    h += '<div class="sol-card-status ' + sol.status + '">' + (statusLabels[sol.status] || sol.status) + '</div>';

    // Actions
    h += '<div class="sol-card-actions">';
    if (sol.nextAction) {
      const idx = prompts.length;
      prompts.push(sol.nextPrompt);
      h += '<button class="btn sm pri" data-idx="' + idx + '" onclick="copyPrompt(this)" title="Copy Prompt">' + esc(sol.nextAction) + '</button>';
    } else {
      h += '<button class="btn sm" disabled>' + t('done') + '</button>';
    }
    {
      const solNum = sol.id.replace('SOL-','');
      h += '<button class="btn sm" onclick="openAddUSModal(\\''+esc(solNum)+'\\',\\''+esc(sol.title.replace(/'/g,''))+'\\')\" title="' + t('addUS') + '">' + t('addUS') + '</button>';
    }
    h += '<button class="btn sm" onclick="openSolChat(\\'' + esc(sol.id) + '\\',\\'' + esc(sol.title.replace(/'/g,'')) + '\\')" title="' + t('chatBtn') + '">' + t('chatBtn') + '</button>';
    h += '</div>';

    h += '</div>'; // close sol-card-body
    h += '</div>'; // close sol-card
  }

  // Add SOL card (always visible)
  h += '<div class="sol-add-card" onclick="openAddSolModal()">';
  h += '<div class="plus-icon">+</div>';
  h += '<div class="plus-label">' + t('moreIdeas') + '</div>';
  h += '</div>';
  h += '</div>'; // close sol-board

  // ===== Batch actions for incomplete SOLs =====
  const incompleteSols = sols.filter(s => s.status !== 'complete' && s.status !== 'reviewed');
  if (incompleteSols.length > 0 && incompleteSols.length <= sols.length) {
    h += '<div style="margin-top:8px">';

    // Group by needed step
    const needsUS = sols.filter(s => s.status === 'needs-us');
    const needsCMP = sols.filter(s => s.status === 'needs-cmp');
    const needsFN = sols.filter(s => s.status === 'needs-fn');
    const canReview = sols.filter(s => s.status === 'complete');

    if (needsUS.length > 0) {
      const batchPrompt = needsUS.map(s => '@architect Generate all User Stories for ' + s.id).join('\\n');
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchNeedUS').replace('{n}', needsUS.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('batchCopilot') + '</button></div>';
    }
    if (needsCMP.length > 0) {
      const batchPrompt = needsCMP.map(s => '@architect Derive Components from User Stories of ' + s.id).join('\\n');
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchNeedCMP').replace('{n}', needsCMP.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('batchCopilot') + '</button></div>';
    }
    if (needsFN.length > 0) {
      const batchPrompt = needsFN.map(s => '@architect Generate all Functions for Components of ' + s.id).join('\\n');
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchNeedFN').replace('{n}', needsFN.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('batchCopilot') + '</button></div>';
    }
    if (canReview.length > 0) {
      const batchPrompt = '@review Review all requirements for consistency and completeness';
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchReadyReview').replace('{n}', canReview.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('reviewCopilot') + '</button></div>';
    }
    h += '</div>';
  }

  // Full review block (when all complete)
  if (completeSols === totalSols && totalSols > 0 && reviewedSols < totalSols) {
    h += '<div class="step-block" style="margin-top:16px">';
    h += '<div class="step-title">' + t('nsReview') + ' <span class="badge">' + t('stepLabel') + ' 6/6</span><span class="help-icon" title="Hilfe">?<span class="help-bubble">' + t('helpREV') + '</span></span></div>';
    h += '<div class="step-sub">' + t('helpREV') + '</div>';
    h += '<div class="action-list">';
    const idx1 = prompts.length;
    prompts.push('@review Review all requirements for consistency and completeness');
    h += actionRow(t('nsReview'), idx1);
    const idx2 = prompts.length;
    prompts.push('@export Create the Requirement-Tree');
    h += actionRow(t('exportTree'), idx2);
    h += '</div></div>';
  }

  // Review Complete — all SOLs reviewed, show lifecycle transition
  if (reviewedSols === totalSols && totalSols > 0) {
    h += '<div class="step-block review-complete" style="margin-top:16px;border:1px solid var(--green);background:rgba(63,185,80,.06)">';
    h += '<div class="step-title" style="color:var(--green)">' + t('reviewComplete') + '</div>';
    h += '<div class="step-sub" style="margin-bottom:12px">' + t('celebrateReady') + '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    h += '<button class="btn sm pri" onclick="startDevelopment()" style="background:var(--green);border-color:var(--green)">' + t('startDev') + '</button>';
    h += '<button class="btn sm" onclick="addMoreIdeas()">' + t('moreIdeas') + '</button>';
    h += '</div>';
    h += '</div>';
  }

  // Lifecycle-aware sections below planning flow
  const lc = currentProject.lifecycle || 'planning';
  if (lc === 'ready' || lc === 'building' || lc === 'built' || lc === 'running' || lc === 'deployed') {
    h += '<div class="step-block" style="margin-top:16px;border:1px solid var(--gold)">';
    h += '<div class="step-title" style="color:var(--gold)">' + t('devHeading') + ' — ' + lifecycleLabel(lc) + '</div>';
    if (lc === 'ready') {
      h += '<div class="step-sub">' + t('devReady') + '</div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      const idxS = prompts.length;
      prompts.push('@scaffold Scaffold the application from the approved requirements.');
      h += '<button class="btn sm gold" data-idx="' + idxS + '" onclick="copyPrompt(this)">' + t('scaffoldCopilot') + '</button>';
      h += '<button class="btn sm" onclick="doScaffold(\\'' + currentProject.id + '\\')">' + t('autoScaffold') + '</button>';
      h += '</div>';
    } else if (lc === 'building') {
      h += '<div class="step-sub">' + t('devBuilding') + '</div>';
      h += '<div style="padding:12px;text-align:center"><span class="spinner"></span> ' + t('buildProgress') + '</div>';
    } else if (lc === 'built') {
      h += '<div class="step-sub">' + t('devBuilt') + '</div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      h += '<button class="btn sm pri" onclick="doAppStart(\\'' + currentProject.id + '\\')">' + t('appStart') + '</button>';
      h += '<button class="btn sm" onclick="doOpenVSCode(\\'' + currentProject.id + '\\')">' + t('openCode') + '</button>';
      h += '</div>';
      // Test generation from requirements
      h += '<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:8px">';
      h += '<div class="step-sub" style="margin-bottom:6px">' + t('genTestsReq') + '</div>';
      const idxTest = prompts.length;
      prompts.push('@test Generate Playwright E2E tests from the acceptance criteria in the approved Functions (FN-*). Create one test file per Component, with tests for each Function\\'s acceptance criteria.');
      h += '<button class="btn sm" data-idx="' + idxTest + '" onclick="copyPrompt(this)">' + t('genTestsCopilot') + '</button>';
      h += '</div>';
    } else if (lc === 'running') {
      h += '<div class="step-sub">' + t('devRunning') + '</div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      h += '<button class="btn sm danger" onclick="doAppStop(\\'' + currentProject.id + '\\')">' + t('appStop') + '</button>';
      h += '<button class="btn sm" onclick="doOpenVSCode(\\'' + currentProject.id + '\\')">' + t('openCode') + '</button>';
      h += '</div>';
    } else if (lc === 'deployed') {
      h += '<div class="step-sub">' + t('devDeployed') + '</div>';
    }
    h += '</div>';
  }

  // Store Deploy section (visible once app is built/running/deployed)
  if (lc === 'built' || lc === 'running' || lc === 'deployed') {
    const pid = currentProject.id;
    const storeStatus = currentProject.store?.status || 'none';
    const isCapacitor = currentProject.appType === 'capacitor';
    h += '<div class="step-block" style="margin-top:16px;border:1px solid var(--fg3)">';
    h += '<div class="step-title">' + t('storeDeploy') + '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
    if (isCapacitor) {
      h += '<button class="btn sm" onclick="doStoreConfigure(\\'' + pid + '\\',\\'android\\')">' + t('storeConfig') + ' (Android)</button>';
      h += '<button class="btn sm" onclick="doStoreConfigure(\\'' + pid + '\\',\\'ios\\')">' + t('storeConfig') + ' (iOS)</button>';
    }
    if (storeStatus !== 'none') {
      h += '<button class="btn sm" onclick="doStoreBuild(\\'' + pid + '\\')">' + t('storeBuild') + '</button>';
      h += '<button class="btn sm pri" onclick="doStoreUpload(\\'' + pid + '\\')">' + t('storeUploadBtn') + '</button>';
    }
    h += '<button class="btn sm" onclick="doStoreGHActions(\\'' + pid + '\\')">' + t('storeGHActions') + '</button>';
    h += '<button class="btn sm" onclick="doAppBuildDeploy(\\'' + pid + '\\')">' + t('appProd') + '</button>';
    h += '</div>';
    h += '</div>';
  }

  el.innerHTML = h;
}

function setSolFilter(f) {
  solFilter = f;
  renderFlow();
}

async function startDevelopment() {
  if (!currentProject) return;
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  await fetch(base + '/lifecycle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ state: 'ready' }) });
  await openProject(currentProject.id);
}

function addMoreIdeas() {
  if (!currentProject) return;
  const prompt = '@architect I want to add more Solutions to my Business Case. Let\\'s brainstorm.';
  navigator.clipboard.writeText(prompt).then(() => { showToast(t('promptCopied'), 'success'); });
}

function actionRow(label, idx) {
  return '<div class="action-row"><div class="action-label">'+label+'</div><button class="action-btn" data-idx="'+idx+'" onclick="copyPrompt(this)">→ Copilot</button></div>';
}

function copyPrompt(btn) {
  const idx = parseInt(btn.getAttribute('data-idx'));
  const text = prompts[idx];
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '\u2713 ' + t('copied');
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  });
}

function dismissOnboard() {
  onboardDismissed = true;
  localStorage.setItem('arq-onboard-dismissed', '1');
  const el = document.getElementById('onboard');
  if (el) el.remove();
}

// ===== STATUS POPOVER =====
const STATUS_TRANSITIONS_CLIENT = {
  idea: ['draft'],
  draft: ['review', 'idea'],
  review: ['approved', 'draft'],
  approved: ['implemented', 'review'],
  implemented: ['approved'],
};

let activePopover = null;
function closeStatusPopover() {
  if (activePopover) { activePopover.remove(); activePopover = null; }
  document.removeEventListener('click', closeStatusPopover);
}

function showStatusPopover(targetEl, file, currentStatus, nodeId) {
  closeStatusPopover();
  const transitions = STATUS_TRANSITIONS_CLIENT[currentStatus] || [];
  if (!transitions.length) return;
  const pop = document.createElement('div');
  pop.className = 'status-popover';
  for (const t of transitions) {
    const item = document.createElement('div');
    item.className = 'status-popover-item';
    item.innerHTML = '<span class="sp-dot '+t+'"></span>'+t;
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeStatusPopover();
      await doSetStatus(file, t);
    });
    pop.appendChild(item);
  }
  document.body.appendChild(pop);
  const rect = targetEl.getBoundingClientRect();
  pop.style.top = (rect.bottom + 4) + 'px';
  pop.style.left = Math.min(rect.left, window.innerWidth - 160) + 'px';
  activePopover = pop;
  setTimeout(() => document.addEventListener('click', closeStatusPopover), 10);
}

async function doSetStatus(file, newStatus) {
  if (!currentProject) return;
  // Visual loading feedback on all status badges
  document.querySelectorAll('.ts.clickable').forEach(el => el.classList.add('updating'));
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  try {
    const r = await fetch(base + '/set-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, status: newStatus })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    await doRefresh();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== TRACKER PANEL =====
let selectedTreeNode = null;

function renderTracker() {
  const panel = document.getElementById('trackerPanel');
  const content = document.getElementById('trackerContent');
  if (!solData || !solData.length) { panel.classList.remove('active'); return; }
  panel.classList.add('active');

  let h = '';
  for (const sol of solData) {
    const sc = sol.statusCounts || {};
    const total = sol.total || 1;
    const approvedPct = ((sc.approved||0)/total*100).toFixed(0);
    const implementedPct = ((sc.implemented||0)/total*100).toFixed(0);
    const reviewPct = ((sc.review||0)/total*100).toFixed(0);
    const draftPct = ((sc.draft||0)/total*100).toFixed(0);
    const donePct = parseInt(approvedPct) + parseInt(implementedPct);

    h += '<div class="tracker-sol">';
    h += '<div class="tracker-sol-head">';
    h += '<span class="ts-id">' + esc(sol.id) + '</span>';
    h += '<span class="ts-name">' + esc(sol.title.replace(/^SOL-\\d+:\\s*/, '')) + '</span>';
    h += '<span class="ts-pct">' + donePct + '%</span>';
    h += '</div>';
    h += '<div class="tracker-bar">';
    if (sc.implemented) h += '<div class="tb-seg implemented" style="width:'+implementedPct+'%" title="Implemented: '+(sc.implemented||0)+'"></div>';
    if (sc.approved) h += '<div class="tb-seg approved" style="width:'+approvedPct+'%" title="Approved: '+(sc.approved||0)+'"></div>';
    if (sc.review) h += '<div class="tb-seg review" style="width:'+reviewPct+'%" title="Review: '+(sc.review||0)+'"></div>';
    if (sc.draft) h += '<div class="tb-seg draft" style="width:'+draftPct+'%" title="Draft: '+(sc.draft||0)+'"></div>';
    h += '</div></div>';
  }
  content.innerHTML = h;
}

function renderQuickActions(node) {
  const qa = document.getElementById('quickActions');
  if (!qa) return;
  selectedTreeNode = node;
  let h = '<div class="qa-title">Actions</div>';
  if (!node) {
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
    h += '<button class="qa-btn" onclick="doOpenVSCode(\\'' + esc(currentProject?.id || '') + '\\')">' + t('vsCode') + '</button>';
    h += '<button class="qa-btn" onclick="doRefresh()">' + t('refresh') + '</button>';
  } else if (node.type === 'solution') {
    const solNum = node.id.replace('SOL-','');
    h += '<button class="qa-btn" onclick="openAddUSModal(\\'' + esc(solNum) + '\\',\\'' + esc(node.title.replace(/'/g,'')) + '\\')">' + t('addUS') + '</button>';
    h += '<button class="qa-btn" onclick="openSolChat(\\'' + esc(node.id) + '\\',\\'' + esc(node.title.replace(/'/g,'')) + '\\')">' + t('chatBtn') + '</button>';
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
  } else if (node.type === 'user-story') {
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
    h += '<button class="qa-btn" onclick="doRefresh()">' + t('refresh') + '</button>';
  } else {
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
    h += '<button class="qa-btn" onclick="doRefresh()">' + t('refresh') + '</button>';
  }
  qa.innerHTML = h;
}

// ===== ADD USER STORY MODAL =====
let addUSTargetSol = null;
let addUSMode = 'discuss';

function openAddUSModal(solNum, solTitle) {
  addUSTargetSol = solNum;
  document.getElementById('addUSModal').classList.add('open');
  document.getElementById('addUSTitle').textContent = t('addUSModalTitle') + ' — SOL-' + solNum;
  document.getElementById('addUSSub').textContent = solTitle;
  document.getElementById('addUSInputTitle').value = '';
  document.getElementById('addUSNotes').value = '';
  setAddUSMode('discuss');
  setTimeout(() => document.getElementById('addUSInputTitle').focus(), 100);
}

function closeAddUSModal() {
  addUSTargetSol = null;
  document.getElementById('addUSModal').classList.remove('open');
}

function setAddUSMode(mode) {
  addUSMode = mode;
  document.getElementById('usModeDiscuss').classList.toggle('selected', mode === 'discuss');
  document.getElementById('usModeDirect').classList.toggle('selected', mode === 'direct');
  document.getElementById('addUSExtra').style.display = mode === 'direct' ? 'block' : 'none';
  document.getElementById('addUSBtn').textContent = mode === 'discuss' ? 'Start Discussion' : 'Generate Prompt';
}

async function doAddUS() {
  const title = document.getElementById('addUSInputTitle').value.trim();
  if (!title) { document.getElementById('addUSInputTitle').focus(); return; }

  if (addUSMode === 'discuss') {
    closeAddUSModal();
    openChat('SOL-' + addUSTargetSol, title);
  } else {
    const base = '/api/projects/' + encodeURIComponent(currentProject.id);
    const [nextIdData, bcData] = await Promise.all([
      fetch(base + '/next-us-id?sol=' + addUSTargetSol).then(r=>r.json()),
      fetch(base + '/bc-summary').then(r=>r.json()),
    ]);
    const nextId = nextIdData.next || '?';
    const notes = document.getElementById('addUSNotes').value.trim();
    const usId = addUSTargetSol + '.' + nextId;

    let prompt = '@architect Create a new User Story US-' + usId + ' for SOL-' + addUSTargetSol + '.\\n\\n';
    prompt += 'Title: ' + title + '\\n';
    if (notes) prompt += 'Notes: ' + notes + '\\n';
    prompt += '\\nContext (Business Case summary):\\n' + (bcData.summary || 'No BC available') + '\\n';
    prompt += '\\nCreate per metamodel:\\n1. US-' + usId + ' file\\n2. All Components (CMP-' + usId + '.x)\\n3. All Functions (FN-' + usId + '.x.y)\\n';
    prompt += 'Strictly follow naming conventions and templates.';

    closeAddUSModal();
    await navigator.clipboard.writeText(prompt);
    showToast(t('promptCopied'), 'success');
    await doRefresh();
  }
}

// ===== ADD-SOL MODAL =====
function openAddSolModal() {
  document.getElementById('addSolModal').classList.add('open');
  document.getElementById('addSolTitle').value = '';
  document.getElementById('addSolNotes').value = '';
  setAddSolMode('discuss');
  setTimeout(() => document.getElementById('addSolTitle').focus(), 100);
}
function closeAddSolModal() {
  document.getElementById('addSolModal').classList.remove('open');
}
function setAddSolMode(mode) {
  addSolMode = mode;
  document.getElementById('modeDiscuss').classList.toggle('selected', mode === 'discuss');
  document.getElementById('modeDirect').classList.toggle('selected', mode === 'direct');
  document.getElementById('addSolExtra').style.display = mode === 'direct' ? 'block' : 'none';
  document.getElementById('addSolBtn').textContent = mode === 'discuss' ? 'Start Discussion' : 'Generate Prompt';
}
async function doAddSol() {
  const title = document.getElementById('addSolTitle').value.trim();
  if (!title) { document.getElementById('addSolTitle').focus(); return; }

  if (addSolMode === 'discuss') {
    closeAddSolModal();
    openChat('new', title);
  } else {
    // Direct: generate Copilot prompt
    const base = '/api/projects/' + encodeURIComponent(currentProject.id);
    const [nextIdData, bcData, solsData] = await Promise.all([
      fetch(base + '/next-sol-id').then(r=>r.json()),
      fetch(base + '/bc-summary').then(r=>r.json()),
      fetch(base + '/solutions').then(r=>r.json()),
    ]);
    const nextId = nextIdData.next || '?';
    const solList = solsData.map(s => s.id + ': ' + s.title).join('\\n');
    const notes = document.getElementById('addSolNotes').value.trim();

    let prompt = '@architect Create a new Solution SOL-' + nextId + ' for the project.\\n\\n';
    prompt += 'Title: ' + title + '\\n';
    if (notes) prompt += 'Notes: ' + notes + '\\n';
    prompt += '\\nContext (Business Case summary):\\n' + (bcData.summary || 'No BC available') + '\\n';
    prompt += '\\nExisting Solutions:\\n' + (solList || 'None') + '\\n';
    prompt += '\\nCreate per metamodel:\\n1. SOL-' + nextId + ' file\\n2. All User Stories (US)\\n3. All Components (CMP)\\n4. All Functions (FN)\\n';
    prompt += 'Strictly follow naming conventions and templates.';

    closeAddSolModal();
    await navigator.clipboard.writeText(prompt);
    showToast(t('promptCopied'), 'success');
    await doRefresh();
  }
}

// ===== CHAT PANEL =====
function openChat(relatedTo, title) {
  chatContext = { relatedTo, title };
  chatMessages = [];
  document.getElementById('chatTitle').textContent = relatedTo === 'new' ? 'New Idea: ' + title : relatedTo + ' Discussion';
  document.getElementById('chatBadge').textContent = chatLLMConfigured ? '' : 'Not configured';
  document.getElementById('chatPanel').classList.add('open');
  renderChatMessages();

  if (!chatLLMConfigured) {
    document.getElementById('chatMessages').innerHTML =
      '<div class="chat-not-configured">' +
      '<div class="cfg-icon">&#9881;</div>' +
      '<div class="cfg-text">LLM nicht konfiguriert.<br>Erstelle die Konfigurationsdatei:</div>' +
      '<code>_ARQITEKT/config/llm.yaml\\n\\nllm:\\n  provider: deepseek\\n  endpoint: https://api.deepseek.com/v1/chat/completions\\n  model: deepseek-chat\\n  api_key_env: ARQITEKT_LLM_KEY\\n  temperature: 0.7\\n  max_tokens: 4096</code>' +
      '<div class="cfg-text">Dann setze die Umgebungsvariable:<br><strong>ARQITEKT_LLM_KEY</strong></div>' +
      '</div>';
    return;
  }

  // System message
  chatMessages.push({ role: 'system', content: buildSystemPrompt() });
  // Welcome
  const welcomeMsg = relatedTo === 'new'
    ? 'Let\\'s brainstorm about "' + title + '". What do you have in mind? What problem should this solution solve?'
    : 'Let\\'s discuss ' + relatedTo + '. What would you like to explore or refine?';
  chatMessages.push({ role: 'assistant', content: welcomeMsg });
  renderChatMessages();
  document.getElementById('chatInput').focus();
}

function closeChat() {
  document.getElementById('chatPanel').classList.remove('open');
}

function buildSystemPrompt() {
  const bcTitle = currentProject?.bcTitle || 'Unknown';
  const solList = solData.map(s => s.id + ': ' + s.title.replace(/^SOL-\\d+:\\s*/, '')).join(', ');
  return 'You are an experienced requirements engineering consultant. You help brainstorm for a software project.\\n\\n' +
    'Project: ' + bcTitle + '\\n' +
    'Existing Solutions: ' + (solList || 'None') + '\\n\\n' +
    'Your task: Help the user think through the idea. Ask follow-up questions, identify edge cases, ' +
    'suggest structures (User Stories, Components). Be constructive and precise. ' +
    'Respond in English.';
}

function renderChatMessages() {
  const el = document.getElementById('chatMessages');
  let h = '';
  for (const msg of chatMessages) {
    if (msg.role === 'system') continue;
    h += '<div class="chat-msg ' + msg.role + '">' + esc(msg.content) + '</div>';
  }
  el.innerHTML = h;
  el.scrollTop = el.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  chatMessages.push({ role: 'user', content: text });
  renderChatMessages();

  // Disable send while waiting
  const btn = document.getElementById('chatSendBtn');
  btn.disabled = true;
  btn.textContent = '...';

  // Show typing indicator
  const msgEl = document.getElementById('chatMessages');
  msgEl.insertAdjacentHTML('beforeend', '<div class="chat-msg assistant" id="chatTyping" style="opacity:.5">Thinking...</div>');
  msgEl.scrollTop = msgEl.scrollHeight;

  try {
    const resp = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatMessages.filter(m => m.role !== 'system') }),
    });
    const data = await resp.json();
    const typing = document.getElementById('chatTyping');
    if (typing) typing.remove();

    if (data.error) {
      chatMessages.push({ role: 'assistant', content: 'Error: ' + data.error });
    } else {
      chatMessages.push({ role: 'assistant', content: data.content });
    }
    renderChatMessages();
  } catch (err) {
    const typing = document.getElementById('chatTyping');
    if (typing) typing.remove();
    chatMessages.push({ role: 'assistant', content: 'Connection error: ' + err.message });
    renderChatMessages();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send';
  }
}

// Enter to send (Shift+Enter for newline)
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

function openSolChat(solId, solTitle) {
  openChat(solId, solTitle);
}

// ===== SAVE CONVERSATION =====
async function saveChatConversation() {
  if (!currentProject || chatMessages.length < 2) return;
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const nextSol = chatContext?.relatedTo === 'new' ? 'new' : chatContext?.relatedTo;
  const convId = 'DISC-' + (nextSol || 'misc') + '-' + Date.now().toString(36);
  const conv = {
    id: convId,
    title: chatContext?.title || 'Discussion',
    status: 'open',
    related_to: nextSol || 'misc',
    messages: chatMessages.filter(m => m.role !== 'system'),
    provider: 'configured-llm',
    model: 'unknown',
  };
  try {
    await fetch(base + '/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conv),
    });
    showToast(t('savedConv'), 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== FORMALIZATION =====
async function formalizeChat() {
  if (!currentProject || chatMessages.length < 3) {
    showToast(t('discussFirst'), 'error');
    return;
  }

  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const [nextIdData, solsData] = await Promise.all([
    fetch(base + '/next-sol-id').then(r=>r.json()),
    fetch(base + '/solutions').then(r=>r.json()),
  ]);
  const nextId = nextIdData.next || '?';
  const solList = solsData.map(s => s.id + ': ' + s.title).join('\\n');

  // Build conversation text
  let convText = '';
  for (const msg of chatMessages) {
    if (msg.role === 'system') continue;
    convText += (msg.role === 'user' ? 'User' : 'Assistant') + ': ' + msg.content + '\\n\\n';
  }

  let prompt = '@architect Here is the result of a discussion about a new solution.\\n\\n';
  prompt += 'Project: ' + (currentProject.bcTitle || currentProject.id) + '\\n';
  prompt += 'Existing Solutions:\\n' + (solList || 'None') + '\\n\\n';
  prompt += '--- Discussion ---\\n' + convText + '--- End ---\\n\\n';
  prompt += 'Formalize the discussion result as:\\n';
  prompt += '1. A new SOL-' + nextId + ' file (per template/solution.md)\\n';
  prompt += '2. All derived US files (per template/user-story.md)\\n';
  prompt += '3. All derived CMP files (per template/component.md)\\n';
  prompt += '4. All derived FN files (per template/function.md)\\n\\n';
  prompt += 'Strictly follow the metamodel and naming conventions.\\n';
  prompt += 'Next available Solution ID: SOL-' + nextId;

  await navigator.clipboard.writeText(prompt);

  // Also save the conversation
  await saveChatConversation();

  showToast(t('formalized'), 'success');
}

// ===== CREATE PROJECT =====
function openCreateModal() {
  // Use the onboarding wizard instead of the simple modal
  openWizardModal();
}
function closeCreateModal() {
  const m = document.getElementById('createModal');
  releaseFocus(m);
  m.classList.remove('open');
}

// ===== IMPORT PROJECT =====
function openImportModal() {
  document.getElementById('importModal').classList.add('open');
  document.getElementById('importPathInput').value = '';
  document.getElementById('importNameInput').value = '';
  document.getElementById('importDescInput').value = '';
  document.getElementById('importGithubInput').value = '';
  document.getElementById('importPreview').textContent = '';
  setTimeout(() => document.getElementById('importPathInput').focus(), 100);
}
function closeImportModal() {
  document.getElementById('importModal').classList.remove('open');
}
async function doImportProject() {
  const sourcePath = document.getElementById('importPathInput').value.trim();
  const name = document.getElementById('importNameInput').value.trim();
  const description = document.getElementById('importDescInput').value.trim();
  const githubRepo = document.getElementById('importGithubInput').value.trim();
  if (!sourcePath || !name) { showToast(t('requiredFields'), 'error'); return; }
  try {
    const r = await fetch('/api/projects/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourcePath, name, description, githubRepo })
    });
    const data = await r.json();
    if (data.error) { showToast(t('importError') + data.error, 'error'); return; }
    showToast(t('importSuccess').replace('{id}', data.projectId).replace('{n}', data.filesCopied || 0), 'celebrate', 5000);
    closeImportModal();
    await loadProjects();
  } catch (e) { showToast(t('errorPrefix') + e.message, 'error'); }
}

document.getElementById('projectNameInput').addEventListener('input', async e => {
  const name = e.target.value.trim();
  if (!name) { document.getElementById('projectPreview').textContent = ''; return; }
  const code = name.normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  try {
    const r = await fetch('/api/projects');
    const projects = await r.json();
    const maxNum = projects.reduce((max, p) => { const n = parseInt(p.id?.slice(0,3)); return n > max ? n : max; }, 0);
    const next = String(maxNum + 1).padStart(3, '0');
    document.getElementById('projectPreview').textContent = '\u2192 ' + next + '_' + code;
  } catch { document.getElementById('projectPreview').textContent = '\u2192 ' + code; }
});

async function doCreateProject() {
  const name = document.getElementById('projectNameInput').value.trim();
  const description = document.getElementById('projectDescInput').value.trim();
  if (!name) return;
  const btn = document.getElementById('createBtn');
  btn.textContent = 'Creating...';
  btn.disabled = true;
  try {
    const r = await fetch('/api/projects/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    closeCreateModal();
    await openProject(data.id);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Create';
    btn.disabled = false;
  }
}

// ===== EDIT PROJECT =====
let editTarget = null;

function openEditModal(projectId, name, description) {
  editTarget = projectId;
  const m = document.getElementById('editModal');
  m.classList.add('open');
  document.getElementById('editModalTitle').textContent = 'Edit Project ' + projectId.slice(0,3);
  document.getElementById('editNameInput').value = name || '';
  document.getElementById('editDescInput').value = description || '';
  const code = (name || '').normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  document.getElementById('editPreview').textContent = '\u2192 ' + projectId.slice(0,3) + '_' + code;
  setTimeout(() => { document.getElementById('editNameInput').focus(); trapFocus(m); }, 100);
}
function closeEditModal() {
  editTarget = null;
  const m = document.getElementById('editModal');
  releaseFocus(m);
  m.classList.remove('open');
}

document.getElementById('editNameInput').addEventListener('input', e => {
  const name = e.target.value.trim();
  if (!name || !editTarget) { document.getElementById('editPreview').textContent = ''; return; }
  const code = name.normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  document.getElementById('editPreview').textContent = '\u2192 ' + editTarget.slice(0,3) + '_' + code;
});

async function doEditProject() {
  if (!editTarget) return;
  const name = document.getElementById('editNameInput').value.trim();
  const description = document.getElementById('editDescInput').value.trim();
  if (!name) return;
  const btn = document.getElementById('editBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  try {
    // Update description
    await fetch('/api/projects/' + encodeURIComponent(editTarget) + '/update-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    // Rename (also updates name + codename + folder)
    const r = await fetch('/api/projects/' + encodeURIComponent(editTarget) + '/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    closeEditModal();
    // If we're inside the project view and it was renamed, redirect
    if (currentProject && currentProject.id === editTarget && data.id !== editTarget) {
      location.hash = data.id;
      await openProject(data.id);
    } else {
      await loadProjects();
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Save';
    btn.disabled = false;
  }
}

// ===== DELETE PROJECT =====
function promptDelete(projectId, codename, name, totalArtifacts, hasGithub) {
  deleteTarget = projectId;
  deleteCodename = codename;
  document.getElementById('confirmTitle').textContent = t('deleteConfirmTitle');
  document.getElementById('confirmText').textContent = 'Project "' + name + '" (' + projectId + ') and all its files will be permanently deleted.';
  const ghHint = document.getElementById('confirmGithubHint');
  if (hasGithub) {
    ghHint.style.display = 'block';
    ghHint.textContent = t('deleteGithubHint');
  } else {
    ghHint.style.display = 'none';
  }
  const artCount = document.getElementById('confirmArtifactCount');
  if (totalArtifacts > 0) {
    artCount.style.display = 'block';
    artCount.textContent = t('deleteArtifactCount').replace('{n}', totalArtifacts);
  } else {
    artCount.style.display = 'none';
  }
  document.getElementById('confirmCodenameLabel').textContent = t('deleteTypeConfirm').replace('{codename}', codename);
  const inp = document.getElementById('confirmCodename');
  inp.value = '';
  const delBtn = document.getElementById('confirmDeleteBtn');
  delBtn.disabled = true;
  inp.oninput = function() { delBtn.disabled = inp.value.trim() !== codename; };
  document.getElementById('confirmDialog').classList.add('open');
  setTimeout(() => inp.focus(), 100);
}
function closeConfirm() {
  deleteTarget = null;
  deleteCodename = null;
  document.getElementById('confirmDialog').classList.remove('open');
}
async function confirmDelete() {
  if (!deleteTarget) return;
  const inp = document.getElementById('confirmCodename');
  if (deleteCodename && inp.value.trim() !== deleteCodename) return;
  const id = deleteTarget;
  closeConfirm();
  await fetch('/api/projects/' + encodeURIComponent(id) + '/delete', { method: 'POST' });
  if (currentProject && currentProject.id === id) {
    showHub();
  } else {
    loadProjects();
  }
}

// ===== VS CODE =====
async function doOpenVSCode(projectId) {
  await fetch('/api/projects/' + encodeURIComponent(projectId) + '/open');
}

// ===== FACTORY: Scaffold / App Start / App Stop =====
async function doScaffold(projectId) {
  if (!confirm(t('confirmScaffold'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/scaffold', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('scaffoldCopilot') + ' — ' + (data.filesCreated || 0) + ' files', 'celebrate', 5000);
    const r2 = await fetch(base + '/codegen', { method: 'POST' });
    const data2 = await r2.json();
    if (data2.error) { showToast(data2.error, 'error'); }
    else { showToast('Codegen: ' + (data2.filesGenerated || 0) + ' files', 'celebrate', 5000); }
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doForceScaffold(projectId) {
  if (!confirm(t('confirmForceScaffold'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/force-scaffold', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Scaffold: ' + (data.filesCreated || 0) + ' files', 'celebrate', 5000);
    const r2 = await fetch(base + '/codegen', { method: 'POST' });
    const data2 = await r2.json();
    if (data2.error) { showToast(data2.error, 'error'); }
    else { showToast('Codegen: ' + (data2.filesGenerated || 0) + ' files', 'celebrate', 5000); }
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doGitHubExport(projectId) {
  if (!confirm(t('confirmExport'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/github-export', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('exportIssues') + ': ' + (data.issueCount || 0) + ' → ' + (data.outputFile || 'exports/'), 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

async function doGitHubPush(projectId) {
  if (!confirm(t('confirmPush'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  const btn = document.getElementById('btnGhPush');
  if (btn) { btn.disabled = true; btn.textContent = 'Pushing...'; }
  try {
    const r = await fetch(base + '/github/push', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Push OK: ' + (data.commitMessage || ''), 'success');
    if (btn) { btn.textContent = 'Pushed'; setTimeout(() => { btn.textContent = t('storePush'); btn.disabled = false; }, 3000); }
  } catch (e) {
    showToast(e.message, 'error');
    if (btn) { btn.textContent = t('storePush'); btn.disabled = false; }
  }
}

async function doStoreConfigure(projectId, platform) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/store/configure', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: platform || 'android' })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeConfig') + ': ' + (data.filesCreated || []).join(', '), 'success');
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doStoreBuild(projectId) {
  if (!confirm(t('confirmStoreBuild'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/store/build', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeBuild') + ' OK', 'celebrate', 5000);
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doStoreUpload(projectId) {
  if (!confirm(t('storeUploadBtn') + '?')) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    showToast(t('buildProgress'), 'info', 15000);
    const r = await fetch(base + '/store/upload', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeUploadBtn') + ' OK', 'celebrate', 5000);
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doStoreGHActions(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/store/github-actions', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeGHActions') + ' OK', 'celebrate', 5000);
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doRunTests(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/test/run', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Tests: ' + (data.passed || 0) + ' passed, ' + (data.failed || 0) + ' failed', data.failed ? 'error' : 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

async function doSetupPlaywright(projectId) {
  if (!confirm(t('confirmPlaywright'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/test/setup', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Playwright: ' + (data.filesCreated || 0) + ' files', 'success');
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doAppStart(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/app/start', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    await loadProjects();
    if (data.port) window.open('http://localhost:' + data.port, '_blank');
  } catch (e) { showToast(e.message, 'error'); }
}

async function doAppStop(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/app/stop', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doAppBuildDeploy(projectId) {
  if (!confirm(t('confirmBuildDeploy'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    showToast(t('buildProgress'), 'info', 10000);
    const r = await fetch(base + '/app/build', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    const r2 = await fetch(base + '/app/deploy', { method: 'POST' });
    const data2 = await r2.json();
    if (data2.error) { showToast(data2.error, 'error'); return; }
    await loadProjects();
    if (data2.port) window.open('http://localhost:' + data2.port, '_blank');
  } catch (e) { showToast(e.message, 'error'); }
}

// ===== BRANDING MODAL =====
let brandingTarget = null;

function openBrandingModal(projectId) {
  brandingTarget = projectId;
  const m = document.getElementById('brandingModal');
  m.classList.add('open');
  document.getElementById('brandingModalTitle').textContent = t('branding') + ': ' + projectId;
  // Load existing branding
  fetch('/api/projects/' + encodeURIComponent(projectId) + '/branding')
    .then(r => r.json()).then(data => {
      const b = data.branding || {};
      document.getElementById('brandPrimary').value = b.primary || '#FFD700';
      document.getElementById('brandSecondary').value = b.secondary || '#1F1F1F';
      document.getElementById('brandFontHeading').value = b.font_heading || 'Inter';
      document.getElementById('brandFontBody').value = b.font_body || 'Inter';
      document.getElementById('brandFontMono').value = b.font_mono || 'JetBrains Mono';
      document.getElementById('brandMode').value = b.mode || 'dark';
      document.getElementById('brandLogo').value = b.logo || '';
      updateBrandingPreview();
      setTimeout(() => trapFocus(m), 100);
    });
}

function closeBrandingModal() {
  brandingTarget = null;
  const m = document.getElementById('brandingModal');
  releaseFocus(m);
  m.classList.remove('open');
}

function updateBrandingPreview() {
  document.getElementById('brandSwatchPrimary').style.background = document.getElementById('brandPrimary').value;
  document.getElementById('brandSwatchSecondary').style.background = document.getElementById('brandSecondary').value;
  document.getElementById('brandPreviewText').textContent =
    document.getElementById('brandFontHeading').value + ' / ' +
    document.getElementById('brandFontMono').value + ' / ' +
    document.getElementById('brandMode').value;
}

async function saveBranding() {
  if (!brandingTarget) return;
  const branding = {
    primary: document.getElementById('brandPrimary').value,
    secondary: document.getElementById('brandSecondary').value,
    fontHeading: document.getElementById('brandFontHeading').value,
    fontBody: document.getElementById('brandFontBody').value,
    fontMono: document.getElementById('brandFontMono').value,
    mode: document.getElementById('brandMode').value,
    logo: document.getElementById('brandLogo').value.trim() || undefined,
  };
  try {
    const r = await fetch('/api/projects/' + encodeURIComponent(brandingTarget) + '/branding', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branding }),
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    closeBrandingModal();
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

// ===== UTIL =====
function esc(s) { if (!s) return ''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

// Focus trap for modals
function trapFocus(modal) {
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  modal._focusTrapHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  };
  modal.addEventListener('keydown', modal._focusTrapHandler);
}
function releaseFocus(modal) {
  if (modal._focusTrapHandler) { modal.removeEventListener('keydown', modal._focusTrapHandler); delete modal._focusTrapHandler; }
}

// ===== START =====
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (activePopover) { closeStatusPopover(); return; }
  if (document.getElementById('confirmDialog').classList.contains('open')) { closeConfirm(); return; }
  if (document.getElementById('addUSModal').classList.contains('open')) { closeAddUSModal(); return; }
  if (document.getElementById('addSolModal').classList.contains('open')) { closeAddSolModal(); return; }
  if (document.getElementById('editModal').classList.contains('open')) { closeEditModal(); return; }
  if (document.getElementById('brandingModal').classList.contains('open')) { closeBrandingModal(); return; }
  if (document.getElementById('createModal').classList.contains('open')) { closeCreateModal(); return; }
  if (document.getElementById('importModal').classList.contains('open')) { closeImportModal(); return; }
  if (document.getElementById('feedbackModal').style.display === 'flex') { closeFeedbackModal(); return; }
  if (document.getElementById('wizardModal').style.display === 'flex') { closeWizardModal(); return; }
  if (document.getElementById('chatPanel').classList.contains('open')) { closeChat(); return; }
  if (document.getElementById('valOverlay').classList.contains('open')) { closeVal(); return; }
  if (document.getElementById('detailOverlay').classList.contains('open')) { closeDetail(); return; }
});

// Branding preview live updates
['brandPrimary','brandSecondary','brandFontHeading','brandFontBody','brandFontMono','brandMode'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateBrandingPreview);
});

init();
</script>
</body>
</html>`;
}

// --- Server ---

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname.startsWith('/api/')) return handleAPI(req, url, res);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(getDashboardHTML());
});

server.listen(PORT, () => {
  console.log('');
  console.log(`  ARQITEKT Hub Dashboard  →  http://localhost:${PORT}`);
  console.log(`  Workspace: ${WORKSPACE_ROOT}`);
  console.log('');
});

// Graceful shutdown — kill all running apps
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
