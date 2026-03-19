import { useTranslation } from 'react-i18next';
import { useParams, NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  ClipboardList,
  Code2,
  Rocket,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { useGetProjectQuery } from '@/store/api/projectsApi';
import { Spinner } from '@/components/ui/Spinner';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { RequirementsTree } from './RequirementsTree';
import { SearchBox } from './SearchBox';
import { ProgressTracker } from './ProgressTracker';
import { BCSummaryCard } from './BCSummaryCard';
import styles from './ProjectLayout.module.css';

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

interface TabDef {
  to: string;
  labelKey: string;
  icon: React.ReactNode;
}

const tabs: TabDef[] = [
  { to: 'plan', labelKey: 'tabPlan', icon: <ClipboardList size={16} /> },
  { to: 'develop', labelKey: 'tabDevelop', icon: <Code2 size={16} /> },
  { to: 'deploy', labelKey: 'tabDeploy', icon: <Rocket size={16} /> },
  { to: 'monitor', labelKey: 'tabMonitor', icon: <Activity size={16} /> },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProjectLayout() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { data: project, isLoading, isError } = useGetProjectQuery(projectId!);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>{t('errorLoad')}</p>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          {t('backToProjects')}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          {t('backToProjects')}
        </Link>

        <h2 className={styles.projectName}>{project.config.name}</h2>

        <SearchBox projectId={projectId!} />

        <nav className={styles.treeNav} aria-label={t('requirements')}>
          <RequirementsTree projectId={projectId!} />
        </nav>

        <ProgressTracker projectId={projectId!} />

        <BCSummaryCard projectId={projectId!} />
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t('projects', 'Projects'), to: '/' },
            { label: project.config.name, to: `/projects/${projectId}` },
            ...((() => {
              const seg = location.pathname.split('/').pop();
              const tab = tabs.find((tb) => tb.to === seg);
              return tab ? [{ label: t(tab.labelKey) }] : [];
            })()),
          ]}
        />

        {/* Tab bar */}
        <nav className={styles.tabBar} aria-label={t('projectTabs')}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `${styles.tab} ${isActive ? styles.tabActive : ''}`
              }
            >
              {tab.icon}
              <span>{t(tab.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
