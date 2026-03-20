# Metaketten-Framework v2.0 — Team Guide

> Vereinfachte Darstellung des Metaketten-Frameworks für das Team.  
> Technische Details: siehe `METAKETTEN.md`.

---

## Was ist das Metaketten-Framework?

Das Metaketten-Framework ist unser Verfahren, um Software-Anforderungen systematisch von der ersten Idee bis zur Deployment-Freigabe zu führen. Jede Anforderung durchläuft eine Pipeline aus 10 Phasen mit Qualitäts-Gates an den Übergängen.

**Kern-Versprechen**: Jede Zeile Code ist rückverfolgbar auf ein Requirement. Keine Lücken, keine verwaisten Artefakte, keine undokumentierten Entscheidungen.

---

## Pipeline-Überblick

```
  IDEE                                                                 DEPLOY
   │                                                                     │
   ▼                                                                     ▼
┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│ Ph.0 │──▶│ Ph.1 │──▶│ Ph.2 │──▶│ Ph.3 │──▶│ Ph.4 │──▶│ Ph.5 │──▶│ Ph.6 │
│INIT  │   │SEMAN.│   │FORMAL│   │ARCHI.│   │ CODE │   │INFRA │   │  UI  │
└──────┘   └──┬───┘   └──┬───┘   └──┬───┘   └──┬───┘   └──┬───┘   └──────┘
              │          │          │          │          │
             G0         G1/G2      G3        G4         G5
                                                         │
                     ┌──────┐   ┌──────┐   ┌──────┐      │
                     │ Ph.7 │──▶│ Ph.8 │──▶│ Ph.9 │◀─────┘
                     │CHANGE│   │  QA  │   │ ROI  │   ┌──────┐   ┌──────┐
                     └──────┘   └──────┘   └──────┘──▶│Ph.10 │──▶│  G6  │
                        │                              │TEAM  │   │DEPLOY│
                       G6                              └──────┘   └──────┘
```

---

## Die 10 Phasen auf einen Blick

| # | Phase | Was passiert? | Ergebnis |
|---|-------|--------------|----------|
| 0 | **Initialisierung** | Metamodell laden, Projekt anlegen, Baseline setzen | Projektstruktur bereit |
| 1 | **Semantische Dekonstruktion** | Anforderungen verstehen, Mehrdeutigkeiten auflösen, Probing-Fragen stellen | Bereinigter, eindeutiger Anforderungstext mit Konfidenz-Score |
| 2 | **Formale Spezifikation** | Gherkin-Szenarien schreiben, Verträge (Pre/Post-Conditions) definieren, Widersprüche erkennen | Prüfbare Spezifikationen |
| 3 | **Architektur-Dekomposition** | Artefakt-Hierarchie bauen: BC > SOL > US > CMP > FN, ADRs erstellen | Technische Architektur |
| 4 | **Code-Synthese** | Funktionsspezifikationen vervollständigen (Input/Output/Error/Boundary), Code generieren | Implementierungsreife Specs + Code |
| 5 | **Infrastruktur** | Security (DSGVO, OWASP), Monitoring, IaC-Anforderungen | Cross-Cutting-Artefakte (INF) |
| 6 | **UI Design** | UI-Spezifikationen aus User Stories ableiten, Design Tokens verknüpfen | UISpec-Artefakte |
| 7 | **Change Management** | Baseline vergleichen, Drift erkennen, Impact analysieren | Drift-Report, Traceability-Matrix |
| 8 | **QA & Compliance** | Regulatorik prüfen, Living Docs generieren, KPIs messen | Compliance-Report, Metriken |
| 9 | **Economic Viability** | ROI berechnen, MVP identifizieren, Technical Debt schätzen | MVP-Scope, Kosten-Nutzen-Analyse |
| 10 | **Team-Bereitschaft** | Skill Gaps erkennen, Stakeholder mappen, Change planen | Readiness-Report |

Phasen 9 und 10 sind als **ROADMAP** gekennzeichnet — konzeptionell definiert, aber noch nicht in ARQITEKT implementiert.

---

## Gates: Die Qualitäts-Schranken

Zwischen den Phasen stehen **Gates** — Prüfpunkte, die ein Artefakt passieren muss, bevor es weiter darf. Ein Gate prüft automatisch und blockiert bei Fehlern.

| Gate | Übergang | Risiko | Konfidenz-Schwelle | Was wird geprüft? |
|------|---------|--------|-------------------|-------------------|
| G0 | Idee → BC | Critical | 95% | BC existiert, beantwortet WHO/WHAT/WHY |
| G1 | BC → SOL | High | 90% | Solutions existieren, INF vorhanden |
| G2 | SOL → US | High | 90% | User Stories haben Akzeptanzkriterien |
| G3 | US → CMP | Medium | 85% | Components zugeordnet, keine Duplikate |
| G4 | CMP → FN | Medium | 85% | Functions mit Input/Output/Error definiert |
| G5 | FN → Code | Critical | 95% | Alles "approved", Pre/Post-Conditions, Keine Widersprüche |
| G6 | Code → Deploy | Critical | 95% | Alle V-Regeln bestanden, Baseline sauber, keine Orphans |

**Entscheidungslogik**:
- Critical-Check fehlgeschlagen → **FAILED** (Gate blockiert)
- Alle Checks bestanden + Konfidenz >= Schwelle → **PASSED** (weiter)
- Checks bestanden, aber Konfidenz zu niedrig → **PENDING** (Probing-Session starten)
- 3x hintereinander FAILED → Eskalation an den Menschen

---

## Probing-Agenten: Die Klärungshilfe

Wenn ein Requirement nicht klar genug ist (Konfidenz zu niedrig), starten **Probing-Agenten** eine Klärungssession. Sie stellen gezielte Multiple-Choice-Fragen.

| Agent | Rolle | Beispiel-Frage | Wann? |
|-------|-------|---------------|-------|
| **Socratic** | Regt zum Nachdenken an | "Was genau meinen Sie mit 'schnell reagieren'?" | Frühphasen (G0, G1) |
| **Devils Advocate** | Hinterfragt Annahmen | "Was passiert, wenn 10.000 Nutzer gleichzeitig zugreifen?" | Architektur/Code (G3-G5) |
| **Constraint** | Prüft Einschränkungen | "DSGVO Art. 17: Wie wird das Recht auf Löschung umgesetzt?" | Regulatorik (G1, G2, G5) |
| **Example** | Macht es konkret | "Stellen Sie sich vor, Nutzerin Anna will ihr Passwort ändern..." | Akzeptanzkriterien (G0, G2) |
| **Boundary** | Findet Grenzen | "Was ist der Maximalwert? Was passiert bei null/leer?" | Grenzwerte (G3-G5) |

**Ablauf einer Probing-Session**:
1. System analysiert das Artefakt → findet Gaps (max. 5)
2. Für jeden Gap → Generiert eine Klärungsfrage mit Antwort-Optionen
3. Du wählst eine Option oder gibst Freitext ein
4. System integriert die Antwort → berechnet neuen Konfidenz-Score
5. Bei Konfidenz >= 95% → Automatischer Abschluss

---

## Konfidenz-Score: Die Qualitätsmessung

Jedes Artefakt bekommt einen **Konfidenz-Score** (0-100%), zusammengesetzt aus 4 Dimensionen:

```
         ┌─────────────────────────────────────────────────┐
         │              KONFIDENZ-SCORE                     │
         │                                                  │
         │   Structural (30%)   ████████░░   78%            │
         │   Semantic   (30%)   ██████████   95%            │
         │   Consistency(20%)   ███████░░░   70%            │
         │   Boundary   (20%)   █████░░░░░   50%            │
         │                                                  │
         │   GESAMT:            ████████░░   76%            │
         └─────────────────────────────────────────────────┘
```

| Dimension | Gewicht | Was wird gemessen? |
|-----------|---------|-------------------|
| **Structural** | 30% | Sind alle Pflichtfelder ausgefüllt? Hat das Artefakt Kinder (wenn erwartet)? |
| **Semantic** | 30% | Ist der Inhalt klar und spezifisch? Keine vagen Begriffe? Genug Detail? |
| **Consistency** | 20% | Passen Kreuzreferenzen? Stimmen Namenskonventionen? Status korrekt? |
| **Boundary** | 20% | Scope definiert? Edge Cases dokumentiert? Akzeptanzkriterien konkret? |

**Abzüge**: Vage Wörter (-5 je), zu wenig Text (-15), zu wenig Überschriften (-10)  
**Boni**: Strukturierte Überschriften (+10), Edge-Case-Keywords (+5)

---

## Artefakt-Hierarchie

Jedes Projekt folgt dieser Baumstruktur:

```
BC (Business Case) — 1 pro Projekt
 └── SOL (Solution) — Feature-Bereich
      └── US (User Story) — Nutzerperspektive
           └── CMP (Component) — Technisches Modul
                └── FN (Function) — Atomares Verhalten
                     └── CONV (Conversation) — Chatbot-Dialog [optional]

Cross-Cutting (unabhängig vom Baum):
  INF — Infrastruktur (DSGVO, OWASP, Performance)
  ADR — Architektur-Entscheidung
  NTF — Benachrichtigung (Push, Email, SMS)
  FBK — Feedback
  UI  — UI-Spezifikation [NEU]
```

**Status-Workflow**:  
`idea` → `draft` ↔ `review` → `approved` → `implemented`

Ein Kind-Artefakt darf nie einen höheren Status haben als sein Eltern-Artefakt.

---

## Validierungsregeln (Kurzübersicht)

25 Regeln prüfen automatisch die Qualität deiner Artefakte:

| Bereich | Regeln | Was wird geprüft? |
|---------|--------|-------------------|
| Struktur | V-001 bis V-008 | Hierarchie vollständig, Status-Hierarchie, Pflichtfelder, keine Orphans |
| Inhalt | V-009 bis V-015 | BC beantwortet WHO/WHAT/WHY, US hat Gherkin, FN hat Input/Output/Error |
| Konsistenz | V-016 bis V-020 | Status-Konsistenz über alle Ebenen, Konfidenz-Schwellen, Edge Cases |
| NEU | V-021 bis V-025 | Konkrete Gherkin-Werte, Pre/Post-Conditions, Widerspruchsfreiheit, UISpec, ROI |

---

## Drift-Erkennung & Traceability

### Baseline
Ein Snapshot aller Artefakte (SHA-256 Hashes). Wird bei Projektstart und nach Gate-Durchläufen erstellt.

### 6 Drift-Typen
| Typ | Bedeutung |
|-----|-----------|
| `added` | Neues Artefakt seit Baseline |
| `removed` | Artefakt gelöscht |
| `title_changed` | Titel geändert |
| `status_regressed` | Status zurückgefallen (z.B. approved → draft) |
| `parent_changed` | Eltern-Knoten gewechselt |
| `content_changed` | Inhalt modifiziert |

### Impact Analysis
Wenn ein Artefakt sich ändert:
- **Direkt betroffen**: Alle Kinder + der Parent
- **Transitiv betroffen**: Alle Nachkommen + alle Vorfahren

---

## 6-Level-Verifikationsmodell

```
L6: Traceability      ─── Parent-Child-Matrix, Orphan-Detection
L5: Baseline-Integrität ── SHA-256 Drift-Vergleich
L4: LLM-Probing       ─── 5 Agenten, Gap-Analyse, Klärungsfragen
L3: Konfidenz-Scoring  ─── 4D-Bewertung (Structural/Semantic/Consistency/Boundary)
L2: Pattern Matching   ─── Regex/Keyword-Prüfung auf Artefakt-Inhalt
L1: Regel-basiert      ─── Strukturelle Checks (deterministisch, sofort)
```

Jede Ebene prüft einen anderen Aspekt. Höhere Level dürfen niedrigere prüfen, aber nicht umgekehrt — das verhindert endlose Prüfschleifen.

---

## Terminierungsgarantien

Das Framework wird nie endlos laufen:

| Parameter | Wert | Zweck |
|-----------|------|-------|
| Max. Meta-Verifikationstiefe | 3 Ebenen | Keine endlose Rekursion |
| Konfidenz-Cutoff | 95% | Auto-Accept bei hoher Konfidenz |
| Max. Probing-Fragen | 5 pro Artefakt | Keine endlosen Nachfragen |
| Gate-Retry-Limit | 3 Versuche | Danach Eskalation an Mensch |
| Human-Decision-Limit | 7 pro Tag/Person | Decision Fatigue Guard |

---

## FAQ

**Q: Muss jedes Artefakt durch alle 10 Phasen?**  
A: Nein. Phasen 0-5 sind der Kernpfad. Phase 6 (UI) nur für user-facing Features. Phase 7-8 laufen kontinuierlich. Phasen 9-10 sind optional (ROADMAP).

**Q: Was passiert, wenn ein Gate blockiert?**  
A: Das System zeigt die fehlgeschlagenen Checks an und startet bei Bedarf eine Probing-Session. Nach 3 fehlgeschlagenen Versuchen wird an einen Menschen eskaliert.

**Q: Kann ich ein Gate überspringen?**  
A: Nur per manuellem Override mit dokumentiertem Grund. Der Override wird als ADR festgehalten.

**Q: Was sind "vage Begriffe"?**  
A: Wörter wie "schnell", "viele", "gut", "einfach", "flexibel" — sie werden beim Konfidenz-Scoring bestraft. Ersetze sie durch konkrete Werte: "< 200ms", "> 1000 Einträge", "WCAG AA konform".

**Q: Wie unterscheidet sich das Metaketten-Framework von klassischem RE?**  
A: Drei Kernunterschiede: (1) Lückenlose Kausalkette von Idee bis Code, (2) automatisierte Verifikation auf 6 Ebenen, (3) KI-gestütztes Probing das Unschärfen auflöst bevor Code geschrieben wird.

**Q: Was ist neu in v2.0 gegenüber v1.6?**  
A: Formalisierte 10-Phasen-Pipeline (statt 8 Stufen), 5 neue Validierungsregeln (V-021 bis V-025), neues Gate G6 (Code → Deploy), UISpec-Entity, Roadmap-Felder für ROI/MVP, und die 6-Level-Verifikationsarchitektur als durchgängiges Konzept.

---

*Metaketten-Framework v2.0 — Team Guide*  
*Technische Details: `METAKETTEN.md` | Letzte Aktualisierung: 2026-03-20*
