import {
  useRef,
  useCallback,
  useState,
  type FormEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from './VoiceInput';
import styles from './ChatInput.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---- Auto-resize textarea ---- */
  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxRows = 4;
    const lineHeight = 20; // approximate single row height
    const maxHeight = lineHeight * maxRows + 16; // padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  /* ---- Send handler ---- */
  const handleSend = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const text = draft.trim();
      if (!text || isLoading) return;
      onSend(text);
      setDraft('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Refocus textarea
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
    [draft, isLoading, onSend],
  );

  /* ---- Keyboard: Enter to send, Shift+Enter for newline ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  /* ---- Voice input result ---- */
  const handleVoiceResult = useCallback((text: string) => {
    setDraft((prev) => {
      const combined = prev ? `${prev} ${text}` : text;
      return combined;
    });
    // Auto-resize after voice input
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    });
  }, []);

  return (
    <form className={styles.inputArea} onSubmit={handleSend}>
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={t('chatPlaceholder')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          disabled={isLoading}
          aria-label={t('chatPlaceholder')}
        />
        <div className={styles.actions}>
          <VoiceInput onResult={handleVoiceResult} />
          <Button
            variant="gold"
            size="sm"
            type="submit"
            disabled={!draft.trim() || isLoading}
            icon={<Send size={14} />}
          >
            {t('chatSend', 'Send')}
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className={styles.loadingBar}>
          <div className={styles.loadingProgress} />
        </div>
      )}
    </form>
  );
}
