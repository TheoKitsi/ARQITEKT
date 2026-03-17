---
type: Notification
id: NTF-3
title: "Platform Operator Alerts"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-3: Platform Operator Alerts

## Trigger Events

| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Excessive cancellations (>3 in 12 months) | Platform Operator | Email, Dashboard Alert | < 15 min |
| Hash chain integrity violation detected | Platform Operator | Email, PagerDuty | Immediate |
| TrustGate unavailable (>5 min) | Platform Operator | Dashboard Alert | < 1 min |
| Listing with zero candidates at expiry | Platform Operator | Dashboard Alert | Daily digest |

## Content Requirements

- Excessive cancellation alerts shall include tenant ID, cancellation count, listing IDs, and dates.
- Integrity violation alerts shall include the event ID pair where the chain broke and the expected vs. actual hash.
- TrustGate unavailability alerts shall include downtime duration and affected operations count.