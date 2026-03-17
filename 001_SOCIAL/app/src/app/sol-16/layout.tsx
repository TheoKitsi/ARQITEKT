// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-16 — Staged Profile Release --- 3 Visibility Levels
import styles from './layout.module.css';

export default function Sol16Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-16: Staged Profile Release --- 3 Visibility Levels</h2>
        <nav className={styles.nav}>
          <a href="/sol-16/us-16-1" className={styles.link}>US-16.1: Staged Visibility of Profile Data</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
