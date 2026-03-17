// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-15 — Feedback Loop After Match Rejection
import styles from './layout.module.css';

export default function Sol15Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-15: Feedback Loop After Match Rejection</h2>
        <nav className={styles.nav}>
          <a href="/sol-15/us-15-1" className={styles.link}>US-15.1: Optional Rejection Reasoning for Algorit...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
