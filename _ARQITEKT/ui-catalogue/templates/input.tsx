'use client';

import type { InputHTMLAttributes } from 'react';
import styles from './input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, ...rest }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input id={inputId} className={`${styles.input} ${error ? styles.error : ''}`} {...rest} />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
