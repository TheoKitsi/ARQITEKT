import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { File, Search } from 'lucide-react';
import { useListFilesQuery, type FileEntry } from '@/store/api/filesApi';
import styles from './FileQuickOpen.module.css';

/* ------------------------------------------------------------------ */
/*  Flatten file tree into a list of paths                             */
/* ------------------------------------------------------------------ */

function flattenTree(entries: FileEntry[], prefix = ''): string[] {
  const result: string[] = [];
  for (const entry of entries) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.type === 'file') {
      result.push(fullPath);
    } else if (entry.children) {
      result.push(...flattenTree(entry.children, fullPath));
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Simple fuzzy match                                                 */
/* ------------------------------------------------------------------ */

function fuzzyMatch(query: string, target: string): boolean {
  const lower = target.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lower.length && qi < query.length; i++) {
    if (lower[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  onSelect: (path: string) => void;
}

export function FileQuickOpen({ onSelect }: Props) {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { data: tree } = useListFilesQuery(projectId!, { skip: !projectId || !open });

  const allFiles = useMemo(() => (tree ? flattenTree(tree) : []), [tree]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allFiles.slice(0, 50);
    const q = query.toLowerCase();
    return allFiles.filter((f) => fuzzyMatch(q, f)).slice(0, 50);
  }, [allFiles, query]);

  /* ---- Keyboard shortcut: Ctrl+P ---- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ---- Focus input on open ---- */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* ---- Clamp active index ---- */
  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % filtered.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[activeIndex]) {
            onSelect(filtered[activeIndex]);
            setOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [filtered, activeIndex, onSelect],
  );

  /* ---- Scroll into view ---- */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className={styles.dialog} role="dialog" aria-label={t('quickOpen')}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder={t('searchFiles')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKey}
            role="combobox"
            aria-expanded
            aria-controls="quickopen-list"
            aria-autocomplete="list"
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        <ul id="quickopen-list" ref={listRef} className={styles.list} role="listbox">
          {filtered.length === 0 && (
            <li className={styles.empty}>{t('noMatchingFiles')}</li>
          )}
          {filtered.map((path, idx) => {
            const name = path.split('/').pop() ?? path;
            const dir = path.slice(0, -name.length - 1);
            return (
              <li
                key={path}
                className={`${styles.item} ${idx === activeIndex ? styles.active : ''}`}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onSelect(path);
                  setOpen(false);
                }}
              >
                <File size={14} className={styles.fileIcon} />
                <span className={styles.fileName}>{name}</span>
                {dir && <span className={styles.fileDir}>{dir}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
