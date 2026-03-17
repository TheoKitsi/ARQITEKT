'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './nav.module.css';

interface NavItem {
  href: string;
  label: string;
}

interface NavProps {
  items: NavItem[];
  brand?: string;
  className?: string;
}

export default function Nav({ items, brand, className = '' }: NavProps) {
  const pathname = usePathname();
  return (
    <nav className={`${styles.nav} ${className}`}>
      {brand && <span className={styles.brand}>{brand}</span>}
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.link} ${pathname === item.href ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
