import { useTranslation } from 'react-i18next';
import { useGetStatsQuery } from '@/store/api/requirementsApi';
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
  { statKey: 'bc',  labelKey: 'statBC',  color: '#a371f7' },
  { statKey: 'sol', labelKey: 'statSOL', color: '#58a6ff' },
  { statKey: 'us',  labelKey: 'statUS',  color: '#3fb950' },
  { statKey: 'cmp', labelKey: 'statCMP', color: '#d29922' },
  { statKey: 'fn',  labelKey: 'statFN',  color: '#db6d28' },
  { statKey: 'inf', labelKey: 'statINF', color: '#8b949e' },
  { statKey: 'adr', labelKey: 'statADR', color: '#8b949e' },
  { statKey: 'ntf', labelKey: 'statNTF', color: '#8b949e' },
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
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={styles.pill}>
      <span
        className={styles.dot}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
