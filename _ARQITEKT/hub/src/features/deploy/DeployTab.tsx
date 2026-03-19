import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import {
  useScaffoldMutation,
  useCodegenMutation,
  useGithubPushMutation,
  useExportIssuesMutation,
  useBuildDeployMutation,
  useGithubActionsMutation,
} from '@/store/api/deployApi';
import { RepoStatusPanel } from './RepoStatusPanel';
import styles from './DeployTab.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DeployTab() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const [scaffold, { isLoading: scaffolding }] = useScaffoldMutation();
  const [codegen, { isLoading: generating }] = useCodegenMutation();
  const [githubPush] = useGithubPushMutation();
  const [exportIssues, { isLoading: exporting }] = useExportIssuesMutation();
  const [buildDeploy, { isLoading: building }] = useBuildDeployMutation();
  const [githubActions, { isLoading: settingUpCI }] = useGithubActionsMutation();

  const [showCodegenModal, setShowCodegenModal] = useState(false);
  const [codegenModel, setCodegenModel] = useState('gpt-4o');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleScaffold = async () => {
    if (!projectId) return;
    if (!confirm(t('confirmScaffold'))) return;
    try {
      const result = await scaffold({ projectId }).unwrap();
      setLogs(result.filesCreated.length ? result.filesCreated : [result.message ?? 'Scaffold complete']);
      setShowLogs(true);
    } catch (err) {
      setLogs([`Error: ${err instanceof Error ? err.message : String(err)}`]);
      setShowLogs(true);
    }
  };

  const handleCodegen = async () => {
    if (!projectId) return;
    setShowCodegenModal(false);
    try {
      const result = await codegen({ projectId, options: { model: codegenModel } }).unwrap();
      setLogs(result.filesGenerated.length ? result.filesGenerated : [result.message ?? 'Codegen complete']);
      setShowLogs(true);
    } catch (err) {
      setLogs([`Error: ${err instanceof Error ? err.message : String(err)}`]);
      setShowLogs(true);
    }
  };

  const handleExport = async () => {
    if (!projectId) return;
    try {
      await exportIssues({ projectId }).unwrap();
      setLogs(['Requirements exported to GitHub Issues']);
      setShowLogs(true);
    } catch (err) {
      setLogs([`Error: ${err instanceof Error ? err.message : String(err)}`]);
      setShowLogs(true);
    }
  };

  const handlePush = async () => {
    if (!projectId) return;
    if (!confirm(t('confirmPush'))) return;
    try {
      await githubPush({ projectId, commitMessage: 'Update from ARQITEKT' }).unwrap();
      setLogs(['Pushed to GitHub']);
      setShowLogs(true);
    } catch (err) {
      setLogs([`Error: ${err instanceof Error ? err.message : String(err)}`]);
      setShowLogs(true);
    }
  };

  const handleBuild = async () => {
    if (!projectId) return;
    try {
      const result = await buildDeploy(projectId).unwrap();
      setLogs([
        result.message ?? 'Build complete',
        `Framework: ${result.framework}`,
        `Duration: ${(result.durationMs / 1000).toFixed(1)}s`,
        '',
        result.output,
      ]);
      setShowLogs(true);
    } catch (err: any) {
      const data = err?.data;
      setLogs([
        `Build failed: ${data?.message ?? err?.message ?? String(err)}`,
        ...(data?.output ? ['', data.output] : []),
      ]);
      setShowLogs(true);
    }
  };

  const handleGithubActions = async () => {
    if (!projectId) return;
    try {
      const result = await githubActions(projectId).unwrap();
      setLogs([result.message, `File: ${result.filePath}`]);
      setShowLogs(true);
    } catch (err) {
      setLogs([`Error: ${err instanceof Error ? err.message : String(err)}`]);
      setShowLogs(true);
    }
  };

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
              onClick={handleScaffold}
              loading={scaffolding}
            />
            <ActionTile
              icon={<Code2 size={20} />}
              title={t('deployCodegenTitle')}
              description={t('deployCodegenDesc')}
              buttonLabel={t('deployCodegenBtn')}
              onClick={() => setShowCodegenModal(true)}
              loading={generating}
            />
            <ActionTile
              icon={<Rocket size={20} />}
              title={t('deployBuildDeployTitle')}
              description={t('deployBuildDeployDesc')}
              buttonLabel={t('deployBuildDeployBtn')}
              variant="gold"
              onClick={handleBuild}
              loading={building}
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
              onClick={handleGithubActions}
              loading={settingUpCI}
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
              onClick={handleExport}
              loading={exporting}
            />
            <ActionTile
              icon={<GitBranch size={20} />}
              title={t('deployPushTitle')}
              description={t('deployPushDesc')}
              buttonLabel={t('deployPushBtn')}
              onClick={handlePush}
            />
          </div>
          <RepoStatusPanel />
        </Card.Body>
      </Card>

      {/* Codegen Model Selector Modal */}
      <Modal isOpen={showCodegenModal} onClose={() => setShowCodegenModal(false)} title={t('deployCodegenTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label={t('model')}
            value={codegenModel}
            onChange={(e) => setCodegenModel(e.target.value)}
            options={[
              { value: 'gpt-4o', label: 'GPT-4o' },
              { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              { value: 'o3-mini', label: 'o3-mini' },
            ]}
          />
          <Button variant="gold" onClick={handleCodegen} loading={generating}>
            {t('deployCodegenBtn')}
          </Button>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal isOpen={showLogs} onClose={() => setShowLogs(false)} title={t('output')}>
        <pre style={{
          maxHeight: '400px',
          overflow: 'auto',
          padding: '1rem',
          background: '#0d1117',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-mono, monospace)',
          lineHeight: 1.6,
          color: '#e6edf3',
          whiteSpace: 'pre-wrap',
        }}>
          {logs.join('\n')}
        </pre>
      </Modal>
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
  onClick,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  variant?: 'outlined' | 'gold';
  onClick?: () => void;
  loading?: boolean;
}) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileIcon}>{icon}</div>
      <div className={styles.tileText}>
        <span className={styles.tileTitle}>{title}</span>
        <span className={styles.tileDesc}>{description}</span>
      </div>
      <Button variant={variant} size="sm" onClick={onClick} loading={loading} disabled={loading}>
        {buttonLabel}
      </Button>
    </div>
  );
}
