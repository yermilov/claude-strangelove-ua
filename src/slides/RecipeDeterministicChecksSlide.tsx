import { useEffect, useRef, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { atSessionSpeed } from '../utils/sessionPlayback';
import { GitHubActionsPanel } from '../components/GitHubActionsPanel';
import terminalVideo from '../assets/recipe-3-terminal.mp4';
import terminalStill from '../assets/recipe-3-terminal-still.png';

/* «рецепт 3: агентські детерміновані перевірки» — the end of the `@/` alias story
 * from «рецепт 1» and «рецепт 2»: the rule is in AGENTS.md and in the skill, and
 * the agent breaks it a second time anyway. Claude Code on the left is asked for a
 * lint script that GitHub Actions runs on every push, so the mistake cannot ship
 * again; GitHub Actions on the right fails the first run on that very mistake and
 * goes green after the fix. STAGED, like the rest of that story — see the
 * header of video/src/AliasGuard.tsx.
 *
 * Laid out as Yarik sketched it (02.10.2026): the terminal on the left at the
 * stage's full height, GitHub on the right taking all the width that is left,
 * out to the window's edge, with the conference mark tucked into its
 * bottom-right corner. The terminal is a video (the AliasGuardTerminal
 * composition); the GitHub page is live DOM following that video's clock, so
 * the two fill the width together at any window size — one video of a fixed
 * shape could not.
 *
 * Played once and held on the last frame; the PDF export gets the terminal's
 * last frame as a still and the page in its final state. */

const FPS = 30;
const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const ALT =
  'Claude Code: агент удруге імпортує через ../../, хоча правило є і в AGENTS.md, і в скілі; користувач просить лінт-скрипт для GitHub Actions; агент пише check-imports.ts і workflow, перевірка падає на тих самих імпортах, після виправлення на @/ — зелена';

function Recipe3() {
  const video = useRef<HTMLVideoElement | null>(null);
  const [frame, setFrame] = useState(isExportMode ? Infinity : 0);

  // the GitHub page follows the terminal video's own clock, so it keeps in
  // step whatever the playback speed
  useEffect(() => {
    if (isExportMode) return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v) setFrame(Math.floor(v.currentTime * FPS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="first-day recipe-video recipe-video--two-line-title recipe3">
      <figure className="recipe3__terminal">
        {isExportMode ? (
          <img src={terminalStill} alt={ALT} />
        ) : (
          <video
            ref={(v) => {
              video.current = v;
              atSessionSpeed(v);
            }}
            src={terminalVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label={ALT}
          />
        )}
      </figure>
      <div className="recipe3__github">
        <GitHubActionsPanel frame={frame} />
      </div>
    </div>
  );
}

export const RecipeDeterministicChecksSlide: SlideDefinition = {
  id: 'recipe-3-deterministic-checks',
  title: <>рецепт 3: агентські детерміновані перевірки</>,
  content: <Recipe3 />,
  notes:
    'Агент удруге імпортує через ../../ — хоча правило вже є і в AGENTS.md, і в скілі. Документація не спрацювала. Тому — лінт-скрипт у GitHub Actions на кожен пуш. Перший же прогін упав на тих самих імпортах, після виправлення на @/ — зелений. Правило, яке треба пам’ятати, — не захист. Перевірка, яка падає, — захист.',
};
