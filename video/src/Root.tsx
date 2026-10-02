import { Composition } from 'remotion';
import { InterruptSession, DURATION, FPS } from './InterruptSession';
import * as Remember from './RememberRule';
import * as Lint from './LintGuard';
import * as Alias from './AliasGuard';
import * as ImportAlias from './ImportAliasSession';
import * as AgentsMd from './AgentsMdGrowth';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="InterruptSession" component={InterruptSession} durationInFrames={DURATION} fps={FPS} width={1200} height={900} />
    <Composition
      id="ImportAliasSession"
      component={ImportAlias.ImportAliasSession}
      durationInFrames={ImportAlias.DURATION}
      fps={ImportAlias.FPS}
      width={1200}
      height={900}
    />
    <Composition
      id="RememberAliasSession"
      component={ImportAlias.ImportAliasSession}
      defaultProps={{ remember: 'agents' as const }}
      durationInFrames={ImportAlias.REMEMBER_DURATION}
      fps={ImportAlias.FPS}
      width={1200}
      height={900}
    />
    <Composition
      id="SkillAliasSession"
      component={ImportAlias.ImportAliasSession}
      defaultProps={{ remember: 'skill' as const }}
      durationInFrames={ImportAlias.SKILL_DURATION}
      fps={ImportAlias.FPS}
      width={1200}
      height={900}
    />
    <Composition
      id="AgentsMdGrowth"
      component={AgentsMd.AgentsMdGrowth}
      durationInFrames={AgentsMd.DURATION}
      fps={AgentsMd.FPS}
      width={AgentsMd.WIDTH}
      height={AgentsMd.HEIGHT}
    />
    <Composition
      id="RememberRule"
      component={Remember.RememberRule}
      durationInFrames={Remember.DURATION}
      fps={Remember.FPS}
      width={Remember.WIDTH}
      height={Remember.HEIGHT}
    />
    <Composition
      id="LintGuard"
      component={Lint.LintGuard}
      durationInFrames={Lint.DURATION}
      fps={Lint.FPS}
      width={Lint.WIDTH}
      height={Lint.HEIGHT}
    />
    <Composition
      id="AliasGuardTerminal"
      component={Alias.AliasGuardTerminal}
      durationInFrames={Alias.DURATION}
      fps={Alias.FPS}
      width={Alias.TERMINAL_WIDTH}
      height={Alias.HEIGHT}
    />
    <Composition
      id="AliasGuard"
      component={Alias.AliasGuard}
      durationInFrames={Alias.DURATION}
      fps={Alias.FPS}
      width={Alias.WIDTH}
      height={Alias.HEIGHT}
    />
  </>
);
