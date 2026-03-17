---
type: Function
id: FN-1.2.1.2
title: "Sync Badge States"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.2: Sync Badge States

## Functional Description

- The system shall poll TrustGate badge state changes every 5 minutes for all active pool profiles.
- The system shall update the local badge cache in Redis upon detecting changes.
- The system shall deactivate pool profiles whose last remaining badge has expired.
- The system shall notify affected candidates when their profile is deactivated due to badge expiration.

## Preconditions

- TrustGate badge webhook or polling endpoint is available.
- Pool profiles exist with linked TrustGate subject IDs.

## Behavior

1. Fetch badge change feed from TrustGate API (delta since last sync).
2. For each change, update Redis cache and PostgreSQL badge snapshot.
3. If a candidate loses all active badges, set profile status to `suspended`.
4. Dispatch notification event for suspended profiles.
5. Log sync summary (updated count, suspended count, errors).

## Postconditions

- Badge cache is current within 5-minute window.
- Suspended profiles excluded from matching.
- Affected candidates notified.

## Error Handling

- The system shall retry badge sync up to 3 times with exponential backoff on TrustGate API failure.
- The system shall log a platform alert if sync fails for 3 consecutive cycles.
- The system shall not suspend profiles during sync outage (preserve last known state).