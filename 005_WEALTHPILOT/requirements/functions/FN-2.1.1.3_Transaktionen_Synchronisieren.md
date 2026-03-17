---
type: function
id: FN-2.1.1.3
status: draft
parent: CMP-2.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-2.1.1.3: Transaktionen Synchronisieren

> **Parent**: [CMP-2.1.1](../components/CMP-2.1.1_PSD2_Kontoaggregations_Adapter.md)

---

## Functional Description

Das System muss neue Transaktionen seit dem letzten Sync inkrementell abrufen und kategorisieren (Einnahme/Ausgabe/Transfer).

- Das System soll den Delta-Sync ueber das "dateFrom"-Feld der finAPI-API steuern.
- Das System soll Transaktionen automatisch als Einnahme, Ausgabe oder Transfer klassifizieren.
- Das System soll Duplikate anhand von Transaktions-ID oder Hash (Datum+Betrag+Referenz) erkennen.

---

## Preconditions

- Aktiver PSD2-Consent mit gueltigem Token.
- Mindestens ein vorheriger Sync ist abgeschlossen (oder Initialsync laeuft).

---

## Behavior

1. System ermittelt das Datum des letzten erfolgreichen Syncs.
2. System ruft GET /transactions?dateFrom={lastSync} bei finAPI auf.
3. Pro Transaktion: System prueft auf Duplikat (Transaktions-ID oder Hash).
4. Neue Transaktionen werden klassifiziert: positive Betraege = Einnahme, negative = Ausgabe, gleicher Nutzer = Transfer.
5. System speichert die Transaktionen verschluesselt mit Kategorisierung.
6. System aktualisiert den lastSync-Timestamp.

---

## Postconditions

- Alle neuen Transaktionen sind gespeichert und kategorisiert.
- Keine Duplikate wurden angelegt.
- lastSync-Timestamp ist aktualisiert.

---

## Error Handling

- Das System soll bei Duplikat die Transaktion lautlos ueberspringen (kein Fehler).
- Das System soll bei unbekannter Transaktionskategorie die Kategorie "Sonstige" zuweisen.
- Das System soll bei Partial-Failure (einige Transaktionen fehlerhaft) die gueltigen speichern und die fehlerhaften loggen.

---

## Acceptance Criteria (functional)

- [ ] Nur Transaktionen seit dem letzten Sync werden abgerufen.
- [ ] Duplikat-Transaktionen werden korrekt erkannt und uebersprungen.
- [ ] Positive Betraege werden als Einnahme, negative als Ausgabe klassifiziert.
- [ ] lastSync-Timestamp wird auf den Zeitpunkt des letzten abgerufenen Datensatzes gesetzt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
