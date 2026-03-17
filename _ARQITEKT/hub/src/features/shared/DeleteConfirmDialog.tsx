import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDeleteProjectMutation, useGetProjectQuery } from '@/store/api/projectsApi';
import { useGetGithubStatusQuery } from '@/store/api/githubApi';
import styles from './DeleteConfirmDialog.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [confirmText, setConfirmText] = useState('');
  const [deleteProject, { isLoading }] = useDeleteProjectMutation();

  const { data: project } = useGetProjectQuery(projectId, { skip: !isOpen });
  const { data: githubStatus } = useGetGithubStatusQuery(undefined, { skip: !isOpen });

  const hasGithub = !!(project?.config.github && githubStatus?.connected);
  const codename = projectName;
  const isConfirmed = confirmText.trim().toLowerCase() === codename.toLowerCase();

  /* ---- Reset on close ---- */
  const handleClose = useCallback(() => {
    setConfirmText('');
    onClose();
  }, [onClose]);

  /* ---- Delete ---- */
  const handleDelete = useCallback(async () => {
    if (!isConfirmed) return;

    try {
      await deleteProject(projectId).unwrap();
      showToast(`${t('deleteBtn')}: ${projectName}`, 'success');
      handleClose();
      navigate('/');
    } catch {
      showToast(t('errorLoad'), 'error');
    }
  }, [isConfirmed, deleteProject, projectId, showToast, t, projectName, handleClose, navigate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('deleteConfirmTitle')}
      footer={
        <div className={styles.footer}>
          <Button variant="outlined" size="md" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="filled"
            size="md"
            className={styles.deleteBtn}
            onClick={handleDelete}
            loading={isLoading}
            disabled={!isConfirmed}
            icon={<Trash2 size={16} />}
          >
            {t('deleteBtn')}
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        {/* Warning icon */}
        <div className={styles.warningIcon}>
          <AlertTriangle size={32} />
        </div>

        {/* Warning text */}
        <p className={styles.warningText}>
          {t('deleteArtifactCount', { n: '' })}
        </p>

        {/* GitHub hint */}
        {hasGithub && (
          <div className={styles.githubHint}>
            <AlertTriangle size={16} />
            <span>{t('deleteGithubHint')}</span>
          </div>
        )}

        {/* Type-to-confirm */}
        <div className={styles.confirmSection}>
          <label className={styles.confirmLabel}>
            {t('deleteTypeConfirm', { codename })}
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={codename}
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}
