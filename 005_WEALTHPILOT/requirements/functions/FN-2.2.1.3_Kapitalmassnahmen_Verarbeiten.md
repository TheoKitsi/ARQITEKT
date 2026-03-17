---
type: function
id: FN-2.2.1.3
status: draft
parent: CMP-2.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-2.2.1.3: Kapitalmassnahmen Verarbeiten

> **Parent**: [CMP-2.2.1](../components/CMP-2.2.1_Depot_Sync_Engine.md)

---

## Functional Description

Das System muss Splits, Reverse-Splits und Fusionen erkennen und Stueckzahl sowie Einstandskurs entsprechend anpassen.

- Das System soll Kapitalmassnahmen automatisch ueber einen Corporate-Actions-Feed erkennen.
- Das System soll das Split-Verhaeltnis auf Stueckzahl und Einstandskurs anwenden.
- Das System soll die Aenderung als Audit-Event protokollieren.

---

## Preconditions

- Die betroffene Position existiert im Depot.
- Corporate-Actions-Feed ist konfiguriert und aktiv.
- Stueckzahl und Einstandskurs der Position sind bekannt.

---

## Behavior

1. System empfaengt Kapitalmassnahmen-Event (Split/Reverse-Split/Fusion) vom Feed.
2. System identifiziert die betroffene Position anhand der ISIN.
3. Bei Split (z.B. 1:3): System multipliziert Stueckzahl mit 3 und teilt Einstandskurs durch 3.
4. Bei Reverse-Split (z.B. 10:1): System teilt Stueckzahl durch 10 und multipliziert Einstandskurs mit 10.
5. Bei Fusion: System ersetzt alte ISIN durch neue ISIN und wendet das Umtauschverhaeltnis an.
6. System protokolliert die Aenderung als Audit-Event mit vorherigen und neuen Werten.
7. System invertiert den Rendite-Cache fuer die betroffene Position (FN-3.1.1.4).

---

## Postconditions

- Stueckzahl und Einstandskurs der Position sind korrekt angepasst.
- Bei Fusion: Neue ISIN ist zugeordnet, alte ISIN ist deaktiviert.
- Audit-Event mit allen Details ist protokolliert.
- Rendite-Cache fuer die Position ist invalidiert.

---

## Error Handling

- Das System soll bei unbekannter ISIN im Kapitalmassnahmen-Event die Aktion loggen und ueberspringen.
- Das System soll bei mehrdeutigem Umtauschverhaeltnis die Aktion als "Manuell pruefen" markieren.
- Das System soll bei Rundungsproblemen (Bruchteilstuecke) auf die naechste ganze Zahl abrunden und die Differenz als Cash-Ausgleich buchen.

---

## Acceptance Criteria (functional)

- [ ] Split 1:3 bei 100 Stueck @ 90 EUR ergibt 300 Stueck @ 30 EUR.
- [ ] Reverse-Split 10:1 bei 1000 Stueck @ 5 EUR ergibt 100 Stueck @ 50 EUR.
- [ ] Fusion mit neuem ISIN ersetzt die alte ISIN korrekt.
- [ ] Audit-Log enthaelt alle Vorher-Nachher-Werte.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
