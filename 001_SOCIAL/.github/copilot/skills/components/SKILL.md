---
name: Components Skill
description: Wissen für die Erstellung technischer Komponenten-Requirements. Genutzt von @architect und @review.
---

# Components — Skill Reference

## Zweck

Eine Component (CMP) ist ein **technisches Modul** — eine logische Einheit die einen Teil einer User Story umsetzt. Sie definiert Verantwortung, Schnittstellen und verweist auf ihre Funktionen.

## Template

→ `requirements/templates/component.md`

## Was gehört in eine CMP?

1. **Verantwortung**: Was macht diese Komponente? (1-2 Absätze)
2. **Schnittstellen**: Input/Output-Tabelle
3. **Funktionen-Index**: Tabelle mit Links zu FN-Dateien
4. **Constraints**: Technische Einschränkungen
5. **INF-Referenzen**: Welche Querschnitts-Anforderungen gelten

## CMP-Typen

| Typ | Beschreibung | Beispiel |
|---|---|---|
| **UI-Modul** | Nutzerschnittstellen-Komponente | Profil-Editor, Match-Anzeige |
| **Logic-Modul** | Business-Logik Einheit | Matching-Engine, Score-Berechnung |
| **Data-Modul** | Datenverwaltung/-zugriff | Duplikat-Erkennung, Hash-Abgleich |
| **Integration-Modul** | Externe Anbindung | SMS-Gateway, Payment-Provider |
| **Communication-Modul** | Nachrichtenverarbeitung | Chat, Notification-Dispatcher |

## Qualitätskriterien

- [ ] **Klare Verantwortung** — Single Responsibility: eine CMP tut eine Sache
- [ ] **Input/Output definiert** — Was kommt rein, was geht raus
- [ ] **1-10 Funktionen** — Weniger = evtl. überflüssig, mehr = aufteilen
- [ ] **INF-Referenzen** — WCAG für UI-Module, OWASP für Auth/Data, DSGVO für personenbezogene Daten
- [ ] **Keine Implementierung** — CMP beschreibt WAS, nicht mit welchem Framework

## Schnittstellen-Design

### Input-Typen

| Input-Typ | Beispiel |
|---|---|
| User-Aktion | Button-Klick, Formular-Submit |
| System-Event | Timer, Webhook, DB-Trigger |
| Daten von anderer CMP | Match-Score, Profil-Daten |
| Externe Daten | API-Response, File-Upload |

### Output-Typen

| Output-Typ | Beispiel |
|---|---|
| UI-Update | Anzeige aktualisiert, Modal geöffnet |
| Daten-Mutation | DB-Write, Cache-Update |
| Event/Notification | Push-Notification, System-Event |
| Response | API-Response, Redirect |

## INF-Referenzierung

Jede CMP sollte prüfen welche INFs relevant sind:

| INF | Relevant wenn... |
|---|---|
| INF-1 WCAG | CMP hat UI-Elemente |
| INF-2 OWASP | CMP verarbeitet Auth, Inputs, Daten |
| INF-3 DSGVO | CMP speichert/zeigt personenbezogene Daten |
| INF-4 i18n | CMP zeigt dem Nutzer Texte |
| INF-5 State | CMP hat komplexen Zustand |
| INF-6 Performance | CMP ist latenz-kritisch |

## Von CMP zu FNs

1. Lies die CMP-Verantwortung
2. Frage: "Was genau muss das System tun um diese Verantwortung zu erfüllen?"
3. Jede einzelne Aktion/Verhalten = eine FN
4. FN = atomares Systemverhalten — kann einzeln getestet werden
5. Typisch: 3-7 FNs pro CMP

## Anti-Patterns

- ❌ **God-CMP**: Eine Komponente für alles → Aufteilen
- ❌ **Leere CMP**: Komponente ohne Funktionen → Entfernen
- ❌ **UI+Logic vermischt**: Ein CMP das UI UND Business-Logik hat → Zwei CMPs
- ❌ **Fehlende INF**: CMP mit Nutzerdaten ohne DSGVO-Referenz
- ❌ **Technologie-gebunden**: "React-Component" → CMP ist technologie-agnostisch
