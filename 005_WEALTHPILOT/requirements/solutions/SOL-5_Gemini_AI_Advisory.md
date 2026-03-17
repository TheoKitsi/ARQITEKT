---
type: solution
id: SOL-5
title: "Gemini AI Advisory"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-4"]
  downstream: ["SOL-8"]
---

# SOL-5: Gemini AI Advisory

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-4 | downstream: SOL-8





---

## System Boundaries

### In Scope

- Gemini-Chat-Interface fuer KI-gestuetzte Beratung.
- Szenario-Erklaerung und -Bewertung durch Gemini.
- Kontextbezogene Empfehlungen basierend auf Nutzerprofil.
- PII-Masking vor API-Aufruf.

### Out of Scope

- Eigenstaendige Anlageberatung (AI ist nur Unterstuetzung, nicht Entscheidung).
- Fine-Tuning des Gemini-Modells.
- Training mit Kundendaten.

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-5.1](../user-stories/US-5.1_KI_Beratungsgespraech_fuehren.md) | KI Beratungsgespraech fuehren | draft |
| [US-5.2](../user-stories/US-5.2_Szenario_Bewertung_durch_Gemini.md) | Szenario Bewertung durch Gemini | draft |

---

## Architecture Context

Frontend: Chat-Widget (Server-Sent Events) | Backend: NestJS Gemini-Gateway | API: Google Gemini 2.0 Flash (Structured Output) | Security: PII-Masking-Pipeline

---

## Edge Cases (SOL-5)

| # | Szenario | Regel |
|---|---|---|
| EC-5.1 | **Gemini API nicht verfügbar** | Fallback: System zeigt berechnete Daten ohne KI-Kommentar. Hinweis: "KI-Beratung vorübergehend nicht verfügbar. Die Zahlen sind korrekt — die Interpretation folgt, sobald der Service verfügbar ist." |
| EC-5.2 | **KI empfiehlt konkretes Produkt** | Disclaimer automatisch: "Dies ist keine Anlageberatung im Sinne des WpHG. Bitte konsultieren Sie Ihren persönlichen Berater." |
| EC-5.3 | **Halluzinierte Zahlen / falsche Renditen** | Alle KI-Aussagen mit berechneten Fakten validieren. Bei Abweichung >5%: KI-Text verwerfen, Standardtext anzeigen. |
| EC-5.4 | **Nutzer fragt nach nicht-finanziellen Themen** | Gemini erhält System-Prompt mit striktem Scope. Bei Off-Topic: "Ich kann nur bei Finanzfragen helfen. Für andere Themen wende dich bitte an den Kundenservice." |
