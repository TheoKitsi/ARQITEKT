import {
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bot, Save, Wand2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  toggleChat,
  addMessage,
  type ChatMessage,
} from '@/store/slices/chatSlice';
import { streamChat } from '@/store/thunks/streamChat';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import styles from './ChatPanel.module.css';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatPanel() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { isOpen, messages, model, isLoading } = useAppSelector((s) => s.chat);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  /* ---- Close on Escape ---- */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleChat());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, dispatch]);

  /* ---- Focus close button when panel opens ---- */
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        closeBtnRef.current?.focus();
      });
    }
  }, [isOpen]);

  /* ---- Send handler (SSE streaming) ---- */
  const handleSend = useCallback(
    (text: string) => {
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      dispatch(addMessage(userMsg));
      dispatch(streamChat({ message: text, model }));
    },
    [isLoading, model, dispatch],
  );

  /* ---- Save conversation ---- */
  const handleSave = useCallback(() => {
    if (messages.length === 0) return;
    showToast(t('savedConv'), 'success');
  }, [messages, showToast, t]);

  /* ---- Formalize -> Copilot ---- */
  const handleFormalize = useCallback(() => {
    if (messages.length === 0) {
      showToast(t('discussFirst'), 'warning');
      return;
    }

    // Build a formalization prompt from the conversation
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Based on this discussion, create formal requirements:\n\n${conversationText}`;

    navigator.clipboard.writeText(prompt).then(
      () => showToast(t('formalized'), 'success'),
      () => showToast(t('errorLoad'), 'error'),
    );
  }, [messages, showToast, t]);

  if (!isOpen) return null;

  return (
    <aside
      ref={panelRef}
      className={styles.panel}
      aria-label={t('chat', 'Chat')}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bot size={18} />
          <span className={styles.headerTitle}>{t('chat', 'Chat')}</span>
        </div>
        <div className={styles.headerRight}>
          <ModelSelector />
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={() => dispatch(toggleChat())}
            aria-label={t('close')}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Actions row */}
      <div className={styles.actionsRow}>
        <Button
          variant="outlined"
          size="sm"
          onClick={handleSave}
          disabled={messages.length === 0}
          icon={<Save size={14} />}
        >
          {t('chatSave')}
        </Button>
        <Button
          variant="gold"
          size="sm"
          onClick={handleFormalize}
          disabled={messages.length === 0}
          icon={<Wand2 size={14} />}
        >
          {t('chatFormalize')}
        </Button>
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </aside>
  );
}
