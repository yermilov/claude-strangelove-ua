import { ReactNode } from 'react';

/* A terminal session that arrives the way Claude Code prints it (Yarik,
 * 02.10.2026): each action lands on its own, then — once the tool has run —
 * the harness's response under it in one piece, then a pause before the next
 * action. A beat is one of those pieces; its `lines` carry their own '\n's.
 * `at` pins a beat to a moment instead (parallel agents finishing in turn). */

export type Beat = { kind: 'call' | 'result'; lines: ReactNode; at?: number };

export const START_MS = 300; // the slide settles, then the first action
export const RUN_MS = 800; // an action, then its result
export const NEXT_MS = 1100; // a result, then the next action

export function beatTimes(beats: Beat[]): number[] {
  let t = START_MS;
  return beats.map((b, i) => {
    if (i > 0) t += b.kind === 'result' ? RUN_MS : NEXT_MS;
    if (b.at !== undefined) t = b.at;
    return t;
  });
}

export function SessionBeats({ beats }: { beats: Beat[] }) {
  const times = beatTimes(beats);
  return (
    <>
      {beats.map((b, i) => (
        <span key={i} className="skills-example__line" style={{ animationDelay: `${times[i]}ms` }}>
          {b.lines}
        </span>
      ))}
    </>
  );
}
