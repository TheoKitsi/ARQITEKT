// @generated — ARQITEKT Scaffold
// Page: US-10.1 — Optional Scientifically Founded Personality Test
// Parent: SOL-10
//
// Acceptance Criteria:
// - [ ] AC-10.1.1: The personality test is completely optional — not mandatory for initial profile population or matching.
// - [ ] AC-10.1.2: The test covers three dimensions: personality traits (Big Five), attachment style (Attachment), and value prioritization (Schwartz).
// - [ ] AC-10.1.3: After completion, the user receives a summarized personality profile presented in an understandable format.
// - [ ] AC-10.1.4: The user can confirm the computed profile or manually adjust it if they do not feel correctly represented.
// - [ ] AC-10.1.5: Test results feed into the matching algorithm as an additional factor and increase match accuracy.
// - [ ] AC-10.1.6: The test can be repeated at any time; the latest result overwrites the previous one.
import CmpCMP_10_1_1 from '@/components/cmp-10-1-1';
import styles from './page.module.css';

export default function USUS_10_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-10.1: Optional Scientifically Founded Personality Test</h1>
      <div className={styles.components}>
        <CmpCMP_10_1_1 />
      </div>
    </div>
  );
}
