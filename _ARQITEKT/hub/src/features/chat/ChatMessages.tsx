import { useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ChatMessages.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatMessagesProps {
  messages: ChatMessageItem[];
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Basic markdown-to-HTML converter for assistant messages. */
function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return DOMPurify.sanitize(html);
}

/** Format a timestamp as relative time (e.g. "just now", "2m ago"). */
function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatMessages({ messages, isLoading = false }: ChatMessagesProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- Auto-scroll to bottom on new messages ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* ---- Memoize rendered timestamps so they update on re-render ---- */
  const renderedMessages = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        relativeTime: relativeTime(msg.timestamp),
        html: msg.role === 'assistant' ? markdownToHtml(msg.content) : null,
      })),
    [messages],
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className={styles.empty}>
          <Bot size={36} strokeWidth={1} />
          <p className={styles.emptyText}>{t('chatPlaceholder')}</p>
        </div>
      )}

      {/* Messages */}
      {renderedMessages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.message} ${styles[msg.role]}`}
        >
          <div className={styles.bubble}>
            {msg.role === 'assistant' && msg.html ? (
              <div
                className={styles.markdownContent}
                dangerouslySetInnerHTML={{ __html: msg.html }}
              />
            ) : (
              <span className={styles.textContent}>{msg.content}</span>
            )}
          </div>
          <span className={styles.timestamp}>{msg.relativeTime}</span>
        </div>
      ))}

      {/* Typing indicator */}
      {isLoading && (
        <div className={`${styles.message} ${styles.assistant}`}>
          <div className={styles.bubble}>
            <div className={styles.typingIndicator}>
              <Spinner size="sm" />
              <span className={styles.typingDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
