import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type NodeType =
  | 'BC'
  | 'SOL'
  | 'US'
  | 'CMP'
  | 'FN'
  | 'CONV'
  | 'INF'
  | 'ADR'
  | 'NTF'
  | 'FBK';

export interface TreeNode {
  id: string;
  solId?: string;
  usId?: string;
  title: string;
  type: NodeType;
  status: RequirementStatus;
  children: TreeNode[];
  description?: string;
  acceptanceCriteria?: string[];
}

export type RequirementStatus =
  | 'idea'
  | 'draft'
  | 'review'
  | 'approved'
  | 'implemented';

export interface RequirementsStats {
  total: number;
  byStatus: Record<RequirementStatus, number>;
  bc: number;
  sol: number;
  us: number;
  cmp: number;
  fn: number;
  inf: number;
  adr: number;
  ntf: number;
  solutions: number;
  userStories: number;
  requirements: number;
  completionPercent: number;
}

export interface ReadinessResult {
  ready: boolean;
  score: number;
  issues: ReadinessIssue[];
}

export interface ReadinessIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
}

export interface ValidationResult {
  results: ValidationItem[];
}

export interface ValidationItem {
  rule: string;
  ruleId: string;
  scope: string;
  passed: boolean;
  details?: string;
  affectedArtifacts?: string[];
}

export interface CreateSolutionRequest {
  projectId: string;
  title: string;
  notes?: string;
  mode: 'discuss' | 'direct';
}

export interface CreateUserStoryRequest {
  projectId: string;
  solutionId: string;
  title: string;
  notes?: string;
  mode: 'discuss' | 'direct';
}

export interface SetStatusRequest {
  projectId: string;
  nodeId: string;
  status: RequirementStatus;
}

export interface SearchResult {
  nodeId: string;
  title: string;
  type: string;
  match: string;
  path: string[];
}

export interface NextIdResult {
  nextId: string;
}

export interface BCSummary {
  totalSolutions: number;
  totalUserStories: number;
  totalRequirements: number;
  readiness: number;
  categories: BCSummaryCategory[];
}

export interface BCSummaryCategory {
  name: string;
  count: number;
  completionPercent: number;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const requirementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTree: builder.query<TreeNode[], string>({
      query: (projectId) => `/projects/${projectId}/tree`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Requirements', id: projectId },
      ],
    }),

    getStats: builder.query<RequirementsStats, string>({
      query: (projectId) => `/projects/${projectId}/stats`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Requirements', id: `${projectId}-stats` },
      ],
    }),

    getReadiness: builder.query<ReadinessResult, string>({
      query: (projectId) => `/projects/${projectId}/readiness`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Requirements', id: `${projectId}-readiness` },
      ],
    }),

    validate: builder.mutation<ValidationResult, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/validate`,
        method: 'POST',
      }),
    }),

    setStatus: builder.mutation<void, SetStatusRequest>({
      query: ({ projectId, nodeId, status }) => ({
        url: `/projects/${projectId}/set-status`,
        method: 'PUT',
        body: { nodeId, status },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Requirements', id: projectId },
        { type: 'Requirements', id: `${projectId}-stats` },
        { type: 'Requirements', id: `${projectId}-readiness` },
      ],
    }),

    searchRequirements: builder.query<
      SearchResult[],
      { projectId: string; q: string }
    >({
      query: ({ projectId, q }) =>
        `/projects/${projectId}/search?q=${encodeURIComponent(q)}`,
    }),

    getNextSolId: builder.query<NextIdResult, string>({
      query: (projectId) => `/projects/${projectId}/next-sol-id`,
    }),

    getNextUsId: builder.query<NextIdResult, { projectId: string; sol: string }>(
      {
        query: ({ projectId, sol }) =>
          `/projects/${projectId}/next-us-id?sol=${encodeURIComponent(sol)}`,
      },
    ),

    getBCSummary: builder.query<BCSummary, string>({
      query: (projectId) => `/projects/${projectId}/bc-summary`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Requirements', id: `${projectId}-bc` },
      ],
    }),

    createSolution: builder.mutation<TreeNode, CreateSolutionRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/solutions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Requirements', id: projectId },
        { type: 'Requirements', id: `${projectId}-stats` },
      ],
    }),

    createUserStory: builder.mutation<TreeNode, CreateUserStoryRequest>({
      query: ({ projectId, solutionId, ...body }) => ({
        url: `/projects/${projectId}/solutions/${solutionId}/user-stories`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Requirements', id: projectId },
        { type: 'Requirements', id: `${projectId}-stats` },
      ],
    }),

    validateProject: builder.mutation<ValidationResult, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/validate`,
        method: 'POST',
      }),
    }),

    importCsv: builder.mutation<
      { success: boolean; filesCreated: string[]; errors: string[]; totalRows: number },
      { projectId: string; csv: string }
    >({
      query: ({ projectId, csv }) => ({
        url: `/projects/${projectId}/import-csv`,
        method: 'POST',
        body: { csv },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Requirements', id: projectId },
      ],
    }),
  }),
});

export const {
  useGetTreeQuery,
  useGetStatsQuery,
  useGetReadinessQuery,
  useValidateMutation,
  useSetStatusMutation,
  useSearchRequirementsQuery,
  useGetNextSolIdQuery,
  useGetNextUsIdQuery,
  useGetBCSummaryQuery,
  useCreateSolutionMutation,
  useCreateUserStoryMutation,
  useValidateProjectMutation,
  useImportCsvMutation,
} = requirementsApi;
