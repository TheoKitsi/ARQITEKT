import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { parseFrontmatter } from './frontmatter.js';
import { resolveProjectById } from './projects.js';
import { fmString } from './requirementHelpers.js';
import type { TreeNode, EntityPrefix, RequirementStatus } from '../types/project.js';

/**
 * Build the requirements tree for a project.
 */
export async function buildTree(projectId: string): Promise<TreeNode[]> {
  const projectPath = await resolveProjectById(projectId);
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
