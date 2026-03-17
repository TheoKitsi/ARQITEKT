---
type: business-case
id: BC-1
status: approved
version: "1.0"
date: "2026-03-14"
---

# BC-1: Business Case — WealthPilot: Gemini-gestützter Vermögensaufbau-Beratungsplaner

> **Version**: 1.0
> **Date**: 2026-03-14
> **Status**: Draft

---

## 1. Vision

WealthPilot ist für Menschen, die ihr Vermögen **intelligent aufbauen** und die Auswirkungen ihrer Finanzentscheidungen in Echtzeit verstehen wollen — bevor sie handeln.

Wie bei jeder großen Lebensentscheidung — Immobilienkauf, Karrierewechsel, Altersvorsorge — beginnt der Prozess mit **Klarheit über den Status quo**: Was habe ich? Was bringt es mir? Was passiert, wenn ich umschichte? WealthPilot macht das Unsichtbare sichtbar: die Wechselwirkungen zwischen Konten, Depots, Versicherungen und geplanten Investitionen.

**Cross-Impact als Differenzierungsmerkmal.**

Ein Kunde hat vielleicht 3 Depots, 2 Sparverträge, ein Tagesgeldkonto und eine Lebensversicherung. Jedes Produkt hat unterschiedliche Renditen, Laufzeiten und Konditionen. Wenn er nun €59.000 aus einem Depot abzieht, um eine Immobilie anzuzahlen — was passiert mit der Gesamtrendite? Mit den regelmäßigen Sparplänen? Mit der Diversifikation? WealthPilot berechnet genau das.

---

## 2. Business Case

### Problemstellung

Die Finanzplanung der meisten Menschen ist **fragmentiert**: Konten bei verschiedenen Banken, Depots bei unterschiedlichen Brokern, Versicherungen bei diversen Anbietern. Kein Tool bietet eine **Gesamtsicht mit Wechselwirkungsanalyse**.

Bestehende Lösungen:
- **Bankberater**: Kennen nur eigene Produkte, keine Gesamtsicht
- **Robo-Advisor**: Optimieren ein einzelnes Portfolio, ignorieren externes Vermögen
- **Excel/Sheets**: Manuell, fehleranfällig, keine Simulation
- **Finanzplanungs-Software**: Komplex, teuer, nicht KI-gestützt

### Lösung: WealthPilot

WealthPilot kombiniert:
1. **Multi-Bank-Aggregation** — Alle Konten und Depots an einem Ort (PSD2 Open Banking)
2. **Cross-Impact-Simulation** — "Was passiert wenn?" für jede Umschichtung
3. **Gemini AI Advisory** — Personalisierte KI-Beratung mit natürlicher Sprache
4. **B2B White-Label** — Banken und Versicherer integrieren WealthPilot in ihre Plattformen

### Zielmarkt

| Segment | Beschreibung | Volumen |
|---|---|---|
| **Banken (Retail)** | Private Banking, Anlageberatung | ~1.500 Institute in DACH |
| **Versicherer** | Lebensversicherung, Altersvorsorge | ~400 Versicherer in DACH |
| **IFAs** | Unabhängige Finanzberater | ~35.000 in Deutschland |
| **Neo-Broker** | Integrierte Beratungsschicht | ~20 relevante Anbieter |

### Monetarisierung

| Modell | Beschreibung |
|---|---|
| **SaaS Lizenz** | Pro Berater-Seat/Monat (€99-499 je Tier) |
| **Revenue Share** | 0,1-0,3% auf vermittelte Produktvolumina |
| **API-Zugang** | Pay-per-Call für Integratoren |
| **Premium KI** | Erweiterte Gemini-Features (Szenario-Limit, Tiefenanalyse) |

### Core Principles

| Prinzip | Beschreibung |
|---|---|
| **Ganzheitlichkeit** | Alle Vermögenswerte, alle Konten, eine Sicht |
| **Kausalität** | Jede Entscheidung hat messbare Auswirkungen — zeige sie |
| **Unabhängigkeit** | Produktportfolio-unabhängige UND -abhängige Beratung |
| **Verständlichkeit** | KI erklärt Finanzmechanismen in natürlicher Sprache |
| **Regulatorik** | BaFin-, MiFID-II- und DSGVO-konform von Tag 1 |
| **Mandantenfähigkeit** | White-Label für jeden B2B-Kunden individuell konfigurierbar |

---

## 3. Architekturmodell

### Schichtenmodell

```
┌─────────────────────────────────────────────────────┐
│  SOL-10: White-Label & B2B-Plattform                │  Mandantenebene
├─────────────────────────────────────────────────────┤
│  SOL-8: Reporting │ SOL-9: Compliance & Regulatorik │  Querschnitt
├─────────────────────────────────────────────────────┤
│  SOL-5: Gemini AI Advisory                          │  KI-Schicht
├──────────────────────┬──────────────────────────────┤
│  SOL-4: Impact-Sim.  │  SOL-6: Immobilien-Modul    │  Berechnungsebene
├──────────────────────┴──────────────────────────────┤
│  SOL-3: Rendite-Engine                              │  Analytik
├─────────────────────────────────────────────────────┤
│  SOL-2: Portfolio-Aggregation & Sync                │  Datenschicht
├─────────────────────────────────────────────────────┤
│  SOL-7: Produkt-Katalog (B2B)                       │  Produktebene
├─────────────────────────────────────────────────────┤
│  SOL-1: Finanzprofil & Onboarding                   │  Eingangsebene
└─────────────────────────────────────────────────────┘
```

---

## 4. Requirements Tree Map

### SOL-1: Finanzprofil & Onboarding (3 US, 3 CMP, 11 FN)
- US-1.1: Konten & Depots erfassen → CMP-1.1.1 → 4 FN
- US-1.2: Einnahmen/Ausgaben-Profil → CMP-1.2.1 → 4 FN
- US-1.3: Risiko-Profil ermitteln → CMP-1.3.1 → 3 FN

### SOL-2: Portfolio-Aggregation & Synchronisation (2 US, 2 CMP, 8 FN)
- US-2.1: Multi-Bank Kontoaggregation → CMP-2.1.1 → 4 FN
- US-2.2: Depot-Synchronisation → CMP-2.2.1 → 4 FN

### SOL-3: Rendite-Engine (3 US, 3 CMP, 12 FN)
- US-3.1: Historische Renditeberechnung → CMP-3.1.1 → 4 FN
- US-3.2: Portfolio-Gesamtrendite → CMP-3.2.1 → 4 FN
- US-3.3: Benchmark-Vergleich → CMP-3.3.1 → 4 FN

### SOL-4: Impact-Simulation — USP (3 US, 4 CMP, 17 FN)
- US-4.1: Kapital-Umschichtung definieren → CMP-4.1.1 → 5 FN
- US-4.2: Cross-Impact berechnen → CMP-4.2.1 (Engine, 5 FN) + CMP-4.2.2 (Visualisierung, 4 FN)
- US-4.3: Optimale Strategie vorschlagen → CMP-4.3.1 → 4 FN

### SOL-5: Gemini AI Advisory (2 US, 2 CMP, 8 FN)
- US-5.1: KI-Beratungsgespräch → CMP-5.1.1 → 4 FN
- US-5.2: Szenario-Bewertung → CMP-5.2.1 → 4 FN

### SOL-6: Immobilien-Modul (3 US, 3 CMP, 12 FN)
- US-6.1: Kaufkosten berechnen → CMP-6.1.1 → 4 FN
- US-6.2: Finanzierungsplan erstellen → CMP-6.2.1 → 4 FN
- US-6.3: Miet-vs-Kauf-Vergleich → CMP-6.3.1 → 4 FN

### SOL-7: Produkt-Katalog (2 US, 2 CMP, 8 FN)
- US-7.1: Produktkatalog durchsuchen → CMP-7.1.1 → 4 FN
- US-7.2: Produkte empfehlen → CMP-7.2.1 → 4 FN

### SOL-8: Reporting & Visualisierung (2 US, 2 CMP, 8 FN)
- US-8.1: Vermögens-Dashboard → CMP-8.1.1 → 4 FN
- US-8.2: Szenario-Report → CMP-8.2.1 → 4 FN

### SOL-9: Compliance & Regulatorik (2 US, 2 CMP, 8 FN)
- US-9.1: Beratungsprotokoll → CMP-9.1.1 → 4 FN
- US-9.2: DSGVO-Löschantrag → CMP-9.2.1 → 4 FN

### SOL-10: White-Label & B2B-Plattform (2 US, 2 CMP, 8 FN)
- US-10.1: Mandanten-Konfiguration → CMP-10.1.1 → 4 FN
- US-10.2: White-Label Branding → CMP-10.2.1 → 4 FN

**Gesamt: 10 SOL, 24 US, 25 CMP, 101 FN**

---

## 5. Dependency Graph

```
SOL-1 (Finanzprofil) ──────────┐
                                ├──→ SOL-2 (Aggregation)
                                │         │
                                │         ├──→ SOL-3 (Rendite)
                                │         │         │
                                │         │         ├──→ SOL-4 (Impact-Sim.) ★ USP
                                │         │         │         │
                                │         │         │         ├──→ SOL-5 (Gemini AI)
                                │         │         │         │
                                │         │         │         ├──→ SOL-6 (Immobilien)
                                │         │         │         │
                                │         │         │         └──→ SOL-8 (Reporting)
                                │         │         │
                                │         │         └──→ SOL-7 (Produktkatalog)
                                │         │
                                │         └──→ SOL-9 (Compliance)
                                │
                                └──→ SOL-10 (White-Label) ←── SOL-7, SOL-8, SOL-9
```

---

## 6. Overview

| ID | Solution | US | CMP | FN | Abhängigkeit |
|---|---|---|---|---|---|
| SOL-1 | Finanzprofil & Onboarding | 3 | 3 | 11 | — |
| SOL-2 | Portfolio-Aggregation & Sync | 2 | 2 | 8 | SOL-1 |
| SOL-3 | Rendite-Engine | 3 | 3 | 12 | SOL-2 |
| SOL-4 | Impact-Simulation (USP) | 3 | 4 | 18 | SOL-3 |
| SOL-5 | Gemini AI Advisory | 2 | 2 | 8 | SOL-4 |
| SOL-6 | Immobilien-Modul | 3 | 3 | 12 | SOL-4 |
| SOL-7 | Produkt-Katalog (B2B) | 2 | 2 | 8 | SOL-3 |
| SOL-8 | Reporting & Visualisierung | 2 | 2 | 8 | SOL-4 |
| SOL-9 | Compliance & Regulatorik | 2 | 2 | 8 | SOL-2 |
| SOL-10 | White-Label & B2B-Plattform | 2 | 2 | 8 | SOL-7, SOL-8, SOL-9 |
| **Gesamt** | | **24** | **25** | **101** | |

---

## 7. Glossar

| Begriff | Definition |
|---|---|
| **Cross-Impact** | Berechnung der Auswirkungen einer Finanzentscheidung auf alle verbundenen Vermögenspositionen |
| **Umschichtung** | Transfer von Kapital von einem Anlageprodukt zu einem anderen (z.B. Depot → Immobilie) |
| **Impact-Score** | Aggregierter Kennwert, der die Gesamtauswirkung einer Umschichtung auf das Portfolio bewertet (-100 bis +100) |
| **Opportunitätskosten** | Entgangene Rendite durch Abzug von Kapital aus einer bestehenden Anlage |
| **PSD2** | Payment Services Directive 2 — EU-Regulierung für Open Banking API-Zugang |
| **Rendite (TTWROR)** | True Time-Weighted Rate of Return — kapitalfluss-bereinigte Renditeberechnung |
| **Rendite (MWR)** | Money-Weighted Return — berücksichtigt Zeitpunkt und Höhe der Einzahlungen |
| **Annuitätendarlehen** | Kredit mit gleichbleibender Monatsrate (sinkender Zins-, steigender Tilgungsanteil) |
| **MiFID II** | Markets in Financial Instruments Directive — EU-Regulierung für Anlageberatung |
| **Geeignetheitserklärung** | Pflichtdokumentation bei Anlageberatung (MiFID II §64 WpHG) |
| **Mandant** | B2B-Kunde (Bank/Versicherer), der WealthPilot als White-Label nutzt |
| **White-Label** | Produkt wird unter Marke des Mandanten angeboten (WealthPilot unsichtbar) |
| **BaFin** | Bundesanstalt für Finanzdienstleistungsaufsicht — deutsche Finanzaufsicht |
| **Liquidität** | Verfügbarkeit von Kapital ohne Verlust (sofort abrufbar) |

---

## 8. Dokumentenreferenzen

| SOL | Datei |
|---|---|
| SOL-1 | [SOL-1_Finanzprofil_und_Onboarding.md](solutions/SOL-1_Finanzprofil_und_Onboarding.md) |
| SOL-2 | [SOL-2_Portfolio_Aggregation_und_Synchronisation.md](solutions/SOL-2_Portfolio_Aggregation_und_Synchronisation.md) |
| SOL-3 | [SOL-3_Rendite_Engine.md](solutions/SOL-3_Rendite_Engine.md) |
| SOL-4 | [SOL-4_Impact_Simulation.md](solutions/SOL-4_Impact_Simulation.md) |
| SOL-5 | [SOL-5_Gemini_AI_Advisory.md](solutions/SOL-5_Gemini_AI_Advisory.md) |
| SOL-6 | [SOL-6_Immobilien_Modul.md](solutions/SOL-6_Immobilien_Modul.md) |
| SOL-7 | [SOL-7_Produkt_Katalog.md](solutions/SOL-7_Produkt_Katalog.md) |
| SOL-8 | [SOL-8_Reporting_und_Visualisierung.md](solutions/SOL-8_Reporting_und_Visualisierung.md) |
| SOL-9 | [SOL-9_Compliance_und_Regulatorik.md](solutions/SOL-9_Compliance_und_Regulatorik.md) |
| SOL-10 | [SOL-10_White_Label_und_B2B_Plattform.md](solutions/SOL-10_White_Label_und_B2B_Plattform.md) |

---

## 9. USP Deep-Dive: Cross-Impact-Simulation

### Szenario-Beispiel

**Ausgangslage von Kunde „Thomas, 34":**

| Position | Produkt | Wert | Rendite p.a. | Liquidität |
|---|---|---|---|---|
| Depot A | MSCI World ETF | €42.000 | 8,2% | sofort |
| Depot B | Dividenden-Portfolio | €31.000 | 5,4% | sofort |
| Tagesgeld | Sparkonto | €18.000 | 2,1% | sofort |
| Sparplan | Bausparer | €12.000 | 1,8% | nach Zuteilung |
| Versicherung | Riester-Rente | €28.000 | 3,2% | ab 67 |

**Thomas will €59.000 für eine Immobilien-Anzahlung.**

### WealthPilot Cross-Impact-Analyse:

**Szenario A:** €42k aus Depot A + €17k aus Depot B
- Rendite-Verlust: -€3.444/Jahr (Depot A) + -€918/Jahr (Depot B) = **-€4.362/Jahr**
- Diversifikations-Impact: Klumpenrisiko steigt (nur Dividenden übrig)
- Sparplan-Effekt: Bestehende ETF-Sparpläne können nicht weiter bespart werden
- Impact-Score: **-34** (signifikant negativ)

**Szenario B:** €18k Tagesgeld + €31k Depot B + €10k aus Depot A
- Rendite-Verlust: -€378/Jahr (TG) + -€1.674/Jahr (Depot B) + -€820/Jahr (Depot A) = **-€2.872/Jahr**
- Diversifikations-Impact: MSCI World bleibt als Kern erhalten
- Liquiditäts-Impact: Notgroschen auf €0 (Risiko!)
- Impact-Score: **-22** (moderat negativ, aber Liquiditätswarnung)

**Szenario C (Optimiert):** €18k Tagesgeld + €12k Bausparer + €29k Depot B
- Rendite-Verlust: -€378/Jahr + -€216/Jahr + -€1.566/Jahr = **-€2.160/Jahr**
- Diversifikations-Impact: MSCI World komplett erhalten, Bausparer sinnvoll eingesetzt
- Finanzierungs-Bonus: Bauspardarlehen möglich → günstigere Konditionen
- Impact-Score: **-12** (gering negativ, beste Option)

### Gemini AI Advisory:

> „Thomas, Szenario C ist optimal für dich: Du behältst dein MSCI-World-Depot komplett, nutzt den Bausparer zweckgemäß und sicherst dir dadurch möglicherweise bessere Finanzierungskonditionen. Der Hauptnachteil ist der Verlust deines Tagesgelds — ich empfehle, innerhalb von 6 Monaten wieder €5.000 als Notgroschen aufzubauen."
