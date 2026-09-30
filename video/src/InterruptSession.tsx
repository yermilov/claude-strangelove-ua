import React from 'react';

/* «рецепт 1: слідкуйте за тим, що робить ваш агент» — a replay of a REAL Claude Code
 * session, not an invented one: session d4038265 (~/.claude/projects/-Users-yarik-src),
 * 14.09.2026, juggernaut task c01ff891. The agent had built the statusLine usage source
 * as a separate fallback file and was about to send it to review; Yarik declined the
 * tool call (esc on the permission prompt) and told it to feed the existing usage cache
 * instead. The agent reverted usage.ts and rebuilt it; 830 → 833 tests.
 *
 * Every command, output and the correction are quoted from that transcript. Long lines
 * are cut with «…» the way the terminal would wrap them; time is compressed (the real
 * correction took 64 s to type). Frame is the clock — no timers, no CSS animation. */

import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Block, C, Dot, Elbow, FONT, KeyCap, LINE, Marked, Result, Row, Spinner, Tool, fontFamily } from './claude-code';

export const FPS = 30;
export const DURATION = 1020;

// ---------- timeline (frames) ----------
const T = {
  readme: 12,
  review: 60,
  mark1: 100,
  mark2: 140,
  esc: 200,
  interrupted: 208,
  typeStart: 240,
  typeEnd: 560,
  enter: 580,
  think: 588,
  revert: 640,
  write: 700,
  testRun: 760,
  testDone: 830,
};

const CORRECTION =
  'а я би трошки по іншому зробив:\n' +
  '(1) статус лайн скрипт пише в наш кеш файл з юзеджом\n' +
  '(2) ми так і продовжуємо спочатку читати із кеш файлу, а якщо там дані старше 30 хв - робимо запит на oauth ендпоінт';

// ---------- scene ----------
export const InterruptSession: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (f: number) => frame >= f;

  const typed = CORRECTION.slice(
    0,
    Math.round(interpolate(frame, [T.typeStart, T.typeEnd], [0, CORRECTION.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })),
  );
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  const dialogOpen = at(T.review) && !at(T.interrupted);
  const choice = at(T.esc) ? 3 : 1;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily, fontSize: FONT, lineHeight: LINE, color: C.text }}>
      {/* window chrome, same grammar as the deck's CodeBlock */}
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
          <Tool name="Bash" arg="bun test … && npx tsc --noEmit -p . && echo TSC_OK" dot={C.ok} />
          <Result lines={['830 pass', '0 fail', 'Ran 830 tests across 28 files. [14.51s]', 'TSC_OK']} />
        </Block>

        {at(T.readme) && (
          <Block>
            <Tool name="Update" arg="apps/cli/README.md" dot={C.ok} />
            <Result lines={['Updated apps/cli/README.md with 22 additions']} />
            <Row style={{ background: C.addBg, paddingLeft: FONT * 2.6 }}>
              + **Anthropic <Marked from={T.mark1}>fallback</Marked>: Claude Code's statusLine.**
            </Row>
            <Row style={{ background: C.addBg, paddingLeft: FONT * 2.6 }}>
              + It prints nothing and writes `~/.config/juggernaut/<Marked from={T.mark2}>claude-statusline-usage.json</Marked>`.
            </Row>
          </Block>
        )}

        {at(T.review) && (
          <Block>
            <Tool
              name="Bash"
              arg={'juggernaut review "apps/cli: Anthropic usage fallback from Claude Code statusLine. …"'}
              dot={at(T.interrupted) ? C.err : C.dim}
              blink={dialogOpen}
            />
            {at(T.interrupted) && (
              <Result color={C.err} lines={['Interrupted · What should Claude do instead?']} />
            )}
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
            <Row style={{ color: C.permission, fontWeight: 700 }}>Bash command</Row>
            <Row style={{ paddingLeft: FONT, marginTop: 10 }}>
              juggernaut review "apps/cli: Anthropic usage <Marked from={T.mark1}>fallback</Marked> from Claude Code
              statusLine. New features/statusline-usage.ts (+test): 'juggernaut statusline' silently
              records rate_limits … into ~/.config/juggernaut/
              <Marked from={T.mark2}>claude-statusline-usage.json</Marked> … statuslineFallback reports …"
            </Row>
            <Row style={{ marginTop: 14 }}>Do you want to proceed?</Row>
            {[
              'Yes',
              "Yes, and don't ask again for …",
              'No, and tell Claude what to do differently (esc)',
            ].map((o, i) => (
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
              {CORRECTION.split('\n').map((l, i) => (
                <Row key={i} style={{ paddingLeft: i === 0 ? 0 : FONT * 1.2 }}>
                  {i === 0 ? <span style={{ color: C.dim }}>{'> '}</span> : null}
                  {l}
                </Row>
              ))}
            </div>
          </Block>
        )}

        {at(T.think) && !at(T.revert) && (
          <Block>
            <Spinner label="Thinking" />
          </Block>
        )}

        {at(T.revert) && (
          <Block>
            <Tool name="Bash" arg="git checkout apps/cli/src/features/usage.ts && git status --short" dot={C.ok} />
            <Result
              lines={[
                'Updated 1 path from the index',
                ' M apps/cli/README.md',
                ' M apps/cli/src/index.ts',
                '?? apps/cli/src/features/statusline-usage.test.ts',
                '?? apps/cli/src/features/statusline-usage.ts',
              ]}
            />
          </Block>
        )}

        {at(T.write) && (
          <Block>
            <Tool name="Write" arg="apps/cli/src/features/statusline-usage.ts" dot={C.ok} />
            <Result
              lines={[
                "// … statusLine command, used ONLY to feed the",
                '// usage cache. It prints nothing.',
              ]}
            />
          </Block>
        )}

        {at(T.testRun) && (
          <Block>
            <Tool
              name="Bash"
              arg="npx tsc --noEmit -p . …; bun test 2>&1 | grep …"
              dot={at(T.testDone) ? C.ok : C.dim}
              blink={!at(T.testDone)}
            />
            {at(T.testDone) ? (
              <Result lines={[<span style={{ color: C.ok }}>833 pass</span>, '0 fail']} />
            ) : (
              <Result lines={['Running…']} />
            )}
          </Block>
        )}

        {at(T.testRun) && !at(T.testDone) && (
          <Block>
            <Spinner label="Brewing" />
          </Block>
        )}

        {/* input box */}
        <div
          style={{
            marginTop: FONT * 0.8,
            border: `2px solid ${C.dim}`,
            borderRadius: 10,
            padding: '8px 20px',
            minHeight: FONT * LINE,
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
