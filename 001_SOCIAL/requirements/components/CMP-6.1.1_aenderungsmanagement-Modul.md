---
type: component
id: CMP-6.1.1
status: draft
parent: US-6.1
version: "1.0"
---

# CMP-6.1.1: Change Management Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-6.1.1.1** | The system shall lock core profile fields (levels 1-3 mandatory fields) after initial population and prevent changes by default. |
| **FN-6.1.1.2** | The system shall release locked fields for change only against a defined fee (pay-per-action) or within the subscription quota. |
| **FN-6.1.1.3** | The system shall allow limited free changes per time period (configurable, e.g. 1 core field change per quarter). |
| **FN-6.1.1.4** | The system shall trigger a re-verification for changes to security-relevant fields (name, location, gender) before the change takes effect. |
| **FN-6.1.1.5** | The system shall record all profile changes in an internal change log (timestamp, changed field, old/new value — viewable only by administrators). |

## Function Files

- FN-6.1.1.1: Lock Core Profile Fields
- FN-6.1.1.2: Fee-Based Field Unlocking
- FN-6.1.1.3: Limited Free Changes
- FN-6.1.1.4: Re-Verification on Security Fields
- FN-6.1.1.5: Internal Change Log