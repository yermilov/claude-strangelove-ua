import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Block, C, FONT, KeyCap, LINE, Marked, Result, Row, Spinner, Tool, fontFamily } from './claude-code';

/* «рецепт 3: агентські детерміновані перевірки» — Claude Code on the left is asked for
 * a lint script that runs in GitHub Actions on every push, so the mistake the agent
 * just made cannot ship again; GitHub Actions on the right catches the existing
 * mistake on the first run and goes green after the fix.
 *
 * What is real, and from where (juggernaut repo):
 * - The mistake: db618758 (24.08.2026) edited plugins/media and bumped the version in
 *   .claude-plugin/plugin.json only, so .codex-plugin stayed at 0.8.0 and Codex hosts
 *   never re-pulled the skill. The commit lines are that commit's own; it was the
 *   SECOND such slip in two days (9a86bca bumped neither manifest).
 * - The guard: scripts/check-plugin-manifests.ts, added in faeed26c (25.08) because
 *   «prose that has to be remembered at commit time is not a guard». The header lines
 *   are quoted from that file.
 * - Every check output is real: faeed26c's script run against db618758 staged on top
 *   of its parent (FAILED, two problems), then with the Codex manifest bumped to 0.8.1
 *   the way 59a82bc did it (OK). 59a82bc's subject is the fix commit's title here.
 *   The Actions logs are the same script run as CI would run it — committed, with
 *   origin/main moved to that commit — where the bump check sees nothing changed:
 *   one problem (the drift) on the first run, «0 changed plugin(s)» on the second.
 *
 * What is STAGED: Yarik's prompt (no such prompt exists in Claude Code or Codex
 * history — in reality the gate was written by the agent's own reflection run), the
 * workflow file, and running the gate in GitHub Actions: juggernaut runs it locally
 * before every commit and has no CI. The Actions page is drawn to show the same
 * script and the same outputs in the place the audience expects them.
 * Long lines are cut with «…»; time is compressed. */

export const FPS = 30;
export const DURATION = 1110;
export const WIDTH = 2140;
export const HEIGHT = 1040;

const PROMPT =
  'ти знову бампнув версію тільки в .claude-plugin, а в .codex-plugin лишилась 0.8.0 — це вже вдруге.\n' +
  'згенеруй лінт-скрипт, який кожен раз у github action перевірятиме, що ця помилка не виникає знову';

const T = {
  markDrift: 34,
  typeStart: 70,
  typeEnd: 330,
  enter: 348,
  think: 356,
  script: 420,
  workflow: 480,
  check: 545,
  checkDone: 600,
  push1: 650,
  run1: 670,
  run1Done: 750,
  bump: 820,
  check2: 875,
  check2Done: 920,
  run2: 935,
  run2Done: 1005,
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const FAIL = [
  '✗ media: VERSION DRIFT — claude=0.8.1 codex=0.8.0. …',
  '✗ media: CHANGED but codex version is still 0.8.0 …',
  'plugin manifest check FAILED — 2 problem(s) across 22 plugins',
];
const OK = 'plugin manifest check OK — 22 plugins; manifests agree, … all 1 changed plugin(s) are bumped vs origin/main';
// In Actions `origin/main` IS the pushed commit, so the bump check sees no changed plugin and only
// the drift remains — measured the same way, with origin/main moved to HEAD after each commit.
const CI_FAIL = [
  '✗ media: VERSION DRIFT — claude=0.8.1 codex=0.8.0. Bump BOTH manifests in the same commit, …',
  'plugin manifest check FAILED — 1 problem(s) across 22 plugins',
];
const CI_OK = 'plugin manifest check OK — 22 plugins; manifests agree, … all 0 changed plugin(s) are bumped vs origin/main';

// ---------- the terminal (left) ----------
const TERM_W = 1200;

const AddRows: React.FC<{ from: number; lines: string[] }> = ({ from, lines }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {lines.map((l, i) => (
        <Row
          key={i}
          style={{
            background: C.addBg,
            paddingLeft: FONT * 2.6,
            whiteSpace: 'pre',
            opacity: interpolate(frame, [from + i * 3, from + i * 3 + 6], [0, 1], clamp),
          }}
        >
          + {l}
        </Row>
      ))}
    </>
  );
};

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
        <Block>
          <Tool name="Bash" arg='git commit -m "use-huggingface-ai: crop margin, …" && git push' dot={C.ok} />
          <Result
            lines={[
              "[main db618758] use-huggingface-ai: crop margin, and two …",
              ' 2 files changed, 38 insertions(+), 1 deletion(-)',
              '   b657fbb0..db618758  main -> main',
            ]}
          />
        </Block>

        <Block>
          <Tool name="Bash" arg={`grep '"version"' plugins/media/.*-plugin/plugin.json`} dot={C.ok} />
          <Result
            lines={[
              '.claude-plugin/plugin.json:  "version": "0.8.1",',
              <>
                .codex-plugin/plugin.json:  "version": "<Marked from={T.markDrift}>0.8.0</Marked>",
              </>,
            ]}
          />
        </Block>

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

        {at(T.think) && !at(T.script) && (
          <Block>
            <Spinner label="Thinking" />
          </Block>
        )}

        {at(T.script) && (
          <Block>
            <Tool name="Write" arg="scripts/check-plugin-manifests.ts" dot={C.ok} />
            <AddRows
              from={T.script}
              lines={[
                '/** Mechanical guard for the two silent',
                ' *  plugin-packaging failures. …',
                ' *  Prose that has to be remembered at commit',
                ' *  time is not a guard; this is. */',
              ]}
            />
          </Block>
        )}

        {at(T.workflow) && (
          <Block>
            <Tool name="Write" arg=".github/workflows/plugins-check.yml" dot={C.ok} />
            <AddRows
              from={T.workflow}
              lines={[
                'on: push',
                'jobs:',
                '  check:',
                '    runs-on: ubuntu-latest',
                '    steps:',
                '      - uses: actions/checkout@v4',
                '      - uses: oven-sh/setup-bun@v2',
                '      - run: bun scripts/check-plugin-manifests.ts',
              ]}
            />
          </Block>
        )}

        {at(T.check) && (
          <Block>
            <Tool name="Bash" arg="bun scripts/check-plugin-manifests.ts" dot={at(T.checkDone) ? C.err : C.dim} blink={!at(T.checkDone)} />
            {at(T.checkDone) ? <Result color={C.err} lines={[cutTo(FAIL[0], 54), cutTo(FAIL[1], 54), FAIL[2]]} /> : <Result lines={['Running…']} />}
          </Block>
        )}

        {at(T.push1) && (
          <Block>
            <Tool name="Bash" arg='git commit -m "Add plugins check to GitHub Actions" && git push' dot={C.ok} />
            <Result lines={['main -> main']} />
          </Block>
        )}

        {at(T.bump) && (
          <Block>
            <Tool name="Update" arg="plugins/media/.codex-plugin/plugin.json" dot={C.ok} />
            <Row style={{ background: C.delBg, paddingLeft: FONT * 2.6, whiteSpace: 'pre' }}>-   "version": "0.8.0",</Row>
            <Row style={{ background: C.addBg, paddingLeft: FONT * 2.6, whiteSpace: 'pre' }}>+   "version": "0.8.1",</Row>
          </Block>
        )}

        {at(T.check2) && (
          <Block>
            <Tool name="Bash" arg="bun scripts/check-plugin-manifests.ts && git commit … && git push" dot={at(T.check2Done) ? C.ok : C.dim} blink={!at(T.check2Done)} />
            {at(T.check2Done) ? (
              <Result lines={[<span style={{ color: C.ok }}>{cutTo(OK, 54)}</span>, 'main -> main']} />
            ) : (
              <Result lines={['Running…']} />
            )}
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
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, height: 70, background: `linear-gradient(${C.bg}, transparent)` }} />
      <KeyCap at={T.enter - 6} label="⏎ enter" />
    </div>
  );
};

function cutTo(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

// ---------- GitHub Actions (right) ----------
const G = {
  bg: '#0d1117',
  panel: '#151b23',
  border: '#3d444d',
  text: '#f0f6fc',
  muted: '#9198a1',
  green: '#3fb950',
  red: '#f85149',
  yellow: '#d29922',
  accent: '#f78166',
  logBg: '#010409',
};
const GH_X = TERM_W + 40;
const GH_W = WIDTH - GH_X;
const SANS = '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

type RunState = 'running' | 'fail' | 'ok';

const StatusIcon: React.FC<{ state: RunState; size?: number }> = ({ state, size = 30 }) => {
  const frame = useCurrentFrame();
  if (state === 'running') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          border: `4px solid ${G.yellow}`,
          borderTopColor: 'transparent',
          transform: `rotate(${frame * 12}deg)`,
          flexShrink: 0,
        }}
      />
    );
  }
  const color = state === 'ok' ? G.green : G.red;
  return (
    <span
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: G.bg,
        fontSize: size * 0.7,
        fontWeight: 900,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {state === 'ok' ? '✓' : '✕'}
    </span>
  );
};

const RunRow: React.FC<{ n: number; title: string; state: RunState; appear: number; log: { text: string; color: string }[] }> = ({
  n,
  title,
  state,
  appear,
  log,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - appear, fps, config: { damping: 16 } });
  return (
    <div style={{ borderTop: `1px solid ${G.border}`, padding: '22px 28px', opacity: s, transform: `translateY(${(1 - s) * -20}px)` }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ paddingTop: 4 }}>
          <StatusIcon state={state} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 27, fontWeight: 600, color: G.text, lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 21, color: G.muted, marginTop: 6 }}>
            plugins check #{n}: pushed by yermilov · <span style={{ color: '#4493f8', background: 'rgba(56,139,253,0.15)', padding: '1px 8px', borderRadius: 6 }}>main</span>
          </div>
        </div>
      </div>
      {log.length > 0 && (
        <div
          style={{
            marginTop: 18,
            marginLeft: 48,
            background: G.logBg,
            border: `1px solid ${G.border}`,
            borderRadius: 8,
            padding: '14px 18px',
            fontFamily,
            fontSize: 20,
            lineHeight: 1.5,
          }}
        >
          <div style={{ color: G.muted }}>▾ Run bun scripts/check-plugin-manifests.ts</div>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.color, whiteSpace: 'pre-wrap', paddingLeft: 22 }}>
              {l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Actions: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (f: number) => frame >= f;
  const run1: RunState = at(T.run1Done) ? 'fail' : 'running';
  const run2: RunState = at(T.run2Done) ? 'ok' : 'running';

  return (
    <div
      style={{
        position: 'absolute',
        left: GH_X,
        top: 0,
        width: GH_W,
        height: HEIGHT,
        background: G.bg,
        borderRadius: 14,
        overflow: 'hidden',
        fontFamily: SANS,
        color: G.text,
        lineHeight: 1.4,
      }}
    >
      {/* repo header + tabs */}
      <div style={{ background: G.panel, borderBottom: `1px solid ${G.border}`, padding: '20px 28px 0' }}>
        <div style={{ fontSize: 26, color: G.text }}>
          <span style={{ color: G.muted }}>yermilov /</span> <b>juggernaut</b>
        </div>
        <div style={{ display: 'flex', gap: 34, marginTop: 18, fontSize: 22, color: G.muted }}>
          <span style={{ paddingBottom: 12 }}>Code</span>
          <span style={{ paddingBottom: 12 }}>Pull requests</span>
          <span style={{ paddingBottom: 12, color: G.text, fontWeight: 600, borderBottom: `3px solid ${G.accent}` }}>Actions</span>
          <span style={{ paddingBottom: 12 }}>Settings</span>
        </div>
      </div>

      <div style={{ padding: '26px 28px 18px', fontSize: 32, fontWeight: 600 }}>plugins check</div>
      <div style={{ padding: '0 28px 18px', fontSize: 21, color: G.muted }}>.github/workflows/plugins-check.yml · on: push</div>

      <div style={{ margin: '0 28px', border: `1px solid ${G.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ background: G.panel, padding: '14px 28px', fontSize: 21, color: G.muted }}>
          {at(T.run2) ? 2 : at(T.run1) ? 1 : 0} workflow runs
        </div>
        {!at(T.run1) && (
          <div style={{ borderTop: `1px solid ${G.border}`, padding: '40px 28px', fontSize: 23, color: G.muted, textAlign: 'center' }}>
            This workflow has no runs yet.
          </div>
        )}
        {at(T.run2) && (
          <RunRow
            n={2}
            title="media 0.8.1 on the Codex manifest too — db61875 bumped only Claude"
            state={run2}
            appear={T.run2}
            log={at(T.run2Done) ? [{ text: CI_OK, color: G.green }] : []}
          />
        )}
        {at(T.run1) && (
          <RunRow
            n={1}
            title="Add plugins check to GitHub Actions"
            state={run1}
            appear={T.run1}
            log={
              at(T.run1Done) && !at(T.run2Done)
                ? [
                    { text: CI_FAIL[0], color: G.red },
                    { text: CI_FAIL[1], color: G.red },
                    { text: 'Error: Process completed with exit code 1.', color: G.red },
                  ]
                : []
            }
          />
        )}
      </div>
    </div>
  );
};

export const LintGuard: React.FC = () => (
  <AbsoluteFill style={{ background: '#0a0a0a', fontFamily, fontSize: FONT, lineHeight: LINE, color: C.text }}>
    <Terminal />
    <Actions />
  </AbsoluteFill>
);
