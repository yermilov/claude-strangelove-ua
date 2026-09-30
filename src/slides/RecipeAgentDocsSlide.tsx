import { SlideDefinition } from '../types/slides';
import rememberVideo from '../assets/recipe-2-remember-rule.mp4';
import rememberStill from '../assets/recipe-2-remember-rule-still.png';

/* «рецепт 2: агентська документація» — Claude Code on the left is asked to write
 * a rule into CLAUDE.md; VS Code on the right shows the rule land, then the file
 * keeps growing, commit by commit, from 17 rules on 06.06 to 109 on 26.09.
 *
 * Both columns are ONE video (video/src/RememberRule.tsx), so the rule appears
 * in the editor at the frame the agent writes it. Real sources: the prompt is
 * Yarik's own from 06.06.2026 (~/.claude/history.jsonl), the edit is commit
 * bd712975, and every editor view is juggernaut's CLAUDE.md at a real commit —
 * see the composition's header comment. It is CLAUDE.md rather than AGENTS.md
 * because that is the file Claude Code reads, and the file the real prompt names.
 *
 * Played once and held on the last frame; the PDF export gets that last frame
 * (26.09, 109 rules, 748 lines) as a still. */

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const ALT =
  'Ліворуч Claude Code: користувач просить записати правило в CLAUDE.md, агент дописує «UI design rule» і «Development procedure». Праворуч CLAUDE.md у VS Code росте з 17 правил 6 червня до 109 правил 26 вересня';

export const RecipeAgentDocsSlide: SlideDefinition = {
  id: 'recipe-2-agent-docs',
  title: <>рецепт 2: агентська документація</>,
  content: (
    <div className="first-day recipe-video">
      <figure className="shot">
        <div className="shot__frame shot__frame--bare" style={{ ['--ratio' as string]: 2140 / 1040 }}>
          {isExportMode ? (
            <img src={rememberStill} alt={ALT} />
          ) : (
            <video src={rememberVideo} autoPlay muted playsInline preload="auto" aria-label={ALT} />
          )}
        </div>
      </figure>
    </div>
  ),
  notes:
    'Шосте червня: «додай у CLAUDE.md інструкцію завжди робити UI через frontend-design» — і сім кроків процесу. Агент записав. А потім кожна помилка, яку агент зробив двічі, ставала ще одним правилом: 17 правил у червні, 109 наприкінці вересня, 748 рядків.',
};
