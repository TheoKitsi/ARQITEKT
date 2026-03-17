import { useState, useCallback, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useImportProjectMutation } from '@/store/api/projectsApi';
import styles from './ImportProjectModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ImportProjectModal({ isOpen, onClose }: ImportProjectModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sourcePath, setSourcePath] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [pathError, setPathError] = useState('');

  const [importProject, { isLoading }] = useImportProjectMutation();

  /* ---- Reset on close ---- */
  const handleClose = useCallback(() => {
    setSourcePath('');
    setProjectName('');
    setDescription('');
    setPathError('');
    onClose();
  }, [onClose]);

  /* ---- Validate ---- */
  const validate = useCallback((): boolean => {
    if (!sourcePath.trim()) {
      setPathError(t('requiredFields'));
      return false;
    }
    setPathError('');
    return true;
  }, [sourcePath, t]);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        const project = await importProject({
          path: sourcePath.trim(),
          name: projectName.trim() || undefined,
        }).unwrap();

        showToast(
          t('importSuccess', { id: project.id, n: 0 }),
          'success',
        );
        handleClose();
        navigate(`/projects/${project.id}/plan`);
      } catch (err) {
        const message = err instanceof Error ? err.message : t('errorLoad');
        showToast(`${t('importError')}${message}`, 'error');
      }
    },
    [validate, importProject, sourcePath, projectName, showToast, t, handleClose, navigate],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modalImportTitle')}
      footer={
        <div className={styles.footer}>
          <Button variant="outlined" size="md" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!sourcePath.trim()}
            icon={<Download size={16} />}
          >
            {t('importBtn')}
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label={t('sourcePath')}
          value={sourcePath}
          onChange={(e) => {
            setSourcePath(e.target.value);
            if (pathError) setPathError('');
          }}
          error={pathError}
          placeholder="/path/to/project"
          required
          autoFocus
        />
        <Input
          label={t('projectName')}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={t('projectName')}
          hint={t('descOptional')}
        />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="import-desc">
            {t('descOptional')}
          </label>
          <textarea
            id="import-desc"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descLabel')}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
