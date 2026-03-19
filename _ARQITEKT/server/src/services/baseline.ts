import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { resolveProjectById } from './projects.js';
import { buildTree } from './requirements.js';
import type {
  TreeNode,
  Baseline,
  BaselineArtifact,
  DriftReport,
  DriftItem,
  RequirementStatus,
} from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASELINE_DIR = '.arqitekt';
const BASELINE_FILE = 'baseline.json';

const STATUS_ORDER: RequirementStatus[] = ['idea', 'draft', 'review', 'approved', 'implemented'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex').slice(0, 16);
}

function flattenTree(nodes: TreeNode[]): BaselineArtifact[] {
  const artifacts: BaselineArtifact[] = [];

  function walk(node: TreeNode) {
    artifacts.push({
      id: node.id,
      type: node.type,
      title: node.title,
      status: node.status,
      parent: node.parent,
      contentHash: hashContent(`${node.id}|${node.title}|${node.status}|${node.parent ?? ''}`),
      children: node.children.map((c) => c.id),
    });
    for (const child of node.children) {
      walk(child);
    }
  }

  for (const root of nodes) {
    walk(root);
  }
  return artifacts;
}

function computeTreeHash(artifacts: BaselineArtifact[]): string {
  const sorted = [...artifacts].sort((a, b) => a.id.localeCompare(b.id));
  const combined = sorted.map((a) => `${a.id}:${a.contentHash}`).join('|');
  return hashContent(combined);
}

async function baselinePath(projectId: string): Promise<string> {
  return join(await resolveProjectById(projectId), BASELINE_DIR, BASELINE_FILE);
}

/* ------------------------------------------------------------------ */
/*  Set Baseline                                                       */
/* ------------------------------------------------------------------ */

/**
 * Create a baseline snapshot of the current project state.
 * Saved as `.arqitekt/baseline.json` inside the project.
 */
export async function setBaseline(projectId: string): Promise<Baseline> {
  const tree = await buildTree(projectId);
  const artifacts = flattenTree(tree);
  const treeHash = computeTreeHash(artifacts);

  const baseline: Baseline = {
    projectId,
    createdAt: new Date().toISOString(),
    artifacts,
    treeHash,
  };

  const dirPath = join(await resolveProjectById(projectId), BASELINE_DIR);
  await mkdir(dirPath, { recursive: true });
  await writeFile(await baselinePath(projectId), JSON.stringify(baseline, null, 2), 'utf-8');

  return baseline;
}

/* ------------------------------------------------------------------ */
/*  Get Baseline                                                       */
/* ------------------------------------------------------------------ */

/**
 * Read the existing baseline for a project. Returns null if none exists.
 */
export async function getBaseline(projectId: string): Promise<Baseline | null> {
  try {
    const content = await readFile(await baselinePath(projectId), 'utf-8');
    return JSON.parse(content) as Baseline;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Check Drift                                                        */
/* ------------------------------------------------------------------ */

/**
 * Compare the current project state against its baseline.
 * Returns a drift report listing all detected changes.
 */
export async function checkDrift(projectId: string): Promise<DriftReport> {
  const baseline = await getBaseline(projectId);
  if (!baseline) {
    const err = new Error(`No baseline found for project "${projectId}". Set a baseline first.`) as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const tree = await buildTree(projectId);
  const currentArtifacts = flattenTree(tree);

  const baselineMap = new Map(baseline.artifacts.map((a) => [a.id, a]));
  const currentMap = new Map(currentArtifacts.map((a) => [a.id, a]));

  const drifts: DriftItem[] = [];

  // Detect removed artifacts
  for (const [id, baseArtifact] of baselineMap) {
    if (!currentMap.has(id)) {
      drifts.push({
        artifactId: id,
        kind: 'removed',
        details: `${baseArtifact.type} "${baseArtifact.title}" was removed`,
        severity: baseArtifact.type === 'BC' ? 'critical' : 'high',
      });
    }
  }

  // Detect added artifacts and changes
  for (const [id, current] of currentMap) {
    const base = baselineMap.get(id);

    if (!base) {
      drifts.push({
        artifactId: id,
        kind: 'added',
        details: `New ${current.type} "${current.title}" added without baseline`,
        severity: 'medium',
      });
      continue;
    }

    // Title changed
    if (current.title !== base.title) {
      drifts.push({
        artifactId: id,
        kind: 'title_changed',
        details: `Title changed: "${base.title}" -> "${current.title}"`,
        severity: 'medium',
      });
    }

    // Status regressed
    const baseIdx = STATUS_ORDER.indexOf(base.status);
    const currentIdx = STATUS_ORDER.indexOf(current.status);
    if (currentIdx < baseIdx) {
      drifts.push({
        artifactId: id,
        kind: 'status_regressed',
        details: `Status regressed: ${base.status} -> ${current.status}`,
        severity: 'high',
      });
    }

    // Parent changed
    if ((current.parent ?? '') !== (base.parent ?? '')) {
      drifts.push({
        artifactId: id,
        kind: 'parent_changed',
        details: `Parent changed: ${base.parent ?? '(none)'} -> ${current.parent ?? '(none)'}`,
        severity: 'high',
      });
    }

    // Content changed (hash comparison)
    if (current.contentHash !== base.contentHash) {
      // Only add content_changed if we didn't already detect title/status/parent changes
      const alreadyDetected = drifts.some(
        (d) => d.artifactId === id && d.kind !== 'content_changed',
      );
      if (!alreadyDetected) {
        drifts.push({
          artifactId: id,
          kind: 'content_changed',
          details: `Content of ${current.type} "${current.title}" has changed`,
          severity: 'low',
        });
      }
    }
  }

  const changedIds = new Set(drifts.map((d) => d.artifactId));

  return {
    projectId,
    baselineDate: baseline.createdAt,
    checkedAt: new Date().toISOString(),
    drifts,
    totalArtifacts: currentArtifacts.length,
    changedArtifacts: changedIds.size,
  };
}
