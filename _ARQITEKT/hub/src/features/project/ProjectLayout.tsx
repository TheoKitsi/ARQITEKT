import { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Code2,
  Rocket,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { useGetProjectQuery } from '@/store/api/projectsApi';
import { useGetReadinessQuery } from '@/store/api/requirementsApi';
import { Spinner } from '@/components/ui/Spinner';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { RequirementsTree } from './RequirementsTree';
import { SearchBox } from './SearchBox';
import { ProgressTracker } from './ProgressTracker';
import { BCSummaryCard } from './BCSummaryCard';
import { useGetTreeQuery, type TreeNode } from '@/store/api/requirementsApi';
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
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useGetProjectQuery(projectId!);
  const { data: readiness } = useGetReadinessQuery(projectId!);
  const { data: tree } = useGetTreeQuery(projectId!);
  const requirementsComplete = (readiness?.approved ?? 0) >= 100;

  /* ---- Tree → Dialog bridge (passed to Outlet context) ---- */
  const [openNode, setOpenNode] = useState<TreeNode | null>(null);
  const outletContext = useMemo(() => ({ openNode, setOpenNode }), [openNode]);

  const handleTreeOpen = useCallback((node: TreeNode) => {
    setOpenNode(node);
  }, []);

  /* ---- Sidebar resize ---- */
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const resizing = useRef(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const newW = Math.min(Math.max(startW + ev.clientX - startX, 240), 600);
      setSidebarWidth(newW);
    };
    const onUp = () => {
      resizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

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
      <aside className={styles.sidebar} style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          {t('backToProjects')}
        </Link>

        <h2 className={styles.projectName}>{project.config.name}</h2>

        {(project.config.description || project.config.lifecycle || project.config.github) && (
          <div className={styles.meta}>
            {project.config.description && (
              <p className={styles.metaDesc}>{project.config.description}</p>
            )}
            <div className={styles.metaRow}>
              {project.config.lifecycle && (
                <span className={styles.metaBadge}>{t(project.config.lifecycle)}</span>
              )}
              {project.config.github && (
                <a
                  className={styles.metaLink}
                  href={`https://github.com/${project.config.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
            </div>
            {project.config.tags && project.config.tags.length > 0 && (
              <div className={styles.metaRow}>
                {project.config.tags.map((tag) => (
                  <span key={tag} className={styles.metaTag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <SearchBox
          projectId={projectId!}
          onSelect={(nodeId) => {
            if (!tree) return;
            const findById = (nodes: TreeNode[]): TreeNode | null => {
              for (const n of nodes) {
                if (n.id === nodeId) return n;
                const child = findById(n.children);
                if (child) return child;
              }
              return null;
            };
            const node = findById(tree);
            if (node) setOpenNode(node);
          }}
        />

        <nav className={styles.treeNav} aria-label={t('requirements')}>
          <RequirementsTree projectId={projectId!} onOpen={handleTreeOpen} />
        </nav>

        <ProgressTracker projectId={projectId!} onNextStep={() => navigate('plan')} />

        <BCSummaryCard projectId={projectId!} />
      </aside>

      {/* Resize handle */}
      <div
        className={styles.resizeHandle}
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
      />

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
          {tabs.map((tab) => {
            const isPlan = tab.to === 'plan';
            const dimmed = !isPlan && !requirementsComplete;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `${styles.tab} ${isActive ? styles.tabActive : ''} ${dimmed ? styles.tabDimmed : ''}`
                }
                title={dimmed ? t('completeRequirementsFirst') : undefined}
                onClick={dimmed ? (e) => e.preventDefault() : undefined}
                aria-disabled={dimmed}
              >
                {tab.icon}
                <span>{t(tab.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Content */}
        <div className={styles.content}>
          <Outlet context={outletContext} />
        </div>
      </div>
    </div>
  );
}
