// fn-batch-1.cjs — SOL 1-3 (31 FN specs)
const { processBatch } = require('./fn-processor.cjs');

const data = [
  // ═══════════════════════════════════════════════════════════
  // SOL-1: Finanzprofil & Onboarding
  // ═══════════════════════════════════════════════════════════

  // --- CMP-1.1.1: Konto & Depot Erfassungsformular ---
  {
    id: 'FN-1.1.1.1', parent: 'CMP-1.1.1', title: 'IBAN Validierung',
    description:
      'Das System muss eingegebene IBANs nach ISO 13616 validieren (Laenderpruefziffer + BBAN-Struktur). Bei ungueltiger IBAN wird eine Inline-Fehlermeldung angezeigt.\n\n' +
      '- Das System soll die Laenderpruefziffer (Stellen 3-4) mittels Modulo-97-Verfahren gemaess ISO 7064 pruefen.\n' +
      '- Das System soll die BBAN-Struktur (Bankleitzahl + Kontonummer) gemaess laenderspezifischem Format validieren (DE: 8-stellige BLZ + 10-stellige Kontonr).\n' +
      '- Das System soll bei gueltigem IBAN den Banknamen ueber einen BIC-Lookup automatisch befuellen.',
    preconditions: [
      'Nutzer ist authentifiziert und hat die Rolle "Kunde" oder "Berater".',
      'Das Konto-Erfassungsformular ist geoeffnet.',
      'Eine Internetverbindung besteht (fuer BIC-Lookup).'
    ],
    behavior: [
      'Nutzer gibt einen String in das IBAN-Eingabefeld ein.',
      'System entfernt Leerzeichen und konvertiert in Grossbuchstaben.',
      'System prueft Laengenplausibilitaet (DE = 22 Zeichen).',
      'System berechnet Modulo-97-Pruefziffer gemaess ISO 7064.',
      'Bei gueltigem Ergebnis: System validiert BBAN-Struktur gegen laenderspezifisches Muster.',
      'Bei gueltigem IBAN: System fuehrt BIC-Lookup durch und befuellt Bankname automatisch.',
      'Bei ungueltigem IBAN: System zeigt Inline-Fehlermeldung unter dem Eingabefeld an.'
    ],
    postconditions: [
      'Ein gueltiger IBAN ist im Formularfeld gespeichert und gruen markiert.',
      'Der Bankname ist automatisch befuellt (oder manuell eingegeben falls Lookup fehlschlaegt).',
      'Ein ungueltiger IBAN blockiert das Absenden des Formulars.'
    ],
    errors: [
      'Das System soll bei ungueltigem Laendercode die Meldung "Unbekannter Laendercode" anzeigen.',
      'Das System soll bei falscher Pruefziffer die Meldung "IBAN ungueltig — bitte pruefen" anzeigen.',
      'Das System soll bei Timeout des BIC-Lookups (>3s) den Banknamen als manuelles Pflichtfeld aktivieren.'
    ],
    acceptance: [
      'Gueltige deutsche IBAN (DE89370400440532013000) wird als gueltig erkannt.',
      'Ungueltige Pruefziffer (DE00370400440532013000) wird mit Fehlermeldung abgelehnt.',
      'BIC-Lookup befuellt Bankname bei gueltiger IBAN innerhalb von 2 Sekunden.',
      'Leerzeichen und Kleinbuchstaben werden automatisch bereinigt.',
      'Formular-Submit ist bei ungueltiger IBAN deaktiviert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.1.1.2', parent: 'CMP-1.1.1', title: 'Depot Anlegen',
    description:
      'Das System muss ein Wertpapierdepot mit folgenden Pflichtfeldern erfassen: Bankname, Depotnummer, Depottyp (Einzel/Gemeinschaftsdepot).\n\n' +
      '- Das System soll die Depotnummer auf Eindeutigkeit pro Nutzer pruefen.\n' +
      '- Das System soll optionale Felder bereitstellen: Verrechnungskonto-IBAN, Depotwaehrung, Eroeffnungsdatum.\n' +
      '- Das System soll das Depot nach Anlage sofort fuer die Depot-Synchronisation verfuegbar machen.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Mindestens ein Bankkonto ist bereits erfasst oder wird gleichzeitig angelegt.'
    ],
    behavior: [
      'Nutzer oeffnet das Depot-Erfassungsformular.',
      'System zeigt Pflichtfelder (Bankname, Depotnummer, Depottyp) und optionale Felder.',
      'Nutzer fuellt die Pflichtfelder aus und waehlt den Depottyp aus einer Dropdown-Liste.',
      'System validiert Depotnummer auf Eindeutigkeit (kein Duplikat fuer diesen Nutzer).',
      'Bei optionaler Verrechnungskonto-IBAN: System validiert IBAN (delegiert an FN-1.1.1.1).',
      'System speichert das Depot verschluesselt (delegiert an FN-1.1.1.4).',
      'System zeigt Erfolgsmeldung und leitet zur Vermoegensuebersicht weiter.'
    ],
    postconditions: [
      'Das Depot ist persistent gespeichert und in der Vermoegensuebersicht sichtbar.',
      'Das Depot ist fuer die Depot-Sync-Engine (CMP-2.2.1) verfuegbar.',
      'Ein Audit-Event "DEPOT_CREATED" ist protokolliert.'
    ],
    errors: [
      'Das System soll bei doppelter Depotnummer die Meldung "Diese Depotnummer existiert bereits" anzeigen.',
      'Das System soll bei fehlendem Pflichtfeld das Feld rot markieren und "Pflichtfeld" anzeigen.',
      'Das System soll bei Datenbankfehler die Eingabe im lokalen State halten und einen Retry-Button anbieten.'
    ],
    acceptance: [
      'Depot wird mit allen Pflichtfeldern erfolgreich angelegt.',
      'Duplikat-Depotnummer fuer gleichen Nutzer wird abgelehnt.',
      'Gleiche Depotnummer fuer verschiedene Nutzer wird akzeptiert.',
      'Optionale Felder koennen leer bleiben.',
      'Depot erscheint sofort in der Vermoegensuebersicht.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.1.1.3', parent: 'CMP-1.1.1', title: 'Vermoegen Kategorisieren',
    description:
      'Das System muss jedes erfasste Konto/Depot einer Asset-Klasse zuordnen: Tagesgeld, Festgeld, Aktien, Anleihen, Fonds, ETFs, Immobilien, Krypto, Sonstige.\n\n' +
      '- Das System soll eine automatische Vorschlagszuordnung basierend auf dem Kontotyp vornehmen.\n' +
      '- Das System soll dem Nutzer die manuelle Aenderung der Zuordnung erlauben.\n' +
      '- Das System soll die Kategorisierung fuer die Portfolio-Aggregation (CMP-3.2.1) bereitstellen.',
    preconditions: [
      'Mindestens ein Konto oder Depot ist erfasst.',
      'Nutzer ist authentifiziert.'
    ],
    behavior: [
      'System erkennt den Kontotyp (Girokonto, Sparkonto, Depot) und schlaegt eine Asset-Klasse vor.',
      'Fuer Depot-Positionen: System liest die ISIN und ordnet ueber den Instrument-Typ die Asset-Klasse zu.',
      'Nutzer kann die Zuordnung per Dropdown aendern.',
      'System speichert die Zuordnung und aktualisiert die Aggregationsansicht.',
      'Bei Aenderung wird ein Audit-Event "ASSET_CLASS_CHANGED" protokolliert.'
    ],
    postconditions: [
      'Jedes Konto/Depot hat genau eine zugeordnete Asset-Klasse.',
      'Die Aggregationsberechnung (CMP-3.2.1) nutzt die aktuelle Zuordnung.',
      'Aenderungshistorie ist im Audit-Log verfuegbar.'
    ],
    errors: [
      'Das System soll bei unbekanntem Instrument-Typ die Kategorie "Sonstige" vorschlagen.',
      'Das System soll bei fehlender ISIN eine manuelle Zuordnung erzwingen.'
    ],
    acceptance: [
      'Tagesgeldkonto wird automatisch als "Tagesgeld" kategorisiert.',
      'ETF-Position (ISIN mit "ETF" im Instrument-Typ) wird als "ETFs" kategorisiert.',
      'Manuelle Aenderung von "Aktien" zu "Fonds" wird gespeichert und in Aggregation uebernommen.',
      'Audit-Log enthaelt den Kategorisierungswechsel mit Zeitstempel.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.1.1.4', parent: 'CMP-1.1.1', title: 'Verschluesselte Speicherung',
    description:
      'Das System muss alle Finanzdaten AES-256-verschluesselt in der Datenbank speichern. Der Encryption-Key wird pro Nutzer aus einem KMS (Key Management Service) abgeleitet.\n\n' +
      '- Das System soll einen nutzerspezifischen Data Encryption Key (DEK) via KMS generieren.\n' +
      '- Das System soll den DEK mit einem Key Encryption Key (KEK) wrappen und nur den Ciphertext in der DB speichern.\n' +
      '- Das System soll bei Key-Rotation bestehende Daten transparent re-encrypten.',
    preconditions: [
      'KMS-Verbindung ist verfuegbar.',
      'Nutzerkonto existiert mit zugeordnetem KEK.',
      'TLS 1.3 Verbindung zwischen Applikationsserver und Datenbank.'
    ],
    behavior: [
      'Bei Erstanlage: System generiert einen neuen DEK via KMS (AES-256-GCM).',
      'System verschluesselt den DEK mit dem nutzerspezifischen KEK (Envelope Encryption).',
      'System speichert den verschluesselten DEK in der Key-Tabelle.',
      'Bei jeder Schreiboperation: System entschluesselt DEK, verschluesselt die Nutzdaten und speichert den Ciphertext.',
      'Bei jeder Leseoperation: System entschluesselt DEK, entschluesselt Nutzdaten und gibt Klartext zurueck.',
      'Bei Key-Rotation: System generiert neuen DEK, re-encryptet alle Daten in einer Batch-Transaktion.'
    ],
    postconditions: [
      'Alle Finanzdaten sind ausschliesslich als AES-256-GCM Ciphertext in der DB gespeichert.',
      'Der DEK ist nur verschluesselt (wrapped) in der DB vorhanden.',
      'Klartext-Daten existieren nur im Applikationsspeicher waehrend der Verarbeitung.'
    ],
    errors: [
      'Das System soll bei KMS-Timeout (>5s) die Operation abbrechen und einen 503-Fehler zurueckgeben.',
      'Das System soll bei Key-Rotation-Fehler einen Rollback durchfuehren und den Administrator benachrichtigen.',
      'Das System soll bei Entschluesselungsfehler (korrupter Ciphertext) den Vorfall loggen und den Datensatz als "corrupted" markieren.'
    ],
    acceptance: [
      'Direkter Datenbank-Zugriff zeigt nur Ciphertext (kein Klartext sichtbar).',
      'Lesezugriff via API liefert korrekt entschluesselte Daten.',
      'Key-Rotation re-encryptet alle Datensaetze ohne Datenverlust.',
      'KMS-Ausfall verhindert Schreib-/Leseoperationen (fail-closed).',
      'DEK wird nie als Klartext geloggt oder in Fehlermeldungen exponiert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-1.2.1: Einnahmen/Ausgaben Modul ---
  {
    id: 'FN-1.2.1.1', parent: 'CMP-1.2.1', title: 'Einnahmen Erfassen',
    description:
      'Das System muss regelmaessige Einnahmen erfassen: Typ (Gehalt/Mieteinnahmen/Dividenden/Sonstige), Betrag, Intervall (monatlich/quartalsweise/jaehrlich).\n\n' +
      '- Das System soll ein Formular mit strukturierter Eingabe bereitstellen.\n' +
      '- Das System soll Betraege nur als positive Dezimalzahlen mit max. 2 Nachkommastellen akzeptieren.\n' +
      '- Das System soll erfasste Einnahmen fuer die Sparquoten-Berechnung (FN-1.2.1.3) bereitstellen.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Einnahmen/Ausgaben-Modul ist geoeffnet.'
    ],
    behavior: [
      'Nutzer waehlt den Einnahmetyp aus einer vordefinierten Liste.',
      'Nutzer gibt den Betrag ein (Waehrung EUR, positive Dezimalzahl).',
      'Nutzer waehlt das Intervall (monatlich, quartalsweise, jaehrlich).',
      'Optional: Nutzer gibt eine Beschreibung und ein Startdatum ein.',
      'System validiert alle Eingaben (Typ gesetzt, Betrag > 0, Intervall gesetzt).',
      'System speichert die Einnahme verschluesselt (delegiert an FN-1.1.1.4).',
      'System aktualisiert die Sparquoten-Anzeige automatisch.'
    ],
    postconditions: [
      'Die Einnahme ist persistent gespeichert.',
      'Die Sparquoten-Berechnung (FN-1.2.1.3) beruecksichtigt die neue Einnahme.',
      'Die Einnahme erscheint in der Einnahmen-Liste.'
    ],
    errors: [
      'Das System soll bei negativem Betrag die Meldung "Betrag muss positiv sein" anzeigen.',
      'Das System soll bei Betrag = 0 die Meldung "Betrag darf nicht null sein" anzeigen.',
      'Das System soll bei fehlendem Typ das Feld rot markieren.'
    ],
    acceptance: [
      'Einnahme mit Typ "Gehalt", 3500.00 EUR, monatlich wird gespeichert.',
      'Negativer Betrag (-100) wird mit Fehlermeldung abgelehnt.',
      'Sparquote wird nach Erfassung automatisch neu berechnet.',
      'Einnahme erscheint in der Liste mit korrektem Typ und Betrag.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.2.1.2', parent: 'CMP-1.2.1', title: 'Ausgaben Erfassen',
    description:
      'Das System muss regelmaessige Ausgaben erfassen: Typ (Miete/Kredit/Versicherung/Sparplan/Sonstige), Betrag, Intervall, optionaler Endzeitpunkt.\n\n' +
      '- Das System soll die gleiche Formularstruktur wie die Einnahmenerfassung bieten.\n' +
      '- Das System soll Ausgaben mit optionalem Enddatum unterstuetzen (z.B. Kredit laeuft 2030 aus).\n' +
      '- Das System soll die Ausgabe fuer die DIN-77230-Kategorisierung (FN-1.2.1.4) bereitstellen.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Einnahmen/Ausgaben-Modul ist geoeffnet.'
    ],
    behavior: [
      'Nutzer waehlt den Ausgabetyp aus einer vordefinierten Liste.',
      'Nutzer gibt den Betrag ein (Waehrung EUR, positive Dezimalzahl).',
      'Nutzer waehlt das Intervall (monatlich, quartalsweise, jaehrlich).',
      'Optional: Nutzer gibt Beschreibung, Startdatum und Enddatum ein.',
      'System validiert alle Eingaben (Typ gesetzt, Betrag > 0, Intervall gesetzt).',
      'Falls Enddatum: System prueft, dass Enddatum nach Startdatum liegt.',
      'System speichert die Ausgabe verschluesselt (delegiert an FN-1.1.1.4).',
      'System aktualisiert die Sparquoten-Anzeige automatisch.'
    ],
    postconditions: [
      'Die Ausgabe ist persistent gespeichert.',
      'Die Sparquoten-Berechnung (FN-1.2.1.3) beruecksichtigt die neue Ausgabe.',
      'Die DIN-77230-Kategorisierung (FN-1.2.1.4) kann die Ausgabe einordnen.'
    ],
    errors: [
      'Das System soll bei negativem Betrag die Meldung "Betrag muss positiv sein" anzeigen.',
      'Das System soll bei Enddatum vor Startdatum die Meldung "Enddatum muss nach Startdatum liegen" anzeigen.',
      'Das System soll bei fehlendem Pflichtfeld das Feld rot markieren.'
    ],
    acceptance: [
      'Ausgabe mit Typ "Miete", 1200.00 EUR, monatlich wird gespeichert.',
      'Ausgabe mit Enddatum 2030-12-31 wird gespeichert und bei Ablauf automatisch deaktiviert.',
      'Sparquote wird nach Erfassung automatisch neu berechnet.',
      'Enddatum vor Startdatum wird abgelehnt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.2.1.3', parent: 'CMP-1.2.1', title: 'Sparquote Berechnen',
    description:
      'Das System muss die monatliche Sparquote berechnen: (Einnahmen - Ausgaben) / Einnahmen * 100. Anzeige als Prozentwert und als absoluter Eurobetrag.\n\n' +
      '- Das System soll alle Einnahmen und Ausgaben auf einen monatlichen Betrag normalisieren (quartalsweise / 3, jaehrlich / 12).\n' +
      '- Das System soll die Sparquote als Echtzeit-Widget im Dashboard anzeigen.\n' +
      '- Das System soll bei negativer Sparquote eine Warnung anzeigen.',
    preconditions: [
      'Mindestens eine Einnahme ist erfasst.',
      'Mindestens eine Ausgabe ist erfasst (oder Ausgaben = 0).'
    ],
    behavior: [
      'System laedt alle aktiven Einnahmen des Nutzers.',
      'System normalisiert jede Einnahme auf monatlichen Betrag (quartalsweise / 3, jaehrlich / 12).',
      'System laedt alle aktiven Ausgaben und normalisiert analog.',
      'System berechnet: Sparquote_Prozent = (Summe_Einnahmen - Summe_Ausgaben) / Summe_Einnahmen * 100.',
      'System berechnet: Sparquote_Absolut = Summe_Einnahmen - Summe_Ausgaben.',
      'System zeigt Prozentwert und Absolutwert im Widget an.',
      'Bei Sparquote < 0: System zeigt Warnhinweis "Ausgaben uebersteigen Einnahmen".'
    ],
    postconditions: [
      'Die Sparquote ist als Prozent- und Absolutwert sichtbar.',
      'Bei negativer Sparquote ist ein Warnhinweis sichtbar.',
      'Die Berechnung aktualisiert sich bei jeder Aenderung von Einnahmen/Ausgaben.'
    ],
    errors: [
      'Das System soll bei Division durch Null (keine Einnahmen) die Sparquote als "n/a" anzeigen.',
      'Das System soll bei Berechnungsfehler den letzten gueltigen Wert beibehalten und "Aktualisierung fehlgeschlagen" anzeigen.'
    ],
    acceptance: [
      'Bei 3500 EUR Einnahmen und 2500 EUR Ausgaben wird 28.57% und 1000 EUR angezeigt.',
      'Quartalsweise Einnahme von 3000 EUR wird als 1000 EUR/Monat normalisiert.',
      'Negative Sparquote loest Warnung aus.',
      'Keine Einnahmen zeigt "n/a" statt Divisionsfehler.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.2.1.4', parent: 'CMP-1.2.1', title: 'DIN77230 Kategorisierung',
    description:
      'Das System muss Einnahmen und Ausgaben gemaess DIN 77230 (Basis-Finanzanalyse) kategorisieren und eine Deckungsluekenanalyse durchfuehren.\n\n' +
      '- Das System soll die DIN-77230-Bedarfsfelder abbilden: Grundabsicherung, Wohnen, Altersvorsorge, Vermoegenssicherung, Vermoegensaufbau.\n' +
      '- Das System soll automatisch Deckungsluecken identifizieren (Bedarf vs. Ist-Absicherung).\n' +
      '- Das System soll Handlungsempfehlungen pro Bedarfsfeld generieren.',
    preconditions: [
      'Einnahmen und Ausgaben sind vollstaendig erfasst.',
      'Nutzer hat das Risikoprofil (CMP-1.3.1) ausgefuellt.'
    ],
    behavior: [
      'System ordnet jede Ausgabe einem DIN-77230-Bedarfsfeld zu (regelbasiertes Mapping).',
      'System berechnet den Soll-Bedarf pro Bedarfsfeld basierend auf Einkommen und Risikoprofil.',
      'System vergleicht Ist-Absicherung mit Soll-Bedarf.',
      'System identifiziert Deckungsluecken (Soll > Ist).',
      'System generiert Handlungsempfehlungen: Prioritaet, Massnahme, geschaetzter Betrag.',
      'System zeigt die Analyse als strukturierte Uebersicht mit Ampelfarben (gruen/gelb/rot).'
    ],
    postconditions: [
      'Alle Einnahmen/Ausgaben sind einem DIN-77230-Bedarfsfeld zugeordnet.',
      'Deckungsluecken sind identifiziert und quantifiziert.',
      'Handlungsempfehlungen sind priorisiert verfuegbar.'
    ],
    errors: [
      'Das System soll bei unvollstaendigen Einnahmen/Ausgaben eine Warnung "Analyse moeglicherweise unvollstaendig" anzeigen.',
      'Das System soll bei fehlendem Risikoprofil den Nutzer zur Profil-Erfassung weiterleiten.'
    ],
    acceptance: [
      'Miete wird dem Bedarfsfeld "Wohnen" zugeordnet.',
      'Versicherung wird dem Bedarfsfeld "Grundabsicherung" zugeordnet.',
      'Deckungsluecke von 500 EUR im Bereich Altersvorsorge wird rot markiert.',
      'Handlungsempfehlung wird mit Prioritaet und geschaetztem Betrag angezeigt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-1.3.1: Risikoprofil Fragebogen ---
  {
    id: 'FN-1.3.1.1', parent: 'CMP-1.3.1', title: 'Fragebogen Anzeigen',
    description:
      'Das System muss einen WpHG-konformen Fragebogen mit 8-12 Fragen (Likert-Skala 1-5) anzeigen. Fragen decken ab: Anlageerfahrung, Anlagehorizont, Verlusttoleranz, Einkommenssituation.\n\n' +
      '- Das System soll den Fragebogen als Stepper-Formular (eine Frage pro Seite) darstellen.\n' +
      '- Das System soll den Fortschritt als Progress-Bar anzeigen.\n' +
      '- Das System soll ein Zwischenspeichern ermoeglichen (Nutzer kann spaeter fortfahren).',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Fragebogen-Template ist konfiguriert (mandantenspezifisch moeglich).'
    ],
    behavior: [
      'System laedt den Fragebogen-Template fuer den aktuellen Mandanten.',
      'System prueft ob ein Zwischenstand existiert und laed diesen ggf.',
      'System zeigt die erste (oder naechste unbeantwortete) Frage an.',
      'Nutzer beantwortet die Frage per Likert-Skala (1-5) Radio-Buttons.',
      'Bei Klick auf "Weiter": System speichert die Antwort und zeigt die naechste Frage.',
      'Bei Klick auf "Zurueck": System zeigt die vorherige Frage mit gespeicherter Antwort.',
      'Nach der letzten Frage: System zeigt eine Zusammenfassung aller Antworten.',
      'Nutzer bestaetigt die Antworten und loest die Risikoklassen-Berechnung aus (FN-1.3.1.2).'
    ],
    postconditions: [
      'Alle Fragen sind beantwortet und gespeichert.',
      'Der Fragebogen-Status ist "abgeschlossen".',
      'Die Risikoklassen-Berechnung (FN-1.3.1.2) wurde ausgeloest.'
    ],
    errors: [
      'Das System soll bei fehlender Antwort den "Weiter"-Button deaktivieren.',
      'Das System soll bei Verbindungsabbruch den letzten Zwischenstand beibehalten.',
      'Das System soll bei fehlendem Fragebogen-Template einen 500-Fehler loggen und "Fragebogen nicht verfuegbar" anzeigen.'
    ],
    acceptance: [
      'Fragebogen zeigt 10 Fragen als Stepper mit Progress-Bar.',
      'Zwischenspeichern funktioniert — Nutzer kann Browser schliessen und spaeter fortfahren.',
      'Zurueck-Navigation zeigt vorherige Antworten korrekt.',
      'Zusammenfassung zeigt alle 10 Antworten vor der finalen Bestaetigung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.3.1.2', parent: 'CMP-1.3.1', title: 'Risikoklasse Berechnen',
    description:
      'Das System muss aus den Fragebogen-Antworten einen Score berechnen und eine von 5 Risikoklassen zuordnen: sicherheitsorientiert, konservativ, ausgewogen, wachstumsorientiert, chancenorientiert.\n\n' +
      '- Das System soll die Score-Berechnung als gewichtete Summe durchfuehren (Verlusttoleranz 30%, Anlagehorizont 25%, Erfahrung 25%, Einkommen 20%).\n' +
      '- Das System soll die Score-Grenzen konfigurierbar halten (pro Mandant).\n' +
      '- Das System soll das Ergebnis dem Nutzer visuell (Skala + Erklaerungstext) darstellen.',
    preconditions: [
      'Alle Fragebogen-Fragen sind beantwortet.',
      'Score-Gewichtungen und Klassengrenzen sind konfiguriert.'
    ],
    behavior: [
      'System laedt alle Antworten (Werte 1-5) des abgeschlossenen Fragebogens.',
      'System normalisiert Antworten nach Fragekategorie (Verlusttoleranz, Horizont, Erfahrung, Einkommen).',
      'System berechnet gewichtete Summe: Score = 0.3*Verlust + 0.25*Horizont + 0.25*Erfahrung + 0.2*Einkommen.',
      'System ordnet Score einer Risikoklasse zu (z.B. 1.0-1.8 = sicherheitsorientiert, 1.8-2.6 = konservativ, etc.).',
      'System zeigt das Ergebnis als grafische Skala mit Erklaerungstext an.',
      'System speichert das Ergebnis mit Zeitstempel und loest Audit-Protokollierung (FN-1.3.1.3) aus.'
    ],
    postconditions: [
      'Dem Nutzer ist genau eine Risikoklasse zugeordnet.',
      'Der Score und die Zuordnung sind persistent gespeichert.',
      'Die Risikoklasse steht fuer Produkt-Matching (CMP-7.2.1) und Rendite-Ziel (CMP-3.2.1) bereit.'
    ],
    errors: [
      'Das System soll bei unvollstaendigen Antworten einen Fehler werfen und den Nutzer zum Fragebogen zurueckleiten.',
      'Das System soll bei Score ausserhalb des konfigurierten Bereichs einen Fallback auf die naechste gueltige Klasse durchfuehren.'
    ],
    acceptance: [
      'Score 2.3 wird als "konservativ" klassifiziert.',
      'Score 4.5 wird als "chancenorientiert" klassifiziert.',
      'Aenderung der Gewichtung durch Admin aendert Ergebnis korrekt.',
      'Ergebnis wird dem Nutzer mit Erklaerungstext und grafischer Skala angezeigt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-1.3.1.3', parent: 'CMP-1.3.1', title: 'Profil Aenderung Protokollieren',
    description:
      'Das System muss jede Aenderung des Risikoprofils mit Zeitstempel und vorherigem Wert im Audit-Log protokollieren (regulatorische Pflicht gemaess WpHG).\n\n' +
      '- Das System soll den alten und neuen Wert sowie den Aenderungsgrund erfassen.\n' +
      '- Das System soll die Protokollierung an den zentralen Audit-Logger (CMP-9.1.1) delegieren.\n' +
      '- Das System soll die Aenderungshistorie fuer den Compliance-Bericht bereitstellen.',
    preconditions: [
      'Ein Risikoprofil existiert fuer den Nutzer.',
      'Der Audit-Logger (CMP-9.1.1) ist verfuegbar.'
    ],
    behavior: [
      'System erkennt eine Aenderung des Risikoprofils (neuer Score oder neue Klasse).',
      'System erstellt einen Audit-Datensatz: Nutzer-ID, alter Score, neuer Score, alte Klasse, neue Klasse, Zeitstempel (UTC), Aenderungsgrund.',
      'System sendet den Datensatz an den Audit-Logger (FN-9.1.1.1).',
      'System speichert die Aenderung als immutable Eintrag (kein Update/Delete moeglich).'
    ],
    postconditions: [
      'Die Aenderung ist im Audit-Log unveraenderlich protokolliert.',
      'Der Compliance-Bericht kann die vollstaendige Aenderungshistorie abrufen.',
      'Der alte und neue Wert sind nachvollziehbar.'
    ],
    errors: [
      'Das System soll bei Audit-Logger-Fehler die Risikoprofil-Aenderung trotzdem speichern und den Audit-Eintrag in eine Retry-Queue stellen.',
      'Das System soll bei Retry-Queue-Ueberlauf einen Administrator-Alert ausloesen.'
    ],
    acceptance: [
      'Wechsel von "konservativ" zu "ausgewogen" wird mit beiden Werten protokolliert.',
      'Audit-Eintrag enthaelt UTC-Zeitstempel, Nutzer-ID und Aenderungsgrund.',
      'Audit-Eintraege koennen nicht nachtraeglich geaendert oder geloescht werden.',
      'Bei Audit-Logger-Ausfall wird die Aenderung in der Retry-Queue gespeichert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-2: Kontenaggregation
  // ═══════════════════════════════════════════════════════════

  // --- CMP-2.1.1: PSD2 Kontoaggregations-Adapter ---
  {
    id: 'FN-2.1.1.1', parent: 'CMP-2.1.1', title: 'Consent Einholen',
    description:
      'Das System muss den Nutzer per OAuth2-Redirect zur Hausbank weiterleiten, um einen PSD2-AISP-Consent einzuholen. Der Consent erlaubt den Lesezugriff auf Kontostaende und Transaktionen fuer 90 Tage.\n\n' +
      '- Das System soll den OAuth2-Authorization-Code-Flow via finAPI implementieren.\n' +
      '- Das System soll den erhaltenen Access-Token sicher speichern (verschluesselt).\n' +
      '- Das System soll den Consent-Status persistent tracken (active/expired/revoked).',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'finAPI-Konfiguration (Client-ID, Client-Secret) ist fuer den Mandanten hinterlegt.',
      'Nutzer hat mindestens ein Bankkonto zur Verknuepfung bereit.'
    ],
    behavior: [
      'Nutzer klickt "Konto verknuepfen" und waehlt seine Bank aus der BLZ-Liste.',
      'System initiiert den finAPI OAuth2-Flow: Redirect zur Bank-Login-Seite.',
      'Nutzer authentifiziert sich bei der Bank und erteilt den Consent.',
      'Bank redirected zurueck mit Authorization-Code.',
      'System tauscht den Authorization-Code gegen ein Access-Token (finAPI API).',
      'System speichert das Token verschluesselt (FN-1.1.1.4) mit Ablaufdatum (90 Tage).',
      'System setzt den Consent-Status auf "active" und loest den initialen Sync aus.'
    ],
    postconditions: [
      'Ein aktiver PSD2-Consent ist gespeichert.',
      'Access-Token ist verschluesselt in der Datenbank.',
      'Consent-Ablaufdatum ist berechnet (heute + 90 Tage).',
      'Der initiale Konto-Sync ist angestossen.'
    ],
    errors: [
      'Das System soll bei Ablehnung des Consents durch den Nutzer zur Kontouebersicht zurueckleiten mit Hinweis "Consent nicht erteilt".',
      'Das System soll bei OAuth-Fehler (invalid_grant) den Vorgang abbrechen und einen erneuten Versuch anbieten.',
      'Das System soll bei finAPI-Timeout (>30s) einen Timeout-Fehler anzeigen.'
    ],
    acceptance: [
      'Erfolgreicher Consent-Flow fuehrt zu gespeichertem Token mit Status "active".',
      'Ablaufdatum ist korrekt auf 90 Tage in der Zukunft gesetzt.',
      'Bank-seitige Ablehnung wird korrekt behandelt (kein Token gespeichert).',
      'Token ist in der Datenbank nur als Ciphertext vorhanden.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-2.1.1.2', parent: 'CMP-2.1.1', title: 'Kontostaende Abrufen',
    description:
      'Das System muss taeglich die aktuellen Kontostaende aller verbundenen Konten ueber die PSD2-API abrufen und speichern.\n\n' +
      '- Das System soll einen taeglichen Cron-Job ausfuehren (06:00 UTC).\n' +
      '- Das System soll pro Konto den aktuellen Saldo (booked balance) und den verfuegbaren Saldo (available balance) speichern.\n' +
      '- Das System soll die Kontostaende als Zeitreihe fuer die Vermoegenshistorie bereithalten.',
    preconditions: [
      'Mindestens ein aktiver PSD2-Consent existiert.',
      'Access-Token ist gueltig (nicht abgelaufen).',
      'finAPI-Service ist erreichbar.'
    ],
    behavior: [
      'Cron-Job startet taeglich um 06:00 UTC.',
      'System iteriert ueber alle Nutzer mit aktivem Consent.',
      'Pro Nutzer: System entschluesselt das Access-Token.',
      'System ruft GET /accounts/balances bei finAPI auf.',
      'Pro Konto: System speichert booked_balance, available_balance, Zeitstempel (UTC).',
      'System erkennt Aenderungen zum Vortag und markiert diese.',
      'Bei Fehler fuer ein Konto: System faehrt mit naechstem Konto fort und loggt den Fehler.'
    ],
    postconditions: [
      'Aktuelle Kontostaende aller verbundenen Konten sind gespeichert.',
      'Zeitreihendaten fuer die Vermoegenshistorie sind aktualisiert.',
      'Fehlerhafte Abrufe sind geloggt.'
    ],
    errors: [
      'Das System soll bei abgelaufenem Token den Consent-Status auf "expired" setzen und den Nutzer per E-Mail benachrichtigen.',
      'Das System soll bei finAPI-Rate-Limit (429) einen exponentiellen Backoff (1s, 2s, 4s, max 3 Retries) durchfuehren.',
      'Das System soll bei Netzwerkfehler den Abruf in 30 Minuten wiederholen (max 3 Versuche).'
    ],
    acceptance: [
      'Kontostaende werden taeglich um 06:00 UTC abgerufen.',
      'Booked und available Balance sind separat gespeichert.',
      'Abgelaufener Token fuehrt zu Consent-Status "expired" und E-Mail-Benachrichtigung.',
      'Rate-Limit (429) wird mit Backoff behandelt.'
    ],
    triggers_notifications: ['NTF-CONSENT-EXPIRED'],
    notifications: ['Bei abgelaufenem Token: E-Mail-Benachrichtigung an den Nutzer (NTF-CONSENT-EXPIRED).'],
    conversations: []
  },
  {
    id: 'FN-2.1.1.3', parent: 'CMP-2.1.1', title: 'Transaktionen Synchronisieren',
    description:
      'Das System muss neue Transaktionen seit dem letzten Sync inkrementell abrufen und kategorisieren (Einnahme/Ausgabe/Transfer).\n\n' +
      '- Das System soll den Delta-Sync ueber das "dateFrom"-Feld der finAPI-API steuern.\n' +
      '- Das System soll Transaktionen automatisch als Einnahme, Ausgabe oder Transfer klassifizieren.\n' +
      '- Das System soll Duplikate anhand von Transaktions-ID oder Hash (Datum+Betrag+Referenz) erkennen.',
    preconditions: [
      'Aktiver PSD2-Consent mit gueltigem Token.',
      'Mindestens ein vorheriger Sync ist abgeschlossen (oder Initialsync laeuft).'
    ],
    behavior: [
      'System ermittelt das Datum des letzten erfolgreichen Syncs.',
      'System ruft GET /transactions?dateFrom={lastSync} bei finAPI auf.',
      'Pro Transaktion: System prueft auf Duplikat (Transaktions-ID oder Hash).',
      'Neue Transaktionen werden klassifiziert: positive Betraege = Einnahme, negative = Ausgabe, gleicher Nutzer = Transfer.',
      'System speichert die Transaktionen verschluesselt mit Kategorisierung.',
      'System aktualisiert den lastSync-Timestamp.'
    ],
    postconditions: [
      'Alle neuen Transaktionen sind gespeichert und kategorisiert.',
      'Keine Duplikate wurden angelegt.',
      'lastSync-Timestamp ist aktualisiert.'
    ],
    errors: [
      'Das System soll bei Duplikat die Transaktion lautlos ueberspringen (kein Fehler).',
      'Das System soll bei unbekannter Transaktionskategorie die Kategorie "Sonstige" zuweisen.',
      'Das System soll bei Partial-Failure (einige Transaktionen fehlerhaft) die gueltigen speichern und die fehlerhaften loggen.'
    ],
    acceptance: [
      'Nur Transaktionen seit dem letzten Sync werden abgerufen.',
      'Duplikat-Transaktionen werden korrekt erkannt und uebersprungen.',
      'Positive Betraege werden als Einnahme, negative als Ausgabe klassifiziert.',
      'lastSync-Timestamp wird auf den Zeitpunkt des letzten abgerufenen Datensatzes gesetzt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-2.1.1.4', parent: 'CMP-2.1.1', title: 'Consent Renewal',
    description:
      'Das System muss 7 Tage vor Ablauf des 90-Tage-Consents eine E-Mail-Erinnerung senden und im Dashboard einen Renewal-Banner anzeigen.\n\n' +
      '- Das System soll taeglich pruefen welche Consents innerhalb von 7 Tagen ablaufen.\n' +
      '- Das System soll bei Nicht-Erneuerung am Ablauftag den Consent als "expired" markieren.\n' +
      '- Das System soll einen nahtlosen Renewal-Flow (One-Click) ueber finAPI anbieten.',
    preconditions: [
      'Mindestens ein aktiver Consent existiert.',
      'E-Mail-Adresse des Nutzers ist verifiziert.'
    ],
    behavior: [
      'Taeglicher Cron-Job (07:00 UTC) prueft alle Consents mit Ablaufdatum <= heute + 7 Tage.',
      'Pro betroffenen Consent: System sendet eine E-Mail-Erinnerung mit Renewal-Link.',
      'System zeigt im Dashboard einen gelben Banner "Konto-Verknuepfung laeuft in X Tagen ab".',
      'Nutzer klickt auf Renewal-Link: System initiiert den Consent-Flow (FN-2.1.1.1) mit Pre-Selection der Bank.',
      'Bei erfolgreichem Renewal: System aktualisiert das Ablaufdatum (+ 90 Tage) und entfernt den Banner.',
      'Bei Nicht-Erneuerung am Ablauftag: System setzt Status auf "expired" und stoppt den Sync.'
    ],
    postconditions: [
      'Nutzer ist ueber den bevorstehenden Ablauf informiert (E-Mail + Banner).',
      'Bei Renewal: Consent ist um 90 Tage verlaengert.',
      'Bei Nicht-Renewal: Consent ist als "expired" markiert, Sync gestoppt.'
    ],
    errors: [
      'Das System soll bei E-Mail-Versandfehler den Fehler loggen und den Banner dennoch anzeigen.',
      'Das System soll bei fehlgeschlagenem Renewal-Flow eine erneute E-Mail in 24 Stunden senden.',
      'Das System soll maximal 3 Erinnerungs-E-Mails pro Consent senden.'
    ],
    acceptance: [
      'E-Mail wird genau 7 Tage vor Ablauf gesendet.',
      'Dashboard-Banner zeigt verbleibende Tage korrekt an.',
      'Renewal-Flow erneuert den Consent um 90 Tage.',
      'Nach Ablauf ohne Renewal wird Sync gestoppt und Status auf "expired" gesetzt.',
      'Maximal 3 Erinnerungs-E-Mails pro Consent.'
    ],
    triggers_notifications: ['NTF-CONSENT-RENEWAL'],
    notifications: ['7 Tage vor Ablauf: E-Mail-Erinnerung an den Nutzer (NTF-CONSENT-RENEWAL).'],
    conversations: []
  },

  // --- CMP-2.2.1: Depot Sync Engine ---
  {
    id: 'FN-2.2.1.1', parent: 'CMP-2.2.1', title: 'Positionen Synchronisieren',
    description:
      'Das System muss taeglich alle Depot-Positionen (ISIN, Stueckzahl, Kurs, Waehrung) abrufen und mit dem lokalen Bestand abgleichen.\n\n' +
      '- Das System soll den Abgleich auf Basis der ISIN als eindeutigem Schluessel durchfuehren.\n' +
      '- Das System soll neue Positionen anlegen, geaenderte aktualisieren und aufgeloeste deaktivieren.\n' +
      '- Das System soll Kursdaten in EUR umrechnen (bei Fremdwaehrung ueber ECB-Wechselkurse).',
    preconditions: [
      'Mindestens ein Depot ist erfasst (CMP-1.1.1).',
      'Depot-API-Zugang (finAPI oder CSV) ist konfiguriert.',
      'Tagesaktuelle Wechselkurse sind verfuegbar.'
    ],
    behavior: [
      'Cron-Job startet taeglich um 07:00 UTC.',
      'System ruft alle Positionen pro Depot ueber die konfigurierte Quelle ab.',
      'Pro Position: System prueft ob ISIN im lokalen Bestand existiert.',
      'Neue ISIN: System legt Position an (ISIN, Stueckzahl, Kurs, Waehrung).',
      'Bestehende ISIN: System aktualisiert Stueckzahl und Kurs.',
      'ISIN nicht mehr in Quelle: System setzt Position auf Status "aufgeloest".',
      'Fremdwaehrungspositionen: System rechnet in EUR um (ECB-Referenzkurs).',
      'System speichert Sync-Timestamp und Ergebnis-Zusammenfassung.'
    ],
    postconditions: [
      'Alle aktiven Depot-Positionen spiegeln den aktuellen Bestand wider.',
      'Aufgeloeste Positionen sind als "aufgeloest" markiert (nicht geloescht).',
      'Alle Kurse sind in EUR verfuegbar.'
    ],
    errors: [
      'Das System soll bei API-Fehler den letzten bekannten Stand beibehalten und den Fehler loggen.',
      'Das System soll bei fehlenden ECB-Wechselkursen den Vortags-Kurs verwenden.',
      'Das System soll bei unbekannter ISIN die Position anlegen und als "Manuell pruefen" markieren.'
    ],
    acceptance: [
      'Neue Position (ISIN DE000BASF111) wird korrekt angelegt.',
      'Stueckzahlaenderung (100 auf 150) wird aktualisiert.',
      'Aufgeloeste Position wird als "aufgeloest" markiert, nicht geloescht.',
      'USD-Position wird korrekt in EUR umgerechnet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-2.2.1.2', parent: 'CMP-2.2.1', title: 'Einstandskurs Berechnen',
    description:
      'Das System muss den durchschnittlichen Einstandskurs pro Position berechnen (FIFO-Methode) unter Beruecksichtigung von Nachkaeufen und Teilverkaeufen.\n\n' +
      '- Das System soll die FIFO-Methode (First-In-First-Out) gemaess deutschem Steuerrecht anwenden.\n' +
      '- Das System soll bei Teilverkaeufen die aeltesten Anschaffungskosten zuerst ausbuchen.\n' +
      '- Das System soll den Einstandskurs fuer die Renditeberechnung (CMP-3.1.1) und Steuerberechnung (FN-4.2.1.3) bereitstellen.',
    preconditions: [
      'Mindestens eine Kauf-Transaktion fuer die Position existiert.',
      'Transaktionshistorie ist vollstaendig (ggf. via CSV-Import ergaenzt).'
    ],
    behavior: [
      'System laedt alle Kauf- und Verkauf-Transaktionen fuer die Position chronologisch sortiert.',
      'System wendet FIFO an: Kaeufe werden in einer Queue verwaltet.',
      'Bei Verkauf: System entnimmt Stuecke aus der Queue (aelteste zuerst) und berechnet den realisierten Gewinn/Verlust.',
      'System berechnet den gewichteten Durchschnittskurs der verbleibenden Stuecke.',
      'System speichert den Einstandskurs und die verbleibende FIFO-Queue.'
    ],
    postconditions: [
      'Einstandskurs der Position ist berechnet und gespeichert.',
      'FIFO-Queue der verbleibenden Kaufposten ist aktuell.',
      'Realisierte Gewinne/Verluste aus Teilverkaeufen sind berechnet.'
    ],
    errors: [
      'Das System soll bei fehlender Transaktionshistorie den manuell eingegebenen Einstandskurs verwenden.',
      'Das System soll bei negativer Stueckzahl (mehr verkauft als gekauft) eine Warnung anzeigen und den Nutzer zur Korrektur auffordern.'
    ],
    acceptance: [
      '100 Stueck @ 50 EUR gekauft, dann 50 Stueck @ 60 EUR: Einstandskurs der 150 Stueck = 53.33 EUR.',
      'Verkauf von 80 Stueck (FIFO): Die ersten 100 werden zu 50 EUR ausgebucht.',
      'Einstandskurs steht fuer Renditeberechnung und Steuerberechnung bereit.',
      'Fehlende Historie fuehrt zu manuellem Einstandskurs-Modus.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-2.2.1.3', parent: 'CMP-2.2.1', title: 'Kapitalmassnahmen Verarbeiten',
    description:
      'Das System muss Splits, Reverse-Splits und Fusionen erkennen und Stueckzahl sowie Einstandskurs entsprechend anpassen.\n\n' +
      '- Das System soll Kapitalmassnahmen automatisch ueber einen Corporate-Actions-Feed erkennen.\n' +
      '- Das System soll das Split-Verhaeltnis auf Stueckzahl und Einstandskurs anwenden.\n' +
      '- Das System soll die Aenderung als Audit-Event protokollieren.',
    preconditions: [
      'Die betroffene Position existiert im Depot.',
      'Corporate-Actions-Feed ist konfiguriert und aktiv.',
      'Stueckzahl und Einstandskurs der Position sind bekannt.'
    ],
    behavior: [
      'System empfaengt Kapitalmassnahmen-Event (Split/Reverse-Split/Fusion) vom Feed.',
      'System identifiziert die betroffene Position anhand der ISIN.',
      'Bei Split (z.B. 1:3): System multipliziert Stueckzahl mit 3 und teilt Einstandskurs durch 3.',
      'Bei Reverse-Split (z.B. 10:1): System teilt Stueckzahl durch 10 und multipliziert Einstandskurs mit 10.',
      'Bei Fusion: System ersetzt alte ISIN durch neue ISIN und wendet das Umtauschverhaeltnis an.',
      'System protokolliert die Aenderung als Audit-Event mit vorherigen und neuen Werten.',
      'System invertiert den Rendite-Cache fuer die betroffene Position (FN-3.1.1.4).'
    ],
    postconditions: [
      'Stueckzahl und Einstandskurs der Position sind korrekt angepasst.',
      'Bei Fusion: Neue ISIN ist zugeordnet, alte ISIN ist deaktiviert.',
      'Audit-Event mit allen Details ist protokolliert.',
      'Rendite-Cache fuer die Position ist invalidiert.'
    ],
    errors: [
      'Das System soll bei unbekannter ISIN im Kapitalmassnahmen-Event die Aktion loggen und ueberspringen.',
      'Das System soll bei mehrdeutigem Umtauschverhaeltnis die Aktion als "Manuell pruefen" markieren.',
      'Das System soll bei Rundungsproblemen (Bruchteilstuecke) auf die naechste ganze Zahl abrunden und die Differenz als Cash-Ausgleich buchen.'
    ],
    acceptance: [
      'Split 1:3 bei 100 Stueck @ 90 EUR ergibt 300 Stueck @ 30 EUR.',
      'Reverse-Split 10:1 bei 1000 Stueck @ 5 EUR ergibt 100 Stueck @ 50 EUR.',
      'Fusion mit neuem ISIN ersetzt die alte ISIN korrekt.',
      'Audit-Log enthaelt alle Vorher-Nachher-Werte.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-2.2.1.4', parent: 'CMP-2.2.1', title: 'CSV Import',
    description:
      'Das System muss einen manuellen CSV-Import von Depot-Daten unterstuetzen. Format: ISIN;Stueckzahl;Kaufdatum;Kaufkurs;Waehrung.\n\n' +
      '- Das System soll das Hochladen einer CSV-Datei (max. 5 MB, UTF-8) ermoeglichen.\n' +
      '- Das System soll eine Vorschau der zu importierenden Daten anzeigen.\n' +
      '- Das System soll ungueltige Zeilen markieren und den Import der gueltigen Zeilen ermoeglichen.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Mindestens ein Depot ist erfasst.',
      'CSV-Datei entspricht dem vorgegebenen Format.'
    ],
    behavior: [
      'Nutzer waehlt eine CSV-Datei via Upload-Dialog aus.',
      'System validiert Dateigroesse (<= 5 MB) und Encoding (UTF-8).',
      'System parst die CSV-Datei zeilenweise mit Semikolon als Trennzeichen.',
      'Pro Zeile: System validiert ISIN-Format, Stueckzahl > 0, Kaufdatum im ISO-Format, Kaufkurs > 0, Waehrung (ISO 4217).',
      'System zeigt eine Vorschau-Tabelle: gueltige Zeilen gruen, ungueltige rot mit Fehlergrund.',
      'Nutzer bestaetigt den Import (nur gueltige Zeilen werden importiert).',
      'System legt Kauf-Transaktionen an und aktualisiert den Einstandskurs (FN-2.2.1.2).'
    ],
    postconditions: [
      'Alle gueltigen CSV-Zeilen sind als Kauf-Transaktionen importiert.',
      'Einstandskurse der betroffenen Positionen sind aktualisiert.',
      'Ungueltige Zeilen sind nicht importiert und dem Nutzer aufgelistet.'
    ],
    errors: [
      'Das System soll bei Dateigroesse > 5 MB den Upload ablehnen mit Meldung "Datei zu gross (max. 5 MB)".',
      'Das System soll bei falschem Encoding die Meldung "Bitte UTF-8 kodierte Datei verwenden" anzeigen.',
      'Das System soll bei komplett ungueltiger Datei (0 gueltige Zeilen) den Import verweigern.'
    ],
    acceptance: [
      'CSV mit 5 gueltigen Zeilen importiert 5 Kauf-Transaktionen.',
      'CSV mit 3 gueltigen und 2 ungueltigen Zeilen importiert nur die 3 gueltigen.',
      'Ungueltige ISIN (zu kurz) wird in der Vorschau rot markiert.',
      'Datei ueber 5 MB wird abgelehnt.',
      'Vorschau zeigt korrekte Daten vor dem Import.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-3: Performance Tracking
  // ═══════════════════════════════════════════════════════════

  // --- CMP-3.1.1: Rendite Rechner ---
  {
    id: 'FN-3.1.1.1', parent: 'CMP-3.1.1', title: 'TTWROR Berechnung',
    description:
      'Das System muss die True Time-Weighted Rate of Return fuer jede Position berechnen. Cash-Flows (Einzahlungen, Entnahmen) werden neutralisiert, sodass nur die Investmentleistung gemessen wird.\n\n' +
      '- Das System soll die TTWROR gemaess Global Investment Performance Standards (GIPS) berechnen.\n' +
      '- Das System soll Sub-Perioden an jedem Cash-Flow-Zeitpunkt bilden.\n' +
      '- Das System soll die TTWROR fuer beliebige Zeitraeume (1M, 3M, 6M, 1J, 3J, YTD, Gesamt) berechnen.',
    preconditions: [
      'Mindestens eine Position mit Kursdaten existiert.',
      'Transaktionshistorie (Kaeufe, Verkaeufe, Dividenden) ist verfuegbar.'
    ],
    behavior: [
      'System laedt die Kurszeitreihe und alle Cash-Flows der Position.',
      'System bildet Sub-Perioden: Jeder Cash-Flow erzeugt eine neue Sub-Periode.',
      'Pro Sub-Periode: System berechnet die Halteperioden-Rendite (HPR = Endwert / Anfangswert - 1).',
      'System verkettet alle HPRs multiplikativ: TTWROR = (1+HPR1) * (1+HPR2) * ... - 1.',
      'System annualisiert das Ergebnis bei Zeitraeumen > 1 Jahr: TTWROR_ann = (1+TTWROR)^(365/Tage) - 1.',
      'System rundet auf 2 Dezimalstellen und speichert das Ergebnis.'
    ],
    postconditions: [
      'TTWROR ist fuer die Position in allen konfigurierten Zeitraeumen berechnet.',
      'Das Ergebnis ist im Rendite-Cache (FN-3.1.1.4) gespeichert.',
      'Die Berechnung ist GIPS-konform.'
    ],
    errors: [
      'Das System soll bei fehlendem Kursdatum eine lineare Interpolation durchfuehren.',
      'Das System soll bei Division durch Null (Anfangswert = 0) die Sub-Periode ueberspringen.',
      'Das System soll bei weniger als 2 Datenpunkten "n/a" zurueckgeben.'
    ],
    acceptance: [
      'Position mit 3 Sub-Perioden (+5%, -2%, +8%) ergibt TTWROR = 11.16%.',
      'Cash-Flows beeinflussen die TTWROR nicht (nur die Investmentleistung).',
      'Annualisierung bei 730 Tagen und 20% Gesamt ergibt ca. 9.54% p.a.',
      'Weniger als 2 Datenpunkte ergeben "n/a".'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.1.1.2', parent: 'CMP-3.1.1', title: 'MWR Berechnung',
    description:
      'Das System muss die geldgewichtete Rendite (Modified Dietz) berechnen, die den Zeitpunkt und die Hoehe der Cash-Flows beruecksichtigt.\n\n' +
      '- Das System soll die Modified-Dietz-Methode anwenden (vereinfachte IRR-Naeherung).\n' +
      '- Das System soll die MWR als Ergaenzung zur TTWROR anzeigen (Anlegerperspektive).\n' +
      '- Das System soll den Unterschied zur TTWROR dem Nutzer erklaeren (Tooltip).',
    preconditions: [
      'Mindestens eine Position mit Kursdaten und Cash-Flows existiert.',
      'Anfangswert und Endwert der Position sind bekannt.'
    ],
    behavior: [
      'System laedt Anfangswert, Endwert und alle Cash-Flows mit Datum.',
      'System berechnet pro Cash-Flow den Gewichtungsfaktor: w_i = (T - t_i) / T wobei T = Gesamttage, t_i = Tage seit Start.',
      'System berechnet den gewichteten Cash-Flow: WCF = Summe(CF_i * w_i).',
      'System berechnet Modified Dietz: MWR = (Endwert - Anfangswert - Summe_CF) / (Anfangswert + WCF).',
      'System annualisiert bei Zeitraum > 1 Jahr.',
      'System speichert das Ergebnis und zeigt es neben der TTWROR an.'
    ],
    postconditions: [
      'MWR ist fuer die Position berechnet und gespeichert.',
      'MWR wird parallel zur TTWROR angezeigt.',
      'Tooltip erklaert den Unterschied beider Methoden.'
    ],
    errors: [
      'Das System soll bei Anfangswert + WCF = 0 die MWR als "n/a" ausweisen.',
      'Das System soll bei extrem hoher MWR (>1000%) eine Warnung "Bitte Daten pruefen" anzeigen.'
    ],
    acceptance: [
      'Anfangswert 10000, Endwert 11500, Einzahlung 1000 nach 180/365 Tagen: MWR korrekt berechnet.',
      'MWR und TTWROR werden nebeneinander angezeigt.',
      'Tooltip erklaert den Unterschied verstaendlich.',
      'Division durch Null ergibt "n/a".'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.1.1.3', parent: 'CMP-3.1.1', title: 'Dividenden Einbeziehen',
    description:
      'Das System muss Dividenden und Ausschuettungen in die Renditeberechnung einbeziehen (Total Return statt Price Return).\n\n' +
      '- Das System soll Dividenden als Cash-Flow-Ereignis in der Renditeberechnung beruecksichtigen.\n' +
      '- Das System soll zwischen Brutto- und Netto-Dividende (nach Quellensteuer) unterscheiden.\n' +
      '- Das System soll bei thesaurierenden Fonds die Wiederanlage automatisch beruecksichtigen.',
    preconditions: [
      'Dividenden-/Ausschuettungsdaten sind verfuegbar (via Sync oder manuell).',
      'Renditeberechnung (TTWROR/MWR) ist implementiert.'
    ],
    behavior: [
      'System identifiziert alle Dividenden-Events fuer eine Position.',
      'System klassifiziert: ausschuettend (Cash-Dividende) vs. thesaurierend (Wiederanlage).',
      'Bei ausschuettender Dividende: System fuegt die Netto-Dividende als Cash-Flow hinzu.',
      'Bei thesaurierendem Fonds: System passt den NAV automatisch an (keine separate Cash-Flow-Buchung).',
      'System berechnet Total Return = Price Return + Dividend Return.',
      'System zeigt Price Return und Total Return separat an.'
    ],
    postconditions: [
      'Total Return beruecksichtigt alle Dividenden und Ausschuettungen.',
      'Price Return und Total Return sind separat verfuegbar.',
      'Thesaurierende Fonds werden korrekt behandelt.'
    ],
    errors: [
      'Das System soll bei fehlenden Dividendendaten den Price Return als Fallback verwenden.',
      'Das System soll bei doppelter Dividendenbuchung das Duplikat erkennen und ueberspringen.'
    ],
    acceptance: [
      'Position mit 5% Kursgewinn und 2% Dividendenrendite zeigt Total Return von ca. 7%.',
      'Thesaurierender Fonds zeigt keinen separaten Dividenden-Cash-Flow.',
      'Brutto- und Netto-Dividende werden korrekt unterschieden.',
      'Price Return und Total Return sind separat sichtbar.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.1.1.4', parent: 'CMP-3.1.1', title: 'Rendite Cache',
    description:
      'Das System muss berechnete Renditen cachen und nur bei neuen Transaktionen inkrementell aktualisieren. Cache-Invalidierung erfolgt gezielt pro Position.\n\n' +
      '- Das System soll Redis als Cache-Backend verwenden.\n' +
      '- Das System soll Cache-Keys nach dem Schema user:{id}:position:{isin}:rendite:{zeitraum} strukturieren.\n' +
      '- Das System soll TTL auf 24 Stunden setzen als Sicherheitsnetz.',
    preconditions: [
      'Redis-Instanz ist verfuegbar und erreichbar.',
      'Renditeberechnung (TTWROR/MWR) ist implementiert.'
    ],
    behavior: [
      'Bei Rendite-Abfrage: System prueft zunaechst den Redis-Cache.',
      'Cache-Hit: System liefert den gecachten Wert sofort zurueck.',
      'Cache-Miss: System berechnet die Rendite, speichert das Ergebnis im Cache und liefert zurueck.',
      'Bei neuer Transaktion/Kursupdate: System invalidiert den Cache-Key fuer die betroffene Position.',
      'Bei Kapitalmassnahme (FN-2.2.1.3): System invalidiert den Cache fuer die betroffene Position.',
      'TTL von 24 Stunden als automatische Reinvalidierung.'
    ],
    postconditions: [
      'Berechnete Renditen sind im Cache gespeichert.',
      'Cache ist bei Datenänderungen invalidiert.',
      'Veraltete Eintraege verfallen nach 24 Stunden automatisch.'
    ],
    errors: [
      'Das System soll bei Redis-Ausfall direkt berechnen (Bypass-Cache) und das Ergebnis ohne Cache zurueckgeben.',
      'Das System soll bei Cache-Korruption den betroffenen Key loeschen und neu berechnen.',
      'Das System soll Redis-Verbindungsfehler loggen aber keine Nutzerfehler anzeigen.'
    ],
    acceptance: [
      'Zweite Abfrage der gleichen Rendite wird aus dem Cache bedient (Antwortzeit < 10ms).',
      'Neue Transaktion invalidiert den Cache fuer die betroffene Position.',
      'Cache-Eintrag verfaellt nach 24 Stunden.',
      'Redis-Ausfall fuehrt zu korrekter Berechnung (nur langsamer).'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-3.2.1: Portfolio Aggregator ---
  {
    id: 'FN-3.2.1.1', parent: 'CMP-3.2.1', title: 'Gewichtete Gesamtrendite',
    description:
      'Das System muss die kapitalgewichtete Gesamtrendite ueber alle Positionen und Depots berechnen.\n\n' +
      '- Das System soll jede Positionsrendite mit ihrem Kapitalanteil am Gesamtportfolio gewichten.\n' +
      '- Das System soll depotuebergreifend aggregieren.\n' +
      '- Das System soll die Gesamtrendite fuer die gleichen Zeitraeume wie Einzelrenditen berechnen (1M, 3M, 6M, 1J, 3J, YTD, Gesamt).',
    preconditions: [
      'Mindestens zwei Positionen mit berechneten Renditen existieren.',
      'Aktuelle Marktwerte aller Positionen sind verfuegbar.'
    ],
    behavior: [
      'System laedt alle Positionen mit ihren aktuellen Marktwerten.',
      'System berechnet den Kapitalanteil jeder Position: Gewicht_i = Marktwert_i / Gesamtmarktwert.',
      'System laedt die TTWROR jeder Position fuer den gewuenschten Zeitraum.',
      'System berechnet die gewichtete Gesamtrendite: R_gesamt = Summe(Gewicht_i * TTWROR_i).',
      'System zeigt die Gesamtrendite prominent im Dashboard an.'
    ],
    postconditions: [
      'Gewichtete Gesamtrendite ist berechnet und im Dashboard sichtbar.',
      'Einzelgewichte sind nachvollziehbar (Drill-Down moeglich).'
    ],
    errors: [
      'Das System soll bei fehlendem Marktwert einer Position diese aus der Gewichtung ausschliessen und eine Warnung anzeigen.',
      'Das System soll bei nur einer Position die Einzelrendite als Gesamtrendite verwenden.'
    ],
    acceptance: [
      'Portfolio mit 60% Position A (+10%) und 40% Position B (+5%) ergibt Gesamtrendite 8%.',
      'Depotuebergreifende Berechnung funktioniert korrekt.',
      'Fehlender Marktwert schliesst Position aus mit Warnung.',
      'Zeitraum-Umschaltung (1M/3M/1J) berechnet korrekte Gesamtrendite.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.2.1.2', parent: 'CMP-3.2.1', title: 'Asset Klassen Aufschluesselung',
    description:
      'Das System muss die Rendite nach Asset-Klasse (Aktien, Anleihen, Immobilien, Cash, Sonstige) getrennt ausweisen.\n\n' +
      '- Das System soll die Kategorisierung aus FN-1.1.1.3 verwenden.\n' +
      '- Das System soll die gewichtete Rendite pro Asset-Klasse berechnen.\n' +
      '- Das System soll die Aufschluesselung als sortierte Tabelle und optional als Chart anzeigen.',
    preconditions: [
      'Alle Positionen sind einer Asset-Klasse zugeordnet (FN-1.1.1.3).',
      'Renditen der Einzelpositionen sind berechnet.'
    ],
    behavior: [
      'System gruppiert alle Positionen nach Asset-Klasse.',
      'Pro Asset-Klasse: System berechnet die gewichtete Rendite (analog FN-3.2.1.1).',
      'Pro Asset-Klasse: System berechnet den Kapitalanteil am Gesamtportfolio.',
      'System sortiert die Asset-Klassen nach Kapitalanteil absteigend.',
      'System zeigt eine Tabelle: Asset-Klasse, Anteil (%), Rendite (%), Marktwert (EUR).'
    ],
    postconditions: [
      'Rendite pro Asset-Klasse ist berechnet.',
      'Tabelle ist sortiert und vollstaendig.',
      'Summe aller Anteile ergibt 100%.'
    ],
    errors: [
      'Das System soll bei nicht zugeordneter Position die Klasse "Sonstige" verwenden.',
      'Das System soll bei leerer Asset-Klasse (0 Positionen) diese aus der Tabelle ausblenden.'
    ],
    acceptance: [
      'Aktien (60%, +12%), Anleihen (30%, +3%), Cash (10%, +0.5%) werden korrekt aufgeschluesselt.',
      'Summe der Anteile ergibt 100%.',
      'Nicht zugeordnete Positionen erscheinen unter "Sonstige".',
      'Leere Asset-Klassen werden ausgeblendet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.2.1.3', parent: 'CMP-3.2.1', title: 'Netto Rendite Berechnung',
    description:
      'Das System muss die Netto-Rendite nach Steuern berechnen: Abgeltungssteuer 25% + Soli 5,5% = 26,375% auf realisierte Gewinne, Sparerpauschbetrag 1000 EUR beruecksichtigt.\n\n' +
      '- Das System soll nur auf realisierte Gewinne (Verkaeufe, Dividenden) Steuern anwenden.\n' +
      '- Das System soll den Sparerpauschbetrag (1000 EUR Einzelperson / 2000 EUR Ehepaare) abziehen.\n' +
      '- Das System soll Kirchensteuer optional beruecksichtigen (8% oder 9% je nach Bundesland).',
    preconditions: [
      'Brutto-Rendite ist berechnet.',
      'Realisierte Gewinne und Dividenden sind bekannt.',
      'Steuerprofil des Nutzers (Sparerpauschbetrag, Kirchensteuer) ist konfiguriert.'
    ],
    behavior: [
      'System ermittelt die realisierten Gewinne im Betrachtungszeitraum.',
      'System zieht den Sparerpauschbetrag ab (max. 1000 EUR oder 2000 EUR).',
      'Bei positivem steuerpflichtigem Gewinn: System berechnet Abgeltungssteuer (25%).',
      'System berechnet Solidaritaetszuschlag (5,5% auf die Abgeltungssteuer).',
      'Optional: System berechnet Kirchensteuer (8% oder 9% auf die Abgeltungssteuer).',
      'System berechnet Netto-Rendite: Brutto-Gewinn - Gesamtsteuer.',
      'System zeigt Brutto und Netto nebeneinander an.'
    ],
    postconditions: [
      'Netto-Rendite nach Steuern ist berechnet.',
      'Steuerdetails (Abgeltungssteuer, Soli, ggf. KiSt) sind aufgeschluesselt.',
      'Sparerpauschbetrag ist korrekt beruecksichtigt.'
    ],
    errors: [
      'Das System soll bei fehlendem Steuerprofil die Standardwerte (1000 EUR, keine KiSt) verwenden.',
      'Das System soll bei negativem realisierten Gewinn keine Steuer berechnen (Verlust = 0% Steuer).',
      'Das System soll bei Verlustverrechnung den Verlustvortrag beruecksichtigen (falls implementiert).'
    ],
    acceptance: [
      'Realisierter Gewinn 5000 EUR: Steuer = (5000-1000) * 0.26375 = 1055 EUR.',
      'Sparerpauschbetrag 2000 EUR bei Ehepaaren: Steuer = (5000-2000) * 0.26375 = 791.25 EUR.',
      'Negativer realisierter Gewinn: Steuer = 0 EUR.',
      'Kirchensteuer 9% ergibt: 4000 * 0.25 * 0.09 = 90 EUR zusaetzlich.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.2.1.4', parent: 'CMP-3.2.1', title: 'Soll Ist Vergleich',
    description:
      'Das System muss die Ist-Rendite mit der Ziel-Rendite (abgeleitet aus Risikoklasse) vergleichen und die Abweichung in Prozentpunkten und als Ampelfarbe anzeigen.\n\n' +
      '- Das System soll die Ziel-Rendite aus der Risikoklasse (CMP-1.3.1) ableiten (z.B. konservativ = 3-4% p.a.).\n' +
      '- Das System soll die Abweichung farblich kodieren: gruen (>= Ziel), gelb (-2pp bis Ziel), rot (< -2pp).\n' +
      '- Das System soll den Vergleich pro Zeitraum und Gesamt anzeigen.',
    preconditions: [
      'Ist-Rendite (TTWROR) ist berechnet.',
      'Risikoklasse des Nutzers ist zugeordnet.'
    ],
    behavior: [
      'System ermittelt die Ziel-Rendite basierend auf der Risikoklasse des Nutzers.',
      'System laedt die Ist-Rendite (TTWROR) fuer den gewaehlten Zeitraum.',
      'System berechnet die Abweichung: Delta = Ist - Soll (in Prozentpunkten).',
      'System bestimmt die Ampelfarbe: gruen (Delta >= 0), gelb (-2 <= Delta < 0), rot (Delta < -2).',
      'System zeigt Soll, Ist, Delta und Ampelfarbe im Dashboard an.'
    ],
    postconditions: [
      'Soll-Ist-Vergleich ist visuell im Dashboard dargestellt.',
      'Ampelfarbe gibt sofortige Handlungsorientierung.'
    ],
    errors: [
      'Das System soll bei fehlender Risikoklasse die Meldung "Bitte Risikoprofil ausfuellen" anzeigen.',
      'Das System soll bei nicht konfigurierten Ziel-Rendite-Mappings einen Fallback von 5% p.a. verwenden.'
    ],
    acceptance: [
      'Risikoklasse "ausgewogen" mit Ziel 5% und Ist 7% ergibt Delta +2pp (gruen).',
      'Ist 4% bei Ziel 5% ergibt Delta -1pp (gelb).',
      'Ist 2% bei Ziel 5% ergibt Delta -3pp (rot).',
      'Fehlende Risikoklasse zeigt Hinweis zum Ausfuellen.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-3.3.1: Benchmark Vergleichsmodul ---
  {
    id: 'FN-3.3.1.1', parent: 'CMP-3.3.1', title: 'Benchmark Daten Laden',
    description:
      'Das System muss taeglich Schlusskurse fuer DAX, MSCI World, MSCI Europe, S&P 500 und HVPI-Inflation von einem externen Datenanbieter laden.\n\n' +
      '- Das System soll einen taeglichen Cron-Job (20:00 UTC, nach Boersenschluss) ausfuehren.\n' +
      '- Das System soll die Daten ueber eine REST-API des Datenanbieters abrufen.\n' +
      '- Das System soll historische Daten fuer mindestens 10 Jahre vorhalten.',
    preconditions: [
      'Datenanbieter-API ist konfiguriert (API-Key, Endpoint).',
      'Netzwerkverbindung zum Datenanbieter besteht.'
    ],
    behavior: [
      'Cron-Job startet taeglich um 20:00 UTC.',
      'System ruft Schlusskurse fuer die 5 konfigurierten Benchmark-Indizes ab.',
      'System validiert die empfangenen Daten (Datum, Kurs > 0, keine Duplikate).',
      'System speichert die Schlusskurse in der Zeitreihen-Tabelle.',
      'System aktualisiert den lastSync-Timestamp fuer Benchmark-Daten.',
      'An Wochenenden/Feiertagen: System ueberspringt den Abruf (kein Boersentag).'
    ],
    postconditions: [
      'Aktuelle Schlusskurse aller 5 Indizes sind gespeichert.',
      'Zeitreihendaten sind lueckenlos fuer die letzten 10 Jahre.',
      'Duplikate werden vermieden.'
    ],
    errors: [
      'Das System soll bei API-Fehler den letzten bekannten Kurs beibehalten und den Abruf in 2 Stunden wiederholen.',
      'Das System soll bei unvollstaendigen Daten (nur 3 von 5 Indizes) die vorhandenen speichern und die fehlenden loggen.',
      'Das System soll bei Kurs = 0 oder negativem Kurs den Datensatz verwerfen und warnen.'
    ],
    acceptance: [
      'DAX-Schlusskurs wird taeglich um 20:00 UTC abgerufen und gespeichert.',
      'Samstag/Sonntag wird uebersprungen.',
      'API-Fehler fuehrt zu Retry in 2 Stunden.',
      'Historische Daten reichen mindestens 10 Jahre zurueck.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.3.1.2', parent: 'CMP-3.3.1', title: 'Zeitreihen Normalisieren',
    description:
      'Das System muss Portfolio- und Benchmark-Zeitreihen auf einen gemeinsamen Startzeitpunkt normalisieren (Basis 100).\n\n' +
      '- Das System soll den Normalisierungszeitpunkt auf den Startpunkt des gewaehlten Zeitraums setzen.\n' +
      '- Das System soll die Normalisierung dynamisch bei Zeitraum-Aenderung neu berechnen.\n' +
      '- Das System soll fehlende Datenpunkte per Forward-Fill interpolieren.',
    preconditions: [
      'Portfolio-Zeitreihe und mindestens eine Benchmark-Zeitreihe sind verfuegbar.',
      'Der gewaehlte Zeitraum ist definiert.'
    ],
    behavior: [
      'System laedt die Portfolio-Wertentwicklung als Zeitreihe.',
      'System laedt die Benchmark-Zeitreihe(n) fuer den gleichen Zeitraum.',
      'System setzt den Startwert beider Zeitreihen auf Basis 100.',
      'Pro Tag: Normalisierter Wert = (Tageswert / Startwert) * 100.',
      'Bei fehlenden Werten (Wochenende, Feiertag): Forward-Fill (letzter bekannter Wert).',
      'System gibt beide normalisierten Zeitreihen an das Chart-Rendering zurueck.'
    ],
    postconditions: [
      'Beide Zeitreihen beginnen bei Basis 100.',
      'Zeitreihen sind auf den gleichen Zeitraum beschraenkt.',
      'Fehlende Datenpunkte sind interpoliert.'
    ],
    errors: [
      'Das System soll bei fehlendem Startwert den naechsten verfuegbaren Wert verwenden.',
      'Das System soll bei komplett fehlender Benchmark-Zeitreihe "Benchmark nicht verfuegbar" anzeigen.'
    ],
    acceptance: [
      'Portfolio-Start 50000 EUR und Benchmark-Start 15000 Punkte werden beide auf 100 normalisiert.',
      'Zeitraum-Wechsel von 1M auf 1J berechnet die Normalisierung neu.',
      'Samstag/Sonntag-Werte werden korrekt forward-filled.',
      'Fehlende Benchmark zeigt Hinweismeldung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.3.1.3', parent: 'CMP-3.3.1', title: 'Outperformance Berechnen',
    description:
      'Das System muss die Outperformance/Underperformance als Differenz in Prozentpunkten und als absolute Eurobetraege berechnen.\n\n' +
      '- Das System soll die Outperformance relativ (Prozentpunkte) und absolut (EUR) darstellen.\n' +
      '- Das System soll die Outperformance pro Zeitraum berechnen.\n' +
      '- Das System soll die Outperformance als eigenstaendiges Chart (Bar-Chart) anzeigen koennen.',
    preconditions: [
      'Portfolio-Rendite und Benchmark-Rendite sind fuer den gleichen Zeitraum berechnet.',
      'Anfangskapital des Portfolios ist bekannt.'
    ],
    behavior: [
      'System laedt die Portfolio-Rendite (TTWROR) und die Benchmark-Rendite fuer den Zeitraum.',
      'System berechnet relative Outperformance: Delta_pp = Portfolio_Rendite - Benchmark_Rendite (Prozentpunkte).',
      'System berechnet absolute Outperformance: Delta_EUR = Anfangskapital * (Portfolio_Rendite - Benchmark_Rendite).',
      'System klassifiziert: Outperformance (Delta > 0), Underperformance (Delta < 0), Gleichlauf (Delta = 0).',
      'System zeigt das Ergebnis mit Farb-Indikator: gruen/rot.'
    ],
    postconditions: [
      'Outperformance ist relativ und absolut berechnet.',
      'Ergebnis ist farblich kodiert dargestellt.'
    ],
    errors: [
      'Das System soll bei fehlender Benchmark-Rendite den Vergleich nicht anzeigen und "Benchmark nicht verfuegbar" melden.',
      'Das System soll bei identischen Zeitraeumen aber unterschiedlichen Datendichten die Ergebnisse trotzdem berechnen (Forward-Fill).'
    ],
    acceptance: [
      'Portfolio +10%, Benchmark +7%: Outperformance = +3pp (gruen).',
      'Portfolio +5%, Benchmark +8%: Underperformance = -3pp (rot).',
      'Absolute Outperformance bei 100000 EUR und +3pp = 3000 EUR.',
      'Fehlende Benchmark zeigt "nicht verfuegbar".'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-3.3.1.4', parent: 'CMP-3.3.1', title: 'Custom Benchmark',
    description:
      'Das System muss dem Nutzer ermoeglichen, einen eigenen Benchmark aus gewichteten Indizes zusammenzustellen (z.B. 60% MSCI World + 40% Euro-Anleihen).\n\n' +
      '- Das System soll bis zu 5 Indizes in einem Custom Benchmark kombinieren.\n' +
      '- Das System soll die Gewichte als Prozent eingeben lassen (Summe = 100%).\n' +
      '- Das System soll den Custom Benchmark als synthetische Zeitreihe berechnen.',
    preconditions: [
      'Mindestens 2 Index-Zeitreihen sind verfuegbar.',
      'Nutzer hat das Benchmark-Modul aufgerufen.'
    ],
    behavior: [
      'Nutzer klickt "Custom Benchmark erstellen".',
      'System zeigt verfuegbare Indizes als Auswahlliste.',
      'Nutzer waehlt 2-5 Indizes und vergibt Gewichte (Prozent).',
      'System validiert: Summe der Gewichte = 100%.',
      'System berechnet die synthetische Zeitreihe: Wert_t = Summe(Gewicht_i * normalisierteRendite_i_t).',
      'System speichert den Custom Benchmark unter einem vom Nutzer vergebenen Namen.',
      'System zeigt den Custom Benchmark in der Benchmark-Auswahl an.'
    ],
    postconditions: [
      'Custom Benchmark ist gespeichert und in der Benchmark-Auswahl verfuegbar.',
      'Synthetische Zeitreihe ist berechnet und fuer Vergleich nutzbar.'
    ],
    errors: [
      'Das System soll bei Gewichtssumme != 100% die Meldung "Summe der Gewichte muss 100% ergeben" anzeigen.',
      'Das System soll bei weniger als 2 Indizes die Meldung "Mindestens 2 Indizes auswaehlen" anzeigen.',
      'Das System soll bei mehr als 5 Indizes die Auswahl auf 5 begrenzen.'
    ],
    acceptance: [
      '60% MSCI World + 40% Euro-Anleihen ergibt korrekte synthetische Zeitreihe.',
      'Gewichtsumme 110% wird abgelehnt.',
      'Custom Benchmark erscheint in der Benchmark-Auswahl.',
      'Custom Benchmark kann fuer Outperformance-Vergleich genutzt werden.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  }
];

const result = processBatch(data, 'Batch-1 (SOL 1-3)');
console.log(JSON.stringify(result));
