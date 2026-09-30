import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* The answer to «втрачати нитку» on «рецепт 2»: keep AGENTS.md short and move
 * the knowledge into skills, then make sure the right skill is loaded — by a
 * good description or by your own hook. Same title and the same `.problems`
 * reveal list as the slide before it; no red, this is the fix, not the danger. */

const POINTS: ReactNode[] = [
  <>щоб запобігти розростанню AGENTS.md, переносьте знання у скіли</>,
  <>в AGENTS.md має бути тільки найважливіша інформація</>,
  <>
    ви можете покластися на те, що харнес буде використовувати правильні скіли{' '}
    (для{'\u00a0'}цього треба писати хороші дескріпшини)
  </>,
  <>або написати свій хук, який буде активувати потрібні скіли</>,
];

export const RecipeAgentDocsSkillsSlide: SlideDefinition = {
  id: 'recipe-2-agent-docs-skills',
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
    'Щоб AGENTS.md не розростався, переносьте знання у скіли. В AGENTS.md лишається тільки найважливіше. Далі два шляхи: покластися на те, що харнес сам підтягне правильні скіли — для цього їм потрібні хороші описи, — або написати свій хук, який активує потрібні скіли.',
};
