import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* The turn after the CLAUDE.md replay on «рецепт 2»: why agent docs work, and
 * where they stop working. Same title — it is the same recipe, one step on.
 * One point per reveal, laid out from the start so nothing moves (the
 * `.problems` list from «що ще може піти не так?»); the one red goes to the
 * danger in the last point. */

const POINTS: ReactNode[] = [
  <>люди не люблять читати документацію і ненавидять її писати</>,
  <>агенти обожнюють і те, і те — вони ж побудовані на основі LLM-ок</>,
  <>
    але коли AGENTS.md виростають до тисяч токенів, агенти починають{' '}
    <span className="accent-red">втрачати нитку</span>
  </>,
];

export const RecipeAgentDocsLimitsSlide: SlideDefinition = {
  id: 'recipe-2-agent-docs-limits',
  title: <>рецепт 2: агентська документація</>,
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
    'Люди не люблять читати документацію і ненавидять її писати. Агенти обожнюють і те, і те — вони ж побудовані на LLM. Але коли AGENTS.md розростається до тисяч токенів, агенти починають втрачати нитку.',
};
