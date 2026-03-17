// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-6 — Limited/Paid Reconfiguration + Monetization
import styles from './layout.module.css';

export default function Sol6Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-6: Limited/Paid Reconfiguration + Monetization</h2>
        <nav className={styles.nav}>
          <a href="/sol-6/us-6-1" className={styles.link}>US-6.1: Restricted Profile Changes After Initial...</a>
          <a href="/sol-6/us-6-2" className={styles.link}>US-6.2: Subscription Model and Pay-per-Action</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
