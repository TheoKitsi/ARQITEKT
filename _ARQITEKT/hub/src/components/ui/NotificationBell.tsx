import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
  type Notification,
} from '@/store/api/notificationsApi';
import styles from './NotificationBell.module.css';

/* ------------------------------------------------------------------ */
/*  Severity → color                                                   */
/* ------------------------------------------------------------------ */

const severityColor: Record<string, string> = {
  critical: 'var(--color-red)',
  high: 'var(--color-orange)',
  medium: 'var(--color-yellow)',
  low: 'var(--color-green)',
  info: 'var(--color-accent)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  projectId: string;
}

export function NotificationBell({ projectId }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useGetUnreadCountQuery(projectId, { pollingInterval: 15_000 });
  const { data: listData } = useGetNotificationsQuery({ projectId }, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const unread = countData?.unread ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = (n: Notification) => {
    if (!n.read) {
      markRead({ projectId, notificationId: n.id });
    }
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.bell}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`${t('notifications')}${unread > 0 ? ` (${unread})` : ''}`}
        type="button"
      >
        <Bell size={16} />
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>{t('notifications')}</span>
            {unread > 0 && (
              <button
                className={styles.markAll}
                onClick={() => markAll(projectId)}
                type="button"
              >
                <CheckCheck size={14} />
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className={styles.list}>
            {(!listData?.items || listData.items.length === 0) ? (
              <div className={styles.empty}>{t('noNotifications')}</div>
            ) : (
              listData.items.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.item} ${n.read ? styles.read : styles.unread}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div
                    className={styles.dot}
                    style={{ backgroundColor: severityColor[n.severity] ?? severityColor.info }}
                  />
                  <div className={styles.content}>
                    <div className={styles.itemTitle}>{n.title}</div>
                    <div className={styles.itemMessage}>{n.message}</div>
                    <div className={styles.itemTime}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {!n.read && (
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead({ projectId, notificationId: n.id });
                        }}
                        aria-label={t('markAsRead')}
                        type="button"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif({ projectId, notificationId: n.id });
                      }}
                      aria-label={t('deleteBtn')}
                      type="button"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
