---
type: function
id: FN-1.1.1.1
status: draft
parent: CMP-1.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.1.1.1: IBAN Validierung

> **Parent**: [CMP-1.1.1](../components/CMP-1.1.1_Konto_und_Depot_Erfassungsformular.md)

---

## Functional Description

Das System muss eingegebene IBANs nach ISO 13616 validieren (Laenderpruefziffer + BBAN-Struktur). Bei ungueltiger IBAN wird eine Inline-Fehlermeldung angezeigt.

- Das System soll die Laenderpruefziffer (Stellen 3-4) mittels Modulo-97-Verfahren gemaess ISO 7064 pruefen.
- Das System soll die BBAN-Struktur (Bankleitzahl + Kontonummer) gemaess laenderspezifischem Format validieren (DE: 8-stellige BLZ + 10-stellige Kontonr).
- Das System soll bei gueltigem IBAN den Banknamen ueber einen BIC-Lookup automatisch befuellen.

---

## Preconditions

- Nutzer ist authentifiziert und hat die Rolle "Kunde" oder "Berater".
- Das Konto-Erfassungsformular ist geoeffnet.
- Eine Internetverbindung besteht (fuer BIC-Lookup).

---

## Behavior

1. Nutzer gibt einen String in das IBAN-Eingabefeld ein.
2. System entfernt Leerzeichen und konvertiert in Grossbuchstaben.
3. System prueft Laengenplausibilitaet (DE = 22 Zeichen).
4. System berechnet Modulo-97-Pruefziffer gemaess ISO 7064.
5. Bei gueltigem Ergebnis: System validiert BBAN-Struktur gegen laenderspezifisches Muster.
6. Bei gueltigem IBAN: System fuehrt BIC-Lookup durch und befuellt Bankname automatisch.
7. Bei ungueltigem IBAN: System zeigt Inline-Fehlermeldung unter dem Eingabefeld an.

---

## Postconditions

- Ein gueltiger IBAN ist im Formularfeld gespeichert und gruen markiert.
- Der Bankname ist automatisch befuellt (oder manuell eingegeben falls Lookup fehlschlaegt).
- Ein ungueltiger IBAN blockiert das Absenden des Formulars.

---

## Error Handling

- Das System soll bei ungueltigem Laendercode die Meldung "Unbekannter Laendercode" anzeigen.
- Das System soll bei falscher Pruefziffer die Meldung "IBAN ungueltig — bitte pruefen" anzeigen.
- Das System soll bei Timeout des BIC-Lookups (>3s) den Banknamen als manuelles Pflichtfeld aktivieren.

---

## Acceptance Criteria (functional)

- [ ] Gueltige deutsche IBAN (DE89370400440532013000) wird als gueltig erkannt.
- [ ] Ungueltige Pruefziffer (DE00370400440532013000) wird mit Fehlermeldung abgelehnt.
- [ ] BIC-Lookup befuellt Bankname bei gueltiger IBAN innerhalb von 2 Sekunden.
- [ ] Leerzeichen und Kleinbuchstaben werden automatisch bereinigt.
- [ ] Formular-Submit ist bei ungueltiger IBAN deaktiviert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
