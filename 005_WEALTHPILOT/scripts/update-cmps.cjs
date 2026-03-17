const fs = require('fs');
const path = require('path');

const cmpDir = 'requirements/components';
const fnDir = 'requirements/functions';

// Build CMP -> FN mapping
const fnFiles = fs.readdirSync(fnDir).filter(f => f.endsWith('.md'));
const cmpToFns = {};
fnFiles.forEach(f => {
  const m = f.match(/^FN-(\d+\.\d+\.\d+)\.(\d+)_(.+)\.md$/);
  if (m) {
    const cmpId = m[1];
    if (!cmpToFns[cmpId]) cmpToFns[cmpId] = [];
    cmpToFns[cmpId].push({ id: 'FN-' + cmpId + '.' + m[2], file: f, title: m[3].replace(/_/g, ' ') });
  }
});

const cmpMeta = {
  '1.1.1': { input: 'Benutzereingaben: IBAN, BIC, ISIN, Kontotyp, Wert, Waehrung', output: 'Persistiertes Finanzprofil-Objekt (verschluesselt)', constraints: 'Max 50 Konten/Depots pro Nutzer. Formular-State muss Draft-Persistierung unterstuetzen. IBAN-Validierung client- und serverseitig.', infRefs: [{id:'INF-1',rel:'Verschluesselte Speicherung, DSGVO Art. 32'},{id:'INF-3',rel:'Formular-Barrierefreiheit, Tastatur-Navigation'}] },
  '1.2.1': { input: 'Benutzereingaben: Einnahmen-/Ausgabenposten mit Betrag, Kategorie, Intervall', output: 'Einnahmen-Ausgaben-Profil mit Sparquote und frei verfuegbarem Einkommen', constraints: 'DIN-77230-Kategorien als Pflicht-Taxonomie. Monatliche Normalisierung aller Intervalle.', infRefs: [{id:'INF-4',rel:'DIN-77230-Kategorien in DE/EN'},{id:'INF-3',rel:'Formular-Barrierefreiheit'}] },
  '1.3.1': { input: 'Benutzereingaben: Antworten auf 8-12 Likert-Skala-Fragen', output: 'Risikoklasse (1-5: sicherheitsorientiert bis spekulativ) mit Score', constraints: 'WpHG-konform. Jede Aenderung muss auditiert werden (CMP-9.1.1). Score-Algorithmus muss dokumentiert und reproduzierbar sein.', infRefs: [{id:'INF-1',rel:'Risikoprofil als besonders schutzwuerdige Daten'},{id:'INF-3',rel:'Likert-Skala barrierefrei bedienbar'}] },
  '2.1.1': { input: 'OAuth2-Redirect von finAPI, Bank-Auswahl des Nutzers', output: 'Synchronisierte Kontostaende und Transaktionen im Finanzprofil', constraints: 'BaFin-regulierter AISP-Provider finAPI (ADR-4). Consent max 90 Tage gueltig. Taegliche Synchronisation als Background-Job.', infRefs: [{id:'INF-1',rel:'PSD2-Consent DSGVO-konform, Datenminimierung'},{id:'INF-2',rel:'OAuth2-Token-Sicherheit, PKCE'}] },
  '2.2.1': { input: 'Depot-Rohdaten von finAPI oder CSV-Upload', output: 'Normalisierte Depot-Positionen mit Einstandskurs und Haltedauer', constraints: 'Corporate Actions (Splits, Fusionen) automatisch erkennen. CSV-Import: Validierung gegen Schema, max 10MB.', infRefs: [{id:'INF-5',rel:'Sync als Background-Job, kein Nutzer-Blocking'},{id:'INF-1',rel:'Depot-Daten verschluesselt speichern'}] },
  '3.1.1': { input: 'Transaktionshistorie (Kaeufe, Verkaeufe, Dividenden, Gebuehren) pro Position', output: 'TTWROR und MWR pro Position mit Zeitreihe', constraints: 'Numerische Praezision: 6 Dezimalstellen. Cache-Invalidierung bei neuen Transaktionen. Inkrementelle Berechnung.', infRefs: [{id:'INF-5',rel:'Rendite-Cache mit TTL und Invalidierung'},{id:'INF-5',rel:'P95 < 2000ms fuer Berechnung'}] },
  '3.2.1': { input: 'Positions-Renditen von CMP-3.1.1, Asset-Klassen-Zuordnung', output: 'Gewichtete Gesamtrendite, Asset-Klassen-Aufschluesselung, Netto-Rendite', constraints: 'Abgeltungssteuer 26,375% + Soli auf realisierte Gewinne. Freistellungsauftrag-Verrechnung (801 EUR / 1.602 EUR).', infRefs: [{id:'INF-4',rel:'Steuersaetze laenderspezifisch (DE/AT/CH)'},{id:'INF-5',rel:'Aggregation < 500ms'}] },
  '3.3.1': { input: 'Benchmark-Zeitreihen von externem Provider, Portfolio-Zeitreihe', output: 'Normalisierter Vergleichs-Chart, Outperformance in Prozentpunkten', constraints: 'Externe API-Abhaengigkeit: Circuit-Breaker und Fallback auf gecachte Daten. Max 5 Benchmarks gleichzeitig.', infRefs: [{id:'INF-5',rel:'Benchmark-Daten taegliches Caching'},{id:'INF-3',rel:'Chart-Alternativtext fuer Screen-Reader'}] },
  '4.1.1': { input: 'Drag-and-Drop: Quell-Positionen, Betrag, Ziel-Verwendung, Zeitrahmen', output: 'Umschichtungs-Konfiguration als strukturiertes Objekt fuer CMP-4.2.1', constraints: 'Echtzeit-Validierung: Verfuegbarkeit, Sperrfristen, Mindestanlage. Liquiditaetsreserve-Warnung bei < 3 Netto-Monatsgehaelter.', infRefs: [{id:'INF-3',rel:'Drag-and-Drop mit Tastatur-Alternative'},{id:'INF-6',rel:'Formular-State mit Zwischen-Persistierung'}] },
  '4.2.1': { input: 'Umschichtungs-Konfiguration, Portfolio-Snapshot, Risikoprofil', output: 'Impact-Ergebnis: Rendite-Deltas, Opportunitaetskosten, Steuer-Impact, Impact-Score (-100..+100)', constraints: 'Monte-Carlo: 1000 Pfade. P95 < 5000ms. Worker-Thread fuer CPU-intensive Berechnung. Deterministische Seed-Option fuer Tests.', infRefs: [{id:'INF-5',rel:'Monte-Carlo P95 < 5s, Worker-Thread'},{id:'INF-1',rel:'Keine Persistierung von Simulations-Rohdaten'}] },
  '4.2.2': { input: 'Impact-Ergebnis-Objekt von CMP-4.2.1', output: 'Interaktive Charts: Sankey, Waterfall, Gauge, Timeline', constraints: 'Apache ECharts (ADR-3). Responsive 320-1920px. Datentabellen-Fallback fuer Accessibility. Mandanten-Theme.', infRefs: [{id:'INF-3',rel:'Chart-Alternativtexte, Datentabellen-Fallback'},{id:'INF-5',rel:'Chart-Rendering < 500ms'}] },
  '4.3.1': { input: 'Portfolio-Snapshot, Umschichtungs-Constraints, Optimierungsziel', output: 'Top-3 Szenarien mit Fitness-Score und Side-by-Side-Vergleich', constraints: 'Genetischer Algorithmus: 100er-Population, ~50 Generationen. Konvergenz-Timeout: 10s. FIFO vs LIFO Steueroptimierung.', infRefs: [{id:'INF-5',rel:'Optimierung < 10s, Worker-Thread'},{id:'INF-6',rel:'Szenarien im Client-State fuer Vergleich'}] },
  '5.1.1': { input: 'Nutzernachricht, Kontext (Portfolio-Snapshot, Szenario, Risikoprofil)', output: 'Streaming-Antwort via SSE mit regulatorischem Disclaimer', constraints: 'Gemini 2.0 Flash (ADR-5). Rate-Limit 20/h. PII-Masking vor API-Call. Prompt-Injection-Schutz. Token-Budget pro Nutzer.', infRefs: [{id:'INF-2',rel:'Prompt-Injection-Schutz, PII-Masking'},{id:'INF-1',rel:'KI-Interaktionen auditiert, PII nicht an API'}] },
  '5.2.1': { input: 'Berechnetes Impact-Szenario, Structured-Output-Template', output: 'Natuerlichsprachliche Erklaerung: Zusammenfassung, Risiken, Chancen, Naechste Schritte', constraints: 'Zahlen-Validierung: KI-Zahlen gegen berechnete Werte, Schwelle 2%. Bei Abweichung: berechneter Wert statt KI-Wert.', infRefs: [{id:'INF-2',rel:'Output-Validierung gegen Berechnungsdaten'},{id:'INF-4',rel:'Erklaerung in Profilsprache des Nutzers'}] },
  '6.1.1': { input: 'Kaufpreis, Bundesland, optionale Maklerprovision', output: 'Aufstellung: Grunderwerbsteuer, Notar, Grundbuch, Makler, Gesamtkosten', constraints: 'Grunderwerbsteuersaetze tabellarisch fuer 16 Bundeslaender. Notar 1.5%, Grundbuch 0.5% als Defaults. Makler konfigurierbar.', infRefs: [{id:'INF-4',rel:'Bundesland-Namen und Steuersaetze lokalisiert'}] },
  '6.2.1': { input: 'Darlehenssumme, Sollzins, Tilgungssatz, Sondertilgungs-Option, Zinsbindung', output: 'Monatlicher Tilgungsplan (Tabelle), 3 Anschlussfinanzierungs-Szenarien', constraints: 'Annuitaetenberechnung monatliche Granularitaet. Max 40 Jahre Laufzeit. Anschlussfinanzierung: +0%, +1%, +2% Zins.', infRefs: [{id:'INF-5',rel:'Tilgungsplan-Berechnung < 500ms'},{id:'INF-3',rel:'Tabelle barrierefrei mit scope-Attributen'}] },
  '6.3.1': { input: 'Kaufpreis, Miethoehe, Mietsteigerung, Wertsteigerung, Instandhaltung, Eigenkapital', output: 'Break-Even-Zeitpunkt, Linien-Chart Kauf vs. Miet, Opportunitaetskosten', constraints: 'Instandhaltung 1-1.5% p.a. Mietsteigerung individuell oder Mietspiegel. Opportunitaetskosten Eigenkapital via CMP-3.1.1.', infRefs: [{id:'INF-3',rel:'Break-Even-Chart mit Alternativtext'},{id:'INF-5',rel:'Berechnung < 1s'}] },
  '7.1.1': { input: 'Suchbegriff, Facetten-Filter (Asset-Klasse, Risikoklasse, TER-Range)', output: 'Paginierte Produktliste mit Relevanz-Score', constraints: 'Elasticsearch-Index. Mandantenspezifisch: Nur freigeschaltete Produkte. Typeahead < 100ms. Fallback: Asset-Klassen ohne Produkte.', infRefs: [{id:'INF-5',rel:'Typeahead < 100ms, Elasticsearch'},{id:'INF-3',rel:'Suchfeld und Ergebnisliste barrierefrei'}] },
  '7.2.1': { input: 'Nutzerprofil (Risikoklasse, Portfolio), Produktkatalog', output: 'Gerankte Empfehlungsliste mit Matching-Score und Geeignetheits-Flag', constraints: 'MiFID-II-Gate: Risikoklasse des Produkts darf Nutzerprofil nicht uebersteigen. Provisionstransparenz Pflicht.', infRefs: [{id:'INF-2',rel:'MiFID-II-Compliance als Security-Gate'},{id:'INF-1',rel:'Empfehlungshistorie auditiert'}] },
  '8.1.1': { input: 'Aggregierte Portfolio-Daten von CMP-3.2.1', output: 'Dashboard: Hero-Zahl, Quick-Stats, Allokations-Donut, Vermoegen-Timeline', constraints: 'Responsive Desktop bis Tablet. Apache ECharts (ADR-3). Daten-Refresh alle 60s oder bei Nutzer-Aktion.', infRefs: [{id:'INF-3',rel:'Dashboard-Widgets Screen-Reader-kompatibel'},{id:'INF-5',rel:'Dashboard LCP < 2.5s'}] },
  '8.2.1': { input: 'Szenario-Daten, Mandanten-Branding, Report-Template', output: 'PDF-Report (A4) und XLSX-Export', constraints: 'Headless-Browser (Puppeteer/Playwright) fuer PDF. Max 10s Generierungszeit. Mandanten-Logo und Farben. XLSX mit Rohdaten.', infRefs: [{id:'INF-5',rel:'PDF < 10s, parallel bis 10 Reports'},{id:'INF-7',rel:'Headless-Browser als CI-Dependency'}] },
  '9.1.1': { input: 'Audit-Events: Typ, Nutzer-ID, Timestamp, Payload-Hash', output: 'Immutable Audit-Log mit kryptographischer Hash-Chain', constraints: 'Append-only. SHA-256 Hash-Chain. Aufbewahrung 10 Jahre (HGB). Query-Interface mit Zeitraum/Nutzer-Filter. Kein Loeschen moeglich.', infRefs: [{id:'INF-1',rel:'Audit-Log fuer DSGVO-Nachweispflicht Art. 5(2)'},{id:'INF-2',rel:'Hash-Chain-Integritaet, Tamper-Detection'}] },
  '9.2.1': { input: 'Loeschantrag (Nutzer-ID, Datum), regulatorische Haltefristen-Tabelle', output: 'Loeschprotokoll, Bestaetigung an Nutzer', constraints: 'DSGVO Art. 17. Haltefristen: WpHG 5J, HGB 10J, GwG 5J. 30-Tage-Frist. Loeschprotokoll 3 Jahre aufbewahrt.', infRefs: [{id:'INF-1',rel:'DSGVO Art. 17 Recht auf Loeschung'},{id:'INF-7',rel:'Automatisierter Cronjob fuer Fristablauf'}] },
  '10.1.1': { input: 'Admin-Eingaben: Firmenname, Domain, Vertragslaufzeit, Feature-Flags, SSO-Config', output: 'Mandanten-Objekt mit Konfiguration, API-Keys, SSO-Metadaten', constraints: 'SAML 2.0 und OIDC. API-Key-Rotation. Feature-Flags pro Mandant. Nutzerlimits und Usage-Tracking.', infRefs: [{id:'INF-2',rel:'SSO-Sicherheit, Zertifikats-Validierung'},{id:'INF-7',rel:'Feature-Flags via Unleash/LaunchDarkly'}] },
  '10.2.1': { input: 'Admin-Uploads: Logo, Favicon, Farben, Texte', output: 'Mandanten-Theme (CSS Custom Properties), Branding-Assets', constraints: 'WCAG-AA-Kontrastpruefung bei Custom-Farben. SVG/PNG max 500KB. Live-Preview vor Aktivierung. CSS-Injection bei Login.', infRefs: [{id:'INF-3',rel:'WCAG-Kontrastpruefung bei Farbauswahl'},{id:'INF-4',rel:'Custom-Texte ueberschreiben i18n-Defaults'}] },
};

const cmpFiles = fs.readdirSync(cmpDir).filter(f => f.endsWith('.md'));
let updated = 0;

cmpFiles.forEach(file => {
  const m = file.match(/CMP-(\d+\.\d+\.\d+)_/);
  if (!m) return;
  const cmpId = m[1];
  const meta = cmpMeta[cmpId];
  if (!meta) { console.log('SKIP: ' + cmpId); return; }
  
  let content = fs.readFileSync(path.join(cmpDir, file), 'utf8');
  
  // Update status from idea to draft
  content = content.replace('status: idea', 'status: draft');
  content = content.replace('date: "2026-03-14"', 'date: "2026-03-15"');
  
  // Remove trailing whitespace/newlines
  content = content.trimEnd();
  
  // Build Functions table
  const fns = cmpToFns[cmpId] || [];
  let fnTable = '\n\n---\n\n## Functions\n\n| FN-ID | Function | Status |\n|---|---|---|\n';
  fns.forEach(fn => {
    fnTable += '| [' + fn.id + '](../functions/' + fn.file + ') | ' + fn.title + ' | draft |\n';
  });
  
  // Build Interfaces section
  let interfaces = '\n\n---\n\n## Interfaces\n\n| Direction | Description |\n|---|---|\n';
  interfaces += '| **Input** | ' + meta.input + ' |\n';
  interfaces += '| **Output** | ' + meta.output + ' |\n';
  
  // Build Constraints section
  let constraints = '\n\n---\n\n## Constraints\n\n' + meta.constraints + '\n';
  
  // Build Infrastructure References section
  let infRefs = '\n\n---\n\n## Infrastructure References\n\n| INF-ID | Relevance |\n|---|---|\n';
  meta.infRefs.forEach(ref => {
    infRefs += '| ' + ref.id + ' | ' + ref.rel + ' |\n';
  });
  
  content += interfaces + fnTable + constraints + infRefs;
  
  fs.writeFileSync(path.join(cmpDir, file), content, 'utf8');
  updated++;
});

console.log('Updated ' + updated + ' CMP files');
