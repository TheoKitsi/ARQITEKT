// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-10 — Personality and Values Assessment
import styles from './layout.module.css';

export default function Sol10Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-10: Personality and Values Assessment</h2>
        <nav className={styles.nav}>
          <a href="/sol-10/us-10-1" className={styles.link}>US-10.1: Optional Scientifically Founded Personal...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
