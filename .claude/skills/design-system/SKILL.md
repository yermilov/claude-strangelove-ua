---
name: design-system
description: Apply the deck's terminal-CRT design system when creating or modifying slides — three-tier type scale (hero / heading / body), JetBrains Mono throughout, `>` bullet markers with phosphor glow, scan-line + noise CRT overlays, orange / green / cyan palette on deep black, bottom bar chrome wrapping Timer + Input + Progress. Tokens and reusable styles live in `src/design-system/`; per-slide layouts in `src/styles/slide-layouts.css`. TRIGGER when creating a new slide component under `src/slides/`, styling slide content, editing CSS, picking colors or fonts, adjusting spacing, modifying tokens in `src/design-system/`, when a hardcoded hex value or px font-size appears in a diff, or building UI chrome for the presentation. Also trigger when the user asks for the terminal aesthetic, says the deck doesn't feel cohesive, or asks why an accent color doesn't match the rest.
---

## Scope

This deck has a **terminal-CRT identity** — JetBrains Mono on deep black, warm orange / phosphor green / cyan accents, `>` markers, scan lines, subtle text-shadow glow. The aesthetic is **load-bearing**: removing the mono font, the glow, or the `>` markers breaks the look. Stay inside the system; reach for new tokens or new patterns only when nothing existing fits.

The system is built for a **conference hall talk at 1920×1080+**: all text must be readable from the back row. Body text caps at 40px, heading at 80px. If a slide overflows, **split it** rather than shrinking text — that's the design system's first commandment.

## Where things live

| Concern | File |
|---|---|
| Design tokens (colors, type scale, spacing, motion) | `src/design-system/tokens.css` |
| Base layout + headings + lists + links | `src/design-system/base.css` |
| Reusable patterns (text utilities, glow, slide-item, animations) | `src/design-system/patterns.css` |
| Chrome components (input bar, tooltips, code block, rotate hint) | `src/design-system/components.css` |
| Per-slide layouts (one slide each — bio, timeline, VS battle, etc.) | `src/styles/slide-layouts.css` |
| Slide-element React primitives (SlideItem, Emphasis, SlideLink, CodeBlock) | `src/components/SlideElements.tsx` + `src/components/CodeBlock.tsx` |

Always read `tokens.css` before you write a new style — the token you need probably exists. If you're adding a new token, add it to `tokens.css` with a comment explaining when to reach for it.

## Type scale — three tiers + hero exception

Read `--font-size-*` in `tokens.css` for the canonical values. The deck uses **only four sizes**:

| Tier | Token | Use |
|---|---|---|
| **Hero** | `--font-size-hero` (~96px max) | Title slide only |
| **Heading** | `--font-size-h1` / `--font-size-h2` (~80px max) | Section heading per slide. `h1` is the default; `h2` is the same size but green |
| **Body** | `--font-size-body` (~40px max) | Paragraphs, list items, default text |
| **Code** | `--font-size-code` (~24px max) | Inline code and code blocks |

`--font-size-h3` exists but is rarely used and not part of the canonical scale. If you want to write h3, ask whether you actually need a third heading tier — usually you can structure it as body with a `.section-header` label above.

**Body variants** — `--slide-text-compact` and `--slide-text-dense` are escape hatches for legacy slides with too much content. **Do not reach for them.** If a slide needs them, split the slide instead. The hall-readable default is `--slide-text-normal` which equals `--font-size-body`.

All sizes use `clamp(min, preferred, max)` so they scale smoothly from phone to 1920px without breakpoint cliffs.

## Dark + light themes

The deck ships **two theme variants**:

- **Dark (default)** — deep black CRT terminal with full phosphor glow, scan-line + noise overlays. The original identity.
- **Light** — "paper terminal": warm cream `#f5efe6` background, darker amber / green / blue accents, glow text-shadow at reduced alpha, **scan lines and noise dropped entirely** (light mode is a paper metaphor, not a CRT).

Switch at runtime with the `light` and `dark` terminal commands. The choice persists in `localStorage` under the key `theme`. The active variant lives on the root element as `<html data-theme="light">` (dark is the absence of the attribute).

Light-theme overrides live in `tokens.css` under the `[data-theme="light"]` selector. Only tokens that need to differ for light are overridden — spacing, motion, type scale, radii are theme-agnostic. **If you add a new accent or background token to `:root`, mirror it under `[data-theme="light"]`.** Otherwise the light theme will inherit the dark value and the contrast will break.

CRT effects are gated by the `--scanline-opacity` and `--noise-opacity` tokens, which are set to `0` in light theme. Don't hardcode CRT visuals — always go through these tokens so the theme switch works.

## Color palette — four accents + neutrals

Read `--terminal-*` in `tokens.css`. The accent palette is small:

| Color | Token | Use |
|---|---|---|
| Orange (Claude amber) | `--terminal-orange` | h1, `>` markers, primary emphasis, input prompt, focus border |
| Phosphor green | `--terminal-green` | h2, command names, success state, ordered-list counters |
| Cyan | `--terminal-cyan` | Inline code, hyperlink hover, technical highlights |
| Blue | `--terminal-blue` | h3, default link color, secondary technical accent |

Plus `--terminal-purple` and `--terminal-red` exist for code-block syntax highlighting; do not use them as primary slide accents.

**Backgrounds** are always `--terminal-bg` (deep black) or `--terminal-bg-elevated` (slightly lifted). No gradients, no patterns. The CRT scan-line + noise overlays in `.presentation::before` / `::after` provide all the texture.

**Glow** is load-bearing. Headings, `>` markers, prompt `>`, and accent text use `text-shadow: var(--glow-text-*)`. Removing the glow makes the deck look like a generic web page. When you add new accent text, add the glow too.

## Bullets and lists

The deck's `ul` and `ol` are styled in `base.css`:

- `ul` → `>` marker (orange, glowing, bold)
- `ol` → numbered counter (green, glowing)

This is **command-line aesthetic**. Don't switch to `•` bullets — that breaks the identity.

For richer list items (icon prefix, inline emphasis, reveal animation), use the `<SlideItem>` React component from `src/components/SlideElements.tsx`. Its `prefix` prop accepts `>`, `>>`, `>>>`, `>>>>` for depth.

## Code blocks

The `<CodeBlock>` component renders a macOS-terminal-style window (three traffic-light dots, filename in the header, syntax highlighting). This is iconic; don't redesign it. Inline code uses `<code>` (styled in `base.css`) which renders cyan-bordered against `--terminal-bg-elevated`.

For variants (orange / green inline code), use the `.code-inline--orange` / `.code-inline--green` utility classes from `patterns.css`.

## Bottom bar

Timer, terminal input, and slide progress live in a single `.input-bar` strip pinned to the bottom of `.presentation` (see `components.css`). They are **inline flex children**, not absolutely-positioned floating elements. If you add a new piece of chrome that should live next to the input, put it inside `.input-bar`; don't add another fixed-position element.

The slide progress bar appears only after the deck is past 50% (`(currentSlide + 1) / slides.length > 0.5` in `Presentation.tsx`) — early slides don't show progress so the audience focuses on opening framing.

## CRT effects

Three layers create the CRT identity:

1. **Scan lines** — `repeating-linear-gradient` on `.presentation::before`
2. **Fractal noise** — SVG `feTurbulence` data URI on `.presentation::after`
3. **Phosphor glow** — `text-shadow` on all accent text and markers

The intensities are tokenized: `--scanline-opacity`, `--noise-opacity`. Tune these globally rather than overriding per-slide.

On mobile (`max-width: 768px and (pointer: coarse)`), `patterns.css` reduces scan-line opacity and drops the noise overlay to reclaim frame budget. Honor this — phones can't paint the full effect smoothly.

## Spacing, motion, radii

Read `tokens.css`. There's one scale of each:

- **Spacing** — `--space-xs` (4px) → `--space-3xl` (96px). Use these, never raw px.
- **Radii** — `--radius-card` (8px) is the canonical card radius. Inputs, tooltips, code blocks all use it.
- **Motion** — `--transition-fast` / `-normal` / `-slow` for duration; `--ease` for the single deck-wide easing curve.

## Creating a new slide

1. Create `src/slides/MyNewSlide.tsx` exporting a `SlideDefinition` (see existing slides for shape).
2. Use the React primitives from `src/components/SlideElements.tsx`: `SlideItem` for bullets, `Emphasis` for inline coloured text, `SlideLink` for URLs.
3. Use design tokens for any inline styles (`var(--terminal-orange)`, never `#f0883e`).
4. If the slide needs a layout that doesn't exist (new flex/grid arrangement), add a class scoped to that slide in `src/styles/slide-layouts.css`. Don't add it to `design-system/` unless multiple slides will reuse it.
5. Cap content at ~6 bullets or ~4 paragraphs per slide. If you need more, split.
6. Run `bun run dev` and verify in the browser. Hard-refresh once after CSS changes so Vite picks up the new tokens.

## Anti-patterns — do not

| Don't | Reason |
|---|---|
| Hardcode hex colours (`color: #f0883e`) | Use tokens; the palette is centrally tunable |
| Hardcode px font sizes | Use `clamp()` tokens; they handle hall + phone |
| Reach for `slide-text-compact` / `dense` to fit content | Split the slide instead — back-row readability matters |
| Switch `>` to `•` for bullets | Breaks the command-line aesthetic |
| Add `text-shadow: none` to a new accent heading | Glow is load-bearing for the CRT identity |
| Put per-slide CSS in `design-system/` | DS is for cross-slide reuse; one-slide styles go in `slide-layouts.css` |
| Float a new timer/progress/badge as `position: fixed` | Chrome lives inside `.input-bar` |
| Introduce a serif or sans-serif body font | Mono everywhere is load-bearing |
| Remove the scan-line / noise overlays for a "cleaner" look | They are the CRT identity |
| Add a 5th accent colour | The palette is intentionally constrained |
| Add a new accent token to `:root` without mirroring under `[data-theme="light"]` | Light theme will inherit the dark value and lose contrast |
| Hardcode scan-line or noise visuals directly (instead of through `--scanline-opacity` / `--noise-opacity`) | Light theme can't disable them |

## Validation

After any change touching `src/design-system/` or `src/slides/`:

1. `bunx tsc --noEmit` — typecheck must pass
2. `bun run check:async-slides` — async-slide audit must pass
3. `bun run dev` — start dev server
4. Hard-refresh `http://localhost:5173/claude-strangelove-ua/` to clear Vite's CSS cache
5. Eyeball at least three slides: title (hero), a content slide (heading + bullets), a code-block slide. Confirm: heading is huge and glowing, body text is back-row readable, `>` markers are orange, bottom bar is wired
6. If touching token sizes, also resize the window to ~768px and confirm the layout still reads (no overflow, no chrome collision)

## When to evolve the system

The design system is **not frozen**. If you find yourself fighting it — needing a 5th color, a new bullet style, a different text scale — that's a signal to update `tokens.css` or `patterns.css` rather than work around it locally. But pause first and ask: is the friction telling me the slide is wrong, or is the system wrong? Usually it's the slide. Sometimes it's the system, and then change it deliberately, with a comment explaining why.
