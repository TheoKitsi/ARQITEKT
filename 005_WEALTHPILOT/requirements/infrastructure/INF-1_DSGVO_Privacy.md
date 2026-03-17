---
type: infrastructure
id: INF-1
title: "DSGVO und Datenschutz"
status: draft
version: "1.0"
date: "2026-03-15"
category: "DSGVO"
crossCutting: true
constrains: [all]
---

# INF-1: DSGVO und Datenschutz

> **Category**: DSGVO
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

Alle personenbezogenen Daten muessen gemaess DSGVO (EU 2016/679) verarbeitet werden. WealthPilot verarbeitet besonders schutzwuerdige Finanzdaten: Kontostaende, Depotpositionen, Einnahmen/Ausgaben, Risikoprofile. Zusaetzlich gelten BaFin-Anforderungen (BAIT/VAIT) fuer den B2B-Kontext.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-1.1 | Personenbezogene Daten muessen AES-256 verschluesselt gespeichert werden (at rest) | DSGVO Art. 32 | yes |
| R-1.2 | Datenuebertragung ausschliesslich ueber TLS 1.3 (in transit) | DSGVO Art. 32 | yes |
| R-1.3 | Datenresidenz: Alle Daten in EU-Rechenzentren (Frankfurt/Dublin) | DSGVO Art. 44-49 | yes |
| R-1.4 | Zweckbindung: Finanzdaten nur fuer deklarierte Zwecke (Analyse, Beratung) | DSGVO Art. 5(1)(b) | yes |
| R-1.5 | Recht auf Loeschung innerhalb 30 Tagen nach Antrag (ausser regulatorische Haltefristen) | DSGVO Art. 17 | yes |
| R-1.6 | Recht auf Datenportabilitaet: Export aller Nutzerdaten als JSON/CSV | DSGVO Art. 20 | yes |
| R-1.7 | Einwilligungsmanagement: Granulare Consent-Verwaltung pro Verarbeitungszweck | DSGVO Art. 7 | yes |
| R-1.8 | Datenschutz-Folgenabschaetzung (DSFA) vor Produktivgang | DSGVO Art. 35 | yes |
| R-1.9 | Auftragsverarbeitungsvertrag (AVV) mit allen Sub-Prozessoren (Google Gemini, PSD2-Provider) | DSGVO Art. 28 | yes |
| R-1.10 | KMS-basiertes Key-Management mit automatischer Key-Rotation alle 90 Tage | BAIT 4.3.2 | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| FN-1.1.1.4 | high | Verschluesselte Speicherung aller Kontodaten |
| CMP-2.1.1 | high | PSD2-Consent muss DSGVO-konform eingeholt werden |
| CMP-5.1.1 | high | Gemini API: PII-Masking vor API-Call, AVV mit Google |
| CMP-9.2.1 | high | DSGVO-Loeschmodul implementiert Art. 17 |
| CMP-9.1.1 | high | Audit-Log fuer Nachweispflicht Art. 5(2) |
| SOL-10 | medium | Mandantentrennung: strikte Datenisolation pro Mandant |

---

## Verification Criteria

- [ ] Penetrationstest bestaetigt AES-256 Verschluesselung at rest
- [ ] TLS 1.3 verifiziert via SSL-Labs-Scan (A+ Rating)
- [ ] Loeschantrag-Workflow: Komplettloeschung innerhalb 30 Tagen nachweisbar
- [ ] Datenexport produziert valides JSON mit allen Nutzerdaten
- [ ] Key-Rotation-Log zeigt automatische Rotation alle 90 Tage
- [ ] Mandantentrennung: Cross-Tenant-Zugriff in Pentest ausgeschlossen

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| OWASP ZAP | TLS-Konfiguration, Header-Pruefung | yes |
| AWS KMS / GCP Cloud KMS | Key-Rotation, Audit-Trail | yes |
| Custom DSFA-Checklist | Datenschutz-Folgenabschaetzung | no |
| Compliance-Dashboard | Loeschantraege, Consent-Status | yes |
