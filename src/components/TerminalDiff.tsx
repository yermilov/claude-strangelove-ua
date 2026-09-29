/** A `git show` of one hunk, drawn as a terminal window in a single scaling
 * SVG — the machine register (dark screen, JetBrains Mono, git's colours),
 * sized in its own units so the text scales with the window like the text in
 * an image does. */

export interface Diff {
  commit: string;
  /** full path; the title bar shows the service and the file */
  file: string;
  added: number;
  removed: number;
  /** e.g. `@@ -76,13 +77,7 @@ import org.slf4j.LoggerFactory;` */
  hunk: string;
  /** diff body lines, each starting with ' ', '+' or '-' */
  lines: string[];
}

// The window is drawn at 1:1 and capped at its own size (see the `style`
// below), so on a 1920×1080 stage one unit is one pixel and the code sets at
// the deck's 40px text tier — the organiser asked for big code. It only ever
// scales DOWN, on a stage too small to hold it.
const F = 40; // code font size = --font-size-text at 1920
const CH = F * 0.6; // JetBrains Mono advance
const LH = 48;
const PAD_X = 36;
const PAD_Y = 20;
const BAR_H = 56;
const COLS = 52; // the longest line, a hunk header, is 51
const W = PAD_X * 2 + COLS * CH;

const shortPath = (file: string) => {
  const parts = file.split('/');
  return parts.length > 3 ? `${parts[0]}/…/${parts.slice(-2).join('/')}` : file;
};

export function TerminalDiff({ diff, rows }: { diff: Diff; rows?: number }) {
  // prompt + hunk header + body + the idle prompt; `rows` pins the height so
  // the window stays put while a sequence of diffs swaps through it
  const bodyRows = Math.max(rows ?? 0, diff.lines.length);
  const totalRows = bodyRows + 3;
  const H = BAR_H + PAD_Y * 2 + totalRows * LH;
  const rowTop = (r: number) => BAR_H + PAD_Y + r * LH;
  const baseline = (r: number) => rowTop(r) + LH * 0.68;

  const at = diff.hunk.lastIndexOf('@@') + 2;
  const hunkRange = diff.hunk.slice(0, at);
  const hunkContext = diff.hunk.slice(at);
  const file = diff.file.split('/').pop();
  const idleRow = diff.lines.length + 2;

  return (
    <svg
      className="diff-term"
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: W, maxHeight: H }}
      role="img"
      aria-label={`git show ${diff.commit}: ${file}, +${diff.added} −${diff.removed}`}
    >
      <g className="machine">
        <rect className="diff-term__window" x={1} y={1} width={W - 2} height={H - 2} rx={14} />
        <path className="diff-term__bar" d={`M 1 ${BAR_H} V 15 Q 1 1 15 1 H ${W - 15} Q ${W - 1} 1 ${W - 1} 15 V ${BAR_H} Z`} />
        <line className="diff-term__rule" x1={1} x2={W - 1} y1={BAR_H} y2={BAR_H} />
        {(['red', 'yellow', 'green'] as const).map((c, i) => (
          <circle key={c} className={`diff-term__dot diff-term__dot--${c}`} cx={PAD_X + i * 30} cy={BAR_H / 2} r={9} />
        ))}
        <text className="diff-term__title" x={W / 2} y={BAR_H / 2}>
          {shortPath(diff.file)}
        </text>
        <text className="diff-term__stat" x={W - PAD_X} y={BAR_H / 2}>
          <tspan className="diff-term__add">+{diff.added}</tspan>
          <tspan className="diff-term__del"> −{diff.removed}</tspan>
        </text>

        <text className="diff-term__line" x={PAD_X} y={baseline(0)}>
          <tspan className="diff-term__prompt">$ </tspan>git show {diff.commit} -- {file}
        </text>
        <text className="diff-term__line" x={PAD_X} y={baseline(1)}>
          <tspan className="diff-term__hunk">{hunkRange}</tspan>
          <tspan className="diff-term__ctx">{hunkContext}</tspan>
        </text>

        {diff.lines.map((line, i) => {
          const kind = line[0] === '+' ? 'add' : line[0] === '-' ? 'del' : 'ctx';
          const r = i + 2;
          return (
            <g key={i}>
              {kind !== 'ctx' && (
                <rect className={`diff-term__band diff-term__band--${kind}`} x={2} y={rowTop(r)} width={W - 4} height={LH} />
              )}
              <text className={`diff-term__line diff-term__${kind}`} y={baseline(r)}>
                <tspan x={PAD_X}>{kind === 'ctx' ? '' : line[0]}</tspan>
                <tspan x={PAD_X + CH}>{line.slice(1)}</tspan>
              </text>
            </g>
          );
        })}

        <text className="diff-term__line" x={PAD_X} y={baseline(idleRow)}>
          <tspan className="diff-term__prompt">$</tspan>
        </text>
        <rect className="diff-term__cursor" x={PAD_X + CH * 2} y={rowTop(idleRow) + (LH - F * 1.1) / 2} width={CH} height={F * 1.1} />
      </g>
    </svg>
  );
}
