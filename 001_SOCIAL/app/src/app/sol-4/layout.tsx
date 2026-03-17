// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-4 — Optional Visual Harmony Matching via AI
import styles from './layout.module.css';

export default function Sol4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-4: Optional Visual Harmony Matching via AI</h2>
        <nav className={styles.nav}>
          <a href="/sol-4/us-4-1" className={styles.link}>US-4.1: Optional Image Upload + Visual Compatibi...</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
