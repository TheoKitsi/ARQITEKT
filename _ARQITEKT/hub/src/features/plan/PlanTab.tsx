import { useState, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { PipelineView } from './PipelineView';
import { FocusedView } from './FocusedView';
import { RequirementDialog } from './RequirementDialog';
import { AddSolutionModal } from './AddSolutionModal';
import { AddUserStoryModal } from './AddUserStoryModal';
import { ValidationOverlay } from './ValidationOverlay';
import { TraceabilityPanel } from './TraceabilityPanel';
import { ProbingDialog } from './ProbingDialog';
import type { TreeNode } from '@/store/api/requirementsApi';
import styles from './PlanTab.module.css';

/* ------------------------------------------------------------------ */
/*  Outlet context type (provided by ProjectLayout)                    */
/* ------------------------------------------------------------------ */

export interface PlanOutletContext {
  openNode: TreeNode | null;
  setOpenNode: (node: TreeNode | null) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlanTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const ctx = useOutletContext<PlanOutletContext | undefined>();

  /* selectedNode = focused in FocusedView; dialogNode = open in RequirementDialog */
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showAddSol, setShowAddSol] = useState(false);
  const [showAddUS, setShowAddUS] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [probingArtifactId, setProbingArtifactId] = useState<string | null>(null);

  /* If tree pushes a node via context, show it in the dialog */
  const dialogNode = ctx?.openNode ?? null;
  const closeDialog = useCallback(() => ctx?.setOpenNode(null), [ctx]);

  /* When user clicks a child card in FocusedView, open the dialog */
  const handleOpenNode = useCallback((node: TreeNode) => {
    if (ctx) {
      ctx.setOpenNode(node);
    } else {
      setSelectedNode(node);
    }
  }, [ctx]);

  return (
    <div className={styles.tab}>
      <PipelineView projectId={projectId!} />

      <TraceabilityPanel projectId={projectId!} />

      <section className={styles.flowArea}>
        <FocusedView
          projectId={projectId!}
          selectedNode={selectedNode ?? dialogNode}
          onOpenNode={handleOpenNode}
        />
      </section>

      {/* Requirement edit dialog (centered modal with Monaco) */}
      <RequirementDialog
        node={dialogNode}
        projectId={projectId!}
        onClose={closeDialog}
        onProbe={(artifactId) => setProbingArtifactId(artifactId)}
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

      {/* Probing dialog */}
      <ProbingDialog
        isOpen={!!probingArtifactId}
        onClose={() => setProbingArtifactId(null)}
        projectId={projectId!}
        artifactId={probingArtifactId ?? ''}
      />
    </div>
  );
}
