import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «а як виглядає хороший AGENTS.md?» — right after «втрачати нитку» on
 * «рецепт 2», which ends on «only the most important». Left: what a good one
 * holds, one point per reveal. Right: the matching section of an example
 * AGENTS.md for the same money app as the recipe-1/2 scenes, arriving with its
 * point — laid out from the start, hidden until its reveal, so nothing moves. The example is the machine's text, so it
 * keeps the CRT register; it is short on purpose (a good AGENTS.md is). */

const POINTS: ReactNode[] = [
  <>Vision (пишіть вручну)</>,
  <>
    Folder Structure (команда <code>/init</code>)
  </>,
  <>
    Build/Deploy Commands (<code>/init</code>)
  </>,
  <>
    Architecture (<code>/init</code>)
  </>,
  <>Principles (фідбек після систематичних помилок) — не більше 5–7</>,
];

// one section of the example per point, in the same order
const SECTION_FROM = 0;
const SECTIONS: ReactNode[] = [
  <>
    <span className="h"># Money app</span>
    {'\n'}Family budget, no spreadsheets.
  </>,
  <>
    <span className="h">## Structure</span>
    {'\n'}apps/{'{'}web,api{'}'} · packages/shared
  </>,
  <>
    <span className="h">## Commands</span>
    {'\n'}pnpm dev · pnpm test · pnpm lint
    {'\n'}deploy: push to main → Railway
  </>,
  <>
    <span className="h">## Architecture</span>
    {'\n'}web → apiClient → api → Postgres
  </>,
  <>
    <span className="h">## Principles</span>
    {'\n'}- imports via @/, never ../../
    {'\n'}- money in kopecks, never floats
    {'\n'}- log via logger, not console
  </>,
];

export const GoodAgentsMdSlide: SlideDefinition = {
  id: 'good-agents-md',
  title: <>а як виглядає хороший AGENTS.md?</>,
  maxRevealStages: POINTS.length - 1,
  content: ({ revealStage }) => (
    <div className="good-agents-md">
      <ul className="problems">
        {POINTS.map((p, i) => (
          <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
            {p}
          </li>
        ))}
      </ul>
      <figure
        className={`good-agents-md__file machine${revealStage >= SECTION_FROM ? '' : ' good-agents-md__file--hidden'}`}
        aria-label="Приклад AGENTS.md"
      >
        <figcaption className="good-agents-md__name">AGENTS.md</figcaption>
        {SECTIONS.map((s, i) => (
          <pre
            key={i}
            className={`good-agents-md__section${revealStage >= i + SECTION_FROM ? '' : ' good-agents-md__section--hidden'}`}
          >
            {s}
          </pre>
        ))}
      </figure>
    </div>
  ),
  notes:
    'Як виглядає хороший AGENTS.md. Vision — навіщо цей проєкт, і це єдине, що треба написати руками. Структуру папок, команди збірки й деплою та архітектуру вам згенерує /init. А принципи — це фідбек після систематичних помилок агента, і їх має бути не більше п’яти-семи; решта піде в скіли й лінтери.',
};
