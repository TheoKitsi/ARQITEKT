import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StatsBar } from './StatsBar';
import { FlowView } from './FlowView';
import { RequirementDetail } from './RequirementDetail';
import { AddSolutionModal } from './AddSolutionModal';
import { AddUserStoryModal } from './AddUserStoryModal';
import { ValidationOverlay } from './ValidationOverlay';
import type { TreeNode } from '@/store/api/requirementsApi';
import styles from './PlanTab.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showAddSol, setShowAddSol] = useState(false);
  const [showAddUS, setShowAddUS] = useState<string | null>(null); // solutionId
  const [showValidation, setShowValidation] = useState(false);

  return (
    <div className={styles.tab}>
      <StatsBar projectId={projectId!} />

      <section className={styles.flowArea}>
        <FlowView
          projectId={projectId!}
          onSelectNode={setSelectedNode}
          onAddUS={(solId) => setShowAddUS(solId)}
        />
      </section>

      {/* Detail slide-in */}
      <RequirementDetail
        node={selectedNode}
        projectId={projectId!}
        onClose={() => setSelectedNode(null)}
        onValidate={() => setShowValidation(true)}
      />

      {/* Add Solution modal */}
      <AddSolutionModal
        isOpen={showAddSol}
        onClose={() => setShowAddSol(false)}
        projectId={projectId!}
      />

      {/* Add User Story modal */}
      <AddUserStoryModal
        isOpen={!!showAddUS}
        onClose={() => setShowAddUS(null)}
        projectId={projectId!}
        solutionId={showAddUS ?? ''}
      />

      {/* Validation overlay */}
      <ValidationOverlay
        isOpen={showValidation}
        onClose={() => setShowValidation(false)}
        projectId={projectId!}
      />
    </div>
  );
}
