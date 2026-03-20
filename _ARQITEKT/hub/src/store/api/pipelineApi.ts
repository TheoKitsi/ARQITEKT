import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types (mirror server types for frontend)                           */
/* ------------------------------------------------------------------ */

export type GateId =
  | 'G0_IDEA_TO_BC'
  | 'G1_BC_TO_SOL'
  | 'G2_SOL_TO_US'
  | 'G3_US_TO_CMP'
  | 'G4_CMP_TO_FN'
  | 'G5_FN_TO_CODE';

export type GateStatus = 'passed' | 'failed' | 'pending' | 'overridden' | 'locked';
export type AgentType = 'socratic' | 'devils_advocate' | 'constraint' | 'example' | 'boundary';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface GateCheck {
  id: string;
  rule: string;
  passed: boolean;
  details?: string;
  severity: RiskLevel;
}

export interface Gap {
  id: string;
  artifactId: string;
  description: string;
  severity: RiskLevel;
  suggestedAgent: AgentType;
  resolved: boolean;
}

export interface GateResult {
  gateId: GateId;
  name: string;
  from: string;
  to: string;
  status: GateStatus;
  confidence: number;
  checks: GateCheck[];
  gaps: Gap[];
  timestamp: string;
  overrideReason?: string;
}

export interface PipelineStatus {
  projectId: string;
  gates: GateResult[];
  overallConfidence: number;
  lastEvaluated: string;
}

export interface ConfidenceScore {
  artifactId: string;
  overall: number;
  structural: number;
  semantic: number;
  consistency: number;
  boundary: number;
  lastEvaluated: string;
}

export interface ProbingOption {
  id: string;
  label: string;
  impact: string;
}

export interface ProbingQuestion {
  id: string;
  agentType: AgentType;
  gapId: string;
  artifactId: string;
  question: string;
  options: ProbingOption[];
  whyImportant: string;
  estimatedImpact: RiskLevel;
  canSkip: boolean;
  status: 'open' | 'answered' | 'skipped';
  answer?: string;
  skipReason?: string;
  timestamp: string;
}

export interface ProbingSessionResponse {
  projectId: string;
  artifactId: string;
  questions: ProbingQuestion[];
  total: number;
  open: number;
}

export interface ProbingQuestionsResponse {
  questions: ProbingQuestion[];
  total: number;
  open: number;
  answered?: number;
  skipped?: number;
}

export interface AnswerResponse {
  question: ProbingQuestion;
  remaining: number;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const pipelineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---- Pipeline overview ---- */
    getPipeline: builder.query<PipelineStatus, string>({
      query: (projectId) => `/projects/${projectId}/pipeline`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Pipeline', id: projectId },
      ],
    }),

    /* ---- Evaluate a single gate ---- */
    evaluateGate: builder.mutation<GateResult, { projectId: string; gateId: GateId }>({
      query: ({ projectId, gateId }) => ({
        url: `/projects/${projectId}/pipeline/gate/${gateId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Pipeline', id: projectId },
      ],
    }),

    /* ---- Override a gate ---- */
    overrideGate: builder.mutation<GateResult, { projectId: string; gateId: GateId; reason: string }>({
      query: ({ projectId, gateId, reason }) => ({
        url: `/projects/${projectId}/pipeline/gate/${gateId}/override`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Pipeline', id: projectId },
      ],
    }),

    /* ---- Confidence scores (all artifacts) ---- */
    getConfidence: builder.query<{ scores: ConfidenceScore[] }, string>({
      query: (projectId) => `/projects/${projectId}/pipeline/confidence`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Pipeline', id: `${projectId}-confidence` },
      ],
    }),

    /* ---- Evaluate confidence for single artifact ---- */
    evaluateArtifactConfidence: builder.mutation<ConfidenceScore, { projectId: string; artifactId: string }>({
      query: ({ projectId, artifactId }) => ({
        url: `/projects/${projectId}/pipeline/confidence/${artifactId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Pipeline', id: `${projectId}-confidence` },
      ],
    }),

    /* ---- All gaps ---- */
    getGaps: builder.query<{ gaps: Gap[] }, string>({
      query: (projectId) => `/projects/${projectId}/pipeline/gaps`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Pipeline', id: `${projectId}-gaps` },
      ],
    }),

    /* ---- Start probing (analyze gaps + generate questions) ---- */
    startProbing: builder.mutation<ProbingSessionResponse, { projectId: string; artifactId: string }>({
      query: ({ projectId, artifactId }) => ({
        url: `/projects/${projectId}/probing/analyze`,
        method: 'POST',
        body: { artifactId },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Probing', id: projectId },
      ],
    }),

    /* ---- Get probing questions ---- */
    getProbingQuestions: builder.query<ProbingQuestionsResponse, { projectId: string; artifactId?: string }>({
      query: ({ projectId, artifactId }) => {
        const url = `/projects/${projectId}/probing/questions`;
        return artifactId ? `${url}?artifactId=${encodeURIComponent(artifactId)}` : url;
      },
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Probing', id: projectId },
      ],
    }),

    /* ---- Answer a question ---- */
    answerQuestion: builder.mutation<AnswerResponse, { projectId: string; artifactId: string; questionId: string; answer: string }>({
      query: ({ projectId, artifactId, questionId, answer }) => ({
        url: `/projects/${projectId}/probing/answer`,
        method: 'POST',
        body: { artifactId, questionId, answer },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Probing', id: projectId },
        { type: 'Pipeline', id: `${projectId}-confidence` },
      ],
    }),

    /* ---- Skip a question ---- */
    skipQuestion: builder.mutation<AnswerResponse, { projectId: string; artifactId: string; questionId: string; reason: string }>({
      query: ({ projectId, artifactId, questionId, reason }) => ({
        url: `/projects/${projectId}/probing/skip`,
        method: 'POST',
        body: { artifactId, questionId, reason },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Probing', id: projectId },
      ],
    }),
  }),
});

export const {
  useGetPipelineQuery,
  useEvaluateGateMutation,
  useOverrideGateMutation,
  useGetConfidenceQuery,
  useEvaluateArtifactConfidenceMutation,
  useGetGapsQuery,
  useStartProbingMutation,
  useGetProbingQuestionsQuery,
  useAnswerQuestionMutation,
  useSkipQuestionMutation,
} = pipelineApi;
