# Metaketten-Framework v2.0

> **LLM-Instruction-Set** — Dieses Dokument ist als strukturierte Anweisung formuliert, damit ein LLM (Claude, GPT, etc.) jeden Schritt der Requirements-Engineering-Pipeline autonom ausführen kann. Menschliche Leser finden eine vereinfachte Darstellung in `METAKETTEN_GUIDE.md`.

---

## 0. Präambel

### 0.1 Identität & Zweck

Das **Metaketten-Framework** ist ein mehrstufiges Requirements-Engineering-Verfahren, das Software-Anforderungen von der ersten Idee bis zur Deployment-Freigabe führt — mit lückenloser Kausalitätskette. Jede Zeile Code ist rückverfolgbar auf ein Requirement; jedes Requirement ist verifiziert gegen Konsistenz, Vollständigkeit und Widerspruchsfreiheit.

**Kern-Invariante**: Kein Artefakt passiert ein Gate ohne Verifikation. Kein Gate wird übersprungen. Kein Requirement bleibt ohne Nachverfolgung.

### 0.2 Wissenschaftliche Grundlagen

Das Framework stützt sich auf folgende etablierte Methoden:

| Methode | Referenz | Anwendung im Framework |
|---------|----------|----------------------|
| Hoare-Logik | Hoare, C.A.R. (1969): "An Axiomatic Basis for Computer Programming" | Pre-/Post-Conditions für Functions (Phase 4) |
| Design by Contract | Meyer, B. (1992): "Applying Design by Contract", IEEE Computer | Vertragsdefinition zwischen Artefakt-Ebenen (Phase 2) |
| Formale Programmverifikation | Dijkstra, E.W. (1976): "A Discipline of Programming" | Terminierungsgarantien, Verifikationsarchitektur |
| Requirements Engineering | IEEE 830-1998 / ISO/IEC/IEEE 29148:2018 | Anforderungsstruktur, Qualitätskriterien |
| Domain-Driven Design | Evans, E. (2003): "Domain-Driven Design" | Bounded Contexts, Aggregate Roots (Phase 3) |
| Behavior-Driven Development | North, D. (2006): "Introducing BDD" | Gherkin-Spezifikation (Phase 2) |
| Formale Methoden (Tools) | Lamport, L.: TLA+; Jackson, D.: Alloy (MIT) | Inspiration für Constraint-Prüfung (Phase 2) |

### 0.3 Leitprinzipien

1. **Pragmatismus vor Perfektion** — Adaptive Tiefe: Nur so viel Verifikation wie das Risiko verlangt (Critical/High/Medium/Low).
2. **Terminierung** — Maximale Rekursionstiefe: 3 Verifikationsebenen. Probabilistischer Cut-off bei Konfidenz > 95%.
3. **Human-in-the-Loop** — Eskalationskriterien definiert. Mensch entscheidet bei Ambiguität, nicht die Maschine.
4. **Lückenlose Kausalkette** — Jedes Artefakt hat einen Vorgänger (parent) und eine Verifikation (gate).
5. **Messbarkeit** — Jeder Schritt produziert quantifizierbare Metriken (Konfidenz-Score, Validierungsergebnis, Drift-Report).

### 0.4 Dokumentstruktur

```
Phase 0:  Initialisierung          — Systemstart, Metamodell laden, Baseline setzen
Phase 1:  Semantische Dekonstruktion — Wissensextraktion, Ambiguity Resolution, Probing
Phase 2:  Formale Spezifikation     — Gherkin, Contracts, Constraint-Prüfung
Phase 3:  Architektur-Dekomposition — Hierarchie BC>SOL>US>CMP>FN, DDD, ADR
Phase 4:  Code-Synthese             — Funktionsspezifikation, Generierung, Verifikation
Phase 5:  Infrastruktur             — Security, Observability, IaC
Phase 6:  UI & Interaction Design   — Model-Driven UI, Design Tokens, Accessibility
Phase 7:  Evolutionary Alignment    — Baseline, Drift, Traceability, Impact Analysis
Phase 8:  QA & Compliance           — Regulatorik, Living Docs, KPIs
Phase 9:  Economic Viability        — ROI, MVP-Extraktion, Technical Debt   [ROADMAP]
Phase 10: Organizational Readiness  — Skill Gap, Change Management          [ROADMAP]
```

Querschnitt: **Verifikationsarchitektur** (6-Level-Modell), **Gate-Engine** (G0–G6), **Agenten-System** (5 Personas)

---

## 1. Phase 0: Initialisierung (System Bootstrap)

### 1.1 Zweck

Systemstart und Kalibrierung. Alle Konfigurationen werden geladen, die Projektstruktur wird initialisiert, und die Baseline wird für spätere Drift-Erkennung gesetzt.

### 1.2 Prozessschritte

#### 1.2.1 Metamodell laden

```
AKTION: Lade metamodel.yaml als Single Source of Truth.
PRÜFE:  Alle Entity-Definitionen vorhanden (BC, SOL, US, CMP, FN, CONV, INF, ADR, NTF, FBK).
PRÜFE:  Status-Workflow definiert (idea → draft → review → approved → implemented).
PRÜFE:  Validierungsregeln V-001 bis V-025 geladen.
PRÜFE:  Gate-Definitionen G0 bis G6 geladen.
FEHLER: Falls metamodel.yaml fehlt oder inkonsistent → ABBRUCH mit Fehlermeldung.
```

#### 1.2.2 Projekt-Konfiguration laden

```
AKTION: Lade project.yaml (Projekt-ID, Name, Typ, externe Pfade).
AKTION: Lade agents.yaml (5 Agenten-Personas mit Trigger-Patterns und Gate-Zuordnungen).
AKTION: Lade Prompt-Templates aus prompts/ (gap-analysis, socratic, devils-advocate, constraint, example, boundary).
PRÜFE:  Jeder in metamodel.yaml referenzierte Agent hat ein entsprechendes Prompt-Template.
FEHLER: Fehlende Konfiguration → Warnung, Fallback auf Template-Defaults.
```

#### 1.2.3 Projektstruktur initialisieren

```
AKTION: Erstelle requirements/ Verzeichnisbaum gemäß metamodel.yaml Entity-Definitionen.
         Verzeichnisse: solutions/, user-stories/, components/, functions/,
                        conversations/, infrastructure/, adrs/, notifications/, feedback/
AKTION: Erstelle .arqitekt/ Verzeichnis für Baseline-Speicherung.
PRÜFE:  Alle Verzeichnisse existieren und sind beschreibbar.
```

#### 1.2.4 Baseline setzen

```
AKTION: Führe Initial-Baseline durch.
         Für jedes existierende Artefakt: Berechne SHA-256 Hash über Tupel (id, title, status, parent).
         Hash wird auf 16 Zeichen gekürzt.
         Speichere in .arqitekt/baseline.json mit Zeitstempel.
ERGEBNIS: Referenzpunkt für spätere Drift-Erkennung (Phase 7).
```

#### 1.2.5 Terminierungsgarantien festlegen

```
PARAMETER:
  MAX_VERIFICATION_DEPTH: 3      # Maximal 3 Ebenen Meta-Verifikation pro Check
  CONFIDENCE_CUTOFF: 95           # Auto-Accept bei Konfidenz > 95%
  MAX_PROBING_QUESTIONS: 5        # Max. 5 Klärungsfragen pro Artefakt pro Runde
  MAX_GATE_RETRIES: 3             # Max. 3 Versuche ein Gate zu passieren, dann Eskalation
  HUMAN_DECISION_LIMIT: 7         # Max. 7 Eskalationen pro Tag/Person (Decision Fatigue Guard)

INVARIANTE: Kein Prozess läuft unbegrenzt. Jeder Schleifentyp hat einen definierten Abbruchpunkt.
```

### 1.3 Gate-Prüfung

Phase 0 hat kein formales Gate — die Prüfung besteht darin, dass alle Konfigurationen fehlerfrei geladen wurden. Erst Phase 1 aktiviert das Gate-System.

### 1.4 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| Metamodell laden | Implementiert | `pipeline.ts` → `loadGateDefinitions()` |
| Projekt-Konfiguration | Implementiert | `config.ts`, `projects.ts` |
| Verzeichnisstruktur | Implementiert | `scaffold.ts` |
| Baseline setzen | Implementiert | `baseline.ts` → `createBaseline()` |
| Terminierungsparameter | Teilweise | `probing.ts` limitiert auf 5 Fragen; Confidence-Cutoff in `pipeline.ts` |

---

## 2. Phase 1: Semantische Dekonstruktion (Die Wissensbasis)

### 2.1 Zweck

Aus unstrukturiertem Input (Ideen, Gespräche, Dokumente) wird eine strukturierte, eindeutige Wissensbasis extrahiert. Dies ist die Grundlage für alles Weitere — „Garbage In, Garbage Out" wird hier verhindert.

### 2.2 Prozessschritte

#### 2.2.1 Input-Ingestion & Sanitization

```
AKTION: Empfange Rohdaten vom Benutzer.
  FORMATE: Text (UTF-8), Markdown, YAML-Frontmatter, Freitext.
  
AKTION: Normalisiere den Input.
  - Unicode-NFC-Normalisierung (einheitliche Zeichenkodierung)
  - Whitespace-Bereinigung (Tabs → Spaces, trailing whitespace entfernen)
  - Spracherkennung: Identifiziere die Hauptsprache (DE/EN) und markiere Code-Switching
  - Fachsprachen-Detection: Kennzeichne domänenspezifischen Jargon (medizinisch, juristisch, technisch)
  
QUALITÄTSPRÜFUNG:
  - Ist der Input lang genug für eine sinnvolle Analyse? (Minimum: 50 Zeichen / 1 Satz)
  - Enthält der Input erkennbare Requirement-Strukturen? (Akteure, Aktionen, Objekte)
  - Adversarial-Input-Filter: Erkenne offensichtlich unsinnige oder manipulative Eingaben.
```

#### 2.2.2 Entity- & Relationsextraktion

```
AKTION: Extrahiere aus dem normalisierten Text die folgenden Entitäten:

  AKTEURE (Wer?):
    - Personen, Rollen, Systeme die handeln
    - Pattern: Subjekte von Aktivsätzen, Passiv-Agenten, explizite Rollenbezeichnungen
    - Beispiele: "Der Administrator", "Ein registrierter Nutzer", "Das Zahlungssystem"

  OBJEKTE (Was?):
    - Daten, Ressourcen, Artefakte auf die zugegriffen wird
    - Pattern: Direkte Objekte, Datenstrukturen, UI-Elemente
    - Beispiele: "Benutzerprofile", "Transaktionen", "Dashboard-Ansicht"

  AKTIONEN (Tut was?):
    - Verben die Systemverhalten beschreiben
    - Pattern: Verben mit technischem Kontext, CRUD-Operationen, Workflows
    - Beispiele: "erstellen", "validieren", "benachrichtigen", "exportieren"

  BEDINGUNGEN (Wann/Unter welchen Umständen?):
    - Vorbedingungen, Trigger, Kontextbeschränkungen
    - Pattern: "wenn", "falls", "sobald", "nur für", "vorausgesetzt"
    - Beispiele: "Wenn der Nutzer eingeloggt ist", "Falls die Zahlung fehlschlägt"

  QUALITÄTSMERKMALE (Wie gut?):
    - Nicht-funktionale Anforderungen im Text
    - Pattern: Performance ("< 200ms"), Sicherheit ("verschlüsselt"), Verfügbarkeit ("99.9%")

ERGEBNIS: Strukturierte Entitäts-Liste mit Quellverweis (welcher Satz, welches Wort).
```

#### 2.2.3 Ontological Grounding (Konzept-Verankerung)

```
AKTION: Mappe extrahierte Entitäten auf kontrolliertes Vokabular.

  PROZESS:
    1. Prüfe ob der extrahierte Term bereits im Projekt-Glossar existiert.
    2. Falls nein: Prüfe Synonyme ("User" = "Nutzer" = "Anwender").
    3. Falls Synonym gefunden: Normalisiere auf den kanonischen Term.
    4. Falls neuer Term: Füge zum Glossar hinzu mit Definition.

  DOMÄNEN-MAPPING:
    - Ordne Begriffe Domänen-Konzepten zu (z.B. "Login" → Authentication-Domain).
    - Erkenne Bounded-Context-Grenzen (Vorarbeit für Phase 3 DDD).

  KONSISTENZ-PRÜFUNG:
    - "Ontological Drift Watchdog": Vergleiche aktuelle Begriffsdefinitionen mit Projekt-Baseline.
    - Falls ein Term seine Bedeutung im Projektverlauf geändert hat → Warnung + Revalidierung.

ERGEBNIS: Normalisierte Wissensbasis mit konsistentem Vokabular.
```

#### 2.2.4 Ambiguity Resolution (Mehrdeutigkeitsauflösung)

```
AKTION: Klassifiziere jede erkannte Mehrdeutigkeit nach Typ.

TAXONOMIE der Mehrdeutigkeiten:

  TYP 1 — LEXIKALISCH:
    Definition: Ein Wort hat mehrere Bedeutungen.
    Beispiel: "Bank" (Finanzinstitut vs. Sitzgelegenheit)
    Auflösung: Kontextanalyse + Domänen-Einschränkung.
    Eskalation: Nur bei Domänen-übergreifenden Projekten.

  TYP 2 — SYNTAKTISCH:
    Definition: Die Satzstruktur erlaubt mehrere Lesarten.
    Beispiel: "Nutzer können Berichte von Mitarbeitern sehen"
              (Berichte, die Mitarbeiter erstellt haben? Oder Berichte über Mitarbeiter?)
    Auflösung: Umformulierung in eindeutige Satzstruktur.
    Eskalation: Probing-Agent (socratic) generiert Klärungsfrage.

  TYP 3 — SEMANTISCH:
    Definition: Die Bedeutung ist kontextabhängig unklar.
    Beispiel: "Das System muss schnell reagieren" (Was ist "schnell"? 100ms? 1s? 5s?)
    Auflösung: Quantifizierung erzwingen (konkrete Werte).
    Eskalation: Probing-Agent (constraint) fordert messbare Kriterien.

  TYP 4 — PRAGMATISCH:
    Definition: Die Absicht des Stakeholders ist unklar.
    Beispiel: "Es wäre schön, wenn..." (Must-Have oder Nice-to-Have?)
    Auflösung: Priorisierung klären (MoSCoW oder ähnlich).
    Eskalation: Probing-Agent (devils_advocate) hinterfragt die Priorität.

  TYP 5 — SCOPE:
    Definition: Die Systemgrenzen sind unklar.
    Beispiel: "Die Integration mit externen Systemen" (Welche? Wie viele? Welche APIs?)
    Auflösung: Bounded-Context-Definition erzwingen.
    Eskalation: Probing-Agent (boundary) klärt Grenzen.

VERFAHREN:
  FÜR JEDE extrahierte Aussage:
    1. Prüfe auf vage Begriffe (Vague-Word-Detection).
       Trigger-Wörter: "schnell", "viele", "gut", "einfach", "flexibel", "sicher",
                       "fast", "many", "good", "simple", "flexible", "secure"
    2. Klassifiziere den Mehrdeutigkeitstyp (1-5).
    3. Wende die typspezifische Auflösungsstrategie an.
    4. Falls automatische Auflösung möglich → Löse auf und dokumentiere.
    5. Falls nicht → Eskaliere an den zuständigen Probing-Agent.
    
ERGEBNIS: Bereinigter, eindeutiger Anforderungstext.
```

#### 2.2.5 Active Requirement Probing (ARP)

```
ZWECK: Gezielte Befragung des Stakeholders zur Beseitigung von Unschärfen.
        Das System fragt — der Mensch antwortet — das Requirement wird präziser.

AGENTEN-SYSTEM (5 Personas):

  SOCRATIC (Sokratischer Agent):
    Rolle: Reflektive Fragen, die zum Nachdenken anregen.
    Trigger: Phase 1 (Semantik), Phase 2 (Spezifikation).
    Gates: G0, G1.
    Stil: "Was genau meinen Sie mit...?", "Wer ist der primäre Nutzer von...?"
    Optionen: 2-4 Multiple-Choice-Antworten.
    Überspringbar: Ja (canSkip: true).

  DEVILS_ADVOCATE (Advocatus Diaboli):
    Rolle: Hinterfragt Annahmen, findet Schwachstellen.
    Trigger: Phase 3 (Architektur), Phase 4 (Code), Phase 5 (Infra).
    Gates: G3, G4, G5.
    Stil: "Was passiert, wenn 10.000 Nutzer gleichzeitig...?", "Und wenn der Service ausfällt?"
    Optionen: Extreme Szenarien mit konkreten Zahlen.
    Überspringbar: Nein (canSkip: false).

  CONSTRAINT (Constraint-Agent):
    Rolle: Prüft regulatorische, technische und geschäftliche Einschränkungen.
    Trigger: Phase 1 (Regulatorik), Phase 2 (Technik), Phase 5 (Compliance).
    Gates: G1, G2, G5.
    Stil: "DSGVO Art. 17 verlangt...", "Bei 1M Datensätzen braucht die DB..."
    Optionen: Referenziert spezifische Standards und Limits.
    Überspringbar: Nein (canSkip: false).

  EXAMPLE (Beispiel-Agent):
    Rolle: Generiert konkrete, testbare Beispiele.
    Trigger: Phase 0 (BC-Klarheit), Phase 2 (Akzeptanzkriterien).
    Gates: G0, G2.
    Stil: "Stellen Sie sich vor, ein Nutzer namens Anna will..." 
    Optionen: Teilweise vorausgefüllte Beispiele zum Vervollständigen.
    Überspringbar: Ja (canSkip: true).

  BOUNDARY (Grenzwert-Agent):
    Rolle: Findet Grenzwerte und Randbedingungen.
    Trigger: Phase 3 (Architektur-Grenzen), Phase 4 (Funktionsgrenzen).
    Gates: G3, G4, G5.
    Stil: "Was ist der Maximalwert für...?", "Was passiert bei null/leer/Timeout?"
    Optionen: min/max/zero/null/overflow/timeout Szenarien.
    Überspringbar: Nein (canSkip: false).

ARP-ABLAUF:

  SCHRITT 1 — Gap-Analyse:
    AKTION: Lade gap-analysis Prompt-Template.
    AKTION: Übergebe Artefakt-Kontext:
            - Artefakt-ID, Typ, Inhalt (erste 3000 Zeichen)
            - Gate-ID und Gate-Name
            - Parent-Artefakt (Titel, Typ)
            - Kinder-Zusammenfassung
            - Aktueller Konfidenz-Score
    ERGEBNIS: LLM generiert strukturierte Gap-Liste (max. 5 Gaps).
              Jeder Gap hat: description, severity, suggestedAgent, category.
    
  SCHRITT 2 — Zero-Noise-Probing (Fragen-Validierung):
    FÜR JEDEN generierten Gap:
      PRÜFE: "Erzeugt die Antwort auf eine Klärungsfrage zu diesem Gap 
              eine neue valide Information oder löst sie einen bestehenden Konflikt?"
      FALLS JA → Frage wird zugelassen.
      FALLS NEIN → Gap wird als "informational" markiert (keine Frage nötig).
    ZWECK: Verhindert Over-Probing — nur Fragen, die den Wissensgraph 
           deterministisch vervollständigen, werden gestellt.

  SCHRITT 3 — Fragegeneration:
    AKTION: Für zugelassene Gaps → Lade agentenspezifisches Prompt-Template.
    AKTION: Generiere Klärungsfrage mit:
            - 2-4 Multiple-Choice-Optionen
            - whyImportant: Warum ist diese Frage relevant?
            - estimatedImpact: Wie stark beeinflusst die Antwort den Konfidenz-Score?
            - canSkip: Darf die Frage übersprungen werden?

  SCHRITT 4 — Antwortverarbeitung:
    EMPFANGE: Benutzer-Antwort (ausgewählte Option oder Freitext).
    AKTION: Integriere die Antwort in das Artefakt.
            - Aktualisiere den Anforderungstext.
            - Berechne neuen Konfidenz-Score.
            - Markiere den Gap als resolved.
    FALLS Konfidenz >= 95% → Automatischer Abschluss des Probing.
    FALLS alle Fragen beantwortet → Weiter zu Gate-Prüfung.
    FALLS Max. 5 Fragen erreicht → Eskalation oder Abschluss.

  SCHRITT 5 — Konfidenz-Bewertung:
    BERECHNE 4-Dimensionen-Score:
      Structural  (30%): Vollständigkeit der Pflichtfelder, Sektionen, Hierarchietiefe.
      Semantic    (30%): Inhaltsqualität, Klarheit, Spezifität (LLM-evaluiert).
      Consistency (20%): Kreuzreferenzen, Namenskonventionen, Status-Alignment.
      Boundary    (20%): Scope-Definition, Edge Cases, Akzeptanzkriterien.
    
    GESAMTSCORE = (Structural × 0.30) + (Semantic × 0.30) + (Consistency × 0.20) + (Boundary × 0.20)
    
    ABZÜGE:
      - Vage Begriffe im Text: -5 Punkte pro vaghem Wort
      - Fehlende Überschriften: -10 Punkte wenn < 3 Überschriften
      - Kurzer Body (< 100 Zeichen): -15 Punkte
    
    ZUSCHLÄGE:
      - Strukturierte Überschriften (>= 3): +10 Punkte
      - Korrekte Status-Hierarchie: +5 Punkte
      - Edge-Case Keywords im Text: +5 Punkte

ERGEBNIS: Bereinigtes Artefakt mit:
  - Eindeutigem, normalisiertem Text
  - Gap-Analyse-Protokoll (welche Fragen gestellt, welche Antworten erhalten)
  - Konfidenz-Score (4D) als Frontmatter-Attribut
```

### 2.3 Gate G0: Idea → Business Case

```
GATE: G0_IDEA_TO_BC
TRANSITION: Idee → Business Case
RISIKO-LEVEL: Critical
AUTO-PASS-SCHWELLE: 95%

PFLICHT-CHECKS:
  G0-C1: BC muss existieren.                                          [Critical]
  G0-C2: BC muss einen aussagekräftigen Titel haben (> 5 Zeichen).    [High]
  G0-C3: BC muss mindestens Status "draft" haben.                     [High]
  V-009: BC muss WHO, WHAT, WHY, FOR WHOM beantworten.                [Critical]

ZUGEWIESENE AGENTEN: socratic, example

ENTSCHEIDUNGSLOGIK:
  FALLS ein Critical-Check fehlschlägt → Status: FAILED → Gate blockiert.
  FALLS alle Checks bestanden UND Konfidenz >= 95% → Status: PASSED → Weiter zu Phase 2.
  FALLS Checks bestanden ABER Konfidenz < 95% → Status: PENDING → Probing-Session starten.
  FALLS Gate 3x hintereinander FAILED → Eskalation an Human (HUMAN-CHECKPOINT).
```

### 2.4 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| Input-Sanitization | Nicht implementiert | LLM übernimmt implizit |
| Entity-Extraktion | Nicht implementiert | LLM übernimmt implizit |
| Ontological Grounding | Nicht implementiert | Geplant: Glossar-basiertes Mapping |
| Ambiguity Resolution | Teilweise | `confidence.ts` erkennt vague words, `probing.ts` stellt Klärungsfragen |
| Active Requirement Probing | Implementiert | `probing.ts` mit 5 Agenten, Gap-Analyse, Frage/Antwort-Zyklus |
| Konfidenz-Scoring (4D) | Implementiert | `confidence.ts` → structural/semantic/consistency/boundary (30/30/20/20) |
| Gate G0 | Implementiert | `pipeline.ts` → `checkG0()` mit 3 strukturellen Checks |
| V-009 (WHO/WHAT/WHY) | Implementiert | `validation.ts` → Regex-basierte Prüfung |

---

## 3. Phase 2: Formale Spezifikation (Das Regelwerk)

### 3.1 Zweck

Die in Phase 1 extrahierten Anforderungen werden in formale, prüfbare Spezifikationen übersetzt. Aus vagen Beschreibungen entstehen präzise Verträge: Gherkin-Szenarien für User Stories, Pre-/Post-Conditions für Funktionen, und Zustandsautomaten für Workflows.

### 3.2 Prozessschritte

#### 3.2.1 Gherkin-Synthese (Behavioral Specification)

```
AKTION: Für jede User Story → Generiere Gherkin-Akzeptanzkriterien.

TRANSFORMATION:
  INPUT:  Freitext-User-Story: "Als registrierter Nutzer möchte ich mein Passwort 
          ändern können, damit mein Konto sicher bleibt."
  
  OUTPUT: Strukturierte Gherkin-Szenarien:
          
    Szenario 1: Erfolgreiches Passwort-Ändern
      Given: Der Nutzer ist eingeloggt
      And:   Der Nutzer ist auf der Profil-Seite
      When:  Der Nutzer gibt das alte Passwort korrekt ein
      And:   Der Nutzer gibt ein neues Passwort ein (mind. 12 Zeichen, 1 Großbuchstabe, 1 Sonderzeichen)
      Then:  Das Passwort wird geändert
      And:   Der Nutzer erhält eine Bestätigungsmail
    
    Szenario 2: Falsches altes Passwort
      Given: Der Nutzer ist eingeloggt
      When:  Der Nutzer gibt das alte Passwort falsch ein
      Then:  Fehlermeldung: "Altes Passwort ist nicht korrekt"
      And:   Das Passwort bleibt unverändert

REGELN:
  - Jedes Szenario MUSS konkrete Werte enthalten (nicht "ein gültiges Passwort" → "mind. 12 Zeichen").
  - Jede User Story MUSS mindestens 1 Happy-Path und 1 Error-Path Szenario haben.
  - Gherkin-Szenarien werden als Seed für automatisierte Tests verwendet.

VALIDIERUNG:
  V-010: US muss Gherkin-kompatible Akzeptanzkriterien haben (Given/When/Then Pattern).
  V-021: US Akzeptanzkriterien müssen konkrete Werte in Given/When/Then enthalten (NEW).
         Beispiel FAIL: "Given: Der Nutzer hat ein Konto" (zu vage)
         Beispiel PASS: "Given: Der Nutzer 'Anna' hat ein aktives Konto seit 2024-01-15"
```

#### 3.2.2 Contract Definition (Pre-/Post-Conditions)

```
AKTION: Für jede Funktion → Definiere formale Verträge nach Design by Contract (Meyer 1992).

STRUKTUR:
  FUNCTION: <Funktionsname>
    PRE-CONDITIONS (Vorbedingungen):
      - Was MUSS gelten, bevor die Funktion aufgerufen wird?
      - Beispiel: "userId ist nicht null", "Nutzer hat Rolle 'admin'", "Balance >= Betrag"
    
    POST-CONDITIONS (Nachbedingungen):
      - Was MUSS gelten, nachdem die Funktion ausgeführt wurde?
      - Beispiel: "Neuer Eintrag existiert in DB", "E-Mail wurde versendet", "Balance = alte Balance - Betrag"
    
    INVARIANTEN:
      - Was MUSS während der gesamten Ausführung gelten?
      - Beispiel: "Gesamtsumme aller Konten bleibt konstant" (Buchhaltung)

BEISPIEL:
  FUNCTION: transferMoney(senderAccount, receiverAccount, amount)
    PRE:   senderAccount.balance >= amount
    PRE:   amount > 0
    PRE:   senderAccount.id != receiverAccount.id
    POST:  senderAccount.balance == OLD(senderAccount.balance) - amount
    POST:  receiverAccount.balance == OLD(receiverAccount.balance) + amount
    INV:   senderAccount.balance + receiverAccount.balance == CONST

VALIDIERUNG:
  V-022: FN Pre-/Post-Conditions müssen explizit angegeben sein (NEW).
         Jede Funktion benötigt mindestens 1 Pre-Condition und 1 Post-Condition.
```

#### 3.2.3 Temporal Logic (Zustandsautomaten)

```
AKTION: Für jeden Workflow → Identifiziere Zustandsübergänge und modelliere als Automat.

ANWENDUNG: Überall wo zeitliche Abfolgen existieren:
  - Bestellprozesse: created → paid → shipped → delivered → completed
  - Genehmigungsworkflows: submitted → reviewed → approved/rejected
  - Session-Management: anonymous → authenticated → active → expired

FORMALISIERUNG:
  STATES:     Endliche Menge von Zuständen {S1, S2, ..., Sn}
  TRANSITIONS: Übergänge mit Trigger und Guard-Condition
  INITIAL:    Startzustand
  FINAL:      Endzustand(e)

PRÜFUNGEN:
  - Erreichbarkeit: Jeder Zustand muss vom Startzustand erreichbar sein.
  - Keine Sackgassen: Von jedem nicht-finalen Zustand muss mindestens ein Übergang existieren.
  - Determinismus: Gleicher Zustand + gleicher Trigger = gleicher Folgezustand.

HINWEIS: Formal Methods Tools wie TLA+ (Lamport) oder Alloy (Jackson) können als externe 
         Prüfwerkzeuge eingesetzt werden — das Framework definiert die Spezifikation, 
         das Tool prüft sie.
```

#### 3.2.4 Constraint Satisfiability (Widerspruchserkennung)

```
AKTION: Prüfe die Gesamtmenge aller Spezifikationen auf logische Konsistenz.

VERFAHREN:
  1. Extrahiere alle expliziten Constraints aus:
     - Pre-/Post-Conditions (Phase 3.2.2)
     - Gherkin-Szenarien (Phase 3.2.1)
     - Infrastruktur-Anforderungen (INF-Artefakte)
     - Geschäftsregeln (BC-/SOL-Artefakte)
  
  2. Prüfe paarweise auf Widersprüche:
     - "Nur Admins dürfen löschen" vs. "Nutzer können eigene Beiträge löschen"
     - "Max. 100 Einträge pro Seite" vs. "Alle Ergebnisse auf einer Seite anzeigen"
     - "Daten werden nach 30 Tagen gelöscht" vs. "Vollständige Audit-Historie aufbewahren"
  
  3. Bei Widerspruch → SHOWSTOPPER-Protokoll:
     a) Identifiziere die exakten zwei Aussagen, die sich widersprechen.
     b) Zeige dem Benutzer beide Aussagen nebeneinander.
     c) Generiere 3 Auflösungsszenarien:
        1) Aussage A hat Vorrang (Aussage B wird angepasst)
        2) Aussage B hat Vorrang (Aussage A wird angepasst)
        3) Kompromiss (beide werden modifiziert)
     d) Benutzer wählt — Dokumentation als ADR (Architecture Decision Record).

ESCAPE-HATCH:
  Falls kein Widerspruch gelöst werden kann:
    - Partial Satisfiability: "80% der Anforderungen sind erfüllbar"
    - Die restlichen 20% werden als "Known Constraints" dokumentiert
    - Priorisierung zur manuellen Klärung durch Business Owner

VALIDIERUNG:
  V-023: Keine logischen Widersprüche zwischen Geschwister-FN-Spezifikationen (NEW).
```

### 3.3 Gate G1: Business Case → Solutions

```
GATE: G1_BC_TO_SOL
TRANSITION: Business Case → Solutions
RISIKO-LEVEL: High
AUTO-PASS-SCHWELLE: 90%

PFLICHT-CHECKS:
  G1-C1: Mindestens eine SOL existiert.                              [Critical]
  G1-C2: Keine doppelten SOL-Titel.                                  [Medium]
  G1-C3: Mindestens ein INF-Requirement existiert.                   [High]
  V-001: Jede SOL hat mindestens eine US (Voraussetzung).            [Critical]

ZUGEWIESENE AGENTEN: socratic, constraint
```

### 3.4 Gate G2: Solutions → User Stories

```
GATE: G2_SOL_TO_US
TRANSITION: Solutions → User Stories
RISIKO-LEVEL: High
AUTO-PASS-SCHWELLE: 90%

PFLICHT-CHECKS:
  G2-C1: Jede SOL hat mindestens eine US (V-001).                   [Critical]
  G2-C2: Jede US hat Akzeptanzkriterien (V-004).                    [High]
  G2-C3: Keine verwaisten Parent-Referenzen (V-007).                [Medium]
  V-010: US hat Gherkin-kompatible Akzeptanzkriterien.               [High]
  V-021: US Akzeptanzkriterien enthalten konkrete Werte.             [Medium]

ZUGEWIESENE AGENTEN: example, constraint
```

### 3.5 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| Gherkin-Prüfung (Pattern) | Implementiert | `validation.ts` → V-010 (Given/When/Then Regex) |
| Gherkin-Synthese (Auto-Generierung) | Nicht implementiert | Geplant: LLM-basierte Generierung |
| Pre-/Post-Conditions | Teilweise | G5 mandatoryCheck "All FN have pre/post conditions" (Text-Prüfung) |
| Temporal Logic / Zustandsautomaten | Nicht implementiert | Geplant |
| Constraint Satisfiability (Z3/SMT) | Nicht implementiert | Geplant: LLM-basierte Widerspruchserkennung |
| Gate G1 | Implementiert | `pipeline.ts` → `checkG1()` |
| Gate G2 | Implementiert | `pipeline.ts` → `checkG2()` |
| V-010 | Implementiert | `validation.ts` |
| V-021 (konkrete Werte) | Nicht implementiert | Neu — siehe metamodel.yaml Extension |
| V-022 (explizite Pre/Post) | Nicht implementiert | Neu — siehe metamodel.yaml Extension |
| V-023 (Widerspruchserkennung) | Nicht implementiert | Neu — siehe metamodel.yaml Extension |

---

## 4. Phase 3: Architektur-Dekomposition (Die Struktur)

### 4.1 Zweck

Die formalisierten Anforderungen werden in eine technische Architektur zerlegt. Dies folgt dem ARQITEKT-Metamodell: BC → SOL → US → CMP → FN. Domain-Driven Design (Evans 2003) liefert die konzeptionelle Grundlage.

### 4.2 Prozessschritte

#### 4.2.1 Domain Decomposition (Bounded Contexts)

```
AKTION: Identifiziere Domänengrenzen aus der Wissensbasis (Phase 1).

VERFAHREN (nach Evans 2003, DDD):
  1. Gruppiere verwandte Entitäten zu Bounded Contexts.
     - Ein Bounded Context = ein abgegrenzter Bedeutungsraum.
     - Beispiel: "Nutzer" im Auth-Context ≠ "Nutzer" im Billing-Context.
  
  2. Identifiziere Aggregate Roots.
     - Root-Entity, die die Konsistenz-Grenzen ihres Aggregats sichert.
     - Beispiel: "Order" ist Aggregate Root von {Order, OrderLine, Payment}.
  
  3. Definiere Context Maps.
     - Beziehungen zwischen Bounded Contexts:
       Shared Kernel, Customer-Supplier, Conformist, Anti-Corruption Layer, Open Host.

ERGEBNIS: Solutions (SOL) werden als Bounded Contexts interpretiert.
          Jede SOL repräsentiert einen Feature-Bereich mit klaren Grenzen.

HUMAN-CHECKPOINT:
  Wahl des Architekturstils → Microservices vs. Modular Monolith vs. Hybrid.
  Der Mensch entscheidet auf Basis der Team-Größe, Skalierungsanforderungen und Expertise.
```

#### 4.2.2 Hierarchie-Konstruktion (Metamodell)

```
AKTION: Konstruiere den Artefakt-Baum gemäß ARQITEKT-Metamodell.

HIERARCHIE:
  BC (Business Case) — 1 pro Projekt
    └── SOL (Solution) — Feature-Bereich / Bounded Context
         └── US (User Story) — Nutzerperspektive
              └── CMP (Component) — Technisches Modul
                   └── FN (Function) — Atomares Verhalten
                        └── CONV (Conversation) — Chatbot-Dialog [optional]

CROSS-CUTTING (ohne Parent-Child):
  INF (Infrastructure)     — Querschnittsanforderung (DSGVO, OWASP, i18n, Performance)
  ADR (Architecture Decision) — Architektur-Entscheidung mit Begründung und Alternativen
  NTF (Notification)       — Benachrichtigungskanal (Push, Email, SMS, In-App)
  FBK (Feedback)           — Benutzer-Feedback

REGELN:
  - Jede SOL hat mindestens eine US (V-001).
  - Jede US hat mindestens ein CMP (V-002).
  - Jedes CMP hat mindestens eine FN (V-003).
  - Kind-Status darf Eltern-Status nicht überschreiten (V-005).
  - Keine verwaisten Referenzen (V-007).
  - Keine doppelten Titel auf gleicher Ebene (V-011).

FRONTMATTER-STANDARD:
  Jedes Artefakt hat als YAML-Frontmatter:
    type:    <EntityType>
    id:      <Prefix>-<Nummer(n)>
    title:   <Aussagekräftiger Titel>
    status:  idea | draft | review | approved | implemented
    parent:  <Parent-ID> (leer bei BC und Cross-Cutting)
```

#### 4.2.3 API & Interface Design

```
AKTION: Für jedes CMP → Definiere die Schnittstellen.

PRINZIPIEN:
  - API-first: Die Schnittstelle wird vor der Implementierung definiert.
  - Contract-driven: Jede API hat einen Vertrag (Request/Response/Error).
  - Versionierung: Jede API hat eine Versionsnummer (v1, v2, ...).

ARTEFAKT-INTEGRATION:
  - Jede API-Schnittstelle wird als FN-Artefakt dokumentiert.
  - Input/Output/Error aus V-012 bilden den API-Vertrag.
  - OpenAPI/DTO-Mapping: Geplant als automatische Generierung aus FN-Spezifikationen.

ANTI-CORRUPTION LAYER (für Legacy-Integration):
  Falls externe Systeme angebunden werden:
    1. Definiere einen isolierenden Adapter (ACL).
    2. Transformiere unsaubere externe Daten in das saubere interne Domänenmodell.
    3. Isomorphismus-Test: Jedes Datum muss verlustfrei hin und zurück transformierbar sein.
    4. Interface-Isolation: Interne Domänenlogik darf nicht in den Adapter "lecken".
```

#### 4.2.4 Architecture Decision Records (ADR)

```
AKTION: Für jede signifikante Architektur-Entscheidung → Erstelle ein ADR-Artefakt.

ADR-STRUKTUR:
  - Kontext: Warum muss eine Entscheidung getroffen werden?
  - Entscheidung: Was wurde entschieden?
  - Alternativen: Welche Optionen wurden betrachtet und verworfen?
  - Konsequenzen: Was folgt aus der Entscheidung (positiv und negativ)?
  - Status: proposed → accepted → superseded

VALIDIERUNG:
  V-014: Jede SOL muss mindestens ein ADR referenzieren.
```

### 4.3 Gate G3: User Stories → Components

```
GATE: G3_US_TO_CMP
TRANSITION: User Stories → Components
RISIKO-LEVEL: Medium
AUTO-PASS-SCHWELLE: 85%

PFLICHT-CHECKS:
  G3-C1: Jede US hat mindestens ein CMP (V-002).                    [Critical]
  G3-C2: Keine doppelten CMP innerhalb derselben US.                 [Medium]

ZUGEWIESENE AGENTEN: devils_advocate, boundary
```

### 4.4 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| Metamodell-Hierarchie | Implementiert | `metamodel.yaml`, `tree.ts` → `buildTree()` |
| Bounded Context Detection | Nicht implementiert | Manuell durch @discover/@architect Agents |
| API Design (OpenAPI) | Nicht implementiert | Geplant |
| ADR-Integration | Implementiert | `metamodel.yaml` Entity + V-014 |
| Anti-Corruption Layer | Nicht implementiert | Konzept, keine Automation |
| Gate G3 | Implementiert | `pipeline.ts` → `checkG3()` |
| V-001, V-002, V-005, V-007, V-011, V-014 | Implementiert | `validation.ts` |

---

## 5. Phase 4: Code-Synthese (Die Fabrik)

### 5.1 Zweck

Die architektonisch zerlegten Anforderungen (CMP → FN) werden in implementierungsreife Spezifikationen überführt. Jede Funktion erhält eine vollständige Signatur mit Input, Output, Error und Boundary-Conditions — bereit für die Code-Generierung.

### 5.2 Prozessschritte

#### 5.2.1 Funktionsspezifikation

```
AKTION: Für jede FN → Erstelle eine vollständige Funktionsspezifikation.

PFLICHT-FELDER (V-012):
  INPUT:
    - Parameter mit Typen und Wertebereichen
    - Beispiel: "userId: string (UUID-Format, nicht leer)"
  
  OUTPUT:
    - Rückgabewert mit Typ und möglichen Werten
    - Beispiel: "UserProfile | null (falls Nutzer nicht existiert)"
  
  ERROR CASES:
    - Alle Fehlerszenarien mit Fehlercode und Nachricht
    - Beispiel: "404: User not found", "403: Insufficient permissions"

PFLICHT-FELDER (V-020):
  BOUNDARY CONDITIONS (mindestens 3 pro FN):
    - Minimum: Was passiert bei minimaler Eingabe? (leerer String, 0, null)
    - Maximum: Was passiert bei maximaler Eingabe? (max. Stringlänge, Integer.MAX, 10k Einträge)
    - Edge Case: Was passiert bei Grenzwerten? (Timeout, Race Condition, Concurrent Access)

PFLICHT-FELDER (V-022 — NEU):
  PRE-CONDITIONS:
    - Vorbedingungen die gelten müssen (aus Phase 2, Contract Definition)
  POST-CONDITIONS:
    - Nachbedingungen die nach Ausführung gelten

BEISPIEL:
  FUNCTION: getUserProfile
    INPUT:  userId: string (UUID, pflicht)
    PRE:    userId ist valide UUID; aufrufender Nutzer hat Leseberechtigung
    OUTPUT: UserProfile { name, email, avatarUrl, createdAt }
    POST:   Rückgabe enthält alle Pflichtfelder; lastAccessed wird aktualisiert
    ERROR:  404 (User not found), 403 (No permission), 500 (DB unreachable)
    BOUNDARY:
      - userId = "" → 400 Bad Request
      - userId = nicht-existente-UUID → 404
      - 1000 parallele Anfragen → Response < 200ms (Performance)
```

#### 5.2.2 Code-Generierungsstrategie

```
ANSATZ: Template-basiert + LLM-assistiert.

TEMPLATE-BASIERT:
  - Scaffold-Generierung: Projektstruktur aus Starter-Templates (Next.js, Flutter, Express).
  - Boilerplate: CRUD-Operationen, Auth-Middleware, Error-Handler.
  - Referenz: ARQITEKT ui-catalogue/templates/, template/starters/

LLM-ASSISTIERT:
  - Business-Logik: LLM generiert Code aus FN-Spezifikation.
  - Context: FN-Artefakt + Parent-CMP + Parent-US + BC-Kontext.
  - Constraint: Generierter Code MUSS alle Pre-/Post-Conditions erfüllen.

EXPLAINABILITY-LAYER:
  Jede generierte Code-Zeile soll verlinkbar sein zum auslösenden Requirement.
  Umsetzung: Code-Kommentare mit Artefakt-ID.
  Beispiel: "// REQ: FN-1.2.1.3 — getUserProfile"
```

#### 5.2.3 Automatisierte Verifikation

```
AKTION: Prüfe generierten Code gegen die Spezifikation.

VERIFIKATIONSSTUFEN:
  1. Statische Analyse:
     - TypeScript/Dart Compiler-Checks
     - Lint-Regeln (ESLint, Dart Analyzer)
  
  2. Unit-Test-Generierung:
     - Aus Gherkin-Szenarien (Phase 2) → automatische Testfälle
     - Aus Boundary-Conditions (Phase 4) → Edge-Case-Tests
  
  3. Mutation Testing (Konzept):
     - Füge absichtlich Fehler in den Code ein (Mutanten).
     - Prüfe ob die Testsuite die Mutanten erkennt.
     - Falls nicht → Testsuite ist unvollständig → Warnung.
  
  4. Coverage-Prüfung:
     - Jeder Logik-Zweig muss mindestens einmal getestet sein.
     - Ziel: Branch Coverage > 80%.
```

### 5.3 Gate G4: Components → Functions

```
GATE: G4_CMP_TO_FN
TRANSITION: Components → Functions
RISIKO-LEVEL: Medium
AUTO-PASS-SCHWELLE: 85%

PFLICHT-CHECKS:
  G4-C1: Jedes CMP hat mindestens eine FN (V-003).                  [Critical]
  V-012: Jede FN definiert Input, Output, Error Case.                [High]
  V-020: Jede FN hat >= 3 Boundary Conditions.                      [Medium]
  V-022: Jede FN hat explizite Pre-/Post-Conditions.                 [Medium]

ZUGEWIESENE AGENTEN: boundary, devils_advocate
```

### 5.4 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| FN Input/Output/Error (V-012) | Implementiert | `validation.ts` → Regex-basierte Prüfung |
| Boundary Conditions (V-020) | Implementiert | `validation.ts` → Edge-Case-Keyword-Counting |
| Pre-/Post-Conditions (V-022) | Nicht implementiert | Neu — metamodel.yaml Extension |
| Scaffold-Generierung | Implementiert | `scaffold.ts` (Next.js Struktur) |
| Mutation Testing | Nicht implementiert | Konzept |
| Test-Generierung aus Gherkin | Nicht implementiert | Geplant |
| Gate G4 | Implementiert | `pipeline.ts` → `checkG4()` |

---

## 6. Phase 5: Infrastruktur & Cross-Cutting Concerns (Das Skelett)

### 6.1 Zweck

Querschnittsanforderungen, die alle Phasen betreffen: Security, Datenschutz, Observability, und Infrastructure-as-Code. Diese werden als INF-Artefakte modelliert und constrainen die gesamte Architektur.

### 6.2 Prozessschritte

#### 6.2.1 Security Mapping

```
AKTION: Extrahiere und klassifiziere Sicherheitsanforderungen.

AUTOMATISCHES TAGGING:
  DSGVO (GDPR):
    - Personenbezogene Daten → Art. 5 (Datenminimierung)
    - Löschrecht → Art. 17 (Recht auf Vergessenwerden)
    - Einwilligung → Art. 7 (Consent Management)
    - Datenportabilität → Art. 20
    
  OWASP Top 10:
    - Injection → SQL/XSS/Command Injection Prevention
    - Broken Auth → Multi-Factor, Session Management
    - Sensitive Data Exposure → Encryption at Rest/Transit
    - XML External Entities → Parser Configuration
    - Broken Access Control → RBAC/ABAC
    - Security Misconfiguration → Hardened Defaults
    - XSS → Content Security Policy
    - Insecure Deserialization → Input Validation
    - Known Vulnerabilities → Dependency Scanning
    - Insufficient Logging → Audit Trail

VALIDIERUNG:
  V-013: Jedes INF-Artefakt muss DSGVO oder OWASP referenzieren.

ERGEBNIS: Jedes INF-Artefakt ist getaggt mit den relevanten Regulatorik-Referenzen.
```

#### 6.2.2 Observability

```
AKTION: Definiere Monitoring-, Logging- und Tracing-Anforderungen.

DREI SÄULEN:
  LOGS:
    - Structured Logging (JSON-Format)
    - Log-Level: ERROR, WARN, INFO, DEBUG
    - Sensitive Data Redaction (keine PII in Logs)
  
  METRICS:
    - Application Metrics (Request Rate, Error Rate, Duration)
    - Business Metrics (Conversion Rate, Active Users)
    - System Metrics (CPU, Memory, Disk)
  
  TRACES:
    - Distributed Tracing (OpenTelemetry)
    - Trace-ID Propagation über Service-Grenzen
    - Span-Annotationen für Business-Operationen
```

#### 6.2.3 Infrastructure-as-Code (IaC)

```
AKTION: Leite Infrastruktur-Anforderungen aus den technischen Artefakten ab.

ABLEITUNG:
  - CMP mit DB-Interaktion → Datenbank-Provisionierung (Schema, Instanzgröße)
  - CMP mit File-Upload → Object Storage (S3-kompatibel)
  - FN mit async Processing → Message Queue (RabbitMQ, SQS)
  - Hohe Verfügbarkeit → Load Balancer, Health Checks, Auto-Scaling
  
DEPLOYMENT-STRATEGIE:
  - Containerisierung: Docker-Images pro CMP/Service
  - Orchestrierung: Kubernetes oder Docker Compose (abhängig von Skalierung)
  - CI/CD: Pipeline-Definition aus Artefakt-Status-Workflow

VERFAHREN (Immutable Infrastructure Mirroring):
  Jede Infrastruktur-Änderung wird zuerst in einem digitalen Zwilling 
  (lokale Docker-Compose, Test-Cluster) validiert, bevor sie auf die 
  reale Infrastruktur angewendet wird.
```

### 6.3 Gate G5: Functions → Code

```
GATE: G5_FN_TO_CODE
TRANSITION: Functions → Code
RISIKO-LEVEL: Critical
AUTO-PASS-SCHWELLE: 95%

PFLICHT-CHECKS:
  G5-C1: Kind-Status überschreitet Eltern-Status nicht (V-005).     [Critical]
  G5-C2: Alle Eltern-Artefakte mindestens "approved".               [High]
  V-012: Jede FN definiert Input, Output, Error.                     [High]
  V-020: Jede FN hat >= 3 Edge Cases.                                [Medium]
  V-022: Jede FN hat Pre-/Post-Conditions.                           [High]
  V-023: Keine Widersprüche zwischen Geschwister-FNs.                [High]

ZUGEWIESENE AGENTEN: devils_advocate, constraint, boundary
```

### 6.4 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| V-013 (DSGVO/OWASP) | Implementiert | `validation.ts` → Regex-basierte Prüfung |
| V-008 (NTF Channel) | Implementiert | `validation.ts` |
| Security Auto-Tagging | Nicht implementiert | Geplant: LLM-basierte Klassifikation |
| Observability | Nicht implementiert | Konzept |
| IaC Generation | Nicht implementiert | Konzept |
| Gate G5 | Implementiert | `pipeline.ts` → `checkG5()` |

---

## 7. Phase 6: UI & Interaction Design (Die Schnittstelle)

### 7.1 Zweck

Model-Driven UI: Aus den Anforderungen (US, CMP, FN) wird eine UI-Spezifikation abgeleitet. Nicht jedes Requirement braucht ein UI — aber jedes user-facing Requirement MUSS eines haben.

### 7.2 Prozessschritte

#### 7.2.1 Model-Driven UI Mapping (MDUI)

```
AKTION: Für jede User Story mit user-facing Behavior → Leite UI-Spezifikation ab.

MAPPING:
  US "Als Nutzer möchte ich mein Profil bearbeiten"
    → SCREEN: ProfileEditScreen
    → COMPONENTS: [AvatarUpload, NameField, EmailField, SaveButton]
    → DATA-BINDING: UserProfile ↔ FormFields
    → NAVIGATION: Settings → ProfileEdit → Confirmation

VIEW-MODEL-MAPPING:
  Jedes UI-Element ist verknüpft mit:
    - Einer Backend-Funktion (FN) die Daten liefert/verarbeitet
    - Einem Datenmodell aus der CMP-Spezifikation
    - Einer Validierungsregel aus den Akzeptanzkriterien

VALIDIERUNG:
  V-024: Jede US mit user-facing Behavior muss mindestens ein UISpec-Artefakt haben (NEW).
  
ERGEBNIS: UISpec-Artefakte (Prefix: UI, Pattern: UI-{sol}.{us}.{n}).
```

#### 7.2.2 Design Token Integration

```
AKTION: Verknüpfe UI-Spezifikation mit Design System.

REFERENZ: ARQITEKT ui-catalogue:
  - tokens/colors.json     → Farbpalette
  - tokens/typography.json  → Schriftarten und -größen
  - tokens/spacing.json     → Abstände
  - tokens/radii.json       → Eckenradien
  - tokens/shadows.json     → Schatten

PRINZIP: UI-Pattern-Abstraction-Layer.
  Trennung von funktionaler Logik und visuellem Design mittels Design-Tokens.
  Gleiche Funktion → verschiedene Themes (Dark/Light, Brand A/Brand B).
```

#### 7.2.3 Accessibility

```
AKTION: Prüfe UI-Spezifikation gegen WCAG 2.1 AA Standard.

PRÜFPUNKTE:
  - Farbkontrast: Mindestens 4.5:1 (normal Text), 3:1 (large Text)
  - Tastaturnavigation: Alle interaktiven Elemente per Tab erreichbar
  - Screen Reader: Alle Bilder haben alt-Text, alle Formulare haben Labels
  - Focus Management: Sichtbarer Fokus-Indikator, logische Tab-Reihenfolge
  - Motion: Animationen abschaltbar (prefers-reduced-motion)
```

### 7.3 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| UI-Catalogue (Design Tokens) | Implementiert | `ui-catalogue/tokens/` |
| Component Templates | Implementiert | `ui-catalogue/templates/` |
| UISpec Entity | Nicht implementiert | Neu — metamodel.yaml Extension |
| V-024 (UISpec Pflicht) | Nicht implementiert | Neu — metamodel.yaml Extension |
| MDUI Automation | Nicht implementiert | Konzept |
| WCAG Prüfung | Nicht implementiert | Konzept |

---

## 8. Phase 7: Evolutionary Alignment (Die Wartung)

### 8.1 Zweck

Sicherstellung, dass die Kausalkette über den gesamten Lebenszyklus intakt bleibt. Jede Änderung wird erkannt, bewertet und rückverfolgt. Drift wird verhindert oder dokumentiert.

### 8.2 Prozessschritte

#### 8.2.1 Baseline Management

```
AKTION: Erstelle und verwalte Baseline-Snapshots der Anforderungen.

VERFAHREN:
  FÜR JEDES Artefakt im Baum:
    hash = SHA-256( id + "|" + title + "|" + status + "|" + parent )
    hash = hash.substring(0, 16)   # 16-Zeichen Kurzform (64-Bit Entropie)
  
  SPEICHERE: .arqitekt/baseline.json
    {
      "createdAt": ISO-8601 Zeitstempel,
      "projectId": <ID>,
      "hashes": { "<artifactId>": "<16-char-hash>", ... }
    }

TRIGGER: Baseline wird erstellt bei:
  - Projektinitialisierung (Phase 0)
  - Nach erfolgreichem Gate-Durchlauf
  - Manuell durch den Benutzer
  - Vor jedem Export (Phase 8)
```

#### 8.2.2 Drift Detection

```
AKTION: Vergleiche aktuellen Artefakt-Baum mit Baseline.

6 DRIFT-TYPEN:
  1. ADDED:             Neues Artefakt, das in der Baseline nicht existiert.
  2. REMOVED:           Artefakt aus Baseline fehlt im aktuellen Baum.
  3. TITLE_CHANGED:     Titel hat sich geändert.
  4. STATUS_REGRESSED:  Status ist zurückgefallen (z.B. approved → draft).
  5. PARENT_CHANGED:    Artefakt hat den Eltern-Knoten gewechselt.
  6. CONTENT_CHANGED:   Hash-Mismatch → Inhalt wurde modifiziert.

VERFAHREN:
  FÜR JEDE artifactId in Baseline:
    FALLS nicht im aktuellen Baum → REMOVED
    FALLS Hash unterschiedlich → Bestimme Änderungstyp:
      - Vergleiche title: Geändert? → TITLE_CHANGED
      - Vergleiche status: STATUS_ORDER[current] < STATUS_ORDER[baseline]? → STATUS_REGRESSED
      - Vergleiche parent: Geändert? → PARENT_CHANGED
      - Sonst → CONTENT_CHANGED
  
  FÜR JEDE artifactId im aktuellen Baum:
    FALLS nicht in Baseline → ADDED

ERGEBNIS: Drift-Report mit allen Änderungen seit letzter Baseline.
```

#### 8.2.3 Traceability Matrix

```
AKTION: Erstelle und pflege die vollständige Rückverfolgbarkeitsmatrix.

STRUKTUR:
  FÜR JEDES Artefakt:
    parents:  [ direkter Parent ]
    children: [ direkte Kinder ]
    crossRefs: [ referenzierte Cross-Cutting-Artefakte (INF, ADR, NTF, FBK) ]

ORPHAN DETECTION:
  - Artefakte ohne Parent (außer BC und Cross-Cutting) → Warnung
  - Artefakte die Kinder erwarten aber keine haben (SOL, US, CMP) → Warnung
  - Leaf-Detection: FN ohne CONV ist okay; CMP ohne FN ist nicht okay.

IMPACT ANALYSIS:
  EINGABE: Ein geändertes Artefact (artifactId).
  
  DIREKTE AUSWIRKUNG:
    - Alle Kinder des Artefakts
    - Der Parent des Artefakts
  
  TRANSITIVE AUSWIRKUNG:
    - Alle Nachkommen (Kinder der Kinder, rekursiv)
    - Alle Vorfahren (Parent des Parents, rekursiv)
  
  ERGEBNIS: Liste aller betroffenen Artefakte mit Beziehungstyp und Tiefe.
```

#### 8.2.4 Manual Patch Drift Prevention

```
AKTION: Verhindere unkontrollierte manuelle Änderungen am Code.

VERFAHREN:
  1. Atomic Hash-Sync:
     - Der kryptographische Hash des Requirements wird als Kommentar im Code referenziert.
     - Weicht der Code vom Requirement ab → Build-Warnung.
  
  2. Hotfix-Modus (Pragmatische Ausnahme):
     - Manuelle Änderungen sind erlaubt unter folgenden Bedingungen:
       a) Automatisches Ticket wird erstellt.
       b) 48h Grace-Period für Retro-Dokumentation.
       c) Technische Schuld wird als High-Priority im Backlog eingetragen.
     - Nach 48h ohne Dokumentation → Eskalation an Tech Lead.

  3. Causal Integrity Check:
     - Regelmäßige Prüfung: Ist die Kausalkette vom BC bis zum Code intakt?
     - Falls ein Glied fehlt → Warnung mit exakter Angabe der Bruchstelle.
```

### 8.3 Gate G6: Code → Deployment (NEU)

```
GATE: G6_CODE_TO_DEPLOY
TRANSITION: Code → Deployment
RISIKO-LEVEL: Critical
AUTO-PASS-SCHWELLE: 95%

PFLICHT-CHECKS:
  - Alle Artefakte haben Status >= "approved".
  - Baseline existiert und Drift-Report ist sauber (keine unerwarteten Änderungen).
  - Alle Validierungsregeln V-001 bis V-025 bestehen.
  - Traceability-Matrix hat keine Orphans.

ZUGEWIESENE AGENTEN: constraint, boundary

HINWEIS: G6 ist ein NEU definiertes Gate. Es existiert noch nicht in der ARQITEKT-Implementierung.
```

### 8.4 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| Baseline (SHA-256) | Implementiert | `baseline.ts` → `createBaseline()`, Hash auf 16 Zeichen |
| Drift Detection (6 Typen) | Implementiert | `baseline.ts` → `detectDrift()` |
| Traceability Matrix | Implementiert | `traceability.ts` → Parent/Child Links |
| Orphan Detection | Implementiert | `traceability.ts` → `findOrphans()` |
| Impact Analysis (direkt + transitiv) | Implementiert | `traceability.ts` → `analyzeImpact()` |
| Manual Patch Prevention | Nicht implementiert | Konzept (Hash-Sync) |
| Gate G6 | Nicht implementiert | Neu — metamodel.yaml Extension |

---

## 9. Phase 8: Quality Assurance & Compliance (Das Zertifikat)

### 9.1 Zweck

Regulatorische Compliance sicherstellen, lebende Dokumentation generieren, und den Gesamtzustand des Projekts mit Metriken überwachen.

### 9.2 Prozessschritte

#### 9.2.1 Regulatory Compliance Mapping

```
AKTION: Ordne jedem Artefakt die relevanten regulatorischen Anforderungen zu.

MAPPING:
  DSGVO:
    - Artefakte die personenbezogene Daten verarbeiten → Art. 5, 6, 7, 17, 20
    - Automatisch getaggt durch V-013 und INF-Artefakte
  
  Branchenspezifisch:
    - Medizin: MDR (Medical Device Regulation), HIPAA
    - Finanzen: PSD2, MiFID II, SOX
    - Öffentlicher Sektor: BSI IT-Grundschutz
  
  Sicherheitsstandards:
    - OWASP Top 10 (automatisch durch V-013)
    - ISO 27001 (Informationssicherheit)
    - SOC 2 (Service Organization Controls)
```

#### 9.2.2 Living Documentation

```
AKTION: Generiere Dokumentation automatisch aus dem Artefakt-Baum.

OUTPUTS:
  1. Requirements-Baum (Tree-View):
     - Hierarchische Darstellung aller Artefakte mit Status und Konfidenz.
  
  2. Traceability-Report:
     - Matrix: Requirement ↔ Code ↔ Test
     - Orphan-Liste
     - Impact-Analyse-Zusammenfassung
  
  3. Drift-Report:
     - Änderungen seit letzter Baseline
     - Status-Regressionen
     - Neue/entfernte Artefakte
  
  4. Compliance-Report:
     - Regulatorische Abdeckung (welche Gesetze/Standards sind abgedeckt?)
     - Offene Lücken

PRINZIP: Dokumentation ist immer aktuell, weil sie aus den Artefakten generiert wird.
         Kein separates Wiki, kein Confluence → "Single Source of Truth" bleibt der Artefakt-Baum.
```

#### 9.2.3 Health Check & Self-Healing

```
AKTION: Überwache den Pipeline-Zustand kontinuierlich.

HEALTH-CHECK:
  FÜR JEDES Gate G0-G6:
    - Prüfe aktuellen Status (passed/failed/pending/locked).
    - Prüfe Konfidenz-Score aller relevanten Artefakte.
    - Prüfe Drift seit letzter Baseline.
  
  KAUSALITÄTS-INTEGRITÄTS-PRÜFUNG:
    - Ist die Kette BC → SOL → US → CMP → FN → CODE vollständig?
    - Gibt es Unterbrechungen (Orphans, fehlende Ebenen)?
    - Sind alle Cross-Cutting-Referenzen gültig?

SELF-HEALING:
  Bei erkanntem Problem:
    1. Identifiziere die Bruchstelle (welches Artefakt, welche Regel).
    2. Schlage automatische Korrektur vor (z.B. fehlende Akzeptanzkriterien hinzufügen).
    3. FALLS automatische Korrektur möglich → Vorschlag an Benutzer.
    4. FALLS nicht → Eskalation mit genauer Fehlerbeschreibung.
```

#### 9.2.4 Success Metrics (KPIs)

```
METRIKEN:

  Requirement-zu-Code-Treue:     Ziel: > 95%
    (Anteil der Requirements die exakt im Code widergespiegelt werden)
  
  Nachträgliche manuelle Änderungen: Ziel: < 5%
    (Code-Änderungen ohne vorheriges Requirement-Update)
  
  Gate-Durchlaufrate (First Pass): Ziel: > 70%
    (Anteil der Artefakte die ein Gate beim ersten Versuch passieren)
  
  Durchschnittlicher Konfidenz-Score: Ziel: > 85%
    (Über alle Artefakte gemittelt)
  
  Orphan-Rate:                     Ziel: 0%
    (Artefakte ohne gültige Parent-Referenz)
  
  Drift-Rate nach Baseline:       Ziel: < 10%
    (Anteil geänderter Artefakte zwischen Baselines)
  
  False Positive Rate (Fehlalarme): Ziel: < 2%
    (Validierungsregeln die fälschlich auslösen)
```

### 9.3 ARQITEKT-Implementierungsstatus

| Element | Status | Datei |
|---------|--------|-------|
| Validierungsregeln V-001 bis V-020 | Implementiert | `validation.ts` |
| Pipeline-Status (alle Gates) | Implementiert | `pipeline.ts` → `getProjectPipeline()` |
| Living Documentation (Tree) | Implementiert | `tree.ts` → `buildTree()` |
| Drift-Report | Implementiert | `baseline.ts` → `detectDrift()` |
| Compliance-Report | Nicht implementiert | Geplant |
| KPIs / Metriken-Dashboard | Teilweise | `stats.ts` → `getStats()`, `getReadiness()` |

---

## 10. Phase 9: Economic Viability (ROI-Sicherung) [ROADMAP]

> **Status**: Diese Phase ist konzeptionell definiert aber noch nicht in ARQITEKT implementiert.

### 10.1 Zweck

Sicherstellung, dass die technische Lösung auch wirtschaftlich sinnvoll ist. Bevor Entwicklungsressourcen investiert werden, prüft diese Phase den Return-on-Investment.

### 10.2 Prozessschritte

#### 10.2.1 Cost-Benefit Analysis

```
AKTION: Bewerte jedes Feature (SOL) nach Aufwand und Business Value.

DIMENSIONEN:
  AUFWAND (Estimated Effort):
    - Komplexität der User Stories (Anzahl, Verschachtelungstiefe)
    - Technische Risiken (neue Technologien, Integrationen)
    - Team-Erfahrung mit dem Tech Stack
    Skala: XS (< 1 Tag), S (1-3 Tage), M (3-10 Tage), L (10-30 Tage), XL (> 30 Tage)
  
  BUSINESS VALUE:
    - Nutzer-Impact (wie viele Nutzer profitieren?)
    - Revenue-Impact (direkte Umsatzwirkung?)
    - Strategic Value (Positionierung, Marktrelevanz?)
    Skala: 1 (nice-to-have) bis 5 (business-critical)

FRONTMATTER-FELDER (optional, NEU):
  estimated_effort: "M"            # XS, S, M, L, XL
  business_value: 4                # 1-5
  mvp_priority: true               # Gehört zum MVP?

VALIDIERUNG:
  V-025: BC soll estimated_effort und business_value in Frontmatter haben (NEW, Severity: low).
```

#### 10.2.2 MVP-Extraktion

```
AKTION: Identifiziere das minimale marktfähige Produkt aus dem Artefakt-Baum.

VERFAHREN:
  1. Filtere alle SOL/US mit mvp_priority: true.
  2. Prüfe Abhängigkeiten (depends_on Relations).
  3. Berechne den minimalen Schnitt: Welche US/CMP/FN sind zwingend nötig?
  4. Erstelle MVP-Scope-Document mit:
     - Inkludierte Features
     - Exkludierte Features (mit Begründung)
     - Abhängigkeiten und kritischer Pfad

ERGEBNIS: Klarer MVP-Scope, der separat deployed werden kann.
```

#### 10.2.3 Technical Debt Forecast

```
AKTION: Schätze langfristige Wartungskosten.

INDIKATOREN:
  - Komplexität der Architektur (Anzahl CMP, Verschachtelungstiefe)
  - Anzahl Known Constraints (aus Phase 2 Showstopper-Protokoll)
  - Abhängigkeiten von externen Systemen (Legacy-Integration)
  - Test-Coverage des generierten Codes

FORECAST:
  Niedrig:  Klare Architektur, hohe Coverage, wenige Abhängigkeiten.
  Mittel:   Einige Known Constraints, moderate Komplexität.
  Hoch:     Viele Legacy-Integrationen, niedrige Coverage, hohe Kopplung.
```

### 10.3 ARQITEKT-Implementierungsstatus

| Element | Status |
|---------|--------|
| Cost-Benefit Analysis | Nicht implementiert (ROADMAP) |
| MVP-Extraktion | Nicht implementiert (ROADMAP) |
| Technical Debt Forecast | Nicht implementiert (ROADMAP) |
| Frontmatter-Felder (effort/value/mvp) | Nicht implementiert (ROADMAP) |
| V-025 | Nicht implementiert (ROADMAP) |

---

## 11. Phase 10: Organizational Readiness (Team-Bereitschaft) [ROADMAP]

> **Status**: Diese Phase ist konzeptionell definiert aber noch nicht in ARQITEKT implementiert.

### 11.1 Zweck

Sicherstellung, dass das Team die technische Lösung umsetzen und warten kann. Bevor Code geschrieben wird, prüft diese Phase die organisatorische Bereitschaft.

### 11.2 Prozessschritte

#### 11.2.1 Skill Gap Analysis

```
AKTION: Matche den gewählten Technologie-Stack gegen Team-Kompetenzen.

VERFAHREN:
  1. Extrahiere technische Anforderungen aus Artefakten:
     - Programmiersprachen (aus Starters)
     - Frameworks (aus CMP-Spezifikationen)
     - Infrastruktur-Tools (aus INF-Artefakten)
  
  2. Matche gegen Team-Skills:
     required_skills: ["TypeScript", "React", "PostgreSQL", "Docker"]
     team_skills:     ["TypeScript", "React", "MongoDB"]
     gap:             ["PostgreSQL", "Docker"]
  
  3. Bei kritischem Gap:
     BLOCKER: "Team beherrscht PostgreSQL nicht"
     OPTIONEN:
       a) Fallback auf bekannte Technologie (MongoDB)
       b) Schulung einplanen (mit Zeitaufwand)
       c) Externe Expertise einkaufen
     → Dokumentation als ADR.

FRONTMATTER-FELDER (optional, NEU):
  required_skills: ["TypeScript", "React"]
  team_impact: "medium"             # low, medium, high
```

#### 11.2.2 Stakeholder Impact Mapping

```
AKTION: Identifiziere alle vom Projekt betroffenen Stakeholder.

DIMENSIONEN:
  - Wer ist direkt betroffen? (Nutzer, Entwickler, Ops)
  - Wer ist indirekt betroffen? (Management, Marketing, Support)
  - Wer muss informiert werden? (Compliance, Datenschutzbeauftragter)
  - Wer muss zustimmen? (Product Owner, Tech Lead, CTO)

ERGEBNIS: RACI-Matrix (Responsible, Accountable, Consulted, Informed).
```

#### 11.2.3 Change Management

```
AKTION: Plane die organisatorische Veränderung.

ELEMENTE:
  - Kommunikationsplan: Wer wird wann wie informiert?
  - Schulungsplan: Welche Team-Mitglieder brauchen welches Training?
  - Rollout-Plan: Pilotgruppe → Soft Launch → Full Rollout
  - Rollback-Plan: Was passiert wenn der Rollout scheitert?
```

### 11.3 ARQITEKT-Implementierungsstatus

| Element | Status |
|---------|--------|
| Skill Gap Analysis | Nicht implementiert (ROADMAP) |
| Stakeholder Mapping | Nicht implementiert (ROADMAP) |
| Change Management | Nicht implementiert (ROADMAP) |
| Frontmatter-Felder (skills/impact) | Nicht implementiert (ROADMAP) |

---

## 12. Verifikationsarchitektur (Cross-Cutting)

### 12.1 Zweck

Das 6-Level-Verifikationsmodell ist das Rückgrat des Metaketten-Frameworks. Es stellt sicher, dass auf jeder Ebene — von einfachen Strukturprüfungen bis zu kryptographischer Integrität — Qualität garantiert wird.

### 12.2 Die 6 Verifikationsebenen

```
LEVEL 1 — REGEL-BASIERT (Deterministic)
  Was:      Strukturelle Prüfungen mit festem Regelwerk.
  Wie:      Pattern-Matching auf Artefakt-Struktur und Frontmatter.
  Regeln:   V-001 (SOL→US), V-002 (US→CMP), V-003 (CMP→FN), V-005 (Status-Hierarchie),
            V-006 (Pflicht-Frontmatter), V-007 (keine Orphans), V-008 (NTF Channel).
  Ergebnis: Boolesch (bestanden/nicht bestanden). Sofort, deterministisch.
  Laufzeit: < 100ms pro Regel.

LEVEL 2 — CONTENT PATTERN MATCHING (Heuristic)
  Was:      Inhaltliche Prüfungen mittels Regex und Keyword-Suche.
  Wie:      Regex-Patterns auf Artefakt-Body anwenden.
  Regeln:   V-009 (BC WHO/WHAT/WHY), V-010 (Gherkin Pattern), V-011 (keine doppelten Titel),
            V-012 (FN Input/Output/Error), V-013 (INF DSGVO/OWASP), V-014 (SOL→ADR),
            V-015 (keine toten Referenzen).
  Ergebnis: Boolesch mit Details (welche Keywords fehlen).
  Laufzeit: < 500ms pro Regel.

LEVEL 3 — KONFIDENZ-SCORING (Statistical)
  Was:      4-Dimensionen-Bewertung der Artefakt-Qualität.
  Wie:      Gewichtete Kombination aus Structural (30%), Semantic (30%), 
            Consistency (20%), Boundary (20%).
  Regeln:   V-017 (Konfidenz >= Gate-Schwelle).
  Ergebnis: Prozentwert (0-100). Graduelle Bewertung.
  Laufzeit: < 2s pro Artefakt.

LEVEL 4 — LLM-PROBING (Semantic/AI)
  Was:      Intelligente Befragung durch 5 Agenten-Personas.
  Wie:      LLM analysiert Artefakt-Kontext, generiert Gaps, stellt Klärungsfragen.
  Regeln:   V-018 (kritische Probing-Fragen beantwortet), V-019 (Cross-Referenz-Kohärenz).
  Ergebnis: Strukturierte Gap-Liste, generierte Fragen mit Multiple-Choice.
  Laufzeit: 5-30s pro Probing-Runde.

LEVEL 5 — BASELINE-INTEGRITÄT (Cryptographic)
  Was:      SHA-256-basierte Inhalts-Hashvergleiche.
  Wie:      Hash(id|title|status|parent) verglichen mit gespeicherter Baseline.
  Drift:    6 Typen (added, removed, title_changed, status_regressed, parent_changed, content_changed).
  Ergebnis: Drift-Report mit allen Abweichungen.
  Laufzeit: < 500ms für den gesamten Baum.

LEVEL 6 — TRACEABILITY (Structural)
  Was:      Vollständige Rückverfolgbarkeit über den gesamten Artefakt-Baum.
  Wie:      Parent-Child-Matrix, Orphan-Detection, Impact-Analysis.
  Prüfungen: Orphans, fehlende Kinder, transitive Abhängigkeiten.
  Ergebnis: Traceability-Matrix, Impact-Report.
  Laufzeit: < 1s für den gesamten Baum.
```

### 12.3 Terminierungsgarantien

```
INVARIANTE: Keine Verifikation läuft unbegrenzt.

PARAMETER:
  - Maximale Meta-Verifikationstiefe: 3 Ebenen
    (Level 4 prüft Level 3 prüft Level 2 — nie tiefer)
  
  - Probabilistischer Cut-off: Konfidenz > 95% → Keine weitere Prüfung nötig.
  
  - Maximale Probing-Runden: 5 Fragen pro Artefakt pro Session.
  
  - Gate-Retry-Limit: 3 Versuche, dann Human-Eskalation.
  
  - Timeout pro Level: 
    L1-L2: 1s, L3: 5s, L4: 60s, L5-L6: 5s.

ANTI-ZIRKULARITÄTS-MECHANISMUS:
  Problem: SUPER-META prüft META prüft LÖSUNG prüft INPUT → ∞
  Lösung:  Strikt absteigend: L6 → L5 → L4 → L3 → L2 → L1.
           Höheres Level darf niedrigeres prüfen, nicht umgekehrt.
           Kein Zyklus möglich per Design.
```

### 12.4 ARQITEKT-Implementierungsstatus

| Level | Status | Datei |
|-------|--------|-------|
| L1: Regel-basiert | Implementiert | `validation.ts` (V-001 bis V-008) |
| L2: Pattern Matching | Implementiert | `validation.ts` (V-009 bis V-015) |
| L3: Konfidenz-Scoring | Implementiert | `confidence.ts` (4D-Modell mit Gewichten 30/30/20/20) |
| L4: LLM-Probing | Implementiert | `probing.ts` (5 Agenten, Gap-Analyse, Q&A) |
| L5: Baseline-Integrität | Implementiert | `baseline.ts` (SHA-256, 16-char Hash) |
| L6: Traceability | Implementiert | `traceability.ts` (Matrix, Orphans, Impact) |

---

## 13. Appendix

### 13.1 Validierungsregeln (Vollständige Referenz)

| ID | Regel | Scope | Level | Phase |
|----|-------|-------|-------|-------|
| V-001 | Jede SOL muss mindestens eine US haben | Solution | L1 | 3 |
| V-002 | Jede US muss mindestens ein CMP haben | UserStory | L1 | 3 |
| V-003 | Jedes CMP muss mindestens eine FN haben | Component | L1 | 3 |
| V-004 | Jede US muss Akzeptanzkriterien haben | UserStory | L1 | 2 |
| V-005 | Kind-Status darf Eltern-Status nicht überschreiten | All | L1 | 3 |
| V-006 | Pflicht-Frontmatter-Felder müssen gefüllt sein | All | L1 | 0 |
| V-007 | Keine verwaisten Parent-Referenzen | All | L1 | 3 |
| V-008 | NTF muss mindestens einen Kanal definieren | Notification | L1 | 5 |
| V-009 | BC muss WHO, WHAT, WHY, FOR WHOM beantworten | BusinessCase | L2 | 1 |
| V-010 | US muss Gherkin-kompatible Akzeptanzkriterien haben | UserStory | L2 | 2 |
| V-011 | Keine doppelten Titel auf gleicher Hierarchie-Ebene | All | L2 | 3 |
| V-012 | FN muss Input, Output und Error Case definieren | Function | L2 | 4 |
| V-013 | INF muss DSGVO oder OWASP referenzieren | Infrastructure | L2 | 5 |
| V-014 | SOL muss mindestens ein ADR referenzieren | Solution | L2 | 3 |
| V-015 | Keine Referenzen auf nicht-existente Artefakt-IDs | All | L2 | 3 |
| V-016 | Volle Status-Konsistenz (BC durch FN) | All | L1 | 3 |
| V-017 | Konfidenz-Score erreicht Gate-Schwelle | All | L3 | 1-8 |
| V-018 | Alle kritischen Probing-Fragen beantwortet | All | L4 | 1 |
| V-019 | Cross-Referenz-Kohärenz (Parent-Kind-Beschreibungen) | All | L4 | 3 |
| V-020 | Boundary/Error Coverage >= 3 Edge Cases pro FN | Function | L2 | 4 |
| V-021 | US Akzeptanzkriterien mit konkreten Given/When/Then-Werten | UserStory | L2 | 2 |
| V-022 | FN Pre-/Post-Conditions explizit angegeben | Function | L2 | 4 |
| V-023 | Keine logischen Widersprüche zwischen Geschwister-FNs | Function | L4 | 2 |
| V-024 | User-facing US muss UISpec-Artefakt haben | UserStory | L2 | 6 |
| V-025 | BC soll estimated_effort und business_value haben | BusinessCase | L2 | 9 |

### 13.2 Gate-Referenz

| Gate | Transition | Risiko | Schwelle | Agenten | Kernprüfungen |
|------|-----------|--------|----------|---------|---------------|
| G0 | Idea → BC | Critical | 95% | socratic, example | BC existiert, WHO/WHAT/WHY/FOR WHOM |
| G1 | BC → SOL | High | 90% | socratic, constraint | SOL existiert, INF vorhanden, keine Duplikate |
| G2 | SOL → US | High | 90% | example, constraint | V-001, V-004, V-007, V-010 |
| G3 | US → CMP | Medium | 85% | devils_advocate, boundary | V-002, keine doppelten CMP |
| G4 | CMP → FN | Medium | 85% | boundary, devils_advocate | V-003, V-012, V-020 |
| G5 | FN → Code | Critical | 95% | devils_advocate, constraint, boundary | V-005, alle approved, V-022, V-023 |
| G6 | Code → Deploy | Critical | 95% | constraint, boundary | Alle V-Regeln, Baseline sauber, keine Orphans |

### 13.3 Agenten-Referenz

| Agent | Typ | Gates | Trigger | Style | Überspringbar |
|-------|-----|-------|---------|-------|---------------|
| Socratic | Reflektiv | G0, G1 | Unklarheit, Scope-Fragen | "Was genau meinen Sie mit...?" | Ja |
| Devils Advocate | Adversarial | G3, G4, G5 | Annahmen, Schwachstellen | "Was passiert, wenn 10.000 Nutzer...?" | Nein |
| Constraint | Regulatorisch | G1, G2, G5 | Limits, Standards, Gesetze | "DSGVO Art. 17 verlangt..." | Nein |
| Example | Konkretisierend | G0, G2 | Abstraktion, fehlende Beispiele | "Stellen Sie sich vor, Anna will..." | Ja |
| Boundary | Grenzwert | G3, G4, G5 | Fehlende Grenzen, Edge Cases | "Was ist der Maximalwert für...?" | Nein |

### 13.4 Konfidenz-Scoring-Formel

```
GESAMTSCORE = (Structural × 0.30) + (Semantic × 0.30) + (Consistency × 0.20) + (Boundary × 0.20)

Structural (30%):
  + Vollständigkeit der Pflichtfelder (type, id, title, status, parent)
  + Hierarchietiefe (hat Kinder wenn erwartet)
  + Frontmatter-Qualität
  - Fehlende Pflichtfelder: -20 pro fehlendem Feld

Semantic (30%):
  + Inhaltliche Qualität und Spezifität
  + Klare, nicht-vage Formulierungen
  - Vage Begriffe: -5 pro vaghem Wort (schnell, viele, gut, einfach, flexibel, sicher)
  - Kurzer Body (< 100 Zeichen): -15
  - Wenige Überschriften (< 3): -10

Consistency (20%):
  + Korrekte Kreuzreferenzen
  + Einheitliche Namenskonventionen
  + Status-Alignment (Kind <= Eltern)
  + Übereinstimmung mit Parent-Scope

Boundary (20%):
  + Scope-Definition vorhanden
  + Edge Cases dokumentiert
  + Akzeptanzkriterien spezifisch
  + Grenzwerte quantifiziert
  - Edge-Case-Keywords im Text: +5 (bonus)
```

### 13.5 Glossar (DE/EN)

| Deutsch | English | Definition |
|---------|---------|-----------|
| Artefakt | Artifact | Einzelnes Requirement-Dokument im Baum (BC, SOL, US, CMP, FN, etc.) |
| Anforderung | Requirement | Beschreibung einer gewünschten Eigenschaft oder Funktionalität |
| Akzeptanzkriterien | Acceptance Criteria | Bedingungen, unter denen eine User Story als erfüllt gilt |
| Architektur-Entscheidung | Architecture Decision Record (ADR) | Dokumentierte Entscheidung mit Begründung und Alternativen |
| Bounded Context | Bounded Context | Abgegrenzter Bedeutungsraum in Domain-Driven Design |
| Drift | Drift | Abweichung des aktuellen Zustands von der Baseline |
| Eskalation | Escalation | Weiterleitung einer Entscheidung an einen Menschen |
| Gate | Gate | Qualitäts-Prüfpunkt zwischen zwei Pipeline-Phasen |
| Konfidenz-Score | Confidence Score | 4-dimensionale Qualitätsbewertung eines Artefakts (0-100%) |
| Kausalkette | Causal Chain | Lückenlose Verbindung von BC über SOL, US, CMP, FN bis zum Code |
| Metakette | Meta Chain | Verifikationskette, die die Prüfer selbst prüft (Meta-Verifikation) |
| Metamodell | Metamodel | Konfiguration der Artefakt-Typen, Status-Workflow, Regeln und Gates |
| Orphan | Orphan | Artefakt ohne gültigen Parent (verwaist) |
| Probing | Probing | Gezielte Befragung zur Beseitigung von Anforderungs-Unschärfen |
| Rückverfolgbarkeit | Traceability | Fähigkeit, jedes Artefakt zu seinen Eltern und Kindern zu verfolgen |
| Verifikationsebene | Verification Level | Eine der 6 Prüfstufen (L1-L6) im Verifikationsmodell |
| Vorbedingung | Pre-Condition | Bedingung die vor Ausführung einer Funktion gelten muss (Hoare) |
| Nachbedingung | Post-Condition | Bedingung die nach Ausführung einer Funktion gilt (Hoare) |
| Zustandsautomat | State Machine | Modell für Workflows mit definierten Zuständen und Übergängen |

---

*Metaketten-Framework v2.0 — ARQITEKT Requirements Engineering Pipeline*
*Erstellt: 2025 | Letzte Aktualisierung: 2026-03-20*
