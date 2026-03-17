---
type: function
id: FN-6.2.1.2
status: draft
parent: CMP-6.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.2.1.2: Tilgungsplan Erstellen

> **Parent**: [CMP-6.2.1](../components/CMP-6.2.1_Tilgungsplan_Generator.md)

---

## Functional Description

Das System muss einen monatlichen Tilgungsplan generieren: Monat, Rate, Zinsanteil, Tilgungsanteil, Sondertilgung, Restschuld.

- Das System soll den Plan fuer die gesamte Laufzeit generieren.
- Das System soll die Verschiebung von Zins- zu Tilgungsanteil ueber die Zeit zeigen.
- Das System soll den Plan als scrollbare Tabelle und als Chart (gestapelter Bereich) anzeigen.

---

## Preconditions

- Annuitaet ist berechnet (FN-6.2.1.1).
- Darlehenssumme, Zinssatz und Tilgungsrate sind bekannt.

---

## Behavior

1. System initialisiert: Restschuld = Darlehenssumme, Monat = 0.
2. Pro Monat: System berechnet Zinsanteil = Restschuld * Zinssatz / 12.
3. Pro Monat: System berechnet Tilgungsanteil = Rate - Zinsanteil.
4. Pro Monat: System berechnet neue Restschuld = alte Restschuld - Tilgungsanteil.
5. System wiederholt bis Restschuld <= 0 oder Zinsbindungsende erreicht.
6. System zeigt den Plan als Tabelle (Monat, Rate, Zins, Tilgung, Sondertilgung, Restschuld).
7. System rendert ein Stacked-Area-Chart: Zins- und Tilgungsanteil ueber die Zeit.

---

## Postconditions

- Vollstaendiger Tilgungsplan ist generiert.
- Tabelle und Chart sind gerendert.
- Restschuld am Ende der Zinsbindung ist bekannt.

---

## Error Handling

- Das System soll bei Tilgung < Zinsen (negative Tilgung) die Meldung "Tilgungsrate ist zu niedrig" anzeigen.
- Das System soll bei Laufzeit > 50 Jahre die Meldung "Unrealistische Laufzeit" anzeigen und die Eingabe pruefen.

---

## Acceptance Criteria (functional)

- [ ] Tilgungsplan fuer 300000 EUR, 3.5% Zins, 2% Tilgung zeigt korrekte monatliche Werte.
- [ ] Zinsanteil nimmt ueber die Laufzeit ab, Tilgungsanteil nimmt zu.
- [ ] Restschuld nach 10 Jahren (Zinsbindung) ist korrekt berechnet.
- [ ] Chart zeigt die Zins/Tilgungs-Verhaeltnis-Entwicklung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
