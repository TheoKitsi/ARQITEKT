import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useValidateProjectMutation } from '@/store/api/requirementsApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ValidationPanel.module.css';

interface ValidationResult {
  ruleId: string;
  rule: string;
  passed: boolean;
  details?: string;
  affectedArtifacts?: string[];
}

export function ValidationPanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const [validate, { data, isLoading }] = useValidateProjectMutation();

  const results: ValidationResult[] = data?.results ?? [];
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;

  return (
    <Card>
      <Card.Header>
        <div className={styles.titleRow}>
          <ShieldCheck size={18} />
          <span>{t('monitorValidation')}</span>
        </div>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner size="sm" />
            <span>{t('runningValidation')}</span>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className={styles.summary}>
              <span className={styles.summaryPass}>
                <CheckCircle size={14} />
                {passCount} passed
              </span>
              <span className={styles.summaryFail}>
                {failCount > 0 ? <XCircle size={14} /> : <CheckCircle size={14} />}
                {failCount} failed
              </span>
            </div>
            <ul className={styles.resultList}>
              {results.map((r, i) => (
                <li
                  key={`${r.ruleId}-${i}`}
                  className={`${styles.resultItem} ${r.passed ? styles.pass : styles.fail}`}
                >
                  <span className={styles.resultIcon}>
                    {r.passed ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                  </span>
                  <div className={styles.resultContent}>
                    <span className={styles.ruleId}>{r.ruleId}</span>
                    <span className={styles.ruleText}>{r.rule}</span>
                    {r.details && (
                      <span className={styles.ruleDetails}>
                        <AlertTriangle size={12} />
                        {r.details}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.hint}>{t('monitorReqHealth')}</p>
        )}
      </Card.Body>
      <Card.Footer>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => validate(projectId!)}
          loading={isLoading}
        >
          {t('monitorRunValidation')}
        </Button>
        <Button variant="outlined" size="sm">
          {t('monitorRunTests')}
        </Button>
      </Card.Footer>
    </Card>
  );
}
