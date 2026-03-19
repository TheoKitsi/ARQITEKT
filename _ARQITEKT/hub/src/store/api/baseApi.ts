import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '/api', credentials: 'include' });
const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Project', 'Registry', 'Requirements', 'Feedback', 'GitHub', 'Hub', 'Auth', 'Pipeline', 'Probing', 'Baseline', 'Traceability', 'Notifications'],
  endpoints: () => ({}),
});
