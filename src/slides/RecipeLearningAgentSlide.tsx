import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 7: агент, що навчається» — a hook that makes every use of a skill
 * end with updating that skill from what was just learned, shipped in the same
 * commit as the work. Same `.problems` list as the recipes before it, so more
 * points can be appended and will reveal one per stage. */

const POINTS: ReactNode[] = [
  <>
    додайте хук: після кожного використання скіла треба оновлювати його на основі свіжого
    досвіду (в{' '}одному коміті/PR-і з основними змінами)
  </>,
];

export const RecipeLearningAgentSlide: SlideDefinition = {
  id: 'recipe-7-learning-agent',
  title: <>рецепт 7: агент, що навчається</>,
  maxRevealStages: POINTS.length - 1,
  content: ({ revealStage }) => (
    <ul className="problems">
      {POINTS.map((p, i) => (
        <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
          {p}
        </li>
      ))}
    </ul>
  ),
  notes:
    'Додайте хук: щоразу, коли агент скористався скілом, він оновлює цей скіл тим, що щойно дізнався. І робить це в тому самому коміті чи PR, що й основні зміни, — тоді досвід не губиться і проходить рев’ю разом із кодом.',
};
