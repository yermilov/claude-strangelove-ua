// The recipes' terminal replays play faster than they were rendered (Yarik,
// 02.10.2026: 20% faster). Set at playback rather than in the Remotion
// compositions, so the speed is one number here, not a re-render.
export const SESSION_PLAYBACK_RATE = 1.2;

// AGENTS.md filling up in VS Code on «рецепт 2»: its rules land 1.5× faster
// (Yarik, 02.10.2026).
export const AGENTS_MD_PLAYBACK_RATE = 1.5;

const atRate = (rate: number) => (video: HTMLVideoElement | null) => {
  if (!video) return;
  video.defaultPlaybackRate = rate;
  video.playbackRate = rate;
};

/** `ref` for a terminal-replay <video>: plays it at SESSION_PLAYBACK_RATE. */
export const atSessionSpeed = atRate(SESSION_PLAYBACK_RATE);
/** `ref` for the AGENTS.md growth <video>: plays it at AGENTS_MD_PLAYBACK_RATE. */
export const atAgentsMdSpeed = atRate(AGENTS_MD_PLAYBACK_RATE);
