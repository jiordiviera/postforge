# Design System — Markdown Converter App (shadcn-ready)

Ce document définit le **design system** complet pour l’app (fonts, couleurs, spacing, composants, accessibilité, motion). Il est pensé pour être implémenté via **Tailwind + shadcn/ui** et intégré dans le projet Next.js.

---

## 1 — Principes rapides

* **Clarté** : interface lisible, contrastes nets.
* **Efficacité** : boutons et actions accessibles, feedbacks courts.
* **Consistance** : tokens centralisés (CSS vars / Tailwind).
* **Mobile-first** : priorité aux interactions mobiles puis desktop.
* **Accessible** : respecter WCAG AA (au moins) pour texte et contrôles.

---

## 2 — Tokens couleurs (Light / Dark)

J’utilise ta palette existante (issue du contexte) et je propose tokens dérivés :

### Light mode (tokens)

* `--color-text`: `#0a0f0e`
* `--color-bg`: `#f6f9f8`
* `--color-primary`: `#671de7`
* `--color-secondary`: `#5cbaf0`
* `--color-accent`: `#167ce9`
* `--color-bg-light`: `#EAECEB`
* `--color-surface`: `#ffffff`
* `--color-muted`: `#6b7371` (derive)

### Dark mode (tokens)

* `--color-text`: `#f0f5f4`
* `--color-bg`: `#060908`
* `--color-primary`: `#6218e2`
* `--color-secondary`: `#0f6da3`
* `--color-accent`: `#167ce9`
* `--color-bg-light`: `#131615`
* `--color-surface`: `#0b0d0c`
* `--color-muted`: `#9aa09f` (derive)

### Semantic tokens

* `--color-success`: `#16a34a`
* `--color-warning`: `#f59e0b`
* `--color-danger`: `#ef4444`
* `--color-border`: use `rgba(10,15,14,0.08)` in light, `rgba(240,245,244,0.06)` in dark.

> Note : privilégier tokens `surface`, `muted`, `border` pour composants. `primary` = CTAs; `accent` = interactive highlights.

---

## 3 — Typographie

### Font stack recommandée

1. **Inter Variable** (préféré pour UI — performance + legibility)
2. Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`

### Families / weights

* `--font-sans`: `"Inter var", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`
* Weights to use: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Scale (desktop baseline)

* `text-xs` → 12px / 0.75rem (label, footnote)
* `text-sm` → 14px / 0.875rem (helper)
* `text-base` → 16px / 1rem (body)
* `text-lg` → 18px / 1.125rem (lead, buttons)
* `text-xl` → 20px / 1.25rem (small headers)
* `text-2xl` → 24px / 1.5rem (h2)
* `text-3xl` → 30px / 1.875rem (h1)

Line-heights:

* body `1.5`, headings `1.25` (or slightly tighter).

### Accessibility

* Body min font-size 16px on desktop; ensure 14px minimum on small mobile only when necessary.
* Provide `text-scale` utility for larger text (A11y).

---

## 4 — Spacing & Grid

### Spacing scale (8pt system)

* `space-0` = 0
* `space-1` = 4px
* `space-2` = 8px
* `space-3` = 12px
* `space-4` = 16px
* `space-5` = 20px
* `space-6` = 24px
* `space-8` = 32px
* `space-10` = 40px
* `space-12` = 48px

### Layout grid

* Container padding mobile: `16px` (space-4)
* Desktop container: max-width `1200px`, centered
* Split editor: left panel `1fr`, right panel `1fr` at >= `md` breakpoint; mobile stacked.

---

## 5 — Borders, Radius, Elevation

* Border radius base: `8px` (small UI), `12px` (cards/modals)
* Shadows (subtle):

  * `elevation-1`: `0 1px 2px rgba(0,0,0,0.04)`
  * `elevation-2`: `0 4px 8px rgba(0,0,0,0.06)`
  * In dark mode, use lighter alpha and inverted color.

---

## 6 — Components (shadcn mapped)

Below, chaque pattern indique variantes, tokens à utiliser, sizes, and accessibility notes.

### 6.1 Header / Topbar

* Use `<Card>` or just a bar with `height:56px` (h-14)
* Left: Logo + app title (text-base semi-bold)
* Right: `<DropdownMenu>` presets, `<Toggle>` preprocess, user actions
* Contrast: bg = `surface`, border-bottom = `border`

### 6.2 Toolbar (Editor)

* Use `Button variant="ghost" size="sm"` from shadcn for each action (B, I, `code`, list, link).
* Grouped horizontally with small `separator`.
* Tooltip on hover (aria-label actionable).
* Keyboard accessible (tab, enter, aria-pressed when toggled).

### 6.3 Textarea (Editor)

* Use shadcn `<Textarea>` styled:

  * padding `space-4`, minHeight `320px` (mobile), `60vh` on desktop.
  * monospace font family for content input.
* Focus ring: `outline-2` with `--color-accent` and `ring-offset` small.

### 6.4 Preview pane

* Card with `padding space-4`, `overflow-auto`, `maxHeight: calc(100vh - header)`
* Render sanitized HTML, style typographic elements:

  * `p` margin bottom `space-4`
  * `h1/h2` spacing `space-6`
  * `pre` with monospace, `padding space-3`, background `bg-light` (or dark surface)
  * `code` inline: subtle bg `bg-muted/10` and rounded `4px`

### 6.5 Buttons / Primary CTAs

* Primary: `variant="default"` (solid) use `--color-primary` background, white text.
* Secondary: `variant="outline"` border = `--color-border`, text = `--color-text`
* Size full example:

  * Small: `h-8 px-3 text-sm`
  * Medium: `h-10 px-4 text-base` (default)
* Disabled: opacity 0.5 + `pointer-events: none`

### 6.6 Dialogs (Export)

* Use `Dialog` from shadcn, centered, max-width `640px`
* Footer with primary confirm/export CTA and secondary cancel.

### 6.7 Cards, List Items, Inputs

* Cards use surface background, border, radius 12px, subtle shadow.
* Inputs align with Textarea tokens; use labels above the inputs, helper text beneath.

### 6.8 Toasts

* Small floating card top-right with shadow and rounded corners. Auto-dismiss 1.5s. Use `aria-live="polite"`.

---

## 7 — Iconography & Images

* Use **lucide-react** icons (works well with shadcn).
* Icon sizing: `16px` for toolbar, `20px` for header actions.
* Avoid decorative images without alt text.

---

## 8 — Motion & Interaction

* Use **Framer Motion** for small transitions: toast enter/exit, dialog pop, toolbar hover scale.
* Keep animations subtle:

  * duration: `120ms` for micro, `220ms` for modal.
  * easing: `cubic-bezier(.2,.8,.2,1)`

---

## 9 — Theming & Dark Mode

* Implement CSS variables for all tokens (colors, radii, spacing optional).
* Use Tailwind `dark` class for dark mode; or system preference `prefers-color-scheme` fallback.
* Provide toggle in header; persist choice in `localStorage.theme`.

Example minimal CSS variables:

```css
:root {
  --text: #0a0f0e;
  --bg: #f6f9f8;
  --primary: #671de7;
  --surface: #ffffff;
  --border: rgba(10,15,14,0.08);
}
[data-theme="dark"] {
  --text: #f0f5f4;
  --bg: #060908;
  --primary: #6218e2;
  --surface: #0b0d0c;
  --border: rgba(240,245,244,0.06);
}
```

---

## 10 — Accessibility requirements (must)

* Color contrast: text > 4.5:1 for body; large headings ≥ 3:1.
* Focus visible for all interactive elements (not only color).
* `aria-label` on toolbar buttons, `role="toolbar"` for the group.
* Keyboard navigation: tab order logical, shortcuts documented in UI.
* Provide `prefers-reduced-motion` respect.

---

## 11 — Tailwind + shadcn integration hints (short)

* Add `@shadcn/ui` components and import `lucide-react`.
* Define Tailwind theme extension:

  * Add colors using CSS vars to allow runtime theming.
  * Define fontFamily with Inter var.
  * Add spacing tokens if deviating from default.

Example Tailwind extension (conceptual):

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo'],
      },
    }
  }
}
```

---

## 12 — Deliverables & Implementation checklist

* [ ] Add Inter variable font to app (prefer local/hosted var font for performance).
* [ ] Implement CSS variables + theme toggling.
* [ ] Integrate shadcn components and set global primitives (Button, Card, Textarea).
* [ ] Create `theme` tokens mapping in Tailwind config.
* [ ] Build Editor + Toolbar + Preview using specified component tokens.
* [ ] Implement accessible keyboard shortcuts and aria labels.
* [ ] Add tests for contrast and keyboard navigation (simple a11y smoke tests).
* [ ] Document styles in `docs/design.md`.

---

## 13 — Examples (practical snippets / rules)

* **Preview paragraph**: `p { margin-bottom: 16px; font-size: 16px; color: var(--color-text) }`
* **Code block**: padding `12px`, border-radius `8px`, background `var(--color-bg-light)`
* **Primary button**: background `var(--color-primary)`, hover `darken 8%`, focus ring `2px var(--color-accent)`

---

## 14 — Notes finales

* Le design doit favoriser lecture & copy/paste : espacer légèrement les paragraphes, garder la typographie neutre.
* Utilise shadcn comme base UI mais applique les tokens décrits ici pour cohérence.
* Lors des reviews, vérifier : rendu mobile, contrastes, keyboard navigation, Clipboard API behavior.

---

Si tu veux, je peux maintenant :

* Générer **`tailwind.config.js` complet** basé sur ces tokens,
* Rédiger **`docs/design.md`** prêt à coller,
* Ou produire un **Figma-lite spec** (liste d’écrans + composants) pour les UI devs.

Tu veux que j’ajoute lequel en priorité ?
