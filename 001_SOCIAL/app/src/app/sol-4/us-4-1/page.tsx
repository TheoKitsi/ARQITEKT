// @generated — ARQITEKT Scaffold
// Page: US-4.1 — Optional Image Upload + Visual Compatibility
// Parent: SOL-4
//
// Acceptance Criteria:
// - [ ] AC-4.1.1: Image upload is fully optional — no user is forced to upload.
// - [ ] AC-4.1.2: Uploaded images are automatically checked for authenticity (deepfake detection, stock photo detection).
// - [ ] AC-4.1.3: The AI computes a visual harmony score between two users.
// - [ ] AC-4.1.4: The harmony score feeds into the overall score only when **both** users have actively opted in.
// - [ ] AC-4.1.5: Users are clearly informed that an AI analyzes their images and can opt out at any time.
// - [ ] AC-4.1.6: Images are fully removed on opt-out or account deletion.
import CmpCMP_4_1_1 from '@/components/cmp-4-1-1';
import styles from './page.module.css';

export default function USUS_4_1Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-4.1: Optional Image Upload + Visual Compatibility</h1>
      <div className={styles.components}>
        <CmpCMP_4_1_1 />
      </div>
    </div>
  );
}
