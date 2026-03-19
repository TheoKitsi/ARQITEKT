import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setModel } from '@/store/slices/chatSlice';
import { useGetModelsQuery } from '@/store/api/chatApi';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ModelSelector.module.css';

/* ------------------------------------------------------------------ */
/*  Fallback models when API is unavailable                            */
/* ------------------------------------------------------------------ */

const fallbackModels = [
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', contextWindow: 200000, available: true },
  { id: 'claude-opus', name: 'Claude Opus', provider: 'Anthropic', contextWindow: 200000, available: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextWindow: 128000, available: true },
  { id: 'local', name: 'Local', provider: 'Local', contextWindow: 8000, available: true },
];

/* ------------------------------------------------------------------ */
/*  Provider badge variants                                            */
/* ------------------------------------------------------------------ */

function providerVariant(provider: string) {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return 'gold' as const;
    case 'openai':
      return 'success' as const;
    case 'google':
      return 'info' as const;
    default:
      return 'default' as const;
  }
}

function formatContextWindow(tokens: number): string {
  return tokens >= 1000 ? `${Math.round(tokens / 1000)}k ctx` : `${tokens} ctx`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ModelSelector() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentModel = useAppSelector((s) => s.chat.model);
  const { data: models, isLoading, isError } = useGetModelsQuery();

  const availableModels = isError || !models ? fallbackModels : models;
  const selectedModel = availableModels.find((m) => m.id === currentModel);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setModel(e.target.value));
  };

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.selectContainer}>
        <select
          className={styles.select}
          value={currentModel}
          onChange={handleChange}
          aria-label={t('model', 'Model')}
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id} disabled={!model.available}>
              {model.name} ({model.provider}) — {formatContextWindow(model.contextWindow)}
            </option>
          ))}
        </select>
        <div className={styles.selectDisplay}>
          <span className={styles.modelName}>
            {selectedModel?.name ?? currentModel}
          </span>
          {selectedModel && (
            <Badge variant={providerVariant(selectedModel.provider)}>
              {selectedModel.provider}
            </Badge>
          )}
          {selectedModel && (
            <span className={styles.contextInfo}>
              {formatContextWindow(selectedModel.contextWindow)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
