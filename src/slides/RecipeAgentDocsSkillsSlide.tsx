import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { atSessionSpeed } from '../utils/sessionPlayback';
import { Beat, SessionBeats } from '../components/SessionBeats';
import skillVideo from '../assets/recipe-2-skill-alias.mp4';
import skillStill from '../assets/recipe-2-skill-alias-still.png';

/* After «а як виглядає хороший AGENTS.md?»: keep AGENTS.md short by moving the
 * knowledge into skills, then make sure the right skill is loaded — by a good
 * description or by your own hook. Each reveal shows ONLY its own point, at the
 * top, with its example under it:
 *  1. the «рецепт 1/2» session once more, but the rule goes into the
 *     frontend-conventions skill instead of AGENTS.md (the SkillAliasSession
 *     composition in `video/`, STAGED like the rest of that story);
 *  2. what a good description looks like, over five reveals: the point alone,
 *     then its three rules one by one (an action verb, «TRIGGER when:» with the
 *     words people use, ≤ 1024 characters), then the skill's frontmatter with
 *     the description lit, above them. All laid out from the point's reveal and
 *     hidden until their own, so nothing moves;
 *  3. a PreToolUse hook that blocks the write until the skill is loaded — the
 *     same shape as a real hook's BLOCKED / ACTION REQUIRED message, retold for
 *     this skill. It arrives the way Claude Code prints it: each tool call
 *     first, then — once the tool has run — the harness's result under it
 *     in one piece, then a pause before the next call.
 * Examples 2 and 3 are the machine's text, so they keep the CRT register. */

const isExportMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const SKILL = 'frontend-conventions';

const VIDEO_ALT = `Claude Code: агент хоче імпортувати через ../../, користувач натискає esc і просить додати правило про аліас @/ у скіл ${SKILL}; агент переписує імпорти й дописує правило в SKILL.md`;

const SkillSession = () => (
  <figure className="shot shot--terminal skills-example__video">
    <div className="shot__frame" style={{ ['--ratio' as string]: 1200 / 900 }}>
      {isExportMode ? (
        <img src={skillStill} alt={VIDEO_ALT} />
      ) : (
        <video ref={atSessionSpeed} src={skillVideo} autoPlay muted playsInline preload="auto" aria-label={VIDEO_ALT} />
      )}
    </div>
  </figure>
);

// the rules the description above follows, said plainly under it
const DESCRIPTION_RULES: ReactNode[] = [
  <>
    починайте з дієслова: «<span lang="en">Write…</span>», «<span lang="en">Deploy…</span>»
  </>,
  <>
    додайте «<span lang="en">TRIGGER when:</span>» і слова, якими люди описують задачу
  </>,
  <>≤ 1024 символи — це все, що модель бачить на старті</>,
];

// `sub`: 0 the point alone, 1–3 the rules one by one, 4 the example file
const Description = ({ sub }: { sub: number }) => (
  <div className="skills-example__described">
    <figure
      className={`skills-example__file machine${sub >= DESCRIPTION_RULES.length + 1 ? '' : ' skills-example--hidden'}`}
      aria-label={`Frontmatter скіла ${SKILL} з хорошим описом`}
    >
      <figcaption className="skills-example__bar">
        <span className="skills-example__dots" aria-hidden="true" />
        {SKILL}/SKILL.md
      </figcaption>
      <pre className="skills-example__body">
        <span className="dim">name: {SKILL}</span>
        {'\n'}
        <span className="lit">
          description: <b>Write</b> React code in apps/web the house way.{'\n'}
          {'  '}
          <b>TRIGGER when:</b> creating or editing a component, hook{'\n'}
          {'  '}or page; imports, logging, dates, money.
        </span>
      </pre>
    </figure>
    <ul className="skills-example__rules">
      {DESCRIPTION_RULES.map((r, i) => (
        <li key={i} className={sub >= i + 1 ? undefined : 'skills-example--hidden'}>
          {r}
        </li>
      ))}
    </ul>
  </div>
);

// the hook's session; a blank line opens each new tool-call block
const HOOK_LINES: ReactNode[] = [
  <>
    <span className="err">●</span> <b>Write</b>(ExportCsvButton.tsx)
  </>,
  <>
    {'  '}└ <span className="err">Error: PreToolUse:Write hook — BLOCKED:</span>
  </>,
  <>
    {'    '}Required skill not loaded: <span className="hl">{SKILL}</span>
  </>,
  <>{'    '}ACTION REQUIRED:</>,
  <>
    {'    '}1. Use the Skill tool to load <span className="hl">{SKILL}</span> NOW.
  </>,
  <>{'    '}2. READ and INTERNALIZE the knowledge.</>,
  <>{'    '}3. REEVALUATE your planned action.</>,
  <>
    <span className="ok">●</span> <b>Skill</b>({SKILL})
  </>,
  <>{'  '}└ Successfully loaded skill</>,
  <>
    <span className="ok">●</span> <b>Write</b>(ExportCsvButton.tsx)
  </>,
  <>
    {'  '}└ <span className="ok">Wrote 24 lines</span> — imports via @/
  </>,
];
// a blank line before these, as the terminal would print it
const GAP_BEFORE = new Set([3, 7, 9]);
// Each tool call lands alone, its result (the hook's whole message, or one
// line) after the tool has run — components/SessionBeats.tsx.
const CALLS = [0, 7, 9]; // the Write that is blocked, the Skill load, the Write that goes through
const HOOK_BEATS: Beat[] = HOOK_LINES.reduce<Beat[]>((beats, line, i) => {
  const node = (
    <span key={i}>
      {GAP_BEFORE.has(i) ? '\n' : ''}
      {line}
      {'\n'}
    </span>
  );
  const kind = CALLS.includes(i) ? 'call' : 'result';
  const last = beats[beats.length - 1];
  if (last && last.kind === 'result' && kind === 'result') {
    last.lines = (
      <>
        {last.lines}
        {node}
      </>
    );
  } else beats.push({ kind, lines: node });
  return beats;
}, []);

const HookSession = () => (
  <figure
    className="skills-example__file machine"
    aria-label={`Хук PreToolUse блокує запис, доки не завантажено скіл ${SKILL}`}
  >
    <figcaption className="skills-example__bar">
      <span className="skills-example__dots" aria-hidden="true" />
      ~/src/money-app — claude
    </figcaption>
    <pre className="skills-example__body skills-example__body--session">
      <SessionBeats beats={HOOK_BEATS} />
    </pre>
  </figure>
);

const STEPS: { point: ReactNode; example: (p: { sub: number }) => JSX.Element; reveals: number }[] = [
  {
    point: <>щоб запобігти розростанню AGENTS.md, переносьте знання у скіли</>,
    example: SkillSession,
    reveals: 1,
  },
  {
    point: (
      <>
        ви можете покластися на те, що харнес буде використовувати правильні скіли (для{' '}цього треба писати хороші
        дескріпшини)
      </>
    ),
    example: Description,
    reveals: DESCRIPTION_RULES.length + 2,
  },
  {
    point: <>або написати свій хук, який буде активувати потрібні скіли</>,
    example: HookSession,
    reveals: 1,
  },
];
// every reveal as (step, sub-reveal within it), in order
const REVEALS = STEPS.flatMap((s, step) => Array.from({ length: s.reveals }, (_, sub) => ({ step, sub })));

export const RecipeAgentDocsSkillsSlide: SlideDefinition = {
  id: 'recipe-2-agent-docs-skills',
  title: <>рецепт 2: агентська документація</>,
  maxRevealStages: REVEALS.length - 1,
  content: ({ revealStage }) => {
    const { step: at, sub } = REVEALS[Math.min(revealStage, REVEALS.length - 1)];
    const step = STEPS[at];
    const Example = step.example;
    return (
      // keyed by the step, so each one fades in fresh and its example starts
      // over; a step's own sub-reveals land in place without restarting it
      <div className="skills-example" key={at}>
        <ul className="problems">
          <li>{step.point}</li>
        </ul>
        <div className="skills-example__stage">
          <Example sub={sub} />
        </div>
      </div>
    );
  },
  notes:
    'Щоб AGENTS.md не розростався, переносьте знання у скіли: та сама ситуація, але я прошу додати правило не в AGENTS.md, а в скіл frontend-conventions. Далі два шляхи, щоб потрібний скіл підтягнувся. Перший — покластися на харнес, і тоді все вирішує опис: почати з дієслова, написати «TRIGGER when:» і слова, якими люди описують задачу, і вкластися в 1024 символи, бо це все, що модель бачить на старті. Другий — свій хук: перед записом файлу він перевіряє, чи завантажено скіл, і якщо ні, блокує виклик і пише, який скіл завантажити. Агент завантажує його, і запис проходить.',
};
