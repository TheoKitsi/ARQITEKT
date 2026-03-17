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
