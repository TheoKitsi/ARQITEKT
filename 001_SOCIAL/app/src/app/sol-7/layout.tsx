// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-7 — Data Protection and Security Concept
import styles from './layout.module.css';

export default function Sol7Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-7: Data Protection and Security Concept</h2>
        <nav className={styles.nav}>
          <a href="/sol-7/us-7-1" className={styles.link}>US-7.1: Data Protection and Purpose Limitation</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
