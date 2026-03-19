import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { Github, Globe, LogOut, Sun, Moon, ArrowUpCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setLanguage, toggleTheme, type Language } from '@/store/slices/uiSlice';
import { useGetGithubStatusQuery } from '@/store/api/githubApi';
import { useGetAuthStatusQuery, useLogoutMutation } from '@/store/api/authApi';
import { useCheckUpdateQuery } from '@/store/api/hubApi';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { GitHubSetupModal } from './GitHubSetupModal';
import styles from './Header.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Header() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.ui.language);
  const theme = useAppSelector((s) => s.ui.theme);
  const { data: ghStatus } = useGetGithubStatusQuery();
  const { data: authStatus } = useGetAuthStatusQuery();
  const { data: updateInfo } = useCheckUpdateQuery(undefined, { pollingInterval: 3600000 });
  const [logout] = useLogoutMutation();
  const [showGithubSetup, setShowGithubSetup] = useState(false);
  const projectMatch = useMatch('/projects/:projectId/*');
  const activeProjectId = projectMatch?.params.projectId;

  const toggleLang = () => {
    const next: Language = language === 'de' ? 'en' : 'de';
    dispatch(setLanguage(next));
    i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    await logout().unwrap();
    window.location.href = '/';
  };

  const isAuthEnabled = authStatus?.authEnabled && authStatus.authenticated;

  return (
    <header className={styles.header}>
      {/* Left: Logo / brand */}
      <Link to="/" className={styles.brand}>
        <span className={styles.logo}>A</span>
        <span className={styles.brandName}>ARQITEKT</span>
      </Link>

      {/* Right: actions */}
      <div className={styles.actions}>
        {/* Notification bell (visible when inside a project) */}
        {activeProjectId && <NotificationBell projectId={activeProjectId} />}

        {/* Update available banner */}
        {updateInfo?.updateAvailable && (
          <a
            className={styles.updateBanner}
            href={updateInfo.downloadUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowUpCircle size={14} />
            <span>v{updateInfo.latestVersion}</span>
          </a>
        )}

        {/* Theme toggle */}
        <button
          className={styles.langToggle}
          onClick={() => dispatch(toggleTheme())}
          aria-label={t('toggleTheme', 'Toggle theme')}
          title={theme === 'dark' ? t('lightMode', 'Light mode') : t('darkMode', 'Dark mode')}
          type="button"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Language toggle */}
        <button
          className={styles.langToggle}
          onClick={toggleLang}
          aria-label={t('language', 'Language')}
          title={language === 'de' ? t('switchLangEn') : t('switchLangDe')}
          type="button"
        >
          <Globe size={16} />
          <span className={styles.langLabel}>{language.toUpperCase()}</span>
        </button>

        {/* GitHub status (only when auth is NOT enabled — otherwise user logged in via OAuth already) */}
        {!isAuthEnabled && (
          <>
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
          </>
        )}

        {/* User menu (when auth is enabled) */}
        {isAuthEnabled && (
          <>
            <span className={styles.username}>
              {authStatus.user?.username}
            </span>
            <Button
              variant="outlined"
              size="sm"
              icon={<LogOut size={14} />}
              onClick={handleLogout}
            >
              {t('authLogout', 'Logout')}
            </Button>
          </>
        )}
      </div>

      <GitHubSetupModal
        isOpen={showGithubSetup}
        onClose={() => setShowGithubSetup(false)}
      />
    </header>
  );
}
