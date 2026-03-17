---
type: function
id: FN-4.3.1.3
status: draft
parent: CMP-4.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.3.1.3: Side by Side Vergleich

> **Parent**: [CMP-4.3.1](../components/CMP-4.3.1_Optimierungs_Algorithmus.md)

---

## Functional Description

Das System muss die Top-3-Szenarien in einer Vergleichstabelle darstellen: Impact-Score, Rendite-Delta, Steuerlast, Liquiditaet, Fitness.

- Das System soll die Szenarien als Spalten und die Metriken als Zeilen anzeigen.
- Das System soll den besten Wert pro Zeile hervorheben (Bold + Farbe).
- Das System soll eine "Uebernehmen"-Aktion pro Szenario bieten.

---

## Preconditions

- Top-3-Szenarien sind generiert (FN-4.3.1.1).
- Alle Metriken sind berechnet.

---

## Behavior

1. System rendert eine Vergleichstabelle mit 3 Spalten (Szenarien) und N Zeilen (Metriken).
2. Metriken: Impact-Score, Rendite-Delta (EUR + pp), Steuerlast (EUR), Netto-Ergebnis, Liquiditaetsreserve, Fitness-Score.
3. System hebt den besten Wert pro Zeile hervor (fett + gruen).
4. Pro Szenario: System zeigt einen "Uebernehmen"-Button.
5. Bei Klick auf "Uebernehmen": System laedt das Szenario in den Konfigurator und zeigt die Detailansicht.

---

## Postconditions

- Vergleichstabelle ist gerendert mit allen Metriken.
- Bester Wert pro Zeile ist hervorgehoben.
- "Uebernehmen"-Aktion ist funktional.

---

## Error Handling

- Das System soll bei weniger als 3 Szenarien nur die vorhandenen Spalten anzeigen.
- Das System soll bei identischen Werten beide Spalten hervorheben.

---

## Acceptance Criteria (functional)

- [ ] Tabelle zeigt 3 Szenarien nebeneinander.
- [ ] Bester Impact-Score ist fett + gruen markiert.
- [ ] "Uebernehmen" laed das Szenario in den Konfigurator.
- [ ] Bei nur 2 Szenarien werden 2 Spalten angezeigt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
