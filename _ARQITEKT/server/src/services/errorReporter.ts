/**
 * Lightweight error reporter — optionally forwards errors to external services.
 *
 * When SENTRY_DSN is set, captures errors via Sentry SDK (must be installed separately).
 * When ERROR_WEBHOOK_URL is set, posts error payloads to a webhook endpoint.
 * Otherwise, errors are only logged via pino (already handled by global handlers).
 *
 * Install Sentry SDK when needed: npm i @sentry/node
 */

import { createLogger } from './logger.js';

const log = createLogger('errorReporter');

let sentryModule: { captureException: (err: unknown) => void } | null = null;

async function initSentry(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    const sentryId = '@sentry/' + 'node';
    // Dynamic import — only resolves if @sentry/node is installed
    const Sentry = await import(sentryId) as any;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: 0.1,
    });
    sentryModule = Sentry;
    log.info('Sentry error tracking initialized');
  } catch {
    log.warn('SENTRY_DSN is set but @sentry/node is not installed. Run: npm i @sentry/node');
  }
}

/**
 * Report an error to configured external service(s).
 * Fire-and-forget — never throws.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (sentryModule) {
    try {
      sentryModule.captureException(error);
    } catch { /* swallow */ }
  }

  const webhookUrl = process.env.ERROR_WEBHOOK_URL;
  if (webhookUrl) {
    const payload = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
      context,
    };

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    }).catch(() => { /* swallow network errors */ });
  }
}

/**
 * Initialize error reporting. Call once at startup.
 */
export async function initErrorReporting(): Promise<void> {
  await initSentry();
}
