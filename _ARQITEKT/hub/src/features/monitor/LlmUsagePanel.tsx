import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import { useGetLlmUsageQuery } from '@/store/api/hubApi';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import styles from './LlmUsagePanel.module.css';

export function LlmUsagePanel() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetLlmUsageQuery(undefined, {
    pollingInterval: 30_000,
  });

  return (
    <Card>
      <Card.Header>
        <div className={styles.titleRow}>
          <Activity size={18} />
          <span>{t('llmUsageTitle', 'LLM Usage')}</span>
        </div>
      </Card.Header>
      <Card.Body>
        {isLoading || !data ? (
          <Spinner size="sm" />
        ) : data.totalCalls === 0 ? (
          <p className={styles.empty}>{t('llmUsageEmpty', 'No LLM calls recorded yet.')}</p>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{data.totalCalls}</span>
                <span className={styles.statLabel}>{t('llmCalls', 'Calls')}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {data.totalTokens > 1000
                    ? `${(data.totalTokens / 1000).toFixed(1)}k`
                    : data.totalTokens}
                </span>
                <span className={styles.statLabel}>{t('llmTokens', 'Tokens')}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{data.avgLatencyMs}ms</span>
                <span className={styles.statLabel}>{t('llmAvgLatency', 'Avg Latency')}</span>
              </div>
            </div>

            {Object.keys(data.byModel).length > 0 && (
              <div className={styles.modelBreakdown}>
                {Object.entries(data.byModel).map(([model, info]) => (
                  <div key={model} className={styles.modelRow}>
                    <span className={styles.modelName}>{model}</span>
                    <span className={styles.modelMeta}>
                      {info.calls} {t('llmCalls', 'calls')} / {info.tokens > 1000 ? `${(info.tokens / 1000).toFixed(1)}k` : info.tokens} {t('tokens')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
