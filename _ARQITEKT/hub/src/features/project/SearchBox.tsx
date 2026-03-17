import { useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import styles from './SearchBox.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SearchBoxProps {
  projectId: string;
  className?: string;
  autoFocus?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SearchBox({
  projectId: _projectId,
  className,
  autoFocus = false,
}: SearchBoxProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      handleClear();
    }
  };

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
      />
      <span className={styles.icon} aria-hidden="true">
        <Search size={14} />
      </span>
      {value.length > 0 && (
        <button
          className={styles.clearBtn}
          type="button"
          onClick={handleClear}
          aria-label={t('clearAll', 'Clear')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
