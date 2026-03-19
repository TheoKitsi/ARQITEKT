import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Star,
  AlertCircle,
  TrendingUp,
  Bug,
  Lightbulb,
  Download,
} from 'lucide-react';
import { useGetFeedbackQuery } from '@/store/api/feedbackApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import styles from './FeedbackPanel.module.css';

interface FeedbackPanelProps {
  onAddFeedback: () => void;
}

const severityIcons: Record<string, React.ReactNode> = {
  wish: <Lightbulb size={14} />,
  improvement: <TrendingUp size={14} />,
  bug: <Bug size={14} />,
  critical: <AlertCircle size={14} />,
};

const severityVariants: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  wish: 'default',
  improvement: 'info',
  bug: 'warning',
  critical: 'error',
};

export function FeedbackPanel({ onAddFeedback }: FeedbackPanelProps) {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useGetFeedbackQuery(projectId!);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'dismissed'>('all');

  const items = data ?? [];
  const filtered = filter === 'all'
    ? items
    : items.filter((item) => item.status === filter);

  const openCount = items.filter((item) => item.status === 'open').length;

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      window.open(`/api/projects/${projectId}/feedback/export?format=${format}`, '_blank');
    },
    [projectId],
  );

  return (
    <Card>
      <Card.Header>
        <div className={styles.titleRow}>
          <MessageSquare size={18} />
          <span>{t('monitorFeedback')}</span>
          {openCount > 0 && (
            <Badge variant="warning">
              {t('feedbackBadge', { n: openCount })}
            </Badge>
          )}
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="text"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => handleExport('csv')}
            disabled={items.length === 0}
          >
            CSV
          </Button>
          <Button
            variant="text"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => handleExport('json')}
            disabled={items.length === 0}
          >
            JSON
          </Button>
          <Button
            variant="outlined"
            size="sm"
            icon={<Plus size={14} />}
            onClick={onAddFeedback}
          >
            {t('monitorAddFeedback')}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Filter tabs */}
        <div className={styles.filters}>
          {(['all', 'open', 'resolved', 'dismissed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? t('filterAll') : t(`feedback${f.charAt(0).toUpperCase() + f.slice(1)}` as 'feedbackOpen')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner size="sm" />
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>{t('feedbackEmpty')}</p>
        ) : (
          <ul className={styles.list}>
            {filtered.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemIcon}>
                    {severityIcons[item.severity ?? ''] ?? <MessageSquare size={14} />}
                  </span>
                  <span className={styles.itemTitle}>{item.title ?? item.content.slice(0, 60)}</span>
                  {item.severity && (
                    <Badge variant={severityVariants[item.severity] ?? 'default'}>
                      {t(`feedbackSev${item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}` as 'feedbackSevWish')}
                    </Badge>
                  )}
                </div>
                <div className={styles.itemMeta}>
                  {item.source && (
                    <span className={styles.source}>
                      {t(`feedbackSource${item.source.charAt(0).toUpperCase() + item.source.slice(1)}` as 'feedbackSourceManual')}
                    </span>
                  )}
                  {item.rating != null && (
                    <span className={styles.rating}>
                      <Star size={12} />
                      {item.rating}/5
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
}
