// update-sols.cjs — Elaborate all 10 Solution files
const fs = require('fs');
const path = require('path');

const SOL_DIR = path.join(__dirname, '..', 'requirements', 'solutions');
const US_DIR  = path.join(__dirname, '..', 'requirements', 'user-stories');

// Build SOL → US mapping from US files
const usFiles = fs.readdirSync(US_DIR).filter(f => f.endsWith('.md'));
const SOL_US_MAP = {};
usFiles.forEach(f => {
  const content = fs.readFileSync(path.join(US_DIR, f), 'utf8');
  const idMatch = content.match(/^id:\s*(.+)$/m);
  const parentMatch = content.match(/^parent:\s*(.+)$/m);
  const titleMatch = content.match(/^title:\s*"(.+)"$/m);
  if (idMatch && parentMatch) {
    const usId = idMatch[1].trim();
    const parent = parentMatch[1].trim();
    const title = titleMatch ? titleMatch[1] : f.replace(/^US-[\d.]+_/, '').replace(/_/g, ' ').replace('.md', '');
    if (!SOL_US_MAP[parent]) SOL_US_MAP[parent] = [];
    SOL_US_MAP[parent].push({ id: usId, title, file: f, status: 'draft' });
  }
});

// Dependencies between SOLs
const SOL_DEPS = {
  'SOL-1': { upstream: [], downstream: ['SOL-2', 'SOL-3', 'SOL-4', 'SOL-5', 'SOL-6', 'SOL-7'] },
  'SOL-2': { upstream: ['SOL-1'], downstream: ['SOL-3', 'SOL-8'] },
  'SOL-3': { upstream: ['SOL-1', 'SOL-2'], downstream: ['SOL-4', 'SOL-7', 'SOL-8'] },
  'SOL-4': { upstream: ['SOL-1', 'SOL-3'], downstream: ['SOL-5', 'SOL-8'] },
  'SOL-5': { upstream: ['SOL-4'], downstream: ['SOL-8'] },
  'SOL-6': { upstream: ['SOL-1'], downstream: ['SOL-8'] },
  'SOL-7': { upstream: ['SOL-1', 'SOL-3'], downstream: ['SOL-8'] },
  'SOL-8': { upstream: ['SOL-3', 'SOL-4', 'SOL-5', 'SOL-6', 'SOL-7'], downstream: [] },
  'SOL-9': { upstream: [], downstream: [] },
  'SOL-10': { upstream: [], downstream: [] }
};

// System Boundaries per SOL
const SOL_BOUNDARIES = {
  'SOL-1': {
    inScope: [
      'Manuelle Erfassung von Konten, Depots und Depot-Positionen.',
      'Einnahmen- und Ausgabenerfassung mit DIN-77230-Kategorisierung.',
      'Risikoprofil-Ermittlung gemaess WpHG-Anforderungen.',
      'Verschluesselte Speicherung aller Finanzdaten (AES-256).'
    ],
    outOfScope: [
      'Automatische Kontoaggregation via PSD2 (siehe SOL-2).',
      'Renditeberechnung und Analyse (siehe SOL-3).',
      'Steuerliche Beratung oder Steuerberechnung.'
    ]
  },
  'SOL-2': {
    inScope: [
      'PSD2-basierte Kontoaggregation ueber finAPI (AISP).',
      'Automatische Depot-Synchronisation (Positionen, Transaktionen, Marktwerte).',
      'Kursimport und Depotbewertung.',
      'Corporate-Action-Handling (Splits, Kapitalerhoehungen).'
    ],
    outOfScope: [
      'Zahlungsausloesung (PISP) — kein Payment-Initiation.',
      'Manuelle Konto-Erfassung (siehe SOL-1).',
      'Renditeberechnung (siehe SOL-3).'
    ]
  },
  'SOL-3': {
    inScope: [
      'TTWROR-Renditeberechnung pro Position und Portfolio.',
      'Portfolio-Aggregation ueber alle Konten und Depots.',
      'Benchmark-Vergleich (DAX, MSCI World, individuell).',
      'Historische Zeitreihenanalyse.'
    ],
    outOfScope: [
      'Zukunftsprognosen oder Rendite-Prognosen.',
      'Impact-Simulation bei Umschichtung (siehe SOL-4).',
      'Produktempfehlungen (siehe SOL-7).'
    ]
  },
  'SOL-4': {
    inScope: [
      'Umschichtungskonfiguration (Quell- und Ziel-Positionen).',
      'Cross-Impact-Berechnung (Rendite-Delta, Opportunitaetskosten, Steuerlast).',
      'Visualisierung als Sankey- und Waterfall-Charts.',
      'Multi-Szenario-Vergleich und Optimierungsvorschlag.',
      'Impact-Score-Berechnung (-100 bis +100).'
    ],
    outOfScope: [
      'Ausfuehrung von Transaktionen (kein Trading).',
      'Bankuebergreifende Umschichtung (nur innerhalb verfuegbarer Positionen).',
      'Steuerberatung im rechtlichen Sinne.'
    ]
  },
  'SOL-5': {
    inScope: [
      'Gemini-Chat-Interface fuer KI-gestuetzte Beratung.',
      'Szenario-Erklaerung und -Bewertung durch Gemini.',
      'Kontextbezogene Empfehlungen basierend auf Nutzerprofil.',
      'PII-Masking vor API-Aufruf.'
    ],
    outOfScope: [
      'Eigenstaendige Anlageberatung (AI ist nur Unterstuetzung, nicht Entscheidung).',
      'Fine-Tuning des Gemini-Modells.',
      'Training mit Kundendaten.'
    ]
  },
  'SOL-6': {
    inScope: [
      'Nebenkostenberechnung fuer Immobilienkauf (Grunderwerbsteuer, Notar, Makler).',
      'Tilgungsplan-Generierung fuer Annuitaetendarlehen.',
      'Miet-vs.-Kauf-Vergleich ueber konfigurierbaren Zeithorizont.'
    ],
    outOfScope: [
      'Immobilienbewertung / Marktpreisanalyse.',
      'Vermittlung von Finanzierungsprodukten.',
      'Mietrecht oder juristische Beratung.'
    ]
  },
  'SOL-7': {
    inScope: [
      'Facettierte Produktsuche mit Filter und Typeahead.',
      'Mandantenspezifische Produktfreigabe.',
      'Matching-Score-Berechnung basierend auf Nutzerprofil.',
      'MiFID-II-konforme Geeignetheitspruefung.',
      'Provisionstransparenz.'
    ],
    outOfScope: [
      'Produktkauf / Order-Ausfuehrung.',
      'Eigener Produktdatenpflege-Prozess (Import aus Drittanbietern).',
      'Individuelle Anlageberatung (nur regelbasierte Empfehlung).'
    ]
  },
  'SOL-8': {
    inScope: [
      'Vermoegens-Dashboard mit Gesamtvermoegen, Allokation, Timeline, Quick Stats.',
      'PDF-Report-Generierung via Headless-Rendering.',
      'Excel-Export (XLSX) mit Rohdaten.',
      'Mandanten-Branding im Report.'
    ],
    outOfScope: [
      'Echtzeit-Streaming-Dashboard (nur Refreshing bei Seitenaufruf).',
      'Druckbare Formulare (nur PDF/XLSX).',
      'E-Mail-Versand von Reports an Dritte.'
    ]
  },
  'SOL-9': {
    inScope: [
      'Immutable Audit-Logging mit Hash-Chain-Sicherung.',
      'Compliance-Query-Interface mit CSV-Export.',
      'Aufbewahrungsfristen (HGB 10 Jahre, WpHG 5 Jahre).',
      'DSGVO-Loeschantrag-Workflow mit Pseudonymisierung.',
      'Loeschbestaetigung per E-Mail.'
    ],
    outOfScope: [
      'Rechtliche Compliance-Beratung.',
      'Automatische Meldungen an Aufsichtsbehoerden (BaFin).',
      'Datenschutzfolgenabschaetzung (DSFA).'
    ]
  },
  'SOL-10': {
    inScope: [
      'Mandanten-Anlage mit Subdomain und Lizenzmodell.',
      'Feature-Flag-Konfiguration pro Mandant.',
      'SSO-Konfiguration (SAML 2.0 / OIDC).',
      'API-Key-Management.',
      'White-Label-Branding (Logo, Farben, Texte, Live-Preview).'
    ],
    outOfScope: [
      'Billing / Abrechnungsintegration.',
      'Multi-Region-Deployment.',
      'Eigene Mandanten-App-Stores.'
    ]
  }
};

// Architecture context per SOL (brief)
const SOL_ARCH = {
  'SOL-1': 'Frontend: Next.js Formulare (React Hook Form + Zod) | Backend: NestJS CRUD-Endpunkte | DB: PostgreSQL (encrypted columns via pgcrypto) | Validation: Server-side ISO 13616',
  'SOL-2': 'Frontend: Banking-Connection-Wizard | Backend: NestJS + finAPI-SDK (AISP) | Sync: Cron-basierter Sync-Job (alle 4h) | DB: PostgreSQL (transactions, positions, prices)',
  'SOL-3': 'Frontend: ECharts Rendite-Charts | Backend: NestJS Rendite-Service (TTWROR) | Cache: Redis (berechnete Zeitreihen) | DB: PostgreSQL (historische Kursdaten)',
  'SOL-4': 'Frontend: ECharts Sankey + Waterfall | Backend: NestJS Impact-Engine (stateless Berechnung) | Cache: Redis (Szenario-Snapshots) | Algo: Lineare Optimierung (Simplex-Variante)',
  'SOL-5': 'Frontend: Chat-Widget (Server-Sent Events) | Backend: NestJS Gemini-Gateway | API: Google Gemini 2.0 Flash (Structured Output) | Security: PII-Masking-Pipeline',
  'SOL-6': 'Frontend: Next.js Step-Wizard | Backend: NestJS Berechnungs-Endpunkte (stateless) | DB: PostgreSQL (Bundesland-Steuersaetze) | Charts: ECharts Line + Bar',
  'SOL-7': 'Frontend: Facettierte Suche + Detailansicht | Backend: NestJS Produktkatalog-API | DB: PostgreSQL + pg_trgm (Fuzzy-Suche) | Matching: Score-Service (konfigurierbare Gewichte)',
  'SOL-8': 'Frontend: ECharts Dashboard-Widgets | Backend: NestJS Report-Service | PDF: Puppeteer Headless-Rendering | Excel: ExcelJS | Storage: S3-kompatibel (Report-Archiv)',
  'SOL-9': 'Frontend: Admin-UI (Audit-Query) | Backend: NestJS Audit-Service (immutable writes) | DB: PostgreSQL (append-only audit table, SHA-256 hash chain) | Archiv: S3 Glacier (Cold-Storage)',
  'SOL-10': 'Frontend: Admin-Panel (Super-Admin) | Backend: NestJS Mandant-Service | Auth: SAML 2.0 / OIDC Adapter | DB: PostgreSQL (mandant_config, feature_flags) | CDN: Logo/Asset-Storage'
};

const solFiles = fs.readdirSync(SOL_DIR).filter(f => f.endsWith('.md'));
let count = 0;
const errors = [];

solFiles.forEach(solFile => {
  try {
    const filePath = path.join(SOL_DIR, solFile);
    const content = fs.readFileSync(filePath, 'utf8');

    const parts = content.split('---');
    const frontmatter = parts[1];
    const body = parts.slice(2).join('---').trim();

    const id = (frontmatter.match(/id:\s*(.+)/) || [])[1]?.trim();
    const parent = (frontmatter.match(/parent:\s*(.+)/) || [])[1]?.trim();
    if (!id) { errors.push(`${solFile}: Missing id`); return; }

    // Extract title from heading
    const titleMatch = body.match(/^#\s*\S+:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : solFile.replace(/^SOL-[\d]+_/, '').replace(/_/g, ' ').replace('.md', '');

    // Extract existing description (between metrics table and ## User Stories)
    const descMatch = body.match(/\|\s*Functions\s*\|[^|]+\|\s*\n\n([\s\S]*?)(?=\n---|\n## User Stories)/);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract metrics table
    const metricsMatch = body.match(/(\| Metrik \| Wert \|[\s\S]*?(?=\n\n))/);
    const metricsTable = metricsMatch ? metricsMatch[1].trim() : '';

    // Extract edge cases section
    const ecMatch = body.match(/(## Edge Cases[\s\S]*$)/);
    const edgeCases = ecMatch ? ecMatch[1].trim() : '';

    // Get data
    const deps = SOL_DEPS[id] || { upstream: [], downstream: [] };
    const boundaries = SOL_BOUNDARIES[id] || { inScope: [], outOfScope: [] };
    const arch = SOL_ARCH[id] || '';
    const userStories = SOL_US_MAP[id] || [];

    // Build US Index table
    let usTable = '| US-ID | Title | Status |\n| --- | --- | --- |\n';
    userStories.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));
    userStories.forEach(us => {
      usTable += `| [${us.id}](../user-stories/${us.file}) | ${us.title} | ${us.status} |\n`;
    });

    // Build dependencies
    const upStr = deps.upstream.length > 0 ? deps.upstream.join(', ') : 'keine';
    const downStr = deps.downstream.length > 0 ? deps.downstream.join(', ') : 'keine';

    // Build system boundaries
    let boundariesStr = '### In Scope\n\n';
    boundaries.inScope.forEach(s => { boundariesStr += `- ${s}\n`; });
    boundariesStr += '\n### Out of Scope\n\n';
    boundaries.outOfScope.forEach(s => { boundariesStr += `- ${s}\n`; });

    const newContent = `---
type: solution
id: ${id}
title: "${title}"
status: draft
parent: ${parent || 'BC-1'}
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: [${deps.upstream.map(d => `"${d}"`).join(', ')}]
  downstream: [${deps.downstream.map(d => `"${d}"`).join(', ')}]
---

# ${id}: ${title}

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: ${upStr} | downstream: ${downStr}

${metricsTable}

${description}

---

## System Boundaries

${boundariesStr}
---

## User Story Index

${usTable}
---

## Architecture Context

${arch}

---

${edgeCases}
`;

    fs.writeFileSync(filePath, newContent, 'utf8');
    count++;
    console.log(`  [OK] ${solFile}`);
  } catch (err) {
    errors.push(`${solFile}: ${err.message}`);
  }
});

console.log(`\n[update-sols] Updated ${count}/${solFiles.length} SOL files`);
if (errors.length > 0) console.log('Errors:', JSON.stringify(errors));
console.log(JSON.stringify({ count, errors, total: solFiles.length }));
