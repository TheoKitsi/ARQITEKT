// @generated — ARQITEKT Scaffold
// Page: US-15.1 — Optional Rejection Reasoning for Algorithm Improvement
// Parent: SOL-15
//
// Acceptance Criteria:
// - [ ] AC-15.1.1: On rejection of a match proposal, an optional brief reasoning appears (predefined categories + free text).
// - [ ] AC-15.1.2: Predefined categories include at least: "Values do not match", "Lifestyle too different", "Distance too large", "Intention incompatible", "No feeling", "Other".
// - [ ] AC-15.1.3: The reasoning is completely anonymous — the rejected person never receives insight.
// - [ ] AC-15.1.4: Aggregated rejection data is used to refine the matching algorithm.
// - [ ] AC-15.1.5: Recurring rejection patterns (e.g. "always rejects due to distance") are detected and individual proposal logic is adjusted.
// - [ ] AC-15.1.6: Feedback is voluntary — rejection without reasoning is possible at any time.
import CmpCMP_15_1_1 from '@/components/cmp-15-1-1';
import styles from './page.module.css';

export default function USUS_15_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-15.1: Optional Rejection Reasoning for Algorithm Improvement</h1>
      <div className={styles.components}>
        <CmpCMP_15_1_1 />
      </div>
    </div>
  );
}
