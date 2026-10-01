import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fontFamily } from './claude-code';
import { ALIAS_RULE } from './ImportAliasSession';
import { MdLine, V } from './RememberRule';

/* «рецепт 2: агентська документація», second reveal — AGENTS.md in VS Code. It
 * opens on the rule the agent has just written (the `@/` alias, from
 * RememberAliasSession) and then more rules of the same kind land one by one,
 * faster and faster, until the file runs off the bottom of the editor. STAGED:
 * the project and its conventions are invented, each a small house rule the
 * agent would otherwise have to be told in the chat — the kind the later recipes
 * turn into skills and lint checks. Frame is the clock. */

export const FPS = 30;
// the terminal's own size, with larger type: on the slide the two windows are a matched pair
export const WIDTH = 1200;
export const HEIGHT = 900;

const HEAD = ['# AGENTS.md', '', 'Money app: React + Vite web, Hono API, pnpm.', '', '## Conventions', ''];

const RULES = [
  ALIAS_RULE,
  '- Log with `logger` from `@/lib/log`, not `console`.',
  '- Dates go through `date-fns`; `moment` is banned.',
  '- Money is integer kopecks (`amountMinor`).',
  '- Named exports only, no `export default`.',
  '- Tests sit next to the code: `foo.test.ts`.',
  '- No `any`: shared types live in `@app/shared`.',
  '- UI strings go through `t()`, never inline.',
  '- Fetch only via `apiClient`, never raw `fetch`.',
  '- Feature flags via `useFlag()`, not `process.env`.',
  '- Register every new page in `routes.ts`.',
  '- Colours come from tokens, never hex in a component.',
  '- Migrations are append-only: never edit an old one.',
  '- One React component per file.',
  '- Hooks start with `use` and live in `@/hooks`.',
  '- Ask before adding a dependency.',
  '- Run `pnpm lint && pnpm test` before every commit.',
  '- Error messages are user-facing Ukrainian copy.',
  '- Icons only from `lucide-react`.',
  '- Forms use `react-hook-form` + `zod` schemas.',
  '- Never commit `.env*` files.',
  '- Keep API handlers thin: logic goes in `services/`.',
  '- Dates in the API are ISO strings in UTC.',
  '- Every `useEffect` cleans up after itself.',
];

// the first rule is there when the file opens; the rest arrive one by one,
// each gap shorter than the one before, down to a floor
const FIRST = 36;
const arrivals: number[] = [0];
{
  let f = FIRST;
  let gap = 45;
  for (let i = 1; i < RULES.length; i++) {
    arrivals.push(f);
    f += gap;
    gap = Math.max(12, Math.round(gap * 0.88));
  }
}
export const DURATION = arrivals[arrivals.length - 1] + 75;
export const STILL_FRAME = DURATION - 1;

const EFONT = 34;
const ELINE = 46;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const AgentsMdGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = arrivals.filter((a) => frame >= a).length;
  const last = arrivals[shown - 1];

  const lines = [...HEAD, ...RULES.slice(0, shown)];
  const editorH = HEIGHT - 44 - 44 - 36 - 34;
  const visible = Math.floor(editorH / ELINE);
  // the editor follows the newest line, scrolling smoothly once the file is taller than the view
  const target = Math.max(0, lines.length - visible);
  const prevTarget = Math.max(0, lines.length - 1 - visible);
  const scroll = interpolate(frame - last, [0, 8], [prevTarget, target], clamp);
  const thumbH = Math.max(40, (visible / Math.max(lines.length, visible)) * editorH);
  const thumbTop = (scroll / Math.max(lines.length, visible)) * editorH;

  return (
    <AbsoluteFill style={{ background: V.bg, fontFamily, color: V.text, fontSize: EFONT }}>
      {/* title bar */}
      <div style={{ height: 44, background: V.bar, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10, borderBottom: `1px solid ${V.border}` }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ flex: 1, textAlign: 'center', color: V.gutter, fontSize: 19, marginRight: 60 }}>AGENTS.md — money-app</span>
      </div>
      {/* tab */}
      <div style={{ height: 44, background: V.tabIdle, display: 'flex', borderBottom: `1px solid ${V.border}` }}>
        <div style={{ background: V.tab, borderTop: `2px solid ${V.accent}`, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 19 }}>
          <span style={{ color: '#519aba', fontWeight: 700 }}>M↓</span>
          <span>AGENTS.md</span>
          <span style={{ color: V.gutter }}>×</span>
        </div>
      </div>
      {/* breadcrumb */}
      <div style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 22px', color: V.gutter, fontSize: 17 }}>
        money-app › AGENTS.md
      </div>
      {/* editor */}
      <div style={{ position: 'relative', height: editorH, overflow: 'hidden' }}>
        <div style={{ transform: `translateY(${-scroll * ELINE}px)` }}>
          {lines.map((t, i) => {
            const r = i - HEAD.length;
            const isNew = r >= 0 && r === shown - 1;
            const flash = isNew ? interpolate(frame - last, [0, 30], [1, 0.25], clamp) : 0;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  height: ELINE,
                  lineHeight: `${ELINE}px`,
                  background: isNew ? `rgba(46,160,67,${0.3 * flash})` : 'transparent',
                  opacity: isNew ? interpolate(frame - last, [0, 6], [0, 1], clamp) : 1,
                }}
              >
                <span style={{ width: 56, textAlign: 'right', color: isNew ? V.gutterActive : V.gutter, paddingRight: 10, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ width: 4, background: isNew ? V.added : 'transparent', marginRight: 14, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'pre', overflow: 'hidden' }}>
                  <MdLine t={t} />
                </span>
              </div>
            );
          })}
        </div>
        {/* scrollbar: the thumb shrinks as the file grows */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: 14, height: '100%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', right: 2, top: thumbTop, width: 10, height: thumbH, background: 'rgba(121,121,121,0.45)', borderRadius: 3 }} />
      </div>
      {/* status bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 34,
          background: V.bar,
          borderTop: `1px solid ${V.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '0 18px',
          fontSize: 16,
          color: V.gutter,
        }}
      >
        <span>⎇ main</span>
        <span style={{ flex: 1 }} />
        <span>Ln {lines.length}</span>
        <span>UTF-8</span>
        <span>Markdown</span>
      </div>

    </AbsoluteFill>
  );
};
