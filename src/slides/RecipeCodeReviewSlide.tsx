import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 4: агентські недетерміновані перевірки (код рев'ю)» — where «рецепт 3»'s
 * scripts stop. The money app's next house rule, «money in kopecks, never floats»
 * (AGENTS.md Principles on «а як виглядає хороший AGENTS.md?»), is one no lint
 * can hold: a script cannot tell that `r.amountMinor / 100` is money turned into
 * float hryvnias before a sum. A review agent can.
 *
 * Like the skills slide of «рецепт 2», each reveal shows ONLY its own point at
 * the top, and under it the same review, one step better: one reviewer → many
 * reviewers with one goal each → in parallel → on smaller models → on other
 * vendors' and free models. STAGED: the code, findings, timings, models and
 * prices are invented to show the shape, not measured. It is the machine's
 * text, so it keeps the CRT register (`.skills-example` chrome). */

type Row = { goal: string; ok: boolean; note?: string; time: string; model: string; cost: string };

const REVIEWERS: Row[] = [
  { goal: 'money', ok: false, note: 'float hryvnias', time: '38s', model: 'sonnet-5.5', cost: '$0.04' },
  { goal: 'imports', ok: true, time: '12s', model: 'haiku-4.5', cost: '$0.01' },
  { goal: 'logging', ok: true, time: '15s', model: 'haiku-4.5', cost: '$0.01' },
  { goal: 'dates', ok: true, time: '21s', model: 'haiku-4.5', cost: '$0.01' },
  { goal: 'a11y', ok: false, note: 'icon button, no label', time: '27s', model: 'haiku-4.5', cost: '$0.01' },
];
// the last step swaps the small models for other vendors' and free ones
const OTHER_MODELS = ['sonnet-5.5', 'gpt-luna', 'jev', 'openrouter :free', 'openrouter :free'];
const OTHER_COSTS = ['$0.04', '$0.01', '$0.01', '$0', '$0'];

const pad = (s: string, n: number) => s.padEnd(n);

const Mark = ({ ok }: { ok: boolean }) => <span className={ok ? 'ok' : 'err'}>{ok ? '✓' : '✗'}</span>;

// step 0: one reviewer, one finding
const OneReviewer = () => (
  <>
    <span className="ok">●</span> <b>Update</b>(BudgetSummary.tsx){'\n'}
    {'  '}
    <span className="dim">14</span> const total = rows.reduce({'\n'}
    {'  '}
    <span className="dim">15</span>
    {'   '}(sum, r) =&gt; sum + <span className="hl">r.amountMinor / 100</span>, 0){'\n'}
    {'\n'}
    <span className="err">●</span> <b>Agent</b>(review: money){'\n'}
    {'  '}└ <span className="err">✗ BudgetSummary.tsx:15 — money as float hryvnias:</span>
    {'\n'}
    {'    '}0.1 + 0.2 ≠ 0.3. Sum kopecks, format once at the end.
  </>
);

// steps 1–4: the same five reviewers, each step adding a column
const Reviewers = ({ step }: { step: number }) => {
  const header =
    step === 1
      ? '5 review agents, one goal each'
      : step === 2
        ? '5 review agents, in parallel'
        : step === 3
          ? '5 review agents, in parallel, small models'
          : '5 review agents, any vendor, free ones too';
  return (
    <>
      <span className="ok">●</span> <b>{header}</b>
      {'\n'}
      {REVIEWERS.map((r, i) => {
        const model = step === 4 ? OTHER_MODELS[i] : r.model;
        const cost = step === 4 ? OTHER_COSTS[i] : r.cost;
        return (
          <span key={r.goal}>
            {'  '}
            <Mark ok={r.ok} /> {pad(r.goal, 8)}
            {step >= 3 && <span className="hl">{pad(model, 17)}</span>}
            {step >= 2 && <span className="dim">{pad(r.time, 5)}</span>}
            {step >= 3 && <span className="dim">{pad(cost, 6)}</span>}
            {step < 3 && r.note && <span className="err">{r.note}</span>}
            {'\n'}
          </span>
        );
      })}
      {step === 2 && (
        <>
          {'\n'}
          {'  '}wall clock <span className="ok">38s</span> · one by one 1m 53s
        </>
      )}
      {step === 3 && (
        <>
          {'\n'}
          {'  '}total <span className="ok">$0.08</span> · all five on opus-5.5 $0.41
        </>
      )}
      {step === 4 && (
        <>
          {'\n'}
          {'  '}total <span className="ok">$0.06</span> · same two findings
        </>
      )}
    </>
  );
};

const POINTS: ReactNode[] = [
  <>для перевірок, які стають занадто складними для написання скрипта, використовуйте код рев'ю агентів</>,
  <>запускайте багато окремих агентів, кожного з однією ціллю щось перевірити</>,
  <>це дозволяє економити час і запускати таких агентів паралельно</>,
  <>це дозволяє економити гроші і запускати таких агентів на менших моделях</>,
  <>включно можна пробувати GPT Luna, Jev або безкоштовні моделі на OpenRouter</>,
];

export const RecipeCodeReviewSlide: SlideDefinition = {
  id: 'recipe-4-code-review',
  title: <>рецепт 4: агентські недетерміновані перевірки (код рев'ю)</>,
  maxRevealStages: POINTS.length - 1,
  content: ({ revealStage }) => {
    const step = Math.min(revealStage, POINTS.length - 1);
    return (
      // keyed by the step, so each one fades in fresh
      <div className="skills-example skills-example--two-line-title" key={step}>
        <ul className="problems">
          <li>{POINTS[step]}</li>
        </ul>
        <div className="skills-example__stage">
          <figure className="skills-example__file machine" aria-label="Агенти код рев'ю перевіряють правку BudgetSummary.tsx">
            <figcaption className="skills-example__bar">
              <span className="skills-example__dots" aria-hidden="true" />
              ~/src/money-app — claude
            </figcaption>
            {/* full panel type, not the hook session's smaller one: the stage has the room */}
            <pre className="skills-example__body">
              {step === 0 ? <OneReviewer /> : <Reviewers step={step} />}
            </pre>
          </figure>
        </div>
      </div>
    );
  },
  notes:
    'Наступне правило з AGENTS.md — гроші в копійках, ніколи не float. Лінтом його не перевірити: скрипт не знає, що amountMinor / 100 — це гроші, які перетворили на дробові гривні перед сумою. А агент код рев’ю бачить. Запускайте багато окремих агентів, у кожного одна ціль: гроші, імпорти, логування, дати, доступність. Вони працюють паралельно, тож чекаєте ви на найдовшого, а не на суму. Кожного можна запустити на меншій, дешевшій моделі — аж до GPT Luna, Jev чи безкоштовних моделей на OpenRouter. Знахідки ті самі.',
};
