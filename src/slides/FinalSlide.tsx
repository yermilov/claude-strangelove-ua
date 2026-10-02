import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import linkedinQr from '../assets/linkedin-qr.svg';
import { COMPACTING_TITLE } from './compacting';
import { TLDR } from './TeamOfThreeSlide';
import { AGENTS_POINT } from './AgentsConclusionsSlide';
import { POINTS as EARLIER } from './ConclusionsSlide';

/* The last «compacting the conversation»: the whole talk in the order it was
 * told — the two conclusions about people (the second in its agents wording),
 * the recipes as their slides present them, recipes 1–2 before the CI-gate line
 * and 3–8 after it, since the CI-gate recap sits between «рецепт 2» and
 * «рецепт 3» (Yarik, 03.10.2026). «Найпотворніший ad-hoc скрипт…» is left out
 * here. On the last reveal the LinkedIn QR arrives with an invitation to write.
 *
 * The QR is generated (the `qrcode` package, error correction M) for
 * https://www.linkedin.com/in/yarik-yermilov — the profile the earlier QR
 * image pointed to, without its `?fromQR=1` tracking parameter. */

const CI_GATE_POINT = EARLIER[TLDR.length];

const recipe = (n: number, text: ReactNode) => (
  <>
    <span className="final__recipe">рецепт {n}:</span> {text}
  </>
);

const POINTS: ReactNode[] = [
  TLDR[0],
  AGENTS_POINT,
  recipe(1, <>слідкуйте за тим, що робить ваш агент</>),
  recipe(2, <>агентська документація</>),
  CI_GATE_POINT,
  recipe(3, <>агентські детерміновані перевірки</>),
  recipe(4, <>агентські недетерміновані перевірки (код рев'ю)</>),
  recipe(5, <>авторев'ю</>),
  recipe(6, <>агент як розробник</>),
  recipe(7, <>агент, що навчається</>),
  recipe(8, <>агенти-бойскаути</>),
];

const WINDOW = 5;
// the reveal the QR arrives on: after the last point
const CONTACT_AT = POINTS.length;

export const FinalSlide: SlideDefinition = {
  id: 'final',
  title: COMPACTING_TITLE,
  maxRevealStages: CONTACT_AT,
  // The closing slide is the deck's one inversion — the white room at the end
  // of "2001". It is deliberately the only place the void turns white, so the
  // switch itself reads as the talk ending.
  content: ({ revealStage }) => {
    const last = Math.min(revealStage, POINTS.length - 1);
    const first = Math.max(0, last - WINDOW + 1);
    return (
      <div
        className="slide-inverse final"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3xl)',
          width: '100%',
          // Fill the stage under the title band so the QR can size against it.
          flex: 1,
          minHeight: 0,
          paddingBottom: 'var(--space-xl)',
          // The QR card is a full-height right column, so it would otherwise
          // run straight into the Fwdays mark in the corner. See the token.
          paddingRight: 'var(--conference-mark-inset)',
        }}
      >
        <ul className="final__points">
          {POINTS.map((point, i) =>
            i < first || i > last ? null : (
              <li key={i} className="final__point">
                {point}
              </li>
            ),
          )}
        </ul>

        {/* laid out from the start, shown on the last reveal, so the points do
         * not move when it arrives */}
        <figure className={`final__contact${revealStage >= CONTACT_AT ? '' : ' final__contact--hidden'}`}>
          <div className="final__qr-box">
            <img src={linkedinQr} alt="QR-код: LinkedIn-профіль Ярослава Єрмілова" className="final-qr" />
          </div>
          <figcaption>пишіть мені в LinkedIn, я люблю поспілкуватися про&nbsp;AI</figcaption>
        </figure>
      </div>
    );
  },
  notes:
    'Усе разом, по одному: висновки й вісім рецептів у тому порядку, як ми їх проходили. І останнє — пишіть мені в LinkedIn, я люблю поспілкуватися про AI. А зараз — питання.',
};
