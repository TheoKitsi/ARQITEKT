import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  projectId: string;
  target?: string;
  detail?: Record<string, unknown>;
}

export interface AuditResponse {
  entries: AuditEntry[];
  total: number;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLog: builder.query<AuditResponse, { projectId: string; limit?: number; offset?: number }>({
      query: ({ projectId, limit = 50, offset = 0 }) =>
        `/projects/${projectId}/audit?limit=${limit}&offset=${offset}`,
      providesTags: (_r, _e, { projectId }) => [{ type: 'Audit', id: projectId }],
    }),
  }),
});

export const { useGetAuditLogQuery } = auditApi;
