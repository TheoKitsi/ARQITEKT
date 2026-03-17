import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppStatusPanel } from './AppStatusPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { ValidationPanel } from './ValidationPanel';
import { FeedbackModal } from '@/features/shared/FeedbackModal';
import styles from './MonitorTab.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MonitorTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <div className={styles.tab}>
      <AppStatusPanel />
      <FeedbackPanel onAddFeedback={() => setFeedbackModalOpen(true)} />
      <ValidationPanel />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        projectId={projectId!}
      />
    </div>
  );
}
