import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 8: агенти-бойскаути» — slop still gets through, so run periodic
 * agents with one small standing goal each: simplify, fix easy prod errors,
 * delete dead experiments, check the design system — in the cloud on a cron
 * or just locally every day, and on smaller or free models.
 *
 * Nine points do not fit under the title, so this is a sliding window
 * (CLAUDE.md «Slide Height & Overflow»): the newest WINDOW points stay and the
 * ones already spoken drop off the top. */

const POINTS: ReactNode[] = [
  <>агенти так само ненадійні, як і люди, тому, звісно, слоп усе одно буде прориватися</>,
  <>запускайте періодичного агента з маленькою постійною ціллю</>,
  <>наприклад, code-simplifier</>,
  <>якщо у вас є інфраструктура, щоб запускати це в клауді на кроні, — прекрасно</>,
  <>якщо ні, просто запускайте їх локально щодня</>,
  <>агент, який дивиться логи в проді й фіксить прості помилки</>,
  <>агент, який видаляє код старих експериментів</>,
  <>агент, який перевіряє відповідність дизайн-системі</>,
  <>експериментуйте з меншими або безкоштовними моделями, міні-харнесами</>,
];

const WINDOW = 6;

export const RecipeBoyScoutAgentsSlide: SlideDefinition = {
  id: 'recipe-8-boy-scout-agents',
  title: <>рецепт 8: агенти-бойскаути</>,
  maxRevealStages: POINTS.length - 1,
  content: ({ revealStage }) => {
    const first = Math.max(0, revealStage - WINDOW + 1);
    return (
      <ul className="problems">
        {POINTS.map((p, i) =>
          i < first ? null : (
            <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
              {p}
            </li>
          ),
        )}
      </ul>
    );
  },
  notes:
    'Агенти так само ненадійні, як люди, тож слоп усе одно прориватиметься. Тому — періодичні агенти з маленькою постійною ціллю, як code-simplifier. Є інфраструктура запускати їх у клауді на кроні — чудово, немає — просто запускайте локально щодня. Агент, що читає логи в проді й фіксить прості помилки; агент, що видаляє код старих експериментів; агент, що перевіряє дизайн-систему. І експериментуйте з меншими чи безкоштовними моделями та міні-харнесами.',
};
