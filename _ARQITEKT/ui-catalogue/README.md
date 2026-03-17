# ARQITEKT UI Catalogue

Shared design tokens for all ARQITEKT projects. Based on Messkraft brand identity and M3 Material Design baseline.

## Brand DNA
- **Gold** (#FFD700) + **Anthracite** (#1F1F1F)
- Inter + JetBrains Mono font pairing
- 12dp card radius (M3 baseline)
- Outlined card variant preferred

## Structure

```
tokens/
  colors.json       Color palette (brand, surface, text, semantic, border)
  typography.json    Font families, sizes, weights, line-heights
  spacing.json       Spacing scale (4px base)
  radii.json         Border radius tokens
  shadows.json       Box shadow tokens
dist/
  tokens.css         Generated CSS custom properties
```

## Usage

```bash
npm run build       # Generates dist/tokens.css
```

Import `dist/tokens.css` in any project to use consistent design tokens as CSS custom properties.
