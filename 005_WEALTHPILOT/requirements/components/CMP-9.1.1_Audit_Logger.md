---
type: component
id: CMP-9.1.1
status: draft
parent: US-9.1
version: "1.0"
date: "2026-03-15"
---

# CMP-9.1.1: Audit Logger

## Beschreibung

Immutable Audit-Log fuer alle regulatorisch relevanten Aktionen. Events: Login, Profilaenderung, Risikoprofil-Aenderung, KI-Interaktion, Produktansicht, Empfehlung, Report-Generierung. Speicherung: Append-only Datenbank mit kryptographischer Verkettung (Hash-Chain). Aufbewahrungsfrist: 10 Jahre (HGB). Query-Interface fuer Compliance-Abteilung mit Zeitraum- und Nutzer-Filter.

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Audit-Events: Typ, Nutzer-ID, Timestamp, Payload-Hash |
| **Output** | Immutable Audit-Log mit kryptographischer Hash-Chain |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-9.1.1.1](../functions/FN-9.1.1.1_Event_Loggen.md) | Event Loggen | draft |
| [FN-9.1.1.2](../functions/FN-9.1.1.2_Hash_Chain_Sicherung.md) | Hash Chain Sicherung | draft |
| [FN-9.1.1.3](../functions/FN-9.1.1.3_Audit_Query_Interface.md) | Audit Query Interface | draft |
| [FN-9.1.1.4](../functions/FN-9.1.1.4_Aufbewahrungsfrist.md) | Aufbewahrungsfrist | draft |


---

## Constraints

Append-only. SHA-256 Hash-Chain. Aufbewahrung 10 Jahre (HGB). Query-Interface mit Zeitraum/Nutzer-Filter. Kein Loeschen moeglich.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-1 | Audit-Log fuer DSGVO-Nachweispflicht Art. 5(2) |
| INF-2 | Hash-Chain-Integritaet, Tamper-Detection |
