import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Github,
  ExternalLink,
  CheckCircle,
  Shield,
  Key,
  LogOut,
  User,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  useGetGithubStatusQuery,
  useConnectGithubMutation,
  useDisconnectGithubMutation,
} from '@/store/api/githubApi';
import styles from './GitHubSetupModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GitHubSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GITHUB_TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo,read:user,workflow&description=ARQITEKT+Hub';

const REQUIRED_PERMISSIONS = [
  'repo (Full control of private repositories)',
  'read:user (Read user profile data)',
  'workflow (Update GitHub Action workflows)',
];

const AVAILABLE_MODELS = [
  { name: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Claude Sonnet', provider: 'Anthropic' },
  { name: 'Claude Opus', provider: 'Anthropic' },
  { name: 'DeepSeek R1', provider: 'DeepSeek' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GitHubSetupModal({ isOpen, onClose }: GitHubSetupModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { data: status, isLoading: isLoadingStatus } = useGetGithubStatusQuery(undefined, {
    skip: !isOpen,
  });
  const [connectGithub, { isLoading: isConnecting }] = useConnectGithubMutation();
  const [disconnectGithub, { isLoading: isDisconnecting }] = useDisconnectGithubMutation();

  const [token, setToken] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const isConnected = status?.connected ?? false;

  /* ---- Connect ---- */
  const handleConnect = useCallback(async () => {
    if (!token.trim()) return;

    try {
      const result = await connectGithub({ token: token.trim() }).unwrap();
      showToast(t('ghConnectedAs', { name: result.username }), 'success');
      setToken('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      showToast(`${t('ghConnectionFailed')}${message}`, 'error');
    }
  }, [token, connectGithub, showToast, t]);

  /* ---- Disconnect ---- */
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectGithub().unwrap();
      showToast(t('ghDisconnected'), 'info');
      setStep(1);
    } catch {
      showToast(t('errorLoad'), 'error');
    }
  }, [disconnectGithub, showToast, t]);

  /* ---- Open token page ---- */
  const openTokenPage = useCallback(() => {
    window.open(GITHUB_TOKEN_URL, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('ghConnectTitle')}
    >
      {isLoadingStatus ? (
        <div className={styles.loadingContainer}>
          <Spinner size="md" />
        </div>
      ) : isConnected && status ? (
        /* ---- Connected state ---- */
        <div className={styles.connectedContainer}>
          {/* User info */}
          <div className={styles.userInfo}>
            {status.avatarUrl ? (
              <img
                src={status.avatarUrl}
                alt={status.username}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <User size={24} />
              </div>
            )}
            <div className={styles.userDetails}>
              <div className={styles.connectedBadge}>
                <CheckCircle size={14} />
                <span>{t('ghConnected')}</span>
              </div>
              <span className={styles.username}>
                {t('ghConnectedAs', { name: status.username })}
              </span>
            </div>
          </div>

          {/* Available models */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('ghAvailableModels')}</h3>
            <div className={styles.modelsList}>
              {AVAILABLE_MODELS.map((model) => (
                <div key={model.name} className={styles.modelItem}>
                  <span className={styles.modelName}>{model.name}</span>
                  <Badge variant="default">{model.provider}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Disconnect */}
          <Button
            variant="outlined"
            size="md"
            onClick={handleDisconnect}
            loading={isDisconnecting}
            icon={<LogOut size={16} />}
            className={styles.disconnectBtn}
          >
            {t('ghDisconnect')}
          </Button>
        </div>
      ) : (
        /* ---- Setup steps ---- */
        <div className={styles.setupContainer}>
          {/* Step indicator */}
          <div className={styles.steps}>
            <button
              type="button"
              className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}
              onClick={() => setStep(1)}
            >
              1
            </button>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
            <button
              type="button"
              className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}
              onClick={() => setStep(2)}
            >
              2
            </button>
          </div>

          {step === 1 ? (
            /* ---- Step 1: Create PAT ---- */
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <Key size={20} />
                <h3 className={styles.stepTitle}>{t('ghStep1')}</h3>
              </div>

              <p className={styles.stepDesc}>{t('ghConnectDesc')}</p>

              <Button
                variant="outlined"
                size="md"
                onClick={openTokenPage}
                icon={<ExternalLink size={16} />}
              >
                {t('ghOpenTokenPage')}
              </Button>

              <div className={styles.permissionsSection}>
                <span className={styles.permissionsLabel}>
                  <Shield size={14} />
                  {t('ghPermissions')}
                </span>
                <ul className={styles.permissionsList}>
                  {REQUIRED_PERMISSIONS.map((perm) => (
                    <li key={perm} className={styles.permissionItem}>
                      <code className={styles.permCode}>{perm}</code>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.stepNav}>
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setStep(2)}
                >
                  {t('wizNext')}
                </Button>
              </div>
            </div>
          ) : (
            /* ---- Step 2: Paste token ---- */
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <Github size={20} />
                <h3 className={styles.stepTitle}>{t('ghStep2')}</h3>
              </div>

              <Input
                label="Personal Access Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                type="password"
                autoFocus
              />

              <div className={styles.stepNav}>
                <Button
                  variant="outlined"
                  size="md"
                  onClick={() => setStep(1)}
                >
                  {t('wizBack')}
                </Button>
                <Button
                  variant="gold"
                  size="md"
                  onClick={handleConnect}
                  loading={isConnecting}
                  disabled={!token.trim()}
                  icon={<Github size={16} />}
                >
                  {isConnecting ? t('ghConnecting') : t('ghConnectBtn')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
