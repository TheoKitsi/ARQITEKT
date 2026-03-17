// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-5 — Mutual Consent Before Contact
import styles from './layout.module.css';

export default function Sol5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-5: Mutual Consent Before Contact</h2>
        <nav className={styles.nav}>
          <a href="/sol-5/us-5-1" className={styles.link}>US-5.1: Mutual Interest Declaration Before Conta...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
