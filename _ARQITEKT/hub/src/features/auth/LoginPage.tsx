import { useTranslation } from 'react-i18next';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { t } = useTranslation();

  const handleLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <svg className={styles.logo} width="72" height="72" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#1F1F1F"/>
          <g transform="translate(16,16) rotate(45)">
            <rect x="-8" y="-8" width="16" height="16" rx="2" fill="none" stroke="#FFD700" strokeWidth="2"/>
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
        </svg>
        <h1 className={styles.title}>ARQITEKT</h1>
        <p className={styles.subtitle}>{t('loginSubtitle')}</p>
        <Button variant="gold" size="lg" icon={<Github size={20} />} onClick={handleLogin}>
          {t('loginWithGithub')}
        </Button>
        <p className={styles.hint}>{t('authCloudMode')}</p>
      </div>
    </div>
  );
}
