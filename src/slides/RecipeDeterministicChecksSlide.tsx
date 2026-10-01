import { SlideDefinition } from '../types/slides';
import lintVideo from '../assets/recipe-3-lint-guard.mp4';
import lintStill from '../assets/recipe-3-lint-guard-still.png';

/* «рецепт 3: агентські детерміновані перевірки» — Claude Code on the left is asked
 * for a lint script that GitHub Actions runs on every push, so the agent's mistake
 * cannot ship again; GitHub Actions on the right fails the first run on that very
 * mistake and goes green after the fix.
 *
 * One video (video/src/LintGuard.tsx), so the run appears the moment the agent
 * pushes. The mistake (db618758 bumped only the Claude manifest), the guard
 * (scripts/check-plugin-manifests.ts from faeed26c) and every check output are
 * real; the prompt, the workflow file and running it in Actions are staged —
 * juggernaut runs the gate locally and has no CI. See the composition's header.
 *
 * Played once and held on the last frame; the PDF export gets that frame as a still. */

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const ALT =
  'Ліворуч Claude Code: користувач просить лінт-скрипт для GitHub Actions, бо агент удруге бампнув версію лише в одному маніфесті; агент пише check-plugin-manifests.ts і workflow, перевірка падає на тій самій помилці. Праворуч GitHub Actions: перший прогін червоний, після виправлення другий зелений';

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
    'Агент удруге за два дні бампнув версію плагіна лише в одному маніфесті — правило в документації було, і воно не спрацювало. Тому — лінт-скрипт у GitHub Actions на кожен пуш. Перший же прогін упав на тій самій помилці, після виправлення — зелений. Правило, яке треба пам’ятати, — не захист. Перевірка, яка падає, — захист.',
};
