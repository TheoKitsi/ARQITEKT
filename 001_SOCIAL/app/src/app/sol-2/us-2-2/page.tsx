// @generated — ARQITEKT Scaffold
// Page: US-2.2 — 5-Level Funnel Target Person Description "Who Am I Looking For?"
// Parent: SOL-2
//
// Acceptance Criteria:
// - [ ] AC-2.2.1: The target person description uses the same 5-level structure as the self-description.
// - [ ] AC-2.2.2: For each field, the user can specify a weighting: Must-Have, Nice-to-Have, or Indifferent.
// - [ ] AC-2.2.3: For numeric and categorical fields, the user can specify tolerance ranges (exact, range, flexible).
// - [ ] AC-2.2.4: The user can set a deal-breaker per field — if not met, no match is proposed.
// - [ ] AC-2.2.5: The target person description must cover at least Levels 1-3.
import CmpCMP_2_2_1 from '@/components/cmp-2-2-1';
import styles from './page.module.css';

export default function USUS_2_2Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-2.2: 5-Level Funnel Target Person Description "Who Am I Looking For?"</h1>
      <div className={styles.components}>
        <CmpCMP_2_2_1 />
      </div>
    </div>
  );
}
