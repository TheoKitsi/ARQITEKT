import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, ChevronsDownUp, Shield, FileText, Bell, MessageSquare } from 'lucide-react';
import {
  useGetTreeQuery,
  type TreeNode,
} from '@/store/api/requirementsApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SolutionCard } from './SolutionCard';
import styles from './FlowView.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlowViewProps {
  projectId: string;
  onSelectNode?: (node: TreeNode) => void;
  onAddUS?: (solId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FlowView({ projectId, onSelectNode, onAddUS }: FlowViewProps) {
  const { t } = useTranslation();
  const { data: tree, isLoading, isError, refetch } = useGetTreeQuery(projectId);

  /* ---- Local expand/collapse state ---- */
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());

  /* ---- Derive BC, solution, and cross-cutting nodes ---- */
  const { bcNode: _bcNode, solutions, crossCutting } = useMemo(() => {
    if (!tree || tree.length === 0) return { bcNode: null, solutions: [], crossCutting: [] };

    // Find the BC node (should be root-level)
    const bc = tree.find((n) => n.type === 'BC') ?? null;
    const sols = bc
      ? bc.children.filter((c) => c.type === 'SOL')
      : tree.filter((n) => n.type === 'SOL');

    // Cross-cutting entities at root level
    const ccTypes = new Set(['INF', 'ADR', 'NTF', 'FBK']);
    const cc = tree.filter((n) => ccTypes.has(n.type));

    return { bcNode: bc, solutions: sols, crossCutting: cc };
  }, [tree]);

  /* ---- Expand / Collapse handlers ---- */
  const toggleExpand = useCallback((id: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSet(new Set(solutions.map((s) => s.id)));
  }, [solutions]);

  const collapseAll = useCallback(() => {
    setExpandedSet(new Set());
  }, []);

  const handleSelectNode = useCallback(
    (node: TreeNode) => {
      onSelectNode?.(node);
    },
    [onSelectNode],
  );

  const handleAddUS = useCallback(
    (solId: string) => {
      onAddUS?.(solId);
    },
    [onAddUS],
  );

  /* ---- Render ---- */
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.center}>
        <p className={styles.errorText}>{t('errorLoad')}</p>
        <Button variant="outlined" size="sm" onClick={() => refetch()}>
          {t('refresh')}
        </Button>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className={styles.center}>
        <p className={styles.onboard}>{t('onboardHint')}</p>
      </div>
    );
  }

  const allExpanded = solutions.length > 0 && expandedSet.size === solutions.length;

  return (
    <section className={styles.flow}>
      {/* Action buttons */}
      <div className={styles.toolbar}>
        <Button
          variant="text"
          size="sm"
          icon={allExpanded ? <ChevronsDownUp size={16} /> : <ChevronsUpDown size={16} />}
          onClick={allExpanded ? collapseAll : expandAll}
        >
          {allExpanded ? t('collapseAllCards') : t('expandAllCards')}
        </Button>
      </div>

      {/* Solution cards */}
      <div className={styles.cards}>
        {solutions.map((sol) => (
          <SolutionCard
            key={sol.id}
            node={sol}
            expanded={expandedSet.has(sol.id)}
            onToggle={() => toggleExpand(sol.id)}
            onAddUS={handleAddUS}
            onSelectNode={handleSelectNode}
          />
        ))}
      </div>

      {/* Cross-cutting artifacts (INF, ADR, NTF, FBK) */}
      {crossCutting.length > 0 && (
        <div className={styles.crossCutting}>
          <h3 className={styles.crossCuttingTitle}>{t('crossCutting', 'Cross-cutting')}</h3>
          <div className={styles.crossCuttingGrid}>
            {crossCutting.map((node) => (
              <button
                key={node.id}
                className={styles.crossCuttingItem}
                onClick={() => handleSelectNode(node)}
              >
                <span className={styles.crossCuttingIcon}>
                  {node.type === 'INF' && <Shield size={14} />}
                  {node.type === 'ADR' && <FileText size={14} />}
                  {node.type === 'NTF' && <Bell size={14} />}
                  {node.type === 'FBK' && <MessageSquare size={14} />}
                </span>
                <span className={styles.crossCuttingLabel}>{node.id}</span>
                <span className={styles.crossCuttingName}>{node.title}</span>
                <Badge variant={node.status === 'approved' ? 'success' : node.status === 'review' ? 'warning' : 'default'}>
                  {node.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
