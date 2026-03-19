/**
 * Client-side error reporting — forwards unhandled errors to the server.
 * Silent no-op when the server is unreachable.
 */

const REPORT_ENDPOINT = '/api/hub/error-report';

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(REPORT_ENDPOINT, body);
    } else {
      fetch(REPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* swallow */ }
}

export function initClientErrorReporting(): void {
  window.addEventListener('error', (event) => {
    send({
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: location.href,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    send({
      type: 'unhandledrejection',
      reason: event.reason instanceof Error
        ? { message: event.reason.message, stack: event.reason.stack }
        : String(event.reason),
      timestamp: new Date().toISOString(),
      url: location.href,
    });
  });
}
