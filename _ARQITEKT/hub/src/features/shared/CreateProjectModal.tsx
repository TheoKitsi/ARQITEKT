import { useState, useCallback, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCreateProjectMutation } from '@/store/api/projectsApi';
import styles from './CreateProjectModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  const [createProject, { isLoading }] = useCreateProjectMutation();

  /* ---- Reset form on close ---- */
  const handleClose = useCallback(() => {
    setName('');
    setDescription('');
    setNameError('');
    onClose();
  }, [onClose]);

  /* ---- Validate ---- */
  const validate = useCallback((): boolean => {
    if (!name.trim()) {
      setNameError(t('requiredFields'));
      return false;
    }
    setNameError('');
    return true;
  }, [name, t]);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        const project = await createProject({
          name: name.trim(),
          description: description.trim(),
        }).unwrap();

        showToast(`${t('projects')}: ${project.config.name}`, 'success');
        handleClose();
        navigate(`/projects/${project.id}/plan`);
      } catch {
        showToast(t('errorLoad'), 'error');
      }
    },
    [validate, createProject, name, description, showToast, t, handleClose, navigate],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modalCreateTitle')}
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
            disabled={!name.trim()}
            icon={<FolderPlus size={16} />}
          >
            {t('wizCreate')}
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label={t('projectName')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError}
          placeholder="My App"
          required
          autoFocus
        />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="create-desc">
            {t('descOptional')}
          </label>
          <textarea
            id="create-desc"
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
