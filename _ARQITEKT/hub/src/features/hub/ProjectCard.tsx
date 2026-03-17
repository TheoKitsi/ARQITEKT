import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/store/api/projectsApi';
import { Badge, type LifecycleStage } from '@/components/ui/Badge';
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
  const lifecycle: LifecycleStage = project.config.lifecycle;

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
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
