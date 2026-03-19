# Project Starter Templates

Pre-configured requirement hierarchies for common project types.
Each template contains a `manifest.yaml` describing the template and a `requirements/` folder
with pre-filled artifacts.

## Available Templates

| Template | Description | Artifacts |
|----------|-------------|-----------|
| `blank` | Empty project with only the business case template | BC |
| `spa` | Single-Page Application (React/Vue/Angular) | BC + 3 SOL + 6 US + 8 CMP |
| `mobile-app` | Mobile application (Flutter/React Native) | BC + 3 SOL + 6 US + 6 CMP |
| `saas-api` | SaaS backend API service | BC + 3 SOL + 6 US + 7 CMP |
| `e-commerce` | E-commerce platform | BC + 4 SOL + 8 US + 10 CMP |

## Template Selection

During project creation (onboarding wizard), users choose a template.
The template's `requirements/` folder is copied into the new project.
