---
type: function
id: FN-8.2.1.4
status: draft
parent: CMP-8.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.2.1.4: Excel Export

> **Parent**: [CMP-8.2.1](../components/CMP-8.2.1_Report_Generator.md)

---

## Functional Description

Das System muss einen XLSX-Export mit allen Rohdaten generieren: Blatt 1 Portfolio, Blatt 2 Szenarien, Blatt 3 Impact-Details.

- Das System soll eine XLSX-Bibliothek (z.B. ExcelJS) fuer die Generierung verwenden.
- Das System soll die Blaetter mit Kopfzeilen und Formatierung versehen.
- Das System soll den Export als Download anbieten.

---

## Preconditions

- Report-Daten sind verfuegbar.
- ExcelJS oder aequivalente Bibliothek ist installiert.

---

## Behavior

1. Nutzer klickt "Als Excel exportieren".
2. System erstellt ein XLSX-Workbook mit 3 Blaettern.
3. Blatt 1 "Portfolio": Positionen-Tabelle (ISIN, Name, Stueckzahl, Marktwert, Rendite).
4. Blatt 2 "Szenarien": Szenario-Vergleich (Score, Delta, Steuerlast, Netto).
5. Blatt 3 "Impact-Details": Detaillierte Impact-Faktoren pro Position.
6. System formatiert die Kopfzeilen (Bold, Hintergrundfarbe).
7. System formatiert Zahlenwerte (2 Dezimalstellen, EUR-Format).
8. System bietet den Download als .xlsx-Datei an.

---

## Postconditions

- XLSX-Datei ist generiert mit 3 Blaettern.
- Formatierung ist korrekt.
- Download ist verfuegbar.

---

## Error Handling

- Das System soll bei fehlenden Szenario-Daten Blatt 2 leer lassen mit Hinweis "Keine Szenarien berechnet".
- Das System soll bei Generierungsfehler eine Fehlermeldung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] XLSX hat 3 Blaetter mit korrekten Namen.
- [ ] Portfolio-Blatt zeigt alle Positionen mit Marktwerten.
- [ ] Kopfzeilen sind fett und farbig.
- [ ] EUR-Betraege sind korrekt formatiert.
- [ ] Datei ist in Excel oeffbar.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
