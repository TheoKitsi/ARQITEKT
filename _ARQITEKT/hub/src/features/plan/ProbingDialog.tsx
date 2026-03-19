import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import {
  useStartProbingMutation,
  useGetProbingQuestionsQuery,
  useAnswerQuestionMutation,
  useSkipQuestionMutation,
  type ProbingQuestion,
} from '@/store/api/pipelineApi';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import styles from './ProbingDialog.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProbingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  artifactId: string;
}

/* ------------------------------------------------------------------ */
/*  Agent type → badge variant                                          */
/* ------------------------------------------------------------------ */

const AGENT_VARIANT: Record<string, 'info' | 'warning' | 'success' | 'error' | 'gold'> = {
  socratic: 'info',
  devils_advocate: 'error',
  constraint: 'warning',
  example: 'success',
  boundary: 'gold',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProbingDialog({
  isOpen,
  onClose,
  projectId,
  artifactId,
}: ProbingDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [startProbing, { isLoading: isStarting }] = useStartProbingMutation();
  const { data: session, refetch } = useGetProbingQuestionsQuery(
    { projectId, artifactId },
    { skip: !isOpen },
  );
  const [answerQuestion, { isLoading: isAnswering }] = useAnswerQuestionMutation();
  const [skipQuestion, { isLoading: isSkipping }] = useSkipQuestionMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  /* ---- Derived state ---- */
  const questions = useMemo(() => session?.questions ?? [], [session]);
  const openQuestions = useMemo(() => questions.filter((q) => q.status === 'open'), [questions]);
  const currentQuestion = openQuestions[currentIndex] as ProbingQuestion | undefined;
  const answered = questions.filter((q) => q.status === 'answered').length;
  const skipped = questions.filter((q) => q.status === 'skipped').length;
  const total = questions.length;
  const completed = total > 0 && openQuestions.length === 0;
  const progressPercent = total > 0 ? ((answered + skipped) / total) * 100 : 0;

  /* ---- Start probing session ---- */
  const handleStart = useCallback(async () => {
    try {
      await startProbing({ projectId, artifactId }).unwrap();
      refetch();
      setCurrentIndex(0);
    } catch {
      showToast(t('errorGeneric'), 'error');
    }
  }, [projectId, artifactId, startProbing, refetch, showToast, t]);

  /* ---- Answer ---- */
  const handleAnswer = useCallback(async () => {
    if (!currentQuestion || !selectedOption) return;
    try {
      await answerQuestion({
        projectId,
        artifactId,
        questionId: currentQuestion.id,
        answer: selectedOption,
      }).unwrap();
      setSelectedOption(null);
      setShowWhy(false);
      refetch();
    } catch {
      showToast(t('errorGeneric'), 'error');
    }
  }, [currentQuestion, selectedOption, projectId, artifactId, answerQuestion, refetch, showToast, t]);

  /* ---- Skip ---- */
  const handleSkip = useCallback(async () => {
    if (!currentQuestion || !skipReason.trim()) return;
    try {
      await skipQuestion({
        projectId,
        artifactId,
        questionId: currentQuestion.id,
        reason: skipReason.trim(),
      }).unwrap();
      setSkipReason('');
      setShowSkip(false);
      setSelectedOption(null);
      refetch();
    } catch {
      showToast(t('errorGeneric'), 'error');
    }
  }, [currentQuestion, skipReason, projectId, artifactId, skipQuestion, refetch, showToast, t]);

  /* ---- Close + reset ---- */
  const handleClose = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowWhy(false);
    setShowSkip(false);
    setSkipReason('');
    onClose();
  }, [onClose]);

  /* ---- Render body ---- */
  const renderBody = () => {
    // No session yet
    if (total === 0) {
      return (
        <div className={styles.dialog}>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
            {t('probingDescription')}
          </p>
          <Button variant="gold" onClick={handleStart} loading={isStarting}>
            {t('startProbing')}
          </Button>
        </div>
      );
    }

    // All completed
    if (completed) {
      return (
        <div className={styles.complete}>
          <CheckCircle size={48} className={styles.completeIcon} />
          <h3 className={styles.completeTitle}>{t('probingComplete')}</h3>
          <p className={styles.completeSubtext}>
            {answered} {t('answered')}, {skipped} {t('skipped')}
          </p>
          <Button variant="gold" onClick={handleClose}>
            {t('close')}
          </Button>
        </div>
      );
    }

    // Active question
    if (!currentQuestion) {
      return <Spinner size="sm" />;
    }

    return (
      <div className={styles.dialog}>
        {/* Progress */}
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.progressText}>
            {answered + skipped}/{total}
          </span>
        </div>

        {/* Question */}
        <div className={styles.questionHeader}>
          <p className={styles.questionText}>{currentQuestion.question}</p>
          <Badge variant={AGENT_VARIANT[currentQuestion.agentType] ?? 'default'}>
            {currentQuestion.agentType.replace('_', ' ')}
          </Badge>
        </div>

        {/* Options */}
        <div className={styles.options}>
          {currentQuestion.options.map((opt) => (
            <div
              key={opt.id}
              className={[
                styles.option,
                selectedOption === opt.id ? styles.optionSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedOption(opt.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOption(opt.id); } }}
              role="radio"
              aria-checked={selectedOption === opt.id}
              tabIndex={0}
            >
              <div className={styles.optionRadio} />
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>{opt.label}</span>
                <span className={styles.optionImpact}>{opt.impact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Why important */}
        {currentQuestion.whyImportant && (
          <>
            <button
              className={styles.whyToggle}
              onClick={() => setShowWhy((v) => !v)}
              type="button"
            >
              {showWhy ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {t('whyImportant')}
            </button>
            {showWhy && (
              <div className={styles.whyContent}>{currentQuestion.whyImportant}</div>
            )}
          </>
        )}

        {/* Skip section */}
        {currentQuestion.canSkip && (
          <div className={styles.skipSection}>
            {!showSkip ? (
              <Button variant="text" size="sm" onClick={() => setShowSkip(true)}>
                {t('skipQuestion')}
              </Button>
            ) : (
              <div className={styles.skipRow}>
                <Input
                  inputSize="sm"
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder={t('skipReasonPlaceholder')}
                />
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleSkip}
                  loading={isSkipping}
                  disabled={!skipReason.trim()}
                >
                  {t('skip')}
                </Button>
                <Button variant="text" size="sm" onClick={() => setShowSkip(false)}>
                  {t('cancel')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="gold"
            onClick={handleAnswer}
            loading={isAnswering}
            disabled={!selectedOption}
          >
            {t('submitAnswer')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('probingTitle')}
      footer={undefined}
    >
      {renderBody()}
    </Modal>
  );
}
