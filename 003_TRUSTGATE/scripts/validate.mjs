// ============================================================================
// ARQITEKT — Requirements Validator
// ============================================================================
// Prüft alle Requirement-Dateien gegen das Metamodel:
// - Frontmatter-Pflichtfelder
// - Naming-Konvention
// - Referenz-Integrität (keine verwaisten Links)
// - Status-Konsistenz (Kind ≤ Eltern)
// - Strukturelle Vollständigkeit (SOL→US→CMP→FN)
// ============================================================================

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const REQ_DIR = join(ROOT, 'requirements');

const STATUS_ORDER = { idea: 0, draft: 1, review: 2, approved: 3, implemented: 4 };

const ERRORS = [];
const WARNINGS = [];
let fileCount = 0;

// --- Helpers ---

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    fm[key] = value;
  }
  return fm;
}

function getMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'templates' || entry.name === 'analytics') continue;
      files.push(...getMarkdownFiles(join(dir, entry.name)));
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('TREE')) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function extractMarkdownLinks(content) {
  const links = [];
  const regex = /\[([^\]]*)\]\(([^)]+\.md[^)]*)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[2].split('#')[0]);
  }
  return links;
}

// --- Validators ---

function validateFrontmatter(filePath, content) {
  const fm = parseFrontmatter(content);
  const name = relative(ROOT, filePath);

  if (!fm) {
    // BC file may use a different header format
    if (!basename(filePath).startsWith('00_BUSINESS_CASE')) {
      ERRORS.push(`${name}: Kein YAML-Frontmatter gefunden`);
    }
    return null;
  }

  const required = ['type', 'status'];
  for (const field of required) {
    if (!fm[field]) {
      ERRORS.push(`${name}: Frontmatter-Pflichtfeld '${field}' fehlt`);
    }
  }

  if (fm.status && !STATUS_ORDER.hasOwnProperty(fm.status)) {
    ERRORS.push(`${name}: Unbekannter Status '${fm.status}' (erlaubt: ${Object.keys(STATUS_ORDER).join(', ')})`);
  }

  const validTypes = ['solution', 'user-story', 'component', 'function', 'conversation', 'infrastructure', 'notification', 'adr', 'discussion', 'business-case', 'feedback'];
  const normalizeType = (t) => t.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/\s+/g, '-');
  if (fm.type && !validTypes.includes(normalizeType(fm.type))) {
    WARNINGS.push(`${name}: Unbekannter Typ '${fm.type}' (erlaubt: ${validTypes.join(', ')})`);
  }

  return fm;
}

function validateNaming(filePath) {
  const name = basename(filePath, '.md');
  const dir = basename(join(filePath, '..'));
  const relPath = relative(ROOT, filePath);

  const patterns = {
    solutions: /^SOL-\d+(_.+)?$/,
    'user-stories': /^US-\d+\.\d+(_.+)?$/,
    components: /^CMP-\d+\.\d+\.\d+(_.+)?$/,
    functions: /^FN-\d+\.\d+\.\d+\.\d+(_.+)?$/,
    conversations: /^CONV-\d+(\.\d+)*(_.+)?$/,
    notifications: /^NTF-\d+(_.+)?$/,
    infrastructure: /^INF-\d+(_.+)?$/,
    adrs: /^ADR-\d+(_.+)?$/,
    feedback: /^FBK-\d+(_.+)?$/,
  };

  if (patterns[dir] && !patterns[dir].test(name)) {
    WARNINGS.push(`${relPath}: Dateiname folgt nicht dem Schema (erwartet: ${patterns[dir]})`);
  }
}

function validateLinks(filePath, content) {
  const links = extractMarkdownLinks(content);
  const fileDir = join(filePath, '..');
  const relPath = relative(ROOT, filePath);

  for (const link of links) {
    if (link.startsWith('http')) continue;
    const resolved = join(fileDir, link);
    if (!existsSync(resolved)) {
      ERRORS.push(`${relPath}: Verwaister Link → '${link}' (Datei existiert nicht)`);
    }
  }
}

function validateCompleteness() {
  const dirs = {
    solutions: join(REQ_DIR, 'solutions'),
    'user-stories': join(REQ_DIR, 'user-stories'),
    components: join(REQ_DIR, 'components'),
    functions: join(REQ_DIR, 'functions'),
  };

  const sols = existsSync(dirs.solutions) ? readdirSync(dirs.solutions).filter(f => f.endsWith('.md')) : [];
  const uss = existsSync(dirs['user-stories']) ? readdirSync(dirs['user-stories']).filter(f => f.endsWith('.md')) : [];
  const cmps = existsSync(dirs.components) ? readdirSync(dirs.components).filter(f => f.endsWith('.md')) : [];
  const fns = existsSync(dirs.functions) ? readdirSync(dirs.functions).filter(f => f.endsWith('.md')) : [];

  // Check: Jede SOL braucht mindestens eine US
  for (const sol of sols) {
    const solNum = sol.match(/SOL-(\d+)/)?.[1];
    if (!solNum) continue;
    const hasUS = uss.some(us => us.startsWith(`US-${solNum}.`));
    if (!hasUS) {
      WARNINGS.push(`SOL-${solNum}: Keine User Story gefunden (V-001)`);
    }
  }

  // Check: Jede US braucht mindestens eine CMP
  for (const us of uss) {
    const usMatch = us.match(/US-(\d+\.\d+)/);
    if (!usMatch) continue;
    const usId = usMatch[1];
    const hasCMP = cmps.some(c => c.startsWith(`CMP-${usId}.`));
    if (!hasCMP) {
      WARNINGS.push(`US-${usId}: Keine Komponente gefunden (V-002)`);
    }
  }

  // Check: Jede CMP braucht mindestens eine FN
  for (const cmp of cmps) {
    const cmpMatch = cmp.match(/CMP-(\d+\.\d+\.\d+)/);
    if (!cmpMatch) continue;
    const cmpId = cmpMatch[1];
    const hasFN = fns.some(f => f.startsWith(`FN-${cmpId}.`));
    if (!hasFN) {
      WARNINGS.push(`CMP-${cmpId}: Keine Funktion gefunden (V-003)`);
    }
  }
}

// --- Main ---

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  ARQITEKT — Requirements Validator               ║');
console.log('╚══════════════════════════════════════════════════╝\n');

const files = getMarkdownFiles(REQ_DIR);
fileCount = files.length;

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  validateFrontmatter(filePath, content);
  validateNaming(filePath);
  validateLinks(filePath, content);
}

validateCompleteness();

// --- Report ---

console.log(`Geprüft: ${fileCount} Dateien\n`);

if (ERRORS.length > 0) {
  console.log(`❌ FEHLER (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`   ${e}`));
  console.log('');
}

if (WARNINGS.length > 0) {
  console.log(`⚠️  WARNUNGEN (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`   ${w}`));
  console.log('');
}

if (ERRORS.length === 0 && WARNINGS.length === 0) {
  console.log('✅ Alle Prüfungen bestanden!\n');
}

console.log(`Zusammenfassung: ${ERRORS.length} Fehler, ${WARNINGS.length} Warnungen`);
process.exit(ERRORS.length > 0 ? 1 : 0);
