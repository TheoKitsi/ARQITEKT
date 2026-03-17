---
type: function
id: FN-2.2.1.4
status: draft
parent: CMP-2.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-2.2.1.4: CSV Import

> **Parent**: [CMP-2.2.1](../components/CMP-2.2.1_Depot_Sync_Engine.md)

---

## Functional Description

Das System muss einen manuellen CSV-Import von Depot-Daten unterstuetzen. Format: ISIN;Stueckzahl;Kaufdatum;Kaufkurs;Waehrung.

- Das System soll das Hochladen einer CSV-Datei (max. 5 MB, UTF-8) ermoeglichen.
- Das System soll eine Vorschau der zu importierenden Daten anzeigen.
- Das System soll ungueltige Zeilen markieren und den Import der gueltigen Zeilen ermoeglichen.

---

## Preconditions

- Nutzer ist authentifiziert.
- Mindestens ein Depot ist erfasst.
- CSV-Datei entspricht dem vorgegebenen Format.

---

## Behavior

1. Nutzer waehlt eine CSV-Datei via Upload-Dialog aus.
2. System validiert Dateigroesse (<= 5 MB) und Encoding (UTF-8).
3. System parst die CSV-Datei zeilenweise mit Semikolon als Trennzeichen.
4. Pro Zeile: System validiert ISIN-Format, Stueckzahl > 0, Kaufdatum im ISO-Format, Kaufkurs > 0, Waehrung (ISO 4217).
5. System zeigt eine Vorschau-Tabelle: gueltige Zeilen gruen, ungueltige rot mit Fehlergrund.
6. Nutzer bestaetigt den Import (nur gueltige Zeilen werden importiert).
7. System legt Kauf-Transaktionen an und aktualisiert den Einstandskurs (FN-2.2.1.2).

---

## Postconditions

- Alle gueltigen CSV-Zeilen sind als Kauf-Transaktionen importiert.
- Einstandskurse der betroffenen Positionen sind aktualisiert.
- Ungueltige Zeilen sind nicht importiert und dem Nutzer aufgelistet.

---

## Error Handling

- Das System soll bei Dateigroesse > 5 MB den Upload ablehnen mit Meldung "Datei zu gross (max. 5 MB)".
- Das System soll bei falschem Encoding die Meldung "Bitte UTF-8 kodierte Datei verwenden" anzeigen.
- Das System soll bei komplett ungueltiger Datei (0 gueltige Zeilen) den Import verweigern.

---

## Acceptance Criteria (functional)

- [ ] CSV mit 5 gueltigen Zeilen importiert 5 Kauf-Transaktionen.
- [ ] CSV mit 3 gueltigen und 2 ungueltigen Zeilen importiert nur die 3 gueltigen.
- [ ] Ungueltige ISIN (zu kurz) wird in der Vorschau rot markiert.
- [ ] Datei ueber 5 MB wird abgelehnt.
- [ ] Vorschau zeigt korrekte Daten vor dem Import.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
