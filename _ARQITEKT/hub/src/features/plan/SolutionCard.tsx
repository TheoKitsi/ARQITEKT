import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { TreeNode } from '@/store/api/requirementsApi';
import { Badge } from '@/components/ui/Badge';
import styles from './SolutionCard.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SolutionCardProps {
  node: TreeNode;
  expanded: boolean;
  onToggle: () => void;
  onAddUS: (solId: string) => void;
  onSelectNode: (node: TreeNode) => void;
}

/* ------------------------------------------------------------------ */
/*  Status → Badge variant mapping                                     */
/* ------------------------------------------------------------------ */

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'gold'> = {
  idea: 'default',
  draft: 'info',
  review: 'warning',
  approved: 'success',
  implemented: 'gold',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function countByType(children: TreeNode[], type: string): number {
  let count = 0;
  for (const child of children) {
    if (child.type === type) count++;
    if (child.children.length > 0) {
      count += countByType(child.children, type);
    }
  }
  return count;
}

/* ------------------------------------------------------------------ */
/*  Progress dots                                                      */
/* ------------------------------------------------------------------ */

interface DotInfo {
  labelKey: string;
  filled: boolean;
}

function computeDots(node: TreeNode): DotInfo[] {
  const userStories = node.children.filter((c) => c.type === 'US');
  const hasUS = userStories.length > 0;

  // All US have at least 1 CMP
  const allUSHaveCMP =
    hasUS && userStories.every((us) => us.children.some((c) => c.type === 'CMP'));

  // All CMP have at least 1 FN
  const allCMPHaveFN =
    allUSHaveCMP &&
    userStories.every((us) =>
      us.children
        .filter((c) => c.type === 'CMP')
        .every((cmp) => cmp.children.some((fn) => fn.type === 'FN')),
    );

  const inReviewOrBeyond =
    node.status === 'review' ||
    node.status === 'approved' ||
    node.status === 'implemented';

  return [
    { labelKey: 'solDotSolution', filled: true },
    { labelKey: 'solDotScenarios', filled: hasUS },
    { labelKey: 'solDotBlocks', filled: allUSHaveCMP },
    { labelKey: 'solDotFeatures', filled: allCMPHaveFN },
    { labelKey: 'solDotReview', filled: inReviewOrBeyond },
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SolutionCard({
  node,
  expanded,
  onToggle,
  onAddUS,
  onSelectNode,
}: SolutionCardProps) {
  const { t } = useTranslation();
  const dots = computeDots(node);
  const userStories = node.children.filter((c) => c.type === 'US');
  const statusVariant = STATUS_VARIANT[node.status] ?? 'default';

  return (
    <article className={styles.card}>
      {/* ---- Header (always visible) ---- */}
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {/* SOL badge */}
        <span className={styles.idBadge}>{node.id}</span>

        {/* Title */}
        <span
          className={styles.title}
          onClick={(e) => {
            e.stopPropagation();
            onSelectNode(node);
          }}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              onSelectNode(node);
            }
          }}
        >
          {node.title}
        </span>

        {/* Status */}
        <Badge variant={statusVariant}>
          {t(`status${node.status.charAt(0).toUpperCase()}${node.status.slice(1)}`)}
        </Badge>

        {/* Progress dots */}
        <div className={styles.dots} aria-label={t('progressTitle')}>
          {dots.map((dot) => (
            <span
              key={dot.labelKey}
              className={`${styles.dot} ${dot.filled ? styles.dotFilled : styles.dotPending}`}
              title={`${t(dot.labelKey)}: ${dot.filled ? t('done') : t('solDotPending')}`}
              aria-label={`${t(dot.labelKey)}: ${dot.filled ? t('done') : t('solDotPending')}`}
            />
          ))}
        </div>

        {/* + US button */}
        <button
          className={styles.addBtn}
          onClick={(e) => {
            e.stopPropagation();
            onAddUS(node.id);
          }}
          aria-label={t('addUS')}
          title={t('addUS')}
          type="button"
        >
          <Plus size={14} />
          <span>US</span>
        </button>

        {/* Chevron */}
        <span className={styles.chevron} aria-hidden="true">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </div>

      {/* ---- Body (expanded) ---- */}
      {expanded && (
        <div className={styles.body}>
          {userStories.length === 0 && (
            <p className={styles.emptyHint}>{t('needsUS')}</p>
          )}

          {userStories.map((us) => {
            const cmpCount = countByType(us.children, 'CMP');
            const fnCount = countByType(us.children, 'FN');
            const usVariant = STATUS_VARIANT[us.status] ?? 'default';

            return (
              <div
                key={us.id}
                className={styles.usRow}
                role="button"
                tabIndex={0}
                onClick={() => onSelectNode(us)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectNode(us);
                }}
              >
                <span className={styles.usId}>{us.id}</span>
                <span className={styles.usTitle}>{us.title}</span>
                <Badge variant={usVariant}>
                  {t(`status${us.status.charAt(0).toUpperCase()}${us.status.slice(1)}`)}
                </Badge>
                <span className={styles.usMeta}>
                  <span className={styles.metaCount} title={t('statCMP')}>
                    {cmpCount} CMP
                  </span>
                  <span className={styles.metaSep}>/</span>
                  <span className={styles.metaCount} title={t('statFN')}>
                    {fnCount} FN
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
