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
        <div className={styles.logo}>A</div>
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
