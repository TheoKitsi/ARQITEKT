---
name: ARQITEKT Metamodel
description: Zentrales Wissens-Dokument für die Requirement-Hierarchie, Naming-Konventionen, Beziehungstypen und Validierungsregeln. Wird von allen Agents referenziert.
---

# ARQITEKT Metamodel — Skill Reference

## Zweck

Dieses Skill-Dokument ist die **Single Source of Truth** für alle Agenten. Lies dieses Dokument IMMER bevor du Requirements erstellst, änderst oder validierst.

Die technische Konfiguration liegt in `config/metamodel.yaml` — dieses Skill-Dokument erklärt die **Semantik und Anwendungsregeln** dahinter.

## Hierarchie-Logik

### Core Tree (Top-Down)

```
BC-1 (Business Case)          ← EIN pro Projekt
├── SOL-1 (Solution)           ← Feature-Bereich / Lösungsbaustein
│   ├── US-1.1 (User Story)    ← Nutzer-Sicht, testbar
│   │   ├── CMP-1.1.1 (Component) ← Technische Einheit
│   │   │   ├── FN-1.1.1.1 (Function) ← Einzelnes Systemverhalten
│   │   │   │   └── CONV-1.1.1.1.1 (Conversation) ← Chatbot-Dialog [optional]
│   │   │   └── FN-1.1.1.2
│   │   └── CMP-1.1.2
│   └── US-1.2
└── SOL-2
```

### Cross-Cutting (nicht in der Hierarchie)

- **INF** (Infrastructure): WCAG, OWASP, DSGVO, i18n, State, Performance, CI/CD — gelten für alle
- **ADR** (Architecture Decision Record): Begründete technische Entscheidungen
- **NTF** (Notification): Kanal-Definitionen (Push, Email, SMS, In-App) — werden von FNs referenziert

## Naming-Konventionen

### ID-Schema

| Typ | Pattern | Beispiel |
|---|---|---|
| Business Case | `BC-{n}` | BC-1 |
| Solution | `SOL-{n}` | SOL-3 |
| User Story | `US-{sol}.{n}` | US-3.1, US-3.2 |
| Component | `CMP-{sol}.{us}.{n}` | CMP-3.1.1, CMP-3.1.2 |
| Function | `FN-{sol}.{us}.{cmp}.{n}` | FN-3.1.1.1 |
| Conversation | `CONV-{sol}.{us}.{cmp}.{fn}.{n}` | CONV-3.1.1.1.1 |
| Infrastructure | `INF-{n}` | INF-1 |
| ADR | `ADR-{n}` | ADR-1 |
| Notification | `NTF-{n}` | NTF-1 |

### Dateinamen

| Typ | Pattern | Beispiel |
|---|---|---|
| Solution | `SOL-{n}_{Titel}.md` | SOL-3_Matching.md |
| User Story | `US-{sol}.{n}_{Titel}.md` | US-3.1_Uebereinstimmungsberechnung.md |
| Component | `CMP-{sol}.{us}.{n}_{Titel}.md` | CMP-3.1.1_Matching_Engine.md |
| Function | `FN-{sol}.{us}.{cmp}.{n}_{Titel}.md` | FN-3.1.1.1_Bidirektionales_Matching.md |

**Titel-Regeln**:
- Deutsch, keine Umlaute im Dateinamen (ä→ae, ö→oe, ü→ue, ß→ss)
- Leerzeichen → Unterstrich
- Kurz und beschreibend (3-5 Wörter max)

### Akzeptanzkriterien und Edge Cases

| Typ | Pattern | Beispiel |
|---|---|---|
| Acceptance Criteria | `AC-{sol}.{us}.{n}` | AC-3.1.1, AC-3.1.2 |
| Edge Case | `EC-{sol}.{n}` | EC-3.1, EC-3.2 |

## Beziehungstypen

| Beziehung | Bedeutung | Beispiel |
|---|---|---|
| `refines` | Kind verfeinert Elternteil | US-3.1 refines SOL-3 |
| `depends_on` | Braucht Voraussetzung | SOL-3 depends_on SOL-2 |
| `constrains` | Querschnitts-Einschränkung | INF-1 constrains CMP-3.1.1 |
| `triggers` | Löst Notification aus | FN-1.1.1.4 triggers NTF-1 |

### Dependency-Notation in SOL-Dateien

```markdown
> **Abhängigkeiten**: ← SOL-2 (upstream: liefert Profildaten), → SOL-9 (downstream: nutzt Matching-Ergebnis)
```

## Status-Workflow

```
idea → draft → review → approved → implemented
```

**Regeln**:
- Neues Requirement startet immer als `draft` (oder `idea` wenn unvollständig)
- `review` = aktiv geprüft durch @review Agent oder Stakeholder
- `approved` = abgenommen, bereit für Implementierung
- `implemented` = Code existiert und ist verifiziert
- **Kind-Status ≤ Eltern-Status**: Wenn SOL-3 `draft` ist, kann US-3.1 nicht `approved` sein

## Validierungsregeln (für @review Agent und validate.mjs)

1. **V-001**: Jede SOL braucht ≥1 US
2. **V-002**: Jede US braucht ≥1 CMP
3. **V-003**: Jede CMP braucht ≥1 FN
4. **V-004**: Jede US braucht Akzeptanzkriterien (AC-*)
5. **V-005**: Kind-Status ≤ Eltern-Status
6. **V-006**: Frontmatter-Pflichtfelder: type, id, title, status
7. **V-007**: Keine verwaisten Referenzen
8. **V-008**: Jede NTF braucht ≥1 Kanal

## Wann welchen Typ verwenden?

| Frage | → Typ |
|---|---|
| "Was ist die große Business-Idee?" | BC |
| "Welcher Feature-Bereich löst das?" | SOL |
| "Was will der Nutzer konkret tun?" | US |
| "Welches technische Modul setzt das um?" | CMP |
| "Was genau tut das System?" | FN |
| "Wie spricht der Bot mit dem Nutzer?" | CONV |
| "Über welchen Kanal wird benachrichtigt?" | NTF |
| "Welche Standards gelten immer?" | INF |
| "Warum haben wir das so entschieden?" | ADR |

## Anti-Patterns

- ❌ **Requirement ohne Elternteil**: Jede FN muss über CMP→US→SOL→BC erreichbar sein
- ❌ **God-SOL**: Eine SOL mit 10+ US ist zu groß — aufteilen
- ❌ **Leere CMP**: Eine Komponente ohne Funktionen ist sinnlos
- ❌ **Vage Akzeptanzkriterien**: "System funktioniert gut" → Nicht testbar
- ❌ **Zyklische Abhängigkeiten**: SOL-A depends_on SOL-B depends_on SOL-A
- ❌ **Status-Inkonsistenz**: Kind `approved`, Eltern `draft`
- ❌ **Fehlende INF-Referenzen**: CMP mit Nutzerdaten ohne DSGVO-Referenz
