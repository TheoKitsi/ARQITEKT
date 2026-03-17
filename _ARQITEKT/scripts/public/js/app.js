// ===== STATE =====
let currentProject = null;
let treeData = [];
let solData = [];        // per-SOL analysis from /sol-status
let prompts = [];
let onboardDismissed = localStorage.getItem('arq-onboard-dismissed') === '1';
let deleteTarget = null;
let deleteCodename = null;
let addSolMode = 'discuss';  // 'discuss' | 'direct'
let chatMessages = [];       // current chat conversation
let chatContext = null;      // { relatedTo: 'SOL-18' | 'new', title: '...' }
let chatLLMConfigured = false;
let solFilter = 'all';      // 'all' | 'todo' | 'complete' | 'reviewed'
let solExpandState = {};    // key: projectId:SOL-X, value: true/false
let pcExpandState = {};     // key: projectId, value: true/false (hub card expand)

// Load persisted SOL expand state
try { solExpandState = JSON.parse(localStorage.getItem('arq-sol-expand') || '{}'); } catch(e) {}
try { pcExpandState = JSON.parse(localStorage.getItem('arq-pc-expand') || '{}'); } catch(e) {}

// ===== TOAST SYSTEM =====
function showToast(message, type, duration) {
  type = type || 'success';
  duration = duration || 3500;
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  c.appendChild(el);
  setTimeout(function() {
    el.style.animation = 'toastOut .3s var(--ease) forwards';
    setTimeout(function() { el.remove(); }, 300);
  }, duration);
}

// ===== FEEDBACK UI =====
let feedbackProjectId = null;

function openFeedbackModal(pid) {
  feedbackProjectId = pid;
  document.getElementById('fbkTitleInput').value = '';
  document.getElementById('fbkSourceSelect').value = 'manual';
  document.getElementById('fbkSeveritySelect').value = 'wish';
  document.getElementById('fbkRatingInput').value = '';
  document.getElementById('fbkContentInput').value = '';
  document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').style.display = 'none';
  feedbackProjectId = null;
}

async function doSaveFeedback() {
  if (!feedbackProjectId) return;
  const title = document.getElementById('fbkTitleInput').value.trim();
  if (!title) { document.getElementById('fbkTitleInput').focus(); return; }
  const payload = {
    title: title,
    source: document.getElementById('fbkSourceSelect').value,
    severity: document.getElementById('fbkSeveritySelect').value,
    rating: document.getElementById('fbkRatingInput').value || undefined,
    content: document.getElementById('fbkContentInput').value.trim(),
  };
  try {
    const res = await fetch('/api/projects/' + feedbackProjectId + '/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.id) {
      showToast(t('fbkSaved').replace('{id}', data.id), 'success');
      closeFeedbackModal();
      loadFeedbackList(feedbackProjectId);
      showHub();
    }
  } catch (err) {
    showToast(t('errorPrefix') + err.message, 'error');
  }
}

async function loadFeedbackList(pid) {
  try {
    const res = await fetch('/api/projects/' + pid + '/feedback');
    const items = await res.json();
    const cardId = 'pc-' + pid;
    const el = document.getElementById('fbk-' + cardId);
    if (!el) return;
    if (!items.length) {
      el.innerHTML = '<div class="dev-info" style="text-align:center;padding:12px 0;color:var(--fg3)">' + t('feedbackEmpty') + '</div>';
      return;
    }
    let h = '';
    for (const f of items) {
      h += '<div class="fbk-item">';
      h += '<span class="fbk-sev ' + (f.severity || 'wish') + '"></span>';
      h += '<span class="fbk-title">' + esc(f.title || f.id || '') + '</span>';
      h += '<span class="fbk-status ' + (f.status || 'collected') + '">' + (f.status || 'collected') + '</span>';
      h += '<span class="fbk-source">' + esc(f.source || 'manual') + '</span>';
      h += '</div>';
    }
    el.innerHTML = h;
  } catch {}
}

// ===== WIZARD =====
let wizPage = 1;

function openWizardModal() {
  wizPage = 1;
  document.getElementById('wizIdeaInput').value = '';
  document.getElementById('wizNameInput').value = '';
  updateWizardPage();
  document.getElementById('wizardModal').style.display = 'flex';
}

function closeWizardModal() {
  document.getElementById('wizardModal').style.display = 'none';
}

function wizSelect(btn, containerId) {
  var container = document.getElementById(containerId);
  container.querySelectorAll('.wiz-chip').forEach(function(c) { c.classList.remove('selected'); });
  btn.classList.add('selected');
}

function updateWizardPage() {
  var pages = document.querySelectorAll('.wiz-page');
  pages.forEach(function(p) { p.classList.remove('active'); });
  var current = document.querySelector('.wiz-page[data-wiz="' + wizPage + '"]');
  if (current) current.classList.add('active');
  // Update dots
  document.querySelectorAll('.wiz-step-dot').forEach(function(d) {
    var step = parseInt(d.getAttribute('data-step'));
    d.classList.remove('active', 'done');
    if (step === wizPage) d.classList.add('active');
    else if (step < wizPage) d.classList.add('done');
  });
  // Update titles from i18n
  for (var i = 1; i <= 5; i++) {
    var tEl = document.getElementById('wizTitle' + i);
    var sEl = document.getElementById('wizSub' + i);
    if (tEl) tEl.textContent = t('wizStep' + i);
    if (sEl) sEl.textContent = t('wizStep' + i + 'Sub');
  }
  // Buttons
  document.getElementById('wizBackBtn').style.display = wizPage > 1 ? '' : 'none';
  document.getElementById('wizBackBtn').textContent = t('wizBack');
  if (wizPage < 5) {
    document.getElementById('wizNextBtn').textContent = t('wizNext');
    document.getElementById('wizNextBtn').onclick = wizNext;
  } else {
    document.getElementById('wizNextBtn').textContent = t('wizCreate');
    document.getElementById('wizNextBtn').onclick = doWizardCreate;
    // Build summary
    var idea = document.getElementById('wizIdeaInput').value.trim();
    var audience = (document.querySelector('#wizAudienceChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'b2c';
    var platform = (document.querySelector('#wizPlatformChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'web';
    var name = document.getElementById('wizNameInput').value.trim();
    var sum = '<strong>' + esc(name || 'Unnamed') + '</strong><br>';
    sum += t('wizSummaryIdea') + esc(idea.slice(0, 120)) + (idea.length > 120 ? '...' : '') + '<br>';
    sum += t('wizSummaryAudience') + audience.toUpperCase() + '<br>';
    sum += t('wizSummaryPlatform') + platform;
    document.getElementById('wizSummary').innerHTML = sum;
  }
  // Preview for step 4
  if (wizPage === 4) {
    var ni = document.getElementById('wizNameInput');
    ni.oninput = function() {
      var v = ni.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 30);
      document.getElementById('wizPreview').textContent = v ? t('wizSummaryFolder') + 'XXX_' + v : '';
    };
  }
}

function wizNext() { if (wizPage < 5) { wizPage++; updateWizardPage(); } }
function wizPrev() { if (wizPage > 1) { wizPage--; updateWizardPage(); } }

async function doWizardCreate() {
  var idea = document.getElementById('wizIdeaInput').value.trim();
  var name = document.getElementById('wizNameInput').value.trim();
  if (!name) { wizPage = 4; updateWizardPage(); document.getElementById('wizNameInput').focus(); return; }
  var audience = (document.querySelector('#wizAudienceChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'b2c';
  var platform = (document.querySelector('#wizPlatformChips .wiz-chip.selected') || {}).getAttribute('data-val') || 'web';
  var desc = idea.slice(0, 200);
  try {
    var res = await fetch('/api/projects/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, description: desc, audience: audience, platform: platform, idea: idea })
    });
    var data = await res.json();
    if (data.id) {
      closeWizardModal();
      showToast(t('celebrateBC'), 'celebrate', 5000);
      showHub();
    } else {
      showToast(data.error || 'Error creating project', 'error');
    }
  } catch (err) {
    showToast(t('errorPrefix') + err.message, 'error');
  }
}

function statusBg(s) {
  const m = { 'needs-us':'rgba(255,215,0,0.1)', 'needs-cmp':'rgba(255,215,0,0.1)', 'needs-fn':'rgba(255,215,0,0.1)', 'complete':'rgba(63,185,80,0.12)', 'reviewed':'rgba(88,166,255,0.12)' };
  return m[s] || 'rgba(136,146,164,0.1)';
}
function statusColor(s) {
  const m = { 'needs-us':'var(--gold)', 'needs-cmp':'var(--gold)', 'needs-fn':'var(--gold)', 'complete':'var(--green)', 'reviewed':'var(--accent)' };
  return m[s] || 'var(--fg3)';
}
function statusBorder(s) {
  const m = { 'needs-us':'rgba(255,215,0,0.25)', 'needs-cmp':'rgba(255,215,0,0.25)', 'needs-fn':'rgba(255,215,0,0.25)', 'complete':'rgba(63,185,80,0.25)', 'reviewed':'rgba(88,166,255,0.25)' };
  return m[s] || 'rgba(136,146,164,0.15)';
}

function toggleSolCard(key) {
  solExpandState[key] = !solExpandState[key];
  localStorage.setItem('arq-sol-expand', JSON.stringify(solExpandState));
  const card = document.querySelector('[data-sol-key="' + key + '"]');
  if (card) card.classList.toggle('expanded', solExpandState[key]);
}

function toggleAllSolCards(expand) {
  document.querySelectorAll('.sol-card[data-sol-key]').forEach(card => {
    const key = card.getAttribute('data-sol-key');
    solExpandState[key] = expand;
    card.classList.toggle('expanded', expand);
  });
  localStorage.setItem('arq-sol-expand', JSON.stringify(solExpandState));
}

function togglePcCard(pid) {
  pcExpandState[pid] = !pcExpandState[pid];
  localStorage.setItem('arq-pc-expand', JSON.stringify(pcExpandState));
  const card = document.getElementById('card-' + pid);
  if (card) {
    card.classList.toggle('expanded', pcExpandState[pid]);
    const lbl = card.querySelector('.pc-expand-toggle span:last-child');
    if (lbl) lbl.textContent = pcExpandState[pid] ? t('collapseCard') : t('expandCard');
  }
}

function toggleAllPcCards(expand) {
  document.querySelectorAll('.project-card[id^="card-"]').forEach(card => {
    const pid = card.id.replace('card-', '');
    pcExpandState[pid] = expand;
    card.classList.toggle('expanded', expand);
    const lbl = card.querySelector('.pc-expand-toggle span:last-child');
    if (lbl) lbl.textContent = expand ? t('collapseCard') : t('expandCard');
  });
  localStorage.setItem('arq-pc-expand', JSON.stringify(pcExpandState));
}

// ===== i18n =====
let currentLang = localStorage.getItem('arq-lang') || 'de';
const i18n = {
  de: {
    projects: 'Projekte', hubSub: 'Deine Apps und Projekte',
    hubSubFull: 'Von der Idee bis zum App Store \u2014 Schritt fuer Schritt',
    storeConfig: 'Store konfigurieren', storeBuild: 'Release bauen', storeUpload: 'Hochladen',
    storeGHActions: 'CI/CD Pipeline', storePush: 'Push to GitHub',
    expandAll: 'Alle aufklappen', collapseAll: 'Alle zuklappen',
    newProject: 'Neues Projekt', import: 'Import', dashboard: 'Dashboard', edit: 'Bearbeiten',
    planning: 'Planung', ready: 'Bereit', building: 'Wird gebaut...', built: 'Gebaut', running: 'Aktiv', deployed: 'Veroeffentlicht',
    validate: 'Pruefen', refresh: 'Aktualisieren',
    authored: 'Fortschritt', approved: 'Freigabe',
    // Harald-friendly step names
    nsCreateBC: 'Geschaeftsidee beschreiben', nsDeriveSol: 'Loesungsansaetze ableiten',
    nsCreateUS: 'Nutzerszenarien erstellen', nsDefineCmp: 'Bausteine definieren',
    nsSpecifyFn: 'Features spezifizieren', nsReview: 'Qualitaetspruefung durchfuehren',
    nsStartDev: 'Entwicklung starten', nsScaffold: 'App generieren',
    nsStartApp: 'App starten / testen', nsDeploy: 'Veroeffentlichen',
    reviewComplete: 'Pruefung abgeschlossen', startDev: 'Entwicklung starten \u2192', moreIdeas: 'Weitere Ideen hinzufuegen',
    devSection: 'Entwicklung', opsSection: 'Betrieb', planSection: 'Planung',
    scaffold: 'App generieren', branding: 'Design', runTests: 'Tests starten', setupPlaywright: 'Tests einrichten',
    noApp: 'Noch keine App generiert. Nutze den Entwicklung-Tab um deine App zu erstellen.',
    appStart: 'App starten', appStop: 'App stoppen', openCode: 'Code oeffnen',
    appExists: 'Vorhanden', appNotGen: 'Nicht generiert', appProd: 'Produktiv starten', openBrowser: 'Im Browser oeffnen',
    onboardHint: 'Beschreibe deine Idee, um loszulegen. Der KI-Assistent hilft dir bei jedem Schritt.',
    exportIssues: 'Issues exportieren', generateTests: 'Tests generieren \u2192 Copilot',
    expandCard: 'Details', collapseCard: 'Weniger',
    expandAllCards: 'Alle aufklappen', collapseAllCards: 'Alle zuklappen',
    nsRemediation: 'Nachbesserung abschliessen', nsFixFindings: 'Pruefungsergebnisse beheben',
    devProgress: 'Entwicklungsfortschritt', filterBtn: 'Filter', clearAll: 'Alle entfernen',
    deleteConfirmTitle: 'Projekt loeschen?',
    deleteGithubHint: 'Dieses Projekt existiert auch auf GitHub. Nur die lokale Kopie wird geloescht.',
    deleteTypeConfirm: 'Tippe "{codename}" zur Bestaetigung:',
    deleteArtifactCount: '{n} Eintraege werden unwiderruflich geloescht.',
    // Feedback
    feedbackSection: 'Feedback', feedbackAdd: 'Feedback hinzufuegen',
    feedbackOpen: 'offen', feedbackPlanned: 'geplant', feedbackDone: 'erledigt',
    feedbackSourceManual: 'Manuell', feedbackSourceGPlay: 'Google Play', feedbackSourceAppStore: 'App Store',
    feedbackSourceInApp: 'In-App', feedbackSourceEmail: 'E-Mail',
    feedbackSevWish: 'Wunsch', feedbackSevImprovement: 'Verbesserung', feedbackSevBug: 'Fehler', feedbackSevCritical: 'Kritisch',
    feedbackTitle: 'Was hat der Nutzer gesagt?', feedbackConvert: 'In Anforderung umwandeln',
    feedbackEmpty: 'Noch kein Feedback. Erfasse Rueckmeldungen von Nutzern hier.',
    feedbackBadge: '{n} offen',
    // Help system
    helpBC: 'Beschreibe deine App-Idee in eigenen Worten. Was ist das Problem? Wer soll die App nutzen? Was macht sie besonders?',
    helpSOL: 'Loesungsansaetze sind die grossen Funktionsbereiche deiner App. Stell dir vor, du beschreibst einem Freund: "Meine App hat ein Matching-System, einen Chat und Profile."',
    helpUS: 'Nutzerszenarien beschreiben, was ein konkreter Nutzer mit deiner App machen kann. Zum Beispiel: "Als Nutzer moechte ich mein Profil bearbeiten."',
    helpCMP: 'Bausteine sind die Lego-Teile deiner App. Jedes Nutzerszenario besteht aus einem oder mehreren Bausteinen (z.B. Profilformular, Chat-Fenster, Benachrichtigungsleiste).',
    helpFN: 'Features sind die einzelnen Funktionen innerhalb eines Bausteins. Zum Beispiel: "Profilbild hochladen", "Nachricht senden", "Push-Benachrichtigung anzeigen".',
    helpREV: 'In der Qualitaetspruefung kontrolliert der KI-Assistent, ob alles vollstaendig und konsistent ist \u2014 bevor du mit der Entwicklung startest.',
    helpValidate: 'Prueft dein Projekt auf Vollstaendigkeit und Fehler. Gruene Haken = alles gut. Rote Punkte = hier fehlt noch etwas.',
    helpScaffold: 'Erzeugt automatisch die komplette App aus deinen Anforderungen: Seiten, Bausteine, Code-Geruest \u2014 bereit zum Weiterentwickeln.',
    // Wizard
    wizStep1: 'Was ist deine Idee?', wizStep1Sub: 'Beschreibe deine App, dein Spiel oder deine Plattform in eigenen Worten. Keine Fachbegriffe noetig.',
    wizStep2: 'Fuer wen ist es?', wizStep2Sub: 'Wer soll deine App nutzen?',
    wizStep3: 'Welche Plattform?', wizStep3Sub: 'Wo soll deine App laufen?',
    wizStep4: 'Gib deinem Projekt einen Namen', wizStep4Sub: 'Keine Sorge, du kannst ihn spaeter aendern.',
    wizStep5: 'Alles bereit!', wizStep5Sub: 'Dein Projekt wird erstellt und der KI-Assistent startet mit dir.',
    wizPlatformWeb: 'Web App', wizPlatformAndroid: 'Android', wizPlatformIOS: 'iOS', wizPlatformAll: 'Alle Plattformen',
    wizAudienceConsumer: 'Endnutzer (B2C)', wizAudienceBusiness: 'Unternehmen (B2B)', wizAudienceBoth: 'Beide',
    wizCreate: 'Projekt erstellen', wizNext: 'Weiter', wizBack: 'Zurueck',
    // Celebrations
    celebrateBC: 'Deine Geschaeftsidee steht! Der KI-Assistent hilft dir als naechstes, Loesungsansaetze abzuleiten.',
    celebrateSOL: 'Dein Projekt hat jetzt {n} Loesungsansaetze. Das ist eine solide Grundlage!',
    celebrateUS: 'Alle Nutzerszenarien sind definiert. Jetzt werden die Bausteine abgeleitet.',
    celebrateFN: 'Alle Features sind spezifiziert! Zeit fuer die Qualitaetspruefung.',
    celebrateReady: 'Glueckwunsch! Dein Projekt ist bereit fuer die Entwicklung.',
    celebrateDeployed: 'Deine App ist live! Ab jetzt kannst du Nutzerfeedback sammeln.',
    // UI labels (modals, buttons, static HTML)
    cancel: 'Abbrechen', save: 'Speichern', deleteBtn: 'Loeschen', close: 'Schliessen',
    modalCreateTitle: 'Neues Projekt erstellen', projectName: 'Projektname',
    descOptional: 'Beschreibung (optional)', descLabel: 'Beschreibung',
    modalImportTitle: 'Externes Projekt importieren', sourcePath: 'Quell-Pfad',
    importBtn: 'Importieren', modalBrandingTitle: 'App Branding',
    primaryColor: 'Primaerfarbe', secondaryColor: 'Sekundaerfarbe',
    logoPath: 'Logo Pfad', modeLabel: 'Modus',
    editProject: 'Projekt bearbeiten',
    addSolTitle: 'Neue Loesung hinzufuegen', addSolSub: 'Erweitere den Anforderungsbaum mit einer neuen Loesung.',
    modeDiscuss: 'Diskutieren', modeDiscussSub: 'Mit KI brainstormen, dann formalisieren',
    modeDirect: 'Direkt erstellen', modeDirectSub: 'Prompt generieren, Copilot erstellt',
    solTitleLabel: 'Titel / Thema der Loesung', notesLabel: 'Notizen / Stichworte (optional)',
    startDiscussion: 'Diskussion starten',
    addUSModalTitle: 'Neues Nutzerszenario', addUSSub: 'Fuege ein Nutzerszenario zu dieser Loesung hinzu.',
    usTitleLabel: 'Titel / Thema des Nutzerszenarios',
    chatDiscussion: 'Diskussion', chatSend: 'Senden', chatSave: 'Speichern',
    chatFormalize: 'Formalisieren \u2192 Copilot', chatPlaceholder: 'Nachricht eingeben...',
    fbkModalTitle: 'Feedback hinzufuegen', fbkTitleLabel: 'Titel',
    fbkSource: 'Quelle', fbkSeverity: 'Dringlichkeit', fbkRating: 'Bewertung',
    fbkDesc: 'Beschreibung',
    noDescription: 'Keine Beschreibung',
    statBC: 'Idee', statSOL: 'Loesungen', statUS: 'Szenarien', statCMP: 'Bausteine', statFN: 'Features',
    statINF: 'Infrastruktur', statADR: 'Entscheidungen', statNTF: 'Hinweise',
    vsCode: 'VS Code', backToProjects: '\u2190 Projekte',
    stepLabel: 'Schritt', done: 'fertig', open: 'offen', reviewed: 'geprueft',
    filterAll: 'Alle', filterOpen: 'Offen', filterDone: 'Fertig',
    needsUS: 'Nutzerszenarien fehlen', needsCMP: 'Bausteine fehlen', needsFN: 'Features fehlen',
    solComplete: 'Fertig', solReviewed: 'Geprueft',
    readyForReview: 'bereit zur Pruefung', batchCopilot: 'Batch \u2192 Copilot', reviewCopilot: 'Review \u2192 Copilot',
    exportTree: 'Anforderungsbaum exportieren', toCopilot: '\u2192 Copilot',
    devReady: 'Das Projekt ist bereit fuer die Implementierung.',
    devBuilding: 'Die Anwendung wird generiert...', devBuilt: 'Die Anwendung ist generiert und bereit zum Starten.',
    devRunning: 'Die Anwendung laeuft.', devDeployed: 'Die Anwendung ist deployed.',
    scaffoldCopilot: 'Scaffold App \u2192 Copilot', autoScaffold: 'Auto-Scaffold',
    buildProgress: 'Build in progress...', genTestsReq: 'E2E Tests aus Anforderungen generieren:',
    promptCopied: 'Prompt kopiert! Fuege ihn in Copilot Chat ein.', copied: 'Kopiert!',
    storeDeploy: 'Store Deploy', storeUploadBtn: 'In Store hochladen',
    noMatches: 'Keine Treffer', notFound: 'Nicht gefunden',
    howItWorks: 'So funktioniert es:', searchPlaceholder: 'Suchen... (SOL-3, Matching, ...)',
    progressTitle: 'Fortschritt', detailTitle: 'Detail', validationTitle: 'Validierung',
    runningValidation: 'Pruefung laeuft...',
    addUS: '+ US', chatBtn: 'Chat',
    solDotSolution: 'Loesung', solDotScenarios: 'Szenarien', solDotBlocks: 'Bausteine',
    solDotFeatures: 'Features', solDotReview: 'Pruefung', solDotPending: 'ausstehend',
    devHeading: 'Entwicklung',
    confirmScaffold: 'Anwendung aus Requirements generieren?',
    confirmForceScaffold: 'Force Scaffold: Implementierung erzwingen?',
    confirmExport: 'GitHub Issues aus Requirements exportieren?',
    confirmPush: 'App-Code zum GitHub Repository pushen?',
    confirmStoreBuild: 'Release-Build starten?',
    confirmBuildDeploy: 'Production Build + Start?',
    confirmPlaywright: 'Playwright E2E Testing im Projekt einrichten?',
    savedConv: 'Diskussion gespeichert.', discussFirst: 'Fuehre zuerst eine Diskussion.',
    formalized: 'Formalisierungs-Prompt in Zwischenablage kopiert.',
    requiredFields: 'Pflichtfelder fehlen.',
    noEmpty: 'Noch keine Projekte',
    batchNeedUS: '{n} Loesungsansaetze brauchen Nutzerszenarien',
    batchNeedCMP: '{n} Loesungsansaetze brauchen Bausteine',
    batchNeedFN: '{n} Loesungsansaetze brauchen Features',
    batchReadyReview: '{n} Loesungsansaetze bereit zur Pruefung',
    pressGold: 'Druecke auf die goldenen Buttons, um Copilot-Prompts zu kopieren.',
    genTestsCopilot: 'Tests generieren \u2192 Copilot',
    errorPrefix: 'Fehler: ',
    fbkSaved: 'Feedback {id} gespeichert',
    wizSummaryIdea: 'Idee: ', wizSummaryAudience: 'Zielgruppe: ', wizSummaryPlatform: 'Plattform: ', wizSummaryFolder: 'Ordner: ',
    importError: 'Import-Fehler: ', importSuccess: 'Projekt importiert: {id} mit {n} Dateien.',
    // Tabs
    tabPlan: 'Plan', tabDevelop: 'Entwickeln', tabDeploy: 'Bereitstellen', tabMonitor: 'Monitor',
    // File explorer
    feFiles: 'Dateien', feRefresh: 'Aktualisieren',
    // Editor
    editorOpenFile: 'Datei aus dem Explorer oeffnen', editorTitle: 'Code Editor',
    editorSub: 'Waehle eine Datei aus dem Explorer, um mit der Bearbeitung zu beginnen.',
    editorAiHint: 'KI-Unterstuetzung verfuegbar wenn GitHub verbunden ist.',
    // Terminal
    terminalTitle: 'Terminal', termRun: 'Ausfuehren', termClear: 'Leeren',
    termPlaceholder: 'npm install, npm start, npm test...',
    // Deploy
    deployBuildScaffold: 'Build & Scaffold', deployStoreDist: 'Store & Distribution',
    deployGithub: 'GitHub',
    deployScaffoldTitle: 'App generieren', deployScaffoldDesc: 'Projektstruktur aus Anforderungen generieren.',
    deployScaffoldBtn: 'Scaffold',
    deployCodegenTitle: 'Code-Generierung', deployCodegenDesc: 'KI-gestuetzte Code-Generierung aus Spezifikationen.',
    deployCodegenBtn: 'Generieren',
    deployBuildDeployTitle: 'Build & Deploy', deployBuildDeployDesc: 'Produktionsversion bauen und bereitstellen.',
    deployBuildDeployBtn: 'Build + Deploy',
    deployGPlayTitle: 'Google Play', deployGPlayDesc: 'Store-Eintrag konfigurieren und hochladen.',
    deployConfigureBtn: 'Konfigurieren', deployBuildAAB: 'Build AAB', deployUploadBtn: 'Hochladen',
    deployCICDTitle: 'CI/CD', deployCICDDesc: 'GitHub Actions Workflow generieren.',
    deploySetupActions: 'Actions einrichten',
    deployExportTitle: 'Issues exportieren', deployExportDesc: 'Anforderungen als GitHub Issues exportieren.',
    deployExportBtn: 'Exportieren',
    deployPushTitle: 'Push to GitHub', deployPushDesc: 'Code committen und zu GitHub pushen.',
    deployPushBtn: 'Push',
    // Monitor
    monitorAppStatus: 'App-Status', monitorFeedback: 'Feedback', monitorValidation: 'Validierung',
    monitorRunning: 'Laeuft', monitorNotRunning: 'Nicht gestartet',
    monitorRestart: 'Neustart', monitorStart: 'Starten', monitorStop: 'Stoppen',
    monitorUserFeedback: 'Nutzer-Feedback', monitorAddFeedback: '+ Hinzufuegen',
    monitorReqHealth: 'Anforderungs-Gesundheit',
    monitorRunValidation: 'Validierung starten', monitorRunTests: 'Tests starten',
    // GitHub modal
    ghConnectTitle: 'GitHub verbinden',
    ghConnectDesc: 'Verbinde dein GitHub-Konto, um KI-gestuetzte Entwicklung mit GPT-4o, Claude, DeepSeek R1 und mehr freizuschalten.',
    ghStep1: 'Schritt 1: Personal Access Token erstellen',
    ghOpenTokenPage: 'GitHub Token-Seite oeffnen',
    ghPermissions: 'Erforderliche Berechtigungen: ',
    ghStep2: 'Schritt 2: Token einfuegen',
    ghConnectBtn: 'Verbinden', ghConnecting: 'Verbinde...',
    ghConnected: 'Verbunden', ghAvailableModels: 'Verfuegbare KI-Modelle',
    ghDisconnect: 'Trennen', ghDisconnected: 'GitHub getrennt',
    ghConnectedAs: 'Verbunden als {name}', ghConnectionFailed: 'Verbindung fehlgeschlagen: ',
    // Voice
    voiceNotSupported: 'Spracheingabe wird in diesem Browser nicht unterstuetzt',
    voiceError: 'Sprachfehler: ',
    // GitHub repo
    ghRepoStatus: 'Repository Status', ghRepoNoConfig: 'Kein GitHub Repo konfiguriert',
    ghRepoCommits: 'Letzte Commits', ghRepoBranches: 'Branches', ghRepoActions: 'Actions',
    ghRepoNone: 'Keine Daten',
    // Auto-Update
    updateAvailable: 'Update verfuegbar',
    updateCurrent: 'Aktuelle Version: v{version}',
    updateNew: 'Neue Version: v{version}',
    updateInstall: 'Update installieren',
    updateDismiss: 'Spaeter',
    updateInstalling: 'Update wird installiert...',
    updateSuccess: 'Update auf v{version} installiert. Server-Neustart erforderlich.',
    updateRestart: 'Server neu starten',
    updateFailed: 'Update fehlgeschlagen: {error}',
    updateNoRepo: 'Kein Update-Repository konfiguriert',
    updateUpToDate: 'ARQITEKT Hub ist aktuell (v{version})',
    updateChecking: 'Pruefe auf Updates...',
    cmdSearch: 'Suchen oder Aktion starten...',
    noResults: 'Keine Ergebnisse',
    noActivity: 'Noch keine Aktivitaeten',
    trackerTitle: 'Fortschritt',
    noConversations: 'Keine gespeicherten Gespraeche',
  },
  en: {
    projects: 'Projects', hubSub: 'Your apps and projects',
    hubSubFull: 'From Idea to App Store \u2014 Step by Step',
    storeConfig: 'Configure Store', storeBuild: 'Build Release', storeUpload: 'Upload',
    storeGHActions: 'CI/CD Pipeline', storePush: 'Push to GitHub',
    expandAll: 'Expand All', collapseAll: 'Collapse All',
    newProject: 'New Project', import: 'Import', dashboard: 'Dashboard', edit: 'Edit',
    planning: 'Planning', ready: 'Ready', building: 'Building...', built: 'Built', running: 'Running', deployed: 'Published',
    validate: 'Check', refresh: 'Refresh',
    authored: 'Progress', approved: 'Approved',
    // Harald-friendly step names
    nsCreateBC: 'Describe your idea', nsDeriveSol: 'Derive solution approaches',
    nsCreateUS: 'Create user scenarios', nsDefineCmp: 'Define building blocks',
    nsSpecifyFn: 'Specify features', nsReview: 'Run quality check',
    nsStartDev: 'Start development', nsScaffold: 'Generate app',
    nsStartApp: 'Start / test app', nsDeploy: 'Publish',
    reviewComplete: 'Quality check complete', startDev: 'Start development \u2192', moreIdeas: 'Add more ideas',
    devSection: 'Development', opsSection: 'Operations', planSection: 'Planning',
    scaffold: 'Generate App', branding: 'Design', runTests: 'Run Tests', setupPlaywright: 'Setup Tests',
    noApp: 'No app generated yet. Use the Development tab to generate your app first.',
    appStart: 'Start App', appStop: 'Stop App', openCode: 'Open Code',
    appExists: 'Available', appNotGen: 'Not generated', appProd: 'Production Start', openBrowser: 'Open in Browser',
    onboardHint: 'Describe your idea to get started. The AI assistant will guide you at every step.',
    exportIssues: 'Export Issues', generateTests: 'Generate Tests \u2192 Copilot',
    expandCard: 'Details', collapseCard: 'Less',
    expandAllCards: 'Expand All', collapseAllCards: 'Collapse All',
    nsRemediation: 'Complete Remediation', nsFixFindings: 'Fix Review Findings',
    devProgress: 'Development Progress', filterBtn: 'Filter', clearAll: 'Clear all',
    deleteConfirmTitle: 'Delete project?',
    deleteGithubHint: 'This project also exists on GitHub. Only the local copy will be deleted.',
    deleteTypeConfirm: 'Type "{codename}" to confirm:',
    deleteArtifactCount: '{n} entries will be permanently deleted.',
    // Feedback
    feedbackSection: 'Feedback', feedbackAdd: 'Add Feedback',
    feedbackOpen: 'open', feedbackPlanned: 'planned', feedbackDone: 'done',
    feedbackSourceManual: 'Manual', feedbackSourceGPlay: 'Google Play', feedbackSourceAppStore: 'App Store',
    feedbackSourceInApp: 'In-App', feedbackSourceEmail: 'Email',
    feedbackSevWish: 'Wish', feedbackSevImprovement: 'Improvement', feedbackSevBug: 'Bug', feedbackSevCritical: 'Critical',
    feedbackTitle: 'What did the user say?', feedbackConvert: 'Convert to Requirement',
    feedbackEmpty: 'No feedback yet. Capture user feedback here.',
    feedbackBadge: '{n} open',
    // Help system
    helpBC: 'Describe your app idea in your own words. What problem does it solve? Who will use it? What makes it special?',
    helpSOL: 'Solution approaches are the major feature areas of your app. Imagine telling a friend: "My app has a matching system, a chat, and profiles."',
    helpUS: 'User scenarios describe what a real user can do with your app. For example: "As a user I want to edit my profile."',
    helpCMP: 'Building blocks are the Lego pieces of your app. Each user scenario consists of one or more blocks (e.g. profile form, chat window, notification bar).',
    helpFN: 'Features are the individual functions inside a building block. For example: "Upload profile picture", "Send message", "Show push notification".',
    helpREV: 'The quality check verifies that everything is complete and consistent \u2014 before you start development.',
    helpValidate: 'Checks your project for completeness and errors. Green checks = all good. Red dots = something is still missing.',
    helpScaffold: 'Automatically generates the complete app from your requirements: pages, building blocks, code skeleton \u2014 ready for further development.',
    // Wizard
    wizStep1: 'What is your idea?', wizStep1Sub: 'Describe your app, game, or platform in your own words. No technical terms needed.',
    wizStep2: 'Who is it for?', wizStep2Sub: 'Who should use your app?',
    wizStep3: 'What platform?', wizStep3Sub: 'Where should your app run?',
    wizStep4: 'Name your project', wizStep4Sub: 'Don\'t worry, you can change it later.',
    wizStep5: 'All set!', wizStep5Sub: 'Your project will be created and the AI assistant starts with you.',
    wizPlatformWeb: 'Web App', wizPlatformAndroid: 'Android', wizPlatformIOS: 'iOS', wizPlatformAll: 'All Platforms',
    wizAudienceConsumer: 'Consumers (B2C)', wizAudienceBusiness: 'Businesses (B2B)', wizAudienceBoth: 'Both',
    wizCreate: 'Create Project', wizNext: 'Next', wizBack: 'Back',
    // Celebrations
    celebrateBC: 'Your business idea is defined! The AI assistant will help you derive solution approaches next.',
    celebrateSOL: 'Your project now has {n} solution approaches. That\'s a solid foundation!',
    celebrateUS: 'All user scenarios are defined. Now the building blocks will be derived.',
    celebrateFN: 'All features are specified! Time for the quality check.',
    celebrateReady: 'Congratulations! Your project is ready for development.',
    celebrateDeployed: 'Your app is live! You can now start collecting user feedback.',
    // UI labels (modals, buttons, static HTML)
    cancel: 'Cancel', save: 'Save', deleteBtn: 'Delete', close: 'Close',
    modalCreateTitle: 'Create New Project', projectName: 'Project Name',
    descOptional: 'Description (optional)', descLabel: 'Description',
    modalImportTitle: 'Import External Project', sourcePath: 'Source Path',
    importBtn: 'Import', modalBrandingTitle: 'App Branding',
    primaryColor: 'Primary Color', secondaryColor: 'Secondary Color',
    logoPath: 'Logo Path', modeLabel: 'Mode',
    editProject: 'Edit Project',
    addSolTitle: 'Add New Solution', addSolSub: 'Extend the Requirement-Tree with a new Solution.',
    modeDiscuss: 'Discuss', modeDiscussSub: 'Brainstorm with AI, then formalize',
    modeDirect: 'Create Directly', modeDirectSub: 'Generate prompt, Copilot creates',
    solTitleLabel: 'Solution Title / Topic', notesLabel: 'Notes / Keywords (optional)',
    startDiscussion: 'Start Discussion',
    addUSModalTitle: 'Add New User Story', addUSSub: 'Add a User Story to this Solution.',
    usTitleLabel: 'User Story Title / Topic',
    chatDiscussion: 'Discussion', chatSend: 'Send', chatSave: 'Save',
    chatFormalize: 'Formalize \u2192 Copilot', chatPlaceholder: 'Type a message...',
    fbkModalTitle: 'Add Feedback', fbkTitleLabel: 'Title',
    fbkSource: 'Source', fbkSeverity: 'Severity', fbkRating: 'Rating',
    fbkDesc: 'Description',
    noDescription: 'No description',
    statBC: 'Idea', statSOL: 'Solutions', statUS: 'Scenarios', statCMP: 'Blocks', statFN: 'Features',
    statINF: 'Infrastructure', statADR: 'Decisions', statNTF: 'Notifications',
    vsCode: 'VS Code', backToProjects: '\u2190 Projects',
    stepLabel: 'Step', done: 'done', open: 'open', reviewed: 'reviewed',
    filterAll: 'All', filterOpen: 'Open', filterDone: 'Done',
    needsUS: 'User scenarios missing', needsCMP: 'Building blocks missing', needsFN: 'Features missing',
    solComplete: 'Complete', solReviewed: 'Reviewed',
    readyForReview: 'ready for review', batchCopilot: 'Batch \u2192 Copilot', reviewCopilot: 'Review \u2192 Copilot',
    exportTree: 'Export Requirement-Tree', toCopilot: '\u2192 Copilot',
    devReady: 'The project is ready for implementation.',
    devBuilding: 'The application is being generated...', devBuilt: 'The application is generated and ready to start.',
    devRunning: 'The application is running.', devDeployed: 'The application is deployed.',
    scaffoldCopilot: 'Scaffold App \u2192 Copilot', autoScaffold: 'Auto-Scaffold',
    buildProgress: 'Build in progress...', genTestsReq: 'Generate E2E tests from requirements:',
    promptCopied: 'Prompt copied! Paste it into Copilot Chat.', copied: 'Copied!',
    storeDeploy: 'Store Deploy', storeUploadBtn: 'Upload to Store',
    noMatches: 'No matches', notFound: 'Not found',
    howItWorks: 'How it works:', searchPlaceholder: 'Search... (SOL-3, Matching, ...)',
    progressTitle: 'Progress', detailTitle: 'Detail', validationTitle: 'Validation',
    runningValidation: 'Running validation...',
    addUS: '+ US', chatBtn: 'Chat',
    solDotSolution: 'Solution', solDotScenarios: 'Scenarios', solDotBlocks: 'Blocks',
    solDotFeatures: 'Features', solDotReview: 'Review', solDotPending: 'pending',
    devHeading: 'Development',
    confirmScaffold: 'Generate application from requirements?',
    confirmForceScaffold: 'Force Scaffold: Generate implementation anyway?',
    confirmExport: 'Export requirements as GitHub Issues?',
    confirmPush: 'Push app code to GitHub repository?',
    confirmStoreBuild: 'Start release build?',
    confirmBuildDeploy: 'Production Build + Start?',
    confirmPlaywright: 'Set up Playwright E2E Testing?',
    savedConv: 'Discussion saved.', discussFirst: 'Have a discussion first.',
    formalized: 'Formalization prompt copied to clipboard.',
    requiredFields: 'Required fields missing.',
    noEmpty: 'No projects yet',
    batchNeedUS: '{n} solutions need user scenarios',
    batchNeedCMP: '{n} solutions need building blocks',
    batchNeedFN: '{n} solutions need features',
    batchReadyReview: '{n} solutions ready for review',
    pressGold: 'Press the golden buttons to copy Copilot prompts.',
    genTestsCopilot: 'Generate Tests \u2192 Copilot',
    errorPrefix: 'Error: ',
    fbkSaved: 'Feedback {id} saved',
    wizSummaryIdea: 'Idea: ', wizSummaryAudience: 'Audience: ', wizSummaryPlatform: 'Platform: ', wizSummaryFolder: 'Folder: ',
    importError: 'Import error: ', importSuccess: 'Project imported: {id} with {n} files.',
    // Tabs
    tabPlan: 'Plan', tabDevelop: 'Develop', tabDeploy: 'Deploy', tabMonitor: 'Monitor',
    // File explorer
    feFiles: 'Files', feRefresh: 'Refresh',
    // Editor
    editorOpenFile: 'Open a file from the explorer', editorTitle: 'Code Editor',
    editorSub: 'Select a file from the explorer to start editing.',
    editorAiHint: 'AI-powered suggestions available when GitHub is connected.',
    // Terminal
    terminalTitle: 'Terminal', termRun: 'Run', termClear: 'Clear',
    termPlaceholder: 'npm install, npm start, npm test...',
    // Deploy
    deployBuildScaffold: 'Build & Scaffold', deployStoreDist: 'Store & Distribution',
    deployGithub: 'GitHub',
    deployScaffoldTitle: 'Scaffold App', deployScaffoldDesc: 'Generate project structure from requirements.',
    deployScaffoldBtn: 'Scaffold',
    deployCodegenTitle: 'Code Generation', deployCodegenDesc: 'AI-powered code generation from specifications.',
    deployCodegenBtn: 'Generate',
    deployBuildDeployTitle: 'Build & Deploy', deployBuildDeployDesc: 'Build production version and deploy.',
    deployBuildDeployBtn: 'Build + Deploy',
    deployGPlayTitle: 'Google Play', deployGPlayDesc: 'Configure store listing and upload.',
    deployConfigureBtn: 'Configure', deployBuildAAB: 'Build AAB', deployUploadBtn: 'Upload',
    deployCICDTitle: 'CI/CD', deployCICDDesc: 'Generate GitHub Actions workflow.',
    deploySetupActions: 'Setup Actions',
    deployExportTitle: 'Export Issues', deployExportDesc: 'Export requirements as GitHub Issues.',
    deployExportBtn: 'Export',
    deployPushTitle: 'Push to GitHub', deployPushDesc: 'Commit and push code to GitHub repo.',
    deployPushBtn: 'Push',
    // Monitor
    monitorAppStatus: 'App Status', monitorFeedback: 'Feedback', monitorValidation: 'Validation',
    monitorRunning: 'Running', monitorNotRunning: 'Not running',
    monitorRestart: 'Restart', monitorStart: 'Start', monitorStop: 'Stop',
    monitorUserFeedback: 'User Feedback', monitorAddFeedback: '+ Add',
    monitorReqHealth: 'Requirements Health',
    monitorRunValidation: 'Run Validation', monitorRunTests: 'Run Tests',
    // GitHub modal
    ghConnectTitle: 'Connect GitHub',
    ghConnectDesc: 'Connect your GitHub account to unlock AI-powered development with GPT-4o, Claude, DeepSeek R1, and more.',
    ghStep1: 'Step 1: Create a Personal Access Token',
    ghOpenTokenPage: 'Open GitHub Token Page',
    ghPermissions: 'Required permissions: ',
    ghStep2: 'Step 2: Paste your token',
    ghConnectBtn: 'Connect', ghConnecting: 'Connecting...',
    ghConnected: 'Connected', ghAvailableModels: 'Available AI Models',
    ghDisconnect: 'Disconnect', ghDisconnected: 'GitHub disconnected',
    ghConnectedAs: 'Connected as {name}', ghConnectionFailed: 'Connection failed: ',
    // Voice
    voiceNotSupported: 'Voice input not supported in this browser',
    voiceError: 'Voice error: ',
    // GitHub repo
    ghRepoStatus: 'Repository Status', ghRepoNoConfig: 'No GitHub repo configured',
    ghRepoCommits: 'Recent Commits', ghRepoBranches: 'Branches', ghRepoActions: 'Actions',
    ghRepoNone: 'No data',
    // Auto-Update
    updateAvailable: 'Update available',
    updateCurrent: 'Current version: v{version}',
    updateNew: 'New version: v{version}',
    updateInstall: 'Install Update',
    updateDismiss: 'Later',
    updateInstalling: 'Installing update...',
    updateSuccess: 'Updated to v{version}. Server restart required.',
    updateRestart: 'Restart Server',
    updateFailed: 'Update failed: {error}',
    updateNoRepo: 'No update repository configured',
    updateUpToDate: 'ARQITEKT Hub is up to date (v{version})',
    updateChecking: 'Checking for updates...',
    cmdSearch: 'Search or run action...',
    noResults: 'No results',
    noActivity: 'No activity yet',
    trackerTitle: 'Progress',
    noConversations: 'No saved conversations',
  }
};
function t(key) { return (i18n[currentLang] || i18n.de)[key] || key; }

function localizeUI() {
  // Patch static HTML modals & overlays with i18n translations
  const map = {
    // Create modal
    'createModalTitle': 'modalCreateTitle',
    // Import modal
    'importModalTitle': 'modalImportTitle',
    // Branding modal
    'brandingModalTitle': 'modalBrandingTitle',
    // Edit modal
    'editModalTitle': 'editProject',
    // Delete confirm
    'confirmTitle': 'deleteConfirmTitle',
    // Add Solution modal
    'addSolModalTitle': 'addSolTitle',
    'addSolModalSub': 'addSolSub',
    // Add US modal  
    'addUSTitle': 'addUSModalTitle',
    'addUSSub': 'addUSSub',
    // Feedback modal
    'fbkModalTitle': 'fbkModalTitle',
    // Chat panel
    'chatTitle': 'chatDiscussion',
    // Overlays
    'detailOverlayTitle': 'detailTitle',
    'validationOverlayTitle': 'validationTitle',
    'trackerTitle': 'progressTitle',
  };
  for (const [elId, key] of Object.entries(map)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = t(key);
  }
  // Patch button labels
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  // Patch select options in feedback modal
  var srcSel = document.getElementById('fbkSourceSelect');
  if (srcSel) {
    var srcKeys = ['feedbackSourceManual','feedbackSourceGPlay','feedbackSourceAppStore','feedbackSourceInApp','feedbackSourceEmail'];
    srcSel.querySelectorAll('option').forEach(function(opt, i) { if (srcKeys[i]) opt.textContent = t(srcKeys[i]); });
  }
  var sevSel = document.getElementById('fbkSeveritySelect');
  if (sevSel) {
    var sevKeys = ['feedbackSevWish','feedbackSevImprovement','feedbackSevBug','feedbackSevCritical'];
    sevSel.querySelectorAll('option').forEach(function(opt, i) { if (sevKeys[i]) opt.textContent = t(sevKeys[i]); });
  }
  // Patch wizard audience/platform chips
  var audChips = document.querySelectorAll('#wizAudienceChips .wiz-chip');
  var audKeys = ['wizAudienceConsumer','wizAudienceBusiness','wizAudienceBoth'];
  audChips.forEach(function(c,i) { if (audKeys[i]) c.textContent = t(audKeys[i]); });
  var platChips = document.querySelectorAll('#wizPlatformChips .wiz-chip');
  var platKeys = ['wizPlatformWeb','wizPlatformAndroid','wizPlatformIOS','wizPlatformAll'];
  platChips.forEach(function(c,i) { if (platKeys[i]) c.textContent = t(platKeys[i]); });
  // Search placeholder
  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  // Chat input placeholder
  var chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = t('chatPlaceholder');
  // Terminal input placeholder
  var termInput = document.getElementById('terminalInput');
  if (termInput) termInput.placeholder = t('termPlaceholder');
  // File explorer refresh tooltip
  var feRefresh = document.getElementById('feRefreshBtn');
  if (feRefresh) feRefresh.title = t('feRefresh');
}

function toggleLang() {
  currentLang = currentLang === 'de' ? 'en' : 'de';
  localStorage.setItem('arq-lang', currentLang);
  document.getElementById('langToggle').textContent = currentLang.toUpperCase();
  localizeUI();
  // Refresh current view
  if (currentProject) openProject(currentProject.id);
  else showHub();
}

// ===== INIT =====
async function init() {
  document.getElementById('langToggle').textContent = currentLang.toUpperCase();
  localizeUI();
  const hash = location.hash.slice(1);
  if (hash && /^\\d{3}_/.test(hash)) {
    await openProject(hash);
  } else {
    showHub();
  }
  // Check LLM config
  try {
    const cfg = await (await fetch('/api/chat/config')).json();
    chatLLMConfigured = cfg.configured;
  } catch { chatLLMConfigured = false; }
  // Check GitHub connection
  await checkGitHubStatus();
  // Check for Hub updates
  checkForHubUpdate();
  updateChatFabDot();
}

// ===== HUB VIEW =====
async function showHub() {
  currentProject = null;
  location.hash = '';
  document.getElementById('hubView').style.display = '';
  document.getElementById('projectView').classList.remove('active');
  document.getElementById('breadcrumb').innerHTML = '';
  document.getElementById('hdrActions').innerHTML = '';
  document.getElementById('hdrCenter').style.display = 'none';
  document.getElementById('hubHeroSub').textContent = t('hubSubFull');
  closeChat();
  await loadProjects();
}

let activeTagFilters = [];
try { activeTagFilters = JSON.parse(localStorage.getItem('arq-tag-filters') || '[]'); } catch(e) { activeTagFilters = []; }

async function loadProjects() {
  const grid = document.getElementById('projectGrid');
  grid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';

  const projects = await (await fetch('/api/projects')).json();
  window.__projectsCache = projects;

  // Update header project count
  document.getElementById('hdrTitle').innerHTML = t('projects') + ' <span class=\"hdr-count\">' + projects.length + '</span>';

  if (!projects.length) {
    grid.innerHTML = '<div class="empty-state"><div class="es-icon">+</div><div class="es-text">' + t('noEmpty') + '</div><button class="btn pri" onclick="openCreateModal()">+ ' + t('newProject') + '</button></div>';
    grid.innerHTML += newProjectCardHTML();
    return;
  }

  // Build filter button + chips in header actions
  const allTags = [...new Set(projects.flatMap(p => p.tags || []))].sort();
  // Render filter button + active chips into header
  let filterHtml = '';
  if (allTags.length > 0) {
    filterHtml += '<div style="display:flex;align-items:center;gap:8px;position:relative" id="filterWrap">';
    filterHtml += '<button class="btn sm" onclick="toggleFilterPopover(event)" style="gap:4px"><svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M.75 3h14.5a.75.75 0 010 1.5H.75a.75.75 0 010-1.5zm2 4h10.5a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5zm3 4h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 010-1.5z"/></svg>' + t('filterBtn');
    if (activeTagFilters.length) filterHtml += ' <span style="font-size:9px;background:var(--gold);color:var(--bg);border-radius:8px;padding:0 5px;font-weight:800">' + activeTagFilters.length + '</span>';
    filterHtml += '</button>';
    // Active filter chips
    if (activeTagFilters.length > 0) {
      filterHtml += '<div class="filter-chips">';
      const showChips = activeTagFilters.slice(0, 3);
      for (const tag of showChips) filterHtml += '<span class="filter-chip" onclick="removeTagFilter(\'' + esc(tag) + '\')">' + esc(tag) + ' <span class="fc-x">\u2715</span></span>';
      if (activeTagFilters.length > 3) filterHtml += '<span class="filter-chip" onclick="clearAllTagFilters()">+' + (activeTagFilters.length - 3) + '</span>';
      filterHtml += '</div>';
    }
    filterHtml += '</div>';
  }
  const hdrAct = document.getElementById('hdrActions');
  const existingFilter = document.getElementById('filterWrap');
  if (existingFilter) existingFilter.remove();
  hdrAct.insertAdjacentHTML('afterbegin', filterHtml);

  let h = '';
  for (const p of projects) {
    // Tag filter
    if (activeTagFilters.length && !activeTagFilters.some(ft => (p.tags || []).includes(ft))) continue;

    const s = p.stats || {};
    const r = p.readiness || { approvedPct: 0, total: 0, approved: 0 };
    const a = p.authored || { authoredPct: 0 };
    const lc = p.lifecycle || 'planning';
    const pct = r.approvedPct || 0;
    const authPct = a.authoredPct || 0;
    const isReady = pct >= (r.threshold || 100) && r.total > 0;
    const pid = esc(p.id);
    const cardId = 'card-' + pid;
    const isExpanded = pcExpandState[pid];

    h += '<div class="project-card' + (isExpanded ? ' expanded' : '') + (isReady ? ' ready-glow' : '') + '" id="' + cardId + '">';

    // ── ALWAYS VISIBLE: Edit icon (pencil, top-right) ──
    h += '<button class="pc-edit-icon" onclick="event.stopPropagation();openEditModal(\'' + pid + '\',\'' + esc(p.name) + '\',\'' + esc(p.description || '') + '\')" data-tip="' + t('edit') + '"><svg viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L3.462 11.098a.25.25 0 00-.064.108l-.631 2.2 2.2-.631a.25.25 0 00.108-.064l8.61-8.61a.25.25 0 000-.354L12.427 2.487z"/></svg></button>';

    // ── ALWAYS VISIBLE: Header ──
    h += '<div class="pc-header"><span class="pc-num">' + esc(p.id.slice(0,3)) + '</span><span class="pc-sep">\u2014</span><span class="pc-name">' + esc(p.name) + '</span>';
    h += '<span class="pc-badge ' + lc + '">' + lifecycleLabel(lc) + '</span>';
    h += '</div>';

    // ── ALWAYS VISIBLE: Tags ──
    const uniqueTags = [...new Set(p.tags || [])];
    h += '<div class="pc-tags">';
    const maxVisibleTags = 4;
    for (let ti = 0; ti < Math.min(uniqueTags.length, maxVisibleTags); ti++) h += '<span class="pc-tag ' + esc(uniqueTags[ti]) + '">' + esc(uniqueTags[ti]) + '</span>';
    if (uniqueTags.length > maxVisibleTags) h += '<span class="pc-tags-more">+' + (uniqueTags.length - maxVisibleTags) + '</span>';
    if (!uniqueTags.length) h += '<span class="pc-tag" style="opacity:0">-</span>';
    h += '</div>';

    // ── ALWAYS VISIBLE: Description (3 lines, uniform height) ──
    h += '<div class="pc-desc' + (p.description ? '' : ' placeholder') + '">' + esc(p.description || t('noDescription')) + '</div>';

    // ── ALWAYS VISIBLE: Compact progress bars ──
    h += '<div class="pc-bars">';
    h += '<div class="pc-bar-row"><span class="pc-bar-label authored">' + t('authored') + '</span><div class="pc-readiness-bar"><div class="pc-readiness-fill authored" style="width:' + authPct + '%"></div></div><span class="pc-readiness-pct' + (authPct >= 80 ? ' authored-hi' : '') + '">' + authPct + '%</span></div>';
    h += '<div class="pc-bar-row"><span class="pc-bar-label approved">' + t('approved') + '</span><div class="pc-readiness-bar"><div class="pc-readiness-fill approved" style="width:' + pct + '%"></div></div><span class="pc-readiness-pct' + (isReady ? ' ready' : '') + '">' + pct + '%</span></div>';
    // Dev progress bar (only when requirements are ready)
    if (isReady) {
      const devMap = { planning: 0, ready: 20, building: 40, built: 60, running: 80, deployed: 100 };
      const devPct = devMap[lc] || 0;
      h += '<div class="pc-dev-bar-row"><span class="pc-dev-bar-label">' + t('devProgress') + '</span><div class="pc-dev-bar"><div class="pc-dev-fill" style="width:' + devPct + '%"></div></div><span class="pc-dev-pct">' + devPct + '%</span></div>';
    }
    h += '</div>';

    // ── ALWAYS VISIBLE: Next-step indicator (granular) ──
    const reviewStatus = p.reviewStatus || 'none';
    let nextStep = '';
    if (!s['business-case']) nextStep = t('nsCreateBC');
    else if (!s.solutions) nextStep = t('nsDeriveSol');
    else if (!(s['user-stories'])) nextStep = t('nsCreateUS');
    else if (!(s.components)) nextStep = t('nsDefineCmp');
    else if (!(s.functions)) nextStep = t('nsSpecifyFn');
    else if (!isReady && reviewStatus === 'remediation') nextStep = t('nsRemediation');
    else if (!isReady && reviewStatus === 'reviewed') nextStep = t('nsFixFindings');
    else if (!isReady) nextStep = t('nsReview');
    else if (lc === 'planning') nextStep = t('nsStartDev');
    else if (lc === 'ready') nextStep = t('nsScaffold');
    else if (lc === 'built') nextStep = t('nsStartApp');
    else if (lc === 'running') nextStep = t('nsDeploy');
    if (nextStep) {
      h += '<div style="font-size:12px;color:var(--fg2);margin:4px 0 2px;display:flex;align-items:center;gap:5px"><span style="color:var(--gold)">&#8594;</span> ' + nextStep + '</div>';
    }

    // ── ALWAYS VISIBLE: Quick action row (hidden when expanded via CSS) ──
    h += '<div class="pc-quick-actions" style="display:flex;gap:6px;margin:8px 0 0">';
    h += '<button class="btn sm" onclick="openProject(\'' + pid + '\')">Dashboard</button>';
    h += '</div>';
    const ghUrl = p.github && p.github.url ? p.github.url : (p.github && p.github.repo ? 'https://github.com/' + p.github.repo : '');

    // ── EXPAND TOGGLE ──
    h += '<div class="pc-expand-toggle" onclick="togglePcCard(\'' + pid + '\')">';
    h += '<span class="chevron">&#9660;</span> <span>' + (isExpanded ? t('collapseCard') : t('expandCard')) + '</span>';
    h += '</div>';

    // ╔══════════════════════════════════════╗
    // ║  COLLAPSIBLE SECTION                 ║
    // ╚══════════════════════════════════════╝
    h += '<div class="pc-collapsible">';

    // Onboarding hint when project is empty
    if (authPct === 0 && pct === 0) {
      h += '<div class="pc-onboard">' + t('onboardHint') + '</div>';
    }

    // Stats (always show all including cross-cutting)
    h += '<div class="pc-stats">';
    h += statCell('bc', s['business-case']||0, t('statBC'));
    h += statCell('sol', s.solutions||0, t('statSOL'));
    h += statCell('us', s['user-stories']||0, t('statUS'));
    h += statCell('cmp', s.components||0, t('statCMP'));
    h += statCell('fn', s.functions||0, t('statFN'));
    h += '</div>';
    h += '<div class="pc-stats" style="margin-top:4px">';
    h += statCell('inf', s.infrastructure||0, t('statINF'));
    h += statCell('adr', s.adrs||0, t('statADR'));
    h += statCell('ntf', s.notifications||0, t('statNTF'));
    h += statCell('fbk', s.feedback||0, t('feedbackSection'));
    h += '</div>';

    // Tabs
    h += '<div class="pc-tabs">';
    h += '<button class="pc-tab active" onclick="switchHubTab(\'' + cardId + '\',\'plan\',this)">' + t('planSection') + '</button>';
    h += '<button class="pc-tab" onclick="switchHubTab(\'' + cardId + '\',\'dev\',this)">' + t('devSection') + '</button>';
    h += '<button class="pc-tab" onclick="switchHubTab(\'' + cardId + '\',\'ops\',this)">' + t('opsSection') + '</button>';
    const fbkOpen = (s.feedback||0);
    h += '<button class="pc-tab" onclick="switchHubTab(\'' + cardId + '\',\'fbk\',this)">' + t('feedbackSection') + (fbkOpen > 0 ? ' <span class=\'fbk-badge\'>' + fbkOpen + '</span>' : '') + '</button>';
    h += '</div>';

    // === TAB: Planung ===
    h += '<div class="pc-tab-content active" data-tab="plan">';
    h += '<div class="pc-actions">';
    h += '<button class="btn sm" onclick="openProject(\'' + pid + '\')">Dashboard</button>';
    h += '<button class="btn sm accent" onclick="doOpenVSCode(\'' + pid + '\')">VS Code</button>';
    h += '<button class="pc-delete-icon" onclick="promptDelete(\'' + pid + '\',\'' + esc(p.codename) + '\',\'' + esc(p.name) + '\',' + (r.total||0) + ',' + (ghUrl ? 'true' : 'false') + ')" data-tip="Delete"><svg viewBox="0 0 16 16"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19a1.75 1.75 0 001.741-1.575l.66-6.6a.75.75 0 10-1.492-.15l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/></svg></button>';
    h += '</div>';
    h += '</div>';

    // === TAB: Entwicklung ===
    h += '<div class="pc-tab-content" data-tab="dev">';
    h += '<div class="dev-info"><span class="di-label">Status:</span><span class="di-val">' + lifecycleLabel(lc) + '</span></div>';
    h += '<div class="dev-info"><span class="di-label">App:</span><span class="di-val">' + (p.hasApp ? t('appExists') : t('appNotGen')) + '</span></div>';
    if (ghUrl) {
      h += '<div class="dev-info"><span class="di-label">GitHub:</span><span class="di-val"><a href="' + esc(ghUrl) + '" target="_blank" style="color:var(--gold)">' + esc(p.github.repo || ghUrl) + '</a></span>';
      h += ' <button class="btn sm" style="margin-left:8px;font-size:10px" onclick="doGitHubExport(\'' + pid + '\')">' + t('exportIssues') + '</button></div>';
    }
    if (p.branding) {
      h += '<div class="dev-info"><span class="di-label">Branding:</span>';
      h += '<span class="color-swatch" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + esc(p.branding.primary || '#FFD700') + ';vertical-align:middle;margin:0 4px"></span>';
      h += '<span class="color-swatch" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + esc(p.branding.secondary || '#1F1F1F') + ';vertical-align:middle;margin:0 4px"></span>';
      h += '<span class="di-val">' + esc(p.branding.font_heading || 'Inter') + ' / ' + esc(p.branding.mode || 'dark') + '</span>';
      h += '</div>';
    }
    h += '<div class="pc-factory">';
    // Force scaffold: always available (greyed out disabled when building)
    if (lc === 'building') {
      h += '<span class="pc-badge building" style="margin:auto">' + t('building') + '</span>';
    } else if ((isReady && lc === 'planning') || lc === 'ready') {
      h += '<button class="btn sm gold" onclick="doScaffold(\'' + pid + '\')">' + t('scaffold') + '</button>';
    } else if (lc === 'planning' && !isReady) {
      h += '<button class="btn sm gold" style="opacity:.4" onclick="doForceScaffold(\'' + pid + '\')">' + t('scaffold') + ' (Force)</button>';
    }
    h += '<button class="btn sm" onclick="openBrandingModal(\'' + pid + '\')">' + t('branding') + '</button>';
    h += '</div>';
    // Test section (visible if app exists)
    if (p.hasApp) {
      h += '<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px">';
      h += '<div class="dev-info"><span class="di-label">Testing:</span><span class="di-val">Playwright E2E</span></div>';
      h += '<div class="pc-factory">';
      h += '<button class="btn sm" onclick="doRunTests(\'' + pid + '\')">' + t('runTests') + '</button>';
      h += '<button class="btn sm" onclick="doSetupPlaywright(\'' + pid + '\')">' + t('setupPlaywright') + '</button>';
      h += '</div>';
      h += '</div>';
    }
    h += '</div>';

    // === TAB: Betrieb ===
    h += '<div class="pc-tab-content" data-tab="ops">';
    if (!p.hasApp) {
      h += '<div class="dev-info" style="text-align:center;padding:16px 0;color:var(--fg3)">' + t('noApp') + '</div>';
    } else {
      h += '<div class="dev-info"><span class="di-label">Lifecycle:</span><span class="di-val">' + lifecycleLabel(lc) + '</span></div>';
      if (p.appRunning) {
        h += '<div class="dev-info"><span class="di-label">Port:</span><span class="di-val">' + (p.appPort||'?') + '</span></div>';
      }
      h += '<div class="pc-factory">';
      if (lc === 'built' && !p.appRunning) {
        h += '<button class="btn sm pri" onclick="doAppStart(\'' + pid + '\')">' + t('appStart') + '</button>';
        h += '<button class="btn sm gold" onclick="doAppBuildDeploy(\'' + pid + '\')">' + t('appProd') + '</button>';
      }
      if (p.appRunning) {
        h += '<button class="btn sm danger" onclick="doAppStop(\'' + pid + '\')">' + t('appStop') + '</button>';
        h += '<button class="btn sm accent" onclick="window.open(\'http://localhost:' + (p.appPort||3334) + '\',\'_blank\')">' + t('openBrowser') + '</button>';
      }
      if (lc === 'deployed') {
        h += '<button class="btn sm danger" onclick="doAppStop(\'' + pid + '\')">' + t('appStop') + '</button>';
        h += '<button class="btn sm accent" onclick="window.open(\'http://localhost:' + (p.appPort||4000) + '\',\'_blank\')">' + t('openBrowser') + '</button>';
      }
      h += '</div>';
      // Store / Deploy section
      h += '<div class="store-section">';
      h += '<div class="dev-info"><span class="di-label">'+t('storeDeploy')+':</span></div>';
      h += '<div class="store-badges">';
      const storeStatus = p.store?.status || 'none';
      const isCapacitor = p.appType === 'capacitor';
      if (isCapacitor) {
        h += '<button class="store-badge-btn' + (storeStatus === 'configured' || storeStatus === 'built' || storeStatus === 'live' ? ' configured' : '') + '" onclick="doStoreConfigure(\'' + pid + '\',\'android\')" title="' + t('storeConfig') + '">';
        h += '<span class="store-icon">&#9654;</span> Google Play</button>';
        h += '<button class="store-badge-btn" onclick="doStoreConfigure(\'' + pid + '\',\'ios\')" title="' + t('storeConfig') + ' (iOS via CI/CD)">';
        h += '<span class="store-icon">&#63743;</span> App Store</button>';
      }
      h += '</div>';
      h += '<div class="pc-factory" style="margin-top:8px">';
      if (storeStatus !== 'none') {
        h += '<button class="btn sm" onclick="doStoreBuild(\'' + pid + '\')">' + t('storeBuild') + '</button>';
        h += '<button class="btn sm pri" onclick="doStoreUpload(\'' + pid + '\')">' + t('storeUploadBtn') + '</button>';
      }
      h += '<button class="btn sm" onclick="doStoreGHActions(\'' + pid + '\')">' + t('storeGHActions') + '</button>';
      h += '</div>';
      h += '</div>';
    }
    h += '</div>';

    // === TAB: Feedback ===
    h += '<div class="pc-tab-content" data-tab="fbk">';
    h += '<div class="fbk-list" id="fbk-' + cardId + '">';
    h += '<div class="dev-info" style="text-align:center;padding:12px 0;color:var(--fg3)">' + t('feedbackEmpty') + '</div>';
    h += '</div>';
    h += '<div class="pc-factory" style="margin-top:8px">';
    h += '<button class="btn sm gold" onclick="openFeedbackModal(\'' + pid + '\')">' + t('feedbackAdd') + '</button>';
    h += '</div>';
    h += '</div>';

    h += '</div>'; // close pc-collapsible
    h += '</div>'; // card end
  }
  h += newProjectCardHTML();
  grid.innerHTML = h;

  // Projects section title
  const pTitle = document.getElementById('hubProjectsTitle');
  if (pTitle) {
    pTitle.textContent = t('projects') + ' (' + projects.length + ')';
    if (activeTagFilters.length) {
      pTitle.textContent += ' — ' + activeTagFilters.join(', ');
    }
  }

  // Activity feed
  buildActivityFeed(projects);
}

function setTagFilter(tag) {
  const idx = activeTagFilters.indexOf(tag);
  if (idx >= 0) activeTagFilters.splice(idx, 1); else activeTagFilters.push(tag);
  localStorage.setItem('arq-tag-filters', JSON.stringify(activeTagFilters));
  loadProjects();
}
function removeTagFilter(tag) {
  activeTagFilters = activeTagFilters.filter(t => t !== tag);
  localStorage.setItem('arq-tag-filters', JSON.stringify(activeTagFilters));
  loadProjects();
}
function clearAllTagFilters() {
  activeTagFilters = [];
  localStorage.setItem('arq-tag-filters', '[]');
  loadProjects();
}
function toggleFilterPopover(ev) {
  ev.stopPropagation();
  let pop = document.getElementById('filterPopover');
  if (pop) { pop.remove(); return; }
  const wrap = document.getElementById('filterWrap');
  if (!wrap) return;
  const allTags = [...new Set((__projectsCache || []).flatMap(p => p.tags || []))].sort();
  let ph = '<div class="filter-popover" id="filterPopover">';
  ph += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-weight:600;font-size:12px">' + t('filterBtn') + '</span>';
  if (activeTagFilters.length) ph += '<button class="btn sm" style="font-size:10px;padding:2px 6px" onclick="clearAllTagFilters()">' + t('clearAll') + '</button>';
  ph += '</div>';
  for (const tag of allTags) {
    const checked = activeTagFilters.includes(tag);
    ph += '<label class="filter-popover-item' + (checked ? ' active' : '') + '" onclick="event.stopPropagation();setTagFilter(\'' + esc(tag) + '\')"><span style="width:14px;height:14px;border-radius:3px;border:1.5px solid var(--border);display:inline-flex;align-items:center;justify-content:center;background:' + (checked ? 'var(--gold)' : 'transparent') + '">' + (checked ? '<svg width="10" height="10" viewBox="0 0 16 16" fill="var(--bg)"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>' : '') + '</span>' + esc(tag) + '</label>';
  }
  ph += '</div>';
  wrap.insertAdjacentHTML('beforeend', ph);
  const closePop = (e) => { const fp = document.getElementById('filterPopover'); if (fp && !fp.contains(e.target) && !wrap.contains(e.target)) { fp.remove(); document.removeEventListener('click', closePop); } };
  setTimeout(() => document.addEventListener('click', closePop), 0);
}

function switchHubTab(cardId, tabName, btn) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.querySelectorAll('.pc-tab').forEach(t => t.classList.remove('active'));
  card.querySelectorAll('.pc-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const target = card.querySelector('[data-tab="' + tabName + '"]');
  if (target) target.classList.add('active');
  // Lazy-load feedback when tab is opened
  if (tabName === 'fbk') {
    const pid = cardId.replace('pc-', '');
    loadFeedbackList(pid);
  }
}

function lifecycleLabel(state) {
  const icons = { planning: '\u25CB', ready: '\u25C9', building: '\u25D4', built: '\u25CF', running: '\u25B6', deployed: '\u2605' };
  const icon = icons[state] || '';
  return (icon ? icon + ' ' : '') + (t(state) || state);
}

function statCell(cls, val, label) {
  const dimClass = (val === 0 || val === '0') ? ' zero' : '';
  return '<div class="pc-stat '+cls+dimClass+'"><div class="v">'+val+'</div><div class="l">'+label+'</div></div>';
}

function newProjectCardHTML() {
  return '<div class="new-project-card" onclick="openCreateModal()"><div class="npc-icon">+</div><div class="npc-text">'+t('newProject')+'</div></div>'
    + '<div class="new-project-card" onclick="openImportModal()" style="border-style:dashed"><div class="npc-icon" style="font-size:18px">&#8615;</div><div class="npc-text">'+t('import')+'</div></div>';
}

// ===== PROJECT VIEW =====
async function openProject(projectId) {
  closeChat();
  document.getElementById('hubView').style.display = 'none';
  document.getElementById('projectView').classList.add('active');
  location.hash = projectId;

  // Reset tab state
  activeTab = 'plan';
  fileExplorerLoaded = false;
  openFiles = [];
  activeFileIdx = -1;
  switchTab('plan');

  // Update header for project view
  const projName = projectId.replace(/^\d{3}_/, '').replace(/_/g, ' ');
  document.getElementById('hdrCenter').style.display = 'none';
  document.getElementById('breadcrumb').innerHTML = '<span class="sep">/</span><span class="proj-name">' + esc(projName) + '</span>';

  document.getElementById('hdrActions').innerHTML =
    '<button class="btn sm" onclick="doRefresh()">\u21BB ' + t('refresh') + '</button>' +
    '<button class="btn sm" onclick="doValidate()">\u2713 ' + t('validate') + '</button>' +
    '<button class="btn sm accent" onclick="doOpenVSCode(\'' + esc(projectId) + '\')">' + t('vsCode') + '</button>' +
    '<button class="btn sm" onclick="showHub()">' + t('backToProjects') + '</button>';

  currentProject = { id: projectId };

  document.getElementById('tree').innerHTML = '<div style="padding:16px"><span class="spinner"></span></div>';
  document.getElementById('flow').innerHTML = '<div style="padding:40px;text-align:center"><span class="spinner"></span></div>';
  document.getElementById('searchInput').value = '';

  const base = '/api/projects/' + encodeURIComponent(projectId);
  const [stats, tree, solStatus, ccItems] = await Promise.all([
    fetch(base + '/stats').then(r=>r.json()),
    fetch(base + '/tree').then(r=>r.json()),
    fetch(base + '/sol-status').then(r=>r.json()),
    fetch(base + '/cross-cutting').then(r=>r.json()),
  ]);

  document.getElementById('sBC').textContent = stats['business-case'] || 0;
  document.getElementById('sSOL').textContent = stats.solutions || 0;
  document.getElementById('sUS').textContent = stats['user-stories'] || 0;
  document.getElementById('sCMP').textContent = stats.components || 0;
  document.getElementById('sFN').textContent = stats.functions || 0;
  document.getElementById('sINF').textContent = stats.infrastructure || 0;
  document.getElementById('sADR').textContent = stats.adrs || 0;
  document.getElementById('sNTF').textContent = stats.notifications || 0;

  // Add GitHub + Push buttons to header if configured
  const gh = stats.github;
  if (gh && (gh.url || gh.repo)) {
    const ghLink = gh.url || ('https://github.com/' + gh.repo);
    let ghBtns = '<button class="btn sm" onclick="window.open(\'' + ghLink.replace(/'/g, "\\'") + '\',\'_blank\')">GitHub</button>';
    ghBtns += '<button class="btn sm" onclick="doGitHubExport(\'' + projectId.replace(/'/g, "\\'") + '\')">' + t('exportIssues') + '</button>';
    if (gh.repo) {
      ghBtns += '<button class="btn sm gold" id="btnGhPush" onclick="doGitHubPush(\'' + projectId.replace(/'/g, "\\'") + '\')">' + t('storePush') + '</button>';
    }
    document.getElementById('hdrActions').insertAdjacentHTML('afterbegin', ghBtns);
  }

  treeData = tree;
  solData = solStatus.solutions || [];
  currentProject.hasBC = solStatus.hasBC;
  currentProject.bcTitle = solStatus.bcTitle;
  currentProject.lifecycle = stats.lifecycle || 'planning';
  currentProject.hasApp = !!stats.hasApp;

  renderTree(treeData);
  renderCrossCutting(ccItems);
  renderFlow();
  renderTracker();
  renderQuickActions(null);
}

// ===== TREE =====
function renderTree(data, filter='') {
  const c = document.getElementById('tree');
  c.innerHTML = '';
  const q = filter.toLowerCase();

  function match(n) {
    if (!q) return true;
    if ((n.id+' '+n.title).toLowerCase().includes(q)) return true;
    return n.children ? n.children.some(match) : false;
  }
  function countDesc(n) { return n.children ? n.children.reduce((a,ch) => a+1+countDesc(ch), 0) : 0; }

  function mk(n, depth) {
    if (q && !match(n)) return null;
    const el = document.createElement('div'); el.className='tn';
    const has = n.children && n.children.length > 0;
    const row = document.createElement('div'); row.className='tr';
    row.style.paddingLeft = (10+depth*14)+'px';

    const tog = document.createElement('span'); tog.className='tt';
    tog.textContent = has ? '▸' : ' ';

    const typeMap = {'business-case':'bc','solution':'sol','user-story':'us','component':'cmp','function':'fn'};
    const iconMap = {'business-case':'BC','solution':'S','user-story':'U','component':'C','function':'F'};
    const ico = document.createElement('span');
    ico.className = 'ti '+(typeMap[n.type]||'');
    ico.textContent = iconMap[n.type]||'?';

    const nid = document.createElement('span'); nid.className='tid'; nid.textContent=n.id;
    const lbl = document.createElement('span'); lbl.className='tl'; lbl.textContent=n.title;
    lbl.title = n.id+': '+n.title;
    const cnt = document.createElement('span'); cnt.className='tree-count';
    if (has) cnt.textContent = '('+countDesc(n)+')';
    const st = document.createElement('span'); st.className = 'ts clickable '+(n.status||''); st.textContent = n.status||'';
    if (n.file && n.status) {
      st.addEventListener('click', e => { e.stopPropagation(); showStatusPopover(st, n.file, n.status, n.id); });
    }

    row.append(tog, ico, nid, lbl, cnt, st);
    el.appendChild(row);

    let cc;
    if (has) {
      cc = document.createElement('div');
      cc.className = 'tc' + (depth >= 1 && !q ? ' hid' : '');
      for (const ch of n.children) { const e=mk(ch,depth+1); if(e) cc.appendChild(e); }
      el.appendChild(cc);
      tog.textContent = (!q && depth >= 1) ? '▸' : '▾';
    }

    tog.addEventListener('click', e => { e.stopPropagation(); if(!cc) return; const h=cc.classList.toggle('hid'); tog.textContent=h?'▸':'▾'; });
    row.addEventListener('click', () => {
      document.querySelectorAll('.tr.act').forEach(r=>r.classList.remove('act'));
      row.classList.add('act');
      openDetail(n.id, n.file);
      renderQuickActions(n);
    });
    return el;
  }

  for (const n of data) { const e=mk(n,0); if(e) c.appendChild(e); }
  if (!c.children.length) c.innerHTML='<div style="padding:16px;color:var(--fg3)">No matches</div>';
}

// ===== CROSS-CUTTING TREE =====
let ccData = [];
function renderCrossCutting(items) {
  ccData = items || [];
  const c = document.getElementById('crossCuttingTree');
  c.innerHTML = '';
  if (!ccData.length) return;

  const groups = { infrastructure: [], adr: [], notification: [] };
  const labels = { infrastructure: 'Infrastructure', adr: 'ADRs', notification: 'Notifications' };
  const prefixes = { infrastructure: 'INF', adr: 'ADR', notification: 'NTF' };
  for (const it of ccData) (groups[it.type] || []).push(it);

  for (const [type, items] of Object.entries(groups)) {
    if (!items.length) continue;
    const section = document.createElement('div');
    const cls = type === 'infrastructure' ? 'inf' : type === 'adr' ? 'adr' : 'ntf';
    const hdr = document.createElement('div');
    hdr.className = 'cc-section-hdr';
    hdr.innerHTML = '<span class="cc-tog">▾</span><span>' + esc(labels[type]) + ' (' + items.length + ')</span>';
    section.appendChild(hdr);

    const list = document.createElement('div');
    list.className = 'cc-section-items';
    for (const it of items) {
      const row = document.createElement('div');
      row.className = 'cc-item';
      row.innerHTML = '<span class="cc-ico ' + cls + '">' + esc(prefixes[type]) + '</span>'
        + '<span class="cc-id">' + esc(it.id) + '</span>'
        + '<span class="cc-ttl">' + esc(it.title) + '</span>'
        + '<span class="cc-st">' + esc(it.status) + '</span>';
      row.addEventListener('click', () => openDetail(it.id, it.file));
      list.appendChild(row);
    }
    section.appendChild(list);

    hdr.addEventListener('click', () => {
      const hidden = list.classList.toggle('hid');
      hdr.classList.toggle('collapsed', hidden);
      hdr.querySelector('.cc-tog').textContent = hidden ? '▸' : '▾';
    });
    c.appendChild(section);
  }
}

// Search
let sT;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(sT);
  sT = setTimeout(()=>renderTree(treeData, e.target.value.trim()), 200);
});

// ===== DETAIL OVERLAY =====
let detailFile = null;
let detailStatus = null;
async function openDetail(id, file) {
  detailFile = file;
  detailStatus = null;
  const ov = document.getElementById('detailOverlay');
  const bd = document.getElementById('overlayBackdrop');
  document.getElementById('detailOverlayTitle').textContent = id + ' ...';
  document.getElementById('doBody').innerHTML = '<div style="padding:20px"><span class="spinner"></span></div>';
  const statusEl = document.getElementById('doStatus');
  statusEl.style.display = 'none';
  ov.classList.add('open');
  bd.classList.add('open');

  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const d = await (await fetch(base + '/read?id=' + encodeURIComponent(id))).json();
  if (d.error) {
    document.getElementById('detailOverlayTitle').textContent = id;
    document.getElementById('doBody').innerHTML = '<p style="color:var(--red);padding:20px">' + t('notFound') + '</p>';
    return;
  }
  document.getElementById('detailOverlayTitle').textContent = id + (file ? ' \u2014 '+file : '');

  // Show status badge
  if (d.frontmatter && d.frontmatter.status) {
    detailStatus = d.frontmatter.status;
    statusEl.className = 'do-status ' + detailStatus;
    statusEl.textContent = detailStatus;
    statusEl.style.display = '';
    statusEl.onclick = (e) => { e.stopPropagation(); showStatusPopover(statusEl, file, detailStatus, id); };
  }

  document.getElementById('doBody').innerHTML = '<pre>'+esc(d.content)+'</pre>';
}
function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
  document.getElementById('overlayBackdrop').classList.remove('open');
}

// ===== VALIDATION =====
async function doValidate() {
  const ov = document.getElementById('valOverlay');
  ov.classList.add('open');
  document.getElementById('valBody').innerHTML = '<div style="padding:20px"><span class="spinner"></span> ' + t('runningValidation') + '</div>';
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const d = await (await fetch(base + '/validate')).json();
  document.getElementById('valBody').innerHTML = '<div class="val-output '+(d.success?'ok':'err')+'">'+esc(d.output)+'</div>';
}
function closeVal() { document.getElementById('valOverlay').classList.remove('open'); }

// ===== REFRESH =====
async function doRefresh() {
  if (!currentProject) return;
  await openProject(currentProject.id);
}

// ===== FLOW (Per-SOL Board) =====
function renderFlow() {
  prompts = [];
  const el = document.getElementById('flow');
  const hasBC = currentProject.hasBC;
  const sols = solData;

  // Aggregate stats
  const totalSols = sols.length;
  const completeSols = sols.filter(s => s.status === 'complete' || s.status === 'reviewed').length;
  const reviewedSols = sols.filter(s => s.status === 'reviewed').length;
  const wipSols = totalSols - completeSols;

  // Determine overall step (for progress dots)
  let overallStep = 1;
  if (hasBC) overallStep = 2;
  if (totalSols > 0) overallStep = 3;
  if (totalSols > 0 && sols.every(s => s.us > 0)) overallStep = 4;
  if (totalSols > 0 && sols.every(s => s.cmp > 0)) overallStep = 5;
  if (totalSols > 0 && sols.every(s => s.fn > 0)) overallStep = 6;

  const STEPS = [
    { n:1, lbl:'1',  t:t('nsCreateBC'),  done: hasBC },
    { n:2, lbl:'2', t:t('nsDeriveSol'),       done: totalSols > 0 },
    { n:3, lbl:'3',  t:t('nsCreateUS'),    done: totalSols > 0 && sols.every(s => s.us > 0), partial: totalSols > 0 ? sols.filter(s=>s.us>0).length+'/'+totalSols : null },
    { n:4, lbl:'4', t:t('nsDefineCmp'),     done: totalSols > 0 && sols.every(s => s.cmp > 0), partial: totalSols > 0 ? sols.filter(s=>s.cmp>0).length+'/'+totalSols : null },
    { n:5, lbl:'5',  t:t('nsSpecifyFn'),       done: totalSols > 0 && sols.every(s => s.fn > 0), partial: totalSols > 0 ? sols.filter(s=>s.fn>0).length+'/'+totalSols : null },
    { n:6, lbl:'6', t:t('nsReview'),          done: reviewedSols === totalSols && totalSols > 0, partial: totalSols > 0 ? reviewedSols+'/'+totalSols : null }
  ];

  let h = '';

  // Onboarding tip
  if (!onboardDismissed) {
    h += '<div class="onboard" id="onboard">';
    h += '<div class="onboard-icon">&#9672;</div>';
    h += '<div class="onboard-text"><strong>' + t('howItWorks') + '</strong> ' + t('onboardHint') + ' ' + t('pressGold') + '</div>';
    h += '<button class="onboard-dismiss" onclick="dismissOnboard()">✕</button>';
    h += '</div>';
  }

  // ===== Progress bar =====
  h += '<div class="progress">';
  for (let i = 0; i < STEPS.length; i++) {
    const s = STEPS[i];
    const st = s.done ? 'done' : (s.n === overallStep ? 'active' : '');
    if (i > 0) h += '<div class="p-line' + (STEPS[i-1].done ? ' done' : '') + '">&nbsp;</div>';
    h += '<div class="p-dot ' + st + '">' + s.lbl;
    if (s.partial && !s.done && s.n <= overallStep) {
      h += '<span class="p-label">' + s.t + ' <span style="color:var(--yellow)">' + s.partial + '</span></span>';
    } else {
      h += '<span class="p-label">' + s.t + '</span>';
    }
    h += '</div>';
  }
  h += '</div>';

  // ===== Step 1: No BC =====
  if (!hasBC) {
    prompts.push('@discover I want to develop an app. Start a discovery interview with me.');
    h += '<div class="step-block">';
    h += '<div class="step-title">' + t('nsCreateBC') + ' <span class="badge">' + t('stepLabel') + ' 1/6</span><span class="help-icon" title="Hilfe">?<span class="help-bubble">' + t('helpBC') + '</span></span></div>';
    h += '<div class="step-sub">' + t('helpBC') + '</div>';
    h += '<div class="action-list">';
    h += actionRow(t('nsCreateBC'), prompts.length - 1);
    h += '</div></div>';
    el.innerHTML = h;
    return;
  }

  // ===== Step 2: No SOLs =====
  if (totalSols === 0) {
    prompts.push('@architect Read the Business Case (00_BUSINESS_CASE.md) and propose suitable Solutions (SOL).');
    h += '<div class="step-block">';
    h += '<div class="step-title">' + t('nsDeriveSol') + ' <span class="badge">' + t('stepLabel') + ' 2/6</span><span class="help-icon" title="Hilfe">?<span class="help-bubble">' + t('helpSOL') + '</span></span></div>';
    h += '<div class="step-sub">Business Case: ' + esc(currentProject.bcTitle || 'BC-1') + '</div>';
    h += '<div class="action-list">';
    h += actionRow(t('nsDeriveSol'), prompts.length - 1);
    h += '</div></div>';
    el.innerHTML = h;
    return;
  }

  // ===== Summary bar =====
  h += '<div class="sol-summary">';
  h += '<div class="sol-summary-item"><strong style="margin-right:6px">' + totalSols + '</strong> ' + t('nsDeriveSol') + '</div>';
  h += '<div class="sol-summary-item complete"><span class="val">' + completeSols + '</span> ' + t('done') + '</div>';
  h += '<div class="sol-summary-item wip"><span class="val">' + wipSols + '</span> ' + t('open') + '</div>';
  if (reviewedSols > 0) h += '<div class="sol-summary-item" style="color:var(--accent)"><span class="val" style="color:var(--accent)">' + reviewedSols + '</span> ' + t('reviewed') + '</div>';
  h += '<div style="margin-left:auto;display:flex;gap:6px">';
  h += '<button class="sol-filter-btn' + (solFilter==='all'?' active':'') + '" onclick="setSolFilter(\'all\')">' + t('filterAll') + '</button>';
  h += '<button class="sol-filter-btn' + (solFilter==='todo'?' active':'') + '" onclick="setSolFilter(\'todo\')">' + t('filterOpen') + '</button>';
  h += '<button class="sol-filter-btn' + (solFilter==='complete'?' active':'') + '" onclick="setSolFilter(\'complete\')">' + t('filterDone') + '</button>';
  h += '</div></div>';

  // ===== SOL Controls (Expand/Collapse All) =====
  if (sols.length > 1) {
    h += '<div class="sol-controls">';
    h += '<button class="btn sm" onclick="toggleAllSolCards(true)">' + t('expandAll') + '</button>';
    h += '<button class="btn sm" onclick="toggleAllSolCards(false)">' + t('collapseAll') + '</button>';
    h += '</div>';
  }

  // ===== SOL Board =====
  h += '<div class="sol-board">';
  for (const sol of sols) {
    // Filter
    if (solFilter === 'todo' && (sol.status === 'complete' || sol.status === 'reviewed')) continue;
    if (solFilter === 'complete' && sol.status !== 'complete' && sol.status !== 'reviewed') continue;

    const isReviewed = sol.status === 'reviewed';
    const solKey = currentProject.id + ':' + sol.id;
    const isExpanded = solExpandState[solKey];
    h += '<div class="sol-card' + (isReviewed ? ' reviewed' : '') + (isExpanded ? ' expanded' : '') + '" data-sol-key="' + esc(solKey) + '">';

    // Status badge class for inline badge
    const statusLabels = { 'needs-us':t('needsUS'), 'needs-cmp':t('needsCMP'), 'needs-fn':t('needsFN'), 'complete':t('solComplete'), 'reviewed':t('solReviewed') };
    const statusClass = sol.status;

    h += '<div class="sol-card-head" onclick="toggleSolCard(\'' + esc(solKey) + '\')">';
    h += '<span class="sol-chevron">\\u25B6</span>';
    h += '<span class="sol-card-id">' + esc(sol.id) + '</span>';
    h += '<span class="sol-card-title">' + esc(sol.title.replace(/^SOL-\\d+:\\s*/, '')) + '</span>';
    h += '<span class="sol-card-status-inline ' + statusClass + '" style="background:' + statusBg(statusClass) + ';color:' + statusColor(statusClass) + ';border-color:' + statusBorder(statusClass) + '">' + (statusLabels[sol.status] || sol.status) + '</span>';
    h += '</div>';

    // Collapsible body
    h += '<div class="sol-card-body">';

    // Progress dots with labels
    const dotLabels = [t('solDotSolution'),t('solDotScenarios'),t('solDotBlocks'),t('solDotFeatures'),t('solDotReview')];
    h += '<div class="sol-card-dots">';
    for (let i = 0; i < 5; i++) {
      h += '<div class="sol-dot' + (sol.dots[i] ? ' filled' : '') + '" title="' + dotLabels[i] + '"><span class="sol-dot-lbl">' + dotLabels[i] + '</span></div>';
    }
    const filledCount = sol.dots.filter(Boolean).length;
    const missingLabel = filledCount < 5 ? dotLabels[sol.dots.indexOf(false)] : '';
    h += '<span class="sol-dot-label">' + filledCount + '/5' + (missingLabel ? ' \\u2014 ' + missingLabel + ' ' + t('solDotPending') : '') + '</span>';
    h += '</div>';

    // Stats
    h += '<div class="sol-card-stats">';
    h += '<span>' + sol.us + ' US</span>';
    h += '<span>' + sol.cmp + ' CMP</span>';
    h += '<span>' + sol.fn + ' FN</span>';
    h += '</div>';

    // Status badge (full)
    h += '<div class="sol-card-status ' + sol.status + '">' + (statusLabels[sol.status] || sol.status) + '</div>';

    // Actions
    h += '<div class="sol-card-actions">';
    if (sol.nextAction) {
      const idx = prompts.length;
      prompts.push(sol.nextPrompt);
      h += '<button class="btn sm pri" data-idx="' + idx + '" onclick="copyPrompt(this)" title="Copy Prompt">' + esc(sol.nextAction) + '</button>';
    } else {
      h += '<button class="btn sm" disabled>' + t('done') + '</button>';
    }
    {
      const solNum = sol.id.replace('SOL-','');
      h += '<button class="btn sm" onclick="openAddUSModal(\''+esc(solNum)+'\',\''+esc(sol.title.replace(/'/g,''))+'\')\" title="' + t('addUS') + '">' + t('addUS') + '</button>';
    }
    h += '<button class="btn sm" onclick="openSolChat(\'' + esc(sol.id) + '\',\'' + esc(sol.title.replace(/'/g,'')) + '\')" title="' + t('chatBtn') + '">' + t('chatBtn') + '</button>';
    h += '</div>';

    h += '</div>'; // close sol-card-body
    h += '</div>'; // close sol-card
  }

  // Add SOL card (always visible)
  h += '<div class="sol-add-card" onclick="openAddSolModal()">';
  h += '<div class="plus-icon">+</div>';
  h += '<div class="plus-label">' + t('moreIdeas') + '</div>';
  h += '</div>';
  h += '</div>'; // close sol-board

  // ===== Batch actions for incomplete SOLs =====
  const incompleteSols = sols.filter(s => s.status !== 'complete' && s.status !== 'reviewed');
  if (incompleteSols.length > 0 && incompleteSols.length <= sols.length) {
    h += '<div style="margin-top:8px">';

    // Group by needed step
    const needsUS = sols.filter(s => s.status === 'needs-us');
    const needsCMP = sols.filter(s => s.status === 'needs-cmp');
    const needsFN = sols.filter(s => s.status === 'needs-fn');
    const canReview = sols.filter(s => s.status === 'complete');

    if (needsUS.length > 0) {
      const batchPrompt = needsUS.map(s => '@architect Generate all User Stories for ' + s.id).join('\\n');
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchNeedUS').replace('{n}', needsUS.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('batchCopilot') + '</button></div>';
    }
    if (needsCMP.length > 0) {
      const batchPrompt = needsCMP.map(s => '@architect Derive Components from User Stories of ' + s.id).join('\\n');
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchNeedCMP').replace('{n}', needsCMP.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('batchCopilot') + '</button></div>';
    }
    if (needsFN.length > 0) {
      const batchPrompt = needsFN.map(s => '@architect Generate all Functions for Components of ' + s.id).join('\\n');
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchNeedFN').replace('{n}', needsFN.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('batchCopilot') + '</button></div>';
    }
    if (canReview.length > 0) {
      const batchPrompt = '@review Review all requirements for consistency and completeness';
      const idx = prompts.length;
      prompts.push(batchPrompt);
      h += '<div class="action-row"><div class="action-label">' + t('batchReadyReview').replace('{n}', canReview.length) + '</div>';
      h += '<button class="action-btn" data-idx="' + idx + '" onclick="copyPrompt(this)">' + t('reviewCopilot') + '</button></div>';
    }
    h += '</div>';
  }

  // Full review block (when all complete)
  if (completeSols === totalSols && totalSols > 0 && reviewedSols < totalSols) {
    h += '<div class="step-block" style="margin-top:16px">';
    h += '<div class="step-title">' + t('nsReview') + ' <span class="badge">' + t('stepLabel') + ' 6/6</span><span class="help-icon" title="Hilfe">?<span class="help-bubble">' + t('helpREV') + '</span></span></div>';
    h += '<div class="step-sub">' + t('helpREV') + '</div>';
    h += '<div class="action-list">';
    const idx1 = prompts.length;
    prompts.push('@review Review all requirements for consistency and completeness');
    h += actionRow(t('nsReview'), idx1);
    const idx2 = prompts.length;
    prompts.push('@export Create the Requirement-Tree');
    h += actionRow(t('exportTree'), idx2);
    h += '</div></div>';
  }

  // Review Complete — all SOLs reviewed, show lifecycle transition
  if (reviewedSols === totalSols && totalSols > 0) {
    h += '<div class="step-block review-complete" style="margin-top:16px;border:1px solid var(--green);background:rgba(63,185,80,.06)">';
    h += '<div class="step-title" style="color:var(--green)">' + t('reviewComplete') + '</div>';
    h += '<div class="step-sub" style="margin-bottom:12px">' + t('celebrateReady') + '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    h += '<button class="btn sm pri" onclick="startDevelopment()" style="background:var(--green);border-color:var(--green)">' + t('startDev') + '</button>';
    h += '<button class="btn sm" onclick="addMoreIdeas()">' + t('moreIdeas') + '</button>';
    h += '</div>';
    h += '</div>';
  }

  // Lifecycle-aware sections below planning flow
  const lc = currentProject.lifecycle || 'planning';
  if (lc === 'ready' || lc === 'building' || lc === 'built' || lc === 'running' || lc === 'deployed') {
    h += '<div class="step-block" style="margin-top:16px;border:1px solid var(--gold)">';
    h += '<div class="step-title" style="color:var(--gold)">' + t('devHeading') + ' — ' + lifecycleLabel(lc) + '</div>';
    if (lc === 'ready') {
      h += '<div class="step-sub">' + t('devReady') + '</div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      const idxS = prompts.length;
      prompts.push('@scaffold Scaffold the application from the approved requirements.');
      h += '<button class="btn sm gold" data-idx="' + idxS + '" onclick="copyPrompt(this)">' + t('scaffoldCopilot') + '</button>';
      h += '<button class="btn sm" onclick="doScaffold(\'' + currentProject.id + '\')">' + t('autoScaffold') + '</button>';
      h += '</div>';
    } else if (lc === 'building') {
      h += '<div class="step-sub">' + t('devBuilding') + '</div>';
      h += '<div style="padding:12px;text-align:center"><span class="spinner"></span> ' + t('buildProgress') + '</div>';
    } else if (lc === 'built') {
      h += '<div class="step-sub">' + t('devBuilt') + '</div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      h += '<button class="btn sm pri" onclick="doAppStart(\'' + currentProject.id + '\')">' + t('appStart') + '</button>';
      h += '<button class="btn sm" onclick="doOpenVSCode(\'' + currentProject.id + '\')">' + t('openCode') + '</button>';
      h += '</div>';
      // Test generation from requirements
      h += '<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:8px">';
      h += '<div class="step-sub" style="margin-bottom:6px">' + t('genTestsReq') + '</div>';
      const idxTest = prompts.length;
      prompts.push('@test Generate Playwright E2E tests from the acceptance criteria in the approved Functions (FN-*). Create one test file per Component, with tests for each Function\'s acceptance criteria.');
      h += '<button class="btn sm" data-idx="' + idxTest + '" onclick="copyPrompt(this)">' + t('genTestsCopilot') + '</button>';
      h += '</div>';
    } else if (lc === 'running') {
      h += '<div class="step-sub">' + t('devRunning') + '</div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
      h += '<button class="btn sm danger" onclick="doAppStop(\'' + currentProject.id + '\')">' + t('appStop') + '</button>';
      h += '<button class="btn sm" onclick="doOpenVSCode(\'' + currentProject.id + '\')">' + t('openCode') + '</button>';
      h += '</div>';
    } else if (lc === 'deployed') {
      h += '<div class="step-sub">' + t('devDeployed') + '</div>';
    }
    h += '</div>';
  }

  // Store Deploy section (visible once app is built/running/deployed)
  if (lc === 'built' || lc === 'running' || lc === 'deployed') {
    const pid = currentProject.id;
    const storeStatus = currentProject.store?.status || 'none';
    const isCapacitor = currentProject.appType === 'capacitor';
    h += '<div class="step-block" style="margin-top:16px;border:1px solid var(--fg3)">';
    h += '<div class="step-title">' + t('storeDeploy') + '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
    if (isCapacitor) {
      h += '<button class="btn sm" onclick="doStoreConfigure(\'' + pid + '\',\'android\')">' + t('storeConfig') + ' (Android)</button>';
      h += '<button class="btn sm" onclick="doStoreConfigure(\'' + pid + '\',\'ios\')">' + t('storeConfig') + ' (iOS)</button>';
    }
    if (storeStatus !== 'none') {
      h += '<button class="btn sm" onclick="doStoreBuild(\'' + pid + '\')">' + t('storeBuild') + '</button>';
      h += '<button class="btn sm pri" onclick="doStoreUpload(\'' + pid + '\')">' + t('storeUploadBtn') + '</button>';
    }
    h += '<button class="btn sm" onclick="doStoreGHActions(\'' + pid + '\')">' + t('storeGHActions') + '</button>';
    h += '<button class="btn sm" onclick="doAppBuildDeploy(\'' + pid + '\')">' + t('appProd') + '</button>';
    h += '</div>';
    h += '</div>';
  }

  el.innerHTML = h;
}

function setSolFilter(f) {
  solFilter = f;
  renderFlow();
}

async function startDevelopment() {
  if (!currentProject) return;
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  await fetch(base + '/lifecycle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ state: 'ready' }) });
  await openProject(currentProject.id);
}

function addMoreIdeas() {
  if (!currentProject) return;
  const prompt = '@architect I want to add more Solutions to my Business Case. Let\'s brainstorm.';
  navigator.clipboard.writeText(prompt).then(() => { showToast(t('promptCopied'), 'success'); });
}

function actionRow(label, idx) {
  return '<div class="action-row"><div class="action-label">'+label+'</div><button class="action-btn" data-idx="'+idx+'" onclick="copyPrompt(this)">→ Copilot</button></div>';
}

function copyPrompt(btn) {
  const idx = parseInt(btn.getAttribute('data-idx'));
  const text = prompts[idx];
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '\u2713 ' + t('copied');
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  });
}

function dismissOnboard() {
  onboardDismissed = true;
  localStorage.setItem('arq-onboard-dismissed', '1');
  const el = document.getElementById('onboard');
  if (el) el.remove();
}

// ===== STATUS POPOVER =====
const STATUS_TRANSITIONS_CLIENT = {
  idea: ['draft'],
  draft: ['review', 'idea'],
  review: ['approved', 'draft'],
  approved: ['implemented', 'review'],
  implemented: ['approved'],
};

let activePopover = null;
function closeStatusPopover() {
  if (activePopover) { activePopover.remove(); activePopover = null; }
  document.removeEventListener('click', closeStatusPopover);
}

function showStatusPopover(targetEl, file, currentStatus, nodeId) {
  closeStatusPopover();
  const transitions = STATUS_TRANSITIONS_CLIENT[currentStatus] || [];
  if (!transitions.length) return;
  const pop = document.createElement('div');
  pop.className = 'status-popover';
  for (const t of transitions) {
    const item = document.createElement('div');
    item.className = 'status-popover-item';
    item.innerHTML = '<span class="sp-dot '+t+'"></span>'+t;
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeStatusPopover();
      await doSetStatus(file, t);
    });
    pop.appendChild(item);
  }
  document.body.appendChild(pop);
  const rect = targetEl.getBoundingClientRect();
  pop.style.top = (rect.bottom + 4) + 'px';
  pop.style.left = Math.min(rect.left, window.innerWidth - 160) + 'px';
  activePopover = pop;
  setTimeout(() => document.addEventListener('click', closeStatusPopover), 10);
}

async function doSetStatus(file, newStatus) {
  if (!currentProject) return;
  // Visual loading feedback on all status badges
  document.querySelectorAll('.ts.clickable').forEach(el => el.classList.add('updating'));
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  try {
    const r = await fetch(base + '/set-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, status: newStatus })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    await doRefresh();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== TRACKER PANEL =====
let selectedTreeNode = null;

function renderTracker() {
  const panel = document.getElementById('trackerPanel');
  const content = document.getElementById('trackerContent');
  if (!solData || !solData.length) { panel.classList.remove('active'); return; }
  panel.classList.add('active');

  let h = '';
  for (const sol of solData) {
    const sc = sol.statusCounts || {};
    const total = sol.total || 1;
    const approvedPct = ((sc.approved||0)/total*100).toFixed(0);
    const implementedPct = ((sc.implemented||0)/total*100).toFixed(0);
    const reviewPct = ((sc.review||0)/total*100).toFixed(0);
    const draftPct = ((sc.draft||0)/total*100).toFixed(0);
    const donePct = parseInt(approvedPct) + parseInt(implementedPct);

    h += '<div class="tracker-sol">';
    h += '<div class="tracker-sol-head">';
    h += '<span class="ts-id">' + esc(sol.id) + '</span>';
    h += '<span class="ts-name">' + esc(sol.title.replace(/^SOL-\\d+:\\s*/, '')) + '</span>';
    h += '<span class="ts-pct">' + donePct + '%</span>';
    h += '</div>';
    h += '<div class="tracker-bar">';
    if (sc.implemented) h += '<div class="tb-seg implemented" style="width:'+implementedPct+'%" title="Implemented: '+(sc.implemented||0)+'"></div>';
    if (sc.approved) h += '<div class="tb-seg approved" style="width:'+approvedPct+'%" title="Approved: '+(sc.approved||0)+'"></div>';
    if (sc.review) h += '<div class="tb-seg review" style="width:'+reviewPct+'%" title="Review: '+(sc.review||0)+'"></div>';
    if (sc.draft) h += '<div class="tb-seg draft" style="width:'+draftPct+'%" title="Draft: '+(sc.draft||0)+'"></div>';
    h += '</div></div>';
  }
  content.innerHTML = h;
}

function renderQuickActions(node) {
  const qa = document.getElementById('quickActions');
  if (!qa) return;
  selectedTreeNode = node;
  let h = '<div class="qa-title">Actions</div>';
  if (!node) {
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
    h += '<button class="qa-btn" onclick="doOpenVSCode(\'' + esc(currentProject?.id || '') + '\')">' + t('vsCode') + '</button>';
    h += '<button class="qa-btn" onclick="doRefresh()">' + t('refresh') + '</button>';
  } else if (node.type === 'solution') {
    const solNum = node.id.replace('SOL-','');
    h += '<button class="qa-btn" onclick="openAddUSModal(\'' + esc(solNum) + '\',\'' + esc(node.title.replace(/'/g,'')) + '\')">' + t('addUS') + '</button>';
    h += '<button class="qa-btn" onclick="openSolChat(\'' + esc(node.id) + '\',\'' + esc(node.title.replace(/'/g,'')) + '\')">' + t('chatBtn') + '</button>';
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
  } else if (node.type === 'user-story') {
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
    h += '<button class="qa-btn" onclick="doRefresh()">' + t('refresh') + '</button>';
  } else {
    h += '<button class="qa-btn" onclick="doValidate()">' + t('validate') + '</button>';
    h += '<button class="qa-btn" onclick="doRefresh()">' + t('refresh') + '</button>';
  }
  qa.innerHTML = h;
}

// ===== ADD USER STORY MODAL =====
let addUSTargetSol = null;
let addUSMode = 'discuss';

function openAddUSModal(solNum, solTitle) {
  addUSTargetSol = solNum;
  document.getElementById('addUSModal').classList.add('open');
  document.getElementById('addUSTitle').textContent = t('addUSModalTitle') + ' — SOL-' + solNum;
  document.getElementById('addUSSub').textContent = solTitle;
  document.getElementById('addUSInputTitle').value = '';
  document.getElementById('addUSNotes').value = '';
  setAddUSMode('discuss');
  setTimeout(() => document.getElementById('addUSInputTitle').focus(), 100);
}

function closeAddUSModal() {
  addUSTargetSol = null;
  document.getElementById('addUSModal').classList.remove('open');
}

function setAddUSMode(mode) {
  addUSMode = mode;
  document.getElementById('usModeDiscuss').classList.toggle('selected', mode === 'discuss');
  document.getElementById('usModeDirect').classList.toggle('selected', mode === 'direct');
  document.getElementById('addUSExtra').style.display = mode === 'direct' ? 'block' : 'none';
  document.getElementById('addUSBtn').textContent = mode === 'discuss' ? 'Start Discussion' : 'Generate Prompt';
}

async function doAddUS() {
  const title = document.getElementById('addUSInputTitle').value.trim();
  if (!title) { document.getElementById('addUSInputTitle').focus(); return; }

  if (addUSMode === 'discuss') {
    closeAddUSModal();
    openChat('SOL-' + addUSTargetSol, title);
  } else {
    const base = '/api/projects/' + encodeURIComponent(currentProject.id);
    const [nextIdData, bcData] = await Promise.all([
      fetch(base + '/next-us-id?sol=' + addUSTargetSol).then(r=>r.json()),
      fetch(base + '/bc-summary').then(r=>r.json()),
    ]);
    const nextId = nextIdData.next || '?';
    const notes = document.getElementById('addUSNotes').value.trim();
    const usId = addUSTargetSol + '.' + nextId;

    let prompt = '@architect Create a new User Story US-' + usId + ' for SOL-' + addUSTargetSol + '.\\n\\n';
    prompt += 'Title: ' + title + '\\n';
    if (notes) prompt += 'Notes: ' + notes + '\\n';
    prompt += '\\nContext (Business Case summary):\\n' + (bcData.summary || 'No BC available') + '\\n';
    prompt += '\\nCreate per metamodel:\\n1. US-' + usId + ' file\\n2. All Components (CMP-' + usId + '.x)\\n3. All Functions (FN-' + usId + '.x.y)\\n';
    prompt += 'Strictly follow naming conventions and templates.';

    closeAddUSModal();
    await navigator.clipboard.writeText(prompt);
    showToast(t('promptCopied'), 'success');
    await doRefresh();
  }
}

// ===== ADD-SOL MODAL =====
function openAddSolModal() {
  document.getElementById('addSolModal').classList.add('open');
  document.getElementById('addSolTitle').value = '';
  document.getElementById('addSolNotes').value = '';
  setAddSolMode('discuss');
  setTimeout(() => document.getElementById('addSolTitle').focus(), 100);
}
function closeAddSolModal() {
  document.getElementById('addSolModal').classList.remove('open');
}
function setAddSolMode(mode) {
  addSolMode = mode;
  document.getElementById('modeDiscuss').classList.toggle('selected', mode === 'discuss');
  document.getElementById('modeDirect').classList.toggle('selected', mode === 'direct');
  document.getElementById('addSolExtra').style.display = mode === 'direct' ? 'block' : 'none';
  document.getElementById('addSolBtn').textContent = mode === 'discuss' ? 'Start Discussion' : 'Generate Prompt';
}
async function doAddSol() {
  const title = document.getElementById('addSolTitle').value.trim();
  if (!title) { document.getElementById('addSolTitle').focus(); return; }

  if (addSolMode === 'discuss') {
    closeAddSolModal();
    openChat('new', title);
  } else {
    // Direct: generate Copilot prompt
    const base = '/api/projects/' + encodeURIComponent(currentProject.id);
    const [nextIdData, bcData, solsData] = await Promise.all([
      fetch(base + '/next-sol-id').then(r=>r.json()),
      fetch(base + '/bc-summary').then(r=>r.json()),
      fetch(base + '/solutions').then(r=>r.json()),
    ]);
    const nextId = nextIdData.next || '?';
    const solList = solsData.map(s => s.id + ': ' + s.title).join('\\n');
    const notes = document.getElementById('addSolNotes').value.trim();

    let prompt = '@architect Create a new Solution SOL-' + nextId + ' for the project.\\n\\n';
    prompt += 'Title: ' + title + '\\n';
    if (notes) prompt += 'Notes: ' + notes + '\\n';
    prompt += '\\nContext (Business Case summary):\\n' + (bcData.summary || 'No BC available') + '\\n';
    prompt += '\\nExisting Solutions:\\n' + (solList || 'None') + '\\n';
    prompt += '\\nCreate per metamodel:\\n1. SOL-' + nextId + ' file\\n2. All User Stories (US)\\n3. All Components (CMP)\\n4. All Functions (FN)\\n';
    prompt += 'Strictly follow naming conventions and templates.';

    closeAddSolModal();
    await navigator.clipboard.writeText(prompt);
    showToast(t('promptCopied'), 'success');
    await doRefresh();
  }
}

// ===== CHAT PANEL =====
let githubConnected = false;
let githubUser = null;

function openChat(relatedTo, title) {
  chatContext = { relatedTo, title };
  chatMessages = [];
  document.getElementById('chatTitle').textContent = relatedTo === 'new' ? 'New Idea: ' + title : relatedTo + ' Discussion';

  const badge = document.getElementById('chatBadge');
  if (githubConnected) {
    badge.textContent = 'GitHub AI';
    badge.className = 'chat-badge ai-provider-badge';
  } else if (chatLLMConfigured) {
    badge.textContent = 'Legacy LLM';
    badge.className = 'chat-badge ai-provider-badge legacy';
  } else {
    badge.textContent = currentLang === 'de' ? 'Nicht konfiguriert' : 'Not configured';
    badge.className = 'chat-badge';
  }

  document.getElementById('chatPanel').classList.add('open');
  renderChatMessages();

  if (!githubConnected && !chatLLMConfigured) {
    document.getElementById('chatMessages').innerHTML =
      '<div class="chat-not-configured">' +
      '<div class="cfg-icon">&#9881;</div>' +
      '<div class="cfg-text">No AI configured.<br>Connect your GitHub account for AI-powered development:</div>' +
      '<button class="btn pri sm" onclick="closeChat();openGitHubSetup()" style="margin:12px auto;display:block">Connect GitHub</button>' +
      '<div class="cfg-text" style="margin-top:12px;font-size:11px;color:var(--fg3)">Or configure a legacy LLM in <code>_ARQITEKT/config/llm.yaml</code></div>' +
      '</div>';
    return;
  }

  // System message
  chatMessages.push({ role: 'system', content: buildSystemPrompt() });
  // Welcome
  const welcomeMsg = relatedTo === 'new'
    ? 'Let\'s brainstorm about "' + title + '". What do you have in mind? What problem should this solution solve?'
    : 'Let\'s discuss ' + relatedTo + '. What would you like to explore or refine?';
  chatMessages.push({ role: 'assistant', content: welcomeMsg });
  renderChatMessages();
  document.getElementById('chatInput').focus();
}

function closeChat() {
  document.getElementById('chatPanel').classList.remove('open');
}

function buildSystemPrompt() {
  const bcTitle = currentProject?.bcTitle || 'Unknown';
  const solList = solData.map(s => s.id + ': ' + s.title.replace(/^SOL-\\d+:\\s*/, '')).join(', ');
  return 'You are an experienced requirements engineering consultant. You help brainstorm for a software project.\\n\\n' +
    'Project: ' + bcTitle + '\\n' +
    'Existing Solutions: ' + (solList || 'None') + '\\n\\n' +
    'Your task: Help the user think through the idea. Ask follow-up questions, identify edge cases, ' +
    'suggest structures (User Stories, Components). Be constructive and precise. ' +
    'Respond in English.';
}

function renderChatMessages() {
  const el = document.getElementById('chatMessages');
  let h = '';
  for (const msg of chatMessages) {
    if (msg.role === 'system') continue;
    h += '<div class="chat-msg ' + msg.role + '">' + esc(msg.content) + '</div>';
  }
  el.innerHTML = h;
  el.scrollTop = el.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  chatMessages.push({ role: 'user', content: text });
  renderChatMessages();

  // Disable send while waiting
  const btn = document.getElementById('chatSendBtn');
  btn.disabled = true;
  btn.textContent = '...';

  // Show typing indicator
  const msgEl = document.getElementById('chatMessages');
  msgEl.insertAdjacentHTML('beforeend', '<div class="chat-msg assistant" id="chatTyping" style="opacity:.5">Thinking...</div>');
  msgEl.scrollTop = msgEl.scrollHeight;

  try {
    const modelSel = document.getElementById('aiModelSelect');
    const model = modelSel ? modelSel.value : '';
    const projectId = currentProject ? currentProject.id : undefined;

    const resp = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatMessages.filter(m => m.role !== 'system'),
        model: model,
        projectId: projectId,
      }),
    });
    const data = await resp.json();
    const typing = document.getElementById('chatTyping');
    if (typing) typing.remove();

    if (data.error) {
      chatMessages.push({ role: 'assistant', content: 'Error: ' + data.error });
    } else {
      chatMessages.push({ role: 'assistant', content: data.content });
    }
    renderChatMessages();
  } catch (err) {
    const typing = document.getElementById('chatTyping');
    if (typing) typing.remove();
    chatMessages.push({ role: 'assistant', content: 'Connection error: ' + err.message });
    renderChatMessages();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send';
  }
}

// Enter to send (Shift+Enter for newline)
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

function openSolChat(solId, solTitle) {
  openChat(solId, solTitle);
}

// ===== SAVE CONVERSATION =====
async function saveChatConversation() {
  if (!currentProject || chatMessages.length < 2) return;
  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const nextSol = chatContext?.relatedTo === 'new' ? 'new' : chatContext?.relatedTo;
  const convId = 'DISC-' + (nextSol || 'misc') + '-' + Date.now().toString(36);
  const conv = {
    id: convId,
    title: chatContext?.title || 'Discussion',
    status: 'open',
    related_to: nextSol || 'misc',
    messages: chatMessages.filter(m => m.role !== 'system'),
    provider: 'configured-llm',
    model: 'unknown',
  };
  try {
    await fetch(base + '/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conv),
    });
    showToast(t('savedConv'), 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== FORMALIZATION =====
async function formalizeChat() {
  if (!currentProject || chatMessages.length < 3) {
    showToast(t('discussFirst'), 'error');
    return;
  }

  const base = '/api/projects/' + encodeURIComponent(currentProject.id);
  const [nextIdData, solsData] = await Promise.all([
    fetch(base + '/next-sol-id').then(r=>r.json()),
    fetch(base + '/solutions').then(r=>r.json()),
  ]);
  const nextId = nextIdData.next || '?';
  const solList = solsData.map(s => s.id + ': ' + s.title).join('\\n');

  // Build conversation text
  let convText = '';
  for (const msg of chatMessages) {
    if (msg.role === 'system') continue;
    convText += (msg.role === 'user' ? 'User' : 'Assistant') + ': ' + msg.content + '\\n\\n';
  }

  let prompt = '@architect Here is the result of a discussion about a new solution.\\n\\n';
  prompt += 'Project: ' + (currentProject.bcTitle || currentProject.id) + '\\n';
  prompt += 'Existing Solutions:\\n' + (solList || 'None') + '\\n\\n';
  prompt += '--- Discussion ---\\n' + convText + '--- End ---\\n\\n';
  prompt += 'Formalize the discussion result as:\\n';
  prompt += '1. A new SOL-' + nextId + ' file (per template/solution.md)\\n';
  prompt += '2. All derived US files (per template/user-story.md)\\n';
  prompt += '3. All derived CMP files (per template/component.md)\\n';
  prompt += '4. All derived FN files (per template/function.md)\\n\\n';
  prompt += 'Strictly follow the metamodel and naming conventions.\\n';
  prompt += 'Next available Solution ID: SOL-' + nextId;

  await navigator.clipboard.writeText(prompt);

  // Also save the conversation
  await saveChatConversation();

  showToast(t('formalized'), 'success');
}

// ===== CREATE PROJECT =====
function openCreateModal() {
  // Use the onboarding wizard instead of the simple modal
  openWizardModal();
}
function closeCreateModal() {
  const m = document.getElementById('createModal');
  releaseFocus(m);
  m.classList.remove('open');
}

// ===== IMPORT PROJECT =====
function openImportModal() {
  document.getElementById('importModal').classList.add('open');
  document.getElementById('importPathInput').value = '';
  document.getElementById('importNameInput').value = '';
  document.getElementById('importDescInput').value = '';
  document.getElementById('importGithubInput').value = '';
  document.getElementById('importPreview').textContent = '';
  setTimeout(() => document.getElementById('importPathInput').focus(), 100);
}
function closeImportModal() {
  document.getElementById('importModal').classList.remove('open');
}
async function doImportProject() {
  const sourcePath = document.getElementById('importPathInput').value.trim();
  const name = document.getElementById('importNameInput').value.trim();
  const description = document.getElementById('importDescInput').value.trim();
  const githubRepo = document.getElementById('importGithubInput').value.trim();
  if (!sourcePath || !name) { showToast(t('requiredFields'), 'error'); return; }
  try {
    const r = await fetch('/api/projects/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourcePath, name, description, githubRepo })
    });
    const data = await r.json();
    if (data.error) { showToast(t('importError') + data.error, 'error'); return; }
    showToast(t('importSuccess').replace('{id}', data.projectId).replace('{n}', data.filesCopied || 0), 'celebrate', 5000);
    closeImportModal();
    await loadProjects();
  } catch (e) { showToast(t('errorPrefix') + e.message, 'error'); }
}

document.getElementById('projectNameInput').addEventListener('input', async e => {
  const name = e.target.value.trim();
  if (!name) { document.getElementById('projectPreview').textContent = ''; return; }
  const code = name.normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  try {
    const r = await fetch('/api/projects');
    const projects = await r.json();
    const maxNum = projects.reduce((max, p) => { const n = parseInt(p.id?.slice(0,3)); return n > max ? n : max; }, 0);
    const next = String(maxNum + 1).padStart(3, '0');
    document.getElementById('projectPreview').textContent = '\u2192 ' + next + '_' + code;
  } catch { document.getElementById('projectPreview').textContent = '\u2192 ' + code; }
});

async function doCreateProject() {
  const name = document.getElementById('projectNameInput').value.trim();
  const description = document.getElementById('projectDescInput').value.trim();
  if (!name) return;
  const btn = document.getElementById('createBtn');
  btn.textContent = 'Creating...';
  btn.disabled = true;
  try {
    const r = await fetch('/api/projects/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    closeCreateModal();
    await openProject(data.id);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Create';
    btn.disabled = false;
  }
}

// ===== EDIT PROJECT =====
let editTarget = null;

function openEditModal(projectId, name, description) {
  editTarget = projectId;
  const m = document.getElementById('editModal');
  m.classList.add('open');
  document.getElementById('editModalTitle').textContent = 'Edit Project ' + projectId.slice(0,3);
  document.getElementById('editNameInput').value = name || '';
  document.getElementById('editDescInput').value = description || '';
  const code = (name || '').normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  document.getElementById('editPreview').textContent = '\u2192 ' + projectId.slice(0,3) + '_' + code;
  setTimeout(() => { document.getElementById('editNameInput').focus(); trapFocus(m); }, 100);
}
function closeEditModal() {
  editTarget = null;
  const m = document.getElementById('editModal');
  releaseFocus(m);
  m.classList.remove('open');
}

document.getElementById('editNameInput').addEventListener('input', e => {
  const name = e.target.value.trim();
  if (!name || !editTarget) { document.getElementById('editPreview').textContent = ''; return; }
  const code = name.normalize('NFD').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  document.getElementById('editPreview').textContent = '\u2192 ' + editTarget.slice(0,3) + '_' + code;
});

async function doEditProject() {
  if (!editTarget) return;
  const name = document.getElementById('editNameInput').value.trim();
  const description = document.getElementById('editDescInput').value.trim();
  if (!name) return;
  const btn = document.getElementById('editBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  try {
    // Update description
    await fetch('/api/projects/' + encodeURIComponent(editTarget) + '/update-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    // Rename (also updates name + codename + folder)
    const r = await fetch('/api/projects/' + encodeURIComponent(editTarget) + '/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    closeEditModal();
    // If we're inside the project view and it was renamed, redirect
    if (currentProject && currentProject.id === editTarget && data.id !== editTarget) {
      location.hash = data.id;
      await openProject(data.id);
    } else {
      await loadProjects();
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Save';
    btn.disabled = false;
  }
}

// ===== DELETE PROJECT =====
function promptDelete(projectId, codename, name, totalArtifacts, hasGithub) {
  deleteTarget = projectId;
  deleteCodename = codename;
  document.getElementById('confirmTitle').textContent = t('deleteConfirmTitle');
  document.getElementById('confirmText').textContent = 'Project "' + name + '" (' + projectId + ') and all its files will be permanently deleted.';
  const ghHint = document.getElementById('confirmGithubHint');
  if (hasGithub) {
    ghHint.style.display = 'block';
    ghHint.textContent = t('deleteGithubHint');
  } else {
    ghHint.style.display = 'none';
  }
  const artCount = document.getElementById('confirmArtifactCount');
  if (totalArtifacts > 0) {
    artCount.style.display = 'block';
    artCount.textContent = t('deleteArtifactCount').replace('{n}', totalArtifacts);
  } else {
    artCount.style.display = 'none';
  }
  document.getElementById('confirmCodenameLabel').textContent = t('deleteTypeConfirm').replace('{codename}', codename);
  const inp = document.getElementById('confirmCodename');
  inp.value = '';
  const delBtn = document.getElementById('confirmDeleteBtn');
  delBtn.disabled = true;
  inp.oninput = function() { delBtn.disabled = inp.value.trim() !== codename; };
  document.getElementById('confirmDialog').classList.add('open');
  setTimeout(() => inp.focus(), 100);
}
function closeConfirm() {
  deleteTarget = null;
  deleteCodename = null;
  document.getElementById('confirmDialog').classList.remove('open');
}
async function confirmDelete() {
  if (!deleteTarget) return;
  const inp = document.getElementById('confirmCodename');
  if (deleteCodename && inp.value.trim() !== deleteCodename) return;
  const id = deleteTarget;
  closeConfirm();
  await fetch('/api/projects/' + encodeURIComponent(id) + '/delete', { method: 'POST' });
  if (currentProject && currentProject.id === id) {
    showHub();
  } else {
    loadProjects();
  }
}

// ===== VS CODE =====
async function doOpenVSCode(projectId) {
  await fetch('/api/projects/' + encodeURIComponent(projectId) + '/open');
}

// ===== FACTORY: Scaffold / App Start / App Stop =====
async function doScaffold(projectId) {
  if (!confirm(t('confirmScaffold'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/scaffold', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('scaffoldCopilot') + ' — ' + (data.filesCreated || 0) + ' files', 'celebrate', 5000);
    const r2 = await fetch(base + '/codegen', { method: 'POST' });
    const data2 = await r2.json();
    if (data2.error) { showToast(data2.error, 'error'); }
    else { showToast('Codegen: ' + (data2.filesGenerated || 0) + ' files', 'celebrate', 5000); }
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doCodegen(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    showToast('Generating code...', 'info', 5000);
    const r = await fetch(base + '/codegen', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Codegen: ' + (data.filesGenerated || 0) + ' files', 'celebrate', 5000);
    if (activeTab === 'develop') refreshFileExplorer();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doForceScaffold(projectId) {
  if (!confirm(t('confirmForceScaffold'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/force-scaffold', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Scaffold: ' + (data.filesCreated || 0) + ' files', 'celebrate', 5000);
    const r2 = await fetch(base + '/codegen', { method: 'POST' });
    const data2 = await r2.json();
    if (data2.error) { showToast(data2.error, 'error'); }
    else { showToast('Codegen: ' + (data2.filesGenerated || 0) + ' files', 'celebrate', 5000); }
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doGitHubExport(projectId) {
  if (!confirm(t('confirmExport'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/github-export', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('exportIssues') + ': ' + (data.issueCount || 0) + ' → ' + (data.outputFile || 'exports/'), 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

async function doGitHubPush(projectId) {
  if (!confirm(t('confirmPush'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  const btn = document.getElementById('btnGhPush');
  if (btn) { btn.disabled = true; btn.textContent = 'Pushing...'; }
  try {
    const r = await fetch(base + '/github/push', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Push OK: ' + (data.commitMessage || ''), 'success');
    if (btn) { btn.textContent = 'Pushed'; setTimeout(() => { btn.textContent = t('storePush'); btn.disabled = false; }, 3000); }
  } catch (e) {
    showToast(e.message, 'error');
    if (btn) { btn.textContent = t('storePush'); btn.disabled = false; }
  }
}

async function doStoreConfigure(projectId, platform) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/store/configure', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: platform || 'android' })
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeConfig') + ': ' + (data.filesCreated || []).join(', '), 'success');
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doStoreBuild(projectId) {
  if (!confirm(t('confirmStoreBuild'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/store/build', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeBuild') + ' OK', 'celebrate', 5000);
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doStoreUpload(projectId) {
  if (!confirm(t('storeUploadBtn') + '?')) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    showToast(t('buildProgress'), 'info', 15000);
    const r = await fetch(base + '/store/upload', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeUploadBtn') + ' OK', 'celebrate', 5000);
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doStoreGHActions(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/store/github-actions', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast(t('storeGHActions') + ' OK', 'celebrate', 5000);
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doRunTests(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/test/run', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Tests: ' + (data.passed || 0) + ' passed, ' + (data.failed || 0) + ' failed', data.failed ? 'error' : 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

async function doSetupPlaywright(projectId) {
  if (!confirm(t('confirmPlaywright'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/test/setup', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    showToast('Playwright: ' + (data.filesCreated || 0) + ' files', 'success');
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doAppStart(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/app/start', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    await loadProjects();
    if (data.port) window.open('http://localhost:' + data.port, '_blank');
  } catch (e) { showToast(e.message, 'error'); }
}

async function doAppStop(projectId) {
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    const r = await fetch(base + '/app/stop', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

async function doAppBuildDeploy(projectId) {
  if (!confirm(t('confirmBuildDeploy'))) return;
  const base = '/api/projects/' + encodeURIComponent(projectId);
  try {
    showToast(t('buildProgress'), 'info', 10000);
    const r = await fetch(base + '/app/build', { method: 'POST' });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    const r2 = await fetch(base + '/app/deploy', { method: 'POST' });
    const data2 = await r2.json();
    if (data2.error) { showToast(data2.error, 'error'); return; }
    await loadProjects();
    if (data2.port) window.open('http://localhost:' + data2.port, '_blank');
  } catch (e) { showToast(e.message, 'error'); }
}

// ===== BRANDING MODAL =====
let brandingTarget = null;

function openBrandingModal(projectId) {
  brandingTarget = projectId;
  const m = document.getElementById('brandingModal');
  m.classList.add('open');
  document.getElementById('brandingModalTitle').textContent = t('branding') + ': ' + projectId;
  // Load existing branding
  fetch('/api/projects/' + encodeURIComponent(projectId) + '/branding')
    .then(r => r.json()).then(data => {
      const b = data.branding || {};
      document.getElementById('brandPrimary').value = b.primary || '#FFD700';
      document.getElementById('brandSecondary').value = b.secondary || '#1F1F1F';
      document.getElementById('brandFontHeading').value = b.font_heading || 'Inter';
      document.getElementById('brandFontBody').value = b.font_body || 'Inter';
      document.getElementById('brandFontMono').value = b.font_mono || 'JetBrains Mono';
      document.getElementById('brandMode').value = b.mode || 'dark';
      document.getElementById('brandLogo').value = b.logo || '';
      updateBrandingPreview();
      setTimeout(() => trapFocus(m), 100);
    });
}

function closeBrandingModal() {
  brandingTarget = null;
  const m = document.getElementById('brandingModal');
  releaseFocus(m);
  m.classList.remove('open');
}

function updateBrandingPreview() {
  document.getElementById('brandSwatchPrimary').style.background = document.getElementById('brandPrimary').value;
  document.getElementById('brandSwatchSecondary').style.background = document.getElementById('brandSecondary').value;
  document.getElementById('brandPreviewText').textContent =
    document.getElementById('brandFontHeading').value + ' / ' +
    document.getElementById('brandFontMono').value + ' / ' +
    document.getElementById('brandMode').value;
}

async function saveBranding() {
  if (!brandingTarget) return;
  const branding = {
    primary: document.getElementById('brandPrimary').value,
    secondary: document.getElementById('brandSecondary').value,
    fontHeading: document.getElementById('brandFontHeading').value,
    fontBody: document.getElementById('brandFontBody').value,
    fontMono: document.getElementById('brandFontMono').value,
    mode: document.getElementById('brandMode').value,
    logo: document.getElementById('brandLogo').value.trim() || undefined,
  };
  try {
    const r = await fetch('/api/projects/' + encodeURIComponent(brandingTarget) + '/branding', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branding }),
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    closeBrandingModal();
    await loadProjects();
  } catch (e) { showToast(e.message, 'error'); }
}

// ===== UTIL =====
function esc(s) { if (!s) return ''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

// Focus trap for modals
function trapFocus(modal) {
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  modal._focusTrapHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  };
  modal.addEventListener('keydown', modal._focusTrapHandler);
}
function releaseFocus(modal) {
  if (modal._focusTrapHandler) { modal.removeEventListener('keydown', modal._focusTrapHandler); delete modal._focusTrapHandler; }
}

// ===== START =====
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (activePopover) { closeStatusPopover(); return; }
  if (document.getElementById('confirmDialog').classList.contains('open')) { closeConfirm(); return; }
  if (document.getElementById('addUSModal').classList.contains('open')) { closeAddUSModal(); return; }
  if (document.getElementById('addSolModal').classList.contains('open')) { closeAddSolModal(); return; }
  if (document.getElementById('editModal').classList.contains('open')) { closeEditModal(); return; }
  if (document.getElementById('brandingModal').classList.contains('open')) { closeBrandingModal(); return; }
  if (document.getElementById('createModal').classList.contains('open')) { closeCreateModal(); return; }
  if (document.getElementById('importModal').classList.contains('open')) { closeImportModal(); return; }
  if (document.getElementById('feedbackModal').style.display === 'flex') { closeFeedbackModal(); return; }
  if (document.getElementById('githubModal').style.display === 'flex') { closeGitHubSetup(); return; }
  if (document.getElementById('wizardModal').style.display === 'flex') { closeWizardModal(); return; }
  if (document.getElementById('chatPanel').classList.contains('open')) { closeChat(); return; }
  if (document.getElementById('valOverlay').classList.contains('open')) { closeVal(); return; }
  if (document.getElementById('detailOverlay').classList.contains('open')) { closeDetail(); return; }
});

// Branding preview live updates
['brandPrimary','brandSecondary','brandFontHeading','brandFontBody','brandFontMono','brandMode'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateBrandingPreview);
});

// ===== GITHUB CONNECTION =====
async function checkGitHubStatus() {
  try {
    const r = await fetch('/api/github/status');
    const data = await r.json();
    githubConnected = data.connected;
    githubUser = data.user || null;
    updateGitHubUI();
    if (data.models && data.models.length) {
      populateModelSelector(data.models);
    }
  } catch { githubConnected = false; }
}

// ===== AUTO-UPDATE =====
async function checkForHubUpdate() {
  // Skip if already dismissed this session
  if (sessionStorage.getItem('arq-update-dismissed')) return;
  try {
    const r = await fetch('/api/hub/version');
    const info = await r.json();
    if (info.error || !info.updateAvailable) return;
    showUpdateBanner(info);
  } catch {}
}

function showUpdateBanner(info) {
  const banner = document.getElementById('updateBanner');
  const text = document.getElementById('updateBannerText');
  const installBtn = document.getElementById('updateInstallBtn');
  const dismissBtn = document.getElementById('updateDismissBtn');
  banner.className = 'update-banner';
  text.textContent = t('updateAvailable') + ' — v' + info.currentVersion + ' → v' + info.latestVersion;
  installBtn.textContent = t('updateInstall');
  dismissBtn.textContent = t('updateDismiss');
  installBtn.onclick = () => installHubUpdate();
  dismissBtn.onclick = () => dismissUpdate();
  banner.style.display = '';
  // Store info for install
  banner.dataset.downloadUrl = info.downloadUrl || '';
  banner.dataset.latestVersion = info.latestVersion || '';
}

async function installHubUpdate() {
  const banner = document.getElementById('updateBanner');
  const text = document.getElementById('updateBannerText');
  const installBtn = document.getElementById('updateInstallBtn');
  banner.classList.add('installing');
  text.textContent = t('updateInstalling');
  installBtn.disabled = true;
  document.getElementById('updateDismissBtn').style.display = 'none';
  try {
    const r = await fetch('/api/hub/update', { method: 'POST' });
    const result = await r.json();
    if (result.error) throw new Error(result.error);
    banner.classList.remove('installing');
    banner.classList.add('success');
    text.textContent = t('updateSuccess').replace('{version}', result.newVersion);
    installBtn.textContent = t('updateRestart');
    installBtn.disabled = false;
    installBtn.onclick = () => { location.reload(); };
  } catch (err) {
    banner.classList.remove('installing');
    banner.classList.add('error');
    text.textContent = t('updateFailed').replace('{error}', err.message);
    installBtn.textContent = t('updateDismiss');
    installBtn.disabled = false;
    installBtn.onclick = () => dismissUpdate();
  }
}

function dismissUpdate() {
  document.getElementById('updateBanner').style.display = 'none';
  sessionStorage.setItem('arq-update-dismissed', '1');
}

function updateGitHubUI() {
  const btn = document.getElementById('githubBtn');
  const badge = document.getElementById('githubAvatarBadge');
  const img = document.getElementById('githubAvatarImg');
  const label = document.getElementById('githubBtnLabel');
  if (githubConnected && githubUser) {
    badge.style.display = '';
    img.src = githubUser.avatar_url;
    img.alt = githubUser.login;
    label.textContent = githubUser.login;
  } else {
    badge.style.display = 'none';
    label.textContent = 'GitHub';
  }
}

function populateModelSelector(models) {
  const sel = document.getElementById('aiModelSelect');
  if (!sel) return;
  sel.innerHTML = '';
  for (const m of models) {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    sel.appendChild(opt);
  }
}

function openGitHubSetup() {
  const modal = document.getElementById('githubModal');
  modal.style.display = 'flex';
  if (githubConnected && githubUser) {
    document.getElementById('githubSetupView').style.display = 'none';
    document.getElementById('githubConnectedView').style.display = '';
    document.getElementById('ghConnectedAvatar').src = githubUser.avatar_url;
    document.getElementById('ghConnectedName').textContent = githubUser.name || githubUser.login;
    // Populate model list
    loadModelChips();
  } else {
    document.getElementById('githubSetupView').style.display = '';
    document.getElementById('githubConnectedView').style.display = 'none';
    document.getElementById('githubTokenInput').value = '';
    document.getElementById('githubSetupError').style.display = 'none';
  }
}

function closeGitHubSetup() {
  document.getElementById('githubModal').style.display = 'none';
}

async function loadModelChips() {
  try {
    const r = await fetch('/api/ai/models');
    const data = await r.json();
    const list = document.getElementById('ghModelList');
    list.innerHTML = '';
    for (const m of (data.models || [])) {
      const chip = document.createElement('span');
      chip.className = 'wiz-chip selected';
      chip.style.cssText = 'padding:6px 12px;font-size:11px;cursor:default';
      chip.textContent = m.name;
      list.appendChild(chip);
    }
  } catch {}
}

async function doGitHubConnect() {
  const tokenInput = document.getElementById('githubTokenInput');
  const token = tokenInput.value.trim();
  const errEl = document.getElementById('githubSetupError');
  if (!token) { tokenInput.focus(); return; }

  const btn = document.getElementById('githubConnectBtn');
  btn.disabled = true;
  btn.textContent = t('ghConnecting');
  errEl.style.display = 'none';

  try {
    const r = await fetch('/api/github/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await r.json();
    if (data.error) {
      errEl.textContent = data.error;
      errEl.style.display = '';
    } else {
      githubConnected = true;
      githubUser = data.user;
      updateGitHubUI();
      if (data.models) populateModelSelector(data.models);
      showToast(t('ghConnectedAs').replace('{name}', data.user.login), 'success');
      closeGitHubSetup();
    }
  } catch (err) {
    errEl.textContent = t('ghConnectionFailed') + err.message;
    errEl.style.display = '';
  } finally {
    btn.disabled = false;
    btn.textContent = t('ghConnectBtn');
  }
}

async function doGitHubDisconnect() {
  try {
    await fetch('/api/github/disconnect', { method: 'POST' });
  } catch {}
  githubConnected = false;
  githubUser = null;
  updateGitHubUI();
  showToast(t('ghDisconnected'), 'success');
  closeGitHubSetup();
}

// ===== VOICE INPUT (Web Speech API) =====
let voiceRecognition = null;
let voiceRecording = false;

function toggleVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast(t('voiceNotSupported'), 'error');
    return;
  }

  const voiceBtn = document.getElementById('voiceBtn');

  if (voiceRecording) {
    voiceRecognition.stop();
    voiceRecording = false;
    voiceBtn.classList.remove('recording');
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SR();
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = false;
  voiceRecognition.lang = currentLang === 'de' ? 'de-DE' : 'en-US';

  voiceRecognition.onresult = function(e) {
    const transcript = e.results[0][0].transcript;
    const input = document.getElementById('chatInput');
    input.value = (input.value ? input.value + ' ' : '') + transcript;
    input.focus();
  };

  voiceRecognition.onend = function() {
    voiceRecording = false;
    voiceBtn.classList.remove('recording');
  };

  voiceRecognition.onerror = function(e) {
    voiceRecording = false;
    voiceBtn.classList.remove('recording');
    if (e.error !== 'aborted') {
      showToast(t('voiceError') + e.error, 'error');
    }
  };

  voiceRecording = true;
  voiceBtn.classList.add('recording');
  voiceRecognition.start();
}

// ===== TAB SYSTEM =====
let activeTab = 'plan';
let monacoLoaded = false;
let monacoEditor = null;
let openFiles = [];       // [{path, content, modified, model}]
let activeFileIdx = -1;

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1)));

  // Show/hide sidebar sections based on tab
  const tree = document.getElementById('tree');
  const ccTree = document.getElementById('crossCuttingTree');
  const searchBox = document.querySelector('.search-box');
  const fileExplorer = document.getElementById('fileExplorer');
  const trackerPanel = document.getElementById('trackerPanel');

  if (tab === 'develop') {
    tree.style.display = 'none';
    ccTree.style.display = 'none';
    searchBox.style.display = 'none';
    fileExplorer.style.display = '';
    trackerPanel.style.display = 'none';
    loadMonacoEditor();
    if (!fileExplorerLoaded) loadFileExplorer();
  } else {
    tree.style.display = '';
    ccTree.style.display = '';
    searchBox.style.display = '';
    fileExplorer.style.display = 'none';
    trackerPanel.style.display = '';
  }

  if (tab === 'deploy') renderDeployTab();
  if (tab === 'monitor') renderMonitorTab();
}

// ===== MONACO EDITOR (CDN) =====
function loadMonacoEditor() {
  if (monacoLoaded) return;
  monacoLoaded = true;

  // Load Monaco from CDN
  const loaderScript = document.createElement('script');
  loaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
  loaderScript.onload = function() {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], function() {
      monaco.editor.defineTheme('arqitekt', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0a0e14',
          'editor.foreground': '#c9d1d9',
          'editorLineNumber.foreground': '#484f58',
          'editorLineNumber.activeForeground': '#FFD700',
          'editor.selectionBackground': '#264f78',
          'editor.lineHighlightBackground': '#161b22',
          'editorCursor.foreground': '#FFD700',
        }
      });

      const container = document.getElementById('editorContainer');
      const welcome = document.getElementById('editorWelcome');

      monacoEditor = monaco.editor.create(container, {
        value: '',
        language: 'markdown',
        theme: 'arqitekt',
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        fontSize: 13,
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        padding: { top: 8 },
      });

      // Save on Ctrl+S
      monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
        saveCurrentFile();
      });

      // Track modifications
      monacoEditor.onDidChangeModelContent(function() {
        if (activeFileIdx >= 0 && openFiles[activeFileIdx]) {
          openFiles[activeFileIdx].modified = true;
          renderEditorTabs();
        }
      });

      // Hide welcome if visible
      if (welcome) welcome.style.display = 'none';
    });
  };
  document.head.appendChild(loaderScript);
}

function openFileInEditor(filePath) {
  // Check if already open
  const existing = openFiles.findIndex(f => f.path === filePath);
  if (existing >= 0) {
    activateEditorTab(existing);
    return;
  }

  // Load file content from server
  if (!currentProject) return;
  fetch('/api/projects/' + encodeURIComponent(currentProject.id) + '/files?path=' + encodeURIComponent(filePath) + '&content=true')
    .then(r => r.json())
    .then(data => {
      if (data.error) { showToast(data.error, 'error'); return; }
      const ext = filePath.split('.').pop().toLowerCase();
      const langMap = {
        js: 'javascript', mjs: 'javascript', ts: 'typescript', tsx: 'typescript',
        json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown',
        html: 'html', css: 'css', scss: 'scss', xml: 'xml',
        py: 'python', java: 'java', kt: 'kotlin', swift: 'swift',
        sh: 'shell', bat: 'bat', ps1: 'powershell',
        sql: 'sql', graphql: 'graphql', dart: 'dart',
      };
      const lang = langMap[ext] || 'plaintext';

      openFiles.push({ path: filePath, content: data.content, modified: false, lang: lang });
      activateEditorTab(openFiles.length - 1);
    })
    .catch(err => showToast('Failed to load file: ' + err.message, 'error'));
}

function activateEditorTab(idx) {
  if (idx < 0 || idx >= openFiles.length) return;
  activeFileIdx = idx;
  const file = openFiles[idx];

  if (monacoEditor) {
    const model = monaco.editor.createModel(file.content, file.lang);
    const oldModel = monacoEditor.getModel();
    monacoEditor.setModel(model);
    if (oldModel && !openFiles.some(f => f._model === oldModel)) oldModel.dispose();
    file._model = model;

    const welcome = document.getElementById('editorWelcome');
    if (welcome) welcome.style.display = 'none';
  }

  renderEditorTabs();
  updateFileExplorerActive();
}

function closeEditorTab(idx, e) {
  if (e) e.stopPropagation();
  if (idx < 0 || idx >= openFiles.length) return;

  const file = openFiles[idx];
  if (file.modified) {
    if (!confirm('Unsaved changes in ' + file.path.split('/').pop() + '. Discard?')) return;
  }
  if (file._model) file._model.dispose();
  openFiles.splice(idx, 1);

  if (openFiles.length === 0) {
    activeFileIdx = -1;
    if (monacoEditor) monacoEditor.setValue('');
    const welcome = document.getElementById('editorWelcome');
    if (welcome) welcome.style.display = '';
  } else {
    const newIdx = Math.min(idx, openFiles.length - 1);
    activateEditorTab(newIdx);
  }
  renderEditorTabs();
}

function renderEditorTabs() {
  const container = document.getElementById('editorTabs');
  const empty = document.getElementById('editorTabEmpty');
  if (!openFiles.length) {
    container.innerHTML = '';
    container.appendChild(empty || document.createElement('div'));
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  let h = '';
  for (let i = 0; i < openFiles.length; i++) {
    const f = openFiles[i];
    const name = f.path.split('/').pop();
    const cls = i === activeFileIdx ? ' active' : '';
    h += '<div class="editor-tab' + cls + '" onclick="activateEditorTab(' + i + ')">';
    h += esc(name);
    if (f.modified) h += '<span class="et-modified">&#9679;</span>';
    h += '<span class="et-close" onclick="closeEditorTab(' + i + ',event)">&#215;</span>';
    h += '</div>';
  }
  container.innerHTML = h;
}

async function saveCurrentFile() {
  if (activeFileIdx < 0 || !openFiles[activeFileIdx] || !currentProject) return;
  const file = openFiles[activeFileIdx];
  const content = monacoEditor ? monacoEditor.getValue() : file.content;

  try {
    const r = await fetch('/api/projects/' + encodeURIComponent(currentProject.id) + '/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: file.path, content: content }),
    });
    const data = await r.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    file.content = content;
    file.modified = false;
    renderEditorTabs();
    showToast('Saved ' + file.path.split('/').pop(), 'success');
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  }
}

// ===== FILE EXPLORER =====
let fileExplorerLoaded = false;
let fileTree = [];

async function loadFileExplorer() {
  if (!currentProject) return;
  fileExplorerLoaded = true;
  const feTree = document.getElementById('feTree');
  feTree.innerHTML = '<div style="padding:12px"><span class="spinner"></span></div>';

  try {
    const r = await fetch('/api/projects/' + encodeURIComponent(currentProject.id) + '/files');
    const data = await r.json();
    if (data.error) { feTree.innerHTML = '<div style="padding:12px;color:var(--fg3);font-size:12px">' + esc(data.error) + '</div>'; return; }
    fileTree = data.files || [];
    renderFileTree();
  } catch (err) {
    feTree.innerHTML = '<div style="padding:12px;color:var(--red);font-size:12px">' + esc(err.message) + '</div>';
  }
}

function refreshFileExplorer() {
  fileExplorerLoaded = false;
  loadFileExplorer();
}

function renderFileTree() {
  const container = document.getElementById('feTree');
  if (!fileTree.length) {
    container.innerHTML = '<div style="padding:12px;color:var(--fg3);font-size:12px">No files found. Scaffold the project first.</div>';
    return;
  }

  // Build a nested tree from flat file paths
  const root = { children: {}, name: '' };
  for (const f of fileTree) {
    const parts = f.split('/').filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      if (!node.children[parts[i]]) {
        node.children[parts[i]] = { name: parts[i], children: {}, isFile: i === parts.length - 1, path: parts.slice(0, i + 1).join('/') };
      }
      node = node.children[parts[i]];
    }
  }

  function renderNode(node, depth) {
    const entries = Object.values(node.children).sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    let h = '';
    for (const entry of entries) {
      const indent = depth * 14;
      if (entry.isFile) {
        const ext = entry.name.split('.').pop().toLowerCase();
        const iconMap = { js: '&#9998;', mjs: '&#9998;', ts: '&#x1D4AF;', json: '{}', yaml: '&#9776;', yml: '&#9776;', md: '&#9998;', html: '&lt;&gt;', css: '#', py: '&#x1D6B1;' };
        const icon = iconMap[ext] || '&#128196;';
        h += '<div class="fe-item" style="padding-left:' + (12 + indent) + 'px" onclick="openFileInEditor(\'' + esc(entry.path).replace(/'/g, "\'") + '\')" data-path="' + esc(entry.path) + '">';
        h += '<span class="fe-icon">' + icon + '</span>';
        h += '<span class="fe-name">' + esc(entry.name) + '</span>';
        h += '</div>';
      } else {
        h += '<div class="fe-item fe-dir" style="padding-left:' + (12 + indent) + 'px" onclick="toggleFeDir(this)">';
        h += '<span class="fe-icon">&#128193;</span>';
        h += '<span class="fe-name">' + esc(entry.name) + '</span>';
        h += '</div>';
        h += '<div class="fe-dir-content">' + renderNode(entry, depth + 1) + '</div>';
      }
    }
    return h;
  }

  container.innerHTML = renderNode(root, 0);
}

function toggleFeDir(el) {
  const content = el.nextElementSibling;
  if (content && content.classList.contains('fe-dir-content')) {
    content.style.display = content.style.display === 'none' ? '' : 'none';
    el.querySelector('.fe-icon').innerHTML = content.style.display === 'none' ? '&#128193;' : '&#128194;';
  }
}

function updateFileExplorerActive() {
  document.querySelectorAll('.fe-item').forEach(el => {
    el.classList.toggle('active', activeFileIdx >= 0 && openFiles[activeFileIdx] && el.dataset.path === openFiles[activeFileIdx].path);
  });
}

// ===== TERMINAL =====
let terminalCollapsed = false;

function toggleTerminal() {
  const area = document.getElementById('terminalArea');
  terminalCollapsed = !terminalCollapsed;
  area.classList.toggle('collapsed', terminalCollapsed);
  document.getElementById('termToggleBtn').innerHTML = terminalCollapsed ? '&#9650;' : '&#9660;';
}

function clearTerminal() {
  document.getElementById('terminalOutput').innerHTML = '';
}

async function runTerminalCmd() {
  const input = document.getElementById('terminalInput');
  const cmd = input.value.trim();
  if (!cmd || !currentProject) return;
  input.value = '';

  const output = document.getElementById('terminalOutput');
  output.innerHTML += '<div class="term-line term-cmd">$ ' + esc(cmd) + '</div>';
  output.scrollTop = output.scrollHeight;

  try {
    const r = await fetch('/api/projects/' + encodeURIComponent(currentProject.id) + '/terminal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd }),
    });
    const data = await r.json();
    if (data.error) {
      output.innerHTML += '<div class="term-line term-err">' + esc(data.error) + '</div>';
    } else {
      if (data.stdout) output.innerHTML += '<div class="term-line">' + esc(data.stdout) + '</div>';
      if (data.stderr) output.innerHTML += '<div class="term-line term-err">' + esc(data.stderr) + '</div>';
      if (data.exitCode === 0 && !data.stdout && !data.stderr) output.innerHTML += '<div class="term-line term-ok">Done</div>';
    }
  } catch (err) {
    output.innerHTML += '<div class="term-line term-err">Error: ' + esc(err.message) + '</div>';
  }
  output.scrollTop = output.scrollHeight;
}

// Terminal: enter to run
document.getElementById('terminalInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); runTerminalCmd(); }
});

// ===== DEPLOY TAB =====
function renderDeployTab() {
  if (!currentProject) return;
  const pid = currentProject.id;

  const buildActions = document.getElementById('deployBuildActions');
  buildActions.innerHTML =
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployScaffoldTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployScaffoldDesc')) + '</div>' +
      '<button class="btn sm pri" onclick="doScaffold(\'' + esc(pid) + '\')">' + esc(t('deployScaffoldBtn')) + '</button>' +
    '</div>' +
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployCodegenTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployCodegenDesc')) + '</div>' +
      '<button class="btn sm" onclick="doCodegen(\'' + esc(pid) + '\')">' + esc(t('deployCodegenBtn')) + '</button>' +
    '</div>' +
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployBuildDeployTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployBuildDeployDesc')) + '</div>' +
      '<button class="btn sm gold" onclick="doAppBuildDeploy(\'' + esc(pid) + '\')">' + esc(t('deployBuildDeployBtn')) + '</button>' +
    '</div>';

  const storeActions = document.getElementById('deployStoreActions');
  storeActions.innerHTML =
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployGPlayTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployGPlayDesc')) + '</div>' +
      '<button class="btn sm" onclick="doStoreConfigure(\'' + esc(pid) + '\',\'android\')">' + esc(t('deployConfigureBtn')) + '</button>' +
      '<button class="btn sm pri" onclick="doStoreBuild(\'' + esc(pid) + '\')">' + esc(t('deployBuildAAB')) + '</button>' +
      '<button class="btn sm gold" onclick="doStoreUpload(\'' + esc(pid) + '\')">' + esc(t('deployUploadBtn')) + '</button>' +
    '</div>' +
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployCICDTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployCICDDesc')) + '</div>' +
      '<button class="btn sm" onclick="doStoreGHActions(\'' + esc(pid) + '\')">' + esc(t('deploySetupActions')) + '</button>' +
    '</div>';

  const ghActions = document.getElementById('deployGithubActions');
  const gh = currentProject.github || {};
  ghActions.innerHTML =
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployExportTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployExportDesc')) + '</div>' +
      '<button class="btn sm" onclick="doGitHubExport(\'' + esc(pid) + '\')">' + esc(t('deployExportBtn')) + '</button>' +
    '</div>' +
    '<div class="deploy-card">' +
      '<div class="deploy-card-title">' + esc(t('deployPushTitle')) + '</div>' +
      '<div class="deploy-card-desc">' + esc(t('deployPushDesc')) + '</div>' +
      '<button class="btn sm gold" id="btnGhPush" onclick="doGitHubPush(\'' + esc(pid) + '\')">' + esc(t('deployPushBtn')) + '</button>' +
    '</div>' +
    '<div class="deploy-card" id="ghRepoStatusCard">' +
      '<div class="deploy-card-title">' + esc(t('ghRepoStatus')) + '</div>' +
      '<div id="ghRepoStatusContent"><span class="spinner"></span></div>' +
    '</div>';
  loadGitHubRepoStatus(pid);
}

async function loadGitHubRepoStatus(pid) {
  const el = document.getElementById('ghRepoStatusContent');
  if (!el) return;
  if (!githubConnected) { el.textContent = t('ghRepoNoConfig'); return; }
  try {
    const r = await fetch('/api/projects/' + encodeURIComponent(pid) + '/github/status');
    const data = await r.json();
    if (data.error) { el.textContent = data.error; return; }
    let h = '';
    if (data.commits && data.commits.length) {
      h += '<div style="margin-bottom:8px;font-size:11px;font-weight:600;color:var(--fg2)">' + esc(t('ghRepoCommits')) + '</div>';
      for (const c of data.commits) {
        h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:4px">' +
          '<span style="color:var(--accent);font-family:var(--mono)">' + esc(c.sha) + '</span> ' +
          esc(c.message.slice(0, 60)) +
          '<span style="opacity:.5;margin-left:4px">' + esc(c.author) + '</span></div>';
      }
    }
    if (data.branches && data.branches.length) {
      h += '<div style="margin-top:8px;margin-bottom:4px;font-size:11px;font-weight:600;color:var(--fg2)">' + esc(t('ghRepoBranches')) + '</div>';
      h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
      for (const b of data.branches) {
        h += '<span style="font-size:10px;padding:2px 6px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--fg3)">' + esc(b) + '</span>';
      }
      h += '</div>';
    }
    if (data.actions && data.actions.length) {
      h += '<div style="margin-top:8px;margin-bottom:4px;font-size:11px;font-weight:600;color:var(--fg2)">' + esc(t('ghRepoActions')) + '</div>';
      for (const a of data.actions) {
        const color = a.conclusion === 'success' ? 'var(--green)' : a.conclusion === 'failure' ? 'var(--red)' : 'var(--fg3)';
        h += '<div style="font-size:11px;color:' + color + '">' + esc(a.name) + ' — ' + esc(a.conclusion || a.status) + '</div>';
      }
    }
    if (!h) h = '<span style="font-size:11px;color:var(--fg3)">' + esc(t('ghRepoNone')) + '</span>';
    el.innerHTML = h;
  } catch { el.textContent = t('ghRepoNone'); }
}

// ===== MONITOR TAB =====
function renderMonitorTab() {
  if (!currentProject) return;
  const pid = currentProject.id;

  const appStatus = document.getElementById('monitorAppStatus');
  const isRunning = currentProject.hasApp;
  appStatus.innerHTML =
    '<div class="monitor-card">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
        '<span class="status-dot ' + (isRunning ? 'running' : 'stopped') + '"></span>' +
        '<span style="font-weight:600;color:var(--fg)">' + esc(isRunning ? t('monitorRunning') : t('monitorNotRunning')) + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn sm pri" onclick="doAppStart(\'' + esc(pid) + '\')">' + esc(isRunning ? t('monitorRestart') : t('monitorStart')) + '</button>' +
        (isRunning ? '<button class="btn sm danger" onclick="doAppStop(\'' + esc(pid) + '\')">' + esc(t('monitorStop')) + '</button>' : '') +
      '</div>' +
    '</div>';

  const feedback = document.getElementById('monitorFeedback');
  feedback.innerHTML =
    '<div class="monitor-card">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<span style="font-weight:600;color:var(--fg)">' + esc(t('monitorUserFeedback')) + '</span>' +
        '<button class="btn sm" onclick="openFeedbackModal(\'' + esc(pid) + '\')">' + esc(t('monitorAddFeedback')) + '</button>' +
      '</div>' +
      '<div id="monitorFbkList"><span class="spinner"></span></div>' +
    '</div>';
  loadFeedbackList(pid);

  const validation = document.getElementById('monitorValidation');
  validation.innerHTML =
    '<div class="monitor-card">' +
      '<div style="margin-bottom:8px;font-weight:600;color:var(--fg)">' + esc(t('monitorReqHealth')) + '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn sm" onclick="doValidate()">' + esc(t('monitorRunValidation')) + '</button>' +
        '<button class="btn sm" onclick="doRunTests(\'' + esc(pid) + '\')">' + esc(t('monitorRunTests')) + '</button>' +
      '</div>' +
    '</div>';
}

// ===== CHAT FAB =====
function toggleChatFab() {
  const panel = document.getElementById('chatPanel');
  if (panel.classList.contains('open')) {
    closeChat();
  } else {
    // Open a general chat or context-aware chat
    if (currentProject) {
      openChat(currentProject.id, currentProject.bcTitle || currentProject.name || currentProject.id);
    } else {
      openChat('new', 'General');
    }
  }
}

function updateChatFabDot() {
  const dot = document.getElementById('chatFabDot');
  if (!dot) return;
  dot.className = 'chat-fab-dot';
  if (githubConnected) {
    dot.classList.add('connected');
  } else if (!chatLLMConfigured) {
    dot.classList.add('needs-setup');
  }
}

// ===== COMMAND PALETTE =====
let cmdPaletteItems = [];
let cmdActiveIdx = 0;

function openCmdPalette() {
  const cp = document.getElementById('cmdPalette');
  cp.style.display = '';
  const input = document.getElementById('cmdInput');
  input.value = '';
  input.focus();
  cmdActiveIdx = 0;
  buildCmdItems();
  renderCmdResults('');
}

function closeCmdPalette() {
  document.getElementById('cmdPalette').style.display = 'none';
}

function buildCmdItems() {
  cmdPaletteItems = [];
  // Projects
  const projects = window.__projectsCache || [];
  for (const p of projects) {
    cmdPaletteItems.push({
      label: p.name + ' (' + p.id + ')',
      type: t('projects'),
      icon: '\u25C6',
      action: function() { closeCmdPalette(); openProject(p.id); }
    });
  }
  // Actions
  cmdPaletteItems.push({ label: t('newProject'), type: 'Action', icon: '+', action: function() { closeCmdPalette(); openCreateModal(); } });
  cmdPaletteItems.push({ label: t('import'), type: 'Action', icon: '\u2193', action: function() { closeCmdPalette(); openImportModal(); } });
  cmdPaletteItems.push({ label: 'AI Chat', type: 'Action', icon: '\u2709', action: function() { closeCmdPalette(); toggleChatFab(); } });
  cmdPaletteItems.push({ label: 'GitHub Setup', type: 'Action', icon: '\u2699', action: function() { closeCmdPalette(); openGitHubSetup(); } });
  cmdPaletteItems.push({ label: 'Mobile PWA', type: 'Action', icon: '\u260E', action: function() { closeCmdPalette(); window.open('/mobile','_blank'); } });
  if (currentProject) {
    cmdPaletteItems.push({ label: t('validate'), type: 'Project', icon: '\u2713', action: function() { closeCmdPalette(); doValidate(); } });
    cmdPaletteItems.push({ label: t('refresh'), type: 'Project', icon: '\u21BB', action: function() { closeCmdPalette(); doRefresh(); } });
    cmdPaletteItems.push({ label: 'Plan', type: 'Tab', icon: '\u2637', action: function() { closeCmdPalette(); switchTab('plan'); } });
    cmdPaletteItems.push({ label: 'Develop', type: 'Tab', icon: '\u2702', action: function() { closeCmdPalette(); switchTab('develop'); } });
    cmdPaletteItems.push({ label: 'Deploy', type: 'Tab', icon: '\u2B06', action: function() { closeCmdPalette(); switchTab('deploy'); } });
    cmdPaletteItems.push({ label: 'Monitor', type: 'Tab', icon: '\u25CB', action: function() { closeCmdPalette(); switchTab('monitor'); } });
  }
}

function filterCmdPalette(query) {
  cmdActiveIdx = 0;
  renderCmdResults(query);
}

function renderCmdResults(query) {
  const el = document.getElementById('cmdResults');
  const q = query.toLowerCase().trim();
  const filtered = q ? cmdPaletteItems.filter(function(it) { return it.label.toLowerCase().includes(q) || it.type.toLowerCase().includes(q); }) : cmdPaletteItems;
  let h = '';
  for (var i = 0; i < filtered.length; i++) {
    var it = filtered[i];
    h += '<div class="cmd-item' + (i === cmdActiveIdx ? ' active' : '') + '" data-idx="' + i + '" onclick="executeCmdItem(' + i + ')" onmouseenter="cmdActiveIdx=' + i + '">';
    h += '<span class="cmd-item-icon">' + it.icon + '</span>';
    h += '<span class="cmd-item-label">' + esc(it.label) + '</span>';
    h += '<span class="cmd-item-type">' + esc(it.type) + '</span>';
    h += '</div>';
  }
  if (!filtered.length) {
    h = '<div class="cmd-item" style="color:var(--fg3);justify-content:center">' + t('noResults') + '</div>';
  }
  el.innerHTML = h;
  el._filtered = filtered;
}

function cmdKeydown(e) {
  var items = document.getElementById('cmdResults')._filtered || [];
  if (e.key === 'Escape') { closeCmdPalette(); e.preventDefault(); return; }
  if (e.key === 'ArrowDown') { cmdActiveIdx = Math.min(cmdActiveIdx + 1, items.length - 1); renderCmdResults(document.getElementById('cmdInput').value); e.preventDefault(); return; }
  if (e.key === 'ArrowUp') { cmdActiveIdx = Math.max(cmdActiveIdx - 1, 0); renderCmdResults(document.getElementById('cmdInput').value); e.preventDefault(); return; }
  if (e.key === 'Enter' && items.length) { executeCmdItem(cmdActiveIdx); e.preventDefault(); }
}

function executeCmdItem(idx) {
  var items = document.getElementById('cmdResults')._filtered || [];
  if (items[idx] && items[idx].action) items[idx].action();
}

// Global keyboard shortcut
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    var cp = document.getElementById('cmdPalette');
    if (cp.style.display === 'none') openCmdPalette(); else closeCmdPalette();
  }
  if (e.key === 'Escape' && document.getElementById('cmdPalette').style.display !== 'none') {
    closeCmdPalette();
  }
});

// ===== ACTIVITY FEED =====
function buildActivityFeed(projects) {
  var feed = document.getElementById('activityFeed');
  if (!feed) return;
  var items = [];
  for (var p of projects) {
    var lc = p.lifecycle || 'planning';
    var lcColors = { planning: 'var(--fg3)', ready: 'var(--green)', building: 'var(--yellow)', built: 'var(--accent)', running: 'var(--green)', deployed: 'var(--purple)' };
    items.push({ text: '<strong>' + esc(p.name) + '</strong> — ' + lifecycleLabel(lc), color: lcColors[lc] || 'var(--fg3)', time: '', project: p.id });
    if (p.stats) {
      var s = p.stats;
      if (s['business-case']) items.push({ text: esc(p.name) + ': ' + s.solutions + ' ' + t('statSOL') + ', ' + (s['user-stories']||0) + ' ' + t('statUS'), color: 'var(--accent)', time: '', project: p.id });
    }
    if (p.hasApp && p.appRunning) {
      items.push({ text: esc(p.name) + ' ' + t('running') + ' :' + (p.appPort||'?'), color: 'var(--green)', time: '', project: p.id });
    }
  }
  var h = '';
  for (var i = 0; i < Math.min(items.length, 12); i++) {
    var it = items[i];
    h += '<div class="activity-item" onclick="openProject(\'' + esc(it.project) + '\')">';
    h += '<span class="activity-dot" style="background:' + it.color + '"></span>';
    h += '<span class="activity-text">' + it.text + '</span>';
    if (it.time) h += '<span class="activity-time">' + esc(it.time) + '</span>';
    h += '</div>';
  }
  if (!h) h = '<div style="color:var(--fg3);font-size:12px;text-align:center;padding:24px">' + t('noActivity') + '</div>';
  feed.innerHTML = h;
}

// ===== CONVERSATION HISTORY =====
async function loadConversationHistory() {
  if (!currentProject) return;
  try {
    var convs = await (await fetch('/api/projects/' + currentProject.id + '/conversations')).json();
    if (!Array.isArray(convs) || !convs.length) {
      showToast(t('noConversations'), 'info');
      return;
    }
    var h = '<div class="chat-history-list">';
    for (var c of convs) {
      h += '<div class="chat-history-item" onclick="reopenConversation(\'' + esc(c.id || c.file || '') + '\')">';
      h += '<div class="chi-title">' + esc(c.title || c.id || 'Untitled') + '</div>';
      if (c.date) h += '<div class="chi-date">' + esc(c.date) + '</div>';
      h += '</div>';
    }
    h += '</div>';
    document.getElementById('chatMessages').innerHTML = h;
  } catch(e) {
    showToast(t('error') + ': ' + e.message, 'error');
  }
}

async function reopenConversation(convId) {
  if (!currentProject || !convId) return;
  try {
    var conv = await (await fetch('/api/projects/' + currentProject.id + '/conversations/' + encodeURIComponent(convId))).json();
    if (conv.error) { showToast(conv.error, 'error'); return; }
    chatMessages = conv.messages || [];
    chatContext = { relatedTo: conv.relatedTo || currentProject.id, title: conv.title || 'Conversation' };
    renderChatMessages();
  } catch(e) {
    showToast(t('error') + ': ' + e.message, 'error');
  }
}

init();