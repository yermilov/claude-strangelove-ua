import { SlideDefinition } from '../types/slides';
import fwdaysTitle from '/fwdays-title.png?url';

/* The conference's own title slide, exactly as the organiser sent it
 * (10.09.2026) — their branding, their layout, their lime green, untouched.
 *
 * It opens the deck and the Kubrick title follows it, which is the usual
 * conference order: the audience sees whose event this is, then the talk
 * begins. Nothing here should be restyled to match the deck; the whole point
 * is that it is their frame around it.
 */
export const FwdaysTitleSlide: SlideDefinition = {
  id: 'fwdays-title',
  hideConferenceMark: true,
  fullBleed: true,
  content: (
    <div className="fwdays-title-slide">
      <img
        src={fwdaysTitle}
        alt="Fwdays Tech Summit — Клод Стрейнджлав, або як я перестав хвилюватися і читати код, згенерований AI. Ярослав Єрмілов, Superhuman. 3 жовтня 2026, онлайн-конференція."
      />
    </div>
  ),
  notes:
    'Титульний слайд від організаторів, як вони його надіслали. Тримати недовго — далі власний титул.',
};
