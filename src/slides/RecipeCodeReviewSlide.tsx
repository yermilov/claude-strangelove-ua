import { ReactNode, useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { Beat, NEXT_MS, RUN_MS, START_MS, SessionBeats } from '../components/SessionBeats';

/* «рецепт 4: агентські недетерміновані перевірки (код рев'ю)» — where «рецепт 3»'s
 * scripts stop. The money app's next house rule, «money in kopecks, never floats»
 * (AGENTS.md Principles on «а як виглядає хороший AGENTS.md?»), is one no lint
 * can hold: a script cannot tell that `r.amountMinor / 100` is money turned into
 * float hryvnias before a sum. A review agent can.
 *
 * Like the skills slide of «рецепт 2», the top shows only the current point(s)
 * and under them one example, one step better each time:
 *  0. one reviewer, its prompt, its finding;
 *  1. many reviewers, one goal (one question) each — and in parallel;
 *  2–4. cheaper models, three ways: Codex on gpt-6-luna; Jev as a fuzzy linter
 *     in an after-edit hook; opencode on a free OpenRouter model.
 *
 * Where the commands come from: `-m <model> -c model_reasoning_effort=…` is how
 * juggernaut launches codex (apps/cli/src/agent-role.ts), `gpt-6-luna` is its
 * catalogue id; the Jev hook follows @MichaelThiessen's «fuzzy linter» (quoted by
 * @mattpocockuk, 26.09.2026; juggernaut task 3601159e) — the edit's diff only,
 * one-sentence rules, a confidence per rule, high = block; `opencode run --model
 * openrouter/qwen/qwen3.8-27b:free` is a command actually run on 30.09 (that run
 * hit a free-tier rate limit). Everything else — the code, prompts, findings,
 * timings — is STAGED to show the shape. It is the machine's text, so it keeps
 * the CRT register (`.skills-example` chrome). Each example arrives the way
 * Claude Code prints it (components/SessionBeats.tsx): the action, then the
 * harness's response, then the next action. */

// Only questions a script cannot answer (Yarik, 02.10.2026): `../../`,
// `console.*`, `moment` or a missing label are lint rules, not review agents.
// Each of these needs judgment — what is money, what already exists, what was
// meant, what is personal, what a test proves.
const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const PROMPTS = {
  money: 'float math on money?',
  reuse: 'reinvents an existing helper?',
  errors: 'errors swallowed silently?',
  privacy: 'personal data in the logs?',
  tests: 'tests that only check mocks?',
};

// step 0: one reviewer — the edit, then the review agent with its prompt, then its finding
const ONE_REVIEWER: Beat[] = [
  {
    kind: 'call',
    lines: (
      <>
        <span className="ok">●</span> <b>Update</b>(BudgetSummary.tsx){'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}
        <span className="dim">15</span>
        {'   '}(sum, r) =&gt; sum + <span className="hl">r.amountMinor / 100</span>, 0){'\n'}
      </>
    ),
  },
  {
    kind: 'call',
    lines: (
      <>
        {'\n'}
        <span className="err">●</span> <b>Agent</b>(review: money){'\n'}
        {'  '}└ <span className="dim">prompt:</span> Review this diff for ONE thing: money.{'\n'}
        {'    '}Money is integer kopecks (amountMinor) until{'\n'}
        {'    '}formatMoney(). Report any float math on money.{'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}└ <span className="err">✗ BudgetSummary.tsx:15 — money as float hryvnias:</span>
        {'\n'}
        {'    '}0.1 + 0.2 ≠ 0.3. Sum kopecks, format once at the end.
      </>
    ),
  },
];
const OneReviewer = () => <SessionBeats beats={ONE_REVIEWER} />;

// step 1: five review agents, one question each, as Claude Code shows parallel
// subagents: one «Running N agents…» line over a tree, a row per agent with
// what it is doing right now, «Done» as each finishes (fastest first — they run
// side by side), «N agents finished», then the main agent's summary.
const REVIEWERS: { desc: string; tools: number; work: string; seconds: number }[] = [
  { desc: 'float math on money', tools: 4, work: 'Read(BudgetSummary.tsx)', seconds: 38 },
  { desc: 'reinvented helpers', tools: 3, work: 'Grep(formatMoney|toCsv)', seconds: 12 },
  { desc: 'swallowed errors', tools: 2, work: 'Read(ExportCsvButton.tsx)', seconds: 15 },
  { desc: 'personal data in logs', tools: 3, work: 'Grep(logger\\.)', seconds: 21 },
  { desc: 'mock-only tests', tools: 2, work: 'Read(ExportCsvButton.test.tsx)', seconds: 27 },
];
const REPORT_GAP_MS = 450;
const byTime = [...REVIEWERS].sort((a, b) => a.seconds - b.seconds);
const doneAt = (r: (typeof REVIEWERS)[number]) => START_MS + RUN_MS + byTime.indexOf(r) * REPORT_GAP_MS;
const ALL_DONE_AT = START_MS + RUN_MS + (REVIEWERS.length - 1) * REPORT_GAP_MS;
const SUMMARY_AT = ALL_DONE_AT + NEXT_MS;

// the time since this example mounted; the export shows the end state
function useElapsed() {
  const [ms, setMs] = useState(isExportMode ? Infinity : 0);
  useEffect(() => {
    if (isExportMode) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now() - t0;
      setMs(now);
      if (now < SUMMARY_AT + 500) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return ms;
}

const ManyReviewers = () => {
  const ms = useElapsed();
  const finished = ms >= ALL_DONE_AT;
  return (
    <>
      <span className="skills-example__line" style={{ animationDelay: `${START_MS}ms` }}>
        <span className={finished ? 'ok' : 'dim'}>●</span>{' '}
        {finished ? (
          <>
            <b>{REVIEWERS.length} agents finished</b> <span className="dim">(ctrl+o to expand)</span>
          </>
        ) : (
          <>
            <b>Running {REVIEWERS.length} agents…</b> <span className="dim">(ctrl+o to expand)</span>
          </>
        )}
        {'\n'}
        {REVIEWERS.map((r, i) => {
          const last = i === REVIEWERS.length - 1;
          const done = ms >= doneAt(r);
          return (
            <span key={r.desc}>
              {'   '}
              <span className="dim">{last ? '└─' : '├─'}</span> Review: {r.desc} <span className="dim">· {r.tools} tool uses</span>
              {'\n'}
              {'   '}
              <span className="dim">{last ? '  ' : '│ '}</span> <span className="dim">⎿</span>{' '}
              {done ? <span className="dim">Done</span> : r.work}
              {'\n'}
            </span>
          );
        })}
      </span>
      <span className="skills-example__line" style={{ animationDelay: `${SUMMARY_AT}ms` }}>
        {'\n'}
        <span className="ok">●</span> Two of five reviews found a problem:{'\n'}
        {'  '}
        <span className="err">✗ BudgetSummary.tsx:15</span> — money as float hryvnias{'\n'}
        {'  '}
        <span className="err">✗ ExportCsvButton.test.tsx:9</span> — asserts the mock{'\n'}
        {'  '}
        <span className="dim">
          {byTime[byTime.length - 1].seconds}s side by side · 1m {REVIEWERS.reduce((t, r) => t + r.seconds, 0) - 60}s one by one
        </span>
      </span>
    </>
  );
};

// steps 2–4: the same review on cheaper models, three ways
// Claude Code hands the one question to Codex on a small model through its
// Bash tool, with an output schema so Codex's last message lands in a file
// as JSON (`--output-schema`, `-o`); Claude reads that file, parses the
// finding and acts on it.
const k = (key: string) => <span className="dim">"{key}"</span>;
const LUNA: Beat[] = [
  {
    kind: 'call',
    lines: (
      <>
        <span className="ok">●</span> <b>Bash</b>(codex exec <span className="hl">-m gpt-6-luna</span> -c model_reasoning_effort=low \{'\n'}
        {'      '}--output-schema review.schema.json -o /tmp/review.json \{'\n'}
        {'      '}"Review the diff for ONE thing: float math on money."){'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}
        <span className="dim">⎿</span> <span className="dim">tokens used: 4,812</span>
        {'\n'}
      </>
    ),
  },
  {
    kind: 'call',
    lines: (
      <>
        {'\n'}
        <span className="ok">●</span> <b>Read</b>(/tmp/review.json){'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}
        <span className="dim">⎿</span> {'{'}
        {k('findings')}: [{'{'}
        {k('file')}: "BudgetSummary.tsx", {k('line')}: 15,{'\n'}
        {'      '}
        {k('severity')}: <span className="err">"high"</span>, {k('rule')}: "money-is-kopecks",{'\n'}
        {'      '}
        {k('issue')}: "amountMinor / 100 before the sum"{'}'}]{'}'}
        {'\n'}
      </>
    ),
  },
  {
    kind: 'call',
    lines: (
      <>
        {'\n'}
        <span className="ok">●</span> One high finding: <span className="err">BudgetSummary.tsx:15</span> divides by 100{'\n'}
        {'  '}before the sum. Summing kopecks instead.
      </>
    ),
  },
];
const Luna = () => <SessionBeats beats={LUNA} />;

// one hook call answers all three questions at once
const JEV: Beat[] = [
  {
    kind: 'call',
    lines: (
      <>
        <span className="ok">●</span> <b>Update</b>(BudgetSummary.tsx){'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}└ PostToolUse hook → <span className="hl">jev-1.13.0</span> · the diff only · 1 call{'\n'}
        {'    '}
        {`"${PROMPTS.money}"`.padEnd(32)}
        <span className="err">yes 0.94 → block</span>
        {'\n'}
        {'    '}
        {`"${PROMPTS.privacy}"`.padEnd(32)}
        <span className="ok">no  0.97</span>
        {'\n'}
        {'    '}
        {`"${PROMPTS.errors}"`.padEnd(32)}
        <span className="dim">yes 0.61 → ask the agent to check</span>
      </>
    ),
  },
];
const Jev = () => <SessionBeats beats={JEV} />;

// the same hand-off to opencode on a free OpenRouter model: its JSON output
// goes to a file, Claude reads it and acts on the finding
const OPENCODE: Beat[] = [
  {
    kind: 'call',
    lines: (
      <>
        <span className="ok">●</span> <b>Bash</b>(opencode run --model <span className="hl">openrouter/qwen/qwen3.8-27b:free</span> \{'\n'}
        {'      '}--format json "Review the diff for ONE thing: tests that only check mocks." \{'\n'}
        {'      '}&gt; /tmp/tests-review.json){'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}
        <span className="dim">⎿</span> <span className="dim">(No content)</span>
        {'\n'}
      </>
    ),
  },
  {
    kind: 'call',
    lines: (
      <>
        {'\n'}
        <span className="ok">●</span> <b>Read</b>(/tmp/tests-review.json){'\n'}
      </>
    ),
  },
  {
    kind: 'result',
    lines: (
      <>
        {'  '}
        <span className="dim">⎿</span> {'{'}
        {k('findings')}: [{'{'}
        {k('file')}: "ExportCsvButton.test.tsx", {k('line')}: 9,{'\n'}
        {'      '}
        {k('severity')}: <span className="err">"medium"</span>, {k('rule')}: "test-behaviour",{'\n'}
        {'      '}
        {k('issue')}: "asserts the mock, not the CSV"{'}'}]{'}'}
        {'\n'}
      </>
    ),
  },
  {
    kind: 'call',
    lines: (
      <>
        {'\n'}
        <span className="ok">●</span> One finding: <span className="err">ExportCsvButton.test.tsx:9</span> checks the mock,{'\n'}
        {'  '}not the CSV. Asserting on the file instead. <span className="dim">Cost: $0.</span>
      </>
    ),
  },
];
const OpenCode = () => <SessionBeats beats={OPENCODE} />;

const STEPS: { points: ReactNode[]; bar: string; example: () => JSX.Element }[] = [
  {
    points: [<>для перевірок, які стають занадто складними для написання скрипта, використовуйте код рев'ю агентів</>],
    bar: '~/src/money-app — claude',
    example: OneReviewer,
  },
  {
    points: [
      <>запускайте багато окремих агентів, кожного з однією ціллю щось перевірити</>,
      <>це дозволяє економити час і запускати таких агентів паралельно</>,
    ],
    bar: '~/src/money-app — claude',
    example: ManyReviewers,
  },
  ...[
    { bar: '~/src/money-app — claude', example: Luna },
    { bar: 'Jev · after every edit', example: Jev },
    { bar: '~/src/money-app — claude', example: OpenCode },
  ].map((s) => ({
    points: [
      <>також можна економити гроші, запускаючи кожну невелику перевірку на невеликій моделі</>,
    ],
    ...s,
  })),
];

export const RecipeCodeReviewSlide: SlideDefinition = {
  id: 'recipe-4-code-review',
  title: <>рецепт 4: агентські недетерміновані перевірки (код рев'ю)</>,
  maxRevealStages: STEPS.length - 1,
  content: ({ revealStage }) => {
    const step = STEPS[Math.min(revealStage, STEPS.length - 1)];
    const Example = step.example;
    // the cheaper-models trio shares its points: keep them still, swap only the
    // example. The keys are prefixed: the list and the example are siblings, and
    // equal keys made React keep the previous step's points on screen.
    const pointsKey = `points-${revealStage >= 2 ? 'models' : revealStage}`;
    return (
      <div className="skills-example skills-example--two-line-title">
        <ul className="problems" key={pointsKey}>
          {step.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <div className="skills-example__stage" key={`example-${revealStage}`}>
          <figure className="skills-example__file machine" aria-label={`Код рев'ю агентами: ${step.bar}`}>
            <figcaption className="skills-example__bar">
              <span className="skills-example__dots" aria-hidden="true" />
              {step.bar}
            </figcaption>
            <pre className="skills-example__body skills-example__body--review">
              <Example />
            </pre>
          </figure>
        </div>
      </div>
    );
  },
  notes:
    'Наступне правило з AGENTS.md — гроші в копійках, ніколи не float. Лінтом його не перевірити: скрипт не знає, що amountMinor / 100 — це гроші, які перетворили на дробові гривні перед сумою. А агент код рев’ю з простим промптом бачить. Запускайте багато окремих агентів, у кожного одне питання, на яке скрипт не відповість: гроші, чи не переписали існуючий хелпер, чи не проковтнули помилку, чи не пишуть персональні дані в лог, чи тести перевіряють щось, крім моків; вони працюють паралельно, тож чекаєте ви на найдовшого, а не на суму. І кожного можна запустити на меншій моделі: codex з GPT-6 Luna; Jev як «нечіткий лінтер» у хуку після кожної правки — він бачить лише дифф, відповідає на одне питання з упевненістю і блокує, коли впевнений; або opencode з безкоштовною моделлю на OpenRouter.',
};
