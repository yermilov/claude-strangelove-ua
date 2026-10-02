import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 7: агент, що навчається» — AGENTS.md tells the agent to reflect on
 * the session after every commit and feed what it learned back: fix a skill
 * that was wrong, fill one that was thin, repair the description and the hook
 * when the right skill did not trigger, write a new skill when one is missing,
 * and turn whatever slipped past the local checks into a linter or a review
 * agent (Yarik, 03.10.2026). Same `.problems` list as the recipes before it,
 * one point per reveal. */

const POINTS: ReactNode[] = [
  <>додайте інструкції в AGENTS.md після кожного коміту рефлексувати над поточною сесією</>,
  <>якщо в застосованому скілі була неправильна інформація — виправити</>,
  <>якщо інформації не вистачало — додати</>,
  <>
    якщо потрібний скіл не тригернувся — виправити description і хук, який тригерить
    скіли
  </>,
  <>якщо є потреба — створити новий скіл</>,
  <>якщо якась проблема не була зловлена локально — створити на неї лінтер чи рев'ю агента</>,
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
    'Агент, що навчається. В AGENTS.md — інструкція: після кожного коміту порефлексуй над цією сесією. Якщо в скілі, яким ти скористався, була неправильна інформація — виправ. Якщо її не вистачало — допиши. Якщо потрібний скіл не спрацював — виправ його description і хук, який вмикає скіли. Якщо треба — створи новий скіл. А якщо якась проблема проскочила повз локальні перевірки — зроби на неї лінтер чи рев’ю агента, щоб наступного разу її зловили.',
};
