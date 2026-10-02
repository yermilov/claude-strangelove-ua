import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Block, C, Dot, FONT, Result, Row, Tool, fontFamily } from './claude-code';

/* «рецепт 5: авторев'ю», the end of the `autoreview` skill — what the gate looks
 * like in a real herdr window, with plain herdr commands only (Yarik,
 * 03.10.2026): the author's Claude Code on the left splits a pane, starts a codex
 * reviewer in it (`rv-money`) and prompts it with `/review`; every later turn —
 * the argument against a finding, the re-review — is another `herdr agent prompt`
 * into the SAME session, until the findings reach zero:
 * 2 findings → one fixed with a regression test, one argued away → re-review → 0
 * → commit.
 *
 * Entirely STAGED, in the same money-app story as recipes 1–4: the diff, the
 * findings and every line of both sessions are invented to show the shape.
 * What is real: herdr's look (sidebar of spaces and agents, the tab bar, panes
 * titled in their border, the focused pane in the accent — taken from the UI
 * mock on herdr.dev, Catppuccin Mocha), and the gate's mechanics — one reviewer
 * of the OTHER vendor per commit, `/review` as codex's kickoff, follow-up rounds
 * and arguments as prompts into the SAME session — the herdr calls a review
 * gate makes (as juggernaut's apps/cli/src/herdr-agents.ts and review.ts do). */

export const FPS = 30;
export const WIDTH = 2100;
export const HEIGHT = 900;
export const DURATION = 1110;
// the export still: both sessions done, the commit pushed
export const STILL_FRAME = DURATION - 15;

// herdr.dev's mock palette
const H = {
  bg: '#11111b',
  sidebar: '#181825',
  border: '#313244',
  muted: '#6c7086',
  dim: '#9399b2',
  text: '#cdd6f4',
  active: '#1e1e2e',
  accent: '#cba6f7',
  red: '#f38ba8',
  yellow: '#f9e2af',
  green: '#a6e3a1',
  done: '#94e2d5',
};

const T = {
  splitCmd: 30,
  split: 50,
  startCmd: 64,
  started: 84,
  review1: 92,
  kickoff: 104,
  findings: 330,
  read1: 360,
  fix: 410,
  test: 470,
  ask: 540,
  askPrompt: 570,
  askAnswer: 670,
  read2: 700,
  review2: 750,
  rePrompt: 780,
  clean: 930,
  read3: 960,
  converged: 1000,
  commit: 1040,
  pushed: 1075,
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const SIDEBAR_W = 320;
const TABS_H = 46;
const PANE_FONT = 25;

// ---------- herdr chrome ----------
const SideItem: React.FC<{ dot: string; name: string; sub: string; subColor?: string; active?: boolean; hollow?: boolean }> = ({
  dot,
  name,
  sub,
  subColor = H.muted,
  active,
  hollow,
}) => (
  <div style={{ display: 'flex', gap: 14, padding: '10px 22px', background: active ? H.active : 'transparent' }}>
    <span
      style={{
        width: 11,
        height: 11,
        marginTop: 10,
        borderRadius: '50%',
        background: hollow ? 'transparent' : dot,
        border: `2px solid ${dot}`,
        flexShrink: 0,
      }}
    />
    <div>
      <div style={{ color: H.text, fontWeight: 700 }}>{name}</div>
      <div style={{ color: subColor, fontSize: 19 }}>{sub}</div>
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (f: number) => frame >= f;
  // the author works between the reviewer's rounds, the reviewer while a round runs
  const reviewing = (at(T.kickoff) && !at(T.findings)) || (at(T.askPrompt) && !at(T.askAnswer)) || (at(T.rePrompt) && !at(T.clean));
  const authorWorking = !reviewing && !at(T.pushed);
  return (
    <div
      style={{
        width: SIDEBAR_W,
        background: H.sidebar,
        borderRight: `1px solid ${H.border}`,
        display: 'flex',
        flexDirection: 'column',
        fontSize: 22,
      }}
    >
      <div style={{ padding: '14px 22px', color: H.muted, fontWeight: 700 }}>spaces</div>
      <SideItem dot={H.yellow} name="money-app" sub="main" subColor={H.accent} active />
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: `1px solid ${H.border}`, padding: '14px 22px', color: H.muted, fontWeight: 700 }}>agents</div>
      <SideItem
        dot={authorWorking ? H.yellow : H.green}
        name="money-app"
        sub={`${authorWorking ? 'working' : 'idle'} · claude`}
        subColor={authorWorking ? H.yellow : H.muted}
        hollow={!authorWorking}
        active
      />
      {at(T.split) && (
        <SideItem
          dot={reviewing ? H.yellow : H.done}
          name="rv-money"
          sub={`${reviewing ? 'working' : 'done'} · codex`}
          subColor={reviewing ? H.yellow : H.done}
        />
      )}
      <div style={{ height: 22 }} />
    </div>
  );
};

const Tabs: React.FC = () => (
  <div style={{ height: TABS_H, display: 'flex', alignItems: 'stretch', background: H.active, color: H.muted, fontSize: 21 }}>
    <span style={{ padding: '0 26px', display: 'flex', alignItems: 'center', background: H.accent, color: '#17171a', fontWeight: 800 }}>
      money-app
    </span>
    <span style={{ padding: '0 22px', display: 'flex', alignItems: 'center', borderRight: `1px solid ${H.border}` }}>+</span>
  </div>
);

// A pane: a 1px frame inset from its box, its title cut into the top border.
const Pane: React.FC<{ title: string; focused?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({
  title,
  focused,
  children,
  style,
}) => (
  <div style={{ position: 'relative', background: H.bg, overflow: 'hidden', ...style }}>
    <div
      style={{
        position: 'absolute',
        inset: '14px 10px 10px',
        border: `1.5px solid ${focused ? H.accent : H.border}`,
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 2,
        left: 34,
        padding: '0 10px',
        background: H.bg,
        color: focused ? H.accent : H.muted,
        fontWeight: focused ? 700 : 400,
        fontSize: 21,
        zIndex: 1,
      }}
    >
      {title}
    </div>
    <div
      style={{
        position: 'absolute',
        inset: '34px 34px 26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        fontSize: PANE_FONT,
        lineHeight: 1.38,
      }}
    >
      {children}
    </div>
    {/* older lines scroll away under the title, as in the other replays */}
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 12,
        right: 12,
        height: 60,
        background: `linear-gradient(${H.bg}, transparent)`,
        pointerEvents: 'none',
      }}
    />
  </div>
);

// ---------- the author: Claude Code ----------
const Del: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Row style={{ background: C.delBg, paddingLeft: FONT * 2.2, whiteSpace: 'pre' }}>- {children}</Row>
);
const Add: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Row style={{ background: C.addBg, paddingLeft: FONT * 2.2, whiteSpace: 'pre' }}>+ {children}</Row>
);
const Say: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Row>
    <Dot color={C.text} />
    {children}
  </Row>
);

const Author: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (f: number) => frame >= f;
  const running = (from: number, to: number) => at(from) && !at(to);
  return (
    <>
      <Block>
        <Tool name="Bash" arg="pnpm lint && pnpm test" dot={C.ok} />
        <Result lines={['✔ 0 problems · 48 passed']} />
      </Block>
      {at(T.splitCmd) && (
        <Block>
          <Tool name="Bash" arg="herdr pane split --direction right" dot={at(T.split) ? C.ok : C.dim} blink={!at(T.split)} />
          {at(T.split) && <Result lines={['pane w1:p2']} />}
        </Block>
      )}
      {at(T.startCmd) && (
        <Block>
          <Tool name="Bash" arg="herdr agent start rv-money --kind codex" dot={at(T.started) ? C.ok : C.dim} blink={!at(T.started)} />
          {at(T.started) && <Result lines={['rv-money ready · gpt-6-sol medium']} />}
        </Block>
      )}
      {at(T.review1) && (
        <Block>
          <Tool name="Bash" arg='herdr agent prompt rv-money "/review …" --wait' dot={running(T.review1, T.read1) ? C.dim : C.ok} blink={running(T.review1, T.read1)} />
          {at(T.read1) ? (
            <Result
              lines={[
                <span style={{ color: C.err }}>2 findings</span>,
                '[P1] BudgetSummary.tsx:15',
                '[P2] ExportCsvButton.test.tsx:9',
              ]}
            />
          ) : (
            <Result lines={['waiting for rv-money…']} />
          )}
        </Block>
      )}
      {at(T.fix) && (
        <Block>
          <Say>P1 holds: summing kopecks, with a test.</Say>
          <Tool name="Update" arg="BudgetSummary.tsx" dot={C.ok} />
          <Del>sum + r.amountMinor / 100, 0)</Del>
          <Add>sum + r.amountMinor, 0) / 100</Add>
        </Block>
      )}
      {at(T.test) && (
        <Block>
          <Tool name="Update" arg="BudgetSummary.test.tsx" dot={C.ok} />
          <Add>expect(total([10, 20])).toBe('0.30')</Add>
        </Block>
      )}
      {at(T.ask) && (
        <Block>
          <Say>P2 doesn't hold: line 14 checks the CSV.</Say>
          <Tool name="Bash" arg='herdr agent prompt rv-money "P2: …" --wait' dot={running(T.ask, T.read2) ? C.dim : C.ok} blink={running(T.ask, T.read2)} />
          {at(T.read2) && <Result lines={['P2 withdrawn']} />}
        </Block>
      )}
      {at(T.review2) && (
        <Block>
          <Tool name="Bash" arg='herdr agent prompt rv-money "Re-review" --wait' dot={running(T.review2, T.read3) ? C.dim : C.ok} blink={running(T.review2, T.read3)} />
          {at(T.read3) ? <Result lines={[<span style={{ color: C.ok }}>0 findings</span>]} /> : <Result lines={['re-review…']} />}
        </Block>
      )}
      {at(T.converged) && (
        <Block>
          <Say>
            Review converged: <span style={{ color: H.accent }}>2 → 1 → 0</span>. Committing.
          </Say>
        </Block>
      )}
      {at(T.commit) && (
        <Block>
          <Tool name="Bash" arg='git commit -m "Sum in kopecks" && git push' dot={at(T.pushed) ? C.ok : C.dim} blink={!at(T.pushed)} />
          {at(T.pushed) && <Result lines={['main -> main']} />}
        </Block>
      )}
      <div style={{ marginTop: FONT * 0.6, border: `2px solid ${C.dim}`, borderRadius: 8, padding: '4px 16px', flexShrink: 0 }}>
        <Row>
          <span style={{ color: C.dim }}>{'> '}</span>
          <span style={{ background: Math.floor(frame / 15) % 2 === 0 ? C.text : 'transparent' }}> </span>
        </Row>
      </div>
    </>
  );
};

// ---------- the reviewer: Codex ----------
const X = { text: '#e6e6e6', dim: '#8b8b8b', user: '#262626', cyan: '#56b6c2', p1: '#ff6b80', p2: '#e5c07b', ok: '#4eba65' };

const CodexUser: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginTop: 18, background: X.user, padding: '4px 14px', whiteSpace: 'pre-wrap' }}>
    <span style={{ color: X.dim }}>› </span>
    {children}
  </div>
);
const CodexSays: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginTop: 18, whiteSpace: 'pre-wrap', paddingLeft: 30, textIndent: -30 }}>
    <span style={{ color: X.dim }}>• </span>
    {children}
  </div>
);
const Working: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const s = Math.floor((frame - from) / FPS) + 1;
  const glow = 0.55 + 0.45 * Math.sin(frame / 5);
  return (
    <div style={{ marginTop: 18 }}>
      <span style={{ color: X.dim }}>• </span>
      <span style={{ opacity: glow, fontWeight: 700 }}>Working</span>
      <span style={{ color: X.dim }}> ({s}s • esc to interrupt)</span>
    </div>
  );
};

const Reviewer: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (f: number) => frame >= f;
  const running = (from: number, to: number) => at(from) && !at(to);
  return (
    <>
      <div style={{ border: `1.5px solid ${X.dim}`, borderRadius: 8, padding: '8px 18px', color: X.text }}>
        <div>
          <span style={{ color: X.dim }}>&gt;_</span> <b>OpenAI Codex</b>
        </div>
        <div>
          <span style={{ color: X.dim }}>model: </span>gpt-6-sol medium
        </div>
        <div>
          <span style={{ color: X.dim }}>directory: </span>~/src/money-app
        </div>
      </div>
      {at(T.kickoff) && (
        <CodexUser>
          <span style={{ color: X.cyan }}>/review</span> review the uncommitted changes in ~/src/money-app …
        </CodexUser>
      )}
      {running(T.kickoff, T.findings) && <Working from={T.kickoff} />}
      {at(T.findings) && (
        <CodexSays>
          <b>Review comment:</b>
          {'\n'}- <span style={{ color: X.p1 }}>[P1]</span> Money summed as float hryvnias —{'\n'}  BudgetSummary.tsx:15: amountMinor / 100{'\n'}  before the sum, so 0.1 + 0.2 ≠ 0.3
          {'\n'}- <span style={{ color: X.p2 }}>[P2]</span> Test asserts the mock —{'\n'}  ExportCsvButton.test.tsx:9
        </CodexSays>
      )}
      {at(T.askPrompt) && <CodexUser>P2: line 14 asserts the CSV body, not the mock. Answer in writing. …</CodexUser>}
      {running(T.askPrompt, T.askAnswer) && <Working from={T.askPrompt} />}
      {at(T.askAnswer) && <CodexSays>Agreed: line 14 checks the CSV string. P2 does not hold; withdrawn.</CodexSays>}
      {at(T.rePrompt) && <CodexUser>Re-review. Since your last verdict I changed: summed kopecks. …</CodexUser>}
      {running(T.rePrompt, T.clean) && <Working from={T.rePrompt} />}
      {at(T.clean) && (
        <CodexSays>
          <span style={{ color: X.ok }}>No findings.</span> The sum stays in kopecks; the new test covers 0.1 + 0.2.
        </CodexSays>
      )}
      <div style={{ marginTop: 22, background: X.user, padding: '4px 14px', flexShrink: 0 }}>
        <span style={{ color: X.dim }}>› </span>
        <span style={{ background: Math.floor(frame / 15) % 2 === 0 ? X.text : 'transparent' }}> </span>
      </div>
      <div style={{ color: X.dim, fontSize: 19, marginTop: 6 }}>gpt-6-sol medium · ~/src/money-app</div>
    </>
  );
};

export const HerdrReview: React.FC = () => {
  const frame = useCurrentFrame();
  // herdr splits the author's pane in two when the review starts
  const split = interpolate(frame, [T.split, T.split + 12], [0, 1], clamp);
  const panesW = WIDTH - SIDEBAR_W;
  const leftW = panesW - (panesW / 2) * split;
  return (
    <AbsoluteFill style={{ background: H.bg, fontFamily, color: C.text, display: 'flex', flexDirection: 'row' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs />
        <div style={{ flex: 1, position: 'relative' }}>
          <Pane title="claude" focused style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: leftW }}>
            <Author />
          </Pane>
          {split > 0 && (
            <Pane title="codex · rv-money" style={{ position: 'absolute', left: leftW, top: 0, bottom: 0, right: 0, opacity: split }}>
              <Reviewer />
            </Pane>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
