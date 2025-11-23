# Converter – Specification Technique

Ce document décrit **les règles**, **le comportement**, et **l’API** du converter utilisé dans l’app.
Objectif : transformer du Markdown officiel → HTML propre, avec éventuellement un préprocessing WhatsApp et l’application d’un preset (LinkedIn, WhatsApp, Email).

---

## 1. Architecture du converter

Le converter fonctionne en **3 couches** :

1. **Preprocessor (optionnel)**
   Nettoie le texte _avant_ parsing (WhatsApp → Markdown officiel).
2. **Markdown Engine**
   Convertit le Markdown normalisé vers du HTML sécuritaire.
3. **Preset Engine (optionnel)**
   Réécrit le résultat selon la plateforme choisie.

---

## 2. Règles de normalisation

### 2.1. Sauts de ligne

- Collapser plus de **2 retours à la ligne** → `\n\n`.
- Trim du début et de la fin sans retirer volontairement les indentations.

### 2.2. Smart quotes & caractères invisibles

- Remplacer :

  - « ’ » / « ‘ » → `'`
  - « “ » / « ” » → `"`

- Normaliser espaces Unicode → espace standard.

### 2.3. WhatsApp-like syntax (si préprocessor actif)

- `*text*` → `**text**` (bold)
- `_text_` → `*text*` (italic officiel)
- `~text~` → `~~text~~` (strikethrough)
- Ignorer conversion **dans** :

  - blocs de code ` `
  - inline code `` `code` ``
  - texte échappé `\*not bold\*`

---

## 3. Règles Markdown prises en charge

### 3.1. Emphasis

- `*italic*` → `<em>`
- `**bold**` → `<strong>`
- `***bolditalic***` → `<strong><em>`

### 3.2. Code

- Inline: `` `code` ``
- Fenced:

  ````
  ```js
  console.log();
  ```
  ````

### 3.3. Lists

- Supporte UL (`-` / `*`)
- Supporte OL (`1.` `2.` …)
- Nesting limité → 3 niveaux.

### 3.4. Blockquotes

- `> texte`
- Support blockquotes imbriqués avec code à l’intérieur.

### 3.5. Tables (GFM)

- Active si option `gfm: true`.

### 3.6. Liens & images

- `[label](url)`
- `![alt](url)`

### 3.7. HTML & sécurité

- Le converter sanitize :

  - supprime `<script>`
  - nettoie attributs suspects
  - autorise `<strong>`, `<em>`, `<a>`, `<code>`, `<pre>`, `<blockquote>`, `<ul>`, `<ol>`, `<li>` …

---

## 4. API du converter

### 4.1. `convertMarkdownToHtml(markdown: string, options?): string`

**But** : Parser Markdown → HTML sécuritaire.
**Options possibles** :

- `gfm?: boolean`
- `sanitize?: boolean`
- `smartQuotes?: boolean`

**Retour** : HTML final.

---

### 4.2. `preprocessWhatsApp(input: string): string`

**But** : Convertir les syntaxes WhatsApp → syntaxe Markdown officielle.
Applique toutes les conversions sauf dans le code.

---

### 4.3. `applyPreset(markdown: string, preset: 'linkedin' | 'whatsapp' | 'email')`

**Retourne :**

```ts
{
  markdown: string; // markdown transformé
  html: string;     // html transformé
  notes?: string[]; // explications, warnings, info utilitaires
}
```

**Logique par preset** :

#### Preset LinkedIn

- Force `\n\n` entre paragraphes.
- Déplace automatiquement les hashtags en fin de post.
- Nettoie les doubles espaces.

#### Preset WhatsApp

- **Inverse** : HTML → syntaxe WhatsApp

  - `<strong>` → `*text*`
  - `<em>` → `_text_`

- Pas de paragraphes → simple `\n`.

#### Preset Email

- Génère un wrap HTML complet :

  - `<html><body style="font-family:sans-serif;line-height:1.5"> ...`

- Recommandé pour Gmail/Outlook.

---

## 5. Exemples complets (au moins 10)

### 1. Italic

`*hello*` → `<em>hello</em>`

### 2. Bold

`**hey**` → `<strong>hey</strong>`

### 3. Bold italic

`***boom***` → `<strong><em>boom</em></strong>`

### 4. WhatsApp bold → MD

`*hey*` (WA) → `**hey**`

### 5. WhatsApp italic → MD

`_hey_` → `*hey*`

### 6. Code inline

`` `a*b*c` `` → ne parse pas les `*`

### 7. Code block

```
*not bold*
```

→ ne modifie rien

### 8. Table (GFM)

```
| A | B |
|---|---|
| 1 | 2 |
```

→ `<table>…`

### 9. Blockquote + code

````
> Voici
> ```
> code
> ```
````

### 10. Email preset

Input MD → full HTML avec `<style>` minimal inline.

---

## 6. Notes pour devs

- Le converter doit être **idempotent** : deux appels successifs donnent le même résultat.
- Toujours tester avec les inputs "sales" : copier-coller WhatsApp, LinkedIn, iOS Notes.
- Le préprocessor doit être strictement non destructif dans le code.
