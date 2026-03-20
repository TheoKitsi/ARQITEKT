import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import type { TreeNode } from '@/store/api/requirementsApi';
import { useGetTreeQuery } from '@/store/api/requirementsApi';
import { Badge } from '@/components/ui/Badge';
import styles from './FocusedView.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FocusedViewProps {
  projectId: string;
  selectedNode: TreeNode | null;
  onOpenNode: (node: TreeNode) => void;
}

/* ------------------------------------------------------------------ */
/*  Type variant                                                       */
/* ------------------------------------------------------------------ */

const TYPE_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'gold' | 'error'> = {
  BC: 'gold', SOL: 'info', US: 'success', CMP: 'warning',
  FN: 'default', CONV: 'default', INF: 'default', ADR: 'default',
  NTF: 'default', FBK: 'error',
};

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'success'> = {
  idea: 'default', draft: 'default', review: 'warning', approved: 'success', implemented: 'success',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FocusedView({ projectId, selectedNode, onOpenNode }: FocusedViewProps) {
  const { t } = useTranslation();
  const { data: tree } = useGetTreeQuery(projectId);

  /* Find full node with children from tree data */
  const fullNode = useMemo(() => {
    if (!selectedNode || !tree) return null;
    const findById = (nodes: TreeNode[]): TreeNode | null => {
      for (const n of nodes) {
        if (n.id === selectedNode.id) return n;
        const child = findById(n.children);
        if (child) return child;
      }
      return null;
    };
    return findById(tree);
  }, [selectedNode, tree]);

  /* ---- Welcome screen ---- */
  if (!fullNode) {
    return (
      <div className={styles.welcome}>
        <p className={styles.welcomeText}>{t('onboardHint')}</p>
      </div>
    );
  }

  /* ---- Node context ---- */
  const children = fullNode.children;

  return (
    <section className={styles.focused}>
      {/* Selected node header */}
      <div className={styles.nodeHeader}>
        <Badge variant={TYPE_VARIANT[fullNode.type] ?? 'default'}>{fullNode.type}</Badge>
        <span className={styles.nodeId}>{fullNode.id}</span>
        <h3 className={styles.nodeTitle}>{fullNode.title}</h3>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => onOpenNode(fullNode)}
          aria-label={t('edit')}
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* Children cards */}
      {children.length > 0 ? (
        <div className={styles.childGrid}>
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              className={styles.childCard}
              onClick={() => onOpenNode(child)}
            >
              <div className={styles.childHeader}>
                <Badge variant={TYPE_VARIANT[child.type] ?? 'default'}>{child.type}</Badge>
                <span className={styles.childId}>{child.id}</span>
                <Badge variant={STATUS_VARIANT[child.status] ?? 'default'}>{child.status}</Badge>
              </div>
              <span className={styles.childTitle}>{child.title}</span>
              {child.children.length > 0 && (
                <span className={styles.childSub}>
                  {child.children.length} {t('detailChildren')}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyChildren}>{t('noRequirements')}</p>
      )}
    </section>
  );
}
