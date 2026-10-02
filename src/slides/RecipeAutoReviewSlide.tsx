import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { atSessionSpeed } from '../utils/sessionPlayback';
import herdrReviewVideo from '../assets/recipe-5-herdr-review.mp4';
import herdrReviewStill from '../assets/recipe-5-herdr-review-still.png';

/* «рецепт 5: авторев'ю» — agents make CI the bottleneck, so every CI check
 * (review agents included) runs locally before each commit, and the local
 * checks end in an auto-review. The first three points sit beside the money
 * app's AGENTS.md (see agentsMd below). On the last one — as on «рецепт 4» — it
 * stays alone at the top, and under it an `autoreview` skill is taken apart
 * (Yarik, 03.10.2026): first its frontmatter and the paragraph that says what
 * it is for, then one principle per reveal — the principle in the slide's own
 * register, under it the skill's section that implements it. The skill is a
 * modular one STAGED for the talk: the review gate of juggernaut's
 * `development-process` skill (§5 «Adversarial review before every commit»,
 * plugins/engineering/skills/development-process/SKILL.md) distilled into a
 * skill of its own; every rule in it is a rule §5 states, `juggernaut review`
 * and `review ask` are its real commands, and 8→…→0 is its measured example.
 * The herdr commands under «## Reviewer» are the ones `juggernaut review` runs
 * (juggernaut apps/cli/src: herdr-agents.ts splitPaneArgs / agentStartArgs /
 * promptAgent, review.ts reviewerFor / reviewerFlags / kickoffCommand); only
 * the agent name `rv-money` and the shortened kickoff are staged. The same goes
 * for «## One reviewer per commit» and «## Arguing back»: every later round and
 * every argument is `herdr agent prompt` into the SAME session (review.ts
 * rereviewPrompt / askPrompt, abridged), and `--stop` is `herdr pane close`.
 * It is the machine's text, so it keeps the CRT register.
 *
 * Deliberately NOT here: «a smaller model than the author». The skill has no
 * such rule — it pairs vendors and runs the reviewer at medium effort (defaults
 * gpt-6-sol / opus), and it attributes the saving to that effort knob, not to
 * a smaller model. */

const POINTS: ReactNode[] = [
  <>
    агенти роблять CI ботлнеком — або навантажуючи вашу внутрішню інфраструктуру, або
    збільшуючи плату за клауд
  </>,
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

// From the second point on, the right column shows the money app's AGENTS.md
// from «а як виглядає хороший AGENTS.md?» with its last section, Principles,
// swapped for the rule this point adds: every CI lint job (the import check of
// «рецепт 3») and every review agent (the five of «рецепт 4») before each commit.
// The sections the audience has already seen are folded to their headings, as
// an editor folds them — the whole file does not fit half the slide.
// The review-agent rule arrives a reveal later, with «включно з рев'ю агентами»;
// laid out from the start, so the file does not grow when it does.
const FILE_FROM = 1;
const REVIEW_RULE_FROM = 2;
const FOLDED = ['## Structure', '## Commands', '## Architecture'];
const agentsMd = (revealStage: number): ReactNode[] => [
  <>
    <span className="h"># Money app</span>
    {'\n'}Family budget, no spreadsheets.
    {FOLDED.map((h) => (
      <span key={h} className="dim">
        {'\n'}
        {h} …
      </span>
    ))}
  </>,
  <>
    <span className="h">## Before every commit</span>
    {'\n'}- run every CI lint job
    {'\n'}  pnpm lint · check-imports
    <span className={revealStage >= REVIEW_RULE_FROM ? 'skills-example__line' : 'skills-example--hidden'}>
      {'\n'}- run every review agent
      {'\n'}  money · reuse · errors · …
    </span>
  </>,
];

// The skill's opening, shown with the last point: frontmatter, then the
// paragraph that says what it is for.
const SKILL_OPENING = (
  <>
    <span className="dim">---</span>
    {'\n'}
    <span className="h">name:</span> autoreview{'\n'}
    <span className="h">description:</span> Review the uncommitted diff with an agent of the{'\n'}
    {'  '}OTHER vendor before every commit. TRIGGER when: about to{'\n'}
    {'  '}commit, «review this», the local checks are green.{'\n'}
    <span className="dim">---</span>
    {'\n'}
    <span className="h"># Autoreview</span>
    {'\n'}The last local check before a commit: a reviewer of another{'\n'}vendor reads the diff, argues
    with the author, and the commit{'\n'}waits until its findings reach zero.
  </>
);

// Then one principle per reveal, each with the section that implements it.
const PRINCIPLES: { principle: ReactNode; skill: ReactNode }[] = [
  {
    principle: <>рев'юер іншого вендора: автор не перевіряє сам себе</>,
    skill: (
      <>
        <span className="h">## Reviewer</span>
        {'\n'}The <span className="n">OTHER vendor</span> reviews, so no author grades its own homework.{'\n'}
        <span className="dim"># claude author → codex reviewer, in a pane beside yours</span>
        {'\n'}
        <span className="dim">$</span> herdr pane split --current --direction right --no-focus{'\n'}
        <span className="dim">$</span> herdr agent start rv-money <span className="n">--kind codex</span> --pane &lt;pane&gt; \
        {'\n'}
        {'    '}-- -m gpt-6-sol -c model_reasoning_effort=medium{'\n'}
        <span className="dim">$</span> herdr agent prompt rv-money "<span className="n">/review</span> the uncommitted changes"
        {'\n'}
        <span className="dim"># codex author → --kind claude -- --model opus, /code-review</span>
      </>
    ),
  },
  {
    principle: <>один рев'юер на весь коміт, а не новий на кожен раунд</>,
    skill: (
      <>
        <span className="h">## One reviewer per commit</span>
        {'\n'}Keep <span className="n">ONE reviewer for the whole commit</span> — a fresh one{'\n'}re-reads the repo
        every round. Round 2+ goes to the SAME session:{'\n'}
        <span className="dim">$</span> herdr agent prompt <span className="n">rv-money</span> "Re-review. Since your last
        verdict{'\n'}
        {'    '}I changed: &lt;what&gt;. Re-check only what changed." --wait{'\n'}
        <span className="dim"># after the commit is pushed</span>
        {'\n'}
        <span className="dim">$</span> herdr pane close &lt;pane&gt;
      </>
    ),
  },
  {
    principle: <>з зауваженням можна сперечатися, не змінюючи код</>,
    skill: (
      <>
        <span className="h">## Arguing back</span>
        {'\n'}A finding is advice, not an edit script. Disagree? Say why{'\n'}in the same session —{' '}
        <span className="n">no code change</span>:{'\n'}
        <span className="dim">$</span> herdr agent prompt rv-money "&lt;argument&gt; Answer in writing. If{'\n'}
        {'    '}you now agree the finding does not hold, say so plainly." --wait
      </>
    ),
  },
  {
    principle: <>кожне зауваження — виправити з тестом або письмово відхилити</>,
    skill: (
      <>
        <span className="h">## Resolving findings</span>
        {'\n'}Fix each finding with a <span className="n">regression test</span>, OR reject it{'\n'}
        <span className="n">in writing</span> and record why in the commit message.
      </>
    ),
  },
  {
    principle: <>зупинка на нулі, і зауважень має меншати</>,
    skill: (
      <>
        <span className="h">## Converging</span>
        {'\n'}Loop until <span className="n">zero actionable findings</span>. Count severity, not{'\n'}rounds — the
        findings must shrink:{'\n'}
        <span className="n">8 → 8 → 4 → 2 → 1 → 2 → 1 → 1 → 0</span>
      </>
    ),
  },
];

// After the last principle, one more reveal: what the gate looks like in a
// real herdr window — the Remotion composition `HerdrReview` (video/), STAGED
// like the rest of the money-app story. The PDF export shows its final frame.
const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';
const VIDEO_ALT =
  "herdr: ліворуч автор у Claude Code командами herdr відкриває сусідню панель і запускає в ній codex-рев'юера, той знаходить два зауваження; одне автор виправляє з тестом, з другим сперечається, повторне рев'ю — нуль зауважень, коміт";

export const RecipeAutoReviewSlide: SlideDefinition = {
  id: 'recipe-5-auto-review',
  title: <>рецепт 5: авторев'ю</>,
  maxRevealStages: LAST + PRINCIPLES.length + 1,
  content: ({ revealStage }) => {
    const last = revealStage >= LAST;
    // the opening comes with the point; each principle on a reveal of its own
    const video = revealStage > LAST + PRINCIPLES.length;
    const principle = revealStage > LAST && !video ? PRINCIPLES[revealStage - LAST - 1] : null;
    return (
      <div className="auto-review">
        {/* the list's key changes on the last point, so it fades in alone */}
        {last ? (
          <ul className="problems" key="last">
            <li>{POINTS[LAST]}</li>
          </ul>
        ) : (
          // the points beside the AGENTS.md, laid out from the start so the
          // file arriving with the second point moves nothing
          <div className="good-agents-md" key="points">
            <ul className="problems">
              {POINTS.slice(0, LAST).map((p, i) => (
                <li key={i} className={revealStage >= i ? undefined : 'problems__item--hidden'}>
                  {p}
                </li>
              ))}
            </ul>
            <figure
              className={`good-agents-md__file machine${revealStage >= FILE_FROM ? '' : ' good-agents-md__file--hidden'}`}
              aria-label="AGENTS.md: перед кожним комітом проганяти всі лінт-джоби й усіх рев'ю агентів"
            >
              <figcaption className="good-agents-md__name">AGENTS.md</figcaption>
              {agentsMd(revealStage).map((section, i) => (
                <pre key={i} className="good-agents-md__section">
                  {section}
                </pre>
              ))}
            </figure>
          </div>
        )}
        {video && (
          <div className="auto-review__video">
            <figure className="shot">
              <div className="shot__frame" style={{ ['--ratio' as string]: 2100 / 900 }}>
                {isExportMode ? (
                  <img src={herdrReviewStill} alt={VIDEO_ALT} />
                ) : (
                  <video ref={atSessionSpeed} src={herdrReviewVideo} autoPlay muted playsInline preload="auto" aria-label={VIDEO_ALT} />
                )}
              </div>
            </figure>
          </div>
        )}
        {last && !video && (
          // the skill's opening first, then one principle at a time with its
          // section under it across the width; keyed by the reveal so each
          // one fades in
          <div className="auto-review__gate" key={`gate-${revealStage}`}>
            {principle && (
              <ul className="skills-example__rules">
                <li>{principle.principle}</li>
              </ul>
            )}
            <figure className="good-agents-md__file machine" aria-label="Скіл autoreview: авторев'ю перед кожним комітом">
              <figcaption className="good-agents-md__name">.claude/skills/autoreview/SKILL.md</figcaption>
              <pre className="good-agents-md__section">{principle ? principle.skill : SKILL_OPENING}</pre>
            </figure>
          </div>
        )}
      </div>
    );
  },
  notes:
    'Агенти роблять CI ботлнеком: або навантажують вашу внутрішню інфраструктуру, або збільшують плату за клауд. Тому в AGENTS.md: «проганяй всі CI перевірки локально перед кожним комітом» — праворуч той самий AGENTS.md, тільки замість принципів тепер розділ «перед кожним комітом»: усі лінт-джоби, зокрема наша перевірка імпортів, і всі рев’ю агенти — включно з рев’ю агентами, і тоді вони працюють на вашій підписці, а не на токенах. А в кінці локальних перевірок — авторев’ю, окремим скілом: у його описі — коли він спрацьовує, а перший абзац каже, навіщо він: рев’юер іншого вендора читає дифф, сперечається з автором, і коміт чекає, доки зауважень не стане нуль. Далі принцип за принципом, під кожним — секція скіла, яка його реалізує. Рев’юер іншого вендора: автор не перевіряє сам себе — herdr відкриває панель поруч, запускає в ній агента протилежного вендора, codex для claude чи claude для codex, і дає йому /review. Один рев’юер на весь коміт, а не новий на кожен раунд, бо кожен новий заново перечитує репозиторій: кожен наступний раунд — це herdr agent prompt у ту саму сесію, а після пушу панель закривається. З зауваженням можна сперечатися тим самим herdr agent prompt — аргумент, без зміни коду. Кожне зауваження — або виправити з регресійним тестом, або письмово пояснити, чому воно хибне. І зупинка на нулі, причому зауважень має меншати: 8, 8, 4, 2, 1, 2, 1, 1, 0. А ось як це виглядає в herdr: ліворуч я в Claude Code командами herdr відкриваю панель поруч і запускаю в ній codex з /review і знаходить два зауваження; одне виправляю з тестом, з другим сперечаюсь, і він його знімає; повторне рев’ю — нуль, коміт.',
};
