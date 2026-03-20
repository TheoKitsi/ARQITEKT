import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { TreeNode, RequirementStatus } from '@/store/api/requirementsApi';
import {
  useGetArtifactContentQuery,
  useUpdateContentMutation,
  useSetStatusMutation,
} from '@/store/api/requirementsApi';
import { useGetConfidenceQuery } from '@/store/api/pipelineApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { Spinner } from '@/components/ui/Spinner';
import styles from './RequirementDialog.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RequirementDialogProps {
  node: TreeNode | null;
  projectId: string;
  onClose: () => void;
  onProbe?: (artifactId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: { value: RequirementStatus; labelKey: string }[] = [
  { value: 'idea', labelKey: 'statusIdea' },
  { value: 'draft', labelKey: 'statusDraft' },
  { value: 'review', labelKey: 'statusReview' },
  { value: 'approved', labelKey: 'statusApproved' },
  { value: 'implemented', labelKey: 'statusImplemented' },
];

const TYPE_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'gold' | 'error'> = {
  BC: 'gold', SOL: 'info', US: 'success', CMP: 'warning',
  FN: 'default', CONV: 'default', INF: 'default', ADR: 'default',
  NTF: 'default', FBK: 'error',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RequirementDialog({
  node,
  projectId,
  onClose,
  onProbe,
}: RequirementDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = node !== null;

  /* ---- Data hooks ---- */
  const { data: content, isLoading: contentLoading } = useGetArtifactContentQuery(
    { projectId, artifactId: node?.id ?? '' },
    { skip: !node },
  );
  const { data: confidenceData } = useGetConfidenceQuery(projectId, { skip: !node });
  const [updateContent, { isLoading: isSaving }] = useUpdateContentMutation();
  const [setStatus] = useSetStatusMutation();

  /* ---- Local editor state ---- */
  const [editorValue, setEditorValue] = useState('');
  const [dirty, setDirty] = useState(false);

  /* ---- Sync remote content → local ---- */
  useEffect(() => {
    if (content?.body != null) {
      setEditorValue(content.body);
      setDirty(false);
    }
  }, [content]);

  /* ---- Dialog open/close ---- */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  /* ---- Confidence for this node ---- */
  const nodeConfidence = node
    ? confidenceData?.scores?.find((s) => s.artifactId === node.id)
    : undefined;

  /* ---- Handlers ---- */
  const handleEditorChange = useCallback((val: string | undefined) => {
    setEditorValue(val ?? '');
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!node) return;
    await updateContent({
      projectId,
      artifactId: node.id,
      content: editorValue,
    });
    setDirty(false);
  }, [node, projectId, editorValue, updateContent]);

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!node) return;
      setStatus({
        projectId,
        nodeId: node.id,
        status: e.target.value as RequirementStatus,
      });
    },
    [node, projectId, setStatus],
  );

  const handleCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      onClose();
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  if (!node) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="req-dialog-title"
    >
      <div className={styles.panel}>
        {/* ---- Header ---- */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Badge variant={TYPE_VARIANT[node.type] ?? 'default'}>{node.type}</Badge>
            <span className={styles.headerId}>{node.id}</span>
            <ConfidenceBadge
              score={nodeConfidence?.overall ?? null}
              breakdown={nodeConfidence ? {
                structural: nodeConfidence.structural,
                semantic: nodeConfidence.semantic,
                consistency: nodeConfidence.consistency,
                boundary: nodeConfidence.boundary,
              } : undefined}
              onClick={onProbe ? () => onProbe(node.id) : undefined}
            />
            {dirty && <span className={styles.unsaved}>{t('unsavedChanges')}</span>}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('close')}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Title ---- */}
        <h2 id="req-dialog-title" className={styles.title}>{node.title}</h2>

        {/* ---- Status ---- */}
        <div className={styles.statusBar}>
          <Select
            label={t('modeLabel')}
            selectSize="sm"
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            value={node.status}
            onChange={handleStatusChange}
          />
          <span className={styles.childCount}>
            {node.children.length} {t('detailChildren')}
          </span>
        </div>

        {/* ---- Editor ---- */}
        <div className={styles.editorWrap}>
          {contentLoading ? (
            <div className={styles.editorCenter}><Spinner size="sm" /></div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="markdown"
              theme="vs-dark"
              value={editorValue}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'off',
                fontSize: 13,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'none',
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
              }}
            />
          )}
        </div>

        {/* ---- Footer ---- */}
        <footer className={styles.footer}>
          {onProbe && (
            <Button
              variant="gold"
              size="sm"
              icon={<Sparkles size={14} />}
              onClick={() => onProbe(node.id)}
            >
              {t('probe')}
            </Button>
          )}
          <div className={styles.footerRight}>
            <Button variant="outlined" size="sm" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              variant="gold"
              size="sm"
              icon={<Save size={14} />}
              onClick={handleSave}
              loading={isSaving}
              disabled={!dirty}
            >
              {t('save')}
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
