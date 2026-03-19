/** Metamodel entity types */
export type EntityType =
  | 'BusinessCase'
  | 'Solution'
  | 'UserStory'
  | 'Component'
  | 'Function'
  | 'ConversationFlow'
  | 'Infrastructure'
  | 'ArchitectureDecision'
  | 'Notification'
  | 'Feedback';

export type EntityPrefix = 'BC' | 'SOL' | 'US' | 'CMP' | 'FN' | 'CONV' | 'INF' | 'ADR' | 'NTF' | 'FBK';

export type RequirementStatus = 'idea' | 'draft' | 'review' | 'approved' | 'implemented';

export type LifecycleStage = 'planning' | 'ready' | 'building' | 'built' | 'running' | 'deployed';

export interface ProjectConfig {
  name: string;
  codename: string;
  description?: string;
  lifecycle: LifecycleStage;
  github?: string;
  tags?: string[];
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    mode?: string;
  };
}

export interface Project {
  id: string;
  path: string;
  config: ProjectConfig;
  stats: ProjectStats;
  readiness: ProjectReadiness;
}

export interface ProjectStats {
  bc: number;
  sol: number;
  us: number;
  cmp: number;
  fn: number;
  inf: number;
  adr: number;
  ntf: number;
  conv: number;
  fbk: number;
}

export interface ProjectReadiness {
  authored: number;
  approved: number;
}

export interface TreeNode {
  id: string;
  type: EntityPrefix;
  title: string;
  status: RequirementStatus;
  children: TreeNode[];
  parent?: string;
}

export interface RequirementFrontmatter {
  type: EntityType;
  id: string;
  title: string;
  status: RequirementStatus;
  parent?: string;
  relationships?: {
    depends_on?: string[];
    constrains?: string[];
  };
}

export interface ValidationResult {
  rule: string;
  ruleId: string;
  scope: string;
  passed: boolean;
  details?: string;
  affectedArtifacts?: string[];
}

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  source: 'manual' | 'google-play' | 'app-store' | 'in-app' | 'email';
  severity: 'wish' | 'improvement' | 'bug' | 'critical';
  status: 'open' | 'planned' | 'done';
  rating?: number;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AppStatus {
  running: boolean;
  port?: number;
  pid?: number;
  mode?: 'dev' | 'production';
}

/* ------------------------------------------------------------------ */
/*  Projects registry (projects.yaml)                                  */
/* ------------------------------------------------------------------ */

export type ProjectMode = 'local' | 'external';

export interface ProjectRegistryEntry {
  id: string;
  name: string;
  codename: string;
  mode: ProjectMode;
  path: string;
  github?: string;
  description?: string;
}

export interface ProjectsRegistry {
  projects: ProjectRegistryEntry[];
}

/* ------------------------------------------------------------------ */
/*  Pipeline & Gate Engine Types                                       */
/* ------------------------------------------------------------------ */

export type GateId = 'G0_IDEA_TO_BC' | 'G1_BC_TO_SOL' | 'G2_SOL_TO_US' | 'G3_US_TO_CMP' | 'G4_CMP_TO_FN' | 'G5_FN_TO_CODE';

export type GateStatus = 'passed' | 'failed' | 'pending' | 'overridden';

export type AgentType = 'socratic' | 'devils_advocate' | 'constraint' | 'example' | 'boundary';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface GateCheck {
  id: string;
  rule: string;
  passed: boolean;
  details?: string;
  severity: RiskLevel;
}

export interface Gap {
  id: string;
  artifactId: string;
  description: string;
  severity: RiskLevel;
  suggestedAgent: AgentType;
  resolved: boolean;
}

export interface GateResult {
  gateId: GateId;
  name: string;
  from: EntityPrefix;
  to: EntityPrefix | 'CODE';
  status: GateStatus;
  confidence: number;
  checks: GateCheck[];
  gaps: Gap[];
  timestamp: string;
  overrideReason?: string;
}

export interface PipelineStatus {
  projectId: string;
  gates: GateResult[];
  overallConfidence: number;
  lastEvaluated: string;
}

export interface ConfidenceScore {
  artifactId: string;
  overall: number;
  structural: number;
  semantic: number;
  consistency: number;
  boundary: number;
  lastEvaluated: string;
}

export interface ConfidenceDetails {
  structural: number;
  semantic: number;
  consistency: number;
  boundary: number;
}

export interface GateDefinition {
  id: GateId;
  name: string;
  from: EntityPrefix;
  to: EntityPrefix | 'CODE';
  mandatoryChecks: string[];
  agents: AgentType[];
  autoPassThreshold: number;
  riskLevel: RiskLevel;
}

/* ------------------------------------------------------------------ */
/*  Probing / Agent System Types                                       */
/* ------------------------------------------------------------------ */

export interface ProbingOption {
  id: string;
  label: string;
  impact: string;
}

export interface ProbingQuestion {
  id: string;
  agentType: AgentType;
  gapId: string;
  artifactId: string;
  question: string;
  options: ProbingOption[];
  whyImportant: string;
  estimatedImpact: RiskLevel;
  canSkip: boolean;
  status: 'open' | 'answered' | 'skipped';
  answer?: string;
  skipReason?: string;
  timestamp: string;
}

export interface ProbingSession {
  projectId: string;
  artifactId: string;
  questions: ProbingQuestion[];
  startedAt: string;
  completedAt?: string;
}

export interface AgentPersona {
  type: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  triggerPatterns: string[];
  gates: GateId[];
}

/* ------------------------------------------------------------------ */
/*  Baseline & Drift Types                                             */
/* ------------------------------------------------------------------ */

export interface BaselineArtifact {
  id: string;
  type: EntityPrefix;
  title: string;
  status: RequirementStatus;
  parent?: string;
  contentHash: string;
  children: string[];
}

export interface Baseline {
  projectId: string;
  createdAt: string;
  artifacts: BaselineArtifact[];
  treeHash: string;
}

export type DriftKind =
  | 'added'
  | 'removed'
  | 'title_changed'
  | 'status_regressed'
  | 'content_changed'
  | 'parent_changed';

export interface DriftItem {
  artifactId: string;
  kind: DriftKind;
  details: string;
  severity: RiskLevel;
}

export interface DriftReport {
  projectId: string;
  baselineDate: string;
  checkedAt: string;
  drifts: DriftItem[];
  totalArtifacts: number;
  changedArtifacts: number;
}

/* ------------------------------------------------------------------ */
/*  Traceability Matrix Types                                          */
/* ------------------------------------------------------------------ */

export interface TraceLink {
  from: string;
  to: string;
  relation: 'parent' | 'child' | 'depends_on' | 'constrains';
}

export interface TraceabilityMatrix {
  projectId: string;
  links: TraceLink[];
  orphans: string[];
  leaves: string[];
}

export interface ImpactAnalysis {
  artifactId: string;
  directlyAffected: string[];
  transitivelyAffected: string[];
  totalImpact: number;
}
