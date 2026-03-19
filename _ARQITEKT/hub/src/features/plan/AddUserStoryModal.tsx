import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Zap } from 'lucide-react';
import { useCreateUserStoryMutation } from '@/store/api/requirementsApi';
import { useGetNextUsIdQuery } from '@/store/api/requirementsApi';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './AddUserStoryModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AddUserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  solutionId: string;
}

type CreationMode = 'discuss' | 'direct';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddUserStoryModal({
  isOpen,
  onClose,
  projectId,
  solutionId,
}: AddUserStoryModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [mode, setMode] = useState<CreationMode>('discuss');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const [createUS, { isLoading }] = useCreateUserStoryMutation();
  const { data: nextId } = useGetNextUsIdQuery(
    { projectId, sol: solutionId },
    { skip: !isOpen },
  );

  /* ---- Reset state on close ---- */
  const handleClose = useCallback(() => {
    setTitle('');
    setNotes('');
    setMode('discuss');
    onClose();
  }, [onClose]);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    try {
      await createUS({
        projectId,
        solutionId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        mode,
      }).unwrap();
      handleClose();
    } catch {
      showToast(t('createUSFailed', 'Failed to create user story'), 'error');
    }
  }, [title, notes, mode, projectId, solutionId, createUS, handleClose, showToast, t]);

  /* ---- Key handler for form submission ---- */
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
      title={t('addUSModalTitle')}
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
      {/* Subtitle */}
      <p className={styles.subtitle}>{t('addUSSub')}</p>

      {/* Solution context */}
      <div className={styles.contextBadge}>
        <span className={styles.contextLabel}>{t('statSOL')}:</span>
        <span className={styles.contextId}>{solutionId}</span>
      </div>

      {/* Mode selector */}
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

      {/* Title input */}
      <div className={styles.field}>
        <Input
          label={`${t('usTitleLabel')}${nextId?.nextId ? ` (${nextId.nextId})` : ''}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={t('usTitleLabel')}
        />
      </div>

      {/* Notes textarea */}
      <div className={styles.field}>
        <label className={styles.textareaLabel} htmlFor="us-notes">
          {t('notesLabel')}
        </label>
        <textarea
          id="us-notes"
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
