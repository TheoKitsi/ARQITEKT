import { useTranslation } from 'react-i18next';
import { useGetStatsQuery } from '@/store/api/requirementsApi';
import { useGetPipelineQuery } from '@/store/api/pipelineApi';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import styles from './StatsBar.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StatsBarProps {
  projectId: string;
}

interface StatPillDef {
  /** Key into the RequirementsStats object */
  statKey: 'bc' | 'sol' | 'us' | 'cmp' | 'fn' | 'inf' | 'adr' | 'ntf';
  /** i18n key for the label */
  labelKey: string;
  /** Dot color */
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Pill definitions                                                   */
/* ------------------------------------------------------------------ */

const PILL_DEFS: StatPillDef[] = [
  { statKey: 'bc',  labelKey: 'statBC',  color: 'var(--color-artifact-bc)' },
  { statKey: 'sol', labelKey: 'statSOL', color: 'var(--color-artifact-sol)' },
  { statKey: 'us',  labelKey: 'statUS',  color: 'var(--color-artifact-us)' },
  { statKey: 'cmp', labelKey: 'statCMP', color: 'var(--color-artifact-cmp)' },
  { statKey: 'fn',  labelKey: 'statFN',  color: 'var(--color-artifact-fn)' },
  { statKey: 'inf', labelKey: 'statINF', color: 'var(--color-artifact-secondary)' },
  { statKey: 'adr', labelKey: 'statADR', color: 'var(--color-artifact-secondary)' },
  { statKey: 'ntf', labelKey: 'statNTF', color: 'var(--color-artifact-secondary)' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StatsBar({ projectId }: StatsBarProps) {
  const { t } = useTranslation();
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useGetStatsQuery(projectId);
  const { data: pipeline } = useGetPipelineQuery(projectId);

  const passedGates = pipeline?.gates.filter((g) => g.status === 'passed' || g.status === 'overridden').length ?? 0;
  const totalGates = pipeline?.gates.length ?? 0;

  return (
    <section className={styles.bar} aria-label={t('statBC')}>
      {isLoading && (
        <div className={styles.loading}>
          <Spinner size="sm" />
        </div>
      )}

      {isError && (
        <div className={styles.error}>
          <span>{t('errorLoad')}</span>
          <Button variant="text" size="sm" onClick={() => refetch()}>
            {t('refresh')}
          </Button>
        </div>
      )}

      {stats && (
        <div className={styles.row}>
          {PILL_DEFS.map((def) => (
            <StatPill
              key={def.statKey}
              label={t(def.labelKey)}
              value={stats[def.statKey] ?? 0}
              color={def.color}
            />
          ))}
          {pipeline && (
            <>
              <StatPill
                label={t('statGates')}
                value={passedGates}
                color="var(--color-brand-gold)"
                suffix={`/${totalGates}`}
              />
              <ConfidenceBadge score={pipeline.overallConfidence} />
            </>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  StatPill helper                                                    */
/* ------------------------------------------------------------------ */

function StatPill({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className={styles.pill}>
      <span
        className={styles.dot}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className={styles.value}>{value}{suffix ?? ''}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
