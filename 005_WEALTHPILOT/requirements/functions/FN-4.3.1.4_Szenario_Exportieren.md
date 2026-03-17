---
type: function
id: FN-4.3.1.4
status: draft
parent: CMP-4.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.3.1.4: Szenario Exportieren

> **Parent**: [CMP-4.3.1](../components/CMP-4.3.1_Optimierungs_Algorithmus.md)

---

## Functional Description

Das System muss ein gewaehltes Szenario als PDF exportieren koennen mit allen Berechnungsdetails, Annahmen und Visualisierungen.

- Das System soll den PDF-Export ueber den Report-Generator (CMP-8.2.1) realisieren.
- Das System soll alle Charts als statische Bilder in das PDF einbetten.
- Das System soll einen Disclaimer und das Erstelldatum inkludieren.

---

## Preconditions

- Ein Szenario ist ausgewaehlt.
- Report-Generator (CMP-8.2.1) ist verfuegbar.

---

## Behavior

1. Nutzer klickt "Als PDF exportieren" bei einem Szenario.
2. System kompiliert die Szenario-Daten: Konfiguration, Impact-Analyse, Metriken.
3. System rendert alle Charts als statische Bilder (Sankey, Waterfall, Gauge, Timeline).
4. System delegiert die PDF-Generierung an den Report-Generator (FN-8.2.1.1).
5. System fuegt Disclaimer, Erstelldatum und Mandanten-Branding hinzu.
6. System bietet den PDF-Download an.

---

## Postconditions

- PDF-Report ist generiert und zum Download bereit.
- Alle Berechnungsdetails und Visualisierungen sind im PDF enthalten.
- Disclaimer und Branding sind korrekt.

---

## Error Handling

- Das System soll bei PDF-Generierungsfehler eine Fehlermeldung anzeigen und einen Retry anbieten.
- Das System soll bei Chart-Rendering-Fehler das Chart durch eine Tabelle ersetzen.

---

## Acceptance Criteria (functional)

- [ ] PDF enthaelt Szenario-Konfiguration, alle Metriken und alle Charts.
- [ ] Disclaimer ist am Ende des PDFs vorhanden.
- [ ] Mandanten-Logo ist in der Kopfzeile.
- [ ] PDF-Groesse ist <= 10 MB.
- [ ] Download startet innerhalb von 10 Sekunden.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
