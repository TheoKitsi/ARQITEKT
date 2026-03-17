---
type: function
id: FN-6.3.1.3
status: draft
parent: CMP-6.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.3.1.3: Break Even Berechnen

> **Parent**: [CMP-6.3.1](../components/CMP-6.3.1_Miet_Kauf_Vergleichsmodul.md)

---

## Functional Description

Das System muss den Break-Even-Zeitpunkt berechnen ab dem Kaufen guenstiger ist als Mieten. Beruecksichtigt Wertsteigerung der Immobilie und Opportunitaetskosten.

- Das System soll den Break-Even als Schnittpunkt der kumulierten Kosten berechnen.
- Das System soll die Wertsteigerung der Immobilie als Vermoegensaufbau beruecksichtigen.
- Das System soll den Break-Even grafisch als Schnittpunkt zweier Linien darstellen.

---

## Preconditions

- Mietkosten-Projektion (FN-6.3.1.1) und Kaufkosten-Projektion (FN-6.3.1.2) sind berechnet.
- Immobilien-Wertsteigerung ist konfiguriert (Standard: 1.5% p.a.).

---

## Behavior

1. System berechnet pro Jahr: Netto-Kaufkosten = Kum. Kaufkosten - Immobilienwert + Restschuld.
2. System berechnet pro Jahr: Netto-Mietkosten = Kum. Mietkosten + Opportunitaetskosten (FN-6.3.1.4).
3. System sucht den Schnittpunkt: erstes Jahr wo Netto-Kaufkosten < Netto-Mietkosten.
4. System zeigt den Break-Even-Zeitpunkt prominent an: "Kaufen wird nach X Jahren guenstiger".
5. System rendert ein Vergleichs-Chart: zwei Linien (Kauf vs. Miete) mit markiertem Schnittpunkt.

---

## Postconditions

- Break-Even-Zeitpunkt ist berechnet und angezeigt.
- Vergleichs-Chart ist gerendert mit Schnittpunkt-Markierung.

---

## Error Handling

- Das System soll bei keinem Break-Even innerhalb des Projektionszeitraums die Meldung "Mieten bleibt im betrachteten Zeitraum guenstiger" anzeigen.
- Das System soll bei sofortigem Break-Even (Jahr 0) die Meldung "Kaufen ist sofort guenstiger" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Standard-Szenario zeigt Break-Even nach ca. 12-15 Jahren.
- [ ] Vergleichs-Chart zeigt den Schnittpunkt klar markiert.
- [ ] Hohe Mietsteigerung (4%) verschiebt Break-Even nach links (Kaufen frueher guenstiger).
- [ ] Hoher Zinssatz verschiebt Break-Even nach rechts.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
