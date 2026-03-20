import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Key, Eye, Terminal } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setSessionMode } from '@/store/slices/authSlice';
import { useConnectAnthropicMutation } from '@/store/api/anthropicApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './LoginPage.module.css';

/* ------------------------------------------------------------------ */
/*  ARQITEKT Logo (A-triangle)                                         */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <img className={styles.logo} src="/arqitekt-logo.png" alt="ARQITEKT" width="80" height="80" />
  );
}

/* ------------------------------------------------------------------ */
/*  Start Page                                                         */
/* ------------------------------------------------------------------ */

export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [apiKey, setApiKey] = useState('');
  const [connectAnthropic, { isLoading: connecting, isError }] = useConnectAnthropicMutation();

  const handleGithub = () => {
    dispatch(setSessionMode('github'));
    window.location.href = '/api/auth/github';
  };

  const handleAnthropic = async () => {
    if (!apiKey.trim()) return;
    try {
      await connectAnthropic({ apiKey: apiKey.trim() }).unwrap();
      dispatch(setSessionMode('anthropic'));
    } catch { /* error shown inline */ }
  };

  const handleExplore = () => {
    dispatch(setSessionMode('explore'));
  };

  const handleDeveloper = () => {
    dispatch(setSessionMode('developer'));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Brand header */}
        <Logo />
        <h1 className={styles.title}>ARQITEKT</h1>
        <p className={styles.subtitle}>{t('startSubtitle')}</p>

        {/* Provider cards */}
        <div className={styles.options}>
          {/* GitHub */}
          <button type="button" className={styles.option} onClick={handleGithub}>
            <div className={styles.optionIcon}><Github size={22} /></div>
            <div className={styles.optionText}>
              <span className={styles.optionTitle}>GitHub</span>
              <span className={styles.optionDesc}>{t('startGithubDesc')}</span>
            </div>
            <span className={styles.badge}>{t('startFull')}</span>
          </button>

          {/* Anthropic */}
          <div className={`${styles.option} ${styles.optionExpanded}`}>
            <div className={styles.optionRow}>
              <div className={styles.optionIcon}><Key size={22} /></div>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>Anthropic</span>
                <span className={styles.optionDesc}>{t('startAnthropicDesc')}</span>
              </div>
              <span className={styles.badge}>{t('startFull')}</span>
            </div>
            <div className={styles.apiKeyRow}>
              <Input
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnthropic()}
              />
              <Button variant="gold" size="sm" onClick={handleAnthropic} loading={connecting}>
                {t('connect')}
              </Button>
            </div>
            {isError && <p className={styles.error}>{t('anthropicConnectFailed')}</p>}
          </div>

          {/* Explore */}
          <button type="button" className={styles.option} onClick={handleExplore}>
            <div className={styles.optionIcon}><Eye size={22} /></div>
            <div className={styles.optionText}>
              <span className={styles.optionTitle}>{t('startExploreTitle')}</span>
              <span className={styles.optionDesc}>{t('startExploreDesc')}</span>
            </div>
            <span className={`${styles.badge} ${styles.badgeMuted}`}>{t('startLimited')}</span>
          </button>

          {/* Developer */}
          <button type="button" className={styles.option} onClick={handleDeveloper}>
            <div className={styles.optionIcon}><Terminal size={22} /></div>
            <div className={styles.optionText}>
              <span className={styles.optionTitle}>{t('startDevTitle')}</span>
              <span className={styles.optionDesc}>{t('startDevDesc')}</span>
            </div>
            <span className={`${styles.badge} ${styles.badgeDev}`}>{t('startDevBadge')}</span>
          </button>
        </div>

        <p className={styles.hint}>{t('startHint')}</p>
      </div>
    </div>
  );
}
