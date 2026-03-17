---
type: solution
id: SOL-6
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-6: Limited/Paid Reconfiguration + Monetization

| Metric | Value |
|---|---|
| User Stories | 2 |
| Components | 2 |
| Functions | 9 |

Core profile fields (levels 1-3) are locked after initial population and can only be changed in a limited way or for a fee. This prevents manipulation and underscores the seriousness of the platform. The monetization model combines subscription plans with pay-per-action transactions.

---

## User Stories

- US-6.1: Restricted Profile Changes After Initial Population
- US-6.2: Subscription Model and Pay-per-Action


## Edge Cases (SOL-6)

| # | Scenario | Rule |
|---|---|---|
| EC-6.1 | **Profile change invalidates existing matches** | If a core field change violates a deal-breaker of an active match, the affected chat partner is notified: "The compatibility with this match has changed." No detail about the change. (-> SOL-3, EC-3.2) |
| EC-6.2 | **Subscription during pause mode (SOL-14)** | The subscription continues running during pause mode — no automatic suspension. The user is informed when activating pause mode. Option: cancel subscription at end of billing period while pause mode remains active until the paid period expires. |
| EC-6.3 | **Free change + re-verification** | If the free change (FN-6.1.1.3) affects a security-relevant field, re-verification (FN-6.1.1.4) is still triggered — free does not mean unchecked. |
| EC-6.4 | **Subscription downgrade** | On downgrade from Premium to Basic: Premium features (e.g. extended match quota SOL-11) are deactivated at the end of the current billing period. Already unlocked matches and chats are retained. |