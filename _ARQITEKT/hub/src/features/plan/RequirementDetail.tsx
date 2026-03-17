import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileEdit, ShieldCheck, ExternalLink } from 'lucide-react';
import type { TreeNode, RequirementStatus } from '@/store/api/requirementsApi';
import { useSetStatusMutation } from '@/store/api/requirementsApi';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from './RequirementDetail.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RequirementDetailProps {
  node: TreeNode | null;
  projectId: string;
  onClose: () => void;
  onValidate?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Status options                                                     */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: { value: RequirementStatus; labelKey: string }[] = [
  { value: 'idea', labelKey: 'statusIdea' },
  { value: 'draft', labelKey: 'statusDraft' },
  { value: 'review', labelKey: 'statusReview' },
  { value: 'approved', labelKey: 'statusApproved' },
  { value: 'implemented', labelKey: 'statusImplemented' },
];

/* ------------------------------------------------------------------ */
/*  Type → Badge variant mapping                                       */
/* ------------------------------------------------------------------ */

const TYPE_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'gold' | 'error'> = {
  BC: 'gold',
  SOL: 'info',
  US: 'success',
  CMP: 'warning',
  FN: 'default',
  CONV: 'default',
  INF: 'default',
  ADR: 'default',
  NTF: 'default',
  FBK: 'error',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RequirementDetail({
  node,
  projectId,
  onClose,
  onValidate,
}: RequirementDetailProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [setStatus] = useSetStatusMutation();

  const isOpen = node !== null;

  /* ---- Close on Escape ---- */
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  /* ---- Trap focus on open ---- */
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"]), select',
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  /* ---- Status change handler ---- */
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

  /* ---- Backdrop click ---- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen || !node) return null;

  const typeVariant = TYPE_VARIANT[node.type] ?? 'default';
  const childrenCount = node.children.length;

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <aside
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="req-detail-title"
      >
        {/* ---- Header ---- */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Badge variant={typeVariant}>{node.type}</Badge>
            <span className={styles.headerId}>{node.id}</span>
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
        <div className={styles.titleSection}>
          <h2 id="req-detail-title" className={styles.title}>
            {node.title}
          </h2>
        </div>

        {/* ---- Status dropdown ---- */}
        <div className={styles.section}>
          <Select
            label={t('modeLabel')}
            selectSize="sm"
            options={STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: t(opt.labelKey),
            }))}
            value={node.status}
            onChange={handleStatusChange}
          />
        </div>

        {/* ---- Metadata ---- */}
        <div className={styles.section}>
          <div className={styles.metaGrid}>
            <span className={styles.metaLabel}>{t('detailChildren')}</span>
            <span className={styles.metaValue}>{childrenCount}</span>
          </div>
        </div>

        {/* ---- Body ---- */}
        <div className={styles.bodyContent}>
          <p className={styles.placeholder}>{t('detailPlaceholder')}</p>
        </div>

        {/* ---- Actions ---- */}
        <footer className={styles.footer}>
          <Button
            variant="outlined"
            size="sm"
            icon={<FileEdit size={14} />}
            disabled
          >
            {t('detailEditFuture')}
          </Button>
          {onValidate && (
            <Button
              variant="outlined"
              size="sm"
              icon={<ShieldCheck size={14} />}
              onClick={onValidate}
            >
              {t('validate')}
            </Button>
          )}
          <Button
            variant="text"
            size="sm"
            icon={<ExternalLink size={14} />}
            disabled
          >
            {t('openInEditor')}
          </Button>
        </footer>
      </aside>
    </div>
  );
}
