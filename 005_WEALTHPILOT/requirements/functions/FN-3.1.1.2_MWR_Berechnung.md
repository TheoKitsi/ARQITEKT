---
type: function
id: FN-3.1.1.2
status: draft
parent: CMP-3.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.1.1.2: MWR Berechnung

> **Parent**: [CMP-3.1.1](../components/CMP-3.1.1_Rendite_Rechner.md)

---

## Functional Description

Das System muss die geldgewichtete Rendite (Modified Dietz) berechnen, die den Zeitpunkt und die Hoehe der Cash-Flows beruecksichtigt.

- Das System soll die Modified-Dietz-Methode anwenden (vereinfachte IRR-Naeherung).
- Das System soll die MWR als Ergaenzung zur TTWROR anzeigen (Anlegerperspektive).
- Das System soll den Unterschied zur TTWROR dem Nutzer erklaeren (Tooltip).

---

## Preconditions

- Mindestens eine Position mit Kursdaten und Cash-Flows existiert.
- Anfangswert und Endwert der Position sind bekannt.

---

## Behavior

1. System laedt Anfangswert, Endwert und alle Cash-Flows mit Datum.
2. System berechnet pro Cash-Flow den Gewichtungsfaktor: w_i = (T - t_i) / T wobei T = Gesamttage, t_i = Tage seit Start.
3. System berechnet den gewichteten Cash-Flow: WCF = Summe(CF_i * w_i).
4. System berechnet Modified Dietz: MWR = (Endwert - Anfangswert - Summe_CF) / (Anfangswert + WCF).
5. System annualisiert bei Zeitraum > 1 Jahr.
6. System speichert das Ergebnis und zeigt es neben der TTWROR an.

---

## Postconditions

- MWR ist fuer die Position berechnet und gespeichert.
- MWR wird parallel zur TTWROR angezeigt.
- Tooltip erklaert den Unterschied beider Methoden.

---

## Error Handling

- Das System soll bei Anfangswert + WCF = 0 die MWR als "n/a" ausweisen.
- Das System soll bei extrem hoher MWR (>1000%) eine Warnung "Bitte Daten pruefen" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Anfangswert 10000, Endwert 11500, Einzahlung 1000 nach 180/365 Tagen: MWR korrekt berechnet.
- [ ] MWR und TTWROR werden nebeneinander angezeigt.
- [ ] Tooltip erklaert den Unterschied verstaendlich.
- [ ] Division durch Null ergibt "n/a".

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
