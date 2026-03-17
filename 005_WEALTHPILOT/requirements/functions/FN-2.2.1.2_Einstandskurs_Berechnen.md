---
type: function
id: FN-2.2.1.2
status: draft
parent: CMP-2.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-2.2.1.2: Einstandskurs Berechnen

> **Parent**: [CMP-2.2.1](../components/CMP-2.2.1_Depot_Sync_Engine.md)

---

## Functional Description

Das System muss den durchschnittlichen Einstandskurs pro Position berechnen (FIFO-Methode) unter Beruecksichtigung von Nachkaeufen und Teilverkaeufen.

- Das System soll die FIFO-Methode (First-In-First-Out) gemaess deutschem Steuerrecht anwenden.
- Das System soll bei Teilverkaeufen die aeltesten Anschaffungskosten zuerst ausbuchen.
- Das System soll den Einstandskurs fuer die Renditeberechnung (CMP-3.1.1) und Steuerberechnung (FN-4.2.1.3) bereitstellen.

---

## Preconditions

- Mindestens eine Kauf-Transaktion fuer die Position existiert.
- Transaktionshistorie ist vollstaendig (ggf. via CSV-Import ergaenzt).

---

## Behavior

1. System laedt alle Kauf- und Verkauf-Transaktionen fuer die Position chronologisch sortiert.
2. System wendet FIFO an: Kaeufe werden in einer Queue verwaltet.
3. Bei Verkauf: System entnimmt Stuecke aus der Queue (aelteste zuerst) und berechnet den realisierten Gewinn/Verlust.
4. System berechnet den gewichteten Durchschnittskurs der verbleibenden Stuecke.
5. System speichert den Einstandskurs und die verbleibende FIFO-Queue.

---

## Postconditions

- Einstandskurs der Position ist berechnet und gespeichert.
- FIFO-Queue der verbleibenden Kaufposten ist aktuell.
- Realisierte Gewinne/Verluste aus Teilverkaeufen sind berechnet.

---

## Error Handling

- Das System soll bei fehlender Transaktionshistorie den manuell eingegebenen Einstandskurs verwenden.
- Das System soll bei negativer Stueckzahl (mehr verkauft als gekauft) eine Warnung anzeigen und den Nutzer zur Korrektur auffordern.

---

## Acceptance Criteria (functional)

- [ ] 100 Stueck @ 50 EUR gekauft, dann 50 Stueck @ 60 EUR: Einstandskurs der 150 Stueck = 53.33 EUR.
- [ ] Verkauf von 80 Stueck (FIFO): Die ersten 100 werden zu 50 EUR ausgebucht.
- [ ] Einstandskurs steht fuer Renditeberechnung und Steuerberechnung bereit.
- [ ] Fehlende Historie fuehrt zu manuellem Einstandskurs-Modus.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
