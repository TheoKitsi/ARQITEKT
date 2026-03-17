// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-14 — Inactivity Management
import styles from './layout.module.css';

export default function Sol14Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-14: Inactivity Management</h2>
        <nav className={styles.nav}>
          <a href="/sol-14/us-14-1" className={styles.link}>US-14.1: Only Active Profiles in Matching Pool</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
