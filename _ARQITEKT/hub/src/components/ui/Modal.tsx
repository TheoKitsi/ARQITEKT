import {
  type ReactNode,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* ---- Sync open/close with native dialog ---- */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  /* ---- Handle native close event (Escape key) ---- */
  const handleCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      onClose();
    },
    [onClose],
  );

  /* ---- Close on backdrop click ---- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  /* ---- Focus trapping is native with <dialog>.showModal() ---- */

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
    >
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('close')}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
