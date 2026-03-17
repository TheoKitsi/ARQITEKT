---
type: component
id: CMP-5.1.1
status: draft
parent: US-5.1
version: "1.0"
date: "2026-03-15"
---

# CMP-5.1.1: Gemini Chat Interface

## Beschreibung

Chat-Komponente mit natuerlichsprachlicher Eingabe. Kontext-Injektion: Nutzerprofil, Portfolio-Snapshot und aktives Szenario werden als System-Prompt mitgegeben. Streaming-Antworten via Server-Sent Events. Rate-Limiting: Max 20 Anfragen/Stunde pro Nutzer. Jede Antwort enthaelt regulatorischen Disclaimer-Banner.
## Abhaengigkeiten

- Google Gemini 2.0 Flash API
- CMP-9.1.1 (Audit-Logger) protokolliert alle KI-Interaktionen

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Nutzernachricht, Kontext (Portfolio-Snapshot, Szenario, Risikoprofil) |
| **Output** | Streaming-Antwort via SSE mit regulatorischem Disclaimer |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-5.1.1.1](../functions/FN-5.1.1.1_Chat_Nachricht_Senden.md) | Chat Nachricht Senden | draft |
| [FN-5.1.1.2](../functions/FN-5.1.1.2_Streaming_Antwort.md) | Streaming Antwort | draft |
| [FN-5.1.1.3](../functions/FN-5.1.1.3_Rate_Limiting.md) | Rate Limiting | draft |
| [FN-5.1.1.4](../functions/FN-5.1.1.4_Disclaimer_Anzeigen.md) | Disclaimer Anzeigen | draft |


---

## Constraints

Gemini 2.0 Flash (ADR-5). Rate-Limit 20/h. PII-Masking vor API-Call. Prompt-Injection-Schutz. Token-Budget pro Nutzer.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-2 | Prompt-Injection-Schutz, PII-Masking |
| INF-1 | KI-Interaktionen auditiert, PII nicht an API |
