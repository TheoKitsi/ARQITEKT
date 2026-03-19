import { createAsyncThunk } from '@reduxjs/toolkit';
import { addMessage, updateMessage, setLoading } from '../slices/chatSlice';

interface StreamChatArgs {
  message: string;
  model?: string;
  context?: string;
}

/**
 * Async thunk that streams LLM responses via SSE (POST /api/chat/stream).
 * Creates an assistant message placeholder and appends delta chunks as they arrive.
 */
export const streamChat = createAsyncThunk<void, StreamChatArgs>(
  'chat/stream',
  async ({ message, model, context }, { dispatch, signal }) => {
    const msgId = `msg-${Date.now()}`;

    // Add placeholder assistant message
    dispatch(addMessage({ id: msgId, role: 'assistant', content: '', timestamp: Date.now() }));
    dispatch(setLoading(true));

    let accumulated = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, model, context }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Stream request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const payload = JSON.parse(trimmed.slice(6)) as {
              delta?: string;
              error?: string;
              done: boolean;
            };

            if (payload.error) {
              accumulated += `\n[Error: ${payload.error}]`;
              dispatch(updateMessage({ id: msgId, content: accumulated }));
              return;
            }

            if (payload.delta) {
              accumulated += payload.delta;
              dispatch(updateMessage({ id: msgId, content: accumulated }));
            }

            if (payload.done) return;
          } catch {
            // Skip malformed SSE data
          }
        }
      }
    } finally {
      dispatch(setLoading(false));
    }
  },
);
