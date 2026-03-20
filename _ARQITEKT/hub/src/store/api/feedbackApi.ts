import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Feedback {
  id: string;
  projectId: string;
  nodeId?: string;
  author: string;
  content: string;
  status: FeedbackStatus;
  title?: string;
  severity?: string;
  source?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export type FeedbackStatus = 'open' | 'resolved' | 'dismissed';

export interface CreateFeedbackRequest {
  projectId: string;
  nodeId?: string;
  author?: string;
  content: string;
}

export interface DeleteFeedbackRequest {
  projectId: string;
  fbkId: string;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedback: builder.query<Feedback[], string>({
      query: (projectId) => `/projects/${projectId}/feedback`,
      transformResponse: (response: { items: Feedback[] }) => response.items ?? [],
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Feedback' as const, id })),
              { type: 'Feedback', id: `${projectId}-LIST` },
            ]
          : [{ type: 'Feedback', id: `${projectId}-LIST` }],
    }),

    createFeedback: builder.mutation<Feedback, CreateFeedbackRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/feedback`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Feedback', id: `${projectId}-LIST` },
      ],
    }),

    deleteFeedback: builder.mutation<void, DeleteFeedbackRequest>({
      query: ({ projectId, fbkId }) => ({
        url: `/projects/${projectId}/feedback/${fbkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId, fbkId }) => [
        { type: 'Feedback', id: fbkId },
        { type: 'Feedback', id: `${projectId}-LIST` },
      ],
    }),
  }),
});

export const {
  useGetFeedbackQuery,
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
