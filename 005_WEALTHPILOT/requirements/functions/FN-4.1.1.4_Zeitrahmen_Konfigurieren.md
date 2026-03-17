---
type: function
id: FN-4.1.1.4
status: draft
parent: CMP-4.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.1.1.4: Zeitrahmen Konfigurieren

> **Parent**: [CMP-4.1.1](../components/CMP-4.1.1_Umschichtungs_Konfigurator.md)

---

## Functional Description

Das System muss eine Umschichtung als sofort, in X Monaten oder zu Stichtag konfigurierbar machen. Zukunfts-Szenarien nutzen diskontierte Projektionswerte.

- Das System soll drei Zeitrahmen-Optionen anbieten: sofort, in X Monaten (1-60), zu Stichtag.
- Das System soll bei sofortiger Umschichtung keine Diskontierung anwenden.
- Das System soll bei zuekuenftiger Umschichtung die erwartete Wertentwicklung projizieren.

---

## Preconditions

- Quell-Positionen, Betraege und Ziel sind definiert.
- Konfigurator-Schritt "Zeitrahmen" ist aktiv.

---

## Behavior

1. System zeigt drei Radio-Buttons: "Sofort", "In X Monaten", "Zu Stichtag".
2. Bei "In X Monaten": Nutzer gibt Anzahl Monate ein (1-60, Slider + Eingabefeld).
3. Bei "Zu Stichtag": Nutzer waehlt ein Datum aus einem Datepicker (Minimum: morgen).
4. System berechnet den projizierten Wert der Quell-Positionen zum gewaehlten Zeitpunkt.
5. System speichert den Zeitrahmen im Konfigurator-State.
6. System stellt die vollstaendige Konfiguration zusammen und aktiviert den "Berechnen"-Button.

---

## Postconditions

- Zeitrahmen ist definiert und gespeichert.
- Projizierter Wert (bei Zukunft) ist berechnet.
- Konfigurator-Konfiguration ist vollstaendig — Impact-Berechnung kann gestartet werden.

---

## Error Handling

- Das System soll bei Monatszahl > 60 die Meldung "Maximal 60 Monate" anzeigen.
- Das System soll bei Stichtag in der Vergangenheit die Meldung "Datum muss in der Zukunft liegen" anzeigen.
- Das System soll bei fehlender Zeitrahmen-Auswahl den "Berechnen"-Button deaktivieren.

---

## Acceptance Criteria (functional)

- [ ] "Sofort" aktiviert direkte Berechnung ohne Diskontierung.
- [ ] "In 12 Monaten" projiziert den Positionswert 12 Monate in die Zukunft.
- [ ] Stichtag-Auswahl in der Vergangenheit wird abgelehnt.
- [ ] Vollstaendige Konfiguration aktiviert den "Berechnen"-Button.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
