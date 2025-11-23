# PostForge - Plan d'Implémentation Complet

**Date**: 2025-11-23
**Statut**: Projet en phase initiale - Architecture définie, implémentation à réaliser

---

## 📋 Vue d'Ensemble du Projet

**PostForge** transforme le contenu Markdown avec des optimisations spécifiques pour LinkedIn, WhatsApp et Email.

### Features Principales
- ✅ Éditeur temps réel avec aperçu en direct (split-pane)
- ✅ Préprocesseur WhatsApp (activable/désactivable)
- ✅ Presets par plateforme (LinkedIn, WhatsApp, Email)
- ✅ Intégration Clipboard API (HTML + texte brut)
- ✅ Autosave avec localStorage
- ✅ Interface accessible (WCAG AA)

---

## 🎯 Phase 1 : Installation des Dépendances

### 1.1 Markdown Processing Pipeline

```bash
# Core remark/rehype ecosystem
bun add remark remark-parse remark-gfm remark-rehype
bun add rehype rehype-sanitize rehype-stringify
bun add unified
```

**Justification** :
- `unified` : Processeur de transformation de contenu (core)
- `remark-parse` : Parser Markdown → mdast
- `remark-gfm` : Support GitHub Flavored Markdown (tables, strikethrough)
- `remark-rehype` : Convertisseur mdast → hast
- `rehype-sanitize` : Nettoyage XSS (sécurité obligatoire)
- `rehype-stringify` : Sérialiseur hast → HTML

### 1.2 UI Components (shadcn/ui)

```bash
# shadcn/ui déjà initialisé - installer les composants requis
bunx shadcn@latest add button
bunx shadcn@latest add toggle
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add textarea
bunx shadcn@latest add scroll-area
bunx shadcn@latest add tooltip
bunx shadcn@latest add dialog
bunx shadcn@latest add card
bunx shadcn@latest add separator
```

### 1.3 Testing Framework

```bash
# Vitest + React Testing Library
bun add -d vitest @vitest/ui
bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -d jsdom
```

### 1.4 Icons & Utilities

```bash
# Icons et utilitaires
bun add lucide-react
bun add clsx tailwind-merge  # Si pas déjà installés
```

### 1.5 Optional Dependencies

```bash
# Animation (optionnel)
bun add framer-motion

# Inter Variable font (optionnel - alternative à Geist)
# Décision à prendre : garder Geist ou passer à Inter
```

---

## 🏗️ Phase 2 : Architecture du Converter (Core)

### 2.1 Structure des Fichiers

```
src/core/converter/
├── index.ts              # Export principal + fonction wrapper
├── types.ts              # Définitions TypeScript
├── preprocess.ts         # Préprocesseur WhatsApp
├── markdown.ts           # Moteur Markdown → HTML
├── presets.ts            # Presets LinkedIn/WhatsApp/Email
└── __tests__/
    ├── preprocess.test.ts
    ├── markdown.test.ts
    ├── presets.test.ts
    └── integration.test.ts
```

### 2.2 Types TypeScript (types.ts)

```typescript
// Options du converter Markdown
export interface MarkdownOptions {
  gfm?: boolean;          // GitHub Flavored Markdown
  sanitize?: boolean;     // Sanitization XSS
  smartQuotes?: boolean;  // Normalisation quotes
}

// Options du préprocesseur
export interface PreprocessOptions {
  enabled: boolean;       // Activer/désactiver
  preserveCode?: boolean; // Préserver code blocks (toujours true)
}

// Type de preset
export type PresetType = 'linkedin' | 'whatsapp' | 'email';

// Résultat d'application de preset
export interface PresetResult {
  markdown: string;       // Markdown transformé
  html: string;           // HTML final
  notes?: string[];       // Informations de transformation
}

// Options complètes du converter
export interface ConverterOptions {
  preprocess?: PreprocessOptions;
  markdown?: MarkdownOptions;
  preset?: PresetType;
}

// Résultat final du converter
export interface ConverterResult {
  markdown: string;       // Markdown normalisé
  html: string;           // HTML sanitized
  preset?: PresetResult;  // Résultat preset si appliqué
}
```

### 2.3 Préprocesseur WhatsApp (preprocess.ts)

**Règles de transformation** :
- `*text*` → `**text**` (bold)
- `_text_` → `*text*` (italic)
- `~text~` → `~~text~~` (strikethrough)

**Contraintes critiques** :
- ❌ JAMAIS transformer dans les code fences (` ``` `)
- ❌ JAMAIS transformer dans le code inline (`` `code` ``)
- ❌ JAMAIS transformer le texte échappé (`\*not bold\*`)

```typescript
export function preprocessWhatsApp(input: string): string {
  // 1. Identifier et protéger les code blocks
  // 2. Identifier et protéger le code inline
  // 3. Appliquer les transformations
  // 4. Restaurer les code blocks protégés
  // 5. Retourner le résultat
}
```

### 2.4 Moteur Markdown (markdown.ts)

Pipeline officiel remark/rehype :

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

export async function convertMarkdownToHtml(
  markdown: string,
  options: MarkdownOptions = {}
): Promise<string> {
  const { gfm = true, sanitize = true, smartQuotes = true } = options;

  let processor = unified()
    .use(remarkParse);

  if (gfm) {
    processor = processor.use(remarkGfm);
  }

  processor = processor
    .use(remarkRehype);

  if (sanitize) {
    processor = processor.use(rehypeSanitize);
  }

  processor = processor.use(rehypeStringify);

  const file = await processor.process(markdown);
  return String(file);
}
```

### 2.5 Presets (presets.ts)

**LinkedIn Preset** :
- Forcer double newline entre paragraphes (`\n\n`)
- Déplacer hashtags en fin de post
- Nettoyer doubles espaces

**WhatsApp Preset** :
- Conversion inverse : `<strong>` → `*text*`
- Conversion inverse : `<em>` → `_text_`
- Pas de paragraphes → simple `\n`

**Email Preset** :
- Générer HTML complet avec wrapper
- Styles inline pour compatibilité Gmail/Outlook

```typescript
export async function applyPreset(
  markdown: string,
  preset: PresetType
): Promise<PresetResult> {
  switch (preset) {
    case 'linkedin':
      return applyLinkedInPreset(markdown);
    case 'whatsapp':
      return applyWhatsAppPreset(markdown);
    case 'email':
      return applyEmailPreset(markdown);
  }
}
```

---

## 🧪 Phase 3 : Tests (80% Coverage Target)

### 3.1 Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/core/converter/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/core/converter/__tests__/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.2 Tests Requis (15 cas minimum)

1. **Emphasis** : `*italic*` → `<em>`
2. **Strong** : `**bold**` → `<strong>`
3. **Both** : `***bolditalic***` → `<strong><em>`
4. **Code inline préservé** : `` `a*b*c` `` → pas de transformation
5. **Code block préservé** : `*not bold*` dans fence → pas de transformation
6. **Nested lists** : 3 niveaux maximum
7. **Blockquotes** : Avec code à l'intérieur
8. **GFM tables** : Parsing et alignement
9. **Smart quotes** : Normalisation `"` → `"`
10. **Blank lines** : Collapse `\n\n\n` → `\n\n`
11. **WhatsApp strikethrough** : `~text~` → `~~text~~`
12. **Escape characters** : `\*not bold\*` → préservé
13. **Links** : `[text](url)` → `<a href="url">`
14. **XSS sanitization** : `<script>` → supprimé
15. **Images** : `![alt](url)` → `<img>`

### 3.3 Exemple de Test

```typescript
// src/core/converter/__tests__/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { convertMarkdownToHtml } from '../markdown';

describe('Markdown Converter', () => {
  it('should convert italic syntax to <em> tag', async () => {
    const input = '*italic*';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<em>italic</em>');
  });

  it('should preserve code inline without transformation', async () => {
    const input = '`a*b*c`';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<code>a*b*c</code>');
    expect(result).not.toContain('<em>');
  });

  it('should sanitize XSS attempts', async () => {
    const input = '<script>alert("XSS")</script>';
    const result = await convertMarkdownToHtml(input);
    expect(result).not.toContain('<script>');
  });
});
```

---

## 🎨 Phase 4 : UI Components & Editor

### 4.1 Composants à Créer

```
src/components/
├── editor/
│   ├── Editor.tsx           # Composant principal éditeur
│   ├── Toolbar.tsx          # Barre d'outils formatage
│   ├── PreviewPane.tsx      # Aperçu HTML
│   └── PresetSelector.tsx   # Sélecteur de preset
└── ui/                      # shadcn/ui (auto-généré)
```

### 4.2 Editor Features

**Toolbar Actions** :
- Bold (`Ctrl/Cmd + B`) → Wrap `**...**`
- Italic (`Ctrl/Cmd + I`) → Wrap `*...*`
- Code (`Ctrl/Cmd + Shift + C`) → Wrap `` `...` ``
- List → Insert `- ` au début de ligne
- Link → Template `[text](url)`

**Autosave** :
- localStorage key : `md-draft-v1`
- Auto-save toutes les 1 seconde

**Keyboard Shortcuts** :
- `Ctrl/Cmd + B` : Bold
- `Ctrl/Cmd + I` : Italic
- `Ctrl/Cmd + Shift + C` : Code inline
- `Ctrl/Cmd + Enter` : Copy HTML

### 4.3 Layout Structure

```tsx
<main className="h-screen flex flex-col">
  <header className="border-b h-14 flex items-center px-4 justify-between">
    {/* Logo + PresetSelector + Toggle WhatsApp */}
  </header>

  <section className="flex flex-1 overflow-hidden">
    {/* Split: Editor (left) | Preview (right) */}
    <div className="flex-1">
      <Toolbar />
      <Editor />
    </div>
    <div className="flex-1 border-l">
      <PreviewPane />
    </div>
  </section>
</main>
```

---

## 📦 Phase 5 : Déploiement & Configuration

### 5.1 Scripts package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 5.2 Configuration Tailwind (si nécessaire)

Décision à prendre : **shadcn OKLCH theme** vs **design.md custom palette**

Options :
1. Garder shadcn default (déjà configuré)
2. Override avec couleurs custom de design.md
3. Étendre shadcn avec tokens additionnels

---

## ✅ Checklist d'Implémentation

### Core Converter
- [ ] Créer `types.ts` avec toutes les interfaces
- [ ] Implémenter `preprocess.ts` (WhatsApp syntax)
- [ ] Implémenter `markdown.ts` (pipeline unified)
- [ ] Implémenter `presets.ts` (LinkedIn/WhatsApp/Email)
- [ ] Créer `index.ts` avec fonction wrapper principale
- [ ] Écrire 15+ tests avec 80% coverage

### UI Components
- [ ] Installer tous les composants shadcn/ui requis
- [ ] Créer `Editor.tsx` avec textarea et état
- [ ] Créer `Toolbar.tsx` avec actions formatage
- [ ] Créer `PreviewPane.tsx` avec HTML sanitized
- [ ] Créer `PresetSelector.tsx` dropdown
- [ ] Implémenter autosave localStorage
- [ ] Implémenter keyboard shortcuts
- [ ] Ajouter ARIA labels et accessibilité

### Testing & Quality
- [ ] Configurer Vitest
- [ ] Écrire tests unitaires converter
- [ ] Écrire tests intégration
- [ ] Vérifier coverage 80%+
- [ ] Tests accessibilité (contraste, keyboard nav)
- [ ] Vérifier ESLint clean

### Documentation
- [ ] Mettre à jour README.md
- [ ] Compléter docs/converter.md avec exemples
- [ ] Documenter API dans docs/spec.md
- [ ] Créer guide contribution

---

## 🚨 Contraintes Critiques

### Sécurité
- ⚠️ **XSS Prevention** : TOUJOURS sanitizer avec `rehype-sanitize`
- ⚠️ **Whitelist Tags** : Uniquement `<strong>`, `<em>`, `<a>`, `<code>`, etc.
- ⚠️ **Script Removal** : Supprimer tous `<script>` tags

### Idempotence
- ⚠️ **Converter must be idempotent** : 2 appels successifs = même résultat
- ⚠️ **No data loss** : Préserver structure et contenu

### Code Block Preservation
- ⚠️ **Strictly non-destructive** dans code blocks
- ⚠️ **Never transform** syntax dans ` ``` ` ou `` `code` ``

### Accessibilité
- ⚠️ **WCAG AA** : Contraste 4.5:1 minimum
- ⚠️ **Keyboard navigation** : Tous les contrôles accessibles
- ⚠️ **ARIA labels** : Sur tous les boutons toolbar

---

## 📊 Ordre d'Exécution Recommandé

1. **Phase 1** : Installer toutes les dépendances (15 min)
2. **Phase 2.2** : Créer `types.ts` (10 min)
3. **Phase 2.4** : Implémenter `markdown.ts` core (30 min)
4. **Phase 2.3** : Implémenter `preprocess.ts` (45 min)
5. **Phase 2.5** : Implémenter `presets.ts` (1h)
6. **Phase 3** : Écrire tests et vérifier coverage (1h30)
7. **Phase 4** : UI components (2h)
8. **Phase 5** : Tests E2E et polish (1h)

**Total estimé** : 7-8 heures de développement

---

## 🎯 Prochaines Étapes Immédiates

1. Installer les dépendances Phase 1.1 (remark/rehype)
2. Créer le fichier `types.ts`
3. Implémenter `markdown.ts` avec le pipeline unified
4. Écrire les premiers tests

**Commencer par** : `bun add remark remark-parse remark-gfm remark-rehype rehype rehype-sanitize rehype-stringify unified`
