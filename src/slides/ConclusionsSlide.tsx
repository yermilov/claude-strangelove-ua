import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { TLDR } from './TeamOfThreeSlide';
import { COMPACTING_TITLE } from './compacting';

/* The second «compacting the conversation», after «що ще може піти не так?». It opens
 * straight on the first new point — the two earlier ones already up in grey
 * — and adds the second on the next reveal; the point just made is white.
 * Beyoncé stands beside the CI-gate line, which stays in English on purpose
 * ("Single Ladies"). */

// Any `beyonce.*` in src/assets is picked up; without one the slide simply
// has no picture. The one there is a collage: Beyoncé performing «Single
// Ladies» on GMA, 2011 (Asterio Tecson, CC BY-SA 2.0, Wikimedia Commons),
// cut out onto black, with a MacBook Air (public domain, Commons) pasted in
// front of her and a green CI run on its screen.
const BEYONCE = Object.values(
  import.meta.glob('../assets/beyonce.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }),
)[0] as string | undefined;

// Beside every CI-gate line: the photo, or a frame of its size until it lands.
export function BeyoncePicture() {
  return BEYONCE ? (
    // CC BY-SA asks for a visible credit, so it rides under the picture
    <figure className="conclusions__figure">
      <img
        className="conclusions__picture"
        src={BEYONCE}
        alt="Beyoncé (Single Ladies, GMA 2011) behind a MacBook with a green CI run"
      />
      <figcaption className="conclusions__credit">
        колаж за{' '}
        <a href="https://commons.wikimedia.org/wiki/File:Beyonc%C3%A9_Knowles_GMA_Single_Ladies_(Put_a_Ring_on_It).jpg">
          фото Asterio Tecson
        </a>{' '}
        · <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA 2.0</a>
      </figcaption>
    </figure>
  ) : (
    // stands in until src/assets/beyonce.* exists
    <div className="conclusions__picture conclusions__placeholder">Beyoncé</div>
  );
}

const NEW_POINTS: ReactNode[] = [
  <span lang="en">If You Liked It, Then You Shoulda Put a CI Gate on It</span>,
  <>Найпотворніший ad-hoc скрипт кращий за найкрасивішу документацію</>,
];
// said under a new point while it is the newest, as on the first recap
const NEW_NOTES: ReactNode[] = [
  <>додавайте лінтери, тести, скрипти перевірки на все, що вам близько серцю</>,
  <>
    В багатьох ситуаціях <span lang="en">false positive</span> (хибне спрацювання) може бути краще за{' '}
    <span lang="en">false negative</span> (пропущену проблему)
  </>,
];
// every conclusion so far — the final slide shows them all
export const POINTS = [...TLDR, ...NEW_POINTS];
// Beyoncé belongs to the CI-gate line only: shown with it, and once the next
// point arrives the picture's column goes too, so the list takes the width
const BEYONCE_AT = 0;

export const ConclusionsSlide: SlideDefinition = {
  id: 'conclusions-2',
  title: COMPACTING_TITLE,
  maxRevealStages: NEW_POINTS.length - 1,
  content: ({ revealStage }) => {
    const shown = TLDR.length + 1 + revealStage;
    return (
      <div className="first-day">
        {/* every point is laid out from the start, hidden until its reveal */}
        <div className={`conclusions${revealStage === BEYONCE_AT ? '' : ' conclusions--wide'}`}>
          <ul className="team__tldr">
            {POINTS.map((point, i) => (
              <li key={i} className={i >= shown ? 'team__tldr--hidden' : i < shown - 1 ? 'team__tldr--said' : undefined}>
                {point}
                {i === shown - 1 && NEW_NOTES[i - TLDR.length] && (
                  <span className="team__tldr-note">{NEW_NOTES[i - TLDR.length]}</span>
                )}
              </li>
            ))}
          </ul>
          {revealStage === BEYONCE_AT && <BeyoncePicture />}
        </div>
      </div>
    );
  },
  notes:
    "Вибір контрпродуктивний; не покладайся на дії інженера. If you liked it, then you shoulda put a CI gate on it. І найпотворніший ad-hoc скрипт кращий за найкрасивішу документацію.",
};
