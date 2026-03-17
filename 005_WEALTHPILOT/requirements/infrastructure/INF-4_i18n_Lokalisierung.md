---
type: infrastructure
id: INF-4
title: "Internationalisierung und Lokalisierung"
status: draft
version: "1.0"
date: "2026-03-15"
category: "i18n"
crossCutting: true
constrains: [all]
---

# INF-4: Internationalisierung und Lokalisierung

> **Category**: i18n
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

WealthPilot ist primaer fuer den DACH-Markt konzipiert. Primaersprache Deutsch, Sekundaersprache Englisch. Alle UI-Texte ueber i18n-Framework externalisiert. Zahlenformate, Waehrungen und Datumsformate locale-abhaengig. Mandanten koennen Sprachkonfiguration uebersteuern.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-4.1 | Alle UI-Strings in i18n-Resource-Dateien (kein Hardcoding) | Best Practice | yes |
| R-4.2 | Unterstuetzte Locales: de-DE, de-AT, de-CH, en-US | Marktanforderung | yes |
| R-4.3 | Zahlenformate: de -> 1.234,56 / en -> 1,234.56 | ICU/CLDR | yes |
| R-4.4 | Waehrungsformate: EUR als Standard, CHF fuer de-CH, USD/GBP fuer Fremdwaehrungspositionen | ISO 4217 | yes |
| R-4.5 | Datumsformate: de -> TT.MM.JJJJ / en -> YYYY-MM-DD (ISO 8601) | ICU/CLDR | yes |
| R-4.6 | Pluralisierung: Korrekte Singular/Plural-Formen pro Sprache | ICU MessageFormat | yes |
| R-4.7 | Mandantenspezifische Textueberschreibungen (CMP-10.2.1) haben Vorrang vor Defaults | Architektur | yes |
| R-4.8 | KI-generierte Texte (Gemini) in der Sprache des Nutzerprofils | SOL-5 | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| CMP-10.2.1 | high | Custom-Texte pro Mandant ueberschreiben i18n-Defaults |
| CMP-5.1.1 | high | Gemini-Prompt muss Zielsprache spezifizieren |
| CMP-6.1.1 | high | Bundesland-spezifische Steuersaetze (DACH-Varianten) |
| CMP-8.2.1 | medium | PDF-Reports in korrekter Locale |
| CMP-1.2.1 | medium | DIN-77230-Kategorien: Deutsche Bezeichnungen |

---

## Verification Criteria

- [ ] Alle UI-Seiten in de-DE und en-US vollstaendig uebersetzt
- [ ] Zahlen/Waehrungs-Rendering korrekt in allen 4 Locales
- [ ] Kein Hardcoded-String im Quellcode (i18n-Lint-Regel)
- [ ] Gemini-Antworten in korrekter Sprache (Stichprobe: 20 Prompts)
- [ ] PDF-Report: Locale-korrekte Formatierung

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| i18next / react-intl | Runtime i18n Framework | yes |
| i18n-lint / eslint-plugin-i18n | Hardcoded String Detection | yes (CI) |
| ICU MessageFormat | Pluralisierung, Zahlenformate | yes |
| Custom Locale-Testuite | Screenshot-Vergleich DE vs EN | yes (CI) |
