import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { openTab } from '@/store/slices/editorSlice';
import { FileExplorer } from './FileExplorer';
import { EditorArea } from './EditorArea';
import { TerminalPanel } from './TerminalPanel';
import { FileQuickOpen } from '@/components/ui/FileQuickOpen';
import styles from './DevelopTab.module.css';

/* ------------------------------------------------------------------ */
/*  Language detection from file extension                             */
/* ------------------------------------------------------------------ */

const EXT_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescriptreact',
  js: 'javascript',
  jsx: 'javascriptreact',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'html',
  md: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  py: 'python',
  dart: 'dart',
  rs: 'rust',
  go: 'go',
  sh: 'shell',
  txt: 'plaintext',
};

function detectLanguage(filepath: string): string {
  const ext = filepath.split('.').pop()?.toLowerCase() ?? '';
  return EXT_LANG[ext] ?? 'plaintext';
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MIN_TERMINAL_HEIGHT = 80;
const MAX_TERMINAL_HEIGHT = 600;
const DEFAULT_TERMINAL_HEIGHT = 200;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DevelopTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();

  /* ---- File panel collapsed state ---- */
  const [filePanelOpen, _setFilePanelOpen] = useState(true);

  /* ---- Resizable terminal ---- */
  const [terminalHeight, setTerminalHeight] = useState(DEFAULT_TERMINAL_HEIGHT);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(DEFAULT_TERMINAL_HEIGHT);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startY.current = e.clientY;
      startHeight.current = terminalHeight;
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    },
    [terminalHeight],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const newHeight = Math.min(
        MAX_TERMINAL_HEIGHT,
        Math.max(MIN_TERMINAL_HEIGHT, startHeight.current + delta),
      );
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  /* ---- File selection handler ---- */
  const handleFileSelect = useCallback(
    (path: string) => {
      const filename = path.split('/').pop() ?? path.split('\\').pop() ?? path;
      const language = detectLanguage(filename);

      dispatch(
        openTab({
          id: path,
          path,
          name: filename,
          language,
          content: '',
          isDirty: false,
        }),
      );
    },
    [dispatch],
  );

  if (!projectId) return null;

  return (
    <div className={styles.tab}>
      {/* Ctrl+P quickopen */}
      <FileQuickOpen onSelect={handleFileSelect} />

      {/* Left: File Explorer */}
      {filePanelOpen && (
        <aside className={styles.filePanel}>
          <FileExplorer projectId={projectId} onFileSelect={handleFileSelect} />
        </aside>
      )}

      {/* Right: Editor + Terminal */}
      <div className={styles.mainArea}>
        {/* Editor */}
        <div className={styles.editorArea}>
          <EditorArea projectId={projectId} />
        </div>

        {/* Drag handle */}
        <div
          className={styles.dragHandle}
          onMouseDown={handleDragStart}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize terminal"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setTerminalHeight((h) =>
                Math.min(MAX_TERMINAL_HEIGHT, h + 20),
              );
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setTerminalHeight((h) =>
                Math.max(MIN_TERMINAL_HEIGHT, h - 20),
              );
            }
          }}
        />

        {/* Terminal */}
        <div
          className={styles.terminalArea}
          style={{ height: terminalHeight }}
        >
          <TerminalPanel projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
