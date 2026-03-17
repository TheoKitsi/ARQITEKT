---
type: infrastructure
id: INF-3
title: "WCAG Accessibility"
status: draft
version: "1.0"
date: "2026-03-15"
category: "WCAG"
crossCutting: true
constrains: [all]
---

# INF-3: WCAG Accessibility

> **Category**: WCAG
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

WealthPilot muss WCAG 2.1 Level AA erfuellen. Als B2B-SaaS-Plattform fuer Banken und Versicherer ist Barrierefreiheit regulatorische Pflicht (EU-Richtlinie 2019/882 / Barrierefreiheitsstaerkungsgesetz ab 2025). Alle interaktiven Komponenten, Charts und Formulare muessen barrierefrei bedienbar sein.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-3.1 | Farbkontrast mindestens 4.5:1 (Normal-Text) bzw. 3:1 (Grosser Text) | WCAG 1.4.3 AA | yes |
| R-3.2 | Alle interaktiven Elemente per Tastatur bedienbar (Tab, Enter, Escape) | WCAG 2.1.1 AA | yes |
| R-3.3 | Formulare: Jedes Eingabefeld hat ein sichtbares Label und ARIA-Attribute | WCAG 1.3.1 AA | yes |
| R-3.4 | Fehlermeldungen: Programmatisch zugeordnet via aria-describedby | WCAG 3.3.1 AA | yes |
| R-3.5 | Charts: Alternativtext oder tabellarische Darstellung als Fallback | WCAG 1.1.1 AA | yes |
| R-3.6 | Fokus-Management: Sichtbarer Fokusindikator, logische Tab-Reihenfolge | WCAG 2.4.7 AA | yes |
| R-3.7 | Responsive: Funktional von 320px bis 1920px Viewport-Breite | WCAG 1.4.10 AA | yes |
| R-3.8 | Animationen: Respektiert prefers-reduced-motion | WCAG 2.3.3 AAA | no |
| R-3.9 | White-Label Branding: WCAG-Kontrastpruefung bei Custom-Farben (CMP-10.2.1) | WCAG 1.4.3 AA | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| CMP-1.1.1 | high | Multi-Step-Formular: Tastatur-Navigation, Fehlermeldungen |
| CMP-4.2.2 | high | Impact-Visualisierung: Chart-Alternativtexte, Datentabellen |
| CMP-8.1.1 | high | Dashboard-Widgets: Screen-Reader-kompatibel |
| CMP-5.1.1 | high | Chat-Interface: Live-Region fuer Streaming-Antworten |
| CMP-10.2.1 | high | Branding-Modul: Kontrastpruefung bei Custom-Farben |
| CMP-1.3.1 | medium | Risikoprofil-Fragebogen: Likert-Skala barrierefrei |

---

## Verification Criteria

- [ ] axe-core Scan: 0 Critical/Serious Violations auf allen Seiten
- [ ] Lighthouse Accessibility Score >= 95
- [ ] Manueller Screen-Reader-Test (NVDA/VoiceOver) fuer Kernflows
- [ ] Tastatur-Navigation: Alle Flows ohne Maus abschliessbar
- [ ] White-Label-Farbpruefung: System verhindert nicht-konforme Farbkombinationen

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| axe-core / @axe-core/react | Component-Level A11y | yes (CI) |
| Lighthouse CI | Page-Level Score | yes (CI) |
| eslint-plugin-jsx-a11y | JSX Accessibility Patterns | yes (CI) |
| Pa11y | Full-Page Crawl | yes (CI) |
| Manual NVDA/VoiceOver | Screen-Reader Verification | no (quarterly) |
