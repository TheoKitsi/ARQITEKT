---
type: component
id: CMP-2.1.1
status: draft
parent: US-2.1
version: "1.0"
date: "2026-03-15"
---

# CMP-2.1.1: PSD2 Kontoaggregations Adapter

## Beschreibung

Anbindung an PSD2-Schnittstellen (Berlin Group / FinTS) ueber zertifizierten AISP-Provider. Kontostaende und Transaktionen werden taeglich synchronisiert. OAuth2-basiertes Consent-Management mit 90-Tage-Renewal. Unterstuetzt alle deutschen Banken mit PSD2-API.
## Abhaengigkeiten

- Externer AISP-Anbieter (finAPI / Tink / Plaid)
- CMP-9.1.1 (Audit-Logger) fuer Consent-Tracking

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | OAuth2-Redirect von finAPI, Bank-Auswahl des Nutzers |
| **Output** | Synchronisierte Kontostaende und Transaktionen im Finanzprofil |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-2.1.1.1](../functions/FN-2.1.1.1_Consent_Einholen.md) | Consent Einholen | draft |
| [FN-2.1.1.2](../functions/FN-2.1.1.2_Kontostaende_Abrufen.md) | Kontostaende Abrufen | draft |
| [FN-2.1.1.3](../functions/FN-2.1.1.3_Transaktionen_Synchronisieren.md) | Transaktionen Synchronisieren | draft |
| [FN-2.1.1.4](../functions/FN-2.1.1.4_Consent_Renewal.md) | Consent Renewal | draft |


---

## Constraints

BaFin-regulierter AISP-Provider finAPI (ADR-4). Consent max 90 Tage gueltig. Taegliche Synchronisation als Background-Job.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-1 | PSD2-Consent DSGVO-konform, Datenminimierung |
| INF-2 | OAuth2-Token-Sicherheit, PKCE |
