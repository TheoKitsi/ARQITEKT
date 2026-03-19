import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ConfidenceBadge.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ConfidenceBreakdown {
  structural: number;
  semantic: number;
  consistency: number;
  boundary: number;
}

export interface ConfidenceBadgeProps {
  /** Overall confidence score 0-100. Pass null/undefined for "not evaluated". */
  score: number | null | undefined;
  /** Breakdown for tooltip hover detail */
  breakdown?: ConfidenceBreakdown;
  /** Click handler (e.g. start probing) */
  onClick?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getVariant(score: number): string {
  if (score >= 90) return styles.gold!;
  if (score >= 70) return styles.green!;
  if (score >= 50) return styles.yellow!;
  return styles.red!;
}

function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConfidenceBadge({
  score,
  breakdown,
  onClick,
  className,
}: ConfidenceBadgeProps) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (breakdown) setShowTooltip(true);
  }, [breakdown]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  if (score == null) {
    return (
      <span className={[styles.badge, styles.none, className].filter(Boolean).join(' ')}>
        --
      </span>
    );
  }

  const variant = getVariant(score);
  const isClickable = !!onClick;

  const badgeEl = (
    <span
      className={[
        styles.badge,
        variant,
        isClickable ? styles.clickable : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={t('confidenceLabel', { score: formatScore(score) })}
    >
      {formatScore(score)}
    </span>
  );

  if (!breakdown) return badgeEl;

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {badgeEl}
      {showTooltip && <ConfidenceTooltip breakdown={breakdown} />}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function ConfidenceTooltip({ breakdown }: { breakdown: ConfidenceBreakdown }) {
  const { t } = useTranslation();
  const rows: { label: string; value: number }[] = [
    { label: t('structural'), value: breakdown.structural },
    { label: t('semantic'), value: breakdown.semantic },
    { label: t('consistency'), value: breakdown.consistency },
    { label: t('boundary'), value: breakdown.boundary },
  ];

  return (
    <div className={styles.tooltip} role="tooltip">
      {rows.map((r) => (
        <div key={r.label} className={styles.tooltipRow}>
          <span className={styles.tooltipLabel}>{r.label}</span>
          <span className={styles.tooltipValue}>{formatScore(r.value)}</span>
        </div>
      ))}
    </div>
  );
}
