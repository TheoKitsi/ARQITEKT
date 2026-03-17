---
type: Function
id: FN-1.6.1.2
title: "Monitor Cancellation Frequency"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.6.1
---

# FN-1.6.1.2: Monitor Cancellation Frequency

## Functional Description

- The system shall maintain a rolling 12-month cancellation counter for each tenant.
- The system shall check the counter after each cancellation increment.
- The system shall alert the platform operator when a tenant's counter exceeds 3 cancellations within any 12-month window.
- The system shall include the tenant ID, listing IDs, cancellation reasons, and dates in the alert.

## Preconditions

- A cancellation has been processed and the counter incremented.

## Behavior

1. System increments counter with current timestamp.
2. System queries cancellations within the last 12 months for the tenant.
3. If count > 3: system sends alert to platform operator.
4. System emits audit event for threshold breach (if applicable).

## Postconditions

- The cancellation counter reflects the latest cancellation.
- The platform operator is alerted if the threshold is exceeded.

## Error Handling

- The system shall log a warning if the counter query fails and retry within 5 minutes.
- The system shall not block the cancellation process if the monitoring step fails.