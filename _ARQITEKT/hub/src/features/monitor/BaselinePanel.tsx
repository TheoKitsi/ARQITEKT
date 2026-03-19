import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  RefreshCw,
  ArrowDown,
  Edit,
} from 'lucide-react';
import {
  useGetBaselineQuery,
  useSetBaselineMutation,
  useGetDriftQuery,
  useGetOrphansQuery,
} from '@/store/api/baselineApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import styles from './BaselinePanel.module.css';

const driftKindIcons: Record<string, React.ReactNode> = {
  added: <Plus size={12} />,
  removed: <Minus size={12} />,
  content_changed: <Edit size={12} />,
  title_changed: <Edit size={12} />,
  status_regressed: <ArrowDown size={12} />,
  parent_changed: <RefreshCw size={12} />,
};

const driftKindVariants: Record<string, 'info' | 'warning' | 'error' | 'default'> = {
  added: 'info',
  removed: 'error',
  content_changed: 'warning',
  title_changed: 'warning',
  status_regressed: 'error',
  parent_changed: 'warning',
};

export function BaselinePanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: baseline, isLoading: loadingBaseline } = useGetBaselineQuery(projectId!, { skip: !projectId });
  const [setBaseline, { isLoading: setting }] = useSetBaselineMutation();
  const { data: drift, isLoading: loadingDrift, refetch: refetchDrift } = useGetDriftQuery(projectId!, { skip: !projectId || !baseline });
  const { data: orphansData } = useGetOrphansQuery(projectId!, { skip: !projectId });

  const orphanCount = orphansData?.orphans?.length ?? 0;

  return (
    <Card>
      <Card.Header>
        <div className={styles.titleRow}>
          <GitBranch size={18} />
          <span>{t('monitorBaseline')}</span>
          {drift?.drifted && (
            <Badge variant="warning">{t('baselineDrifted')}</Badge>
          )}
          {!drift?.drifted && baseline && (
            <Badge variant="success">{t('baselineClean')}</Badge>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {loadingBaseline ? (
          <Spinner size="sm" />
        ) : !baseline ? (
          <p className={styles.hint}>{t('baselineNone')}</p>
        ) : (
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t('baselineCreated')}</span>
              <span className={styles.value}>
                {new Date(baseline.createdAt).toLocaleString()}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t('baselineArtifacts')}</span>
              <span className={styles.value}>{baseline.artifacts.length}</span>
            </div>
            {orphanCount > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('baselineOrphans')}</span>
                <Badge variant="warning">{orphanCount}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Drift section */}
        {loadingDrift ? (
          <div className={styles.loading}>
            <Spinner size="sm" />
            <span>{t('checkingDrift')}</span>
          </div>
        ) : drift && drift.items.length > 0 ? (
          <div className={styles.driftSection}>
            <div className={styles.driftSummary}>
              {drift.summary.added > 0 && (
                <span className={styles.driftAdded}>
                  <Plus size={12} /> {drift.summary.added} {t('driftAdded')}
                </span>
              )}
              {drift.summary.removed > 0 && (
                <span className={styles.driftRemoved}>
                  <Minus size={12} /> {drift.summary.removed} {t('driftRemoved')}
                </span>
              )}
              {drift.summary.changed > 0 && (
                <span className={styles.driftChanged}>
                  <Edit size={12} /> {drift.summary.changed} {t('driftChanged')}
                </span>
              )}
              {drift.summary.regressed > 0 && (
                <span className={styles.driftRegressed}>
                  <AlertTriangle size={12} /> {drift.summary.regressed} {t('driftRegressed')}
                </span>
              )}
            </div>
            <ul className={styles.driftList}>
              {drift.items.slice(0, 10).map((item, i) => (
                <li key={`${item.artifactId}-${i}`} className={styles.driftItem}>
                  <Badge variant={driftKindVariants[item.kind] ?? 'default'}>
                    {driftKindIcons[item.kind] ?? <RefreshCw size={12} />}
                    {item.kind}
                  </Badge>
                  <span className={styles.driftArtifact}>{item.artifactId}</span>
                  <span className={styles.driftDetail}>{item.detail}</span>
                </li>
              ))}
              {drift.items.length > 10 && (
                <li className={styles.driftMore}>
                  +{drift.items.length - 10} {t('moreItems')}
                </li>
              )}
            </ul>
          </div>
        ) : baseline ? (
          <p className={styles.clean}>
            <CheckCircle size={14} />
            {t('baselineNoChanges')}
          </p>
        ) : null}
      </Card.Body>
      <Card.Footer>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => setBaseline(projectId!)}
          loading={setting}
        >
          {baseline ? t('baselineUpdate') : t('baselineCreate')}
        </Button>
        {baseline && (
          <Button
            variant="outlined"
            size="sm"
            onClick={() => refetchDrift()}
            loading={loadingDrift}
          >
            {t('baselineCheckDrift')}
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
}
