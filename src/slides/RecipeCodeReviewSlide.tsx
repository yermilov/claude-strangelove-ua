import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 4: агентські недетерміновані перевірки (код рев'ю)» — where «рецепт 3»'s
 * scripts stop: a check too complex to script goes to review agents, many of them,
 * one goal each, which buys parallelism and lets them run on smaller, cheaper
 * models. Same `.problems` reveal list as «рецепт 2»; no red, this is a fix. */

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
  content: ({ revealStage }) => (
    <ul className="problems problems--two-line-title">
      {POINTS.map((p, i) => (
        <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
          {p}
        </li>
      ))}
    </ul>
  ),
  notes:
    'Коли перевірка стає надто складною, щоб написати під неї скрипт, — це робота для агентів код рев’ю. Запускайте багато окремих агентів, у кожного одна ціль. Так вони працюють паралельно, і кожного можна запустити на меншій, дешевшій моделі — аж до GPT Luna, Jev чи безкоштовних моделей на OpenRouter.',
};
