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
  onStageClick?: (stage: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Stage / gate maps                                                  */
/* ------------------------------------------------------------------ */

const STAGE_KEYS: Record<string, string> = {
  IDEA: 'stageIdea',
  BC: 'stageBC',
  SOL: 'stageSOL',
  US: 'stageUS',
  CMP: 'stageCMP',
  FN: 'stageFN',
  CODE: 'stageCode',
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
/*  Component — compact dot strip                                      */
/* ------------------------------------------------------------------ */

export function PipelineView({ projectId, onStageClick }: PipelineViewProps) {
  const { t } = useTranslation();
  const { data: pipeline, isLoading, isError, refetch } = useGetPipelineQuery(projectId);
  const [evaluateGate, { isLoading: isEvaluating }] = useEvaluateGateMutation();
  const [selectedGate, setSelectedGate] = useState<GateResult | null>(null);

  const handleRefresh = useCallback(async () => {
    const gateIds: GateId[] = [
      'G0_IDEA_TO_BC', 'G1_BC_TO_SOL', 'G2_SOL_TO_US',
      'G3_US_TO_CMP', 'G4_CMP_TO_FN', 'G5_FN_TO_CODE',
    ];
    await Promise.all(gateIds.map((gateId) => evaluateGate({ projectId, gateId })));
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
      </div>
    );
  }

  return (
    <div className={styles.pipeline}>
      {/* Compact dot strip */}
      <div className={styles.stages}>
        {STAGE_ORDER.map((stage, i) => {
          const nextStage = STAGE_ORDER[i + 1];
          const gateKey = `${stage}-${nextStage}`;
          const gateId = nextStage ? GATE_BETWEEN[gateKey] : undefined;
          const gateResult = gateId ? getGateResult(gateId) : undefined;
          const status = gateResult?.status ?? 'pending';

          // Determine stage label style based on preceding gate
          const prevStage = STAGE_ORDER[i - 1];
          const prevGateKey = prevStage ? `${prevStage}-${stage}` : undefined;
          const prevGateId = prevGateKey ? GATE_BETWEEN[prevGateKey] : undefined;
          const prevGateResult = prevGateId ? getGateResult(prevGateId) : undefined;
          const prevStatus = prevGateResult?.status;

          let labelClass = styles.stageLabel;
          if (i === 0) {
            // IDEA is always active
            labelClass = `${styles.stageLabel} ${styles.stageLabelActive}`;
          } else if (prevStatus === 'locked') {
            labelClass = `${styles.stageLabel} ${styles.stageLabelLocked}`;
          } else if (prevStatus === 'passed' || prevStatus === 'overridden') {
            labelClass = `${styles.stageLabel} ${styles.stageLabelActive}`;
          } else if (prevStatus === 'failed') {
            labelClass = `${styles.stageLabel} ${styles.stageLabelFailed}`;
          }

          const isLocked = status === 'locked';

          return (
            <div key={stage} className={styles.segment}>
              {/* Stage label */}
              <button
                type="button"
                className={labelClass}
                onClick={() => onStageClick?.(stage)}
                disabled={i !== 0 && prevStatus === 'locked'}
              >
                {t(STAGE_KEYS[stage] ?? stage)}
              </button>

              {/* Gate dot */}
              {gateId && (
                <>
                  <div className={`${styles.line} ${status === 'passed' || status === 'overridden' ? styles.linePassed : status === 'failed' ? styles.lineFailed : isLocked ? styles.lineLocked : ''}`} />
                  <button
                    type="button"
                    className={`${styles.dot} ${gateResult?.needsProbing && status === 'passed' ? styles.dot_probing : styles[`dot_${status}`] ?? ''}`}
                    onClick={() => !isLocked && gateResult && setSelectedGate(gateResult)}
                    aria-label={`G${gateId.charAt(1)}: ${status}${gateResult?.needsProbing ? ' (probing recommended)' : ''}`}
                    disabled={isLocked}
                    title={gateResult?.needsProbing ? t('needsProbing') : undefined}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Right side: overall + refresh */}
        <div className={styles.meta}>
          {pipeline && <ConfidenceBadge score={pipeline.overallConfidence} />}
          <Button
            variant="text"
            size="sm"
            icon={<RefreshCw size={12} />}
            onClick={handleRefresh}
            loading={isEvaluating}
          >
            {t('evaluate')}
          </Button>
        </div>
      </div>

      {/* Gate detail slide-in (kept) */}
      <GateDetail
        gate={selectedGate}
        projectId={projectId}
        onClose={() => setSelectedGate(null)}
      />
    </div>
  );
}
