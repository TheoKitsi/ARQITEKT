import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Zap } from 'lucide-react';
import { useCreateFunctionMutation } from '@/store/api/requirementsApi';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './AddUserStoryModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AddFunctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  componentId: string;
}

type CreationMode = 'discuss' | 'direct';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddFunctionModal({
  isOpen,
  onClose,
  projectId,
  componentId,
}: AddFunctionModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [mode, setMode] = useState<CreationMode>('direct');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const [createFn, { isLoading }] = useCreateFunctionMutation();

  const handleClose = useCallback(() => {
    setTitle('');
    setNotes('');
    setMode('direct');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    try {
      await createFn({
        projectId,
        componentId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        mode,
      }).unwrap();
      handleClose();
    } catch {
      showToast(t('createFnFailed', 'Failed to create function'), 'error');
    }
  }, [title, notes, mode, projectId, componentId, createFn, handleClose, showToast, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && title.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, title],
  );

  const canSubmit = title.trim().length > 0 && !isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('addFnTitle')}
      footer={
        <div className={styles.footerRow}>
          <Button variant="outlined" size="sm" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isLoading}
          >
            {mode === 'discuss' ? t('startDiscussion') : t('modeDirect')}
          </Button>
        </div>
      }
    >
      <p className={styles.subtitle}>{t('addFnSub')}</p>

      <div className={styles.contextBadge}>
        <span className={styles.contextLabel}>{t('statCMP')}:</span>
        <span className={styles.contextId}>{componentId}</span>
      </div>

      <div className={styles.modes}>
        <button
          type="button"
          className={`${styles.modeCard} ${mode === 'discuss' ? styles.modeActive : ''}`}
          onClick={() => setMode('discuss')}
          aria-pressed={mode === 'discuss'}
        >
          <MessageSquare size={20} className={styles.modeIcon} />
          <span className={styles.modeTitle}>{t('modeDiscuss')}</span>
          <span className={styles.modeSub}>{t('modeDiscussSub')}</span>
        </button>

        <button
          type="button"
          className={`${styles.modeCard} ${mode === 'direct' ? styles.modeActive : ''}`}
          onClick={() => setMode('direct')}
          aria-pressed={mode === 'direct'}
        >
          <Zap size={20} className={styles.modeIcon} />
          <span className={styles.modeTitle}>{t('modeDirect')}</span>
          <span className={styles.modeSub}>{t('modeDirectSub')}</span>
        </button>
      </div>

      <div className={styles.field}>
        <Input
          label={t('fnTitleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={t('fnTitleLabel')}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.textareaLabel} htmlFor="fn-notes">
          {t('notesLabel')}
        </label>
        <textarea
          id="fn-notes"
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={t('notesLabel')}
        />
      </div>
    </Modal>
  );
}
