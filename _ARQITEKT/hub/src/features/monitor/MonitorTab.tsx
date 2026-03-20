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
import { TraceabilityPanel } from '@/features/plan/TraceabilityPanel';
import styles from './MonitorTab.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MonitorTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <div className={styles.tab}>
      {/* Full-width status row */}
      <AppStatusPanel />

      {/* 2-column grid for remaining panels */}
      <div className={styles.grid}>
        <LogViewerPanel />
        <BaselinePanel />
        <div className={styles.fullWidth}>
          <TraceabilityPanel projectId={projectId!} />
        </div>
        <FeedbackPanel onAddFeedback={() => setFeedbackModalOpen(true)} />
        <ValidationPanel />
        <LlmUsagePanel />
        <MembersPanel />
        <div className={styles.fullWidth}>
          <AuditPanel />
        </div>
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        projectId={projectId!}
      />
    </div>
  );
}
