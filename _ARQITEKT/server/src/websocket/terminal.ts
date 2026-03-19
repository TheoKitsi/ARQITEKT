import type { WebSocket } from 'ws';
import * as pty from 'node-pty';
import { platform } from 'os';

/* ------------------------------------------------------------------ */
/*  Per-client PTY sessions                                            */
/* ------------------------------------------------------------------ */

interface PtySession {
  pty: pty.IPty;
  cwd: string;
  createdAt: number;
}

const sessions = new Map<WebSocket, PtySession>();

const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours

/** Periodically clean up stale/orphaned sessions */
setInterval(() => {
  const now = Date.now();
  for (const [ws, session] of sessions) {
    if (ws.readyState > 1 || now - session.createdAt > SESSION_TIMEOUT_MS) {
      session.pty.kill();
      sessions.delete(ws);
    }
  }
}, 60_000);

/**
 * Spawn a new PTY for a WebSocket client.
 * On Windows uses powershell.exe, on Unix uses the user's shell.
 */
export function createTerminalSession(
  ws: WebSocket,
  cwd: string,
  cols = 80,
  rows = 24,
): void {
  // Don't create duplicate sessions
  if (sessions.has(ws)) {
    ws.send(JSON.stringify({ type: 'terminal:error', payload: 'Session already active' }));
    return;
  }

  const shell = platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: { ...process.env } as Record<string, string>,
  });

  ptyProcess.onData((data: string) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'terminal:output', payload: data }));
    }
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    sessions.delete(ws);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'terminal:exit',
        payload: { exitCode, signal },
      }));
    }
  });

  sessions.set(ws, { pty: ptyProcess, cwd, createdAt: Date.now() });

  ws.send(JSON.stringify({
    type: 'terminal:ready',
    payload: { pid: ptyProcess.pid, cols, rows },
  }));
}

/**
 * Write data from the client into the PTY stdin.
 */
export function writeTerminalInput(ws: WebSocket, data: string): void {
  const session = sessions.get(ws);
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
  const session = sessions.get(ws);
  if (!session) return;
  session.pty.resize(cols, rows);
}

/**
 * Kill the PTY for a specific WebSocket client.
 */
export function destroyTerminalSession(ws: WebSocket): void {
  const session = sessions.get(ws);
  if (!session) return;
  session.pty.kill();
  sessions.delete(ws);
}

/**
 * Kill all active PTY sessions (called on server shutdown).
 */
export function destroyAllTerminals(): void {
  for (const [ws, session] of sessions) {
    session.pty.kill();
    sessions.delete(ws);
  }
}
