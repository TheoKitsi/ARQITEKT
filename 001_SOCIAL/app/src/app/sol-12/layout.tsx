// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-12 — Detailed Intention Declaration
import styles from './layout.module.css';

export default function Sol12Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-12: Detailed Intention Declaration</h2>
        <nav className={styles.nav}>
          <a href="/sol-12/us-12-1" className={styles.link}>US-12.1: Detailed Relationship Intention as Manda...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
