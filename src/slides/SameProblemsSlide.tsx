import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* "І знову ж ті самі проблеми" — right after «що ще може піти не так?»: why
 * the usual fixes for those problems do not hold. One point per reveal, laid
 * out from the start so nothing moves (the same `.problems` list). */

const POINTS: ReactNode[] = [
  <>документацію люди не читають</>,
  <>рев'ювери забувають або не хочуть перевіряти</>,
  <>всі спішать пошвидше в продакшн</>,
];

export const SameProblemsSlide: SlideDefinition = {
  id: 'same-problems',
  title: <>і знову ж ті самі проблеми</>,
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
    "І знову ж ті самі проблеми: документацію люди не читають, рев'ювери забувають або не хочуть перевіряти, всі спішать пошвидше в продакшн.",
};
