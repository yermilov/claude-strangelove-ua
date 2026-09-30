import { Composition } from 'remotion';
import { InterruptSession, DURATION, FPS } from './InterruptSession';
import * as Remember from './RememberRule';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="InterruptSession" component={InterruptSession} durationInFrames={DURATION} fps={FPS} width={1200} height={900} />
    <Composition
      id="RememberRule"
      component={Remember.RememberRule}
      durationInFrames={Remember.DURATION}
      fps={Remember.FPS}
      width={Remember.WIDTH}
      height={Remember.HEIGHT}
    />
  </>
);
