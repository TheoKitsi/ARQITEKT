// Build CSS custom properties from design tokens
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = join(__dirname, '..', 'tokens');
const OUT_DIR = join(__dirname, '..', 'dist');

function flatten(obj, prefix = '') {
  const vars = [];
  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === 'object' && !val.value) {
      vars.push(...flatten(val, name));
    } else if (val && val.value) {
      vars.push(`  --${name}: ${val.value};`);
    }
  }
  return vars;
}

const files = ['colors.json', 'typography.json', 'spacing.json', 'radii.json', 'shadows.json'];
let cssVars = [];
for (const f of files) {
  const tokens = JSON.parse(readFileSync(join(TOKENS_DIR, f), 'utf-8'));
  cssVars.push(...flatten(tokens));
}

const css = `:root {\n${cssVars.join('\n')}\n}\n`;
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'tokens.css'), css, 'utf-8');
console.log('Built ' + cssVars.length + ' CSS custom properties → dist/tokens.css');
