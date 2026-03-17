import {
  type SelectHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: ReactNode;
  selectSize?: 'sm' | 'md' | 'lg';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      options,
      placeholder,
      icon,
      selectSize = 'md',
      className,
      id: propId,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const errorId = error ? `${id}-error` : undefined;

    const wrapperClasses = [
      styles.wrapper,
      styles[selectSize],
      error ? styles.hasError : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrap}>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            className={styles.select}
            aria-invalid={!!error}
            aria-describedby={errorId}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={styles.chevron} />
        </div>
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);
