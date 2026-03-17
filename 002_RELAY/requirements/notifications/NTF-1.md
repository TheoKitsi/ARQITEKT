---
type: Notification
id: NTF-1
title: "Listing Lifecycle Notifications"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-1: Listing Lifecycle Notifications

## Trigger Events

| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Landlord approval requested | Landlord | Email, In-App | Immediate |
| Landlord approval granted | Listing Tenant | Email, In-App | < 5 min |
| Landlord approval revoked | Listing Tenant | Email, In-App | < 5 min |
| Listing published | Listing Tenant | In-App | Immediate |
| Listing entered decision phase | Landlord | Email, In-App | Immediate |
| Listing completed (handover) | Listing Tenant, Landlord, Accepted Candidate | Email, In-App | < 5 min |
| Listing cancelled | All Active Candidates, Landlord | Email, In-App | < 1 hour |
| Decision deadline approaching (24h) | Landlord | Email, Push | Immediate |
| Decision deadline expired | Listing Tenant | Email, In-App | Immediate |

## Content Requirements

- All notifications shall include the listing title and address.
- Email notifications shall be plain-text with an optional HTML version.
- Cancellation notifications to candidates shall include the reason category but not the free text.
- Cancellation notifications to landlords shall include full details.
- All notifications shall include a deep link to the relevant listing or action page.

## Delivery Requirements

- Email delivery via transactional email provider (e.g., SES, Postmark).
- In-app notifications stored in a notification inbox with read/unread status.
- Push notifications via FCM/APNs for mobile clients (future phase).
- Retry policy: 3 retries with exponential backoff for failed deliveries.