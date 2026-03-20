import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AnthropicStatus {
  connected: boolean;
}

export interface AnthropicConnectRequest {
  apiKey: string;
}

export interface AnthropicConnectResponse {
  connected: boolean;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const anthropicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnthropicStatus: builder.query<AnthropicStatus, void>({
      query: () => '/anthropic/status',
      providesTags: ['Anthropic'],
    }),

    connectAnthropic: builder.mutation<AnthropicConnectResponse, AnthropicConnectRequest>(
      {
        query: (body) => ({
          url: '/anthropic/connect',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Anthropic'],
      },
    ),

    disconnectAnthropic: builder.mutation<void, void>({
      query: () => ({
        url: '/anthropic/disconnect',
        method: 'POST',
      }),
      invalidatesTags: ['Anthropic'],
    }),
  }),
});

export const {
  useGetAnthropicStatusQuery,
  useConnectAnthropicMutation,
  useDisconnectAnthropicMutation,
} = anthropicApi;
