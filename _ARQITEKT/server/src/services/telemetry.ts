/**
 * LLM usage telemetry — in-memory ring buffer of recent LLM calls.
 * Tracks token counts, model, latency, and cost estimates.
 */

export interface UsageEntry {
  timestamp: number;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  streaming: boolean;
  projectId?: string;
}

export interface UsageSummary {
  totalCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  byModel: Record<string, { calls: number; tokens: number }>;
  recentEntries: UsageEntry[];
}

const MAX_ENTRIES = 500;
const entries: UsageEntry[] = [];

/**
 * Record a single LLM usage entry.
 */
export function recordUsage(entry: UsageEntry): void {
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
}

/**
 * Estimate token count from character length.
 * Rough heuristic: ~4 chars per token for English text.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get usage summary, optionally filtered by time window and/or project.
 * @param sinceMs - Only include entries after this timestamp (default: all)
 * @param projectId - Only include entries for this project (default: all)
 */
export function getUsageSummary(sinceMs?: number, projectId?: string): UsageSummary {
  let filtered = sinceMs
    ? entries.filter((e) => e.timestamp >= sinceMs)
    : entries;

  if (projectId) {
    filtered = filtered.filter((e) => e.projectId === projectId);
  }

  const byModel: Record<string, { calls: number; tokens: number }> = {};
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalLatency = 0;

  for (const e of filtered) {
    totalPrompt += e.promptTokens;
    totalCompletion += e.completionTokens;
    totalLatency += e.latencyMs;

    const bucket = byModel[e.model] ?? { calls: 0, tokens: 0 };
    bucket.calls += 1;
    bucket.tokens += e.totalTokens;
    byModel[e.model] = bucket;
  }

  return {
    totalCalls: filtered.length,
    totalPromptTokens: totalPrompt,
    totalCompletionTokens: totalCompletion,
    totalTokens: totalPrompt + totalCompletion,
    avgLatencyMs: filtered.length > 0 ? Math.round(totalLatency / filtered.length) : 0,
    byModel,
    recentEntries: filtered.slice(-20),
  };
}
