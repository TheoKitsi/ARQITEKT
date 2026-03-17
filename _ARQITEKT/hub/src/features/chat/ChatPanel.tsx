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
import { useSendMessageMutation } from '@/store/api/chatApi';
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

  const [sendMessage] = useSendMessageMutation();

  /* ---- Close on Escape ---- */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(toggleChat());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, dispatch]);

  /* ---- Focus trap: keep focus inside panel ---- */
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    }
  }, [isOpen]);

  /* ---- Send handler ---- */
  const handleSend = useCallback(
    async (text: string) => {
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      dispatch(addMessage(userMsg));

      try {
        const response = await sendMessage({ message: text, model }).unwrap();
        dispatch(
          addMessage({
            id: response.id,
            role: 'assistant',
            content: response.content,
            timestamp: response.timestamp,
          }),
        );
      } catch {
        dispatch(
          addMessage({
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: t('errorLoad'),
            timestamp: Date.now(),
          }),
        );
      }
    },
    [isLoading, model, dispatch, sendMessage, t],
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
      tabIndex={-1}
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
