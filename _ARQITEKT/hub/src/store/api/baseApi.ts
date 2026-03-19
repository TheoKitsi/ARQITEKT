import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api', credentials: 'include' });

/**
 * Wraps the base query with a 401 → refresh token → retry pattern.
 * On 401, attempts POST /auth/refresh once; if it succeeds, retries
 * the original request. If refresh also fails, returns the 401 error.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // Try to refresh the token
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        // Refresh succeeded — retry the original request
        result = await rawBaseQuery(args, api, extraOptions);
      }
      // If refresh failed, the original 401 error is returned
    }

    return result;
  };

const baseQueryWithRetry = retry(baseQueryWithReauth, { maxRetries: 2 });

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Project', 'Registry', 'Requirements', 'Feedback', 'GitHub', 'Hub', 'Auth', 'Pipeline', 'Probing', 'Baseline', 'Traceability', 'Notifications', 'Audit'],
  endpoints: () => ({}),
});
