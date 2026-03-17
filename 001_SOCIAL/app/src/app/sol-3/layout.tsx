// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-3 — Intelligent Text-Based Matching Algorithm
import styles from './layout.module.css';

export default function Sol3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-3: Intelligent Text-Based Matching Algorithm</h2>
        <nav className={styles.nav}>
          <a href="/sol-3/us-3-1" className={styles.link}>US-3.1: Transparent Compatibility Calculation</a>
          <a href="/sol-3/us-3-2" className={styles.link}>US-3.2: Quality Improvement Through Fuller Profi...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
