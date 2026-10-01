import React from 'react';

/* «рецепт 1: слідкуйте за тим, що робить ваш агент» — a STAGED scene (Yarik asked
 * for a simpler example than the statusLine replay, 02.10.2026). Nothing here is
 * quoted from a transcript. The agent is about to create a file whose imports climb
 * out with `../../` although the project imports everything through the `@/`
 * alias; the human reads the new file in the permission prompt, presses esc and
 * states the rule; the agent rewrites the imports. A simple convention on purpose:
 * the later recipes write it down and then turn it into a lint check.
 *
 * The prompt follows Claude Code's own create-file dialog, so it looks like the
 * CLI. Frame is the clock — no timers, no CSS animation. */

import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Block, C, FONT, KeyCap, LINE, Marked, Result, Row, Spinner, Tool, fontFamily } from './claude-code';

/* «рецепт 2: агентська документація» plays the SAME situation with one change
 * (`remember`): the correction also asks the agent to remember the rule — in
 * AGENTS.md (`'agents'`, the RememberAliasSession composition) or, on the
 * skills slide, in the frontend-conventions skill instead (`'skill'`, the
 * SkillAliasSession composition) — and the agent writes it there instead of
 * re-running the checks. */

export const FPS = 30;
export const DURATION = 780;
export const REMEMBER_DURATION = 840;
export const SKILL_DURATION = 900;
// the frame the PDF export shows instead of the video: the climbing imports
// marked, «Interrupted», and the correction typed out
export const STILL_FRAME = 400;
// «рецепт 2»'s still is its last frame: the rule written into AGENTS.md
export const REMEMBER_STILL_FRAME = REMEMBER_DURATION - 1;

// ---------- timeline (frames) ----------
const T_FIX = {
  read: 24,
  create: 70,
  mark1: 112,
  mark2: 128,
  mark3: 144,
  esc: 200,
  interrupted: 208,
  typeStart: 236,
  typeEnd: 380,
  enter: 410,
  think: 418,
  write: 480,
  check: 560,
  checkDone: 610,
};
// the longer correction takes longer to type; everything after it moves on
const T_REMEMBER = { ...T_FIX, typeEnd: 440, enter: 470, think: 478, write: 540, remember: 620 };
const T_SKILL = { ...T_FIX, typeEnd: 490, enter: 520, think: 528, write: 590, remember: 670 };

const REQUEST = 'додай кнопку «експорт у CSV» на сторінку транзакцій';
const FIX = 'ніяких ../../ — у нас усі імпорти через аліас @/';
const REMEMBER = `${FIX}. запам'ятай це правило в AGENTS.md`;
const REMEMBER_SKILL = `${FIX}. додай це правило в скіл frontend-conventions, а не в AGENTS.md`;
const SKILL_FILE = '.claude/skills/frontend-conventions/SKILL.md';
export const ALIAS_RULE = '- Imports go through the `@/` alias, never `../../`.';

const FILE = 'apps/web/src/pages/transactions/ExportCsvButton.tsx';

// a line of the new file in Claude Code's create view: line number and code
const CodeRow: React.FC<{ n: number; add?: boolean; children: React.ReactNode }> = ({ n, add, children }) => (
  <Row style={{ background: add ? C.addBg : 'transparent', paddingLeft: FONT * 0.4 }}>
    <span style={{ color: C.dim }}>{String(n).padStart(2)} </span>
    {children}
  </Row>
);

const from = (path: React.ReactNode) => (
  <>
    {' '}from '<>{path}</>'
  </>
);

// ---------- scene ----------
export const ImportAliasSession: React.FC<{ remember?: 'agents' | 'skill' }> = ({ remember }) => {
  const frame = useCurrentFrame();
  const T: typeof T_REMEMBER =
    remember === 'skill' ? T_SKILL : remember === 'agents' ? T_REMEMBER : { ...T_FIX, remember: Infinity };
  const CORRECTION = remember === 'skill' ? REMEMBER_SKILL : remember === 'agents' ? REMEMBER : FIX;
  const target = remember === 'skill' ? SKILL_FILE : 'AGENTS.md';
  const at = (f: number) => frame >= f;

  const typed = CORRECTION.slice(
    0,
    Math.round(interpolate(frame, [T.typeStart, T.typeEnd], [0, CORRECTION.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })),
  );
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  const dialogOpen = at(T.create) && !at(T.interrupted);
  const choice = at(T.esc) ? 3 : 1;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily, fontSize: FONT, lineHeight: LINE, color: C.text }}>
      {/* window chrome, same grammar as the deck's CodeBlock */}
      <div style={{ height: 56, background: C.chrome, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 18, height: 18, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ flex: 1, textAlign: 'center', color: C.dim, fontSize: 24, marginRight: 90 }}>~/src/money-app — claude</span>
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
        {/* the tail of the previous task, so the window reads as a session in progress */}
        <Block>
          <Tool name="Update" arg="apps/web/src/pages/transactions/index.tsx" dot={C.ok} />
          <Result lines={['Updated with 6 additions and 2 removals']} />
        </Block>
        <Block>
          <Tool name="Bash" arg="pnpm test --filter web" dot={C.ok} />
          <Result lines={['142 pass', '0 fail', 'Ran 142 tests across 19 files. [6.20s]']} />
        </Block>

        <Block>
          <div style={{ background: C.userBg, padding: '4px 14px' }}>
            <Row>
              <span style={{ color: C.dim }}>{'> '}</span>
              {REQUEST}
            </Row>
          </div>
        </Block>

        {at(T.read) && (
          <Block>
            <Tool name="Read" arg="apps/web/src/pages/transactions/index.tsx" dot={C.ok} />
            <Result lines={['Read 86 lines']} />
          </Block>
        )}

        {at(T.create) && !dialogOpen && (
          <Block>
            <Tool name="Write" arg="ExportCsvButton.tsx" dot={C.err} />
            <Result color={C.err} lines={['Interrupted · What should Claude do instead?']} />
          </Block>
        )}

        {dialogOpen && (
          <div
            style={{
              marginTop: FONT * 0.7,
              border: `2px solid ${C.permission}`,
              borderRadius: 12,
              padding: '14px 26px',
            }}
          >
            <Row style={{ color: C.permission, fontWeight: 700 }}>Create file</Row>
            <Row style={{ color: C.dim }}>{FILE}</Row>
            <div style={{ marginTop: 10 }}>
              <CodeRow n={1}>import {'{'} Button {'}'}{from(<><Marked from={T.mark1}>../../</Marked>components/ui/button</>)}</CodeRow>
              <CodeRow n={2}>import {'{'} toCsv {'}'}{from(<><Marked from={T.mark2}>../../</Marked>lib/csv</>)}</CodeRow>
              <CodeRow n={3}>import {'{'} useTransactions {'}'}</CodeRow>
              <CodeRow n={4}>{'  '}{from(<><Marked from={T.mark3}>../../</Marked>hooks/transactions</>)}</CodeRow>
              <CodeRow n={5}>…</CodeRow>
            </div>
            <Row style={{ marginTop: 14 }}>Do you want to create ExportCsvButton.tsx?</Row>
            {['Yes', 'Yes, allow all edits this session', 'No, and tell Claude what to do differently (esc)'].map((o, i) => (
              <Row key={o} style={{ color: choice === i + 1 ? C.permission : C.text }}>
                {choice === i + 1 ? '❯ ' : '  '}
                {i + 1}. {o}
              </Row>
            ))}
          </div>
        )}

        {at(T.enter) && (
          <Block>
            <div style={{ background: C.userBg, padding: '4px 14px' }}>
              <Row>
                <span style={{ color: C.dim }}>{'> '}</span>
                {CORRECTION}
              </Row>
            </div>
          </Block>
        )}

        {at(T.think) && !at(T.write) && (
          <Block>
            <Spinner label="Thinking" />
          </Block>
        )}

        {at(T.write) && (
          <Block>
            <Tool name="Write" arg="ExportCsvButton.tsx" dot={C.ok} />
            <Result lines={['Wrote 24 lines to ExportCsvButton.tsx']} />
            <div style={{ marginTop: 6 }}>
              <CodeRow n={1} add>import {'{'} Button {'}'}{from('@/components/ui/button')}</CodeRow>
              <CodeRow n={2} add>import {'{'} toCsv {'}'}{from('@/lib/csv')}</CodeRow>
              <CodeRow n={3} add>import {'{'} useTransactions {'}'}{from('@/hooks/transactions')}</CodeRow>
            </div>
          </Block>
        )}

        {remember && at(T.remember) && (
          <Block>
            <Tool name="Update" arg={target} dot={C.ok} />
            <Result lines={[`Updated ${remember === 'skill' ? 'SKILL.md' : 'AGENTS.md'} with 1 addition`]} />
            <Row style={{ background: C.addBg, paddingLeft: FONT * 0.4, marginTop: 6 }}>+ {ALIAS_RULE}</Row>
          </Block>
        )}

        {!remember && at(T.check) && (
          <Block>
            <Tool name="Bash" arg="pnpm tsc --noEmit" dot={at(T.checkDone) ? C.ok : C.dim} blink={!at(T.checkDone)} />
            {at(T.checkDone) ? (
              <Result lines={[<span style={{ color: C.ok }}>✔ no errors</span>]} />
            ) : (
              <Result lines={['Running…']} />
            )}
          </Block>
        )}

        {/* input box — never shrunk: the column is bottom-anchored and overflows
            while the session is long, and a flex item with an explicit min-height
            gets squeezed to it (border-box), leaving the empty prompt half a line tall */}
        <div
          style={{
            marginTop: FONT * 0.8,
            border: `2px solid ${C.dim}`,
            borderRadius: 10,
            padding: '8px 20px',
            flexShrink: 0,
          }}
        >
          <Row>
            <span style={{ color: C.dim }}>{'> '}</span>
            {at(T.typeStart) && !at(T.enter) ? typed : ''}
            <span style={{ background: caretOn ? C.text : 'transparent', color: C.bg }}> </span>
          </Row>
        </div>
      </div>

      {/* lines scrolling off the top fade under the title bar instead of being sliced */}
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, height: 70, background: `linear-gradient(${C.bg}, transparent)` }} />

      <KeyCap at={T.esc - 6} label="esc" />
      <KeyCap at={T.enter - 6} label="⏎ enter" />
    </AbsoluteFill>
  );
};
