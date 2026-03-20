import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Zap } from 'lucide-react';
import { useCreateComponentMutation } from '@/store/api/requirementsApi';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './AddArtifactModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userStoryId: string;
}

type CreationMode = 'discuss' | 'direct';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddComponentModal({
  isOpen,
  onClose,
  projectId,
  userStoryId,
}: AddComponentModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [mode, setMode] = useState<CreationMode>('direct');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const [createComponent, { isLoading }] = useCreateComponentMutation();

  const handleClose = useCallback(() => {
    setTitle('');
    setNotes('');
    setMode('direct');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    try {
      await createComponent({
        projectId,
        userStoryId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        mode,
      }).unwrap();
      handleClose();
    } catch {
      showToast(t('createCmpFailed', 'Failed to create component'), 'error');
    }
  }, [title, notes, mode, projectId, userStoryId, createComponent, handleClose, showToast, t]);

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
      title={t('addCmpTitle')}
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
      <p className={styles.subtitle}>{t('addCmpSub')}</p>

      <div className={styles.contextBadge}>
        <span className={styles.contextLabel}>{t('statUS')}:</span>
        <span className={styles.contextId}>{userStoryId}</span>
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
          label={t('cmpTitleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={t('cmpTitleLabel')}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.textareaLabel} htmlFor="cmp-notes">
          {t('notesLabel')}
        </label>
        <textarea
          id="cmp-notes"
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
