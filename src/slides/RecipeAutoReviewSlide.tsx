import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';

/* «рецепт 5: авторев'ю» — CI becomes the bottleneck, so every CI check (review
 * agents included) runs locally before each commit, and the local checks end
 * in an auto-review. On the last point the right column shows the gist of the
 * real gate: §5 «Adversarial review before every commit» of juggernaut's
 * `development-process` skill, condensed. Every line on the panel is a rule
 * that section states (SKILL.md lines 1077, 1084-86, 1124-31, 1175-77,
 * 1585-87, 1873-74 at the time of writing); the severity run is its own
 * measured example. It is the machine's text, so it keeps the CRT register.
 *
 * Deliberately NOT on the panel: «a smaller model than the author». The skill
 * has no such rule — it pairs vendors and runs the reviewer at medium effort
 * (defaults gpt-6-sol / opus), and it attributes the saving to that effort
 * knob, not to a smaller model. */

const POINTS: ReactNode[] = [
  <>CI стає ботлнеком</>,
  <>
    додавайте в AGENTS.md «проганяй всі CI перевірки локально перед кожним комітом»
  </>,
  <>
    включно з рев'ю агентами (до того ж вони зможуть користуватися вашою підпискою, а
    не токенами)
  </>,
  <>в кінці локальних перевірок — авторев'ю</>,
];

const LAST = POINTS.length - 1;

export const RecipeAutoReviewSlide: SlideDefinition = {
  id: 'recipe-5-auto-review',
  title: <>рецепт 5: авторев'ю</>,
  maxRevealStages: LAST,
  content: ({ revealStage }) => (
    <div className="auto-review">
      <ul className="problems">
        {POINTS.map((p, i) => (
          <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
            {p}
          </li>
        ))}
      </ul>
      <figure
        className={`auto-review__skill machine${revealStage >= LAST ? '' : ' auto-review__skill--hidden'}`}
        aria-label="Скорочена версія кроку 5 скіла development-process: авторев'ю перед кожним комітом"
      >
        <figcaption className="auto-review__file">development-process §5</figcaption>
        <pre className="auto-review__body">
          <span className="k">reviewer:</span> OTHER vendor{'\n'}
          {'  '}claude ⇄ codex, medium{'\n'}
          <span className="k">where:</span> one herdr pane{'\n'}
          {'  '}per commit, not a CLI{'\n'}
          <span className="k">dialogue:</span> re-review,{'\n'}
          {'  '}`ask` to argue back{'\n'}
          <span className="k">resolve:</span> fix + test,{'\n'}
          {'  '}or reject IN WRITING{'\n'}
          <span className="k">converge:</span> 0 actionable,{'\n'}
          {'  '}
          <span className="n">8→8→4→2→1→2→1→1→0</span>
        </pre>
      </figure>
    </div>
  ),
  notes:
    'Коли все проганяє CI, CI стає ботлнеком. Тому в AGENTS.md: «проганяй всі CI перевірки локально перед кожним комітом» — включно з рев’ю агентами, і тоді вони працюють на вашій підписці, а не на токенах. А в кінці локальних перевірок — авторев’ю. Праворуч суть нашого скіла: рев’юер іншого вендора, одна herdr-панель на весь коміт замість одноразового CLI, діалог — повторне рев’ю кожного диффа і ask, щоб посперечатися з зауваженням, кожне зауваження або виправити з тестом, або письмово відхилити, і зупинка на нулі — причому кількість зауважень має зменшуватися: 8, 8, 4, 2, 1, 2, 1, 1, 0.',
};
