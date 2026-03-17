---
type: solution
id: SOL-2
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-2: 5-Level Funnel Profile & Search Catalog

| Metric | Value |
|---|---|
| User Stories | 5 |
| Components | 5 |
| Functions | 23 |

This is the heart of the platform. The profile catalog is built as a **5-level funnel** — from foundation to the most personal details. Each level has two sides: **"Who am I?"** and **"Who am I looking for?"**. The mandatory levels (1-3) are sequential — the next level only opens when the previous one is complete.

---

## Funnel Architecture

+-------------------------------------------------------------+
|  LEVEL 1 (MANDATORY) -- FOUNDATION                          |
|  Basic data - Relationship intention - Core values           |
+-------------------------------------------------------------+
|  LEVEL 2 (MANDATORY) -- CHARACTER & LIFESTYLE                |
|  Personality - Daily life - Habits - Religion                |
+-------------------------------------------------------------+
|  LEVEL 3 (MANDATORY) -- FUTURE & GOALS                      |
|  Desire for children - Life plan - Career - Finances         |
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|  LEVEL 4 (OPTIONAL) -- DEPTH                                |
|  Hobbies - Sexuality - Quirks - Idiosyncrasies               |
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|  LEVEL 5 (OPTIONAL) -- FINE-TUNING                           |
|  Niche topics - Cultural details - Micro-preferences         |
+-------------------------------------------------------------+

---

## User Stories

- [US-2.1: 5-Level Funnel Self-Description "Who Am I?"](../user-stories/US-2.1_5-Ebenen-Trichter_Selbstbeschreibung_Wer_bin_ich.md)
- [US-2.2: 5-Level Funnel Target Person Description "Who Am I Looking For?"](../user-stories/US-2.2_5-Ebenen-Trichter_Zielpersonenbeschreibung_Wen_suche_ich.md)
- [US-2.3: Quirks, Idiosyncrasies & Particularities (Level 4 Detail)](../user-stories/US-2.3_Faibles_Eigenheiten_Besonderheiten_Ebene_4_Detail.md)
- [US-2.4: Profile Preview & Quality Score](../user-stories/US-2.4_Profil-Vorschau_Qualitaetsanzeige.md)
- [US-2.5: Detailed Field Catalog Per Level](../user-stories/US-2.5_Detaillierter_Feldkatalog_pro_Ebene.md)