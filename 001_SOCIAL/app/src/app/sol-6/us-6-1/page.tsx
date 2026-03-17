// @generated — ARQITEKT Scaffold
// Page: US-6.1 — Restricted Profile Changes After Initial Population
// Parent: SOL-6
//
// Acceptance Criteria:
// - [ ] AC-6.1.1: All mandatory fields of levels 1-3 are locked after initial population.
// - [ ] AC-6.1.2: Locked fields can only be changed for a fee or within the subscription quota.
// - [ ] AC-6.1.3: Optional fields (levels 4-5) can be changed at any time free of charge.
// - [ ] AC-6.1.4: Limited free changes per time period are possible (e.g. 1 core field change per quarter).
// - [ ] AC-6.1.5: Changes to security-relevant fields (e.g. name, location) trigger a re-verification.
// - [ ] AC-6.1.6: All changes are recorded in an internal change log.
import CmpCMP_6_1_1 from '@/components/cmp-6-1-1';
import styles from './page.module.css';

export default function USUS_6_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-6.1: Restricted Profile Changes After Initial Population</h1>
      <div className={styles.components}>
        <CmpCMP_6_1_1 />
      </div>
    </div>
  );
}
