// fn-batch-3.cjs — SOL 7-10 (32 FN specs)
const { processBatch } = require('./fn-processor.cjs');

const data = [
  // ═══════════════════════════════════════════════════════════
  // SOL-7: Produktempfehlungen (8 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-7.1.1: Produktkatalog Suchmaschine ---
  {
    id: 'FN-7.1.1.1', parent: 'CMP-7.1.1', title: 'Facettierte Suche',
    description:
      'Das System muss eine facettierte Suche ueber den Produktkatalog bieten: Filter nach Asset-Klasse, Risikoklasse (1-7), TER-Range, Rendite-Range, Fondsvolumen.\n\n' +
      '- Das System soll multiple Filter kombinierbar machen (AND-Verknuepfung).\n' +
      '- Das System soll die Ergebnis-Anzahl pro Facette anzeigen (Count-Badge).\n' +
      '- Das System soll die Ergebnisse sortierbar machen (nach Rendite, TER, Risikoklasse).',
    preconditions: [
      'Produktkatalog ist befuellt und indexiert.',
      'Nutzer hat den Produktkatalog geoeffnet.'
    ],
    behavior: [
      'System zeigt Facetten-Sidebar: Asset-Klasse (Checkboxen), Risikoklasse (Range-Slider 1-7), TER (Range 0-3%), Rendite (Range), Fondsvolumen (Range).',
      'Nutzer aktiviert einen oder mehrere Filter.',
      'System filtert die Ergebnisse serverseitig (AND-Verknuepfung aller aktiven Filter).',
      'System aktualisiert die Count-Badges pro Facette (verbleibende Treffer).',
      'System zeigt die gefilterten Produkte als Tabelle/Karten-Liste.',
      'Nutzer kann die Ergebnisse sortieren (Klick auf Spaltenheader).',
      'System speichert die Filterkombination im URL-Query (Shareable).'
    ],
    postconditions: [
      'Gefilterte Produktliste ist angezeigt.',
      'Count-Badges sind aktualisiert.',
      'Filter sind im URL-Query persistiert.'
    ],
    errors: [
      'Das System soll bei 0 Ergebnissen die Meldung "Keine Produkte gefunden — bitte Filter anpassen" anzeigen.',
      'Das System soll bei Suchfehler die Meldung "Suche fehlgeschlagen" und einen Retry-Button anzeigen.'
    ],
    acceptance: [
      'Filter "Aktien" + "Risikoklasse 4-5" + "TER < 0.5%" liefert passende Ergebnisse.',
      'Count-Badge zeigt korrekte Trefferzahl pro Facette.',
      'Sortierung nach TER aufsteigend funktioniert.',
      '0 Ergebnisse zeigen Hinweismeldung.',
      'Filter sind im URL-Query enthalten und bei Reload erhalten.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-7.1.1.2', parent: 'CMP-7.1.1', title: 'Typeahead Suche',
    description:
      'Das System muss bei Eingabe in das Suchfeld Vorschlaege anzeigen: Produktname und ISIN mit Highlighting des Suchbegriffs. Debounce: 200ms, max. 10 Vorschlaege.\n\n' +
      '- Das System soll Suche nach Produktname und ISIN unterstuetzen.\n' +
      '- Das System soll den Suchbegriff in den Vorschlaegen hervorheben (Bold).\n' +
      '- Das System soll die Vorschlaege per Tastatur navigierbar machen.',
    preconditions: [
      'Produktkatalog ist indexiert.',
      'Suchfeld ist fokussiert.'
    ],
    behavior: [
      'Nutzer beginnt zu tippen (mindestens 2 Zeichen).',
      'System wartet 200ms (Debounce) nach letzter Eingabe.',
      'System sucht im Index nach Produktname und ISIN (Prefix-Match oder Fuzzy-Match).',
      'System zeigt maximal 10 Vorschlaege als Dropdown-Liste.',
      'System hebt den Suchbegriff in den Vorschlaegen hervor (z.B. "MSCI **World** ETF").',
      'Nutzer kann per Pfeiltasten navigieren und per Enter auswaehlen.',
      'Bei Auswahl: System navigiert zur Produkt-Detailansicht (FN-7.1.1.3).'
    ],
    postconditions: [
      'Vorschlaege sind angezeigt (max. 10).',
      'Gewaehltes Produkt fuehrt zur Detailansicht.'
    ],
    errors: [
      'Das System soll bei keinem Match die Meldung "Keine Vorschlaege" anzeigen.',
      'Das System soll bei API-Timeout den letzten bekannten Vorschlag beibehalten.',
      'Das System soll bei leerer Eingabe (< 2 Zeichen) den Dropdown schliessen.'
    ],
    acceptance: [
      'Eingabe "MSCI" zeigt Vorschlaege mit "MSCI World", "MSCI Europe" etc.',
      'Eingabe "DE000ETF" zeigt ISIN-basierte Vorschlaege.',
      'Highlighting des Suchbegriffs ist sichtbar.',
      'Tastatur-Navigation (Pfeiltasten + Enter) funktioniert.',
      'Debounce verhindert Anfragen bei schnellem Tippen.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-7.1.1.3', parent: 'CMP-7.1.1', title: 'Produkt Detailansicht',
    description:
      'Das System muss fuer jedes Produkt ein Factsheet anzeigen: Name, ISIN, WKN, Emittent, TER, Rendite 1/3/5J, Risikoklasse, Fondsprofil, ESG-Rating.\n\n' +
      '- Das System soll alle verfuegbaren Produktdaten strukturiert anzeigen.\n' +
      '- Das System soll die Rendite als Chart (1/3/5J Balkendiagramm) visualisieren.\n' +
      '- Das System soll einen "Zum Vergleich hinzufuegen"-Button bieten.',
    preconditions: [
      'Nutzer hat ein Produkt ausgewaehlt.',
      'Produktdaten sind im Katalog verfuegbar.'
    ],
    behavior: [
      'System laedt die vollstaendigen Produktdaten (Name, ISIN, WKN, Emittent, TER, Renditen, Risikoklasse, ESG-Rating).',
      'System zeigt die Stammdaten als strukturierte Karte.',
      'System rendert Rendite-Balkendiagramm (1J, 3J, 5J).',
      'System zeigt die Risikoklasse als nummerische Skala (1-7) mit Hervorhebung.',
      'System zeigt den ESG-Rating-Badge (falls verfuegbar).',
      'System bietet Buttons: "Zum Vergleich hinzufuegen" und "Empfehlung anfordern".'
    ],
    postconditions: [
      'Produkt-Detailansicht ist vollstaendig gerendert.',
      'Alle verfuegbaren Datenpunkte sind angezeigt.'
    ],
    errors: [
      'Das System soll bei fehlenden Einzeldaten (z.B. kein 5J-Rendite) das Feld als "n/a" anzeigen.',
      'Das System soll bei Ladefehler eine Fehlermeldung "Produkt konnte nicht geladen werden" anzeigen.'
    ],
    acceptance: [
      'Factsheet zeigt Name, ISIN, WKN, Emittent, TER korrekt.',
      'Rendite-Chart zeigt 1J, 3J, 5J als Balken.',
      'ESG-Rating wird als Badge angezeigt (falls vorhanden).',
      'Fehlende 5J-Rendite zeigt "n/a".',
      '"Zum Vergleich"-Button fuegt Produkt zur Vergleichsliste hinzu.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-7.1.1.4', parent: 'CMP-7.1.1', title: 'Mandantenfilter',
    description:
      'Das System muss sicherstellen, dass nur Produkte angezeigt werden, die fuer den aktuellen Mandanten freigeschaltet sind.\n\n' +
      '- Das System soll die Produktfreigabe mandantenspezifisch verwalten.\n' +
      '- Das System soll den Mandantenfilter transparent anwenden (kein UI-Element noetig).\n' +
      '- Das System soll bei jedem API-Call den Mandantenkontext als Filter mitgeben.',
    preconditions: [
      'Nutzer ist authentifiziert und einem Mandanten zugeordnet.',
      'Produktfreigabe-Liste ist fuer den Mandanten konfiguriert.'
    ],
    behavior: [
      'Bei jeder Produktsuche/Abfrage: System extrahiert die Mandanten-ID aus dem JWT-Token.',
      'System fuegt den Mandantenfilter als WHERE-Klausel in die Datenbankabfrage ein.',
      'Nur freigeschaltete Produkte (mandant_products.mandant_id = aktuelle_ID) werden zurueckgegeben.',
      'Der Filter ist fuer den Nutzer unsichtbar (keine zusaetzliche UI-Interaktion).',
      'Admin kann die Produktfreigabe pro Mandant im Verwaltungsmodul pflegen.'
    ],
    postconditions: [
      'Nur mandantenspezifisch freigeschaltete Produkte sind sichtbar.',
      'Kein Produkt eines anderen Mandanten wird angezeigt.'
    ],
    errors: [
      'Das System soll bei fehlender Mandanten-Zuordnung im Token die Anfrage mit 403 abweisen.',
      'Das System soll bei leerer Freigabeliste (0 Produkte) die Meldung "Keine Produkte fuer Ihren Bereich freigeschaltet" anzeigen.'
    ],
    acceptance: [
      'Mandant A sieht nur seine freigeschalteten Produkte.',
      'Mandant B sieht nur seine freigeschalteten Produkte.',
      'Produkt nicht freigeschaltet fuer Mandant A: Nicht in Suchergebnissen.',
      'Fehlende Mandanten-ID: 403 Forbidden.',
      'Leere Freigabeliste: Hinweismeldung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-7.2.1: Produkt Matching Engine ---
  {
    id: 'FN-7.2.1.1', parent: 'CMP-7.2.1', title: 'Matching Score Berechnen',
    description:
      'Das System muss fuer jedes Produkt einen Matching-Score (0-100) berechnen basierend auf: Risikoklassen-Passung (30%), Kosten/TER (25%), historische Rendite (20%), ESG-Rating (15%), Portfolio-Diversifikation (10%).\n\n' +
      '- Das System soll den Score normalisiert auf 0-100 berechnen.\n' +
      '- Das System soll die Gewichte konfigurierbar halten.\n' +
      '- Das System soll den Score als Basis fuer die Empfehlungs-Rangfolge nutzen.',
    preconditions: [
      'Nutzerprofil (Risikoklasse, Portfolio) ist bekannt.',
      'Produktdaten (TER, Rendite, Risikoklasse, ESG) sind verfuegbar.'
    ],
    behavior: [
      'System laedt das Nutzerprofil: Risikoklasse, aktuelle Asset-Allokation.',
      'Pro Produkt: System berechnet Risikoklassen-Passung (0-100): |Produkt-RK - Nutzer-RK| / 6 * 100, invertiert.',
      'Pro Produkt: System berechnet Kosten-Score: (max_TER - Produkt_TER) / max_TER * 100.',
      'Pro Produkt: System berechnet Rendite-Score: Rendite_5J normalisiert auf 0-100.',
      'Pro Produkt: System berechnet ESG-Score: ESG-Rating normalisiert auf 0-100.',
      'Pro Produkt: System berechnet Diversifikations-Score: Wie sehr verbessert das Produkt die aktuelle Allokation.',
      'System berechnet gewichteten Matching-Score: 0.3*RK + 0.25*Kosten + 0.2*Rendite + 0.15*ESG + 0.1*Diversifikation.',
      'System rundet auf Ganzzahl.'
    ],
    postconditions: [
      'Matching-Score (0-100) ist fuer jedes Produkt berechnet.',
      'Score ist fuer Ranking und Empfehlung verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlendem ESG-Rating den ESG-Score neutral (50) setzen.',
      'Das System soll bei fehlender 5J-Rendite die 3J- oder 1J-Rendite als Fallback verwenden.'
    ],
    acceptance: [
      'Produkt mit perfekter Risikoklassen-Passung und niedriger TER erhaelt Score > 80.',
      'Produkt mit falscher Risikoklasse und hoher TER erhaelt Score < 30.',
      'Fehlendes ESG-Rating: Score wird mit neutralem ESG-Wert berechnet.',
      'Gewichtsaenderung durch Admin beeinflusst die Scores.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-7.2.1.2', parent: 'CMP-7.2.1', title: 'Geeignetheitspruefung',
    description:
      'Das System muss vor jeder Empfehlung eine MiFID-II-konforme Geeignetheitspruefung durchfuehren: Risikoklasse des Produkts <= Risikoklasse des Nutzers.\n\n' +
      '- Das System soll die Geeignetheitspruefung automatisch bei jeder Empfehlung ausfuehren.\n' +
      '- Das System soll ungeeignete Produkte aus der Empfehlungsliste ausschliessen.\n' +
      '- Das System soll die Pruefung als Audit-Event protokollieren.',
    preconditions: [
      'Nutzer-Risikoklasse ist zugeordnet (FN-1.3.1.2).',
      'Produkt-Risikoklassse ist bekannt.'
    ],
    behavior: [
      'Pro Produkt: System prueft ob Produkt-Risikoklasse <= Nutzer-Risikoklasse.',
      'Geeignet: Produkt bleibt in der Empfehlungsliste.',
      'Nicht geeignet: Produkt wird aus der Empfehlungsliste entfernt.',
      'System protokolliert die Pruefung als Audit-Event: Produkt-ID, Nutzer-ID, Ergebnis (geeignet/nicht geeignet), Zeitstempel.',
      'System zeigt optional einen Vermerk "X Produkte wegen Risikoprofil ausgeschlossen".'
    ],
    postconditions: [
      'Nur geeignete Produkte sind in der Empfehlungsliste.',
      'Geeignetheitspruefung ist im Audit-Log protokolliert.',
      'Ausschluss-Vermerk ist sichtbar.'
    ],
    errors: [
      'Das System soll bei fehlender Nutzer-Risikoklasse keine Empfehlungen anzeigen und "Bitte Risikoprofil ausfuellen" melden.',
      'Das System soll bei fehlender Produkt-Risikoklasse das Produkt vorsichtshalber ausschliessen.'
    ],
    acceptance: [
      'Nutzer Risikoklasse 3, Produkt Risikoklasse 5: Produkt wird ausgeschlossen.',
      'Nutzer Risikoklasse 5, Produkt Risikoklasse 3: Produkt bleibt.',
      'Audit-Log enthaelt alle Pruefungsergebnisse.',
      'Fehlende Nutzer-RK: Keine Empfehlungen, Hinweismeldung.',
      'Ausschluss-Vermerk zeigt korrekte Anzahl ausgeschlossener Produkte.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-7.2.1.3', parent: 'CMP-7.2.1', title: 'Empfehlungen Ranken',
    description:
      'Das System muss die Top-5 Produkte absteigend nach Matching-Score anzeigen mit Begruendung warum dieses Produkt zum Nutzerprofil passt.\n\n' +
      '- Das System soll nur geeignete Produkte (nach Geeignetheitspruefung) ranken.\n' +
      '- Das System soll pro Empfehlung eine textuelle Begruendung generieren.\n' +
      '- Das System soll die Top-5 als Karten mit Score und Begruendung darstellen.',
    preconditions: [
      'Matching-Scores sind berechnet (FN-7.2.1.1).',
      'Geeignetheitspruefung ist abgeschlossen (FN-7.2.1.2).'
    ],
    behavior: [
      'System filtert die Produkte: nur geeignete (Geeignetheitspruefung bestanden).',
      'System sortiert nach Matching-Score absteigend.',
      'System waehlt die Top-5 aus.',
      'Pro Produkt: System generiert eine Begruendung basierend auf den Score-Faktoren: "Dieses Produkt passt weil: Risikoklasse stimmt ueberein, TER ist niedrig (0.2%), gute 5J-Rendite (8.5%)."',
      'System zeigt die Top-5 als Empfehlungs-Karten: Produktname, ISIN, Score, Begruendung.',
      'System bietet pro Karte: "Details" und "Zum Vergleich".'
    ],
    postconditions: [
      'Top-5-Empfehlungen sind gerankt und mit Begruendung angezeigt.',
      'Empfehlungen sind interaktiv (Details, Vergleich).'
    ],
    errors: [
      'Das System soll bei weniger als 5 geeigneten Produkten die vorhandenen anzeigen.',
      'Das System soll bei 0 geeigneten Produkten die Meldung "Keine passenden Produkte gefunden" anzeigen.'
    ],
    acceptance: [
      'Top-5 sind nach Matching-Score absteigend sortiert.',
      'Begruendung nennt konkrete Scores (TER, Rendite, Risikoklasse).',
      'Bei nur 3 geeigneten Produkten werden 3 angezeigt.',
      '0 geeignete Produkte: Hinweismeldung.',
      '"Details"-Button fuehrt zur Produkt-Detailansicht.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-7.2.1.4', parent: 'CMP-7.2.1', title: 'Provisions Transparenz',
    description:
      'Das System muss Produkte mit Bestandsprovision oder Ausgabeaufschlag explizit kennzeichnen (MiFID-II Transparenzpflicht).\n\n' +
      '- Das System soll Provisions-Informationen als Badge auf der Produktkarte anzeigen.\n' +
      '- Das System soll den Ausgabeaufschlag in EUR und % anzeigen.\n' +
      '- Das System soll einen Vergleich mit provisionsfreien Alternativen anbieten.',
    preconditions: [
      'Produkt-Daten inkl. Provisions-Informationen sind verfuegbar.'
    ],
    behavior: [
      'System prueft pro Produkt: Hat Bestandsprovision ja/nein, Ausgabeaufschlag ja/nein.',
      'Bei Bestandsprovision: System zeigt gelbes Badge "Bestandsprovision".',
      'Bei Ausgabeaufschlag: System zeigt den Aufschlag prominent: "Ausgabeaufschlag: 5% (250 EUR bei 5000 EUR)".',
      'System zeigt einen Link "Provisionsfreie Alternativen anzeigen".',
      'Bei Klick: System filtert den Katalog nach Produkten ohne Provision/Aufschlag.'
    ],
    postconditions: [
      'Provisions-Informationen sind transparent angezeigt.',
      'Provisionsfreie Alternativen sind verlinkt.'
    ],
    errors: [
      'Das System soll bei fehlenden Provisions-Daten keinen Badge anzeigen (keine falsche Aussage).',
      'Das System soll bei Produkt ohne Provision keinen Badge anzeigen.'
    ],
    acceptance: [
      'Produkt mit Bestandsprovision zeigt gelbes Badge.',
      'Ausgabeaufschlag 5% bei 5000 EUR zeigt "250 EUR".',
      'Provisionsfreies Produkt: Kein Badge.',
      'Link "Alternativen" filtert korrekt.',
      'Fehlende Provisions-Daten: Kein Badge, kein Fehler.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-8: Reporting Dashboard (8 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-8.1.1: Vermoegens Dashboard Widget ---
  {
    id: 'FN-8.1.1.1', parent: 'CMP-8.1.1', title: 'Gesamtvermoegen Anzeigen',
    description:
      'Das System muss das Gesamtvermoegen als prominente Zahl mit Trend-Indikator (Pfeil hoch/runter + prozentuale Aenderung zum Vormonat) anzeigen.\n\n' +
      '- Das System soll das Gesamtvermoegen ueber alle Konten und Depots aggregieren.\n' +
      '- Das System soll den Trend zum Vormonat berechnen und farblich darstellen.\n' +
      '- Das System soll das Vermoegen in der Nutzer-Waehrung (Standard: EUR) anzeigen.',
    preconditions: [
      'Mindestens ein Konto oder Depot ist erfasst.',
      'Aktuelle Marktwerte sind verfuegbar.'
    ],
    behavior: [
      'System aggregiert alle Kontosalden und Depot-Marktwerte.',
      'System berechnet das Gesamtvermoegen: Summe(alle Assets).',
      'System laedt den Gesamtwert des Vormonats.',
      'System berechnet den Trend: (Aktuell - Vormonat) / Vormonat * 100.',
      'System zeigt das Gesamtvermoegen als grosse Zahl (z.B. "EUR 234.567,89").',
      'System zeigt den Trend-Indikator: gruener Pfeil hoch (+2.3%) oder roter Pfeil runter (-1.1%).'
    ],
    postconditions: [
      'Gesamtvermoegen ist als prominente Zahl sichtbar.',
      'Trend-Indikator zeigt die Veraenderung zum Vormonat.'
    ],
    errors: [
      'Das System soll bei fehlendem Vormonatswert den Trend als "n/a" anzeigen.',
      'Das System soll bei Aggregationsfehler den letzten bekannten Wert anzeigen und "Stand: {Datum}" hinzufuegen.'
    ],
    acceptance: [
      'Gesamtvermoegen wird korrekt ueber alle Assets aggregiert.',
      'Trend +2.3% zeigt gruenen Pfeil hoch.',
      'Trend -1.1% zeigt roten Pfeil runter.',
      'Fehlender Vormonatswert: Trend "n/a".',
      'Zahl wird mit Tausender-Trennzeichen und 2 Dezimalstellen formatiert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-8.1.1.2', parent: 'CMP-8.1.1', title: 'Allokations Chart',
    description:
      'Das System muss die Asset-Allokation als Donut-Chart darstellen: Segmente nach Asset-Klasse, Prozent und Eurobetraege in Tooltips.\n\n' +
      '- Das System soll Apache ECharts (Pie-Serie, Donut-Variante) verwenden.\n' +
      '- Das System soll bis zu 8 Segmente anzeigen (kleine Klassen als "Sonstige" zusammenfassen).\n' +
      '- Das System soll bei Hover den EUR-Betrag und Prozentanteil im Tooltip anzeigen.',
    preconditions: [
      'Positionen sind Asset-Klassen zugeordnet (FN-1.1.1.3).',
      'Aktuelle Marktwerte sind verfuegbar.'
    ],
    behavior: [
      'System gruppiert alle Positionen nach Asset-Klasse.',
      'System berechnet den Marktwert und Prozentanteil pro Klasse.',
      'System sortiert nach Anteil absteigend.',
      'Klassen mit Anteil < 2% werden zu "Sonstige" zusammengefasst.',
      'System rendert den Donut-Chart via ECharts.',
      'Bei Hover: Tooltip zeigt "Aktien: EUR 85.000 (36.2%)".',
      'Zentrum des Donuts zeigt das Gesamtvermoegen.'
    ],
    postconditions: [
      'Donut-Chart ist gerendert mit korrekten Segmenten.',
      'Tooltips zeigen EUR und % pro Segment.'
    ],
    errors: [
      'Das System soll bei nur einer Asset-Klasse einen vollstaendigen Kreis (100%) anzeigen.',
      'Das System soll bei Rendering-Fehler eine Fallback-Tabelle anzeigen.'
    ],
    acceptance: [
      'Donut-Chart zeigt Segmente fuer Aktien, Anleihen, Cash etc.',
      'Tooltip zeigt EUR-Betrag und Prozent.',
      'Kleine Klassen (< 2%) sind als "Sonstige" zusammengefasst.',
      'Zentrum zeigt Gesamtvermoegen.',
      'ECharts-Donut rendert korrekt auf Desktop und Tablet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-8.1.1.3', parent: 'CMP-8.1.1', title: 'Vermoegen Timeline',
    description:
      'Das System muss die Vermoegensentwicklung als Linien-Chart ueber 30, 90 oder 365 Tage darstellen. Defaultansicht: 90 Tage.\n\n' +
      '- Das System soll Apache ECharts (Line-Serie) verwenden.\n' +
      '- Das System soll den Bereich unter der Linie als Gradient-Fill darstellen.\n' +
      '- Das System soll Zeitraum-Buttons (30T, 90T, 365T) zur Umschaltung bieten.',
    preconditions: [
      'Vermoegenshistorie (Zeitreihe) ist verfuegbar.',
      'Mindestens 30 Tage Daten existieren.'
    ],
    behavior: [
      'System laedt die Vermoegenshistorie fuer den gewaehlten Zeitraum (Standard: 90 Tage).',
      'System rendert ein Linien-Chart mit Gradient-Area-Fill via ECharts.',
      'X-Achse: Datum (formatiert nach Zeitraum: Tag, Woche, Monat).',
      'Y-Achse: Vermoegen in EUR.',
      'Nutzer kann Zeitraum per Buttons umschalten: 30T, 90T, 365T.',
      'Bei Hover: Tooltip zeigt Datum und exakten Wert.',
      'Chart animiert beim Zeitraum-Wechsel.'
    ],
    postconditions: [
      'Timeline-Chart ist gerendert.',
      'Zeitraum-Umschaltung funktioniert.'
    ],
    errors: [
      'Das System soll bei weniger als 30 Tagen Daten die verfuegbaren Daten anzeigen und den 30T-Button deaktivieren.',
      'Das System soll bei fehlenden Tagesdaten eine Interpolation durchfuehren.'
    ],
    acceptance: [
      '90-Tage-Ansicht zeigt korrekte Vermoegensentwicklung.',
      'Zeitraum-Wechsel auf 365T berechnet die Achsen neu.',
      'Gradient-Fill unter der Linie ist sichtbar.',
      'Tooltip zeigt exaktes Datum und Betrag.',
      'Weniger als 30 Tage: Verfuegbare Daten werden angezeigt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-8.1.1.4', parent: 'CMP-8.1.1', title: 'Quick Stats Karten',
    description:
      'Das System muss 4 Kennzahlen-Karten anzeigen: Rendite p.a. (TTWROR), Sparquote (%), naechste Faelligkeit (Festgeld/Anleihe), Risikoprofil-Zusammenfassung.\n\n' +
      '- Das System soll jede Karte als M3-Card mit Icon, Wert und Label darstellen.\n' +
      '- Das System soll die Karten responsiv in einem 2x2 Grid (Desktop) bzw. vertikal (Mobile) anzeigen.\n' +
      '- Das System soll fehlende Werte als "n/a" darstellen.',
    preconditions: [
      'Dashboard ist geladen.',
      'Kennzahlen sind berechnet oder verfuegbar.'
    ],
    behavior: [
      'System laedt die 4 Kennzahlen: TTWROR (FN-3.1.1.1), Sparquote (FN-1.2.1.3), naechste Faelligkeit (aus Depot-Daten), Risikoprofil (FN-1.3.1.2).',
      'Pro Kennzahl: System rendert eine M3-Outlined-Card mit Icon, Wert (grosse Schrift) und Label (kleine Schrift).',
      'Rendite-Karte: Icon "trending_up", Wert z.B. "7.2% p.a.", Label "Rendite (TTWROR)".',
      'Sparquote-Karte: Icon "savings", Wert z.B. "28.5%", Label "Sparquote".',
      'Faelligkeits-Karte: Icon "event", Wert z.B. "15.06.2026", Label "Naechste Faelligkeit".',
      'Risikoprofil-Karte: Icon "shield", Wert z.B. "Ausgewogen", Label "Risikoprofil".',
      'System ordnet die Karten im 2x2 Grid (Desktop) oder vertikal (Mobile).'
    ],
    postconditions: [
      '4 Kennzahlen-Karten sind gerendert.',
      'Layout ist responsiv (2x2 bzw. vertikal).'
    ],
    errors: [
      'Das System soll bei fehlendem Wert (z.B. keine Rendite berechnet) "n/a" anzeigen.',
      'Das System soll bei keiner Faelligkeit die Karte als "Keine Faelligkeit" anzeigen.'
    ],
    acceptance: [
      'Alle 4 Karten sind sichtbar mit korrekten Werten.',
      'Fehlende Rendite zeigt "n/a".',
      'Responsive Layout passt sich Mobile an (vertikal).',
      'M3-Style (Outlined Cards, 12dp Radius) wird angewendet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-8.2.1: Report Generator ---
  {
    id: 'FN-8.2.1.1', parent: 'CMP-8.2.1', title: 'PDF Report Generieren',
    description:
      'Das System muss einen professionellen PDF-Report via Headless-Browser rendern. Seitenformat A4, Kopfzeile mit Mandanten-Logo, Fusszeile mit Seitenzahl und Disclaimer.\n\n' +
      '- Das System soll Puppeteer (Headless Chrome) fuer das PDF-Rendering verwenden.\n' +
      '- Das System soll das A4-Layout mit korrekten Raendern (20mm) einhalten.\n' +
      '- Das System soll die Generierung asynchron als Background-Job ausfuehren.',
    preconditions: [
      'Report-Daten sind verfuegbar (Szenario, Portfolio, Kennzahlen).',
      'Mandanten-Branding ist konfiguriert.',
      'Puppeteer/Chrome ist auf dem Server installiert.'
    ],
    behavior: [
      'Nutzer klickt "Report generieren".',
      'System startet einen Background-Job (Queue-basiert).',
      'System rendert das Report-Template als HTML mit den Daten.',
      'System oeffnet Headless Chrome und laedt das HTML.',
      'System rendert das PDF mit A4-Format, 20mm Raendern.',
      'System fuegt Kopfzeile (Logo, Datum) und Fusszeile (Seitenzahl, Disclaimer) hinzu.',
      'System speichert das PDF und benachrichtigt den Nutzer.',
      'Nutzer kann das PDF herunterladen.'
    ],
    postconditions: [
      'PDF-Report ist generiert und gespeichert.',
      'A4-Format mit korrekten Raendern.',
      'Kopf- und Fusszeile sind korrekt.',
      'Nutzer ist benachrichtigt.'
    ],
    errors: [
      'Das System soll bei Rendering-Fehler einen Retry (max 2) durchfuehren.',
      'Das System soll bei Timeout (> 60s) den Job abbrechen und den Nutzer benachrichtigen.',
      'Das System soll bei fehlendem Chrome einen Fallback-Hinweis loggen.'
    ],
    acceptance: [
      'PDF hat A4-Format mit 20mm Raendern.',
      'Mandanten-Logo ist in der Kopfzeile.',
      'Seitenzahl und Disclaimer sind in der Fusszeile.',
      'PDF-Dateigrösse ist <= 10 MB.',
      'Generierung dauert <= 10 Sekunden.'
    ],
    triggers_notifications: ['NTF-REPORT-READY'],
    notifications: ['PDF-Report ist fertig: In-App-Notification und E-Mail an Nutzer (NTF-REPORT-READY).'],
    conversations: []
  },
  {
    id: 'FN-8.2.1.2', parent: 'CMP-8.2.1', title: 'Report Template Befuellen',
    description:
      'Das System muss das Report-Template mit Daten befuellen: Executive Summary, Ausgangslage (Portfolio-Snapshot), Szenarien-Analyse, Empfehlungen, Appendix.\n\n' +
      '- Das System soll ein HTML/Handlebars-Template verwenden.\n' +
      '- Das System soll alle Charts als statische Bilder (PNG) einbetten.\n' +
      '- Das System soll die Sections dynamisch ein-/ausblenden (je nach verfuegbaren Daten).',
    preconditions: [
      'Report-Template existiert.',
      'Report-Daten sind gesammelt.'
    ],
    behavior: [
      'System laedt das Handlebars-Template.',
      'System befuellt die Sections: Executive Summary (Zusammenfassung), Portfolio-Snapshot (Tabelle + Chart), Szenarien-Analyse (Impact-Details), Empfehlungen (Top-3-Produkte), Appendix (Berechnungsgrundlagen).',
      'System rendert alle Charts als statische PNGs (ECharts Server-Side-Rendering).',
      'System bindet die PNGs als Base64-Images in das HTML ein.',
      'System entfernt Sections ohne Daten (z.B. keine Szenarien-Analyse wenn kein Szenario berechnet).',
      'System gibt das befuellte HTML an den PDF-Renderer zurueck.'
    ],
    postconditions: [
      'Report-HTML ist vollstaendig befuellt.',
      'Charts sind als PNGs eingebettet.',
      'Leere Sections sind ausgeblendet.'
    ],
    errors: [
      'Das System soll bei fehlendem Template einen Fehler loggen und den Report-Job abbrechen.',
      'Das System soll bei fehlendem Chart-PNG einen Platzhalter "Chart nicht verfuegbar" einsetzen.'
    ],
    acceptance: [
      'Template ist mit allen verfuegbaren Daten befuellt.',
      'Charts erscheinen als Bilder im Report.',
      'Section ohne Daten wird nicht angezeigt.',
      'HTML ist valide und von Puppeteer renderbar.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-8.2.1.3', parent: 'CMP-8.2.1', title: 'Mandanten Branding',
    description:
      'Das System muss das Report-Design an das Mandanten-Branding anpassen: Logo, Primaerfarbe, Sekundaerfarbe, Disclaimer-Text.\n\n' +
      '- Das System soll das Branding aus der Mandanten-Konfiguration (CMP-10.2.1) laden.\n' +
      '- Das System soll CSS-Variablen fuer Farben verwenden.\n' +
      '- Das System soll den Disclaimer-Text mandantenspezifisch einsetzen.',
    preconditions: [
      'Mandanten-Branding ist konfiguriert (CMP-10.2.1).',
      'Report-Template unterstuetzt CSS-Variablen.'
    ],
    behavior: [
      'System laedt das Mandanten-Branding: Logo-URL, Primaerfarbe, Sekundaerfarbe, Disclaimer.',
      'System setzt die CSS-Variablen: --primary: Primaerfarbe, --secondary: Sekundaerfarbe.',
      'System setzt das Logo in die Kopfzeile.',
      'System setzt den Disclaimer-Text in die Fusszeile.',
      'System rendert das Template mit den Branding-Einstellungen.'
    ],
    postconditions: [
      'Report-Design entspricht dem Mandanten-Branding.',
      'Logo, Farben und Disclaimer sind mandantenspezifisch.'
    ],
    errors: [
      'Das System soll bei fehlendem Mandanten-Branding das Standard-Branding (WealthPilot-Default) verwenden.',
      'Das System soll bei defektem Logo-URL einen Platzhalter anzeigen.'
    ],
    acceptance: [
      'Logo des Mandanten erscheint in der Kopfzeile.',
      'Primaerfarbe wird fuer Ueberschriften und Tabs verwendet.',
      'Disclaimer-Text ist mandantenspezifisch.',
      'Fehlendes Branding: Standard-Design wird verwendet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-8.2.1.4', parent: 'CMP-8.2.1', title: 'Excel Export',
    description:
      'Das System muss einen XLSX-Export mit allen Rohdaten generieren: Blatt 1 Portfolio, Blatt 2 Szenarien, Blatt 3 Impact-Details.\n\n' +
      '- Das System soll eine XLSX-Bibliothek (z.B. ExcelJS) fuer die Generierung verwenden.\n' +
      '- Das System soll die Blaetter mit Kopfzeilen und Formatierung versehen.\n' +
      '- Das System soll den Export als Download anbieten.',
    preconditions: [
      'Report-Daten sind verfuegbar.',
      'ExcelJS oder aequivalente Bibliothek ist installiert.'
    ],
    behavior: [
      'Nutzer klickt "Als Excel exportieren".',
      'System erstellt ein XLSX-Workbook mit 3 Blaettern.',
      'Blatt 1 "Portfolio": Positionen-Tabelle (ISIN, Name, Stueckzahl, Marktwert, Rendite).',
      'Blatt 2 "Szenarien": Szenario-Vergleich (Score, Delta, Steuerlast, Netto).',
      'Blatt 3 "Impact-Details": Detaillierte Impact-Faktoren pro Position.',
      'System formatiert die Kopfzeilen (Bold, Hintergrundfarbe).',
      'System formatiert Zahlenwerte (2 Dezimalstellen, EUR-Format).',
      'System bietet den Download als .xlsx-Datei an.'
    ],
    postconditions: [
      'XLSX-Datei ist generiert mit 3 Blaettern.',
      'Formatierung ist korrekt.',
      'Download ist verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlenden Szenario-Daten Blatt 2 leer lassen mit Hinweis "Keine Szenarien berechnet".',
      'Das System soll bei Generierungsfehler eine Fehlermeldung anzeigen.'
    ],
    acceptance: [
      'XLSX hat 3 Blaetter mit korrekten Namen.',
      'Portfolio-Blatt zeigt alle Positionen mit Marktwerten.',
      'Kopfzeilen sind fett und farbig.',
      'EUR-Betraege sind korrekt formatiert.',
      'Datei ist in Excel oeffbar.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-9: Compliance & Audit (8 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-9.1.1: Audit Logger ---
  {
    id: 'FN-9.1.1.1', parent: 'CMP-9.1.1', title: 'Event Loggen',
    description:
      'Das System muss regulatorisch relevante Events loggen: Typ, Nutzer-ID, Zeitstempel (UTC), Payload, IP-Adresse, Session-ID.\n\n' +
      '- Das System soll Events als immutable Eintraege in einer dedizierten Audit-Tabelle speichern.\n' +
      '- Das System soll die Events asynchron loggen (Non-Blocking fuer den Hauptprozess).\n' +
      '- Das System soll die Event-Typen konfigurierbar halten.',
    preconditions: [
      'Audit-Tabelle ist in der Datenbank angelegt.',
      'Event-Typen sind konfiguriert (z.B. LOGIN, RISIKOPROFIL_CHANGE, DEPOT_CREATED, REPORT_GENERATED).'
    ],
    behavior: [
      'Ein regulatorisch relevantes Event tritt ein (z.B. Login, Risikoprofil-Aenderung).',
      'System erstellt einen Audit-Datensatz: { event_type, user_id, timestamp_utc, payload, ip_address, session_id }.',
      'System sendet den Datensatz asynchron an die Audit-Tabelle (Message-Queue oder async DB-Insert).',
      'System stellt sicher: Kein UPDATE oder DELETE auf Audit-Eintraege moeglich (immutable).',
      'System berechnet den Hash-Chain-Wert (FN-9.1.1.2) und speichert ihn mit.'
    ],
    postconditions: [
      'Audit-Eintrag ist persistent und immutable gespeichert.',
      'Hash-Chain ist aktualisiert.',
      'Hauptprozess wurde nicht blockiert.'
    ],
    errors: [
      'Das System soll bei Datenbankfehler den Event in eine Retry-Queue stellen.',
      'Das System soll bei Retry-Queue-Ueberlauf einen Admin-Alert ausloesen.',
      'Das System soll bei ungueltigem Event-Typ den Eintrag trotzdem loggen mit Typ "UNKNOWN".'
    ],
    acceptance: [
      'Login-Event wird mit allen Feldern (Typ, User-ID, Timestamp, IP) geloggt.',
      'Audit-Eintrag kann nicht per SQL UPDATE/DELETE geaendert werden.',
      'Asynchrones Logging blockiert den Hauptprozess nicht (Response-Time unveraendert).',
      'Retry-Queue funktioniert bei Datenbankfehler.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-9.1.1.2', parent: 'CMP-9.1.1', title: 'Hash Chain Sicherung',
    description:
      'Das System muss jeden Log-Eintrag kryptographisch an den vorherigen ketten (SHA-256 Hash des Vorgaenger-Eintrags), um Manipulation zu erkennen.\n\n' +
      '- Das System soll eine Hash-Chain (Blockchain-aehnlich) ueber die Audit-Eintraege bilden.\n' +
      '- Das System soll die Integritaet der Kette bei jeder Abfrage verifizieren koennen.\n' +
      '- Das System soll bei Kettenbruch einen Alert ausloesen.',
    preconditions: [
      'Mindestens ein vorheriger Audit-Eintrag existiert (oder Genesis-Block).',
      'SHA-256 Algorithmus ist verfuegbar.'
    ],
    behavior: [
      'System laedt den Hash des letzten Audit-Eintrags (previous_hash).',
      'System berechnet den Hash des neuen Eintrags: hash = SHA-256(event_type + user_id + timestamp + payload + previous_hash).',
      'System speichert den berechneten Hash zusammen mit dem Audit-Eintrag.',
      'Bei Integritaetspruefung: System iteriert ueber alle Eintraege und verifiziert die Hash-Kette.',
      'Bei Kettenbruch: System markiert den betroffenen Eintrag und loest einen Admin-Alert aus.'
    ],
    postconditions: [
      'Neuer Eintrag ist in die Hash-Kette integriert.',
      'Hash ist gespeichert.',
      'Integritaet ist verifizierbar.'
    ],
    errors: [
      'Das System soll bei fehlendem previous_hash (erster Eintrag) den Genesis-Hash "0" verwenden.',
      'Das System soll bei Kettenbruch den betroffenen Bereich markieren und den Betrieb nicht unterbrechen.'
    ],
    acceptance: [
      'Hash-Chain ist lueckenlos ueber alle Eintraege.',
      'Nachtraegliche Aenderung eines Eintrags bricht die Kette (verifizierbar).',
      'Kettenbruch loest Admin-Alert aus.',
      'Genesis-Block verwendet Hash "0".'
    ],
    triggers_notifications: ['NTF-AUDIT-BREACH'],
    notifications: ['Bei Kettenbruch: Admin-Alert via E-Mail und In-App (NTF-AUDIT-BREACH).'],
    conversations: []
  },
  {
    id: 'FN-9.1.1.3', parent: 'CMP-9.1.1', title: 'Audit Query Interface',
    description:
      'Das System muss der Compliance-Abteilung eine Such-Oberflaeche bieten: Filter nach Nutzer, Zeitraum, Event-Typ. Export als CSV.\n\n' +
      '- Das System soll eine datensatzbasierte Suche mit Pagination bieten.\n' +
      '- Das System soll den Export als CSV fuer Compliance-Reports ermoeglichen.\n' +
      '- Das System soll den Zugriff auf Compliance-Rolle beschraenken.',
    preconditions: [
      'Nutzer hat die Rolle "Compliance" oder "Admin".',
      'Audit-Daten existieren.'
    ],
    behavior: [
      'Nutzer oeffnet das Audit-Query-Interface.',
      'System zeigt Filterfelder: Nutzer-ID/Name, Zeitraum (von-bis), Event-Typ (Dropdown).',
      'Nutzer setzt Filter und klickt "Suchen".',
      'System fuehrt die Abfrage aus und zeigt Ergebnisse paginiert (50 pro Seite).',
      'Pro Eintrag: Zeitstempel, Typ, Nutzer, Payload (aufklappbar), IP-Adresse.',
      'Nutzer kann die Ergebnisse als CSV exportieren.',
      'CSV enthaelt alle Felder der angezeigten Eintraege.'
    ],
    postconditions: [
      'Suchergebnisse sind angezeigt.',
      'CSV-Export ist verfuegbar.'
    ],
    errors: [
      'Das System soll bei nicht-autorisiertem Zugriff (falsche Rolle) eine 403-Fehlermeldung anzeigen.',
      'Das System soll bei sehr grossen Ergebnismengen (>10000) eine Warnung "Bitte Filter einschraenken" anzeigen.'
    ],
    acceptance: [
      'Filter nach Nutzer-ID und Zeitraum liefert korrekte Ergebnisse.',
      'Pagination funktioniert (50 pro Seite).',
      'CSV-Export enthaelt alle Felder.',
      'Nicht-Compliance-Nutzer erhaelt 403.',
      'Grosse Ergebnismenge (>10000) zeigt Warnung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-9.1.1.4', parent: 'CMP-9.1.1', title: 'Aufbewahrungsfrist',
    description:
      'Das System muss Audit-Logs mindestens 10 Jahre aufbewahren (HGB Aufbewahrungspflicht). Nach Ablauf der Frist werden Logs automatisch archiviert.\n\n' +
      '- Das System soll einen monatlichen Job fuer die Archivierung ausfuehren.\n' +
      '- Das System soll Logs aelter als 10 Jahre in Cold-Storage verschieben (nicht loeschen).\n' +
      '- Das System soll die Archivierung nachvollziehbar protokollieren.',
    preconditions: [
      'Audit-Daten existieren.',
      'Cold-Storage (z.B. S3 Glacier) ist konfiguriert.'
    ],
    behavior: [
      'Monatlicher Cron-Job prueft alle Audit-Eintraege aelter als 10 Jahre.',
      'System exportiert die betroffenen Eintraege als komprimiertes Archiv.',
      'System uebertraegt das Archiv in Cold-Storage.',
      'System verifiziert die Uebertragung (Checksum-Vergleich).',
      'System entfernt die archivierten Eintraege aus der aktiven Datenbank.',
      'System protokolliert die Archivierung: Anzahl Eintraege, Archiv-Pfad, Checksum.'
    ],
    postconditions: [
      'Eintraege aelter als 10 Jahre sind im Cold-Storage.',
      'Aktive Datenbank enthaelt nur Eintraege der letzten 10 Jahre.',
      'Archivierung ist protokolliert.'
    ],
    errors: [
      'Das System soll bei Cold-Storage-Fehler die Eintraege in der aktiven Datenbank belassen.',
      'Das System soll bei Checksum-Mismatch die Archivierung abbrechen und einen Admin-Alert ausloesen.',
      'Das System soll NIEMALS Audit-Eintraege endgueltig loeschen (nur archivieren).'
    ],
    acceptance: [
      'Eintraege aelter als 10 Jahre werden archiviert.',
      'Archiv im Cold-Storage ist abrufbar.',
      'Checksum-Vergleich bestaetigt Integritaet.',
      'Bei Storage-Fehler bleiben Eintraege in der aktiven DB.',
      'Keine Eintraege werden endgueltig geloescht.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-9.2.1: DSGVO Loeschmodul ---
  {
    id: 'FN-9.2.1.1', parent: 'CMP-9.2.1', title: 'Loeschantrag Erfassen',
    description:
      'Das System muss Nutzern ein Self-Service-Formular zur Stellung eines Loeschantrags nach DSGVO Art. 17 bieten. Pflichtfelder: Name, E-Mail, Begruendung.\n\n' +
      '- Das System soll den Antrag als Ticket mit Status-Workflow verwalten.\n' +
      '- Das System soll eine automatische Eingangsbestaetigung senden.\n' +
      '- Das System soll die 30-Tage-Frist automatisch tracken.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Loeschantrag-Formular ist verfuegbar.'
    ],
    behavior: [
      'Nutzer oeffnet das Loeschantrag-Formular (Einstellungen > Datenschutz > Daten loeschen).',
      'System zeigt Formular: Name (vorausgefuellt), E-Mail (vorausgefuellt), Begruendung (Freitext, Pflicht).',
      'Nutzer fuellt die Begruendung aus und klickt "Antrag stellen".',
      'System erstellt ein Loeschantrag-Ticket mit Status "eingegangen".',
      'System setzt die Frist: heute + 30 Tage.',
      'System sendet eine Eingangsbestaetigung per E-Mail mit Ticket-Nummer.',
      'System loest die Aufbewahrungspflichten-Pruefung aus (FN-9.2.1.2).'
    ],
    postconditions: [
      'Loeschantrag ist als Ticket erfasst.',
      'Eingangsbestaetigung ist gesendet.',
      '30-Tage-Frist ist gesetzt.',
      'Aufbewahrungspflichten-Pruefung ist ausgeloest.'
    ],
    errors: [
      'Das System soll bei fehlender Begruendung das Feld rot markieren.',
      'Das System soll bei E-Mail-Versandfehler den Antrag trotzdem erfassen und den E-Mail-Versand in die Retry-Queue stellen.',
      'Das System soll bei doppeltem Antrag (offener Antrag existiert) die Meldung "Es existiert bereits ein offener Antrag" anzeigen.'
    ],
    acceptance: [
      'Antrag wird mit Ticket-Nummer erfasst.',
      'Eingangsbestaetigung wird per E-Mail gesendet.',
      '30-Tage-Frist ist korrekt gesetzt.',
      'Doppelter Antrag wird erkannt und abgelehnt.',
      'Fehlende Begruendung wird validiert.'
    ],
    triggers_notifications: ['NTF-DELETION-REQUEST'],
    notifications: ['Eingangsbestaetigung per E-Mail an den Nutzer (NTF-DELETION-REQUEST).'],
    conversations: []
  },
  {
    id: 'FN-9.2.1.2', parent: 'CMP-9.2.1', title: 'Aufbewahrungspflichten Pruefen',
    description:
      'Das System muss automatisch pruefen welche Daten regulatorischen Aufbewahrungspflichten unterliegen: WpHG 5J (Beratungsprotokolle), HGB 10J (Geschaeftsvorfaelle).\n\n' +
      '- Das System soll die Pruefung regelbasiert durchfuehren.\n' +
      '- Das System soll die Daten in "sofort loeschbar" und "aufbewahrungspflichtig" klassifizieren.\n' +
      '- Das System soll die Restlaufzeit der Aufbewahrungspflicht berechnen.',
    preconditions: [
      'Loeschantrag ist erfasst (FN-9.2.1.1).',
      'Aufbewahrungsregeln sind konfiguriert.'
    ],
    behavior: [
      'System laedt alle Daten des Nutzers.',
      'Pro Datensatz: System prueft gegen die Aufbewahrungsregeln: WpHG (Beratungsprotokolle, 5 Jahre), HGB (Geschaeftsvorfaelle, 10 Jahre), Audit-Logs (10 Jahre).',
      'System klassifiziert: "sofort loeschbar" (keine Pflicht oder Pflicht abgelaufen) vs. "aufbewahrungspflichtig" (Pflicht noch aktiv).',
      'Bei aufbewahrungspflichtigen Daten: System berechnet die Restlaufzeit.',
      'System erstellt eine Zusammenfassung: Anzahl loeschbarer Datensaetze, Anzahl aufbewahrungspflichtiger Datensaetze mit jeweiliger Frist.',
      'System leitet die Zusammenfassung an die Loeschung (FN-9.2.1.3) weiter.'
    ],
    postconditions: [
      'Alle Daten sind klassifiziert.',
      'Zusammenfassung ist erstellt.',
      'Loeschprozess kann starten.'
    ],
    errors: [
      'Das System soll bei unbekanntem Datentyp den Datensatz als "aufbewahrungspflichtig" klassifizieren (Safety-First).',
      'Das System soll bei Regelkonfigurationsfehler den gesamten Loeschprozess pausieren und einen Admin-Alert ausloesen.'
    ],
    acceptance: [
      'Beratungsprotokoll von 2022: Aufbewahrungspflicht WpHG bis 2027 (noch aktiv).',
      'Profildaten ohne regulatorische Pflicht: Sofort loeschbar.',
      'Audit-Logs von 2024: Aufbewahrungspflicht HGB bis 2034.',
      'Unbekannter Datentyp: Wird als aufbewahrungspflichtig klassifiziert.',
      'Zusammenfassung zeigt korrekte Anzahlen und Fristen.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-9.2.1.3', parent: 'CMP-9.2.1', title: 'Daten Loeschen',
    description:
      'Das System muss nicht-regulatorische Daten innerhalb von 30 Tagen nach Antrag unwiderruflich loeschen. Regulatorische Daten werden pseudonymisiert und nach Ablauf der Frist geloescht.\n\n' +
      '- Das System soll die Loeschung als Background-Job ausfuehren.\n' +
      '- Das System soll die Pseudonymisierung per Daten-Maskierung durchfuehren.\n' +
      '- Das System soll die Loeschung als Audit-Event protokollieren.',
    preconditions: [
      'Aufbewahrungspflichten-Pruefung (FN-9.2.1.2) ist abgeschlossen.',
      'Daten sind in "loeschbar" und "aufbewahrungspflichtig" klassifiziert.'
    ],
    behavior: [
      'System startet den Loeschprozess als Background-Job.',
      'Sofort loeschbare Daten: System loescht unwiderruflich (DELETE + Ueberschreiben des Speicherplatzes).',
      'Aufbewahrungspflichtige Daten: System pseudonymisiert — Name, E-Mail, IBAN werden durch Platzhalter ersetzt.',
      'System setzt den loeschbaren Referenzen auf NULL (Kaskaden-Nulling).',
      'System protokolliert die Loeschung als Audit-Event: Anzahl geloeschter Datensaetze, Pseudonymisierte Datensaetze, Zeitstempel.',
      'System setzt den Loeschantrag-Status auf "ausgefuehrt".',
      'System plant die endgueltige Loeschung der pseudonymisierten Daten nach Ablauf der Aufbewahrungsfrist.'
    ],
    postconditions: [
      'Nicht-regulatorische Daten sind unwiderruflich geloescht.',
      'Regulatorische Daten sind pseudonymisiert.',
      'Audit-Event ist protokolliert.',
      'Loeschantrag-Status ist "ausgefuehrt".'
    ],
    errors: [
      'Das System soll bei Loeschfehler den Vorgang abbrechen, den Fehler loggen und einen manuellen Review-Prozess ausloesen.',
      'Das System soll bei Pseudonymisierungsfehler den Datensatz als "Manuell pruefen" markieren.',
      'Das System soll NIEMALS regulatorische Daten ohne Pseudonymisierung loeschen.'
    ],
    acceptance: [
      'Profildaten (Name, Adresse) sind unwiderruflich geloescht.',
      'Beratungsprotokoll ist pseudonymisiert (Name = "GELOESCHT", E-Mail = "deleted@void.invalid").',
      'Audit-Event bestaetigt die Loeschung.',
      'Regulatorische Daten werden nie vor Fristablauf geloescht.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-9.2.1.4', parent: 'CMP-9.2.1', title: 'Loeschbestaetigung Senden',
    description:
      'Das System muss dem Nutzer eine Bestaetigung senden mit: Liste der geloeschten Daten, Liste der aufbewahrten Daten mit Begruendung und Frist, Kontakt fuer Rueckfragen.\n\n' +
      '- Das System soll die Bestaetigung als E-Mail und als PDF-Attachment senden.\n' +
      '- Das System soll die Bestaetigung DSGVO-konform formulieren.\n' +
      '- Das System soll die Bestaetigung archivieren.',
    preconditions: [
      'Loeschung (FN-9.2.1.3) ist abgeschlossen.',
      'E-Mail-Adresse des Nutzers ist (noch) bekannt (vor Loeschung gespeichert).'
    ],
    behavior: [
      'System kompiliert die Loeschbestaetigung: Geloeschte Daten (Kategorien), Aufbewahrte Daten (Kategorie, Rechtsgrundlage, Frist), Kontaktinformationen.',
      'System rendert die Bestaetigung als PDF.',
      'System sendet eine E-Mail mit dem PDF als Attachment an die (zuvor gesicherte) E-Mail-Adresse.',
      'System archiviert die Bestaetigung fuer interne Nachweispflicht.',
      'System schliesst den Loeschantrag (Status: "abgeschlossen").'
    ],
    postconditions: [
      'Loeschbestaetigung ist per E-Mail + PDF gesendet.',
      'Bestaetigung ist archiviert.',
      'Loeschantrag ist abgeschlossen.'
    ],
    errors: [
      'Das System soll bei E-Mail-Versandfehler den Versand in die Retry-Queue stellen (max 3 Versuche).',
      'Das System soll bei PDF-Renderingfehler die Bestaetigung als reinen E-Mail-Text senden.'
    ],
    acceptance: [
      'E-Mail enthaelt PDF mit geloeschten und aufbewahrten Daten-Listen.',
      'Aufbewahrte Daten zeigen Rechtsgrundlage (z.B. "WpHG SS 83") und Frist.',
      'Kontaktdaten fuer Rueckfragen sind enthalten.',
      'Bestaetigung ist intern archiviert.',
      'E-Mail-Versandfehler: Retry funktioniert.'
    ],
    triggers_notifications: ['NTF-DELETION-CONFIRM'],
    notifications: ['Loeschbestaetigung per E-Mail mit PDF-Attachment (NTF-DELETION-CONFIRM).'],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-10: Mandantenverwaltung (8 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-10.1.1: Mandanten Verwaltungsmodul ---
  {
    id: 'FN-10.1.1.1', parent: 'CMP-10.1.1', title: 'Mandant Anlegen',
    description:
      'Das System muss neue Mandanten anlegen: Firmenname, Subdomain, Kontaktperson, Vertragsbeginn, Lizenzmodell (Starter/Professional/Enterprise).\n\n' +
      '- Das System soll die Subdomain auf Verfuegbarkeit pruefen.\n' +
      '- Das System soll bei Mandanten-Anlage automatisch Default-Konfigurationen erstellen.\n' +
      '- Das System soll den Mandanten nach Anlage sofort lauffaehig machen (Zero-Config-Start).',
    preconditions: [
      'Nutzer hat die Rolle "Super-Admin".',
      'Mandanten-Verwaltungsmodul ist geoeffnet.'
    ],
    behavior: [
      'Admin fuellt das Mandanten-Formular aus: Firmenname, Subdomain, Kontaktperson (Name + E-Mail), Vertragsbeginn, Lizenzmodell.',
      'System validiert die Subdomain: nur alphanumerische Zeichen + Bindestrich, min 3 Zeichen, verfuegbar (kein Duplikat).',
      'System erstellt den Mandanten-Datensatz.',
      'System generiert Default-Konfigurationen: Standard-Branding, Standard-Feature-Flags (nach Lizenzmodell), Standard-Produktfreigabe.',
      'System erstellt den initialen Admin-Account fuer den Mandanten (E-Mail an Kontaktperson mit Aktivierungslink).',
      'System zeigt Erfolgsmeldung mit Mandanten-ID und Subdomain.'
    ],
    postconditions: [
      'Mandant ist angelegt und konfiguriert.',
      'Default-Konfigurationen sind erstellt.',
      'Mandanten-Admin hat Aktivierungslink erhalten.',
      'Mandant ist unter {subdomain}.wealthpilot.de erreichbar.'
    ],
    errors: [
      'Das System soll bei doppelter Subdomain die Meldung "Subdomain bereits vergeben" anzeigen.',
      'Das System soll bei fehlendem Pflichtfeld das Feld rot markieren.',
      'Das System soll bei E-Mail-Versandfehler den Mandanten trotzdem anlegen und den E-Mail-Versand in die Retry-Queue stellen.'
    ],
    acceptance: [
      'Mandant "Musterbank" mit Subdomain "musterbank" wird angelegt.',
      'Doppelte Subdomain wird abgelehnt.',
      'Default-Feature-Flags fuer "Starter"-Lizenz sind gesetzt.',
      'Aktivierungs-E-Mail wird an Kontaktperson gesendet.',
      'Mandant ist unter musterbank.wealthpilot.de erreichbar.'
    ],
    triggers_notifications: ['NTF-MANDANT-WELCOME'],
    notifications: ['Aktivierungslink per E-Mail an den Mandanten-Admin (NTF-MANDANT-WELCOME).'],
    conversations: []
  },
  {
    id: 'FN-10.1.1.2', parent: 'CMP-10.1.1', title: 'Feature Flags Konfigurieren',
    description:
      'Das System muss pro Mandant Module aktivieren/deaktivieren: Immobilien-Modul, KI-Advisory, Impact-Simulation, Reporting, Produktempfehlungen.\n\n' +
      '- Das System soll Feature-Flags als Toggle-Switches darstellen.\n' +
      '- Das System soll die Flags nach Lizenzmodell vorbelegen.\n' +
      '- Das System soll Aenderungen sofort wirksam machen (kein Restart noetig).',
    preconditions: [
      'Nutzer hat die Rolle "Super-Admin" oder "Mandanten-Admin".',
      'Mandant existiert.'
    ],
    behavior: [
      'System zeigt alle verfuegbaren Module als Toggle-Switches.',
      'Aktueller Zustand (aktiv/inaktiv) wird aus der Mandanten-Konfiguration geladen.',
      'Admin klickt einen Toggle: System aktualisiert den Feature-Flag sofort in der Datenbank.',
      'System invalidiert den Feature-Flag-Cache fuer den Mandanten.',
      'Bei naechstem Request: Frontend prueft die aktualisierten Flags und blendet Module ein/aus.',
      'System protokolliert die Aenderung als Audit-Event.'
    ],
    postconditions: [
      'Feature-Flag ist aktualisiert.',
      'Module sind sofort ein-/ausgeblendet.',
      'Audit-Event ist protokolliert.'
    ],
    errors: [
      'Das System soll bei Datenbankfehler den Toggle zuruecksetzen und "Aenderung fehlgeschlagen" anzeigen.',
      'Das System soll bei Lizenz-Einschraenkung (z.B. Starter darf kein KI-Advisory) den Toggle deaktivieren und "Nicht in Ihrem Lizenzmodell enthalten" anzeigen.'
    ],
    acceptance: [
      'Toggle "Immobilien-Modul" auf ON: Modul ist sofort sichtbar.',
      'Toggle auf OFF: Modul ist sofort ausgeblendet.',
      'Starter-Lizenz: KI-Advisory Toggle ist deaktiviert.',
      'Aenderung wird als Audit-Event protokolliert.',
      'Kein Restart noetig nach Aenderung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-10.1.1.3', parent: 'CMP-10.1.1', title: 'SSO Konfigurieren',
    description:
      'Das System muss pro Mandant SAML 2.0 oder OpenID Connect konfigurierbar machen: Entity-ID, Metadata-URL, Certificate. Test-Login vor Aktivierung.\n\n' +
      '- Das System soll beide Protokolle (SAML 2.0, OIDC) unterstuetzen.\n' +
      '- Das System soll eine Test-Login-Funktion bieten (ohne Auswirkung auf Produktivdaten).\n' +
      '- Das System soll das Certificate als Upload oder URL akzeptieren.',
    preconditions: [
      'Mandant existiert.',
      'Admin hat SSO-Daten des Identity-Providers.'
    ],
    behavior: [
      'Admin waehlt das Protokoll: SAML 2.0 oder OIDC.',
      'Bei SAML 2.0: Admin gibt Entity-ID, Metadata-URL und Certificate (Upload/URL) ein.',
      'Bei OIDC: Admin gibt Client-ID, Client-Secret, Issuer-URL und Redirect-URI ein.',
      'System validiert die Eingaben (Metadata-URL erreichbar, Certificate parsbar).',
      'Admin klickt "Test-Login": System fuehrt einen Test-Authentifizierungsflow durch.',
      'Bei erfolgreichem Test: Admin kann SSO aktivieren.',
      'System protokolliert die SSO-Konfiguration als Audit-Event.'
    ],
    postconditions: [
      'SSO ist konfiguriert und optional aktiviert.',
      'Test-Login war erfolgreich (bei Aktivierung).',
      'Audit-Event ist protokolliert.'
    ],
    errors: [
      'Das System soll bei nicht erreichbarer Metadata-URL die Meldung "Metadata-URL nicht erreichbar" anzeigen.',
      'Das System soll bei fehlgeschlagenem Test-Login die Fehlermeldung des IdP anzeigen.',
      'Das System soll bei ungueltigem Certificate die Meldung "Certificate konnte nicht geparst werden" anzeigen.'
    ],
    acceptance: [
      'SAML 2.0 Konfiguration mit gueltiger Metadata-URL wird akzeptiert.',
      'OIDC Konfiguration mit gueltigem Issuer wird akzeptiert.',
      'Test-Login fuehrt einen echten Auth-Flow durch.',
      'Nicht erreichbare Metadata-URL wird mit Fehlermeldung abgelehnt.',
      'SSO kann nach erfolgreichem Test aktiviert werden.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-10.1.1.4', parent: 'CMP-10.1.1', title: 'API Keys Verwalten',
    description:
      'Das System muss pro Mandant API-Keys generieren, rotieren und widerrufen koennen. Jeder Key hat ein Erstelldatum, Ablaufdatum und optionale IP-Whitelist.\n\n' +
      '- Das System soll API-Keys als kryptographisch sichere Token generieren.\n' +
      '- Das System soll Key-Rotation (neuer Key + Grace-Period fuer alten) unterstuetzen.\n' +
      '- Das System soll eine IP-Whitelist pro Key konfigurierbar machen.',
    preconditions: [
      'Mandant existiert.',
      'Admin hat die Rolle "Mandanten-Admin" oder "Super-Admin".'
    ],
    behavior: [
      'Admin klickt "Neuen API-Key erstellen".',
      'System generiert einen kryptographisch sicheren Token (256-bit, Base64-encoded).',
      'Admin konfiguriert optional: Ablaufdatum, IP-Whitelist, Beschreibung.',
      'System speichert den Key-Hash (nicht den Klartext!) in der Datenbank.',
      'System zeigt den Klartext-Key EINMALIG an (mit Kopier-Button und Warnung "Key wird nur jetzt angezeigt").',
      'Bei Rotation: System erstellt neuen Key und setzt Grace-Period (7 Tage) fuer den alten Key.',
      'Bei Widerruf: System deaktiviert den Key sofort.'
    ],
    postconditions: [
      'API-Key ist generiert und gespeichert (nur Hash).',
      'Key wurde dem Admin einmalig angezeigt.',
      'Optionale Konfiguration (Ablauf, IP-Whitelist) ist gesetzt.'
    ],
    errors: [
      'Das System soll bei Generierungsfehler einen Retry durchfuehren (max 3).',
      'Das System soll bei IP-Whitelist-Verletzung die API-Anfrage mit 403 ablehnen.',
      'Das System soll bei abgelaufenem Key die API-Anfrage mit 401 ablehnen.'
    ],
    acceptance: [
      'Generierter Key ist 256-bit stark und einmalig.',
      'Key-Klartext wird nur einmal angezeigt.',
      'Rotation erstellt neuen Key mit 7-Tage-Grace fuer alten.',
      'Widerruf deaktiviert den Key sofort.',
      'IP-Whitelist blockiert Anfragen von nicht-gelisteten IPs.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-10.2.1: White Label Branding Modul ---
  {
    id: 'FN-10.2.1.1', parent: 'CMP-10.2.1', title: 'Logo Upload',
    description:
      'Das System muss den Upload eines Mandanten-Logos erlauben: SVG oder PNG, max. 500KB, min. 200x50px. Das Logo wird in Navigation, Reports und E-Mails verwendet.\n\n' +
      '- Das System soll die Datei serverseitig validieren (nicht nur Client-Side).\n' +
      '- Das System soll das Logo automatisch in verschiedenen Groessen cachen.\n' +
      '- Das System soll eine Vorschau nach Upload anzeigen.',
    preconditions: [
      'Admin hat die Rolle "Mandanten-Admin".',
      'Mandant existiert.'
    ],
    behavior: [
      'Admin klickt "Logo hochladen" und waehlt eine Datei.',
      'Client-Side: System prueft Dateityp (SVG/PNG) und Groesse (max. 500KB).',
      'Server-Side: System validiert erneut: Dateityp, Groesse, Mindestabmessungen (200x50px).',
      'System speichert das Logo im CDN/Object-Storage.',
      'System generiert Varianten: Favicon (32x32), Navigation (160x40), Report (300x75).',
      'System zeigt eine Vorschau des Logos in Navigation und Report-Kontext.',
      'Admin bestaetigt und Logo wird aktiviert.'
    ],
    postconditions: [
      'Logo ist hochgeladen und in allen Varianten verfuegbar.',
      'Logo wird in Navigation, Reports und E-Mails verwendet.',
      'Vorschau wurde dem Admin angezeigt.'
    ],
    errors: [
      'Das System soll bei falscher Dateiendung die Meldung "Nur SVG und PNG erlaubt" anzeigen.',
      'Das System soll bei Datei > 500KB die Meldung "Datei zu gross (max. 500KB)" anzeigen.',
      'Das System soll bei zu kleinen Abmessungen die Meldung "Mindestgroesse: 200x50px" anzeigen.',
      'Das System soll bei SVG mit eingebettetem Script die Datei ablehnen (XSS-Schutz).'
    ],
    acceptance: [
      'PNG (400x100, 200KB) wird akzeptiert und in 3 Varianten gespeichert.',
      'SVG wird akzeptiert und in Raster-Varianten konvertiert.',
      'Datei > 500KB wird abgelehnt.',
      'Datei < 200x50px wird abgelehnt.',
      'SVG mit Script-Tag wird abgelehnt (XSS-Schutz).'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-10.2.1.2', parent: 'CMP-10.2.1', title: 'Farb Editor',
    description:
      'Das System muss einen Farb-Editor bieten: Primaer-, Sekundaer- und Akzentfarbe per Color-Picker. WCAG-AA-Kontrastpruefung automatisch.\n\n' +
      '- Das System soll Color-Picker-Inputs fuer 3 Farben bereitstellen.\n' +
      '- Das System soll automatisch den WCAG-AA-Kontrast gegen weiss/schwarz pruefen.\n' +
      '- Das System soll die Farben als CSS-Variablen im Mandanten-Theme speichern.',
    preconditions: [
      'Admin hat die Rolle "Mandanten-Admin".',
      'Farb-Editor ist geoeffnet.'
    ],
    behavior: [
      'System zeigt 3 Color-Picker: Primaerfarbe, Sekundaerfarbe, Akzentfarbe.',
      'System zeigt die aktuellen Farben (oder Defaults) als Vorauswahl.',
      'Admin waehlt eine Farbe per Color-Picker oder Hex-Eingabe.',
      'System prueft den WCAG-AA-Kontrast (min. 4.5:1 fuer Text, 3:1 fuer grosse Elemente).',
      'Bei ungenuegend Kontrast: System zeigt Warnung "Kontrastverhaeltnis ungenuegend (X:1, min. 4.5:1)".',
      'Admin speichert die Farben: System aktualisiert die CSS-Variablen im Mandanten-Theme.',
      'Aenderungen sind sofort in der Live-Preview (FN-10.2.1.4) sichtbar.'
    ],
    postconditions: [
      'Farben sind gespeichert und im Theme aktiv.',
      'WCAG-AA-Kontrast wurde geprueft.',
      'CSS-Variablen sind aktualisiert.'
    ],
    errors: [
      'Das System soll bei ungueltigem Hex-Code die Meldung "Ungueltiger Farbcode" anzeigen.',
      'Das System soll bei Kontrast-Warnung das Speichern erlauben (Warnung, kein Block).'
    ],
    acceptance: [
      'Primaerfarbe #1A73E8 wird korrekt gespeichert.',
      'Kontrastpruefung: #FFFFFF auf #1A73E8 = 4.6:1 (Pass).',
      'Kontrastpruefung: #FFFFFF auf #CCCCCC = 1.6:1 (Warnung).',
      'Aenderung ist in der Live-Preview sichtbar.',
      'Ungueltiger Hex-Code wird abgelehnt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-10.2.1.3', parent: 'CMP-10.2.1', title: 'Custom Texte Pflegen',
    description:
      'Das System muss Mandanten-Admins erlauben folgende Texte anzupassen: Willkommensnachricht, Footer-Text, Impressums-URL, Datenschutz-URL, Disclaimer.\n\n' +
      '- Das System soll die Texte als Key-Value-Paare verwalten.\n' +
      '- Das System soll einen Markdown-Editor fuer laengere Texte bieten.\n' +
      '- Das System soll Default-Texte bereitstellen (falls Mandant keine eigenen setzt).',
    preconditions: [
      'Admin hat die Rolle "Mandanten-Admin".',
      'Text-Editor ist geoeffnet.'
    ],
    behavior: [
      'System zeigt alle konfigurierbaren Texte als Formular-Felder.',
      'Kurztexte (Footer, Disclaimer): Einzeiliges Textfeld.',
      'Langtexte (Willkommensnachricht): Markdown-Editor mit Vorschau.',
      'URLs (Impressum, Datenschutz): URL-Eingabefeld mit Validierung.',
      'Admin bearbeitet die Texte und klickt "Speichern".',
      'System speichert die Texte als Key-Value-Paare in der Mandanten-Konfiguration.',
      'Aenderungen sind sofort in der Live-Preview sichtbar.'
    ],
    postconditions: [
      'Custom Texte sind gespeichert.',
      'Texte werden in der Anwendung angewendet.',
      'Default-Texte werden als Fallback verwendet.'
    ],
    errors: [
      'Das System soll bei ungueltigem URL-Format die Meldung "Bitte gueltige URL eingeben" anzeigen.',
      'Das System soll bei leerem Pflichttext den Default-Text verwenden.',
      'Das System soll Markdown-Inhalte sanitizen (kein HTML/Script).'
    ],
    acceptance: [
      'Willkommensnachricht wird als Markdown gerendert.',
      'Footer-Text wird im Footer angezeigt.',
      'Impressums-URL fuehrt zur korrekten Seite.',
      'Leerer Custom-Text: Default wird verwendet.',
      'Markdown mit Script-Injection wird sanitized.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-10.2.1.4', parent: 'CMP-10.2.1', title: 'Live Preview',
    description:
      'Das System muss eine Sandbox-Preview des konfigurierten Brandings anzeigen bevor es aktiviert wird. Aenderungen werden erst nach Bestaetigung publiziert.\n\n' +
      '- Das System soll die Preview in einem Iframe rendern.\n' +
      '- Das System soll die Preview mit den aktuellen (noch nicht publizierten) Branding-Aenderungen anzeigen.\n' +
      '- Das System soll "Publizieren" und "Verwerfen" Buttons bieten.',
    preconditions: [
      'Branding-Aenderungen (Logo, Farben, Texte) sind im Draft-State.',
      'Admin ist im Branding-Editor.'
    ],
    behavior: [
      'System rendert einen Iframe mit der Anwendung im Sandbox-Modus.',
      'System wendet die Draft-Branding-Aenderungen auf den Iframe an (temporaere CSS-Variablen + Logo-URL).',
      'Admin kann durch die Preview navigieren und das Branding in verschiedenen Kontexten sehen.',
      'Bei Klick auf "Publizieren": System uebernimmt die Draft-Aenderungen in die produktive Konfiguration.',
      'Bei Klick auf "Verwerfen": System verwirft die Draft-Aenderungen.',
      'System zeigt eine Erfolgs-/Abbruchmeldung.'
    ],
    postconditions: [
      'Bei Publizierung: Branding ist produktiv aktiv.',
      'Bei Verwerfung: Aenderungen sind geloescht, altes Branding bleibt.'
    ],
    errors: [
      'Das System soll bei Iframe-Ladefehler die Meldung "Preview konnte nicht geladen werden" anzeigen.',
      'Das System soll bei Publizierungsfehler den Draft beibehalten und "Publizierung fehlgeschlagen" anzeigen.'
    ],
    acceptance: [
      'Preview zeigt das neue Logo korrekt.',
      'Preview zeigt die neuen Farben korrekt.',
      '"Publizieren" aktiviert das neue Branding fuer alle Nutzer.',
      '"Verwerfen" stellt das alte Branding wieder her.',
      'Iframe rendert die Anwendung funktional.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  }
];

const result = processBatch(data, 'Batch-3 (SOL 7-10)');
console.log(JSON.stringify(result));
