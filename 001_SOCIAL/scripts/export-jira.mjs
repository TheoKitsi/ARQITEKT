// ============================================================================
// ARQITEKT — Jira/Linear Export
// ============================================================================
// Konvertiert Requirements in Jira-kompatibles JSON.
// Usage: node scripts/export-jira.mjs
// ============================================================================

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const REQ_DIR = join(ROOT, 'requirements');
const EXPORT_DIR = join(ROOT, 'exports');

function getFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort();
}

function parseFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      fm[key] = val;
    }
  }

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : basename(filePath, '.md');

  // Extract acceptance criteria
  const acRegex = /- \[ \] (AC-[\d.]+:.+)/g;
  const criteria = [];
  let acMatch;
  while ((acMatch = acRegex.exec(content)) !== null) {
    criteria.push(acMatch[1]);
  }

  return { ...fm, title, acceptance_criteria: criteria, path: filePath };
}

// --- Build Export ---

const sols = getFiles(join(REQ_DIR, 'solutions'));
const uss = getFiles(join(REQ_DIR, 'user-stories'));
const cmps = getFiles(join(REQ_DIR, 'components'));
const fns = getFiles(join(REQ_DIR, 'functions'));

const exportData = {
  project: basename(ROOT).match(/^\d+_(.+)$/)?.[1] || basename(ROOT),
  exported_at: new Date().toISOString(),
  framework: 'ARQITEKT',
  epics: [],
};

for (const solFile of sols) {
  const sol = parseFile(join(REQ_DIR, 'solutions', solFile));
  const solNum = solFile.match(/SOL-(\d+)/)?.[1];

  const epic = {
    key: `SOL-${solNum}`,
    summary: sol.title,
    type: 'Epic',
    status: sol.status || 'draft',
    stories: [],
  };

  const solUS = uss.filter(u => u.match(new RegExp(`^US-${solNum}\\.`)));
  for (const usFile of solUS) {
    const us = parseFile(join(REQ_DIR, 'user-stories', usFile));
    const usId = usFile.match(/US-(\d+\.\d+)/)?.[1];

    const story = {
      key: `US-${usId}`,
      summary: us.title,
      type: 'Story',
      status: us.status || 'draft',
      acceptance_criteria: us.acceptance_criteria,
      subtasks: [],
    };

    // Functions as subtasks (grouped by CMP)
    const usCMP = cmps.filter(c => c.match(new RegExp(`^CMP-${usId?.replace('.', '\\.')}\\.`)));
    for (const cmpFile of usCMP) {
      const cmpId = cmpFile.match(/CMP-(\d+\.\d+\.\d+)/)?.[1];
      const cmpFN = fns.filter(f => f.match(new RegExp(`^FN-${cmpId?.replace(/\./g, '\\.')}\\.`)));

      for (const fnFile of cmpFN) {
        const fn = parseFile(join(REQ_DIR, 'functions', fnFile));
        const fnId = fnFile.match(/FN-(\d+\.\d+\.\d+\.\d+)/)?.[1];

        story.subtasks.push({
          key: `FN-${fnId}`,
          summary: fn.title,
          type: 'Sub-task',
          status: fn.status || 'draft',
          component: `CMP-${cmpId}`,
        });
      }
    }

    epic.stories.push(story);
  }

  exportData.epics.push(epic);
}

// --- Write Export ---

if (!existsSync(EXPORT_DIR)) mkdirSync(EXPORT_DIR, { recursive: true });

const exportPath = join(EXPORT_DIR, 'jira-export.json');
writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  ARQITEKT — Jira/Linear Export                   ║');
console.log('╚══════════════════════════════════════════════════╝\n');
console.log(`Epics:     ${exportData.epics.length}`);
console.log(`Stories:   ${exportData.epics.reduce((sum, e) => sum + e.stories.length, 0)}`);
console.log(`Subtasks:  ${exportData.epics.reduce((sum, e) => sum + e.stories.reduce((s, st) => s + st.subtasks.length, 0), 0)}`);
console.log(`\n→ Gespeichert: exports/jira-export.json`);
