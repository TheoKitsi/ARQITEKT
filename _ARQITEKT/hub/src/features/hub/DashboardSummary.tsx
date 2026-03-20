import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Project } from '@/store/api/projectsApi';
import type { LifecycleStage } from '@/components/ui/Badge';
import styles from './DashboardSummary.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardSummaryProps {
  projects: Project[];
}

const PHASES: LifecycleStage[] = ['planning', 'ready', 'building', 'built', 'running', 'deployed'];

const PHASE_I18N: Record<string, string> = {
  planning: 'summaryPlanning',
  ready: 'summaryReady',
  building: 'summaryBuilding',
  built: 'built',
  running: 'summaryRunning',
  deployed: 'summaryDeployed',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardSummary({ projects }: DashboardSummaryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Count projects per lifecycle phase
  const counts: Record<string, number> = {};
  for (const phase of PHASES) {
    counts[phase] = projects.filter((p) => p.config.lifecycle === phase).length;
  }

  // Find the most recently relevant project (heuristic: first non-deployed, or last in list)
  const lastProject = projects.length > 0
    ? projects.find((p) => p.config.lifecycle !== 'deployed') ?? projects[0]
    : null;

  // Overall readiness across all projects
  const totalAuthored = projects.reduce((s, p) => s + p.readiness.authored, 0);
  const totalApproved = projects.reduce((s, p) => s + p.readiness.approved, 0);
  const overallReadiness = totalAuthored > 0 ? Math.round((totalApproved / totalAuthored) * 100) : 0;

  return (
    <section className={styles.summary}>
      {/* Phase distribution */}
      <div className={styles.phases}>
        {PHASES.map((phase) => {
          const count = counts[phase] ?? 0;
          if (count === 0) return null;
          return (
            <div key={phase} className={styles.phaseItem}>
              <span className={`${styles.phaseDot} ${styles[`dot_${phase}`]}`} />
              <span className={styles.phaseCount}>{count}</span>
              <span className={styles.phaseLabel}>{t(PHASE_I18N[phase] ?? phase)}</span>
            </div>
          );
        })}
      </div>

      {/* Overall readiness */}
      {totalAuthored > 0 && (
        <div className={styles.readinessBlock}>
          <div className={styles.readinessHeader}>
            <span className={styles.readinessLabel}>{t('readinessLabel')}</span>
            <span className={styles.readinessValue}>{overallReadiness}%</span>
          </div>
          <div className={styles.readinessTrack}>
            <div className={styles.readinessFill} style={{ width: `${overallReadiness}%` }} />
          </div>
        </div>
      )}

      {/* Continue last project */}
      {lastProject && (
        <button
          className={styles.continueBtn}
          onClick={() => navigate(`/projects/${lastProject.id}`)}
          type="button"
        >
          <div className={styles.continueText}>
            <span className={styles.continueHint}>{t('lastEdited')}</span>
            <span className={styles.continueName}>{lastProject.config.name}</span>
          </div>
          <ArrowRight size={16} className={styles.continueArrow} />
        </button>
      )}
    </section>
  );
}
