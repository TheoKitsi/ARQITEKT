import { type ReactNode, createContext, useContext } from 'react';
import styles from './Card.module.css';

/* ------------------------------------------------------------------ */
/*  Context (for compound component pattern)                           */
/* ------------------------------------------------------------------ */

const CardContext = createContext<{ variant: CardVariant }>({
  variant: 'default',
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
}

export interface CardSectionProps {
  className?: string;
  children: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

export function Card({ variant = 'default', className, children }: CardProps) {
  const classNames = [styles.card, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <CardContext.Provider value={{ variant }}>
      <div className={classNames}>{children}</div>
    </CardContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Header                                                        */
/* ------------------------------------------------------------------ */

function CardHeader({ className, children }: CardSectionProps) {
  useContext(CardContext); // ensure used inside Card
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Body                                                          */
/* ------------------------------------------------------------------ */

function CardBody({ className, children }: CardSectionProps) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Footer                                                        */
/* ------------------------------------------------------------------ */

function CardFooter({ className, children }: CardSectionProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Attach sub-components                                              */
/* ------------------------------------------------------------------ */

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
