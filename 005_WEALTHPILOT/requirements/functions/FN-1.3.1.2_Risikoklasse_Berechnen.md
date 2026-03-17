---
type: function
id: FN-1.3.1.2
status: draft
parent: CMP-1.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.3.1.2: Risikoklasse Berechnen

> **Parent**: [CMP-1.3.1](../components/CMP-1.3.1_Risikoprofil_Fragebogen.md)

---

## Functional Description

Das System muss aus den Fragebogen-Antworten einen Score berechnen und eine von 5 Risikoklassen zuordnen: sicherheitsorientiert, konservativ, ausgewogen, wachstumsorientiert, chancenorientiert.

- Das System soll die Score-Berechnung als gewichtete Summe durchfuehren (Verlusttoleranz 30%, Anlagehorizont 25%, Erfahrung 25%, Einkommen 20%).
- Das System soll die Score-Grenzen konfigurierbar halten (pro Mandant).
- Das System soll das Ergebnis dem Nutzer visuell (Skala + Erklaerungstext) darstellen.

---

## Preconditions

- Alle Fragebogen-Fragen sind beantwortet.
- Score-Gewichtungen und Klassengrenzen sind konfiguriert.

---

## Behavior

1. System laedt alle Antworten (Werte 1-5) des abgeschlossenen Fragebogens.
2. System normalisiert Antworten nach Fragekategorie (Verlusttoleranz, Horizont, Erfahrung, Einkommen).
3. System berechnet gewichtete Summe: Score = 0.3*Verlust + 0.25*Horizont + 0.25*Erfahrung + 0.2*Einkommen.
4. System ordnet Score einer Risikoklasse zu (z.B. 1.0-1.8 = sicherheitsorientiert, 1.8-2.6 = konservativ, etc.).
5. System zeigt das Ergebnis als grafische Skala mit Erklaerungstext an.
6. System speichert das Ergebnis mit Zeitstempel und loest Audit-Protokollierung (FN-1.3.1.3) aus.

---

## Postconditions

- Dem Nutzer ist genau eine Risikoklasse zugeordnet.
- Der Score und die Zuordnung sind persistent gespeichert.
- Die Risikoklasse steht fuer Produkt-Matching (CMP-7.2.1) und Rendite-Ziel (CMP-3.2.1) bereit.

---

## Error Handling

- Das System soll bei unvollstaendigen Antworten einen Fehler werfen und den Nutzer zum Fragebogen zurueckleiten.
- Das System soll bei Score ausserhalb des konfigurierten Bereichs einen Fallback auf die naechste gueltige Klasse durchfuehren.

---

## Acceptance Criteria (functional)

- [ ] Score 2.3 wird als "konservativ" klassifiziert.
- [ ] Score 4.5 wird als "chancenorientiert" klassifiziert.
- [ ] Aenderung der Gewichtung durch Admin aendert Ergebnis korrekt.
- [ ] Ergebnis wird dem Nutzer mit Erklaerungstext und grafischer Skala angezeigt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
