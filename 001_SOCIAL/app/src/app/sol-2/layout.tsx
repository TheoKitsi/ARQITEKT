// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-2 — 5-Level Funnel Profile & Search Catalog
import styles from './layout.module.css';

export default function Sol2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-2: 5-Level Funnel Profile & Search Catalog</h2>
        <nav className={styles.nav}>
          <a href="/sol-2/us-2-1" className={styles.link}>US-2.1: 5-Level Funnel Self-Description "Who Am ...</a>
          <a href="/sol-2/us-2-2" className={styles.link}>US-2.2: 5-Level Funnel Target Person Description...</a>
          <a href="/sol-2/us-2-3" className={styles.link}>US-2.3: Quirks, Idiosyncrasies & Particularities...</a>
          <a href="/sol-2/us-2-4" className={styles.link}>US-2.4: Profile Preview & Quality Score</a>
          <a href="/sol-2/us-2-5" className={styles.link}>US-2.5: Detailed Field Catalog Per Level</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
