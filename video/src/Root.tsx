import { Composition } from 'remotion';
import { InterruptSession, DURATION, FPS } from './InterruptSession';

export const RemotionRoot: React.FC = () => (
  <Composition id="InterruptSession" component={InterruptSession} durationInFrames={DURATION} fps={FPS} width={1200} height={900} />
);
