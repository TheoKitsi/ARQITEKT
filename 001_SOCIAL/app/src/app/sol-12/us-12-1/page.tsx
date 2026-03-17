// @generated — ARQITEKT Scaffold
// Page: US-12.1 — Detailed Relationship Intention as Mandatory Input
// Parent: SOL-12
//
// Acceptance Criteria:
// - [ ] AC-12.1.1: "Relationship intention" and "time horizon" are mandatory fields in funnel level 1 — without input no access to level 2 (-> SOL-2, Level 1).
// - [ ] AC-12.1.2: The user specifies their time horizon for partnership readiness (immediately / 1-6 months / 6-12 months / open).
// - [ ] AC-12.1.3: Willingness to relocate, maximum distance, and long-distance readiness are captured as mandatory fields in funnel level 3 and used as matching criteria (-> SOL-2, Level 3).
// - [ ] AC-12.1.4: All intention fields (level 1 + 3) are weighted highly in the matching algorithm.
// - [ ] AC-12.1.5: Incompatible intentions (e.g. "immediately ready" vs. "maybe someday") lead to significant score reduction.
import CmpCMP_12_1_1 from '@/components/cmp-12-1-1';
import styles from './page.module.css';

export default function USUS_12_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-12.1: Detailed Relationship Intention as Mandatory Input</h1>
      <div className={styles.components}>
        <CmpCMP_12_1_1 />
      </div>
    </div>
  );
}
