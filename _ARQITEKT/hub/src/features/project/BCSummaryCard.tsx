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

      <div className={styles.compactStats}>
        <span className={styles.compactItem}>
          <span className={styles.compactValue}>{summary.totalSolutions}</span> {t('bcSolutions')}
        </span>
        <span className={styles.compactItem}>
          <span className={styles.compactValue}>{summary.totalUserStories}</span> {t('bcUserStories')}
        </span>
        <span className={styles.compactItem}>
          <span className={styles.compactValue}>{summary.totalComponents}</span> {t('statCMP')}
        </span>
        <span className={styles.compactItem}>
          <span className={styles.compactValue}>{summary.totalFunctions}</span> {t('statFN')}
        </span>
        <span className={styles.compactItem}>
          <span className={styles.compactValue}>{summary.readiness}%</span> {t('bcReadiness')}
        </span>
      </div>
    </div>
  );
}
