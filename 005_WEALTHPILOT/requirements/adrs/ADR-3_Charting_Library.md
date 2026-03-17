---
type: adr
id: ADR-3
title: "Charting Library Apache ECharts"
status: approved
version: "1.0"
date: "2026-03-15"
deciders: ["kitsi"]
superseded_by: null
---

# ADR-3: Charting Library Apache ECharts

> **Status**: accepted
> **Date**: 2026-03-15
> **Deciders**: kitsi

---

## Context

WealthPilot benoetigt eine Charting-Library fuer: Sankey-Diagramme (Kapitalfluesse), Waterfall-Charts (Rendite-Deltas), Gauge-Charts (Impact-Score), Line-Charts (Vermoegen-Timeline), Donut-Charts (Allokation), Tilgungsplan-Tabellen. Die Library muss: interaktiv (Hover/Click), responsive, barrierefrei (ARIA), themeable (White-Label), performant bei grossen Datenmengen.

---

## Decision

**Apache ECharts 5.x mit echarts-for-react Wrapper.**

---

## Reasoning

- ECharts bietet alle benoetigten Chart-Typen out-of-the-box (inkl. Sankey, Waterfall, Gauge)
- Exzellente Performance bei grossen Datenmengen (Canvas-basiert mit WebGL-Option)
- Eingebautes Theming-System mit Custom-Themes (ideal fuer White-Label)
- Gute Accessibility: ARIA-Labels, Datentabellen-Fallback
- Starke Community, Apache-Lizenz, keine Kosten
- Server-Side-Rendering fuer PDF-Reports (node-echarts)

---

## Alternatives Considered

| Alternative | Pro | Contra | Rejected because |
|---|---|---|---|
| D3.js | Maximale Flexibilitaet, SVG-basiert | Kein Charting-Framework (nur Primitives), hoher Aufwand fuer Standard-Charts | Zu low-level fuer 8+ Chart-Typen |
| Recharts | Einfache React-API, deklarativ | Kein Sankey/Waterfall/Gauge, Performance-Probleme bei grossen Daten | Feature-Luecken fuer Impact-Visualisierung |
| Chart.js | Leichtgewichtig, einfach | Kein Sankey, limitierte Interaktivitaet, kein Theming | Feature-Luecken |
| Highcharts | Professionell, alle Chart-Typen | Lizenzkosten (Commercial License), weniger Theming-Flexibilitaet | Kosten, weniger customizable |

---

## Consequences

### Positive

- Alle Chart-Typen (Sankey, Waterfall, Gauge, Line, Donut) aus einer Library
- Theming-System fuer White-Label: JSON-Theme pro Mandant
- Canvas-Rendering: Performant auch bei 10.000+ Datenpunkten (Timeline)
- SSR-faehig fuer PDF-Export

### Negative

- Bundle-Size: ~800KB (Tree-Shakeable auf ~300KB mit nur benoetigten Modulen)
- Canvas: Weniger DOM-Inspektion fuer Testing als SVG

### Risks

- Canvas-A11y: ARIA-Labels muessen manuell gepflegt werden (kein Auto-Label wie SVG)

---

## Affected Requirements

| Requirement | Impact |
|---|---|
| CMP-4.2.2 | Sankey, Waterfall, Gauge, Timeline Charts |
| CMP-8.1.1 | Dashboard: Donut-Chart, Timeline, Quick-Stats |
| CMP-3.3.1 | Benchmark-Vergleich: Normalisierte Linien-Charts |
| CMP-6.3.1 | Miet-vs-Kauf: Linien-Chart Vergleich |
| CMP-8.2.1 | PDF-Reports: Server-Side-Rendering der Charts |
| CMP-10.2.1 | White-Label: ECharts-Theme pro Mandant |

---

## References

- Apache ECharts: https://echarts.apache.org
- echarts-for-react: https://github.com/hustcc/echarts-for-react
- ECharts Theming: https://echarts.apache.org/en/theme-builder.html
