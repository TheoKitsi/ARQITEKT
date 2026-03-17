---
type: adr
id: ADR-4
title: "PSD2 Provider finAPI"
status: approved
version: "1.0"
date: "2026-03-15"
deciders: ["kitsi"]
superseded_by: null
---

# ADR-4: PSD2 Provider finAPI

> **Status**: accepted
> **Date**: 2026-03-15
> **Deciders**: kitsi

---

## Context

WealthPilot benoetigt PSD2-Kontoaggregation (AISP) fuer Multi-Bank-Zugriff. Zertifizierter AISP-Provider noetig, da eigene PSD2-Lizenz zu aufwendig fuer ein Startup. Provider muss: deutsche Banken vollstaendig abdecken, BaFin-reguliert sein, Depot-Positionen unterstuetzen (nicht nur Konten), stabile API mit gutem Developer-Erlebnis bieten.

---

## Decision

**finAPI als primaerer PSD2/AISP-Provider, mit Abstraktionsschicht fuer Provider-Wechsel.**

---

## Reasoning

- finAPI ist BaFin-lizenziert (AISP) und in Deutschland marktfuehrend
- Abdeckung: 99%+ der deutschen Banken inkl. Sparkassen und Genossenschaftsbanken
- Unterstuetzt Depot-Positionen und Wertpapiertransaktionen (nicht nur Konten)
- Deutsche Firma, Datenresidenz in Deutschland (DSGVO-konform)
- REST-API mit gutem Developer-Portal und Sandbox-Umgebung
- Consent-Management und Renewal integriert

---

## Alternatives Considered

| Alternative | Pro | Contra | Rejected because |
|---|---|---|---|
| Tink (Visa) | Grosse europaeische Abdeckung | Schwaecher bei deutschen Sparkassen/Genobanken, Preismodell intransparent | Deutsche Bankenabdeckung nicht ausreichend |
| Plaid | Marktfuehrer USA, gute API | Schwache DACH-Abdeckung, kein Depot-Support in EU | Nicht fuer deutschen Markt geeignet |
| Eigene PSD2-Lizenz | Volle Kontrolle, keine Provider-Kosten | 12-18 Monate BaFin-Prozess, hohe Compliance-Kosten | Time-to-Market zu lang |
| Nordigen (GoCardless) | Kostenlos fuer Basic, gute EU-Abdeckung | Kein Depot-Support, nur Konten/Transaktionen | Depot-Positionen sind Kernfeature |

---

## Consequences

### Positive

- Schneller Time-to-Market: PSD2-Anbindung in Wochen statt Monaten
- 99%+ deutsche Bankenabdeckung ab Tag 1
- Depot-Positionen + Wertpapiertransaktionen verfuegbar
- BaFin-Compliance durch Provider abgedeckt

### Negative

- Provider-Abhaengigkeit: finAPI als Single Point of Failure
- Kosten: Pro-Verbindung-Pricing kann bei Skalierung teuer werden
- API-Aenderungen erfordern Adapter-Updates

### Risks

- Vendor-Lock-in: Abstraktionsschicht (CMP-2.1.1) ermoeglicht Provider-Wechsel
- finAPI-Ausfall: Circuit-Breaker + Degraded-Mode (manuelle Eingabe als Fallback)
- Preiserhoehungen: Vertraglich Preis-Cap verhandeln

---

## Affected Requirements

| Requirement | Impact |
|---|---|
| CMP-2.1.1 | PSD2-Adapter: finAPI-spezifische Implementierung hinter Interface |
| CMP-2.2.1 | Depot-Sync: finAPI Depot-API fuer Positionen und Transaktionen |
| FN-2.1.1.1 | Consent: finAPI OAuth2-Flow + Redirect |
| FN-2.1.1.4 | Consent-Renewal: finAPI 90-Tage-Erneuerung |

---

## References

- finAPI Developer Portal: https://developer.finapi.io
- finAPI BaFin-Registrierung: Zahlungsdienstleister (AISP)
