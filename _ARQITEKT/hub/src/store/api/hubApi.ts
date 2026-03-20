import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HubVersion {
  version: string;
  buildDate: string;
  commitSha?: string;
  nodeVersion?: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseNotes?: string;
  downloadUrl?: string;
}

export interface InstallUpdateResult {
  success: boolean;
  version: string;
  message?: string;
  requiresRestart: boolean;
}

export interface LlmUsageEntry {
  timestamp: number;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  streaming: boolean;
}

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  artifacts: number;
}

export interface LlmUsageSummary {
  totalCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  byModel: Record<string, { calls: number; tokens: number }>;
  recentEntries: LlmUsageEntry[];
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const hubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHubVersion: builder.query<HubVersion, void>({
      query: () => '/hub/version',
      providesTags: ['Hub'],
    }),

    checkUpdate: builder.query<UpdateCheckResult, void>({
      query: () => '/hub/update/check',
      providesTags: [{ type: 'Hub', id: 'update' }],
    }),

    installUpdate: builder.mutation<InstallUpdateResult, void>({
      query: () => ({
        url: '/hub/update/install',
        method: 'POST',
      }),
      invalidatesTags: ['Hub'],
    }),

    getLlmUsage: builder.query<LlmUsageSummary, { projectId?: string } | void>({
      query: (arg) => {
        const projectId = arg && 'projectId' in arg ? arg.projectId : undefined;
        return projectId ? `/hub/llm/usage?projectId=${encodeURIComponent(projectId)}` : '/hub/llm/usage';
      },
    }),

    getStarterTemplates: builder.query<StarterTemplate[], void>({
      query: () => '/hub/templates',
      providesTags: ['Hub'],
    }),
  }),
});

export const {
  useCheckUpdateQuery,
  useGetLlmUsageQuery,
  useGetStarterTemplatesQuery,
} = hubApi;
