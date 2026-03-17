import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ScaffoldRequest {
  projectId: string;
  template?: string;
  options?: Record<string, unknown>;
}

export interface ScaffoldResult {
  success: boolean;
  filesCreated: string[];
  message?: string;
}

export interface CodegenRequest {
  projectId: string;
  scope?: string;
  options?: Record<string, unknown>;
}

export interface CodegenResult {
  success: boolean;
  filesGenerated: string[];
  message?: string;
}

export interface AppStatusResult {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
  uptime?: number;
}

export interface AppActionResult {
  success: boolean;
  message?: string;
  pid?: number;
  port?: number;
}

export interface GitHubPushRequest {
  projectId: string;
  branch?: string;
  commitMessage?: string;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  branch?: string;
  url?: string;
}

export interface ExportIssuesRequest {
  projectId: string;
  repository?: string;
  labels?: string[];
}

export interface ExportIssuesResult {
  success: boolean;
  issuesCreated: number;
  issueUrls: string[];
}

export interface StoreConfigureRequest {
  projectId: string;
  config: Record<string, unknown>;
}

export interface StoreBuildResult {
  success: boolean;
  output?: string;
  errors?: string[];
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const deployApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    scaffold: builder.mutation<ScaffoldResult, ScaffoldRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/scaffold`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),

    codegen: builder.mutation<CodegenResult, CodegenRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/codegen`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),

    appStart: builder.mutation<AppActionResult, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/app/start`,
        method: 'POST',
      }),
    }),

    appStop: builder.mutation<AppActionResult, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/app/stop`,
        method: 'POST',
      }),
    }),

    appStatus: builder.query<AppStatusResult, string>({
      query: (projectId) => `/projects/${projectId}/app/status`,
    }),

    githubPush: builder.mutation<GitHubPushResult, GitHubPushRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/github-push`,
        method: 'POST',
        body,
      }),
    }),

    exportIssues: builder.mutation<ExportIssuesResult, ExportIssuesRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/github-export`,
        method: 'POST',
        body,
      }),
    }),

    storeConfigure: builder.mutation<void, StoreConfigureRequest>({
      query: ({ projectId, config }) => ({
        url: `/projects/${projectId}/store/configure`,
        method: 'POST',
        body: config,
      }),
    }),

    storeBuild: builder.mutation<StoreBuildResult, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/store/build`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useScaffoldMutation,
  useCodegenMutation,
  useAppStartMutation,
  useAppStopMutation,
  useAppStatusQuery,
  useGithubPushMutation,
  useExportIssuesMutation,
  useStoreConfigureMutation,
  useStoreBuildMutation,
} = deployApi;
