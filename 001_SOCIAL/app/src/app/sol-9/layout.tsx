// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-9 — Compatibility Reflection "Why This Match?"
import styles from './layout.module.css';

export default function Sol9Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-9: Compatibility Reflection "Why This Match?"</h2>
        <nav className={styles.nav}>
          <a href="/sol-9/us-9-1" className={styles.link}>US-9.1: Transparent Match Breakdown "Why This Ma...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
