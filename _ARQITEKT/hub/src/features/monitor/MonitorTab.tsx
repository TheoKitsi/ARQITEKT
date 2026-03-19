import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppStatusPanel } from './AppStatusPanel';
import { AuditPanel } from './AuditPanel';
import { BaselinePanel } from './BaselinePanel';
import { FeedbackPanel } from './FeedbackPanel';
import { ValidationPanel } from './ValidationPanel';
import { LogViewerPanel } from './LogViewerPanel';
import { LlmUsagePanel } from './LlmUsagePanel';
import { MembersPanel } from './MembersPanel';
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
      <LogViewerPanel />
      <BaselinePanel />
      <FeedbackPanel onAddFeedback={() => setFeedbackModalOpen(true)} />
      <ValidationPanel />
      <LlmUsagePanel />
      <MembersPanel />
      <AuditPanel />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        projectId={projectId!}
      />
    </div>
  );
}
