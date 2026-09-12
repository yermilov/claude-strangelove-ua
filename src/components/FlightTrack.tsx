/** The bottom chrome, as the corridor shot from "2001".
 *
 *  The screen is the whole journey: the left edge is 00:00 and the first
 *  slide, the right edge is the end of the talk and the last reveal. Two
 *  things ride that axis and the GAP BETWEEN THEM is the only number the
 *  speaker actually needs mid-talk:
 *
 *    - the SHIP is the clock — it flies left to right over 30 minutes;
 *    - the MONOLITH is the material — it sits where the deck has got to.
 *
 *  Ship behind the monolith → running ahead of schedule. Ship past it →
 *  running late, and the exhaust turns red. No arithmetic, one glance.
 *
 *  Register: this is the SPEAKER's instrument, not the machine's, so it is
 *  Kubrick — flat black, warm white, one red, no glow. Only the command
 *  overlay (`.command-overlay`) keeps the CRT voice. See the design-system
 *  skill: `.deck-chrome` is deliberately NOT in the machine block.
 */

/** The fwdays slot is 35 minutes, but the TALK is not: the organiser's
 *  breakdown (10.09.2026) is "25-30 хв на доповідь + 5-10 хв на Q&A". The
 *  corridor paces the talk, so it spans the 30 — running it to 35 would have
 *  him arriving exactly when the Q&A should already be under way. The pace
 *  colour is derived from it, so this constant is the only place a
 *  slot-length change has to land. */
const TOTAL_TIME = 30 * 60;

/** How far behind schedule the talk may drift before the exhaust goes red.
 *  8% of 30 minutes ≈ 2:24 — under that, a speaker who is simply dwelling on
 *  a slide should not be shouted at by his own chrome. */
const LATE_THRESHOLD = 0.08;

interface FlightTrackProps {
  elapsedSeconds: number;
  /** Reveal-weighted deck progress (0..1) — where the MATERIAL has got to. */
  progress: number;
  /** Toggles the command overlay. The clock is the tap target, so a phone
   *  (no Esc key) can still reach the terminal. */
  onOpenCommand: () => void;
}

/** Discovery One in profile, nose to the right. The shape only reads at this
 *  size if the three masses stay very unequal — a big command sphere, a
 *  HAIRLINE spine, a bulky engine cluster at the tail. Even them out and it
 *  turns into a barbell, which is what the first pass drew.
 *
 *  Drawn at 160×28 and scaled by CSS width, so the ship's size is a token
 *  rather than a magic number in here. `currentColor` is the exhaust alone —
 *  the hull never changes colour. */
function Discovery() {
  return (
    <svg
      className="flight-track__ship-art"
      viewBox="0 0 160 28"
      role="presentation"
      focusable="false"
    >
      {/* exhaust — the one element that carries the pace colour */}
      <polygon className="flight-track__exhaust" points="0,10 12,12.5 12,15.5 0,18" />
      {/* engine cluster: the heavy tail */}
      <rect x="12" y="4" width="30" height="20" />
      <rect x="42" y="8" width="8" height="12" />
      {/* the spine, with its module boxes */}
      <rect x="50" y="12.5" width="86" height="3" />
      <rect x="62" y="9.5" width="6" height="9" />
      <rect x="82" y="9.5" width="6" height="9" />
      <rect x="102" y="9.5" width="6" height="9" />
      {/* command sphere */}
      <circle cx="146" cy="14" r="12" />
    </svg>
  );
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function FlightTrack({ elapsedSeconds, progress, onOpenCommand }: FlightTrackProps) {
  const flown = Math.min(1, elapsedSeconds / TOTAL_TIME);
  const covered = Math.min(1, Math.max(0, progress));
  const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);

  // Positive = the clock is ahead of the deck, i.e. the talk is running slow.
  const behind = flown - covered;
  const isLate = (remaining === 0 && covered < 1) || behind >= LATE_THRESHOLD;

  // Both markers are inset by their own width so the ship's nose reaches the
  // right edge exactly at 30:00 instead of overshooting it by half a hull.
  const shipLeft = `calc(${flown} * (100% - var(--flight-ship-width)))`;
  const monolithLeft = `calc(${covered} * (100% - var(--flight-monolith-width)))`;

  return (
    <div className={`flight-track${isLate ? ' flight-track--late' : ''}`}>
      <div className="flight-track__space">
        <div className="flight-track__corridor" />
        {/* The wake is the part of the 30 minutes already spent. It stops at
         * the ship's tail rather than at `flown * 100%`, so the line runs
         * INTO the engine block instead of out the far side of the sphere. */}
        <div className="flight-track__wake" style={{ width: shipLeft }} />
        <div
          className="flight-track__monolith"
          style={{ left: monolithLeft }}
          title="матеріал"
        />
        <div className="flight-track__ship" style={{ left: shipLeft }}>
          <Discovery />
        </div>
      </div>

      <div className="flight-track__meta">
        <span className="flight-track__label">
          context left until auto-compact {Math.round((1 - covered) * 100)}%
        </span>
        <button
          type="button"
          className="flight-track__clock"
          onClick={onOpenCommand}
          aria-label="Відкрити командний рядок"
          title="esc"
        >
          {formatClock(remaining)}
        </button>
      </div>
    </div>
  );
}
