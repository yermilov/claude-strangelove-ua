import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

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
 * the CRT register (`.skills-example` chrome). */

const PROMPTS = {
  money: 'float math on money?',
  imports: 'any ../../ instead of @/?',
  logging: 'console.* instead of logger?',
  dates: 'moment, or non-UTC dates?',
  a11y: 'controls without a label?',
};

// step 0: one reviewer — its prompt, then its finding
const OneReviewer = () => (
  <>
    <span className="ok">●</span> <b>Update</b>(BudgetSummary.tsx){'\n'}
    {'  '}
    <span className="dim">15</span>
    {'   '}(sum, r) =&gt; sum + <span className="hl">r.amountMinor / 100</span>, 0){'\n'}
    {'\n'}
    <span className="err">●</span> <b>Agent</b>(review: money){'\n'}
    {'  '}└ <span className="dim">prompt:</span> Review this diff for ONE thing: money.{'\n'}
    {'    '}Money is integer kopecks (amountMinor) until{'\n'}
    {'    '}formatMoney(). Report any float math on money.{'\n'}
    {'  '}└ <span className="err">✗ BudgetSummary.tsx:15 — money as float hryvnias:</span>
    {'\n'}
    {'    '}0.1 + 0.2 ≠ 0.3. Sum kopecks, format once at the end.
  </>
);

// step 1: five reviewers, one question each, side by side in time
const REVIEWERS: { goal: keyof typeof PROMPTS; ok: boolean; time: string }[] = [
  { goal: 'money', ok: false, time: '38s' },
  { goal: 'imports', ok: true, time: '12s' },
  { goal: 'logging', ok: true, time: '15s' },
  { goal: 'dates', ok: true, time: '21s' },
  { goal: 'a11y', ok: false, time: '27s' },
];
const ManyReviewers = () => (
  <>
    <span className="ok">●</span> <b>5 review agents, in parallel, one goal each</b>
    {'\n'}
    {REVIEWERS.map((r) => (
      <span key={r.goal}>
        {'  '}
        <span className={r.ok ? 'ok' : 'err'}>{r.ok ? '✓' : '✗'}</span> {r.goal.padEnd(8)}
        <span className="dim">{`"${PROMPTS[r.goal]}"`.padEnd(32)}</span>
        {r.time}
        {'\n'}
      </span>
    ))}
    {'\n'}
    {'  '}wall clock <span className="ok">38s</span> · one by one 1m 53s
  </>
);

// steps 2–4: the same review on cheaper models, three ways
const Luna = () => (
  <>
    <span className="dim">$</span> codex exec <span className="hl">-m gpt-6-luna</span> -c model_reasoning_effort=low \{'\n'}
    {'    '}"Review the diff for ONE thing: float math on money."{'\n'}
    {'\n'}
    <span className="err">✗ BudgetSummary.tsx:15</span> — amountMinor / 100 before the sum
  </>
);
const Jev = () => (
  <>
    <span className="ok">●</span> <b>Update</b>(BudgetSummary.tsx){'\n'}
    {'  '}└ PostToolUse hook → <span className="hl">jev-1.13.0</span> · the diff only · 1 call{'\n'}
    {'    '}"{PROMPTS.money}"{'          '}
    <span className="err">yes 0.94 → block</span>
    {'\n'}
    {'    '}"{PROMPTS.logging}"{'  '}
    <span className="ok">no  0.97</span>
    {'\n'}
    {'    '}"{PROMPTS.dates}"{'     '}
    <span className="dim">yes 0.61 → ask the agent to check</span>
  </>
);
const OpenCode = () => (
  <>
    <span className="dim">$</span> opencode run --model <span className="hl">openrouter/qwen/qwen3.8-27b:free</span> \{'\n'}
    {'    '}"Review the diff for ONE thing: controls without a label."{'\n'}
    {'\n'}
    <span className="err">✗ ExportCsvButton.tsx:9</span> — icon button has no aria-label{'\n'}
    <span className="dim">cost: $0 (free tier, rate-limited at peak)</span>
  </>
);

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
    { bar: 'codex · GPT-6 Luna', example: Luna },
    { bar: 'Jev · after every edit', example: Jev },
    { bar: 'opencode · a free model on OpenRouter', example: OpenCode },
  ].map((s) => ({
    points: [
      <>це дозволяє економити гроші і запускати таких агентів на менших моделях</>,
      <>включно можна пробувати GPT Luna, Jev або безкоштовні моделі на OpenRouter</>,
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
    // the cheaper-models trio shares its points: keep them still, swap only the example
    const pointsKey = step.points.length > 1 && revealStage >= 2 ? 'models' : String(revealStage);
    return (
      <div className="skills-example skills-example--two-line-title">
        <ul className="problems" key={pointsKey}>
          {step.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <div className="skills-example__stage" key={revealStage}>
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
    'Наступне правило з AGENTS.md — гроші в копійках, ніколи не float. Лінтом його не перевірити: скрипт не знає, що amountMinor / 100 — це гроші, які перетворили на дробові гривні перед сумою. А агент код рев’ю з простим промптом бачить. Запускайте багато окремих агентів, у кожного одне питання — гроші, імпорти, логування, дати, доступність; вони працюють паралельно, тож чекаєте ви на найдовшого, а не на суму. І кожного можна запустити на меншій моделі: codex з GPT-6 Luna; Jev як «нечіткий лінтер» у хуку після кожної правки — він бачить лише дифф, відповідає на одне питання з упевненістю і блокує, коли впевнений; або opencode з безкоштовною моделлю на OpenRouter.',
};
