---
type: business-case
id: BC-1
status: approved
version: "1.0"
date: "2026-03-10"
---

# BC-1: Business Case — Long-Term Relationship Dating Platform

> **Version**: 1.0
> **Date**: 2026-03-10
> **Status**: Approved

---

## 1. Vision

This platform is for people who are **genuinely** searching for a life partner.

Like any major life decision — housing, career, commitment — the search begins with **self-awareness and clarity**, not a swipe to the right. The funnel model guides users systematically from foundational values to the most personal details — including quirks, idiosyncrasies, and vulnerabilities. Anyone unwilling to look honestly at who they are and what they need does not belong here.

**Seriousness as a filter.**

---

## 2. Business Case

The platform enables verified users to receive high-quality match proposals with strong compatibility by providing detailed information about themselves and their ideal partner, leading to voluntary and serious connections.

### Core Principles

| Principle | Description |
|---|---|
| **Funnel Model** | From broad to fine — 5 levels, mandatory levels cannot be skipped |
| **Self-Awareness** | Users must know who they are before they can search |
| **Honesty** | Including quirks, idiosyncrasies, vulnerabilities — everything a partner should know |
| **Deceleration** | Limited, curated proposals instead of endless swiping |
| **Mutuality** | No contact without mutual interest |
| **Transparency** | Every match is explained — "Why this person?" |
| **Privacy** | Sensitive data is protected, visibility controlled by the user |

### Monetization

| Model | Description |
|---|---|
| **Subscription** | Monthly / annual subscriptions with tiered feature sets |
| **Pay-per-Action** | Individual transactions for profile changes, extra match quotas, premium features |

---

## 3. Funnel Model (5 Levels)

The heart of the platform. Each level has **two sides**: "Who am I?" + "Who am I looking for?".
Levels 1-3 are mandatory and sequential — the next level only opens when the previous one is complete.

| Level | Status | Theme | Analogy |
|---|---|---|---|
| **1** | MANDATORY | **Foundation** — Basic data, relationship intention, core values | "Vehicle category?" / "Apartment or house?" |
| **2** | MANDATORY | **Character & Lifestyle** — Personality, daily life, habits, religion | "Brand, size, color" / "District, floor, balcony" |
| **3** | MANDATORY | **Future & Goals** — Desire for children, life plan, career, finances | "Engine, transmission, mileage" / "Lease term, finish standard" |
| **4** | OPTIONAL | **Depth** — Hobbies, sexuality, quirks, idiosyncrasies, vulnerabilities | "Special equipment" / "Smart home, sauna, fireplace" |
| **5** | OPTIONAL | **Fine-Tuning** — Niche topics, cultural details, micro-preferences | "Leather color, wheel type" / "Underfloor heating, window handles" |

---

## 4. Requirements Tree Map

BC-1: Business Case — Long-Term Relationship Dating Platform
|
+-- SOL-1: Verified Registration & Identity Verification
|   +-- US-1.1: Multi-Step Verification
|   |   +-- CMP-1.1.1: Multi-Step Verification Module
|   |       +-- FN-1.1.1.1  SMS Code Verification
|   |       +-- FN-1.1.1.2  Email Link Verification
|   |       +-- FN-1.1.1.3  ID Document Upload & Check
|   |       +-- FN-1.1.1.4  Display Verification Status
|   |       +-- FN-1.1.1.5  Exclude Unverified Users
|   +-- US-1.2: Uniqueness / Duplicate Prevention
|       +-- CMP-1.2.1: Duplicate Detection Module
|           +-- FN-1.2.1.1  ID Document Hash Matching
|           +-- FN-1.2.1.2  Block & Support Ticket
|
+-- SOL-2: 5-Level Funnel Profile & Search Catalog
|   +-- US-2.1 - US-2.5 (5 User Stories, 5 Components, 23 Functions)
|
+-- SOL-3: Intelligent Text-Based Matching Algorithm
|   +-- US-3.1 - US-3.2 (3 Components, 13 Functions)
|
+-- SOL-4 - SOL-17 (14 additional Solutions)
|
+-- TOTAL: 17 SOL, 26 US, 29 CMP, 130 FN

---

## 5. Dependency Graph

SOL-2 (Funnel Profile Catalog)
  <- SOL-8  (Onboarding follows the funnel)
  <- SOL-12 (Intention fields in Level 1 + Level 3)

SOL-3 (Matching Engine)
  <- SOL-2  (Funnel profile data as matching basis)
  <- SOL-4  (Visual matching optionally feeds into overall score)
  <- SOL-9  (Transparency shows matching details)
  <- SOL-10 (Personality test feeds into matching)
  <- SOL-11 (Cooldown limits proposals)
  <- SOL-15 (Feedback improves matching)

SOL-1 (Verification)
  <- SOL-13 (Seriousness score uses verification status)

SOL-5 (Mutual Consent)
  <- SOL-16 (Staged release controls visibility)

SOL-7 (Data Protection)
  <- SOL-16 (Staged release as privacy feature)
  <- SOL-17 (Exit interview + data deletion)

SOL-6 (Monetization)
  <- SOL-11 (Premium = more quota)

SOL-14 (Inactivity) -> SOL-3 (only active profiles in matching)

---

## 6. Overview

| SOL | Title | US | CMP | FN |
|---|---|---|---|---|
| SOL-1 | Verified Registration | 2 | 2 | 7 |
| SOL-2 | 5-Level Funnel Profile Catalog | 5 | 5 | 23 |
| SOL-3 | Text-Based Matching | 2 | 3 | 13 |
| SOL-4 | Visual Harmony Matching | 1 | 1 | 5 |
| SOL-5 | Mutual Consent | 1 | 2 | 8 |
| SOL-6 | Reconfiguration + Monetization | 2 | 2 | 9 |
| SOL-7 | Data Protection & Security | 1 | 2 | 10 |
| SOL-8 | Reflective Onboarding + Analogies | 3 | 3 | 12 |
| SOL-9 | Compatibility Reflection | 1 | 1 | 5 |
| SOL-10 | Personality Assessment | 1 | 1 | 6 |
| SOL-11 | Cooldown / Deceleration | 1 | 1 | 4 |
| SOL-12 | Intention Declaration | 1 | 1 | 5 |
| SOL-13 | Seriousness System | 1 | 1 | 5 |
| SOL-14 | Inactivity Management | 1 | 1 | 4 |
| SOL-15 | Feedback Loop | 1 | 1 | 4 |
| SOL-16 | Staged Profile Release | 1 | 1 | 5 |
| SOL-17 | Exit Interview | 1 | 1 | 5 |
| | **TOTAL** | **26** | **29** | **130** |

---

## 7. Glossary

| Term | Definition |
|---|---|
| Funnel Model | 5-level architecture of the profile catalog |
| Matching Score | Percentage-based overall compatibility (bidirectional) |
| Quality Score | Profile completeness rating |
| Seriousness Score | Multi-factor earnestness assessment |
| Deal-Breaker | Absolute knockout criterion |
| Must-Have / Nice-to-Have | Weighting tiers |
| Tolerance Range | Acceptable deviation (exact/range/flexible) |
| Harmony Score | AI-based visual compatibility |
| Visibility Level | 3 privacy levels per field |
| Bidirectional Matching | A->B AND B->A |
| Reflection Question | Self-reflection prompt before data entry |
| Analogy System | Personalized metaphors in the funnel |
| Pay-per-Action | Individual transaction |
| Quirks | Idiosyncrasies a partner should know about |

---

## 8. Document References

- [SOL-1: Verified Registration & Identity Verification](solutions/SOL-1_Verifizierte_Registrierung_Identitaetspruefung.md)
- [SOL-2: 5-Level Funnel Profile & Search Catalog](solutions/SOL-2_5-Ebenen-Trichter_Profil-_und_Suchkatalog.md)
- [SOL-3: Intelligent Text-Based Matching Algorithm](solutions/SOL-3_Intelligenter_textbasierter_Matching-Algorithmus.md)
- [SOL-4: Optional Visual Harmony Matching via AI](solutions/SOL-4_Optionales_visuelles_Harmonie-Matching_per_KI.md)
- [SOL-5: Mutual Consent Before Contact](solutions/SOL-5_Gegenseitige_Freigabe_vor_Kontaktaufnahme.md)
- [SOL-6: Limited Paid Reconfiguration (Monetization)](solutions/SOL-6_Begrenzte_kostenpflichtige_Nachkonfiguration_Monetarisierung.md)
- [SOL-7: Data Protection & Security Concept](solutions/SOL-7_Datenschutz-_Sicherheitskonzept.md)
- [SOL-8: Guided Reflective Onboarding Assistant](solutions/SOL-8_Gefuehrter_Reflexions-Onboarding-Assistent.md)
- [SOL-9: Compatibility Reflection "Why This Match?"](solutions/SOL-9_Kompatibilitaets-Reflexion_Warum_dieses_Match.md)
- [SOL-10: Personality & Values Assessment](solutions/SOL-10_Persoenlichkeits-_Werte-Assessment.md)
- [SOL-11: Cooldown & Deceleration Mechanism](solutions/SOL-11_Cooldown-_Entschleunigungsmechanismus.md)
- [SOL-12: Detailed Intention Declaration](solutions/SOL-12_Detaillierte_Intentions-Erklaerung.md)
- [SOL-13: Trust & Seriousness System](solutions/SOL-13_Vertrauens-_Seriositaetssystem.md)
- [SOL-14: Inactivity Management](solutions/SOL-14_Inaktivitaetsmanagement.md)
- [SOL-15: Feedback Loop After Match Rejection](solutions/SOL-15_Feedback-Schleife_nach_Match-Ablehnung.md)
- [SOL-16: Staged Profile Release (3 Visibility Levels)](solutions/SOL-16_Gestufte_Profil-Freigabe_3_Sichtbarkeitsstufen.md)
- [SOL-17: Exit Interview on Account Deletion](solutions/SOL-17_Exit-Interview_bei_Kontoloeschung.md)