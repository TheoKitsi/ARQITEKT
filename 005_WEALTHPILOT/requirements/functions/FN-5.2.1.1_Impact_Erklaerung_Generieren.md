---
type: function
id: FN-5.2.1.1
status: draft
parent: CMP-5.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.2.1.1: Impact Erklaerung Generieren

> **Parent**: [CMP-5.2.1](../components/CMP-5.2.1_Szenario_Erklaerungsmodul.md)

---

## Functional Description

Das System muss ein Impact-Szenario in einen strukturierten Prompt uebersetzen: Zusammenfassung, Hauptfaktoren, Risiken, Empfehlungen.

- Das System soll die Impact-Daten (CMP-4.2.1) in natuerliche Sprache umwandeln.
- Das System soll den Prompt so strukturieren, dass Gemini eine verstaendliche Erklaerung generiert.
- Das System soll Structured Output von Gemini anfordern (JSON mit definierten Feldern).

---

## Preconditions

- Ein Impact-Szenario ist berechnet.
- Gemini API ist verfuegbar.

---

## Behavior

1. System kompiliert die Szenario-Daten: Impact-Score, Rendite-Delta, Steuerlast, Opportunitaetskosten, Liquiditaetsreserve.
2. System erstellt einen strukturierten Prompt: "Erklaere dem Nutzer das folgende Szenario in verstaendlicher Sprache..."
3. System spezifiziert das Structured-Output-Schema: { zusammenfassung: string, hauptfaktoren: string[], risiken: string[], empfehlung: string }.
4. System sendet den Prompt an Gemini 2.0 Flash mit Structured Output.
5. System empfaengt und parst die strukturierte Antwort.
6. System zeigt die Erklaerung im UI: Zusammenfassung oben, Faktoren als Liste, Risiken rot hervorgehoben, Empfehlung als Call-to-Action.

---

## Postconditions

- Strukturierte Erklaerung ist generiert und angezeigt.
- Alle Felder (Zusammenfassung, Faktoren, Risiken, Empfehlung) sind befuellt.

---

## Error Handling

- Das System soll bei Gemini-Fehler eine generische Erklaerung aus Template-Text generieren.
- Das System soll bei ungueltigem Structured Output den Rohtext anzeigen.
- Das System soll bei Zahlen-Diskrepanz (FN-5.2.1.2) eine Korrektur-Annotation einfuegen.

---

## Acceptance Criteria (functional)

- [ ] Erklaerung enthaelt alle 4 Abschnitte (Zusammenfassung, Faktoren, Risiken, Empfehlung).
- [ ] Erklaerung ist in verstaendlicher Sprache (kein Fachjargon).
- [ ] Bei Gemini-Fehler wird Template-Text angezeigt.
- [ ] Structured Output wird korrekt geparst und dargestellt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

- CONV-IMPACT-EXPLAIN
