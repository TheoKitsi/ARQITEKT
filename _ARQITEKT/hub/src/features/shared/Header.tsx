import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Github, Globe } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setLanguage, type Language } from '@/store/slices/uiSlice';
import { useGetGithubStatusQuery } from '@/store/api/githubApi';
import { Button } from '@/components/ui/Button';
import { GitHubSetupModal } from './GitHubSetupModal';
import styles from './Header.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Header() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.ui.language);
  const { data: ghStatus } = useGetGithubStatusQuery();
  const [showGithubSetup, setShowGithubSetup] = useState(false);

  const toggleLang = () => {
    const next: Language = language === 'de' ? 'en' : 'de';
    dispatch(setLanguage(next));
    i18n.changeLanguage(next);
  };

  return (
    <header className={styles.header}>
      {/* Left: Logo / brand */}
      <Link to="/" className={styles.brand}>
        <span className={styles.logo}>A</span>
        <span className={styles.brandName}>ARQITEKT</span>
      </Link>

      {/* Right: actions */}
      <div className={styles.actions}>
        {/* Language toggle */}
        <button
          className={styles.langToggle}
          onClick={toggleLang}
          aria-label={t('language', 'Language')}
          title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
          type="button"
        >
          <Globe size={16} />
          <span className={styles.langLabel}>{language.toUpperCase()}</span>
        </button>

        {/* GitHub status */}
        {ghStatus?.connected ? (
          <button className={styles.ghAvatar} type="button" aria-label="GitHub" onClick={() => setShowGithubSetup(true)}>
            {ghStatus.avatarUrl ? (
              <img
                src={ghStatus.avatarUrl}
                alt={ghStatus.username ?? 'GitHub'}
                className={styles.avatar}
              />
            ) : (
              <Github size={18} />
            )}
          </button>
        ) : (
          <Button
            variant="outlined"
            size="sm"
            icon={<Github size={14} />}
            onClick={() => setShowGithubSetup(true)}
          >
            {t('connectGithub', 'Connect GitHub')}
          </Button>
        )}
      </div>

      <GitHubSetupModal
        isOpen={showGithubSetup}
        onClose={() => setShowGithubSetup(false)}
      />
    </header>
  );
}
