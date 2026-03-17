---
type: function
id: FN-5.1.1.1
status: draft
parent: CMP-5.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.1.1.1: Chat Nachricht Senden

> **Parent**: [CMP-5.1.1](../components/CMP-5.1.1_Gemini_Chat_Interface.md)

---

## Functional Description

Das System muss Freitext-Nachrichten des Nutzers an die Gemini 2.0 Flash API senden. Der System-Prompt enthaelt: Nutzerprofil, Risikokategorie, aktuelle Portfolio-Zusammenfassung.

- Das System soll PII (Personally Identifiable Information) vor dem Senden an Gemini maskieren.
- Das System soll den System-Prompt dynamisch mit dem aktuellen Nutzerprofil anreichern.
- Das System soll die Konversationshistorie (letzte 10 Messages) im Kontext mitsenden.

---

## Preconditions

- Nutzer ist authentifiziert.
- Gemini API-Key ist konfiguriert.
- Nutzerprofil und Portfolio-Daten sind verfuegbar.

---

## Behavior

1. Nutzer gibt eine Freitext-Nachricht in das Chat-Eingabefeld ein.
2. System erstellt den System-Prompt: Rolle (Finanzassistent), Nutzerprofil (Risikoklasse, Vermoegen), Portfolio-Zusammenfassung.
3. System maskiert PII: Name -> [NAME], IBAN -> [IBAN], E-Mail -> [EMAIL].
4. System laedt die letzten 10 Messages der Konversation als Kontext.
5. System sendet die Anfrage an Gemini 2.0 Flash API.
6. System speichert die Nutzernachricht in der Konversationshistorie.
7. System wartet auf die Streaming-Antwort (FN-5.1.1.2).

---

## Postconditions

- Nachricht ist an Gemini gesendet.
- PII ist maskiert (kein Klartext an Drittanbieter).
- Nutzernachricht ist in der Konversationshistorie gespeichert.

---

## Error Handling

- Das System soll bei Gemini-API-Fehler (500/503) dem Nutzer "Assistent derzeit nicht verfuegbar" anzeigen.
- Das System soll bei leerem Eingabefeld den Senden-Button deaktivieren.
- Das System soll bei PII-Maskierungsfehler die Nachricht nicht senden und den Vorfall loggen.

---

## Acceptance Criteria (functional)

- [ ] Nachricht wird mit korrektem System-Prompt an Gemini gesendet.
- [ ] PII (Name, IBAN) ist im API-Call maskiert.
- [ ] Konversationshistorie enthaelt die letzten 10 Messages.
- [ ] API-Fehler zeigt benutzerfreundliche Meldung.
- [ ] Leeres Eingabefeld = Senden deaktiviert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

- CONV-CHAT-GENERAL
