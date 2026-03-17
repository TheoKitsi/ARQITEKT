import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Code2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateContent, markSaved } from '@/store/slices/editorSlice';
import { useReadFileQuery, useWriteFileMutation } from '@/store/api/filesApi';
import { Spinner } from '@/components/ui/Spinner';
import { EditorTabs } from './EditorTabs';
import { MonacoWrapper } from './MonacoWrapper';
import styles from './EditorArea.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EditorAreaProps {
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EditorArea({ projectId }: EditorAreaProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const openTabs = useAppSelector((s) => s.editor.openTabs);
  const activeTabId = useAppSelector((s) => s.editor.activeTabId);
  const activeTab = openTabs.find((tab) => tab.id === activeTabId) ?? null;

  /* ---- Fetch file content for active tab ---- */
  const {
    data: fileData,
    isLoading,
  } = useReadFileQuery(
    { projectId, path: activeTab?.path ?? '' },
    { skip: !activeTab },
  );

  /* ---- Write file mutation ---- */
  const [writeFile] = useWriteFileMutation();

  /* ---- Handle content change in editor ---- */
  const handleChange = useCallback(
    (value: string) => {
      if (activeTab) {
        dispatch(updateContent({ id: activeTab.id, content: value }));
      }
    },
    [dispatch, activeTab],
  );

  /* ---- Ctrl+S save handler ---- */
  const handleSave = useCallback(async () => {
    if (!activeTab || !activeTab.isDirty) return;
    try {
      await writeFile({
        projectId,
        path: activeTab.path,
        content: activeTab.content,
      }).unwrap();
      dispatch(markSaved(activeTab.id));
    } catch {
      // Error handled by RTK Query global error handler
    }
  }, [activeTab, projectId, writeFile, dispatch]);

  /* ---- Register keyboard shortcut ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  /* ---- Empty state ---- */
  if (openTabs.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <Code2 size={48} strokeWidth={1} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{t('editorTitle')}</p>
          <p className={styles.emptySub}>{t('editorSub')}</p>
          <p className={styles.emptyHint}>{t('editorAiHint')}</p>
        </div>
      </div>
    );
  }

  /* ---- Determine content to show ---- */
  const editorContent = activeTab?.isDirty
    ? activeTab.content
    : (fileData?.content ?? activeTab?.content ?? '');

  return (
    <div className={styles.container}>
      <EditorTabs />
      <div className={styles.editorBody}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner size="md" />
          </div>
        ) : activeTab ? (
          <MonacoWrapper
            value={editorContent}
            language={activeTab.language}
            onChange={handleChange}
          />
        ) : null}
      </div>
    </div>
  );
}
