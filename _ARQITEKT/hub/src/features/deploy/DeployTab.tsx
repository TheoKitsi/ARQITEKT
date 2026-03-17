import { useTranslation } from 'react-i18next';
import {
  Package,
  Store,
  Github,
  Hammer,
  Code2,
  Rocket,
  ShoppingBag,
  Settings,
  Upload,
  GitBranch,
  FileText,
  GitPullRequest,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './DeployTab.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DeployTab() {
  const { t } = useTranslation();

  return (
    <div className={styles.tab}>
      {/* Build & Scaffold */}
      <Card>
        <Card.Header>
          <div className={styles.cardTitle}>
            <Package size={18} />
            <span>{t('deployBuildScaffold')}</span>
          </div>
        </Card.Header>
        <Card.Body>
          <div className={styles.actionGrid}>
            <ActionTile
              icon={<Hammer size={20} />}
              title={t('deployScaffoldTitle')}
              description={t('deployScaffoldDesc')}
              buttonLabel={t('deployScaffoldBtn')}
            />
            <ActionTile
              icon={<Code2 size={20} />}
              title={t('deployCodegenTitle')}
              description={t('deployCodegenDesc')}
              buttonLabel={t('deployCodegenBtn')}
            />
            <ActionTile
              icon={<Rocket size={20} />}
              title={t('deployBuildDeployTitle')}
              description={t('deployBuildDeployDesc')}
              buttonLabel={t('deployBuildDeployBtn')}
              variant="gold"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Store & Distribution */}
      <Card>
        <Card.Header>
          <div className={styles.cardTitle}>
            <Store size={18} />
            <span>{t('deployStoreDist')}</span>
          </div>
        </Card.Header>
        <Card.Body>
          <div className={styles.actionGrid}>
            <ActionTile
              icon={<ShoppingBag size={20} />}
              title={t('deployGPlayTitle')}
              description={t('deployGPlayDesc')}
              buttonLabel={t('deployConfigureBtn')}
            />
            <ActionTile
              icon={<Settings size={20} />}
              title={t('deployCICDTitle')}
              description={t('deployCICDDesc')}
              buttonLabel={t('deploySetupActions')}
            />
            <ActionTile
              icon={<Upload size={20} />}
              title={t('storeDeploy')}
              description={t('deployGPlayDesc')}
              buttonLabel={t('deployUploadBtn')}
            />
          </div>
        </Card.Body>
      </Card>

      {/* GitHub */}
      <Card>
        <Card.Header>
          <div className={styles.cardTitle}>
            <Github size={18} />
            <span>{t('deployGithub')}</span>
          </div>
        </Card.Header>
        <Card.Body>
          <div className={styles.actionGrid}>
            <ActionTile
              icon={<FileText size={20} />}
              title={t('deployExportTitle')}
              description={t('deployExportDesc')}
              buttonLabel={t('deployExportBtn')}
            />
            <ActionTile
              icon={<GitBranch size={20} />}
              title={t('deployPushTitle')}
              description={t('deployPushDesc')}
              buttonLabel={t('deployPushBtn')}
            />
            <ActionTile
              icon={<GitPullRequest size={20} />}
              title={t('ghRepoStatus')}
              description={t('ghRepoNoConfig')}
              buttonLabel={t('ghConnectBtn', 'Connect')}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ActionTile helper                                                  */
/* ------------------------------------------------------------------ */

function ActionTile({
  icon,
  title,
  description,
  buttonLabel,
  variant = 'outlined',
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  variant?: 'outlined' | 'gold';
}) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileIcon}>{icon}</div>
      <div className={styles.tileText}>
        <span className={styles.tileTitle}>{title}</span>
        <span className={styles.tileDesc}>{description}</span>
      </div>
      <Button variant={variant} size="sm">
        {buttonLabel}
      </Button>
    </div>
  );
}
