---
type: adr
id: ADR-5
title: "Gemini AI Integration"
status: approved
version: "1.0"
date: "2026-03-15"
deciders: ["kitsi"]
superseded_by: null
---

# ADR-5: Gemini AI Integration

> **Status**: accepted
> **Date**: 2026-03-15
> **Deciders**: kitsi

---

## Context

WealthPilot benoetigt eine LLM-Integration fuer natuerlichsprachliche Beratung (SOL-5). Das Modell muss: deutschsprachige Finanzberatung liefern, Zahlen aus Berechnungen korrekt referenzieren, Streaming-Antworten unterstuetzen, kosteneffizient bei hohem Anfragevolumen sein, regulatorisch absicherbar sein (keine Anlageberatung).

---

## Decision

**Google Gemini 2.0 Flash als primaeres LLM, mit Abstraktionsschicht fuer Modellwechsel. Structured Output fuer validierbare Antworten.**

---

## Reasoning

- Gemini 2.0 Flash: Bestes Preis-Leistungs-Verhaeltnis fuer lange Kontextfenster (1M Tokens)
- Streaming via SSE nativ unterstuetzt
- Structured Output (JSON-Mode): KI-Zahlen als strukturierte Daten extrahierbar und gegen Berechnungen validierbar
- Deutschsprachige Qualitaet ausreichend fuer Finanzkontext
- Google Cloud AVV (Auftragsverarbeitung) verfuegbar fuer DSGVO
- Kosten: ~$0.075/1M Input-Tokens (Flash) — tragbar bei 20 Anfragen/Stunde/Nutzer

---

## Alternatives Considered

| Alternative | Pro | Contra | Rejected because |
|---|---|---|---|
| GPT-4o (OpenAI) | Hoechste Qualitaet, guter deutscher Output | Teurer (3-5x Flash), kein EU-Rechenzentrum garantiert | Kosten bei Skalierung, DSGVO-Bedenken |
| Claude 3.5 Sonnet | Exzellent bei langen Dokumenten | Kein EU-Hosting, komplex bei Structured Output | DSGVO-Compliance schwieriger |
| Llama 3 (Self-Hosted) | Volle Kontrolle, keine API-Kosten | Hosting-Aufwand, GPU-Kosten, schwaecher bei Deutsch | Self-Hosting-Komplexitaet fuer Startup zu hoch |
| Mixtral (Self-Hosted) | Open-Source, EU-konform | Qualitaet unter Gemini/GPT, GPU-Infrastruktur noetig | Qualitaets-Gap zu gross |

---

## Consequences

### Positive

- Structured Output: Validierung KI-Zahlen gegen Berechnungsergebnisse (2%-Schwelle)
- Kosteneffizient: Flash-Modell fuer die meisten Anfragen
- Grosses Kontextfenster: Gesamtes Portfolio + Szenario in einem Prompt
- AVV mit Google verfuegbar

### Negative

- API-Abhaengigkeit: Google-Ausfall blockiert KI-Features
- Modell-Updates: Qualitaetsschwankungen bei Modellwechseln moeglich
- Kein EU-Rechenzentrum explizit garantiert (Google Cloud EU-Region: ja, Gemini API: best-effort)

### Risks

- API-Ausfall: Fallback auf berechnungsbasierte Erklaerungen ohne NLG (CMP-5.2.1-Degraded-Mode)
- PII-Leakage: Strikte PII-Masking-Pipeline vor API-Call (Kontonummern, IBANs, Namen)
- Prompt-Injection: Input-Sanitization + System-Prompt-Hardening + Output-Validation
- EU-Datenresidenz: Proxy ueber EU-Region, Monitoring auf Routing-Aenderungen
- Kosten-Explosion: Token-Budget pro Nutzer/Tag, Alert bei Ueberschreitung

---

## Affected Requirements

| Requirement | Impact |
|---|---|
| CMP-5.1.1 | Gemini Chat: API-Integration, Streaming, Rate-Limiting |
| CMP-5.2.1 | Szenario-Erklaerung: Structured Output, Zahlen-Validierung |
| FN-5.1.1.1 | Chat-Nachricht: Prompt-Aufbau mit Kontext-Injektion |
| FN-5.1.1.3 | Rate-Limiting: 20 req/h/Nutzer, Token-Budget |
| FN-5.2.1.2 | Zahlen-Validierung: Structured Output vs. Berechnungsdaten |
| INF-1 | DSGVO: PII-Masking, AVV mit Google |
| INF-2 | OWASP: Prompt-Injection-Schutz |

---

## References

- Google Gemini API: https://ai.google.dev/docs
- Gemini 2.0 Flash: https://ai.google.dev/gemini-api/docs/models/gemini-v2
- Google Cloud DPA (AVV): https://cloud.google.com/terms/data-processing-addendum
