import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Activity, Play, Square, RotateCw, ExternalLink } from 'lucide-react';
import { useAppStatusQuery, useAppStartMutation, useAppStopMutation } from '@/store/api/deployApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import styles from './AppStatusPanel.module.css';

export function AppStatusPanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: status, isLoading } = useAppStatusQuery(projectId!);
  const [startApp, { isLoading: starting }] = useAppStartMutation();
  const [stopApp, { isLoading: stopping }] = useAppStopMutation();

  const running = status?.running ?? false;
  const port = status?.port;

  const handleStart = () => startApp(projectId!);
  const handleStop = () => stopApp(projectId!);
  const handleRestart = async () => {
    await stopApp(projectId!);
    await startApp(projectId!);
  };

  return (
    <Card>
      <Card.Header>
        <div className={styles.titleRow}>
          <Activity size={18} />
          <span>{t('monitorAppStatus')}</span>
        </div>
        <Badge variant={running ? 'success' : 'default'}>
          {running ? t('monitorRunning') : t('monitorNotRunning')}
        </Badge>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <div className={styles.details}>
            {running && port && (
              <div className={styles.info}>
                <span className={styles.infoLabel}>Port</span>
                <span className={styles.infoValue}>{port}</span>
              </div>
            )}
            {running && (
              <a
                className={styles.browserLink}
                href={`http://localhost:${port}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={14} />
                {t('openBrowser')}
              </a>
            )}
            {!running && (
              <p className={styles.hint}>{t('noApp')}</p>
            )}
          </div>
        )}
      </Card.Body>
      <Card.Footer>
        <Button
          variant="outlined"
          size="sm"
          icon={<Play size={14} />}
          onClick={handleStart}
          disabled={running || starting}
          loading={starting}
        >
          {t('monitorStart')}
        </Button>
        <Button
          variant="outlined"
          size="sm"
          icon={<Square size={14} />}
          onClick={handleStop}
          disabled={!running || stopping}
          loading={stopping}
        >
          {t('monitorStop')}
        </Button>
        <Button
          variant="outlined"
          size="sm"
          icon={<RotateCw size={14} />}
          onClick={handleRestart}
          disabled={!running}
        >
          {t('monitorRestart')}
        </Button>
      </Card.Footer>
    </Card>
  );
}
