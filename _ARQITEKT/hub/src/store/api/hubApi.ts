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

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const hubApi = baseApi.injectEndpoints({
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
  }),
});

export const {
  useGetHubVersionQuery,
  useCheckUpdateQuery,
  useInstallUpdateMutation,
} = hubApi;
