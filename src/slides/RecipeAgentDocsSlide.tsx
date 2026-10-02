import { SlideDefinition } from '../types/slides';
import { atAgentsMdSpeed, atSessionSpeed } from '../utils/sessionPlayback';
import rememberVideo from '../assets/recipe-2-remember-alias.mp4';
import rememberStill from '../assets/recipe-2-remember-alias-still.png';
import agentsMdVideo from '../assets/recipe-2-agents-md.mp4';
import agentsMdStill from '../assets/recipe-2-agents-md-still.png';

/* «рецепт 2: агентська документація» — the same situation as «рецепт 1» (the
 * agent imports through `../../`, the human presses esc), but this time the
 * correction ends with «запам'ятай це правило в AGENTS.md», and the agent writes
 * the rule there. On the next reveal AGENTS.md opens in VS Code on that rule, and
 * more rules of the same kind land one by one until the file outgrows the view.
 *
 * Both videos are STAGED Remotion scenes in `video/`: RememberAliasSession (the
 * «рецепт 1» scene with `remember`) and AgentsMdGrowth — see their header
 * comments. The terminal plays once and holds its last frame; AGENTS.md is
 * mounted on its reveal, so it starts from its first rule. The PDF export shows
 * each video's last frame as a still. */

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const ALT =
  "Claude Code: агент хоче імпортувати через ../../, користувач натискає esc і пише, що імпорти йдуть через аліас @/, і просить запам'ятати це в AGENTS.md; агент переписує імпорти й дописує правило в AGENTS.md";
const AGENTS_MD_ALT =
  'AGENTS.md у VS Code: після правила про аліас @/ одне за одним додаються нові подібні правила, і файл перестає вміщатися на екран';

export const RecipeAgentDocsSlide: SlideDefinition = {
  id: 'recipe-2-agent-docs',
  title: <>рецепт 2: агентська документація</>,
  maxRevealStages: 1,
  content: ({ revealStage }) => (
    <div className="first-day recipe-video">
      <div className="shot-pair">
        <figure className="shot shot--terminal">
          <div className="shot__frame" style={{ ['--ratio' as string]: 1200 / 900 }}>
            {isExportMode ? (
              <img src={rememberStill} alt={ALT} />
            ) : (
              <video ref={atSessionSpeed} src={rememberVideo} autoPlay muted playsInline preload="auto" aria-label={ALT} />
            )}
          </div>
        </figure>
        <figure className={`shot shot--above-mark shot--agents-md${revealStage >= 1 ? '' : ' shot--hidden'}`}>
          <div className="shot__frame" style={{ ['--ratio' as string]: 1200 / 900 }}>
            {isExportMode ? (
              <img src={agentsMdStill} alt={AGENTS_MD_ALT} />
            ) : (
              // mounted on its reveal, so the file opens on its first rule
              revealStage >= 1 && (
                <video ref={atAgentsMdSpeed} src={agentsMdVideo} autoPlay muted playsInline preload="auto" aria-label={AGENTS_MD_ALT} />
              )
            )}
          </div>
        </figure>
      </div>
    </div>
  ),
  notes:
    "Та сама ситуація, що й у першому рецепті: агент імпортує через ../../, я тисну esc. Але цього разу я не тільки кажу, як треба, а й прошу запам'ятати це в AGENTS.md — і агент записує правило. А далі таких правил стає все більше: логер замість console, date-fns замість moment, гроші в копійках, named exports… Кожне правило, яке довелося сказати двічі, потрапляє в AGENTS.md.",
};
