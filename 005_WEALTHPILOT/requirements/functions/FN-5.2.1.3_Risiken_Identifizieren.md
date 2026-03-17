---
type: function
id: FN-5.2.1.3
status: draft
parent: CMP-5.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.2.1.3: Risiken Identifizieren

> **Parent**: [CMP-5.2.1](../components/CMP-5.2.1_Szenario_Erklaerungsmodul.md)

---

## Functional Description

Das System muss dem KI-Prompt explizit die Top-3-Risiken des Szenarios mitgeben (hoechste negative Einzel-Impacts) damit die KI-Erklaerung diese adressiert.

- Das System soll die Risiken aus den Einzel-Impact-Faktoren ableiten.
- Das System soll die Risiken nach Schwere sortieren (hoechster negativer Impact zuerst).
- Das System soll die Risiken im Prompt als "Identifizierte Risiken" strukturieren.

---

## Preconditions

- Einzel-Impacts sind berechnet (CMP-4.2.1).
- Mindestens ein negativer Impact-Faktor existiert.

---

## Behavior

1. System laedt alle Einzel-Impact-Faktoren des Szenarios.
2. System filtert die negativen Faktoren.
3. System sortiert nach absolutem negativem Wert absteigend.
4. System waehlt die Top-3 Risiken aus.
5. System formuliert die Risiken als strukturierte Liste: Risiko-Beschreibung, Impact-Wert, betroffener Bereich.
6. System fuegt die Risiken als "Identifizierte Risiken" in den KI-Prompt ein.

---

## Postconditions

- Top-3-Risiken sind identifiziert und im Prompt enthalten.
- KI-Erklaerung adressiert die identifizierten Risiken.

---

## Error Handling

- Das System soll bei 0 negativen Impacts den Prompt ohne Risiken senden und "Keine wesentlichen Risiken identifiziert" erwaehnen.
- Das System soll bei weniger als 3 Risiken die vorhandenen nutzen.

---

## Acceptance Criteria (functional)

- [ ] Top-3 Risiken: Rendite-Verlust (-50pp), Steuerlast (-2000 EUR), Sparplan-Unterbrechung.
- [ ] Risiken sind nach Schwere sortiert.
- [ ] KI-Erklaerung erwaehnt alle 3 Risiken.
- [ ] Bei 0 Risiken: Hinweis "Keine wesentlichen Risiken".

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
