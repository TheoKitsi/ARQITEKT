import { Suspense, lazy, useCallback, useRef, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import styles from './MonacoWrapper.module.css';

/* ------------------------------------------------------------------ */
/*  Lazy-loaded Monaco editor                                          */
/* ------------------------------------------------------------------ */

const Editor = lazy(() => import('@monaco-editor/react'));

/* ------------------------------------------------------------------ */
/*  Custom ARQITEKT theme                                              */
/* ------------------------------------------------------------------ */

const arqitektTheme: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editor.lineHighlightBackground': '#161b22',
    'editor.selectionBackground': '#264f78',
    'editorCursor.foreground': '#FFD700',
    'editorLineNumber.foreground': '#6e7681',
    'editorLineNumber.activeForeground': '#e6edf3',
  },
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MonacoWrapperProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MonacoWrapper({
  value,
  language,
  onChange,
  readOnly = false,
}: MonacoWrapperProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [showMinimap, setShowMinimap] = useState(window.innerWidth >= 800);

  /* ---- Resize listener for minimap toggle ---- */
  useEffect(() => {
    const handleResize = () => {
      const shouldShow = window.innerWidth >= 800;
      setShowMinimap(shouldShow);
      editorRef.current?.updateOptions({
        minimap: { enabled: shouldShow },
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---- Editor mount handler ---- */
  const handleMount: OnMount = useCallback((editor, monaco) => {
    monaco.editor.defineTheme('arqitekt', arqitektTheme);
    monaco.editor.setTheme('arqitekt');
    editorRef.current = editor;
    editor.focus();
  }, []);

  /* ---- Change handler ---- */
  const handleChange = useCallback(
    (val: string | undefined) => {
      if (onChange && val !== undefined) {
        onChange(val);
      }
    },
    [onChange],
  );

  return (
    <div className={styles.wrapper}>
      <Suspense
        fallback={
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        }
      >
        <Editor
          height="100%"
          language={language}
          value={value}
          theme="arqitekt"
          onChange={handleChange}
          onMount={handleMount}
          options={{
            readOnly,
            wordWrap: 'on',
            fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
            fontSize: 14,
            minimap: { enabled: showMinimap },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 8, bottom: 8 },
            lineNumbers: 'on',
            folding: true,
            automaticLayout: true,
          }}
        />
      </Suspense>
    </div>
  );
}
