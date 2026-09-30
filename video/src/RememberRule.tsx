import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Block, C, FONT, KeyCap, LINE, Row, Spinner, Tool, fontFamily } from './claude-code';
import data from './claude-md-steps.json';

/* «рецепт 2: агентська документація» — the terminal on the left, CLAUDE.md in
 * VS Code on the right, one composition so the rule lands in the file at the
 * exact frame the agent writes it.
 *
 * What is real, and from where:
 * - The prompt is Yarik's, verbatim, from ~/.claude/history.jsonl — juggernaut,
 *   06.06.2026 20:42, session a8be2f5d. That session's transcript is gone (Claude
 *   Code keeps them 30 days), so the agent's side is reconstructed from what it
 *   COMMITTED 33 minutes later: bd712975 «Scaffold initial juggernaut task
 *   tracker», which added «## UI design rule (hard)» and «## Development
 *   procedure». The diff lines are quoted from that commit; the single
 *   Update(CLAUDE.md) call around them is the reconstruction.
 * - Every VS Code view is the real CLAUDE.md at a real commit, scrolled to a rule
 *   that commit added, with the lines the commit added marked in the gutter
 *   (claude-md-steps.json, generated from juggernaut's `git log -- CLAUDE.md` by
 *   video/scripts/claude-md-steps.py). The date, rule and line counts are that
 *   commit's own.
 * Long lines are cut with «…»; time is compressed. */

export const FPS = 30;
export const DURATION = 1050;
export const WIDTH = 2140;
export const HEIGHT = 1040;

type Line = { n: number; t: string; add: boolean };
type Step = { h: string; date: string; total: number; rules: number; label: string; lines: Line[] };
const BEFORE = data.before as Step;
const STEPS = data.steps as Step[];

const PROMPT =
  'obviously use /frontend-design:frontend-design for web ui design and add instruction to CLAUDE.md to always do it for any ui changes\n' +
  'document in CLAUDE.md that development procedure:\n' +
  '(1) planning session\n' +
  '(2) implementation\n' +
  '(3) local manual testing\n' +
  '(4) running all checks locally\n' +
  '(5) commit and push to remote\n' +
  '(6) wait and verify deployment\n' +
  '(7) manual prod testing';

// Quoted from bd712975's diff to CLAUDE.md, cut to the terminal's width.
const ADDED = [
  '## UI design rule (hard)',
  '**Any user-facing UI change in this repo — new pages, new components, layout or visual tweaks — must go through the `/frontend-design:frontend-design` skill**',
  '## Development procedure',
  'Every change to juggernaut follows these seven steps in order. Do not skip any.',
  '1. **Planning session** — write a plan file under `~/.claude/plans/`.',
  '2. **Implementation** — make the code changes locally.',
  '3. **Local manual testing** — actually click through the affected UI',
  '4. **Run all checks locally** — `pnpm -r run typecheck`',
  '5. **Commit and push to remote** — directly on `main`',
  '6. **Wait and verify deployment** — Railway auto-deploys from `main`.',
  '7. **Manual prod testing** — repeat the relevant happy-path scenarios',
];

const T = {
  typeStart: 20,
  typeEnd: 250,
  enter: 268,
  think: 276,
  update: 340,
  lapseStart: 450,
  stepFrames: 32,
};

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ---------- the terminal (left) ----------
const TERM_W = 1200;

const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (f: number) => frame >= f;
  const typed = PROMPT.slice(0, Math.round(interpolate(frame, [T.typeStart, T.typeEnd], [0, PROMPT.length], clamp)));
  const caretOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: TERM_W, height: HEIGHT, background: C.bg, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height: 56, background: C.chrome, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 18, height: 18, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ flex: 1, textAlign: 'center', color: C.dim, fontSize: 24, marginRight: 90 }}>~/src/juggernaut — claude</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '0 44px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {at(T.enter) && (
          <Block>
            <div style={{ background: C.userBg, padding: '4px 14px' }}>
              {PROMPT.split('\n').map((l, i) => (
                <Row key={i} style={{ paddingLeft: i === 0 ? 0 : FONT * 1.2 }}>
                  {i === 0 ? <span style={{ color: C.dim }}>{'> '}</span> : null}
                  {l}
                </Row>
              ))}
            </div>
          </Block>
        )}

        {at(T.think) && !at(T.update) && (
          <Block>
            <Spinner label="Thinking" />
          </Block>
        )}

        {at(T.update) && (
          <Block>
            <Tool name="Update" arg="CLAUDE.md" dot={C.ok} />
            {ADDED.map((l, i) => (
              <Row
                key={i}
                style={{
                  background: C.addBg,
                  paddingLeft: FONT * 2.6,
                  whiteSpace: 'pre',
                  opacity: interpolate(frame, [T.update + i * 2, T.update + i * 2 + 6], [0, 1], clamp),
                }}
              >
                + {cut(l, 48)}
              </Row>
            ))}
          </Block>
        )}

        <div style={{ marginTop: FONT * 0.8, border: `2px solid ${C.dim}`, borderRadius: 10, padding: '8px 20px', minHeight: FONT * LINE }}>
          <Row>
            <span style={{ color: C.dim }}>{'> '}</span>
            {at(T.typeStart) && !at(T.enter) ? typed : ''}
            <span style={{ background: caretOn ? C.text : 'transparent', color: C.bg }}> </span>
          </Row>
        </div>
      </div>
      <KeyCap at={T.enter - 6} label="⏎ enter" />
    </div>
  );
};

// ---------- VS Code (right) ----------
const V = {
  bg: '#1f1f1f',
  bar: '#181818',
  border: '#2b2b2b',
  text: '#cccccc',
  gutter: '#6e7681',
  gutterActive: '#cccccc',
  heading: '#569cd6',
  code: '#ce9178',
  added: '#2ea043',
  tab: '#1f1f1f',
  tabIdle: '#181818',
  accent: '#0078d4',
};
const VS_X = TERM_W + 40;
const VS_W = WIDTH - VS_X;
const EFONT = 25;
const ELINE = 35;

// Minimal markdown colouring, the way VS Code's Dark Modern paints a .md file.
const MdLine: React.FC<{ t: string }> = ({ t }) => {
  if (/^#{1,6} /.test(t)) return <span style={{ color: V.heading, fontWeight: 700 }}>{t}</span>;
  const parts = t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <span key={i} style={{ color: V.heading, fontWeight: 700 }}>
            {p}
          </span>
        ) : p.startsWith('`') ? (
          <span key={i} style={{ color: V.code }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

const stepAt = (frame: number): { step: Step; since: number; index: number } => {
  if (frame < T.update) return { step: BEFORE, since: 0, index: -1 };
  if (frame < T.lapseStart) return { step: STEPS[0], since: T.update, index: 0 };
  const i = Math.min(STEPS.length - 1, 1 + Math.floor((frame - T.lapseStart) / T.stepFrames));
  return { step: STEPS[i], since: T.lapseStart + (i - 1) * T.stepFrames, index: i };
};

const fmtDate = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

const VSCode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { step, since, index } = stepAt(frame);
  const flash = interpolate(frame - since, [0, 24], [1, 0.25], clamp);
  const pop = index >= 0 ? spring({ frame: frame - since, fps, config: { damping: 14 } }) : 1;
  const editorH = HEIGHT - 44 - 44 - 36 - 34;
  const firstLine = step.lines[0]?.n ?? 1;
  const thumbH = Math.max(18, (step.lines.length / step.total) * editorH);
  const thumbTop = ((firstLine - 1) / step.total) * editorH;

  return (
    <div
      style={{
        position: 'absolute',
        left: VS_X,
        top: 0,
        width: VS_W,
        height: HEIGHT,
        background: V.bg,
        borderRadius: 14,
        overflow: 'hidden',
        color: V.text,
        fontSize: EFONT,
      }}
    >
      {/* title bar */}
      <div style={{ height: 44, background: V.bar, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10, borderBottom: `1px solid ${V.border}` }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ flex: 1, textAlign: 'center', color: V.gutter, fontSize: 19, marginRight: 60 }}>CLAUDE.md — juggernaut</span>
      </div>
      {/* tab */}
      <div style={{ height: 44, background: V.tabIdle, display: 'flex', borderBottom: `1px solid ${V.border}` }}>
        <div style={{ background: V.tab, borderTop: `2px solid ${V.accent}`, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 19 }}>
          <span style={{ color: '#519aba', fontWeight: 700 }}>M↓</span>
          <span>CLAUDE.md</span>
          <span style={{ color: V.gutter }}>×</span>
        </div>
      </div>
      {/* breadcrumb */}
      <div style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 22px', color: V.gutter, fontSize: 17 }}>
        juggernaut › CLAUDE.md
      </div>
      {/* editor */}
      <div style={{ position: 'relative', height: editorH, overflow: 'hidden' }}>
        {step.lines.map((l) => (
          <div
            key={`${step.h}-${l.n}`}
            style={{
              display: 'flex',
              height: ELINE,
              lineHeight: `${ELINE}px`,
              background: l.add && index >= 0 ? `rgba(46,160,67,${0.28 * flash})` : 'transparent',
            }}
          >
            <span style={{ width: 70, textAlign: 'right', color: l.add && index >= 0 ? V.gutterActive : V.gutter, paddingRight: 12, flexShrink: 0 }}>{l.n}</span>
            <span style={{ width: 4, background: l.add && index >= 0 ? V.added : 'transparent', marginRight: 14, flexShrink: 0 }} />
            <span style={{ whiteSpace: 'pre', overflow: 'hidden' }}>
              <MdLine t={l.t} />
            </span>
          </div>
        ))}
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
        <span>Ln {step.total}</span>
        <span>UTF-8</span>
        <span>Markdown</span>
      </div>

      {/* the talk's annotation, not VS Code: the commit's date and how much the file holds */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          bottom: 56,
          padding: '14px 22px',
          background: 'rgba(10,10,10,0.88)',
          border: `3px solid ${C.mark}`,
          borderRadius: 12,
          textAlign: 'right',
          transform: `scale(${0.92 + 0.08 * pop})`,
          transformOrigin: 'bottom right',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: '#f2f0eb' }}>{fmtDate(step.date)}</div>
        <div style={{ fontSize: 26, color: '#f2f0eb', marginTop: 4 }}>
          <span style={{ color: C.mark, fontWeight: 700 }}>{step.rules}</span> правил
        </div>
        <div style={{ fontSize: 26, color: '#b9b7b1' }}>{step.total} рядків</div>
      </div>
    </div>
  );
};

export const RememberRule: React.FC = () => (
  <AbsoluteFill style={{ background: '#0a0a0a', fontFamily, fontSize: FONT, lineHeight: LINE, color: C.text }}>
    <Terminal />
    <VSCode />
  </AbsoluteFill>
);
