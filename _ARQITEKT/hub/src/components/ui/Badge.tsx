import { type ReactNode } from 'react';
import styles from './Badge.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'gold';

export type LifecycleStage =
  | 'planning'
  | 'ready'
  | 'building'
  | 'built'
  | 'running'
  | 'deployed';

/** Maps lifecycle stages to badge variants. */
const lifecycleVariantMap: Record<LifecycleStage, BadgeVariant> = {
  planning: 'info',
  ready: 'warning',
  building: 'info',
  built: 'success',
  running: 'gold',
  deployed: 'success',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  /** If provided, auto-resolves variant from lifecycle stage. */
  lifecycle?: LifecycleStage;
  children: ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Badge({
  variant = 'default',
  lifecycle,
  children,
  className,
}: BadgeProps) {
  const resolvedVariant = lifecycle
    ? lifecycleVariantMap[lifecycle]
    : variant;

  const classNames = [styles.badge, styles[resolvedVariant], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
}
