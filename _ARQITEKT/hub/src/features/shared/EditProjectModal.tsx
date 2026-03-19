import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Tag, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  useGetProjectQuery,
  useRenameProjectMutation,
  useUpdateProjectMetaMutation,
} from '@/store/api/projectsApi';
import styles from './EditProjectModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EditProjectModal({ isOpen, onClose, projectId }: EditProjectModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { data: project, isLoading: isLoadingProject } = useGetProjectQuery(projectId, {
    skip: !isOpen,
  });

  const [renameProject, { isLoading: isRenaming }] = useRenameProjectMutation();
  const [updateMeta, { isLoading: isUpdatingMeta }] = useUpdateProjectMetaMutation();

  const isSaving = isRenaming || isUpdatingMeta;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  /* ---- Prefill form when project data loads ---- */
  useEffect(() => {
    if (project) {
      setName(project.config.name);
      setDescription(project.config.description ?? '');
      setTags(project.config.tags ?? []);
    }
  }, [project]);

  /* ---- Tag management ---- */
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    },
    [addTag],
  );

  /* ---- Close and reset ---- */
  const handleClose = useCallback(() => {
    setTagInput('');
    onClose();
  }, [onClose]);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      try {
        // Rename if changed
        if (project && name.trim() !== project.config.name) {
          await renameProject({ id: projectId, name: name.trim() }).unwrap();
        }

        // Update meta (description + tags)
        await updateMeta({
          id: projectId,
          config: {
            tags,
          },
        }).unwrap();

        showToast(t('save'), 'success');
        handleClose();
      } catch {
        showToast(t('errorLoad'), 'error');
      }
    },
    [name, project, projectId, tags, renameProject, updateMeta, showToast, t, handleClose],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('editProject')}
      footer={
        <div className={styles.footer}>
          <Button variant="outlined" size="md" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={handleSubmit}
            loading={isSaving}
            disabled={!name.trim()}
            icon={<Save size={16} />}
          >
            {t('save')}
          </Button>
        </div>
      }
    >
      {isLoadingProject ? (
        <div className={styles.loadingContainer}>
          <Spinner size="md" />
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label={t('projectName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-desc">
              {t('descLabel')}
            </label>
            <textarea
              id="edit-desc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descLabel')}
              rows={3}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('tags')}</label>
            <div className={styles.tagInputRow}>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('addTag')}
                inputSize="sm"
                icon={<Tag size={14} />}
              />
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                +
              </Button>
            </div>
            {tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
