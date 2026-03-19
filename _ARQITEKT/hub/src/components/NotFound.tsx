import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 56px)',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#e0e0e0',
    }}>
      <h1 style={{ color: '#FFD700', fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>{t('pageNotFound')}</p>
      <Link
        to="/"
        style={{
          padding: '0.5rem 1.5rem',
          backgroundColor: '#FFD700',
          color: '#1f1f1f',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {t('backToDashboard')}
      </Link>
    </div>
  );
}
