// @generated — ARQITEKT Scaffold
// Page: US-14.1 — Only Active Profiles in Matching Pool
// Parent: SOL-14
//
// Acceptance Criteria:
// - [ ] AC-14.1.1: Profiles inactive for longer than a configurable duration (e.g. 4 weeks) are automatically removed from the matching pool (not deleted).
// - [ ] AC-14.1.2: Before deactivation, 2-3 reminders are sent (push/email) with a clear deadline.
// - [ ] AC-14.1.3: Deactivated profiles are automatically reactivated when the user returns (login).
// - [ ] AC-14.1.4: Users can manually activate a "Pause" mode (e.g. for vacation, personal break) — profile is removed from matching without inactivity warnings.
// - [ ] AC-14.1.5: Paused and deactivated profiles retain all data and previous progress.
import CmpCMP_14_1_1 from '@/components/cmp-14-1-1';
import styles from './page.module.css';

export default function USUS_14_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-14.1: Only Active Profiles in Matching Pool</h1>
      <div className={styles.components}>
        <CmpCMP_14_1_1 />
      </div>
    </div>
  );
}
