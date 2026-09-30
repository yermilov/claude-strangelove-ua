import { SlideDefinition } from '../types/slides';
import interruptVideo from '../assets/recipe-1-interrupt.mp4';
import interruptStill from '../assets/recipe-1-interrupt-still.png';
import ohOfCourseVideo from '../assets/recipe-1-oh-of-course.mp4';
import ohOfCourseStill from '../assets/recipe-1-oh-of-course-still.jpg';

/* «рецепт 1» — the first of the recipes after the agents recap: a replay of a
 * real Claude Code session in which the human reads what the agent is about
 * to do, stops it at the permission prompt (esc) and redirects it.
 *
 * The video is rendered by the Remotion project in `video/` (see its
 * InterruptSession.tsx for the source session and what was abridged). It is
 * the machine talking, so it keeps Claude Code's own colours; only the red
 * underlines are the deck's annotation. Played once and held on its last
 * frame, so the speaker can talk over the result.
 *
 * Beside it, the «ааа, точно» meme — two guys in blue T-shirts at a laptop,
 * one shows the other the screen (Drake and Lil Yachty, «Laugh Now Cry Later»,
 * 2020; the Giphy HD copy, audio stripped). It loops, like a GIF.
 *
 * The PDF export (?export=1) would catch the video's FIRST frame — the test
 * run before anything happens — so there it shows a still of the moment that
 * carries the story instead: the fallback marked, «Interrupted», and the
 * correction typed out (frame 572 of the same composition). */

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const MEME_ALT = 'Двоє в синіх футболках за ноутбуком: один показує на екран, другий — «ааа, точно»';

const ALT =
  "Claude Code: агент збирається відправити на рев'ю fallback-рішення, користувач натискає esc і пояснює, як зробити інакше; агент відкочує usage.ts і переробляє, 833 тести зелені";

export const RecipeWatchAgentSlide: SlideDefinition = {
  id: 'recipe-1-watch-agent',
  title: <>рецепт 1: слідкуйте за тим, що робить ваш агент</>,
  content: (
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
        <figure className="shot">
          <div className="shot__frame" style={{ ['--ratio' as string]: 1080 / 608 }}>
            {isExportMode ? (
              <img src={ohOfCourseStill} alt={MEME_ALT} />
            ) : (
              <video src={ohOfCourseVideo} autoPlay loop muted playsInline preload="auto" aria-label={MEME_ALT} />
            )}
          </div>
        </figure>
      </div>
    </div>
  ),
  notes:
    'Справжня сесія, 14 вересня. Агент зробив statusLine окремим fallback-файлом і вже йшов на рев’ю. Я прочитав опис у запиті на дозвіл, натиснув esc і написав, як треба: писати в наш кеш і ходити на oauth-ендпоінт, лише якщо дані старші за 30 хвилин. Він відкотив usage.ts і переробив — 833 тести зелені. Час у відео стиснуто.',
};
