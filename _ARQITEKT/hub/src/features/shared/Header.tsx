import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { Github, LogOut, Sun, Moon, ArrowUpCircle, Globe, Settings, User, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setLanguage, toggleTheme, type Language } from '@/store/slices/uiSlice';
import { useGetGithubStatusQuery } from '@/store/api/githubApi';
import { useGetAuthStatusQuery, useLogoutMutation } from '@/store/api/authApi';
import { useCheckUpdateQuery } from '@/store/api/hubApi';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const projectMatch = useMatch('/projects/:projectId/*');
  const activeProjectId = projectMatch?.params.projectId;

  const toggleLang = () => {
    const next: Language = language === 'de' ? 'en' : 'de';
    dispatch(setLanguage(next));
    i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout().unwrap();
    window.location.href = '/';
  };

  const isAuthEnabled = authStatus?.authEnabled && authStatus.authenticated;

  // Determine display name and avatar
  const displayName = isAuthEnabled
    ? authStatus.user?.username
    : ghStatus?.connected
      ? ghStatus.username
      : undefined;

  const avatarUrl = isAuthEnabled
    ? authStatus.user?.avatarUrl
    : ghStatus?.connected
      ? ghStatus.avatarUrl
      : undefined;

  const isConnected = isAuthEnabled || ghStatus?.connected;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      {/* Left: Logo / brand */}
      <Link to="/" className={styles.brand}>
        <svg className={styles.logoSvg} width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="var(--color-brand-anthracite)"/>
          <g transform="translate(16,16) rotate(45)">
            <rect x="-8" y="-8" width="16" height="16" rx="2" fill="none" stroke="var(--color-brand-gold)" strokeWidth="2"/>
            <line x1="-4" y1="0" x2="4" y2="0" stroke="var(--color-brand-gold)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--color-brand-gold)" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
        </svg>
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

        {/* Avatar menu */}
        <div className={styles.avatarMenu} ref={menuRef}>
          <button
            className={styles.avatarBtn}
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={t('userMenu', 'User menu')}
            aria-expanded={menuOpen}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName ?? ''} className={styles.avatarImg} />
            ) : (
              <User size={18} />
            )}
            <ChevronDown size={12} className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`} />
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              {/* GitHub connection status */}
              <div className={styles.dropdownSection}>
                {isConnected ? (
                  <div className={styles.userInfo}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName ?? ''} className={styles.userAvatar} />
                    ) : (
                      <div className={styles.userAvatarFallback}><Github size={20} /></div>
                    )}
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>{displayName}</span>
                      <span className={styles.userHint}>{t('connectedViaGithub', 'Connected via GitHub')}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    className={styles.dropdownItem}
                    onClick={() => { setMenuOpen(false); setShowGithubSetup(true); }}
                    role="menuitem"
                    type="button"
                  >
                    <Github size={16} />
                    <span>{t('connectGithub', 'Connect GitHub')}</span>
                  </button>
                )}
              </div>

              <div className={styles.dropdownDivider} />

              {/* Settings section */}
              <div className={styles.dropdownSection}>
                <div className={styles.dropdownLabel}>
                  <Settings size={13} />
                  <span>{t('settings', 'Settings')}</span>
                </div>

                {/* Theme toggle */}
                <button
                  className={styles.dropdownItem}
                  onClick={() => dispatch(toggleTheme())}
                  role="menuitem"
                  type="button"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{theme === 'dark' ? t('lightMode', 'Light mode') : t('darkMode', 'Dark mode')}</span>
                </button>

                {/* Language toggle */}
                <button
                  className={styles.dropdownItem}
                  onClick={toggleLang}
                  role="menuitem"
                  type="button"
                >
                  <Globe size={16} />
                  <span>{language === 'de' ? 'English' : 'Deutsch'}</span>
                </button>
              </div>

              {/* Logout (only when auth is enabled) */}
              {isAuthEnabled && (
                <>
                  <div className={styles.dropdownDivider} />
                  <div className={styles.dropdownSection}>
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={handleLogout}
                      role="menuitem"
                      type="button"
                    >
                      <LogOut size={16} />
                      <span>{t('authLogout', 'Logout')}</span>
                    </button>
                  </div>
                </>
              )}

              {/* GitHub settings (when connected but not via OAuth) */}
              {!isAuthEnabled && isConnected && (
                <>
                  <div className={styles.dropdownDivider} />
                  <div className={styles.dropdownSection}>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { setMenuOpen(false); setShowGithubSetup(true); }}
                      role="menuitem"
                      type="button"
                    >
                      <Github size={16} />
                      <span>{t('githubSettings', 'GitHub Settings')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <GitHubSetupModal
        isOpen={showGithubSetup}
        onClose={() => setShowGithubSetup(false)}
      />
    </header>
  );
}
