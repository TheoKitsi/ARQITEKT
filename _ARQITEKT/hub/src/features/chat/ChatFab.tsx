import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleChat } from '@/store/slices/chatSlice';
import styles from './ChatFab.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatFab() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.chat.isOpen);

  // Hide FAB when panel is open
  if (isOpen) return null;

  return (
    <button
      className={styles.fab}
      onClick={() => dispatch(toggleChat())}
      aria-label={t('openChat')}
      type="button"
    >
      <MessageCircle size={22} />
    </button>
  );
}
