import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Clock, User, Target } from 'lucide-react';
import { useGetAuditLogQuery, type AuditEntry } from '@/store/api/auditApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './AuditPanel.module.css';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ACTION_LABELS: Record<string, string> = {
  'requirement.status_changed': 'Status changed',
  'requirement.created': 'Created',
  'requirement.edited': 'Edited',
  'requirement.deleted': 'Deleted',
  'gate.evaluated': 'Gate evaluated',
  'gate.overridden': 'Gate overridden',
  'probing.answered': 'Probing answered',
  'probing.skipped': 'Probing skipped',
  'baseline.created': 'Baseline created',
  'feedback.created': 'Feedback added',
  'feedback.updated': 'Feedback updated',
  'project.scaffolded': 'App scaffolded',
  'project.codegen': 'Code generated',
  'file.written': 'File written',
  'file.deleted': 'File deleted',
  'file.renamed': 'File renamed',
  'project.pushed': 'Pushed to GitHub',
  'project.deployed': 'Built/Deployed',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AuditPanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useGetAuditLogQuery(
    { projectId: projectId!, limit: 30 },
    { skip: !projectId },
  );

  return (
    <section className={styles.panel}>
      <h3 className={styles.title}>{t('auditTrail', 'Activity')}</h3>

      {isLoading && (
        <div className={styles.center}>
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && (!data || data.entries.length === 0) && (
        <p className={styles.empty}>{t('noActivity')}</p>
      )}

      {data && data.entries.length > 0 && (
        <ul className={styles.list}>
          {data.entries.map((entry, i) => (
            <AuditRow key={`${entry.timestamp}-${i}`} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Row                                                                */
/* ------------------------------------------------------------------ */

function AuditRow({ entry }: { entry: AuditEntry }) {
  const label = ACTION_LABELS[entry.action] ?? entry.action;

  return (
    <li className={styles.row}>
      <div className={styles.rowHeader}>
        <span className={styles.action}>{label}</span>
        <span className={styles.time}>
          <Clock size={12} />
          {formatTime(entry.timestamp)}
        </span>
      </div>
      <div className={styles.rowMeta}>
        {entry.target && (
          <span className={styles.target}>
            <Target size={12} />
            {entry.target}
          </span>
        )}
        <span className={styles.actor}>
          <User size={12} />
          {entry.actor}
        </span>
      </div>
      {entry.detail && Object.keys(entry.detail).length > 0 && (
        <div className={styles.detail}>
          {Object.entries(entry.detail).map(([k, v]) => (
            <span key={k} className={styles.detailItem}>
              {k}: {String(v)}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
