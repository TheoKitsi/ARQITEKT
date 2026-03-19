import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  useGetPipelineQuery,
  useEvaluateGateMutation,
  type GateResult,
  type GateId,
} from '@/store/api/pipelineApi';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { GateDetail } from './GateDetail';
import styles from './PipelineView.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PipelineViewProps {
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Stage definitions (entities between gates)                         */
/* ------------------------------------------------------------------ */

const STAGE_LABELS: Record<string, string> = {
  IDEA: 'Idea',
  BC: 'BC',
  SOL: 'SOL',
  US: 'US',
  CMP: 'CMP',
  FN: 'FN',
  CODE: 'Code',
};

const STAGE_ORDER = ['IDEA', 'BC', 'SOL', 'US', 'CMP', 'FN', 'CODE'];

const GATE_BETWEEN: Record<string, GateId> = {
  'IDEA-BC': 'G0_IDEA_TO_BC',
  'BC-SOL': 'G1_BC_TO_SOL',
  'SOL-US': 'G2_SOL_TO_US',
  'US-CMP': 'G3_US_TO_CMP',
  'CMP-FN': 'G4_CMP_TO_FN',
  'FN-CODE': 'G5_FN_TO_CODE',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PipelineView({ projectId }: PipelineViewProps) {
  const { t } = useTranslation();
  const { data: pipeline, isLoading, isError, refetch } = useGetPipelineQuery(projectId);
  const [evaluateGate, { isLoading: isEvaluating }] = useEvaluateGateMutation();
  const [selectedGate, setSelectedGate] = useState<GateResult | null>(null);

  const handleGateClick = useCallback((gate: GateResult) => {
    setSelectedGate(gate);
  }, []);

  const handleRefresh = useCallback(async () => {
    // Re-evaluate all gates sequentially
    const gateIds: GateId[] = [
      'G0_IDEA_TO_BC', 'G1_BC_TO_SOL', 'G2_SOL_TO_US',
      'G3_US_TO_CMP', 'G4_CMP_TO_FN', 'G5_FN_TO_CODE',
    ];
    for (const gateId of gateIds) {
      await evaluateGate({ projectId, gateId });
    }
    refetch();
  }, [projectId, evaluateGate, refetch]);

  const getGateResult = useCallback((gateId: GateId): GateResult | undefined => {
    return pipeline?.gates.find((g) => g.gateId === gateId);
  }, [pipeline]);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="sm" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.center}>
        <span className={styles.errorText}>{t('errorLoad')}</span>
        <Button variant="text" size="sm" onClick={() => refetch()}>
          {t('refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.pipeline}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>Pipeline</span>
        <div className={styles.overallScore}>
          {pipeline && (
            <ConfidenceBadge score={pipeline.overallConfidence} />
          )}
          <Button
            variant="text"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={handleRefresh}
            loading={isEvaluating}
          >
            {t('evaluate')}
          </Button>
        </div>
      </div>

      {/* Horizontal pipeline */}
      <div className={styles.stages}>
        {STAGE_ORDER.map((stage, i) => {
          const nextStage = STAGE_ORDER[i + 1];
          const gateKey = `${stage}-${nextStage}`;
          const gateId = nextStage ? GATE_BETWEEN[gateKey] : undefined;
          const gateResult = gateId ? getGateResult(gateId) : undefined;

          return (
            <StageSegment
              key={stage}
              label={STAGE_LABELS[stage] ?? stage}
              gateResult={gateResult}
              gateId={gateId}
              showConnector={!!nextStage}
              onGateClick={handleGateClick}
            />
          );
        })}
      </div>

      {/* Gate detail slide-in */}
      <GateDetail
        gate={selectedGate}
        projectId={projectId}
        onClose={() => setSelectedGate(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StageSegment – one entity label + optional gate + connector        */
/* ------------------------------------------------------------------ */

interface StageSegmentProps {
  label: string;
  gateResult?: GateResult;
  gateId?: GateId;
  showConnector: boolean;
  onGateClick: (gate: GateResult) => void;
}

function StageSegment({ label, gateResult, gateId, showConnector, onGateClick }: StageSegmentProps) {
  const status = gateResult?.status ?? 'pending';

  const statusClass = {
    passed: styles.gatePassed,
    failed: styles.gateFailed,
    pending: styles.gatePending,
    overridden: styles.gateOverridden,
  }[status];

  const connectorClass = status === 'passed' || status === 'overridden'
    ? styles.connectorPassed
    : status === 'failed'
      ? styles.connectorFailed
      : '';

  const gateNumber = gateId ? gateId.charAt(1) : '';

  return (
    <>
      {/* Entity stage */}
      <div className={styles.stage}>
        <span className={styles.stageLabel}>{label}</span>
        <ConfidenceBadge score={gateResult?.confidence ?? null} />
      </div>

      {/* Gate + connector */}
      {showConnector && (
        <>
          <div className={[styles.connector, connectorClass].filter(Boolean).join(' ')} />
          <div
            className={[styles.gate, statusClass].filter(Boolean).join(' ')}
            onClick={gateResult ? () => onGateClick(gateResult) : undefined}
            onKeyDown={gateResult ? (e) => { if (e.key === 'Enter') onGateClick(gateResult); } : undefined}
            role="button"
            tabIndex={0}
            aria-label={`Gate ${gateNumber}: ${status}`}
          >
            <div className={styles.gateCircle}>
              {status === 'passed' ? '\u2713' : status === 'failed' ? '\u2717' : `G${gateNumber}`}
            </div>
            <span className={styles.gateId}>G{gateNumber}</span>
          </div>
          <div className={[styles.connector, connectorClass].filter(Boolean).join(' ')} />
        </>
      )}
    </>
  );
}
