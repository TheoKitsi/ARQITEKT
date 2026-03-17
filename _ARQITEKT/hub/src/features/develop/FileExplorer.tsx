import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  RefreshCw,
} from 'lucide-react';
import { useListFilesQuery, type FileEntry } from '@/store/api/filesApi';
import { Spinner } from '@/components/ui/Spinner';
import styles from './FileExplorer.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FileExplorerProps {
  projectId: string;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
}

/* ------------------------------------------------------------------ */
/*  File extension icon mapping                                        */
/* ------------------------------------------------------------------ */

interface FileIconInfo {
  icon: typeof FileText;
  className: string;
}

function getFileIcon(name: string): FileIconInfo {
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
      return { icon: FileCode, className: styles.iconTs ?? '' };
    case 'js':
    case 'jsx':
      return { icon: FileCode, className: styles.iconTs ?? '' };
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return { icon: FileText, className: styles.iconCss ?? '' };
    case 'md':
    case 'mdx':
      return { icon: FileText, className: styles.iconMd ?? '' };
    case 'json':
    case 'yaml':
    case 'yml':
      return { icon: FileText, className: styles.iconJson ?? '' };
    default:
      return { icon: FileText, className: styles.iconDefault ?? '' };
  }
}

/* ------------------------------------------------------------------ */
/*  FileRow                                                            */
/* ------------------------------------------------------------------ */

interface FileRowProps {
  entry: FileEntry;
  depth: number;
  expandedDirs: Set<string>;
  selectedPath?: string;
  onToggleDir: (path: string) => void;
  onFileSelect: (path: string) => void;
}

function FileRow({
  entry,
  depth,
  expandedDirs,
  selectedPath,
  onToggleDir,
  onFileSelect,
}: FileRowProps) {
  const isDir = entry.type === 'directory';
  const isExpanded = expandedDirs.has(entry.path);
  const isSelected = selectedPath === entry.path;

  const handleClick = () => {
    if (isDir) {
      onToggleDir(entry.path);
    } else {
      onFileSelect(entry.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault();
        handleClick();
        break;
      }
      case 'ArrowRight': {
        if (isDir && !isExpanded) {
          e.preventDefault();
          onToggleDir(entry.path);
        }
        break;
      }
      case 'ArrowLeft': {
        if (isDir && isExpanded) {
          e.preventDefault();
          onToggleDir(entry.path);
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const allRows = e.currentTarget
          .closest(`.${styles.container}`)
          ?.querySelectorAll<HTMLElement>('[role="treeitem"]');
        if (allRows) {
          const arr = Array.from(allRows);
          const idx = arr.indexOf(e.currentTarget);
          if (idx >= 0 && idx + 1 < arr.length) {
            arr[idx + 1]?.focus();
          }
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const allRows = e.currentTarget
          .closest(`.${styles.container}`)
          ?.querySelectorAll<HTMLElement>('[role="treeitem"]');
        if (allRows) {
          const arr = Array.from(allRows);
          const idx = arr.indexOf(e.currentTarget);
          if (idx > 0) {
            arr[idx - 1]?.focus();
          }
        }
        break;
      }
      default:
        break;
    }
  };

  const rowClasses = [
    styles.fileRow,
    isSelected ? styles.fileRowSelected : '',
  ]
    .filter(Boolean)
    .join(' ');

  const nameClasses = [
    styles.fileName,
    isDir ? styles.dirName : '',
  ]
    .filter(Boolean)
    .join(' ');

  /* Render file/folder icon */
  const renderIcon = () => {
    if (isDir) {
      const Icon = isExpanded ? FolderOpen : Folder;
      return (
        <span className={`${styles.fileIcon} ${styles.iconFolder}`}>
          <Icon size={14} />
        </span>
      );
    }
    const { icon: Icon, className } = getFileIcon(entry.name);
    return (
      <span className={`${styles.fileIcon} ${className}`}>
        <Icon size={14} />
      </span>
    );
  };

  return (
    <li>
      <div
        className={rowClasses}
        role="treeitem"
        tabIndex={0}
        aria-expanded={isDir ? isExpanded : undefined}
        aria-selected={isSelected}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {isDir ? (
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
            aria-hidden="true"
          >
            <ChevronRight size={12} />
          </span>
        ) : (
          <span className={styles.chevronSpacer} />
        )}
        {renderIcon()}
        <span className={nameClasses} title={entry.name}>
          {entry.name}
        </span>
      </div>

      {isDir && isExpanded && entry.children && entry.children.length > 0 && (
        <ul className={styles.fileList} role="group">
          {sortEntries(entry.children).map((child) => (
            <FileRow
              key={child.path}
              entry={child}
              depth={depth + 1}
              expandedDirs={expandedDirs}
              selectedPath={selectedPath}
              onToggleDir={onToggleDir}
              onFileSelect={onFileSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Sort entries: directories first (alphabetical), then files (alphabetical). */
function sortEntries(entries: FileEntry[]): FileEntry[] {
  return [...entries].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }
    return a.type === 'directory' ? -1 : 1;
  });
}

/* ------------------------------------------------------------------ */
/*  FileExplorer                                                       */
/* ------------------------------------------------------------------ */

export function FileExplorer({
  projectId,
  onFileSelect,
  selectedPath,
}: FileExplorerProps) {
  const { t } = useTranslation();
  const {
    data: files,
    isLoading,
    isError,
    refetch,
  } = useListFilesQuery(projectId);

  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const handleToggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleRefresh = () => {
    void refetch();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          {t('feFiles')}
        </span>
        <button
          className={styles.refreshBtn}
          type="button"
          onClick={handleRefresh}
          aria-label={t('feRefresh')}
          title={t('feRefresh')}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className={styles.center}>
          <Spinner size="sm" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <p className={styles.errorText}>{t('errorPrefix', 'Error: ')}</p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && (!files || files.length === 0) && (
        <div className={styles.center}>
          <p className={styles.emptyText}>{t('noFiles', 'No files')}</p>
        </div>
      )}

      {/* File tree */}
      {!isLoading && !isError && files && files.length > 0 && (
        <ul className={styles.fileList} role="tree" aria-label={t('feFiles')}>
          {sortEntries(files).map((entry) => (
            <FileRow
              key={entry.path}
              entry={entry}
              depth={0}
              expandedDirs={expandedDirs}
              selectedPath={selectedPath}
              onToggleDir={handleToggleDir}
              onFileSelect={onFileSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
