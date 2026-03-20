import { baseApi } from './baseApi';

interface BaselineArtifact {
  id: string;
  type: string;
  title: string;
  status: string;
  parentId?: string;
  contentHash: string;
}

interface Baseline {
  projectId: string;
  createdAt: string;
  treeHash: string;
  artifacts: BaselineArtifact[];
}

interface DriftItem {
  artifactId: string;
  kind: string;
  detail: string;
}

interface DriftReport {
  projectId: string;
  baselineDate: string;
  checkedAt: string;
  drifted: boolean;
  items: DriftItem[];
  summary: {
    added: number;
    removed: number;
    changed: number;
    regressed: number;
  };
}

interface TraceLink {
  from: string;
  to: string;
  relation: 'parent' | 'child';
}

interface TraceabilityMatrix {
  projectId: string;
  links: TraceLink[];
  orphans: string[];
  leaves: string[];
}

interface ImpactAnalysis {
  artifactId: string;
  directlyAffected: string[];
  transitivelyAffected: string[];
  totalImpact: number;
}

const baselineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    /* Baseline */
    getBaseline: build.query<Baseline, string>({
      query: (projectId) => `projects/${projectId}/baseline`,
      extraOptions: { maxRetries: 0 },
      providesTags: (_r, _e, id) => [{ type: 'Baseline', id }],
    }),

    setBaseline: build.mutation<Baseline, string>({
      query: (projectId) => ({
        url: `projects/${projectId}/baseline`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Baseline', id }],
    }),

    /* Drift */
    getDrift: build.query<DriftReport, string>({
      query: (projectId) => `projects/${projectId}/drift`,
      providesTags: (_r, _e, id) => [{ type: 'Baseline', id }],
    }),

    /* Traceability */
    getTraceability: build.query<TraceabilityMatrix, string>({
      query: (projectId) => `projects/${projectId}/traceability`,
      providesTags: (_r, _e, id) => [{ type: 'Traceability', id }],
    }),

    getOrphans: build.query<{ orphans: string[] }, string>({
      query: (projectId) => `projects/${projectId}/traceability/orphans`,
      providesTags: (_r, _e, id) => [{ type: 'Traceability', id }],
    }),

    getImpact: build.query<ImpactAnalysis, { projectId: string; artifactId: string }>({
      query: ({ projectId, artifactId }) =>
        `projects/${projectId}/traceability/impact/${artifactId}`,
    }),
  }),
});

export const {
  useGetBaselineQuery,
  useSetBaselineMutation,
  useGetDriftQuery,
  useGetTraceabilityQuery,
  useGetOrphansQuery,
  useGetImpactQuery,
} = baselineApi;
