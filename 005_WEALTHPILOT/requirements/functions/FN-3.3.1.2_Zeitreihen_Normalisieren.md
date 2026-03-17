---
type: function
id: FN-3.3.1.2
status: draft
parent: CMP-3.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.3.1.2: Zeitreihen Normalisieren

> **Parent**: [CMP-3.3.1](../components/CMP-3.3.1_Benchmark_Vergleichsmodul.md)

---

## Functional Description

Das System muss Portfolio- und Benchmark-Zeitreihen auf einen gemeinsamen Startzeitpunkt normalisieren (Basis 100).

- Das System soll den Normalisierungszeitpunkt auf den Startpunkt des gewaehlten Zeitraums setzen.
- Das System soll die Normalisierung dynamisch bei Zeitraum-Aenderung neu berechnen.
- Das System soll fehlende Datenpunkte per Forward-Fill interpolieren.

---

## Preconditions

- Portfolio-Zeitreihe und mindestens eine Benchmark-Zeitreihe sind verfuegbar.
- Der gewaehlte Zeitraum ist definiert.

---

## Behavior

1. System laedt die Portfolio-Wertentwicklung als Zeitreihe.
2. System laedt die Benchmark-Zeitreihe(n) fuer den gleichen Zeitraum.
3. System setzt den Startwert beider Zeitreihen auf Basis 100.
4. Pro Tag: Normalisierter Wert = (Tageswert / Startwert) * 100.
5. Bei fehlenden Werten (Wochenende, Feiertag): Forward-Fill (letzter bekannter Wert).
6. System gibt beide normalisierten Zeitreihen an das Chart-Rendering zurueck.

---

## Postconditions

- Beide Zeitreihen beginnen bei Basis 100.
- Zeitreihen sind auf den gleichen Zeitraum beschraenkt.
- Fehlende Datenpunkte sind interpoliert.

---

## Error Handling

- Das System soll bei fehlendem Startwert den naechsten verfuegbaren Wert verwenden.
- Das System soll bei komplett fehlender Benchmark-Zeitreihe "Benchmark nicht verfuegbar" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Portfolio-Start 50000 EUR und Benchmark-Start 15000 Punkte werden beide auf 100 normalisiert.
- [ ] Zeitraum-Wechsel von 1M auf 1J berechnet die Normalisierung neu.
- [ ] Samstag/Sonntag-Werte werden korrekt forward-filled.
- [ ] Fehlende Benchmark zeigt Hinweismeldung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
