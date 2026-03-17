import type { ReactNode } from 'react';
import styles from './card.module.css';

type Variant = 'filled' | 'outlined';

interface CardProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export default function Card({ variant = 'outlined', className = '', children }: CardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
