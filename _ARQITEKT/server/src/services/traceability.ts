import { buildTree } from './requirements.js';
import type {
  TreeNode,
  TraceLink,
  TraceabilityMatrix,
  ImpactAnalysis,
} from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Build Traceability Matrix                                          */
/* ------------------------------------------------------------------ */

/**
 * Build a complete traceability matrix for a project.
 * Maps all parent-child relationships and detects orphans/leaves.
 */
export async function buildMatrix(projectId: string): Promise<TraceabilityMatrix> {
  const tree = await buildTree(projectId);
  const links: TraceLink[] = [];
  const allIds = new Set<string>();
  const hasChildren = new Set<string>();
  const hasParent = new Set<string>();

  function walk(node: TreeNode, parentId?: string) {
    allIds.add(node.id);

    if (parentId) {
      links.push({ from: parentId, to: node.id, relation: 'parent' });
      links.push({ from: node.id, to: parentId, relation: 'child' });
      hasParent.add(node.id);
      hasChildren.add(parentId);
    }

    for (const child of node.children) {
      walk(child, node.id);
    }
  }

  for (const root of tree) {
    walk(root);
  }

  // Orphans: nodes with no parent (excluding top-level BC)
  const orphans: string[] = [];
  for (const id of allIds) {
    if (!hasParent.has(id)) {
      // Top-level nodes (BC, cross-cutting) aren't orphans
      const node = findNode(tree, id);
      if (node && node.type !== 'BC' && node.type !== 'INF' && node.type !== 'ADR' && node.type !== 'NTF' && node.type !== 'FBK') {
        orphans.push(id);
      }
    }
  }

  // Leaves: nodes with no children that should have children
  const leaves: string[] = [];
  for (const id of allIds) {
    if (!hasChildren.has(id)) {
      const node = findNode(tree, id);
      if (node && shouldHaveChildren(node.type)) {
        leaves.push(id);
      }
    }
  }

  return {
    projectId,
    links,
    orphans,
    leaves,
  };
}

/* ------------------------------------------------------------------ */
/*  Find Orphans                                                       */
/* ------------------------------------------------------------------ */

/**
 * Find artifacts without proper parent/child linkage.
 */
export async function findOrphans(projectId: string): Promise<string[]> {
  const matrix = await buildMatrix(projectId);
  return matrix.orphans;
}

/* ------------------------------------------------------------------ */
/*  Impact Analysis                                                    */
/* ------------------------------------------------------------------ */

/**
 * Analyze the impact of changing a specific artifact.
 * Returns directly and transitively affected artifacts.
 */
export async function impactAnalysis(projectId: string, artifactId: string): Promise<ImpactAnalysis> {
  const tree = await buildTree(projectId);

  // Build adjacency map
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  function walk(node: TreeNode, parentId?: string) {
    if (parentId) {
      parentMap.set(node.id, parentId);
    }
    childrenMap.set(node.id, node.children.map((c) => c.id));
    for (const child of node.children) {
      walk(child, node.id);
    }
  }

  for (const root of tree) {
    walk(root);
  }

  // Direct impact: children + parent
  const directlyAffected: string[] = [];
  const children = childrenMap.get(artifactId) ?? [];
  directlyAffected.push(...children);
  const parent = parentMap.get(artifactId);
  if (parent) directlyAffected.push(parent);

  // Transitive impact: all descendants + all ancestors
  const transitivelyAffected = new Set<string>();

  // Descendants
  function collectDescendants(id: string) {
    const kids = childrenMap.get(id) ?? [];
    for (const kid of kids) {
      if (!transitivelyAffected.has(kid)) {
        transitivelyAffected.add(kid);
        collectDescendants(kid);
      }
    }
  }
  collectDescendants(artifactId);

  // Ancestors
  function collectAncestors(id: string) {
    const p = parentMap.get(id);
    if (p && !transitivelyAffected.has(p)) {
      transitivelyAffected.add(p);
      collectAncestors(p);
    }
  }
  collectAncestors(artifactId);

  // Remove self and direct from transitive
  transitivelyAffected.delete(artifactId);
  for (const d of directlyAffected) {
    transitivelyAffected.delete(d);
  }

  return {
    artifactId,
    directlyAffected,
    transitivelyAffected: [...transitivelyAffected],
    totalImpact: directlyAffected.length + transitivelyAffected.size,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function findNode(tree: TreeNode[], id: string): TreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/** Types that are expected to have children (leaf nodes of these are incomplete). */
function shouldHaveChildren(type: string): boolean {
  return type === 'SOL' || type === 'US' || type === 'CMP';
}
