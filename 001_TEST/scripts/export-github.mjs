// ============================================================================
// ARQITEKT — GitHub Issues Export
// ============================================================================
// Konvertiert Requirements in GitHub Issues-kompatibles Format.
// Erzeugt:
//   1. exports/github-issues.json  — Strukturierte Daten fuer API/CLI-Import
//   2. exports/github-import.sh    — Bash-Script fuer `gh issue create` Bulk-Import
// Usage: node scripts/export-github.mjs
// ============================================================================

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const REQ_DIR = join(ROOT, 'requirements');
const EXPORT_DIR = join(ROOT, 'exports');

const PROJECT = basename(ROOT).match(/^\d+_(.+)$/)?.[1] || basename(ROOT);

function getFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort();
}

function parseFile(filePath) {
  const content = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      fm[key] = val;
    }
  }

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : basename(filePath, '.md');

  // Extract body after frontmatter
  const body = content.replace(/^---[\s\S]*?---\r?\n*/, '').trim();

  // Extract acceptance criteria
  const acRegex = /- \[ \] (AC-[\d.]+:.+)/g;
  const criteria = [];
  let acMatch;
  while ((acMatch = acRegex.exec(content)) !== null) {
    criteria.push(acMatch[1]);
  }

  return { ...fm, title, body, acceptance_criteria: criteria, path: filePath };
}

// --- Status to GitHub Label mapping ---
const STATUS_LABELS = {
  idea: 'status:idea',
  draft: 'status:draft',
  review: 'status:review',
  approved: 'status:approved',
  implemented: 'status:implemented',
};

const TYPE_LABELS = {
  solution: 'type:epic',
  'user-story': 'type:story',
  component: 'type:component',
  function: 'type:task',
};

// --- Build Export ---

const sols = getFiles(join(REQ_DIR, 'solutions'));
const uss = getFiles(join(REQ_DIR, 'user-stories'));
const cmps = getFiles(join(REQ_DIR, 'components'));
const fns = getFiles(join(REQ_DIR, 'functions'));

const issues = [];
const milestones = new Set();

for (const solFile of sols) {
  const sol = parseFile(join(REQ_DIR, 'solutions', solFile));
  const solNum = solFile.match(/SOL-(\d+)/)?.[1];
  const solKey = `SOL-${solNum}`;
  const milestoneName = `${solKey}: ${sol.title.replace(/^SOL-\d+:\s*/, '')}`;
  milestones.add(milestoneName);

  // SOL becomes a milestone + tracking issue
  issues.push({
    title: `[${solKey}] ${sol.title.replace(/^SOL-\d+:\s*/, '')}`,
    body: sol.body,
    labels: [TYPE_LABELS.solution, STATUS_LABELS[sol.status] || 'status:idea', `sol:${solNum}`].filter(Boolean),
    milestone: milestoneName,
    arqitekt_id: sol.id || solKey,
    arqitekt_type: 'solution',
  });

  // User Stories as issues
  const solUS = uss.filter(u => u.match(new RegExp(`^US-${solNum}\\.`)));
  for (const usFile of solUS) {
    const us = parseFile(join(REQ_DIR, 'user-stories', usFile));
    const usId = usFile.match(/US-(\d+\.\d+)/)?.[1];
    const usKey = `US-${usId}`;

    // Build body with AC as task list
    let usBody = us.body;
    if (us.acceptance_criteria.length > 0) {
      usBody = us.body;
    }

    issues.push({
      title: `[${usKey}] ${us.title.replace(/^US-[\d.]+:\s*/, '')}`,
      body: usBody,
      labels: [TYPE_LABELS['user-story'], STATUS_LABELS[us.status] || 'status:idea', `sol:${solNum}`].filter(Boolean),
      milestone: milestoneName,
      arqitekt_id: us.id || usKey,
      arqitekt_type: 'user-story',
      parent: solKey,
    });

    // Components + Functions as sub-issues
    const usCMP = cmps.filter(c => c.match(new RegExp(`^CMP-${usId?.replace('.', '\\.')}\\.`)));
    for (const cmpFile of usCMP) {
      const cmp = parseFile(join(REQ_DIR, 'components', cmpFile));
      const cmpId = cmpFile.match(/CMP-(\d+\.\d+\.\d+)/)?.[1];
      const cmpKey = `CMP-${cmpId}`;

      // Collect FNs for this CMP as task list
      const cmpFN = fns.filter(f => f.match(new RegExp(`^FN-${cmpId?.replace(/\./g, '\\.')}\\.`)));
      const fnTasks = cmpFN.map(fnFile => {
        const fn = parseFile(join(REQ_DIR, 'functions', fnFile));
        const fnId = fnFile.match(/FN-(\d+\.\d+\.\d+\.\d+)/)?.[1];
        return { id: `FN-${fnId}`, title: fn.title.replace(/^FN-[\d.]+:\s*/, ''), body: fn.body, status: fn.status };
      });

      let cmpBody = cmp.body;
      if (fnTasks.length > 0) {
        cmpBody += '\n\n## Funktionale Anforderungen\n\n';
        for (const fn of fnTasks) {
          cmpBody += `- [ ] **${fn.id}**: ${fn.title}\n`;
        }
      }

      issues.push({
        title: `[${cmpKey}] ${cmp.title.replace(/^CMP-[\d.]+:\s*/, '')}`,
        body: cmpBody,
        labels: [TYPE_LABELS.component, STATUS_LABELS[cmp.status] || 'status:idea', `sol:${solNum}`].filter(Boolean),
        milestone: milestoneName,
        arqitekt_id: cmp.id || cmpKey,
        arqitekt_type: 'component',
        parent: usKey,
      });
    }
  }
}

// --- Write JSON Export ---

if (!existsSync(EXPORT_DIR)) mkdirSync(EXPORT_DIR, { recursive: true });

const exportData = {
  project: PROJECT,
  exported_at: new Date().toISOString(),
  framework: 'ARQITEKT',
  milestones: [...milestones],
  issues,
  summary: {
    milestones: milestones.size,
    epics: issues.filter(i => i.arqitekt_type === 'solution').length,
    stories: issues.filter(i => i.arqitekt_type === 'user-story').length,
    components: issues.filter(i => i.arqitekt_type === 'component').length,
    total_issues: issues.length,
  },
};

const jsonPath = join(EXPORT_DIR, 'github-issues.json');
writeFileSync(jsonPath, JSON.stringify(exportData, null, 2));

// --- Write gh CLI Import Script ---

let script = '#!/usr/bin/env bash\n';
script += '# ============================================================================\n';
script += `# ARQITEKT — GitHub Issues Import fuer ${PROJECT}\n`;
script += `# Generiert: ${new Date().toISOString()}\n`;
script += '# Usage: chmod +x exports/github-import.sh && ./exports/github-import.sh\n';
script += '# Voraussetzung: gh CLI installiert und authentifiziert\n';
script += '# ============================================================================\n\n';
script += 'set -euo pipefail\n\n';
script += 'REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"\n';
script += 'echo "Import nach: $REPO"\n\n';

// Create labels
script += '# --- Labels erstellen ---\n';
const allLabels = new Set();
for (const issue of issues) {
  for (const label of issue.labels) allLabels.add(label);
}
for (const label of allLabels) {
  const color = label.startsWith('status:') ? '0E8A16' :
                label.startsWith('type:') ? '1D76DB' :
                label.startsWith('sol:') ? 'D4C5F9' : 'EDEDED';
  script += `gh label create "${label}" --color "${color}" --repo "$REPO" 2>/dev/null || true\n`;
}

// Create milestones
script += '\n# --- Milestones erstellen ---\n';
for (const ms of milestones) {
  script += `gh api repos/{owner}/{repo}/milestones -f title="${ms.replace(/"/g, '\\"')}" 2>/dev/null || true\n`;
}

// Create issues
script += '\n# --- Issues erstellen ---\n';
script += 'echo "Erstelle Issues..."\n';
for (const issue of issues) {
  const labels = issue.labels.map(l => `--label "${l}"`).join(' ');
  const title = issue.title.replace(/"/g, '\\"');
  // Truncate body for CLI (use JSON for full bodies)
  const shortBody = (issue.body || '').slice(0, 500).replace(/"/g, '\\"').replace(/\n/g, '\\n');
  script += `gh issue create --repo "$REPO" --title "${title}" ${labels} --body "${shortBody}" || true\n`;
}

script += '\necho "Import abgeschlossen!"\n';

const shPath = join(EXPORT_DIR, 'github-import.sh');
writeFileSync(shPath, script);

// --- Console Output ---

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  ARQITEKT — GitHub Issues Export                 ║');
console.log('╚══════════════════════════════════════════════════╝\n');
console.log(`Projekt:      ${PROJECT}`);
console.log(`Milestones:   ${milestones.size}`);
console.log(`Issues:       ${issues.length}`);
console.log(`  Epics:      ${exportData.summary.epics}`);
console.log(`  Stories:    ${exportData.summary.stories}`);
console.log(`  Components: ${exportData.summary.components}`);
console.log(`\n→ JSON:   exports/github-issues.json`);
console.log(`→ Script: exports/github-import.sh`);
