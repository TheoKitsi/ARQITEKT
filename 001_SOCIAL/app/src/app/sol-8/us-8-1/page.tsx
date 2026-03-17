// @generated — ARQITEKT Scaffold
// Page: US-8.1 — Guided Initial Profile Population via Reflection Assistant
// Parent: SOL-8
//
// Acceptance Criteria:
// - [ ] AC-8.1.1: The onboarding presents fields as a multi-step, conversation-based dialogue — not as a classic form.
// - [ ] AC-8.1.2: The assistant follows the 5-level funnel structure from SOL-2.
// - [ ] AC-8.1.3: Before each topic block, a reflection question is posed (e.g. "Imagine your partner has [trait X]. How does that feel?").
// - [ ] AC-8.1.4: For each field, a context explanation is provided (e.g. "Why do we ask this? Because different communication styles are one of the most common reasons for separation.").
// - [ ] AC-8.1.5: The pace is deliberately maintained — no gamification, no time pressure, no reward mechanics.
// - [ ] AC-8.1.6: On interruption, the intermediate state is saved; the user is invited to continue later.
// - [ ] AC-8.1.7: A progress bar shows the overall progress across all levels.
import CmpCMP_8_1_1 from '@/components/cmp-8-1-1';
import styles from './page.module.css';

export default function USUS_8_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-8.1: Guided Initial Profile Population via Reflection Assistant</h1>
      <div className={styles.components}>
        <CmpCMP_8_1_1 />
      </div>
    </div>
  );
}
