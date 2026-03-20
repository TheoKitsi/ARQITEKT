import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight } from 'lucide-react';
import { useGetReadinessQuery, useGetStatsQuery, type ReadinessResult, type RequirementsStats } from '@/store/api/requirementsApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ProgressTracker.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProgressTrackerProps {
  projectId: string;
  onNextStep?: (hint: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Step definitions — Phase 1 only (6 steps)                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  'nsCreateBC',
  'nsDeriveSol',
  'nsCreateUS',
  'nsDefineCmp',
  'nsSpecifyFn',
  'nsReview',
] as const;

type StepKey = (typeof STEPS)[number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function deriveCompletedSteps(readiness: ReadinessResult | undefined): number {
  if (!readiness) return 0;
  const raw = Math.floor((readiness.score / 100) * STEPS.length);
  return Math.min(raw, STEPS.length);
}

function deriveNextStepHint(
  stats: RequirementsStats | undefined,
  readiness: ReadinessResult | undefined,
  t: (key: string) => string,
): string | null {
  if (!stats || !readiness) return null;
  if (stats.bc === 0) return t('nsCreateBC');
  if (stats.sol === 0) return t('nsDeriveSol');
  if (stats.us === 0) return t('nsCreateUS');
  if (stats.cmp === 0) return t('nsDefineCmp');
  if (stats.fn === 0) return t('nsSpecifyFn');
  if (readiness.score < 100) return t('nsReview');
  return null;
}

/* ------------------------------------------------------------------ */
/*  StepItem                                                           */
/* ------------------------------------------------------------------ */

interface StepItemProps {
  index: number;
  labelKey: StepKey;
  state: 'completed' | 'current' | 'pending';
}

function StepItem({ index, labelKey, state }: StepItemProps) {
  const { t } = useTranslation();

  const stateClass =
    state === 'completed'
      ? styles.stepCompleted
      : state === 'current'
        ? styles.stepCurrent
        : styles.stepPending;

  return (
    <div className={`${styles.step} ${stateClass}`}>
      <span className={styles.stepCircle}>
        {state === 'completed' ? (
          <Check size={12} strokeWidth={3} />
        ) : (
          index + 1
        )}
      </span>
      <span className={styles.stepLabel} title={t(labelKey)}>
        {t(labelKey)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProgressTracker                                                    */
/* ------------------------------------------------------------------ */

export function ProgressTracker({ projectId, onNextStep }: ProgressTrackerProps) {
  const { t } = useTranslation();
  const { data: readiness, isLoading, isError } = useGetReadinessQuery(projectId);
  const { data: stats } = useGetStatsQuery(projectId);

  const completedCount = useMemo(
    () => deriveCompletedSteps(readiness),
    [readiness],
  );

  const percent = useMemo(() => {
    if (!readiness) return 0;
    return Math.round(readiness.score);
  }, [readiness]);

  const nextHint = useMemo(
    () => deriveNextStepHint(stats, readiness, t),
    [stats, readiness, t],
  );

  /* ---------- Loading state ---------- */
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="sm" />
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (isError) {
    return (
      <p className={styles.errorText}>{t('errorPrefix', 'Error: ')}</p>
    );
  }

  return (
    <div className={styles.container}>
      {/* Progress bar */}
      <div className={styles.progressBarWrap}>
        <div className={styles.progressLabel}>
          <span>{t('trackerTitle', 'Progress')}</span>
          <span className={styles.progressPercent}>{percent}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percent}% ${t('progressTitle', 'Progress')}`}
          />
        </div>
      </div>

      {/* Next step CTA */}
      {nextHint && (
        <button
          className={styles.nextStep}
          onClick={() => onNextStep?.(nextHint)}
          type="button"
        >
          <ArrowRight size={14} />
          <span className={styles.nextStepLabel}>{t('planNextStep', 'Next')}: {nextHint}</span>
        </button>
      )}

      {/* Steps */}
      <div className={styles.stepsList}>
        {STEPS.map((stepKey, index) => {
          let state: 'completed' | 'current' | 'pending';
          if (index < completedCount) {
            state = 'completed';
          } else if (index === completedCount) {
            state = 'current';
          } else {
            state = 'pending';
          }

          return (
            <StepItem
              key={stepKey}
              index={index}
              labelKey={stepKey}
              state={state}
            />
          );
        })}
      </div>
    </div>
  );
}
