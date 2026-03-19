import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChatConfig {
  defaultModel: string;
  availableModels: string[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatSendRequest {
  message: string;
  model?: string;
  context?: ChatContext;
}

export interface ChatContext {
  projectId?: string;
  filePath?: string;
  selection?: string;
}

export interface ChatSendResponse {
  id: string;
  role: 'assistant';
  content: string;
  model: string;
  timestamp: number;
  usage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  available: boolean;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatConfig: builder.query<ChatConfig, void>({
      query: () => '/chat/config',
    }),

    sendMessage: builder.mutation<ChatSendResponse, ChatSendRequest>({
      query: (body) => ({
        url: '/chat/send',
        method: 'POST',
        body,
      }),
    }),

    getModels: builder.query<AIModel[], void>({
      query: () => '/chat/models',
    }),
  }),
});

export const {
  useGetChatConfigQuery,
  useSendMessageMutation,
  useGetModelsQuery,
} = chatApi;
