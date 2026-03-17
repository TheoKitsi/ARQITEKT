import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useGetReadinessQuery, type ReadinessResult } from '@/store/api/requirementsApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ProgressTracker.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProgressTrackerProps {
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Step definitions (i18n keys)                                       */
/* ------------------------------------------------------------------ */

const STEPS = [
  'nsCreateBC',
  'nsDeriveSol',
  'nsCreateUS',
  'nsDefineCmp',
  'nsSpecifyFn',
  'nsReview',
  'nsStartDev',
  'nsScaffold',
  'nsStartApp',
  'nsDeploy',
] as const;

type StepKey = (typeof STEPS)[number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Derive how many steps are completed based on the readiness score.
 * The score is a 0-100 number; we distribute it evenly across 10 steps.
 */
function deriveCompletedSteps(readiness: ReadinessResult | undefined): number {
  if (!readiness) return 0;
  // Map 0-100 score onto 0-10 steps
  const raw = Math.floor((readiness.score / 100) * STEPS.length);
  return Math.min(raw, STEPS.length);
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

export function ProgressTracker({ projectId }: ProgressTrackerProps) {
  const { t } = useTranslation();
  const { data: readiness, isLoading, isError } = useGetReadinessQuery(projectId);

  const completedCount = useMemo(
    () => deriveCompletedSteps(readiness),
    [readiness],
  );

  const percent = useMemo(() => {
    if (!readiness) return 0;
    return Math.round(readiness.score);
  }, [readiness]);

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
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>{t('trackerTitle', 'Progress')}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBarWrap}>
        <div className={styles.progressLabel}>
          <span>{t('progressTitle', 'Progress')}</span>
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
