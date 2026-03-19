import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { useGetBCSummaryQuery } from '@/store/api/requirementsApi';
import styles from './BCSummaryCard.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BCSummaryCardProps {
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BCSummaryCard({ projectId }: BCSummaryCardProps) {
  const { t } = useTranslation();
  const { data: summary } = useGetBCSummaryQuery(projectId);

  if (!summary) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <BarChart3 size={14} />
        <span className={styles.title}>{t('bcSummary')}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.totalSolutions}</span>
          <span className={styles.statLabel}>{t('bcSolutions')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.totalUserStories}</span>
          <span className={styles.statLabel}>{t('bcUserStories')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.totalRequirements}</span>
          <span className={styles.statLabel}>{t('bcRequirements')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary.readiness}%</span>
          <span className={styles.statLabel}>{t('bcReadiness')}</span>
        </div>
      </div>

      {summary.categories.length > 0 && (
        <div className={styles.categories}>
          {summary.categories.map((cat) => (
            <div key={cat.name} className={styles.catRow}>
              <span className={styles.catName}>{cat.name}</span>
              <div className={styles.catBar}>
                <div
                  className={styles.catFill}
                  style={{ width: `${cat.completionPercent}%` }}
                />
              </div>
              <span className={styles.catPct}>{cat.completionPercent}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
