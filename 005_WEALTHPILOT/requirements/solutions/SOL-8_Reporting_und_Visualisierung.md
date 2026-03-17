---
type: solution
id: SOL-8
title: "Reporting & Visualisierung"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-3", "SOL-4", "SOL-5", "SOL-6", "SOL-7"]
  downstream: []
---

# SOL-8: Reporting & Visualisierung

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-3, SOL-4, SOL-5, SOL-6, SOL-7 | downstream: keine





---

## System Boundaries

### In Scope

- Vermoegens-Dashboard mit Gesamtvermoegen, Allokation, Timeline, Quick Stats.
- PDF-Report-Generierung via Headless-Rendering.
- Excel-Export (XLSX) mit Rohdaten.
- Mandanten-Branding im Report.

### Out of Scope

- Echtzeit-Streaming-Dashboard (nur Refreshing bei Seitenaufruf).
- Druckbare Formulare (nur PDF/XLSX).
- E-Mail-Versand von Reports an Dritte.

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-8.1](../user-stories/US-8.1_Vermoegens_Dashboard_anzeigen.md) | Vermoegens Dashboard anzeigen | draft |
| [US-8.2](../user-stories/US-8.2_Szenario_Vergleichs_Report_generieren.md) | Szenario Vergleichs Report generieren | draft |

---

## Architecture Context

Frontend: ECharts Dashboard-Widgets | Backend: NestJS Report-Service | PDF: Puppeteer Headless-Rendering | Excel: ExcelJS | Storage: S3-kompatibel (Report-Archiv)

---

## Edge Cases (SOL-8)

| # | Szenario | Regel |
|---|---|---|
| EC-8.1 | **Vermögen > €10 Mio. (HNWI)** | Skalierung der Charts automatisch anpassen. Zusätzliche Kennzahlen: Asset-Allokation nach Anlageklasse, Währungsrisiko-Exposure. |
| EC-8.2 | **PDF-Export bei sehr komplexen Szenarien** | Pagination: Bei >5 Szenarien → Inhaltsverzeichnis mit Seitenreferenzen. Executive Summary auf Seite 1. |
| EC-8.3 | **Dashboard-Performance bei >100 Positionen** | Lazy Loading: Aggregierte Ansicht zuerst, Detail-Drill-Down on-demand. Chart-Rendering begrenzen auf Top-20 Positionen. |
| EC-8.4 | **Barrierefreiheit der Charts** | WCAG 2.1 AA: Alt-Texte für alle Charts, Tabellen-Alternative zu jedem Diagramm, Keyboard-navigierbar. |
