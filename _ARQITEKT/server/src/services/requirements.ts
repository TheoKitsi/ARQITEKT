import { readFile, readdir, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';
import { parseFrontmatter } from './frontmatter.js';
import type { TreeNode, ValidationResult, ProjectStats, EntityPrefix, RequirementStatus } from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Internal helper: extract typed fields from frontmatter             */
/* ------------------------------------------------------------------ */

function fmString(fm: Record<string, unknown>, key: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : '';
}

/**
 * Build the requirements tree for a project.
 */
export async function buildTree(projectId: string): Promise<TreeNode[]> {
  const projectPath = join(config.workspaceRoot, projectId);
  const reqPath = join(projectPath, 'requirements');

  const nodes: TreeNode[] = [];

  // Read Business Case
  try {
    const bcPath = join(reqPath, '00_BUSINESS_CASE.md');
    const content = await readFile(bcPath, 'utf-8');
    const { data: fm } = parseFrontmatter(content);
    const bcNode: TreeNode = {
      id: fmString(fm, 'id') || 'BC-1',
      type: 'BC',
      title: fmString(fm, 'title') || 'Business Case',
      status: (fmString(fm, 'status') || 'idea') as RequirementStatus,
      children: [],
    };

    // Read solutions
    bcNode.children = await readEntities(reqPath, 'solutions', 'SOL');

    // For each solution, read user stories
    for (const sol of bcNode.children) {
      sol.children = await readEntities(reqPath, 'user-stories', 'US', sol.id);
      for (const us of sol.children) {
        us.children = await readEntities(reqPath, 'components', 'CMP', us.id);
        for (const cmp of us.children) {
          cmp.children = await readEntities(reqPath, 'functions', 'FN', cmp.id);
        }
      }
    }

    nodes.push(bcNode);
  } catch {
    // No BC file
  }

  // Read cross-cutting entities
  const crossCutting: [string, EntityPrefix][] = [
    ['infrastructure', 'INF'],
    ['adrs', 'ADR'],
    ['notifications', 'NTF'],
    ['feedback', 'FBK'],
  ];

  for (const [dir, prefix] of crossCutting) {
    const items = await readEntities(reqPath, dir, prefix);
    nodes.push(...items);
  }

  return nodes;
}

/**
 * Read entities from a directory.
 */
async function readEntities(
  reqPath: string,
  subDir: string,
  prefix: EntityPrefix,
  parentId?: string
): Promise<TreeNode[]> {
  const dirPath = join(reqPath, subDir);
  const nodes: TreeNode[] = [];

  try {
    const files = await readdir(dirPath);
    const mdFiles = files.filter(
      (f) => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('.')
    );

    for (const file of mdFiles) {
      try {
        const content = await readFile(join(dirPath, file), 'utf-8');
        const { data: fm } = parseFrontmatter(content);

        // Filter by parent if specified
        const fmParent = fmString(fm, 'parent');
        if (parentId && fmParent && fmParent !== parentId) continue;

        nodes.push({
          id: fmString(fm, 'id') || `${prefix}-?`,
          type: prefix,
          title: fmString(fm, 'title') || file.replace('.md', ''),
          status: (fmString(fm, 'status') || 'idea') as RequirementStatus,
          children: [],
          parent: fmParent || undefined,
        });
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return nodes;
}

/**
 * Get project stats.
 */
export async function getStats(projectId: string): Promise<ProjectStats> {
  const projectPath = join(config.workspaceRoot, projectId);
  const stats: ProjectStats = { bc: 0, sol: 0, us: 0, cmp: 0, fn: 0, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 };

  try {
    await stat(join(projectPath, 'requirements', '00_BUSINESS_CASE.md'));
    stats.bc = 1;
  } catch { /* no BC */ }

  const dirs: [keyof ProjectStats, string][] = [
    ['sol', 'requirements/solutions'],
    ['us', 'requirements/user-stories'],
    ['cmp', 'requirements/components'],
    ['fn', 'requirements/functions'],
    ['inf', 'requirements/infrastructure'],
    ['adr', 'requirements/adrs'],
    ['ntf', 'requirements/notifications'],
    ['conv', 'requirements/conversations'],
    ['fbk', 'requirements/feedback'],
  ];

  for (const [key, dirRelPath] of dirs) {
    try {
      const dirPath = join(projectPath, dirRelPath);
      const files = await readdir(dirPath);
      stats[key] = files.filter((f) => f.endsWith('.md') && !f.startsWith('_')).length;
    } catch { /* dir doesn't exist */ }
  }

  return stats;
}

/**
 * Validate project requirements.
 */
export async function validateProject(projectId: string): Promise<ValidationResult[]> {
  const tree = await buildTree(projectId);
  const results: ValidationResult[] = [];

  // V-001: Every SOL must have at least one US
  const bcNode = tree.find((n) => n.type === 'BC');
  if (bcNode) {
    for (const sol of bcNode.children) {
      if (sol.children.length === 0) {
        results.push({
          rule: 'Every SOL must have at least one US',
          ruleId: 'V-001',
          scope: 'Solution',
          passed: false,
          details: `${sol.id} "${sol.title}" has no User Stories`,
          affectedArtifacts: [sol.id],
        });
      } else {
        results.push({
          rule: 'Every SOL must have at least one US',
          ruleId: 'V-001',
          scope: 'Solution',
          passed: true,
          affectedArtifacts: [sol.id],
        });
      }

      // V-002: Every US must have at least one CMP
      for (const us of sol.children) {
        results.push({
          rule: 'Every US must have at least one CMP',
          ruleId: 'V-002',
          scope: 'UserStory',
          passed: us.children.length > 0,
          details: us.children.length === 0 ? `${us.id} "${us.title}" has no Components` : undefined,
          affectedArtifacts: [us.id],
        });

        // V-003: Every CMP must have at least one FN
        for (const cmp of us.children) {
          results.push({
            rule: 'Every CMP must have at least one FN',
            ruleId: 'V-003',
            scope: 'Component',
            passed: cmp.children.length > 0,
            details: cmp.children.length === 0 ? `${cmp.id} "${cmp.title}" has no Functions` : undefined,
            affectedArtifacts: [cmp.id],
          });
        }
      }
    }
  }

  // V-006: Mandatory frontmatter fields
  function checkFrontmatter(node: TreeNode) {
    if (!node.id || !node.title || !node.status) {
      results.push({
        rule: 'Mandatory frontmatter fields must be populated',
        ruleId: 'V-006',
        scope: 'all',
        passed: false,
        details: `${node.id} is missing required frontmatter fields`,
        affectedArtifacts: [node.id],
      });
    }
    for (const child of node.children) {
      checkFrontmatter(child);
    }
  }

  for (const node of tree) {
    checkFrontmatter(node);
  }

  return results;
}

/**
 * Get readiness scores.
 */
export async function getReadiness(projectId: string): Promise<{ authored: number; approved: number }> {
  const tree = await buildTree(projectId);
  let total = 0;
  let authored = 0;
  let approved = 0;

  function walk(nodes: TreeNode[]) {
    for (const node of nodes) {
      total++;
      if (node.status !== 'idea') authored++;
      if (node.status === 'approved' || node.status === 'implemented') approved++;
      walk(node.children);
    }
  }

  walk(tree);

  return {
    authored: total > 0 ? Math.round((authored / total) * 100) : 0,
    approved: total > 0 ? Math.round((approved / total) * 100) : 0,
  };
}

/**
 * Valid status values in order (only forward transitions allowed).
 */
const STATUS_ORDER: RequirementStatus[] = ['idea', 'draft', 'review', 'approved', 'implemented'];

/**
 * Search all markdown files under a directory recursively for one whose
 * frontmatter `id` matches the given artifactId.
 * Returns the full file path and file content if found.
 */
async function findArtifactFile(
  dirPath: string,
  artifactId: string
): Promise<{ filePath: string; content: string } | null> {
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return null;
  }

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    let info;
    try {
      info = await stat(fullPath);
    } catch {
      continue;
    }

    if (info.isDirectory()) {
      const result = await findArtifactFile(fullPath, artifactId);
      if (result) return result;
    } else if (entry.endsWith('.md') && !entry.startsWith('_') && !entry.startsWith('.')) {
      try {
        const content = await readFile(fullPath, 'utf-8');
        const { data: fm } = parseFrontmatter(content);
        if (fm.id === artifactId) {
          return { filePath: fullPath, content };
        }
      } catch {
        // Skip unreadable files
      }
    }
  }

  return null;
}

/**
 * Set the status of a requirement artifact.
 * Validates the new status and ensures only forward transitions are allowed.
 */
export async function setRequirementStatus(
  projectId: string,
  artifactId: string,
  newStatus: RequirementStatus
): Promise<void> {
  // Validate newStatus is a valid status value
  if (!STATUS_ORDER.includes(newStatus)) {
    const err = new Error(`Invalid status "${newStatus}". Must be one of: ${STATUS_ORDER.join(', ')}`) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Find the artifact file by searching all subdirectories of requirements/
  const reqPath = join(config.workspaceRoot, projectId, 'requirements');
  const result = await findArtifactFile(reqPath, artifactId);

  if (!result) {
    const err = new Error(`Artifact "${artifactId}" not found in project "${projectId}"`) as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const { filePath, content } = result;

  // Parse current status from frontmatter
  const { data: fm } = parseFrontmatter(content);
  const currentStatus = (fmString(fm, 'status') || 'idea') as RequirementStatus;

  // Validate forward-only transition
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  if (newIndex <= currentIndex) {
    const err = new Error(
      `Invalid status transition: cannot move from "${currentStatus}" to "${newStatus}". Only forward transitions are allowed: ${STATUS_ORDER.join(' → ')}`
    ) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Replace the status line in the frontmatter
  const updatedContent = content.replace(
    /^(---\r?\n[\s\S]*?)(\nstatus:\s*).+?(\r?\n[\s\S]*?---)/m,
    `$1$2${newStatus}$3`
  );

  await writeFile(filePath, updatedContent, 'utf-8');
}
