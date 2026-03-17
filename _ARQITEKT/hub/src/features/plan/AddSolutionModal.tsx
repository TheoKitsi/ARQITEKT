import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Zap } from 'lucide-react';
import { useCreateSolutionMutation } from '@/store/api/requirementsApi';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './AddSolutionModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AddSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type CreationMode = 'discuss' | 'direct';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddSolutionModal({
  isOpen,
  onClose,
  projectId,
}: AddSolutionModalProps) {
  const { t } = useTranslation();

  const [mode, setMode] = useState<CreationMode>('discuss');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const [createSolution, { isLoading }] = useCreateSolutionMutation();

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
      await createSolution({
        projectId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        mode,
      }).unwrap();
      handleClose();
    } catch {
      // Error is handled by RTK Query — toast / error boundary
    }
  }, [title, notes, mode, projectId, createSolution, handleClose]);

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
      title={t('addSolTitle')}
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
      <p className={styles.subtitle}>{t('addSolSub')}</p>

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
          label={t('solTitleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={t('solTitleLabel')}
        />
      </div>

      {/* Notes textarea */}
      <div className={styles.field}>
        <label className={styles.textareaLabel} htmlFor="sol-notes">
          {t('notesLabel')}
        </label>
        <textarea
          id="sol-notes"
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
