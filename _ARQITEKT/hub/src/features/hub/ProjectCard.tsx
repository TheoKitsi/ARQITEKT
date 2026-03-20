import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, ExternalLink, Globe } from 'lucide-react';
import type { Project } from '@/store/api/projectsApi';
import { useAppStartMutation, useAppStatusQuery } from '@/store/api/deployApi';
import { Badge, type LifecycleStage } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import styles from './ProjectCard.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const lifecycle: LifecycleStage = project.config.lifecycle;
  const [startApp, { isLoading: starting }] = useAppStartMutation();

  // Poll app status for running apps to get real port
  const showAction = lifecycle === 'built' || lifecycle === 'building' || lifecycle === 'running' || lifecycle === 'deployed';
  const { data: appStatus } = useAppStatusQuery(project.id, {
    skip: !showAction,
    pollingInterval: lifecycle === 'running' ? 10_000 : undefined,
  });

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lifecycle === 'built' || lifecycle === 'building') {
      try {
        const result = await startApp(project.id).unwrap();
        if (!result.success) {
          showToast(result.message ?? t('appStartFailed', 'Failed to start app'), 'error');
        }
      } catch {
        showToast(t('appStartFailed', 'Failed to start app. Has the app been scaffolded?'), 'error');
      }
    } else if (lifecycle === 'running') {
      const port = appStatus?.port ?? 8080;
      window.open(`http://localhost:${port}`, '_blank', 'noopener');
    } else if (lifecycle === 'deployed' && project.config.url) {
      window.open(project.config.url, '_blank', 'noopener');
    }
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={project.config.name}
    >
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.name}>{project.config.name}</h3>
        <Badge lifecycle={lifecycle}>{t(lifecycle)}</Badge>
      </div>

      {/* Description */}
      <p className={styles.description}>
        {project.config.description || t('noDescription')}
      </p>

      {/* Stats bar */}
      <div className={styles.stats}>
        <StatItem label={t('statSOL')} value={project.stats.sol} />
        <StatItem label={t('statUS')} value={project.stats.us} />
        <StatItem label={t('statCMP')} value={project.stats.cmp} />
        <StatItem label={t('statFN')} value={project.stats.fn} />
      </div>

      {/* Action button */}
      {showAction && (
        <div className={styles.actionRow}>
          {appStatus?.running && appStatus.port && (
            <span className={styles.portBadge}>:{appStatus.port}</span>
          )}
          <button
            className={`${styles.actionBtn} ${
              lifecycle === 'running' ? styles.actionRunning
                : lifecycle === 'deployed' ? styles.actionDeployed
                : styles.actionPlay
            }`}
            onClick={handleAction}
            disabled={starting || (lifecycle === 'deployed' && !project.config.url)}
            aria-label={
              lifecycle === 'running' ? t('openApp')
                : lifecycle === 'deployed' ? t('viewLive', 'View Live')
                : t('runApp')
            }
          >
            {lifecycle === 'running' ? (
              <><ExternalLink size={14} /> {t('openApp')}</>
            ) : lifecycle === 'deployed' ? (
              <><Globe size={14} /> {t('viewLive', 'View Live')}</>
            ) : (
              <><Play size={14} /> {starting ? t('starting') : t('runApp')}</>
            )}
          </button>
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  StatItem helper                                                    */
/* ------------------------------------------------------------------ */

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
