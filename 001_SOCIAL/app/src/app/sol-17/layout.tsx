// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-17 — Exit Interview on Account Deletion
import styles from './layout.module.css';

export default function Sol17Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-17: Exit Interview on Account Deletion</h2>
        <nav className={styles.nav}>
          <a href="/sol-17/us-17-1" className={styles.link}>US-17.1: Feedback bei Kontolöschung</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
