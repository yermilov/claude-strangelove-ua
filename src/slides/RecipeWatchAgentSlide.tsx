import { SlideDefinition } from '../types/slides';
import interruptVideo from '../assets/recipe-1-import-alias.mp4';
import interruptStill from '../assets/recipe-1-import-alias-still.png';
import ohOfCourseVideo from '../assets/recipe-1-oh-of-course.mp4';
import ohOfCourseStill from '../assets/recipe-1-oh-of-course-still.jpg';

/* «рецепт 1» — the first of the recipes after the agents recap: a Claude Code
 * session in which the human reads what the agent is about to do, stops it at
 * the permission prompt (esc) and redirects it. The agent is about to create a
 * file importing through `../../` although the project imports via the `@/`
 * alias — a simple convention on purpose, the one the later recipes write down
 * and then turn into a lint check.
 *
 * The video is rendered by the Remotion project in `video/` — the
 * ImportAliasSession composition, a STAGED scene (see its header; it replaced
 * the real statusLine replay, InterruptSession, as a simpler example). It is
 * the machine talking, so it keeps Claude Code's own colours; only the red
 * underlines are the deck's annotation. Played once and held on its last
 * frame, so the speaker can talk over the result.
 *
 * Beside it, the «ааа, точно» meme — two guys in blue T-shirts at a laptop,
 * one shows the other the screen (Drake and Lil Yachty, «Laugh Now Cry Later»,
 * 2020; the Giphy HD copy, audio stripped). It loops, like a GIF, and comes
 * in on its own reveal — after the replay has made the point — laid out from
 * the start so the terminal does not move when it arrives.
 *
 * The PDF export (?export=1) would catch the video's FIRST frame — the test
 * run before anything happens — so there it shows a still of the moment that
 * carries the story instead: the `../../` imports marked, «Interrupted», and
 * the correction typed out (frame 400 of the same composition). */

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const MEME_ALT = 'Двоє в синіх футболках за ноутбуком: один показує на екран, другий — «ааа, точно»';

const ALT =
  'Claude Code: агент хоче створити файл з імпортами через ../../, користувач натискає esc і нагадує, що імпорти йдуть через аліас @/; агент переписує імпорти';

export const RecipeWatchAgentSlide: SlideDefinition = {
  id: 'recipe-1-watch-agent',
  title: <>рецепт 1: слідкуйте за тим, що робить ваш агент</>,
  maxRevealStages: 1,
  content: ({ revealStage }) => (
    <div className="first-day recipe-video">
      <div className="shot-pair">
        <figure className="shot shot--terminal">
          <div className="shot__frame" style={{ ['--ratio' as string]: 1200 / 900 }}>
            {isExportMode ? (
              <img src={interruptStill} alt={ALT} />
            ) : (
              <video src={interruptVideo} autoPlay muted playsInline preload="auto" aria-label={ALT} />
            )}
          </div>
        </figure>
        <figure className={`shot shot--above-mark${revealStage >= 1 ? '' : ' shot--hidden'}`}>
          <div className="shot__frame" style={{ ['--ratio' as string]: 1080 / 608 }}>
            {isExportMode ? (
              <img src={ohOfCourseStill} alt={MEME_ALT} />
            ) : (
              // mounted on its reveal, so the loop starts from its first frame
              revealStage >= 1 && (
                <video src={ohOfCourseVideo} autoPlay loop muted playsInline preload="auto" aria-label={MEME_ALT} />
              )
            )}
          </div>
        </figure>
      </div>
    </div>
  ),
  notes:
    'Найпростіший випадок. Агент створює файл і імпортує через ../../, а в нас усі імпорти через аліас @/. Я бачу це в запиті на дозвіл, тисну esc і кажу як треба. Він переписує імпорти. Тут правило живе тільки в моїй голові — далі ми його запишемо, а потім перетворимо на лінтер.',
};
