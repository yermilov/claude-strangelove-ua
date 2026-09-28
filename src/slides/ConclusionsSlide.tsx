import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { TLDR } from './TeamOfThreeSlide';

/* The second «проміжні висновки», after «які можуть бути проблеми?». It opens
 * as the copy of the first — both earlier points up — and adds the two new
 * ones, one per reveal; the point just made is white, the earlier ones grey.
 * Beyoncé stands beside the CI-gate line, which stays in English on purpose
 * ("Single Ladies"). */

// Any `beyonce.*` in src/assets is picked up; without one the slide simply
// has no picture.
const BEYONCE = Object.values(
  import.meta.glob('../assets/beyonce.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }),
)[0] as string | undefined;

const NEW_POINTS: ReactNode[] = [
  <span lang="en">If You Liked It, Then You Shoulda Put a CI Gate on It</span>,
  <>Найпотворніший ad-hoc скрипт кращий за найкрасивішу документацію</>,
];
const POINTS = [...TLDR, ...NEW_POINTS];
const BEYONCE_AT = 1;

export const ConclusionsSlide: SlideDefinition = {
  id: 'conclusions-2',
  title: <>проміжні висновки</>,
  maxRevealStages: NEW_POINTS.length,
  content: ({ revealStage }) => {
    const shown = TLDR.length + revealStage;
    return (
      <div className="first-day">
        {/* every point and the picture are laid out from the start, hidden
          * until their reveal, so nothing moves as they arrive */}
        <div className="conclusions">
          <ul className="team__tldr">
            {POINTS.map((point, i) => (
              <li key={i} className={i >= shown ? 'team__tldr--hidden' : i < shown - 1 ? 'team__tldr--said' : undefined}>
                {point}
              </li>
            ))}
          </ul>
          {BEYONCE ? (
            <img
              className={`conclusions__picture${revealStage >= BEYONCE_AT ? '' : ' conclusions__picture--hidden'}`}
              src={BEYONCE}
              alt="Beyoncé — Single Ladies (Put a Ring on It)"
            />
          ) : (
            // stands in until src/assets/beyonce.* exists
            <div
              className={`conclusions__picture conclusions__placeholder${revealStage >= BEYONCE_AT ? '' : ' conclusions__picture--hidden'}`}
            >
              Beyoncé
            </div>
          )}
        </div>
      </div>
    );
  },
  notes:
    "Вибір контрпродуктивний; не покладайся на дії інженера. If you liked it, then you shoulda put a CI gate on it. І найпотворніший ad-hoc скрипт кращий за найкрасивішу документацію.",
};
