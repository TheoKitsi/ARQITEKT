import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Download, Sparkles, Search } from 'lucide-react';
import { useGetProjectsQuery } from '@/store/api/projectsApi';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from '@/features/shared/CreateProjectModal';
import { ImportProjectModal } from '@/features/shared/ImportProjectModal';
import styles from './HubDashboard.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HubDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lifecycle'>('name');

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = search.toLowerCase();
    const list = q
      ? projects.filter(
          (p) =>
            p.config.name.toLowerCase().includes(q) ||
            (p.config.description ?? '').toLowerCase().includes(q),
        )
      : [...projects];
    list.sort((a, b) =>
      sortBy === 'name'
        ? a.config.name.localeCompare(b.config.name)
        : (a.config.lifecycle ?? '').localeCompare(b.config.lifecycle ?? ''),
    );
    return list;
  }, [projects, search, sortBy]);

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>ARQITEKT Hub</h1>
        <p className={styles.heroSub}>{t('hubSubFull')}</p>
        <div className={styles.heroActions}>
          <Button
            variant="gold"
            size="md"
            icon={<Sparkles size={16} />}
            onClick={() => navigate('/wizard')}
          >
            {t('wizStart', 'Von der Idee zur App')}
          </Button>
          <Button
            variant="outlined"
            size="md"
            icon={<FolderPlus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            {t('newProject')}
          </Button>
          <Button
            variant="outlined"
            size="md"
            icon={<Download size={16} />}
            onClick={() => setShowImportModal(true)}
          >
            {t('import', 'Import')}
          </Button>
        </div>
      </section>

      {/* Project Grid */}
      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>{t('projects')}</h2>

        {/* Search & Sort */}
        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                className={styles.searchInput}
                type="text"
                placeholder={t('searchProjects')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'lifecycle')}
            >
              <option value="name">{t('sortName')}</option>
              <option value="lifecycle">{t('sortLifecycle')}</option>
            </select>
          </div>
        )}

        {isLoading && (
          <div className={styles.center}>
            <Spinner size="lg" />
            <p className={styles.loadingText}>{t('loading', 'Loading...')}</p>
          </div>
        )}

        {isError && (
          <div className={styles.center}>
            <p className={styles.errorText}>{t('errorLoad', 'Failed to load data.')}</p>
            <Button variant="outlined" size="sm" onClick={() => refetch()}>
              {t('refresh')}
            </Button>
          </div>
        )}

        {!isLoading && !isError && projects && projects.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <FolderPlus size={48} strokeWidth={1} />
            </div>
            <h3 className={styles.emptyTitle}>{t('noEmpty')}</h3>
            <p className={styles.emptyHint}>
              {t('onboardHint')}
            </p>
            <Button
              variant="gold"
              size="md"
              icon={<FolderPlus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              {t('newProject')}
            </Button>
          </div>
        )}

        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className={styles.grid}>
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {filtered.length === 0 && (
              <p className={styles.noResults}>{t('noResults')}</p>
            )}
          </div>
        )}
      </section>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <ImportProjectModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </main>
  );
}
