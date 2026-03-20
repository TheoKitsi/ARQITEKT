import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Key } from 'lucide-react';
import { useGetGithubStatusQuery } from '@/store/api/githubApi';
import { useGetAnthropicStatusQuery, useConnectAnthropicMutation } from '@/store/api/anthropicApi';
import { Button } from './Button';
import { Input } from './Input';
import styles from './ProviderLoginGate.module.css';

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps content that requires at least one AI provider (GitHub or Anthropic).
 * Shows a login panel when neither provider is connected.
 */
export function ProviderLoginGate({ children }: Props) {
  const { data: ghStatus } = useGetGithubStatusQuery();
  const { data: anthropicStatus } = useGetAnthropicStatusQuery();

  const hasProvider = ghStatus?.connected || anthropicStatus?.connected;

  if (hasProvider) return <>{children}</>;

  return <ProviderLoginPanel />;
}

/**
 * Returns true when at least one AI provider is connected.
 * Useful for hooks that need to conditionally skip queries.
 */
export function useAnyProviderConnected(): boolean {
  const { data: ghStatus } = useGetGithubStatusQuery();
  const { data: anthropicStatus } = useGetAnthropicStatusQuery();
  return !!(ghStatus?.connected || anthropicStatus?.connected);
}

/* ------------------------------------------------------------------ */
/*  Login Panel                                                        */
/* ------------------------------------------------------------------ */

function ProviderLoginPanel() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [connectAnthropic, { isLoading: connecting, error }] = useConnectAnthropicMutation();

  const handleAnthropicConnect = async () => {
    if (!apiKey.trim()) return;
    try {
      await connectAnthropic({ apiKey: apiKey.trim() }).unwrap();
      setApiKey('');
    } catch { /* error shown via RTK state */ }
  };

  return (
    <div className={styles.gate}>
      <p className={styles.description}>{t('providerRequired')}</p>

      <div className={styles.providers}>
        {/* GitHub */}
        <div className={styles.provider}>
          <div className={styles.providerHeader}>
            <Github size={20} />
            <span className={styles.providerName}>GitHub</span>
          </div>
          <p className={styles.providerDesc}>{t('providerGithubDesc')}</p>
          <Button variant="outlined" onClick={() => { window.location.href = '/api/auth/github'; }}>
            {t('githubLoginBtn')}
          </Button>
        </div>

        <div className={styles.divider}>
          <span>{t('or', 'or')}</span>
        </div>

        {/* Anthropic */}
        <div className={styles.provider}>
          <div className={styles.providerHeader}>
            <Key size={20} />
            <span className={styles.providerName}>Anthropic</span>
          </div>
          <p className={styles.providerDesc}>{t('providerAnthropicDesc')}</p>
          <div className={styles.apiKeyRow}>
            <Input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnthropicConnect()}
            />
            <Button variant="outlined" onClick={handleAnthropicConnect} loading={connecting}>
              {t('connect')}
            </Button>
          </div>
          {error && <p className={styles.error}>{t('anthropicConnectFailed')}</p>}
        </div>
      </div>
    </div>
  );
}
