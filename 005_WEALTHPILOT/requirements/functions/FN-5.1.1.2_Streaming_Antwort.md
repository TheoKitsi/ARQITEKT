---
type: function
id: FN-5.1.1.2
status: draft
parent: CMP-5.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.1.1.2: Streaming Antwort

> **Parent**: [CMP-5.1.1](../components/CMP-5.1.1_Gemini_Chat_Interface.md)

---

## Functional Description

Das System muss Gemini-Antworten als Server-Sent-Events streamen, sodass der Nutzer die Antwort Token fuer Token sieht.

- Das System soll SSE (Server-Sent Events) fuer das Streaming verwenden.
- Das System soll einen Typing-Indikator waehrend der Generierung anzeigen.
- Das System soll die vollstaendige Antwort nach Abschluss in der Konversationshistorie speichern.

---

## Preconditions

- Nachricht wurde an Gemini gesendet (FN-5.1.1.1).
- SSE-Verbindung zum Backend ist offen.

---

## Behavior

1. Backend empfaengt die Gemini-Streaming-Response.
2. Backend leitet jeden Token als SSE-Event an das Frontend weiter.
3. Frontend zeigt einen Typing-Indikator (pulsierende Punkte).
4. Frontend fuegt jeden Token in die Chat-Bubble ein (inkrementell).
5. Bei Abschluss des Streams: Frontend entfernt den Typing-Indikator.
6. System speichert die vollstaendige Antwort in der Konversationshistorie.
7. System zeigt den Disclaimer (FN-5.1.1.4) unter der Antwort an.

---

## Postconditions

- Vollstaendige Antwort ist im Chat sichtbar.
- Antwort ist in der Konversationshistorie gespeichert.
- Disclaimer ist unter der Antwort sichtbar.

---

## Error Handling

- Das System soll bei SSE-Verbindungsabbruch die bisher empfangenen Tokens anzeigen und "Antwort unvollstaendig" hinzufuegen.
- Das System soll bei Gemini-Timeout (>30s) den Typing-Indikator entfernen und "Zeitueberschreitung" anzeigen.
- Das System soll bei Content-Filter-Trigger (unsafe content) stattdessen "Ich kann diese Frage leider nicht beantworten" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Antwort erscheint Token fuer Token im Chat.
- [ ] Typing-Indikator ist waehrend der Generierung sichtbar.
- [ ] Vollstaendige Antwort ist nach Abschluss gespeichert.
- [ ] SSE-Abbruch zeigt Teilantwort + Hinweis.
- [ ] Timeout nach 30s zeigt Fehlermeldung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
