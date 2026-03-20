import { useState, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PipelineView } from './PipelineView';
import { FocusedView } from './FocusedView';
import { RequirementDialog } from './RequirementDialog';
import { AddSolutionModal } from './AddSolutionModal';
import { AddUserStoryModal } from './AddUserStoryModal';
import { AddComponentModal } from './AddComponentModal';
import { AddFunctionModal } from './AddFunctionModal';
import { ValidationOverlay } from './ValidationOverlay';
import { ProbingDialog } from './ProbingDialog';
import { Modal } from '@/components/ui/Modal';
import { useGetProjectQuery } from '@/store/api/projectsApi';
import { useGetTreeQuery, type TreeNode } from '@/store/api/requirementsApi';
import { Button } from '@/components/ui/Button';
import { ShieldCheck } from 'lucide-react';
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
  const { t } = useTranslation();
  const { data: project } = useGetProjectQuery(projectId!);
  const { data: tree } = useGetTreeQuery(projectId!);

  /* selectedNode = focused in FocusedView; dialogNode = open in RequirementDialog */
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showAddSol, setShowAddSol] = useState(false);
  const [showAddUS, setShowAddUS] = useState<string | null>(null);
  const [showAddCmp, setShowAddCmp] = useState<string | null>(null);
  const [showAddFn, setShowAddFn] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [probingArtifactId, setProbingArtifactId] = useState<string | null>(null);
  const [showIdeaDialog, setShowIdeaDialog] = useState(false);

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

  /* When user clicks a stage label in the pipeline strip */
  const handleStageClick = useCallback((stage: string) => {
    if (stage === 'IDEA') {
      setShowIdeaDialog(true);
      return;
    }

    // Find first node of the target artifact type
    if (!tree) return;
    const findByType = (nodes: TreeNode[], type: string): TreeNode | null => {
      for (const n of nodes) {
        if (n.type === type) return n;
        const child = findByType(n.children, type);
        if (child) return child;
      }
      return null;
    };

    const node = findByType(tree, stage);
    if (node) {
      handleOpenNode(node);
    }
  }, [tree, handleOpenNode]);

  /* When user clicks "+" to add a child under a parent node */
  const handleAddChild = useCallback((parentNode: TreeNode) => {
    switch (parentNode.type) {
      case 'BC':
        setShowAddSol(true);
        break;
      case 'SOL':
        setShowAddUS(parentNode.id);
        break;
      case 'US':
        setShowAddCmp(parentNode.id);
        break;
      case 'CMP':
        setShowAddFn(parentNode.id);
        break;
    }
  }, []);

  return (
    <div className={styles.tab}>
      <div className={styles.toolbar}>
        <PipelineView projectId={projectId!} onStageClick={handleStageClick} />
        <Button
          variant="outlined"
          size="sm"
          icon={<ShieldCheck size={14} />}
          onClick={() => setShowValidation(true)}
        >
          {t('validationTitle')}
        </Button>
      </div>

      <section className={styles.flowArea}>
        <FocusedView
          projectId={projectId!}
          selectedNode={selectedNode ?? dialogNode}
          onOpenNode={handleOpenNode}
          onAddChild={handleAddChild}
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

      {/* Add Component modal */}
      <AddComponentModal
        isOpen={!!showAddCmp}
        onClose={() => setShowAddCmp(null)}
        projectId={projectId!}
        userStoryId={showAddCmp ?? ''}
      />

      {/* Add Function modal */}
      <AddFunctionModal
        isOpen={!!showAddFn}
        onClose={() => setShowAddFn(null)}
        projectId={projectId!}
        componentId={showAddFn ?? ''}
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

      {/* Idea dialog — shows project name + description */}
      <Modal
        isOpen={showIdeaDialog}
        onClose={() => setShowIdeaDialog(false)}
        title={t('ideaDialogTitle')}
      >
        <div className={styles.ideaContent}>
          <div className={styles.ideaField}>
            <span className={styles.ideaLabel}>{t('ideaName')}</span>
            <span className={styles.ideaValue}>{project?.config.name ?? '—'}</span>
          </div>
          <div className={styles.ideaField}>
            <span className={styles.ideaLabel}>{t('ideaDescription')}</span>
            <span className={styles.ideaValue}>
              {project?.config.description || t('ideaNoDescription')}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
