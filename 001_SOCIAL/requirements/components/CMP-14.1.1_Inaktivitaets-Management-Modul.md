---
type: component
id: CMP-14.1.1
status: draft
parent: US-14.1
version: "1.0"
---

# CMP-14.1.1: Inactivity Management Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-14.1.1.1** | The system shall automatically remove profiles from the matching pool after a configurable inactivity duration (deactivation, not deletion); the duration is configurable at system level (default: 4 weeks). |
| **FN-14.1.1.2** | The system shall send 2-3 reminders via push notification and/or email before automatic deactivation, with clear indication of the remaining deadline. |
| **FN-14.1.1.3** | The system shall automatically reactivate deactivated profiles on the user's next login and inform the user that their profile is back in the matching pool. |
| **FN-14.1.1.4** | The system shall provide a manual "Pause" mode that users can activate/deactivate at any time; in pause mode, the profile is removed from matching without generating inactivity warnings. |

## Function Files

- FN-14.1.1.1: Automatic Inactivity Deactivation
- FN-14.1.1.2: Deactivation Reminders
- FN-14.1.1.3: Automatic Reactivation on Login
- FN-14.1.1.4: Manual Pause Mode