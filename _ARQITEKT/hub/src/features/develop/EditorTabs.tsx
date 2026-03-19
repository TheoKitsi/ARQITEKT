import { useCallback, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setActiveTab,
  closeTab,
  type EditorTab,
} from '@/store/slices/editorSlice';
import styles from './EditorTabs.module.css';

/* ------------------------------------------------------------------ */
/*  File-extension to icon mapping                                     */
/* ------------------------------------------------------------------ */

const EXT_ICONS: Record<string, string> = {
  ts: 'TS',
  tsx: 'TX',
  js: 'JS',
  jsx: 'JX',
  css: 'CS',
  html: 'HT',
  json: 'JN',
  yaml: 'YA',
  yml: 'YA',
  md: 'MD',
  py: 'PY',
  dart: 'DA',
  rs: 'RS',
  go: 'GO',
};

function getExtIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_ICONS[ext] ?? '##';
}

function getExtClass(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['ts', 'tsx'].includes(ext)) return styles.extTs ?? '';
  if (['js', 'jsx'].includes(ext)) return styles.extJs ?? '';
  if (['css'].includes(ext)) return styles.extCss ?? '';
  if (['json', 'yaml', 'yml'].includes(ext)) return styles.extData ?? '';
  if (['html'].includes(ext)) return styles.extHtml ?? '';
  return styles.extDefault ?? '';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EditorTabs() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const openTabs = useAppSelector((s) => s.editor.openTabs);
  const activeTabId = useAppSelector((s) => s.editor.activeTabId);

  const handleActivate = useCallback(
    (id: string) => {
      dispatch(setActiveTab(id));
    },
    [dispatch],
  );

  const handleClose = useCallback(
    (e: MouseEvent, id: string) => {
      e.stopPropagation();
      dispatch(closeTab(id));
    },
    [dispatch],
  );

  const handleMiddleClick = useCallback(
    (e: MouseEvent, id: string) => {
      if (e.button === 1) {
        e.preventDefault();
        dispatch(closeTab(id));
      }
    },
    [dispatch],
  );

  if (openTabs.length === 0) return null;

  return (
    <div className={styles.tabBar} role="tablist" aria-label={t('editorTitle')}>
      {openTabs.map((tab: EditorTab) => {
        const isActive = tab.id === activeTabId;
        const filename = tab.name || tab.path.split('/').pop() || tab.path;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => handleActivate(tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
            title={tab.path}
          >
            <span className={`${styles.fileIcon} ${getExtClass(filename)}`}>
              {getExtIcon(filename)}
            </span>
            <span className={styles.filename}>{filename}</span>
            {tab.isDirty && (
              <span className={styles.modified} aria-label={t('unsavedChanges')}>
                &bull;
              </span>
            )}
            <span
              className={styles.closeBtn}
              role="button"
              tabIndex={-1}
              aria-label={`${t('close')} ${filename}`}
              onClick={(e) => handleClose(e, tab.id)}
            >
              <X size={12} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
