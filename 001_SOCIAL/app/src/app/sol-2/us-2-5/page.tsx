// @generated — ARQITEKT Scaffold
// Page: US-2.5 — Detailed Field Catalog Per Level
// Parent: SOL-2
//
// Acceptance Criteria:
// - [ ] AC-2.5.1: Each level has a complete field catalog with field name, field type, mandatory/optional status, and description.
// - [ ] AC-2.5.2: All fields are validated (plausibility checks, format, value ranges).
// - [ ] AC-2.5.3: The field catalog is extensible without invalidating existing profiles.
import CmpCMP_2_5_1 from '@/components/cmp-2-5-1';
import styles from './page.module.css';

export default function USUS_2_5Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-2.5: Detailed Field Catalog Per Level</h1>
      <div className={styles.components}>
        <CmpCMP_2_5_1 />
      </div>
    </div>
  );
}
