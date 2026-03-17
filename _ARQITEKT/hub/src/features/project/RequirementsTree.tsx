import { useState, useCallback, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useGetTreeQuery, type TreeNode } from '@/store/api/requirementsApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './RequirementsTree.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RequirementsTreeProps {
  projectId: string;
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
}

/** Metamodel node types that belong to the main hierarchy. */
const HIERARCHY_TYPES = new Set(['BC', 'SOL', 'US', 'CMP', 'FN', 'CONV']);

/** Metamodel node types that are cross-cutting concerns. */
const CROSS_CUTTING_TYPES = new Set(['INF', 'ADR', 'NTF', 'FBK']);

/* ------------------------------------------------------------------ */
/*  Type badge class mapping                                           */
/* ------------------------------------------------------------------ */

const typeBadgeClass: Record<string, string> = {
  BC: styles.typeBC!,
  SOL: styles.typeSOL!,
  US: styles.typeUS!,
  CMP: styles.typeCMP!,
  FN: styles.typeFN!,
  CONV: styles.typeCONV!,
  INF: styles.typeCrossCut!,
  ADR: styles.typeCrossCut!,
  NTF: styles.typeCrossCut!,
  FBK: styles.typeCrossCut!,
};

/* ------------------------------------------------------------------ */
/*  Status dot class mapping                                           */
/* ------------------------------------------------------------------ */

const statusDotClass: Record<string, string> = {
  idea: styles.statusIdea!,
  draft: styles.statusDraft!,
  review: styles.statusReview!,
  approved: styles.statusApproved!,
  implemented: styles.statusImplemented!,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Recursively partition nodes into hierarchy vs cross-cutting. */
function partitionNodes(nodes: TreeNode[]): {
  hierarchy: TreeNode[];
  crossCutting: TreeNode[];
} {
  const hierarchy: TreeNode[] = [];
  const crossCutting: TreeNode[] = [];

  for (const node of nodes) {
    if (CROSS_CUTTING_TYPES.has(node.type)) {
      crossCutting.push(node);
    } else if (HIERARCHY_TYPES.has(node.type)) {
      hierarchy.push(node);
    }
    // Recurse into children to find nested cross-cutting items
    if (node.children && node.children.length > 0) {
      const nested = partitionNodes(node.children);
      crossCutting.push(...nested.crossCutting);
    }
  }

  return { hierarchy, crossCutting };
}

/* ------------------------------------------------------------------ */
/*  TreeNodeRow                                                        */
/* ------------------------------------------------------------------ */

interface TreeNodeRowProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  selectedId?: string;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, node: TreeNode) => void;
}

function TreeNodeRow({
  node,
  depth,
  expanded,
  selectedId,
  onToggle,
  onSelect,
  onKeyDown,
}: TreeNodeRowProps) {
  const hierarchyChildren = (node.children ?? []).filter((c) =>
    HIERARCHY_TYPES.has(c.type),
  );
  const hasChildren = hierarchyChildren.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  const rowClasses = [
    styles.nodeRow,
    isSelected ? styles.nodeRowSelected : '',
  ]
    .filter(Boolean)
    .join(' ');

  const chevronClasses = [
    styles.chevron,
    isExpanded ? styles.chevronExpanded : '',
    !hasChildren ? styles.chevronHidden : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeClasses = [styles.typeBadge, typeBadgeClass[node.type] ?? styles.typeCrossCut]
    .filter(Boolean)
    .join(' ');

  const dotClasses = [styles.statusDot, statusDotClass[node.status] ?? styles.statusIdea]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
    onSelect(node);
  };

  return (
    <li>
      <div
        className={rowClasses}
        role="treeitem"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={depth + 1}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
        onKeyDown={(e) => onKeyDown(e, node)}
      >
        <span className={chevronClasses} aria-hidden="true">
          <ChevronRight size={12} />
        </span>
        <span className={badgeClasses}>{node.type}</span>
        <span className={styles.nodeTitle} title={node.title}>
          {node.title}
        </span>
        <span
          className={dotClasses}
          title={node.status}
          aria-label={node.status}
        />
      </div>

      {hasChildren && isExpanded && (
        <ul className={styles.treeList} role="group">
          {hierarchyChildren.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
              onKeyDown={onKeyDown}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  CrossCuttingRow                                                    */
/* ------------------------------------------------------------------ */

interface CrossCuttingRowProps {
  node: TreeNode;
  selectedId?: string;
  onSelect: (node: TreeNode) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, node: TreeNode) => void;
}

function CrossCuttingRow({
  node,
  selectedId,
  onSelect,
  onKeyDown,
}: CrossCuttingRowProps) {
  const isSelected = selectedId === node.id;

  const rowClasses = [
    styles.nodeRow,
    isSelected ? styles.nodeRowSelected : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeClasses = [styles.typeBadge, typeBadgeClass[node.type] ?? styles.typeCrossCut]
    .filter(Boolean)
    .join(' ');

  const dotClasses = [styles.statusDot, statusDotClass[node.status] ?? styles.statusIdea]
    .filter(Boolean)
    .join(' ');

  return (
    <li>
      <div
        className={rowClasses}
        role="treeitem"
        tabIndex={0}
        aria-selected={isSelected}
        style={{ paddingLeft: '4px' }}
        onClick={() => onSelect(node)}
        onKeyDown={(e) => onKeyDown(e, node)}
      >
        <span className={styles.chevron + ' ' + styles.chevronHidden} aria-hidden="true">
          <ChevronRight size={12} />
        </span>
        <span className={badgeClasses}>{node.type}</span>
        <span className={styles.nodeTitle} title={node.title}>
          {node.title}
        </span>
        <span
          className={dotClasses}
          title={node.status}
          aria-label={node.status}
        />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  RequirementsTree                                                   */
/* ------------------------------------------------------------------ */

export function RequirementsTree({
  projectId,
  selectedId: controlledSelectedId,
  onSelect,
}: RequirementsTreeProps) {
  const { t } = useTranslation();
  const { data: tree, isLoading, isError } = useGetTreeQuery(projectId);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>();

  const selectedId = controlledSelectedId ?? internalSelectedId;

  /* Toggle expand/collapse */
  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /* Select a node */
  const handleSelect = useCallback(
    (node: TreeNode) => {
      setInternalSelectedId(node.id);
      onSelect?.(node);
    },
    [onSelect],
  );

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, node: TreeNode) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const allRowsDown = e.currentTarget
            .closest('[role="tree"]')
            ?.querySelectorAll<HTMLElement>('[role="treeitem"]');
          if (allRowsDown) {
            const arr = Array.from(allRowsDown);
            const domIdx = arr.indexOf(e.currentTarget);
            if (domIdx >= 0 && domIdx + 1 < arr.length) {
              arr[domIdx + 1]?.focus();
            }
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const allRows = e.currentTarget
            .closest('[role="tree"]')
            ?.querySelectorAll<HTMLElement>('[role="treeitem"]');
          if (allRows) {
            const arr = Array.from(allRows);
            const domIdx = arr.indexOf(e.currentTarget);
            if (domIdx > 0) {
              arr[domIdx - 1]?.focus();
            }
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const hierarchyChildren = (node.children ?? []).filter((c) =>
            HIERARCHY_TYPES.has(c.type),
          );
          if (hierarchyChildren.length > 0 && !expanded.has(node.id)) {
            handleToggle(node.id);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (expanded.has(node.id)) {
            handleToggle(node.id);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          handleSelect(node);
          const hierarchyChildren = (node.children ?? []).filter((c) =>
            HIERARCHY_TYPES.has(c.type),
          );
          if (hierarchyChildren.length > 0) {
            handleToggle(node.id);
          }
          break;
        }
        default:
          break;
      }
    },
    [expanded, handleToggle, handleSelect],
  );

  /* ---------- Loading state ---------- */
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="sm" />
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (isError) {
    return (
      <p className={styles.errorText}>{t('errorPrefix', 'Error: ')}</p>
    );
  }

  /* ---------- Empty state ---------- */
  if (!tree || tree.length === 0) {
    return (
      <div className={styles.center}>
        <p className={styles.emptyText}>{t('noRequirements', 'No requirements yet')}</p>
      </div>
    );
  }

  /* ---------- Partition hierarchy vs cross-cutting ---------- */
  const { hierarchy, crossCutting } = partitionNodes(tree);

  return (
    <div className={styles.container} role="tree" aria-label={t('requirements', 'Requirements')}>
      {/* Main hierarchy: BC -> SOL -> US -> CMP -> FN */}
      {hierarchy.length > 0 && (
        <ul className={styles.treeList} role="group">
          {hierarchy.map((node) => (
            <TreeNodeRow
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={handleToggle}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown}
            />
          ))}
        </ul>
      )}

      {/* Cross-cutting concerns: INF, ADR, NTF, FBK */}
      {crossCutting.length > 0 && (
        <>
          <div className={styles.sectionLabel}>
            {t('crossCutting', 'Cross-cutting')}
          </div>
          <ul className={styles.treeList} role="group">
            {crossCutting.map((node) => (
              <CrossCuttingRow
                key={node.id}
                node={node}
                selectedId={selectedId}
                onSelect={handleSelect}
                onKeyDown={handleKeyDown}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
