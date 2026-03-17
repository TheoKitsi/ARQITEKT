---
type: function
id: FN-5.2.1.4
status: draft
parent: CMP-5.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.2.1.4: Naechste Schritte Vorschlagen

> **Parent**: [CMP-5.2.1](../components/CMP-5.2.1_Szenario_Erklaerungsmodul.md)

---

## Functional Description

Das System muss basierend auf dem Szenario-Ergebnis konkrete Handlungsempfehlungen generieren: z.B. Termin beim Berater, Sparplan anpassen, Alternative pruefen.

- Das System soll die Empfehlungen kontextabhaengig aus dem Impact-Ergebnis ableiten.
- Das System soll die Empfehlungen als Click-to-Action-Buttons anzeigen.
- Das System soll maximal 3 Empfehlungen anzeigen.

---

## Preconditions

- Impact-Erklaerung ist generiert (FN-5.2.1.1).
- Impact-Score und Einzel-Faktoren sind bekannt.

---

## Behavior

1. System analysiert den Impact-Score und die Einzel-Faktoren.
2. Bei negativem Score (< -20): System empfiehlt "Alternative Umschichtung pruefen" und "Termin mit Berater vereinbaren".
3. Bei neutralem Score (-20 bis +20): System empfiehlt "Szenario verfeinern" und "Weitere Informationen einholen".
4. Bei positivem Score (> +20): System empfiehlt "Umschichtung ausfuehren" und "Sparplan anpassen".
5. System zeigt maximal 3 Empfehlungen als Action-Buttons.
6. Bei Klick auf Empfehlung: System navigiert zur entsprechenden Aktion.

---

## Postconditions

- Bis zu 3 kontextabhaengige Empfehlungen sind angezeigt.
- Action-Buttons sind funktional.

---

## Error Handling

- Das System soll bei fehlendem Impact-Score generische Empfehlungen anzeigen ("Bitte kontaktieren Sie Ihren Berater").
- Das System soll bei fehlender Navigations-Ziel den Button deaktivieren und einen Tooltip "Funktion in Kuerze verfuegbar" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Negativer Score (-50): Empfehlungen "Alternative pruefen" und "Berater kontaktieren" erscheinen.
- [ ] Positiver Score (+60): Empfehlung "Umschichtung ausfuehren" erscheint.
- [ ] Maximal 3 Empfehlungen werden angezeigt.
- [ ] Klick auf Empfehlung navigiert korrekt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
