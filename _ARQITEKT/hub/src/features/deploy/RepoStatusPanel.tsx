import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GitBranch } from 'lucide-react';
import { useGitStatusQuery, type GitFileStatus } from '@/store/api/deployApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './RepoStatusPanel.module.css';

const STATUS_LETTERS: Record<GitFileStatus['status'], string> = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  renamed: 'R',
  untracked: '?',
};

export function RepoStatusPanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useGitStatusQuery(projectId!, {
    skip: !projectId,
    pollingInterval: 15_000,
  });

  if (isLoading) return <Spinner size="sm" />;

  if (!data || !data.isRepo) {
    return <p className={styles.noRepo}>{t('ghRepoNoConfig', 'Not a Git repository')}</p>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.branchBadge}>
          <GitBranch size={12} />
          {data.branch}
        </span>
        {data.files.length === 0 && (
          <span className={styles.cleanBadge}>{t('repoClean', 'Clean')}</span>
        )}
      </div>

      {data.files.length > 0 && (
        <>
          <ul className={styles.fileList}>
            {data.files.map((f) => (
              <li key={f.path} className={styles.fileRow}>
                <span className={styles.statusTag} data-status={f.status}>
                  {STATUS_LETTERS[f.status]}
                </span>
                <span className={styles.filePath}>{f.path}</span>
              </li>
            ))}
          </ul>
          <p className={styles.summary}>
            {data.files.length} {t('changedFiles', 'changed file(s)')}
          </p>
        </>
      )}
    </div>
  );
}
