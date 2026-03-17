// @generated — ARQITEKT Scaffold
// Page: US-7.1 — Data Protection and Purpose Limitation
// Parent: SOL-7
//
// Acceptance Criteria:
// - [ ] AC-7.1.1: All personal data is encrypted at rest (storage) and in transit (transmission).
// - [ ] AC-7.1.2: Every data processing operation is assigned to a clearly defined purpose (GDPR Art. 5(1)(b)).
// - [ ] AC-7.1.3: Consents are obtained granularly per processing purpose and can be individually revoked.
// - [ ] AC-7.1.4: The user can request a complete disclosure of all stored data at any time and export it (GDPR Art. 15).
// - [ ] AC-7.1.5: The user can delete their account; all personal data is completely and irreversibly removed (GDPR Art. 17).
// - [ ] AC-7.1.6: All data accesses are logged and auditable.
// - [ ] AC-7.1.7: Two-factor authentication is available and enforced for sensitive actions.
// - [ ] AC-7.1.8: Suspicious activities (e.g. brute-force login, unusual location changes) are automatically detected.
// - [ ] AC-7.1.9: Users can report abuse and fake profiles; reports are processed within a defined SLA.
import CmpCMP_7_1_1 from '@/components/cmp-7-1-1';
import CmpCMP_7_1_2 from '@/components/cmp-7-1-2';
import styles from './page.module.css';

export default function USUS_7_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-7.1: Data Protection and Purpose Limitation</h1>
      <div className={styles.components}>
        <CmpCMP_7_1_1 />
        <CmpCMP_7_1_2 />
      </div>
    </div>
  );
}
