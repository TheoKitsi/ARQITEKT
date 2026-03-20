import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FolderPlus,
  Settings,
  Moon,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleCommandPalette, toggleTheme } from '@/store/slices/uiSlice';
import styles from './CommandPalette.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  shortcut?: string;
  action: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((s) => s.ui.commandPaletteOpen);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* ---- Build command list ---- */
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'new-project',
        label: t('newProject'),
        description: t('modalCreateTitle'),
        icon: <FolderPlus size={16} />,
        action: () => {
          dispatch(toggleCommandPalette());
          navigate('/');
        },
      },
      {
        id: 'go-projects',
        label: t('backToProjects'),
        description: t('projects'),
        icon: <ArrowRight size={16} />,
        action: () => {
          dispatch(toggleCommandPalette());
          navigate('/');
        },
      },
      {
        id: 'settings',
        label: t('openSettings', 'Settings'),
        icon: <Settings size={16} />,
        action: () => {
          dispatch(toggleCommandPalette());
          navigate('/');
        },
      },
      {
        id: 'toggle-theme',
        label: t('toggleTheme', 'Toggle Theme'),
        icon: <Moon size={16} />,
        action: () => {
          dispatch(toggleTheme());
          dispatch(toggleCommandPalette());
        },
      },
      {
        id: 'docs',
        label: 'Documentation',
        icon: <FileText size={16} />,
        action: () => {
          dispatch(toggleCommandPalette());
          window.open('https://github.com/TheoKitsi/ARQITEKT', '_blank', 'noopener');
        },
      },
    ],
    [t, dispatch, navigate],
  );

  /* ---- Filter commands ---- */
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower),
    );
  }, [commands, query]);

  /* ---- Clamp activeIndex when filtered list shrinks ---- */
  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  /* ---- Reset state on open/close ---- */
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Focus input on next tick after render
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  /* ---- Keyboard shortcut: Ctrl+K ---- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(toggleCommandPalette());
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  /* ---- List navigation ---- */
  const handleKeyDown = useCallback(
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
          filtered[activeIndex]?.action();
          break;
        case 'Escape':
          e.preventDefault();
          dispatch(toggleCommandPalette());
          break;
      }
    },
    [filtered, activeIndex, dispatch],
  );

  /* ---- Scroll active item into view ---- */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  /* ---- Close on backdrop click ---- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        dispatch(toggleCommandPalette());
      }
    },
    [dispatch],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.palette} role="dialog" aria-label={t('commandPalette', 'Command Palette')}>
        {/* Search input */}
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder={t('cmdSearch')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-activedescendant={
              filtered[activeIndex]
                ? `cmd-${filtered[activeIndex].id}`
                : undefined
            }
            role="combobox"
            aria-expanded
            aria-controls="command-list"
            aria-autocomplete="list"
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        {/* Results list */}
        <ul
          id="command-list"
          ref={listRef}
          className={styles.list}
          role="listbox"
        >
          {filtered.length === 0 && (
            <li className={styles.empty}>{t('noResults')}</li>
          )}
          {filtered.map((cmd, idx) => (
            <li
              key={cmd.id}
              id={`cmd-${cmd.id}`}
              className={`${styles.item} ${idx === activeIndex ? styles.active : ''}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => cmd.action()}
            >
              <span className={styles.itemIcon}>{cmd.icon}</span>
              <div className={styles.itemText}>
                <span className={styles.itemLabel}>{cmd.label}</span>
                {cmd.description && (
                  <span className={styles.itemDesc}>{cmd.description}</span>
                )}
              </div>
              {cmd.shortcut && (
                <kbd className={styles.itemKbd}>{cmd.shortcut}</kbd>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
