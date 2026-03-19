import type { WebSocket } from 'ws';
import * as pty from 'node-pty';
import { platform } from 'os';
import { randomBytes } from 'crypto';

/* ------------------------------------------------------------------ */
/*  Per-client PTY sessions                                            */
/* ------------------------------------------------------------------ */

interface PtySession {
  pty: pty.IPty;
  cwd: string;
  createdAt: number;
  sessionId: string;
  ws: WebSocket | null;
  scrollback: string[];
}

/** Max scrollback lines kept for reconnection replay */
const MAX_SCROLLBACK = 200;

/** Session keyed by sessionId — survives WebSocket disconnection */
const sessionsById = new Map<string, PtySession>();

/** Reverse lookup: WebSocket → sessionId */
const wsSessions = new Map<WebSocket, string>();

const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours
const ORPHAN_GRACE_MS = 5 * 60 * 1000; // 5 min grace period for reconnection

/** Track when each session was orphaned (ws disconnected) */
const orphanedAt = new Map<string, number>();

/** Periodically clean up stale/orphaned sessions */
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessionsById) {
    const isOrphaned = orphanedAt.has(id);
    const orphanExpired = isOrphaned && now - (orphanedAt.get(id) ?? 0) > ORPHAN_GRACE_MS;
    const aged = now - session.createdAt > SESSION_TIMEOUT_MS;
    const wsClosed = session.ws !== null && session.ws.readyState > 1;

    if (aged || orphanExpired) {
      session.pty.kill();
      sessionsById.delete(id);
      orphanedAt.delete(id);
      if (session.ws) wsSessions.delete(session.ws);
    } else if (wsClosed) {
      // WS dropped — mark orphaned but keep PTY alive for reconnection
      if (session.ws) wsSessions.delete(session.ws);
      session.ws = null;
      if (!orphanedAt.has(id)) orphanedAt.set(id, now);
    }
  }
}, 60_000);

/**
 * Spawn a new PTY for a WebSocket client.
 * Returns a sessionId that can be used to reattach.
 */
export function createTerminalSession(
  ws: WebSocket,
  cwd: string,
  cols = 80,
  rows = 24,
): string {
  // Don't create duplicate sessions per WS
  if (wsSessions.has(ws)) {
    ws.send(JSON.stringify({ type: 'terminal:error', payload: 'Session already active' }));
    return wsSessions.get(ws)!;
  }

  const sessionId = randomBytes(16).toString('hex');
  const shell = platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: { ...process.env } as Record<string, string>,
  });

  const session: PtySession = {
    pty: ptyProcess,
    cwd,
    createdAt: Date.now(),
    sessionId,
    ws,
    scrollback: [],
  };

  ptyProcess.onData((data: string) => {
    // Always buffer scrollback for reconnection
    session.scrollback.push(data);
    if (session.scrollback.length > MAX_SCROLLBACK) {
      session.scrollback.shift();
    }
    if (session.ws && session.ws.readyState === 1 /* OPEN */) {
      session.ws.send(JSON.stringify({ type: 'terminal:output', payload: data }));
    }
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    if (session.ws && session.ws.readyState === 1) {
      session.ws.send(JSON.stringify({
        type: 'terminal:exit',
        payload: { exitCode, signal },
      }));
    }
    if (session.ws) wsSessions.delete(session.ws);
    sessionsById.delete(sessionId);
    orphanedAt.delete(sessionId);
  });

  sessionsById.set(sessionId, session);
  wsSessions.set(ws, sessionId);

  ws.send(JSON.stringify({
    type: 'terminal:ready',
    payload: { pid: ptyProcess.pid, cols, rows, sessionId },
  }));

  return sessionId;
}

/**
 * Reattach a WebSocket to an existing PTY session.
 * Replays buffered scrollback so the user sees recent output.
 */
export function reattachTerminalSession(
  ws: WebSocket,
  sessionId: string,
  cols?: number,
  rows?: number,
): boolean {
  const session = sessionsById.get(sessionId);
  if (!session) return false;

  // Detach old WS if still tracked
  if (session.ws) wsSessions.delete(session.ws);

  // Attach new WS
  session.ws = ws;
  wsSessions.set(ws, sessionId);
  orphanedAt.delete(sessionId);

  // Resize if dimensions changed
  if (cols && rows) {
    try { session.pty.resize(cols, rows); } catch { /* ignore */ }
  }

  // Replay scrollback
  if (session.scrollback.length > 0) {
    ws.send(JSON.stringify({
      type: 'terminal:replay',
      payload: session.scrollback.join(''),
    }));
  }

  ws.send(JSON.stringify({
    type: 'terminal:ready',
    payload: { pid: session.pty.pid, cols: cols ?? 80, rows: rows ?? 24, sessionId, reconnected: true },
  }));

  return true;
}

/**
 * Write data from the client into the PTY stdin.
 */
export function writeTerminalInput(ws: WebSocket, data: string): void {
  const sessionId = wsSessions.get(ws);
  const session = sessionId ? sessionsById.get(sessionId) : undefined;
  if (!session) {
    ws.send(JSON.stringify({ type: 'terminal:error', payload: 'No active terminal session' }));
    return;
  }
  session.pty.write(data);
}

/**
 * Resize the PTY.
 */
export function resizeTerminal(ws: WebSocket, cols: number, rows: number): void {
  const sessionId = wsSessions.get(ws);
  const session = sessionId ? sessionsById.get(sessionId) : undefined;
  if (!session) return;
  session.pty.resize(cols, rows);
}

/**
 * Detach WebSocket from session without killing PTY (for reconnection).
 */
export function detachTerminalSession(ws: WebSocket): void {
  const sessionId = wsSessions.get(ws);
  if (!sessionId) return;
  const session = sessionsById.get(sessionId);
  if (session) {
    session.ws = null;
    orphanedAt.set(sessionId, Date.now());
  }
  wsSessions.delete(ws);
}

/**
 * Kill the PTY for a specific WebSocket client.
 */
export function destroyTerminalSession(ws: WebSocket): void {
  const sessionId = wsSessions.get(ws);
  if (!sessionId) return;
  const session = sessionsById.get(sessionId);
  if (session) {
    session.pty.kill();
    sessionsById.delete(sessionId);
    orphanedAt.delete(sessionId);
  }
  wsSessions.delete(ws);
}

/**
 * Kill all active PTY sessions (called on server shutdown).
 */
export function destroyAllTerminals(): void {
  for (const [id, session] of sessionsById) {
    session.pty.kill();
    sessionsById.delete(id);
  }
  wsSessions.clear();
  orphanedAt.clear();
}
