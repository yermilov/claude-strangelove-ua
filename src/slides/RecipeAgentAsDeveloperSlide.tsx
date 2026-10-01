import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 6: агент як розробник» — watch how your developers work, give the
 * agent the same tools, write your process down as a skill; then what that
 * buys: code search, the service and an emulator run locally, the wiki, logs
 * and traces. Same `.problems` reveal list as the recipes before it. All
 * eight fit under the one-line title at 1920×1080 and 1280×720; if a point
 * is added, switch to a sliding window (CLAUDE.md «Slide Height & Overflow»). */

const POINTS: ReactNode[] = [
  <>поспостерігайте за тим, як працюють ваші розробники</>,
  <>пересвідчіться, що в агента є доступ до всіх тих самих інструментів</>,
  <>створіть скіл, що описує ваш традиційний процес розробки</>,
  <>агент може шукати код у Sourcegraph</>,
  <>агент може запустити ваш сервіс локально</>,
  <>агент може запустити Android-емулятор</>,
  <>агент може шукати в Confluence</>,
  <>агент може читати логи, трейси, результати A/B-тестів</>,
];

export const RecipeAgentAsDeveloperSlide: SlideDefinition = {
  id: 'recipe-6-agent-as-developer',
  title: <>рецепт 6: агент як розробник</>,
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
    'Поспостерігайте, як працюють ваші розробники, і дайте агенту ті самі інструменти. Опишіть ваш звичайний процес розробки скілом. І тоді агент робить те саме, що й розробник: шукає код у Sourcegraph, запускає сервіс локально, піднімає Android-емулятор, шукає в Confluence, читає логи, трейси й результати A/B-тестів.',
};
