import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 8: агенти-бойскаути» — slop still gets through, so run periodic
 * agents with one small standing goal each: simplify, fix easy prod errors,
 * delete dead experiments, check the design system — in the cloud on a cron
 * or just locally every day, and on smaller or free models.
 *
 * The first points accumulate as a list. Once the example agents begin, the
 * list goes and one point at a time stands in the left column, with Claude
 * Code on the right setting that agent up as a `/loop` (Yarik, 03.10.2026).
 * The prompts, cron lines and job output are STAGED to show the shape. */

const POINTS: ReactNode[] = [
  <>агенти так само ненадійні, як і люди, тому, звісно, слоп усе одно буде прориватися</>,
  <>запускайте періодичного агента з маленькою постійною ціллю</>,
  <>наприклад, code-simplifier</>,
  <>якщо у вас є інфраструктура, щоб запускати це в клауді на кроні, — прекрасно</>,
  <>якщо ні, просто запускайте їх локально щодня</>,
  <>експериментуйте з меншими або безкоштовними моделями, міні-харнесами</>,
  <>організовуйте інструкції кожного агента як скіл</>,
  <>агент, який дивиться логи в проді й фіксить прості помилки</>,
  <>агент, який видаляє код старих експериментів</>,
  <>агент, який перевіряє відповідність дизайн-системі</>,
];

// the first example agent; from here on, one point at a time
const EXAMPLES_FROM = 7;
const WINDOW = 6;

// Claude Code setting each example agent up as a recurring `/loop`, by the
// two points just before them: its instructions live in a skill, and it runs
// on a smaller or free model — Haiku in Claude Code itself, a free OpenRouter
// model in opencode, gpt-6-luna in codex (the models of «рецепт 4»).
const LOOPS: ReactNode[] = [
  <>
    <span className="dim">&gt;</span> /model haiku{'\n'}
    {'  '}
    <span className="dim">⎿</span> Set model to Haiku 4.5{'\n'}
    {'\n'}
    <span className="dim">&gt;</span> /loop 1d <span className="hl">/prod-log-fixer</span>
    {'\n'}
    {'\n'}
    <span className="ok">●</span> <b>CronCreate</b>(0 9 * * *){'\n'}
    {'  '}
    <span className="dim">⎿</span> Scheduled daily at 09:00
  </>,
  <>
    <span className="dim">&gt;</span> /loop 1w run the <span className="hl">dead-flags</span>
    {'\n'}
    {'  '}skill in opencode on a free{'\n'}
    {'  '}model{'\n'}
    {'\n'}
    <span className="ok">●</span> <b>CronCreate</b>(0 9 * * 1){'\n'}
    {'  '}
    <span className="dim">⎿</span> Scheduled Mondays 09:00:{'\n'}
    {'    '}opencode run --model{'\n'}
    {'    '}…/qwen3.8-27b:free{'\n'}
    {'    '}"/dead-flags"
  </>,
  <>
    <span className="dim">&gt;</span> /loop 1d run the{'\n'}
    {'  '}
    <span className="hl">design-check</span> skill in codex{'\n'}
    {'  '}on gpt-6-luna{'\n'}
    {'\n'}
    <span className="ok">●</span> <b>CronCreate</b>(0 9 * * *){'\n'}
    {'  '}
    <span className="dim">⎿</span> Scheduled daily 09:00:{'\n'}
    {'    '}codex exec -m gpt-6-luna{'\n'}
    {'    '}"$design-check"
  </>,
];

export const RecipeBoyScoutAgentsSlide: SlideDefinition = {
  id: 'recipe-8-boy-scout-agents',
  title: <>рецепт 8: агенти-бойскаути</>,
  maxRevealStages: POINTS.length - 1,
  content: ({ revealStage }) => {
    // the general points: a list that grows
    // (a sliding window, CLAUDE.md «Slide Height & Overflow»: the newest
    // WINDOW stay, so a short screen never clips the seventh)
    if (revealStage < EXAMPLES_FROM) {
      const first = Math.max(0, revealStage - WINDOW + 1);
      return (
        <ul className="problems">
          {POINTS.slice(0, EXAMPLES_FROM).map((p, i) =>
            i < first ? null : (
              <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
                {p}
              </li>
            ),
          )}
        </ul>
      );
    }
    const loop = LOOPS[revealStage - EXAMPLES_FROM];
    // the example agents one at a time; keyed by the reveal so each fades in
    return (
      <div className="good-agents-md boy-scout-loop" key={`point-${revealStage}`}>
        <ul className="problems">
          <li>{POINTS[revealStage]}</li>
        </ul>
        <figure className="skills-example__file machine" aria-label="Claude Code: агент на розкладі через /loop">
          <figcaption className="skills-example__bar">
            <span className="skills-example__dots" aria-hidden="true" />
            ~/src/money-app — claude
          </figcaption>
          <pre className="skills-example__body">{loop}</pre>
        </figure>
      </div>
    );
  },
  notes:
    'Агенти так само ненадійні, як люди, тож слоп усе одно прориватиметься. Тому — періодичні агенти з маленькою постійною ціллю, як code-simplifier. Є інфраструктура запускати їх у клауді на кроні — чудово, немає — просто запускайте локально щодня. Експериментуйте з меншими чи безкоштовними моделями та міні-харнесами. І організовуйте інструкції кожного агента як скіл. Агент, що читає логи в проді й фіксить прості помилки; агент, що видаляє код старих експериментів; агент, що перевіряє дизайн-систему — кожен ставиться одним /loop у Claude Code: інструкції в скілі, а запускається він на меншій чи безкоштовній моделі — Haiku, безкоштовна модель в opencode, gpt-6-luna в codex.',
};
