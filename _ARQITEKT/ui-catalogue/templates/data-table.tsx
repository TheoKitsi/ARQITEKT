'use client';

import type { ReactNode } from 'react';
import styles from './data-table.module.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField?: string;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  keyField = 'id',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={styles.th}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={String(row[keyField] ?? i)} className={styles.tr}>
              {columns.map(col => (
                <td key={col.key} className={styles.td}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>Keine Daten</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
