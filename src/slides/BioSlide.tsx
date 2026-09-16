import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import bioTriptych from '/bio-triptych.jpg?url';

/* "Хто я" — the same career path as the bio in the recent decks
 * (dou-days-2026, ai-first-code-review-agent-ua, revenge-of-the-skill-en),
 * re-set in the Kubrick register: Jost, no glow, and the path climbing from
 * grey through white to the one red — the red is where the talk comes from. */

type Level = 'past' | 'then' | 'now';

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
  // One stage per career step; stage 0 already shows the first one.
  maxRevealStages: BIO_ITEMS.length - 1,
  content: ({ revealStage }) => (
    <div className="bio-slide">
      <div className="bio-slide-content">
        <p className="bio-subtitle">
          <span className="bio-subtitle__line">9 років у Grammarly</span>
          <span className="bio-subtitle__line">9 днів у Preply</span>
        </p>

        <div className="bio-items">
          {BIO_ITEMS.map((item, i) =>
            revealStage >= i ? (
              <div key={i} className={`bio-item bio-item--${item.level}`}>
                <span className="bio-item__prefix">
                  {item.level === 'now' ? '>>' : '>'}
                </span>
                <span>{item.content}</span>
              </div>
            ) : null,
          )}
        </div>
      </div>
      <img
        src={bioTriptych}
        alt="Вертикальний триптих: Ярослав із сімʼєю, на концерті під час стейдждайвінгу, колекція вінілу"
        className="bio-slide-image"
        loading="lazy"
      />
    </div>
  ),
  notes:
    "9 років у Grammarly, 9 днів у Preply. Шлях у Grammarly: бекенд → продуктові фічі → продуктові фреймворки → платформа → AI-first. Триптих праворуч: сімʼя, концерт, вініл. Не затримуватись: хвилина максимум.",
};
