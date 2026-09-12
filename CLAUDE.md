# CLAUDE.md

## Project Overview

A custom presentation site built with React and TypeScript, with command-based navigation. Hosted on GitHub Pages at https://yermilov.github.io/claude-strangelove-ua

The deck for «Клод Стрейнджлав» (Fwdays Tech Summit'26 — **online**, Saturday 3 October, Track B, 14:00; 35-minute slot = 25–30 min talk + 5–10 min Q&A) wears a **Kubrick skin over the original terminal deck**, and the split is the point: slides are Kubrick (black, symmetrical, Jost UA in capitals, one red, no glow) while everything the machine says — code blocks, agent logs, the input bar — stays CRT terminal. Read `.claude/skills/design-system/SKILL.md` before touching any style.

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Syntax Highlighting**: react-syntax-highlighter
- **Hosting**: GitHub Pages (auto-deployed via GitHub Actions)

## Commands

```bash
bun install      # Install dependencies (REQUIRED before first `bun run dev`)
bun run dev      # Start dev server (http://localhost:5173/claude-strangelove-ua/)
bun run build    # Build for production
bun run preview  # Preview production build
bun run deploy   # Manual deploy to GitHub Pages
```

## Project Structure

```
src/
├── App.tsx                    # Slide array — imports and orders all slides
├── main.tsx                   # React entry point
├── index.css                  # Global styles & font faces
├── fonts/                     # Patched Jost UA webfonts (see index.css for why)
├── vite-env.d.ts              # Vite type declarations
├── types/
│   └── slides.ts              # TypeScript interfaces
├── slides/
│   ├── index.ts               # Re-exports all slide components
│   ├── TitleSlide.tsx         # Individual slide components
│   └── ...
├── prompts/
│   └── *.json                 # Structured data for animated/complex slides
├── hooks/
│   ├── useSlideNavigation.ts  # Navigation state & command parsing
│   └── useTouchNavigation.ts  # Swipe gesture support
├── components/
│   ├── KubrickElements.tsx    # ActCard, LightRing, BigBoard, Machine
│   ├── Presentation.tsx       # Main container — timer, tool activation, routing
│   ├── Slide.tsx              # Fullscreen slide wrapper
│   ├── TerminalInput.tsx      # Command input box
│   ├── CodeBlock.tsx          # Syntax-highlighted code
│   ├── SlideProgress.tsx      # Slide counter
│   ├── OnboardingTooltip.tsx  # Navigation help tooltip
│   ├── PointerTooltip.tsx     # Contextual pointer hints
│   ├── SlideElements.tsx      # Reusable slide building blocks
│   └── Timer.tsx              # Presentation timer component
├── design-system/            # Reusable design layer (see .claude/skills/design-system)
│   ├── tokens.css             # CSS variables (colors, type scale, spacing, motion)
│   ├── base.css               # .presentation, .slide, headings, lists, links
│   ├── patterns.css           # Color/glow utilities, slide-item, animations, CRT
│   ├── components.css         # Bottom bar, tooltips, code block, rotate hint
│   └── index.css              # @imports the above in layer order
└── styles/
    └── slide-layouts.css      # Per-slide layouts (bio, timeline, VS battle, etc.)
```

For the deck's design conventions (type scale, palette, bullet style, glow rules),
read `.claude/skills/design-system/SKILL.md` or invoke it via the skill tool when
creating or editing slides.

## Adding Slides

Each slide lives in its own file under `src/slides/`. To add a new slide:

1. Create `src/slides/MySlide.tsx`
2. Export it from `src/slides/index.ts`
3. Import and add to the `slides` array in `src/App.tsx`

Slide definition shape:

```tsx
// src/slides/MySlide.tsx
export function MySlide() {
  return (
    <>
      <h2>Slide Title</h2>
      <p>Slide content here</p>
      <ul>
        <li>List items with terminal-style bullets</li>
      </ul>
    </>
  );
}

// src/App.tsx — register it:
{
  id: 'unique-id',
  content: <MySlide />,
  notes: 'Optional speaker notes',
}
```

For interactive slides (reveal stages, live input, tool activation), pass a render function instead of JSX:

```tsx
{
  id: 'interactive-id',
  content: ({ revealStage, inputText, activatedTools }) => <MySlide revealStage={revealStage} />,
  maxRevealStages: 3,
}
```

### Using Code Blocks

```tsx
<CodeBlock
  language="typescript"
  filename="example.ts"
  showLineNumbers
  code={`const hello = "world";`}
/>
```

### Using Images

Images in `public/` must be imported with `?url` suffix for GitHub Pages compatibility:

```tsx
import myImage from '/my-image.png?url';

// In slide content (add loading="lazy" for non-first slides):
<img src={myImage} alt="Description" loading="lazy" />
```

**Important:** Do NOT use direct paths like `src="/image.png"` — they break on GitHub Pages due to the base URL (`/claude-strangelove-ua`).

**Build-time compression:** `vite-plugin-imagemin` is configured in `vite.config.ts` and automatically compresses PNGs/JPEGs at build time (71–86% size reduction). No manual compression needed.

### Animated Content — Use MP4, Not GIF

Large GIFs dramatically inflate bundle size. Convert to MP4:

```bash
ffmpeg -i input.gif -vf "fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -pix_fmt yuv420p -crf 28 output.mp4
```

Use `<video>` instead of `<img>` for the result:

```tsx
import myVideo from '/my-video.mp4?url';

<video autoPlay loop muted playsInline src={myVideo} />
```

GIF vs MP4: `petermobile.gif` was 5 MB → `petermobile.mp4` is 306 KB.

### Full-Screen Image Slides

For slides that display a single image filling the available space:

```tsx
import myImage from '/my-image.png?url';

{
  id: 'image-slide-id',
  content: (
    <div className="image-slide">
      <img src={myImage} alt="Description" />
    </div>
  ),
}
```

The `.image-slide` class automatically:
- Constrains image to viewport (accounts for timer/input bar)
- Centers the image
- Applies terminal-themed border and shadow
- Uses `object-fit: contain` to preserve aspect ratio

### Slide Height & Overflow

The `.slide` container has `max-height: 100%; overflow: hidden` as a hard CSS guard. If content overflows the viewport and overlaps the input bar:

- **Accumulating bullets that run out of room → use a sliding window, NOT a smaller font.** Bullets on a slide are spoken in order, so older points have already done their job by the time the next two are on screen. Drop them. Shrinking the font hurts projector legibility and is almost never the right answer.
  ```tsx
  const WINDOW = 3;
  const firstVisible = Math.max(0, revealStage - WINDOW + 1);
  const isVisible = (i: number) => revealStage >= i && i >= firstVisible;
  // …
  {isVisible(0) && <SlideItem>…</SlideItem>}
  {isVisible(1) && <SlideItem>…</SlideItem>}
  ```
- For image/media containers, use `calc(var(--vh-full) - 220px)` (or similar offset) so they leave room for the timer and input bar.
- The standard image-slide pattern already handles this via `.image-slide` height constraint.
- Last-resort font tightening: `1.3–1.5rem` body text in genuinely dense reference slides where every bullet must stay visible at once.

Example fix pattern for overflow:
```css
.my-slide-image {
  max-height: calc(var(--vh-full) - 220px);
  object-fit: contain;
}
```

### Edge-to-edge backdrops (e.g. space, photo, fullbleed art)

Don't wrap the backdrop in an inner rounded container — that frame will clip
anything (like the astronauts on `WhatIsSkillSlide`) that wants to reach the
slide edges. Set `SlideDefinition.background` to a layered CSS background
instead; `Slide.tsx` applies it to the `.slide` element itself, and child
content can then float freely over the full-bleed art.

```tsx
import bgImg from '../assets/bg.png?url';

const SLIDE_BG = `
  linear-gradient(180deg,
    rgba(10,14,20,0.6) 0%,
    rgba(10,14,20,0.35) 50%,
    rgba(10,14,20,0.6) 100%),
  url(${bgImg}) center/cover no-repeat
`;

export const MySlide: SlideDefinition = {
  background: SLIDE_BG,
  // …
};
```

### Slide Content Classes

- `h1.hero` - Extra large hero heading
- `.text-orange`, `.text-green`, `.text-blue` - Accent colors
- `.text-dim`, `.text-muted` - Dimmed text
- `.glow-orange`, `.glow-green` - Text glow effects

## Navigation Commands

**The input box is hidden.** Press **Esc** to bring the terminal up over the slide; Esc again, or
running a command, dismisses it. On a touch device the clock in the bottom-right is the tap target.
Slide navigation does NOT need it — the keys below work with the terminal closed.

Type in the input box:
- `next` or `n` → Next slide
- `prev`, `back`, `p`, `b` → Previous slide
- Number (e.g., `3`) → Go to slide 3
- `first`, `home` → First slide (`start` activates the timer, not navigation)
- `last`, `end` → Last slide
- `reveal` or `r` → Reveal next content stage

Timer commands:
- `start` or `go` → Start timer
- `pause` or `stop` → Pause timer

Keyboard (when not typing):
- Arrow keys, Space, PageDown/Up → Navigate
- Home/End → First/last slide

## Terminal Theme Principles

### Colors (CSS Custom Properties)

```css
--terminal-bg: #0a0e14          /* Deep black background */
--terminal-white: #e2e8f0       /* Primary text */
--terminal-orange: #f0883e      /* Headings, accents (h1) */
--terminal-green: #7ee787       /* Subheadings (h2), success */
--terminal-blue: #79c0ff        /* Links, tertiary headings */
--terminal-purple: #d2a8ff      /* Functions in code */
--terminal-cyan: #76e4f7        /* Inline code */
```

### Typography

- **Font**: JetBrains Mono (monospace)
- **h1**: 4rem (5rem for `.hero`)
- **h2**: 3rem
- **h3**: 2.25rem
- **Body**: 1.5rem

### Visual Effects

- CRT scan lines overlay
- Subtle noise texture
- Phosphor text glow on headings
- Orange focus glow on input
- Fade-in slide transitions

## Development Guidelines

### IMPORTANT: Use Frontend Design Skill

**For ANY UI edits to this project, always use the `frontend-design` skill.**

This ensures:
- Consistent terminal aesthetic
- High-quality, production-grade code
- Proper use of design tokens
- Distinctive, non-generic styling

### IMPORTANT: Verify Changes in Browser

**After ANY change to slides, styles, config, or URLs — verify visually using the Chrome extension.**

Workflow:
1. Make the change
2. Confirm dev server is running (`bun run dev`)
3. Use Chrome extension to navigate to `http://localhost:5173/claude-strangelove-ua/`
4. Take a screenshot and confirm the change looks correct before declaring done

### Code Style

- TypeScript strict mode
- Functional React components
- CSS custom properties for theming
- Semantic HTML in slides

## Deployment

Automatic deployment on push to `main` via `.github/workflows/deploy.yml`: `bun install
--frozen-lockfile` → `bun run build` → `actions/upload-pages-artifact` (`./dist`) →
`actions/deploy-pages`. Pages source is **GitHub Actions**, not a `gh-pages` branch
(`bun run deploy` exists only as a manual fallback).

## Image Generation

Use this repo's `generate-image` skill for creating slide visuals. It delegates the
actual generation to the shared **`generate-image`** skill that ships in the **`media`**
plugin (native Codex `image_gen`, or Gemini / ChatGPT driven through a real browser with
your existing logged-in session — no API key), and keeps this repo's convention of
**saving each prompt to a file** so images can be regenerated later.

### Usage

Ask Claude to generate images for slides:
- "Generate an image of a futuristic terminal interface"
- "Create a minimalist diagram showing code compilation"
- "Regenerate the LLM theory infographic with English labels"

Claude will pick a model (Gemini is a strong default for the deck's text-heavy
diagrams), show you the prompt, generate, and iterate with you until it looks right.

### Conventions

- **Images** are saved to `public/` (import in slides with the `?url` suffix).
- **Prompts** are saved to `src/prompts/<name>.json` (same base name as the image)
  with `filename`, `prompt`, `ratio`, `timestamp`, and `model`. This lets you
  reference and regenerate any image later with the same or a tweaked prompt.

See `.claude/skills/generate-image/SKILL.md` for the full workflow.

## Troubleshooting

### `bun install` hangs at "Resolving..."

**Symptom:** `bun install` hangs indefinitely at "Resolving..." or "Resolved, downloaded and extracted [N]"

**Root cause:** The `bun.lock` file may contain URLs to a private registry (e.g., Artifactory) that's unreachable from your network.

**Fix:**
```bash
rm -rf bun.lock bun.lockb node_modules package-lock.json && bun install
```

This regenerates the lockfile using the public npm registry.

**How to diagnose:** Check if `bun.lock` contains private registry URLs:
```bash
grep -n "artifactory\|private\|internal" bun.lock
```

## Git Conventions

- Commit messages: `Add/Update/Fix/Remove [description]`
- Include co-author footer for AI-assisted commits

### Workflow

This is a solo project — commit directly to `main`. No feature branches, no pull requests.

```bash
git add <files>
git commit -m "Add/Fix/Update X"
git push origin main
```

**Auth note:** pushes to `yermilov/claude-strangelove-ua` require the personal `yermilov` GitHub account, not the EMU `yaroslav-yermilov_super` account. If a push returns 403, run `gh auth switch --user yermilov`, push, then switch back with `gh auth switch --user yaroslav-yermilov_super`.
