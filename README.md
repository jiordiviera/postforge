# PostForge

> Transform your markdown into beautifully formatted LinkedIn posts

## Why?

LinkedIn doesn't support markdown. Your `**bold**` text shows up with asterisks, making posts look unprofessional.

PostForge converts markdown to Unicode characters that LinkedIn renders natively:

```
**bold**    → 𝗯𝗼𝗹𝗱
*italic*    → 𝘪𝘵𝘢𝘭𝘪𝘤
# Heading   → 𝗛𝗲𝗮𝗱𝗶𝗻𝗴
- List      → • List
```

## Features

- Real-time preview
- One-click publish to LinkedIn/X
- Auto-save
- Keyboard shortcuts
- Smart hashtag handling
- Hex color preservation

## Quick Start

```bash
bun install
bun dev
```

Open [localhost:3000](http://localhost:3000)

## Usage

1. Write in markdown
2. Preview updates live
3. Click "Publish now" or "Copy post"

### Shortcuts

- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + Shift + C` - Code
- `Cmd/Ctrl + Enter` - Copy

## Stack

- Next.js 16
- Tailwind CSS v4
- Radix UI
- Vitest
- Bun

## Development

```bash
bun test         # Run tests
bun typecheck    # Type check
bun lint         # Lint
bun build        # Build
```

## How It Works

1. Parse markdown syntax
2. Protect inline code & hex colors
3. Transform to Unicode symbols
4. Restore protected elements
5. Move hashtags to end
6. Generate preview

The conversion uses Unicode mathematical alphanumeric symbols (U+1D400 to U+1D7FF).

## Contributing

1. Fork the repo
2. Create a branch
3. Make your changes
4. Add tests
5. Open a PR

## License

MIT

---

Built by [@jiordiviera](https://github.com/jiordiviera) ✨
