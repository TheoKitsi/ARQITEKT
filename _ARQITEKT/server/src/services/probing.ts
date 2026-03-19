import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';
import { resolveProjectById } from './projects.js';
import { sendChatMessage } from './llm.js';
import { buildTree } from './requirements.js';
import { evaluateGate } from './pipeline.js';
import { parseFrontmatter } from './frontmatter.js';
import type {
  AgentType, GateId, ProbingQuestion, ProbingOption,
  RiskLevel, TreeNode, Gap,
} from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Prompt Template Loading                                            */
/* ------------------------------------------------------------------ */

const promptCache = new Map<string, string>();

async function loadPromptTemplate(name: string): Promise<string> {
  const cached = promptCache.get(name);
  if (cached) return cached;

  const promptPath = join(config.hubRoot, 'template', 'config', 'prompts', `${name}.md`);
  const content = await readFile(promptPath, 'utf-8');
  promptCache.set(name, content);
  return content;
}

/** Map AgentType to prompt template file name */
const AGENT_PROMPT_MAP: Record<AgentType, string> = {
  socratic: 'socratic',
  devils_advocate: 'devils-advocate',
  constraint: 'constraint',
  example: 'example',
  boundary: 'boundary',
};

/* ------------------------------------------------------------------ */
/*  Artifact Content Helpers                                           */
/* ------------------------------------------------------------------ */

async function findArtifactFile(projectDir: string, artifactId: string): Promise<string | null> {
  const { readdir } = await import('fs/promises');
  const reqDir = join(projectDir, 'requirements');

  async function search(dir: string): Promise<string | null> {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return null; }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = await search(fullPath);
        if (found) return found;
      } else if (entry.name.endsWith('.md')) {
        const content = await readFile(fullPath, 'utf-8');
        const fm = parseFrontmatter(content);
        if (fm.data.id === artifactId) return fullPath;
      }
    }
    return null;
  }

  return search(reqDir);
}

async function getArtifactContent(projectId: string, artifactId: string): Promise<{ body: string; frontmatter: Record<string, string> } | null> {
  const projectDir = await resolveProjectById(projectId);
  const filePath = await findArtifactFile(projectDir, artifactId);
  if (!filePath) return null;

  const raw = await readFile(filePath, 'utf-8');
  const { data, body } = parseFrontmatter(raw);
  return { body, frontmatter: data as Record<string, string> };
}

function findNodeInTree(tree: TreeNode[], id: string): { node: TreeNode; parent: TreeNode | null; siblings: TreeNode[] } | null {
  function walk(nodes: TreeNode[], parent: TreeNode | null): { node: TreeNode; parent: TreeNode | null; siblings: TreeNode[] } | null {
    for (const n of nodes) {
      if (n.id === id) return { node: n, parent, siblings: nodes };
      const found = walk(n.children, n);
      if (found) return found;
    }
    return null;
  }
  return walk(tree, null);
}

/* ------------------------------------------------------------------ */
/*  Template Interpolation                                             */
/* ------------------------------------------------------------------ */

function interpolateTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  LLM-based Gap Analysis                                             */
/* ------------------------------------------------------------------ */

/**
 * Use LLM to analyze an artifact and identify semantic gaps.
 * Returns structured gaps with suggested agents.
 */
export async function analyzeGaps(
  projectId: string,
  artifactId: string,
): Promise<Gap[]> {
  const tree = await buildTree(projectId);
  const nodeInfo = findNodeInTree(tree, artifactId);
  if (!nodeInfo) {
    throw Object.assign(new Error(`Artifact "${artifactId}" not found`), { status: 404 });
  }

  const content = await getArtifactContent(projectId, artifactId);
  const body = content?.body ?? '';

  // Determine which gate this artifact belongs to
  const gateId = getGateForType(nodeInfo.node.type);

  // Load gap analysis prompt
  const template = await loadPromptTemplate('gap-analysis');
  const prompt = interpolateTemplate(template, {
    projectId,
    artifactId,
    artifactType: nodeInfo.node.type,
    artifactContent: body.slice(0, 3000), // Limit context size
    gateId,
    gateName: gateId,
    parentTitle: nodeInfo.parent?.title ?? 'N/A',
    parentType: nodeInfo.parent?.type ?? 'N/A',
    childrenSummary: nodeInfo.node.children.map((c) => `${c.id}: ${c.title}`).join(', ') || 'None',
    currentConfidence: String(content?.frontmatter?.confidence ?? 'N/A'),
  });

  const result = await sendChatMessage([
    { role: 'system', content: prompt },
    { role: 'user', content: `Analyze artifact ${artifactId} and identify gaps.` },
  ]);

  // Parse LLM response
  const gaps = parseLLMGaps(result.content, artifactId, gateId);
  return gaps;
}

/**
 * Generate a probing question for a specific gap using the assigned agent.
 */
export async function generateQuestion(
  projectId: string,
  artifactId: string,
  gap: Gap,
): Promise<ProbingQuestion> {
  const tree = await buildTree(projectId);
  const nodeInfo = findNodeInTree(tree, artifactId);
  if (!nodeInfo) {
    throw Object.assign(new Error(`Artifact "${artifactId}" not found`), { status: 404 });
  }

  const content = await getArtifactContent(projectId, artifactId);
  const body = content?.body ?? '';

  // Load agent-specific prompt
  const promptName = AGENT_PROMPT_MAP[gap.suggestedAgent];
  const template = await loadPromptTemplate(promptName);

  const prompt = interpolateTemplate(template, {
    projectId,
    artifactId,
    artifactType: nodeInfo.node.type,
    artifactContent: body.slice(0, 3000),
    gapDescription: gap.description,
    parentTitle: nodeInfo.parent?.title ?? 'N/A',
    parentType: nodeInfo.parent?.type ?? 'N/A',
    relatedArtifacts: nodeInfo.node.children.map((c) => `${c.id}: ${c.title}`).join(', ') || 'None',
    infraContext: 'See infrastructure requirements',
    technicalContext: `${nodeInfo.node.type}: ${nodeInfo.node.title}`,
  });

  const result = await sendChatMessage([
    { role: 'system', content: prompt },
    { role: 'user', content: `Generate a probing question for gap: ${gap.description}` },
  ]);

  // Parse LLM response into ProbingQuestion
  const question = parseLLMQuestion(result.content, gap, artifactId);
  return question;
}

/**
 * Full probing pipeline: analyze gaps, then generate questions for each.
 */
export async function startProbing(
  projectId: string,
  artifactId: string,
): Promise<ProbingQuestion[]> {
  // First get structural gaps from gate evaluation
  const tree = await buildTree(projectId);
  const nodeInfo = findNodeInTree(tree, artifactId);
  if (!nodeInfo) {
    throw Object.assign(new Error(`Artifact "${artifactId}" not found`), { status: 404 });
  }

  const gateId = getGateForType(nodeInfo.node.type) as GateId;
  const gateResult = await evaluateGate(projectId, gateId);

  // Combine structural gaps with LLM-detected gaps
  let allGaps = [...gateResult.gaps];

  // Add LLM-based gap analysis
  try {
    const llmGaps = await analyzeGaps(projectId, artifactId);
    // Only add gaps not already covered by structural checks
    const existingDescs = new Set(allGaps.map((g) => g.description.toLowerCase()));
    for (const gap of llmGaps) {
      if (!existingDescs.has(gap.description.toLowerCase())) {
        allGaps.push(gap);
      }
    }
  } catch (err) {
    console.error(`LLM gap analysis failed for ${artifactId}:`, err instanceof Error ? err.message : err);
    // Proceed with structural gaps only
  }

  // Limit to top 5 gaps by severity
  allGaps = prioritizeGaps(allGaps).slice(0, 5);

  // Generate probing questions for each gap
  const questions: ProbingQuestion[] = [];
  for (const gap of allGaps) {
    try {
      const q = await generateQuestion(projectId, artifactId, gap);
      questions.push(q);
    } catch (err) {
      console.error(`LLM question generation failed for gap "${gap.description}":`, err instanceof Error ? err.message : err);
      // If LLM fails for one question, create a structural fallback
      questions.push(createFallbackQuestion(gap, artifactId));
    }
  }

  return questions;
}

/* ------------------------------------------------------------------ */
/*  Answer Integration                                                 */
/* ------------------------------------------------------------------ */

/**
 * Process an answer to a probing question.
 * Returns the updated question with status 'answered'.
 */
export function processAnswer(
  question: ProbingQuestion,
  answer: string,
): ProbingQuestion {
  return {
    ...question,
    status: 'answered',
    answer,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Process a skip for a probing question.
 */
export function processSkip(
  question: ProbingQuestion,
  reason: string,
): ProbingQuestion {
  if (!question.canSkip) {
    throw Object.assign(
      new Error(`Question ${question.id} cannot be skipped (critical)`),
      { status: 400 },
    );
  }

  return {
    ...question,
    status: 'skipped',
    skipReason: reason,
    timestamp: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGateForType(type: string): string {
  const map: Record<string, GateId> = {
    BC: 'G0_IDEA_TO_BC',
    SOL: 'G1_BC_TO_SOL',
    US: 'G2_SOL_TO_US',
    CMP: 'G3_US_TO_CMP',
    FN: 'G4_CMP_TO_FN',
  };
  return map[type] ?? 'G5_FN_TO_CODE';
}

const SEVERITY_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

function prioritizeGaps(gaps: Gap[]): Gap[] {
  return [...gaps].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

/**
 * Parse LLM gap analysis JSON response.
 */
function parseLLMGaps(response: string, artifactId: string, gateId: string): Gap[] {
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ?? response.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[1]!) as {
      gaps?: Array<{
        description?: string;
        severity?: string;
        suggestedAgent?: string;
      }>;
    };

    if (!parsed.gaps || !Array.isArray(parsed.gaps)) return [];

    return parsed.gaps
      .filter((g) => g.description)
      .map((g, i) => ({
        id: `${gateId}-LLM-${i + 1}`,
        artifactId,
        description: String(g.description),
        severity: validateSeverity(g.severity) ?? 'medium',
        suggestedAgent: validateAgent(g.suggestedAgent) ?? 'socratic',
        resolved: false,
      }));
  } catch {
    return [];
  }
}

/**
 * Parse LLM probing question JSON response.
 */
function parseLLMQuestion(response: string, gap: Gap, artifactId: string): ProbingQuestion {
  try {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ?? response.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) return createFallbackQuestion(gap, artifactId);

    const parsed = JSON.parse(jsonMatch[1]!) as {
      question?: string;
      options?: Array<{ id?: string; label?: string; impact?: string }>;
      whyImportant?: string;
      estimatedImpact?: string;
      canSkip?: boolean;
    };

    if (!parsed.question) return createFallbackQuestion(gap, artifactId);

    const options: ProbingOption[] = (parsed.options ?? [])
      .filter((o) => o.label)
      .map((o, i) => ({
        id: o.id ?? String.fromCharCode(97 + i),
        label: String(o.label),
        impact: String(o.impact ?? ''),
      }));

    return {
      id: `PQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agentType: gap.suggestedAgent,
      gapId: gap.id,
      artifactId,
      question: String(parsed.question),
      options,
      whyImportant: String(parsed.whyImportant ?? gap.description),
      estimatedImpact: validateSeverity(parsed.estimatedImpact) ?? gap.severity,
      canSkip: parsed.canSkip ?? gap.severity !== 'critical',
      status: 'open',
      timestamp: new Date().toISOString(),
    };
  } catch {
    return createFallbackQuestion(gap, artifactId);
  }
}

function createFallbackQuestion(gap: Gap, artifactId: string): ProbingQuestion {
  return {
    id: `PQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agentType: gap.suggestedAgent,
    gapId: gap.id,
    artifactId,
    question: `[${gap.suggestedAgent}] Please clarify: ${gap.description}`,
    options: [],
    whyImportant: gap.description,
    estimatedImpact: gap.severity,
    canSkip: gap.severity !== 'critical',
    status: 'open',
    timestamp: new Date().toISOString(),
  };
}

function validateSeverity(s?: string): RiskLevel | undefined {
  if (s && SEVERITY_ORDER.includes(s as RiskLevel)) return s as RiskLevel;
  return undefined;
}

const VALID_AGENTS: AgentType[] = ['socratic', 'devils_advocate', 'constraint', 'example', 'boundary'];

function validateAgent(a?: string): AgentType | undefined {
  if (a && VALID_AGENTS.includes(a as AgentType)) return a as AgentType;
  return undefined;
}
