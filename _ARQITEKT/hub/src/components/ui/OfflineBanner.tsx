import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import styles from './OfflineBanner.module.css';

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export default function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot);
  const { t } = useTranslation();

  if (online) return null;

  return (
    <div className={styles.banner} role="alert">
      <WifiOff size={16} />
      {t('offline')}
    </div>
  );
}
