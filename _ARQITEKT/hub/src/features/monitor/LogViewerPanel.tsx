import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Terminal } from 'lucide-react';
import { useAppLogsQuery, useAppStatusQuery } from '@/store/api/deployApi';
import styles from './LogViewerPanel.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LogViewerPanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: status } = useAppStatusQuery(projectId!);
  const { data } = useAppLogsQuery(
    { projectId: projectId! },
    { pollingInterval: status?.running ? 2000 : 0 },
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const logs = data?.logs ?? [];

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <Terminal size={16} />
        <h3 className={styles.title}>{t('logViewer', 'App Logs')}</h3>
        {!status?.running && (
          <span className={styles.badge}>{t('logStopped', 'stopped')}</span>
        )}
      </div>

      <div
        ref={scrollRef}
        className={styles.logArea}
        onScroll={handleScroll}
      >
        {logs.length === 0 && (
          <p className={styles.empty}>
            {status?.running
              ? t('logWaiting', 'Waiting for output...')
              : t('logNotRunning', 'App is not running. Start it from the Deploy tab.')}
          </p>
        )}
        {logs.map((entry, i) => (
          <div
            key={i}
            className={`${styles.logLine} ${entry.stream === 'stderr' ? styles.stderr : ''}`}
          >
            <span className={styles.ts}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className={styles.text}>{entry.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
