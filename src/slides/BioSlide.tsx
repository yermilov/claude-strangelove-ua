import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* "Хто я" — the same career path as the bio in the recent decks
 * (dou-days-2026, ai-first-code-review-agent-ua, revenge-of-the-skill-en),
 * re-set in the Kubrick register: Jost, no glow, and the path climbing from
 * grey through white to the one red — the red is where the talk comes from.
 * Text only, by Yarik's call (23.09.2026): no personal photos in this deck.
 * Two columns either side of one vertical rule — tenure left, path right. */

type Level = 'past' | 'then' | 'now';

// `stage` is the reveal on which the row appears: Preply (now) first, then
// Grammarly (the nine years behind it), then the Grammarly path on the right.
const TENURE = [
  { figure: '9 років', company: 'у Grammarly', stage: 1 },
  { figure: '9 днів', company: 'у Preply', stage: 0 },
];

// The first path step lands on the reveal after the last tenure row.
const PATH_START = Math.max(...TENURE.map((t) => t.stage)) + 1;

const BIO_ITEMS: { level: Level; content: ReactNode }[] = [
  { level: 'past', content: <>починав як Java backend-інженер</> },
  { level: 'then', content: <>потім техлідив продуктові фічі</> },
  { level: 'then', content: <>потім <em>техлідив продуктові фреймворки</em></> },
  { level: 'then', content: <>потім техлід платформної організації</> },
  { level: 'now', content: <>зараз <em>AI-first розробка</em></> },
];

export const BioSlide: SlideDefinition = {
  id: 'bio',
  title: <>хто я</>,
  // Stage 0 is Preply alone, stage 1 adds Grammarly, then one stage per step.
  maxRevealStages: PATH_START + BIO_ITEMS.length - 1,
  content: ({ revealStage }) => (
    <div className="bio-slide">
      {/* Left: the two numbers the bio hangs on, set as a board — the same
       * "9" twice, and the unit is the joke. */}
      <dl className="bio-tenure">
        {TENURE.map((t) => (
          // An unrevealed row keeps its place (hidden, not unmounted), so
          // Preply does not jump down when Grammarly arrives above it.
          <div
            key={t.company}
            className="bio-tenure__row"
            style={revealStage >= t.stage ? undefined : { visibility: 'hidden' }}
          >
            <dt className="bio-tenure__figure">{t.figure}</dt>
            <dd className="bio-tenure__company">{t.company}</dd>
          </div>
        ))}
      </dl>

      {/* Right: the path, one step per reveal, on a single hairline. */}
      <ol className="bio-path">
        {BIO_ITEMS.map((item, i) =>
          revealStage >= PATH_START + i ? (
            <li key={i} className={`bio-item bio-item--${item.level}`}>
              {item.content}
            </li>
          ) : null,
        )}
      </ol>
    </div>
  ),
  notes:
    "9 років у Grammarly, 9 днів у Preply. Шлях у Grammarly: бекенд → продуктові фічі → продуктові фреймворки → платформа → AI-first. Не затримуватись: хвилина максимум.",
};
