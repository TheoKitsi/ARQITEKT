// @generated — ARQITEKT Scaffold
// Page: US-3.1 — Transparent Compatibility Calculation
// Parent: SOL-3
//
// Acceptance Criteria:
// - [ ] AC-3.1.1: Matching is bidirectional — A->B AND B->A must both reach the minimum score.
// - [ ] AC-3.1.2: Levels 1-3 are weighted more heavily than levels 4-5.
// - [ ] AC-3.1.3: Must-Have fields are weighted more heavily than Nice-to-Have fields.
// - [ ] AC-3.1.4: A deal-breaker in either profile leads to immediate exclusion — no match.
// - [ ] AC-3.1.5: Free-text fields are semantically analyzed via NLP and included in the score.
// - [ ] AC-3.1.6: Each match receives an overall score in percent.
// - [ ] AC-3.1.7: The minimum score for proposals is configurable (system default + user option).
// - [ ] AC-3.1.8: Matches are displayed sorted by score descending.
// - [ ] AC-3.1.9: A detail view with strengths/weaknesses overview is available per match.
import CmpCMP_3_1_1 from '@/components/cmp-3-1-1';
import CmpCMP_3_1_2 from '@/components/cmp-3-1-2';
import styles from './page.module.css';

export default function USUS_3_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-3.1: Transparent Compatibility Calculation</h1>
      <div className={styles.components}>
        <CmpCMP_3_1_1 />
        <CmpCMP_3_1_2 />
      </div>
    </div>
  );
}
