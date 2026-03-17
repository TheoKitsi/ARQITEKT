// ============================================================================
// ARQITEKT — Requirements Tree Generator
// ============================================================================
// Generiert eine visuelle Baum-Darstellung aller Requirements.
// Usage: node scripts/tree.mjs [--stats]
// ============================================================================

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const REQ_DIR = join(ROOT, 'requirements');

const showStats = process.argv.includes('--stats');

function getFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort();
}

function extractTitle(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : basename(filePath, '.md');
  } catch {
    return basename(filePath, '.md');
  }
}

function extractStatus(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const statusMatch = content.match(/status:\s*["']?(\w+)["']?/);
    return statusMatch ? statusMatch[1] : '?';
  } catch {
    return '?';
  }
}

// --- Build Tree ---

const sols = getFiles(join(REQ_DIR, 'solutions'));
const uss = getFiles(join(REQ_DIR, 'user-stories'));
const cmps = getFiles(join(REQ_DIR, 'components'));
const fns = getFiles(join(REQ_DIR, 'functions'));
const convs = getFiles(join(REQ_DIR, 'conversations'));
const infs = getFiles(join(REQ_DIR, 'infrastructure'));
const ntfs = getFiles(join(REQ_DIR, 'notifications'));
const adrs = getFiles(join(REQ_DIR, 'adrs'));

let output = '';

function line(text) {
  output += text + '\n';
  console.log(text);
}

// --- BC ---
const bcPath = join(REQ_DIR, '00_BUSINESS_CASE.md');
const bcTitle = existsSync(bcPath) ? extractTitle(bcPath) : 'Business Case (nicht gefunden)';
line(`${bcTitle}`);
line('│');

// --- SOLs → US → CMP → FN → CONV ---
for (let si = 0; si < sols.length; si++) {
  const solFile = sols[si];
  const solPath = join(REQ_DIR, 'solutions', solFile);
  const solNum = solFile.match(/SOL-(\d+)/)?.[1];
  const solStatus = extractStatus(solPath);
  const isLastSol = si === sols.length - 1 && infs.length === 0 && ntfs.length === 0 && adrs.length === 0;
  const solPrefix = isLastSol ? '└── ' : '├── ';
  const solContinue = isLastSol ? '    ' : '│   ';

  line(`${solPrefix}SOL-${solNum}: ${basename(solFile, '.md').replace(/^SOL-\d+_/, '').replace(/_/g, ' ')} [${solStatus}]`);

  // User Stories for this SOL
  const solUS = uss.filter(u => u.match(new RegExp(`^US-${solNum}\\.`)));
  for (let ui = 0; ui < solUS.length; ui++) {
    const usFile = solUS[ui];
    const usPath = join(REQ_DIR, 'user-stories', usFile);
    const usId = usFile.match(/US-(\d+\.\d+)/)?.[1];
    const usStatus = extractStatus(usPath);
    const isLastUS = ui === solUS.length - 1;
    const usPrefix = isLastUS ? '└── ' : '├── ';
    const usContinue = isLastUS ? '    ' : '│   ';

    line(`${solContinue}${usPrefix}US-${usId}: ${basename(usFile, '.md').replace(/^US-\d+\.\d+_/, '').replace(/_/g, ' ')} [${usStatus}]`);

    // Components for this US
    const usCMP = cmps.filter(c => c.match(new RegExp(`^CMP-${usId?.replace('.', '\\.')}\\.`)));
    for (let ci = 0; ci < usCMP.length; ci++) {
      const cmpFile = usCMP[ci];
      const cmpPath = join(REQ_DIR, 'components', cmpFile);
      const cmpId = cmpFile.match(/CMP-(\d+\.\d+\.\d+)/)?.[1];
      const cmpStatus = extractStatus(cmpPath);
      const isLastCMP = ci === usCMP.length - 1;
      const cmpPrefix = isLastCMP ? '└── ' : '├── ';
      const cmpContinue = isLastCMP ? '    ' : '│   ';

      line(`${solContinue}${usContinue}${cmpPrefix}CMP-${cmpId}: ${basename(cmpFile, '.md').replace(/^CMP-\d+\.\d+\.\d+_/, '').replace(/_/g, ' ')} [${cmpStatus}]`);

      // Functions for this CMP
      const cmpFN = fns.filter(f => f.match(new RegExp(`^FN-${cmpId?.replace(/\./g, '\\.')}\\.`)));
      for (let fi = 0; fi < cmpFN.length; fi++) {
        const fnFile = cmpFN[fi];
        const fnPath = join(REQ_DIR, 'functions', fnFile);
        const fnId = fnFile.match(/FN-(\d+\.\d+\.\d+\.\d+)/)?.[1];
        const fnStatus = extractStatus(fnPath);
        const isLastFN = fi === cmpFN.length - 1;
        const fnPrefix = isLastFN ? '└── ' : '├── ';

        line(`${solContinue}${usContinue}${cmpContinue}${fnPrefix}FN-${fnId}: ${basename(fnFile, '.md').replace(/^FN-\d+\.\d+\.\d+\.\d+_/, '').replace(/_/g, ' ')} [${fnStatus}]`);
      }
    }
  }

  if (!isLastSol) line('│');
}

// --- Cross-Cutting ---
const crossCutting = [...infs, ...ntfs, ...adrs];
if (crossCutting.length > 0) {
  line('│');
  line('├── [Cross-Cutting]');

  const allItems = [
    ...infs.map(f => ({ file: f, dir: 'infrastructure' })),
    ...ntfs.map(f => ({ file: f, dir: 'notifications' })),
    ...adrs.map(f => ({ file: f, dir: 'adrs' })),
  ];
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const itemPath = join(REQ_DIR, item.dir, item.file);
    const status = extractStatus(itemPath);
    const prefix = i === allItems.length - 1 ? '└── ' : '├── ';
    line(`│   ${prefix}${basename(item.file, '.md').replace(/_/g, ' ')} [${status}]`);
  }
}

// --- Stats ---
if (showStats) {
  line('\n════════════════════════════════════════');
  line('STATISTIKEN');
  line('════════════════════════════════════════');
  line(`Solutions:       ${sols.length}`);
  line(`User Stories:    ${uss.length}`);
  line(`Components:      ${cmps.length}`);
  line(`Functions:       ${fns.length}`);
  line(`Conversations:   ${convs.length}`);
  line(`Infrastructure:  ${infs.length}`);
  line(`Notifications:   ${ntfs.length}`);
  line(`ADRs:            ${adrs.length}`);
  line(`────────────────────────────────────────`);
  line(`GESAMT:          ${sols.length + uss.length + cmps.length + fns.length + convs.length + infs.length + ntfs.length + adrs.length}`);
}

// --- Write output ---
writeFileSync(join(REQ_DIR, 'TREE.md'), `# Requirements Tree\n\n\`\`\`\n${output}\`\`\`\n`);
console.log(`\n→ Gespeichert: requirements/TREE.md`);
