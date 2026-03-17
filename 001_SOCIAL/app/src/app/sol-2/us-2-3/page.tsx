// @generated — ARQITEKT Scaffold
// Page: US-2.3 — Quirks, Idiosyncrasies & Particularities (Level 4 Detail)
// Parent: SOL-2
//
// Acceptance Criteria:
// - [ ] AC-2.3.1: Level 4 contains a dedicated category "Quirks, Idiosyncrasies & Particularities".
// - [ ] AC-2.3.2: Predefined subcategories include at least: lifestyle particularities, sexual preferences, unconventional life models, special family bonds.
// - [ ] AC-2.3.3: A free-text field "What most people don't know about me but my partner must know" is available.
// - [ ] AC-2.3.4: Particularity fields are set to visibility level 1 by default (algorithm only, not visible in profile views).
// - [ ] AC-2.3.5: Particularities are factored into the matching algorithm as a compatibility factor.
// - [ ] AC-2.3.6: The input environment is non-judgmental and encouraging — no framing as "unusual" or "problematic".
import CmpCMP_2_3_1 from '@/components/cmp-2-3-1';
import styles from './page.module.css';

export default function USUS_2_3Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-2.3: Quirks, Idiosyncrasies & Particularities (Level 4 Detail)</h1>
      <div className={styles.components}>
        <CmpCMP_2_3_1 />
      </div>
    </div>
  );
}
