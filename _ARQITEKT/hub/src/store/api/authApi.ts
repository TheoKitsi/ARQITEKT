import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  authEnabled: boolean;
  user: AuthUser | null;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthStatus: builder.query<AuthStatus, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<{ user: AuthUser }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useGetAuthStatusQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
