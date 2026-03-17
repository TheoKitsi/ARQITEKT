/* ------------------------------------------------------------------ */
/*  Spinner – CSS-only loading indicator                               */
/* ------------------------------------------------------------------ */

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 40,
} as const;

export type SpinnerSize = keyof typeof sizeMap;

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const px = sizeMap[size];
  const border = Math.max(2, Math.round(px / 8));

  return (
    <span
      className={className}
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${border}px solid var(--color-surface-bg4)`,
        borderTopColor: 'var(--color-brand-gold)',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

/* Inject the keyframe once via a <style> tag approach.
   We use a module-level side effect so it runs exactly once. */
if (typeof document !== 'undefined') {
  const STYLE_ID = 'arqitekt-spinner-keyframes';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
}
