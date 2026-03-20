import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, ChevronRight, ChevronDown } from 'lucide-react';
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
  const [categoriesOpen, setCategoriesOpen] = useState(false);

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
          <span className={styles.compactValue}>{summary.readiness}%</span> {t('bcReadiness')}
        </span>
      </div>

      {summary.categories?.length > 0 && (
        <>
          <button
            className={styles.catToggle}
            onClick={() => setCategoriesOpen((p) => !p)}
            type="button"
            aria-expanded={categoriesOpen}
          >
            {categoriesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>{t('bcCategories')}</span>
          </button>
          {categoriesOpen && (
            <div className={styles.categories}>
              {summary.categories.map((cat: { name: string; completionPercent: number }) => (
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
        </>
      )}
    </div>
  );
}
