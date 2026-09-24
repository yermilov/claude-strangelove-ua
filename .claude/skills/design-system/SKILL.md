---
name: design-system
description: Apply the deck's Kubrick design system when creating or modifying slides — two registers (Jost UA on black for the human voice, JetBrains Mono CRT amber for the machine voice), three-tier type scale (hero / heading / body), uppercase letter-spaced headings, one red accent, no glow on slides, act cards / light ring / big board layouts, and the bottom chrome (the flight track — ship = clock, monolith = material — with the terminal hidden until Esc). Tokens and reusable styles live in `src/design-system/`; per-slide layouts in `src/styles/slide-layouts.css`. TRIGGER when creating a new slide component under `src/slides/`, styling slide content, editing CSS, picking colors or fonts, adjusting spacing, modifying tokens in `src/design-system/`, when a hardcoded hex value or px font-size appears in a diff, or building UI chrome for the presentation. Also trigger when the user asks about the Kubrick look, why something is red rather than amber, whether an element should be mono, says the deck doesn't feel cohesive, or asks why an accent color doesn't match the rest.
---

## Scope

This deck runs a **Kubrick skin over the terminal deck**, and the whole system reduces to one rule:

> **Kubrick speaks for the human. The terminal speaks for the machine.**

Slides are Kubrick — flat black, symmetrical, Jost UA set large in capitals, exactly one red, **no glow, no scan lines**. Everywhere the machine speaks — code blocks, agent logs, the input bar, anything marked `.machine` — the original CRT register returns: JetBrains Mono, amber and phosphor green, glow, near-black `#0a0e14`. The audience should see that the machine has started talking before they read a word of it.

That contrast **is the talk's argument** ("Клод Стрейнджлав" — systems built not to fail, that fail where a human trusted the process instead of looking), so it is load-bearing, not decoration. Two ways to get it wrong, and both are common:

- giving a slide element amber, glow or mono because it looks good — that dilutes the machine's voice;
- flattening a code block or the input bar into monochrome for "consistency" — that erases it.

The test for any element is a single question: **is this the machine talking?** Everything else stays Kubrick.

Mechanically the skin is the DOU re-skin technique: `--kubrick-*` tokens are first-class, the old `--terminal-*` names are **aliases re-pointed at them**, and `.machine` hands the original values back on its own subtree. So all ~3000 lines of `slide-layouts.css` render in the new palette for free, and new rules should read `--kubrick-*` directly.

⚠️ **The talk is ONLINE.** Fwdays Tech Summit'26 went fully online (organiser, 10.09.2026), and that
changes what "legible" means. The old premise — a projector in a hall, read from the back row — is
gone. The audience watches a **re-encoded video stream in a window**, so the enemy is H.264, not
throw distance: it halves chroma resolution, smears saturated red on black, and eats thin
low-contrast lines outright.

Practical consequences, and they are the reason several values look "too light" next to a normal
dark theme:

- **Every text colour clears WCAG AA (4.5:1) at BODY size**, not merely at display size — the red and
  the muted grey are used for small letter-spaced labels, which is what a stream destroys first.
- **A border is a line, not a fill.** `--kubrick-rule` exists for borders that carry structure;
  `--kubrick-grey-3` is for fills only. A 1px hairline at 1.3:1 is simply not there after re-encoding.
- **Code sets at the same size as body text** (40px), on the organiser's explicit request.
- Avoid faint large-area gradients and sub-10% tints — they band.

Text caps at 40px, headings at 64px, the title-slide title at 96px. If a slide overflows, **split it** rather than shrinking
text — that's still the design system's first commandment.

**The slot is 35 minutes: 25–30 of talk plus 5–10 of Q&A.** `FlightTrack.tsx` spans the **30**, which
is the number to rehearse against — `TOTAL_TIME` there is the only place a slot change has to land.

## Where things live

| Concern | File |
|---|---|
| Design tokens (colors, type scale, spacing, motion) | `src/design-system/tokens.css` |
| Base layout + headings + lists + links | `src/design-system/base.css` |
| Reusable patterns (text utilities, glow, slide-item, animations) | `src/design-system/patterns.css` |
| Chrome components (input bar, tooltips, code block, rotate hint) | `src/design-system/components.css` |
| Per-slide layouts (one slide each — bio, timeline, VS battle, etc.) | `src/styles/slide-layouts.css` |
| Slide-element React primitives (SlideItem, Emphasis, SlideLink, CodeBlock) | `src/components/SlideElements.tsx` + `src/components/CodeBlock.tsx` |
| Bottom chrome — the flight track and the Esc terminal overlay | `src/components/FlightTrack.tsx` + `.deck-chrome` / `.command-overlay` in `components.css` |
| Kubrick primitives (ActCard, LightRing, BigBoard, Machine) | `src/components/KubrickElements.tsx` |
| The patched Jost webfonts + the script that builds them | `src/fonts/` + `scripts/patch-jost-ukrainian.py` |

Always read `tokens.css` before you write a new style — the token you need probably exists. If you're adding a new token, add it to `tokens.css` with a comment explaining when to reach for it.

## Type scale — exactly three sizes

Yarik's rule (14.09.2026): **a slide has three font sizes, no more.** They are `--font-size-title`,
`--font-size-heading` and `--font-size-text` in `tokens.css`; every other size token is an alias onto
one of them, so a rule written against an old name still lands on a tier.

| Tier | Token | Max | Use |
|---|---|---|---|
| **1 · Title** | `--font-size-title` | 96px | The title of the title slide — nothing else |
| **2 · Heading** | `--font-size-heading` | 64px | The title slide's tagline, and the title of every other slide (h1/h2/h3, `.slide-title`, act-card and light-ring titles) |
| **3 · Text** | `--font-size-text` | 40px | Everything else on a slide: paragraphs, bullets, labels, the speaker credit on the title slide, and code (mono sets at the same size — the organiser asked for big code) |

Aliases: `hero` → title; `h1`/`h2`/`h3` → heading; `body`, `code`, `--slide-text-*`,
`--slide-section-header-*` → text. The `compact`/`dense` variants **no longer shrink anything** — if
a slide does not fit at 40px, split it or narrow the image beside it (that is what the bio slide did),
never add a fourth size. Hierarchy inside a tier comes from weight, colour and capitals, not size.

**Nothing under a slide title may share its tier at a heavier weight.** At the same 64px, a heavier
weight reads as BIGGER — the bio board's «9 РОКІВ / 9 ДНІВ» at 64px/800 out-shouted the 64px/600
«ХТО Я» and Yarik called it hierarchically wrong (24.09.2026). Content under a title sits at the text
tier; set it apart with weight and colour there (the bio figures are now 40px/600 white over grey).

The one deliberate exception is inline `<code>` inside prose at `0.88em`: JetBrains Mono runs
optically larger than Jost, so that factor makes it read as the SAME size, not a smaller one.

**Chrome is not slide type.** The Esc terminal, the captions under the flight track and the tooltips
keep `--font-size-input` / `--font-size-small`.

Verify with computed sizes, not by eye: on each slide every text node should report 96, 64 or 40px at
1920×1080.

## Dark + light themes

- **Dark (default)** — the black room. `#0a0a0a` ground, warm film white `#f2f0eb` text, one red.
- **Light** — **the white void of "2001"**, not a paper fallback: the same warm white becomes the ground, the same near-black becomes the ink, the red stays. Switching mid-talk therefore reads as an act break, not as a brightness control.

The **machine register does not invert**. A terminal is a lit screen in a dark room whichever way round the slide is — so in the white void the machine is the only dark thing on screen. That is deliberate; don't "fix" it.

Switch at runtime with the `light` and `dark` terminal commands. The choice persists in `localStorage` under `theme` and lands as `<html data-theme="light">` (dark is the absence of the attribute).

Overrides live in `tokens.css` under `[data-theme="light"]`, and **only the `--kubrick-*` tokens are restated there** — the `--terminal-*` aliases follow automatically because that selector lands on the same element as `:root`. **Mirror every new `--kubrick-*` token there**, or light mode inherits the dark value and the contrast breaks.

⚠️ **The short form works only on `:root`.** A custom property is substituted at the element that DECLARES it, so `--terminal-white: var(--kubrick-white)` was already resolved up at `:root`: re-pointing `--kubrick-white` on a DESCENDANT never reaches it. Anything deeper in the tree that changes the palette — `.slide-inverse`, `.machine` — must restate the `--terminal-*` aliases by hand. That is why `.presentation:has(.slide-inverse)` in `tokens.css` looks redundant and is not.

## Color palette — black, three greys, one red

Read `--kubrick-*` in `tokens.css`. The constraint is the look:

| Role | Token | Hex (dark) | On `#0a0a0a` |
|---|---|---|---|
| Slide ground | `--kubrick-black` | `#0a0a0a` | — |
| Deeper black — act cards, the void | `--kubrick-ink` | `#050607` | — |
| Text — warm film white, never `#fff` | `--kubrick-white` | `#f2f0eb` | 17.4:1 |
| Body text | `--kubrick-grey-1` | `#b9b7b1` | 9.9:1 |
| Muted text | `--kubrick-grey-2` | `#87857f` | 5.4:1 |
| Panel **fills** | `--kubrick-grey-3` | `#262624` | fill only |
| **Lines** that carry structure | `--kubrick-rule` | `#565550` | 2.7:1 |
| **The only accent** — HAL, and danger | `--kubrick-red` | `#e63946` | 4.8:1 |
| War Room baize — **one** easter-egg use in the deck | `--kubrick-felt` | `#14352a` | — |

There is no second accent, and adding one is the fastest way to break the look. The old `--terminal-orange` now resolves to the red and `--terminal-green` to the white; treat both names as legacy.

**Backgrounds** are flat. No gradients, no patterns, no texture — a Kubrick frame is clean and photographic.

**Glow is OFF on slides** (`--glow-*: none`, `--scanline-opacity: 0`, `--noise-opacity: 0`) and **ON inside `.machine`**, which restores it. Never write a `text-shadow` literal: go through the tokens, so the register decides.

**Machine values** live as `--machine-*` in `tokens.css` (`#0a0e14`, `#f0883e`, `#7ee787`, `#76e4f7`…) and are read by the `.machine` block alone. Do not reference them from a slide rule.

## Bullets and lists

The deck's `ul` and `ol` are styled in `base.css`:

- `ul` → `>` marker (orange, glowing, bold)
- `ol` → numbered counter (green, glowing)

This is **command-line aesthetic** and it survives the re-skin — the `>` is a shape, not a colour, so it stays while its amber becomes red. Don't switch to `•` bullets.

Note the deliberate asymmetry: bullet markers are RED (Kubrick) even though the input bar's prompt `>` is amber (machine). A bullet is you talking; the prompt is the terminal talking.

For richer list items (icon prefix, inline emphasis, reveal animation), use the `<SlideItem>` React component from `src/components/SlideElements.tsx`. Its `prefix` prop accepts `>`, `>>`, `>>>`, `>>>>` for depth.

## Kubrick layouts

Three compositions carry the skin. They live as React components in
`src/components/KubrickElements.tsx`, styled in `slide-layouts.css`:

| Component | What it is | When |
|---|---|---|
| `<ActCard>` | The title-card convention of "2001": one line of type in a deeper black, held long enough to become a pause | Between acts. It is the **punctuation of a 35-minute slot** — it improves rhythm, not just looks |
| `<LightRing>` | Ken Adam's War Room fixture: a luminous ring, dark inside, spilling into the black | Section frame — the ring holds the heading and nothing competes |
| `<BigBoard>` | The wall of displays: a 3×2 grid where exactly one panel is lit (`activeIndex`) | The six controls. **The board never moves between slides**, so the audience keeps its bearings |

Plus `<Machine>` for a panel where the machine speaks (an agent log, a tool trace) that is not a `<CodeBlock>`.

`.slide-inverse` is the fourth: the white void on a single slide, without switching the deck's theme. Use it **sparingly** — its force comes from being rare; today only the final slide uses it.

Two of these repaint the whole frame, and they do it from `.presentation:has(...)` in `tokens.css`, never from inside the slide. A slide cannot paint over its own ancestor's background, and a `position: fixed` pseudo-element at `z-index: -1` lands *behind* `.presentation` rather than in front of it. If you add another full-frame slide type, follow the same pattern.

⚠️ **Percentage padding inside a slide-level box resolves against the SLIDE's width, not the box's.** `padding: 13%` on the 520px light ring computed to 191px a side (13% of the ~1470px slide), left an 89px content box, and pushed the label out of a circle that still looked perfectly centred. Constrain inner content with a percentage `max-width` on the child instead — a percentage *width* does resolve against the grid area.

## Code blocks

The `<CodeBlock>` component renders a macOS-terminal-style window (three traffic-light dots, filename in the header, syntax highlighting). This is iconic; don't redesign it. Inline code uses `<code>` (styled in `base.css`) which renders cyan-bordered against `--terminal-bg-elevated`.

For variants (orange / green inline code), use the `.code-inline--orange` / `.code-inline--green` utility classes from `patterns.css`.

## Bottom bar

The strip at the bottom is `.deck-chrome`, and it holds **one** thing: the flight track (`FlightTrack.tsx`). The separate countdown and progress bar are gone — the track carries both axes on a single line.

**The track is the corridor shot from "2001".** The screen is the whole journey: left edge is 00:00 and slide one, right edge is the end of the talk and the last reveal.

- the **ship** (Discovery One, nose right) sits at `elapsed / 30 min` — it is the CLOCK;
- the **monolith** sits at reveal-weighted deck progress — it is the MATERIAL;
- the gap between them is the pace, with no arithmetic. Ship behind the monolith = ahead of schedule; ship past it = late, and the exhaust, the clock and the **wake** turn red. The wake is the stream-proof one — a 12px exhaust sliver does not survive H.264.

⚠️ **The track is KUBRICK, not machine** — it is the speaker's instrument, so `.deck-chrome` is deliberately absent from the machine block in `tokens.css`. The strip used to be on that list because it WAS the terminal. If you park something machine-ish back in it, mark that element `.machine` rather than re-adding the strip.

⚠️ **The corridor takes no side padding** — the ship crossing the full screen is the brief. The two captions underneath take the gutter instead; the ship's own black background masks the hairline so the corridor is occluded by the hull rather than drawn through it.

**The terminal is not in the frame.** Esc calls it up as `.command-overlay` over the slide, Esc or running a command dismisses it, and it keeps the CRT register because it is the one thing down there that is the machine talking. Everything the talk needs mid-flight — arrows, space, PageUp/PageDown from the clicker — is on the window handler in `useSlideNavigation`, which is what makes the input safe to hide. The clock doubles as the tap target so a phone, which has no Esc key, can still reach it.

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
| Reach for `slide-text-compact` / `dense`, or a `calc()` of a size token, to fit content | They are aliases of TEXT now; a fourth size breaks the three-size rule — split the slide |
| Switch `>` to `•` for bullets | Breaks the command-line aesthetic |
| Add `text-shadow: none` to a new accent heading | Glow is load-bearing for the CRT identity |
| Put per-slide CSS in `design-system/` | DS is for cross-slide reuse; one-slide styles go in `slide-layouts.css` |
| Float a new timer/progress/badge as `position: fixed` | Chrome lives inside `.deck-chrome` |
| Put the flight track on the machine palette, or park the terminal back in the strip | The track is the speaker's voice; only `.command-overlay` is the machine's |
| Set slide prose in mono | Mono is the machine's voice; using it for your own erases the distinction |
| Give a slide element amber, glow or `--machine-*` because it looks good | Same — the machine register has to stay expensive |
| Flatten a code block or the input bar into monochrome | The machine must stay a lit screen, in both themes |
| Re-enable scan lines or glow on slides | A Kubrick frame is clean and photographic |
| Add a 2nd accent colour | The palette is one red, deliberately |
| Darken a text colour below 4.5:1 because it "looks better" | You are optimising for your monitor and against a compressed stream |
| Use `--kubrick-grey-3` for a border | It is a fill; a line needs `--kubrick-rule` or it vanishes on video |
| Use `--kubrick-felt` more than once | It is an easter egg; repeated, it is just a green |
| Add a new `--kubrick-*` token without mirroring under `[data-theme="light"]` | Light theme inherits the dark value and loses contrast |
| Re-point `--kubrick-*` on a descendant and expect `--terminal-*` to follow | Aliases resolve where they are declared — restate them (see Dark + light themes) |
| Type a heading in capitals in the JSX | `text-transform: uppercase` does it; keep the source readable and searchable |

## Validation

After any change touching `src/design-system/` or `src/slides/`:

1. `bunx tsc --noEmit` — typecheck must pass
2. `bun run check:async-slides` — async-slide audit must pass
3. `bun run dev` — start dev server
4. Hard-refresh `http://localhost:5173/claude-strangelove-ua/` to clear Vite's CSS cache
5. Eyeball at least three slides: title (hero), a content slide (heading + bullets), a code-block slide. Confirm: **the two registers are visibly different** — slide type is Jost with no glow, the code block and input bar are mono amber-on-near-black; heading is huge, uppercase and red; body text is back-row readable; `>` markers are red; bottom bar is wired
6. Check the light theme too (`light` command, or seed `localStorage.theme`): the ground should be the warm white void with the machine bar still dark. A Ukrainian slide must render **entirely** in Jost — if і/ї/є/ґ look like a different typeface, the patched font (`src/fonts/`) has not loaded; see `src/index.css`
7. If touching token sizes, also resize the window to ~768px and confirm the layout still reads (no overflow, no chrome collision)
8. **`bun run pdf`** — the organiser needs the deck as a FILE (deadline: Friday 2 October). It writes
   `dist/claude-strangelove-ua.pdf` at 1920×1080. Run it after any structural change; it is also the
   only end-to-end test of the export-mode settle handshake

## When to evolve the system

The design system is **not frozen**. If you find yourself fighting it — needing a 5th color, a new bullet style, a different text scale — that's a signal to update `tokens.css` or `patterns.css` rather than work around it locally. But pause first and ask: is the friction telling me the slide is wrong, or is the system wrong? Usually it's the slide. Sometimes it's the system, and then change it deliberately, with a comment explaining why.
