import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { resolveProjectById } from './projects.js';
import { createLogger } from './logger.js';

const log = createLogger('importService');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CsvRow {
  type: string;
  id: string;
  title: string;
  status?: string;
  parent?: string;
  description?: string;
}

export interface ImportResult {
  success: boolean;
  filesCreated: string[];
  errors: string[];
  totalRows: number;
}

// ---------------------------------------------------------------------------
// CSV parsing (simple — handles quoted fields)
// ---------------------------------------------------------------------------

function parseCsv(raw: string): CsvRow[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]!).map((h) => h.trim().toLowerCase());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      if (key) obj[key] = (values[j] ?? '').trim();
    }
    if (obj.type && obj.id && obj.title) {
      rows.push({
        type: obj.type,
        id: obj.id,
        title: obj.title,
        status: obj.status || 'draft',
        parent: obj.parent || undefined,
        description: obj.description || undefined,
      });
    }
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------------------------------
// Type → directory mapping
// ---------------------------------------------------------------------------

const TYPE_DIR_MAP: Record<string, string> = {
  solution: 'solutions',
  sol: 'solutions',
  userstory: 'user-stories',
  'user-story': 'user-stories',
  us: 'user-stories',
  component: 'components',
  cmp: 'components',
  function: 'functions',
  fn: 'functions',
  conversation: 'conversations',
  conv: 'conversations',
  adr: 'adrs',
  infrastructure: 'infrastructure',
  inf: 'infrastructure',
  notification: 'notifications',
  ntf: 'notifications',
  feedback: 'feedback',
  fbk: 'feedback',
};

const TYPE_NAME_MAP: Record<string, string> = {
  solution: 'Solution',
  sol: 'Solution',
  userstory: 'UserStory',
  'user-story': 'UserStory',
  us: 'UserStory',
  component: 'Component',
  cmp: 'Component',
  function: 'Function',
  fn: 'Function',
  conversation: 'Conversation',
  conv: 'Conversation',
  adr: 'ADR',
  infrastructure: 'Infrastructure',
  inf: 'Infrastructure',
  notification: 'Notification',
  ntf: 'Notification',
  feedback: 'Feedback',
  fbk: 'Feedback',
};

// ---------------------------------------------------------------------------
//  Generate markdown with frontmatter
// ---------------------------------------------------------------------------

function generateMarkdown(row: CsvRow): string {
  const typeName = TYPE_NAME_MAP[row.type.toLowerCase()] ?? row.type;
  const date = new Date().toISOString().split('T')[0];
  const parentLine = row.parent ? `parent: "${row.parent}"` : '';

  const lines = [
    '---',
    `type: ${typeName}`,
    `id: "${row.id}"`,
    `title: "${row.title.replace(/"/g, '\\"')}"`,
    `status: ${row.status ?? 'draft'}`,
    `version: "1.0"`,
    `date: "${date}"`,
  ];
  if (parentLine) lines.push(parentLine);
  lines.push('---', '', `# ${row.id}: ${row.title}`);
  if (row.description) {
    lines.push('', row.description);
  }
  return lines.join('\n') + '\n';
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Import requirements from CSV text into a project's requirements directory.
 * Expected CSV columns: type, id, title, status (optional), parent (optional), description (optional)
 */
export async function importRequirementsCsv(projectId: string, csvText: string): Promise<ImportResult> {
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    return { success: false, filesCreated: [], errors: ['No valid rows found. Expected columns: type, id, title'], totalRows: 0 };
  }

  const projectPath = await resolveProjectById(projectId);
  const reqDir = join(projectPath, 'requirements');

  const filesCreated: string[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const dir = TYPE_DIR_MAP[row.type.toLowerCase()];
    if (!dir) {
      errors.push(`Row ${row.id}: Unknown type "${row.type}"`);
      continue;
    }

    const targetDir = join(reqDir, dir);
    await mkdir(targetDir, { recursive: true });

    const filename = `${sanitizeFilename(row.id)}_${sanitizeFilename(row.title)}.md`;
    const filePath = join(targetDir, filename);

    try {
      const content = generateMarkdown(row);
      await writeFile(filePath, content, 'utf-8');
      filesCreated.push(`${dir}/${filename}`);
    } catch (err) {
      errors.push(`Row ${row.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  log.info({ projectId, imported: filesCreated.length, errors: errors.length }, 'CSV import complete');

  return {
    success: errors.length === 0,
    filesCreated,
    errors,
    totalRows: rows.length,
  };
}
