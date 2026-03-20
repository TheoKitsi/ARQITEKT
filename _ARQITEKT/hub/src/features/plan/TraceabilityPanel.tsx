import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, AlertTriangle, Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  useGetTraceabilityQuery,
  useGetImpactQuery,
} from '@/store/api/baselineApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import styles from './TraceabilityPanel.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TraceabilityPanelProps {
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TraceabilityPanel({ projectId }: TraceabilityPanelProps) {
  const { t } = useTranslation();
  const { data: matrix, isLoading, isError, refetch } = useGetTraceabilityQuery(projectId);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

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

  if (!matrix) return null;

  const uniqueNodes = new Set<string>();
  for (const link of matrix.links) {
    uniqueNodes.add(link.from);
    uniqueNodes.add(link.to);
  }

  return (
    <section className={styles.panel}>
      <header
        className={styles.header}
        onClick={() => setExpanded((p) => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((p) => !p); } }}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <GitBranch size={16} />
        <h3 className={styles.title}>{t('traceability')}</h3>
        <Badge variant="info">{t('traceLinks', { n: matrix.links.length })}</Badge>
      </header>

      {expanded && (
        <>
          {/* Orphans summary */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('traceOrphans')}</h4>
        {matrix.orphans.length === 0 ? (
          <p className={styles.emptyText}>{t('traceOrphansNone')}</p>
        ) : (
          <>
            <p className={styles.warnText}>
              <AlertTriangle size={14} />
              {t('traceOrphansFound', { n: matrix.orphans.length })}
            </p>
            <div className={styles.chipList}>
              {matrix.orphans.map((id) => (
                <button
                  key={id}
                  className={styles.chip}
                  onClick={() => setSelectedArtifact(id)}
                  type="button"
                >
                  {id}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Leaves summary */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('traceLeaves')}</h4>
        {matrix.leaves.length === 0 ? (
          <p className={styles.emptyText}>{t('traceLeavesNone')}</p>
        ) : (
          <>
            <p className={styles.warnText}>
              <AlertTriangle size={14} />
              {t('traceLeavesFound', { n: matrix.leaves.length })}
            </p>
            <div className={styles.chipList}>
              {matrix.leaves.map((id) => (
                <button
                  key={id}
                  className={styles.chip}
                  onClick={() => setSelectedArtifact(id)}
                  type="button"
                >
                  {id}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trace links table */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('traceMatrix')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>From</th>
                <th>Relation</th>
                <th>To</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {matrix.links.slice(0, 50).map((link, i) => (
                <tr key={i}>
                  <td className={styles.mono}>{link.from}</td>
                  <td>
                    <Badge variant={link.relation === 'parent' ? 'default' : 'info'}>
                      {link.relation}
                    </Badge>
                  </td>
                  <td className={styles.mono}>{link.to}</td>
                  <td>
                    <button
                      className={styles.impactBtn}
                      onClick={() => setSelectedArtifact(link.from)}
                      type="button"
                      aria-label={t('impactAnalysis')}
                    >
                      <Search size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {matrix.links.length > 50 && (
            <p className={styles.truncated}>
              {matrix.links.length - 50} more links...
            </p>
          )}
        </div>
      </div>

        </>
      )}

      {/* Impact analysis slide-in */}
      {selectedArtifact && (
        <ImpactDetail
          projectId={projectId}
          artifactId={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ImpactDetail                                                       */
/* ------------------------------------------------------------------ */

interface ImpactDetailProps {
  projectId: string;
  artifactId: string;
  onClose: () => void;
}

function ImpactDetail({ projectId, artifactId, onClose }: ImpactDetailProps) {
  const { t } = useTranslation();
  const { data: impact, isLoading, isError } = useGetImpactQuery({ projectId, artifactId });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [artifactId]);

  return (
    <div className={styles.impactPanel} ref={panelRef}>
      <div className={styles.impactHeader}>
        <h4 className={styles.impactTitle}>
          {t('impactAnalysis')}: <span className={styles.mono}>{artifactId}</span>
        </h4>
        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label={t('close')}>
          <X size={16} />
        </button>
      </div>

      {isLoading ? (
        <Spinner size="sm" />
      ) : isError ? (
        <p className={styles.emptyText}>{t('impactError', 'Could not load impact analysis.')}</p>
      ) : impact ? (
        <div className={styles.impactBody}>
          <div className={styles.impactRow}>
            <span className={styles.impactLabel}>{t('impactDirect')}</span>
            <div className={styles.chipList}>
              {impact.directlyAffected.length === 0 ? (
                <span className={styles.emptyText}>--</span>
              ) : (
                impact.directlyAffected.map((id) => (
                  <span key={id} className={styles.chipLight}>{id}</span>
                ))
              )}
            </div>
          </div>
          <div className={styles.impactRow}>
            <span className={styles.impactLabel}>{t('impactTransitive')}</span>
            <div className={styles.chipList}>
              {impact.transitivelyAffected.length === 0 ? (
                <span className={styles.emptyText}>--</span>
              ) : (
                impact.transitivelyAffected.map((id) => (
                  <span key={id} className={styles.chipLight}>{id}</span>
                ))
              )}
            </div>
          </div>
          <p className={styles.totalImpact}>
            {t('impactTotal', { n: impact.totalImpact })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
