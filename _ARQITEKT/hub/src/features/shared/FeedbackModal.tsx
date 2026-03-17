import { useState, useCallback, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Star, Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCreateFeedbackMutation } from '@/store/api/feedbackApi';
import styles from './FeedbackModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type FeedbackSource = 'manual' | 'gplay' | 'appstore' | 'inapp' | 'email';
type FeedbackSeverity = 'wish' | 'improvement' | 'bug' | 'critical';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FeedbackModal({ isOpen, onClose, projectId }: FeedbackModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [source, setSource] = useState<FeedbackSource>('manual');
  const [severity, setSeverity] = useState<FeedbackSeverity>('improvement');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [description, setDescription] = useState('');

  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  /* ---- Source options ---- */
  const sourceOptions: { value: FeedbackSource; labelKey: string }[] = [
    { value: 'manual', labelKey: 'feedbackSourceManual' },
    { value: 'gplay', labelKey: 'feedbackSourceGPlay' },
    { value: 'appstore', labelKey: 'feedbackSourceAppStore' },
    { value: 'inapp', labelKey: 'feedbackSourceInApp' },
    { value: 'email', labelKey: 'feedbackSourceEmail' },
  ];

  /* ---- Severity options ---- */
  const severityOptions: { value: FeedbackSeverity; labelKey: string; color: string }[] = [
    { value: 'wish', labelKey: 'feedbackSevWish', color: 'var(--color-purple)' },
    { value: 'improvement', labelKey: 'feedbackSevImprovement', color: 'var(--color-accent)' },
    { value: 'bug', labelKey: 'feedbackSevBug', color: 'var(--color-orange)' },
    { value: 'critical', labelKey: 'feedbackSevCritical', color: 'var(--color-red)' },
  ];

  /* ---- Reset form ---- */
  const resetForm = useCallback(() => {
    setTitle('');
    setSource('manual');
    setSeverity('improvement');
    setRating(0);
    setHoveredStar(0);
    setDescription('');
  }, []);

  /* ---- Close ---- */
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      try {
        const feedback = await createFeedback({
          projectId,
          content: [
            `**${title.trim()}**`,
            `Source: ${source}`,
            `Severity: ${severity}`,
            `Rating: ${rating}/5`,
            '',
            description.trim(),
          ].join('\n'),
        }).unwrap();

        showToast(t('fbkSaved', { id: feedback.id }), 'success');
        handleClose();
      } catch {
        showToast(t('errorLoad'), 'error');
      }
    },
    [title, source, severity, rating, description, projectId, createFeedback, showToast, t, handleClose],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('fbkModalTitle')}
      footer={
        <div className={styles.footer}>
          <Button variant="outlined" size="md" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!title.trim()}
            icon={<Send size={16} />}
          >
            {t('save')}
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Title */}
        <Input
          label={t('fbkTitleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('feedbackTitle')}
          required
          autoFocus
          icon={<MessageSquare size={16} />}
        />

        {/* Source */}
        <div className={styles.field}>
          <label className={styles.label}>{t('fbkSource')}</label>
          <div className={styles.chipGroup}>
            {sourceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.chip} ${source === opt.value ? styles.chipSelected : ''}`}
                onClick={() => setSource(opt.value)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className={styles.field}>
          <label className={styles.label}>{t('fbkSeverity')}</label>
          <div className={styles.chipGroup}>
            {severityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.severityChip} ${severity === opt.value ? styles.severityChipSelected : ''}`}
                style={{
                  '--severity-color': opt.color,
                } as React.CSSProperties}
                onClick={() => setSeverity(opt.value)}
              >
                <span
                  className={styles.severityDot}
                  style={{ backgroundColor: opt.color }}
                />
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className={styles.field}>
          <label className={styles.label}>{t('fbkRating')}</label>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${(hoveredStar || rating) >= star ? styles.starFilled : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={24}
                  fill={(hoveredStar || rating) >= star ? 'var(--color-brand-gold)' : 'none'}
                  stroke={(hoveredStar || rating) >= star ? 'var(--color-brand-gold)' : 'var(--color-text-tertiary)'}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className={styles.ratingText}>{rating}/5</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fbk-desc">
            {t('fbkDesc')}
          </label>
          <textarea
            id="fbk-desc"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('fbkDesc')}
            rows={4}
          />
        </div>
      </form>
    </Modal>
  );
}
