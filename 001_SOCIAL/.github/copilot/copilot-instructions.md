# ARQITEKT — Globale Copilot-Anweisungen

Du arbeitest in einem **ARQITEKT Requirements-Engineering Workspace**. Dieses Framework generiert und verwaltet Software-Requirements in einer strengen Hierarchie:

```
BC (Business Case)
└── SOL (Solution)
    └── US (User Story)
        └── CMP (Component)
            └── FN (Function)
                └── CONV (Conversation Flow)  [optional]

Cross-Cutting: INF (Infrastructure), ADR (Architecture Decision), NTF (Notification)
```

## Grundregeln

1. **Lies immer `config/metamodel.yaml` bevor du Requirements erstellst oder änderst.** Es definiert die erlaubte Hierarchie, Naming-Konventionen und Validierungsregeln.

2. **Naming-Schema** (strikt einhalten):
   - `SOL-{n}` → `US-{sol}.{n}` → `CMP-{sol}.{us}.{n}` → `FN-{sol}.{us}.{cmp}.{n}`
   - Cross-Cutting: `INF-{n}`, `ADR-{n}`, `NTF-{n}`, `CONV-{sol}.{us}.{cmp}.{fn}.{n}`

3. **Jede Requirement-Datei** hat YAML-Frontmatter mit: `type`, `id`, `title`, `status`, `parent` (außer BC und Cross-Cutting)

4. **Sprache**: Deutsch für alle Requirement-Inhalte. User Stories im Format: „Als {Rolle} möchte ich {Aktion} damit {Nutzen}"

5. **Funktionale Requirements**: Immer „Das System shall {Verhalten}" Format.

6. **Status-Workflow**: idea → draft → review → approved → implemented. Kind-Status darf nie höher als Eltern-Status sein.

7. **Templates**: Nutze immer die Templates aus `requirements/templates/` als Basis.

8. **Cross-Referenzen**: Immer als relative Markdown-Links, z.B. `[SOL-1](requirements/solutions/SOL-1_Verifizierung.md)`

## Verzeichnisstruktur

```
requirements/
├── 00_BUSINESS_CASE.md        # Ein BC pro Projekt
├── solutions/SOL-*.md         # Solution-Dateien
├── user-stories/US-*.md       # User Story-Dateien
├── components/CMP-*.md        # Komponenten-Dateien
├── functions/FN-*.md          # Funktions-Dateien
├── conversations/CONV-*.md    # Chatbot-Flows
├── notifications/NTF-*.md     # Notification-Definitionen
├── infrastructure/INF-*.md    # Querschnitts-Anforderungen
├── adrs/ADR-*.md              # Architektur-Entscheidungen
├── analytics/                 # Event-Tracking Katalog
└── templates/                 # Vorlagen für alle Typen
```

## Qualitätskriterien

- **Keine SOL ohne mindestens eine US**
- **Keine US ohne Akzeptanzkriterien**
- **Keine CMP ohne mindestens eine FN**
- **Keine verwaisten Referenzen** — jeder Link muss auf eine existierende Datei zeigen
- **Edge Cases dokumentieren** — als Tabelle in der SOL-Datei
- **INF-Referenzen** — jede CMP sollte relevante INFs (WCAG, OWASP, DSGVO) referenzieren

## Agenten

Dieses Workspace hat spezialisierte Agenten:
- **@discover** — Interview & Business Case Generierung
- **@architect** — Requirement-Hierarchie generieren (SOL → US → CMP → FN)
- **@review** — Requirements prüfen, Lücken finden, Feinschliff
- **@export** — Requirement-Tree, Jira-Export, Code-Scaffold

Nutze den passenden Agenten für die jeweilige Aufgabe.
