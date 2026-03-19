import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  useOverrideGateMutation,
  type GateResult,
  type GateCheck,
  type Gap,
  type RiskLevel,
} from '@/store/api/pipelineApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { useToast } from '@/components/ui/Toast';
import styles from './GateDetail.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GateDetailProps {
  gate: GateResult | null;
  projectId: string;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Status → Badge variant map                                          */
/* ------------------------------------------------------------------ */

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'default' | 'warning'> = {
  passed: 'success',
  failed: 'error',
  pending: 'default',
  overridden: 'warning',
};

const SEVERITY_CLASS: Record<RiskLevel, string> = {
  critical: styles.gapCritical!,
  high: styles.gapHigh!,
  medium: styles.gapMedium!,
  low: styles.gapLow!,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GateDetail({ gate, projectId, onClose }: GateDetailProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [overrideGate, { isLoading: isOverriding }] = useOverrideGateMutation();
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const isOpen = gate !== null;

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
      const first = panelRef.current.querySelector<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }
  }, [isOpen]);

  /* ---- Reset on gate change ---- */
  useEffect(() => {
    setShowOverride(false);
    setOverrideReason('');
  }, [gate?.gateId]);

  /* ---- Backdrop click ---- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  /* ---- Override handler ---- */
  const handleOverride = useCallback(async () => {
    if (!gate || !overrideReason.trim()) return;
    try {
      await overrideGate({
        projectId,
        gateId: gate.gateId,
        reason: overrideReason.trim(),
      }).unwrap();
      showToast(t('gateOverridden'), 'success');
      onClose();
    } catch {
      showToast(t('errorGeneric'), 'error');
    }
  }, [gate, projectId, overrideReason, overrideGate, showToast, t, onClose]);

  if (!isOpen || !gate) return null;

  const passedChecks = gate.checks.filter((c) => c.passed).length;
  const totalChecks = gate.checks.length;
  const unresolvedGaps = gate.gaps.filter((g) => !g.resolved);

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} aria-hidden={!isOpen}>
      <aside ref={panelRef} className={styles.panel} role="dialog" aria-modal="true">
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Badge variant={STATUS_VARIANT[gate.status] ?? 'default'}>
              {gate.status.toUpperCase()}
            </Badge>
            <h2 className={styles.gateLabel}>{gate.name || gate.gateId}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label={t('close')}>
            <X size={18} />
          </button>
        </header>

        {/* Meta */}
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{gate.from}</span>
            <span className={styles.metaValue}>&rarr;</span>
            <span className={styles.metaLabel}>{gate.to}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Confidence:</span>
            <ConfidenceBadge score={gate.confidence} />
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Checks:</span>
            <span className={styles.metaValue}>{passedChecks}/{totalChecks}</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Checks section */}
          {gate.checks.length > 0 && (
            <section>
              <h3 className={styles.sectionTitle}>Checks</h3>
              <div className={styles.checkList}>
                {gate.checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </div>
            </section>
          )}

          {/* Gaps section */}
          {unresolvedGaps.length > 0 && (
            <section>
              <h3 className={styles.sectionTitle}>
                Gaps ({unresolvedGaps.length})
              </h3>
              <div className={styles.gapList}>
                {unresolvedGaps.map((gap) => (
                  <GapRow key={gap.id} gap={gap} />
                ))}
              </div>
            </section>
          )}

          {/* Override reason */}
          {gate.overrideReason && (
            <section>
              <h3 className={styles.sectionTitle}>Override Reason</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                {gate.overrideReason}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          {gate.status === 'failed' && !showOverride && (
            <Button
              variant="outlined"
              size="sm"
              icon={<AlertTriangle size={14} />}
              onClick={() => setShowOverride(true)}
            >
              Override
            </Button>
          )}
          {showOverride && (
            <div className={styles.overrideSection}>
              <Input
                label="Override reason"
                inputSize="sm"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why this gate should be overridden..."
                className={styles.overrideInput}
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleOverride}
                  loading={isOverriding}
                  disabled={!overrideReason.trim()}
                >
                  Confirm Override
                </Button>
                <Button variant="text" size="sm" onClick={() => setShowOverride(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CheckRow                                                           */
/* ------------------------------------------------------------------ */

function CheckRow({ check }: { check: GateCheck }) {
  return (
    <div className={styles.checkItem}>
      {check.passed ? (
        <CheckCircle size={16} className={`${styles.checkIcon} ${styles.checkPassed}`} />
      ) : (
        <XCircle size={16} className={`${styles.checkIcon} ${styles.checkFailed}`} />
      )}
      <div>
        <div className={styles.checkRule}>{check.rule}</div>
        {check.details && <div className={styles.checkDetails}>{check.details}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GapRow                                                             */
/* ------------------------------------------------------------------ */

function GapRow({ gap }: { gap: Gap }) {
  const severityClass = SEVERITY_CLASS[gap.severity] ?? styles.gapLow;

  return (
    <div className={`${styles.gapItem} ${severityClass}`}>
      <span className={styles.gapDescription}>{gap.description}</span>
      <Badge variant="info" className={styles.gapAgent}>
        {gap.suggestedAgent}
      </Badge>
    </div>
  );
}
