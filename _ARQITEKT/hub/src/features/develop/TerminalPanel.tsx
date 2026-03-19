import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal as TerminalIcon, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import styles from './TerminalPanel.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TerminalPanelProps {
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Terminal theme                                                     */
/* ------------------------------------------------------------------ */

const termTheme = {
  background: '#0d1117',
  foreground: '#e6edf3',
  cursor: '#FFD700',
  cursorAccent: '#0d1117',
  selectionBackground: '#264f78',
  black: '#0d1117',
  red: '#f85149',
  green: '#56d364',
  yellow: '#e3b341',
  blue: '#58a6ff',
  magenta: '#bc8cff',
  cyan: '#76e3ea',
  white: '#e6edf3',
  brightBlack: '#6e7681',
  brightRed: '#ffa198',
  brightGreen: '#7ee787',
  brightYellow: '#ffd33d',
  brightBlue: '#79c0ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#a5d6ff',
  brightWhite: '#ffffff',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TerminalPanel({ projectId }: TerminalPanelProps) {
  const { t } = useTranslation();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  /* ---- Initialize terminal and WebSocket ---- */
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: termTheme,
      fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    // Fit after a short delay to let the DOM settle
    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch {
        // Terminal might not be visible yet
      }
    });

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    /* ---- WebSocket connection ---- */
    let ws: WebSocket | null = null;
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
      ws = new WebSocket(`${wsProtocol}//${wsHost}/ws`);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        // Start a PTY session on the server
        ws?.send(
          JSON.stringify({
            type: 'terminal:start',
            payload: {
              projectId,
              cols: term.cols,
              rows: term.rows,
            },
          }),
        );
      });

      ws.addEventListener('message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'terminal:output':
              if (typeof msg.payload === 'string') {
                term.write(msg.payload);
              }
              break;
            case 'terminal:ready':
              term.writeln(
                `\x1b[32m[Terminal] Connected (PID: ${msg.payload?.pid})\x1b[0m`,
              );
              break;
            case 'terminal:exit':
              term.writeln(
                `\r\n\x1b[90m[Terminal] Process exited (code: ${msg.payload?.exitCode})\x1b[0m`,
              );
              break;
            case 'terminal:error':
              term.writeln(
                `\r\n\x1b[31m[Terminal] ${msg.payload}\x1b[0m`,
              );
              break;
            case 'connected':
              // Initial connection handshake — wait for terminal:ready
              break;
          }
        } catch {
          // Non-JSON message, write raw
          if (typeof event.data === 'string') {
            term.write(event.data);
          }
        }
      });

      ws.addEventListener('error', () => {
        term.writeln(
          '\r\n\x1b[33m[Terminal] Connection error. Server may not be running.\x1b[0m',
        );
      });

      ws.addEventListener('close', () => {
        term.writeln(
          '\r\n\x1b[90m[Terminal] Disconnected.\x1b[0m',
        );
      });
    } catch {
      term.writeln(
        '\r\n\x1b[33m[Terminal] Failed to connect to WebSocket.\x1b[0m',
      );
    }

    /* ---- Send user input to server ---- */
    const onDataDisposable = term.onData((data: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'terminal:input',
            payload: data,
          }),
        );
      }
    });

    /* ---- Resize handling ---- */
    const handleResize = () => {
      try {
        fitAddon.fit();
        // Notify server of new terminal dimensions
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'terminal:resize',
              payload: { cols: term.cols, rows: term.rows },
            }),
          );
        }
      } catch {
        // ignore
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(terminalRef.current);
    window.addEventListener('resize', handleResize);

    /* ---- Cleanup ---- */
    return () => {
      onDataDisposable.dispose();
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'terminal:stop' }));
      }
      ws?.close();
      wsRef.current = null;
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [projectId]);

  /* ---- Run button handler ---- */
  const handleRun = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'terminal:input',
          payload: 'npm start\r',
        }),
      );
    }
  }, []);

  /* ---- Clear terminal ---- */
  const handleClear = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <TerminalIcon size={14} />
          <span className={styles.title}>{t('terminalTitle')}</span>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="text"
            size="sm"
            icon={<Play size={12} />}
            onClick={handleRun}
          >
            {t('termRun')}
          </Button>
          <Button
            variant="text"
            size="sm"
            icon={<Trash2 size={12} />}
            onClick={handleClear}
          >
            {t('termClear')}
          </Button>
        </div>
      </div>

      {/* Terminal area */}
      <div className={styles.terminalContainer} ref={terminalRef} />
    </div>
  );
}
