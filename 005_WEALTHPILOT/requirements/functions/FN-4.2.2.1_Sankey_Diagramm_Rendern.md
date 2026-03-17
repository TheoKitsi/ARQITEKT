---
type: function
id: FN-4.2.2.1
status: draft
parent: CMP-4.2.2
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.2.1: Sankey Diagramm Rendern

> **Parent**: [CMP-4.2.2](../components/CMP-4.2.2_Impact_Visualisierung.md)

---

## Functional Description

Das System muss die Kapitalfluesse als interaktives Sankey-Diagramm visualisieren. Quellen links, Ziele rechts, Flussbreite proportional zum Betrag.

- Das System soll Apache ECharts (Sankey-Serie) fuer das Rendering verwenden.
- Das System soll interaktive Tooltips mit Betraegen anzeigen.
- Das System soll die Steuerlast als separaten Abfluss-Knoten darstellen.

---

## Preconditions

- Impact-Berechnung ist abgeschlossen (CMP-4.2.1).
- Quell-Positionen, Betraege und Ziel sind bekannt.

---

## Behavior

1. System bereitet die Sankey-Daten vor: Quell-Knoten (links), Ziel-Knoten (rechts), Steuerknoten.
2. System berechnet die Flussbreiten proportional zum Betrag.
3. System rendert das Sankey-Diagramm via ECharts.
4. Bei Hover: System zeigt Tooltip mit exaktem Betrag und Prozentanteil.
5. System faerbt positive Fluesse gruen und Steuer-Abfluss rot.
6. System passt die Darstellung responsiv an (Desktop vs. Tablet).

---

## Postconditions

- Sankey-Diagramm ist gerendert und interaktiv.
- Alle Kapitalfluesse sind visuell dargestellt.
- Steuerlast ist als separater Abfluss sichtbar.

---

## Error Handling

- Das System soll bei fehlenden Daten eine Platzhalter-Nachricht "Keine Daten fuer Visualisierung" anzeigen.
- Das System soll bei Rendering-Fehler ein Fallback als Tabelle anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Sankey zeigt Quell-Position(en) links und Ziel(e) rechts.
- [ ] Flussbreiten sind proportional zu den Betraegen.
- [ ] Tooltip zeigt exakten EUR-Betrag bei Hover.
- [ ] Steuerlast-Knoten ist rot gefaerbt.
- [ ] Responsive Darstellung auf Tablet funktioniert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
