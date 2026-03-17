// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-13 — Trust and Seriousness System
import styles from './layout.module.css';

export default function Sol13Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-13: Trust and Seriousness System</h2>
        <nav className={styles.nav}>
          <a href="/sol-13/us-13-1" className={styles.link}>US-13.1: Seriousness Indicator for Matches</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
