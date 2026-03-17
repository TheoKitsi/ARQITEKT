// fn-batch-2.cjs — SOL 4-6 (38 FN specs)
const { processBatch } = require('./fn-processor.cjs');

const data = [
  // ═══════════════════════════════════════════════════════════
  // SOL-4: Impact Simulation (18 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-4.1.1: Umschichtungs-Konfigurator ---
  {
    id: 'FN-4.1.1.1', parent: 'CMP-4.1.1', title: 'Quell Positionen Waehlen',
    description:
      'Das System muss alle verfuegbaren Positionen des Nutzers als Quelloptionen anzeigen. Gesperrte Positionen werden ausgegraut. Jede Position zeigt: Name, ISIN, Stueckzahl, aktueller Wert, unrealisierter Gewinn/Verlust.\n\n' +
      '- Das System soll Positionen nach Depot gruppiert darstellen.\n' +
      '- Das System soll gesperrte Positionen (z.B. Sperrfrist) nicht auswaehlbar machen.\n' +
      '- Das System soll eine Mehrfachauswahl ermoeglichen.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Mindestens eine aktive Depot-Position existiert.',
      'Umschichtungs-Konfigurator ist geoeffnet.'
    ],
    behavior: [
      'System laedt alle aktiven Positionen des Nutzers aus allen Depots.',
      'System gruppiert Positionen nach Depot.',
      'Pro Position: System zeigt Name, ISIN, Stueckzahl, aktueller Marktwert, unrealisierter G/V.',
      'Gesperrte Positionen (Sperrfrist aktiv) werden ausgegraut und sind nicht klickbar.',
      'Nutzer waehlt eine oder mehrere Positionen per Checkbox.',
      'System berechnet den verfuegbaren Gesamtbetrag der gewaehlten Positionen.',
      'Auswahl wird im Session-State des Konfigurators gespeichert.'
    ],
    postconditions: [
      'Mindestens eine Quell-Position ist ausgewaehlt.',
      'Verfuegbarer Gesamtbetrag ist berechnet.',
      'Auswahl ist im Konfigurator-State gespeichert.'
    ],
    errors: [
      'Das System soll bei keinen verfuegbaren Positionen die Meldung "Keine Positionen verfuegbar" anzeigen.',
      'Das System soll bei ausschliesslich gesperrten Positionen die Meldung "Alle Positionen sind derzeit gesperrt" anzeigen.'
    ],
    acceptance: [
      'Positionen aus 2 Depots werden korrekt gruppiert angezeigt.',
      'Gesperrte Position ist ausgegraut und nicht klickbar.',
      'Mehrfachauswahl berechnet den kumulierten Gesamtbetrag.',
      'Unrealisierter G/V wird korrekt angezeigt (positiv gruen, negativ rot).'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.1.1.2', parent: 'CMP-4.1.1', title: 'Betrag Zuweisen',
    description:
      'Das System muss dem Nutzer ermoeglichen, pro Quell-Position einen Teil- oder Gesamtbetrag fuer die Umschichtung zu definieren.\n\n' +
      '- Das System soll einen Slider und ein numerisches Eingabefeld bereitstellen.\n' +
      '- Das System soll den Betrag als EUR oder als Prozentwert des Positionswerts akzeptieren.\n' +
      '- Das System soll "Alles" als Schnellauswahl-Button anbieten.',
    preconditions: [
      'Mindestens eine Quell-Position ist ausgewaehlt (FN-4.1.1.1).',
      'Aktueller Marktwert der Position ist bekannt.'
    ],
    behavior: [
      'Pro ausgewaehlte Position: System zeigt Slider (0% bis 100%) und Eingabefeld.',
      'Nutzer waehlt den Betrag per Slider, Eingabefeld oder "Alles"-Button.',
      'Bei Prozent-Eingabe: System berechnet den EUR-Betrag.',
      'Bei EUR-Eingabe: System berechnet den Prozentwert.',
      'System validiert: Betrag > 0 und Betrag <= aktueller Marktwert.',
      'System aktualisiert den Gesamtumschichtungsbetrag in Echtzeit.',
      'System speichert die Zuweisung im Konfigurator-State.'
    ],
    postconditions: [
      'Jeder ausgewaehlten Position ist ein Umschichtungsbetrag zugewiesen.',
      'Gesamtumschichtungsbetrag ist berechnet.',
      'Betraege sind im Konfigurator-State gespeichert.'
    ],
    errors: [
      'Das System soll bei Betrag > Marktwert die Meldung "Betrag uebersteigt den aktuellen Wert" anzeigen.',
      'Das System soll bei Betrag = 0 die Meldung "Bitte Betrag eingeben" anzeigen.',
      'Das System soll bei negativem Betrag die Eingabe ablehnen.'
    ],
    acceptance: [
      'Slider auf 50% bei 10000 EUR Position zeigt 5000 EUR.',
      '"Alles"-Button setzt Betrag auf 100% des Marktwerts.',
      'Manuelle EUR-Eingabe von 3000 zeigt 30% bei 10000 EUR Position.',
      'Betrag > Marktwert wird abgelehnt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.1.1.3', parent: 'CMP-4.1.1', title: 'Ziel Definieren',
    description:
      'Das System muss folgende Ziele unterstuetzen: Immobilienkauf, neues Depot, bestehendes Depot aufstocken, Schuldenabbau, Liquiditaetsreserve, Sonstiges.\n\n' +
      '- Das System soll pro Zieltyp spezifische Parameter abfragen.\n' +
      '- Das System soll eine Ziel-Beschreibung als Freitext erlauben.\n' +
      '- Das System soll das Ziel fuer die Impact-Berechnung parametrisieren.',
    preconditions: [
      'Umschichtungsbetrag ist definiert (FN-4.1.1.2).',
      'Konfigurator-Schritt "Ziel" ist aktiv.'
    ],
    behavior: [
      'System zeigt die verfuegbaren Zieltypen als Karten-Auswahl.',
      'Nutzer waehlt einen Zieltyp.',
      'System zeigt zielspezifische Parameter: Immobilienkauf (Kaufpreis, PLZ), Depot (Zieldepot, ISIN), Schuldenabbau (Kredit-ID, Betrag).',
      'Nutzer fuellt die Parameter aus.',
      'Optional: Nutzer gibt eine Freitext-Beschreibung ein.',
      'System speichert den Zieltyp und die Parameter im Konfigurator-State.'
    ],
    postconditions: [
      'Zieltyp und Parameter sind definiert.',
      'Das Ziel ist fuer die Impact-Berechnung (CMP-4.2.1) parametrisiert.',
      'Beschreibung ist optional gespeichert.'
    ],
    errors: [
      'Das System soll bei fehlendem Zieltyp den "Weiter"-Button deaktivieren.',
      'Das System soll bei unvollstaendigen zielspezifischen Parametern eine Fehlermeldung anzeigen.'
    ],
    acceptance: [
      'Zieltyp "Immobilienkauf" zeigt Felder fuer Kaufpreis und PLZ.',
      'Zieltyp "Bestehendes Depot aufstocken" zeigt Dropdown mit vorhandenen Depots.',
      'Freitext-Beschreibung wird gespeichert (max. 500 Zeichen).',
      'Fehlender Zieltyp blockiert Fortschritt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.1.1.4', parent: 'CMP-4.1.1', title: 'Zeitrahmen Konfigurieren',
    description:
      'Das System muss eine Umschichtung als sofort, in X Monaten oder zu Stichtag konfigurierbar machen. Zukunfts-Szenarien nutzen diskontierte Projektionswerte.\n\n' +
      '- Das System soll drei Zeitrahmen-Optionen anbieten: sofort, in X Monaten (1-60), zu Stichtag.\n' +
      '- Das System soll bei sofortiger Umschichtung keine Diskontierung anwenden.\n' +
      '- Das System soll bei zuekuenftiger Umschichtung die erwartete Wertentwicklung projizieren.',
    preconditions: [
      'Quell-Positionen, Betraege und Ziel sind definiert.',
      'Konfigurator-Schritt "Zeitrahmen" ist aktiv.'
    ],
    behavior: [
      'System zeigt drei Radio-Buttons: "Sofort", "In X Monaten", "Zu Stichtag".',
      'Bei "In X Monaten": Nutzer gibt Anzahl Monate ein (1-60, Slider + Eingabefeld).',
      'Bei "Zu Stichtag": Nutzer waehlt ein Datum aus einem Datepicker (Minimum: morgen).',
      'System berechnet den projizierten Wert der Quell-Positionen zum gewaehlten Zeitpunkt.',
      'System speichert den Zeitrahmen im Konfigurator-State.',
      'System stellt die vollstaendige Konfiguration zusammen und aktiviert den "Berechnen"-Button.'
    ],
    postconditions: [
      'Zeitrahmen ist definiert und gespeichert.',
      'Projizierter Wert (bei Zukunft) ist berechnet.',
      'Konfigurator-Konfiguration ist vollstaendig — Impact-Berechnung kann gestartet werden.'
    ],
    errors: [
      'Das System soll bei Monatszahl > 60 die Meldung "Maximal 60 Monate" anzeigen.',
      'Das System soll bei Stichtag in der Vergangenheit die Meldung "Datum muss in der Zukunft liegen" anzeigen.',
      'Das System soll bei fehlender Zeitrahmen-Auswahl den "Berechnen"-Button deaktivieren.'
    ],
    acceptance: [
      '"Sofort" aktiviert direkte Berechnung ohne Diskontierung.',
      '"In 12 Monaten" projiziert den Positionswert 12 Monate in die Zukunft.',
      'Stichtag-Auswahl in der Vergangenheit wird abgelehnt.',
      'Vollstaendige Konfiguration aktiviert den "Berechnen"-Button.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.1.1.5', parent: 'CMP-4.1.1', title: 'Liquiditaetsreserve Warnung',
    description:
      'Das System muss warnen wenn die geplante Umschichtung den empfohlenen Notgroschen (3 Nettomonatsgehaelter) unterschreitet.\n\n' +
      '- Das System soll die aktuelle Liquiditaetsreserve (Tagesgeld + Girokonto) berechnen.\n' +
      '- Das System soll die Rest-Liquiditaet nach Umschichtung berechnen.\n' +
      '- Das System soll bei Unterschreitung eine nicht-blockierende Warnung anzeigen.',
    preconditions: [
      'Umschichtungskonfiguration ist vollstaendig.',
      'Monatliche Einnahmen (FN-1.2.1.1) sind erfasst.',
      'Liquide Konten (Tagesgeld, Girokonto) sind bekannt.'
    ],
    behavior: [
      'System berechnet den empfohlenen Notgroschen: 3 * monatliches Nettoeinkommen.',
      'System berechnet die aktuelle Liquiditaetsreserve: Summe(Tagesgeld + Girokonto).',
      'System berechnet die Rest-Liquiditaet nach Umschichtung: Liquiditaetsreserve - Umschichtungsbetrag_aus_liquiden_Mitteln.',
      'Falls Rest-Liquiditaet < Notgroschen: System zeigt gelbe Warnung "Ihre Liquiditaetsreserve faellt unter den empfohlenen Notgroschen".',
      'Warnung ist informativ (nicht blockierend) — Nutzer kann fortfahren.'
    ],
    postconditions: [
      'Warnung ist angezeigt (oder nicht, wenn Reserve ausreicht).',
      'Nutzer hat die Information bevor die Berechnung gestartet wird.'
    ],
    errors: [
      'Das System soll bei fehlenden Einnahmen-Daten die Warnung nicht anzeigen (kein Notgroschen berechenbar).',
      'Das System soll bei ausschliesslich Depot-Entnahmen (keine liquiden Mittel betroffen) keine Warnung anzeigen.'
    ],
    acceptance: [
      'Nettoeinkommen 3500 EUR, Notgroschen 10500 EUR, Liquiditaet 15000 EUR, Entnahme 8000 EUR: Rest 7000 EUR < 10500 EUR = Warnung.',
      'Rest-Liquiditaet > Notgroschen: Keine Warnung.',
      'Warnung blockiert den Fortschritt nicht.',
      'Fehlende Einnahmen-Daten: Keine Warnung, kein Fehler.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-4.2.1: Cross Impact Engine ---
  {
    id: 'FN-4.2.1.1', parent: 'CMP-4.2.1', title: 'Rendite Delta Berechnen',
    description:
      'Das System muss fuer jede betroffene Position die Rendite-Differenz (vorher vs. nachher) berechnen unter Verwendung der historischen Rendite-Daten.\n\n' +
      '- Das System soll die erwartete Rendite der Quell-Position(en) und der Ziel-Anlage projizieren.\n' +
      '- Das System soll das Delta ueber die konfigurierten Zeitraeume (1, 3, 5, 10 Jahre) berechnen.\n' +
      '- Das System soll positive und negative Deltas farblich unterscheiden.',
    preconditions: [
      'Umschichtungskonfiguration ist vollstaendig (CMP-4.1.1).',
      'Historische Rendite-Daten fuer Quell- und Ziel-Positionen sind verfuegbar.'
    ],
    behavior: [
      'System laedt die historische TTWROR der Quell-Position(en).',
      'System ermittelt die erwartete Rendite der Ziel-Anlage (historisch oder Benchmark-basiert).',
      'Pro Zeitraum (1, 3, 5, 10 Jahre): System projiziert den Quell-Wert = Betrag * (1 + Rendite_Quelle)^Jahre.',
      'Pro Zeitraum: System projiziert den Ziel-Wert = Betrag * (1 + Rendite_Ziel)^Jahre.',
      'System berechnet Delta_EUR = Ziel-Wert - Quell-Wert.',
      'System berechnet Delta_Prozent = (Rendite_Ziel - Rendite_Quelle) in Prozentpunkten.',
      'System speichert die Ergebnisse fuer die Impact-Aggregation (FN-4.2.1.4).'
    ],
    postconditions: [
      'Rendite-Delta ist pro Zeitraum in EUR und Prozentpunkten berechnet.',
      'Ergebnisse sind fuer die Impact-Aggregation verfuegbar.',
      'Positive/negative Deltas sind farblich kodiert.'
    ],
    errors: [
      'Das System soll bei fehlenden historischen Daten der Ziel-Anlage Benchmark-Renditen als Proxy verwenden.',
      'Das System soll bei negativem Ziel-Rendite-Delta eine Warnung "Erwartete Rendite der Ziel-Anlage ist geringer" anzeigen.'
    ],
    acceptance: [
      'Quell-Rendite 8% p.a., Ziel-Rendite 3% p.a., 10000 EUR: nach 5 Jahren Delta = -2893 EUR.',
      'Positive Delta wird gruen, negatives rot dargestellt.',
      'Alle 4 Zeitraeume (1/3/5/10J) zeigen Werte.',
      'Fehlende Ziel-Daten nutzen Benchmark als Proxy.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.1.2', parent: 'CMP-4.2.1', title: 'Opportunitaetskosten Projizieren',
    description:
      'Das System muss die entgangenen Ertraege der umgeschichteten Position ueber 1, 3, 5 und 10 Jahre projizieren mit Monte-Carlo-Simulation (1000 Pfade).\n\n' +
      '- Das System soll eine Monte-Carlo-Simulation mit 1000 Zufallspfaden durchfuehren.\n' +
      '- Das System soll die Ergebnisse als Vertrauensintervall darstellen (P10, P50, P90).\n' +
      '- Das System soll historische Volatilitaet und Rendite fuer die Simulation verwenden.',
    preconditions: [
      'Historische Rendite und Volatilitaet der Quell-Position sind berechnet.',
      'Umschichtungsbetrag ist definiert.'
    ],
    behavior: [
      'System laedt die historische mittlere Rendite (mu) und Volatilitaet (sigma) der Quell-Position.',
      'System generiert 1000 Simulationspfade mit geometrischer Brownscher Bewegung: dS = mu*S*dt + sigma*S*dW.',
      'Pro Pfad und Zeitraum (1/3/5/10J): System berechnet den projizierten Wert.',
      'System sortiert die 1000 Endwerte pro Zeitraum.',
      'System berechnet P10 (pessimistisch), P50 (median), P90 (optimistisch).',
      'System berechnet die Opportunitaetskosten: entgangener Wert = P50 - Umschichtungsbetrag.',
      'System speichert die Ergebnisse fuer die Impact-Aggregation.'
    ],
    postconditions: [
      'Monte-Carlo-Simulation mit 1000 Pfaden ist abgeschlossen.',
      'P10, P50, P90 Werte sind pro Zeitraum berechnet.',
      'Opportunitaetskosten sind quantifiziert.'
    ],
    errors: [
      'Das System soll bei fehlender Volatilitaet die Benchmark-Volatilitaet als Proxy verwenden.',
      'Das System soll bei Berechnungsdauer > 5 Sekunden einen Progress-Indikator anzeigen.',
      'Das System soll bei negativem mu den Nutzer warnen "Position hat historisch negative Rendite".'
    ],
    acceptance: [
      'Simulation berechnet 1000 Pfade in unter 5 Sekunden.',
      'P10 < P50 < P90 fuer alle Zeitraeume.',
      'Opportunitaetskosten werden als EUR-Betrag fuer P50 dargestellt.',
      'Vertrauensintervall wird als Fan-Chart visualisiert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.1.3', parent: 'CMP-4.2.1', title: 'Steuerliche Auswirkung Berechnen',
    description:
      'Das System muss berechnen welche Steuerlast durch die Realisierung von Kursgewinnen bei der Umschichtung entsteht (Abgeltungssteuer + Soli + ggf. KiSt).\n\n' +
      '- Das System soll den unrealisierten Gewinn pro Position berechnen (Marktwert - Einstandskurs * Stueckzahl).\n' +
      '- Das System soll den Sparerpauschbetrag beruecksichtigen (bereits verbrauchter Anteil).\n' +
      '- Das System soll die Steuerlast als Abzug in der Impact-Berechnung einfliessen lassen.',
    preconditions: [
      'Einstandskurse der Quell-Positionen sind berechnet (FN-2.2.1.2).',
      'Steuerprofil des Nutzers ist konfiguriert.',
      'Umschichtungsbetraege sind definiert.'
    ],
    behavior: [
      'Pro Quell-Position: System berechnet den anteiligen realisierten Gewinn basierend auf FIFO.',
      'System berechnet den steuerpflichtigen Gewinn: Realisierter Gewinn - verbleibender Sparerpauschbetrag.',
      'System berechnet Abgeltungssteuer: 25% auf steuerpflichtigen Gewinn.',
      'System berechnet Solidaritaetszuschlag: 5.5% auf Abgeltungssteuer.',
      'Optional: System berechnet Kirchensteuer (8% oder 9% auf Abgeltungssteuer).',
      'System berechnet Gesamtsteuerlast und den Netto-Umschichtungsbetrag.',
      'System speichert die Steuerlast als Impact-Faktor (FN-4.2.1.4).'
    ],
    postconditions: [
      'Steuerlast ist berechnet und aufgeschluesselt.',
      'Netto-Umschichtungsbetrag (nach Steuer) ist ermittelt.',
      'Steuerlast fliesst in den Impact-Score ein.'
    ],
    errors: [
      'Das System soll bei fehlendem Einstandskurs eine Warnung anzeigen und mit Marktwert als Einstandskurs rechnen (Worst-Case: voller Gewinn steuerpflichtig).',
      'Das System soll bei negativem realisierten Gewinn (Verlust) die Steuerlast auf 0 setzen.'
    ],
    acceptance: [
      'Position mit 5000 EUR Gewinn, 1000 EUR Sparerpauschbetrag: Steuer = (5000-1000) * 0.26375 = 1055 EUR.',
      'Verlust-Position: Steuerlast = 0 EUR.',
      'Netto-Umschichtungsbetrag = Brutto - Steuerlast.',
      'Kirchensteuer wird optional korrekt berechnet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.1.4', parent: 'CMP-4.2.1', title: 'Impact Score Aggregieren',
    description:
      'Das System muss einen aggregierten Impact-Score (-100 bis +100) berechnen. Gewichtung: Rendite-Verlust 40%, Opportunitaetskosten 25%, Steuer 20%, Liquiditaet 15%.\n\n' +
      '- Das System soll die Einzel-Impacts normalisieren (auf -100 bis +100 Skala).\n' +
      '- Das System soll den gewichteten Score berechnen.\n' +
      '- Das System soll den Score mit einer qualitativen Einstufung versehen (sehr negativ/negativ/neutral/positiv/sehr positiv).',
    preconditions: [
      'Rendite-Delta (FN-4.2.1.1), Opportunitaetskosten (FN-4.2.1.2), Steuerlast (FN-4.2.1.3) sind berechnet.',
      'Liquiditaetsreserve-Status ist bekannt (FN-4.1.1.5).'
    ],
    behavior: [
      'System normalisiert jeden Impact-Faktor auf die Skala -100 bis +100.',
      'System berechnet gewichteten Score: Score = 0.4*Rendite + 0.25*Opportunitaet + 0.2*Steuer + 0.15*Liquiditaet.',
      'System rundet den Score auf eine Ganzzahl.',
      'System ordnet qualitative Einstufung zu: -100 bis -60 = sehr negativ, -60 bis -20 = negativ, -20 bis +20 = neutral, +20 bis +60 = positiv, +60 bis +100 = sehr positiv.',
      'System speichert den Score und die Einstufung.',
      'System stellt den Score fuer die Visualisierung (CMP-4.2.2) und den Optimierer (CMP-4.3.1) bereit.'
    ],
    postconditions: [
      'Aggregierter Impact-Score (-100 bis +100) ist berechnet.',
      'Qualitative Einstufung ist zugeordnet.',
      'Score ist fuer Visualisierung und Optimierung verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlendem Einzel-Impact den fehlenden Faktor neutral (0) gewichten.',
      'Das System soll bei Score ausserhalb des Bereichs auf -100 bzw. +100 clampen.'
    ],
    acceptance: [
      'Rendite -50, Opportunitaet -30, Steuer -40, Liquiditaet 0: Score = 0.4*(-50)+0.25*(-30)+0.2*(-40)+0.15*0 = -35.5 = -36 (negativ).',
      'Fehlende Opportunitaetskosten: Faktor wird als 0 eingesetzt.',
      'Score = +75 wird als "sehr positiv" eingestuft.',
      'Score wird auf Ganzzahl gerundet.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.1.5', parent: 'CMP-4.2.1', title: 'Sparplan Auswirkung',
    description:
      'Das System muss pruefen ob laufende Sparplaene durch die Umschichtung betroffen sind und den Impact auf die langfristige Vermoegensentwicklung berechnen.\n\n' +
      '- Das System soll alle aktiven Sparplaene des Nutzers laden.\n' +
      '- Das System soll pruefen ob eine Quell-Position Ziel eines Sparplans ist.\n' +
      '- Das System soll den Langfrist-Impact einer Sparplan-Unterbrechung berechnen.',
    preconditions: [
      'Umschichtungskonfiguration ist definiert.',
      'Sparplan-Daten sind verfuegbar.'
    ],
    behavior: [
      'System laedt alle aktiven Sparplaene des Nutzers.',
      'System prueft ob eine Quell-Position gleichzeitig Ziel eines Sparplans ist.',
      'Bei Treffer: System berechnet den Impact einer Sparplan-Unterbrechung ueber 1/3/5/10 Jahre.',
      'System nutzt den Zinseszins-Effekt: Entgangener_Wert = Sparrate * ((1+r)^n - 1) / r.',
      'System zeigt Warnung: "Sparplan auf Position X ist betroffen" mit berechnetem Langfrist-Impact.',
      'System fliessst den Sparplan-Impact in den Gesamt-Impact-Score ein.'
    ],
    postconditions: [
      'Sparplan-Betroffenheit ist geprueft.',
      'Langfrist-Impact ist berechnet (falls betroffen).',
      'Warnung ist angezeigt (falls betroffen).'
    ],
    errors: [
      'Das System soll bei fehlenden Sparplan-Daten den Sparplan-Check ueberspringen und den Impact-Faktor neutral setzen.',
      'Das System soll bei Sparplan auf nicht-betroffene Position keine Warnung anzeigen.'
    ],
    acceptance: [
      'Sparplan auf MSCI World ETF: Bei Umschichtung dieser Position wird Warnung angezeigt.',
      'Sparrate 200 EUR/Monat, 7% Rendite, 10 Jahre: Entgangener Wert ca. 34.600 EUR.',
      'Sparplan auf andere Position: Keine Warnung.',
      'Fehlende Sparplan-Daten: Kein Fehler, neutraler Impact.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-4.2.2: Impact Visualisierung ---
  {
    id: 'FN-4.2.2.1', parent: 'CMP-4.2.2', title: 'Sankey Diagramm Rendern',
    description:
      'Das System muss die Kapitalfluesse als interaktives Sankey-Diagramm visualisieren. Quellen links, Ziele rechts, Flussbreite proportional zum Betrag.\n\n' +
      '- Das System soll Apache ECharts (Sankey-Serie) fuer das Rendering verwenden.\n' +
      '- Das System soll interaktive Tooltips mit Betraegen anzeigen.\n' +
      '- Das System soll die Steuerlast als separaten Abfluss-Knoten darstellen.',
    preconditions: [
      'Impact-Berechnung ist abgeschlossen (CMP-4.2.1).',
      'Quell-Positionen, Betraege und Ziel sind bekannt.'
    ],
    behavior: [
      'System bereitet die Sankey-Daten vor: Quell-Knoten (links), Ziel-Knoten (rechts), Steuerknoten.',
      'System berechnet die Flussbreiten proportional zum Betrag.',
      'System rendert das Sankey-Diagramm via ECharts.',
      'Bei Hover: System zeigt Tooltip mit exaktem Betrag und Prozentanteil.',
      'System faerbt positive Fluesse gruen und Steuer-Abfluss rot.',
      'System passt die Darstellung responsiv an (Desktop vs. Tablet).'
    ],
    postconditions: [
      'Sankey-Diagramm ist gerendert und interaktiv.',
      'Alle Kapitalfluesse sind visuell dargestellt.',
      'Steuerlast ist als separater Abfluss sichtbar.'
    ],
    errors: [
      'Das System soll bei fehlenden Daten eine Platzhalter-Nachricht "Keine Daten fuer Visualisierung" anzeigen.',
      'Das System soll bei Rendering-Fehler ein Fallback als Tabelle anzeigen.'
    ],
    acceptance: [
      'Sankey zeigt Quell-Position(en) links und Ziel(e) rechts.',
      'Flussbreiten sind proportional zu den Betraegen.',
      'Tooltip zeigt exakten EUR-Betrag bei Hover.',
      'Steuerlast-Knoten ist rot gefaerbt.',
      'Responsive Darstellung auf Tablet funktioniert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.2.2', parent: 'CMP-4.2.2', title: 'Waterfall Chart Rendern',
    description:
      'Das System muss die Rendite-Deltas als Waterfall-Chart darstellen: gruene Balken fuer positive, rote fuer negative Impacts, Summenbalken am Ende.\n\n' +
      '- Das System soll Apache ECharts (Bar-Serie mit Waterfall-Logik) verwenden.\n' +
      '- Das System soll die einzelnen Impact-Faktoren als Stufen darstellen.\n' +
      '- Das System soll den Summenbalken farblich hervorheben.',
    preconditions: [
      'Einzel-Impacts (Rendite, Opportunitaet, Steuer, Liquiditaet) sind berechnet.',
      'Impact-Score ist aggregiert (FN-4.2.1.4).'
    ],
    behavior: [
      'System bereitet Waterfall-Daten vor: Ein Balken pro Impact-Faktor + Summenbalken.',
      'Positive Impacts: Gruener Balken nach oben.',
      'Negative Impacts: Roter Balken nach unten.',
      'System berechnet die kumulative Summe als Endbalken (blau).',
      'System rendert das Waterfall-Chart via ECharts.',
      'Bei Hover: Tooltip zeigt den einzelnen Impact-Wert und die kumulative Summe.'
    ],
    postconditions: [
      'Waterfall-Chart ist gerendert mit allen Impact-Faktoren.',
      'Summenbalken zeigt den Gesamteffekt.',
      'Farbkodierung (gruen/rot/blau) ist korrekt.'
    ],
    errors: [
      'Das System soll bei nur einem Impact-Faktor das Chart dennoch anzeigen (ein Balken + Summe).',
      'Das System soll bei Rendering-Fehler ein Fallback als Tabelle anzeigen.'
    ],
    acceptance: [
      'Rendite-Delta (-500), Steuer (-200), Liquiditaet (+100): Waterfall zeigt 3 Stufen + Summe (-600).',
      'Positive Balken sind gruen, negative rot.',
      'Summenbalken ist blau.',
      'Tooltip zeigt korrekte Werte bei Hover.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.2.3', parent: 'CMP-4.2.2', title: 'Impact Gauge Anzeigen',
    description:
      'Das System muss den Impact-Score als Gauge-Indikator (Tachometer-Stil) anzeigen: rot (-100 bis -30), gelb (-30 bis +30), gruen (+30 bis +100).\n\n' +
      '- Das System soll Apache ECharts (Gauge-Serie) verwenden.\n' +
      '- Das System soll den numerischen Score im Zentrum des Gauges anzeigen.\n' +
      '- Das System soll die qualitative Einstufung unter dem Gauge als Text anzeigen.',
    preconditions: [
      'Impact-Score ist berechnet (FN-4.2.1.4).'
    ],
    behavior: [
      'System rendert ein halbkreisfoermiges Gauge-Chart via ECharts.',
      'System teilt den Bereich in 3 Farb-Zonen: rot (-100 bis -30), gelb (-30 bis +30), gruen (+30 bis +100).',
      'System positioniert die Nadel auf dem aktuellen Score-Wert.',
      'System zeigt den numerischen Score im Zentrum (grosse Schrift).',
      'System zeigt die qualitative Einstufung (z.B. "negativ") unter dem Gauge.',
      'System animiert die Nadel beim ersten Rendern (Sweep-Animation).'
    ],
    postconditions: [
      'Gauge ist gerendert mit korrekter Nadelposition.',
      'Farb-Zonen sind korrekt.',
      'Numerischer Score und qualitative Einstufung sind sichtbar.'
    ],
    errors: [
      'Das System soll bei Score = NaN das Gauge ausblenden und "Berechnung fehlgeschlagen" anzeigen.',
      'Das System soll bei Rendering-Fehler den Score als grosse Zahl ohne Chart anzeigen.'
    ],
    acceptance: [
      'Score -50 zeigt Nadel im roten Bereich.',
      'Score 0 zeigt Nadel im gelben Bereich.',
      'Score +70 zeigt Nadel im gruenen Bereich.',
      'Animation laeuft beim ersten Laden.',
      'Qualitative Einstufung stimmt mit Score ueberein.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.2.2.4', parent: 'CMP-4.2.2', title: 'Vergleichs Timeline',
    description:
      'Das System muss zwei Vermoegens-Verlaeufe ueberlagert anzeigen: (1) ohne Umschichtung, (2) mit Umschichtung, ueber die naechsten 1-10 Jahre.\n\n' +
      '- Das System soll Apache ECharts (Line-Serie) mit zwei Linien verwenden.\n' +
      '- Das System soll den Differenzbereich zwischen den Linien farblich hervorheben (gruen wenn mit > ohne, rot wenn mit < ohne).\n' +
      '- Das System soll interaktive Zeitraum-Auswahl (1/3/5/10 Jahre) ermoeglichen.',
    preconditions: [
      'Monte-Carlo-Projektion (FN-4.2.1.2) fuer beide Szenarien ist abgeschlossen.',
      'Steuerlast ist berechnet (FN-4.2.1.3).'
    ],
    behavior: [
      'System berechnet den projizierten Vermoegensverlauf ohne Umschichtung (Status Quo).',
      'System berechnet den projizierten Verlauf mit Umschichtung (unter Beruecksichtigung von Steuer und neuer Allokation).',
      'System rendert beide Linien ueberlagert via ECharts.',
      'System faerbt den Bereich zwischen den Linien: gruen (mit > ohne), rot (mit < ohne).',
      'Nutzer kann den Zeitraum per Buttons (1/3/5/10J) umschalten.',
      'Bei Hover: Tooltip zeigt beide Werte und die Differenz.'
    ],
    postconditions: [
      'Zwei Vermoegensverlauf-Linien sind gerendert.',
      'Differenzbereich ist farblich hervorgehoben.',
      'Zeitraum-Umschaltung funktioniert.'
    ],
    errors: [
      'Das System soll bei fehlender Projektion die Meldung "Projektion nicht verfuegbar" anzeigen.',
      'Das System soll bei Zeitraum-Umschaltung das Chart smooth animieren (kein Flackern).'
    ],
    acceptance: [
      'Linie "ohne Umschichtung" und "mit Umschichtung" sind unterscheidbar.',
      'Gruener Bereich zeigt wo Umschichtung vorteilhaft ist.',
      'Roter Bereich zeigt wo Umschichtung nachteilig ist.',
      'Zeitraum-Wechsel von 5J auf 10J animiert smooth.',
      'Tooltip zeigt beide Werte und Delta.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-4.3.1: Optimierungs-Algorithmus ---
  {
    id: 'FN-4.3.1.1', parent: 'CMP-4.3.1', title: 'Szenarien Generieren',
    description:
      'Das System muss mittels genetischem Algorithmus (Population 100, max 50 Generationen) bis zu 3 optimierte Umschichtungs-Szenarien generieren.\n\n' +
      '- Das System soll den genetischen Algorithmus (GA) mit konfigurierbaren Parametern implementieren.\n' +
      '- Das System soll als Chromosom die Umschichtungsverteilung kodieren (Betragsanteile pro Quell-Position).\n' +
      '- Das System soll die Top-3-Szenarien basierend auf der Fitness-Funktion (FN-4.3.1.2) auswaehlen.',
    preconditions: [
      'Mindestens eine Umschichtungskonfiguration existiert.',
      'Cross-Impact-Engine (CMP-4.2.1) ist verfuegbar fuer Fitness-Bewertung.'
    ],
    behavior: [
      'System erzeugt eine Initialpopulation von 100 zufaelligen Umschichtungsverteilungen.',
      'Pro Chromosom: System kodiert die Betragsanteile pro Quell-Position und Ziel.',
      'Pro Generation: System bewertet jedes Chromosom mit der Fitness-Funktion (FN-4.3.1.2).',
      'System selektiert die besten 50% (Tournament-Selektion).',
      'System erzeugt Nachkommen via Crossover (Single-Point) und Mutation (Gauss, sigma=5%).',
      'System iteriert bis Generation 50 oder bis Konvergenz (Top-Fitness aendert sich < 0.1% ueber 5 Generationen).',
      'System waehlt die Top-3-Chromosomen nach Fitness.',
      'System dekodiert die Chromosomen in lesbare Umschichtungs-Szenarien.'
    ],
    postconditions: [
      'Bis zu 3 optimierte Szenarien sind generiert.',
      'Jedes Szenario hat einen Fitness-Score und eine Umschichtungsverteilung.',
      'Szenarien sind fuer den Side-by-Side-Vergleich (FN-4.3.1.3) verfuegbar.'
    ],
    errors: [
      'Das System soll bei Berechnungsdauer > 30 Sekunden einen Progress-Indikator mit Generationszaehler anzeigen.',
      'Das System soll bei Nicht-Konvergenz die Top-3 nach 50 Generationen zurueckgeben.',
      'Das System soll bei identischen Top-3 nur die einzigartigen Szenarien anzeigen.'
    ],
    acceptance: [
      'GA erzeugt 3 unterscheidbare Szenarien innerhalb von 30 Sekunden.',
      'Konvergenz stoppt frueh wenn Top-Fitness stabil ist.',
      'Top-3-Szenarien haben unterschiedliche Verteilungen.',
      'Progress-Indikator zeigt aktuelle Generation.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.3.1.2', parent: 'CMP-4.3.1', title: 'Fitness Funktion Auswerten',
    description:
      'Das System muss jedes Szenario mit der Cross-Impact-Engine bewerten. Fitness = gewichteter Score aus: min. Rendite-Verlust (40%), min. Steuerlast (20%), max. Ziel-Erreichung (25%), Liquiditaet (15%).\n\n' +
      '- Das System soll die Fitness-Funktion deterministisch berechnen.\n' +
      '- Das System soll die Gewichte konfigurierbar halten.\n' +
      '- Das System soll die Fitness auf eine Skala von 0.0 bis 1.0 normalisieren.',
    preconditions: [
      'Cross-Impact-Engine kann ein Szenario bewerten.',
      'Gewichte sind konfiguriert (Standard: 40/20/25/15).'
    ],
    behavior: [
      'System dekodiert das Chromosom in eine Umschichtungskonfiguration.',
      'System ruft die Cross-Impact-Engine (CMP-4.2.1) fuer das Szenario auf.',
      'System extrahiert: Rendite-Delta, Steuerlast, Ziel-Erreichungsgrad, Liquiditaets-Status.',
      'System normalisiert jeden Faktor auf [0, 1].',
      'System berechnet Fitness = 0.40*(1-Norm_Rendite_Verlust) + 0.20*(1-Norm_Steuer) + 0.25*Norm_Ziel + 0.15*Norm_Liquiditaet.',
      'System gibt den Fitness-Wert [0.0, 1.0] zurueck.'
    ],
    postconditions: [
      'Fitness-Wert [0.0, 1.0] ist fuer das Szenario berechnet.',
      'Einzel-Faktoren sind nachvollziehbar aufgeschluesselt.'
    ],
    errors: [
      'Das System soll bei fehlender Impact-Berechnung Fitness = 0.0 zurueckgeben.',
      'Das System soll bei Timeout der Impact-Engine das Szenario als "nicht bewertbar" markieren.'
    ],
    acceptance: [
      'Szenario mit niedrigem Rendite-Verlust und hoher Ziel-Erreichung erhaelt hohe Fitness (> 0.7).',
      'Szenario mit hoher Steuerlast und niedriger Ziel-Erreichung erhaelt niedrige Fitness (< 0.3).',
      'Fitness-Wert liegt immer zwischen 0.0 und 1.0.',
      'Gewichtsaenderung durch Admin beeinflusst das Ergebnis.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.3.1.3', parent: 'CMP-4.3.1', title: 'Side by Side Vergleich',
    description:
      'Das System muss die Top-3-Szenarien in einer Vergleichstabelle darstellen: Impact-Score, Rendite-Delta, Steuerlast, Liquiditaet, Fitness.\n\n' +
      '- Das System soll die Szenarien als Spalten und die Metriken als Zeilen anzeigen.\n' +
      '- Das System soll den besten Wert pro Zeile hervorheben (Bold + Farbe).\n' +
      '- Das System soll eine "Uebernehmen"-Aktion pro Szenario bieten.',
    preconditions: [
      'Top-3-Szenarien sind generiert (FN-4.3.1.1).',
      'Alle Metriken sind berechnet.'
    ],
    behavior: [
      'System rendert eine Vergleichstabelle mit 3 Spalten (Szenarien) und N Zeilen (Metriken).',
      'Metriken: Impact-Score, Rendite-Delta (EUR + pp), Steuerlast (EUR), Netto-Ergebnis, Liquiditaetsreserve, Fitness-Score.',
      'System hebt den besten Wert pro Zeile hervor (fett + gruen).',
      'Pro Szenario: System zeigt einen "Uebernehmen"-Button.',
      'Bei Klick auf "Uebernehmen": System laedt das Szenario in den Konfigurator und zeigt die Detailansicht.'
    ],
    postconditions: [
      'Vergleichstabelle ist gerendert mit allen Metriken.',
      'Bester Wert pro Zeile ist hervorgehoben.',
      '"Uebernehmen"-Aktion ist funktional.'
    ],
    errors: [
      'Das System soll bei weniger als 3 Szenarien nur die vorhandenen Spalten anzeigen.',
      'Das System soll bei identischen Werten beide Spalten hervorheben.'
    ],
    acceptance: [
      'Tabelle zeigt 3 Szenarien nebeneinander.',
      'Bester Impact-Score ist fett + gruen markiert.',
      '"Uebernehmen" laed das Szenario in den Konfigurator.',
      'Bei nur 2 Szenarien werden 2 Spalten angezeigt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-4.3.1.4', parent: 'CMP-4.3.1', title: 'Szenario Exportieren',
    description:
      'Das System muss ein gewaehltes Szenario als PDF exportieren koennen mit allen Berechnungsdetails, Annahmen und Visualisierungen.\n\n' +
      '- Das System soll den PDF-Export ueber den Report-Generator (CMP-8.2.1) realisieren.\n' +
      '- Das System soll alle Charts als statische Bilder in das PDF einbetten.\n' +
      '- Das System soll einen Disclaimer und das Erstelldatum inkludieren.',
    preconditions: [
      'Ein Szenario ist ausgewaehlt.',
      'Report-Generator (CMP-8.2.1) ist verfuegbar.'
    ],
    behavior: [
      'Nutzer klickt "Als PDF exportieren" bei einem Szenario.',
      'System kompiliert die Szenario-Daten: Konfiguration, Impact-Analyse, Metriken.',
      'System rendert alle Charts als statische Bilder (Sankey, Waterfall, Gauge, Timeline).',
      'System delegiert die PDF-Generierung an den Report-Generator (FN-8.2.1.1).',
      'System fuegt Disclaimer, Erstelldatum und Mandanten-Branding hinzu.',
      'System bietet den PDF-Download an.'
    ],
    postconditions: [
      'PDF-Report ist generiert und zum Download bereit.',
      'Alle Berechnungsdetails und Visualisierungen sind im PDF enthalten.',
      'Disclaimer und Branding sind korrekt.'
    ],
    errors: [
      'Das System soll bei PDF-Generierungsfehler eine Fehlermeldung anzeigen und einen Retry anbieten.',
      'Das System soll bei Chart-Rendering-Fehler das Chart durch eine Tabelle ersetzen.'
    ],
    acceptance: [
      'PDF enthaelt Szenario-Konfiguration, alle Metriken und alle Charts.',
      'Disclaimer ist am Ende des PDFs vorhanden.',
      'Mandanten-Logo ist in der Kopfzeile.',
      'PDF-Groesse ist <= 10 MB.',
      'Download startet innerhalb von 10 Sekunden.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-5: KI Advisory (8 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-5.1.1: Gemini Chat Interface ---
  {
    id: 'FN-5.1.1.1', parent: 'CMP-5.1.1', title: 'Chat Nachricht Senden',
    description:
      'Das System muss Freitext-Nachrichten des Nutzers an die Gemini 2.0 Flash API senden. Der System-Prompt enthaelt: Nutzerprofil, Risikokategorie, aktuelle Portfolio-Zusammenfassung.\n\n' +
      '- Das System soll PII (Personally Identifiable Information) vor dem Senden an Gemini maskieren.\n' +
      '- Das System soll den System-Prompt dynamisch mit dem aktuellen Nutzerprofil anreichern.\n' +
      '- Das System soll die Konversationshistorie (letzte 10 Messages) im Kontext mitsenden.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Gemini API-Key ist konfiguriert.',
      'Nutzerprofil und Portfolio-Daten sind verfuegbar.'
    ],
    behavior: [
      'Nutzer gibt eine Freitext-Nachricht in das Chat-Eingabefeld ein.',
      'System erstellt den System-Prompt: Rolle (Finanzassistent), Nutzerprofil (Risikoklasse, Vermoegen), Portfolio-Zusammenfassung.',
      'System maskiert PII: Name -> [NAME], IBAN -> [IBAN], E-Mail -> [EMAIL].',
      'System laedt die letzten 10 Messages der Konversation als Kontext.',
      'System sendet die Anfrage an Gemini 2.0 Flash API.',
      'System speichert die Nutzernachricht in der Konversationshistorie.',
      'System wartet auf die Streaming-Antwort (FN-5.1.1.2).'
    ],
    postconditions: [
      'Nachricht ist an Gemini gesendet.',
      'PII ist maskiert (kein Klartext an Drittanbieter).',
      'Nutzernachricht ist in der Konversationshistorie gespeichert.'
    ],
    errors: [
      'Das System soll bei Gemini-API-Fehler (500/503) dem Nutzer "Assistent derzeit nicht verfuegbar" anzeigen.',
      'Das System soll bei leerem Eingabefeld den Senden-Button deaktivieren.',
      'Das System soll bei PII-Maskierungsfehler die Nachricht nicht senden und den Vorfall loggen.'
    ],
    acceptance: [
      'Nachricht wird mit korrektem System-Prompt an Gemini gesendet.',
      'PII (Name, IBAN) ist im API-Call maskiert.',
      'Konversationshistorie enthaelt die letzten 10 Messages.',
      'API-Fehler zeigt benutzerfreundliche Meldung.',
      'Leeres Eingabefeld = Senden deaktiviert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: ['CONV-CHAT-GENERAL']
  },
  {
    id: 'FN-5.1.1.2', parent: 'CMP-5.1.1', title: 'Streaming Antwort',
    description:
      'Das System muss Gemini-Antworten als Server-Sent-Events streamen, sodass der Nutzer die Antwort Token fuer Token sieht.\n\n' +
      '- Das System soll SSE (Server-Sent Events) fuer das Streaming verwenden.\n' +
      '- Das System soll einen Typing-Indikator waehrend der Generierung anzeigen.\n' +
      '- Das System soll die vollstaendige Antwort nach Abschluss in der Konversationshistorie speichern.',
    preconditions: [
      'Nachricht wurde an Gemini gesendet (FN-5.1.1.1).',
      'SSE-Verbindung zum Backend ist offen.'
    ],
    behavior: [
      'Backend empfaengt die Gemini-Streaming-Response.',
      'Backend leitet jeden Token als SSE-Event an das Frontend weiter.',
      'Frontend zeigt einen Typing-Indikator (pulsierende Punkte).',
      'Frontend fuegt jeden Token in die Chat-Bubble ein (inkrementell).',
      'Bei Abschluss des Streams: Frontend entfernt den Typing-Indikator.',
      'System speichert die vollstaendige Antwort in der Konversationshistorie.',
      'System zeigt den Disclaimer (FN-5.1.1.4) unter der Antwort an.'
    ],
    postconditions: [
      'Vollstaendige Antwort ist im Chat sichtbar.',
      'Antwort ist in der Konversationshistorie gespeichert.',
      'Disclaimer ist unter der Antwort sichtbar.'
    ],
    errors: [
      'Das System soll bei SSE-Verbindungsabbruch die bisher empfangenen Tokens anzeigen und "Antwort unvollstaendig" hinzufuegen.',
      'Das System soll bei Gemini-Timeout (>30s) den Typing-Indikator entfernen und "Zeitueberschreitung" anzeigen.',
      'Das System soll bei Content-Filter-Trigger (unsafe content) stattdessen "Ich kann diese Frage leider nicht beantworten" anzeigen.'
    ],
    acceptance: [
      'Antwort erscheint Token fuer Token im Chat.',
      'Typing-Indikator ist waehrend der Generierung sichtbar.',
      'Vollstaendige Antwort ist nach Abschluss gespeichert.',
      'SSE-Abbruch zeigt Teilantwort + Hinweis.',
      'Timeout nach 30s zeigt Fehlermeldung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-5.1.1.3', parent: 'CMP-5.1.1', title: 'Rate Limiting',
    description:
      'Das System muss KI-Anfragen auf maximal 20 pro Stunde pro Nutzer begrenzen. Bei Ueberschreitung wird eine freundliche Hinweismeldung angezeigt.\n\n' +
      '- Das System soll ein Sliding-Window Rate-Limiting implementieren.\n' +
      '- Das System soll den verbleibenden Kontingent im UI anzeigen.\n' +
      '- Das System soll das Rate-Limit pro Mandant konfigurierbar machen.',
    preconditions: [
      'Nutzer ist authentifiziert.',
      'Redis ist verfuegbar fuer Counter-Verwaltung.'
    ],
    behavior: [
      'Bei jeder KI-Anfrage: System prueft den Counter im Redis (Sliding-Window: 1 Stunde).',
      'Falls Counter < Limit (Standard 20): System inkrementiert Counter und erlaubt die Anfrage.',
      'Falls Counter >= Limit: System blockiert die Anfrage und zeigt "Sie haben das Limit von 20 Anfragen pro Stunde erreicht. Bitte versuchen Sie es in X Minuten erneut."',
      'System zeigt im Chat-UI den verbleibenden Counter: "X von 20 Anfragen verbleibend".',
      'System setzt den Counter automatisch nach Ablauf des Sliding-Windows zurueck.'
    ],
    postconditions: [
      'Counter ist aktualisiert.',
      'Bei Limit-Ueberschreitung ist die Anfrage blockiert.',
      'Nutzer sieht verbleibendes Kontingent.'
    ],
    errors: [
      'Das System soll bei Redis-Ausfall das Rate-Limiting deaktivieren (fail-open) und den Vorfall loggen.',
      'Das System soll bei Counter-Inkonsistenz den Counter zuruecksetzen.'
    ],
    acceptance: [
      '20. Anfrage wird erlaubt, 21. wird blockiert.',
      'Nach 60 Minuten ist das Kontingent wieder verfuegbar.',
      'UI zeigt "3 von 20 Anfragen verbleibend" korrekt an.',
      'Mandant mit konfiguriertem Limit von 50 erlaubt 50 Anfragen.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-5.1.1.4', parent: 'CMP-5.1.1', title: 'Disclaimer Anzeigen',
    description:
      'Das System muss unter jeder KI-Antwort einen Disclaimer anzeigen: "Keine Anlageberatung im Sinne des WpHG. Automatisch generierter Inhalt — bitte verifizieren."\n\n' +
      '- Das System soll den Disclaimer als nicht-entfernbare Fusszeile unter jeder KI-Antwort anzeigen.\n' +
      '- Das System soll den Disclaimer-Text mandantenspezifisch konfigurierbar machen.\n' +
      '- Das System soll den Disclaimer visuell dezent aber lesbar darstellen (kleinere Schrift, grau).',
    preconditions: [
      'Eine KI-Antwort wurde generiert.'
    ],
    behavior: [
      'System laedt den mandantenspezifischen Disclaimer-Text (oder Standard-Text).',
      'System fuegt den Disclaimer als Fusszeile unter die KI-Antwort ein.',
      'System rendert den Disclaimer in kleinerer Schrift (12px) und grauer Farbe.',
      'Disclaimer ist nicht klickbar und nicht entfernbar.',
      'Bei Export (PDF): Disclaimer wird ebenfalls inkludiert.'
    ],
    postconditions: [
      'Disclaimer ist unter der KI-Antwort sichtbar.',
      'Disclaimer-Text entspricht der Mandanten-Konfiguration.'
    ],
    errors: [
      'Das System soll bei fehlendem Mandanten-Disclaimer den Standard-Text verwenden.',
      'Das System soll bei Rendering-Fehler den Disclaimer als Plain-Text anzeigen.'
    ],
    acceptance: [
      'Standard-Disclaimer ist unter jeder KI-Antwort sichtbar.',
      'Mandanten-spezifischer Disclaimer wird korrekt angezeigt.',
      'Disclaimer ist visuell dezent (klein, grau).',
      'Disclaimer erscheint auch im PDF-Export.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-5.2.1: Szenario-Erklaerungsmodul ---
  {
    id: 'FN-5.2.1.1', parent: 'CMP-5.2.1', title: 'Impact Erklaerung Generieren',
    description:
      'Das System muss ein Impact-Szenario in einen strukturierten Prompt uebersetzen: Zusammenfassung, Hauptfaktoren, Risiken, Empfehlungen.\n\n' +
      '- Das System soll die Impact-Daten (CMP-4.2.1) in natuerliche Sprache umwandeln.\n' +
      '- Das System soll den Prompt so strukturieren, dass Gemini eine verstaendliche Erklaerung generiert.\n' +
      '- Das System soll Structured Output von Gemini anfordern (JSON mit definierten Feldern).',
    preconditions: [
      'Ein Impact-Szenario ist berechnet.',
      'Gemini API ist verfuegbar.'
    ],
    behavior: [
      'System kompiliert die Szenario-Daten: Impact-Score, Rendite-Delta, Steuerlast, Opportunitaetskosten, Liquiditaetsreserve.',
      'System erstellt einen strukturierten Prompt: "Erklaere dem Nutzer das folgende Szenario in verstaendlicher Sprache..."',
      'System spezifiziert das Structured-Output-Schema: { zusammenfassung: string, hauptfaktoren: string[], risiken: string[], empfehlung: string }.',
      'System sendet den Prompt an Gemini 2.0 Flash mit Structured Output.',
      'System empfaengt und parst die strukturierte Antwort.',
      'System zeigt die Erklaerung im UI: Zusammenfassung oben, Faktoren als Liste, Risiken rot hervorgehoben, Empfehlung als Call-to-Action.'
    ],
    postconditions: [
      'Strukturierte Erklaerung ist generiert und angezeigt.',
      'Alle Felder (Zusammenfassung, Faktoren, Risiken, Empfehlung) sind befuellt.'
    ],
    errors: [
      'Das System soll bei Gemini-Fehler eine generische Erklaerung aus Template-Text generieren.',
      'Das System soll bei ungueltigem Structured Output den Rohtext anzeigen.',
      'Das System soll bei Zahlen-Diskrepanz (FN-5.2.1.2) eine Korrektur-Annotation einfuegen.'
    ],
    acceptance: [
      'Erklaerung enthaelt alle 4 Abschnitte (Zusammenfassung, Faktoren, Risiken, Empfehlung).',
      'Erklaerung ist in verstaendlicher Sprache (kein Fachjargon).',
      'Bei Gemini-Fehler wird Template-Text angezeigt.',
      'Structured Output wird korrekt geparst und dargestellt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: ['CONV-IMPACT-EXPLAIN']
  },
  {
    id: 'FN-5.2.1.2', parent: 'CMP-5.2.1', title: 'Zahlen Validieren',
    description:
      'Das System muss alle von der KI genannten Zahlen gegen die berechneten Werte pruefen. Bei Abweichung groesser 2% wird die KI-Zahl durch den korrekten Wert ersetzt und ein Korrektur-Hinweis angezeigt.\n\n' +
      '- Das System soll numerische Werte in der KI-Antwort per Regex extrahieren.\n' +
      '- Das System soll extrahierte Zahlen mit den Ground-Truth-Werten der Impact-Berechnung abgleichen.\n' +
      '- Das System soll bei Korrektur eine Annotation "Korrigierter Wert (KI-Angabe: X)" anzeigen.',
    preconditions: [
      'KI-Antwort (Impact-Erklaerung) ist generiert.',
      'Ground-Truth-Werte aus der Impact-Berechnung sind verfuegbar.'
    ],
    behavior: [
      'System extrahiert alle numerischen Werte aus der KI-Antwort (Regex: Zahlen mit EUR, %, pp).',
      'System ordnet extrahierte Zahlen den Ground-Truth-Werten zu (Matching via Kontext).',
      'Pro Zahl: System berechnet die Abweichung: |KI-Wert - Ground-Truth| / Ground-Truth * 100.',
      'Bei Abweichung <= 2%: KI-Wert wird beibehalten.',
      'Bei Abweichung > 2%: KI-Wert wird durch Ground-Truth ersetzt.',
      'System fuegt eine Korrektur-Annotation ein (Tooltip: "Korrigiert. KI-Angabe: X").',
      'System loggt die Korrektur fuer Qualitaets-Monitoring.'
    ],
    postconditions: [
      'Alle Zahlen in der KI-Antwort sind validiert.',
      'Abweichungen > 2% sind korrigiert und annotiert.',
      'Korrektur-Events sind geloggt.'
    ],
    errors: [
      'Das System soll bei nicht-zuordenbarer Zahl die Zahl unkorrigiert lassen und eine Warnung loggen.',
      'Das System soll bei fehlender Ground-Truth die Validierung fuer diesen Wert ueberspringen.'
    ],
    acceptance: [
      'KI sagt "Rendite-Delta: -520 EUR", Ground-Truth: -500 EUR (Abweichung 4%): Korrektur auf -500 EUR.',
      'KI sagt "Steuerlast: 1050 EUR", Ground-Truth: 1055 EUR (Abweichung 0.5%): Keine Korrektur.',
      'Korrektur-Annotation ist als Tooltip sichtbar.',
      'Korrektur wird im Quality-Monitoring-Log gespeichert.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-5.2.1.3', parent: 'CMP-5.2.1', title: 'Risiken Identifizieren',
    description:
      'Das System muss dem KI-Prompt explizit die Top-3-Risiken des Szenarios mitgeben (hoechste negative Einzel-Impacts) damit die KI-Erklaerung diese adressiert.\n\n' +
      '- Das System soll die Risiken aus den Einzel-Impact-Faktoren ableiten.\n' +
      '- Das System soll die Risiken nach Schwere sortieren (hoechster negativer Impact zuerst).\n' +
      '- Das System soll die Risiken im Prompt als "Identifizierte Risiken" strukturieren.',
    preconditions: [
      'Einzel-Impacts sind berechnet (CMP-4.2.1).',
      'Mindestens ein negativer Impact-Faktor existiert.'
    ],
    behavior: [
      'System laedt alle Einzel-Impact-Faktoren des Szenarios.',
      'System filtert die negativen Faktoren.',
      'System sortiert nach absolutem negativem Wert absteigend.',
      'System waehlt die Top-3 Risiken aus.',
      'System formuliert die Risiken als strukturierte Liste: Risiko-Beschreibung, Impact-Wert, betroffener Bereich.',
      'System fuegt die Risiken als "Identifizierte Risiken" in den KI-Prompt ein.'
    ],
    postconditions: [
      'Top-3-Risiken sind identifiziert und im Prompt enthalten.',
      'KI-Erklaerung adressiert die identifizierten Risiken.'
    ],
    errors: [
      'Das System soll bei 0 negativen Impacts den Prompt ohne Risiken senden und "Keine wesentlichen Risiken identifiziert" erwaehnen.',
      'Das System soll bei weniger als 3 Risiken die vorhandenen nutzen.'
    ],
    acceptance: [
      'Top-3 Risiken: Rendite-Verlust (-50pp), Steuerlast (-2000 EUR), Sparplan-Unterbrechung.',
      'Risiken sind nach Schwere sortiert.',
      'KI-Erklaerung erwaehnt alle 3 Risiken.',
      'Bei 0 Risiken: Hinweis "Keine wesentlichen Risiken".'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-5.2.1.4', parent: 'CMP-5.2.1', title: 'Naechste Schritte Vorschlagen',
    description:
      'Das System muss basierend auf dem Szenario-Ergebnis konkrete Handlungsempfehlungen generieren: z.B. Termin beim Berater, Sparplan anpassen, Alternative pruefen.\n\n' +
      '- Das System soll die Empfehlungen kontextabhaengig aus dem Impact-Ergebnis ableiten.\n' +
      '- Das System soll die Empfehlungen als Click-to-Action-Buttons anzeigen.\n' +
      '- Das System soll maximal 3 Empfehlungen anzeigen.',
    preconditions: [
      'Impact-Erklaerung ist generiert (FN-5.2.1.1).',
      'Impact-Score und Einzel-Faktoren sind bekannt.'
    ],
    behavior: [
      'System analysiert den Impact-Score und die Einzel-Faktoren.',
      'Bei negativem Score (< -20): System empfiehlt "Alternative Umschichtung pruefen" und "Termin mit Berater vereinbaren".',
      'Bei neutralem Score (-20 bis +20): System empfiehlt "Szenario verfeinern" und "Weitere Informationen einholen".',
      'Bei positivem Score (> +20): System empfiehlt "Umschichtung ausfuehren" und "Sparplan anpassen".',
      'System zeigt maximal 3 Empfehlungen als Action-Buttons.',
      'Bei Klick auf Empfehlung: System navigiert zur entsprechenden Aktion.'
    ],
    postconditions: [
      'Bis zu 3 kontextabhaengige Empfehlungen sind angezeigt.',
      'Action-Buttons sind funktional.'
    ],
    errors: [
      'Das System soll bei fehlendem Impact-Score generische Empfehlungen anzeigen ("Bitte kontaktieren Sie Ihren Berater").',
      'Das System soll bei fehlender Navigations-Ziel den Button deaktivieren und einen Tooltip "Funktion in Kuerze verfuegbar" anzeigen.'
    ],
    acceptance: [
      'Negativer Score (-50): Empfehlungen "Alternative pruefen" und "Berater kontaktieren" erscheinen.',
      'Positiver Score (+60): Empfehlung "Umschichtung ausfuehren" erscheint.',
      'Maximal 3 Empfehlungen werden angezeigt.',
      'Klick auf Empfehlung navigiert korrekt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // ═══════════════════════════════════════════════════════════
  // SOL-6: Immobilien-Modul (12 FN)
  // ═══════════════════════════════════════════════════════════

  // --- CMP-6.1.1: Nebenkostenrechner ---
  {
    id: 'FN-6.1.1.1', parent: 'CMP-6.1.1', title: 'Grunderwerbsteuer Berechnen',
    description:
      'Das System muss die Grunderwerbsteuer anhand des Kaufpreises und des Bundeslandes berechnen. Aktuelle Saetze: Bayern/Sachsen 3.5%, Hamburg 5.5%, NRW/Saarland/Schleswig-Holstein/Brandenburg/Thueringen 6.5%.\n\n' +
      '- Das System soll alle 16 Bundeslaender mit ihren aktuellen Steuersaetzen abbilden.\n' +
      '- Das System soll die Steuersaetze konfigurierbar halten (Admin-Update bei Gesetzesaenderung).\n' +
      '- Das System soll den berechneten Betrag in der Kostenaufstellung (FN-6.1.1.4) verwenden.',
    preconditions: [
      'Kaufpreis ist eingegeben.',
      'Bundesland ist ausgewaehlt.'
    ],
    behavior: [
      'Nutzer gibt den Kaufpreis ein (EUR, > 0).',
      'Nutzer waehlt das Bundesland aus einer Dropdown-Liste.',
      'System laedt den aktuellen Steuersatz fuer das Bundesland.',
      'System berechnet: Grunderwerbsteuer = Kaufpreis * Steuersatz.',
      'System zeigt den berechneten Betrag mit Steuersatz an.',
      'System aktualisiert die Gesamtkostenaufstellung (FN-6.1.1.4) automatisch.'
    ],
    postconditions: [
      'Grunderwerbsteuer ist berechnet und angezeigt.',
      'Wert ist fuer die Gesamtkostenaufstellung verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlendem Bundesland die Berechnung verhindern und "Bitte Bundesland waehlen" anzeigen.',
      'Das System soll bei Kaufpreis <= 0 die Meldung "Bitte gueltigen Kaufpreis eingeben" anzeigen.'
    ],
    acceptance: [
      'Kaufpreis 300000 EUR, Bayern (3.5%): Grunderwerbsteuer = 10500 EUR.',
      'Kaufpreis 300000 EUR, NRW (6.5%): Grunderwerbsteuer = 19500 EUR.',
      'Aenderung des Bundeslandes berechnet sofort neu.',
      'Admin kann Steuersatz aendern und neue Berechnung ist korrekt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.1.1.2', parent: 'CMP-6.1.1', title: 'Notarkosten Berechnen',
    description:
      'Das System muss die Notarkosten pauschal mit 1.5% des Kaufpreises berechnen (Beurkundung + Vollzug).\n\n' +
      '- Das System soll den Pauschalsatz konfigurierbar machen.\n' +
      '- Das System soll die Kosten aufgeschluesselt darstellen: Beurkundung (1.0%) + Vollzug (0.5%).\n' +
      '- Das System soll den Wert in die Gesamtkostenaufstellung einfliessen lassen.',
    preconditions: [
      'Kaufpreis ist eingegeben.'
    ],
    behavior: [
      'System laedt den konfigurierten Notarkosten-Satz (Standard: 1.5%).',
      'System berechnet: Notarkosten = Kaufpreis * 0.015.',
      'System zeigt Aufschluesselung: Beurkundung = Kaufpreis * 0.01, Vollzug = Kaufpreis * 0.005.',
      'System aktualisiert die Gesamtkostenaufstellung (FN-6.1.1.4).'
    ],
    postconditions: [
      'Notarkosten sind berechnet und aufgeschluesselt.',
      'Wert ist fuer die Gesamtkostenaufstellung verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlendem Kaufpreis die Berechnung verhindern.'
    ],
    acceptance: [
      'Kaufpreis 300000 EUR: Notarkosten = 4500 EUR (3000 + 1500).',
      'Aufschluesselung zeigt Beurkundung und Vollzug separat.',
      'Aktualisierung bei Kaufpreisaenderung erfolgt automatisch.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.1.1.3', parent: 'CMP-6.1.1', title: 'Grundbuchkosten Berechnen',
    description:
      'Das System muss die Grundbuchkosten pauschal mit 0.5% des Kaufpreises berechnen (Eintragung Eigentuemer + Grundschuld).\n\n' +
      '- Das System soll den Pauschalsatz konfigurierbar machen.\n' +
      '- Das System soll die Kosten aufgeschluesselt darstellen.\n' +
      '- Das System soll den Wert in die Gesamtkostenaufstellung einfliessen lassen.',
    preconditions: [
      'Kaufpreis ist eingegeben.'
    ],
    behavior: [
      'System laedt den konfigurierten Grundbuchkosten-Satz (Standard: 0.5%).',
      'System berechnet: Grundbuchkosten = Kaufpreis * 0.005.',
      'System zeigt Aufschluesselung: Eigentumseintragung (0.3%) + Grundschuldeintragung (0.2%).',
      'System aktualisiert die Gesamtkostenaufstellung (FN-6.1.1.4).'
    ],
    postconditions: [
      'Grundbuchkosten sind berechnet und aufgeschluesselt.',
      'Wert ist fuer die Gesamtkostenaufstellung verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlendem Kaufpreis die Berechnung verhindern.'
    ],
    acceptance: [
      'Kaufpreis 300000 EUR: Grundbuchkosten = 1500 EUR (900 + 600).',
      'Aufschluesselung zeigt Eigentums- und Grundschuldeintragung.',
      'Aktualisierung bei Kaufpreisaenderung erfolgt automatisch.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.1.1.4', parent: 'CMP-6.1.1', title: 'Gesamtkosten Aufstellen',
    description:
      'Das System muss eine Gesamtkosten-Uebersicht anzeigen: Kaufpreis + Grunderwerbsteuer + Notar + Grundbuch + Makler = Gesamtkosten.\n\n' +
      '- Das System soll die Maklerkosten als optionalen Eingabewert akzeptieren (Standard: 3.57% inkl. MwSt).\n' +
      '- Das System soll die Gesamtkosten prominent als Summe anzeigen.\n' +
      '- Das System soll die Kostenstruktur als Tortendiagramm visualisieren.',
    preconditions: [
      'Kaufpreis, Bundesland und ggf. Maklerkosten sind eingegeben.',
      'Einzelberechnungen (FN-6.1.1.1 bis FN-6.1.1.3) sind abgeschlossen.'
    ],
    behavior: [
      'System sammelt alle Einzelkosten: Grunderwerbsteuer (FN-6.1.1.1), Notarkosten (FN-6.1.1.2), Grundbuchkosten (FN-6.1.1.3).',
      'System berechnet Maklerkosten: Kaufpreis * Maklersatz (Standard 3.57%, editierbar).',
      'System berechnet Gesamtkosten = Kaufpreis + GrESt + Notar + Grundbuch + Makler.',
      'System zeigt die Aufstellung als Tabelle: Position, Satz (%), Betrag (EUR).',
      'System zeigt die Gesamtkosten prominent mit Hervorhebung.',
      'System rendert ein Donut-Chart mit der Kostenstruktur.'
    ],
    postconditions: [
      'Gesamtkostenaufstellung ist vollstaendig und sichtbar.',
      'Donut-Chart visualisiert die Kostenstruktur.',
      'Gesamtbetrag ist fuer den Tilgungsplan-Generator (CMP-6.2.1) verfuegbar.'
    ],
    errors: [
      'Das System soll bei fehlenden Einzelberechnungen die verfuegbaren Kosten summieren und fehlende als "nicht berechnet" anzeigen.',
      'Das System soll bei Eingabe eines negativen Maklersatzes die Meldung "Maklersatz muss positiv sein" anzeigen.'
    ],
    acceptance: [
      'Kaufpreis 300000 EUR, Bayern: Gesamt = 300000 + 10500 + 4500 + 1500 + 10710 = 327210 EUR.',
      'Maklersatz 0% (kein Makler): Maklerkosten entfallen.',
      'Donut-Chart zeigt Anteile korrekt.',
      'Summen-Zeile ist visuell hervorgehoben.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-6.2.1: Tilgungsplan Generator ---
  {
    id: 'FN-6.2.1.1', parent: 'CMP-6.2.1', title: 'Annuitaet Berechnen',
    description:
      'Das System muss die monatliche Annuitaet berechnen aus: Darlehenssumme, Sollzinssatz und anfaenglicher Tilgungsrate. Formel: A = D * (z + t) / 12.\n\n' +
      '- Das System soll die exakte Annuitaetenformel verwenden: A = D * (z/12) / (1 - (1+z/12)^(-n)).\n' +
      '- Das System soll die Berechnung bei Eingabeaenderung automatisch aktualisieren.\n' +
      '- Das System soll die Annuitaet als monatlichen und jaehrlichen Wert anzeigen.',
    preconditions: [
      'Darlehenssumme, Sollzinssatz und Tilgungsrate (oder Laufzeit) sind eingegeben.'
    ],
    behavior: [
      'Nutzer gibt ein: Darlehenssumme (EUR), Sollzinssatz (% p.a.), anfaengliche Tilgungsrate (% p.a.).',
      'System berechnet die monatliche Annuitaet: A = D * (z + t) / 12.',
      'Alternativ: System berechnet via exakte Formel wenn Laufzeit angegeben.',
      'System zeigt die monatliche Rate und die jaehrliche Gesamtbelastung.',
      'System aktualisiert bei jeder Eingabeaenderung automatisch (Debounce: 300ms).'
    ],
    postconditions: [
      'Monatliche Annuitaet ist berechnet und angezeigt.',
      'Wert ist fuer den Tilgungsplan (FN-6.2.1.2) verfuegbar.'
    ],
    errors: [
      'Das System soll bei Zinssatz = 0 die Tilgung ohne Zinsen berechnen (Rate = D * t / 12).',
      'Das System soll bei Darlehenssumme = 0 die Berechnung verhindern.',
      'Das System soll bei unrealistisch hoher Annuitaet (> 50% des Nettoeinkommens) eine Warnung anzeigen.'
    ],
    acceptance: [
      'Darlehen 300000 EUR, Zins 3.5%, Tilgung 2%: monatliche Rate = 1375 EUR.',
      'Aenderung des Zinssatzes von 3.5% auf 4.0% berechnet sofort neu.',
      'Zinssatz 0% fuehrt zu korrekter Berechnung ohne Fehler.',
      'Rate > 50% des Einkommens zeigt Warnung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.2.1.2', parent: 'CMP-6.2.1', title: 'Tilgungsplan Erstellen',
    description:
      'Das System muss einen monatlichen Tilgungsplan generieren: Monat, Rate, Zinsanteil, Tilgungsanteil, Sondertilgung, Restschuld.\n\n' +
      '- Das System soll den Plan fuer die gesamte Laufzeit generieren.\n' +
      '- Das System soll die Verschiebung von Zins- zu Tilgungsanteil ueber die Zeit zeigen.\n' +
      '- Das System soll den Plan als scrollbare Tabelle und als Chart (gestapelter Bereich) anzeigen.',
    preconditions: [
      'Annuitaet ist berechnet (FN-6.2.1.1).',
      'Darlehenssumme, Zinssatz und Tilgungsrate sind bekannt.'
    ],
    behavior: [
      'System initialisiert: Restschuld = Darlehenssumme, Monat = 0.',
      'Pro Monat: System berechnet Zinsanteil = Restschuld * Zinssatz / 12.',
      'Pro Monat: System berechnet Tilgungsanteil = Rate - Zinsanteil.',
      'Pro Monat: System berechnet neue Restschuld = alte Restschuld - Tilgungsanteil.',
      'System wiederholt bis Restschuld <= 0 oder Zinsbindungsende erreicht.',
      'System zeigt den Plan als Tabelle (Monat, Rate, Zins, Tilgung, Sondertilgung, Restschuld).',
      'System rendert ein Stacked-Area-Chart: Zins- und Tilgungsanteil ueber die Zeit.'
    ],
    postconditions: [
      'Vollstaendiger Tilgungsplan ist generiert.',
      'Tabelle und Chart sind gerendert.',
      'Restschuld am Ende der Zinsbindung ist bekannt.'
    ],
    errors: [
      'Das System soll bei Tilgung < Zinsen (negative Tilgung) die Meldung "Tilgungsrate ist zu niedrig" anzeigen.',
      'Das System soll bei Laufzeit > 50 Jahre die Meldung "Unrealistische Laufzeit" anzeigen und die Eingabe pruefen.'
    ],
    acceptance: [
      'Tilgungsplan fuer 300000 EUR, 3.5% Zins, 2% Tilgung zeigt korrekte monatliche Werte.',
      'Zinsanteil nimmt ueber die Laufzeit ab, Tilgungsanteil nimmt zu.',
      'Restschuld nach 10 Jahren (Zinsbindung) ist korrekt berechnet.',
      'Chart zeigt die Zins/Tilgungs-Verhaeltnis-Entwicklung.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.2.1.3', parent: 'CMP-6.2.1', title: 'Anschlussfinanzierung Simulieren',
    description:
      'Das System muss 3 Szenarien fuer die Anschlussfinanzierung nach Zinsbindungsende berechnen: aktueller Zins, +1pp, +2pp.\n\n' +
      '- Das System soll die Restschuld nach Zinsbindungsende als Basis verwenden.\n' +
      '- Das System soll fuer jedes Szenario einen neuen Tilgungsplan erstellen.\n' +
      '- Das System soll die 3 Szenarien nebeneinander vergleichen.',
    preconditions: [
      'Tilgungsplan ist erstellt (FN-6.2.1.2).',
      'Restschuld nach Zinsbindungsende ist berechnet.'
    ],
    behavior: [
      'System ermittelt die Restschuld nach Ablauf der Zinsbindung.',
      'System erstellt 3 Szenarien: (1) aktueller Zins, (2) aktueller Zins + 1pp, (3) aktueller Zins + 2pp.',
      'Pro Szenario: System berechnet die neue Annuitaet mit der Restschuld und dem neuen Zinssatz.',
      'Pro Szenario: System erstellt einen neuen Tilgungsplan.',
      'System zeigt die 3 Szenarien in einer Vergleichstabelle: Zinssatz, monatliche Rate, Gesamtlaufzeit, Gesamtzinsen.'
    ],
    postconditions: [
      '3 Anschlussfinanzierungs-Szenarien sind berechnet.',
      'Vergleichstabelle ist angezeigt.'
    ],
    errors: [
      'Das System soll bei Restschuld = 0 die Anschlussfinanzierung ueberspringen (Darlehen bereits getilgt).',
      'Das System soll bei unrealistischem Zinssatz (> 15%) eine Warnung anzeigen.'
    ],
    acceptance: [
      'Restschuld 200000 EUR, aktuell 3.5%: Szenario 1 = 3.5%, Szenario 2 = 4.5%, Szenario 3 = 5.5%.',
      'Vergleichstabelle zeigt unterschiedliche monatliche Raten.',
      'Restschuld 0: Kein Anschlussfinanzierungs-Bereich angezeigt.',
      '+2pp-Szenario zeigt hoehere Rate und laengere Laufzeit.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.2.1.4', parent: 'CMP-6.2.1', title: 'Sondertilgung Einplanen',
    description:
      'Das System muss optionale jaehrliche Sondertilgungen (max. X% der Darlehenssumme) im Tilgungsplan beruecksichtigen und den Laufzeit-Effekt berechnen.\n\n' +
      '- Das System soll den Sondertilgungsbetrag und den Rhythmus konfigurierbar machen.\n' +
      '- Das System soll die Laufzeitverkuerzung durch Sondertilgung berechnen.\n' +
      '- Das System soll die Zinsersparnis durch Sondertilgung anzeigen.',
    preconditions: [
      'Tilgungsplan ist erstellt (FN-6.2.1.2).',
      'Sondertilgungsoption im Darlehensvertrag ist bekannt (max. Prozentsatz).'
    ],
    behavior: [
      'Nutzer gibt ein: Jaehrlicher Sondertilgungsbetrag (EUR) und Rhythmus (jaehrlich, einmalig).',
      'System validiert: Sondertilgung <= max. Prozentsatz der Darlehenssumme.',
      'System berechnet den Tilgungsplan mit Sondertilgungen: Restschuld reduziert sich zusaetzlich.',
      'System berechnet die Laufzeitverkuerzung: Tage/Monate/Jahre schneller getilgt.',
      'System berechnet die Gesamtzinsersparnis: Zinsen_ohne_ST - Zinsen_mit_ST.',
      'System zeigt den Vergleich: mit/ohne Sondertilgung nebeneinander.'
    ],
    postconditions: [
      'Tilgungsplan mit Sondertilgung ist berechnet.',
      'Laufzeitverkuerzung und Zinsersparnis sind quantifiziert.',
      'Vergleich mit/ohne Sondertilgung ist sichtbar.'
    ],
    errors: [
      'Das System soll bei Sondertilgung > max. Prozentsatz die Meldung "Sondertilgung uebersteigt vertragliches Maximum" anzeigen.',
      'Das System soll bei Sondertilgung = 0 den Standard-Tilgungsplan beibehalten.'
    ],
    acceptance: [
      '5000 EUR/Jahr Sondertilgung bei 300000 EUR Darlehen verkuerzt die Laufzeit um ca. 5 Jahre.',
      'Zinsersparnis wird korrekt berechnet und angezeigt.',
      'Sondertilgung > 5% (Standard-Maximum) wird abgelehnt.',
      'Vergleich mit/ohne Sondertilgung ist klar dargestellt.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },

  // --- CMP-6.3.1: Miet-Kauf-Vergleichsmodul ---
  {
    id: 'FN-6.3.1.1', parent: 'CMP-6.3.1', title: 'Mietkosten Projizieren',
    description:
      'Das System muss die Mietkosten ueber den gewaehlten Zeitraum projizieren: Kaltmiete * (1 + Steigerung)^n. Steigerung konfigurierbar (Standard: 2% p.a.).\n\n' +
      '- Das System soll die Mietsteigerung konfigurierbar machen.\n' +
      '- Das System soll die kumulierten Mietkosten berechnen.\n' +
      '- Das System soll die Projektion als Linien-Chart anzeigen.',
    preconditions: [
      'Aktuelle Kaltmiete ist eingegeben.',
      'Projektionszeitraum ist gewaehlt (Standard: 30 Jahre).'
    ],
    behavior: [
      'Nutzer gibt die aktuelle monatliche Kaltmiete ein.',
      'Nutzer waehlt die jaehrliche Mietsteigerung (Standard: 2%, Slider 0-5%).',
      'Nutzer waehlt den Projektionszeitraum (10-40 Jahre).',
      'System berechnet pro Jahr: Miete_n = Kaltmiete * 12 * (1 + Steigerung)^n.',
      'System berechnet die kumulierten Mietkosten ueber den gesamten Zeitraum.',
      'System zeigt die Projektion als Linien-Chart (Jahresmiete + kumulierte Kosten).'
    ],
    postconditions: [
      'Mietkosten-Projektion ist berechnet.',
      'Kumulierte Kosten sind verfuegbar fuer den Vergleich (FN-6.3.1.3).',
      'Linien-Chart ist gerendert.'
    ],
    errors: [
      'Das System soll bei Kaltmiete = 0 die Meldung "Bitte Kaltmiete eingeben" anzeigen.',
      'Das System soll bei Steigerung > 5% eine Warnung "Unrealistisch hohe Steigerungsrate" anzeigen.'
    ],
    acceptance: [
      'Kaltmiete 1000 EUR, 2% Steigerung, 30 Jahre: Kumulierte Kosten ca. 486.000 EUR.',
      'Aenderung der Steigerungsrate berechnet sofort neu.',
      'Linien-Chart zeigt den Kostenanstieg visuell.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.3.1.2', parent: 'CMP-6.3.1', title: 'Kaufkosten Projizieren',
    description:
      'Das System muss die monatlichen Gesamtkosten des Kaufs berechnen: Kreditrate + Instandhaltung (1-1.5% p.a.) + Hausgeld - steuerliche Vorteile.\n\n' +
      '- Das System soll die Instandhaltungskosten als Prozentsatz des Kaufpreises berechnen.\n' +
      '- Das System soll Hausgeld als optionale monatliche Eingabe akzeptieren.\n' +
      '- Das System soll die kumulierten Kaufkosten berechnen und projizieren.',
    preconditions: [
      'Tilgungsplan ist erstellt (CMP-6.2.1).',
      'Kaufpreis und Nebenkosten (CMP-6.1.1) sind berechnet.',
      'Projektionszeitraum ist gewaehlt.'
    ],
    behavior: [
      'System laedt die monatliche Kreditrate aus dem Tilgungsplan.',
      'System berechnet die monatlichen Instandhaltungskosten: Kaufpreis * Satz / 12.',
      'Nutzer gibt optionales Hausgeld ein (EUR/Monat).',
      'System berechnet die monatlichen Gesamtkosten = Kreditrate + Instandhaltung + Hausgeld.',
      'Pro Jahr: System berechnet die jaehrlichen Gesamtkosten (ggf. mit Inflationsanpassung der Instandhaltung).',
      'System berechnet die kumulierten Kaufkosten ueber den Projektionszeitraum.',
      'System zeigt die Projektion als Linien-Chart.'
    ],
    postconditions: [
      'Monatliche und kumulierte Kaufkosten sind berechnet.',
      'Kosten sind fuer den Break-Even-Vergleich (FN-6.3.1.3) verfuegbar.',
      'Linien-Chart ist gerendert.'
    ],
    errors: [
      'Das System soll bei fehlender Kreditrate die Meldung "Bitte zuerst den Tilgungsplan erstellen" anzeigen.',
      'Das System soll bei negativem Hausgeld die Eingabe ablehnen.'
    ],
    acceptance: [
      'Kreditrate 1375 EUR + Instandhaltung 375 EUR + Hausgeld 250 EUR = 2000 EUR/Monat.',
      'Kumulierte Kosten nach 30 Jahren sind korrekt berechnet.',
      'Linien-Chart zeigt den Kostenverlauf.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.3.1.3', parent: 'CMP-6.3.1', title: 'Break Even Berechnen',
    description:
      'Das System muss den Break-Even-Zeitpunkt berechnen ab dem Kaufen guenstiger ist als Mieten. Beruecksichtigt Wertsteigerung der Immobilie und Opportunitaetskosten.\n\n' +
      '- Das System soll den Break-Even als Schnittpunkt der kumulierten Kosten berechnen.\n' +
      '- Das System soll die Wertsteigerung der Immobilie als Vermoegensaufbau beruecksichtigen.\n' +
      '- Das System soll den Break-Even grafisch als Schnittpunkt zweier Linien darstellen.',
    preconditions: [
      'Mietkosten-Projektion (FN-6.3.1.1) und Kaufkosten-Projektion (FN-6.3.1.2) sind berechnet.',
      'Immobilien-Wertsteigerung ist konfiguriert (Standard: 1.5% p.a.).'
    ],
    behavior: [
      'System berechnet pro Jahr: Netto-Kaufkosten = Kum. Kaufkosten - Immobilienwert + Restschuld.',
      'System berechnet pro Jahr: Netto-Mietkosten = Kum. Mietkosten + Opportunitaetskosten (FN-6.3.1.4).',
      'System sucht den Schnittpunkt: erstes Jahr wo Netto-Kaufkosten < Netto-Mietkosten.',
      'System zeigt den Break-Even-Zeitpunkt prominent an: "Kaufen wird nach X Jahren guenstiger".',
      'System rendert ein Vergleichs-Chart: zwei Linien (Kauf vs. Miete) mit markiertem Schnittpunkt.'
    ],
    postconditions: [
      'Break-Even-Zeitpunkt ist berechnet und angezeigt.',
      'Vergleichs-Chart ist gerendert mit Schnittpunkt-Markierung.'
    ],
    errors: [
      'Das System soll bei keinem Break-Even innerhalb des Projektionszeitraums die Meldung "Mieten bleibt im betrachteten Zeitraum guenstiger" anzeigen.',
      'Das System soll bei sofortigem Break-Even (Jahr 0) die Meldung "Kaufen ist sofort guenstiger" anzeigen.'
    ],
    acceptance: [
      'Standard-Szenario zeigt Break-Even nach ca. 12-15 Jahren.',
      'Vergleichs-Chart zeigt den Schnittpunkt klar markiert.',
      'Hohe Mietsteigerung (4%) verschiebt Break-Even nach links (Kaufen frueher guenstiger).',
      'Hoher Zinssatz verschiebt Break-Even nach rechts.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  },
  {
    id: 'FN-6.3.1.4', parent: 'CMP-6.3.1', title: 'Opportunitaetskosten Eigenkapital',
    description:
      'Das System muss die Opportunitaetskosten des gebundenen Eigenkapitals berechnen: Entgangene Rendite wenn das EK stattdessen am Kapitalmarkt angelegt worden waere.\n\n' +
      '- Das System soll die alternative Rendite konfigurierbar machen (Standard: 6% p.a., MSCI World Durchschnitt).\n' +
      '- Das System soll den Zinseszins-Effekt beruecksichtigen.\n' +
      '- Das System soll die entgangene Rendite als Kosten im Miet-Kauf-Vergleich einfliessen lassen.',
    preconditions: [
      'Eigenkapitaleinsatz ist bekannt (Kaufpreis - Darlehenssumme + Nebenkosten).',
      'Alternative Rendite ist konfiguriert.'
    ],
    behavior: [
      'System berechnet den Eigenkapitaleinsatz: EK = Gesamtkosten (FN-6.1.1.4) - Darlehenssumme.',
      'System berechnet pro Jahr: entgangene Rendite = EK * (1 + r)^n - EK.',
      'System berechnet die kumulierten Opportunitaetskosten ueber den Projektionszeitraum.',
      'System addiert die Opportunitaetskosten zu den Netto-Mietkosten im Vergleich.',
      'System zeigt die Opportunitaetskosten als separaten Posten in der Aufstellung.'
    ],
    postconditions: [
      'Opportunitaetskosten sind berechnet.',
      'Wert ist in den Miet-Kauf-Vergleich integriert.',
      'Separate Darstellung als Posten ist sichtbar.'
    ],
    errors: [
      'Das System soll bei EK = 0 (100% Finanzierung) die Opportunitaetskosten auf 0 setzen.',
      'Das System soll bei unrealistischer Alternativrendite (> 15%) eine Warnung anzeigen.'
    ],
    acceptance: [
      'EK 100000 EUR, 6% Rendite, 10 Jahre: Opportunitaetskosten = 79085 EUR.',
      'EK 0 (Vollfinanzierung): Opportunitaetskosten = 0 EUR.',
      'Aenderung der Alternativrendite berechnet sofort neu.',
      'Break-Even verschiebt sich bei hoeherer Opportunitaetsrendite nach rechts.'
    ],
    triggers_notifications: [],
    notifications: [],
    conversations: []
  }
];

const result = processBatch(data, 'Batch-2 (SOL 4-6)');
console.log(JSON.stringify(result));
