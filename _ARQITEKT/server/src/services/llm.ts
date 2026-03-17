import type { ChatMessage } from '../types/project.js';

interface LLMConfig {
  provider: 'github' | 'openai' | 'local';
  model: string;
  apiKey?: string;
  endpoint?: string;
}

/**
 * Get LLM configuration from environment or stored settings.
 */
export function getLLMConfig(): LLMConfig {
  return {
    provider: (process.env.LLM_PROVIDER as LLMConfig['provider']) || 'github',
    model: process.env.LLM_MODEL || 'gpt-4o',
    apiKey: process.env.GITHUB_TOKEN,
    endpoint: process.env.LLM_ENDPOINT || 'https://models.inference.ai.azure.com',
  };
}

/**
 * Send a chat message to the LLM provider.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  model?: string
): Promise<{ content: string; model: string }> {
  const cfg = getLLMConfig();
  const useModel = model || cfg.model;

  if (!cfg.apiKey) {
    return {
      content: 'No API key configured. Connect GitHub to enable AI features.',
      model: useModel,
    };
  }

  const response = await fetch(`${cfg.endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: useModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    model: string;
  };

  return {
    content: data.choices[0]?.message.content ?? '',
    model: data.model,
  };
}

/**
 * List available AI models.
 */
export async function listModels(): Promise<
  Array<{ id: string; name: string; provider: string }>
> {
  return [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'GitHub Models' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'GitHub Models' },
    { id: 'o3-mini', name: 'o3-mini', provider: 'GitHub Models' },
    { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'GitHub Models' },
    { id: 'DeepSeek-R1', name: 'DeepSeek R1', provider: 'GitHub Models' },
  ];
}
