import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';
import { buildTree, validateProject } from './requirements.js';
import { evaluateAllConfidence, averageConfidence } from './confidence.js';
import { parseYaml } from './yaml.js';
import type {
  GateId, GateStatus, GateResult, GateCheck, Gap,
  GateDefinition, PipelineStatus, ConfidenceScore,
  TreeNode, AgentType, RiskLevel,
} from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Gate Definitions (loaded from metamodel.yaml)                      */
/* ------------------------------------------------------------------ */

let gateDefinitions: GateDefinition[] | null = null;

export async function loadGateDefinitions(): Promise<GateDefinition[]> {
  if (gateDefinitions) return gateDefinitions;

  const metamodelPath = join(config.hubRoot, 'template', 'config', 'metamodel.yaml');
  const content = await readFile(metamodelPath, 'utf-8');
  const yaml = parseYaml(content) as Record<string, unknown>;

  const gates = (yaml as { gates?: Array<Record<string, unknown>> }).gates;
  if (!gates || !Array.isArray(gates)) {
    throw new Error('No gates defined in metamodel.yaml');
  }

  gateDefinitions = gates.map((g) => ({
    id: g.id as GateId,
    name: g.name as string,
    from: g.from as GateDefinition['from'],
    to: g.to as GateDefinition['to'],
    mandatoryChecks: (g.mandatoryChecks as string[]) ?? [],
    agents: (g.agents as AgentType[]) ?? [],
    autoPassThreshold: Number(g.autoPassThreshold) || 90,
    riskLevel: (g.riskLevel as RiskLevel) ?? 'medium',
  }));

  return gateDefinitions;
}

/** Invalidate cached definitions (for testing or hot-reload) */
export function invalidateGateCache(): void {
  gateDefinitions = null;
}

/* ------------------------------------------------------------------ */
/*  Gate Check Implementations                                         */
/* ------------------------------------------------------------------ */

const STATUS_ORDER = ['idea', 'draft', 'review', 'approved', 'implemented'];

/** Run structural checks for G0: Idea → BC */
function checkG0(tree: TreeNode[]): GateCheck[] {
  const checks: GateCheck[] = [];
  const bc = tree.find((n) => n.type === 'BC');

  checks.push({
    id: 'G0-C1',
    rule: 'BC must exist',
    passed: !!bc,
    details: bc ? undefined : 'No Business Case found',
    severity: 'critical',
  });

  if (bc) {
    const hasTitle = bc.title.length > 5;
    checks.push({
      id: 'G0-C2',
      rule: 'BC must have a meaningful title',
      passed: hasTitle,
      details: hasTitle ? undefined : `Title too short: "${bc.title}"`,
      severity: 'high',
    });

    const hasStatus = STATUS_ORDER.indexOf(bc.status) >= 1;
    checks.push({
      id: 'G0-C3',
      rule: 'BC must be at least in draft status',
      passed: hasStatus,
      details: hasStatus ? undefined : `BC is still in "${bc.status}" status`,
      severity: 'high',
    });
  }

  return checks;
}

/** Run structural checks for G1: BC → SOL */
function checkG1(tree: TreeNode[]): GateCheck[] {
  const checks: GateCheck[] = [];
  const bcNode = tree.find((n) => n.type === 'BC');

  const hasSolutions = bcNode ? bcNode.children.length > 0 : false;
  checks.push({
    id: 'G1-C1',
    rule: 'At least one SOL must exist',
    passed: hasSolutions,
    details: hasSolutions ? undefined : 'No solutions defined',
    severity: 'critical',
  });

  if (bcNode) {
    // Check for duplicate SOL titles
    const titles = bcNode.children.map((s) => s.title.toLowerCase());
    const hasDuplicates = titles.length !== new Set(titles).size;
    checks.push({
      id: 'G1-C2',
      rule: 'No duplicate SOL titles',
      passed: !hasDuplicates,
      details: hasDuplicates ? 'Duplicate solution titles found' : undefined,
      severity: 'medium',
    });

    // Check for INF requirements
    const hasInf = tree.some((n) => n.type === 'INF');
    checks.push({
      id: 'G1-C3',
      rule: 'At least one INF requirement exists',
      passed: hasInf,
      details: hasInf ? undefined : 'No infrastructure requirements defined',
      severity: 'high',
    });
  }

  return checks;
}

/** Run structural checks for G2: SOL → US */
function checkG2(_tree: TreeNode[], validationResults: Array<{ ruleId: string; passed: boolean; details?: string }>): GateCheck[] {
  const checks: GateCheck[] = [];

  // V-001: Every SOL must have at least one US
  const v001Failures = validationResults.filter((v) => v.ruleId === 'V-001' && !v.passed);
  checks.push({
    id: 'G2-C1',
    rule: 'Every SOL has at least one US (V-001)',
    passed: v001Failures.length === 0,
    details: v001Failures.length > 0 ? `${v001Failures.length} SOL(s) without User Stories` : undefined,
    severity: 'critical',
  });

  // V-004: Every US must have acceptance criteria
  const v004Failures = validationResults.filter((v) => v.ruleId === 'V-004' && !v.passed);
  checks.push({
    id: 'G2-C2',
    rule: 'Every US has acceptance criteria (V-004)',
    passed: v004Failures.length === 0,
    details: v004Failures.length > 0 ? `${v004Failures.length} US without acceptance criteria` : undefined,
    severity: 'high',
  });

  // V-007: No orphaned references
  const v007Failures = validationResults.filter((v) => v.ruleId === 'V-007' && !v.passed);
  checks.push({
    id: 'G2-C3',
    rule: 'No orphaned parent references (V-007)',
    passed: v007Failures.length === 0,
    details: v007Failures.length > 0 ? `${v007Failures.length} orphaned reference(s)` : undefined,
    severity: 'medium',
  });

  return checks;
}

/** Run structural checks for G3: US → CMP */
function checkG3(tree: TreeNode[], validationResults: Array<{ ruleId: string; passed: boolean; details?: string }>): GateCheck[] {
  const checks: GateCheck[] = [];

  // V-002: Every US must have at least one CMP
  const v002Failures = validationResults.filter((v) => v.ruleId === 'V-002' && !v.passed);
  checks.push({
    id: 'G3-C1',
    rule: 'Every US has at least one CMP (V-002)',
    passed: v002Failures.length === 0,
    details: v002Failures.length > 0 ? `${v002Failures.length} US without Components` : undefined,
    severity: 'critical',
  });

  // Check for duplicate CMPs in same US
  const bcNode = tree.find((n) => n.type === 'BC');
  let duplicateCount = 0;
  if (bcNode) {
    for (const sol of bcNode.children) {
      for (const us of sol.children) {
        const cmpTitles = us.children.map((c) => c.title.toLowerCase());
        if (cmpTitles.length !== new Set(cmpTitles).size) duplicateCount++;
      }
    }
  }
  checks.push({
    id: 'G3-C2',
    rule: 'No duplicate CMP within same US',
    passed: duplicateCount === 0,
    details: duplicateCount > 0 ? `${duplicateCount} US with duplicate components` : undefined,
    severity: 'medium',
  });

  return checks;
}

/** Run structural checks for G4: CMP → FN */
function checkG4(_tree: TreeNode[], validationResults: Array<{ ruleId: string; passed: boolean; details?: string }>): GateCheck[] {
  const checks: GateCheck[] = [];

  // V-003: Every CMP must have at least one FN
  const v003Failures = validationResults.filter((v) => v.ruleId === 'V-003' && !v.passed);
  checks.push({
    id: 'G4-C1',
    rule: 'Every CMP has at least one FN (V-003)',
    passed: v003Failures.length === 0,
    details: v003Failures.length > 0 ? `${v003Failures.length} CMP without Functions` : undefined,
    severity: 'critical',
  });

  return checks;
}

/** Run structural checks for G5: FN → Code */
function checkG5(tree: TreeNode[], validationResults: Array<{ ruleId: string; passed: boolean; details?: string }>): GateCheck[] {
  const checks: GateCheck[] = [];

  // V-005: Child status does not exceed parent
  const v005Failures = validationResults.filter((v) => v.ruleId === 'V-005' && !v.passed);
  checks.push({
    id: 'G5-C1',
    rule: 'Child status does not exceed parent (V-005)',
    passed: v005Failures.length === 0,
    details: v005Failures.length > 0 ? `${v005Failures.length} status violation(s)` : undefined,
    severity: 'critical',
  });

  // All parent artifacts at least 'approved'
  const bc = tree.find((n) => n.type === 'BC');
  let unapprovedParents = 0;
  if (bc) {
    function checkApproved(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (['BC', 'SOL', 'US', 'CMP'].includes(n.type)) {
          if (STATUS_ORDER.indexOf(n.status) < STATUS_ORDER.indexOf('approved')) {
            unapprovedParents++;
          }
        }
        checkApproved(n.children);
      }
    }
    checkApproved([bc]);
  }
  checks.push({
    id: 'G5-C2',
    rule: 'All parent statuses are at least approved',
    passed: unapprovedParents === 0,
    details: unapprovedParents > 0 ? `${unapprovedParents} artifact(s) not yet approved` : undefined,
    severity: 'high',
  });

  return checks;
}

/* ------------------------------------------------------------------ */
/*  Gap Detection                                                      */
/* ------------------------------------------------------------------ */

/**
 * Identify gaps from failed checks (structural only in Phase 1).
 * Phase 2 will add LLM-based gap analysis.
 */
function identifyGaps(gateId: GateId, checks: GateCheck[], gateDef: GateDefinition): Gap[] {
  const gaps: Gap[] = [];
  let gapCounter = 0;

  for (const check of checks) {
    if (!check.passed) {
      gapCounter++;
      gaps.push({
        id: `${gateId}-GAP-${gapCounter}`,
        artifactId: check.details?.match(/^(\w+-[\d.]+)/)?.[1] ?? gateId,
        description: check.details ?? check.rule,
        severity: check.severity,
        suggestedAgent: gateDef.agents[0] ?? 'socratic',
        resolved: false,
      });
    }
  }

  return gaps;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Evaluate a single gate for a project.
 * Runs all structural checks + confidence scoring, returns gate result.
 */
export async function evaluateGate(projectId: string, gateId: GateId): Promise<GateResult> {
  const definitions = await loadGateDefinitions();
  const gateDef = definitions.find((g) => g.id === gateId);

  if (!gateDef) {
    throw Object.assign(new Error(`Unknown gate: ${gateId}`), { status: 400 });
  }

  const tree = await buildTree(projectId);
  const validationResults = await validateProject(projectId);

  // Run gate-specific checks
  let checks: GateCheck[];
  switch (gateId) {
    case 'G0_IDEA_TO_BC': checks = checkG0(tree); break;
    case 'G1_BC_TO_SOL': checks = checkG1(tree); break;
    case 'G2_SOL_TO_US': checks = checkG2(tree, validationResults); break;
    case 'G3_US_TO_CMP': checks = checkG3(tree, validationResults); break;
    case 'G4_CMP_TO_FN': checks = checkG4(tree, validationResults); break;
    case 'G5_FN_TO_CODE': checks = checkG5(tree, validationResults); break;
    default: checks = [];
  }

  // Identify gaps from failed checks
  const gaps = identifyGaps(gateId, checks, gateDef);

  // Calculate confidence (average of all artifacts' confidence at this level)
  const allScores = await evaluateAllConfidence(projectId);
  const relevantScores = filterScoresForGate(allScores, tree, gateId);
  const confidence = averageConfidence(relevantScores);

  // Determine gate status
  const allPassed = checks.every((c) => c.passed);
  const criticalFailed = checks.some((c) => !c.passed && c.severity === 'critical');
  let status: GateStatus;
  let needsProbing = false;

  if (criticalFailed) {
    status = 'failed';
  } else if (allPassed) {
    // All structural checks pass → gate is passed.
    // If confidence is below threshold, flag for probing but don't block.
    status = 'passed';
    if (confidence < gateDef.autoPassThreshold) {
      needsProbing = true;
    }
  } else {
    status = 'failed';
  }

  return {
    gateId,
    name: gateDef.name,
    from: gateDef.from,
    to: gateDef.to,
    status,
    confidence,
    checks,
    gaps,
    timestamp: new Date().toISOString(),
    ...(needsProbing && { needsProbing }),
  };
}

/**
 * Get the full pipeline status for a project (all gates).
 */
export async function getProjectPipeline(projectId: string): Promise<PipelineStatus> {
  const definitions = await loadGateDefinitions();
  const gates: GateResult[] = [];
  let locked = false;

  for (const def of definitions) {
    if (locked) {
      // Previous gate not passed — mark subsequent gates as locked
      gates.push({
        gateId: def.id,
        name: def.name,
        from: def.from,
        to: def.to,
        status: 'locked',
        confidence: 0,
        checks: [],
        gaps: [],
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    try {
      const result = await evaluateGate(projectId, def.id);
      gates.push(result);
      // If this gate is not passed/overridden, lock all subsequent gates
      if (result.status !== 'passed' && result.status !== 'overridden') {
        locked = true;
      }
    } catch {
      // Return a pending result for gates that error
      gates.push({
        gateId: def.id,
        name: def.name,
        from: def.from,
        to: def.to,
        status: 'pending',
        confidence: 0,
        checks: [],
        gaps: [],
        timestamp: new Date().toISOString(),
      });
      locked = true;
    }
  }

  const overallConfidence = gates.length > 0
    ? Math.round(gates.reduce((sum, g) => sum + g.confidence, 0) / gates.length)
    : 0;

  return {
    projectId,
    gates,
    overallConfidence,
    lastEvaluated: new Date().toISOString(),
  };
}

/**
 * Override a gate (escape hatch) — requires a reason.
 * Returns updated gate result with 'overridden' status.
 */
export async function overrideGate(
  projectId: string,
  gateId: GateId,
  reason: string,
): Promise<GateResult> {
  // First evaluate to get current state
  const result = await evaluateGate(projectId, gateId);

  // Only allow overriding failed or pending gates
  if (result.status === 'passed') {
    throw Object.assign(
      new Error(`Gate ${gateId} already passed — no override needed`),
      { status: 400 },
    );
  }

  if (result.status === 'locked') {
    throw Object.assign(
      new Error(`Gate ${gateId} is locked — complete the prerequisite gate first`),
      { status: 400 },
    );
  }

  return {
    ...result,
    status: 'overridden',
    overrideReason: reason,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get all identified gaps across all gates.
 */
export async function getAllGaps(projectId: string): Promise<Gap[]> {
  const pipeline = await getProjectPipeline(projectId);
  return pipeline.gates.flatMap((g) => g.gaps);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Filter confidence scores relevant to a specific gate's level.
 */
function filterScoresForGate(
  scores: ConfidenceScore[],
  tree: TreeNode[],
  gateId: GateId,
): ConfidenceScore[] {
  // Map gate to the entity type it evaluates
  const gateToTypes: Record<GateId, string[]> = {
    'G0_IDEA_TO_BC': ['BC'],
    'G1_BC_TO_SOL': ['BC', 'SOL'],
    'G2_SOL_TO_US': ['SOL', 'US'],
    'G3_US_TO_CMP': ['US', 'CMP'],
    'G4_CMP_TO_FN': ['CMP', 'FN'],
    'G5_FN_TO_CODE': ['FN'],
  };

  const relevantTypes = gateToTypes[gateId] ?? [];

  // Collect all IDs of nodes matching those types
  const relevantIds = new Set<string>();
  function walk(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (relevantTypes.includes(n.type)) {
        relevantIds.add(n.id);
      }
      walk(n.children);
    }
  }
  walk(tree);

  return scores.filter((s) => relevantIds.has(s.artifactId));
}
