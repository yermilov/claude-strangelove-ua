import { SlideDefinition } from '../types/slides';
import lintVideo from '../assets/recipe-3-alias-guard.mp4';
import lintStill from '../assets/recipe-3-alias-guard-still.png';

/* «рецепт 3: агентські детерміновані перевірки» — the end of the `@/` alias story
 * from «рецепт 1» and «рецепт 2»: the rule is in AGENTS.md and in the skill, and
 * the agent breaks it a second time anyway. Claude Code on the left is asked for a
 * lint script that GitHub Actions runs on every push, so the mistake cannot ship
 * again; GitHub Actions on the right fails the first run on that very mistake and
 * goes green after the fix.
 *
 * One video (video/src/AliasGuard.tsx), so the run appears the moment the agent
 * pushes. STAGED, like the rest of that story — see the composition's header.
 *
 * Played once and held on the last frame; the PDF export gets that frame as a still. */

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const ALT =
  'Ліворуч Claude Code: агент удруге імпортує через ../../, хоча правило є і в AGENTS.md, і в скілі; користувач просить лінт-скрипт для GitHub Actions; агент пише check-imports.ts і workflow, перевірка падає на тих самих імпортах. Праворуч GitHub Actions: перший прогін червоний, після виправлення на @/ другий зелений';

export const RecipeDeterministicChecksSlide: SlideDefinition = {
  id: 'recipe-3-deterministic-checks',
  title: <>рецепт 3: агентські детерміновані перевірки</>,
  content: (
    <div className="first-day recipe-video recipe-video--two-line-title">
      <figure className="shot">
        <div className="shot__frame shot__frame--bare" style={{ ['--ratio' as string]: 2140 / 1040 }}>
          {isExportMode ? (
            <img src={lintStill} alt={ALT} />
          ) : (
            <video src={lintVideo} autoPlay muted playsInline preload="auto" aria-label={ALT} />
          )}
        </div>
      </figure>
    </div>
  ),
  notes:
    'Агент удруге імпортує через ../../ — хоча правило вже є і в AGENTS.md, і в скілі. Документація не спрацювала. Тому — лінт-скрипт у GitHub Actions на кожен пуш. Перший же прогін упав на тих самих імпортах, після виправлення на @/ — зелений. Правило, яке треба пам’ятати, — не захист. Перевірка, яка падає, — захист.',
};
