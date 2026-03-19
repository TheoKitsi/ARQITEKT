import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { useSearchRequirementsQuery } from '@/store/api/requirementsApi';
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
  projectId,
  className,
  autoFocus = false,
}: SearchBoxProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Debounce: only search after 300ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const { data: results, isFetching } = useSearchRequirementsQuery(
    { projectId, q: debouncedValue },
    { skip: debouncedValue.length < 2 },
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowResults(true);
  };

  const handleClear = () => {
    setValue('');
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (showResults) {
        setShowResults(false);
      } else if (value.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleClear();
      }
    }
  };

  const handleBlur = () => {
    // Delay to allow click on result items
    setTimeout(() => setShowResults(false), 200);
  };

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(' ');
  const hasResults = results && results.length > 0 && debouncedValue.length >= 2;

  return (
    <div className={wrapperClasses}>
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => debouncedValue.length >= 2 && setShowResults(true)}
        onBlur={handleBlur}
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

      {/* Search results dropdown */}
      {showResults && debouncedValue.length >= 2 && (
        <div className={styles.dropdown} role="listbox">
          {isFetching ? (
            <div className={styles.dropdownMsg}>{t('loading', 'Searching...')}</div>
          ) : hasResults ? (
            results.map((r) => (
              <div key={r.nodeId} className={styles.resultItem} role="option">
                <span className={styles.resultType}>{r.type}</span>
                <span className={styles.resultTitle}>{r.title}</span>
              </div>
            ))
          ) : (
            <div className={styles.dropdownMsg}>{t('noResults', 'No results')}</div>
          )}
        </div>
      )}
    </div>
  );
}
