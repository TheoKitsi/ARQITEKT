import { type ReactNode, type CSSProperties, useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface Props {
  content: ReactNode;
  placement?: Placement;
  children: ReactNode;
}

export function Tooltip({ content, placement = 'top', children }: Props) {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const posStyle: CSSProperties = {
    top: placement === 'bottom' ? '100%' : undefined,
    bottom: placement === 'top' ? '100%' : undefined,
    left: placement === 'right' ? '100%' : placement === 'left' ? undefined : '50%',
    right: placement === 'left' ? '100%' : undefined,
    transform:
      placement === 'top' || placement === 'bottom'
        ? 'translateX(-50%)'
        : 'translateY(-50%)',
    marginTop: placement === 'bottom' ? 6 : undefined,
    marginBottom: placement === 'top' ? 6 : undefined,
    marginLeft: placement === 'right' ? 6 : undefined,
    marginRight: placement === 'left' ? 6 : undefined,
  };

  return (
    <span
      ref={wrapperRef}
      className={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span className={styles.tooltip} role="tooltip" style={posStyle}>
          {content}
        </span>
      )}
    </span>
  );
}
