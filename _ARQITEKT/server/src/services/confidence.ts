import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { resolveProjectById } from './projects.js';
import { buildTree } from './requirements.js';
import { parseFrontmatter } from './frontmatter.js';
import type { TreeNode, ConfidenceScore } from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Weights for each confidence dimension (must sum to 100) */
const WEIGHTS = {
  structural: 30,
  semantic: 30,
  consistency: 20,
  boundary: 20,
} as const;

const STATUS_ORDER = ['idea', 'draft', 'review', 'approved', 'implemented'];

/* ------------------------------------------------------------------ */
/*  Structural Completeness (30%)                                      */
/* ------------------------------------------------------------------ */

/**
 * Evaluate structural completeness of a tree node.
 * Checks: required frontmatter fields, parent/child presence,
 * whether the node has a body beyond just frontmatter.
 */
function evaluateStructural(node: TreeNode, body: string): number {
  let score = 0;
  let maxPoints = 0;

  // Has ID?
  maxPoints += 20;
  if (node.id && !node.id.endsWith('-?')) score += 20;

  // Has title?
  maxPoints += 20;
  if (node.title && node.title.length > 3) score += 20;

  // Has meaningful status (beyond 'idea')?
  maxPoints += 15;
  if (STATUS_ORDER.indexOf(node.status) >= 1) score += 15;

  // Has children (for non-leaf types)?
  const leafTypes = ['FN', 'CONV', 'INF', 'ADR', 'NTF', 'FBK'];
  if (!leafTypes.includes(node.type)) {
    maxPoints += 25;
    if (node.children.length > 0) score += 25;
  } else {
    maxPoints += 25;
    score += 25; // Leaf nodes get full marks for children
  }

  // Has body content?
  maxPoints += 20;
  const trimmedBody = body.trim();
  if (trimmedBody.length > 50) score += 20;
  else if (trimmedBody.length > 10) score += 10;

  return maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;
}

/* ------------------------------------------------------------------ */
/*  Semantic Clarity (30%)                                             */
/* ------------------------------------------------------------------ */

/** Vague words that reduce semantic clarity */
const VAGUE_WORDS = [
  'schnell', 'fast', 'viele', 'many', 'einfach', 'simple', 'easy',
  'gut', 'good', 'nice', 'optimal', 'flexible', 'robust',
  'various', 'several', 'appropriate', 'suitable', 'efficiently',
  'ca.', 'approximately', 'roughly', 'etc', 'usw',
];

/**
 * Evaluate semantic clarity (rule-based heuristic).
 * Checks for vague language, sufficient length, headings structure.
 * Full LLM-based analysis will be added in Phase 2.
 */
function evaluateSemantic(body: string, title: string): number {
  let score = 100;
  const lowerBody = (body + ' ' + title).toLowerCase();

  // Penalize vague words (max -40)
  let vaguePenalty = 0;
  for (const word of VAGUE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerBody.match(regex);
    if (matches) {
      vaguePenalty += matches.length * 5;
    }
  }
  score -= Math.min(vaguePenalty, 40);

  // Reward structured content (headings)
  const headingCount = (body.match(/^#{1,4}\s/gm) || []).length;
  if (headingCount >= 3) score = Math.min(score + 10, 100);
  else if (headingCount === 0 && body.length > 100) score -= 10;

  // Penalize very short body (< 100 chars)
  if (body.trim().length < 100) score -= 20;
  if (body.trim().length < 30) score -= 20;

  return Math.max(0, Math.min(100, score));
}

/* ------------------------------------------------------------------ */
/*  Consistency (20%)                                                  */
/* ------------------------------------------------------------------ */

/**
 * Evaluate consistency of a node with its siblings and parent.
 * Checks status consistency (V-005) and unique titles.
 */
function evaluateConsistency(
  node: TreeNode,
  siblings: TreeNode[],
  parentStatus?: string,
): number {
  let score = 100;

  // V-005: Child status should not exceed parent
  if (parentStatus) {
    const parentIdx = STATUS_ORDER.indexOf(parentStatus);
    const childIdx = STATUS_ORDER.indexOf(node.status);
    if (childIdx > parentIdx) {
      score -= 30;
    }
  }

  // Unique title among siblings
  const titleDuplicates = siblings.filter(
    (s) => s.id !== node.id && s.title.toLowerCase() === node.title.toLowerCase(),
  );
  if (titleDuplicates.length > 0) {
    score -= 25;
  }

  // Check if all children have same or lower status
  for (const child of node.children) {
    const nodeIdx = STATUS_ORDER.indexOf(node.status);
    const childIdx = STATUS_ORDER.indexOf(child.status);
    if (childIdx > nodeIdx) {
      score -= 15;
      break; // One violation is enough to penalize
    }
  }

  return Math.max(0, Math.min(100, score));
}

/* ------------------------------------------------------------------ */
/*  Boundary Coverage (20%)                                            */
/* ------------------------------------------------------------------ */

/** Keywords that indicate boundary/edge case coverage */
const BOUNDARY_KEYWORDS = [
  'edge case', 'grenzfall', 'error', 'fehler', 'exception',
  'boundary', 'limit', 'maximum', 'minimum', 'timeout',
  'fallback', 'default', 'empty', 'null', 'invalid',
  'overflow', 'underflow', 'concurrent', 'race condition',
  'security', 'sicherheit', 'permission', 'berechtigung',
  'offline', 'retry', 'wiederholung',
];

/**
 * Evaluate boundary/edge case coverage.
 * Checks for mentions of error cases, limits, edge conditions.
 */
function evaluateBoundary(body: string, nodeType: string): number {
  // Cross-cutting and top-level types are less about boundary cases
  const lowBoundaryTypes = ['BC', 'INF', 'ADR', 'NTF', 'FBK'];
  if (lowBoundaryTypes.includes(nodeType)) {
    return 90; // High neutral score — boundary cases less relevant for these types
  }

  const lowerBody = body.toLowerCase();
  let keywordHits = 0;

  for (const kw of BOUNDARY_KEYWORDS) {
    if (lowerBody.includes(kw)) keywordHits++;
  }

  if (keywordHits >= 5) return 100;
  if (keywordHits >= 3) return 80;
  if (keywordHits >= 1) return 50;
  return 20;
}

/* ------------------------------------------------------------------ */
/*  Helper: Read artifact body from file                               */
/* ------------------------------------------------------------------ */

async function findArtifactBody(
  reqPath: string,
  artifactId: string,
): Promise<{ body: string; filePath: string } | null> {
  // Search recursively (reuse logic similar to requirements.ts)
  const { readdir, stat } = await import('fs/promises');

  async function search(dir: string): Promise<{ body: string; filePath: string } | null> {
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return null;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      let info;
      try {
        info = await stat(fullPath);
      } catch {
        continue;
      }

      if (info.isDirectory()) {
        const result = await search(fullPath);
        if (result) return result;
      } else if (entry.endsWith('.md') && !entry.startsWith('_') && !entry.startsWith('.')) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const { data: fm, body } = parseFrontmatter(content);
          if (fm.id === artifactId) {
            return { body, filePath: fullPath };
          }
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  return search(reqPath);
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Evaluate confidence score for a single artifact.
 */
export async function evaluateConfidence(
  projectId: string,
  artifactId: string,
): Promise<ConfidenceScore> {
  const tree = await buildTree(projectId);
  const reqPath = join(await resolveProjectById(projectId), 'requirements');

  // Find the node in the tree
  let foundNode: TreeNode | null = null;
  let foundParent: TreeNode | null = null;
  let foundSiblings: TreeNode[] = [];

  function findNode(nodes: TreeNode[], parent: TreeNode | null): boolean {
    for (const node of nodes) {
      if (node.id === artifactId) {
        foundNode = node;
        foundParent = parent;
        foundSiblings = nodes;
        return true;
      }
      if (findNode(node.children, node)) return true;
    }
    return false;
  }

  findNode(tree, null);

  if (!foundNode) {
    throw Object.assign(new Error(`Artifact "${artifactId}" not found`), { status: 404 });
  }

  const targetNode: TreeNode = foundNode;
  const parentStatus: string | undefined = (foundParent as TreeNode | null)?.status;
  const siblings: TreeNode[] = foundSiblings;

  // Get body content
  const artifactData = await findArtifactBody(reqPath, artifactId);
  const body = artifactData?.body ?? '';

  // Evaluate each dimension
  const structural = evaluateStructural(targetNode, body);
  const semantic = evaluateSemantic(body, targetNode.title);
  const consistency = evaluateConsistency(targetNode, siblings, parentStatus);
  const boundary = evaluateBoundary(body, targetNode.type);

  // Weighted overall score
  const overall = Math.round(
    (structural * WEIGHTS.structural +
      semantic * WEIGHTS.semantic +
      consistency * WEIGHTS.consistency +
      boundary * WEIGHTS.boundary) / 100,
  );

  const result: ConfidenceScore = {
    artifactId,
    overall,
    structural,
    semantic,
    consistency,
    boundary,
    lastEvaluated: new Date().toISOString(),
  };

  // Write confidence back to frontmatter
  if (artifactData?.filePath) {
    await writeConfidenceToFrontmatter(artifactData.filePath, result);
  }

  return result;
}

/**
 * Evaluate confidence scores for ALL artifacts in a project.
 */
export async function evaluateAllConfidence(projectId: string): Promise<ConfidenceScore[]> {
  const tree = await buildTree(projectId);
  const scores: ConfidenceScore[] = [];

  async function walk(nodes: TreeNode[]) {
    for (const node of nodes) {
      try {
        const score = await evaluateConfidence(projectId, node.id);
        scores.push(score);
      } catch {
        // Skip artifacts that can't be evaluated
      }
      await walk(node.children);
    }
  }

  await walk(tree);
  return scores;
}

/**
 * Get the average confidence for a specific entity type across the project.
 */
export function averageConfidence(scores: ConfidenceScore[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + s.overall, 0);
  return Math.round(total / scores.length);
}

/* ------------------------------------------------------------------ */
/*  Frontmatter writer                                                 */
/* ------------------------------------------------------------------ */

async function writeConfidenceToFrontmatter(
  filePath: string,
  score: ConfidenceScore,
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const { data: fm, body } = parseFrontmatter(content);

  // Update frontmatter fields
  fm.confidence = score.overall;
  fm.confidence_details = {
    structural: score.structural,
    semantic: score.semantic,
    consistency: score.consistency,
    boundary: score.boundary,
  };
  fm.last_evaluated = score.lastEvaluated;

  // Rebuild the file
  const fmLines: string[] = [];
  for (const [key, value] of Object.entries(fm)) {
    if (key === 'confidence_details' && typeof value === 'object' && value !== null) {
      fmLines.push('confidence_details:');
      for (const [dk, dv] of Object.entries(value as Record<string, unknown>)) {
        fmLines.push(`  ${dk}: ${dv}`);
      }
    } else if (Array.isArray(value)) {
      fmLines.push(`${key}: [${value.join(', ')}]`);
    } else {
      fmLines.push(`${key}: ${typeof value === 'string' && value.includes(' ') ? `"${value}"` : value}`);
    }
  }

  const newContent = `---\n${fmLines.join('\n')}\n---\n${body}`;
  await writeFile(filePath, newContent, 'utf-8');
}
