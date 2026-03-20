import { readFile } from 'fs/promises';
import { resolve } from 'path';
import yaml from 'js-yaml';
import { config } from '../config.js';
import type { ChatMessage } from '../types/project.js';
import { recordUsage, estimateTokens } from './telemetry.js';
import { createLogger } from './logger.js';

const log = createLogger('llm');

interface LLMProvider {
  provider: string;
  model: string;
  apiKey?: string;
  endpoint: string;
  temperature: number;
  maxTokens: number;
}

interface LLMYamlConfig {
  llm?: {
    provider?: string;
    endpoint?: string;
    model?: string;
    api_key_env?: string;
    temperature?: number;
    max_tokens?: number;
    fallback?: Array<{
      provider?: string;
      endpoint?: string;
      model?: string;
      api_key_env?: string;
    }>;
  };
}

let cachedConfig: LLMProvider[] | null = null;

/**
 * Load LLM provider chain from llm.yaml, falling back to env vars.
 */
async function loadProviderChain(): Promise<LLMProvider[]> {
  if (cachedConfig) return cachedConfig;

  const providers: LLMProvider[] = [];

  // Try loading llm.yaml
  try {
    const yamlPath = resolve(config.hubRoot, 'config', 'llm.yaml');
    const raw = await readFile(yamlPath, 'utf-8');
    const parsed = yaml.load(raw) as LLMYamlConfig;
    const llm = parsed?.llm;

    if (llm) {
      // Primary provider from yaml
      providers.push({
        provider: llm.provider || 'deepseek',
        model: llm.model || 'deepseek-chat',
        apiKey: llm.api_key_env ? process.env[llm.api_key_env] : undefined,
        endpoint: llm.endpoint || 'https://api.deepseek.com/v1/chat/completions',
        temperature: llm.temperature ?? 0.7,
        maxTokens: llm.max_tokens ?? 4096,
      });

      // Fallback providers from yaml
      if (llm.fallback) {
        for (const fb of llm.fallback) {
          providers.push({
            provider: fb.provider || 'openai',
            model: fb.model || 'gpt-4o',
            apiKey: fb.api_key_env ? process.env[fb.api_key_env] : undefined,
            endpoint: fb.endpoint || 'https://api.openai.com/v1/chat/completions',
            temperature: llm.temperature ?? 0.7,
            maxTokens: llm.max_tokens ?? 4096,
          });
        }
      }
    }
  } catch {
    // llm.yaml not found or malformed — fall through to env vars
  }

  // Fallback: env vars (backward compatible)
  if (providers.length === 0) {
    providers.push({
      provider: process.env.LLM_PROVIDER || 'github',
      model: process.env.LLM_MODEL || 'gpt-4o',
      apiKey: process.env.GITHUB_TOKEN,
      endpoint: process.env.LLM_ENDPOINT || 'https://models.inference.ai.azure.com/chat/completions',
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  cachedConfig = providers;
  return providers;
}

/**
 * Get LLM configuration (primary provider).
 */
export function getLLMConfig(): {
  provider: string;
  model: string;
  apiKey?: string;
  endpoint?: string;
} {
  // Synchronous fallback for code that calls this synchronously
  return {
    provider: process.env.LLM_PROVIDER || 'github',
    model: process.env.LLM_MODEL || 'gpt-4o',
    apiKey: process.env.GITHUB_TOKEN,
    endpoint: process.env.LLM_ENDPOINT || 'https://models.inference.ai.azure.com',
  };
}

/**
 * Send a chat request to a single provider.
 */
async function callProvider(
  provider: LLMProvider,
  messages: ChatMessage[],
  modelOverride?: string,
): Promise<{ content: string; model: string }> {
  const useModel = modelOverride || provider.model;

  if (!provider.apiKey) {
    throw new Error(`No API key for provider "${provider.provider}"`);
  }

  const startTime = Date.now();

  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: useModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: provider.maxTokens,
      temperature: provider.temperature,
    }),
    signal: AbortSignal.timeout(config.llmTimeout),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM ${provider.provider} failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    model: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };

  const latencyMs = Date.now() - startTime;
  const content = data.choices[0]?.message.content ?? '';
  const promptText = messages.map((m) => m.content).join('');

  recordUsage({
    timestamp: Date.now(),
    model: data.model ?? useModel,
    provider: provider.provider,
    promptTokens: data.usage?.prompt_tokens ?? estimateTokens(promptText),
    completionTokens: data.usage?.completion_tokens ?? estimateTokens(content),
    totalTokens: data.usage?.total_tokens ?? (estimateTokens(promptText) + estimateTokens(content)),
    latencyMs,
    streaming: false,
  });

  return {
    content,
    model: data.model,
  };
}

/**
 * Trim messages to fit within a token budget using a sliding window.
 * Keeps system messages and the most recent user/assistant messages.
 * Rough estimate: 1 token ~= 4 characters.
 */
function trimConversation(messages: ChatMessage[], maxTokens: number): ChatMessage[] {
  const budgetChars = maxTokens * 4;
  const system = messages.filter((m) => m.role === 'system');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  let systemChars = system.reduce((sum, m) => sum + m.content.length, 0);
  const available = budgetChars - systemChars;
  if (available <= 0) return system.slice(0, 1);

  // Keep as many recent messages as fit
  const kept: ChatMessage[] = [];
  let used = 0;
  for (let i = nonSystem.length - 1; i >= 0; i--) {
    const msg = nonSystem[i]!;
    const len = msg.content.length;
    if (used + len > available) break;
    kept.unshift(msg);
    used += len;
  }

  return [...system, ...kept];
}

/**
 * Send a chat message with automatic fallback through the provider chain.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  model?: string
): Promise<{ content: string; model: string }> {
  const chain = await loadProviderChain();
  const primary = chain[0];
  // Trim conversation to fit within the provider's max_tokens context budget
  const contextBudget = (primary?.maxTokens ?? 4096) * 2; // allow 2x max_tokens for context
  const trimmed = trimConversation(messages, contextBudget);
  let lastError: Error | null = null;

  for (const provider of chain) {
    try {
      return await callProvider(provider, trimmed, model);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      log.warn({ provider: provider.provider, err: lastError.message }, 'LLM provider failed, trying next');
    }
  }

  // All providers failed
  if (lastError) {
    throw lastError;
  }

  return {
    content: 'No LLM providers configured. Set ARQITEKT_LLM_KEY or GITHUB_TOKEN.',
    model: model || 'none',
  };
}

/**
 * Stream a chat request from a single provider using SSE (OpenAI-compatible streaming).
 * Yields delta content chunks as they arrive.
 */
async function* streamProvider(
  provider: LLMProvider,
  messages: ChatMessage[],
  modelOverride?: string,
): AsyncGenerator<{ delta: string; model: string; done: boolean }> {
  const useModel = modelOverride || provider.model;

  if (!provider.apiKey) {
    throw new Error(`No API key for provider "${provider.provider}"`);
  }

  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: useModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: provider.maxTokens,
      temperature: provider.temperature,
      stream: true,
    }),
    signal: AbortSignal.timeout(config.llmTimeout),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM ${provider.provider} failed (${response.status}): ${text}`);
  }

  if (!response.body) {
    throw new Error(`LLM ${provider.provider} returned no stream body`);
  }

  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of response.body as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') {
        yield { delta: '', model: useModel, done: true };
        return;
      }
      try {
        const parsed = JSON.parse(payload) as {
          choices: Array<{ delta: { content?: string } }>;
          model?: string;
        };
        const delta = parsed.choices[0]?.delta?.content ?? '';
        if (delta) {
          yield { delta, model: parsed.model ?? useModel, done: false };
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  yield { delta: '', model: useModel, done: true };
}

/**
 * Stream a chat response with automatic fallback through the provider chain.
 * Yields delta content chunks for SSE forwarding.
 */
export async function* streamChatMessage(
  messages: ChatMessage[],
  model?: string,
): AsyncGenerator<{ delta: string; model: string; done: boolean }> {
  const chain = await loadProviderChain();
  const primary = chain[0];
  const contextBudget = (primary?.maxTokens ?? 4096) * 2;
  const trimmed = trimConversation(messages, contextBudget);
  let lastError: Error | null = null;

  for (const provider of chain) {
    try {
      yield* streamProvider(provider, trimmed, model);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      log.warn({ provider: provider.provider, err: lastError.message }, 'LLM stream provider failed, trying next');
    }
  }

  if (lastError) {
    throw lastError;
  }
}

/** Invalidate cached config (e.g., after config reload). */
export function resetLLMConfig(): void {
  cachedConfig = null;
}

/**
 * List available AI models from GitHub Models API.
 * Requires a valid GitHub token — returns empty list if not connected.
 */
export async function listModels(): Promise<
  Array<{ id: string; name: string; provider: string; contextWindow: number; available: boolean }>
> {
  const { getGithubStatus } = await import('./github.js');
  const status = await getGithubStatus();

  if (!status.connected || !status.token) {
    return [];
  }

  try {
    const response = await fetch('https://models.inference.ai.azure.com/models', {
      headers: { Authorization: `Bearer ${status.token}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      log.warn(`GitHub Models API returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as Array<{
      id: string;
      name?: string;
      model_type?: string;
      context_window?: number;
    }>;

    return data
      .filter((m) => m.model_type === 'chat' || !m.model_type)
      .map((m) => ({
        id: m.id,
        name: m.name ?? m.id,
        provider: 'GitHub Models',
        contextWindow: m.context_window ?? 128_000,
        available: true,
      }));
  } catch (err) {
    log.warn({ err }, 'Failed to fetch models from GitHub Models API');
    return [];
  }
}
