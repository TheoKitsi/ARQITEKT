import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useValidateProjectMutation } from '@/store/api/requirementsApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ValidationOverlay.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ValidationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ValidationOverlay({
  isOpen,
  onClose,
  projectId,
}: ValidationOverlayProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [validateProject, { data: result, isLoading, isError }] =
    useValidateProjectMutation();

  /* ---- Auto-trigger validation when opened ---- */
  useEffect(() => {
    if (isOpen) {
      validateProject(projectId);
    }
  }, [isOpen, projectId, validateProject]);

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

  /* ---- Focus trap ---- */
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusable = panelRef.current.querySelector<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, [isOpen]);

  /* ---- Backdrop click ---- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  const items = result?.results ?? [];
  const passCount = items.filter((r) => r.passed).length;
  const failCount = items.filter((r) => !r.passed).length;

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
        aria-labelledby="validation-title"
      >
        {/* ---- Header ---- */}
        <header className={styles.header}>
          <h2 id="validation-title" className={styles.title}>
            {t('validationTitle')}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('close')}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        {/* ---- Content ---- */}
        <div className={styles.body}>
          {/* Loading state */}
          {isLoading && (
            <div className={styles.loadingState}>
              <Spinner size="md" />
              <span className={styles.loadingText}>
                {t('runningValidation')}
              </span>
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className={styles.errorState}>
              <XCircle size={24} />
              <span>{t('errorLoad')}</span>
            </div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <>
              {/* Summary bar */}
              <div className={styles.summary}>
                <span className={styles.summaryText}>
                  {t('validationSummary', {
                    passed: passCount,
                    failed: failCount,
                  })}
                </span>
                {failCount === 0 && items.length > 0 && (
                  <span className={styles.validBadge}>
                    <CheckCircle size={14} />
                  </span>
                )}
              </div>

              {/* No issues */}
              {items.length === 0 && (
                <p className={styles.noIssues}>{t('validationNoIssues')}</p>
              )}

              {/* Result rows */}
              {items.map((item, idx) => (
                <div key={`${item.ruleId}-${idx}`} className={styles.resultRow}>
                  {item.passed ? (
                    <CheckCircle size={16} className={styles.iconPass} />
                  ) : (
                    <XCircle size={16} className={styles.iconFail} />
                  )}
                  <div className={styles.resultContent}>
                    <span className={styles.resultMessage}>
                      <strong>{item.ruleId}</strong> {item.rule}
                    </span>
                    {item.details && (
                      <span className={styles.resultMeta}>{item.details}</span>
                    )}
                    {item.affectedArtifacts && item.affectedArtifacts.length > 0 && (
                      <span className={styles.resultMeta}>
                        {t('affectedArtifacts')}: {item.affectedArtifacts.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
