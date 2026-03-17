import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Save } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  useGetProjectQuery,
  useUpdateProjectMetaMutation,
} from '@/store/api/projectsApi';
import styles from './BrandingModal.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type ColorMode = 'light' | 'dark' | 'auto';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BrandingModal({ isOpen, onClose, projectId }: BrandingModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { data: project, isLoading: isLoadingProject } = useGetProjectQuery(projectId, {
    skip: !isOpen,
  });
  const [updateMeta, { isLoading: isSaving }] = useUpdateProjectMetaMutation();

  const [primaryColor, setPrimaryColor] = useState('#FFD700');
  const [secondaryColor, setSecondaryColor] = useState('#1F1F1F');
  const [logoPath, setLogoPath] = useState('');
  const [mode, setMode] = useState<ColorMode>('dark');

  /* ---- Prefill from project branding ---- */
  useEffect(() => {
    if (project?.config.branding) {
      setPrimaryColor(project.config.branding.primaryColor ?? '#FFD700');
      setSecondaryColor(project.config.branding.secondaryColor ?? '#1F1F1F');
      setLogoPath(project.config.branding.logo ?? '');
      setMode((project.config.branding.mode as ColorMode) ?? 'dark');
    }
  }, [project]);

  /* ---- Save ---- */
  const handleSave = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      try {
        await updateMeta({
          id: projectId,
          config: {
            branding: {
              primaryColor,
              secondaryColor,
              logo: logoPath || undefined,
              mode,
            },
          },
        }).unwrap();

        showToast(t('save'), 'success');
        onClose();
      } catch {
        showToast(t('errorLoad'), 'error');
      }
    },
    [projectId, primaryColor, updateMeta, showToast, t, onClose],
  );

  const modeOptions: { value: ColorMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modalBrandingTitle')}
      footer={
        <div className={styles.footer}>
          <Button variant="outlined" size="md" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={handleSave}
            loading={isSaving}
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
        <form className={styles.form} onSubmit={handleSave}>
          {/* Primary Color */}
          <div className={styles.colorField}>
            <label className={styles.label}>
              <Palette size={14} />
              {t('primaryColor')}
            </label>
            <div className={styles.colorPickerRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                inputSize="sm"
                className={styles.colorInput}
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className={styles.colorField}>
            <label className={styles.label}>
              <Palette size={14} />
              {t('secondaryColor')}
            </label>
            <div className={styles.colorPickerRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                inputSize="sm"
                className={styles.colorInput}
              />
            </div>
          </div>

          {/* Logo Path */}
          <Input
            label={t('logoPath')}
            value={logoPath}
            onChange={(e) => setLogoPath(e.target.value)}
            placeholder="/assets/logo.svg"
          />

          {/* Mode Selector */}
          <div className={styles.field}>
            <label className={styles.label}>{t('modeLabel')}</label>
            <div className={styles.modeSelector}>
              {modeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.modeBtn} ${mode === opt.value ? styles.modeBtnActive : ''}`}
                  onClick={() => setMode(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={styles.field}>
            <label className={styles.label}>Preview</label>
            <div
              className={styles.preview}
              style={{
                backgroundColor: mode === 'light' ? '#ffffff' : mode === 'dark' ? '#1a1a2e' : '#0d1117',
              }}
            >
              <div
                className={styles.previewHeader}
                style={{ backgroundColor: primaryColor }}
              >
                <span
                  className={styles.previewTitle}
                  style={{
                    color: isLightColor(primaryColor) ? '#1F1F1F' : '#ffffff',
                  }}
                >
                  {project?.config.name ?? 'App'}
                </span>
              </div>
              <div className={styles.previewBody}>
                <div
                  className={styles.previewAccent}
                  style={{ backgroundColor: secondaryColor }}
                />
                <div className={styles.previewLines}>
                  <div className={styles.previewLine} style={{ width: '80%' }} />
                  <div className={styles.previewLine} style={{ width: '60%' }} />
                  <div className={styles.previewLine} style={{ width: '70%' }} />
                </div>
                <div
                  className={styles.previewButton}
                  style={{ backgroundColor: primaryColor }}
                >
                  <span
                    style={{
                      color: isLightColor(primaryColor) ? '#1F1F1F' : '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    Button
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Determine if a hex color is light (for contrast text). */
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
