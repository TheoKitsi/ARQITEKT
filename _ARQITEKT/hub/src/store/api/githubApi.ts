import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  repositories?: GitHubRepository[];
}

export interface GitHubRepository {
  name: string;
  fullName: string;
  url: string;
  private: boolean;
  defaultBranch: string;
}

export interface GitHubConnectRequest {
  token: string;
}

export interface GitHubConnectResponse {
  connected: boolean;
  username: string;
  avatarUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const githubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGithubStatus: builder.query<GitHubStatus, void>({
      query: () => '/github/status',
      providesTags: ['GitHub'],
    }),

    connectGithub: builder.mutation<GitHubConnectResponse, GitHubConnectRequest>(
      {
        query: (body) => ({
          url: '/github/connect',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['GitHub'],
      },
    ),

    disconnectGithub: builder.mutation<void, void>({
      query: () => ({
        url: '/github/disconnect',
        method: 'POST',
      }),
      invalidatesTags: ['GitHub'],
    }),
  }),
});

export const {
  useGetGithubStatusQuery,
  useConnectGithubMutation,
  useDisconnectGithubMutation,
} = githubApi;
