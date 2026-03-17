# ARQITEKT Bug Registry

Catalogued during full code audit. All bugs refer to the **legacy** codebase (`_ARQITEKT/scripts/`).

---

## Critical: Architecture

| # | File | Line | Description |
|---|------|------|-------------|
| A-001 | `dashboard.mjs` | all | **6944-line monolith** duplicates ALL code from services.mjs, routes.mjs, and the entire frontend (HTML+CSS+JS inline). Any fix in one file is NOT reflected in the other. |

## Critical: Security

| # | File | Line | Description |
|---|------|------|-------------|
| S-001 | `routes.mjs` | 39 | Wildcard CORS `Access-Control-Allow-Origin: *` allows any website to call the Hub API |
| S-002 | `routes.mjs` | 52+ | No request body size limit on any POST handler. DoS vector via memory exhaustion. |
| S-003 | `routes.mjs` | various | Arbitrary command execution via terminal endpoint. Combined with S-001, any website can run commands. |
| S-004 | `server.mjs` | 56 | `readFileSync` in HTTP handlers blocks the event loop for all clients |
| S-005 | `routes.mjs` | various | 49 `execSync` calls block the entire server (up to 300s timeout each) |
| S-006 | `app.js` | various | 106 `innerHTML` assignments without consistent sanitization. XSS vectors. |

## High: Broken Features

| # | File | Line | Description |
|---|------|------|-------------|
| B-001 | `mobile/app.js` | 194 | Mobile chat sends `{ projectId, message }` but server expects `{ messages: [...] }`. Chat always fails. |
| B-002 | `mobile/app.js` | 143 | Mobile tree parsing reads `tree.solutions` but API returns nested array of nodes. Requirements tab always shows "No requirements yet". |
| B-003 | `app.js` | 754 | Hash routing regex `^\\d{3}_` is double-escaped. `\\d` matches literal `\d`, not digits. Deep linking to projects is broken. |
| B-004 | `app.js` | 1111 | Feedback card ID uses `replace('pc-', '')` but card IDs use prefix `card-`. Feedback never loads. |
| B-005 | `mobile/sw.js` | 2 | Service worker cache `arqitekt-mobile-v1` — version never changes. Users see stale content indefinitely. |
| B-006 | `style.css` | 40 | `@import` after other CSS rules. Per spec, must be first. Inter/JetBrains Mono fonts may not load. |

## Medium: Missing Error Handling

| # | File | Line | Description |
|---|------|------|-------------|
| E-001 | various | various | **80+ empty `catch {}` blocks** across services.mjs, routes.mjs, dashboard.mjs, app.js. Errors silently swallowed. |
| E-002 | `server.mjs` | all | No `process.on('uncaughtException')` or `process.on('unhandledRejection')` handler. Server crashes silently. |
| E-003 | `server.mjs` | all | No HTTP request timeout. Slow clients hold connections open indefinitely. |
| E-004 | `mobile/app.js` | 78+ | `refreshProjects()`, `saveRecentIdea()`, SW registration all silently swallow errors. |

## Medium: Hardcoded Values

| # | File | Line | Description |
|---|------|------|-------------|
| H-001 | `services.mjs` | 13 | `PORT = 3333` hardcoded |
| H-002 | `routes.mjs` | 645 | `com.messkraft.app` as default bundle ID |
| H-003 | `routes.mjs` | 413 | `http://localhost:3000` as Playwright baseURL |
| H-004 | `dashboard.mjs` | 1477 | Maximum 3 running apps hardcoded |
| H-005 | `dashboard.mjs` | 1492 | Dev ports start at 3334, production at 4000 hardcoded |
| H-006 | `dashboard.mjs` | 1873 | `TK.Apps` monorepo path hardcoded |
| H-007 | `index.html` | 417 | AI model list (GPT-4o, o3-mini, DeepSeek R1) hardcoded in HTML |
| H-008 | `services.mjs` | various | LLM request timeout 60s hardcoded |
| H-009 | `mobile/index.html` | 125 | Version `1.0.0` hardcoded |

## Medium: UI/UX Issues

| # | File | Line | Description |
|---|------|------|-------------|
| U-001 | `index.html` | all | German/English text mixed. `<html lang="de">` but many English labels hardcoded. |
| U-002 | `app.js` | all | Flash of untranslated content — German HTML visible before JS i18n applies translations. |
| U-003 | `index.html` | 261 | Branding modal has hardcoded German labels not covered by i18n system. |
| U-004 | `index.html` | 239 | Import modal has hardcoded German labels without `data-i18n` attributes. |
| U-005 | various | various | No loading states for destructive actions (delete, scaffold, push). Users can double-click. |

## Medium: Code Quality

| # | File | Line | Description |
|---|------|------|-------------|
| Q-001 | `services.mjs` | 54 | Custom `parseYaml()` only handles flat key-value pairs. Breaks on nested YAML, arrays, multi-line values, quoted strings with colons. |
| Q-002 | `services.mjs` | various | `content.replace(/^(status:\s*).+$/m, ...)` replaces first `status:` in entire file, not just frontmatter. |
| Q-003 | various | various | Race condition — no file locking for concurrent YAML/markdown modifications. |
| Q-004 | `dashboard.mjs` | 1547 | Memory leak — child process objects with unconsumed stdout/stderr pipes stored in Map. Pipes fill, processes hang. |
| Q-005 | `services.mjs` | various | `listProjects()` reads every file synchronously on every page load. Slow with many projects. |
| Q-006 | `routes.mjs` | various | `gradlew.bat` hardcoded — Windows only. Breaks on Linux/macOS. |
| Q-007 | `dashboard.mjs` | 1899 | `git push origin main` hardcoded — fails if branch is `master`. |
| Q-008 | `services.mjs` | various | GitHub token written to `.env` file — risk of accidental commit to version control. |

## Low: Responsiveness

| # | File | Line | Description |
|---|------|------|-------------|
| R-001 | `style.css` | various | Project grid uses `minmax(420px, 1fr)` — overflows on screens < 460px. |
| R-002 | `style.css` | 579 | Sidebar fixed at 270px — on tablets, content area too narrow. |
| R-003 | `mobile/` | all | Mobile PWA is a completely separate app with no feature parity. Cannot create projects, edit metadata, run scaffold/codegen, use editor, command palette, or view trees properly. |
| R-004 | `index.html` | 411 | Chat panel is a fixed-position side panel that overlaps main content on narrow screens. No responsive adjustments. |

---

**Total: 43 documented issues** (1 critical architecture, 6 security, 6 broken features, 4 error handling, 9 hardcoded values, 5 UI/UX, 8 code quality, 4 responsiveness)
