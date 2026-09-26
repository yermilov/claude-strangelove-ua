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

// Listed top to bottom; `order` is the reveal order within the path — "now"
// first (it stays at the bottom), then the path from the start.
const BIO_ITEMS: { level: Level; order: number; content: ReactNode }[] = [
  { level: 'past', order: 1, content: <>а починав в 2017 як Java <span className="nowrap">backend-інженер</span></> },
  { level: 'then', order: 2, content: <>потім техлідив продуктові фічі</> },
  { level: 'then', order: 3, content: <>потім <em>техлідив продуктові фреймворки</em></> },
  { level: 'then', order: 4, content: <>потім техлід платформної організації</> },
  { level: 'now', order: 0, content: <>з травня 2025 року пушив Superhuman/Grammarly у напрямку <em>агентної розробки</em></> },
];

export const BioSlide: SlideDefinition = {
  id: 'bio',
  title: <>хто я</>,
  // Stage 0 is Preply alone, stage 1 adds Grammarly, then one stage per step
  // in `order`.
  maxRevealStages: PATH_START + BIO_ITEMS.length - 1,
  // Once the two ends of the path are up (the start in 2017 and "now"), the
  // talk steps out to the first day and comes back to fill in the middle,
  // landing with its first step already shown. Once «…фреймворки» is up it
  // steps out again, to the team of three, and lands on «…платформної
  // організації».
  detours: [
    { atStage: PATH_START + 1, toId: 'first-day', returnStage: PATH_START + 2 },
    { atStage: PATH_START + 3, toId: 'team-of-three', returnStage: PATH_START + 4 },
  ],
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

      {/* Right: the path, one step per reveal, on a single hairline. Like the
       * tenure rows, unrevealed steps keep their place (hidden, not
       * unmounted), so each step lands where it will stay. A step draws the
       * rule down to the next one only once that one is revealed too, so the
       * line grows from the top until it reaches "now". */}
      <ol className="bio-path">
        {BIO_ITEMS.map((item, i) => {
          const isRevealed = (it: { order: number }) => revealStage >= PATH_START + it.order;
          const next = BIO_ITEMS[i + 1];
          const classes = [
            'bio-item',
            `bio-item--${item.level}`,
            !isRevealed(item) && 'bio-item--hidden',
            isRevealed(item) && next && isRevealed(next) && 'bio-item--linked',
            revealStage === PATH_START + item.order && 'bio-item--newest',
          ];
          return (
            <li key={i} className={classes.filter(Boolean).join(' ')}>
              {item.content}
            </li>
          );
        })}
      </ol>
    </div>
  ),
  notes:
    "9 років у Grammarly, 9 днів у Preply. Шлях у Grammarly: бекенд → продуктові фічі → продуктові фреймворки → платформа → AI-first. Не затримуватись: хвилина максимум.",
};
