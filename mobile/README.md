# ARQITEKT Mobile

**Flutter companion app for the ARQITEKT Hub** | **Flutter-Begleit-App fuer den ARQITEKT Hub**

---

## EN: Features

- Browse and create projects
- View requirements tree with full hierarchy
- Edit requirement status (idea -> draft -> review -> approved -> implemented)
- AI chat with project context
- Pipeline overview: 6 gates, confidence breakdown (structural/semantic/consistency/boundary), drift detection
- Capture and browse feedback
- Settings: Hub URL configuration, theme

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Flutter 3.x |
| State | Riverpod (FutureProvider, StateNotifier) |
| Routing | GoRouter (ShellRoute + nested routes) |
| HTTP | Dio |
| Icons | lucide_icons |
| Theme | Material 3, dark mode (Gold #FFD700 + Anthracite #1F1F1F) |
| Fonts | Google Fonts (Inter) + JetBrains Mono |

### Setup

```bash
cd mobile
flutter pub get
flutter run                # Run on connected device/emulator
flutter build apk          # Android release build
flutter build ios          # iOS release build (requires Xcode)
```

### Architecture

```
lib/
  main.dart                 App entry, ProviderScope, MaterialApp.router
  features/
    projects/               Project list, detail, creation
    requirements/           Requirements tree, detail with status editing
    chat/                   AI chat screen
    capture/                Feedback capture form
    feedback/               Feedback list view
    pipeline/               Pipeline gates, confidence, drift
    settings/               Hub URL, app version
    shared/                 AppShell (bottom nav), shared widgets
  models/                   Data classes (Project, Requirement, Pipeline, etc.)
  providers/                Riverpod providers (projects, requirements, pipeline, settings)
  router/                   GoRouter configuration
  services/                 ApiClient (Dio), CacheService
  theme/                    Tokens (colors, spacing, radii, typography)
```

### API Connection

The app connects to the ARQITEKT Hub backend. Configure the Hub URL in Settings (default: `http://10.0.2.2:3334` for Android emulator).

---

## DE: Funktionen

- Projekte durchsuchen und erstellen
- Requirements-Baum mit vollstaendiger Hierarchie anzeigen
- Requirement-Status bearbeiten (idea -> draft -> review -> approved -> implemented)
- KI-Chat mit Projektkontext
- Pipeline-Uebersicht: 6 Gates, Confidence-Aufschluesselung, Drift-Erkennung
- Feedback erfassen und durchsuchen

### Einrichtung

```bash
cd mobile
flutter pub get
flutter run
```

Hub-URL in den Einstellungen konfigurieren (Standard: `http://10.0.2.2:3334` fuer Android-Emulator).

