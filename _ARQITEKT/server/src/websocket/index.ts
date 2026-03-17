import type { WebSocketServer, WebSocket } from 'ws';
import { join } from 'path';
import { config } from '../config.js';
import {
  createTerminalSession,
  writeTerminalInput,
  resizeTerminal,
  destroyTerminalSession,
  destroyAllTerminals,
} from './terminal.js';

/* ------------------------------------------------------------------ */
/*  Message protocol                                                   */
/* ------------------------------------------------------------------ */

interface WSMessage {
  type: string;
  payload?: unknown;
}

interface TerminalStartPayload {
  projectId?: string;
  cols?: number;
  rows?: number;
}

interface TerminalResizePayload {
  cols: number;
  rows: number;
}

/* ------------------------------------------------------------------ */
/*  WebSocket server setup                                             */
/* ------------------------------------------------------------------ */

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (raw: Buffer) => {
      try {
        const message = JSON.parse(raw.toString()) as WSMessage;
        handleMessage(ws, message);
      } catch {
        ws.send(JSON.stringify({ type: 'error', payload: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      destroyTerminalSession(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', payload: { version: '2.0.0' } }));
  });
}

/* ------------------------------------------------------------------ */
/*  Message handler                                                    */
/* ------------------------------------------------------------------ */

function handleMessage(ws: WebSocket, message: WSMessage): void {
  switch (message.type) {
    case 'terminal:start': {
      const p = (message.payload ?? {}) as TerminalStartPayload;
      const cwd = p.projectId
        ? join(config.workspaceRoot, p.projectId)
        : config.workspaceRoot;
      createTerminalSession(ws, cwd, p.cols ?? 80, p.rows ?? 24);
      break;
    }

    case 'terminal:input': {
      const data = typeof message.payload === 'string' ? message.payload : '';
      writeTerminalInput(ws, data);
      break;
    }

    case 'terminal:resize': {
      const r = (message.payload ?? {}) as TerminalResizePayload;
      if (r.cols && r.rows) {
        resizeTerminal(ws, r.cols, r.rows);
      }
      break;
    }

    case 'terminal:stop':
      destroyTerminalSession(ws);
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        payload: `Unknown message type: ${message.type}`,
      }));
  }
}

/**
 * Shutdown helper — kill all PTYs when the server exits.
 */
export { destroyAllTerminals };
