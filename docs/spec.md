# 🔥 **App Markdown Converter**

_(Version Shadcn/UI Ready)_

---

# 1. Architecture UI (shadcn)

### Composants shadcn à installer / générer

- `button`
- `toggle`
- `dropdown-menu`
- `textarea`
- `tabs`
- `scroll-area`
- `tooltip`
- `dialog` (pour export)
- `card` (pour layout)
- `separator`
- `resizable` (si nécessaire)

### Layout global

```
<main class="h-screen flex flex-col">
  <header class="border-b h-14 flex items-center px-4 justify-between">
    - Logo / titre
    - Dropdown presets
    - Toggle preprocess WhatsApp
  </header>

  <section class="flex flex-1 overflow-hidden">
    - Panel gauche : Editor (textarea + toolbar)
    - Panel droit : Preview (scrollable, card)
  </section>
</main>
```

---

# 2. Editor UI (Issue #2 – Mise à jour)

### Comportement

- Textarea shadcn (`<Textarea />`)
- Toolbar shadcn : boutons `<Button variant="ghost" size="sm">`
- Actions :

  - Bold → wrap `**...**`
  - Italic → wrap `*...*`
  - Code inline → wrap `` `...` ``
  - Liste → insérer `- ` au début de la ligne
  - Link → template `[text](url)`

### Shortcuts clavier

- **Ctrl/Cmd + B → bold**
- **Ctrl/Cmd + I → italic**
- **Ctrl/Cmd + Shift + C → inline code**
- **Ctrl/Cmd + Enter → copy HTML**

### Autosave

- `localStorage` key: `md-draft-v1`
- Autosave toutes les 1 seconde si le texte change.

### Preview pane

- Utiliser `<ScrollArea>` shadcn + un `<Card>` pour une présentation propre.
- HTML rendu depuis le converter, sanitizé.

---

# 3. Converter (Issue #1 – inchangé mais adapté)

Pipeline :

```
input
  → preprocessWhatsApp (si ON)
  → convertMarkdownToHtml (remark + rehype)
  → applyPreset (LinkedIn | WhatsApp | Email)
  → output html + markdown normalisé
```

Framework :

```
npm install remark remark-parse remark-gfm rehype rehype-sanitize rehype-stringify
```

---

# 4. Preprocessor WhatsApp (#5 – Mise à jour)

### Règles

- `*text*` → `**text**`
- `_text_` → `*text*` (optionnelle : configurable)
- `~text~` → `~~text~~`
- Pas de conversion dans :

  - code fences ` `
  - inline code `` `like_this` ``

- Normalisation des espaces et quotes.

Activer / Désactiver via :
→ `<Toggle>` shadcn dans le header.

---

# 5. Presets Engine (#4 – Mise à jour)

### UI

- `<DropdownMenu>` en haut (header) avec :

```
Presets:
  - LinkedIn
  - WhatsApp
  - Email
```

### Comportement par preset

#### **LinkedIn**

- Forcer paragraph split via double newline `\n\n`.
- Supprimer espaces superflus.
- Replacer hashtags en fin de post (optionnel).

#### **WhatsApp**

- Reconversion :

  - `**bold**` → `*bold*`
  - `*italic*` → `_italic_`

- Retours à la ligne simples (`\n`) respectés strictement.

#### **Email**

- Générer un **HTML complet**, ex :

```
<html>
  <body style="font-family: sans-serif; line-height:1.6;">
    ...html markdown...
  </body>
</html>
```

### API (`applyPreset()`)

Retour :

```
{
  markdown,  // modifié
  html,      // final
  notes: []  // infos (hashtags moved, normalizations...)
}
```

---

# 6. Copy & Export (#3 – Mise à jour)

### Actions (shadcn)

- Bouton “Copy HTML” → `<Button variant="default" size="sm">`
- Bouton “Copy text optimisé”
- Bouton “Exporter .md” → ouvre un `<Dialog>`

### Clipboard API

- Copier en `text/html` + `text/plain`
- Fallback `text/plain` si pas supporté.

### Export `.md`

- Blob + download + nom du fichier `export.md`.

---

# 7. Tests (#6)

- Utiliser **Vitest** (plus rapide dans Next).
- Dossier : `src/core/converter/__tests__/`

Tests à écrire :

1. `*italic*` → `<em>`
2. `**bold**` → `<strong>`
3. `***both***` → `<strong><em>`
4. Code inline non modifié
5. Code block non modifié
6. Listes nested
7. Blockquote
8. GFM table
9. Smart quotes
10. Blank lines
11. WhatsApp `~strike~` → `~~strike~~`
12. Escapes
13. Links
14. XSS sanitization
15. Images

Coverage cible : **80%**.

---

# 8. Docs (Issue #8)

### `/docs/converter.md`

- Règles du converter
- Exemples
- Presets
- How-to contribute

### `/docs/tests.md`

- Liste des tests
- Comment les exécuter (`npm test`)

### `README.md` mis à jour

- Installation
- Dev
- Build
- Vision du projet
- Contribution

---

# 9. Structure du Projet (Final)

```
/src
  /app
    /editor
      page.tsx
  /core
    /converter
      types.ts
      preprocess.ts
      markdown.ts
      presets.ts
      index.ts
  /components
    editor/
      Editor.tsx
      Toolbar.tsx
    ui/ (shadcn)
```
