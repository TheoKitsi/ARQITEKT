// @generated — ARQITEKT Scaffold
// Solution Layout: SOL-8 — Guided Reflective Onboarding Assistant
import styles from './layout.module.css';

export default function Sol8Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.solTitle}>SOL-8: Guided Reflective Onboarding Assistant</h2>
        <nav className={styles.nav}>
          <a href="/sol-8/us-8-1" className={styles.link}>US-8.1: Guided Initial Profile Population via Re...</a>
          <a href="/sol-8/us-8-2" className={styles.link}>US-8.2: Personalized Analogy in Onboarding</a>
          <a href="/sol-8/us-8-3" className={styles.link}>US-8.3: Later Completion of Optional Fields</a>
        </nav>
      </aside>
      <section className={styles.content}>
        {children}
      </section>
    </div>
  );
}
