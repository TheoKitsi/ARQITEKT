// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-1 — Verified Registration & Identity Verification
import styles from './layout.module.css';

export default function Sol1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-1: Verified Registration & Identity Verification</h2>
        <nav className={styles.nav}>
          <a href="/sol-1/us-1-1" className={styles.link}>US-1.1: Multi-Step Verification</a>
          <a href="/sol-1/us-1-2" className={styles.link}>US-1.2: Uniqueness / Duplicate Prevention</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
