---
type: function
id: FN-3.3.1.4
status: draft
parent: CMP-3.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.3.1.4: Custom Benchmark

> **Parent**: [CMP-3.3.1](../components/CMP-3.3.1_Benchmark_Vergleichsmodul.md)

---

## Functional Description

Das System muss dem Nutzer ermoeglichen, einen eigenen Benchmark aus gewichteten Indizes zusammenzustellen (z.B. 60% MSCI World + 40% Euro-Anleihen).

- Das System soll bis zu 5 Indizes in einem Custom Benchmark kombinieren.
- Das System soll die Gewichte als Prozent eingeben lassen (Summe = 100%).
- Das System soll den Custom Benchmark als synthetische Zeitreihe berechnen.

---

## Preconditions

- Mindestens 2 Index-Zeitreihen sind verfuegbar.
- Nutzer hat das Benchmark-Modul aufgerufen.

---

## Behavior

1. Nutzer klickt "Custom Benchmark erstellen".
2. System zeigt verfuegbare Indizes als Auswahlliste.
3. Nutzer waehlt 2-5 Indizes und vergibt Gewichte (Prozent).
4. System validiert: Summe der Gewichte = 100%.
5. System berechnet die synthetische Zeitreihe: Wert_t = Summe(Gewicht_i * normalisierteRendite_i_t).
6. System speichert den Custom Benchmark unter einem vom Nutzer vergebenen Namen.
7. System zeigt den Custom Benchmark in der Benchmark-Auswahl an.

---

## Postconditions

- Custom Benchmark ist gespeichert und in der Benchmark-Auswahl verfuegbar.
- Synthetische Zeitreihe ist berechnet und fuer Vergleich nutzbar.

---

## Error Handling

- Das System soll bei Gewichtssumme != 100% die Meldung "Summe der Gewichte muss 100% ergeben" anzeigen.
- Das System soll bei weniger als 2 Indizes die Meldung "Mindestens 2 Indizes auswaehlen" anzeigen.
- Das System soll bei mehr als 5 Indizes die Auswahl auf 5 begrenzen.

---

## Acceptance Criteria (functional)

- [ ] 60% MSCI World + 40% Euro-Anleihen ergibt korrekte synthetische Zeitreihe.
- [ ] Gewichtsumme 110% wird abgelehnt.
- [ ] Custom Benchmark erscheint in der Benchmark-Auswahl.
- [ ] Custom Benchmark kann fuer Outperformance-Vergleich genutzt werden.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
