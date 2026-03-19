import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { resolveProjectById } from './projects.js';
import { buildTree } from './tree.js';
import type { TreeNode, ProjectStats } from '../types/project.js';

/**
 * Get project stats.
 */
export async function getStats(projectId: string): Promise<ProjectStats> {
  const projectPath = await resolveProjectById(projectId);
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
