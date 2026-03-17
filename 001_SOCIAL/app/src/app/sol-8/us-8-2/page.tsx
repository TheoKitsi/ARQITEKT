// @generated — ARQITEKT Scaffold
// Page: US-8.2 — Personalized Analogy in Onboarding
// Parent: SOL-8
//
// Acceptance Criteria:
// - [ ] AC-8.2.1: At the beginning of onboarding, the user can choose from several analogies (e.g. apartment search, car purchase, smartphone, travel, clothing).
// - [ ] AC-8.2.2: The chosen analogy is used in explanatory texts per funnel level.
// - [ ] AC-8.2.3: The analogy can be changed at any time.
// - [ ] AC-8.2.4: If no analogy is desired, the user can choose "Without analogy".
import CmpCMP_8_2_1 from '@/components/cmp-8-2-1';
import styles from './page.module.css';

export default function USUS_8_2Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-8.2: Personalized Analogy in Onboarding</h1>
      <div className={styles.components}>
        <CmpCMP_8_2_1 />
      </div>
    </div>
  );
}
