# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PostForge** is a Next.js-based Markdown converter application designed to transform Markdown content with platform-specific optimizations for LinkedIn, WhatsApp, and Email. The application features:
- Real-time split-pane editor with live preview
- WhatsApp syntax preprocessing (toggle-able)
- Platform-specific presets (LinkedIn, WhatsApp, Email)
- Clipboard API integration for HTML + plain text copying
- LocalStorage-based autosave
- Accessible, keyboard-driven interface

**Project Status**: Early stage - core converter implementation pending, UI components to be added.

## Development Commands

### Package Manager
This project uses **bun** as its package manager (confirmed by `bun.lock` file). Always use `bun` commands instead of npm/yarn/pnpm.

### Common Commands
- **Development server**: `bun dev` (runs on http://localhost:3000)
- **Production build**: `bun build`
- **Start production**: `bun start`
- **Linting**: `bun lint`

### Testing (when implemented)
- Tests will use **Vitest** framework
- Test location: `src/core/converter/__tests__/`
- Target coverage: 80%
- Run tests with: `bun test` (command to be added)

## Architecture

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **React**: v19.2.0
- **TypeScript**: v5 with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui components (to be installed as needed)
- **Markdown Processing**: remark + rehype pipeline (to be installed)

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Directory Structure

```
/src
  /app                    # Next.js App Router pages
    /editor               # Main editor page (to be implemented)
    layout.tsx            # Root layout with Geist fonts
    page.tsx              # Home page
    globals.css           # Global styles with Tailwind v4 theme
  /core                   # Core business logic
    /converter            # Markdown conversion engine
      index.ts            # Main converter export
      types.ts            # TypeScript types (to be created)
      preprocess.ts       # WhatsApp syntax preprocessor (to be created)
      markdown.ts         # Markdown to HTML engine (to be created)
      presets.ts          # Platform-specific presets (to be created)
      /__tests__/         # Unit tests (to be created)
  /components             # React components
    /editor               # Editor-specific components (to be created)
      Editor.tsx          # Main editor component
      Toolbar.tsx         # Formatting toolbar
    /ui                   # shadcn/ui components (to be generated)
/docs                     # Project documentation
  converter.md            # Converter rules and examples
  spec.md                 # Technical specification
/public                   # Static assets
```

### Core Converter Architecture

The converter operates in a 3-layer pipeline:

1. **Preprocessor (optional)**: WhatsApp syntax normalization
   - `*text*` → `**text**` (bold)
   - `_text_` → `*text*` (italic)
   - `~text~` → `~~text~~` (strikethrough)
   - Ignores conversions inside code blocks and inline code

2. **Markdown Engine**: Official Markdown → sanitized HTML
   - Uses remark-parse + remark-gfm + rehype-sanitize + rehype-stringify
   - Supports: emphasis, code, lists, blockquotes, tables (GFM), links, images
   - XSS sanitization enabled by default

3. **Preset Engine (optional)**: Platform-specific transformations
   - **LinkedIn**: Force double newlines, move hashtags to end, normalize spacing
   - **WhatsApp**: Reverse conversion (HTML → WhatsApp syntax), single newlines
   - **Email**: Generate full HTML wrapper with inline styles

### Key Converter Functions

```typescript
// Core conversion
convertMarkdownToHtml(markdown: string, options?: {
  gfm?: boolean;
  sanitize?: boolean;
  smartQuotes?: boolean;
}): string

// WhatsApp preprocessing
preprocessWhatsApp(input: string): string

// Platform presets
applyPreset(markdown: string, preset: 'linkedin' | 'whatsapp' | 'email'): {
  markdown: string;  // transformed markdown
  html: string;      // final HTML
  notes?: string[];  // transformation info
}
```

## UI Components (shadcn/ui)

### Components to Install
Install shadcn/ui components as needed with: `bunx shadcn@latest add [component]`

**Core Components**:
- `button` - Primary/secondary CTAs, toolbar actions
- `toggle` - WhatsApp preprocessor switch
- `dropdown-menu` - Preset selector (LinkedIn/WhatsApp/Email)
- `textarea` - Main editor input
- `tabs` - Future tab-based navigation
- `scroll-area` - Preview pane scrolling
- `tooltip` - Toolbar button hints
- `dialog` - Export modal
- `card` - Layout containers, preview pane
- `separator` - Toolbar button groups
- `resizable` - Split pane resizing (optional)

### Component Specifications (from design.md)

**Header/Topbar**:
- Height: `56px` (h-14)
- Background: `surface`, border-bottom: `border`
- Left: Logo + app title (text-base semibold)
- Right: DropdownMenu (presets) + Toggle (preprocessor)

**Toolbar (Editor)**:
- Button variant: `ghost`, size: `sm`
- Actions: Bold, Italic, Code, List, Link
- Grouped with `separator` between sections
- Tooltips on hover with aria-labels
- Full keyboard accessibility (tab, enter, aria-pressed)

**Textarea (Editor)**:
- Padding: `space-4`
- Min height: `320px` (mobile), `60vh` (desktop)
- Font: monospace for input
- Focus ring: `outline-2` with `accent` color + small offset

**Preview Pane**:
- Card with `padding: space-4`, `overflow-auto`
- Max height: `calc(100vh - header)`
- Rendered HTML styling:
  - `p`: margin-bottom `space-4`
  - `h1/h2`: spacing `space-6`
  - `pre`: monospace, padding `space-3`, bg `bg-light`
  - `code` (inline): bg `muted/10`, rounded `4px`

**Buttons**:
- Primary: `variant="default"`, bg `primary`, white text
- Secondary: `variant="outline"`, border `border`, text `text`
- Sizes: Small `h-8 px-3 text-sm`, Medium `h-10 px-4 text-base`
- Disabled: opacity `0.5` + pointer-events none

**Dialogs (Export)**:
- Centered, max-width `640px`
- Footer: primary confirm + secondary cancel

**Toasts**:
- Top-right floating card
- Auto-dismiss: `1.5s`
- Accessibility: `aria-live="polite"`

## Editor Features

### Toolbar Actions
- Bold → wrap `**...**` (Ctrl/Cmd + B)
- Italic → wrap `*...*` (Ctrl/Cmd + I)
- Inline code → wrap `` `...` `` (Ctrl/Cmd + Shift + C)
- List → insert `- ` at line start
- Link → template `[text](url)`

### Keyboard Shortcuts
- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + Shift + C**: Inline code
- **Ctrl/Cmd + Enter**: Copy HTML

### Autosave
- localStorage key: `md-draft-v1`
- Auto-saves every 1 second on text change

## Code Quality Requirements

### TypeScript
- Strict mode enabled in tsconfig.json
- Target: ES2017, module: esnext
- All new code must be properly typed
- No `any` types unless absolutely necessary
- Path alias: `@/*` → `./src/*`

### ESLint
- Uses Next.js recommended config with TypeScript support
- Configured via `eslint.config.mjs` (flat config format)
- Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Testing (when implemented)
Framework: **Vitest** (faster than Jest for Next.js)
Location: `src/core/converter/__tests__/`
Target coverage: **80%**

**15 Required Test Cases** (from spec.md):
1. `*italic*` → `<em>`
2. `**bold**` → `<strong>`
3. `***both***` → `<strong><em>`
4. Code inline not modified (`` `a*b*c` ``)
5. Code block not modified (preserve `*not bold*`)
6. Nested lists (3 levels max)
7. Blockquotes (including with code inside)
8. GFM tables
9. Smart quotes normalization
10. Blank lines collapsed to `\n\n`
11. WhatsApp `~strike~` → `~~strike~~`
12. Escape characters (`\*not bold\*`)
13. Links `[text](url)`
14. XSS sanitization (script tags, suspicious attributes)
15. Images `![alt](url)`

### Accessibility Requirements
- **Color contrast**: Body text ≥ 4.5:1, large headings ≥ 3:1
- **Focus visible**: All interactive elements (not color-only)
- **ARIA labels**: Toolbar buttons need aria-label, toolbar needs role="toolbar"
- **Keyboard navigation**: Logical tab order, documented shortcuts
- **Reduced motion**: Respect `prefers-reduced-motion` for animations

## Important Implementation Notes

### Converter Idempotency
The converter must be **idempotent** - running conversion twice on the same input should produce identical results.

### Code Block Preservation
The preprocessor must be **strictly non-destructive** within code blocks - never transform syntax inside:
- Code fences (` ``` `)
- Inline code (`` `code` ``)
- Escaped text (`\*not bold\*`)

### Normalization Rules
- Collapse 2+ newlines → `\n\n`
- Smart quotes: `'` `'` → `'`, `"` `"` → `"`
- Unicode spaces → standard space
- Trim start/end without removing intentional indentation

### Security
- Always sanitize HTML output to prevent XSS
- Remove `<script>` tags and suspicious attributes
- Whitelist allowed tags: `<strong>`, `<em>`, `<a>`, `<code>`, `<pre>`, `<blockquote>`, `<ul>`, `<ol>`, `<li>`, `<table>`, etc.

## Design System & Styling

### Design Principles
- **Clarity**: High contrast, readable interface (WCAG AA minimum)
- **Efficiency**: Quick access to actions, short feedback loops
- **Consistency**: Centralized design tokens via CSS variables
- **Mobile-first**: Touch-friendly UI, responsive layouts
- **Accessibility**: WCAG AA compliance, keyboard navigation, aria labels

### Tailwind v4 Setup
- Uses new `@theme inline` syntax in globals.css
- Includes `tw-animate-css` for animations
- Custom dark variant: `@custom-variant dark (&:is(.dark *))`
- **shadcn/ui theme tokens already configured** with OKLCH color space
- Dark mode: `.dark` class (can toggle programmatically)

**Current Theme Tokens (already in globals.css)**:
- Complete shadcn/ui color system in place
- Sidebar, chart, and semantic color tokens defined
- Border radius system: `--radius` (0.625rem) with variants (sm, md, lg, xl)
- OKLCH color format for better perceptual uniformity

### Custom Design Tokens (from design.md)

**Note**: design.md specifies a custom color palette, but shadcn/ui theme is already configured with different colors in OKLCH format. When implementing, decide whether to:
1. Use shadcn default theme (already configured)
2. Override with design.md custom colors
3. Extend shadcn theme with additional custom tokens

**Custom Palette from design.md (for reference)**:
- Light primary: `#671de7`, Dark: `#6218e2`
- Light secondary: `#5cbaf0`, Dark: `#0f6da3`
- Accent: `#167ce9`
- Success: `#16a34a`, Warning: `#f59e0b`, Danger: `#ef4444`

**shadcn Theme (currently active)**:
- Uses OKLCH color space for perceptual uniformity
- Includes: primary, secondary, accent, muted, destructive, border, input, ring
- Additional: sidebar colors, chart colors (5 variants)
- Dark mode via `.dark` class toggle

### Typography System

**Font Stack**:
- Primary: **Inter Variable** (recommended for performance + legibility)
- Currently using: **Geist Sans** and **Geist Mono** (from Next.js template)
- Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`

**Font Scale**:
- `text-xs` (12px): labels, footnotes
- `text-sm` (14px): helper text
- `text-base` (16px): body text (minimum for accessibility)
- `text-lg` (18px): lead text, buttons
- `text-xl` (20px): small headers
- `text-2xl` (24px): h2
- `text-3xl` (30px): h1

**Line Heights**:
- Body: `1.5`
- Headings: `1.25`

### Spacing (8pt System)
```
space-1: 4px   | space-5: 20px  | space-10: 40px
space-2: 8px   | space-6: 24px  | space-12: 48px
space-3: 12px  | space-8: 32px  |
space-4: 16px  |                |
```

### Layout Grid
- Mobile container padding: `16px`
- Desktop max-width: `1200px`, centered
- Split editor: `1fr` + `1fr` at `md` breakpoint, stacked on mobile

### Borders & Elevation
- Border radius: `8px` (small UI), `12px` (cards/modals)
- Shadows:
  - `elevation-1`: `0 1px 2px rgba(0,0,0,0.04)`
  - `elevation-2`: `0 4px 8px rgba(0,0,0,0.06)`

### Motion & Animations
- Use **Framer Motion** for transitions (optional)
- Animation durations:
  - Micro: `120ms`
  - Modal/Dialog: `220ms`
- Easing: `cubic-bezier(.2,.8,.2,1)`
- Respect `prefers-reduced-motion`

### Icons
- Use **lucide-react** icons (compatible with shadcn/ui)
- Sizes: `16px` (toolbar), `20px` (header actions)

## Dependencies to Install (when needed)

```bash
# Markdown processing pipeline
bun add remark remark-parse remark-gfm rehype rehype-sanitize rehype-stringify

# Testing framework
bun add -d vitest @testing-library/react @testing-library/jest-dom

# Icons (compatible with shadcn/ui)
bun add lucide-react

# Animation library (optional)
bun add framer-motion

# Font optimization (if switching from Geist to Inter Variable)
bun add @next/font

# shadcn/ui setup
bunx shadcn@latest init
bunx shadcn@latest add [component-name]
```

## Project Structure Context

```
/home/jiordiviera/Sites/me/postforge/
├── src/
│   ├── app/
│   │   ├── editor/           # Main editor page (to be created)
│   │   │   └── page.tsx
│   │   ├── layout.tsx        # Root layout with fonts
│   │   ├── page.tsx          # Home page (Next.js template)
│   │   └── globals.css       # Tailwind v4 with shadcn theme
│   ├── core/                 # Core business logic (moved from app/core)
│   │   └── converter/
│   │       ├── index.ts      # Main converter export (empty)
│   │       ├── types.ts      # TypeScript types (to be created)
│   │       ├── preprocess.ts # WhatsApp preprocessor (to be created)
│   │       ├── markdown.ts   # Markdown engine (to be created)
│   │       ├── presets.ts    # Platform presets (to be created)
│   │       └── __tests__/    # Unit tests (to be created)
│   ├── components/
│   │   ├── editor/           # Editor components (to be created)
│   │   │   ├── Editor.tsx
│   │   │   └── Toolbar.tsx
│   │   └── ui/               # shadcn components (to be generated)
│   └── lib/
│       └── utils.ts          # shadcn/ui utilities (cn helper)
├── docs/
│   ├── converter.md          # Converter spec & examples
│   ├── spec.md              # Technical API documentation
│   └── design.md            # Complete design system
├── public/                   # Static assets
├── package.json             # Uses bun as package manager
├── tsconfig.json            # TypeScript strict mode
├── next.config.ts           # Next.js configuration
├── eslint.config.mjs        # Flat ESLint config
└── CLAUDE.md                # This file
```

**Current State**:
- Next.js 16 project initialized
- shadcn/ui theme system configured in globals.css (OKLCH colors, dark mode ready)
- Core converter logic is completely unimplemented (index.ts is empty)
- No shadcn/ui components installed yet
- Design system documented in design.md (may need reconciliation with shadcn theme)

## Documentation

Project documentation in `/docs`:
- **`converter.md`**: Converter rules, examples, presets, contribution guide
- **`spec.md`**: Technical specification with detailed API, behavior, and 10+ examples
- **`design.md`**: Complete design system (colors, typography, spacing, components, accessibility)

**Key Documentation Insights**:
- The converter must be **idempotent** (mentioned in spec.md)
- Always test with "dirty" inputs (WhatsApp, LinkedIn, iOS Notes copy-paste)
- Preprocessor must be **strictly non-destructive** in code blocks
- Design favors **clarity for reading & copy/paste** workflows

## Implementation Checklist (from design.md)

When implementing the design system:
- [ ] Add Inter Variable font (or keep Geist - decide based on perf)
- [ ] Implement CSS variables + theme toggling (extend current globals.css)
- [ ] Integrate shadcn components and configure global primitives
- [ ] Create `theme` token mapping in Tailwind config
- [ ] Build Editor + Toolbar + Preview using component specs
- [ ] Implement accessible keyboard shortcuts and ARIA labels
- [ ] Add a11y tests (contrast + keyboard navigation)
- [ ] Update design.md with any deviations from plan

## Development Notes

### Working with This Codebase
- This is a **greenfield project** - most features are specified but not implemented
- Follow the detailed specs in `/docs` for implementation guidance
- The design system is fully specified - no need to make design decisions
- Prioritize accessibility from the start (WCAG AA is a requirement, not nice-to-have)

### File Creation Guidelines
- Place converter logic in `src/core/converter/` (updated location)
- UI components go in `src/components/` with shadcn/ui in `src/components/ui/`
- Utility functions in `src/lib/` (e.g., utils.ts for cn helper)
- Test files use `__tests__/` directories, not `.test.ts` siblings
- All new TypeScript files must have proper types (strict mode is enabled)

### Cameroon Context (from global .claude instructions)
When creating examples or test data, prefer Cameroon-relevant context and lifestyle references.

## Quick Start for New Implementations

When starting work on a new feature in this project:

1. **Read the relevant spec first**: Check `/docs/spec.md` or `/docs/converter.md` for detailed requirements
2. **Check design.md for UI specs**: All component designs are pre-specified
3. **Use bun, not npm**: The project uses bun as package manager
4. **Follow the 3-layer converter architecture**: Preprocessor → Markdown Engine → Preset Engine
5. **Write tests alongside code**: 80% coverage target with Vitest
6. **Accessibility is mandatory**: WCAG AA from the start, not as an afterthought

## Common Pitfalls to Avoid

- ❌ **Don't** use npm/yarn/pnpm - use `bun`
- ❌ **Don't** assume the converter is implemented - it's empty (index.ts has 0 lines)
- ❌ **Don't** create new design tokens without checking design.md first
- ❌ **Don't** modify code inside code blocks during preprocessing (strict non-destructive rule)
- ❌ **Don't** skip the idempotency requirement for converter functions
- ❌ **Don't** forget to sanitize HTML output (XSS prevention is critical)
- ❌ **Don't** use .test.ts file naming - use `__tests__/` directories
- ✅ **Do** follow the existing directory structure in `src/core/converter/`
- ✅ **Do** use TypeScript strict mode with proper types
- ✅ **Do** test with "dirty" real-world inputs (WhatsApp, LinkedIn copy-paste)
