// @generated — ARQITEKT Scaffold
// Page: US-6.2 — Subscription Model and Pay-per-Action
// Parent: SOL-6
//
// Acceptance Criteria:
// - [ ] AC-6.2.1: There are at least two subscription tiers (e.g. Basic, Premium) with clearly defined feature scope.
// - [ ] AC-6.2.2: Subscription plans are available monthly and annually (with discount).
// - [ ] AC-6.2.3: Pay-per-action transactions are available for defined actions (profile changes, extra matches, premium features).
// - [ ] AC-6.2.4: Payment processing is handled via a secure, certified payment provider (PCI-DSS compliant).
// - [ ] AC-6.2.5: Users have access to a complete billing history.
// - [ ] AC-6.2.6: Subscription cancellation is possible at any time effective at the end of the billing period.
import CmpCMP_6_2_1 from '@/components/cmp-6-2-1';
import styles from './page.module.css';

export default function USUS_6_2Page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>US-6.2: Subscription Model and Pay-per-Action</h1>
      <div className={styles.components}>
        <CmpCMP_6_2_1 />
      </div>
    </div>
  );
}
