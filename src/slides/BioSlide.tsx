import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import yarikBadges from '/yarik-badges.jpg?url';

/* "Хто я" — the same career path as the bio in the recent decks
 * (dou-days-2026, ai-first-code-review-agent-ua, revenge-of-the-skill-en),
 * re-set in the Kubrick register: Jost, no glow, and the path climbing from
 * grey through white to the one red — the red is where the talk comes from. */

type Level = 'past' | 'then' | 'now';

const BIO_ITEMS: { level: Level; content: ReactNode }[] = [
  { level: 'past', content: <>починав як Java backend-інженер</> },
  { level: 'then', content: <>потім: техлідив продуктові фічі</> },
  { level: 'then', content: <>потім: техлід платформної організації</> },
  { level: 'now', content: <>зараз: AI-first розробка</> },
];

const AI_FIRST_SUBS = [
  'побачив потенціал і свідомо перестав писати код руками',
  'знайшов свій комфортний агентний воркфлоу',
  'просував Claude Code у Superhuman',
  'будую внутрішній тулінг: плагіни, скіли, агенти',
];

export const BioSlide: SlideDefinition = {
  id: 'bio',
  title: <>хто я</>,
  // One stage per career step, plus the AI-first details as the last stage.
  maxRevealStages: BIO_ITEMS.length,
  content: ({ revealStage }) => (
    <div className="bio-slide">
      <div className="bio-slide-content">
        <p className="bio-subtitle">
          9 років у Superhuman (раніше Grammarly)
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
          {revealStage >= BIO_ITEMS.length && (
            <div className="bio-sub-items">
              {AI_FIRST_SUBS.map((text, i) => (
                <div key={i} className="bio-sub-item">
                  <span className="bio-sub-item__prefix">—</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <img
        src={yarikBadges}
        alt="Два бейджі Grammarly з фото Ярослава Єрмілова — давній і нинішній"
        className="bio-slide-image"
        loading="lazy"
      />
    </div>
  ),
  notes:
    "9 років у Grammarly/Superhuman: бекенд → продуктові фічі → платформа → AI-first. Два бейджі — той самий я з різницею в роки. Не затримуватись: хвилина максимум.",
};
