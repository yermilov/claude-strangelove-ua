/** The fwdays slot is 35 minutes, but the TALK is not: the organiser's
 *  breakdown (10.09.2026) is "25-30 хв на доповідь + 5-10 хв на Q&A". This
 *  timer paces the talk, so it counts down the 30 — running it to 35 would
 *  have him finishing exactly when the Q&A should already be under way.
 *  The pace colour below is derived from it, so this constant is the only
 *  place a slot-length change has to land. */
const TOTAL_TIME = 30 * 60;

interface TimerProps {
  elapsedSeconds: number;
  /** Reveal-weighted deck progress (0..1) — the same value that fills the
   *  progress bar, so the pace color and the bar stay in sync. */
  progress: number;
}

function getPaceColor(elapsedSeconds: number, progress: number): string {
  const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
  // Out of time but not done → red.
  if (remaining === 0 && progress < 1) return 'var(--terminal-red)';

  // How far behind schedule: expected progress (by the clock) minus actual
  // reveal-weighted progress. Positive means the talk is running slow.
  const behind = elapsedSeconds / TOTAL_TIME - progress;
  if (behind < 0.04) return 'var(--terminal-green)';
  if (behind < 0.08) return 'var(--terminal-yellow)';
  return 'var(--terminal-red)';
}

export function Timer({ elapsedSeconds, progress }: TimerProps) {
  const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const color = getPaceColor(elapsedSeconds, progress);

  return (
    <span className="timer-countdown" style={{ color }}>
      {display}
    </span>
  );
}
