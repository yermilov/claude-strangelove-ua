import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* "Які можуть бути проблеми?" — after «500 MR від 50 контриб'юторів»: what
 * goes wrong once the code has fifty authors. One problem per reveal; the
 * «…» is on purpose — the list is said out loud, not finished on screen. */

const PROBLEMS: ReactNode[] = [
  <>використання методів / бібліотек, якими ви не хочете, щоб люди користувалися</>,
  <>старі / транзитивні / непотрібні залежності</>,
  <>…</>,
];

export const ProblemsSlide: SlideDefinition = {
  id: 'problems',
  title: <>які можуть бути проблеми?</>,
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
  notes: 'Що ламається, коли код пишуть 50 людей: заборонені методи й бібліотеки, старі й транзитивні залежності, і так далі.',
};
