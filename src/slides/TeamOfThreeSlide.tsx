import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { SlideScreenshot } from '../components/SlideScreenshot';
import spacesTabsImg from '../assets/team-spaces-tabs.png';
import diff1Img from '../assets/team-diff-1.png';
import diff2Img from '../assets/team-diff-2.png';
import diff3Img from '../assets/team-diff-3.png';
import intellijImg from '../assets/team-intellij.png';

/* "Команда з трьох" — the second detour out of «Хто я» (see BioSlide
 * `detours`), taken once «…продуктові фреймворки» is up. Rebuilt from the
 * Berlin 2023 CI-gates talk (yaroslavyermilov.io/talks/ci-gates-grammarly-
 * berlin-2023, pp. 17–28): a team of three on the code, arguing about style,
 * and the first conclusion — choice is counter-productive, and an engineer's
 * action is not something to rely on.
 *
 * One slide, one scene per reveal:
 *   0      the team: Капітошка (the code) with three wolves
 *   1      spaces vs tabs
 *   2–4    three diffs that are nothing but import churn
 *   5      IntelliJ «Reformat Code»
 *   6      TL;DR: choice is counter-productive
 *   7–10   IntelliJ again, the four ways to ask people to format, one by one
 *   11     TL;DR: … and don't rely on an engineer's action */

type Scene = 'team' | 'tabs' | 'diff' | 'intellij' | 'tldr';

const SCENES: Scene[] = [
  'team',
  'tabs',
  'diff',
  'diff',
  'diff',
  'intellij', // 5: the action alone
  'tldr', // 6
  'intellij', // 7: + ask 1
  'intellij', // 8: + ask 2
  'intellij', // 9: + ask 3
  'intellij', // 10: + ask 4
  'tldr', // 11
];

const DIFFS = [
  { src: diff1Img, ratio: 2048 / 809 },
  { src: diff2Img, ratio: 2048 / 843 },
  { src: diff3Img, ratio: 2048 / 956 },
];
const FIRST_DIFF_AT = 2;

// The ways a team asks people to keep the style — each one an engineer's
// action, which is the point of the TL;DR that follows.
const ASKS: ReactNode[] = [
  <>Будь ласка, відформатуй код перед MR?</>,
  <>Увімкни «Reformat code on save»?</>,
  <>Не забудь перевірити код-стайл на рев'ю?</>,
  <>Документація? Домовленість?</>,
];
const FIRST_ASK_AT = 7;

const TLDR: ReactNode[] = [<>Вибір — контрпродуктивний</>, <>Не покладайся на дії інженера</>];

const TITLES: Record<Scene, ReactNode> = {
  team: <>команда з трьох</>,
  tabs: <>команда з трьох</>,
  diff: <>команда з трьох</>,
  intellij: <>IntelliJ IDEA</>,
  tldr: <>TL;DR</>,
};

const sceneAt = (stage: number) => SCENES[Math.min(stage, SCENES.length - 1)];

export const TeamOfThreeSlide: SlideDefinition = {
  id: 'team-of-three',
  title: ({ revealStage }) => TITLES[sceneAt(revealStage)],
  maxRevealStages: SCENES.length - 1,
  content: ({ revealStage }) => {
    const scene = sceneAt(revealStage);
    // A TL;DR shows every point made so far: the first after the first
    // IntelliJ scene, both at the end.
    const tldrCount = revealStage >= SCENES.length - 1 ? 2 : 1;
    return (
      <div className="first-day" key={scene === 'diff' || scene === 'intellij' ? scene : revealStage}>
        {scene === 'team' && <ArchitectureDiagram clients code wolves={['me', 'mateAbove', 'mateBelow']} />}

        {scene === 'tabs' && (
          <figure className="team__tabs">
            <SlideScreenshot src={spacesTabsImg} alt="Silicon Valley: I'm not hiring him, he uses spaces not tabs." ratio={480 / 268} />
            <figcaption>youtube.com/watch?v=SsoOG6ZeyUI</figcaption>
          </figure>
        )}

        {scene === 'diff' && (
          <SlideScreenshot
            key={revealStage}
            src={DIFFS[revealStage - FIRST_DIFF_AT].src}
            alt="Diff: переставлені імпорти"
            ratio={DIFFS[revealStage - FIRST_DIFF_AT].ratio}
          />
        )}

        {scene === 'intellij' && (
          // The screenshot keeps its place while the asks fill in under it:
          // every ask is laid out from the start, hidden until its reveal.
          <div className="team__intellij">
            <SlideScreenshot src={intellijImg} alt="IntelliJ IDEA: Reformat Code" ratio={1724 / 842} />
            <ul className="team__asks">
              {ASKS.map((ask, i) => (
                <li key={i} className={revealStage >= FIRST_ASK_AT + i ? undefined : 'team__ask--hidden'}>
                  {ask}
                </li>
              ))}
            </ul>
          </div>
        )}

        {scene === 'tldr' && (
          <ul className="team__tldr">
            {TLDR.slice(0, tldrCount).map((point, i) => (
              <li key={i} className={i < tldrCount - 1 ? 'team__tldr--said' : undefined}>
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
  notes:
    "Команда з трьох на одному коді (Капітошка — код, вовки — ми). Spaces vs tabs — і от диффи, де половина змін — переставлені імпорти. IntelliJ вміє Reformat Code — TL;DR: вибір контрпродуктивний. Просимо форматувати перед MR, вмикати reformat on save, дивитися код-стайл на рев'ю, пишемо документацію — все це дії інженера. TL;DR: не покладайся на дії інженера.",
};
