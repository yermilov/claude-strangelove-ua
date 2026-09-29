import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* "Що ще може піти не так?" — after «500 MR від 50 контриб'юторів»: what
 * goes wrong once the code has fifty authors. One problem per reveal. */

const PROBLEMS: ReactNode[] = [
  <>додавання старих / непотрібних залежностей / бібліотек</>,
  <>використання небажаних транзитивних залежностей / бібліотек</>,
  <>використання патернів коду, якими ви не хочете, щоб люди користувалися</>,
  <>недостатнє / неправильне логування чи метрики</>,
  <>тести, які насправді не запускаються</>,
  <>
    зламане версіонування / <span lang="en">compatibility guarantees</span>
  </>,
  <>ігнорування конвенцій</>,
];

export const ProblemsSlide: SlideDefinition = {
  id: 'problems',
  title: <>що ще може піти не так?</>,
  maxRevealStages: PROBLEMS.length - 1,
  content: ({ revealStage }) => (
    // Every point is laid out from the start, hidden until its reveal, so
    // nothing moves as they arrive.
    <ul className="problems">
      {PROBLEMS.map((p, i) => (
        <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
          {p}
        </li>
      ))}
    </ul>
  ),
  notes:
    'Що ламається, коли код пишуть 50 людей: старі й зайві залежності, небажані транзитивні, заборонені патерни, логування й метрики, тести, що не запускаються, зламане версіонування, ігнорування конвенцій.',
};
