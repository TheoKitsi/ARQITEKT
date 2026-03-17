// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-11 — Cooldown / Deceleration Mechanism
import styles from './layout.module.css';

export default function Sol11Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-11: Cooldown / Deceleration Mechanism</h2>
        <nav className={styles.nav}>
          <a href="/sol-11/us-11-1" className={styles.link}>US-11.1: Limited High-Quality Match Proposals Per...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
