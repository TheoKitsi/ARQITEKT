import { readFile } from 'fs/promises';
import { resolve } from 'path';
import yaml from 'js-yaml';
import { config } from '../config.js';
import type { ChatMessage } from '../types/project.js';

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
  };

  return {
    content: data.choices[0]?.message.content ?? '',
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
      console.error(`LLM provider "${provider.provider}" failed, trying next...`, lastError.message);
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

/** Invalidate cached config (e.g., after config reload). */
export function resetLLMConfig(): void {
  cachedConfig = null;
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
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
  ];
}
