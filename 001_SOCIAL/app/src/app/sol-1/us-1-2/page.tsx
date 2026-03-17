// @generated — ARQITEKT Scaffold
// Page: US-1.2 — Uniqueness / Duplicate Prevention
// Parent: SOL-1
//
// Acceptance Criteria:
// - [ ] AC-1.2.1: During ID upload, the system checks whether the ID data (hashed comparison) is already associated with an existing account.
// - [ ] AC-1.2.2: On duplicate suspicion, registration is blocked and a support ticket is automatically created.
// - [ ] AC-1.2.3: The user receives a clear error message when blocked.
// - [ ] AC-1.2.4: ID data is stored exclusively as a hash — no plaintext storage of personal ID data.
import CmpCMP_1_2_1 from '@/components/cmp-1-2-1';
import styles from './page.module.css';

export default function USUS_1_2Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-1.2: Uniqueness / Duplicate Prevention</h1>
      <div className={styles.components}>
        <CmpCMP_1_2_1 />
      </div>
    </div>
  );
}
