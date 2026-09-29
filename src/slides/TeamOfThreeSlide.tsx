import { ReactNode, useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { SlideScreenshot } from '../components/SlideScreenshot';
import { Diff, TerminalDiff } from '../components/TerminalDiff';
import { COMPACTING_TITLE } from './compacting';
import spacesTabsImg from '../assets/team-spaces-tabs.png';
import intellijImg from '../assets/team-intellij.png';

/* "Команда з трьох" — the second detour out of «Хто я» (see BioSlide
 * `detours`), taken once «…продуктові фреймворки» is up. Rebuilt from the
 * Berlin 2023 CI-gates talk (yaroslavyermilov.io/talks/ci-gates-grammarly-
 * berlin-2023, pp. 17–28): a team of three on the code, arguing about style,
 * and the first conclusion — choice is counter-productive, and an engineer's
 * action is not something to rely on.
 *
 * One slide, one scene per reveal:
 *   0      the team: Капітошка (the code) with three wolves
 *   1      spaces vs tabs
 *   2      two diffs that are nothing but import churn, flipping every second
 *   3–11   «що робимо?» — four attempts to keep the style, one line per
 *          reveal, each ending in why it failed; IntelliJ «Reformat Code»
 *          arrives with the first line
 *   12     TL;DR: choice is counter-productive
 *   13     TL;DR: … and don't rely on an engineer's action */

type Scene = 'team' | 'tabs' | 'diff' | 'intellij' | 'tldr';

// Four attempts to keep the style — each an engineer's action, each ending
// in why it did not hold (`sad`), which is the point of the TL;DR after.
type AskLine = { text: ReactNode; sad?: boolean };
const ATTEMPTS: AskLine[][] = [
  [
    { text: <>під час обіду всі домовилися форматувати код після кожної зміни</> },
    { text: <>шкода, що форматування у всіх по-різному налаштоване :'(</>, sad: true },
  ],
  [
    { text: <>через місяць, як помітили, налаштували у всіх однаково</> },
    { text: <>і домовилися не забувати ввімкнути Reformat on save</> },
    { text: <>шкода, що забули ввімкнути Reformat on save :'(</>, sad: true },
  ],
  [
    { text: <>додали в чекліст код-рев'ю перевіряти це</> },
    { text: <>шкода, що рев'ю тепер застрягають на коментах про стиль коду :'(</>, sad: true },
  ],
  [
    { text: <>написали документ на конфлуенсі</> },
    { text: <>шкода, що його ніхто не читає :'(</>, sad: true },
  ],
];
// one reveal per line, in order
const ASK_STEPS = ATTEMPTS.flatMap((lines, attempt) => lines.map((_, line) => ({ attempt, line })));
// the attempt's lines sit in fixed slots, so none moves as the next arrives
const ASK_SLOTS = Math.max(...ATTEMPTS.map((a) => a.length));

const SCENES: Scene[] = [
  'team',
  'tabs',
  'diff',
  ...ASK_STEPS.map((): Scene => 'intellij'),
  'tldr',
  'tldr',
];
const FIRST_ASK_AT = SCENES.indexOf('intellij');

// Transcribed from the 2023 deck's MR screenshots, cut to the `java.util`
// hunk of each: two commits that only flip between explicit imports and a
// wildcard. Readability first — the full screenshots did not fit legibly.
const JAVA_UTIL = ['ArrayList', 'Collections', 'HashMap', 'List', 'Map', 'Objects', 'Set'];
const DIFFS: Diff[] = [
  {
    commit: '9a5b2bf7',
    file: 'capi-server/src/main/java/grammarly/capi/session/MessageHandler.java',
    added: 31,
    removed: 18,
    hunk: '@@ -76,13 +77,7 @@ import org.slf4j.LoggerFactory;',
    lines: [
      ' import java.lang.reflect.Method;',
      ...JAVA_UTIL.map((c) => `-import java.util.${c};`),
      '+import java.util.*;',
      ' import java.util.concurrent.CompletableFuture;',
    ],
  },
  {
    commit: '3b98988a',
    file: 'capi-server/src/main/java/grammarly/capi/session/MessageHandler.java',
    added: 28,
    removed: 19,
    hunk: '@@ -68,7 +69,13 @@ import org.slf4j.LoggerFactory;',
    lines: [
      ' import java.lang.reflect.Method;',
      '-import java.util.*;',
      ...JAVA_UTIL.map((c) => `+import java.util.${c};`),
      ' import java.util.concurrent.CompletableFuture;',
    ],
  },
];
// one window height for both, so it stays put while they swap
const DIFF_ROWS = Math.max(...DIFFS.map((d) => d.lines.length));
const DIFF_FLIP_MS = 1000;

// The two commits undo each other, so they play as a loop in one window —
// the churn is the point, and it keeps going while the talk does.
function DiffPingPong() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % DIFFS.length), DIFF_FLIP_MS);
    return () => window.clearInterval(id);
  }, []);
  return <TerminalDiff diff={DIFFS[i]} rows={DIFF_ROWS} />;
}

// also recapped on «compacting the conversation» after «що ще може піти не так?»
export const TLDR: ReactNode[] = [
  <>Вибір непродуктивний, зафіксуйте одну непогану опцію замість пошуку найкращої</>,
  <>Не покладайся на дії інженера — він чи вона їх не зроблять</>,
];
// one per point, said under it only while it is the newest
const TLDR_NOTES: ReactNode[] = [
  <>єдиний поганий варіант у суперечці між пробілами і табами — це не змусити всіх прийняти щось одне</>,
  <>
    Автор не прочитає інструкцію в документації, ревювер забуде її перевірити, ви домовились не забувати, але є
    термінова задача…
  </>,
];

const TITLES: Record<Scene, ReactNode> = {
  team: <>команда з трьох</>,
  tabs: <>команда з трьох</>,
  diff: <>команда з трьох</>,
  intellij: <>що робимо?</>,
  tldr: COMPACTING_TITLE,
};

const sceneAt = (stage: number) => SCENES[Math.min(stage, SCENES.length - 1)];

export const TeamOfThreeSlide: SlideDefinition = {
  id: 'team-of-three',
  title: ({ revealStage }) => TITLES[sceneAt(revealStage)],
  maxRevealStages: SCENES.length - 1,
  content: ({ revealStage }) => {
    const scene = sceneAt(revealStage);
    // The TL;DR points land one per reveal; the list is laid out whole from
    // the first, so the first point does not move when the second arrives.
    const tldrCount = revealStage - SCENES.indexOf('tldr') + 1;
    return (
      <div className="first-day" key={scene}>
        {scene === 'team' && <ArchitectureDiagram clients code wolves={['me', 'mateLeft', 'mateBelow']} />}

        {scene === 'tabs' && (
          <SlideScreenshot
            src={spacesTabsImg}
            alt="Silicon Valley: I'm not hiring him, he uses spaces not tabs."
            ratio={480 / 268}
          />
        )}

        {scene === 'diff' && <DiffPingPong />}

        {scene === 'intellij' &&
          (() => {
            // One attempt at a time, in fixed slots spread over the full
            // height: lines of the current attempt land in order, and a new
            // attempt clears the old one — the spoken ones have done their job.
            const { attempt, line } = ASK_STEPS[revealStage - FIRST_ASK_AT];
            return (
          <div className="team__intellij">
            <ul className="team__asks">
              {Array.from({ length: ASK_SLOTS }, (_, slot) => {
                const ask = ATTEMPTS[attempt][slot];
                const classes = [!ask || slot > line ? 'team__ask--hidden' : '', ask?.sad ? 'team__ask--sad' : '']
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={`${attempt}-${slot}`} className={classes || undefined}>
                    {ask?.text ?? ' '}
                  </li>
                );
              })}
            </ul>
            <SlideScreenshot src={intellijImg} alt="IntelliJ IDEA: Reformat Code" ratio={1724 / 842} />
          </div>
            );
          })()}

        {scene === 'tldr' && (
          <ul className="team__tldr">
            {TLDR.map((point, i) => (
              <li
                key={i}
                className={i >= tldrCount ? 'team__tldr--hidden' : i < tldrCount - 1 ? 'team__tldr--said' : undefined}
              >
                {point}
                {/* Right under its point while it is the newest. On the next
                  * reveal it goes and the new point lands in its place — the
                  * points above do not move. */}
                {i === tldrCount - 1 && <span className="team__tldr-note">{TLDR_NOTES[i]}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
  notes:
    "Команда з трьох на одному коді (Капітошка — код, вовки — ми). Spaces vs tabs — і от диффи, де половина змін — переставлені імпорти. Що робимо? Домовились форматувати — у всіх по-різному налаштовано. Налаштували однаково й домовились вмикати reformat on save — забули. Додали в чекліст рев'ю — рев'ю застрягають на стилі. Написали документ — ніхто не читає. Кожна спроба — дія інженера. TL;DR: вибір непродуктивний; не покладайся на дії інженера.",
};
