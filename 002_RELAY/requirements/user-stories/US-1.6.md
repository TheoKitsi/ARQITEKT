---
type: UserStory
id: US-1.6
title: "Exceptional Cancellation"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.6.1
---

# US-1.6: Exceptional Cancellation

**As a** listing tenant
**I want to** cancel the successor search in exceptional circumstances with a documented reason
**So that** I can exit the process when external factors make continuation impossible while maintaining a trustworthy audit record

## Acceptance Criteria

- **AC-1.6.1:** The system shall allow the listing tenant to request cancellation at any stage of the listing lifecycle by selecting a reason from a predefined list (lease terminated by landlord, personal circumstances, legal dispute, other).
- **AC-1.6.2:** The system shall require a free-text explanation (min 50 characters) when "other" is selected as the cancellation reason.
- **AC-1.6.3:** The system shall notify all active candidates of the cancellation within 1 hour, including the selected reason category (but not the free text).
- **AC-1.6.4:** The system shall notify the landlord of the cancellation with full details including free text.
- **AC-1.6.5:** The system shall transition the listing to a "cancelled" terminal state that cannot be reversed.
- **AC-1.6.6:** The system shall retain all listing and candidacy data for audit purposes for a minimum of 3 years after cancellation.
- **AC-1.6.7:** The system shall increment a cancellation counter on the tenant's profile; when the counter exceeds 3 in 12 months, the platform operator is alerted for review.