import { appendFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { resolveProjectById } from './projects.js';
import { createLogger } from './logger.js';

const log = createLogger('audit');

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AuditAction =
  | 'requirement.status_changed'
  | 'requirement.created'
  | 'requirement.edited'
  | 'requirement.deleted'
  | 'gate.evaluated'
  | 'gate.overridden'
  | 'probing.answered'
  | 'probing.skipped'
  | 'baseline.created'
  | 'feedback.created'
  | 'feedback.updated'
  | 'project.scaffolded'
  | 'project.codegen'
  | 'file.written'
  | 'file.deleted'
  | 'file.renamed'
  | 'project.pushed'
  | 'project.deployed';

export interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  actor: string;
  projectId: string;
  target?: string;
  detail?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Write an audit entry                                               */
/* ------------------------------------------------------------------ */

export async function recordAudit(
  projectId: string,
  action: AuditAction,
  actor: string,
  target?: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    actor,
    projectId,
    ...(target && { target }),
    ...(detail && { detail }),
  };

  try {
    const projectPath = await resolveProjectById(projectId);
    const auditDir = join(projectPath, '.arqitekt');
    await mkdir(auditDir, { recursive: true });
    const auditPath = join(auditDir, 'audit.jsonl');
    await appendFile(auditPath, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    log.warn({ err, projectId, action }, 'Failed to write audit entry');
  }
}

/* ------------------------------------------------------------------ */
/*  Read audit log                                                     */
/* ------------------------------------------------------------------ */

export async function getAuditLog(
  projectId: string,
  limit = 100,
  offset = 0,
): Promise<{ entries: AuditEntry[]; total: number }> {
  const projectPath = await resolveProjectById(projectId);
  const auditPath = join(projectPath, '.arqitekt', 'audit.jsonl');

  let content: string;
  try {
    content = await readFile(auditPath, 'utf-8');
  } catch {
    return { entries: [], total: 0 };
  }

  const lines = content.trim().split('\n').filter(Boolean);
  const total = lines.length;

  // Return newest first, paginated
  const reversed = lines.reverse();
  const page = reversed.slice(offset, offset + limit);

  const entries: AuditEntry[] = [];
  for (const line of page) {
    try {
      entries.push(JSON.parse(line) as AuditEntry);
    } catch {
      // Skip malformed lines
    }
  }

  return { entries, total };
}
